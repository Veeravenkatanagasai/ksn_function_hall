import db from "../config/db.js";
import fs from "fs";
import path from "path";
import { GalleryModel } from "../models/galleryModel.js";

/* ================= UPLOAD IMAGES ================= */
export const uploadGalleryImages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { stage } = req.body;

    if (!stage) {
      return res.status(400).json({ message: "Stage is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    for (const file of req.files) {
      await GalleryModel.insertImage(
        bookingId,
        stage,
        file.filename
      );
    }

    res.json({
      message: "Gallery images uploaded successfully",
      uploadedCount: req.files.length
    });
  } catch (error) {
    console.error("Gallery Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ================= STAGE-WISE GALLERY ================= */
export const getGalleryStageWise = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const rows = await GalleryModel.getStageWiseGallery(bookingId);

    const grouped = {
      PREFUNCTION: [],
      FUNCTION: [],
      POSTFUNCTION: []
    };

    rows.forEach(row => {
      if (grouped[row.stage]) {
        grouped[row.stage].push({
          gallery_id: row.gallery_id,
          image_path: row.image_path
        });
      }
    });

    res.json(grouped);
  } catch (error) {
    console.error("Gallery Fetch Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ================= CLOSED BOOKINGS ================= */
export const getClosedBookings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT booking_id
       FROM ksn_function_hall_bookings
       WHERE booking_status = 'CLOSED'
       ORDER BY booking_id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Closed Bookings Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteGalleryImage = async (req, res) => {
  try {
    const { galleryId } = req.params;

    // 1️⃣ Get image path
    const image = await GalleryModel.getImageById(galleryId);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // 2️⃣ Delete file from uploads
    const filePath = path.join(
      process.cwd(),
      "uploads/gallery",
      image.image_path
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 3️⃣ Delete DB record
    await GalleryModel.deleteImageById(galleryId);

    res.json({ message: "Image deleted successfully" });

  } catch (error) {
    console.error("Delete Image Error:", error);
    res.status(500).json({ error: error.message });
  }
};
