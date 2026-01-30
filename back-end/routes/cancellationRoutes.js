import express from "express";
import { previewCancellation, confirmCancellation,getCancellationDetails } from "../controllers/cancellationController.js";

const router = express.Router();

router.get("/preview/:bookingId", previewCancellation);
router.post("/confirm", confirmCancellation);
router.get("/details/:bookingId", getCancellationDetails);


export default router;
