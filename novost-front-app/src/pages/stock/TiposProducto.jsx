import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { 
  Package, 
  Plus, 
  Search, 
  ArrowLeft,
  Edit,
  Trash2,
  X,
  Tags,
  ShoppingCart,
  Calendar
} from 'lucide-react';
import api from '../../api/apiConfig';
import { showErrorToast } from '../../lib/errorHandler';
import './TiposProducto.css';

const TiposProducto = () => {
  const navigate = useNavigate();
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tipoEditando, setTipoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombreTipo: '',
    descripcion: ''
  });

  const userRole = localStorage.getItem('rol');

  useEffect(() => {
    cargarTipos();
  }, []);

  const cargarTipos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inventario/tipos');
      setTipos(response.data);
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTipos = tipos.filter(tipo => 
    tipo.nombreTipo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOpenModal = (tipo = null) => {
    if (tipo) {
      setTipoEditando(tipo);
      setFormData({
        nombreTipo: tipo.nombreTipo,
        descripcion: tipo.descripcion || ''
      });
    } else {
      setTipoEditando(null);
      setFormData({ nombreTipo: '', descripcion: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTipoEditando(null);
    setFormData({ nombreTipo: '', descripcion: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (tipoEditando) {
        await api.put(`/inventario/tipos/${tipoEditando.idTipo}`, formData);
        toast.success('Tipo actualizado exitosamente');
      } else {
        await api.post('/inventario/tipos', formData);
        toast.success('Tipo creado exitosamente');
      }
      handleCloseModal();
      cargarTipos();
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleDelete = async (tipo) => {
    const result = await Swal.fire({
      title: '¿Eliminar tipo?',
      text: `¿Estás seguro de eliminar el tipo "${tipo.nombreTipo}"?`,
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
      await api.delete(`/inventario/tipos/${tipo.idTipo}`);
      toast.success('Tipo eliminado exitosamente');
      cargarTipos();
    } catch (error) {
      showErrorToast(error);
    }
  };

  if (loading) {
    return (
      <div className="tipos-loading">
        <div className="spinner"></div>
        <p>Cargando tipos...</p>
      </div>
    );
  }

  return (
    <div className="tipos-page-container">
      {/* Header */}
      <div className="tipos-page-header">
        <button onClick={() => navigate('/stock')} className="tipos-back-button">
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        <div className="tipos-header-content">
          <h1>
            <Tags size={32} />
            Tipos de Productos
          </h1>
          <p>Gestiona las categorías de productos del inventario</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="tipos-filters-section">
        <div className="tipos-search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Buscar tipo..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button className="tipos-add-button" onClick={() => handleOpenModal()}>
          <Plus size={20} />
          <span>Nuevo Tipo</span>
        </button>
      </div>

      {/* Tipos Grid */}
      <div className="tipos-grid">
        {loading ? (
          <div className="tipos-loading-state">
            <div className="spinner"></div>
            <p>Cargando tipos...</p>
          </div>
        ) : filteredTipos.length === 0 ? (
          <div className="tipos-empty-state">
            <Tags size={48} />
            <h3>No se encontraron tipos</h3>
            <p>Intenta con otro término de búsqueda</p>
          </div>
        ) : (
          filteredTipos.map(tipo => (
            <div key={tipo.idTipo} className="tipo-card" onClick={() => navigate(`/stock/tipo/${tipo.idTipo}`)}>
              <div className="tipo-card-header">
                <div className="tipo-icon">
                  <Package size={24} />
                </div>
                <div className="tipo-info">
                  <h3>{tipo.nombreTipo}</h3>
                  {tipo.descripcion && <p className="tipo-descripcion">{tipo.descripcion}</p>}
                  <span className="tipo-count">{tipo.productosCount || 0} productos</span>
                </div>
                {userRole === 'ADMINISTRADOR' && (
                  <div className="tipo-actions">
                    <button 
                      className="tipo-edit-btn"
                      onClick={(e) => { e.stopPropagation(); handleOpenModal(tipo); }}
                      title="Editar tipo"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="tipo-delete-btn"
                      onClick={(e) => { e.stopPropagation(); handleDelete(tipo); }}
                      title="Eliminar tipo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div className="tipo-card-footer">
                <span className="tipo-ver-productos">Ver productos →</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="tipos-modal-overlay" onClick={handleCloseModal}>
          <div className="tipos-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="tipos-modal-header">
              <h2>{tipoEditando ? 'Editar Tipo' : 'Nuevo Tipo'}</h2>
              <button className="tipos-modal-close" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="tipos-form">
              <div className="tipos-form-group">
                <label>Nombre del Tipo</label>
                <input
                  type="text"
                  name="nombreTipo"
                  value={formData.nombreTipo}
                  onChange={handleInputChange}
                  required
                  className="tipos-input"
                  placeholder="Ej: Proteínas, Vegetales..."
                />
              </div>
              <div className="tipos-form-group">
                <label>Descripción (opcional)</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="tipos-textarea"
                  placeholder="Descripción del tipo..."
                  rows="3"
                />
              </div>
              <div className="tipos-form-actions">
                <button type="button" className="tipos-btn-cancel" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="tipos-btn-submit">
                  {tipoEditando ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiposProducto;
