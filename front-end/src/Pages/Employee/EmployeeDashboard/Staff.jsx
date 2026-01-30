import React, { useEffect, useState } from "react";
import { fetchStaff, addStaff } from "../../../services/staff";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    salary: "",
    join_date: "",
    status: "Active"
  });
  const [showFormModal, setShowFormModal] = useState(false);

  const navigate = useNavigate();

  /* ================= LOAD STAFF ================= */
  const loadStaff = async () => {
    const res = await fetchStaff();
    setStaff(res.data);
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
  };

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (form.name.trim().length < 3) return toast.error("Name must be at least 3 characters");
    if (!form.role.trim()) return toast.error("Role is required");
    if (!form.email.trim()) return toast.error("Email is required");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error("Invalid email format");
    if (!form.phone.trim()) return toast.error("Phone number is required");
    if (form.phone.length !== 10) return toast.error("Phone number must be exactly 10 digits");
    if (!/^[6-9]\d{9}$/.test(form.phone)) return toast.error("Enter a valid Indian mobile number");
    if (!form.salary) return toast.error("Salary is required");
    if (isNaN(form.salary) || Number(form.salary) <= 0) return toast.error("Salary must be a positive number");
    if (!form.join_date) return toast.error("Join date is required");
    return true;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await addStaff(form);
      toast.success("Staff added successfully");
      resetForm();
      setShowFormModal(false);
      loadStaff();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="container mt-4 position-relative">

      {/* 🔙 BACK TO DASHBOARD */}
      <button
        className="btn btn-outline-dark position-fixed top-0 end-0 m-4"
        onClick={() => navigate("/employee-dashboard")}
      >
        ← Back to Dashboard
      </button>

      <h3 className="fw-bold mb-4">Staff Management</h3>

      <button
        className="btn btn-primary mb-3"
        onClick={() => {
          resetForm();
          setShowFormModal(true);
        }}
      >
        + Add Staff
      </button>

      {/* ================= TABLE ================= */}
      <table className="table table-bordered table-hover">
        <thead className="bg-black text-white text-center">
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Salary</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {staff.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                No staff found
              </td>
            </tr>
          ) : (
            staff.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.role}</td>
                <td>{s.email}</td>
                <td>{s.phone}</td>
                <td>₹ {s.salary}</td>
                <td>
                  <span className={`badge ${s.status === "Active" ? "bg-success" : "bg-secondary"}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ================= ADD MODAL ================= */}
      {showFormModal && (
        <div className="modal fade show d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">

              <div className="modal-header">
                <h5>Add Staff</h5>
                <button className="btn-close" onClick={() => setShowFormModal(false)} />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body row g-3">

                  <div className="col-md-6">
                    <input className="form-control" placeholder="Name *"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>

                  <div className="col-md-6">
                    <input className="form-control" placeholder="Role *"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })} />
                  </div>

                  <div className="col-md-6">
                    <input className="form-control" placeholder="Email *"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>

                  <div className="col-md-6">
                    <input className="form-control" placeholder="Phone *"
                      maxLength="10"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} />
                  </div>

                  <div className="col-md-6">
                    <input type="date" className="form-control"
                      value={form.join_date}
                      onChange={(e) => setForm({ ...form, join_date: e.target.value })} />
                  </div>

                  <div className="col-md-6">
                    <input className="form-control" placeholder="Salary *"
                      value={form.salary}
                      onChange={(e) => setForm({ ...form, salary: e.target.value })} />
                  </div>

                  <div className="col-md-6">
                    <select className="form-select"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary"
                    onClick={() => setShowFormModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default Staff;
