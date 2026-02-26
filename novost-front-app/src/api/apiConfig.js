import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // Ajusta al puerto de tu Spring Boot
});

export default api;