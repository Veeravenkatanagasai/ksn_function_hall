import React, { useEffect, useState } from "react";
import {
  fetchTerms,
  addTerm,
  updateTerm,
  deleteTerm,
  translateText,
} from "../../../services/termscondition";
import "./TermsConditions.css";

const AdminTerms = () => {
  const [terms, setTerms] = useState([]);
  const [en, setEn] = useState("");
  const [te, setTe] = useState("");
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadTerms = async () => {
    const res = await fetchTerms();
    setTerms(res.data);
  };

  useEffect(() => {
    loadTerms();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setEn("");
    setTe("");
  };

  const handleSave = async () => {
    if (editId) {
      await updateTerm(editId, en, te);
    } else {
      await addTerm(en, te);
    }

    resetForm();
    setShowFormModal(false);
    loadTerms();
  };

  const handleDelete = async () => {
    await deleteTerm(deleteId);
    setDeleteId(null);
    setShowDeleteModal(false);
    loadTerms();
  };

  const handleTranslate = async (value) => {
    if (!value) return;
    const res = await translateText(value);
    setTe(res.data.te);
  };

  const startEdit = (term) => {
    setEditId(term.terms_id);
    setEn(term.terms_text_en);
    setTe(term.terms_text_te);
    setShowFormModal(true);
  };

  return (
    <div className="container mt-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold">Terms & Conditions</h3>
          <p className="text-muted">Manage application terms and conditions</p>
        </div>

        <button
          className="btn btn-warning add-btn"
          onClick={() => {
            resetForm();
            setShowFormModal(true);
          }}
        >
          + Add Term
        </button>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>English</th>
              <th>Telugu</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {terms.map((t) => (
              <tr key={t.terms_id}>
                <td>{t.terms_text_en}</td>
                <td>{t.terms_text_te}</td>
                <td className="text-center">
                  <button
                    className="icon-btn edit"
                    onClick={() => startEdit(t)}
                  >
                    ✏️
                  </button>
                  <button
                    className="icon-btn delete"
                    onClick={() => {
                      setDeleteId(t.terms_id);
                      setShowDeleteModal(true);
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {showFormModal && (
        <div className="custom-modal-backdrop">
  <div className="custom-modal">
    <h5>{editId ? "Edit Term" : "Add Term"}</h5>

    <div className="custom-modal-body">
      <label className="form-label">English</label>
      <textarea
        className="form-control mb-3"
        rows="4"
        value={en}
        onChange={(e) => {
          setEn(e.target.value);
          handleTranslate(e.target.value);
        }}
      />

      <label className="form-label">Telugu</label>
      <textarea
        className="form-control mb-3"
        rows="4"
        value={te}
        onChange={(e) => setTe(e.target.value)}
      />
    </div>

    <div className="custom-modal-footer">
      <button
        className="btn btn-secondary"
        onClick={() => setShowFormModal(false)}
      >
        Cancel
      </button>
      <button className="btn btn-success" onClick={handleSave}>
        {editId ? "Update" : "Save"}
      </button>
    </div>
  </div>
</div>

      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            <h5 className="text-danger">Delete Term</h5>
            <p>Are you sure you want to delete this term?</p>

            <div className="text-end">
              <button
                className="btn btn-secondary me-2"
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
      )}
    </div>
  );
};

export default AdminTerms;
