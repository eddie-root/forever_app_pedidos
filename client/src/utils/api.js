import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL,
  withCredentials: true, // 👈 ESSA LINHA RESOLVE
  headers: { 'Content-Type': 'application/json' }
});

export default api