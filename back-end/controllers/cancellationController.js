import db from "../config/db.js";
import { getBookingById, updateBookingStatus } from "../models/bookingModel.js";
import { getPaymentByBookingId } from "../models/paymentModel.js";
import { createCancellation, getApplicableRule, getCancellationByBookingId } from "../models/cancellationModel.js";

export const previewCancellation = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;

    const booking = await getBookingById(bookingId);
    const payment = await getPaymentByBookingId(bookingId);

    if (!booking || !payment) {
      return res.status(404).json({ message: "Booking / Payment not found" });
    }

    const eventDate = new Date(booking.event_date);
    const today = new Date();
    const daysBefore = Math.ceil((eventDate - today) / 86400000);

    const rule = await getApplicableRule(daysBefore);
    if (!rule) throw new Error("No cancellation rule");

    const totalAmount = Number(payment.total_amount);
    const penaltyAmount = Number(
      ((totalAmount * rule.penalty_percent) / 100).toFixed(2)
    );
    const refundAmount = Number((totalAmount - penaltyAmount).toFixed(2));

    res.json({
      booking_id: bookingId,
      payment_id: payment.payment_id,
      total_amount: payment.total_amount,
      penalty_percent: rule.penalty_percent,
      penalty_amount: penaltyAmount,
      refund_amount: refundAmount,
      final_amount: penaltyAmount
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const confirmCancellation = async (req, res) => {
  const {
    booking_id,
    payment_id,
    penalty_percent,
    total_amount,
    penalty_amount,
    refund_amount,
    cancellation_paid_method
  } = req.body;

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    await createCancellation({
      booking_id,
      payment_id,
      penalty_percent,
      total_amount,
      penalty_amount,
      refund_amount,
      cancellation_paid_method,
      final_amount: penalty_amount
    });

    await updateBookingStatus(booking_id, "CANCELLED");

    await conn.commit();

    res.json({ success: true, message: "Cancellation & refund completed" });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
};


export const getCancellationDetails = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const data = await getCancellationByBookingId(bookingId);
    if (!data) return res.status(404).json({ message: "No cancellation record found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
