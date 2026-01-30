import api from "./api";

export const fetchBlockedDates = async ({ category, hall, timeSlot }) => {
  const res = await api.get("/price-rules/blocked-dates", {
    params: { category, hall, timeSlot }
  });
  return res.data;
};
