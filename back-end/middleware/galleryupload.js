import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "function_hall_gallery",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
  },
});

const galleryUpload = multer({ storage });

export default galleryUpload;
