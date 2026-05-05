import React, { useState, useEffect } from 'react';
import {
  Package, AlertTriangle, TrendingUp, Scale,
  Droplets, Box, Loader
} from 'lucide-react';
import api from '../../api/apiConfig';
import './Dashboard.css';

//Muestra un Resumen del Inventario

const InventarioResumen = () => {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //Carga y Muestra el resumen

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const response = await api.get('/inventario/dashboard');
        setDatos(response.data);
      } catch (err) {
        console.error('Error obteniendo datos de inventario:', err);
        setError('Error al cargar los datos de inventario');
      } finally {
        setLoading(false);
      }
    };
    fetchInventario();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader size={36} style={{ animation: 'spin 1s linear infinite' }} />
        <h2>Cargando inventario...</h2>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertTriangle size={36} />
        <h2>{error}</h2>
      </div>
    );
  }

  const { resumenGeneral, productosStockMinimo, productosMasUtilizados, consumoTotalDia } = datos || {};
  const tieneStockMinimo = productosStockMinimo && productosStockMinimo.length > 0;

  return (
    <div className="inventario-resumen">
      {/* KPI Section */}
      <section className="kpi-section">
        <div className="kpi-card">
          <div className="kpi-icon"><Package size={24} /></div>
          <div className="kpi-info">
            <p>Total Productos</p>
            <h3>{resumenGeneral?.totalProductos || 0}</h3>
          </div>
        </div>

        <div className="kpi-card" style={tieneStockMinimo ? {
          border: '2px solid #dc2626',
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
        } : {}}>
          <div className="kpi-icon" style={tieneStockMinimo ? { color: '#dc2626' } : {}}>
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-info">
            <p>Stock Mínimo</p>
            <h3 style={tieneStockMinimo ? { color: '#dc2626' } : {}}>
              {resumenGeneral?.productosPorDebajoMinimo || 0}
            </h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon"><TrendingUp size={24} /></div>
          <div className="kpi-info">
            <p>Consumo Hoy</p>
            <h3>{consumoTotalDia?.toFixed(2) || 0}</h3>
          </div>
        </div>
      </section>

      {/* Stock por tipo de medida */}
      <section className="charts-section">
        <div className="charts-section-header">
          <h2>Resumen de Inventario</h2>
          <span>Estado actual</span>
        </div>

        <div className="charts-grid">
          {/* Stock en Kilos */}
          <div className="chart-card">
            <h3><Scale size={16} /> Stock Total en Kilos</h3>
            <div className="stock-value-display">
              <span className="stock-number">{resumenGeneral?.stockTotalKilos?.toFixed(2) || 0}</span>
              <span className="stock-unit">kg</span>
            </div>
          </div>

          {/* Stock en Litros */}
          <div className="chart-card">
            <h3><Droplets size={16} /> Stock Total en Litros</h3>
            <div className="stock-value-display">
              <span className="stock-number">{resumenGeneral?.stockTotalLitros?.toFixed(2) || 0}</span>
              <span className="stock-unit">L</span>
            </div>
          </div>

          {/* Stock en Unidades */}
          <div className="chart-card">
            <h3><Box size={16} /> Total Unidades</h3>
            <div className="stock-value-display">
              <span className="stock-number">{resumenGeneral?.totalUnidades || 0}</span>
              <span className="stock-unit">unid.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Productos con stock mínimo */}
      {tieneStockMinimo && (
        <section className="charts-section">
          <div className="charts-section-header" style={{ color: '#dc2626' }}>
            <h2><AlertTriangle size={18} /> Productos en Stock Mínimo</h2>
            <span>Requieren reposición</span>
          </div>

          <div className="stock-minimo-list">
            {productosStockMinimo.map((producto) => (
              <div key={producto.idAlimento} className="stock-minimo-item">
                <div className="producto-info">
                  <span className="producto-nombre">{producto.nombreAlimento}</span>
                  <span className="producto-categoria">{producto.tipoMedida}</span>
                </div>
                <div className="producto-stock">
                  <span className="stock-actual">{producto.stockActual}</span>
                  <span className="stock-separador">/</span>
                  <span className="stock-minimo">{producto.stockMinimo}</span>
                  <span className="stock-unidad">{producto.tipoMedida}</span>
                </div>
                <div className="stock-bar-container">
                  <div
                    className="stock-bar-fill"
                    style={{
                      width: `${Math.min((producto.stockActual / producto.stockMinimo) * 100, 100)}%`,
                      background: producto.stockActual === 0 ? '#dc2626' : '#f59e0b'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Productos más utilizados */}
      {productosMasUtilizados && productosMasUtilizados.length > 0 && (
        <section className="charts-section">
          <div className="charts-section-header">
            <h2><TrendingUp size={18} /> Productos Más Utilizados</h2>
            <span>Top consumption</span>
          </div>

          <div className="mas-utilizados-list">
            {productosMasUtilizados.map((producto, index) => (
              <div key={producto.idAlimento} className="mas-utilizado-item">
                <div className="ranking-badge">{index + 1}</div>
                <div className="producto-info">
                  <span className="producto-nombre">{producto.nombreAlimento}</span>
                  <span className="producto-categoria">{producto.tipoMedida}</span>
                </div>
                <div className="producto-stock">
                  <span className="stock-actual">{producto.stockActual}</span>
                  <span className="stock-unidad">{producto.tipoMedida}</span>
                </div>
                {producto.ultimoConsumo > 0 && (
                  <div className="consumo-badge">
                    -{producto.ultimoConsumo.toFixed(1)} {producto.tipoMedida}/mes
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default InventarioResumen;