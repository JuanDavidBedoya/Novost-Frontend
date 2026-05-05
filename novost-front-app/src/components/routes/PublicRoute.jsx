import { Navigate } from 'react-router-dom';

//Rutas públicas

const PublicRoute = ({ children }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  
  if (usuario) {
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