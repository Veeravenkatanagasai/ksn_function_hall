// src/services/terms.service.js
import api from "./api"; // your configured axios instance

export const fetchTerms = () =>
  api.get("/terms");

export const addTerm = (en, te) =>
  api.post("/terms", { en, te });

export const updateTerm = (id, en, te) =>
  api.put("/terms", { id, en, te });

export const deleteTerm = (id) =>
  api.delete(`/terms/${id}`);

export const translateText = (text) =>
  api.get("/translate", { params: { text } });
