import db from "../config/db.js";

// ===== BILLS =====
export const createBill = async (data) => {
  const sql = `
    INSERT INTO ksn_function_hall_maintenance_bills
    (maintenance_bill_name, maintenance_bill_photo, maintenance_bill_amount, maintenance_bill_description)
    VALUES (?, ?, ?, ?)
  `;
  return db.query(sql, data);
};

export const getBills = async () => {
  const sql = `
    SELECT 
      b.maintenance_bill_id,
      b.maintenance_bill_name,
      b.maintenance_bill_photo,
      b.maintenance_bill_amount,
      b.maintenance_bill_description,

      p.payment_amount,
      p.payment_method,
      CASE 
        WHEN p.maintenance_payment_id IS NOT NULL THEN 'PAID'
        ELSE 'UNPAID'
      END AS payment_status

    FROM ksn_function_hall_maintenance_bills b
    LEFT JOIN ksn_function_hall_maintenance_payments p
      ON b.maintenance_bill_id = p.maintenance_bill_id
    ORDER BY b.maintenance_bill_id DESC
  `;
  return db.query(sql);
};

export const getBillById = async (id) => {
  const sql = `
    SELECT *
    FROM ksn_function_hall_maintenance_bills
    WHERE maintenance_bill_id = ?
  `;
  return db.query(sql, [id]);
};

export const updateBill = async (data) => {
  const sql = `
    UPDATE ksn_function_hall_maintenance_bills
    SET
      maintenance_bill_name = ?,
      maintenance_bill_photo = ?,
      maintenance_bill_amount = ?,
      maintenance_bill_description = ?
    WHERE maintenance_bill_id = ?
  `;
  return db.query(sql, data);
};

export const deleteBill = async (id) => {
  const sql = `
    DELETE FROM ksn_function_hall_maintenance_bills
    WHERE maintenance_bill_id = ?
  `;
  return db.query(sql, [id]);
};

// ===== PAYMENTS =====
export const addPayment = async (data) => {
  const sql = `
    INSERT INTO ksn_function_hall_maintenance_payments
    (maintenance_bill_id, payment_amount, payment_method,payment_status)
    VALUES (?, ?, ?, 'paid')
  `;
  return db.query(sql, data);
};

export const getPayments = async (billId) => {
  const sql = `
    SELECT *
    FROM ksn_function_hall_maintenance_payments
    WHERE maintenance_bill_id = ?
    ORDER BY maintenance_payment_id DESC
  `;
  return db.query(sql, [billId]);
};

export const markPaymentPaid = async (paymentId) => {
  const sql = `
    UPDATE ksn_function_hall_maintenance_payments
    SET payment_status = 'paid'
    WHERE maintenance_payment_id = ?
  `;
  return db.query(sql, [paymentId]);
};

