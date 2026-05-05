// Página de recuperación de contraseña con validación y manejo de errores

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet';
import api from '../../api/apiConfig'; 
import './Auth.css';
import restaurantImg from '../../assets/images/Restart.jpg'; 
import { toast } from 'react-toastify';
import { showErrorToast, handleFormErrors, getErrorMessage } from '../../lib/errorHandler';

// Estado: email, errores de validación, mensaje toast, loading y bandera de éxito

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Función auxiliar: muestra mensaje toast temporal

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Función handleSubmit: envía solicitud de recuperación, maneja errores de validación y muestra feedback

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await api.post('/auth/recobrar-password', { email });
      setSuccess(true);
      showToast("Enlace enviado a tu correo");
    } catch (error) {
      const hasFormErrors = handleFormErrors(error, setErrors);
      if (!hasFormErrors) {
        const message = getErrorMessage(error);
        showToast(`Error al procesar la solicitud: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <Helmet>
        <title>Novost - Recuperar Contraseña</title>
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
            <button 
              onClick={() => navigate('/login')} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '10px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
            >
              <ArrowLeft size={18} style={{ marginRight: '5px' }}/> Volver al Login
            </button>
            <h2>Recuperar Contraseña</h2>
            <p>Ingresa tu correo para recibir un enlace de recuperación</p>
          </div>

          {!success ? (
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    type="email"
                    className={`auth-input ${errors.email ? 'input-error' : ''}`}
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                    disabled={loading}
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              {errors.general && <span className="error-message general-error">{errors.general}</span>}

              <button type="submit" className="auth-submit-button" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Enlace'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h3>¡Revisa tu bandeja de entrada!</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                Hemos enviado un enlace de recuperación a <strong>{email}</strong>.
              </p>
            </div>
          )}
        </div>
        {toastMessage && <div className="toast-notification">{toastMessage}</div>}
      </div>
    </div>
  );
};

export default ForgotPassword;