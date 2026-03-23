import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import api from '../../api/apiConfig';
import './Profile.css';
import restaurantImg from '../../assets/images/Profile.jpg';
import { toast } from 'react-toastify';
import { showErrorToast, handleFormErrors, getErrorMessage } from '../../lib/errorHandler';
import { Eye, EyeOff, AlertTriangle, X } from 'lucide-react';

const UserProfile = () => {
  const navigate = useNavigate();
  const cedulaUsuario = localStorage.getItem('cedula');

  const [formData, setFormData] = useState({
    cedula: '', nombre: '', email: '', telefono: ''
  });
  const [initialData, setInitialData] = useState({ nombre: '', telefono: '' });
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  // ── Estado del modal de desactivación ────────────────────────────────────
  const [modalAbierto, setModalAbierto] = useState(false);
  const [contrasenaDesactivar, setContrasenaDesactivar] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [errorContrasena, setErrorContrasena] = useState('');
  const [loadingDesactivar, setLoadingDesactivar] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!cedulaUsuario) { navigate('/login'); return; }
      try {
        const response = await api.get(`/usuarios/${cedulaUsuario}`);
        const data = {
          cedula: response.data.cedula,
          nombre: response.data.nombre,
          email: response.data.email,
          telefono: response.data.telefono
        };
        setFormData(data);
        setInitialData({ nombre: response.data.nombre, telefono: response.data.telefono });
      } catch (error) {
        showErrorToast(error, toast);
      } finally {
        setFetchingData(false);
      }
    };
    fetchUserData();
  }, [cedulaUsuario, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const isModified = formData.nombre !== initialData.nombre ||
                     formData.telefono !== initialData.telefono;

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
      setInitialData({ nombre: formData.nombre, telefono: formData.telefono });
      showToast("✅ Perfil actualizado exitosamente");
    } catch (error) {
      const hasFormErrors = handleFormErrors(error, setErrors);
      if (!hasFormErrors) {
        const message = getErrorMessage(error);
        showToast(`❌ Error al actualizar el perfil: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Lógica del modal ──────────────────────────────────────────────────────
  const abrirModal = () => {
    setContrasenaDesactivar('');
    setErrorContrasena('');
    setMostrarContrasena(false);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (loadingDesactivar) return;
    setModalAbierto(false);
    setContrasenaDesactivar('');
    setErrorContrasena('');
  };

  const handleDesactivar = async () => {
    if (!contrasenaDesactivar.trim()) {
      setErrorContrasena('Ingresa tu contraseña para confirmar.');
      return;
    }

    setLoadingDesactivar(true);
    setErrorContrasena('');

    try {
      await api.patch('/usuarios/desactivar', { contrasena: contrasenaDesactivar });

      // Cuenta desactivada — limpiar sesión y redirigir
      localStorage.clear();
      navigate('/login', { replace: true });
      toast.success('Tu cuenta ha sido desactivada.');

    } catch (error) {
      // El backend responde con { "errores": { "contrasena": "..." } }
      const errores = error.response?.data?.errores;
      if (errores?.contrasena) {
        setErrorContrasena(errores.contrasena);
      } else if (errores?.cuenta) {
        setErrorContrasena(errores.cuenta);
      } else {
        setErrorContrasena('Ocurrió un error inesperado. Intenta de nuevo.');
      }
    } finally {
      setLoadingDesactivar(false);
    }
  };

  if (fetchingData) return (
    <div className="login-page-container"><p>Cargando perfil...</p></div>
  );

  return (
    <div className="login-page-container">
      <Helmet><title>Novost - Mi Perfil</title></Helmet>

      <div className="login-image-section">
        <div className="login-image-overlay"></div>
        <img src={restaurantImg} alt="Elegante interior del restaurante Novost"
          className="login-bg-image" />
        <div className="login-branding">
          <h1>Novost</h1>
          <p>Revisa y actualiza tu perfil</p>
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
                <input id="nombre" name="nombre" type="text"
                  className={`form-input ${errors.nombre ? 'input-error' : ''}`}
                  value={formData.nombre} onChange={handleChange} disabled={loading} />
              </div>
              {errors.nombre && <span className="error-message">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cedula">Cédula</label>
              <div className="input-wrapper">
                <input id="cedula" name="cedula" type="text"
                  className="form-input read-only-input"
                  value={formData.cedula} readOnly tabIndex="-1" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <div className="input-wrapper">
                <input id="email" name="email" type="email"
                  className="form-input read-only-input"
                  value={formData.email} readOnly tabIndex="-1" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <div className="input-wrapper">
                <input id="telefono" name="telefono" type="text"
                  className={`form-input ${errors.telefono ? 'input-error' : ''}`}
                  value={formData.telefono} onChange={handleChange} disabled={loading} />
              </div>
              {errors.telefono && <span className="error-message">{errors.telefono}</span>}
            </div>

            {errors.general && (
              <span className="error-message general-error">{errors.general}</span>
            )}

            <button type="submit" className="submit-button"
              disabled={loading || !isModified}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>

            <button type="button" className="submit-button secondary-button"
              onClick={() => navigate('/change-password')}
              style={{ marginTop: '15px', backgroundColor: 'transparent',
                border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>
              Cambiar Contraseña
            </button>

            {/* ── Botón desactivar cuenta ── */}
            <button type="button" className="submit-button deactivate-button"
              onClick={abrirModal}>
              Desactivar Cuenta
            </button>

          </form>
        </div>

        {toastMessage && (
          <div className="toast-notification">{toastMessage}</div>
        )}
      </div>

      {/* ── Modal de confirmación ─────────────────────────────────────────── */}
      {modalAbierto && (
        <div className="deactivate-overlay" onClick={cerrarModal}>
          <div className="deactivate-modal" onClick={e => e.stopPropagation()}>

            {/* Botón cerrar */}
            <button className="deactivate-close" onClick={cerrarModal}
              disabled={loadingDesactivar} aria-label="Cerrar">
              <X size={20} />
            </button>

            {/* Ícono de advertencia */}
            <div className="deactivate-icon-wrap">
              <AlertTriangle size={32} className="deactivate-icon" />
            </div>

            <h3 className="deactivate-title">¿Desactivar tu cuenta?</h3>
            <p className="deactivate-desc">
              Tu cuenta será <strong>desactivada</strong> y no podrás volver a iniciar sesión.
              Para confirmar, ingresa tu contraseña actual.
            </p>

            {/* Campo contraseña */}
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label htmlFor="contrasena-desactivar" className="deactivate-label">
                Contraseña actual
              </label>
              <div className="input-wrapper">
                <input
                  id="contrasena-desactivar"
                  type={mostrarContrasena ? 'text' : 'password'}
                  className={`form-input password-input ${errorContrasena ? 'input-error' : ''}`}
                  placeholder="Ingresa tu contraseña"
                  value={contrasenaDesactivar}
                  onChange={e => {
                    setContrasenaDesactivar(e.target.value);
                    if (errorContrasena) setErrorContrasena('');
                  }}
                  disabled={loadingDesactivar}
                  autoFocus
                />
                <button type="button" className="toggle-password"
                  onClick={() => setMostrarContrasena(v => !v)}
                  tabIndex="-1">
                  {mostrarContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errorContrasena && (
                <span className="error-message" style={{ marginTop: '0.35rem' }}>
                  {errorContrasena}
                </span>
              )}
            </div>

            {/* Acciones */}
            <div className="deactivate-actions">
              <button className="deactivate-cancel" onClick={cerrarModal}
                disabled={loadingDesactivar}>
                Cancelar
              </button>
              <button className="deactivate-confirm" onClick={handleDesactivar}
                disabled={loadingDesactivar || !contrasenaDesactivar.trim()}>
                {loadingDesactivar ? 'Desactivando...' : 'Confirmar desactivación'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;