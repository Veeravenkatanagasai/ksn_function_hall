import express from "express";
import upload from "../middleware/upload.js";
import { confirmBooking,updateCustomerDetails} from "../controllers/bookingController.js";
import { authAny } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/confirm",authAny,
    upload.fields([
    { name: "aadharCustomer", maxCount: 1 },
    { name: "aadharBride", maxCount: 1 },
    { name: "aadharGroom", maxCount: 1 },
    { name: "weddingCard", maxCount: 1 },
  ]),
confirmBooking);

router.put(
  "/customer/:customerId",
  upload.fields([
    { name: "aadharCustomer", maxCount: 1 },
    { name: "aadharBride", maxCount: 1 },
    { name: "aadharGroom", maxCount: 1 },
    { name: "weddingCard", maxCount: 1 },
  ]),
  updateCustomerDetails
);


export default router;
