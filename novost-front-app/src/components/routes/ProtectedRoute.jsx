import { Navigate } from 'react-router-dom';

//Protección de Rutras para administradores, trabahjadores y clientes

const ProtectedRoute = ({ children, allowedRoles }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(usuario.rol)) {
    const paths = {
      ADMINISTRADOR: '/admin-home',
      TRABAJADOR: '/worker-home',
      CLIENTE: '/home'
    };
    return <Navigate to={paths[usuario.rol] || '/home'} replace />;
  }

  return children;
};

export default ProtectedRoute;