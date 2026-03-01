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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    
    <Router>
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
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/restaurar-password" element={<ResetPassword />} />
        <Route element={<Layout />}>
          <Route path="/reservar" element={<Reservar />} />
          <Route path="/mis-reservas" element={<MisReservas />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/home" element={<Home />} />
          <Route path="/admin-home" element={<Home />} />
          <Route path="/worker-home" element={<Home />} />
          <Route path="/registrar-trabajador" element={<RegistrarTrabajador />} />
          <Route path="/terminos" element={<Terminos />} />
        </Route>
      </Routes>
    </Router>
    
  );
}

export default App;