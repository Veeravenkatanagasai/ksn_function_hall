// src/components/EmployeeProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const EmployeeProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("employeeToken");
  return token ? children : <Navigate to="/employee-login" replace />;
};


export default EmployeeProtectedRoute;
