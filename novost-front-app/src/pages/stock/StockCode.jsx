import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Package } from 'lucide-react';
import './stock.css';
import inventario from '../../assets/images/Inventario.jpg';

const StockCode = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const CORRECT_CODE = '12345';

  useEffect(() => {
    // Verificar si el usuario ya tiene acceso al stock
    const hasStockAccess = sessionStorage.getItem('stockAccess') === 'true';
    if (hasStockAccess) {
      navigate('/stock');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (code === CORRECT_CODE) {
      // Guardar en sessionStorage que el usuario tiene acceso
      sessionStorage.setItem('stockAccess', 'true');
      navigate('/stock');
    } else {
      toast.error('Código incorrecto. Intente de nuevo.');
      setCode('');
    }
  };

  const handleCancel = () => {
    navigate('/worker-home');
  };

  const handleBack = () => {
    navigate('/worker-home');
  };

  return (
    <div className="stock-code-page">
      {/* Sección de imagen (visible en desktop) */}
      <div className="stock-code-image-section">
        <img 
          src={inventario} 
          alt="Control de Stock" 
          className="stock-code-bg-image"
        />
        <div className="stock-code-overlay"></div>
        <div className="stock-code-branding">
          <h1>Novost</h1>
          <p>Control de Inventario</p>
        </div>
      </div>

      {/* Sección del formulario */}
      <div className="stock-code-form-section">
        <div className="stock-code-form-container">
          <a onClick={handleBack} className="stock-code-back">
            <ArrowLeft size={18} />
            <span>Volver</span>
          </a>

          <div className="stock-code-header">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Package size={48} color="#8a2be2" />
            </div>
            <h2>Control de Stock</h2>
            <p>Ingrese el código de acceso para continuar</p>
          </div>
          
          <form className="stock-code-form" onSubmit={handleSubmit}>
            <div className="stock-code-input-group">
              <label htmlFor="stockCode">Código de Acceso</label>
              <div className="stock-code-input-wrapper">
                <input
                  id="stockCode"
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ingrese su código"
                  className="stock-code-input"
                  required
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div className="stock-code-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="stock-code-btn stock-code-btn-cancel"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="stock-code-btn stock-code-btn-access"
              >
                Acceder
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockCode;
