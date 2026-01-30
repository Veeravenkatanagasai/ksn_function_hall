// src/services/hall.service.js
import api from "./api"; // adjust path if needed

export const getHalls = () =>
  api.get("/halls");

export const addHall = (data) =>
  api.post("/halls", data);

export const updateHall = (id, data) =>
  api.put(`/halls/${id}`, data);

export const deleteHall = (id) =>
  api.delete(`/halls/${id}`);
