import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  CalendarPlus, ClipboardList, Star, Clock, 
  Users, BarChart3, Settings, CheckSquare, UtensilsCrossed 
} from 'lucide-react';
import './Home.css';

// Importación de assets
import calendar from '../../assets/images/Calendar.jpg'; 
import empleado from '../../assets/images/Empleado.jpg'; 
import reserva from '../../assets/images/Reserva.jpg'; 
import inventario from '../../assets/images/Inventario.jpg'; 
import dash from '../../assets/images/Dash.jpg';
import menu from '../../assets/images/Menu.jpg';
import lista from '../../assets/images/Lista.jpg';

const Home = () => {
  const navigate = useNavigate();
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));
  const rol = usuarioLocal?.rol || 'CLIENTE';
  const nombreUsuario = usuarioLocal ? usuarioLocal.nombre.split(' ')[0] : 'Invitado';

  const contentByRole = {
    CLIENTE: [
      { id: 1, title: 'Hacer una Reserva', desc: 'Asegura tu mesa en minutos', path: '/reservar', icon: <CalendarPlus size={28} />, img: calendar },
      { id: 2, title: 'Mis Reservas', desc: 'Consulta tus citas activas', path: '/mis-reservas', icon: <ClipboardList size={28} />, img: reserva },
      { id: 3, title: 'Consulta Nuestro Menú', desc: 'Realiza tu pedido aquí', path: '/menu', icon: <Star size={28} />, img: menu },
      { id: 4, title: 'Mis Pedidos', desc: 'Consulta tu historial de Pedidos', path: '/pedidos', icon: <Clock size={28} />, img: lista },
    ],
    ADMINISTRADOR: [
      { id: 1, title: 'Nuevo Trabajador', desc: 'Registrar un nuevo empleado', path: '/registrar-trabajador', icon: <Users size={28} />, img: empleado},
      { id: 2, title: 'Gestión de Menú', desc: 'Configura, agrega y remueve platos del menú', path: '/gestion-menu', icon: <Settings size={28} />, img: menu },
      { id: 3, title: 'Dashboard', desc: 'Ver la información general y estadísticas', path: '/dashboard', icon: <BarChart3 size={28} />, img: dash },
    ],
    TRABAJADOR: [
      { id: 1, title: 'Ver Reservas', desc: 'Listado de clientes hoy', path: '/reserva-code', icon: <Clock size={28} />, img: reserva },
      { id: 2, title: 'Inventario', desc: 'Administrar el Inventario Actual del Restaurante ', path: '/stock-code', icon: <CheckSquare size={28} />, img: inventario },
      { id: 3, title: 'Gestionar Pedidos', desc: 'Listado de las Reservas Realizadas por los Usuarios', path: '/pedido-code', icon: <CalendarPlus size={28} />, img: lista },
    ]
  };

  const gridItems = contentByRole[rol] || contentByRole['CLIENTE'];

  return (
    <div className="home-container">
      <Helmet>
        <title>Novost - Panel de {rol}</title>
      </Helmet>

      {}
      <section className="hero-section">
        <div className="hero-welcome-corner">
          <div className="role-badge">{rol}</div>
          <p className="welcome-text">Bienvenido, <span>{nombreUsuario}</span></p>
          <div className="hero-divider"></div>
        </div>
        
        <div className="hero-main-content">
          <h1 className="hero-title">Vive la experiencia <span>Novost</span></h1>
          <p className="hero-description">
            En Novost, transformamos cada cena en un recuerdo inolvidable con alta cocina 
            y un ambiente diseñado exclusivamente para tu comodidad.
          </p>
        </div>
      </section>

      {}
      <section className="services-intro">
        <div className="section-title-wrapper">
          <h2 className="section-title">Nuestros Servicios</h2>
          <div className="title-underline"></div>
          <p className="section-subtitle">
            Descubre por qué somos el lugar preferido para tus momentos especiales.
          </p>
        </div>

        <div className="services-cards-container">
          <div className="service-simple-card">
            <div className="service-icon-box"><UtensilsCrossed size={32} /></div>
            <h3>Alta Gastronomía</h3>
            <p>Platillos creados por chefs internacionales con ingredientes de primera.</p>
          </div>
          <div className="service-simple-card">
            <div className="service-icon-box"><CalendarPlus size={32} /></div>
            <h3>Reserva de Mesas</h3>
            <p>Garantizamos tu lugar sin esperas a través de nuestro sistema.</p>
          </div>
          <div className="service-simple-card">
            <div className="service-icon-box"><Star size={32} /></div>
            <h3>Eventos Privados</h3>
            <p>Espacios excelentes para cenas.</p>
          </div>
        </div>
      </section>

      {}
      <section className="dashboard-actions">
        <div className="section-title-wrapper">
          <h2 className="section-title">¿Qué deseas hacer hoy?</h2>
          <p className="section-subtitle">Acciones para nuestro {rol.toUpperCase()}</p>
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
      </section>
    </div>
  );
};

export default Home;