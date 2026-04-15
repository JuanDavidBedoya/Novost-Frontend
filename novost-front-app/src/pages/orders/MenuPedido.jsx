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
import defecto from '../../assets/images/Error.jpg';
import './Orders.css';

const MySwal = withReactContent(Swal);

// ── [RNF-03] Reporte de carga de imágenes Cloudinary ─────────────────────────
const reportarImagenEvento = async (idPlato, imagenUrl, resultado) => {
  try {
    await api.post('/metricas/imagen-evento', {
      idPlato: String(idPlato),
      imagenUrl,
      navegador: navigator.userAgent,
      dispositivo: window.innerWidth <= 768 ? 'movil' : 'pc',
      resultado // "exito" o "fallo"
    });
  } catch {
    // No interrumpe la experiencia del usuario si falla el reporte
  }
};

// ── [RNF-15] Reporte de tiempo de redireccionamiento ─────────────────────────
const reportarRedirectEvento = async (duracionSegundos) => {
  try {
    await api.post('/metricas/redirect-evento', {
      duracionSegundos,
      origen: 'menu',
      destino: 'pedidos'
    });
  } catch {
    // No interrumpe la experiencia del usuario si falla el reporte
  }
};

// ── [RNF-11] Reporte de fallos visibles en pantalla al crear pedido ───────────
const reportarPedidoFallo = async (tipoError, motivo) => {
  try {
    await api.post('/metricas/pedido-fallo-evento', { tipoError, motivo });
  } catch {
    // No interrumpe la experiencia del usuario si falla el reporte
  }
};

// Imagen por defecto si el plato no tiene URL asignada
const IMAGEN_DEFAULT = defecto;

const MenuPedido = () => {

  const [modalPago, setModalPago] = useState({
    open: false, clientSecret: ''
  });

  const [errores, setErrores] = useState({ mesa: '', carrito: '' });

  const location = useLocation();
  const navigate = useNavigate();

  const [categoriaActiva, setCategoriaActiva] = useState('Entradas');
  const [platos, setPlatos]     = useState([]);
  const [mesas, setMesas]       = useState([]);
  const [carrito, setCarrito]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [mesa, setMesa]         = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [fechaHora, setFechaHora] = useState(new Date());

  const categorias = [
    { id: 'Entradas', icono: <Coffee size={18} /> },
    { id: 'Fuertes',  icono: <Utensils size={18} /> },
    { id: 'Postres',  icono: <CakeSlice size={18} /> },
    { id: 'Bebidas',  icono: <Wine size={18} /> }
  ];

  // ── [RNF-15] Detecta redirección desde Stripe ────────────────────────────────
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('status') === 'success') {
      toast.success("¡Pago confirmado con éxito!");
      const inicio = performance.now();
      navigate('/pedidos', { replace: true });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const duracionMs = performance.now() - inicio;
          const duracionSegundos = +(duracionMs / 1000).toFixed(4);
          console.log(`[RNF-15] Redirección (status=success): ${duracionMs.toFixed(2)} ms`);
          reportarRedirectEvento(duracionSegundos);
        });
      });
    }
  }, [location, navigate]);

  // ── Reloj ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setFechaHora(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ── [RNF-19] Polling: detecta cambios de disponibilidad en tiempo real ───────
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const [resEntradas, resFuertes, resPostres, resBebidas] = await Promise.all([
          api.get('/platos/entradas'),
          api.get('/platos/fuertes'),
          api.get('/platos/postres'),
          api.get('/platos/bebidas'),
        ]);

        const nuevosPlatos = [
          ...resEntradas.data.map(p => ({ ...p, categoria: 'Entradas' })),
          ...resFuertes.data.map(p =>  ({ ...p, categoria: 'Fuertes' })),
          ...resPostres.data.map(p =>  ({ ...p, categoria: 'Postres' })),
          ...resBebidas.data.map(p =>  ({ ...p, categoria: 'Bebidas' })),
        ];

        setPlatos(prev => {
          nuevosPlatos.forEach(async (nuevo) => {
            const anterior = prev.find(p => p.id === nuevo.idPlato);
            if (anterior && anterior.disponible !== nuevo.disponible) {
              try {
                const res = await api.get(`/platos/${nuevo.idPlato}/ultimo-cambio`);
                const timestampToggle = res.data.timestampMs;
                const ahora = Date.now();
                const duracionSegundos = +((ahora - timestampToggle) / 1000).toFixed(4);
                const etiqueta = duracionSegundos > 3.0 ? 'Lento' : 'OK';
                console.log(`[RNF-19] Plato ${nuevo.idPlato} propagado en ${duracionSegundos}s → ${etiqueta}`);
                api.post('/metricas/propagacion-evento', {
                  idPlato: nuevo.idPlato,
                  duracionSegundos,
                  accion: nuevo.disponible ? 'habilitar' : 'deshabilitar'
                }).catch(() => {});
              } catch { /* no interrumpir */ }
            }
          });

          return nuevosPlatos.map(p => ({
            id:         p.idPlato,
            nombre:     p.nombrePlato,
            descripcion:p.descripcion,
            precio:     p.precioPlato,
            categoria:  p.categoria,
            disponible: p.disponible,
            imagenUrl:  p.imagenUrl || IMAGEN_DEFAULT
          }));
        });
      } catch { /* no interrumpir la experiencia */ }
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  // ── Carga inicial de platos y mesas ─────────────────────────────────────────
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
            id:          plato.idPlato,
            nombre:      plato.nombrePlato,
            descripcion: plato.descripcion,
            precio:      plato.precioPlato,
            categoria:   nombreCategoria,
            disponible:  plato.disponible,
            imagenUrl:   plato.imagenUrl || IMAGEN_DEFAULT
          }));

        setPlatos([
          ...mapearPlatos(resEntradas.data, 'Entradas'),
          ...mapearPlatos(resFuertes.data,  'Fuertes'),
          ...mapearPlatos(resPostres.data,  'Postres'),
          ...mapearPlatos(resBebidas.data,  'Bebidas')
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

  // ── Carrito ──────────────────────────────────────────────────────────────────
  const agregarAlPedido = (plato) => {
    setErrores(prev => ({ ...prev, carrito: '' }));
    setCarrito(prev => {
      const existente = prev.find(p => p.id === plato.id);
      if (existente) {
        return prev.map(p =>
          p.id === plato.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [...prev, { ...plato, cantidad: 1 }];
    });
  };

  const decrementarCantidad = (id) => {
    setCarrito(prev =>
      prev
        .map(p => p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p)
        .filter(p => p.cantidad > 0)
    );
  };

  const incrementarCantidad = (id) => {
    setCarrito(prev =>
      prev.map(p => p.id === id ? { ...p, cantidad: p.cantidad + 1 } : p)
    );
  };

  // ── Totales ──────────────────────────────────────────────────────────────────
  const IMPUESTO_IVA = 0.19;

  const calcularSubtotal = () =>
    carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

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

  // ── Confirmar pedido ─────────────────────────────────────────────────────────
  const confirmarPedido = async (metodoPago) => {

    // ── [RNF-11] Validación con reporte de errores visibles ─────────────────
    const nuevosErrores = { mesa: '', carrito: '' };
    let hayErrores = false;

    if (carrito.length === 0) {
      nuevosErrores.carrito = 'Agrega al menos un plato antes de confirmar el pedido.';
      hayErrores = true;
      reportarPedidoFallo('CARRITO_VACIO', nuevosErrores.carrito);
    }
    if (!mesa) {
      nuevosErrores.mesa = 'Selecciona una mesa para continuar.';
      hayErrores = true;
      reportarPedidoFallo('MESA_NO_SELECCIONADA', nuevosErrores.mesa);
    }

    setErrores(nuevosErrores);
    if (hayErrores) return;

    const pedidoPayload = {
      idMesa:       parseInt(mesa),
      observaciones: observaciones || null,
      metodoPago,
      detalles: carrito.map(p => ({
        idPlato:  p.id,
        cantidad: p.cantidad
      }))
    };

    // ── Pago en Caja ─────────────────────────────────────────────────────────
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

        // ── [RNF-15] Mide tiempo de redirección tras pago en caja ────────────
        const inicio = performance.now();
        navigate('/pedidos');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const duracionMs = performance.now() - inicio;
            const duracionSegundos = +(duracionMs / 1000).toFixed(4);
            console.log(`[RNF-15] Redirección (CAJA): ${duracionMs.toFixed(2)} ms`);
            reportarRedirectEvento(duracionSegundos);
          });
        });

      } catch (error) {
        console.error('Error al procesar el pedido:', error);
        const mensajeBackend = error.response?.data?.message || 'Ocurrió un error inesperado.';
        // ── [RNF-11] Reporta error del servidor ──────────────────────────────
        reportarPedidoFallo('ERROR_SERVIDOR', mensajeBackend);
        toast.error(`No se pudo registrar el pedido: ${mensajeBackend}`);
      }
      return;
    }

    // ── Pago en Línea ────────────────────────────────────────────────────────
    try {
    // ✅ PASO 1 — Crear el pedido primero
    const responsePedido = await api.post('/pedidos', pedidoPayload);
    const pedidoCreado = responsePedido.data;

    limpiarFormulario();

    // ✅ PASO 2 — Crear intento de pago para el pedido ya existente
    try {
      const intentoRes = await api.post('/pagos/pedido/crear-intento-existente', {
        idPedido: pedidoCreado.idPedido
      });

      setModalPago({
        open: true,
        clientSecret: intentoRes.data.clientSecret
      });

    } catch {
      // Si falla el intento de pago, el pedido existe en RECIBIDO
      // El usuario puede completar el pago desde /pedidos
      toast.info('Tu pedido fue creado. Puedes completar el pago desde Mis Pedidos.');
      navigate('/pedidos');
    }

  } catch (error) {
    console.error('Error al procesar el pedido:', error);
    const mensajeBackend = error.response?.data?.message || 'Ocurrió un error inesperado.';
    reportarPedidoFallo('ERROR_SERVIDOR', mensajeBackend);
    toast.error(`No se pudo registrar el pedido: ${mensajeBackend}`);
  }
  };

  const handleCerrarModal = () => {
    setModalPago({ open: false, clientSecret: '' });
    toast.info('Pago pendiente. Puedes completarlo desde Mis Pedidos.');
    navigate('/pedidos');
  };

  const handlePagoExitoso = () => {
    limpiarFormulario();
    setModalPago({ open: false, clientSecret: '', pedidoPayload: null });

    // ── [RNF-15] Mide tiempo de redirección tras pago en línea ───────────────
    const inicio = performance.now();
    navigate('/pedidos');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const duracionMs = performance.now() - inicio;
        const duracionSegundos = +(duracionMs / 1000).toFixed(4);
        console.log(`[RNF-15] Redirección (pago en línea): ${duracionMs.toFixed(2)} ms`);
        reportarRedirectEvento(duracionSegundos);
      });
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Cargando menú...</h2>
      </div>
    );
  }

  return (
    <div className="menu-container">
      <Helmet>
        <title>Novost — Toma de Pedidos</title>
      </Helmet>

      {/* ── 1. RESUMEN DEL PEDIDO (IZQUIERDA) ── */}
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

          {/* Selector de mesa */}
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

          {/* Carrito */}
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
              carrito.map((cartItem) => (
                <div className="carrito-item" key={cartItem.id}>
                  <div className="carrito-item-img">
                    {/* [RNF-03] Reporte de imagen en miniatura del carrito */}
                    <img
                      src={cartItem.imagenUrl || IMAGEN_DEFAULT}
                      alt={cartItem.nombre}
                      className="img-miniatura"
                      onLoad={() =>
                        cartItem.imagenUrl &&
                        reportarImagenEvento(cartItem.id, cartItem.imagenUrl, 'exito')
                      }
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = IMAGEN_DEFAULT;
                        cartItem.imagenUrl &&
                          reportarImagenEvento(cartItem.id, cartItem.imagenUrl, 'fallo');
                      }}
                    />
                  </div>
                  <div className="carrito-item-info">
                    <h4>{cartItem.nombre}</h4>
                    <span>{formatCurrency(cartItem.precio * cartItem.cantidad)}</span>
                  </div>
                  <div className="cantidad-controls">
                    <button
                      className="btn-cantidad"
                      onClick={() => decrementarCantidad(cartItem.id)}
                      title="Disminuir cantidad"
                    >
                      <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className="cantidad-valor">{cartItem.cantidad}</span>
                    <button
                      className="btn-cantidad"
                      onClick={() => incrementarCantidad(cartItem.id)}
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

      {/* ── 2. MENÚ DE PLATOS (DERECHA) ── */}
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
              <div className="plato-img-wrapper">
                {/* [RNF-03] Reporte de imagen en la card del plato */}
                <img
                  src={plato.imagenUrl || IMAGEN_DEFAULT}
                  alt={`Plato de ${plato.nombre}`}
                  className="plato-img-real"
                  onLoad={() =>
                    plato.imagenUrl &&
                    reportarImagenEvento(plato.id, plato.imagenUrl, 'exito')
                  }
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = IMAGEN_DEFAULT;
                    plato.imagenUrl &&
                      reportarImagenEvento(plato.id, plato.imagenUrl, 'fallo');
                  }}
                />
              </div>
              <div className="plato-info">
                <h3>{plato.nombre}</h3>
                <p>{plato.descripcion}</p>
                <div className="plato-footer">
                  <span className="plato-precio">{formatCurrency(plato.precio)}</span>
                  <button
                    className="btn-agregar"
                    disabled={!plato.disponible}
                    onClick={() => plato.disponible && agregarAlPedido(plato)}
                  >
                    {plato.disponible ? 'Agregar' : 'No disponible'}
                  </button>
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
        />
      )}
    </div>
  );
};

export default MenuPedido;