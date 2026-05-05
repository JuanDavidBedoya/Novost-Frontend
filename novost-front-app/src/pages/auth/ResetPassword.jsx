import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Helmet } from 'react-helmet';
import api from '../../api/apiConfig'; 
import './Auth.css';
import restaurantImg from '../../assets/images/Restart.jpg'; 
import { toast } from 'react-toastify';
import { showErrorToast, handleFormErrors, getErrorMessage } from '../../lib/errorHandler';

// Página para resetear contraseña usando token de recuperación

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extrae token de los parámetros de URL para validar solicitud de reset

  const token = searchParams.get('token'); 

  // Estado: nueva contraseña, errores, visibilidad de contraseña, mensaje toast y loading

  const [nuevaContrasenia, setNuevaContrasenia] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Función auxiliar: muestra mensaje toast temporal

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Función handleSubmit: envía nueva contraseña con token, valida respuesta y redirige al login

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await api.post('/auth/resetear-password', { token, nuevaContrasenia });
      showToast("Contraseña restaurada exitosamente");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const hasFormErrors = handleFormErrors(error, setErrors);
      if (!hasFormErrors) {
        const message = getErrorMessage(error);
        showToast(`Error al restaurar la contraseña: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div className="auth-form-container">
          <h2 style={{ color: 'var(--error-color)' }}>Enlace inválido</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Falta el token de recuperación o el enlace ha expirado.</p>
          <button onClick={() => navigate('/login')} className="auth-submit-button" style={{ marginTop: '2rem' }}>
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-container">
      <Helmet>
        <title>Novost - Restaurar Contraseña</title>
      </Helmet>

      <div className="auth-image-section">
        <div className="auth-image-overlay"></div>
        <img src={restaurantImg} alt="Restaurante Novost" className="auth-bg-image" />
        <div className="auth-branding">
          <h1>Novost</h1>
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-header">
            <h2>Restablecer Contraseña</h2>
            <p>Ingresa tu nueva contraseña para acceder</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="nuevaContrasenia">Nueva Contraseña</label>
              <div className="input-wrapper">
                <input
                  id="nuevaContrasenia"
                  type={showPassword ? 'text' : 'password'}
                  className={`auth-input ${errors.nuevaContrasenia ? 'input-error' : ''}`}
                  style={{ paddingRight: '3rem' }}
                  placeholder="Mínimo 8 caracteres"
                  value={nuevaContrasenia}
                  onChange={(e) => { setNuevaContrasenia(e.target.value); setErrors({}); }}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.nuevaContrasenia && <span className="error-message">{errors.nuevaContrasenia}</span>}
            </div>

            {errors.general && <span className="error-message general-error">{errors.general}</span>}

            <button type="submit" className="auth-submit-button" disabled={loading}>
              {loading ? 'Restaurando...' : 'Restaurar Contraseña'}
            </button>
          </form>
        </div>
        {toastMessage && <div className="toast-notification">{toastMessage}</div>}
      </div>
    </div>
  );
};

export default ResetPassword;