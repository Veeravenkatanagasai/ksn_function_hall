import db from "../config/db.js";
import { RefundModel } from "../models/refundModel.js";

// ================= CALCULATE REFUND =================
export const calculateRefund = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const [[booking]] = await db.query(
      `SELECT category FROM ksn_function_hall_bookings WHERE booking_id = ?`,
      [bookingId]
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const bills = await RefundModel.getElectricityBills(bookingId);
    const payment = await RefundModel.getPaymentDetails(bookingId);
    const refundable = await RefundModel.getRefundableAmount(booking.category);

    const settlement =
      refundable - bills.electricity - bills.generator;

    res.json({
      total_amount: payment.total_amount || 0,
      refundable_amount: refundable || 0,
      electricity_cost: bills.electricity || 0,
      generator_cost: bills.generator || 0,
      settlement_amount: settlement || 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to calculate settlement" });
  }
};

// ================= CONFIRM SETTLEMENT =================
export const confirmSettlement = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // 🔒 BODY SAFETY CHECK
    if (!req.body) {
      return res.status(400).json({
        message: "Request body is missing"
      });
    }
    
    const {
  settlement_type,
  payment_mode,
  settlement_amount
} = req.body;

/* VALIDATION */
if (!settlement_type) {
  return res.status(400).json({ message: "Settlement type required" });
}

/* payment_mode only for REFUND / COLLECT */
if (settlement_type !== "SETTLED" && !payment_mode) {
  return res.status(400).json({ message: "Payment mode required" });
}

/* proof only for REFUND / COLLECT */
const proof_image =
  settlement_type === "SETTLED"
    ? null
    : req.file
    ? req.file.path
    : null;

    if (settlement_type !== "SETTLED" && !req.file) {
  return res.status(400).json({
    message: "Proof image is required for REFUND / COLLECT"
  });
}


    const [[booking]] = await db.query(
      `SELECT category FROM ksn_function_hall_bookings WHERE booking_id = ?`,
      [bookingId]
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const bills = await RefundModel.getElectricityBills(bookingId);
    const payment = await RefundModel.getPaymentDetails(bookingId);
    const refundable = await RefundModel.getRefundableAmount(booking.category);


const totalBookingAmount = Number(payment?.total_amount || 0);
    const settlementAmt = Number(settlement_amount || 0);
    const electricity = Number(bills.electricity || 0);
    const generator = Number(bills.generator || 0);
    const refundableAmount = Number(refundable || 0);

    // ✅ Calculate adjustment amount
    let adjustable_amount = totalBookingAmount +
      electricity +
      generator -
      refundableAmount;

    if (settlement_type === "REFUND") {
      adjustable_amount = totalBookingAmount - Math.abs(settlementAmt);
    }

    if (settlement_type === "COLLECT") {
      adjustable_amount = totalBookingAmount + Math.abs(settlementAmt);
    }

    await RefundModel.createSettlement({
  booking_id: bookingId,
  total_amount: payment.total_amount || 0,
  refundable_amount: refundable || 0,
  electricity_bill: bills.electricity || 0,
  generator_bill: bills.generator || 0,
  settlement_type,
  settlement_amount,
  adjustable_amount,
  final_amount: adjustable_amount,
  payment_mode: settlement_type === "SETTLED" ? null : payment_mode,
  proof_image
});

    await db.query(
      `UPDATE ksn_function_hall_bookings 
       SET booking_status = 'CLOSED' 
       WHERE booking_id = ?`,
      [bookingId]
    );

    res.json({ message: "Final settlement completed successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to confirm settlement"
    });
  }
};

// ================= GET REFUND DETAILS =================
export const getRefundDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const refund = await RefundModel.getRefundDetails(bookingId);

    if (!refund) {
      return res.status(404).json({ message: "Refund not found" });
    }

    res.json(refund);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch refund details"
    });
  }
};



