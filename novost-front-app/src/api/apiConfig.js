import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // Ajusta al puerto de tu Spring Boot
});

// Interceptor para agregar el token JWT a todas las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores 401 (Unauthorized) - Token expirado o inválido
    if (error.response && error.response.status === 401) {
      // Limpiar localStorage y redirigir al login si el token expiró
      const token = localStorage.getItem('token');
      if (token) {
        // Token presente pero rechazado - posiblemente expiró
        localStorage.removeItem('token');
        localStorage.removeItem('cedula');
        localStorage.removeItem('usuario');
        // Redirigir al login si no estamos ya ahí
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
