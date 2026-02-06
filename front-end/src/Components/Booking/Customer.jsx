import React, { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { validateName, validatePhone, validateEmail } from "./Validator";
import FilePreview from "./FilePreview";
import { fetchCategories } from "../../services/dropdown"; // Fetch categories from backend
import api from "../../services/api";

const Customer = ({ data, setData, onNext }) => {
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);

  // Fetch categories from backend on mount
  useEffect(() => {
    const getCategories = async () => {
      const cats = await fetchCategories();
      setCategories(cats || []);
    };
    getCategories();
  }, []);

  // Live validation
  useEffect(() => {
    setErrors({
      customerName: validateName(data.customerName),
      phone: validatePhone(data.phone),
      email: validateEmail(data.email),
      address: data.address?.trim() ? "" : "Address is required",
      category: data.category ? "" : "Category is required",
      aadharCustomer: data.aadharCustomer ? "" : "Customer Aadhar is required",
    });
  }, [data]);

  const isFormValid = Object.values(errors).every((err) => err === "");

  const handleChange = (field, value) => setData({ ...data, [field]: value });
  const handleFile = (field, file) => setData({ ...data, [field]: file });

  const handleNext = async () => {
    if (!isFormValid) {
      alert("Please fill all required fields correctly.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("customerName", data.customerName);
      formData.append("phone", data.phone);
      formData.append("alternatePhone", data.alternatePhone || "");
      formData.append("email", data.email || "");
      formData.append("address", data.address);
      formData.append("category", data.category);

      if (data.aadharCustomer) formData.append("aadharCustomer", data.aadharCustomer);
      if (data.category === "Marriage") {
        if (data.aadharBride) formData.append("aadharBride", data.aadharBride);
        if (data.aadharGroom) formData.append("aadharGroom", data.aadharGroom);
        if (data.weddingCard) formData.append("weddingCard", data.weddingCard);
      }

      await api.post("/customers", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    onNext();
  } catch (err) {
    console.error(err);
    alert("Error saving customer. Please try again.");
  }
};

  // Reusable file upload component
  const UploadBox = ({ label, field, required }) => (
    <div className="input-group">
      <label>
        {label} {required && <span className="req">*</span>}
      </label>

      <label className="upload-box">
        <Upload size={18} />
        <span>{data[field] ? "File selected" : "Choose file"}</span>
        <input
          type="file"
          hidden
          onChange={(e) => handleFile(field, e.target.files[0])}
        />
      </label>

      {errors[field] && <span className="error-text">{errors[field]}</span>}
      <FilePreview file={data[field]} />
    </div>
  );

  return (
    <div className="customer-card">
      <h3 style={{ marginBottom: "20px" }}>
        Customer Details
      </h3>
      <div className="grid">
        {/* Name */}
        <div className="input-group">
          <label>Name *</label>
          <input
            value={data.customerName}
            onChange={(e) => handleChange("customerName", e.target.value)}
            className={errors.customerName ? "error" : ""}
          />
          {errors.customerName && (
            <span className="error-text">{errors.customerName}</span>
          )}
        </div>

        {/* Phone */}
        <div className="input-group">
          <label>Phone *</label>
          <input
            maxLength="10"
            value={data.phone}
            onChange={(e) =>
              handleChange("phone", e.target.value.replace(/\D/g, ""))
            }
            className={errors.phone ? "error" : ""}
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>

        {/* Alternate Phone */}
        <div className="input-group">
          <label>Alternate Phone</label>
          <input
            maxLength="10"
            value={data.alternatePhone}
            onChange={(e) =>
              handleChange("alternatePhone", e.target.value.replace(/\D/g, ""))
            }
          />
        </div>

        {/* Email */}
        <div className="input-group">
          <label>Email</label>
          <input
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={errors.email ? "error" : ""}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        {/* Address */}
        <div className="input-group full">
          <label>
            Address <span className="req">*</span>
          </label>
          <textarea
            rows="3"
            value={data.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className={errors.address ? "error" : ""}
          />
          {errors.address && (
            <span className="error-text">{errors.address}</span>
          )}
        </div>


        {/* Category Dropdown */}
        <div className="input-group">
            <label>Category *</label>
            <select
              value={data.category || ""}
              onChange={(e) => handleChange("category", e.target.value)}
              className={errors.category ? "error" : ""}
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_name}>
                  {cat.category_name}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="error-text">{errors.category}</span>
            )}
          </div>


        {/* Conditional File Uploads */}
        {data.category === "Marriage" && (
          <>
            <UploadBox label="Wedding Card" field="weddingCard" />
            <UploadBox label="Aadhar - Bride" field="aadharBride" />
            <UploadBox label="Aadhar - Groom" field="aadharGroom" />
          </>
        )}
        {/* Always show Customer Aadhar */}
        <UploadBox label="Aadhar - Customer" field="aadharCustomer" required />
      </div>

      {/* Actions */}
      <div className="actions">

        <button
          className="btn-primary"
          disabled={!isFormValid}
          onClick={onNext}
        >
          Next: Referral →
        </button>
      </div>
    </div>
  );
};

export default Customer;
