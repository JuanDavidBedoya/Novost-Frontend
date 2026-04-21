import axios from 'axios';

// Configuración centralizada de la instancia axios con interceptores para autenticación

const api = axios.create({
  baseURL: 'http://18.190.234.243' //URL de Despliegue
  //baseURL: 'http://localhost:8080',  URL de Producción
});

// Interceptor de solicitud: añade token JWT al header Authorization si existe

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

// Interceptor de respuesta: maneja errores 401 (no autorizado) limpiando sesión y redirigiendo al login

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('cedula');
        localStorage.removeItem('usuario');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
