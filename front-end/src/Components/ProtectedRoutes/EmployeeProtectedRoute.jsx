// src/components/EmployeeProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const EmployeeProtectedRoute = ({ children }) => {
  const emp_role = localStorage.getItem("emp_role");
  return emp_role ? children : <Navigate to="/employee-login" replace />;
};

export default EmployeeProtectedRoute;
