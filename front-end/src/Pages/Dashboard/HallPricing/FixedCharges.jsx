import { useEffect, useState } from "react";
import {
  getAllCharges,
  createCharge,
  updateCharge,
  deleteCharge,
  getCategories,
} from "../../../services/fixedCharges";

export default function FixedCharges() {
  const [charges, setCharges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    category_id: "",
    charges_name: "",
    charges_value: "",
  });
  const [editId, setEditId] = useState(null);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  // Load data
  const loadCharges = async () => {
    setLoading(true);
    try {
      const res = await getAllCharges();
      setCharges(res.data || []);
    } catch (err) {
      console.error("Error loading charges:", err);
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

  useEffect(() => {
    loadCharges();
    loadCategories();
  }, []);

  // Form handlers
  const openForm = (charge = null) => {
    if (charge) {
      setForm({
        category_id: charge.category_id,
        charges_name: charge.charges_name,
        charges_value: charge.charges_value,
      });
      setEditId(charge.charges_id);
    } else {
      setForm({ category_id: "", charges_name: "", charges_value: "" });
      setEditId(null);
    }
    setShowFormModal(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!form.category_id || !form.charges_name || !form.charges_value) return;

    try {
      if (editId) {
        await updateCharge(editId, form);
      } else {
        await createCharge(form);
      }
      setShowFormModal(false);
      loadCharges();
    } catch (err) {
      console.error("Error saving charge:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCharge(confirmId);
      setShowDeleteModal(false);
      setConfirmId(null);
      loadCharges();
    } catch (err) {
      console.error("Error deleting charge:", err);
    }
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col">
          <h2 className="fw-bold m-0 text-dark">Fixed Charges</h2>
          <p className="text-muted small">Manage standard fees and category costs</p>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary rounded-pill px-4" onClick={() => openForm()}>
            <i className="bi bi-plus-lg me-2"></i>Add Charge
          </button>
        </div>
      </div>

      {/* Charges Table */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4" style={{ width: "80px" }}>ID</th>
                <th>Category</th>
                <th>Charge Name</th>
                <th>Value</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="spinner-border text-primary me-2"></div>Loading...
                  </td>
                </tr>
              ) : charges.length > 0 ? (
                charges.map((c, i) => (
                  <tr key={c.charges_id}>
                    <td className="ps-4 text-muted">{i + 1}</td>
                    <td><span className="badge bg-light text-primary border">{c.category_name}</span></td>
                    <td className="fw-semibold">{c.charges_name}</td>
                    <td className="text-success fw-bold">₹ {c.charges_value}</td>
                    <td className="text-end pe-4">
                      <button className="btn btn-light btn-sm me-2" onClick={() => openForm(c)}>
                        <i className="bi bi-pencil-square text-primary"></i>
                      </button>
                      <button className="btn btn-light btn-sm" onClick={() => { setConfirmId(c.charges_id); setShowDeleteModal(true); }}>
                        <i className="bi bi-trash3 text-danger"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">No fixed charges found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showFormModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editId ? "Edit Fixed Charge" : "New Fixed Charge"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowFormModal(false)}></button>
              </div>
              <form onSubmit={submitForm}>
                <div className="modal-body">
                  <div className="mb-3">
                    <select
                      className="form-select"
                      value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Charge Name"
                      value={form.charges_name}
                      onChange={(e) => setForm({ ...form, charges_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Charge Value"
                      value={form.charges_value}
                      onChange={(e) => setForm({ ...form, charges_value: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowFormModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editId ? "Update" : "Save"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-center p-4">
              <div className="mb-3">
                <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: "3rem" }}></i>
              </div>
              <h4 className="fw-bold">Delete Charge?</h4>
              <p className="text-muted">This will remove this fee from the system. This cannot be undone.</p>
              <div className="d-flex justify-content-center gap-2 mt-3">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete Charge</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
