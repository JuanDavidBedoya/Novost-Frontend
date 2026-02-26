import { useState, useEffect } from 'react';
import api from '../api/apiConfig';
import { Search, Trash2, CreditCard } from 'lucide-react';
import PagoModal from '../components/PagoModal';

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [filtros, setFiltros] = useState({ fecha: '', hora: '', personas: '' });
  const [modalData, setModalData] = useState({ open: false, clientSecret: '', idReserva: null });

  const fetchReservas = async () => {
    try {
      const { data } = await api.get('/reservas/buscar', { params: filtros });
      setReservas(data);
    } catch (error) {
      console.error("Error buscando reservas", error);
    }
  };

  const handleCancelar = async (id) => {
    if (!window.confirm("¿Estás seguro de cancelar esta reserva?")) return;
    try {
      await api.post(`/reservas/${id}/cancelar`);
      alert("Reserva cancelada y reembolso procesado");
      fetchReservas();
    } catch (error) {
      alert("No se pudo cancelar: " + error.response?.data?.message);
    }
  };

  // Función para iniciar el proceso de pago
  const handleIniciarPago = async (idReserva, monto) => {
    try {
      // Llamada a tu PasarelaService en el Backend
      const { data } = await api.post(`/pagos/crear-intento?idReserva=${idReserva}&monto=50.0`); // Monto de ejemplo
      
      setModalData({
        open: true,
        clientSecret: data.clientSecret, // El que viene de tu Map en Spring Boot
        idReserva: idReserva
      });
    } catch (error) {
      alert("Error al conectar con la pasarela de pago");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Mis Reservas</h1>

      {/* Buscador */}
      <div className="flex gap-4 mb-8 bg-gray-100 p-4 rounded-lg">
        <input type="date" className="p-2 border rounded" 
          onChange={(e) => setFiltros({...filtros, fecha: e.target.value})} />
        <input type="number" placeholder="Personas" className="p-2 border rounded w-24" 
          onChange={(e) => setFiltros({...filtros, personas: e.target.value})} />
        <button onClick={fetchReservas} className="bg-black text-white px-4 py-2 rounded flex items-center gap-2">
          <Search size={18}/> Buscar
        </button>
      </div>

      {/* Tabla de Resultados */}
      <div className="grid grid-cols-1 gap-4">
        {reservas.map((res) => (
          <div key={res.idReserva} className="border p-4 rounded-lg flex justify-between items-center shadow-sm">
            <div>
              <p className="font-bold">Mesa #{res.numeroMesa} - {res.fecha}</p>
              <p className="text-sm text-gray-600">{res.horaInicio} | {res.numPersonas} personas</p>
              <span className={`text-xs px-2 py-1 rounded ${res.estadoReserva === 'CANCELADA' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {res.estadoReserva}
              </span>
            </div>
            <div className="flex gap-2">
             {res.estadoReserva === 'PENDIENTE' && (
                <button 
                  onClick={() => handleIniciarPago(res.idReserva, 50.0)} // <-- AÑADE ESTO
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <CreditCard size={20}/>
                </button>
              )}
              {res.estadoReserva !== 'CANCELADA' && (
                <button onClick={() => handleCancelar(res.idReserva)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 size={20}/>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* MODAL DE STRIPE */}
      {modalData.open && (
        <PagoModal 
          clientSecret={modalData.clientSecret}
          idReserva={modalData.idReserva}
          onClose={() => setModalData({ ...modalData, open: false })}
        />
      )}
      </div>
    </div>
  );
}