import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { 
  Package, 
  ArrowLeft, 
  AlertTriangle,
  Calendar,
  Trash2,
  TrendingUp,
  Box,
  Tags
} from 'lucide-react';
import api from '../../api/apiConfig';
import { showErrorToast } from '../../lib/errorHandler';
import './ProductosPorTipo.css';

const ProductosPorTipo = () => {
  const navigate = useNavigate();
  const { idTipo } = useParams();
  const [productos, setProductos] = useState([]);
  const [tipo, setTipo] = useState(null);
  const [productosIndividuales, setProductosIndividuales] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    if (!idTipo) {
      navigate('/stock/tipos');
      return;
    }
    cargarDatos();
  }, [idTipo, navigate]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar productos del tipo
      const prodResponse = await api.get(`/inventario/tipos/${idTipo}/productos`);
      const productosData = Array.isArray(prodResponse.data) ? prodResponse.data : [];
      setProductos(productosData);

      // Cargar nombre del tipo
      const tiposResponse = await api.get('/inventario/tipos');
      const tiposData = Array.isArray(tiposResponse.data) ? tiposResponse.data : [];
      const tipoSeleccionado = tiposData.find(t => t.idTipo === parseInt(idTipo));
      setTipo(tipoSeleccionado);

      // Cargar productos individuales para cada producto
      const individualesMap = {};
      for (const prod of productosData) {
        try {
          const indResponse = await api.get(`/inventario/productos/${prod.idAlimento}/individuales`);
          individualesMap[prod.idAlimento] = Array.isArray(indResponse.data) ? indResponse.data : [];
        } catch (e) {
          individualesMap[prod.idAlimento] = [];
        }
      }
      setProductosIndividuales(individualesMap);
    } catch (error) {
      console.error('Error cargando datos:', error);
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandir = (idAlimento) => {
    setExpandido(expandido === idAlimento ? null : idAlimento);
  };

  const handleDeleteLote = async (idProducto, idAlimento) => {
    const result = await Swal.fire({
      title: '¿Eliminar lote?',
      text: '¿Estás seguro de eliminar este lote del inventario? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#8a2be2',
      cancelButtonColor: '#666',
      reverseButtons: true
    });
    
    if (!result.isConfirmed) return;
    
    try {
      await api.delete(`/inventario/productos/individuales/${idProducto}`);
      toast.success('Lote eliminado exitosamente');
      
      const indResponse = await api.get(`/inventario/productos/${idAlimento}/individuales`);
      const indData = Array.isArray(indResponse.data) ? indResponse.data : [];
      setProductosIndividuales(prev => ({
        ...prev,
        [idAlimento]: indData
      }));
      
      cargarDatos();
    } catch (error) {
      showErrorToast(error);
    }
  };

  const getUnidadDisplay = (tipoMedida) => {
    const labels = { KILO: 'kg', LITRO: 'L', UNIDAD: 'und' };
    return labels[tipoMedida] || tipoMedida;
  };

  const getEstadoVencimiento = (fechaVencimiento) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { clase: 'vencido', texto: 'Vencido', color: '#dc2626' };
    if (diffDays <= 7) return { clase: 'critico', texto: `${diffDays} días`, color: '#ef6c00' };
    if (diffDays <= 30) return { clase: 'proximo', texto: `${diffDays} días`, color: '#f59e0b' };
    return { clase: 'ok', texto: `${diffDays} días`, color: '#10b981' };
  };



  if (loading) {
    return (
      <div className="productostipo-loading">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="productostipo-page-container">
      {/* Header */}
      <div className="productostipo-page-header">
        <button onClick={() => navigate('/stock/tipos')} className="productostipo-back-button">
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        <div className="productostipo-header-content">
          <h1>
            <Box size={32} />
            {tipo?.nombreTipo || 'Tipo de Producto'}
          </h1>
          <p>Gestión de productos por categoría</p>
        </div>
      </div>

      {/* Productos List */}
      <div className="productostipo-list-container">
        {productos.length === 0 ? (
          <div className="productostipo-empty">
            <Box size={48} />
            <h3>No hay productos en este tipo</h3>
            <p>No se encontraron productos registrados</p>
          </div>
        ) : (
          productos.map(producto => {
            const estado = producto.stockActual < producto.stockMinimo ? 'bajo' : 'normal';
            return (
              <div key={producto.idAlimento} className={`productostipo-card ${estado}`}>
                <div className="productostipo-card-header" onClick={() => toggleExpandir(producto.idAlimento)}>
                  <div className="productostipo-card-info">
                    <div className="productostipo-icon">
                      <Package size={24} />
                    </div>
                    <div>
                      <h3>{producto.nombreAlimento}</h3>
                      <div className="productostipo-stock-info">
                        <span className="productostipo-stock">
                          Stock: {producto.stockActual} {getUnidadDisplay(producto.tipoMedida)}
                        </span>
                        <span className="productostipo-min">
                          Mín: {producto.stockMinimo} {getUnidadDisplay(producto.tipoMedida)}
                        </span>
                        {producto.stockActual < producto.stockMinimo && (
                          <span className="productostipo-warning">
                            <AlertTriangle size={14} />
                            Bajo stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="productostipo-toggle">
                    {expandido === producto.idAlimento ? '▼' : '▶'}
                  </div>
                </div>

                {expandido === producto.idAlimento && (
                  <div className="productostipo-details">
                    <h4>Lotes y Fechas de Vencimiento</h4>
                    {productosIndividuales[producto.idAlimento]?.length > 0 ? (
                      <table className="productostipo-table">
                        <thead>
                          <tr>
                            <th>Fecha Vencimiento</th>
                            <th>Cantidad</th>
                            <th>Lote</th>
                            <th>Proveedor</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productosIndividuales[producto.idAlimento].map(ind => {
                            const estado = getEstadoVencimiento(ind.fechaVencimiento);
                            return (
                              <tr key={ind.idProducto} className={estado.clase}>
                                <td>
                                  <div className="productostipo-date">
                                    <Calendar size={14} />
                                    {new Date(ind.fechaVencimiento).toLocaleDateString()}
                                  </div>
                                </td>
                                <td>
                                  <span className="productostipo-quantity">
                                    {ind.cantidad} {getUnidadDisplay(producto.tipoMedida)}
                                  </span>
                                </td>
                                <td>{ind.lote || '-'}</td>
                                <td>{ind.proveedor || '-'}</td>
                                <td>
                                  <span className="productostipo-status-badge" style={{ 
                                    background: `linear-gradient(135deg, ${estado.color}22, ${estado.color}11)`,
                                    color: estado.color,
                                    border: `1px solid ${estado.color}44`
                                  }}>
                                    {estado.texto}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="productostipo-delete-btn"
                                    onClick={() => handleDeleteLote(ind.idProducto, producto.idAlimento)}
                                    title="Eliminar lote"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <p className="productostipo-no-items">No hay lotes registrados para este producto</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductosPorTipo;
