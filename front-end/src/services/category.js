// src/services/category.service.js
import api from "./api"; // adjust path if needed

export const fetchCategories = () => api.get("/categories");

export const addCategory = (data) =>
  api.post("/categories", data);

export const updateCategory = (id, data) =>
  api.put(`/categories/${id}`, data);

export const deleteCategory = (id) =>
  api.delete(`/categories/${id}`);
