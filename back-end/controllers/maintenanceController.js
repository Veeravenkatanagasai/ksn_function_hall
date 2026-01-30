import * as Bill from "../models/maintenanceModel.js";

// ===== ADD BILL =====
export const addBill = async (req, res) => {
  try {
    const { name, amount, description } = req.body;
    const photo = req.file ? req.file.filename : null;

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

    // 1️⃣ Get existing bill
    const [existingRows] = await Bill.getBillById(req.params.id);
    if (!existingRows[0]) {
      return res.status(404).json({ message: "Bill not found" });
    }
    const existingBill = existingRows[0];

    // 2️⃣ Decide which photo to use
    const photo = req.file ? req.file.filename : existingBill.maintenance_bill_photo;

    // 3️⃣ Update bill in DB
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
  try {
    await Bill.deleteBill(req.params.id);
    res.json({ message: "Bill deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete bill" });
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
