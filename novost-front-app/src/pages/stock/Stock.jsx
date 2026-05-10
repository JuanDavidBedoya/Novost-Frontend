import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  ArrowLeft,
  Edit,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  X,
  Check,
  Tags,
  Calendar,
  ShoppingCart
} from 'lucide-react';
import api from '../../api/apiConfig';
import { showErrorToast } from '../../lib/errorHandler';
import './stock.css';

const Stock = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [productoStock, setProductoStock] = useState(null);
  const [stockAction, setStockAction] = useState('agregar');
  const [stockCantidad, setStockCantidad] = useState('');
  const [esNuevo, setEsNuevo] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    nombreAlimento: '',
    tipoMedida: 'KILO',
    stockMinimo: '',
    idTipo: ''
  });

  const userRole = localStorage.getItem('rol');

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inventario');
      setProductos(response.data);
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProductos = productos.filter(producto => {
    // Filtro por búsqueda
    const matchesBusqueda = producto.nombreAlimento
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    
    // Filtro por tipo de medida
    const matchesTipo = filtroTipo === 'todos' || producto.tipoMedida === filtroTipo;
    
    // Filtro por estado (stock bajo o normal)
    const matchesEstado = filtroEstado === 'todos' || 
      (filtroEstado === 'bajo' && producto.belowMinStock) ||
      (filtroEstado === 'normal' && !producto.belowMinStock);
    
    return matchesBusqueda && matchesTipo && matchesEstado;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleOpenModal = (producto = null) => {
    if (producto) {
      setProductoEditando(producto);
      setFormData({
        nombreAlimento: producto.nombreAlimento,
        tipoMedida: producto.tipoMedida,
        stockMinimo: producto.stockMinimo,
        idTipo: producto.tipoProducto?.idTipo || ''
      });
      setEsNuevo(false);
    } else {
      setProductoEditando(null);
      setFormData({
        nombreAlimento: '',
        tipoMedida: 'KILO',
        stockMinimo: '',
        idTipo: ''
      });
      setEsNuevo(true);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setProductoEditando(null);
    setFormData({
      nombreAlimento: '',
      tipoMedida: 'KILO',
      stockMinimo: '',
      idTipo: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombreAlimento: formData.nombreAlimento,
        tipoMedida: formData.tipoMedida,
        stockMinimo: parseFloat(formData.stockMinimo),
        idTipo: formData.idTipo ? parseInt(formData.idTipo) : null
      };

      if (esNuevo) {
        await api.post('/inventario', payload);
        toast.success('Producto creado exitosamente');
      } else {
        await api.put(`/inventario/${productoEditando.idAlimento}`, payload);
        toast.success('Producto actualizado exitosamente');
      }
      
      handleCloseModal();
      cargarInventario();
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleDelete = async (producto) => {
    if (!window.confirm(`¿Está seguro de eliminar "${producto.nombreAlimento}" del inventario?`)) {
      return;
    }

    try {
      await api.delete(`/inventario/${producto.idAlimento}`);
      toast.success('Producto eliminado exitosamente');
      cargarInventario();
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleOpenStockModal = (producto, action) => {
    setProductoStock(producto);
    setStockAction(action);
    setStockCantidad('');
    setShowStockModal(true);
  };

  const handleCloseStockModal = () => {
    setShowStockModal(false);
    setProductoStock(null);
    setStockCantidad('');
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!productoStock || !stockCantidad) return;

    try {
      const endpoint = stockAction === 'agregar' 
        ? `/inventario/${productoStock.idAlimento}/agregar-stock`
        : `/inventario/${productoStock.idAlimento}/quitar-stock`;
      
      await api.post(endpoint, { cantidad: parseFloat(stockCantidad) });
      
      toast.success(stockAction === 'agregar' 
        ? 'Stock agregado exitosamente' 
        : 'Stock reducido exitosamente');
      
      handleCloseStockModal();
      cargarInventario();
    } catch (error) {
      showErrorToast(error);
    }
  };

  const getUnidadDisplay = (producto) => {
    const stock = producto.stockActual;
    const stockStr = stock.toString();
    const decimalIndex = stockStr.indexOf('.');
    
    if (decimalIndex === -1) {
      return stockStr;
    }
    
    const decimales = stockStr.length - decimalIndex - 1;
    const decimalesMostrar = Math.min(decimales, 4);
    
    return stock.toFixed(decimalesMostrar);
  };

  const getMedidaLabel = (tipo) => {
    const labels = {
      'KILO': 'kg',
      'LITRO': 'L',
      'UNIDAD': 'und'
    };
    return labels[tipo] || tipo;
  };

  // Calcular estadísticas
  const totalProductos = productos.length;
  const productosBajoStock = productos.filter(p => p.belowMinStock).length;
  const stockTotalKilos = productos
    .filter(p => p.tipoMedida === 'KILO')
    .reduce((sum, p) => sum + p.stockActual, 0);
  const stockTotalLitros = productos
    .filter(p => p.tipoMedida === 'LITRO')
    .reduce((sum, p) => sum + p.stockActual, 0);

  return (
    <div className="stock-page-container">
      {/* Header */}
      <div className="stock-page-header">
        <button onClick={() => navigate('/worker-home')} className="stock-back-button">
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        <div className="stock-header-content">
          <h1>
            <Package size={32} />
            Control de Inventario
          </h1>
          <p>Gestión del stock del restaurante</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stock-stats-grid">
        <div className="stock-stat-card">
          <div className="stock-stat-icon" style={{ background: 'linear-gradient(135deg, #8a2be2, #7b24d1)' }}>
            <Package size={24} />
          </div>
          <div className="stock-stat-info">
            <span>Total Productos</span>
            <h3>{totalProductos}</h3>
          </div>
        </div>
        
        <div className="stock-stat-card">
          <div className="stock-stat-icon" style={{ background: 'linear-gradient(135deg, #ff6b6b, #ee5a5a)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stock-stat-info">
            <span>Stock Bajo</span>
            <h3>{productosBajoStock}</h3>
          </div>
        </div>
        
        <div className="stock-stat-card">
          <div className="stock-stat-icon" style={{ background: 'linear-gradient(135deg, #4caf50, #43a047)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stock-stat-info">
            <span>Total Kilos</span>
            <h3>{stockTotalKilos.toFixed(1)} kg</h3>
          </div>
        </div>
        
        <div className="stock-stat-card">
          <div className="stock-stat-icon" style={{ background: 'linear-gradient(135deg, #2196f3, #1e88e5)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stock-stat-info">
            <span>Total Litros</span>
            <h3>{stockTotalLitros.toFixed(1)} L</h3>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="stock-filters-section">
        <div className="stock-search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Buscar producto..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        
        <div className="stock-filter-group">
          <select 
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="stock-filter-select"
          >
            <option value="todos">Todos los tipos</option>
            <option value="KILO">Kilos</option>
            <option value="LITRO">Litros</option>
            <option value="UNIDAD">Unidades</option>
          </select>
          
          <select 
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="stock-filter-select"
          >
            <option value="todos">Todos los estados</option>
            <option value="bajo">Stock Bajo</option>
            <option value="normal">Stock Normal</option>
          </select>
        </div>

        <button 
          className="stock-add-button"
          onClick={() => handleOpenModal()}
        >
          <Plus size={20} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Navegación a nuevas funcionalidades */}
      <div className="stock-navigation-section">
        <h3>Acciones Avanzadas</h3>
        <div className="stock-nav-buttons">
          <button 
            className="stock-nav-btn stock-nav-tipos"
            onClick={() => navigate('/stock/tipos')}
          >
            <Tags size={20} />
            <span>Ver Tipos de Productos</span>
          </button>
          
          <button 
            className="stock-nav-btn stock-nav-alertas"
            onClick={() => navigate('/stock/alertas')}
          >
            <Calendar size={20} />
            <span>Alertas de Vencimiento</span>
          </button>
          
          <button 
            className="stock-nav-btn stock-nav-entradas"
            onClick={() => navigate('/stock/entradas')}
          >
            <ShoppingCart size={20} />
            <span>Registrar Entrada de Compra</span>
          </button>
        </div>
      </div>

       {/* Products Table */}
       <div className="stock-table-container">
         {loading ? (
           <div className="stock-loading">
             <div className="spinner"></div>
             <p>Cargando inventario...</p>
           </div>
         ) : filteredProductos.length === 0 ? (
           <div className="stock-empty">
             <Package size={48} />
             <h3>No se encontraron productos</h3>
             <p>Intenta con otros filtros de búsqueda</p>
           </div>
         ) : (
           <table className="stock-table">
             <thead>
               <tr>
                 <th>Producto</th>
                 <th>Tipo Medida</th>
                 <th>Stock Actual</th>
                 <th>Stock Mínimo</th>
                 <th>Estado</th>
                 <th>Acciones</th>
               </tr>
             </thead>
             <tbody>
               {filteredProductos.map((producto) => (
                 <tr key={producto.idAlimento}>
                   <td className="stock-product-name">
                     <strong>{producto.nombreAlimento}</strong>
                   </td>
                   <td>
                     <span className={`stock-type-badge stock-type-${producto.tipoMedida.toLowerCase()}`}>
                       {producto.tipoMedida}
                     </span>
                   </td>
                   <td>
                     <span className="stock-value">
                       {getUnidadDisplay(producto)} {getMedidaLabel(producto.tipoMedida)}
                     </span>
                   </td>
                   <td>
                     <span className="stock-value">
                       {producto.stockMinimo} {getMedidaLabel(producto.tipoMedida)}
                     </span>
                   </td>
                   <td>
                     {producto.belowMinStock ? (
                       <span className="stock-status-badge stock-status-bajo">
                         <AlertTriangle size={14} />
                         Bajo
                       </span>
                     ) : (
                       <span className="stock-status-badge stock-status-normal">
                         <Check size={14} />
                         Normal
                       </span>
                     )}
                   </td>
                   <td className="stock-actions-cell">
                     <div className="stock-actions">
                       <button
                         className="stock-action-btn stock-action-quitar"
                         onClick={() => handleOpenStockModal(producto, 'quitar')}
                         title="Reducir stock"
                       >
                         <ArrowDownCircle size={18} />
                       </button>
                       <button
                         className="stock-action-btn stock-action-edit"
                         onClick={() => handleOpenModal(producto)}
                         title="Editar producto"
                       >
                         <Edit size={18} />
                       </button>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         )}
       </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="stock-modal-overlay" onClick={handleCloseModal}>
          <div className="stock-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="stock-modal-header">
              <h2>{esNuevo ? 'Nuevo Producto' : 'Editar Producto'}</h2>
              <button className="stock-modal-close" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="stock-form">
              <div className="stock-form-group">
                <label>Nombre del Producto</label>
                <input
                  type="text"
                  name="nombreAlimento"
                  value={formData.nombreAlimento}
                  onChange={handleInputChange}
                  placeholder="Ej: Arroz, Aceite, Leche"
                  required
                  className="stock-input"
                />
              </div>
              
              <div className="stock-form-row">
                <div className="stock-form-group">
                  <label>Tipo de Medida</label>
                  <select
                    name="tipoMedida"
                    value={formData.tipoMedida}
                    onChange={handleInputChange}
                    className="stock-select"
                  >
                    <option value="KILO">Kilo (kg)</option>
                    <option value="LITRO">Litro (L)</option>
                    <option value="UNIDAD">Unidad (und)</option>
                  </select>
                </div>

                <div className="stock-form-group">
                  <label>Tipo de Producto</label>
                  <select
                    name="idTipo"
                    value={formData.idTipo}
                    onChange={handleInputChange}
                    className="stock-select"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="1">Proteínas</option>
                    <option value="2">Condimentos</option>
                    <option value="3">Vegetales</option>
                    <option value="4">Frutas</option>
                    <option value="5">Granos</option>
                    <option value="6">Lácteos</option>
                    <option value="7">Bebidas</option>
                    <option value="8">Congelados</option>
                    <option value="9">Enlatados</option>
                    <option value="10">Especias</option>
                  </select>
                </div>
              </div>
              
              <div className="stock-form-row">
                <div className="stock-form-group">
                  <label>Stock Mínimo</label>
                  <input
                    type="number"
                    name="stockMinimo"
                    value={formData.stockMinimo}
                    onChange={handleInputChange}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    required
                    className="stock-input"
                  />
                </div>
              </div>
              
              <div className="stock-form-actions">
                <button type="button" className="stock-btn-cancel" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="stock-btn-submit">
                  {esNuevo ? 'Crear Producto' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Modal */}
      {showStockModal && (
        <div className="stock-modal-overlay" onClick={handleCloseStockModal}>
          <div className="stock-modal-content stock-modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="stock-modal-header">
              <h2>
                {stockAction === 'agregar' ? 'Agregar Stock' : 'Quitar Stock'}
              </h2>
              <button className="stock-modal-close" onClick={handleCloseStockModal}>
                <X size={24} />
              </button>
            </div>
            
            <div className="stock-modal-body">
              <p className="stock-product-info">
                <strong>Producto:</strong> {productoStock?.nombreAlimento}
              </p>
              <p className="stock-product-info">
                <strong>Stock Actual:</strong> {productoStock?.stockActual} {getMedidaLabel(productoStock?.tipoMedida)}
              </p>
            </div>
            
            <form onSubmit={handleStockSubmit} className="stock-form">
              <div className="stock-form-group">
                <label>Cantidad a {stockAction === 'agregar' ? 'agregar' : 'quitar'}</label>
                <input
                  type="number"
                  value={stockCantidad}
                  onChange={(e) => setStockCantidad(e.target.value)}
                  placeholder="0"
                  step="0.01"
                  min="0"
                  required
                  className="stock-input"
                />
              </div>
              
              <div className="stock-form-actions">
                <button type="button" className="stock-btn-cancel" onClick={handleCloseStockModal}>
                  Cancelar
                </button>
                <button type="submit" className={`stock-btn-submit ${stockAction === 'agregar' ? 'stock-btn-agregar' : 'stock-btn-quitar'}`}>
                  {stockAction === 'agregar' ? 'Agregar' : 'Quitar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;
