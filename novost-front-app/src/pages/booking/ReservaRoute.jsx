import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GestionarReservas from './GestionarReservas';

const ReservaRoute = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario tiene acceso mediante el PIN
    const hasReservaAccess = sessionStorage.getItem('reservaAccess') === 'true';
    if (!hasReservaAccess) {
      // Si no tiene acceso, redirigir a la página de pedir el PIN
      navigate('/gestionar-reservas-code', { replace: true });
    }
  }, [navigate]);

  // Si tiene acceso, mostrar el componente real
  return <GestionarReservas />;
};

export default ReservaRoute;