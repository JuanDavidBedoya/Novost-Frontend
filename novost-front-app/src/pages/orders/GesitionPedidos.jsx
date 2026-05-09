import { useState, useEffect, useCallback } from 'react';
import api from '../../api/apiConfig';
import {
  Calendar, Filter, RefreshCw, CheckCircle, PackageCheck,
  Clock, Hash, UtensilsCrossed, ChevronRight, AlertCircle,
  Banknote, CreditCard, TrendingUp, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../lib/errorHandler';
import './Orders.css';

const MySwal = withReactContent(Swal);

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

const ACCION_CONFIG = {
  RECIBIDO: {
    label: 'Marcar como Pagado',
    icon: CheckCircle,
    className: 'btn-accion-pagar',
    siguiente: 'PAGADO',
    confirmTitle: '¿Confirmar pago en caja?',
    confirmText: 'Esto marcará el pedido como PAGADO y registrará el cobro.',
    confirmBtn: 'Sí, marcar como Pagado',
  },
  PAGADO: {
    label: 'Marcar como Entregado',
    icon: PackageCheck,
    className: 'btn-accion-entregar',
    siguiente: 'ENTREGADO',
    confirmTitle: '¿Confirmar entrega del pedido?',
    confirmText: 'Esto marcará el pedido como ENTREGADO al cliente.',
    confirmBtn: 'Sí, marcar como Entregado',
  },
};

// ─── Badge de estado ──────────────────────────────────────────────────────────

function EstadoBadge({ estado }) {
  return (
    <span className={`gp-estado-badge gp-estado-${estado}`}>
      {estado}
    </span>
  );
}

// ─── Fila de pedido ───────────────────────────────────────────────────────────

function FilaPedido({ pedido, onAvanzar, loading }) {
  const accion = ACCION_CONFIG[pedido.estadoPedido];
  const IconAccion = accion?.icon;

  return (
    <tr className={`gp-fila gp-fila-${pedido.estadoPedido}`}>
      <td className="gp-td gp-td-id">
        <span className="gp-id-badge">#{pedido.idPedido}</span>
      </td>
      <td className="gp-td">
        <div className="gp-fecha-group">
          <span className="gp-fecha">{formatFecha(pedido.fechaPedido)}</span>
          <span className="gp-hora">
            <Clock size={11} /> {formatHora(pedido.horaPedido)}
          </span>
        </div>
      </td>
      <td className="gp-td">
        <span className="gp-mesa">
          <UtensilsCrossed size={13} /> Mesa #{pedido.numeroMesa}
        </span>
      </td>
      <td className="gp-td">
        <EstadoBadge estado={pedido.estadoPedido} />
      </td>
      <td className="gp-td gp-td-total">
        <div className="gp-total-group">
          <span className="gp-total">{formatMoneda(pedido.total)}</span>
          <span className="gp-subtotal">Subtotal {formatMoneda(pedido.subtotal)}</span>
        </div>
      </td>
      <td className="gp-td gp-td-accion">
        {accion ? (
          <button
            className={`gp-btn-accion ${accion.className}`}
            onClick={() => onAvanzar(pedido, accion)}
            disabled={loading === pedido.idPedido}
            title={accion.label}
          >
            {loading === pedido.idPedido ? (
              <span className="gp-spinner" />
            ) : (
              <>
                <IconAccion size={15} />
                <span>{accion.label}</span>
                <ChevronRight size={13} className="gp-chevron" />
              </>
            )}
          </button>
        ) : (
          <span className="gp-entregado-text">
            <PackageCheck size={14} /> Completado
          </span>
        )}
      </td>
    </tr>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonFila() {
  return (
    <tr className="gp-fila">
      {[120, 140, 90, 80, 110, 140].map((w, i) => (
        <td key={i} className="gp-td">
          <div className="gp-skeleton-cell" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Modal Cierre de Caja ─────────────────────────────────────────────────────

function CierreCajaModal({ datos, onClose }) {
  if (!datos) return null;

  const porcentajeCaja  = datos.totalDia > 0 ? (datos.totalCaja  / datos.totalDia) * 100 : 0;
  const porcentajeLinea = datos.totalDia > 0 ? (datos.totalLinea / datos.totalDia) * 100 : 0;

  return (
    <div className="cierre-overlay" onClick={onClose}>
      <div className="cierre-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="cierre-header">
          <div className="cierre-header-left">
            <TrendingUp size={20} />
            <div>
              <h2>Cierre de Caja</h2>
              <span>{new Date().toLocaleDateString('es-CO', {
                weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
              })}</span>
            </div>
          </div>
          <button className="cierre-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Total general */}
        <div className="cierre-total-card">
          <p>Total del día</p>
          <h3>{formatMoneda(datos.totalDia)}</h3>
          <span>{datos.cantidadPedidos} pedido{datos.cantidadPedidos !== 1 ? 's' : ''} pagado{datos.cantidadPedidos !== 1 ? 's' : ''}</span>
        </div>

        {/* Desglose */}
        <div className="cierre-desglose">
          {/* Caja */}
          <div className="cierre-metodo cierre-metodo-caja">
            <div className="cierre-metodo-icon">
              <Banknote size={20} />
            </div>
            <div className="cierre-metodo-info">
              <span className="cierre-metodo-label">Efectivo · Caja</span>
              <span className="cierre-metodo-monto">{formatMoneda(datos.totalCaja)}</span>
              <span className="cierre-metodo-sub">
                {datos.cantidadCaja} pedido{datos.cantidadCaja !== 1 ? 's' : ''} · {porcentajeCaja.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Línea */}
          <div className="cierre-metodo cierre-metodo-linea">
            <div className="cierre-metodo-icon">
              <CreditCard size={20} />
            </div>
            <div className="cierre-metodo-info">
              <span className="cierre-metodo-label">Pago en Línea</span>
              <span className="cierre-metodo-monto">{formatMoneda(datos.totalLinea)}</span>
              <span className="cierre-metodo-sub">
                {datos.cantidadLinea} pedido{datos.cantidadLinea !== 1 ? 's' : ''} · {porcentajeLinea.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Barra de distribución */}
        <div className="cierre-barra-wrapper">
          <div className="cierre-barra">
            <div
              className="cierre-barra-caja"
              style={{ width: `${porcentajeCaja}%` }}
              title={`Caja: ${porcentajeCaja.toFixed(1)}%`}
            />
            <div
              className="cierre-barra-linea"
              style={{ width: `${porcentajeLinea}%` }}
              title={`Línea: ${porcentajeLinea.toFixed(1)}%`}
            />
          </div>
          <div className="cierre-barra-labels">
            <span style={{ color: '#a03ce6' }}>Caja {porcentajeCaja.toFixed(0)}%</span>
            <span style={{ color: '#00c2d4' }}>Línea {porcentajeLinea.toFixed(0)}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function GestionPedidos() {
  const [pedidos,        setPedidos]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [loadingAccion,  setLoadingAccion]  = useState(null);
  const [filtros,        setFiltros]        = useState({ fecha: '', estado: '' });

  // Cierre de Caja
  const [cierreVisible,  setCierreVisible]  = useState(false);
  const [cierreData,     setCierreData]     = useState(null);
  const [loadingCierre,  setLoadingCierre]  = useState(false);

  const contadores = ESTADOS.reduce((acc, e) => {
    acc[e] = pedidos.filter(p => p.estadoPedido === e).length;
    return acc;
  }, {});

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtros.fecha)  params.fecha  = filtros.fecha;
      if (filtros.estado) params.estado = filtros.estado;
      const { data } = await api.get('/pedidos/todos', { params });
      setPedidos(data);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => { fetchPedidos(); }, [fetchPedidos]);

  // ── Abre el modal de Cierre de Caja ──────────────────────────────────────
  const handleCierreCaja = async () => {
    setLoadingCierre(true);
    try {
      const { data } = await api.get('/dashboard/cierre-caja');
      setCierreData(data);
      setCierreVisible(true);
    } catch (error) {
      showErrorToast(error, toast);
    } finally {
      setLoadingCierre(false);
    }
  };

  const handleAvanzar = async (pedido, accion) => {
    const result = await MySwal.fire({
      title: accion.confirmTitle,
      html: `<p style="color:#6b7280;margin:0">${accion.confirmText}</p>
             <div style="margin-top:1rem;padding:0.75rem 1rem;background:#f9fafb;border-radius:10px;font-size:0.9rem;color:#374151">
               Pedido <strong>#${pedido.idPedido}</strong> · Mesa <strong>#${pedido.numeroMesa}</strong> · 
               <strong>${formatMoneda(pedido.total)}</strong>
             </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: accion.siguiente === 'PAGADO' ? '#16a34a' : '#4f46e5',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: accion.confirmBtn,
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      background: '#ffffff',
    });

    if (!result.isConfirmed) return;

    setLoadingAccion(pedido.idPedido);
    try {
      await api.patch(`/pedidos/${pedido.idPedido}/avanzar-estado`);
      toast.success(
        `Pedido #${pedido.idPedido} marcado como ${accion.siguiente} correctamente.`
      );
      fetchPedidos();
    } catch (error) {
      showErrorToast(error, toast);
    } finally {
      setLoadingAccion(null);
    }
  };

  const limpiarFiltros = () => setFiltros({ fecha: '', estado: '' });

  return (
    <div className="gp-page">

      {/* ── Modal Cierre de Caja ── */}
      {cierreVisible && (
        <CierreCajaModal
          datos={cierreData}
          onClose={() => setCierreVisible(false)}
        />
      )}

      {/* ── Header ── */}
      <div className="gp-header">
        <div className="gp-header-text">
          <h1>Gestión de <span>Pedidos</span></h1>
          <p>Administra y actualiza el estado de todos los pedidos del restaurante.</p>
        </div>
        <div className="gp-header-actions">
          <button
            className="gp-btn-cierre"
            onClick={handleCierreCaja}
            disabled={loadingCierre}
            title="Ver resumen del día"
          >
            {loadingCierre
              ? <span className="gp-spinner" />
              : <TrendingUp size={16} />}
            <span>Cierre de Caja</span>
          </button>
          <button className="gp-btn-refresh" onClick={fetchPedidos} title="Recargar">
            <RefreshCw size={16} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* ── Tarjetas de resumen ── */}
      <div className="gp-stats-row">
        {ESTADOS.map((e) => (
          <div
            key={e}
            className={`gp-stat-card gp-stat-${e} ${filtros.estado === e ? 'gp-stat-active' : ''}`}
            onClick={() => setFiltros(f => ({ ...f, estado: f.estado === e ? '' : e }))}
            title={`Filtrar por ${e}`}
          >
            <span className="gp-stat-num">{contadores[e] ?? 0}</span>
            <span className="gp-stat-label">{e}</span>
          </div>
        ))}
        <div className="gp-stat-card gp-stat-TOTAL">
          <span className="gp-stat-num">{pedidos.length}</span>
          <span className="gp-stat-label">TOTAL</span>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="gp-filtros-card">
        <div className="gp-filtros-grid">
          <div className="gp-filtro-group">
            <label><Calendar size={13} /> Fecha</label>
            <input
              type="date"
              className="gp-filtro-input"
              value={filtros.fecha}
              onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
            />
          </div>
          <div className="gp-filtro-group">
            <label><Filter size={13} /> Estado</label>
            <select
              className="gp-filtro-input"
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            >
              <option value="">Todos</option>
              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="gp-filtro-actions">
            <button className="gp-btn-limpiar" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="gp-tabla-wrapper">
        <table className="gp-tabla">
          <thead>
            <tr>
              <th className="gp-th"><Hash size={13} /> ID</th>
              <th className="gp-th"><Calendar size={13} /> Fecha / Hora</th>
              <th className="gp-th"><UtensilsCrossed size={13} /> Mesa</th>
              <th className="gp-th">Estado</th>
              <th className="gp-th">Total</th>
              <th className="gp-th">Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonFila key={i} />)
            ) : pedidos.length === 0 ? (
              <tr>
                <td colSpan={6} className="gp-empty-cell">
                  <div className="gp-empty">
                    <AlertCircle size={32} className="gp-empty-icon" />
                    <p>No se encontraron pedidos con los filtros aplicados.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pedidos.map(p => (
                <FilaPedido
                  key={p.idPedido}
                  pedido={p}
                  onAvanzar={handleAvanzar}
                  loading={loadingAccion}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}