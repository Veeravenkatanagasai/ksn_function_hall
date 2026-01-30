import React, { useEffect, useState } from "react";
import {
  fetchContacts,
  addContact,
  updateContact,
  deleteContact
} from "../../../services/savecontact";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "react-toastify/dist/ReactToastify.css";


const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: ""
  });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const loadContacts = async () => {
    const res = await fetchContacts();
    setContacts(res.data);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  /* ---------------- VALIDATION ---------------- */
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

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editId) {
      await updateContact(editId, form);
      toast.success("Contact updated successfully");
    } else {
      await addContact(form);
      toast.success("Contact added successfully");
    }

    setForm({ name: "", email: "", mobile: "", subject: "" });
    setEditId(null);
    setShowModal(false);
    loadContacts();
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = (c) => {
    setForm({
      name: c.name,
      email: c.email,
      mobile: c.mobile,
      subject: c.subject
    });
    setEditId(c.contact_id);
    setShowModal(true);
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      await deleteContact(id);
      toast.success("Contact deleted");
      loadContacts();
    }
  };

  return (
    <div className="container mt-4 contact-wrapper">

      {/* BACK BUTTON */}
      <button
        className="btn btn-outline-dark position-fixed top-0 end-0 m-4 shadow"
        onClick={() => navigate("/dashboard")}
      >
        <i className="bi bi-arrow-left-circle me-2"></i>
        Back to Dashboard
      </button>

      <h3 className="fw-bold mb-4">Contact Management</h3>

      <button
        className="btn btn-primary mb-3"
        onClick={() => {
          setForm({ name: "", email: "", mobile: "", subject: "" });
          setEditId(null);
          setShowModal(true);
        }}
      >
        + Add Contact
      </button>

      {/* TABLE */}
      <table className="table table-bordered table-hover shadow-sm">
        <thead className="bg-black text-white text-center">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Subject</th>
            <th width="150">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                No contacts found
              </td>
            </tr>
          )}

          {contacts.map((c) => (
            <tr key={c.contact_id}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.mobile}</td>
              <td>{c.subject}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEdit(c)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(c.contact_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editId ? "Edit Contact" : "Add Contact"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input
                    className="form-control mb-2"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                  <input
                    className="form-control mb-2"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                  <input
                    className="form-control mb-2"
                    placeholder="Mobile"
                    value={form.mobile}
                    onChange={(e) =>
                      setForm({ ...form, mobile: e.target.value })
                    }
                  />
                  <input
                    className="form-control"
                    placeholder="Subject"
                    value={form.subject}
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
                    {editId ? "Update" : "Save"}
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
