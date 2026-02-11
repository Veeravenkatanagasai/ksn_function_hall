import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  fetchTerms,
  addTerm,
  updateTerm,
  deleteTerm,
  translateText,
} from "../../../services/termscondition";

/* ---------- PORTAL MODAL ---------- */
const Modal = ({ children }) =>
  ReactDOM.createPortal(children, document.body);

const AdminTerms = () => {
  const [terms, setTerms] = useState([]);
  const [en, setEn] = useState("");
  const [te, setTe] = useState("");
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* ---------- LOAD ---------- */
  const loadTerms = async () => {
    const res = await fetchTerms();
    setTerms(res.data || []);
  };

  useEffect(() => {
    loadTerms();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setEn("");
    setTe("");
  };

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    editId
      ? await updateTerm(editId, en, te)
      : await addTerm(en, te);

    resetForm();
    setShowFormModal(false);
    loadTerms();
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async () => {
    await deleteTerm(deleteId);
    setDeleteId(null);
    setShowDeleteModal(false);
    loadTerms();
  };

  /* ---------- TRANSLATE ---------- */
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
    <>
      {/* ================= PAGE ================= */}
      <div className="container py-4">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3 className="fw-bold">Terms & Conditions</h3>
            <p className="text-muted">
              Manage application terms and conditions
            </p>
          </div>

          <button
            className="btn btn-primary rounded-pill px-4"
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
                <th>ID</th>
                <th>English</th>
                <th>Telugu</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {terms.length ? (
                terms.map((t) => (
                  <tr key={t.terms_id}>
                    <td>{t.terms_id}</td>
                    <td>{t.terms_text_en}</td>
                    <td>{t.terms_text_te}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-light btn-sm me-2"
                        onClick={() => startEdit(t)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-light btn-sm"
                        onClick={() => {
                          setDeleteId(t.terms_id);
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
                  <td colSpan="4" className="text-center py-4 text-muted">
                    No terms found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= ADD / EDIT MODAL ================= */}
      {showFormModal && (
        <Modal>
          <div
            className="modal show d-block"
            style={{ background: "rgba(0,0,0,.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>{editId ? "Edit Term" : "Add Term"}</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowFormModal(false)}
                  />
                </div>

                <div className="modal-body">
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
                    className="form-control"
                    rows="4"
                    value={te}
                    onChange={(e) => setTe(e.target.value)}
                  />
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowFormModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handleSave}
                  >
                    {editId ? "Update" : "Save"}
                  </button>
                </div>
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
                <h5 className="text-danger">Delete Term</h5>
                <p className="text-muted">
                  Are you sure you want to delete this term?
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
};

export default AdminTerms;
