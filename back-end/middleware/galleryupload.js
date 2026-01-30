import multer from "multer";
import fs from "fs";

const uploadDir = "uploads/gallery";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

/* ❌ No limit applied */
const galleryUpload = multer({ storage });

export default galleryUpload;
