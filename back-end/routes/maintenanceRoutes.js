import express from "express";
import multer from "multer";
import {
  addBill,
  getAllBills,
  getBill,
  updateBill,
  deleteBill,
  insertPayment,
  showPayments
} from "../controllers/maintenanceController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/Maintenance-Bills'),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, Date.now() + '.' + ext);
  }
});

const upload = multer({ storage });

router.post("/", upload.single("photo"), addBill);
router.get("/", getAllBills);
router.get("/:id", getBill);
router.put("/:id", upload.single("photo"), updateBill);
router.delete("/:id", deleteBill);
router.post("/payment", insertPayment);
router.get("/payment/:billId", showPayments);

export default router;
