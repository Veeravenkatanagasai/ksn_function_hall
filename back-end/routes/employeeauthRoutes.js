import express from "express";
import { login, logout } from "../controllers/employeeauthController.js";
import { employeeProtect } from "../middleware/employeeProtect.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", employeeProtect, logout); // ✅ ADD THIS

export default router;
