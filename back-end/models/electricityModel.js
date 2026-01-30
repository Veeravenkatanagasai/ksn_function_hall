import db from "../config/db.js";

// Get booking info by ID
export const getBookingById = async (bookingId) => {
  const [[booking]] = await db.query(
    `SELECT booking_id, category FROM ksn_function_hall_bookings WHERE booking_id = ?`,
    [bookingId]
  );
  return booking;
};

// Get utility costs for a category
export const getUtilityCostsByCategory = async (categoryName) => {
  const [rows] = await db.query(
    `SELECT u.utility_name, u.price_per_hour, u.default_hours
     FROM ksn_function_hall_utility_costs u
     JOIN ksn_function_hall_categories c ON u.category_id = c.category_id
     WHERE c.category_name = ?`,
    [categoryName]
  );

  const costMap = {};
  rows.forEach(row => {
    costMap[row.utility_name] = {
      price_per_hour: row.price_per_hour,
      default_hours: row.default_hours
    };
  });
  return costMap;
};

// Create electricity bill
export const createElectricityBill = async (data) => {
  const sql = `INSERT INTO ksn_function_hall_electricity_bills
  (booking_id,
    current_previous_reading_image,
    current_after_reading_image,
    current_previous_units,
    current_after_current_units,
    current_per_unit_cost,
    currnet_total_amount,
    generator_previous_reading_image,
    generator_after_reading_image,
    generator_previous_units,
    generator_after_units,
    generator_per_unit_cost,
    generator_total_amount,
    grand_total
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

  await db.query(sql, data);
};

// Get electricity bill by booking
export const getElectricityBillByBookingId = async (bookingId) => {
  const [[bill]] = await db.query(
    `SELECT * FROM ksn_function_hall_electricity_bills WHERE booking_id = ?`,
    [bookingId]
  );
  return bill;
};
