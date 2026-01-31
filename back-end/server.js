import express from "express";
import cors from "cors";
import dotenv from "dotenv";


//Routes
import "./utility/bookingExpiryCorn.js";
import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import timeslotRoutes from "./routes/timeslotRoutes.js";
import hallRoutes from "./routes/hallRoutes.js";
import hallpricingRoutes from "./routes/hallpricingRoutes.js";
import FixedChargesRoutes from "./routes/FixedChargesRoutes.js";
import utilityRoutes from "./routes/utilityCostRoutes.js";
import pricingRuleRoutes from "./routes/pricingRuleRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import showDetailsRoutes from "./routes/showDetailsRoutes.js";
import datefilterRoutes from "./routes/datefilterRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js"; 
import authRoutes from "./routes/employeeauthRoutes.js"; 
import savecontactsRoutes from "./routes/savecontactsRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import vendorRoutes from"./routes/vendorRoutes.js";
import servicesRoutes from "./routes/servicesRoutes.js";
import referralPaymentRoutes from "./routes/referralPaymentRoutes.js";
import termsconditionRoutes from "./routes/termsconditionRoutes.js";
import translateRoutes from "./routes/translateRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import cancellationRuleRoutes from "./routes/cancellationRuleRoutes.js";
import cancellaationRoutes from "./routes/cancellationRoutes.js";
import electricityRoutes from "./routes/electricityRoutes.js";
import refundRoutes from "./routes/refundRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
/* -------- Middleware -------- */
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://ksn-function-hall.vercel.app" // production frontend
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------- API Routes -------- */
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/timeslots", timeslotRoutes);
app.use("/api/halls", hallRoutes);
app.use("/api/hallpricing", hallpricingRoutes);
app.use("/api/fixedcharges", FixedChargesRoutes);
app.use("/api/utilities", utilityRoutes);
app.use("/api/price-rules", pricingRuleRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/bookings",bookingRoutes);
app.use("/api/booking-details", showDetailsRoutes);
app.use("/api/datefilter", datefilterRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/savecontacts",savecontactsRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/vendors",vendorRoutes);
app.use("/api/services",servicesRoutes);
app.use("/api/referral-payment",referralPaymentRoutes);
app.use("/api/terms",termsconditionRoutes);
app.use("/api/translate",translateRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cancellation-rules",cancellationRuleRoutes);
app.use("/api/cancellation",cancellaationRoutes);
app.use("/api/electricity",electricityRoutes);
app.use("/api/refund", refundRoutes);
app.use("/api/pdf",pdfRoutes);
app.use("/api/gallery",galleryRoutes);
app.use('/api/bills', billRoutes);
app.use("/api/maintenance", maintenanceRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
