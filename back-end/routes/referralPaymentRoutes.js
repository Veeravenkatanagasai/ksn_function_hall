import express from "express";
import {
  getClosedBookings,
  payReferralAmount
} from "../controllers/referralPaymentController.js";

const router = express.Router();

router.get("/closed-bookings", getClosedBookings);
router.post("/pay", payReferralAmount);

export default router;
