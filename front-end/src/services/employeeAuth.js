import api from "./api";

export const employeeLogin = async (emp_email, password) => {
  try {
    const res = await api.post("/auth/login", { emp_email, password });

    // ✅ STORE TOKEN
    localStorage.setItem("employeeToken", res.data.token);
    localStorage.setItem("emp_role", res.data.employee.emp_role);
    localStorage.setItem("emp_name", res.data.employee.emp_name);

    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Login failed" };
  }
};

const logout = () => {
  localStorage.removeItem("employeeToken");
  localStorage.removeItem("emp_role");
  localStorage.removeItem("emp_name");
  navigate("/employee-login");
};
