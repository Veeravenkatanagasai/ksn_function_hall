import api from "./api";

// Fetch all categories
export const fetchCategories = async () => {
  try {
    const res = await api.get("/categories"); // endpoint: /api/categories
    return res.data;
  } catch (err) {
    console.error("Fetch categories error:", err);
    return [];
  }
};

// Fetch all halls
export const fetchHalls = async () => {
  try {
    const res = await api.get("/halls"); // endpoint: /api/halls
    return res.data;
  } catch (err) {
    console.error("Fetch halls error:", err);
    return [];
  }
};

// Fetch all time slots
export const fetchTimeSlots = async () => {
  try {
    const res = await api.get("/timeslots"); // endpoint: /api/time-slots
    return res.data;
  } catch (err) {
    console.error("Fetch time slots error:", err);
    return [];
  }
};
