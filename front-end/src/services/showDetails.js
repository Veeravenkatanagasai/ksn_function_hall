// src/services/bookingDetails.service.js
import api from "./api"; // your global axios instance

export const fetchBookings = async (page = 1, limit = 12,status="ALL",bookingId = "") => {
  const res = await api.get("/booking-details", {
    params: { page, limit ,status,search: bookingId},
  });
  return res.data;
};
