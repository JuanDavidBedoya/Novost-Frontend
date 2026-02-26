import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from './lib/stripe'; // El archivo que creamos antes
import Login from './pages/Login';
import MisReservas from './pages/MisReservas';
import Reservar from './pages/Reservar';

function App() {
  return (
    <Elements stripe={stripePromise}>
      <Router>
        <Routes>
          {/* Ruta por defecto redirige a login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Nuevas rutas de Reservas */}
          <Route path="/reservar" element={<Reservar />} />
          <Route path="/mis-reservas" element={<MisReservas />} />
        </Routes>
      </Router>
    </Elements>
  );
}

export default App;