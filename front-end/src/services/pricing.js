// src/services/hallPricing.service.js
import api from "./api"; // <-- your configured axios instance

// Fetch all pricing rules
export const fetchPricing = async () => {
  try {
    const res = await api.get("/hallpricing");
    return res.data;
  } catch (err) {
    console.error("Fetch pricing error:", err);
    return [];
  }
};

// Add new pricing rule
export const addPricing = async (data) => {
  try {
    const res = await api.post("/hallpricing", data);
    return res.data;
  } catch (err) {
    console.error("Add pricing error:", err);
    throw err;
  }
};

// Update pricing rule
export const updatePricing = async (id, data) => {
  try {
    const res = await api.put(`/hallpricing/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Update pricing error:", err);
    throw err;
  }
};

// Delete pricing rule
export const deletePricing = async (id) => {
  try {
    const res = await api.delete(`/hallpricing/${id}`);
    return res.data;
  } catch (err) {
    console.error("Delete pricing error:", err);
    throw err;
  }
};
