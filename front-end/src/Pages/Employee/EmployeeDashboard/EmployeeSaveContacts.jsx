import React, { useEffect, useState } from "react";
import {
  fetchContacts,
  addContact,
} from "../../../services/savecontact";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: ""
  });
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  /* ================= LOAD ================= */
  const loadContacts = async () => {
    const res = await fetchContacts();
    setContacts(res.data || []);
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

    if (!/^[A-Za-z\s]+$/.test(form.name)) {
      toast.error("Name must contain only letters");
      return false;
    }

    if (!form.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Invalid email format");
      return false;
    }

    if (!form.mobile.trim()) {
      toast.error("Mobile number is required");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      toast.error("Mobile must be 10 digits starting with 6–9");
      return false;
    }

    if (!form.subject.trim()) {
      toast.error("Subject is required");
      return false;
    }

    if (form.subject.length < 3) {
      toast.error("Subject must be at least 3 characters");
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
    } catch (error) {
      toast.error("Something went wrong. Try again.");
    }
  };

  /* ================= SEARCH ================= */
  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search)
  );

  return (
    <div className="contact-page">
      {/* HEADER */}
      <div className="contact-header">
        <h3>Contact Management</h3>
        <button className="btn btn-outline-light" onClick={() => navigate("/employee-dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      {/* CONTENT */}
      <div className="contact-content">
        {/* TOOLBAR */}
        <div className="contact-toolbar">
          <input
            placeholder="🔍 Search by name, phone or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn-primary"
            onClick={() => {
              setForm({ name: "", email: "", mobile: "", subject: "" });
              setShowModal(true);
            }}
          >
            + Add Contact
          </button>
        </div>

        {/* TABLE */}
        <div className="contact-table-wrapper">
          <table className="contact-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Subject</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty">
                    No contacts found
                  </td>
                </tr>
              )}

              {filteredContacts.map((c) => (
                <tr key={c.contact_id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.mobile}</td>
                  <td>{c.subject}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="contact-modal">
          <div className="contact-modal-card">
            <h4>Add Contact</h4>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Email *</label>
                <input
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Mobile *</label>
                <input
                  required
                  value={form.mobile}
                  onChange={(e) =>
                    setForm({ ...form, mobile: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Subject *</label>
                <input
                  required
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default Contact;
