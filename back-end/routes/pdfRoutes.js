import express from "express";
import { generateFinalBookingPDF } from "../utility/finalpdf/generateFinalBookingpdf.js";
import { generateCancellationPDF } from "../utility/cancellationpdf/cancellationpdf.js";
import { generateReferralPDF } from "../utility/referralpdf/referralpdf.js";
import { generatePDFReceipt } from "../utility/receipts/pdf.js";

import path from "path";
import fs from "fs";

const router = express.Router();

// ================= FINAL BOOKING PDF =================
router.get("/final/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    await generateFinalBookingPDF(bookingId);

    const filePath = path.join(
      process.cwd(),
      "utility",
      "finalpdf",
      `invoice_${bookingId}.pdf`
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("PDF not found");
    }

    res.sendFile(filePath);
  } catch (err) {
    console.error("PDF Route Error:", err);
    res.status(500).send("Failed to generate PDF");
  }
});

// ================= CANCELLATION PDF =================
router.get("/cancellation/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    await generateCancellationPDF(bookingId);

    const filePath = path.join(
      process.cwd(),
      "utility",
      "cancellationpdf",
      `cancellation_${bookingId}.pdf`
    );

    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).send("PDF generation failed");
  }
});

// ================= REFERRAL PDF =================
router.get("/referral/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    await generateReferralPDF(bookingId);

    const filePath = path.join(
      process.cwd(),
      "utility",
      "referralpdf",
      `referral_${bookingId}.pdf`
    );

    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).send("PDF generation failed");
  }
});

router.get("/booking/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    await generatePDFReceipt(bookingId);

    const filePath = path.join(
      "utility",
      "receipts",
      `receipt_${bookingId}.pdf`
    );

    res.sendFile(path.resolve(filePath));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate booking PDF" });
  }
});


export default router;
