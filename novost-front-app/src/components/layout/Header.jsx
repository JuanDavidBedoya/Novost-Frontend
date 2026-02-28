import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Utensils } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpiamos ABSOLUTAMENTE TODO el rastro del usuario en el navegador
    // (Esto borra 'token', 'cedula' y 'usuario' que creaste en el Login)
    localStorage.clear(); 
    
    // Redirigir al login
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/home" className="header-logo">
          {/* Cambiamos el color a blanco para que contraste con el fondo morado */}
          <Utensils size={32} color="#ffffff" />
          <span>Novost</span>
        </Link>


        {/* Acciones del Usuario */}
        <div className="header-actions">
          <button onClick={() => navigate('/profile')} className="btn-icon profile-btn" title="Mi Perfil">
            <User size={22} />
            <span className="hide-mobile">Perfil</span>
          </button>
          
          <button onClick={handleLogout} className="btn-icon logout-btn" title="Cerrar Sesión">
            <LogOut size={22} />
            <span className="hide-mobile">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;