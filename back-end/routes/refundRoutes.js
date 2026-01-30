import express from "express";
import { calculateRefund, confirmSettlement, getRefundDetails } from "../controllers/refundController.js";
import { uploadSettlementProof } from "../middleware/settlementupload.js";

const router = express.Router();

router.get("/calculate/:bookingId", calculateRefund);
router.post("/confirm/:bookingId",uploadSettlementProof.single("proof_image"), confirmSettlement);
router.get("/details/:bookingId", getRefundDetails);


export default router;
