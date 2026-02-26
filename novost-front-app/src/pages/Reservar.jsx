import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiConfig';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';

export default function Reservar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cedulaUsuario: '', // Esto idealmente vendría de tu contexto de Auth/Login
    fecha: '',
    horaInicio: '',
    numPersonas: 1
  });

  // Genera las opciones de hora desde las 12:00 hasta las 23:00
  const generarHorasDisponibles = () => {
    const horas = [];
    for (let i = 12; i <= 23; i++) {
      horas.push(`${i}:00:00`);
      horas.push(`${i}:30:00`);
    }
    return horas;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Llamada al endpoint de creación que ya tienes en Spring Boot
      const response = await api.post('/reservas', formData);
      
      alert("¡Reserva creada con éxito! Ahora puedes proceder al pago.");
      
      // 2. Redirigimos a Mis Reservas para que vea su reserva recién creada
      navigate('/mis-reservas');
    } catch (error) {
      const mensaje = error.response?.data?.message || "Error al crear la reserva";
      alert(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Nueva Reserva</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cédula - En un sistema real esto vendría del usuario logueado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula del Usuario</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: 12345678"
              value={formData.cedulaUsuario}
              onChange={(e) => setFormData({...formData, cedulaUsuario: e.target.value})}
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Calendar size={16}/> Fecha
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.fecha}
              onChange={(e) => setFormData({...formData, fecha: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Hora */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Clock size={16}/> Hora
              </label>
              <select
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.horaInicio}
                onChange={(e) => setFormData({...formData, horaInicio: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                {generarHorasDisponibles().map((hora) => (
                  <option key={hora} value={hora}>{hora.substring(0,5)}</option>
                ))}
              </select>
            </div>

            {/* Comensales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Users size={16}/> Personas
              </label>
              <input
                type="number"
                min="1"
                max="10"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.numPersonas}
                onChange={(e) => setFormData({...formData, numPersonas: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            {loading ? "Procesando..." : (
              <> Confirmar Reserva <ArrowRight size={18}/> </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}