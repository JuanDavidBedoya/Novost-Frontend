import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import api from '../../api/apiConfig'; 
import './Profile.css'; 
import restaurantImg from '../../assets/images/restaurant.jpg';

const ChangePassword = () => {
  const navigate = useNavigate();
  
  // Asumimos que la cédula está guardada
  const cedulaUsuario = localStorage.getItem('cedula') || '1234567890'; 

  const [formData, setFormData] = useState({
    contrasenaAnterior: '',
    contrasenaNueva: ''
  });

  const [errors, setErrors] = useState({});
  const [showPasswordAnterior, setShowPasswordAnterior] = useState(false);
  const [showPasswordNueva, setShowPasswordNueva] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 4000); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      await api.put(`/usuarios/${cedulaUsuario}/password`, formData);
      
      showToast("✅ Contraseña actualizada exitosamente.");
      setTimeout(() => {
        navigate('/profile'); // Devolvemos al usuario al perfil
      }, 2000);

    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        showToast("❌ Ocurrió un error al cambiar la contraseña");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <Helmet>
        <title>Novost - Cambiar Contraseña</title>
      </Helmet>

      <div className="login-image-section">
        <div className="login-image-overlay"></div>
        <img
          src={restaurantImg}
          alt="Elegante interior del restaurante Novost"
          className="login-bg-image"
        />
        <div className="login-branding">
          <h1>Novost</h1>
          <p>La elegancia y la mejor comida en un solo lugar</p>
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-form-container">

          <div className="login-header">
            <button 
              onClick={() => navigate('/profile')} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '10px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
            >
              <ArrowLeft size={18} style={{ marginRight: '5px' }}/> Volver al perfil
            </button>
            <h2>Seguridad</h2>
            <p>Actualiza tu contraseña de acceso</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>

            <div className="form-group">
              <label htmlFor="contrasenaAnterior">Contraseña Actual</label>
              <div className="input-wrapper">
                <input
                  id="contrasenaAnterior"
                  name="contrasenaAnterior"
                  type={showPasswordAnterior ? 'text' : 'password'}
                  className={`form-input password-input ${errors.contrasenaAnterior ? 'input-error' : ''}`}
                  placeholder="Ingresa tu contraseña actual"
                  value={formData.contrasenaAnterior}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPasswordAnterior(!showPasswordAnterior)}
                  disabled={loading}
                >
                  {showPasswordAnterior ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.contrasenaAnterior && <span className="error-message">{errors.contrasenaAnterior}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="contrasenaNueva">Nueva Contraseña</label>
              <div className="input-wrapper">
                <input
                  id="contrasenaNueva"
                  name="contrasenaNueva"
                  type={showPasswordNueva ? 'text' : 'password'}
                  className={`form-input password-input ${errors.contrasenaNueva ? 'input-error' : ''}`}
                  placeholder="Mínimo 8 caracteres"
                  value={formData.contrasenaNueva}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPasswordNueva(!showPasswordNueva)}
                  disabled={loading}
                >
                  {showPasswordNueva ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.contrasenaNueva && <span className="error-message">{errors.contrasenaNueva}</span>}
            </div>

            {errors.general && <span className="error-message general-error">{errors.general}</span>}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar Contraseña"}
            </button>

          </form>
        </div>

        {toastMessage && (
          <div className="toast-notification">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;