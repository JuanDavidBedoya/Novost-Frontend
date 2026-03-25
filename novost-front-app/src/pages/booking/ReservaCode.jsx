import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, CalendarCheck } from 'lucide-react'; 
import '../stock/stock.css'; 
import reservasImg from '../../assets/images/Reserva.jpg'; 

const ReservaCode = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const CORRECT_CODE = '54321'; //PIN para reservas

  useEffect(() => {
    // Verificar si el usuario ya tiene acceso a las reservas
    const hasReservaAccess = sessionStorage.getItem('reservaAccess') === 'true';
    if (hasReservaAccess) {
      navigate('/gestionar-reservas', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (code === CORRECT_CODE) {
      // Guardar en sessionStorage que el usuario tiene acceso
      sessionStorage.setItem('reservaAccess', 'true');
      navigate('/gestionar-reservas', { replace: true });
    } else {
      toast.error('Código incorrecto. Intente de nuevo.');
      setCode('');
    }
  };

  const handleCancel = () => {
    // Redirige según sea necesario, asumo worker-home como en stock
    navigate('/worker-home'); 
  };

  const handleBack = () => {
    navigate('/worker-home');
  };

  return (
    <div className="stock-code-page">
      {/* Sección de imagen */}
      <div className="stock-code-image-section">
        <img 
          src={reservasImg} 
          alt="Gestión de Reservas" 
          className="stock-code-bg-image"
        />
        <div className="stock-code-overlay"></div>
        <div className="stock-code-branding">
          <h1>Novost</h1>
          <p>Gestión de Reservas</p>
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
              <CalendarCheck size={48} color="#8a2be2" />
            </div>
            <h2>Gestión de Reservas</h2>
            <p>Ingrese el código de seguridad para continuar</p>
          </div>
          
          <form className="stock-code-form" onSubmit={handleSubmit}>
            <div className="stock-code-input-group">
              <label htmlFor="reservaCode">Código de Acceso</label>
              <div className="stock-code-input-wrapper">
                <input
                  id="reservaCode"
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

export default ReservaCode;