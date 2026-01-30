import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  
  headers: { "Content-Type": "application/json" },
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");

  const token = adminToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
export default api;
