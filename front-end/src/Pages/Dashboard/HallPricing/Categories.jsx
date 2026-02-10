import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../../../services/category";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editId, setEditId] = useState(null);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetchCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openForm = (category = null) => {
    if (category) {
      setEditId(category.category_id);
      setCategoryName(category.category_name);
    } else {
      setEditId(null);
      setCategoryName("");
    }
    setShowFormModal(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateCategory(editId, { category_name: categoryName });
      } else {
        await addCategory({ category_name: categoryName });
      }
      setShowFormModal(false);
      loadCategories();
    } catch (err) {
      console.error("Error saving category:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(confirmId);
      setShowDeleteModal(false);
      loadCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  // Modal Portal component
  const Modal = ({ children }) => {
    return ReactDOM.createPortal(
      <>{children}</>,
      document.body
    );
  };

  return (
    <>
      <div className="container py-5">
        {/* Header */}
        <div className="row mb-4 align-items-center">
          <div className="col">
            <h2 className="fw-bold m-0 text-dark">Categories</h2>
            <p className="text-muted small">Manage your product classifications</p>
          </div>
          <div className="col-auto">
            <button
              className="btn btn-primary rounded-pill px-4 shadow-sm"
              onClick={() => openForm()}
            >
              <i className="bi bi-plus-lg me-2"></i>New Category
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4" style={{ width: "80px" }}>ID</th>
                  <th>Category Name</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      Loading...
                    </td>
                  </tr>
                ) : categories.length > 0 ? (
                  categories.map((c, i) => (
                    <tr key={c.category_id}>
                      <td className="ps-4 text-muted">{i + 1}</td>
                      <td className="fw-semibold text-dark">{c.category_name}</td>
                      <td className="text-end pe-4">
                        <button
                          className="btn btn-light btn-sm rounded-circle me-2"
                          title="Edit"
                          onClick={() => openForm(c)}
                        >
                          <i className="bi bi-pencil-square text-primary"></i>
                        </button>
                        <button
                          className="btn btn-light btn-sm rounded-circle"
                          title="Delete"
                          onClick={() => { setConfirmId(c.category_id); setShowDeleteModal(true); }}
                        >
                          <i className="bi bi-trash3 text-danger"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-5 text-muted">
                      No categories available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===================== MODALS ===================== */}
      {showFormModal && (
        <Modal>
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editId ? "Edit Category" : "Add New Category"}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowFormModal(false)}></button>
                </div>
                <form onSubmit={submitForm}>
                  <div className="modal-body">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Category Name"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required
                        autoFocus
                      />
                      <label>Category Name</label>
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
        </Modal>
      )}

      {showDeleteModal && (
        <Modal>
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content text-center p-4">
                <div className="mb-3">
                  <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: "3rem" }}></i>
                </div>
                <h4 className="fw-bold">Are you sure?</h4>
                <p className="text-muted">Deleting this category might affect linked products. This action is permanent.</p>
                <div className="d-flex justify-content-center gap-2 mt-3">
                  <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button className="btn btn-danger" onClick={handleDelete}>Delete Anyway</button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
