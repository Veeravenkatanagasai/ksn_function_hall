import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findEmployeeByEmail,
  updateLoginInfo,
  updateLogoutInfo
} from "../models/employeeauthModel.js";

// ✅ LOGIN (JWT)
export const login = async (req, res) => {
  const { emp_email, password } = req.body;

  if (!emp_email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const employee = await findEmployeeByEmail(emp_email);
  if (!employee) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, employee.password_hash);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  await updateLoginInfo(employee.emp_id);

  // 🔐 JWT TOKEN
  const token = jwt.sign(
    {
      emp_id: employee.emp_id,
      emp_role: employee.emp_role,
      emp_email: employee.emp_email,
      emp_name: employee.emp_name,
      role: "employee"
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({
    token,
    employee: {
      emp_id: employee.emp_id,
      emp_name: employee.emp_name,
      emp_role: "employee",
      emp_email: employee.emp_email
    }
  });
};

// ✅ LOGOUT (stateless)
export const logout = async (req, res) => {
  // purely optional DB logging
  if (req.employee?.emp_id) {
    await updateLogoutInfo(req.employee.emp_id);
  }

  res.json({ message: "Logged out successfully" });
};
