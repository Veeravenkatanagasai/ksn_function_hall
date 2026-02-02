import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchServices, addService, updateService, deleteService } from "../../../services/services";
import { fetchVendors } from "../../../services/vendor";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Services = () => {
  const [services, setServices] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [form, setForm] = useState({
    service_name: "",
    service_description: "",
    vendor_id: ""
  });

  const [editId, setEditId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  /* ================= LOAD DATA ================= */
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

  /* ================= FORM ================= */
  const resetForm = () => {
    setForm({
      service_name: "",
      service_description: "",
      vendor_id: ""
    });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.service_name || !form.vendor_id) {
      return toast.error("Service name and vendor are required");
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

  const handleEdit = (s) => {
    setForm({
      service_name: s.service_name,
      service_description: s.service_description,
      vendor_id: s.vendor_id
    });
    setEditId(s.service_id);
    setShowFormModal(true);
  };

  /* ================= DELETE ================= */
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteService(deleteId);
      toast.success("Service deleted");
      setShowDeleteModal(false);
      loadServices();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="container mt-4 position-relative">
      <ToastContainer position="top-right" autoClose={2500} />

      {/* 🔙 Back to Dashboard */}
      <Link
        to="/dashboard"
        className="btn btn-outline-dark position-absolute top-0 end-0"
      >
        ← Back to Dashboard
      </Link>

      <h3 className="mb-4">Services Management</h3>

      <button
        className="btn btn-primary mb-3"
        onClick={() => {
          resetForm();
          setShowFormModal(true);
        }}
      >
        + Add Service
      </button>

      {/* ================= TABLE ================= */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="bg-black text-white text-center">
            <tr>
              <th>Service</th>
              <th>Description</th>
              <th>Vendor</th>
              <th>Phone</th>
              <th width="160">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  No services found
                </td>
              </tr>
            ) : (
              services.map((s) => (
                <tr key={s.service_id}>
                  <td>{s.service_name}</td>
                  <td>{s.service_description}</td>
                  <td>{s.vendor_name} ({s.vendor_category})</td>
                  <td>{s.phone}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(s)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => confirmDelete(s.service_id)}
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

      {/* ================= ADD / EDIT MODAL ================= */}
      {showFormModal && (
        <div className="modal fade show d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{editId ? "Edit Service" : "Add Service"}</h5>
                <button className="btn-close" onClick={() => setShowFormModal(false)} />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <label>
                    Service Name <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control mb-2"
                    placeholder="Service Name"
                    value={form.service_name} required
                    onChange={(e) => setForm({ ...form, service_name: e.target.value })}
                  />
                  <label>Description <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control mb-2"
                    placeholder="Description"
                    value={form.service_description} required
                    onChange={(e) => setForm({ ...form, service_description: e.target.value })}
                  />
                  <label>Vendors <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={form.vendor_id}
                    onChange={(e) => setForm({ ...form, vendor_id: e.target.value })} required
                  >
                    <option value="">-- Select Vendor --</option>
                    {vendors.map((v) => (
                      <option key={v.vendor_id} value={v.vendor_id}>
                        {v.vendor_name} | {v.vendor_category} | {v.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowFormModal(false)}
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

      {/* ================= DELETE MODAL ================= */}
      {showDeleteModal && (
        <div className="modal fade show d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Confirm Delete</h5>
                <button className="btn-close" onClick={() => setShowDeleteModal(false)} />
              </div>
              <div className="modal-body">
                Are you sure you want to delete this service?
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Services;
