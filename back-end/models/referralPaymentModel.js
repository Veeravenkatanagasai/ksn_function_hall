import db from "../config/db.js";

export const ReferralPaymentModel = {

  getClosedBookingsWithReferral: async () => {
    const [rows] = await db.query(`
      SELECT 
        b.booking_id,
        b.booking_status,
        r.referral_id,
        r.referral_name,
        r.referral_mobileno,
        r.referral_email,
        r.status AS referral_status
      FROM ksn_function_hall_bookings b
      INNER JOIN ksn_function_hall_referrals r 
        ON b.referral_id = r.referral_id
      WHERE b.booking_status = 'CLOSED'
    `);
    return rows;
  },

  payReferral: async ({ referral_id, booking_id, referral_amount, referral_payment_method }) => {
    // 1️⃣ Insert into referral payment table
    const [result] = await db.query(`
      INSERT INTO ksn_function_hall_referral_payment
      (referral_id, booking_id, referral_amount, referral_payment_method)
      VALUES (?, ?, ?, ?)
    `, [referral_id, booking_id, referral_amount, referral_payment_method]);

    const referralpayment_id = result.insertId;

    // 2️⃣ Update the latest refund row
    const [[refund]] = await db.query(`
      SELECT refund_id, adjustable_amount
      FROM ksn_function_hall_refunds
      WHERE booking_id = ?
      ORDER BY refunded_at DESC
      LIMIT 1
    `, [booking_id]);

    if (!refund) throw new Error("Refund record not found");

    const final_amount = Number(refund.adjustable_amount) - Number(referral_amount);

    await db.query(`
      UPDATE ksn_function_hall_refunds
      SET 
        referral_amount = ?,
        final_amount = ?,
        referralpayment_id = ?
      WHERE refund_id = ?
    `, [referral_amount, final_amount, referralpayment_id, refund.refund_id]);

    // 3️⃣ Mark referral as PAID
    await db.query(`
      UPDATE ksn_function_hall_referrals
      SET status = 'PAID'
      WHERE referral_id = ?
    `, [referral_id]);

    return { referralpayment_id, final_amount };
  }
};
