import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Settings, Info } from "lucide-react";

// Module Imports
import Categories from "./Categories";
import TimeSlots from "../../Dashboard/HallPricing/TimeSlots";
import Hall from "../../Dashboard/HallPricing/Hall";
import PricingRules from "../../Dashboard/HallPricing/PricingRules";
import FixedCharges from "../../Dashboard/HallPricing/FixedCharges";
import UtilityCost from "../../Dashboard/HallPricing/UtilityCosts";
import CancellationRules from "./CancellationRule";
import TermsConditions from "./TermsCondition";

// Animation Variants for staggered loading
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

/**
 * Standardized Notification Helper
 * Usage: notify('success', 'Hall added successfully!')
 */
export const notify = (icon, title) => {
  Swal.fire({
    icon: icon,
    title: title,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#fff',
    color: '#000',
  });
};

export default function AdminMasters() {
  return (
    <div className="min-vh-100 bg-light py-4 px-3 px-md-5">
      <div className="container-fluid">
        {/* HEADER SECTION */}
        <header className="d-flex justify-content-between align-items-center mb-5 bg-white p-4 rounded-4 shadow-sm border-start border-primary border-5">
          <div className="title-section">
            <h1 className="fw-bold h3 mb-1 text-dark d-flex align-items-center gap-2">
              <Settings className="text-primary" /> Hall Management Dashboard
            </h1>
            <p className="text-muted mb-0 small">
              <Info size={14} className="me-1" />
              Configure categories, slots, pricing, and operational costs for production deployment.
            </p>
          </div>
          
          <motion.div
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              zIndex: 1050
            }}
          >
            <Link
              to="/dashboard"
              className="btn btn-outline-dark d-flex align-items-center gap-2 rounded-pill px-4 fw-bold shadow-sm"
            >
              <ArrowLeft size={18} /> Back to Dashboard
            </Link>
          </motion.div>

        </header>

        {/* MODULES GRID/STACK */}
        <motion.main 
          className="row g-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Mapping through components to ensure standard card styling */}
          {[
            { comp: <Categories />, id: "categories" },
            { comp: <TimeSlots />, id: "timeslots" },
            { comp: <Hall />, id: "hall" },
            { comp: <FixedCharges />, id: "fixed-charges" },
            { comp: <UtilityCost />, id: "utility-costs" },
            { comp: <PricingRules />, id: "Rules" },
            { comp: <CancellationRules /> ,id: "cancellation-rules"},
            { comp: <TermsConditions /> ,id: "Terms-Conditions"}
          ].map((item, idx) => (
            <motion.section 
              key={item.id}
              className="col-12"
              variants={itemVariants}
            >
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 transition-all hover-shadow">
                <div className="card-body p-0">
                  {/* Passing notification helper if components are designed to accept props */}
                  {React.cloneElement(item.comp, { onAction: notify })}
                </div>
              </div>
            </motion.section>
          ))}
        </motion.main>

        {/* DEPLOYMENT FOOTER */}
        <footer className="mt-5 text-center text-muted small pb-4">
          <hr className="opacity-10" />
          <p>© 2026 Production Environment • System v2.4.0</p>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hover-shadow:hover {
          box-shadow: 0 1rem 3rem rgba(0,0,0,.1) !important;
          transform: translateY(-2px);
        }
        .transition-all {
          transition: all 0.3s ease-in-out;
        }
        body {
          background-color: #f8f9fa;
        }
      `}} />
    </div>
  );
}