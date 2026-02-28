import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Helmet } from 'react-helmet';
import api from '../../api/apiConfig';
// Asegúrate de que la ruta apunte correctamente a tu Auth.css
import './Auth.css'; 
import restaurantImg from '../../assets/images/restaurant.jpg';

const RegistrarTrabajador = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    telefono: '',
    email: '',
    password: '' 
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
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
      const payload = {
        cedula: formData.cedula,
        nombre: formData.nombre,
        telefono: formData.telefono,
        email: formData.email,
        contrasena: formData.password
      };

      // Llamamos al nuevo endpoint del backend
      await api.post('/auth/registrar-trabajador', payload);
      
      showToast("✅ Trabajador registrado exitosamente.");
      
      // Limpiamos el formulario para registrar a otro si es necesario
      setFormData({ cedula: '', nombre: '', telefono: '', email: '', password: '' });

    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        showToast("❌ Error de conexión con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <Helmet>
        <title>Novost Admin - Registrar Trabajador</title>
      </Helmet>

      <div className="auth-image-section">
        <div className="auth-image-overlay" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.9) 100%)' }}></div>
        <img
            src={restaurantImg}
            alt="Fondo Novost"
            className="auth-bg-image"
        />
        <div className="auth-branding">
          <ShieldCheck size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
          <h1>Portal Administrativo</h1>
          <p>Gestión interna de personal</p>
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-header">
            <button 
              onClick={() => navigate('/')} // Ajusta esta ruta al dashboard del admin
              className="auth-link-secondary"
              style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}
            >
              <ArrowLeft size={18} style={{ marginRight: '5px' }}/> Volver al Panel
            </button>
            <h2>Alta de Trabajador</h2>
            <p>Ingresa los datos del nuevo empleado. Se le enviará un correo con su acceso.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            
            <div className="form-group">
              <label htmlFor="cedula">Cédula del Empleado</label>
              <input
                id="cedula"
                name="cedula"
                type="text"
                className={`auth-input ${errors.cedula ? 'input-error' : ''}`}
                placeholder="Ej: 1234567890"
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
                placeholder="Ej: María López"
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
                placeholder="Ej: 3001234567"
                value={formData.telefono}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.telefono && <span className="error-message">{errors.telefono}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Institucional / Personal</label>
              <input
                id="email"
                name="email"
                type="email"
                className={`auth-input ${errors.email ? 'input-error' : ''}`}
                placeholder="Ej: correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Asignar Contraseña Temporal</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`auth-input ${errors.contrasena ? 'input-error' : ''}`}
                  style={{ paddingRight: '3rem' }}
                  placeholder="Contraseña segura"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.contrasena && <span className="error-message">{errors.contrasena}</span>}
            </div>

            {errors.general && <span className="error-message general-error">{errors.general}</span>}

            <button type="submit" className="auth-submit-button" disabled={loading}>
              {loading ? "Registrando..." : "Crear Perfil de Trabajador"}
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

export default RegistrarTrabajador;