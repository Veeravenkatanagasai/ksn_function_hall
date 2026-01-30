// src/services/dashboard.service.js
import api from "./api"; // adjust path if needed

export const getDashboardStats = async (filters) => {
  const response = await api.get("/datefilter/dashboard", {
    params: filters,
  });

  return response.data;
};
