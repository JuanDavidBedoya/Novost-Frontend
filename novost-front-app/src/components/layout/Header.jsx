import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Utensils } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.clear(); 
    sessionStorage.clear();
    
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-container">

        <Link to="/home" className="header-logo">

          <Utensils size={32} color="#ffffff" />
          <span>Novost</span>
        </Link>

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