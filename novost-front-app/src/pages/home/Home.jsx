import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, List, Utensils } from 'lucide-react';
import { Helmet } from 'react-helmet';
import './Home.css'; // Crearemos este archivo pequeño
import restaurantImg from '../../assets/images/restaurant.jpg'; 

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <Helmet>
        <title>Novost - Inicio</title>
      </Helmet>

      {/* Overlay de fondo */}
      <div className="home-overlay"></div>
      <img src={restaurantImg} alt="Novost Background" className="home-bg-image" />

      {/* Nombre en la esquina */}
      <div className="home-logo">
        <Utensils size={28} color="var(--primary-color)" />
        <h1>Novost</h1>
      </div>

      {/* Contenido Central */}
      <main className="home-content">
        <header className="home-header">
          <h2>Bienvenido a la excelencia</h2>
          <p>¿Qué deseas gestionar hoy?</p>
        </header>

        <div className="home-menu">
          <button onClick={() => navigate('/profile')} className="home-btn">
            <User size={24} />
            <span>Perfil</span>
          </button>

          <button onClick={() => navigate('/reservar')} className="home-btn primary">
            <Calendar size={24} />
            <span>Reservar</span>
          </button>

          <button onClick={() => navigate('/mis-reservas')} className="home-btn">
            <List size={24} />
            <span>Mis Reservas</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;