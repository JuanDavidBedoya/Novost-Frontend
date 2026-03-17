import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

const useTokenExpiration = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Escuchamos cambios de ruta

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('cedula');
    localStorage.removeItem('usuario');
    sessionStorage.clear();

    Swal.fire({
      title: 'Sesión expirada',
      text: 'Tu sesión ha alcanzado el límite de 60 minutos por seguridad. Por favor, inicia sesión nuevamente.',
      icon: 'warning',
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
    const token = localStorage.getItem('token');
    if (!token) return; // Si no hay token, no hacemos nada

    try {
      // 1. Desencriptamos el JWT de forma nativa
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
      
      const decodedToken = JSON.parse(jsonPayload);

      // 2. Calculamos el tiempo restante

      const expirationTime = decodedToken.exp * 1000; 
      const currentTime = Date.now();
      const timeLeft = expirationTime - currentTime;

      // 3. Verificamos si ya expiró o si programamos el temporizador
      if (timeLeft <= 0) {
        handleLogout();
      } else {
        const timer = setTimeout(() => {
          handleLogout();
        }, timeLeft);

        // Limpiamos el temporizador si el componente se desmonta
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error("Error al procesar el token:", error);
      handleLogout(); // Si el token está corrupto, lo más seguro es cerrar sesión
    }
  }, [handleLogout, location.pathname]); // Se re-evalúa si el usuario navega a otra pantalla
};

export default useTokenExpiration;