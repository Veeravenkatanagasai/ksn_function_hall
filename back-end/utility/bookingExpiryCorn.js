import cron from "node-cron";
import db from "../config/db.js";


// Runs every 5 minutes
cron.schedule("*/1 * * * *", async () => {
  try {
    const [result] = await db.query(`
      UPDATE ksn_function_hall_bookings b
      SET 
        b.booking_status = 'ONHOLD',
        b.onhold_at = NOW(),
        b.onhold_reason = 'Balance payment overdue'
      WHERE b.booking_status = 'ADVANCE'
        AND b.balance_due_date IS NOT NULL
        AND b.balance_due_date < NOW()
        AND NOT EXISTS (
          SELECT 1 FROM ksn_function_hall_payments p
          WHERE p.booking_id = b.booking_id
            AND p.payment_type = 'BALANCE'
            AND p.transaction_status = 'SUCCESS'
        )
    `);

    if (result.affectedRows > 0) {

    }
  } catch (err) {
  }
});
