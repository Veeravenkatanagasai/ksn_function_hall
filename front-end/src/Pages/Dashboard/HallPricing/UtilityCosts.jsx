import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllUtilities,
  createUtility,
  updateUtility,
  deleteUtility,
  getCategories,
} from "../../../services/utilityCost";

export default function UtilityCosts() {
  const [utilities, setUtilities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    utility_name: "",
    category_id: "",
    price_per_hour: "",
    default_hours: "",
  });

  const [editId, setEditId] = useState(null);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    loadUtilities();
    loadCategories();
  }, []);

  const loadUtilities = async () => {
    setLoading(true);
    try {
      const res = await getAllUtilities();
      setUtilities(res.data || []);
    } catch (err) {
      console.error("Error loading utilities:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const openForm = (row = null) => {
    if (row) {
      setEditId(row.utility_id);
      setForm({
        utility_name: row.utility_name,
        category_id: row.category_id,
        price_per_hour: row.price_per_hour,
        default_hours: row.default_hours,
      });
    } else {
      setEditId(null);
      setForm({ utility_name: "", category_id: "", price_per_hour: "", default_hours: "" });
    }
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.utility_name || !form.category_id || !form.price_per_hour) return;

    try {
      if (editId) {
        await updateUtility(editId, form);
      } else {
        await createUtility(form);
      }
      setShowFormModal(false);
      loadUtilities();
    } catch (err) {
      console.error("Error saving utility:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUtility(confirmId);
      setShowDeleteModal(false);
      setConfirmId(null);
      loadUtilities();
    } catch (err) {
      console.error("Error deleting utility:", err);
    }
  };

  return (
    <div className="container py-5">
      {/* Header Section */}
      <div className="row mb-4 align-items-center">
        <div className="col">
          <h2 className="fw-bold m-0 text-dark">Utility Costs</h2>
          <p className="text-muted small">Manage hourly rates for hall utilities (AC, Lighting, etc.)</p>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => openForm()}>
            <i className="bi bi-plus-lg me-2"></i>Add Utility
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4" style={{ width: "80px" }}>ID</th>
                <th>Utility</th>
                <th>Category</th>
                <th>Price / Hr</th>
                <th>Def. Hours</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                    Loading utilities...
                  </td>
                </tr>
              ) : utilities.length > 0 ? (
                utilities.map((u, i) => (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={u.utility_id}>
                    <td className="ps-4 text-muted">{i + 1}</td>
                    <td className="fw-semibold">{u.utility_name}</td>
                    <td><span className="badge bg-light text-secondary border">{u.category_name}</span></td>
                    <td className="text-primary fw-bold">{u.price_per_hour}</td>
                    <td>{u.default_hours || "0"} hrs</td>
                    <td className="text-end pe-4">
                      <button className="btn btn-light btn-sm rounded-circle me-2" onClick={() => openForm(u)}>
                        <i className="bi bi-pencil-square text-primary"></i>
                      </button>
                      <button className="btn btn-light btn-sm rounded-circle" onClick={() => { setConfirmId(u.utility_id); setShowDeleteModal(true); }}>
                        <i className="bi bi-trash3 text-danger"></i>
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-5 text-muted">No utilities found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {(showFormModal || showDeleteModal) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowFormModal(false); setShowDeleteModal(false); }}
              className="modal-backdrop fade show" style={{ zIndex: 1050 }}
            />

            <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1060 }}>
              <div className="modal-dialog modal-dialog-centered">
                
                {/* ADD/EDIT MODAL */}
                {showFormModal && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                    className="modal-content border-0 shadow-lg"
                  >
                    <div className="modal-header border-0">
                      <h5 className="fw-bold m-0">{editId ? "Edit Utility" : "New Utility Cost"}</h5>
                      <button type="button" className="btn-close" onClick={() => setShowFormModal(false)}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                      <div className="modal-body py-3">
                        <div className="form-floating mb-3">
                          <select
                            className="form-select border-0 bg-light"
                            id="uCat"
                            value={form.category_id}
                            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                            required
                          >
                            <option value="">Choose category...</option>
                            {categories.map((c) => (
                              <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                            ))}
                          </select>
                          <label htmlFor="uCat">Linked Category</label>
                        </div>

                        <div className="form-floating mb-3">
                          <input
                            type="text"
                            className="form-control border-0 bg-light"
                            id="uName"
                            placeholder="Name"
                            value={form.utility_name}
                            onChange={(e) => setForm({ ...form, utility_name: e.target.value })}
                            required
                          />
                          <label htmlFor="uName">Utility Name (e.g. AC Usage)</label>
                        </div>

                        <div className="row g-2">
                          <div className="col-md-6">
                            <div className="form-floating mb-3">
                              <input
                                type="number"
                                className="form-control border-0 bg-light"
                                id="uPrice"
                                placeholder="0"
                                value={form.price_per_hour}
                                onChange={(e) => setForm({ ...form, price_per_hour: e.target.value })}
                                required
                              />
                              <label htmlFor="uPrice">Price / Hour</label>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-floating mb-3">
                              <input
                                type="number"
                                className="form-control border-0 bg-light"
                                id="uHours"
                                placeholder="0"
                                value={form.default_hours}
                                onChange={(e) => setForm({ ...form, default_hours: e.target.value })}
                              />
                              <label htmlFor="uHours">Default Hours</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="modal-footer border-0">
                        <button type="button" className="btn btn-link text-muted text-decoration-none" onClick={() => setShowFormModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary px-4 rounded-pill shadow-sm">
                          {editId ? "Update Utility" : "Save Utility"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* DELETE MODAL */}
                {showDeleteModal && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="modal-content border-0 shadow-lg text-center p-4"
                  >
                    <div className="mb-3">
                      <i className="bi bi-trash3-fill text-danger" style={{ fontSize: "3rem" }}></i>
                    </div>
                    <h4 className="fw-bold">Delete Utility?</h4>
                    <p className="text-muted">Are you sure? This will remove this utility cost from all future calculations.</p>
                    <div className="d-flex justify-content-center gap-2 mt-3">
                      <button className="btn btn-light px-4 rounded-pill" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                      <button className="btn btn-danger px-4 rounded-pill shadow-sm" onClick={handleDelete}>Delete Permanently</button>
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