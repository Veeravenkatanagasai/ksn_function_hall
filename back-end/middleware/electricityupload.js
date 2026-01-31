import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "electricity_bills",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"]
  })
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});
