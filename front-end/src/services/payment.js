// src/services/payment.service.js
import api from "./api"; // adjust path if needed

export const fetchBooking = (id) =>
  api.get(`/payments/booking/${id}`);

export const payNow = (data) =>
  api.post("/payments", data);

export const cancelBooking = (id) =>
  api.post(`/payments/bookings/cancel/${id}`);
