// src/services/timeslot.service.js
import api from "./api"; // your configured axios instance

export const getSlots = () =>
  api.get("/timeslots");

export const addSlot = (data) =>
  api.post("/timeslots", data);

export const updateSlot = (id, data) =>
  api.put(`/timeslots/${id}`, data);

export const deleteSlot = (id) =>
  api.delete(`/timeslots/${id}`);
