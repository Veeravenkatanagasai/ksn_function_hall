import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { getHalls, addHall, updateHall, deleteHall } from "../../../services/hall";

export default function Halls() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hallName, setHallName] = useState("");
  const [editId, setEditId] = useState(null);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const loadHalls = async () => {
    setLoading(true);
    try {
      const res = await getHalls();
      setList(res.data || []);
    } catch (err) {
      console.error("Error loading halls:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHalls();
  }, []);

  const openForm = (hall = null) => {
    if (hall) {
      setEditId(hall.hall_id);
      setHallName(hall.hall_name);
    } else {
      setEditId(null);
      setHallName("");
    }
    setShowFormModal(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!hallName.trim()) return;

    try {
      if (editId) {
        await updateHall(editId, { hall_name: hallName });
      } else {
        await addHall({ hall_name: hallName });
      }
      setShowFormModal(false);
      loadHalls();
    } catch (err) {
      console.error("Error saving hall:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteHall(confirmId);
      setShowDeleteModal(false);
      setConfirmId(null);
      loadHalls();
    } catch (err) {
      console.error("Error deleting hall:", err);
    }
  };

  // Portal for modals
  const Modal = ({ children }) => ReactDOM.createPortal(children, document.body);

  return (
    <>
      <div className="container py-5">
        {/* Header */}
        <div className="row mb-4 align-items-center">
          <div className="col">
            <h2 className="fw-bold m-0 text-dark">Hall Management</h2>
            <p className="text-muted small">Configure and manage your event spaces</p>
          </div>
          <div className="col-auto">
            <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => openForm()}>
              <i className="bi bi-plus-lg me-2"></i>New Hall
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
                  <th>Hall Name</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      Loading halls...
                    </td>
                  </tr>
                ) : list.length > 0 ? (
                  list.map((h, i) => (
                    <tr key={h.hall_id}>
                      <td className="ps-4 text-muted">{i + 1}</td>
                      <td className="fw-semibold text-dark">{h.hall_name}</td>
                      <td className="text-end pe-4">
                        <button className="btn btn-light btn-sm rounded-circle me-2" title="Edit" onClick={() => openForm(h)}>
                          <i className="bi bi-pencil-square text-primary"></i>
                        </button>
                        <button className="btn btn-light btn-sm rounded-circle" title="Delete" onClick={() => { setConfirmId(h.hall_id); setShowDeleteModal(true); }}>
                          <i className="bi bi-trash3 text-danger"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-5 text-muted">No halls registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showFormModal && (
        <Modal>
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editId ? "Edit Hall" : "Add New Hall"}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowFormModal(false)}></button>
                </div>
                <form onSubmit={submitForm}>
                  <div className="modal-body">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Grand Ballroom"
                        value={hallName}
                        onChange={(e) => setHallName(e.target.value)}
                        required
                        autoFocus
                      />
                      <label>Hall Name</label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowFormModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{editId ? "Update Hall" : "Create Hall"}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <Modal>
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content text-center p-4">
                <div className="mb-3">
                  <i className="bi bi-exclamation-circle text-danger" style={{ fontSize: "3rem" }}></i>
                </div>
                <h4 className="fw-bold">Delete Hall?</h4>
                <p className="text-muted">This action cannot be undone. Any bookings associated with this hall may be affected.</p>
                <div className="d-flex justify-content-center gap-2 mt-3">
                  <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button className="btn btn-danger" onClick={handleDelete}>Confirm Delete</button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
