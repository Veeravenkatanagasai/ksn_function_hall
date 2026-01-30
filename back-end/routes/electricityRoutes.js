import express from "express";
import { addElectricityBill, getElectricityBill, fetchUtilityCostsByBooking } from "../controllers/electricityController.js";
import { upload } from "../middleware/electricityupload.js";

const router = express.Router();

// Get category-wise costs for a booking
router.get("/costs/:bookingId", fetchUtilityCostsByBooking);

// Get electricity bill by booking
router.get("/:bookingId", getElectricityBill);

// Create electricity bill
router.post(
  "/create",
  upload.fields([
    { name: "current_previous" },
    { name: "current_after" },
    { name: "generator_previous" },
    { name: "generator_after" }
  ]),
  addElectricityBill
);

export default router;
