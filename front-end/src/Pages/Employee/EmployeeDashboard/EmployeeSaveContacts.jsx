import React, { useEffect, useState } from "react";
import { fetchContacts, addContact } from "../../../services/savecontact";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: ""
  });

  const navigate = useNavigate();

  /* ================= LOAD CONTACTS ================= */
  const loadContacts = async () => {
    try {
      const res = await fetchContacts();
      setContacts(res.data);
    } catch {
      toast.error("Failed to load contacts");
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return false;
    }

    if (!/^[a-zA-Z\s]+$/.test(form.name)) {
      toast.error("Name must contain only letters");
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Invalid email address");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      toast.error("Mobile must be a valid 10-digit number");
      return false;
    }

    return true;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await addContact(form);
      toast.success("Contact added successfully");
      setForm({ name: "", email: "", mobile: "", subject: "" });
      setShowModal(false);
      loadContacts();
    } catch {
      toast.error("Failed to save contact");
    }
  };

  return (
    <div className="container mt-4 contact-wrapper">

      {/* 🔙 BACK TO DASHBOARD */}
      <button
        className="btn btn-outline-dark position-fixed top-0 end-0 m-4 shadow"
        onClick={() => navigate("/employee-dashboard")}
      >
        ← Back to Dashboard
      </button>

      <h3 className="fw-bold mb-4">Contact Management</h3>

      {/* ADD BUTTON */}
      <button
        className="btn btn-primary mb-3"
        onClick={() => {
          setForm({ name: "", email: "", mobile: "", subject: "" });
          setShowModal(true);
        }}
      >
        + Add Contact
      </button>

      {/* ================= TABLE ================= */}
      <div className="table-responsive shadow-sm">
        <table className="table table-bordered table-hover">
          <thead className="bg-black text-white text-center">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Subject</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  No contacts found
                </td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr key={c.contact_id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.mobile}</td>
                  <td>{c.subject}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= ADD MODAL ================= */}
      {showModal && (
        <div className="modal fade show d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">

              <div className="modal-header">
                <h5 className="modal-title">Add Contact</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <label className="form-label">
                    Name <span className="required">*</span>
                  </label>
                  <input
                    className="form-control mb-2"
                    placeholder="Name"
                    value={form.name} required
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                  <label className="form-label">
                    Email <span className="required">*</span>
                  </label>

                  <input
                    className="form-control mb-2"
                    placeholder="Email"
                    value={form.email} required
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />

                  <label className="form-label">
                    Mobile <span className="required">*</span>
                  </label>

                  <input
                    className="form-control mb-2"
                    placeholder="Mobile"
                    value={form.mobile} required
                    onChange={(e) =>
                      setForm({ ...form, mobile: e.target.value })
                    }
                  />
                  <label className="form-label">
                    Subject
                  </label>

                  <input
                    className="form-control"
                    placeholder="Subject"
                    value={form.subject} required
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Contact
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

export default Contact;
