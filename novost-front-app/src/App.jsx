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
import GestionarReservas from './pages/booking/GestionarReservas';
import StockCode from './pages/stock/StockCode';
import StockRoute from './pages/stock/StockRoute';
import Dashboard from './pages/dashboard/Dashboard';
import Menu from './pages/orders/MenuPedido';
import Pedidos from './pages/orders/MisPedidos';
import GestionarPedidos from './pages/orders/GesitionPedidos';
import useTokenExpiration from './hooks/useTokenExpiration';
import ScrollToTop from './components/layout/ScrollToTop';
import 'react-toastify/dist/ReactToastify.css';

ReactGA.initialize("G-B5NHNCTWWW");

const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Registra la visita cada vez que el usuario cambia de página
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return null;
};

const SessionManager = ({ children }) => {
  useIdleTimeout(10); 
  useTokenExpiration();
  return children;
};

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

            <Route path="/worker-home" element={<ProtectedRoute allowedRoles={['TRABAJADOR']}><Home /></ProtectedRoute>} />

            <Route path="/profile" element={<ProtectedRoute allowedRoles={['CLIENTE', 'ADMINISTRADOR', 'TRABAJADOR']}><UserProfile /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute allowedRoles={['CLIENTE', 'ADMINISTRADOR', 'TRABAJADOR']}><ChangePassword /></ProtectedRoute>} />
            <Route path="/gestionar-reservas" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'TRABAJADOR']}><GestionarReservas /></ProtectedRoute>} />
            <Route path="/gestionar-pedidos" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'TRABAJADOR']}><GestionarPedidos /></ProtectedRoute>} />
            <Route path="/stock-code" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'TRABAJADOR']}><StockCode /></ProtectedRoute>} />
            <Route path="/stock" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'TRABAJADOR']}><StockRoute /></ProtectedRoute>} />
            
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </SessionManager>
    </Router>
    
  );
}

export default App;
