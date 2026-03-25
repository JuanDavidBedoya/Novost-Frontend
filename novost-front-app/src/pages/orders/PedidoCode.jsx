import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import reserva from '../../assets/images/Reserva.jpg'; 

const PedidoCode = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const CORRECT_CODE = '15243'; // Cambia al código real

  useEffect(() => {
    const hasPedidoAccess = sessionStorage.getItem('pedidoAccess') === 'true';
    if (hasPedidoAccess) {
      // ✅ replace:true evita que /gestionar-pedidos-code quede en el historial
      navigate('/gestionar-pedidos', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === CORRECT_CODE) {
      sessionStorage.setItem('pedidoAccess', 'true');
      navigate('/gestionar-pedidos', { replace: true });
    } else {
      toast.error('Código incorrecto. Intente de nuevo.');
      setCode('');
    }
  };

  const handleBack = () => {
    navigate('/worker-home');
  };

  return (
    <div className="stock-code-page">
      <div className="stock-code-image-section">
        <img
          src={reserva}
          alt="Gestión de Pedidos"
          className="stock-code-bg-image"
        />
        <div className="stock-code-overlay"></div>
        <div className="stock-code-branding">
          <h1>Novost</h1>
          <p>Gestión de Pedidos</p>
        </div>
      </div>

      {/* Sección del formulario */}
      <div className="stock-code-form-section">
        <div className="stock-code-form-container">
          <a onClick={handleBack} className="stock-code-back" style={{ cursor: 'pointer' }}>
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
              <ClipboardList size={48} color="#8a2be2" />
            </div>
            <h2>Gestión de Pedidos</h2>
            <p>Ingrese el código de seguridad para continuar</p>
          </div>

          <form className="stock-code-form" onSubmit={handleSubmit}>
            <div className="stock-code-input-group">
              <label htmlFor="pedidoCode">Código de Acceso</label>
              <div className="stock-code-input-wrapper">
                <input
                  id="pedidoCode"
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ingrese el PIN"
                  className="stock-code-input"
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="stock-code-actions">
              <button
                type="button"
                onClick={handleBack}
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

export default PedidoCode;