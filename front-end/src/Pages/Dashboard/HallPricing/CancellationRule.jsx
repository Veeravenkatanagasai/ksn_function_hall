import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import API from "../../../services/cancellationRules";

/* ---------- PORTAL MODAL ---------- */
const Modal = ({ children }) =>
  ReactDOM.createPortal(children, document.body);

export default function CancellationRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    days: "",
    penalty_percent: "",
    is_active: 1,
  });

  const [editId, setEditId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await API.getAll();
      setRules(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- FORM ---------- */
  const openForm = (row = null) => {
    if (row) {
      setEditId(row.rule_id);
      setForm({
        days: row.days,
        penalty_percent: row.penalty_percent,
        is_active: row.is_active,
      });
    } else {
      setEditId(null);
      setForm({
        days: "",
        penalty_percent: "",
        is_active: 1,
      });
    }
    setShowFormModal(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();

    const payload = {
      days: Number(form.days),
      penalty_percent: Number(form.penalty_percent),
      is_active: form.is_active,
    };

    editId
      ? await API.update(editId, payload)
      : await API.create(payload);

    setShowFormModal(false);
    loadRules();
  };

  const handleDelete = async () => {
    await API.remove(confirmId);
    setShowDeleteModal(false);
    loadRules();
  };

  return (
    <>
      {/* ================= PAGE ================= */}
      <div className="container py-5">
        {/* HEADER */}
        <div className="row mb-4 align-items-center">
          <div className="col">
            <h2 className="fw-bold">Cancellation Rules</h2>
            <p className="text-muted small">
              Manage cancellation penalties
            </p>
          </div>
          <div className="col-auto">
            <button
              className="btn btn-primary rounded-pill px-4"
              onClick={() => openForm()}
            >
              + Add Rule
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="card shadow-sm border-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Days</th>
                <th>Penalty %</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="spinner-border text-primary" />
                  </td>
                </tr>
              ) : rules.length ? (
                rules.map((r, i) => (
                  <tr key={r.rule_id}>
                    <td>{i + 1}</td>
                    <td>{r.days}</td>
                    <td>{r.penalty_percent}%</td>
                    <td>
                      <span
                        className={`badge ${
                          r.is_active ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {r.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-light btn-sm me-2"
                        onClick={() => openForm(r)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-light btn-sm"
                        onClick={() => {
                          setConfirmId(r.rule_id);
                          setShowDeleteModal(true);
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-5 text-muted"
                  >
                    No rules found
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
          <div
            className="modal show d-block"
            style={{ background: "rgba(0,0,0,.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>{editId ? "Edit Rule" : "New Rule"}</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowFormModal(false)}
                  />
                </div>

                <form onSubmit={submitForm}>
                  <div className="modal-body">
                    <input
                      type="number"
                      className="form-control mb-3"
                      placeholder="Days before event"
                      value={form.days}
                      onChange={(e) =>
                        setForm({ ...form, days: e.target.value })
                      }
                      required
                    />

                    <input
                      type="number"
                      className="form-control mb-3"
                      placeholder="Penalty %"
                      value={form.penalty_percent}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          penalty_percent: e.target.value,
                        })
                      }
                      required
                    />

                    <select
                      className="form-select"
                      value={form.is_active}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          is_active: Number(e.target.value),
                        })
                      }
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowFormModal(false)}
                    >
                      Cancel
                    </button>
                    <button className="btn btn-success">
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
          <div
            className="modal show d-block"
            style={{ background: "rgba(0,0,0,.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content text-center p-4">
                <h4 className="text-danger">Delete Rule?</h4>
                <p className="text-muted">
                  This action cannot be undone.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                  >
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
