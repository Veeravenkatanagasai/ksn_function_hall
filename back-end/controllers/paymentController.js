import db from "../config/db.js";
import * as paymentModel from "../models/paymentModel.js";
import { generatePDFReceipt } from "../utility/receipts/pdf.js";

// Get booking details
export const getBooking = async (req, res) => {
  try {
    const data = await paymentModel.getBookingDetails(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Save payment (Advance/Balance/Full)
export const createPayment = async (req, res) => {
  try {
    const { booking_id, payment_type, payment_method, paid_amount, balance_days } = req.body;

    if (!booking_id || !payment_type || !payment_method || !paid_amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const booking = await paymentModel.getBookingDetails(booking_id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.booking_status === "CANCELLED") {
      return res.status(400).json({ error: "Cannot pay for CANCELLED booking" });
    }

    const totalAmount = booking.gross_total_before_discount;
    const balanceAmount = totalAmount - paid_amount;

    // Save payment
    const paymentId = await paymentModel.savePayment({
      booking_id,
      payment_type,
      payment_method,
      total_amount: totalAmount,
      paid_amount,
      balance_amount: balanceAmount,
      transaction_status: "SUCCESS"
    });

    // Update booking status and set balance due date if ADVANCE
    let newStatus = "INPROGRESS";
    let dueDays = 0;

    if (payment_type.toUpperCase() === "ADVANCE") {
      newStatus = "ADVANCE";
      dueDays = Number(balance_days) || 3; // default 3 days

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + dueDays);

      await db.query(
        `UPDATE ksn_function_hall_bookings 
         SET booking_status = ?, balance_due_date = ? 
         WHERE booking_id = ?`,
        [newStatus, dueDate, booking_id]
      );
    } else {
      // FULL payment
      await db.query(
        `UPDATE ksn_function_hall_bookings 
         SET booking_status = ? 
         WHERE booking_id = ?`,
        [newStatus, booking_id]
      );
    }

    // Generate PDF receipt
    await generatePDFReceipt(booking_id);

    res.json({
      message: "Payment saved successfully",
      paymentId,
      balanceAmount,
      booking_status: newStatus,
      balance_due_days: dueDays
    });

  } catch (err) {
    console.error("CREATE PAYMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


export const payRemainingBalance = async (req, res) => {
  const { bookingId } = req.params;
  const { payment_method } = req.body;

  if (!payment_method) {
    return res.status(400).json({ message: "Payment method required" });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [[payment]] = await conn.query(
      `SELECT * FROM ksn_function_hall_payments
       WHERE booking_id = ?
       FOR UPDATE`,
      [bookingId]
    );

    if (!payment) {
      await conn.rollback();
      return res.status(404).json({ message: "Payment not found" });
    }

    if (Number(payment.balance_amount) <= 0) {
      await conn.rollback();
      return res.status(400).json({ message: "No balance remaining" });
    }

    const balance = Number(payment.balance_amount);

    await conn.query(
      `UPDATE ksn_function_hall_payments SET
        paid_amount = total_amount,
        balance_amount = 0,
        balance_paid_amount = ?,
        balance_paid_date = NOW(),
        balance_paid_status = 'clear',
        balance_paid_method = ?
       WHERE booking_id = ?`,
      [balance, payment_method, bookingId]
    );

    await conn.query(
      `UPDATE ksn_function_hall_bookings SET
        booking_status = 'INPROGRESS',
        balance_due_date = NULL
       WHERE booking_id = ?`,
      [bookingId]
    );

    await conn.commit();
    res.json({ message: "Balance payment completed successfully" });

  } catch (err) {
    await conn.rollback();
    console.error("BALANCE PAYMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// Get Payment Analytics
export const getPaymentAnalytics = async (req, res) => {
  try {
    const { from, to, booking_id } = req.query;
    let billCategories = [];
    let closedBookings = []; 

    const refundDateFilter = from && to ? `AND r.refunded_at BETWEEN ? AND ?` : "";
    const cancelDateFilter = from && to ? `AND cancelled_at BETWEEN ? AND ?` : "";

    const dateParams = from && to ? [from, to] : [];

    let inflows = { total_amount: 0, cancellation_charges: 0, total: 0 };
    let outflows = { total_bill_amount: 0, referral_commission: 0, cancellation_refunds: 0, total: 0 };
    let totalRevenue = 0;

    let bookingStatus = null;

if (booking_id) {
  const [[bookingRow]] = await db.query(
    `SELECT booking_status FROM ksn_function_hall_bookings WHERE booking_id = ?`,
    [booking_id]
  );

  bookingStatus = bookingRow?.booking_status;
}


    /* =====================================================
       CASE 1: BOOKING_ID SELECTED (DETAILED LOGIC)
    ===================================================== */
    if (booking_id) {

  /* =========================
     CLOSED BOOKING
  ========================= */
  if (bookingStatus === "CLOSED") {

    // Main booking amounts
    const [[result]] = await db.query(
      `
      SELECT
        COALESCE(r.adjustable_amount,0) AS adjustable_amount,
        COALESCE(SUM(bp.payment_amount),0) AS bill_amount,
        COALESCE(r.referral_amount,0) AS referral_amount
      FROM ksn_function_hall_refunds r
      LEFT JOIN ksn_function_hall_bills b
        ON b.booking_id = r.booking_id
      LEFT JOIN ksn_function_hall_bill_payments bp
        ON bp.bill_id = b.bill_id
      WHERE r.booking_id = ?
      GROUP BY r.adjustable_amount, r.referral_amount
      `,
      [booking_id]
    );

    // Category-wise bills
    const [categoryRows] = await db.query(
      `
      SELECT
        b.bill_category AS name,
        COALESCE(SUM(bp.payment_amount),0) AS value
      FROM ksn_function_hall_bills b
      LEFT JOIN ksn_function_hall_bill_payments bp
        ON bp.bill_id = b.bill_id
      WHERE b.booking_id = ?
      GROUP BY b.bill_category
      `,
      [booking_id]
    );

    billCategories = categoryRows;

    inflows.total_amount = Number(result.adjustable_amount);
    inflows.cancellation_charges = 0;
    inflows.total = inflows.total_amount;

    outflows.total_bill_amount = Number(result.bill_amount);
    outflows.referral_commission = Number(result.referral_amount);
    outflows.cancellation_refunds = 0;
    outflows.total =
      outflows.total_bill_amount + outflows.referral_commission;

    totalRevenue = inflows.total - outflows.total;
  }

  /* =========================
     CANCELLED BOOKING
  ========================= */
  else if (bookingStatus === "CANCELLED") {

    const [[cancelData]] = await db.query(
      `
      SELECT
        COALESCE(total_amount,0) AS total_amount,
        COALESCE(refund_amount,0) AS refund_amount
      FROM ksn_function_hall_cancellation_payments
      WHERE booking_id = ?
      `,
      [booking_id]
    );
    inflows.cancellation_charges = Number(cancelData.total_amount);
    inflows.total = inflows.cancellation_charges;

    outflows.total_bill_amount = 0;
    outflows.referral_commission = 0;
    outflows.cancellation_refunds = Number(cancelData.refund_amount);
    outflows.total = outflows.cancellation_refunds;

    totalRevenue = inflows.total - outflows.total;
  }
}

    /* =====================================================
       CASE 2: ALL BOOKINGS (OLD SUMMARY LOGIC)
    ===================================================== */
    else {
      const [[refundInflows]] = await db.query(
        `
        SELECT COALESCE(SUM(adjustable_amount),0) AS total_amount
        FROM ksn_function_hall_refunds r
        WHERE 1=1 ${refundDateFilter}
        `,
        dateParams
      );

      const [[cancellations]] = await db.query(
        `
        SELECT COALESCE(SUM(total_amount),0) AS cancellation_charges
        FROM ksn_function_hall_cancellation_payments
        WHERE 1=1 ${cancelDateFilter}
        `,
        dateParams
      );

      const [[outflowSummary]] = await db.query(
        `
        SELECT
          COALESCE(SUM(total_bill_amount),0) AS total_bill_amount,
          COALESCE(SUM(referral_amount),0) AS referral_commission
        FROM ksn_function_hall_refunds r
        WHERE 1=1 ${refundDateFilter}
        `,
        dateParams
      );

      const [[cancelRefunds]] = await db.query(
        `
        SELECT COALESCE(SUM(refund_amount),0) AS cancellation_refunds
        FROM ksn_function_hall_cancellation_payments
        WHERE 1=1 ${cancelDateFilter}
        `,
        dateParams
      );

      const [[maintenanceOutflow]] = await db.query(
  `
      SELECT COALESCE(SUM(payment_amount),0) AS maintenance_payments
      FROM ksn_function_hall_maintenance_payments
      WHERE payment_status = 'paid'
      ${from && to ? "AND DATE(payment_date) BETWEEN ? AND ?" : ""}
      `,
      from && to ? [from, to] : []
    );


      inflows.total_amount = Number(refundInflows.total_amount);
      inflows.cancellation_charges = Number(cancellations.cancellation_charges);
      inflows.total = inflows.total_amount + inflows.cancellation_charges;

      outflows.total_bill_amount = Number(outflowSummary.total_bill_amount);
      outflows.referral_commission = Number(outflowSummary.referral_commission);
      outflows.cancellation_refunds = Number(cancelRefunds.cancellation_refunds);
      outflows.maintenance_payments = Number(maintenanceOutflow.maintenance_payments);
      outflows.total =
        outflows.total_bill_amount +
        outflows.referral_commission +
        outflows.cancellation_refunds+outflows.maintenance_payments;

      totalRevenue = inflows.total - outflows.total;
    }

    /* =====================================================
       CLOSED BOOKINGS FOR DROPDOWN
    ===================================================== */
    const [closedBookingsRows] = await db.query(
  `
  SELECT booking_id
  FROM ksn_function_hall_bookings
  WHERE booking_status IN ('CLOSED','CANCELLED')
  ${from && to ? "AND booking_date BETWEEN ? AND ?" : ""}
  ORDER BY booking_id DESC
  `,
  from && to ? [from, to] : []
);

closedBookings = closedBookingsRows;

    res.status(200).json({
      inflows,
      outflows,
      totalRevenue,
      billCategories,
      closedBookings: closedBookings.map(b => b.booking_id)
    });

  } catch (err) {
    console.error("PAYMENT ANALYTICS ERROR:", err);
    res.status(500).json({ message: "Failed to load analytics" });
  }
};
