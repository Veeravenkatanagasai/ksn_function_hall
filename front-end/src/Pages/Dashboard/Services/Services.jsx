import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchServices,
  addService,
  updateService,
  deleteService,
} from "../../../services/services";
import { fetchVendors } from "../../../services/vendor";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Services.css";

const Services = () => {
  const [services, setServices] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");

  const [form, setForm] = useState({
    service_name: "",
    service_description: "",
    vendor_id: "",
  });

  const [editId, setEditId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadServices();
    loadVendors();
  }, []);

  const loadServices = async () => {
    const res = await fetchServices();
    setServices(res.data);
  };

  const loadVendors = async () => {
    const res = await fetchVendors();
    setVendors(res.data);
  };

  const resetForm = () => {
    setForm({
      service_name: "",
      service_description: "",
      vendor_id: "",
    });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.service_name || !form.vendor_id) {
      return toast.error("Service name & vendor required");
    }

    try {
      editId
        ? await updateService(editId, form)
        : await addService(form);

      toast.success(editId ? "Service updated" : "Service added");
      setShowFormModal(false);
      resetForm();
      loadServices();
    } catch {
      toast.error("Operation failed");
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.service_name.toLowerCase().includes(search.toLowerCase()) ||
      s.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);

    

    return matchesSearch;
  });

  return (
    <section className="services-page">
      <ToastContainer position="top-right" autoClose={2500} />

      {/* ================= HEADER ================= */}
      <header className="services-header">
        <h2>Services Management</h2>
        <Link to="/dashboard" className="btn btn-outline-light">
          ← Back to Dashboard
        </Link>
      </header>

      {/* ================= CONTENT ================= */}
      <main className="services-content">
        {/* Search & Filter */}
        <div className="services-filters">
          <input
            type="text"
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
            + Add Service
          </button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="services-table-wrapper">
          <table className="services-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Description</th>
                <th>Vendor</th>
                <th>Phone</th>
                <th width="160">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty">
                    No services found
                  </td>
                </tr>
              ) : (
                filteredServices.map((s) => (
                  <tr key={s.service_id}>
                    <td>{s.service_name}</td>
                    <td>{s.service_description}</td>
                    <td>
                      <span className="category-chip">
                        {s.vendor_name}
                        </span></td>
                    <td>{s.phone}</td>
                    <td className="actions">
                      <button
                        className="btn-warning"
                        onClick={() => {
                          setForm(s);
                          setEditId(s.service_id);
                          setShowFormModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => {
                          setDeleteId(s.service_id);
                          setShowDeleteModal(true);
                        }}
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
      </main>

      {/* ================= ADD / EDIT MODAL ================= */}
      {showFormModal && (
        <div className="services-modal">
          <div className="services-modal-card">
            <h4>{editId ? "Edit Service" : "Add Service"}</h4>

            <form onSubmit={handleSubmit}>
              <input
                placeholder="Service Name"
                value={form.service_name}
                onChange={(e) =>
                  setForm({ ...form, service_name: e.target.value })
                }
                required
              />
              <textarea
                placeholder="Description"
                value={form.service_description}
                onChange={(e) =>
                  setForm({ ...form, service_description: e.target.value })
                }
                required
              />
              <select
                value={form.vendor_id}
                onChange={(e) =>
                  setForm({ ...form, vendor_id: e.target.value })
                }
                required
              >
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v.vendor_id} value={v.vendor_id}>
                    {v.vendor_name} | {v.phone}
                  </option>
                ))}
              </select>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowFormModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}
      {showDeleteModal && (
        <div className="services-modal">
          <div className="services-modal-card">
            <h4>Confirm Delete</h4>
            <p>Are you sure you want to delete this service?</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={async () => {
                  await deleteService(deleteId);
                  toast.success("Service deleted");
                  setShowDeleteModal(false);
                  loadServices();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Services;
