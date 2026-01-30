import api from "./api";

export const getAllUtilities = async () => {
  try {
    return await api.get("/utilities");
  } catch (err) {
    console.error("[API ERROR] getAllUtilities:", err.response?.data || err);
    throw err;
  }
};

export const createUtility = async (data) => {
  return api.post("/utilities", data);
};

export const updateUtility = async (id, data) => {
  return api.put(`/utilities/${id}`, data);
};

export const deleteUtility = async (id) => {
  return api.delete(`/utilities/${id}`);
};

export const getCategories = async () => {
  return api.get("/categories");
};
