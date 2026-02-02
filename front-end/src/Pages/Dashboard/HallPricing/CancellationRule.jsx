import React, { useEffect, useState } from "react";
import API from "../../../services/cancellationRules";
import "./Cancellation.css";

const CancellationRules = () => {
  const [rules, setRules] = useState([]);

  const [days, setDays] = useState("");
  const [penalty, setPenalty] = useState("");
  const [isActive, setIsActive] = useState(1);

  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /** 🔒 Lock body scroll when modal opens */
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const res = await API.getAll();
    setRules(res.data || []);
  };

  const resetForm = () => {
    setDays("");
    setPenalty("");
    setIsActive(1);
    setEditingId(null);
  };

  const handleSave = async () => {
    const payload = {
      days: Number(days),
      penalty_percent: Number(penalty),
      is_active: isActive,
    };

    editingId
      ? await API.update(editingId, payload)
      : await API.create(payload);

    resetForm();
    setShowFormModal(false);
    fetchRules();
  };

  const handleDelete = async () => {
    await API.remove(deleteId);
    setDeleteId(null);
    setShowDeleteModal(false);
    fetchRules();
  };
  return (
    <div className="container mt-4">

      {/* HEADER */}
      <div className="header-row">
        <div>
          <h3>Cancellation Rules</h3>
          <p className="text-muted">Manage cancellation penalties</p>
        </div>
        <button
          className="btn btn-warning"
          onClick={() => {
            resetForm();
            setShowFormModal(true);
          }}
        >
          + Add Rule
        </button>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
            
              <th>Days</th>
              <th>Penalty %</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.length ? rules.map((r) => (
              <tr key={r.rule_id}>
                <td>{r.days}</td>
                <td>{r.penalty_percent}%</td>
                <td>
                  <span className={`badge ${r.is_active ? "active" : "inactive"}`}>
                    {r.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="text-center">
                  <button className="icon-btn edit" onClick={() => startEdit(r)}>✏️</button>
                  <button className="icon-btn delete" onClick={() => {
                    setDeleteId(r.rule_id);
                    setShowDeleteModal(true);
                  }}>🗑️</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="text-center">No rules found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h5>{editingId ? "Edit Rule" : "Add Rule"}</h5>
              <button className="close-btn" onClick={() => setShowFormModal(false)}>✖</button>
            </div>

            <div className="modal-body">
              <label>Days Before Event</label>
              <input type="number" value={days} onChange={e => setDays(e.target.value)} />

              <label>Penalty %</label>
              <input type="number" value={penalty} onChange={e => setPenalty(e.target.value)} />

              <label>Status</label>
              <select value={isActive} onChange={e => setIsActive(Number(e.target.value))}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowFormModal(false)}>Cancel</button>
              <button className="btn btn-success" onClick={handleSave}>
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box small">
            <h5 className="text-danger">Delete Rule</h5>
            <p>Are you sure?</p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CancellationRules;
