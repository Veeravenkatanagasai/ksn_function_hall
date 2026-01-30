// src/services/employeeAuth.js
import api from "./api";

export const employeeLogin = async (emp_email, password) => {
  try {
    const res = await api.post("/auth/login", { emp_email, password });
    // store minimal info in localStorage for frontend routing
    localStorage.setItem("emp_role", res.data.employee.emp_role);
    localStorage.setItem("emp_name", res.data.employee.emp_name);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Login failed" };
  }
};

export const employeeLogout = async () => {
  try {
    await api.post("/auth/logout");
    localStorage.removeItem("emp_role");
    localStorage.removeItem("emp_name");
  } catch (err) {
    console.error(err);
  }
};
