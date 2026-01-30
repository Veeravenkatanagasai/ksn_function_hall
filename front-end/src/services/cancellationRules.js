import api from "./api";

const CancellationRulesAPI = {
  getAll: () => api.get("/cancellation-rules"),
  create: (data) => api.post("/cancellation-rules", data),
  update: (id, data) => api.put(`/cancellation-rules/${id}`, data),
  remove: (id) => api.delete(`/cancellation-rules/${id}`),
};

export default CancellationRulesAPI;
