import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Stock from './Stock';

const StockRoute = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario tiene acceso al stock
    const hasStockAccess = sessionStorage.getItem('stockAccess') === 'true';
    if (!hasStockAccess) {
      // Si no tiene acceso, redirigir a la página de código
      navigate('/stock-code', { replace: true });
    }
  }, [navigate]);

  // Si tiene acceso, mostrar el componente Stock
  return <Stock />;
};

export default StockRoute;
