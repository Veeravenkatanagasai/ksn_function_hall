import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "cancellation-proofs",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto"
  }
});

const uploadProof = multer({ storage });

export default uploadProof;
