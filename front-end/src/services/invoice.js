// src/services/invoice.service.js
import api from "./api"; // adjust path if needed

export const generateInvoice = (data) =>
  api.post("/invoice/generate", data)
     .then(res => res.data);
