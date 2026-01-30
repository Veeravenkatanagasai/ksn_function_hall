import express from "express";
import galleryUpload from "../middleware/galleryupload.js";
import {
  uploadGalleryImages,
  getGalleryStageWise,
  getClosedBookings,
  deleteGalleryImage
} from "../controllers/galleryController.js";

const router = express.Router();

router.get("/closed", getClosedBookings);

/* Stage-wise gallery */
router.get("/stagewise/:bookingId", getGalleryStageWise);

router.post(
  "/upload/:bookingId",
  galleryUpload.array("images"),
  uploadGalleryImages
);

router.delete("/image/:galleryId", deleteGalleryImage);

export default router;
