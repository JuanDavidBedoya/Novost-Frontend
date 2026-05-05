import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import api from '../../api/apiConfig';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../lib/errorHandler';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './Reservas.css';

// Página de gestión de reservas con filtros, búsqueda y finalización

const MySwal = withReactContent(Swal);

// Estado: lista de reservas, loading general, y ID de reserva en proceso de finalización

const GestionarReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [finalizandoId, setFinalizandoId] = useState(null);

  // Función auxiliar: genera array de horas disponibles cada 30 minutos (12:00 a 21:30)
  
  const generarHorasDisponibles = () => {
    const horas = [];
    for (let i = 12; i <= 21; i++) {
      horas.push(`${i}:00:00`);
      horas.push(`${i}:30:00`);
    }
    return horas;
  };

  // Estado: filtros de búsqueda (fecha, hora, personas, estado)

  const [filtros, setFiltros] = useState({
    fecha: '',
    hora: '',
    personas: '',
    estado: ''
  });

  // Función fetchReservas: obtiene reservas de la API con filtros opcionales y filtra por estado

  const fetchReservas = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtros.fecha) params.fecha = filtros.fecha;
      if (filtros.hora) params.hora = filtros.hora;
      if (filtros.personas) params.personas = filtros.personas;

      const response = await api.get('/reservas/todas', { params });
      
      let reservasFiltradas = response.data;
      if (filtros.estado) {
        reservasFiltradas = reservasFiltradas.filter(res => res.estadoReserva === filtros.estado);
      }
      
      setReservas(reservasFiltradas);
    } catch (error) {
      showErrorToast(error, toast);
    } finally {
      setLoading(false);
    }
  };

  // Effect: ejecuta búsqueda con debounce de 500ms al cambiar filtros

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchReservas();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filtros]);

  // Función handleFilterChange: actualiza estado de filtros

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  // Función limpiarFiltros: resetea todos los filtros a valores vacíos

  const limpiarFiltros = () => {
    setFiltros({ fecha: '', hora: '', personas: '', estado: '' });
  };

  // Función finalizarReserva: muestra confirmación SweetAlert2, finaliza reserva en API y actualiza estado local

  const finalizarReserva = async (idReserva) => {
    const result = await MySwal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción finalizará la reserva. Una vez finalizada, no se podrá revertir.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8a2be2', 
      cancelButtonColor: '#999b9e', 
      confirmButtonText: 'Sí, finalizar reserva',
      cancelButtonText: 'No, mantenerla',
      reverseButtons: true,
      background: '#ffffff',
      borderRadius: '24px',
      customClass: {
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      }
    });

    if (result.isConfirmed) {
      setFinalizandoId(idReserva);
      try {
        await api.post(`/reservas/${idReserva}/finalizar`);
        toast.success('Reserva finalizada correctamente');
        
        setReservas(prev => prev.map(res => 
          res.idReserva === idReserva ? { ...res, estadoReserva: 'FINALIZADA' } : res
        ));
      } catch (error) {
        showErrorToast(error, toast);
      } finally {
        setFinalizandoId(null);
      }
    }
  };

  return (
    <div className="gestion-reservas-container">
      <Helmet>
        <title>Novost - Gestionar Reservas</title>
      </Helmet>

      <div className="gestion-header">
        <h2>Panel de Reservas</h2>
        <p>Visualiza y filtra todas las reservas actuales del sistema</p>
      </div>

      <div className="filtros-card">
        <div className="filtros-grid">
          <div className="filtro-group">
            <label htmlFor="fecha">Fecha</label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={filtros.fecha}
              onChange={handleFilterChange}
              className="filtro-input"
            />
          </div>
          <div className="filtro-group">
            <label htmlFor="hora">Hora</label>
            <select
              id="hora"
              name="hora"
              value={filtros.hora}
              onChange={handleFilterChange}
              className="filtro-input"
            >
              <option value="">Todas...</option>
              {generarHorasDisponibles().map((hora) => (
                <option key={hora} value={hora}>{hora.substring(0, 5)}</option>
              ))}
            </select>
          </div>
          <div className="filtro-group">
            <label htmlFor="personas">N° Personas</label>
            <input
              type="number"
              id="personas"
              name="personas"
              min="1"
              max="5"
              value={filtros.personas}
              onChange={handleFilterChange}
              className="filtro-input"
              placeholder="#"
            />
          </div>
          <div className="filtro-group-checkbox">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              name="estado"
              value={filtros.estado}
              onChange={handleFilterChange}
              className="filtro-input"
            >
              <option value="">Todas</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="PAGADA">Pagada</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="FINALIZADA">Finalizada</option>
            </select>
          </div>
          <div className="filtro-actions">
            <button onClick={limpiarFiltros} className="btn-limpiar">
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      <div className="tabla-container">
        {loading && <p className="loading-text">Buscando reservas...</p>}
        
        {!loading && reservas.length === 0 ? (
          <div className="no-data">No se encontraron reservas con estos filtros.</div>
        ) : (
          <table className="reservas-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Mesa</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Personas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((res) => (
                <tr key={res.idReserva}>
                  <td>#{res.idReserva}</td>
                  <td>
                    <strong>{res.nombreUsuario}</strong>
                    <br />
                    <span className="text-small">{res.cedulaUsuario}</span>
                  </td>
                  <td>{res.numeroMesa ? `Mesa ${res.numeroMesa}` : 'Sin asignar'}</td>
                  <td>{res.fecha}</td>
                  <td>{res.horaInicio} - {res.horaFin}</td>
                  <td>{res.numPersonas}</td>
                  <td>
                    <span className={`badge estado-${res.estadoReserva?.toLowerCase()}`}>
                      {res.estadoReserva}
                    </span>
                  </td>
                  <td>
                    {res.estadoReserva === 'PAGADA' && (
                      <button 
                        className="btn-finalizar"
                        onClick={() => finalizarReserva(res.idReserva)}
                        disabled={finalizandoId === res.idReserva}
                      >
                        {finalizandoId === res.idReserva ? 'Finalizando...' : 'Finalizar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GestionarReservas;