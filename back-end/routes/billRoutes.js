import express from 'express';
import multer from 'multer';
import { BillController } from '../controllers/billController.js';

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/Bills'),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, Date.now() + '.' + ext);
  }
});
const upload = multer({ storage });

// Routes
router.get('/closed-bookings', BillController.getClosedBookings);
router.get('/', BillController.getAllBills);
router.post('/create', upload.single('bill_photo'), BillController.createBill);
router.put('/update/:bill_id', upload.single('bill_photo'), BillController.updateBill);
router.delete('/:bill_id', BillController.deleteBill);

router.get("/:bookingId", BillController.getBillsByBooking);

// Pay a bill
router.post("/pay/:bill_id", BillController.payBill);


export default router;
