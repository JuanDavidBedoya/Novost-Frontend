import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/apiConfig';
import { Search, Trash2, CreditCard, Clock, Users, Calendar } from 'lucide-react';
import PagoModal from '../../components/pasarela/PagoModal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../lib/errorHandler';

const MySwal = withReactContent(Swal);

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [filtros, setFiltros] = useState({ fecha: '', hora: '', personas: '', estado: '' });
  const [modalData, setModalData] = useState({ open: false, clientSecret: '', idReserva: null });
  
  const location = useLocation();
  const navigate = useNavigate();

  // Generar horas desde 12:00 hasta 21:30
  const generarHorasDisponibles = () => {
    const horas = [];
    for (let i = 12; i <= 21; i++) {
      horas.push(`${i}:00:00`);
      horas.push(`${i}:30:00`);
    }
    horas.push('21:30:00');
    return horas;
  };

  const fetchReservas = useCallback(async () => {
    try {
      const { data } = await api.get('/reservas/buscar', { params: filtros });
      
      // Filtrar por estado del lado del cliente si se selecciona uno
      let reservasFiltradas = data;
      if (filtros.estado) {
        reservasFiltradas = reservasFiltradas.filter(res => res.estadoReserva === filtros.estado);
      }
      
      setReservas(reservasFiltradas);
    } catch (error) {
      console.error("Error buscando reservas", error);
    }
  }, [filtros]);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('status') === 'success') {
      toast.success("¡Pago confirmado con éxito! Recargue la página para ver el pago reflejado.");
      navigate('/mis-reservas', { replace: true });
      
      fetchReservas();
      
      setTimeout(() => {
        fetchReservas();
      }, 2000);
    }
  }, [location, navigate, fetchReservas]);

  const handleCancelar = async (id) => {
    const result = await MySwal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción cancelará tu reserva de forma permanente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8a2be2', 
      cancelButtonColor: '#999b9e', 
      confirmButtonText: 'Sí, cancelar reserva',
      cancelButtonText: 'No, mantenerla',
      reverseButtons: true,
      background: '#ffffff',
      borderRadius: '24px'
    });

    if (result.isConfirmed) {
      try {
        await api.post(`/reservas/${id}/cancelar`);
        toast.success("Reserva cancelada correctamente");
        fetchReservas();
      } catch (error) {
        showErrorToast(error, toast);
      }
    }
  };

  const handleIniciarPago = async (idReserva) => {
    try {
      const response = await api.post(`/pagos/crear-intento?idReserva=${idReserva}`, {});
      setModalData({
        open: true,
        clientSecret: response.data.clientSecret,
        idReserva: idReserva
      });
    } catch (error) {
      showErrorToast(error, toast);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({ fecha: '', hora: '', personas: '', estado: '' });
  };

  return (
    <div className="novost-page">
      <div className="home-hero">
        <h1>Mis <span>Reservas</span></h1>
        <p>Consulta y gestiona tus próximas experiencias en Novost.</p>
      </div>

      <div className="filtros-card" style={{marginTop: '0', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'}}>
        <div className="filtros-grid">
          <div className="filtro-group">
            <label htmlFor="fecha"><Calendar size={16}/> Fecha</label>
            <input 
              type="date" 
              id="fecha"
              className="filtro-input" 
              value={filtros.fecha}
              onChange={(e) => setFiltros({...filtros, fecha: e.target.value})} 
            />
          </div>
          
          <div className="filtro-group">
            <label htmlFor="hora"><Clock size={16}/> Hora</label>
            <select
              id="hora"
              className="filtro-input"
              value={filtros.hora}
              onChange={(e) => setFiltros({...filtros, hora: e.target.value})}
            >
              <option value="">Todas...</option>
              {generarHorasDisponibles().map((hora) => (
                <option key={hora} value={hora}>{hora.substring(0, 5)}</option>
              ))}
            </select>
          </div>

          <div className="filtro-group">
            <label htmlFor="personas"><Users size={16}/> Personas</label>
            <input 
              type="number" 
              id="personas"
              min="1"
              max="5"
              className="filtro-input" 
              value={filtros.personas}
              onChange={(e) => setFiltros({...filtros, personas: e.target.value})} 
            />
          </div>

          <div className="filtro-group">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              className="filtro-input"
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
            >
              <option value="">Todas</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="PAGADA">Pagada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>

          <div className="filtro-actions">
            <button onClick={limpiarFiltros} className="btn-limpiar">
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {reservas.length > 0 ? (
        <div className="reservas-list-grid">
          {reservas.map((res) => (
            <div key={res.idReserva} className="reserva-mini-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-black text-gray-800">{res.fecha}</h3>
                  
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mesa #{res.numeroMesa} </span>
                <span className={`status-chip status-${res.estadoReserva}`}>
                  {res.estadoReserva}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-600 font-semibold bg-gray-50 p-2 rounded-lg">
                  <Clock size={16} className="text-purple-500"/>
                  <span> {res.horaInicio.substring(0, 5)} <small className="text-gray-400">HS</small></span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 font-semibold bg-gray-50 p-2 rounded-lg">
                  <Users size={16} className="text-purple-500"/>
                  <span> {res.numPersonas} <small className="text-gray-400">Personas</small></span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.25rem', marginTop: 'auto', width: '100%' }}>
                {res.estadoReserva === 'PENDIENTE' && (
                  <button 
                    onClick={() => handleIniciarPago(res.idReserva)} 
                    className="btn-novost btn-pagar-alt"
                    style={{ flex: '1', padding: '0.8rem 0.5rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '8px' }}
                  >
                    <CreditCard size={18}/> 
                    <span className="whitespace-nowrap">Pagar</span>
                  </button>
                )}

                {res.estadoReserva !== 'CANCELADA' && (
                  <button 
                    onClick={() => handleCancelar(res.idReserva)} 
                    className="btn-novost btn-cancelar-alt"
                    title="Cancelar Reserva"
                    style={{ flex: '1', padding: '0.8rem 0.5rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '8px' }}
                  >
                    <Trash2 size={18}/>
                    <span className="whitespace-nowrap">Cancelar</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border-2 border-dashed border-gray-100">
          <p className="text-gray-400 text-lg font-medium">No se encontraron reservas con esos filtros.</p>
        </div>
      )}

      {modalData.open && (
        <PagoModal 
          clientSecret={modalData.clientSecret}
          idReserva={modalData.idReserva}
          onClose={() => setModalData({ ...modalData, open: false })}
        />
      )}
    </div>
  );
}