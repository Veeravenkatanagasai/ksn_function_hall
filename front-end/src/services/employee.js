// src/services/employee.service.js
import api from "./api"; // reuse your global axios instance

export const getEmployees = () =>
  api.get("/employees");

export const addEmployee = (data) =>
  api.post("/employees", data);

export const updateEmployee = (id, data) =>
  api.put(`/employees/${id}`, data);

export const deleteEmployee = (id) =>
  api.delete(`/employees/${id}`);

export const getProfile = () =>
  api.get("/employees/profile");
