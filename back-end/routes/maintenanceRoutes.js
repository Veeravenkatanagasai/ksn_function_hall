import express from "express";
import {upload} from "../middleware/maintenancebillupload.js";
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

router.post("/", upload.single("photo"), addBill);
router.get("/", getAllBills);
router.get("/:id", getBill);
router.put("/:id", upload.single("photo"), updateBill);
router.delete("/:id", deleteBill);
router.post("/payment", insertPayment);
router.get("/payment/:billId", showPayments);

export default router;
