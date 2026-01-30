import React, { useEffect, useState } from "react";
import {
  validateReferralName,
  validateReferralPhone,
  validateReferralEmail,
} from "./Validator";
import "./Customer.css";
import api from "../../services/api"; // adjust path if needed


const Referral = ({ data = {}, setData, onBack, onNext }) => {
  const [errors, setErrors] = useState({});

  // ✅ SAFE FALLBACK VALUES (CRITICAL)
  const referralName = data.referralName ?? "";
  const referralPhone = data.referralPhone ?? "";
  const referralEmail = data.referralEmail ?? "";

  /* ---------- Validation ---------- */
  useEffect(() => {
    setErrors({
      referralName: validateReferralName(referralName),
      referralPhone: validateReferralPhone(referralPhone),
      referralEmail: validateReferralEmail(referralEmail),
    });
  }, [referralName, referralPhone, referralEmail]);

  const isFormValid =
    !referralName && !referralPhone && !referralEmail
      ? true // optional
      : Object.values(errors).every((e) => e === "");

  /* ---------- Handlers ---------- */
  const handleChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = async () => {
    if (!isFormValid) {
      alert("Please correct referral details");
      return;
    }

    if (!referralName && !referralPhone) {
      onNext();
      return;
    }

    try {
      const res = await api.post("/referrals", {
      referralName,
      referralPhone,
      referralEmail,
    });
      if (!res.ok) throw new Error();

      onNext();
    } catch {
      alert("Failed to save referral");
    }
  };

  return (
    <div className="customer-card">
      <h3 style={{ marginBottom: "20px" }}>
        Referral Details (Optional)
      </h3>

      <div className="grid">
        {/* Referral Name */}
        <div className="input-group">
          <label>Referral Name</label>
          <input
            value={referralName}
            onChange={(e) =>
              handleChange("referralName", e.target.value)
            }
            className={errors.referralName ? "error" : ""}
          />
          {errors.referralName && (
            <span className="error-text">{errors.referralName}</span>
          )}
        </div>

        {/* Referral Phone */}
        <div className="input-group">
          <label>Referral Phone</label>
          <input
            maxLength="10"
            value={referralPhone}
            onChange={(e) =>
              handleChange(
                "referralPhone",
                e.target.value.replace(/\D/g, "")
              )
            }
            className={errors.referralPhone ? "error" : ""}
          />
          {errors.referralPhone && (
            <span className="error-text">{errors.referralPhone}</span>
          )}
        </div>

        {/* Referral Email */}
        <div className="input-group full">
          <label>Referral Email</label>
          <input
            value={referralEmail}
            onChange={(e) =>
              handleChange("referralEmail", e.target.value)
            }
            className={errors.referralEmail ? "error" : ""}
          />
          {errors.referralEmail && (
            <span className="error-text">{errors.referralEmail}</span>
          )}
        </div>
      </div>

      <div className="actions">
        <button className="btn-secondary" onClick={onBack}>
          ← Back
        </button>

        <button
          className="btn-primary"
          disabled={!isFormValid}
          onClick={onNext}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Referral;
