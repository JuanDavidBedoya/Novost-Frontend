import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/apiConfig';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import './Reservas.css';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../lib/errorHandler';

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
      
      toast.success("¡Reserva creada con éxito! Ahora puedes proceder al pago.");
      
      // 2. Redirigimos a Mis Reservas para que vea su reserva recién creada
      navigate('/mis-reservas');
    } catch (error) {
      showErrorToast(error, toast);
    } finally {
      setLoading(false);
    }
  };

  const handleCedulaChange = (e) => {
    // Reemplaza cualquier caracter que no sea número por un string vacío
    const value = e.target.value.replace(/\D/g, "");
    setFormData({ ...formData, cedulaUsuario: value });
  };

 return (
    <div className="novost-page">
      <div className="home-hero">
        <div className="role-badge">Reservaciones</div>
        <h1>Haz una <span>Reserva</span></h1>
        <p>Asegura tu lugar en la mejor experiencia culinaria de la ciudad.</p>
        <div className="hero-divider"></div>
      </div>

      <div className="flex justify-center">
        <form onSubmit={handleSubmit} className="reserva-glass-card max-w-2xl w-full">
          {/* Grid de Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="input-label">Cédula del Usuario</label>
              <input
                type="text" required placeholder="Ingrese la cédula"
                className="novost-input"
                value={formData.cedulaUsuario}
                onChange={handleCedulaChange} 
              />
            </div><br></br>

            <div>
              <label className="input-label"><Calendar size={18}/> Fecha</label>
              <input
                type="date" required className="novost-input"
                min={new Date().toISOString().split('T')[0]}
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              />
            </div><br></br>
            
            <div>
              <label className="input-label"><Clock size={18}/> Hora Inicio</label>
              <select
                required className="novost-input"
                value={formData.horaInicio}
                onChange={(e) => setFormData({...formData, horaInicio: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                {generarHorasDisponibles().map((hora) => (
                  <option key={hora} value={hora}>{hora.substring(0,5)}</option>
                ))}
              </select>
            </div><br></br>

            <div className="md:col-span-2">
              <label className="input-label"><Users size={18}/> Comensales</label>
              <input
                type="number" min="1" max="10" required className="novost-input"
                value={formData.numPersonas}
                onChange={(e) => setFormData({...formData, numPersonas: e.target.value})}
              />
            </div><br></br>
          </div>

          {/* SECCIÓN INFERIOR: RESUMEN A LA DERECHA */}
          <div className="mt-12 flex flex-col items-end border-t border-gray-100 pt-8">
            <div className="text-right mb-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Resumen de tu reserva
              </span>
              <div className="flex items-center justify-end gap-3">
                <span className="text-gray-500 font-medium">Total a pagar:</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-purple-700">
                    ${formData.numPersonas * 5}.00
                  </span>
                  <span className="text-xs font-bold text-purple-500"> USD</span>
                </div>
              </div>
            </div><br></br>

            <button type="submit" disabled={loading} className="btn-novost px-10">
              {loading ? "Procesando..." : (
                <>Confirmar Reserva <ArrowRight size={20}/></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}