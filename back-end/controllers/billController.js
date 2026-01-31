import db from "../config/db.js";
import { BillModel } from "../models/billModel.js";

export const BillController = {

  // ✅ Closed bookings
  async getClosedBookings(req, res) {
    try {
      const data = await BillModel.getClosedBookings();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // ✅ Create bill
  async createBill(req, res) {
    try {
      const {
        booking_id,
        bill_category,
        bill_description,
        bill_amount
      } = req.body;

      const bill_photo = req.file ? req.file.path : null;

      const result = await BillModel.createBill({
        booking_id,
        bill_category,
        bill_description,
        bill_photo,
        bill_amount
      });

      res.json({
        message: "Bill created successfully",
        bill_id: result.insertId
      });

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // ✅ Get all bills
  async getAllBills(req, res) {
    try {
      const bills = await BillModel.getAllBills();
      res.json(bills);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // ✅ Update bill
  async updateBill(req, res) {
    try {
      const { bill_id } = req.params;
      const {
        booking_id,
        bill_category,
        bill_description,
        bill_amount
      } = req.body;

      const bill_photo = req.file ? req.file.filename : null;

      await BillModel.updateBill(bill_id, {
        booking_id,
        bill_category,
        bill_description,
        bill_amount,
        bill_photo
      });

      res.json({ message: "Bill updated successfully" });

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // ✅ Delete bill
  async deleteBill(req, res) {
    try {
      const { bill_id } = req.params;
      await BillModel.deleteBill(bill_id);
      res.json({ message: "Bill deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getBillsByBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const bills = await BillModel.getBillsByBooking(bookingId);
      res.json(bills);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // ✅ Pay bill
 async payBill(req, res) {
  try {
    const { bill_id } = req.params;
    const { payment_amount, payment_method } = req.body;

    // 1️⃣ Save payment
    const result = await BillModel.payBill(
      bill_id,
      payment_amount,
      payment_method
    );

    // 2️⃣ Find booking_id for this bill
    const [[bill]] = await db.query(
      `SELECT booking_id FROM ksn_function_hall_bills WHERE bill_id = ?`,
      [bill_id]
    );

    // 3️⃣ Recalculate final amount
    const { final_amount, total_bill_amount } =
      await BillModel.recalculateFinalAmount(bill.booking_id);

    res.json({
      message: "Payment successful",
      payment_id: result.insertId,
      final_amount,
      total_bill_amount
    });

  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}



};
