// src/services/priceRule.service.js
import api from "./api"; // adjust path if needed

export const fetchPriceRule = async (params) => {
  const res = await api.get("/price-rules/price-rule", {
    params,
  });
  return res.data;
};
