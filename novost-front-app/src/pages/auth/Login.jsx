import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet';
import api from '../../api/apiConfig'; 
import './Auth.css';
import restaurantImg from '../../assets/images/Login.jpg';
import { handleFormErrors, getErrorMessage } from '../../lib/errorHandler';
import ga4 from 'react-ga4'

// Página de login con autenticación de dos factores (2FA) y tracking de eventos

const Login = () => {
  const navigate = useNavigate();

  // Estado: credenciales (email, password, código 2FA), errores, visibilidad de contraseña, paso del flujo y timestamp

  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [codigoVerificacion, setCodigoVerificacion] = useState('');
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [paso, setPaso] = useState(1); 

  const [startTime, setStartTime] = useState(null);

  // Funciones de cambio de input: actualizan estado y limpian errores asociados al campo

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if(errors.email) setErrors(prev => ({ ...prev, email: '' }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if(errors.password) setErrors(prev => ({ ...prev, password: '' }));
  };

  const handleCodigoChange = (e) => {
    setCodigoVerificacion(e.target.value);
    if(errors.codigo) setErrors(prev => ({ ...prev, codigo: '' }));
  };

  // Función auxiliar: muestra mensaje toast temporal

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Función handleLoginSubmit: valida credenciales, mide tiempo de respuesta, registra evento GA4 y avanza a paso 2FA

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    ga4.event('login_attempt', { method: 'email_password' });
    // Inicia cronómetro para RNF-02 (Fiabilidad)
    const requestStart = performance.now();

    try {
      const response = await api.post('/auth/login', { email, password });
      const requestEnd = performance.now();
      const duration = (requestEnd - requestStart) / 1000; // Segundos

      ga4.event('2fa_interface_load', { 
        duration_seconds: duration,
        status: 'success'
      });
      showToast("Correcto " + response.data); 
      setPaso(2); 
    } catch (error) {
      const message = getErrorMessage(error);
      
      // RNF-04 (Mantenibilidad): Registrar el error exacto
      ga4.event('login_failed', { 
        error_reason: message || 'unknown_error',
        browser: navigator.userAgent // Ayuda a RNF-01
      });
      const hasFormErrors = handleFormErrors(error, setErrors);
      if (!hasFormErrors) {
        const message = getErrorMessage(error);
        showToast(`Error: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Función handleVerificarCodigo: verifica código 2FA, almacena token/usuario y redirige según rol

  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post('/auth/verificar-login', { 
          email, codigo: codigoVerificacion 
      });
      const { token, user, reactivada } = response.data; // <-- leer reactivada

      // Si la cuenta fue reactivada, guardar bandera para mostrarla en Home
      if (reactivada) {
        sessionStorage.setItem('mostrarBienvenidaDeVuelta', 'true');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('cedula', user.cedula);
      localStorage.setItem('usuario', JSON.stringify(user));

      switch (user.rol) {
        case 'ADMINISTRADOR': navigate('/admin-home'); break;
        case 'TRABAJADOR':    navigate('/worker-home'); break;
        default:              navigate('/home'); break;
      }
    } catch (error) {

      ga4.event('2fa_failed', { 
         error_reason: getErrorMessage(error) 
       });
       
      const hasFormErrors = handleFormErrors(error, setErrors);
      if (!hasFormErrors) {
        const message = getErrorMessage(error);
        showToast(`Error: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <Helmet>
        <title>Novost - Iniciar Sesión</title>
        <meta name="description" content="Inicia sesión en Novost." />
      </Helmet>

      <div className="auth-image-section">
        <div className="auth-image-overlay"></div>
        <img
          src={restaurantImg}
          alt="Elegante interior del restaurante Novost"
          className="auth-bg-image"
        />
        <div className="auth-branding">
          <h1>Novost</h1>
          <p>La elegancia y la mejor comida en un solo lugar</p>
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-form-container">

          {paso === 1 && (
            <div className="auth-tabs">
              <button type="button" className="auth-tab active">
                Iniciar Sesión
              </button>
              <button
                type="button"
                className="auth-tab inactive"
                onClick={() => navigate('/register')}
              >
                Registrarse
              </button>
            </div>
          )}

          <div className="auth-header">
            {paso === 1 ? (
              <>
                <h2>Bienvenido de Vuelta!</h2>
                <p>Ingrese sus datos para iniciar sesión</p>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setPaso(1)} 
                  className="auth-link-secondary"
                  style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}
                >
                  <ArrowLeft size={18} style={{ marginRight: '5px' }}/> Volver
                </button>
                <h2>Verificación Requerida</h2>
                <p>Hemos enviado un código a <strong>{email}</strong> </p>
                <p>(Puede ser necesario que revise su bandeja de Spam)</p>
              </>
            )}
          </div>

          {paso === 1 ? (
            <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    type="email"
                    className={`auth-input ${errors.email ? 'input-error' : ''}`}
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={handleEmailChange}
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`auth-input ${errors.password ? 'input-error' : ''}`}
                    style={{ paddingRight: '3rem' }}
                    placeholder="Ingrese su Contraseña"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <button
                type="button"
                className="auth-link-secondary"
                style={{ alignSelf: 'flex-end', fontSize: '0.875rem' }}
                onClick={() => navigate('/forgot-password')}
              >
                ¿Olvidó su contraseña?
              </button>

              <button type="submit" className="auth-submit-button" disabled={loading}>
                {loading ? 'Procesando...' : 'Continuar'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleVerificarCodigo} noValidate>
              <div className="form-group">
                <label htmlFor="codigo">Código de Verificación</label>
                <div className="input-wrapper">
                  <input
                    id="codigo"
                    type="text"
                    className={`auth-input ${errors.codigo ? 'input-error' : ''}`}
                    placeholder="Ingrese el código de 6 dígitos"
                    value={codigoVerificacion}
                    onChange={handleCodigoChange}
                    style={{ textAlign: 'center', letterSpacing: '0.2px', fontSize: '1.2rem' }}
                  />
                </div>
                {errors.codigo && <span className="error-message">{errors.codigo}</span>}
              </div>

              <button type="submit" className="auth-submit-button" disabled={loading}>
                {loading ? 'Verificando...' : 'Continuar'}
              </button>
            </form>
          )}

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

export default Login;