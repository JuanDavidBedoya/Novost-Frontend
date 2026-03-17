import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2'; 

const useIdleTimeout = (timeoutMinutes = 10) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = useCallback(() => {

    localStorage.clear();
    sessionStorage.clear(); 

    Swal.fire({
      title: 'Sesión finalizada',
      text: 'Tu sesión ha sido cerrada automáticamente por inactividad.',
      icon: 'info',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#8a2be2',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {

      if (result.isConfirmed) {
        navigate('/login');

        window.location.reload();
      }
    });
  }, [navigate]);

  useEffect(() => {

    const excludedRoutes = [
      '/login', 
      '/register', 
      '/forgot-password', 
      '/restaurar-password', 
      '/terminos',
      '/' 
    ];
    // Si la ruta actual está en la lista de excluidas, abortamos y no creamos el temporizador
    if (excludedRoutes.includes(location.pathname)) {
      return;
    }
    let timer;

    const resetTimer = () => {

      if (Swal.isVisible()) return;

      if (timer) clearTimeout(timer);
      timer = setTimeout(handleLogout, timeoutMinutes * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach(event => document.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [handleLogout, timeoutMinutes, location.pathname]);
};

export default useIdleTimeout;