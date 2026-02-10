import db from "../config/db.js";
import {
  insertCustomer,
  insertReferral,
  insertBooking,updateCustomer,
} from "../models/bookingModel.js";

export const confirmBooking = async (req, res) => {
  const conn = await db.getConnection();

  try {

    const userRole = req.user.role?.toLowerCase(); // admin | employee

    const booking = JSON.parse(req.body.booking);

    if (userRole === "employee" && booking.discount > 10) {
      return res.status(403).json({
        message: "Employees can give a maximum of 10% discount",
      });
    }

    await conn.beginTransaction();

    const files = req.files || {};

    const customer = {
      ...req.body,
      aadharCustomer: files.aadharCustomer?.[0]?.path ?? null,
      aadharBride: files.aadharBride?.[0]?.path ?? null,
      aadharGroom: files.aadharGroom?.[0]?.path ?? null,
      weddingCard: files.weddingCard?.[0]?.path ?? null,
      noofGuests: parseInt(req.body.noofGuests) || 0,
      furnitureDetails: req.body.furnitureDetails || null,
    };

    const customerId = await insertCustomer(conn, customer);

    let referralId = null;
    if (req.body.referralName) {
      referralId = await insertReferral(conn, {
        name: req.body.referralName,
        phone: req.body.referralPhone,
        email: req.body.referralEmail,
      });
    }

    const bookingId = await insertBooking(conn, {
      customerId,
      referralId,
      booking,
      invoice: JSON.parse(req.body.invoice),
    });

    await conn.commit();

    res.json({
      success: true,
      message: "Booking confirmed successfully",
      bookingId,
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ BOOKING SAVE ERROR:", err);
    res.status(500).json({ message: "Booking failed", error: err.message });
  } finally {
    conn.release();
  }
};

export const updateCustomerDetails = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ message: "Customer ID required" });
    }

    const files = req.files || {};

    // 🔹 Map frontend FormData keys to backend model keys
    const updatedData = {
      name: req.body.customer_name ?? "",       // required!
      phone: req.body.phone ?? "",
      alternatePhone: req.body.alternate_phone ?? null,
      email: req.body.email ?? "",
      address: req.body.address ?? "",
      aadharCustomer: files.aadharCustomer?.[0]?.path ?? null,
      aadharBride: files.aadharBride?.[0]?.path ?? null,
      aadharGroom: files.aadharGroom?.[0]?.path ?? null,
      weddingCard: files.weddingCard?.[0]?.path ?? null,
      noofGuests: parseInt(req.body.noofGuests),
      furnitureDetails: req.body.furnitureDetails || null,
    };

    // 🔹 Validation: ensure required fields are not empty
    if (!updatedData.name) {
      return res.status(400).json({ message: "Customer name is required" });
    }

    await conn.beginTransaction();
    await updateCustomer(conn, customerId, updatedData);
    await conn.commit();

    res.json({
      success: true,
      message: "Customer details updated successfully",
    });

  } catch (err) {
    await conn.rollback();
    console.error("❌ UPDATE CUSTOMER ERROR:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  } finally {
    conn.release();
  }
};
