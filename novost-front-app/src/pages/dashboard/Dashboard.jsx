import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  TrendingUp, Calendar, Clock, DollarSign,
  Loader, BarChart3, UtensilsCrossed, Tag, Users, ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import api from '../../api/apiConfig';

// ── Paleta de colores para las gráficas de platos ────────────────────────────
const COLORES_PLATOS = [
  '#a03ce6', '#e94560', '#00c2d4', '#f59e0b',
  '#16a34a', '#6366f1', '#ec4899', '#0ea5e9',
  '#84cc16', '#f97316'
];

const COLORES_ESTADOS = {
  PENDIENTE: '#f59e0b',
  PAGADA:    '#16a34a',
  CANCELADA: '#dc2626'
};

const COLORES_CATEGORIAS = ['#a03ce6', '#e94560', '#00c2d4', '#f59e0b', '#16a34a', '#6366f1'];

const Dashboard = () => {
  const navigate = useNavigate();
  const usuarioLocal  = JSON.parse(localStorage.getItem('usuario'));
  const nombreUsuario = usuarioLocal ? usuarioLocal.nombre.split(' ')[0] : 'Admin';

  const [pestañaActiva, setPestañaActiva] = useState('finanzas');
  const [datos,         setDatos]         = useState(null);
  const [datosPlatos,   setDatosPlatos]   = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [loadingPlatos,   setLoadingPlatos]   = useState(false);
  const [datosClientes,   setDatosClientes]   = useState(null);
  const [loadingClientes, setLoadingClientes] = useState(false);

  // Carga financiera al montar
  useEffect(() => {
    const fetchFinanzas = async () => {
      try {
        const response = await api.get('/dashboard/finanzas');
        setDatos(response.data);
      } catch (error) {
        console.error('Error financiero:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFinanzas();
  }, []);

  // Carga de platos al cambiar a esa pestaña
  useEffect(() => {
    if (pestañaActiva !== 'platos' || datosPlatos) return;
    const fetchPlatos = async () => {
      setLoadingPlatos(true);
      try {
        const response = await api.get('/dashboard/platos');
        setDatosPlatos(response.data);
      } catch (error) {
        console.error('Error platos:', error);
      } finally {
        setLoadingPlatos(false);
      }
    };
    fetchPlatos();
  }, [pestañaActiva, datosPlatos]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-US', {
      style: 'currency', currency: 'USD', maximumFractionDigits: 2
    }).format(value);

  // ── Tooltip financiero ────────────────────────────────────────────────────
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#ffffff', border: '2px solid #a03ce6',
          borderRadius: '12px', padding: '12px 16px',
          boxShadow: '0 8px 25px rgba(160,60,230,0.25)'
        }}>
          <p style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase',
            letterSpacing: '1px', margin: '0 0 4px', fontWeight: 600 }}>{label}</p>
          <p style={{ color: '#1a1a1a', fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Carga de clientes al cambiar a esa pestaña
  useEffect(() => {
    if (pestañaActiva !== 'clientes' || datosClientes) return;
    const fetchClientes = async () => {
      setLoadingClientes(true);
      try {
        const response = await api.get('/dashboard/clientes');
        setDatosClientes(response.data);
      } catch (error) {
        console.error('Error clientes:', error);
      } finally {
        setLoadingClientes(false);
      }
    };
    fetchClientes();
  }, [pestañaActiva, datosClientes]);

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
      <Helmet><title>Novost — Dashboard</title></Helmet>

      {/* ── Hero ── */}
      <section className="dashboard-hero">
        <div className="hero-welcome-corner">
          <div className="role-badge">Administrador</div>
          <p className="welcome-text">Bienvenido, <span>{nombreUsuario}</span></p>
          <div className="hero-divider" />
        </div>
        <div className="hero-main-content">
          <h1 className="hero-title">Dashboard<br /><span>Novost</span></h1>
          <p className="hero-description">
            Administra y monitorea el rendimiento del restaurante.
          </p>
        </div>
      </section>

      {/* ── Tabs ── */}
      <div className="dashboard-tabs">
        <button className={`dashboard-tab ${pestañaActiva === 'finanzas' ? 'active' : 'inactive'}`}
          onClick={() => setPestañaActiva('finanzas')}>
          <DollarSign size={18} /> Estadísticas Financieras
        </button>
        <button className={`dashboard-tab ${pestañaActiva === 'platos' ? 'active' : 'inactive'}`}
          onClick={() => setPestañaActiva('platos')}>
          <UtensilsCrossed size={18} /> Análisis de Platos
        </button>
        <button className={`dashboard-tab ${pestañaActiva === 'clientes' ? 'active' : 'inactive'}`}
          onClick={() => setPestañaActiva('clientes')}>
          <Users size={18} /> Análisis de Clientes
        </button>
      </div>

      {/* ── Pestaña FINANZAS ── */}
      {pestañaActiva === 'finanzas' && (
        <>
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

          <section className="charts-section">
            <div className="charts-section-header">
              <h2>Análisis financiero</h2>
              <span>Período activo</span>
            </div>
            <div className="charts-grid">
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
                      <XAxis dataKey="label" stroke="transparent"
                        tick={{ fill: '#666666', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="transparent"
                        tick={{ fill: '#666666', fontSize: 11 }} axisLine={false} tickLine={false}
                        tickFormatter={(v) => `$${v}`} width={45} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(160,60,230,0.08)' }} />
                      <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

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
                      <XAxis dataKey="label" stroke="transparent"
                        tick={{ fill: '#666666', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="transparent"
                        tick={{ fill: '#666666', fontSize: 11 }} axisLine={false} tickLine={false}
                        tickFormatter={(v) => `$${v}`} width={45} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="total" stroke="url(#lineGradient)"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#a03ce6', stroke: '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 8, fill: '#e94560', stroke: '#ffffff', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card full-width">
                <h3><DollarSign size={16} /> Ingresos históricos · año actual</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={datos?.chartMeses || []}>
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#a03ce6" stopOpacity={0.35} />
                          <stop offset="50%"  stopColor="#7b2cb5" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#a03ce6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 6" stroke="rgba(0,0,0,0.08)" vertical={false} />
                      <XAxis dataKey="label" stroke="transparent"
                        tick={{ fill: '#666666', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="transparent"
                        tick={{ fill: '#666666', fontSize: 11 }} axisLine={false} tickLine={false}
                        tickFormatter={(v) => `$${v}`} width={50} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="total" stroke="#a03ce6" strokeWidth={3}
                        fillOpacity={1} fill="url(#areaGradient)" dot={false}
                        activeDot={{ r: 6, fill: '#e94560', stroke: '#ffffff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── Pestaña PLATOS ── */}
      {pestañaActiva === 'platos' && (
        <section className="charts-section">
          <div className="charts-section-header">
            <h2>Análisis de Platos</h2>
            <span>Hoy</span>
          </div>

          {loadingPlatos ? (
            <div className="dashboard-loading" style={{ minHeight: '40vh' }}>
              <Loader size={32} style={{ animation: 'spin 1s linear infinite', color: '#a03ce6' }} />
              <p style={{ color: '#666' }}>Cargando datos de platos...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : !datosPlatos || datosPlatos.totalUnidadesHoy === 0 ? (
            <div className="reservas-placeholder">
              <UtensilsCrossed size={64} />
              <h3>Sin ventas registradas hoy</h3>
              <p>Los datos aparecerán aquí cuando haya pedidos pagados o entregados en el día.</p>
            </div>
          ) : (
            <div className="charts-grid">

              {/* ── Evolución de ventas por hora ── */}
              <div className="chart-card full-width">
                <h3><Clock size={16} /> Evolución de ventas por hora · unidades vendidas</h3>
                <div className="chart-wrapper" style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={datosPlatos.ventasPorHora}>
                      <defs>
                        <linearGradient id="horaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#a03ce6" stopOpacity={0.4} />
                          <stop offset="50%"  stopColor="#7b2cb5" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#a03ce6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 6" stroke="rgba(0,0,0,0.08)" vertical={false} />
                      <XAxis dataKey="label" stroke="transparent"
                        tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="transparent" allowDecimals={false}
                        tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false}
                        tickFormatter={(v) => `${v} uds`} width={52} />
                      <Tooltip
                        formatter={(value) => [`${value} unidades`, 'Vendidas']}
                        contentStyle={{ borderRadius: '12px', border: '2px solid #a03ce6' }}
                      />
                      <Area type="monotone" dataKey="total" stroke="#a03ce6" strokeWidth={3}
                        fillOpacity={1} fill="url(#horaGrad)" dot={false}
                        activeDot={{ r: 6, fill: '#e94560', stroke: '#ffffff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── Tabla de rendimiento de platos ── */}
              <div className="chart-card">
                <h3><BarChart3 size={16} /> Rendimiento de platos del día</h3>
                <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f0f0f5' }}>
                        {['#', 'Plato', 'Unidades', 'Ingresos', '% Total'].map((col, i) => (
                          <th key={i} style={{
                            padding: '0.6rem 0.75rem',
                            textAlign: i >= 2 ? 'right' : 'left',
                            fontSize: '0.7rem', fontWeight: 800,
                            textTransform: 'uppercase', letterSpacing: '0.6px',
                            color: '#9ca3af', whiteSpace: 'nowrap'
                          }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datosPlatos.platosDia.map((plato, i) => (
                        <tr key={i} style={{
                          borderBottom: '1px solid #f7f7f9',
                          transition: 'background 0.15s'
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Posición con color del pie */}
                          <td style={{ padding: '0.75rem', width: '32px' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center',
                              justifyContent: 'center',
                              width: '22px', height: '22px', borderRadius: '50%',
                              background: COLORES_PLATOS[i % COLORES_PLATOS.length],
                              color: '#fff', fontSize: '0.68rem', fontWeight: 800
                            }}>{i + 1}</span>
                          </td>
                          {/* Nombre */}
                          <td style={{
                            padding: '0.75rem', fontWeight: 700,
                            color: '#1a1a2e', maxWidth: '160px',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                          }}>{plato.nombrePlato}</td>
                          {/* Unidades */}
                          <td style={{
                            padding: '0.75rem', textAlign: 'right',
                            fontWeight: 700, color: '#374151'
                          }}>{plato.cantidadVendida}</td>
                          {/* Ingresos */}
                          <td style={{
                            padding: '0.75rem', textAlign: 'right',
                            fontWeight: 800, color: '#a03ce6'
                          }}>{formatCurrency(plato.ingresos)}</td>
                          {/* Porcentaje con barra visual */}
                          <td style={{ padding: '0.75rem', textAlign: 'right', minWidth: '80px' }}>
                            <div style={{ display: 'flex', alignItems: 'center',
                              justifyContent: 'flex-end', gap: '6px' }}>
                              <div style={{
                                width: '48px', height: '6px',
                                background: '#f0f0f5', borderRadius: '3px', overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${plato.porcentaje}%`, height: '100%',
                                  background: COLORES_PLATOS[i % COLORES_PLATOS.length],
                                  borderRadius: '3px'
                                }} />
                              </div>
                              <span style={{ fontWeight: 700, color: '#374151',
                                fontSize: '0.8rem', minWidth: '36px', textAlign: 'right' }}>
                                {plato.porcentaje}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Fila de totales */}
                    <tfoot>
                      <tr style={{ borderTop: '2px solid #f0f0f5' }}>
                        <td colSpan={2} style={{
                          padding: '0.75rem', fontWeight: 800,
                          fontSize: '0.8rem', color: '#6b7280',
                          textTransform: 'uppercase', letterSpacing: '0.5px'
                        }}>Total del día</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right',
                          fontWeight: 900, color: '#1a1a2e' }}>
                          {datosPlatos.totalUnidadesHoy} uds
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right',
                          fontWeight: 900, color: '#a03ce6' }}>
                          {formatCurrency(
                            datosPlatos.platosDia.reduce((acc, p) => acc + p.ingresos, 0)
                          )}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right',
                          fontWeight: 900, color: '#374151' }}>100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* ── Pie chart categorías ── */}
              <div className="chart-card">
                <h3><Tag size={16} /> Ventas por categoría</h3>
                <div className="chart-wrapper" style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={datosPlatos.categorias}
                        dataKey="cantidadVendida"
                        nameKey="nombreCategoria"
                        cx="50%" cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={3}
                        label={({ nombreCategoria, porcentaje }) =>
                          porcentaje >= 8 ? `${porcentaje}%` : ''
                        }
                        labelLine={false}
                      >
                        {datosPlatos.categorias.map((_, i) => (
                          <Cell key={i} fill={COLORES_CATEGORIAS[i % COLORES_CATEGORIAS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value} uds · ${props.payload.porcentaje}% · ${formatCurrency(props.payload.ingresos)}`,
                          props.payload.nombreCategoria
                        ]}
                        contentStyle={{ borderRadius: '12px', border: '2px solid #a03ce6' }}
                      />
                      <Legend
                        formatter={(value) => (
                          <span style={{ fontSize: '0.78rem', color: '#444', fontWeight: 600 }}>
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}
        </section>
      )}
      {/* ── Pestaña CLIENTES ── */}
      {pestañaActiva === 'clientes' && (
        <section className="charts-section">
          <div className="charts-section-header">
            <h2>Análisis de Clientes</h2>
            <span>Hoy y esta semana</span>
          </div>

          {loadingClientes ? (
            <div className="dashboard-loading" style={{ minHeight: '40vh' }}>
              <Loader size={32} style={{ animation: 'spin 1s linear infinite', color: '#a03ce6' }} />
              <p style={{ color: '#666' }}>Cargando datos de clientes...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              {/* ── KPI cards ── */}
              <section className="kpi-section" style={{ marginBottom: '2rem' }}>
                <div className="kpi-card">
                  <div className="kpi-icon"><ShoppingBag size={24} /></div>
                  <div className="kpi-info">
                    <p>Pedidos hoy</p>
                    <h3>{datosClientes?.pedidosHoy ?? 0}</h3>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon"><TrendingUp size={24} /></div>
                  <div className="kpi-info">
                    <p>Pedidos esta semana</p>
                    <h3>{datosClientes?.pedidosSemana ?? 0}</h3>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon"><Calendar size={24} /></div>
                  <div className="kpi-info">
                    <p>Reservas hoy</p>
                    <h3>{datosClientes?.reservasHoy ?? 0}</h3>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon"><Users size={24} /></div>
                  <div className="kpi-info">
                    <p>Reservas esta semana</p>
                    <h3>{datosClientes?.reservasSemana ?? 0}</h3>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon"><ShoppingBag size={24} /></div>
                  <div className="kpi-info">
                    <p>Pedidos este mes</p>
                    <h3>{datosClientes?.pedidosMes ?? 0}</h3>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon"><Calendar size={24} /></div>
                  <div className="kpi-info">
                    <p>Reservas este mes</p>
                    <h3>{datosClientes?.reservasMes ?? 0}</h3>
                  </div>
                </div>
              </section>

              {/* ── Gráficas ── */}
              <div className="charts-grid">

                {/* Pedidos por día de semana */}
                <div className="chart-card">
                  <h3><ShoppingBag size={16} /> Pedidos por día · semana actual</h3>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={datosClientes?.chartPedidosSemana || []} barCategoryGap="35%">
                        <defs>
                          <linearGradient id="pedidosGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#a03ce6" stopOpacity={1} />
                            <stop offset="100%" stopColor="#7b2cb5" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 6" stroke="rgba(0,0,0,0.08)" vertical={false} />
                        <XAxis dataKey="label" stroke="transparent"
                          tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="transparent" allowDecimals={false}
                          tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false}
                          width={30} />
                        <Tooltip
                          formatter={(v) => [`${v} pedidos`, 'Total']}
                          contentStyle={{ borderRadius: '12px', border: '2px solid #a03ce6' }}
                          cursor={{ fill: 'rgba(160,60,230,0.08)' }}
                        />
                        <Bar dataKey="total" fill="url(#pedidosGrad)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Reservas por día de semana */}
                <div className="chart-card">
                  <h3><Calendar size={16} /> Reservas por día · semana actual</h3>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={datosClientes?.chartReservasSemana || []} barCategoryGap="35%">
                        <defs>
                          <linearGradient id="reservasGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#e94560" stopOpacity={1} />
                            <stop offset="100%" stopColor="#c0304a" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 6" stroke="rgba(0,0,0,0.08)" vertical={false} />
                        <XAxis dataKey="label" stroke="transparent"
                          tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="transparent" allowDecimals={false}
                          tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false}
                          width={30} />
                        <Tooltip
                          formatter={(v) => [`${v} reservas`, 'Total']}
                          contentStyle={{ borderRadius: '12px', border: '2px solid #e94560' }}
                          cursor={{ fill: 'rgba(233,69,96,0.08)' }}
                        />
                        <Bar dataKey="total" fill="url(#reservasGrad)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Estados de reservas de la semana */}
                <div className="chart-card full-width">
                  <h3><Calendar size={16} /> Estado de reservas · semana actual</h3>
                  <div className="chart-wrapper" style={{ height: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={datosClientes?.reservasPorEstado || []}
                        barCategoryGap="45%"
                        margin={{ top: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 6" stroke="rgba(0,0,0,0.08)" vertical={false} />
                        <XAxis dataKey="label" stroke="transparent"
                          tick={{ fill: '#1a1a2e', fontSize: 13, fontWeight: 700 }}
                          axisLine={false} tickLine={false} />
                        <YAxis stroke="transparent" allowDecimals={false}
                          tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false}
                          width={30} />
                        <Tooltip
                          formatter={(v, name, props) => [
                            `${v} reservas`,
                            props.payload.label
                          ]}
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                        />
                        <Bar dataKey="total" radius={[8, 8, 0, 0]}
                          label={{
                            position: 'top',
                            formatter: (v) => v > 0 ? v : '',
                            fill: '#666', fontSize: 12, fontWeight: 700
                          }}>
                          {(datosClientes?.reservasPorEstado || []).map((entry) => (
                            <Cell
                              key={entry.label}
                              fill={COLORES_ESTADOS[entry.label] || '#9ca3af'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Leyenda manual */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem',
                    marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    {Object.entries(COLORES_ESTADOS).map(([estado, color]) => (
                      <div key={estado} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px',
                          background: color }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
                          {estado}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </>
          )}
        </section>
      )}

    </div>
  );
};

export default Dashboard;