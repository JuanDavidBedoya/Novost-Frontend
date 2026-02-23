import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta por defecto redirige a login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        {/* Agrega más rutas aquí, por ejemplo:
        <Route path="/registro" element={<Registro />} /> 
        */}
      </Routes>
    </Router>
  );
}

export default App;