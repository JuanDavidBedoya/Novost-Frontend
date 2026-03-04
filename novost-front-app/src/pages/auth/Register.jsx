import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Helmet } from 'react-helmet';
import api from '../../api/apiConfig';
import './Auth.css';
import restaurantImg from '../../assets/images/Login.jpg';
import { handleFormErrors, getErrorMessage } from '../../lib/errorHandler';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    telefono: '',
    email: '',
    password: '',
    acceptedTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    
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
    if (!formData.acceptedTerms) return;
    setLoading(true);
    setErrors({}); 
    
    try {
      const payload = {
        cedula: formData.cedula,
        nombre: formData.nombre,
        telefono: formData.telefono,
        email: formData.email,
        contrasena: formData.password
      };

      await api.post('/auth/registrar', payload);
      
      showToast("Registro exitoso. Redirigiendo a Iniciar Sesión...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      const hasFormErrors = handleFormErrors(error, setErrors);
      if (!hasFormErrors) {
        const message = getErrorMessage(error);
        showToast(`Error en el registro: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <Helmet>
        <title>Novost - Registrarse</title>
        <meta name="description" content="Crea tu cuenta en Novost. La elegancia y la mejor comida en un solo lugar." />
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
          <div className="auth-tabs">
            <button
              type="button"
              className="auth-tab inactive"
              onClick={() => navigate('/login')}
            >
              Iniciar Sesión
            </button>
            <button type="button" className="auth-tab active">
              Registrarse
            </button>
          </div>

          <div className="auth-header">
            <h2>Bienvenido</h2>
            <p>Completa tus datos para crear tu cuenta</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            
            <div className="form-group">
              <label htmlFor="cedula">Cédula</label>
              <input
                id="cedula"
                name="cedula"
                type="text"
                className={`auth-input ${errors.cedula ? 'input-error' : ''}`}
                placeholder="Cedula"
                value={formData.cedula}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.cedula && <span className="error-message">{errors.cedula}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className={`auth-input ${errors.nombre ? 'input-error' : ''}`}
                placeholder="Juan Pérez"
                value={formData.nombre}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.nombre && <span className="error-message">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                className={`auth-input ${errors.telefono ? 'input-error' : ''}`}
                placeholder="3001234567"
                value={formData.telefono}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.telefono && <span className="error-message">{errors.telefono}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className={`auth-input ${errors.email ? 'input-error' : ''}`}
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`auth-input ${errors.contrasena ? 'input-error' : ''}`}
                  style={{ paddingRight: '3rem' }}
                  placeholder="Crea una contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.contrasena && <span className="error-message">{errors.contrasena}</span>}
            </div>

            <div className="form-group-checkbox">
              <input
                type="checkbox"
                id="acceptedTerms"
                name="acceptedTerms"
                checked={formData.acceptedTerms}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="acceptedTerms">
                Acepto los{' '}
                <a 
                  href="/terminos" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="terms-link"
                >
                  Términos y Condiciones
                </a>
              </label>
            </div>

            {errors.general && <span className="error-message general-error">{errors.general}</span>}

            <button type="submit" className="auth-submit-button" disabled={loading || !formData.acceptedTerms}>
              {loading ? "Procesando..." : "Registrarse"}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              ¿Ya tienes cuenta? 
              <button 
                type="button" 
                className="auth-link-secondary" 
                style={{ marginLeft: '0.5rem', fontWeight: '600' }}
                onClick={() => navigate('/login')} 
                disabled={loading}
              >
                Inicia Sesión
              </button>
            </div>
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

export default Register;