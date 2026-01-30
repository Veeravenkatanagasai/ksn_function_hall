import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import "./Electricity.css";

const ElectricityBill = ({ bookingId, category, onClose, onSaved }) => {
  const [form, setForm] = useState({
    booking_id: bookingId,
    current_previous_units: "",
    current_after_current_units: "",
    generator_previous_units: "",
    generator_after_units: "",
    current_per_unit_cost: 0,
    generator_per_unit_cost: 0
  });

  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});
  const [totals, setTotals] = useState({
    electricityUsed: 0,
    generatorUsed: 0,
    electricityTotal: 0,
    generatorTotal: 0,
    grandTotal: 0
  });

  // Fetch category-wise costs
  useEffect(() => {
    api.get(`/electricity/costs/${bookingId}`)
      .then(res => {
        setForm(prev => ({
          ...prev,
          current_per_unit_cost: res.data.Electricity?.price_per_hour || 0,
          generator_per_unit_cost: res.data.Generator?.price_per_hour || 0
        }));
      })
      .catch(console.error);
  }, [bookingId]);

  // Calculate totals
  useEffect(() => {
    const electricityUsed = (form.current_after_current_units || 0) - (form.current_previous_units || 0);
    const generatorUsed = (form.generator_after_units || 0) - (form.generator_previous_units || 0);
    const electricityTotal = electricityUsed * (form.current_per_unit_cost || 0);
    const generatorTotal = generatorUsed * (form.generator_per_unit_cost || 0);

    setTotals({ electricityUsed, generatorUsed, electricityTotal, generatorTotal, grandTotal: electricityTotal + generatorTotal });
  }, [form]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = e => {
    const file = e.target.files[0];
    setFiles(prev => ({ ...prev, [e.target.name]: file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviews(prev => ({ ...prev, [e.target.name]: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const submit = async e => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    Object.entries(files).forEach(([k, v]) => data.append(k, v));
    data.append("category", category);

    try {
      await api.post("/electricity/create", data, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
      alert("Bill saved successfully!");
      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to save bill");
    }
  };

  return (
    <div className="eb-modal-overlay">
      <div className="eb-modal">
        <div className="eb-modal-header">
          <h5>Upload Electricity & Generator Bill</h5>
          <button type="button" className="eb-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="eb-modal-body">
          <form onSubmit={submit}>
            <h6>Booking ID: <b>{bookingId}</b></h6>

            <h5>Electricity</h5>
            <input type="number" className="form-control mb-2" placeholder="Previous Units" name="current_previous_units" value={form.current_previous_units} onChange={handleChange} required />
            <input type="number" className="form-control mb-2" placeholder="Current Units" name="current_after_current_units" value={form.current_after_current_units} onChange={handleChange} required />
            <input type="number" className="form-control mb-2" value={form.current_per_unit_cost} readOnly />

            <input type="file" className="form-control mb-2" name="current_previous" onChange={handleFile} required />
            {previews.current_previous && <img src={previews.current_previous} className="eb-preview" />}
            <input type="file" className="form-control mb-2" name="current_after" onChange={handleFile} required />
            {previews.current_after && <img src={previews.current_after} className="eb-preview" />}

            <small className="text-muted">Units Used: {totals.electricityUsed} | Total: ₹{totals.electricityTotal}</small>

            <h5 className="mt-4">Generator</h5>
            <input type="number" className="form-control mb-2" placeholder="Previous Units" name="generator_previous_units" value={form.generator_previous_units} onChange={handleChange} required />
            <input type="number" className="form-control mb-2" placeholder="Current Units" name="generator_after_units" value={form.generator_after_units} onChange={handleChange} required />
            <input type="number" className="form-control mb-2" value={form.generator_per_unit_cost} readOnly />
            <input type="file" className="form-control mb-2" name="generator_previous" onChange={handleFile} required />
            {previews.generator_previous && <img src={previews.generator_previous} className="eb-preview" />}
            <input type="file" className="form-control mb-2" name="generator_after" onChange={handleFile} required />
            {previews.generator_after && <img src={previews.generator_after} className="eb-preview" />}

            <h5 className="mt-3">Grand Total: ₹{totals.grandTotal}</h5>
            <button className="btn btn-success w-100 mt-3">Save Bill</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ElectricityBill;
