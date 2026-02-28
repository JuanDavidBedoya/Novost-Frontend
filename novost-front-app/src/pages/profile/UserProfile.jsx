import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import api from '../../api/apiConfig'; 
import './Profile.css'; 
import restaurantImg from '../../assets/images/restaurant.jpg';

const UserProfile = () => {
  const navigate = useNavigate();

  // Obtenemos la cédula del localStorage
  const cedulaUsuario = localStorage.getItem('cedula'); 

  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '', 
    email: '',
    telefono: ''
  });

  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  // NUEVO: Efecto para cargar los datos al iniciar
  useEffect(() => {
    const fetchUserData = async () => {
      if (!cedulaUsuario) {
        navigate('/login');
        return;
      }
      try {
        const response = await api.get(`/usuarios/${cedulaUsuario}`);
        setFormData({
          cedula: response.data.cedula,
          nombre: response.data.nombre,
          email: response.data.email,
          telefono: response.data.telefono
        });
      } catch (error) {
        showToast("❌ Error al cargar los datos del usuario");
      } finally {
        setFetchingData(false);
      }
    };
    fetchUserData();
  }, [cedulaUsuario, navigate]);

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
      await api.put(`/usuarios/${formData.cedula}`, {
        nombre: formData.nombre,
        telefono: formData.telefono
      });
      showToast("✅ Perfil actualizado exitosamente");
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        showToast("❌ Error al actualizar el perfil");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) return <div className="login-page-container"><p>Cargando perfil...</p></div>;

  return (
    <div className="login-page-container">
      <Helmet>
        <title>Novost - Mi Perfil</title>
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
            <h2>Mi Perfil</h2>
            <p>Consulta y edita tu información personal</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>

            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <div className="input-wrapper">
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  className={`form-input ${errors.nombre ? 'input-error' : ''}`}
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              {errors.nombre && <span className="error-message">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cedula">Cédula</label>
              <div className="input-wrapper">
                <input
                  id="cedula"
                  name="cedula"
                  type="text"
                  className="form-input read-only-input"
                  value={formData.cedula}
                  readOnly
                  disabled
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input read-only-input"
                  value={formData.email}
                  readOnly
                  disabled
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <div className="input-wrapper">
                <input
                  id="telefono"
                  name="telefono"
                  type="text"
                  className={`form-input ${errors.telefono ? 'input-error' : ''}`}
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              {errors.telefono && <span className="error-message">{errors.telefono}</span>}
            </div>

            {errors.general && <span className="error-message general-error">{errors.general}</span>}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>

            <button 
              type="button" 
              className="submit-button secondary-button" 
              onClick={() => navigate('/change-password')}
              style={{ marginTop: '15px', backgroundColor: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}
            >
              Cambiar Contraseña
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

export default UserProfile;