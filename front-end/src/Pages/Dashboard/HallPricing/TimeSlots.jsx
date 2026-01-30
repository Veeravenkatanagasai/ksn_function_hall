import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  return (
    <div className="container py-5">
      {/* Header Section */}
      <div className="row mb-4 align-items-center">
        <div className="col">
          <h2 className="fw-bold m-0 text-dark">Time Slots</h2>
          <p className="text-muted small">Manage available service hours</p>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => openForm()}>
            <i className="bi bi-plus-lg me-2"></i>New Time Slot
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
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    key={s.slot_id}
                  >
                    <td className="ps-4 text-muted">{i + 1}</td>
                    <td className="fw-semibold text-dark">{s.slot_name}</td>
                    <td className="text-end pe-4">
                      <button className="btn btn-light btn-sm rounded-circle me-2" title="Edit" onClick={() => openForm(s)}>
                        <i className="bi bi-pencil-square text-primary"></i>
                      </button>
                      <button className="btn btn-light btn-sm rounded-circle" title="Delete" onClick={() => { setConfirmId(s.slot_id); setShowDeleteModal(true); }}>
                        <i className="bi bi-trash3 text-danger"></i>
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr><td colSpan="3" className="text-center py-5 text-muted">No time slots found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS SECTION */}
      <AnimatePresence>
        {(showFormModal || showDeleteModal) && (
          <>
            {/* Dark Overlay */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => { setShowFormModal(false); setShowDeleteModal(false); }}
              className="modal-backdrop fade show"
              style={{ zIndex: 1050 }}
            />

            {/* Modal Container */}
            <div className="modal d-block overflow-hidden" tabIndex="-1" style={{ zIndex: 1060 }}>
              <div className="modal-dialog modal-dialog-centered">
                
                {/* 1. ADD/EDIT MODAL */}
                {showFormModal && (
                  <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="modal-content border-0 shadow-lg"
                  >
                    <div className="modal-header border-0">
                      <h5 className="fw-bold m-0">{editId ? "Edit Time Slot" : "Add Time Slot"}</h5>
                      <button type="button" className="btn-close" onClick={() => setShowFormModal(false)}></button>
                    </div>
                    <form onSubmit={submitForm}>
                      <div className="modal-body py-3">
                        <div className="form-floating mb-3">
                          <input
                            type="text"
                            className="form-control border-0 bg-light"
                            id="slotName"
                            placeholder="09:00 AM - 12:00 PM"
                            value={slotName}
                            onChange={(e) => setSlotName(e.target.value)}
                            required
                            autoFocus
                          />
                          <label htmlFor="slotName">Slot Timing (e.g., Morning)</label>
                        </div>
                      </div>
                      <div className="modal-footer border-0">
                        <button type="button" className="btn btn-link text-muted text-decoration-none" onClick={() => setShowFormModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary px-4 rounded-pill shadow-sm">
                          {editId ? "Update Slot" : "Save Slot"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* 2. DELETE CONFIRMATION MODAL */}
                {showDeleteModal && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="modal-content border-0 shadow-lg text-center p-4"
                  >
                    <div className="mb-3">
                      <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: "3rem" }}></i>
                    </div>
                    <h4 className="fw-bold">Remove Slot?</h4>
                    <p className="text-muted">Are you sure you want to delete this time slot? This might affect existing bookings.</p>
                    <div className="d-flex justify-content-center gap-2 mt-3">
                      <button className="btn btn-light px-4 rounded-pill" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                      <button className="btn btn-danger px-4 rounded-pill shadow-sm" onClick={handleDelete}>Delete Anyway</button>
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