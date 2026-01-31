import express from "express";
import path from "path";
import fs from "fs";

import { generateFinalBookingPDF } from "../utility/finalpdf/generateFinalBookingpdf.js";
import { generateCancellationPDF } from "../utility/cancellationpdf/cancellationpdf.js";
import { generateReferralPDF } from "../utility/referralpdf/referralpdf.js";
import { generatePDFReceipt } from "../utility/receipts/pdf.js";

const router = express.Router();

/* ---------- helper: wait until file exists ---------- */
const waitForFile = async (filePath, timeout = 5000) => {
  const start = Date.now();

  while (!fs.existsSync(filePath)) {
    if (Date.now() - start > timeout) {
      throw new Error("PDF generation timeout");
    }
    await new Promise(res => setTimeout(res, 100));
  }
};

/* ================= FINAL BOOKING PDF ================= */
router.get("/final/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    const filePath = path.resolve(
      "utility",
      "finalpdf",
      `invoice_${bookingId}.pdf`
    );

    await generateFinalBookingPDF(bookingId);
    await waitForFile(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    res.sendFile(filePath);
  } catch (err) {
    console.error("Final PDF error:", err);
    res.status(500).send("Failed to generate PDF");
  }
});

/* ================= CANCELLATION PDF ================= */
router.get("/cancellation/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    const filePath = path.resolve(
      "utility",
      "cancellationpdf",
      `cancellation_${bookingId}.pdf`
    );

    await generateCancellationPDF(bookingId);
    await waitForFile(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    res.sendFile(filePath);
  } catch (err) {
    console.error("Cancellation PDF error:", err);
    res.status(500).send("Failed to generate PDF");
  }
});

/* ================= REFERRAL PDF ================= */
router.get("/referral/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    const filePath = path.resolve(
      "utility",
      "referralpdf",
      `referral_${bookingId}.pdf`
    );

    await generateReferralPDF(bookingId);
    await waitForFile(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    res.sendFile(filePath);
  } catch (err) {
    console.error("Referral PDF error:", err);
    res.status(500).send("Failed to generate PDF");
  }
});

/* ================= PAYMENT RECEIPT PDF ================= */
router.get("/booking/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    const filePath = path.resolve(
      "utility",
      "receipts",
      `receipt_${bookingId}.pdf`
    );

    await generatePDFReceipt(bookingId);
    await waitForFile(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    res.sendFile(filePath);
  } catch (err) {
    console.error("Receipt PDF error:", err);
    res.status(500).send("Failed to generate PDF");
  }
});

export default router;
