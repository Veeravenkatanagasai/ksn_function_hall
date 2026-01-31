import express from 'express';
import { uploadBill } from "../middleware/billupload.js";
import { BillController } from '../controllers/billController.js';

const router = express.Router();

// Routes
router.get('/closed-bookings', BillController.getClosedBookings);
router.get('/', BillController.getAllBills);
router.post("/create", uploadBill.single("bill_photo"), BillController.createBill);
router.put("/update/:bill_id", uploadBill.single("bill_photo"), BillController.updateBill);
router.delete('/:bill_id', BillController.deleteBill);

router.get("/:bookingId", BillController.getBillsByBooking);

// Pay a bill
router.post("/pay/:bill_id", BillController.payBill);


export default router;
