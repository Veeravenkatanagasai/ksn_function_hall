// src/services/fixedCharges.service.js
import api from "./api"; // adjust path if needed

export const getAllCharges = () =>
  api.get("/fixedcharges");

export const getCategories = () =>
  api.get("/fixedcharges/categories");

export const createCharge = (data) =>
  api.post("/fixedcharges", data);

export const updateCharge = (id, data) =>
  api.put(`/fixedcharges/${id}`, data);

export const deleteCharge = (id) =>
  api.delete(`/fixedcharges/${id}`);
