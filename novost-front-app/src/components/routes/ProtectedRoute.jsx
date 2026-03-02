import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // 1. ¿Está logueado?
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // 2. ¿Tiene el rol permitido para esta ruta específica?
  if (allowedRoles && !allowedRoles.includes(usuario.rol)) {
    // Si no tiene permiso, lo mandamos a su propia home para que no vea una pantalla en blanco
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