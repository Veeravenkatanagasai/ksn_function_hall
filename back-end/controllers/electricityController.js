import { getBookingById, getUtilityCostsByCategory, createElectricityBill, getElectricityBillByBookingId } from "../models/electricityModel.js";

export const fetchUtilityCostsByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await getBookingById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const costs = await getUtilityCostsByCategory(booking.category);
    res.json(costs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch utility costs" });
  }
};

export const getElectricityBill = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const bill = await getElectricityBillByBookingId(bookingId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch electricity bill" });
  }
};

// Add electricity bill
export const addElectricityBill = async (req, res) => {
  try {
    const {
      booking_id,
      current_previous_units,
      current_after_current_units,
      generator_previous_units,
      generator_after_units,
      current_per_unit_cost,
      generator_per_unit_cost
    } = req.body;

    // Calculate used units
    const currentUnits = parseFloat(current_after_current_units || 0) - parseFloat(current_previous_units || 0);
    const generatorUnits = parseFloat(generator_after_units || 0) - parseFloat(generator_previous_units || 0);

    // Calculate totals
    const currentTotal = currentUnits * parseFloat(current_per_unit_cost || 0);
    const generatorTotal = generatorUnits * parseFloat(generator_per_unit_cost || 0);

    // Grand total
    const grandTotal = currentTotal + generatorTotal;

    const files = req.files || {};

    // Insert into DB
    await createElectricityBill([
      booking_id,
      files.current_previous?.[0]?.path || null,
      files.current_after?.[0]?.path || null,
      current_previous_units || 0,
      current_after_current_units || 0,
      current_per_unit_cost || 0,
      currentTotal,
      files.generator_previous?.[0]?.path || null,
      files.generator_after?.[0]?.path || null,
      generator_previous_units || 0,
      generator_after_units || 0,
      generator_per_unit_cost || 0,
      generatorTotal,
      grandTotal,

      files.current_previous?.[0]?.filename || null,
      files.current_after?.[0]?.filename || null,
      files.generator_previous?.[0]?.filename || null,
      files.generator_after?.[0]?.filename || null
    ]);

    res.json({ message: "Electricity bill created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create electricity bill" });
  }
};




