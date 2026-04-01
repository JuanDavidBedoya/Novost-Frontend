import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/apiConfig';
import { toast } from 'react-toastify';
import { Calendar, Hash, ShoppingBag, AlertCircle, UtensilsCrossed, CreditCard } from 'lucide-react';
import PagoModalPedido from '../../components/pasarela/PagoModalPedido';
import './Orders.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatFecha = (fecha) => {
  if (!fecha) return '—';
  const [year, month, day] = fecha.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
};

const formatHora = (hora) => {
  if (!hora) return '—';
  const [h, m] = hora.split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
};

const formatMoneda = (valor) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(valor ?? 0);

const ESTADOS = ['RECIBIDO', 'PAGADO', 'ENTREGADO'];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PedidoSkeleton() {
  return (
    <div className="pedido-skeleton">
      <div className="skeleton-line" style={{ width: '55%', height: '20px' }} />
      <div className="skeleton-line" style={{ width: '35%', height: '14px' }} />
      <div className="skeleton-line" style={{ width: '100%', height: '40px' }} />
      <div className="skeleton-line" style={{ width: '100%', height: '40px' }} />
      <div className="skeleton-line" style={{ width: '40%', height: '28px', marginTop: '1rem' }} />
    </div>
  );
}

// ─── Tarjeta de pedido ────────────────────────────────────────────────────────
function PedidoCard({ pedido, onPagarLinea }) {
  const estado = pedido.estadoPedido ?? 'RECIBIDO';

  return (
    <div className="pedido-card">
      {/* Cabecera */}
      <div className="pedido-card-header">
        <div>
          <div className="pedido-card-fecha">{formatFecha(pedido.fechaPedido)}</div>
          <div className="pedido-card-hora">{formatHora(pedido.horaPedido)} hs</div>
        </div>
        <span className={`pedido-status-chip pedido-status-${estado}`}>
          {estado}
        </span>
      </div>

      {/* Cuerpo */}
      <div className="pedido-card-body">
        <div className="pedido-info-row">
          <Hash size={15} />
          <span>Pedido <strong>#{pedido.idPedido}</strong></span>
        </div>

        <div className="pedido-info-row">
          <UtensilsCrossed size={15} />
          <span>Mesa <strong>#{pedido.numeroMesa}</strong></span>
        </div>

        {pedido.idReserva && (
          <div className="pedido-info-row">
            <Calendar size={15} />
            <span>Reserva <strong>#{pedido.idReserva}</strong></span>
          </div>
        )}

        {pedido.observaciones && (
          <div className="pedido-info-row" style={{ fontStyle: 'italic', fontWeight: 500 }}>
            <AlertCircle size={15} />
            <span>{pedido.observaciones}</span>
          </div>
        )}
      </div>

      {/* Aviso + botón de pago en línea — solo estado RECIBIDO */}
      {estado === 'RECIBIDO' && (
        <>
          <div className="pedido-aviso-caja">
            <AlertCircle size={16} />
            <span>Acércate a caja para pagar tu pedido o paga en línea.</span>
          </div>
          <button
            onClick={() => onPagarLinea(pedido.idPedido)}
            style={{
              width: '100%',
              marginTop: '0.75rem',
              padding: '0.65rem',
              background: 'linear-gradient(135deg, #8a2be2, #B452FF)',
              color: '#fff',
              border: 'none',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <CreditCard size={15} /> Pagar en Línea
          </button>
        </>
      )}

      {/* Footer totales */}
      <div className="pedido-card-footer">
        <div>
          <div className="pedido-total-label">Total con IVA</div>
          <div className="pedido-total-valor">
            {formatMoneda(pedido.total)}
            <span>USD</span>
          </div>
          <div className="pedido-subtotal-hint">
            Subtotal: {formatMoneda(pedido.subtotal)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function MisPedidos() {
  const navigate = useNavigate();
  const location = useLocation();

  const [pedidos, setPedidos]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filtros, setFiltros]       = useState({ fecha: '', estado: '' });
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalPago, setModalPago]   = useState({ open: false, clientSecret: '' });

  // ✅ Detecta redirección de Stripe con ?status=success (caso 3D Secure u otros)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('status') === 'success') {
      toast.success('¡Pago confirmado exitosamente! Tu pedido ha sido actualizado.');
      setRefreshKey(k => k + 1);
      navigate('/pedidos', { replace: true });
    }
  }, [location.search, navigate]);

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtros.fecha)  params.fecha  = filtros.fecha;
      if (filtros.estado) params.estado = filtros.estado;

      const { data } = await api.get('/pedidos/mis-pedidos', { params });
      setPedidos(data);
    } catch (error) {
      console.error('Error al cargar los pedidos:', error);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, [filtros, refreshKey]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  // ✅ Recarga de datos 1.5 segundos después de entrar a la interfaz
  useEffect(() => {
    const timer = setTimeout(() => {
      setRefreshKey(k => k + 1); 
      console.log("Recarga automática de 1.5 segundos completada");
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // ✅ Abre el modal de pago para un pedido en estado RECIBIDO
  const handlePagarLinea = async (idPedido) => {
    try {
      const res = await api.post('/pagos/pedido/crear-intento-existente', { idPedido });
      setModalPago({ open: true, clientSecret: res.data.clientSecret });
    } catch {
      toast.error('No se pudo iniciar el pago. Intenta de nuevo.');
    }
  };

  // ✅ Pago exitoso sin redirección: cierra el modal y hace refresh de 1500ms
  const handlePagoExitoso = () => {
    setModalPago({ open: false, clientSecret: '' });
    toast.success('¡Pago confirmado exitosamente! Tu pedido ha sido actualizado.');
    setTimeout(() => {
      setRefreshKey(k => k + 1);
    }, 1500);
  };

  // ✅ Cierre sin pago: solo cierra el modal y hace refresh de 1500ms
  const handleCerrarModal = () => {
    setModalPago({ open: false, clientSecret: '' });
    setTimeout(() => {
      setRefreshKey(k => k + 1);
    }, 1500);
  };

  const limpiarFiltros = () => setFiltros({ fecha: '', estado: '' });

  return (
    <div className="pedidos-page">
      {/* Hero */}
      <div className="pedidos-hero">
        <h1>Mis <span>Pedidos</span></h1>
        <p>Consulta el historial y estado de todos tus pedidos en Novost.</p>
      </div>

      {/* Filtros */}
      <div className="pedidos-filtros-card">
        <div className="pedidos-filtros-grid">
          <div className="pedidos-filtro-group">
            <label htmlFor="pf-fecha">
              <Calendar size={14} /> Fecha
            </label>
            <input
              type="date"
              id="pf-fecha"
              className="pedidos-filtro-input"
              value={filtros.fecha}
              onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
            />
          </div>

          <div className="pedidos-filtro-group">
            <label htmlFor="pf-estado">
              <ShoppingBag size={14} /> Estado
            </label>
            <select
              id="pf-estado"
              className="pedidos-filtro-input"
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            >
              <option value="">Todos</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div className="pedidos-filtro-actions">
            <button onClick={limpiarFiltros} className="pedidos-btn-limpiar">
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="pedidos-list-grid">
          {[1, 2, 3].map((i) => <PedidoSkeleton key={i} />)}
        </div>
      ) : pedidos.length > 0 ? (
        <div className="pedidos-list-grid">
          {pedidos.map((p) => (
            <PedidoCard
              key={p.idPedido}
              pedido={p}
              onPagarLinea={handlePagarLinea}
            />
          ))}
        </div>
      ) : (
        <div className="pedidos-empty">
          <div className="pedidos-empty-icon">🍽️</div>
          <p>No se encontraron pedidos con los filtros seleccionados.</p>
        </div>
      )}

      {/* Modal de pago en línea */}
      {modalPago.open && (
        <PagoModalPedido
          clientSecret={modalPago.clientSecret}
          onClose={handleCerrarModal}
          onSuccess={handlePagoExitoso}
        />
      )}
    </div>
  );
}