import db from "../config/db.js";

export const BillModel = {

  // ✅ Get closed bookings
  async getClosedBookings() {
    const [rows] = await db.query(`
      SELECT booking_id
      FROM ksn_function_hall_bookings
      WHERE booking_status = 'CLOSED'
      ORDER BY booking_id DESC
    `);
    return rows;
  },

  // ✅ Create bill
  async createBill(data) {
    const {
      booking_id,
      bill_category,
      bill_description,
      bill_photo,
      bill_amount
    } = data;

    const [result] = await db.query(
      `INSERT INTO ksn_function_hall_bills
       (booking_id, bill_category, bill_description, bill_photo, bill_amount)
       VALUES (?, ?, ?, ?, ?)`,
      [booking_id, bill_category, bill_description, bill_photo, bill_amount]
    );

    return result;
  },

  // ✅ Get all bills
  async getAllBills() {
    const [rows] = await db.query(`
      SELECT *
      FROM ksn_function_hall_bills
      ORDER BY created_at DESC
    `);
    return rows;
  },

  // ✅ Update bill
  async updateBill(bill_id, data) {
    const {
      booking_id,
      bill_category,
      bill_description,
      bill_amount,
      bill_photo
    } = data;

    await db.query(
      `UPDATE ksn_function_hall_bills
       SET booking_id = ?,
           bill_category = ?,
           bill_description = ?,
           bill_amount = ?,
           bill_photo = COALESCE(?, bill_photo)
       WHERE bill_id = ?`,
      [
        booking_id,
        bill_category,
        bill_description,
        bill_amount,
        bill_photo,
        bill_id
      ]
    );
  },

  // ✅ Delete bill
  async deleteBill(bill_id) {
    await db.query(
      `DELETE FROM ksn_function_hall_bills WHERE bill_id = ?`,
      [bill_id]
    );
  },

  async getBillsByBooking(booking_id) {
    const [rows] = await db.query(
      `SELECT b.*,
              CASE WHEN p.payment_id IS NOT NULL THEN 'PAID' ELSE 'UNPAID' END AS bill_status
       FROM ksn_function_hall_bills b
       LEFT JOIN ksn_function_hall_bill_payments p
       ON b.bill_id = p.bill_id
       WHERE b.booking_id = ?
       ORDER BY b.created_at DESC`,
      [booking_id]
    );
    return rows;
  },

  // ✅ Create bill
  async createBill(data) {
    const { booking_id, bill_category, bill_description, bill_photo, bill_amount } = data;
    const [result] = await db.query(
      `INSERT INTO ksn_function_hall_bills
       (booking_id, bill_category, bill_description, bill_photo, bill_amount)
       VALUES (?, ?, ?, ?, ?)`,
      [booking_id, bill_category, bill_description, bill_photo, bill_amount]
    );
    return result;
  },

async payBill(bill_id, payment_amount, payment_method) {

  // Normalize & validate
  const method = String(payment_method || "").trim().toUpperCase();
  console.log("Normalized Payment Method:", method);

  if (!["CASH", "UPI"].includes(method)) {
    throw new Error("Invalid payment method: " + payment_method);
  }

  const [result] = await db.query(
    `INSERT INTO ksn_function_hall_bill_payments
     (bill_id, payment_amount, payment_method)
     VALUES (?, ?, ?)`,
    [bill_id, payment_amount, method]
  );

  return result;
},


async recalculateFinalAmount(booking_id) {

  // 1️⃣ Refund data
  const [[refund]] = await db.query(
    `SELECT adjustable_amount,
            IFNULL(referral_amount,0) AS referral_amount
     FROM ksn_function_hall_refunds
     WHERE booking_id = ?`,
    [booking_id]
  );

  if (!refund) {
    throw new Error("Refund record not found");
  }

  // 2️⃣ Total paid amount
  const [[payment]] = await db.query(
    `SELECT IFNULL(SUM(bp.payment_amount),0) AS total_paid_amount
     FROM ksn_function_hall_bill_payments bp
     JOIN ksn_function_hall_bills b
       ON bp.bill_id = b.bill_id
     WHERE b.booking_id = ?`,
    [booking_id]
  );

  const total_bill_amount = payment.total_paid_amount;

  // 3️⃣ Final calculation
  const final_amount =
    refund.adjustable_amount
    - refund.referral_amount
    - total_bill_amount;

  // 4️⃣ Update refunds table
  await db.query(
  `UPDATE ksn_function_hall_refunds
   SET final_amount = ?,
       total_bill_amount = ?
   WHERE booking_id = ?`,
  [
    final_amount,
    total_bill_amount,
    booking_id
  ]
);

  return {
    final_amount,
    total_bill_amount
  };
}


};
