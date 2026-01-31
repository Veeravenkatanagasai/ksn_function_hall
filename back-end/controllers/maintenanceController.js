import * as Bill from "../models/maintenanceModel.js";
import db from "../config/db.js"; 

// ===== ADD BILL =====
export const addBill = async (req, res) => {
  try {
    const { name, amount, description } = req.body;
    const photo = req.file ? req.file.path : null;

    await Bill.createBill([name, photo, amount, description]);
    res.json({ message: "Bill added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add bill" });
  }
};

// ===== GET ALL BILLS =====
export const getAllBills = async (req, res) => {
  try {
    const [rows] = await Bill.getBills();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load bills" });
  }
};

// ===== GET SINGLE BILL =====
export const getBill = async (req, res) => {
  try {
    const [rows] = await Bill.getBillById(req.params.id);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get bill" });
  }
};

// ===== UPDATE BILL =====

export const updateBill = async (req, res) => {
  try {
    const { name, amount, description } = req.body;

    const [rows] = await Bill.getBillById(req.params.id);
    if (!rows[0]) return res.status(404).json({ message: "Bill not found" });

    const photo = req.file
      ? req.file.path   
      : rows[0].maintenance_bill_photo;
  
    const updateData = [name, photo, amount, description, req.params.id];
    await Bill.updateBill(updateData);

    res.json({ message: "Bill updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update bill" });
  }
};


// ===== DELETE BILL =====
export const deleteBill = async (req, res) => {
  const billId = req.params.id;

  try {
    // Check if bill exists
    const [existingRows] = await Bill.getBillById(billId);
    if (!existingRows[0]) return res.status(404).json({ message: "Bill not found" });

    // Delete associated payments first
    const deletePaymentsQuery = `
      DELETE FROM ksn_function_hall_maintenance_payments
      WHERE maintenance_bill_id = ?
    `;
    await db.query(deletePaymentsQuery, [billId]);
    // Now delete the bill
    const [deleteBillResult] = await Bill.deleteBill(billId);
    if (deleteBillResult.affectedRows === 0) {
      return res.status(500).json({ message: "Failed to delete bill" });
    }
    res.json({ message: "Bill and associated payments deleted successfully" });

  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        message: "Cannot delete bill due to existing references",
        error: err.sqlMessage,
      });
    }
    res.status(500).json({ message: "Internal server error while deleting bill", error: err.sqlMessage || err.message });
  } 
};

// ===== PAYMENTS =====
export const insertPayment = async (req, res) => {
  try {
    const { billId, amount, method } = req.body;
    await Bill.addPayment([billId, amount, method]);
    res.json({ message: "Payment added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add payment" });
  }
};

export const showPayments = async (req, res) => {
  try {
    const [rows] = await Bill.getPayments(req.params.billId);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};
