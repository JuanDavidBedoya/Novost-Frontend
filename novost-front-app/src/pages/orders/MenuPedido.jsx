import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import {
  Utensils, Coffee, CakeSlice, Wine,
  ShoppingBag, Clock, Calendar as CalendarIcon,
  CreditCard, Wallet, Plus, Minus, AlertCircle, ChevronDown
} from 'lucide-react';
import api from '../../api/apiConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PagoModalPedido from '../../components/pasarela/PagoModalPedido';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './orders.css';

const MySwal = withReactContent(Swal);

const MenuPedido = () => {

  const [modalPago, setModalPago] = useState({
    open: false, clientSecret: '', pedidoPayload: null
  });

  const [errores, setErrores] = useState({ mesa: '', carrito: '' });

  const location = useLocation();
  const navigate = useNavigate();

  const [categoriaActiva, setCategoriaActiva] = useState('Entradas');
  const [platos, setPlatos] = useState([]);
  const [mesas, setMesas] = useState([]);           // ← mesas reales del backend
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesa, setMesa] = useState('');             // ← ahora guarda el idMesa
  const [observaciones, setObservaciones] = useState('');
  const [fechaHora, setFechaHora] = useState(new Date());

  const categorias = [
    { id: 'Entradas', icono: <Coffee size={18} /> },
    { id: 'Fuertes', icono: <Utensils size={18} /> },
    { id: 'Postres', icono: <CakeSlice size={18} /> },
    { id: 'Bebidas', icono: <Wine size={18} /> }
  ];

  // Redirigir al home si Stripe retorna con status=success
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('status') === 'success') {
      toast.success("¡Pago confirmado con éxito!");
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  // Reloj
  useEffect(() => {
    const timer = setInterval(() => setFechaHora(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Cargar menú y mesas en paralelo
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resEntradas, resFuertes, resPostres, resBebidas, resMesas] = await Promise.all([
          api.get('/platos/entradas'),
          api.get('/platos/fuertes'),
          api.get('/platos/postres'),
          api.get('/platos/bebidas'),
          api.get('/mesas')
        ]);

        const mapearPlatos = (datosBackend, nombreCategoria) =>
          datosBackend.map(plato => ({
            id: plato.idPlato,
            nombre: plato.nombrePlato,
            descripcion: plato.descripcion,
            precio: plato.precioPlato,
            categoria: nombreCategoria,
            disponible: plato.disponible
          }));

        setPlatos([
          ...mapearPlatos(resEntradas.data, 'Entradas'),
          ...mapearPlatos(resFuertes.data, 'Fuertes'),
          ...mapearPlatos(resPostres.data, 'Postres'),
          ...mapearPlatos(resBebidas.data, 'Bebidas')
        ]);

        setMesas(resMesas.data);

      } catch (error) {
        console.error('Error al conectar con el backend:', error);
        toast.error('No se pudo cargar el menú. Verifica que el servidor esté activo.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const platosFiltrados = platos.filter(p => p.categoria === categoriaActiva);

  const agregarAlPedido = (plato) => {
    setErrores(prev => ({ ...prev, carrito: '' }));
    setCarrito(prev => {
      const existente = prev.find(item => item.id === plato.id);
      if (existente) {
        return prev.map(item =>
          item.id === plato.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...plato, cantidad: 1 }];
    });
  };

  const decrementarCantidad = (id) => {
    setCarrito(prev =>
      prev
        .map(item => item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item)
        .filter(item => item.cantidad > 0)
    );
  };

  const incrementarCantidad = (id) => {
    setCarrito(prev =>
      prev.map(item => item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item)
    );
  };

  const IMPUESTO_IVA = 0.19;

  const calcularSubtotal = () =>
    carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const calcularTotal = () => {
    const sub = calcularSubtotal();
    return sub + sub * IMPUESTO_IVA;
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(value);

  const limpiarFormulario = () => {
    setCarrito([]);
    setMesa('');
    setObservaciones('');
    setErrores({ mesa: '', carrito: '' });
  };

  const validar = () => {
    const nuevosErrores = { mesa: '', carrito: '' };
    let hayErrores = false;

    if (carrito.length === 0) {
      nuevosErrores.carrito = 'Agrega al menos un plato antes de confirmar el pedido.';
      hayErrores = true;
    }

    if (!mesa) {
      nuevosErrores.mesa = 'Selecciona una mesa para continuar.';
      hayErrores = true;
    }

    setErrores(nuevosErrores);
    return hayErrores;
  };

  const confirmarPedido = async (metodoPago) => {
    if (validar()) return;

    // mesa ya contiene el idMesa real seleccionado del dropdown
    const pedidoPayload = {
      idMesa: parseInt(mesa),
      observaciones: observaciones || null,
      metodoPago: metodoPago,
      detalles: carrito.map(item => ({
        idPlato: item.id,
        cantidad: item.cantidad
      }))
    };

    // ── PAGO EN CAJA ─────────────────────────────────────────────────────────
    if (metodoPago === 'CAJA') {
      try {
        const response = await api.post('/pedidos', pedidoPayload);
        const pedidoGuardado = response.data;

        await MySwal.fire({
          title: '¡Pedido Confirmado!',
          html: `
            <p style="color:#6b7280; font-size:0.95rem; margin-bottom:0.5rem">
              Tu pedido ha sido registrado exitosamente.
            </p>
            <div style="background:#f5f3ff; border-radius:12px; padding:1rem; margin-top:0.8rem">
              <span style="color:#7E22CE; font-size:2rem; font-weight:900">
                #${pedidoGuardado.idPedido}
              </span>
              <p style="color:#6b7280; font-size:0.85rem; margin:0.3rem 0 0 0">
                Mesa ${pedidoGuardado.numeroMesa} — Acércate a caja para pagar
              </p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#7E22CE',
          background: '#ffffff',
        });

        limpiarFormulario();
        navigate('/');

      } catch (error) {
        console.error('Error al procesar el pedido:', error);
        const mensajeBackend = error.response?.data?.message || 'Ocurrió un error inesperado.';
        toast.error(`No se pudo registrar el pedido: ${mensajeBackend}`);
      }
      return;
    }

    // ── PAGO EN LÍNEA ────────────────────────────────────────────────────────
    try {
      const intentoRes = await api.post('/pagos/pedido/crear-intento-previo', pedidoPayload);

      setModalPago({
        open: true,
        clientSecret: intentoRes.data.clientSecret,
        pedidoPayload
      });

    } catch (error) {
      console.error('Error al preparar el pago:', error);
      const mensajeBackend = error.response?.data?.message || 'Ocurrió un error inesperado.';
      toast.error(`No se pudo iniciar el pago: ${mensajeBackend}`);
    }
  };

  const handleCerrarModal = () => {
    setModalPago({ open: false, clientSecret: '', pedidoPayload: null });
    toast.info('Pago cancelado. Tu pedido sigue guardado, puedes intentarlo de nuevo.');
  };

  const handlePagoExitoso = () => {
    limpiarFormulario();
    setModalPago({ open: false, clientSecret: '', pedidoPayload: null });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Cargando menú desde el servidor...</h2>
      </div>
    );
  }

  return (
    <div className="menu-container">
      <Helmet>
        <title>Novost — Toma de Pedidos</title>
      </Helmet>

      {/* 1. RESUMEN DEL PEDIDO (IZQUIERDA) */}
      <div className="seccion-resumen">
        <div className="resumen-card">
          <div className="resumen-header">
            <h2><ShoppingBag size={20} /> Resumen del Pedido</h2>
          </div>

          <div className="resumen-meta">
            <div className="meta-item">
              <CalendarIcon size={14} />
              <span>{fechaHora.toLocaleDateString()}</span>
            </div>
            <div className="meta-item">
              <Clock size={14} />
              <span>{fechaHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* ── Selector de mesa ── */}
          <div className="mesa-input-group">
            <label>Mesa N°</label>
            <div className="mesa-select-wrapper">
              <select
                value={mesa}
                onChange={(e) => {
                  setMesa(e.target.value);
                  if (e.target.value) setErrores(prev => ({ ...prev, mesa: '' }));
                }}
                style={errores.mesa ? { borderColor: '#e53e3e' } : {}}
              >
                <option value="">— Selecciona una mesa —</option>
                {mesas.map((m) => (
                  <option key={m.idMesa} value={m.idMesa}>
                    Mesa: {m.numeroMesa} 
                  </option>
                ))}
              </select>
              <ChevronDown size={15} className="mesa-select-icon" />
            </div>
            {errores.mesa && (
              <div className="campo-error">
                <AlertCircle size={13} />
                <span>{errores.mesa}</span>
              </div>
            )}
          </div>

          {/* ── Carrito ── */}
          <div className="carrito-lista">
            {carrito.length === 0 ? (
              <>
                <p className="carrito-vacio">No hay platos en el pedido.</p>
                {errores.carrito && (
                  <div className="campo-error campo-error--carrito">
                    <AlertCircle size={13} />
                    <span>{errores.carrito}</span>
                  </div>
                )}
              </>
            ) : (
              carrito.map((item) => (
                <div className="carrito-item" key={item.id}>
                  <div className="carrito-item-img"></div>
                  <div className="carrito-item-info">
                    <h4>{item.nombre}</h4>
                    <span>{formatCurrency(item.precio * item.cantidad)}</span>
                  </div>
                  <div className="cantidad-controls">
                    <button
                      className="btn-cantidad"
                      onClick={() => decrementarCantidad(item.id)}
                      title="Disminuir cantidad"
                    >
                      <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className="cantidad-valor">{item.cantidad}</span>
                    <button
                      className="btn-cantidad"
                      onClick={() => incrementarCantidad(item.id)}
                      title="Aumentar cantidad"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="observaciones-group">
            <label>Observaciones</label>
            <textarea
              placeholder="Ej: Sin cebolla, término medio..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows="3"
            />
          </div>

          <div className="totales-section">
            <div className="total-row subtotal">
              <span>Subtotal</span>
              <span>{formatCurrency(calcularSubtotal())}</span>
            </div>
            <div className="total-row iva">
              <span>IVA (19%)</span>
              <span>{formatCurrency(calcularSubtotal() * IMPUESTO_IVA)}</span>
            </div>
            <div className="total-row total">
              <span>Total a Pagar</span>
              <span>{formatCurrency(calcularTotal())}</span>
            </div>
          </div>

          <div className="acciones-pago">
            <button className="btn-pago caja" onClick={() => confirmarPedido('CAJA')}>
              <Wallet size={18} /> Pagar en Caja
            </button>
            <button className="btn-pago linea" onClick={() => confirmarPedido('LINEA')}>
              <CreditCard size={18} /> Pagar en Línea
            </button>
          </div>

        </div>
      </div>

      {/* 2. MENÚ DE PLATOS (DERECHA) */}
      <div className="seccion-platos">
        <div className="menu-header">
          <h1>Menú de Pedidos</h1>
          <p>Selecciona los platos para agregar a la orden</p>
        </div>

        <div className="dashboard-tabs menu-tabs">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              className={`dashboard-tab ${categoriaActiva === cat.id ? 'active' : 'inactive'}`}
              onClick={() => setCategoriaActiva(cat.id)}
            >
              {cat.icono}
              {cat.id}
            </button>
          ))}
        </div>

        <div className="platos-grid">
          {platosFiltrados.map((plato) => (
            <div
              className={`plato-card ${!plato.disponible ? 'no-disponible' : ''}`}
              key={plato.id}
            >
              <div className="plato-img-placeholder">
                <span className="img-text">Img: {plato.nombre}</span>
              </div>
              <div className="plato-info">
                <h3>{plato.nombre}</h3>
                <p>{plato.descripcion}</p>
                <div className="plato-footer">
                  <span className="plato-precio">{formatCurrency(plato.precio)}</span>
                  <span title={!plato.disponible ? 'Plato no disponible' : ''}>
                    <button
                      className="btn-agregar"
                      disabled={!plato.disponible}
                      onClick={() => plato.disponible && agregarAlPedido(plato)}
                    >
                      {plato.disponible ? 'Agregar' : 'No disponible'}
                    </button>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de pago en línea con Stripe */}
      {modalPago.open && (
        <PagoModalPedido
          clientSecret={modalPago.clientSecret}
          onClose={handleCerrarModal}
          onPagoExitoso={handlePagoExitoso}
        />
      )}
    </div>
  );
};

export default MenuPedido;