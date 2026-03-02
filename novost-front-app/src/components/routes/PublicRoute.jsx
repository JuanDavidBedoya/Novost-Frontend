import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  
  if (usuario) {
    // Si ya está logueado, lo mandamos a su home según su rol
    const paths = {
      ADMINISTRADOR: '/admin-home',
      TRABAJADOR: '/worker-home',
      CLIENTE: '/home'
    };
    return <Navigate to={paths[usuario.rol] || '/home'} replace />;
  }

  return children;
};

export default PublicRoute;