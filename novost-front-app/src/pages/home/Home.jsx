import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  CalendarPlus, ClipboardList, Star, Clock, Crown, LayoutDashboard, 
  Users, BarChart3, Settings, CheckSquare, UtensilsCrossed, Bell 
} from 'lucide-react';
import './Home.css';
import futura from '../../assets/images/Error.jpg'; 
import calendar from '../../assets/images/Calendar.jpg'; 
import empleado from '../../assets/images/Empleado.jpg'; 
import reserva from '../../assets/images/Reserva.jpg'; 

const Home = () => {
  const navigate = useNavigate();
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));
  const rol = usuarioLocal?.rol || 'CLIENTE';
  const nombreUsuario = usuarioLocal ? usuarioLocal.nombre.split(' ')[0] : 'Invitado';

  
  const contentByRole = {
    CLIENTE: [
      { id: 1, title: 'Hacer una Reserva', desc: 'Asegura tu mesa en minutos', path: '/reservar', icon: <CalendarPlus size={28} />, img: calendar }, /*Calendar*/
      { id: 2, title: 'Mis Reservas', desc: 'Consulta tus citas activas', path: '/mis-reservas', icon: <ClipboardList size={28} />, img: reserva }, /*Reserva*/
      { id: 3, title: 'Función Futura', desc: 'Esta función de momento no se encuentra disponible', path: '/home', icon: <Star size={28} />, img: futura }, /*Futura*/
    ],
    ADMINISTRADOR: [
      { id: 1, title: 'Nuevo Trabajador', desc: 'Registrar un nuevo empleado', path: '/registrar-trabajador', icon: <Users size={28} />, img: empleado}, /*Empleado*/
      { id: 2, title: 'Función Futura', desc: 'Esta función de momento no se encuentra disponible', path: '/admin-home', icon: <BarChart3 size={28} />, img: futura }, /*Futura*/
      { id: 3, title: 'Función Futura', desc: 'Esta función de momento no se encuentra disponible', path: '/admin-home', icon: <Settings size={28} />, img: futura }, /*Futura*/
    ],
    TRABAJADOR: [
      { id: 1, title: 'Función Futura', desc: 'Esta función de momento no se encuentra disponible', path: '/worker-home', icon: <Clock size={28} />, img: futura }, /*Futura*/
      { id: 2, title: 'Función Futura', desc: 'Esta función de momento no se encuentra disponible', path: '/worker-home', icon: <CheckSquare size={28} />, img: futura }, /*Futura*/
      { id: 3, title: 'Función Futura', desc: 'Esta función de momento no se encuentra disponible', path: '/worker-home', icon: <UtensilsCrossed size={28} />, img: futura }, /*Futura*/
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