import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/apiConfig';
import { Calendar, Clock, Users, ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import './Reservas.css';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../lib/errorHandler';

export default function Reservar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState({ cargando: false, mesas: 0 });
  const cedulaUsuario = localStorage.getItem('cedula');
  const [formData, setFormData] = useState({
    cedulaUsuario: cedulaUsuario || '',
    fecha: '',
    horaInicio: '',
    numPersonas: 0
  });

  const generarHorasDisponibles = () => {
    const horas = [];
    for (let i = 12; i <= 21; i++) {
      horas.push(`${i}:00:00`);
      horas.push(`${i}:30:00`);
    }
    return horas;
  };

  const obtenerDisponibilidad = useCallback(async () => {
    if (!formData.fecha) {
      setDisponibilidad({ cargando: false, mesas: 0 });
      return;
    }

    setDisponibilidad(prev => ({ ...prev, cargando: true }));
    
    try {
      const params = { fecha: formData.fecha };
      
      if (formData.horaInicio && formData.horaInicio !== '') {
        params.hora = formData.horaInicio;
      }
      
      if (formData.numPersonas && parseInt(formData.numPersonas) > 0) {
        params.personas = parseInt(formData.numPersonas);
      }

      const response = await api.get('/reservas/disponibilidad', { params });
      setDisponibilidad({ cargando: false, mesas: response.data });
    } catch (error) {
      console.error('Error obteniendo disponibilidad:', error);
      setDisponibilidad({ cargando: false, mesas: 0 });
    }
  }, [formData.fecha, formData.horaInicio, formData.numPersonas]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      obtenerDisponibilidad();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [obtenerDisponibilidad]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const numPersonas = parseInt(formData.numPersonas);
    if (!numPersonas || numPersonas <= 0) {
      toast.error("Debe seleccionar al menos 1 comensal para crear una reserva.");
      return;
    }
    
    setLoading(true);

    try {
      const response = await api.post('/reservas', formData);
      
      toast.success("¡Reserva creada con éxito! Ahora puedes proceder al pago.");
      
      navigate('/mis-reservas');
    } catch (error) {
      showErrorToast(error, toast);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="novost-page">
      <div className="home-hero">
        <h1>Haz una <span>Reserva</span></h1>
        <p>Asegura tu lugar en la mejor experiencia culinaria de la ciudad.</p>
      </div>

      <div className="flex justify-center">
        <form onSubmit={handleSubmit} className="reserva-glass-card max-w-2xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                type="number" min="1" max="5" required className="novost-input"
                value={formData.numPersonas}
                onChange={(e) => setFormData({...formData, numPersonas: e.target.value})}
              />
            </div><br></br>
          </div>

          {formData.fecha && (
            <div className="disponibilidad-panel mt-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Disponibilidad de Mesas
                </span>
              </div><br></br>
              
              {disponibilidad.cargando ? (
                <div className="disponibilidad-loading">
                  <div className="spinner-border text-purple" role="status"></div>
                  <span>Verificando disponibilidad...</span>
                </div>
              ) : (
                <div className={`disponibilidad-card ${disponibilidad.mesas > 0 ? 'disponible' : 'no-disponible'}`}>
                  <div className="disponibilidad-icon">
                    {disponibilidad.mesas > 0 ? (
                      <CheckCircle size={28} />
                    ) : (
                      <XCircle size={28} />
                    )}
                  </div>
                  <div className="disponibilidad-info">
                    <span className="disponibilidad-numero">
                      {disponibilidad.mesas}
                    </span>
                    <span className="disponibilidad-texto">
                      {disponibilidad.mesas === 1 ? 'mesa disponible' : 'mesas disponibles'}
                    </span>
                  </div>
                  {!disponibilidad.mesas && (
                    <span className="disponibilidad-advertencia">
                      <AlertCircle size={16} />
                      Intenta con otro horario o fecha
                    </span>
                  )}
                </div>
              )}
            </div>
          )}<br></br>
          
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
