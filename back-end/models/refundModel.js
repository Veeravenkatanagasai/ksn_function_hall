import db from "../config/db.js";

export const RefundModel = {

  // ================== GET ELECTRICITY & GENERATOR BILLS ==================
  getElectricityBills: async (bookingId) => {
  const [[bills]] = await db.query(`
    SELECT 
      COALESCE(currnet_total_amount, 0) AS electricity,
      COALESCE(generator_total_amount, 0) AS generator
    FROM ksn_function_hall_electricity_bills
    WHERE booking_id = ?
  `, [bookingId]);

  return bills || { electricity: 0, generator: 0 };
},


  // ================== GET REFUNDABLE FIXED AMOUNT ==================
  getRefundableAmount: async (category) => {

    const [charges] = await db.query(`
      SELECT SUM(charges_value) AS total_refundable
      FROM ksn_function_hall_fixed_charges fc
      JOIN ksn_function_hall_categories c ON c.category_id = fc.category_id
      WHERE c.category_name = ?
        AND fc.charges_name LIKE '%Refundable%'
    `, [category]);

    const total = charges[0]?.total_refundable || 0;
    return total;
  },

  // ================== GET PAYMENT DETAILS ==================
  getPaymentDetails: async (bookingId) => {
    const [[payment]] = await db.query(`
      SELECT total_amount, paid_amount
      FROM ksn_function_hall_payments
      WHERE booking_id = ?
    `, [bookingId]);
    return payment || null;
  },

  // ================== CREATE REFUND RECORD ==================
  async createSettlement(data) {
    const {
      booking_id,
      total_amount,
      refundable_amount,
      electricity_bill,
      generator_bill,
      settlement_type,
      settlement_amount,
      adjustable_amount,
      final_amount,
      payment_mode,
      proof_image
    } = data;


  const [result] = await db.query(`
    INSERT INTO ksn_function_hall_refunds
    (
      booking_id,
        total_amount,
        refundable_amount,
        electricity_bill,
        generator_bill,
        settlement_type,
        settlement_amount,
        adjustable_amount,
        final_amount,
        payment_mode,
        proof_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)`,
      [
        booking_id,
        total_amount,
        refundable_amount,
        electricity_bill,
        generator_bill,
        settlement_type,
        settlement_amount,
        adjustable_amount,
        final_amount,
        payment_mode,
        proof_image
  ]);

  return result.insertId;
},

// ================== GET REFUND DETAILS ==================
getRefundDetails: async (bookingId) => {
  const [[refund]] = await db.query(`
    SELECT *
    FROM ksn_function_hall_refunds
    WHERE booking_id = ?
    ORDER BY refunded_at DESC
    LIMIT 1
  `, [bookingId]);

  return refund || null;
},


};
