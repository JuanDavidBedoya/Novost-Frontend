import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  AlertTriangle, 
  ArrowLeft, 
  Calendar,
  Package,
  Clock
} from 'lucide-react';
import api from '../../api/apiConfig';
import { showErrorToast } from '../../lib/errorHandler';
import './AlertasVencimiento.css';

const AlertasVencimiento = () => {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inventario/alertas/vencimiento?dias=30');
      setAlertas(response.data);
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoVencimiento = (dias) => {
    if (dias <= 0) return { clase: 'vencido', texto: '¡Vencido!', color: '#dc2626' };
    if (dias <= 7) return { clase: 'critico', texto: `${dias} días - Urgente`, color: '#ef6c00' };
    if (dias <= 15) return { clase: 'proximo', texto: `${dias} días - Próximo`, color: '#f59e0b' };
    return { clase: 'alerta', texto: `${dias} días`, color: '#8a2be2' };
  };

  const getUnidadDisplay = (tipoMedida) => {
    const labels = { KILO: 'kg', LITRO: 'L', UNIDAD: 'und' };
    return labels[tipoMedida] || tipoMedida;
  };

  // Calcular estadísticas
  const alertasCriticas = alertas.filter(a => a.diasParaVencer <= 7).length;
  const alertasProximas = alertas.filter(a => a.diasParaVencer > 7 && a.diasParaVencer <= 15).length;
  const productosVencidos = alertas.filter(a => a.diasParaVencer <= 0).length;

  if (loading) {
    return (
      <div className="alertas-loading">
        <div className="spinner"></div>
        <p>Cargando alertas...</p>
      </div>
    );
  }

  return (
    <div className="alertas-page-container">
      {/* Header */}
      <div className="alertas-page-header">
        <button onClick={() => navigate('/stock')} className="alertas-back-button">
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        <div className="alertas-header-content">
          <h1>
            <AlertTriangle size={32} />
            Alertas de Vencimiento
          </h1>
          <p>Monitoreo de productos próximos a vencer</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="alertas-stats-grid">
        <div className="alertas-stat-card">
          <div className="alertas-stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            <Clock size={24} />
          </div>
          <div className="alertas-stat-info">
            <span>Vencidos</span>
            <h3>{productosVencidos}</h3>
          </div>
        </div>
        
        <div className="alertas-stat-card">
          <div className="alertas-stat-icon" style={{ background: 'linear-gradient(135deg, #ef6c00, #e65100)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="alertas-stat-info">
            <span>Críticos (≤7 días)</span>
            <h3>{alertasCriticas}</h3>
          </div>
        </div>
        
        <div className="alertas-stat-card">
          <div className="alertas-stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <Calendar size={24} />
          </div>
          <div className="alertas-stat-info">
            <span>Próximos (8-15 días)</span>
            <h3>{alertasProximas}</h3>
          </div>
        </div>
      </div>

      {/* Alertas List */}
      <div className="alertas-table-container">
        {alertas.length === 0 ? (
          <div className="alertas-empty">
            <Calendar size={48} />
            <h3>No hay productos próximos a vencer</h3>
            <p>Tus productos están en buen estado</p>
          </div>
        ) : (
          <table className="alertas-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Lote</th>
                <th>Fecha Vencimiento</th>
                <th>Estado</th>
                <th>Días Restantes</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map(producto => {
                const estado = getEstadoVencimiento(producto.diasParaVencer);
                return (
                  <tr key={producto.idProducto} className={`alerta-row ${estado.clase}`}>
                    <td className="alerta-product-name">
                      <strong>{producto.nombreAlimento}</strong>
                    </td>
                    <td>
                      <span className="alerta-value">
                        {producto.cantidad} {getUnidadDisplay(producto.tipoMedida)}
                      </span>
                    </td>
                    <td>{producto.lote || 'N/A'}</td>
                    <td>
                      <span className="alerta-date">
                        {new Date(producto.fechaVencimiento).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span className="alerta-status-badge" style={{ 
                        background: `linear-gradient(135deg, ${estado.color}22, ${estado.color}11)`,
                        color: estado.color,
                        border: `1px solid ${estado.color}44`
                      }}>
                        {estado.texto}
                      </span>
                    </td>
                    <td>
                      <span className="alerta-days" style={{ color: estado.color }}>
                        {producto.diasParaVencer} días
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AlertasVencimiento;
