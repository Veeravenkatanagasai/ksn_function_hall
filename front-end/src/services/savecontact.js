// src/services/contact.service.js
import api from "./api"; // your configured axios instance

export const fetchContacts = () =>
  api.get("/savecontacts");

export const addContact = (data) =>
  api.post("/savecontacts", data);

export const updateContact = (id, data) =>
  api.put(`/savecontacts/${id}`, data);

export const deleteContact = (id) =>
  api.delete(`/savecontacts/${id}`);
