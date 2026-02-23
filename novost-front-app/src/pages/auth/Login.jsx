import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css'; // Importa los estilos
import restaurantImage from '../../assets/images/restaurant.jpg'; // Asegúrate de tener la imagen aquí

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Panel Izquierdo con Imagen */}
        <div className="login-image-panel" style={{ backgroundImage: `url(${restaurantImage})` }}>
          <div className="login-image-overlay">
            <div className="login-brand-text">
              <h1>Novost</h1>
              <p>La elegancia y la mejor comida en un solo lugar.</p>
            </div>
          </div>
        </div>

        {/* Panel Derecho con Formulario */}
        <div className="login-form-panel">
          <div className="login-header">
            <h2>Bienvenido de Vuelta!</h2>
          </div>

          <div className="login-toggle-container">
            <button className="login-toggle-btn active">Iniciar Sesión</button>
            {/* Usamos Link para navegar a la página de registro */}
            <Link to="/registro" className="login-toggle-btn">Registrarse</Link>
          </div>

          <p className="login-instruction">Ingrese sus datos para Iniciar Sesión</p>

          <form className="login-form">
            <div className="form-group">
              <label htmlFor="cedula">Cédula</label>
              <input type="text" id="cedula" placeholder="Ingrese su Cédula" className="form-input" />
            </div>

            <div className="form-group">
              <label htmlFor="contrasena">Contraseña</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="contrasena"
                  placeholder="Ingrese su Contraseña"
                  className="form-input password-input"
                />
                <button type="button" className="password-toggle-icon" onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="forgot-password-link">
              <Link to="/forgot-password">Olvido su Contraseña?</Link>
            </div>

            <button type="button" className="login-submit-btn">Continuar</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;