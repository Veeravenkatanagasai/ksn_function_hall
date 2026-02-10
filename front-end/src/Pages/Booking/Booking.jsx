import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Users, Calendar, FileText,CreditCard, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Booking1 from "../../Components/Booking/Booking";
import Customer from "../../Components/Booking/Customer";
import Refferal from "../../Components/Booking/Refferal";
import Invoice from "../../Components/Booking/Invoice";
import Payment from "./Payment";

import "./Booking.css";

const Booking = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState(null);

  const [formData, setFormData] = useState({
    // Customer
    customerName: "",
    phone: "",
    alternatePhone: "",
    email: "",
    address: "",

    noofGuests: 0,
    furnitureRequired: false,
    furnitureDetails: "",
    

    // Documents
    weddingCard: null,
    aadharCustomer: null,
    aadharBride: null,
    aadharGroom: null,

    // Referral
    referralName: "",
  referralPhone: "",
  referralEmail: "",

    // Booking
    category: "",
    hall: "",
    timeSlot: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    duration: "",
    discount: 0,
  });

  // 🔁 UPDATED STEP ORDER
  const steps = [
    { id: 1, label: "Customer", icon: <User size={20} /> },
    { id: 2, label: "Referral", icon: <Users size={20} /> },
    { id: 3, label: "Booking", icon: <Calendar size={20} /> },
    { id: 4, label: "Invoice", icon: <FileText size={20} /> },
    { id: 5, label: "Payment", icon: <CreditCard size={20} /> },
    ];

  return (
    <div className="booking-page">
      <div className="booking-bg blob-a" />
      <div className="booking-bg blob-b" />
      <div className="booking-bg blob-c" />

      <div className="booking-shell">
        {/* HEADER */}
        <header className="booking-header">
          <div className="booking-header-row">
            <button
              className="booking-back-btn"
              onClick={() => window.history.back()}
            >
              ← Back to Dashboard
            </button>

            <div className="booking-brand">
              <div className="booking-logo">
                <span /><span /><span /><span />
              </div>
              <div>
                <h1>Booking</h1>
                <p>KSN Function Hall</p>
              </div>
            </div>

            <div className="booking-session">
              <h6>Session Date</h6>
              {new Date().toLocaleDateString("en-GB")}
            </div>
          </div>

          {/* STEPPER */}
          <nav className="booking-stepper">
            {steps.map((s, i) => (
              <div key={s.id} className="booking-step">
                <div
                  className={`booking-node 
                    ${step >= s.id ? "active" : ""} 
                    ${step > s.id ? "done" : ""}`}
                >
                  {step > s.id ? <CheckCircle size={20} /> : s.icon}
                </div>
                <span>{s.label}</span>
                {i < steps.length - 1 && (
                  <div className={`booking-line ${step > s.id ? "filled" : ""}`} />
                )}
              </div>
            ))}
          </nav>
        </header>

        {/* FORM */}
        <main className="booking-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              className="booking-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && <Customer data={formData} setData={setFormData} onNext={() => setStep(2)} />}
              {step === 2 && <Refferal data={formData} setData={setFormData} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
              {step === 3 && <Booking1 data={formData} setData={setFormData} onBack={() => setStep(2)} onNext={() => setStep(4)} />}
              {step === 4 && (
                <Invoice
                  data={formData}
                  onBack={() => setStep(3)}
                  onConfirmed={(id) => {
                    setBookingId(id);
                    setStep(5);
                  }}
                />
              )}
              {step === 5 && bookingId && <Payment bookingId={bookingId} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Booking;