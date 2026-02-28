import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  CalendarPlus, ClipboardList, Star, Clock, Crown, LayoutDashboard, 
  Users, BarChart3, Settings, CheckSquare, UtensilsCrossed, Bell 
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));
  const rol = usuarioLocal?.rol || 'CLIENTE';
  const nombreUsuario = usuarioLocal ? usuarioLocal.nombre.split(' ')[0] : 'Invitado';

  // --- CONFIGURACIÓN DE CONTENIDO POR ROL ---
  
  const contentByRole = {
    CLIENTE: [
      { id: 1, title: 'Hacer una Reserva', desc: 'Asegura tu mesa en minutos', path: '/reservar', icon: <CalendarPlus size={28} />, img: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=800&auto=format&fit=crop' },
      { id: 2, title: 'Mis Reservas', desc: 'Consulta tus citas activas', path: '/mis-reservas', icon: <ClipboardList size={28} />, img: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop' },
      { id: 3, title: 'Mesa Especial', desc: 'Experiencias inolvidables', path: '/reservar', icon: <Star size={28} />, img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop' },
    ],
    ADMINISTRADOR: [
      { id: 1, title: 'Gestión Usuarios', desc: 'Control de clientes y staff', path: '/registrar-trabajador', icon: <Users size={28} />, img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop' },
      { id: 2, title: 'Reportes Ventas', desc: 'Analítica y rendimiento', path: '/admin/reportes', icon: <BarChart3 size={28} />, img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop' },
      { id: 3, title: 'Configuración', desc: 'Ajustes del sistema Novost', path: '/admin/settings', icon: <Settings size={28} />, img: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=800&auto=format&fit=crop' },
    ],
    TRABAJADOR: [
      { id: 1, title: 'Reservas Hoy', desc: 'Ver agenda del día', path: '/worker/agenda', icon: <Clock size={28} />, img: 'https://images.unsplash.com/photo-1505826759037-1a6973526684?q=80&w=800&auto=format&fit=crop' },
      { id: 2, title: 'Check-in', desc: 'Confirmar llegada de clientes', path: '/worker/check-in', icon: <CheckSquare size={28} />, img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop' },
      { id: 3, title: 'Estado Mesas', desc: 'Mapa de sala en tiempo real', path: '/worker/mesas', icon: <UtensilsCrossed size={28} />, img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop' },
    ]
  };

  const gridItems = contentByRole[rol] || contentByRole['CLIENTE'];

  return (
    <div className="home-container">
      <Helmet>
        <title>Novost - Panel de {rol}</title>
      </Helmet>

      <div className="home-hero">
        <div className="role-badge">{rol}</div>
        <h1>Bienvenido, <span>{nombreUsuario}</span></h1>
        <p>Panel exclusivo para: <strong>{rol.toUpperCase()}</strong>.</p>
        <div className="hero-divider"></div>
      </div>

      <div className="image-grid">
        {gridItems.map((item) => (
          <div key={item.id} className="grid-card" onClick={() => navigate(item.path)}>
            <img src={item.img} alt={item.title} className="card-image" />
            <div className="card-overlay">
              <div className="card-content">
                <div className="card-icon-wrapper">{item.icon}</div>
                <h3 className="card-title">{item.title}</h3>
                <p className="card-desc">{item.desc}</p>
              </div>
            </div>
            <div className="card-hover-border"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;