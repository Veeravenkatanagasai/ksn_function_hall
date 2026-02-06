import React, { useEffect, useState } from "react";
import {
  fetchStaff,
  addStaff,
  updateStaff,
  deleteStaff
} from "../../../services/staff";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./Staff.css";

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    salary: "",
    join_date: "",
    status: "Active"
  });

  const [editId, setEditId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const navigate = useNavigate();

  /* ================= LOAD ================= */
  const loadStaff = async () => {
    const res = await fetchStaff();
    setStaff(res.data || []);
  };

  useEffect(() => {
    loadStaff();
  }, []);

  /* ================= RESET ================= */
  const resetForm = () => {
    setForm({
      name: "",
      role: "",
      email: "",
      phone: "",
      salary: "",
      join_date: "",
      status: "Active"
    });
    setEditId(null);
  };

  /* ================= VALIDATION ================= */
  const validateForm = () => {
  // Name
  if (!form.name.trim()) {
    toast.error("Name is required");
    return false;
  }
  if (!/^[a-zA-Z\s]+$/.test(form.name)) {
    toast.error("Name should contain only letters");
    return false;
  }
  if (form.name.trim().length < 3) {
    toast.error("Name must be at least 3 characters");
    return false;
  }

  // Role
  if (!form.role.trim()) {
    toast.error("Role is required");
    return false;
  }

  // Email
  if (!form.email.trim()) {
    toast.error("Email is required");
    return false;
  }
  if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    toast.error("Invalid email format");
    return false;
  }

  // Phone
  if (!form.phone.trim()) {
    toast.error("Phone number is required");
    return false;
  }
  if (!/^[6-9]\d{9}$/.test(form.phone)) {
    toast.error("Enter valid 10-digit Indian mobile number");
    return false;
  }

  // Salary
  if (!form.salary) {
    toast.error("Salary is required");
    return false;
  }
  if (isNaN(form.salary) || Number(form.salary) <= 0) {
    toast.error("Salary must be a positive number");
    return false;
  }

  // Join Date
  if (!form.join_date) {
    toast.error("Join date is required");
    return false;
  }

  // Status
  if (!form.status) {
    toast.error("Status is required");
    return false;
  }

  return true; // ✅ ONLY when everything is valid
};


  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return; // 🚫 stops submit correctly

  try {
    if (editId) {
      await updateStaff(editId, form);
      toast.success("Staff updated successfully");
    } else {
      await addStaff(form);
      toast.success("Staff added successfully");
    }

    resetForm();
    setShowFormModal(false);
    loadStaff();
  } catch {
    toast.error("Something went wrong");
  }
};

  /* ================= DELETE ================= */
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteStaff(deleteId);
      toast.success("Staff deleted successfully");
      setShowDeleteModal(false);
      loadStaff();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= SEARCH ================= */
  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search)
  );

  return (
    <div className="staff-page">
      {/* HEADER */}
      <div className="staff-header">
        <h3>Staff Management</h3>
        <button className="btn btn-outline-light" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      {/* CONTENT */}
      <div className="staff-content">
        {/* TOOLBAR */}
        <div className="staff-toolbar">
          <input
            placeholder="🔍 Search by name, phone or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowFormModal(true);
            }}
          >
            + Add Staff
          </button>
        </div>

        {/* TABLE */}
        <div className="staff-table-wrapper">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Salary</th>
                <th>Status</th>
                <th width="160">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty">
                    No staff found
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.role}</td>
                    <td>{s.email}</td>
                    <td>{s.phone}</td>
                    <td>₹ {s.salary}</td>
                    <td>
                      <span
                        className={`status ${
                          s.status === "Active" ? "active" : "inactive"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-warning"
                        onClick={() => {
                          setForm(s);
                          setEditId(s.id);
                          setShowFormModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => confirmDelete(s.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showFormModal && (
        <div className="staff-modal">
          <div className="staff-modal-card">
            <h5>{editId ? "Edit Staff" : "Add Staff"}</h5>

            <form onSubmit={handleSubmit}>
              <div className="grid">
                <input
                      placeholder="Name *"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />

                    <input
                      placeholder="Role *"
                      required
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    />

                    <input
                      placeholder="Email *"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />

                    <input
                      placeholder="Phone *"
                      required
                      maxLength="10"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
                      }
                    />

                    <input
                      type="date"
                      required
                      value={form.join_date}
                      onChange={(e) => setForm({ ...form, join_date: e.target.value })}
                    />

                    <input
                      placeholder="Salary *"
                      required
                      value={form.salary}
                      onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    />

                    <select
                      required
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowFormModal(false)}
                >
                  Cancel
                </button>
                <button className="btn-primary">
                  {editId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="staff-modal">
          <div className="staff-modal-card">
            <h5>Confirm Delete</h5>
            <p>Are you sure you want to delete this staff member?</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default Staff;
