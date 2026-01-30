import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Users, Calendar, FileText, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Booking1 from "../../Components/Booking/Booking";
import Customer from "../../Components/Booking/Customer";
import Refferal from "../../Components/Booking/Refferal";
import Invoice from "../../Components/Booking/Invoice";

import "./Booking.css";

const Booking = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Customer
    customerName: "",
    phone: "",
    alternatePhone: "",
    email: "",
    address: "",

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
  ];

  return (
    <div className="main-viewport">

      <button
        className="btn btn-outline-dark position-fixed top-0 end-0 m-4 z-50"
        onClick={() => window.history.back()}
      >
        ← Back to Dashboard
      </button>

      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      <div className="booking-wrapper">
        {/* HEADER */}
        <header className="glass-header">
          <div className="header-content">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="brand-section"
            >
              <div className="app-logo">
                <span></span><span></span><span></span><span></span>
              </div>
              <div>
                <h1>Booking </h1>
                <p>KSN Function Hall</p>
              </div>
            </motion.div>

            <div className="header-date">
              <span className="label">Session</span><br />
              <span className="value">
                {new Date().toLocaleDateString("en-GB")}
              </span>
            </div>
          </div>

          {/* STEPPER */}
          <nav className="stepper-nav">
            {steps.map((s, idx) => (
              <div key={s.id} className="step-item">
                <div
                  className={`step-node 
                    ${step >= s.id ? "active" : ""} 
                    ${step > s.id ? "done" : ""}`}
                >
                  {step > s.id ? <CheckCircle size={22} /> : s.icon}
                </div>

                <span className="step-label">{s.label}</span>

                {idx !== steps.length - 1 && (
                  <div className={`connector ${step > s.id ? "filled" : ""}`} />
                )}
              </div>
            ))}
          </nav>
        </header>

        {/* FORM CONTENT */}
        <main className="form-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="glass-card"
            >

              {/* STEP 1 – CUSTOMER */}
              {step === 1 && (
                <Customer
                  data={formData}
                  setData={setFormData}
                  onNext={() => setStep(2)}
                />
              )}

              {/* STEP 2 – REFERRAL */}
              {step === 2 && (
                <Refferal
                  data={formData}
                  setData={setFormData}
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                />
              )}

              {/* STEP 3 – BOOKING */}
              {step === 3 && (
                <Booking1
                  data={formData}
                  setData={setFormData}
                  onBack={() => setStep(2)}
                  onNext={() => setStep(4)}
                />
              )}

              {/* STEP 4 – INVOICE */}
              {step === 4 && (
                <Invoice
                  data={formData}
                  onBack={() => setStep(3)}
                  onConfirm={() => {
                    alert("✅ Booking Successfully Completed");
                  }}
                  confirmText="Book Now"
                />
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Booking;
