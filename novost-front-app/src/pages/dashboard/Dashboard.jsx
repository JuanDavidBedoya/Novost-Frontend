import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Calendar, Clock, DollarSign, ArrowLeft, Loader, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import api from '../../api/apiConfig';

const Dashboard = () => {
  const navigate = useNavigate();
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));
  const nombreUsuario = usuarioLocal ? usuarioLocal.nombre.split(' ')[0] : 'Admin';
  
  // Estado para cambiar entre pestañas
  const [pestañaActiva, setPestañaActiva] = useState('finanzas');

  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      // 1. Usamos api.get (no api.fetch). 
      // 2. Asegúrate de poner la ruta completa que definimos en el Controller
      const response = await api.get('/dashboard/finanzas');
      
      // 3. En Axios, la información siempre viene dentro de 'response.data'
      setDatos(response.data); 
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchDashboardData();
}, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip" style={{
          background: '#ffffff',
          border: '2px solid #a03ce6',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 8px 25px rgba(160, 60, 230, 0.25)'
        }}>
          <p style={{ 
            color: '#666666', 
            fontSize: '0.7rem', 
            textTransform: 'uppercase', 
            letterSpacing: '1px',
            margin: '0 0 4px 0',
            fontWeight: 600
          }}>
            {label}
          </p>
          <p style={{ 
            color: '#1a1a1a', 
            fontSize: '1.1rem', 
            margin: 0, 
            fontWeight: 700 
          }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader size={36} style={{ animation: 'spin 1s linear infinite' }} />
        <h2>Cargando estadísticas...</h2>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Helmet>
        <title>Novost — Dashboard</title>
      </Helmet>

      {}
      <section className="dashboard-hero">

        <div className="hero-welcome-corner">
          <div className="role-badge">Administrador</div>
          <p className="welcome-text">Bienvenido, <span>{nombreUsuario}</span></p>
          <div className="hero-divider" />
        </div>

        <div className="hero-main-content">
          <h1 className="hero-title">
            Dashboard<br /><span>Novost</span>
          </h1>
          <p className="hero-description">
            Administra y monitorea el rendimiento del restaurante.
          </p>
        </div>
      </section>

      {}
      <div className="dashboard-tabs">
        <button 
          className={`dashboard-tab ${pestañaActiva === 'finanzas' ? 'active' : 'inactive'}`}
          onClick={() => setPestañaActiva('finanzas')}
        >
          <DollarSign size={18} />
          Estadísticas Financieras
        </button>
        <button 
          className={`dashboard-tab ${pestañaActiva === 'reservas' ? 'active' : 'inactive'}`}
          onClick={() => setPestañaActiva('reservas')}
        >
          <Calendar size={18} />
          Información Reservas
        </button>
      </div>

      {}
      {pestañaActiva === 'finanzas' && (
        <>
          {}
          <section className="kpi-section">
            <div className="kpi-card">
              <div className="kpi-icon"><Clock size={24} /></div>
              <div className="kpi-info">
                <p>Ingresos hoy</p>
                <h3>{formatCurrency(datos?.kpiHoy || 0)}</h3>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon"><Calendar size={24} /></div>
              <div className="kpi-info">
                <p>Esta semana</p>
                <h3>{formatCurrency(datos?.kpiSemana || 0)}</h3>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon"><TrendingUp size={24} /></div>
              <div className="kpi-info">
                <p>Total acumulado · año</p>
                <h3>{formatCurrency(datos?.kpiTotal || 0)}</h3>
              </div>
            </div>
          </section>

          {}
          <section className="charts-section">
            <div className="charts-section-header">
              <h2>Análisis financiero</h2>
              <span>Período activo</span>
            </div>

            <div className="charts-grid">
              {/* Ingresos del día */}
              <div className="chart-card">
                <h3><Clock size={16} /> Ingresos del día · por hora</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={datos?.chartHoy || []} barCategoryGap="35%">
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a03ce6" stopOpacity={1} />
                          <stop offset="100%" stopColor="#7b2cb5" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 6" stroke="rgba(0,0,0,0.08)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke="transparent"
                        tick={{ fill: '#666666', fontSize: 11, fontFamily: "'Inter', sans-serif" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="transparent"
                        tick={{ fill: '#666666', fontSize: 11, fontFamily: "'Inter', sans-serif" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `$${val}`}
                        width={45}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(160,60,230,0.08)' }} />
                      <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Ingresos de la semana */}
              <div className="chart-card">
                <h3><Calendar size={16} /> Ingresos de la semana</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={datos?.chartSemana || []}>
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#a03ce6" />
                          <stop offset="100%" stopColor="#e94560" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 6" stroke="rgba(0,0,0,0.08)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke="transparent"
                        tick={{ fill: '#666666', fontSize: 11, fontFamily: "'Inter', sans-serif" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="transparent"
                        tick={{ fill: '#666666', fontSize: 11, fontFamily: "'Inter', sans-serif" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `$${val}`}
                        width={45}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="url(#lineGradient)"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#a03ce6', stroke: '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 8, fill: '#e94560', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Ingresos históricos */}
              <div className="chart-card full-width">
                <h3><DollarSign size={16} /> Ingresos históricos · año actual</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={datos?.chartMeses || []}>
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a03ce6" stopOpacity={0.35} />
                          <stop offset="50%" stopColor="#7b2cb5" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#a03ce6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 6" stroke="rgba(0,0,0,0.08)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke="transparent"
                        tick={{ fill: '#666666', fontSize: 11, fontFamily: "'Inter', sans-serif" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="transparent"
                        tick={{ fill: '#666666', fontSize: 11, fontFamily: "'Inter', sans-serif" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `$${val}`}
                        width={50}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#a03ce6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#areaGradient)"
                        dot={false}
                        activeDot={{ r: 6, fill: '#e94560', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {pestañaActiva === 'reservas' && (
        <section className="reservas-section">
          <div className="charts-section-header">
            <h2>Información de Reservas</h2>
            <span>Gestión total</span>
          </div>
          
          <div className="reservas-placeholder">
            <BarChart3 size={64} />
            <h3>Sección de Reservas</h3>
            <p>Aquí se mostrará la información de reservas del restaurante.</p>
            <button 
              className="btn-ir-reservas"
              onClick={() => navigate('/gestionar-reservas')}
            >
              Ir a Gestionar Reservas
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
