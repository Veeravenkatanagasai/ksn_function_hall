// src/services/vendor.service.js
import api from "./api"; // your configured axios instance

export const fetchVendors = () =>
  api.get("/vendors");

export const addVendor = (data) =>
  api.post("/vendors", data);

export const updateVendor = (id, data) =>
  api.put(`/vendors/${id}`, data);

export const deleteVendor = (id) =>
  api.delete(`/vendors/${id}`);
