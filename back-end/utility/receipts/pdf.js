import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import db from "../../config/db.js"; // Your database connection

export const generatePDFReceipt = async (bookingId) => {
  try {
    // ================= FETCH DATA =================
    const [[booking]] = await db.query(`
      SELECT 
        b.*, 
        c.customer_name, c.phone, c.email, c.address,c.no_of_guests,c.furniture_details,
        r.referral_name, r.referral_mobileno, referral_email,
        p.payment_type, p.payment_method, p.paid_amount,
        p.balance_amount, p.transaction_status, p.created_at AS payment_date
      FROM ksn_function_hall_bookings b
      JOIN ksn_function_hall_customer_details c ON c.customer_id = b.customer_id
      LEFT JOIN ksn_function_hall_referrals r ON b.referral_id = r.referral_id
      LEFT JOIN ksn_function_hall_payments p ON p.booking_id = b.booking_id
      WHERE b.booking_id = ?
      ORDER BY p.created_at DESC
      LIMIT 1
    `, [bookingId]);

    if (!booking) {
      return;
  
    }

    // ================= FETCH FIXED CHARGES =================
    const [fixedCharges] = await db.query(`
      SELECT charges_name, charges_value
      FROM ksn_function_hall_fixed_charges fc
      JOIN ksn_function_hall_categories cat ON fc.category_id = cat.category_id
      WHERE cat.category_name = ?
    `, [booking.category]);

    // ================= FETCH TERMS & CONDITIONS =================
    const [terms] = await db.query(`
      SELECT terms_text_en, terms_text_te
      FROM ksn_function_hall_terms_conditions
      ORDER BY terms_id ASC
    `);

    // ================= PDF SETUP =================
    const receiptsDir = path.join("utility", "receipts");
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const filePath = path.join(receiptsDir, `receipt_${bookingId}.pdf`);
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));

    // ================= FONTS =================
    const fontsDir = path.join("utility", "fonts");
    const fontEnglish = path.join(fontsDir, "NotoSans-Regular.ttf");
    const fontEnglishBold = path.join(fontsDir, "NotoSans-Bold.ttf");
    const fontTelugu = path.join(fontsDir, "NotoSansTelugu-Regular.ttf");
    const fontTeluguBold = path.join(fontsDir, "NotoSansTelugu-Bold.ttf");

    // Check fonts
    [fontEnglish, fontEnglishBold, fontTelugu, fontTeluguBold].forEach(f => {
    });

    // ================= HEADER =================
    const invoiceNo = `KSN-ORDER-${booking.booking_id}`;

    doc.font(fontEnglishBold).fontSize(24).fillColor("#0b3b68").text("KSN FUNCTION HALL", { align: "center" });
    doc.font(fontEnglish).fontSize(16).fillColor("#555").text("Order/ Payment Receipt", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#000");
    doc.text(`Order No: ${invoiceNo}`, 50, doc.y, {align: "left"});
    doc.text(`Order Date: ${new Date().toLocaleDateString("en-IN")}`,50,doc.y,{align: "right"});
    doc.moveDown(0.5);
    doc.strokeColor("#0b3b68").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // ================= HELPER FUNCTIONS =================
    const sectionBox = (title, contentCallback) => {
      doc.moveDown(0.5);
      doc.font(fontEnglishBold).fontSize(13).fillColor("#0b3b68").text(title);
      doc.moveDown(0.2);
      doc.strokeColor("#0b3b68").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.3);
      doc.font(fontEnglish).fontSize(11).fillColor("#000");
      contentCallback();
      doc.moveDown(0.5);
    };

    const twoCol = (label, value) => {
      try {
        doc.text(label, { continued: true });
        doc.text(String(value), { align: "right" });
      } catch (err) {
      }
    };

    // ================= ALL SECTIONS =================
    sectionBox("Booking Summary", () => {
      twoCol("Booking ID", booking.booking_id);
      twoCol("Status", booking.booking_status);
      twoCol("Booking Date", new Date(booking.booking_date).toLocaleDateString("en-IN"));
      if (booking.balance_due_date) twoCol("Balance Due Date", new Date(booking.balance_due_date).toLocaleDateString("en-IN"));
    });

    sectionBox("Customer Details", () => {
      twoCol("Name", booking.customer_name);
      twoCol("Phone", booking.phone);
      twoCol("Email", booking.email);
      twoCol("Address", booking.address);
      twoCol("No. of Guests", booking.no_of_guests || "N/A");
      twoCol("Furniture Details", booking.furniture_details || "N/A");
    });

    sectionBox("Event Details", () => {
      twoCol("Category", booking.category);
      twoCol("Hall", booking.hall);
      twoCol("Event Date", booking.event_date);
      twoCol("Time Slot", booking.time_slot);
      twoCol("Start_Time", `${booking.start_time}`);
      twoCol("End_Time", `${booking.end_time}`);
      twoCol("Duration", `${booking.duration} hrs`);
    });

    sectionBox("Referral Details", () => {
      twoCol("Name", booking.referral_name || "N/A");
      twoCol("Phone", booking.referral_mobileno || "N/A");
      twoCol("Email", booking.referral_email || "N/A");

    });

    sectionBox("Fixed Charges", () => {
      fixedCharges.forEach(fc => twoCol(fc.charges_name, `₹ ${fc.charges_value}`));
    });

      sectionBox("Hall Charges", () => {
        twoCol("Hall Charge", `₹ ${Number(booking.hall_charge || 0).toFixed(2)}`);
      });


     sectionBox("Total Summary", () => {
  const fixedCharges = Number(booking.fixed_charges_total || 0);
  const hallCharge = Number(booking.hall_charge || 0);
  const discountAmount = Number(booking.discount_amount || 0);
  const discountPercent = Number(booking.discount_percent || 0);

  const gross = fixedCharges + hallCharge;
  const netPayable = gross - discountAmount;

  twoCol("Gross Total", `₹ ${gross.toFixed(2)}`);
  twoCol(`Discount (${discountPercent}%)`, `₹ ${discountAmount.toFixed(2)}`);
  twoCol("NET PAYABLE", `₹ ${netPayable.toFixed(2)}`);
});


    sectionBox("Payment Details", () => {
      twoCol("Payment Type", booking.payment_type || "N/A");
      twoCol("Method", booking.payment_method || "N/A");
      twoCol("Paid Amount", `₹ ${booking.paid_amount || 0}`);
      twoCol("Balance Amount", `₹ ${booking.balance_amount || 0}`);
      twoCol("Transaction Status", booking.transaction_status || "N/A");
      twoCol("Payment Date", booking.payment_date ? new Date(booking.payment_date).toLocaleString() : "N/A");
    });

    if (terms.length) {
      sectionBox("Terms & Conditions", () => {
        let idx = 1;
        terms.forEach(term => {
          try {
            doc.font(fontEnglish).fontSize(10).fillColor("#000").text(`${idx}. ${term.terms_text_en}`, { width: 500, align: "justify", lineGap: 2 });
            if (term.terms_text_te) {
              doc.font(fontTelugu).fontSize(10).fillColor("#000").text(`${idx}. ${term.terms_text_te}`, { width: 500, align: "justify", lineGap: 2 });
            }
          } catch (err) {
          }
          idx++;
        });
      });
    }

    // ================= FOOTER =================
    doc.moveDown(2);
    doc.font(fontEnglish).fontSize(10).fillColor("#777").text("Thank you for choosing KSN Function Hall.", { align: "center" });

    doc.end();

  } catch (err) {
  }
};
