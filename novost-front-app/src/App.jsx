import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import 'react-toastify/dist/ReactToastify.css';

// Aquí activamos la inactividad de 5 minutos
const SessionManager = ({ children }) => {
  useIdleTimeout(5); 
  return children;
};

function App() {
  return (
    
    <Router>
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
          {/* --- RUTAS PÚBLICAS --- */}
          {/* Si el usuario está logueado, PublicRoute lo redirigirá a su Home */}
          <Route path="/" element={<PublicRoute><Navigate to="/login" /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/restaurar-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          {/* --- RUTAS PRIVADAS (LAYOUT) --- */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            
            {/* Solo CLIENTE */}
            <Route path="/home" element={<ProtectedRoute allowedRoles={['CLIENTE']}><Home /></ProtectedRoute>} />
            <Route path="/reservar" element={<ProtectedRoute allowedRoles={['CLIENTE']}><Reservar /></ProtectedRoute>} />
            <Route path="/mis-reservas" element={<ProtectedRoute allowedRoles={['CLIENTE']}><MisReservas /></ProtectedRoute>} />

            {/* Solo ADMINISTRADOR */}
            <Route path="/admin-home" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><Home /></ProtectedRoute>} />
            <Route path="/registrar-trabajador" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><RegistrarTrabajador /></ProtectedRoute>} />

            {/* Solo TRABAJADOR */}
            <Route path="/worker-home" element={<ProtectedRoute allowedRoles={['TRABAJADOR']}><Home /></ProtectedRoute>} />

            {/* RUTAS COMPARTIDAS (CLIENTE, ADMIN, TRABAJADOR) */}
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['CLIENTE', 'ADMINISTRADOR', 'TRABAJADOR']}><UserProfile /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute allowedRoles={['CLIENTE', 'ADMINISTRADOR', 'TRABAJADOR']}><ChangePassword /></ProtectedRoute>} />
            <Route path="/terminos" element={<ProtectedRoute allowedRoles={['CLIENTE', 'ADMINISTRADOR', 'TRABAJADOR']}><Terminos /></ProtectedRoute>} />
          
          </Route>

          {/* Ruta para manejar 404 - Opcional */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </SessionManager>
    </Router>
    
  );
}

export default App;