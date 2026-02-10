import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { getSlots, addSlot, updateSlot, deleteSlot } from "../../../services/timeslot";

export default function TimeSlots() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotName, setSlotName] = useState("");
  const [editId, setEditId] = useState(null);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  // Load slots from API
  const loadSlots = async () => {
    setLoading(true);
    try {
      const res = await getSlots();
      setList(res.data || []);
    } catch (err) {
      console.error("Error loading slots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const openForm = (slot = null) => {
    if (slot) {
      setEditId(slot.slot_id);
      setSlotName(slot.slot_name);
    } else {
      setEditId(null);
      setSlotName("");
    }
    setShowFormModal(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!slotName.trim()) return;

    try {
      if (editId) {
        await updateSlot(editId, { slot_name: slotName });
      } else {
        await addSlot({ slot_name: slotName });
      }
      setShowFormModal(false);
      loadSlots();
    } catch (err) {
      console.error("Error saving slot:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSlot(confirmId);
      setShowDeleteModal(false);
      setConfirmId(null);
      loadSlots();
    } catch (err) {
      console.error("Error deleting slot:", err);
    }
  };

  // Modal Portal
  const Modal = ({ children }) => ReactDOM.createPortal(children, document.body);

  return (
    <>
      <div className="container py-5">
        {/* Header Section */}
        <div className="row mb-4 align-items-center">
          <div className="col">
            <h2 className="fw-bold m-0 text-dark">Time Slots</h2>
            <p className="text-muted small">Manage available service hours</p>
          </div>
          <div className="col-auto">
            <button
              className="btn btn-primary rounded-pill px-4 shadow-sm"
              onClick={() => openForm()}
            >
              <i className="bi bi-plus-lg me-2"></i>New Time Slot
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
                  <th>Slot Duration / Name</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      Loading slots...
                    </td>
                  </tr>
                ) : list.length > 0 ? (
                  list.map((s, i) => (
                    <tr key={s.slot_id}>
                      <td className="ps-4 text-muted">{i + 1}</td>
                      <td className="fw-semibold text-dark">{s.slot_name}</td>
                      <td className="text-end pe-4">
                        <button
                          className="btn btn-light btn-sm rounded-circle me-2"
                          title="Edit"
                          onClick={() => openForm(s)}
                        >
                          <i className="bi bi-pencil-square text-primary"></i>
                        </button>
                        <button
                          className="btn btn-light btn-sm rounded-circle"
                          title="Delete"
                          onClick={() => { setConfirmId(s.slot_id); setShowDeleteModal(true); }}
                        >
                          <i className="bi bi-trash3 text-danger"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-5 text-muted">No time slots found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===================== ADD/EDIT MODAL ===================== */}
      {showFormModal && (
        <Modal>
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editId ? "Edit Time Slot" : "Add Time Slot"}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowFormModal(false)}></button>
                </div>
                <form onSubmit={submitForm}>
                  <div className="modal-body">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="09:00 AM - 12:00 PM"
                        value={slotName}
                        onChange={(e) => setSlotName(e.target.value)}
                        required
                        autoFocus
                      />
                      <label>Slot Timing (e.g., Morning)</label>
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

      {/* ===================== DELETE MODAL ===================== */}
      {showDeleteModal && (
        <Modal>
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content text-center p-4">
                <div className="mb-3">
                  <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: "3rem" }}></i>
                </div>
                <h4 className="fw-bold">Remove Slot?</h4>
                <p className="text-muted">Are you sure you want to delete this time slot? This might affect existing bookings.</p>
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
