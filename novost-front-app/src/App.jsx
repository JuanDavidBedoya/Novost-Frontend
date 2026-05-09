import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword'; 
import ResetPassword from './pages/auth/ResetPassword';   
import MisReservas from './pages/booking/MisReservas';
import Reservar from './pages/booking/Reservar';
import UserProfile from './pages/profile/UserProfile';
import ChangePassword from './pages/profile/ChangePassword';
import Home from './pages/home/Home';
import RegistrarTrabajador from './pages/auth/RegisterWorker';
import Terminos from './pages/home/Terminos';
import Layout from './components/layout/Layout';
import AccessibilityBar from './components/layout/AccessibilityBar';
import { ToastContainer } from 'react-toastify';
import useIdleTimeout from './hooks/useIdleTimeout';
import PublicRoute from './components/routes/PublicRoute';
import ProtectedRoute from './components/routes/ProtectedRoute';
import StockCode from './pages/stock/StockCode';
import StockRoute from './pages/stock/StockRoute';
import TiposProducto from './pages/stock/TiposProducto';
import ProductosPorTipo from './pages/stock/ProductosPorTipo';
import AlertasVencimiento from './pages/stock/AlertasVencimiento';
import EntradaCompra from './pages/stock/EntradaCompra';
import Dashboard from './pages/dashboard/Dashboard';
import Menu from './pages/orders/MenuPedido';
import Pedidos from './pages/orders/MisPedidos';
import useTokenExpiration from './hooks/useTokenExpiration';
import ScrollToTop from './components/layout/ScrollToTop';
import ReservaCode from './pages/booking/ReservaCode';
import ReservaRoute from './pages/booking/ReservaRoute';
import PedidoCode from './pages/orders/PedidoCode';
import PedidoRoute from './pages/orders/PedidoRoute';
import GestionMenu from './pages/menu/GestionMenu';
import 'react-toastify/dist/ReactToastify.css';

// Configuración principal de rutas, autenticación y gestión de sesión de la aplicación

// Inicialización de Google Analytics 4 para tracking de eventos y pageviews

ReactGA.initialize("G-B5NHNCTWWW");

// Componente RouteTracker: registra cada cambio de página en Google Analytics

const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Registra la visita cada vez que el usuario cambia de página
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return null;
};

// Componente SessionManager: envuelve la aplicación con hooks de timeout de inactividad y expiración de token

const SessionManager = ({ children }) => {
  useIdleTimeout(10); 
  useTokenExpiration();
  return children;
};

// Configuración de Router, ToastContainer para notificaciones y AccessibilityBar

function App() {
  return (
    
    <Router>
      <ScrollToTop />
      <RouteTracker />
      <SessionManager>
       <ToastContainer 
        position="bottom-left"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <AccessibilityBar /> 

      <Routes>
          <Route path="/" element={<PublicRoute><Navigate to="/login" /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/restaurar-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          
          <Route path="/terminos" element={<Terminos />} />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            
            <Route path="/home" element={<ProtectedRoute allowedRoles={['CLIENTE']}><Home /></ProtectedRoute>} />
            <Route path="/reservar" element={<ProtectedRoute allowedRoles={['CLIENTE']}><Reservar /></ProtectedRoute>} />
            <Route path="/mis-reservas" element={<ProtectedRoute allowedRoles={['CLIENTE']}><MisReservas /></ProtectedRoute>} />
            <Route path="/menu" element={<ProtectedRoute allowedRoles={['CLIENTE']}><Menu /></ProtectedRoute>} />
            <Route path="/pedidos" element={<ProtectedRoute allowedRoles={['CLIENTE']}><Pedidos /></ProtectedRoute>} />

            <Route path="/admin-home" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><Home /></ProtectedRoute>} />
            <Route path="/registrar-trabajador" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><RegistrarTrabajador /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><Dashboard /></ProtectedRoute>} />
            <Route path="/gestion-menu" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><GestionMenu /></ProtectedRoute>} />

            <Route path="/worker-home" element={<ProtectedRoute allowedRoles={['TRABAJADOR']}><Home /></ProtectedRoute>} />

            <Route path="/profile" element={<ProtectedRoute allowedRoles={['CLIENTE', 'ADMINISTRADOR', 'TRABAJADOR']}><UserProfile /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute allowedRoles={['CLIENTE', 'ADMINISTRADOR', 'TRABAJADOR']}><ChangePassword /></ProtectedRoute>} />

            <Route path="/gestionar-reservas-code" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'TRABAJADOR']}><ReservaCode /></ProtectedRoute>} />
            <Route path="/gestionar-reservas" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'TRABAJADOR']}><ReservaRoute /></ProtectedRoute>} />

            <Route path="/gestionar-pedidos-code" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'TRABAJADOR']}><PedidoCode /></ProtectedRoute>} />
            <Route path="/gestionar-pedidos"      element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'TRABAJADOR']}><PedidoRoute /></ProtectedRoute>} />

            <Route path="/stock-code" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'TRABAJADOR']}><StockCode /></ProtectedRoute>} />
            <Route path="/stock" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'TRABAJADOR']}><StockRoute /></ProtectedRoute>} />
            <Route path="/stock/tipos" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'TRABAJADOR']}><TiposProducto /></ProtectedRoute>} />
            <Route path="/stock/tipo/:idTipo" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'TRABAJADOR']}><ProductosPorTipo /></ProtectedRoute>} />
            <Route path="/stock/alertas" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'TRABAJADOR']}><AlertasVencimiento /></ProtectedRoute>} />
            <Route path="/stock/entradas" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'TRABAJADOR']}><EntradaCompra /></ProtectedRoute>} />
            
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </SessionManager>
    </Router>
    
  );
}

export default App;
