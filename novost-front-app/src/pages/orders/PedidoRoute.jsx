import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GestionarPedidos from './GesitionPedidos'; // Respeta el nombre de tu archivo

const PedidoRoute = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hasPedidoAccess = sessionStorage.getItem('pedidoAccess') === 'true';
    if (!hasPedidoAccess) {
      // ✅ replace:true evita que /gestionar-pedidos quede huérfano en el historial
      navigate('/gestionar-pedidos-code', { replace: true });
    }
  }, [navigate]);

  return <GestionarPedidos />;
};

export default PedidoRoute;