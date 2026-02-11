import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  getAllUtilities,
  createUtility,
  updateUtility,
  deleteUtility,
  getCategories,
} from "../../../services/utilityCost";

/* ---------- PORTAL MODAL ---------- */
const Modal = ({ children }) =>
  ReactDOM.createPortal(children, document.body);

export default function UtilityCosts() {
  const [utilities, setUtilities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    utility_name: "",
    category_id: "",
    price_per_hour: "",
    default_hours: "",
  });

  const [editId, setEditId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    loadUtilities();
    loadCategories();
  }, []);

  const loadUtilities = async () => {
    setLoading(true);
    try {
      const res = await getAllUtilities();
      setUtilities(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const res = await getCategories();
    setCategories(res.data || []);
  };

  /* ---------- FORM ---------- */
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
      setForm({
        utility_name: "",
        category_id: "",
        price_per_hour: "",
        default_hours: "",
      });
    }
    setShowFormModal(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    editId
      ? await updateUtility(editId, form)
      : await createUtility(form);

    setShowFormModal(false);
    loadUtilities();
  };

  const handleDelete = async () => {
    await deleteUtility(confirmId);
    setShowDeleteModal(false);
    loadUtilities();
  };

  return (
    <>
      <div className="container py-5">
        {/* HEADER */}
        <div className="row mb-4 align-items-center">
          <div className="col">
            <h2 className="fw-bold">Utility Costs</h2>
            <p className="text-muted small">Manage hourly rates</p>
          </div>
          <div className="col-auto">
            <button
              className="btn btn-primary rounded-pill px-4"
              onClick={() => openForm()}
            >
              <i className="bi bi-plus-lg me-2"></i>Add Utility
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="card shadow-sm border-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Utility</th>
                <th>Category</th>
                <th>Price / Hr</th>
                <th>Hours</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border text-primary" />
                  </td>
                </tr>
              ) : utilities.length ? (
                utilities.map((u, i) => (
                  <tr key={u.utility_id}>
                    <td>{i + 1}</td>
                    <td>{u.utility_name}</td>
                    <td>{u.category_name}</td>
                    <td className="fw-bold text-primary">
                      ₹ {u.price_per_hour}
                    </td>
                    <td>{u.default_hours || 0}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-light btn-sm me-2"
                        onClick={() => openForm(u)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-light btn-sm"
                        onClick={() => {
                          setConfirmId(u.utility_id);
                          setShowDeleteModal(true);
                        }}
                      >
                        <i className="bi bi-trash text-danger"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No utilities found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= FORM MODAL ================= */}
      {showFormModal && (
        <Modal>
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>{editId ? "Edit Utility" : "New Utility"}</h5>
                  <button className="btn-close" onClick={() => setShowFormModal(false)} />
                </div>

                <form onSubmit={submitForm}>
                  <div className="modal-body">
                    <select
                      className="form-select mb-3"
                      value={form.category_id}
                      onChange={(e) =>
                        setForm({ ...form, category_id: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.category_id} value={c.category_id}>
                          {c.category_name}
                        </option>
                      ))}
                    </select>

                    <input
                      autoFocus
                      className="form-control mb-3"
                      placeholder="Utility Name"
                      value={form.utility_name}
                      onChange={(e) =>
                        setForm({ ...form, utility_name: e.target.value })
                      }
                      required
                    />

                    <input
                      type="number"
                      className="form-control mb-3"
                      placeholder="Price per hour"
                      value={form.price_per_hour}
                      onChange={(e) =>
                        setForm({ ...form, price_per_hour: e.target.value })
                      }
                      required
                    />

                    <input
                      type="number"
                      className="form-control"
                      placeholder="Default hours"
                      value={form.default_hours}
                      onChange={(e) =>
                        setForm({ ...form, default_hours: e.target.value })
                      }
                    />
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowFormModal(false)}
                    >
                      Cancel
                    </button>
                    <button className="btn btn-primary">
                      {editId ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= DELETE MODAL ================= */}
      {showDeleteModal && (
        <Modal>
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content text-center p-4">
                <h4>Delete Utility?</h4>
                <p className="text-muted">This action cannot be undone.</p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
