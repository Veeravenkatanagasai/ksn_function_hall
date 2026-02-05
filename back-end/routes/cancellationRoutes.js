import express from "express";
import { previewCancellation, confirmCancellation,getCancellationDetails } from "../controllers/cancellationController.js";
import uploadProof from "../middleware/cancellationproof.js";



const router = express.Router();

router.get("/preview/:bookingId", previewCancellation);
router.post(
  "/confirm",
  uploadProof.single("proof_image"),
  confirmCancellation
);
router.get("/details/:bookingId", getCancellationDetails);


export default router;
