// routes/paymentRoutes.js
import express from "express";
import { getBooking, createPayment
,payRemainingBalance,getPaymentAnalytics
 } from "../controllers/paymentController.js";


const router = express.Router();

router.get("/booking/:id", getBooking);
router.post("/", createPayment);


router.post("/pay-balance/:bookingId",payRemainingBalance);

router.get("/payment-analytics", getPaymentAnalytics);


export default router;
