import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../services/api";
import { fetchCategories, fetchHalls, fetchTimeSlots } from "../../../services/dropdown";

const EMPTY_FORM = {
  category_name: "",
  hall_name: "",
  time_slot: "",
  base_price_per_hour: "",
  start_time: "",
  end_time: "",
  from_date: "",
  to_date: "",
};

const formatDate = (value) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function PricingRules() {
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [halls, setHalls] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const loadPricing = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/hallpricing");
      setRules(res.data || []);
    } catch (err) {
      console.error("ERROR: loadPricing failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setCategories(await fetchCategories());
      setHalls(await fetchHalls());
      setSlots(await fetchTimeSlots());
      await loadPricing();
    })();
  }, [loadPricing]);

  const openForm = (row = null) => {
    if (row) {
      setForm({
        category_name: row.category_name || "",
        hall_name: row.hall_name || "",
        time_slot: row.time_slot || "",
        base_price_per_hour: row.base_price_per_hour ?? "",
        start_time: row.start_time?.slice(0, 5) || "",
        end_time: row.end_time?.slice(0, 5) || "",
        from_date: formatDate(row.from_date),
        to_date: formatDate(row.to_date),
      });
      setEditId(row.rule_id);
    } else {
      setForm(EMPTY_FORM);
      setEditId(null);
    }
    setShowFormModal(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!form.category_name || !form.hall_name || !form.time_slot) return;
    
    try {
      const payload = {
        ...form,
        base_price_per_hour: Number(form.base_price_per_hour),
      };

      if (editId) await api.put(`/hallpricing/${editId}`, payload);
      else await api.post("/hallpricing", payload);

      setShowFormModal(false);
      await loadPricing();
    } catch (err) {
      console.error("ERROR: submit failed", err);
    }
  };

  const removeRule = async () => {
    try {
      await api.delete(`/hallpricing/${confirmId}`);
      setShowDeleteModal(false);
      setConfirmId(null);
      await loadPricing();
    } catch (err) {
      console.error("ERROR: delete failed", err);
    }
  };

  return (
    <div className="container-fluid py-5 px-4">
      {/* Header Section */}
      <div className="row mb-4 align-items-center">
        <div className="col">
          <h2 className="fw-bold m-0 text-dark">Pricing Rules</h2>
          <p className="text-muted small m-0">Dynamic pricing configurations for halls and time slots</p>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => openForm()}>
            <i className="bi bi-plus-lg me-2"></i>New Rule
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-uppercase text-muted">
                <th className="ps-4">Hall & Category</th>
                <th>Time Slot</th>
                <th>Schedule</th>
                <th>Price / Hr</th>
                <th>Validity Period</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-5"><div className="spinner-border text-primary spinner-border-sm"></div></td></tr>
              ) : rules.length > 0 ? (
                rules.map((r) => (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={r.rule_id}>
                    <td className="ps-4">
                      <div className="fw-bold text-dark">{r.hall_name}</div>
                      <div className="small text-muted">{r.category_name}</div>
                    </td>
                    <td><span className="badge bg-soft-primary text-primary border border-primary-subtle">{r.time_slot}</span></td>
                    <td><div className="small fw-semibold">{r.start_time} - {r.end_time}</div></td>
                    <td><span className="fw-bold text-dark">${r.base_price_per_hour}</span></td>
                    <td>
                      <div className="small text-muted">From: {formatDate(r.from_date)}</div>
                      <div className="small text-muted">To: {formatDate(r.to_date)}</div>
                    </td>
                    <td className="text-end pe-4">
                      <button className="btn btn-light btn-sm rounded-circle me-2" onClick={() => openForm(r)}><i className="bi bi-pencil-square text-primary"></i></button>
                      <button className="btn btn-light btn-sm rounded-circle" onClick={() => { setConfirmId(r.rule_id); setShowDeleteModal(true); }}><i className="bi bi-trash3 text-danger"></i></button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center py-5 text-muted">No pricing rules found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {(showFormModal || showDeleteModal) && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowFormModal(false); setShowDeleteModal(false); }} className="modal-backdrop fade show" style={{ zIndex: 1050 }} />
            <div className="modal d-block" style={{ zIndex: 1060 }}>
              <div className={`modal-dialog modal-dialog-centered ${showFormModal ? 'modal-lg' : ''}`}>
                
                {/* 1. ADD/EDIT RULE MODAL */}
                {showFormModal && (
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="modal-content border-0 shadow-lg">
                    <div className="modal-header border-0 pb-0">
                      <h5 className="fw-bold m-0">{editId ? "Edit Pricing Rule" : "Create Pricing Rule"}</h5>
                      <button type="button" className="btn-close" onClick={() => setShowFormModal(false)}></button>
                    </div>
                    <form onSubmit={submitForm}>
                      <div className="modal-body py-4">
                        <div className="row g-3">
                          {/* Dropdowns */}
                          <div className="col-md-4">
                            <label className="small fw-bold text-muted mb-1">Hall</label>
                            <select className="form-select border-0 bg-light" value={form.hall_name} onChange={e => setForm({ ...form, hall_name: e.target.value })} required>
                              <option value="">Select Hall</option>
                              {halls.map(h => <option key={h.hall_name} value={h.hall_name}>{h.hall_name}</option>)}
                            </select>
                          </div>
                          <div className="col-md-4">
                            <label className="small fw-bold text-muted mb-1">Category</label>
                            <select className="form-select border-0 bg-light" value={form.category_name} onChange={e => setForm({ ...form, category_name: e.target.value })} required>
                              <option value="">Select Category</option>
                              {categories.map(c => <option key={c.category_name} value={c.category_name}>{c.category_name}</option>)}
                            </select>
                          </div>
                          <div className="col-md-4">
                            <label className="small fw-bold text-muted mb-1">Time Slot</label>
                            <select className="form-select border-0 bg-light" value={form.time_slot} onChange={e => setForm({ ...form, time_slot: e.target.value })} required>
                              <option value="">Select Slot</option>
                              {slots.map(s => <option key={s.slot_name} value={s.slot_name}>{s.slot_name}</option>)}
                            </select>
                          </div>

                          {/* Pricing */}
                          <div className="col-md-4">
                            <label className="small fw-bold text-muted mb-1">Price / Hr</label>
                            <input type="number" className="form-control border-0 bg-light" value={form.base_price_per_hour} onChange={e => setForm({ ...form, base_price_per_hour: e.target.value })} required />
                          </div>

                          {/* Time Schedule */}
                          <div className="col-md-6">
                            <label className="small fw-bold text-muted mb-1">Daily Start Time</label>
                            <input type="time" className="form-control border-0 bg-light" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
                          </div>
                          <div className="col-md-6">
                            <label className="small fw-bold text-muted mb-1">Daily End Time</label>
                            <input type="time" className="form-control border-0 bg-light" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
                          </div>

                          {/* Date Range */}
                          <div className="col-md-6">
                            <label className="small fw-bold text-muted mb-1">From Date</label>
                            <input type="date" className="form-control border-0 bg-light" value={form.from_date} onChange={e => setForm({ ...form, from_date: e.target.value })} required />
                          </div>
                          <div className="col-md-6">
                            <label className="small fw-bold text-muted mb-1">To Date</label>
                            <input type="date" className="form-control border-0 bg-light" value={form.to_date} onChange={e => setForm({ ...form, to_date: e.target.value })} required />
                          </div>
                        </div>
                      </div>
                      <div className="modal-footer border-0">
                        <button type="button" className="btn btn-link text-muted text-decoration-none" onClick={() => setShowFormModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary px-5 rounded-pill shadow-sm">{editId ? "Update Rule" : "Create Rule"}</button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* 2. DELETE MODAL */}
                {showDeleteModal && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content border-0 shadow-lg text-center p-4">
                    <div className="mb-3"><i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: "3rem" }}></i></div>
                    <h4 className="fw-bold">Remove Rule?</h4>
                    <p className="text-muted">Deleting this pricing rule will revert bookings for this hall to default prices. Continue?</p>
                    <div className="d-flex justify-content-center gap-2 mt-3">
                      <button className="btn btn-light px-4 rounded-pill" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                      <button className="btn btn-danger px-4 rounded-pill shadow-sm" onClick={removeRule}>Confirm Delete</button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}