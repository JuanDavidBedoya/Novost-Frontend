import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  ShoppingCart, 
  ArrowLeft, 
  Plus,
  History,
  Package
} from 'lucide-react';
import api from '../../api/apiConfig';
import { showErrorToast } from '../../lib/errorHandler';
import './EntradaCompra.css';

const EntradaCompra = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    idAlimento: '',
    cantidad: '',
    fechaVencimiento: '',
    lote: '',
    precioCompra: '',
    proveedor: ''
  });

  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    cargarProductos();
    cargarHistorialSesion();
  }, []);

  const cargarHistorialSesion = () => {
    const historialGuardado = localStorage.getItem('historialEntradas') || '[]';
    setHistorial(JSON.parse(historialGuardado));
  };

  const cargarProductos = async () => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const precioTotal = parseFloat(formData.precioCompra) || 0;
      const cantidad = parseFloat(formData.cantidad) || 0;
      const idAlimento = parseInt(formData.idAlimento);
      const productoSeleccionado = productos.find(p => p.idAlimento === idAlimento);
      
      const cedulaTrabajador = localStorage.getItem('cedula') || '';
      
      await api.post('/inventario/entradas', {
        idAlimento: idAlimento,
        cantidad: cantidad,
        fechaVencimiento: formData.fechaVencimiento,
        lote: formData.lote,
        precioCompra: precioTotal,
        proveedor: formData.proveedor,
        cedulaTrabajador: cedulaTrabajador
      });
      
      const nuevoHistorial = {
        id: Date.now(),
        nombreAlimento: productoSeleccionado?.nombreAlimento || '',
        cantidad: cantidad,
        precioCompra: precioTotal,
        fecha: new Date().toISOString(),
        cedulaTrabajador: cedulaTrabajador
      };
      
      const historialActualizado = [...historial, nuevoHistorial];
      setHistorial(historialActualizado);
      localStorage.setItem('historialEntradas', JSON.stringify(historialActualizado));
      
      toast.success('Entrada de compra registrada exitosamente');
      
      setFormData({
        idAlimento: '',
        cantidad: '',
        fechaVencimiento: '',
        lote: '',
        precioCompra: '',
        proveedor: ''
      });
      setShowModal(false);
    } catch (error) {
      showErrorToast(error);
    }
  };

  const getUnidadDisplay = (tipoMedida) => {
    const labels = { KILO: 'kg', LITRO: 'L', UNIDAD: 'und' };
    return labels[tipoMedida] || tipoMedida;
  };

  if (loading) {
    return (
      <div className="entrada-loading">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="entrada-page-container">
      {/* Header */}
      <div className="entrada-page-header">
        <button onClick={() => navigate('/stock')} className="entrada-back-button">
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        <div className="entrada-header-content">
          <h1>
            <ShoppingCart size={32} />
            Entrada de Compra
          </h1>
          <p>Registra nuevas entradas de productos al inventario</p>
        </div>
      </div>

      {/* Botón principal */}
      <div className="entrada-actions-section">
        <button 
          className="entrada-add-button"
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} />
          <span>Registrar Nueva Entrada</span>
        </button>
      </div>

      {/* Historial Table */}
      <div className="entrada-table-container">
        {historial.length === 0 ? (
          <div className="entrada-empty">
            <ShoppingCart size={48} />
            <h3>No hay entradas registradas</h3>
            <p>Registra tu primera entrada de compra</p>
          </div>
        ) : (
          <table className="entrada-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Total</th>
                <th>Cédula Trabajador</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {historial.map(item => (
                <tr key={item.id}>
                  <td className="entrada-product-name">
                    <strong>{item.nombreAlimento}</strong>
                  </td>
                  <td>
                    <span className="entrada-value">
                      {item.cantidad}
                    </span>
                  </td>
                  <td>
                    <span className="entrada-value">
                      ${item.precioCompra.toFixed(2)}
                    </span>
                  </td>
                  <td>{item.cedulaTrabajador}</td>
                  <td>{new Date(item.fecha).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="entrada-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="entrada-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="entrada-modal-header">
              <h2>Nueva Entrada de Compra</h2>
              <button className="entrada-modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="entrada-form">
              <div className="entrada-form-row">
                <div className="entrada-form-group">
                  <label>Producto *</label>
                  <select
                    name="idAlimento"
                    value={formData.idAlimento}
                    onChange={handleInputChange}
                    required
                    className="entrada-select"
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map(p => (
                      <option key={p.idAlimento} value={p.idAlimento}>
                        {p.nombreAlimento} ({getUnidadDisplay(p.tipoMedida)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="entrada-form-group">
                  <label>Cantidad *</label>
                  <input
                    type="number"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="entrada-input"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="entrada-form-row">
                <div className="entrada-form-group">
                  <label>Fecha de Vencimiento *</label>
                  <input
                    type="date"
                    name="fechaVencimiento"
                    value={formData.fechaVencimiento}
                    onChange={handleInputChange}
                    required
                    className="entrada-input"
                  />
                </div>

                <div className="entrada-form-group">
                  <label>Lote</label>
                  <input
                    type="text"
                    name="lote"
                    value={formData.lote}
                    onChange={handleInputChange}
                    placeholder="Lote o referencia"
                    className="entrada-input"
                  />
                </div>
              </div>

              <div className="entrada-form-row">
                <div className="entrada-form-group">
                  <label>Precio Total *</label>
                  <input
                    type="number"
                    name="precioCompra"
                    value={formData.precioCompra}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="entrada-input"
                    placeholder="0.00"
                  />
                </div>

                <div className="entrada-form-group">
                  <label>Proveedor</label>
                  <input
                    type="text"
                    name="proveedor"
                    value={formData.proveedor}
                    onChange={handleInputChange}
                    placeholder="Nombre del proveedor"
                    className="entrada-input"
                  />
                </div>
              </div>

              <div className="entrada-form-actions">
                <button type="button" className="entrada-btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="entrada-btn-submit">
                  Registrar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntradaCompra;
