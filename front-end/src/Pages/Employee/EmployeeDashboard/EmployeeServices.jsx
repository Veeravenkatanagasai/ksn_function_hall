import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchServices, addService } from "../../../services/services";
import { fetchVendors } from "../../../services/vendor";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Services = () => {
  const [services, setServices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);

  const [form, setForm] = useState({
    service_name: "",
    service_description: "",
    vendor_id: ""
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadServices();
    loadVendors();
  }, []);

  const loadServices = async () => {
    try {
      const res = await fetchServices();
      setServices(res.data);
    } catch {
      toast.error("Failed to load services");
    }
  };

  const loadVendors = async () => {
    try {
      const res = await fetchVendors();
      setVendors(res.data);
    } catch {
      toast.error("Failed to load vendors");
    }
  };

  /* ================= FORM ================= */
  const resetForm = () => {
    setForm({
      service_name: "",
      service_description: "",
      vendor_id: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.service_name || !form.vendor_id) {
      return toast.error("Service name and vendor are required");
    }

    try {
      await addService(form);
      toast.success("Service added successfully");
      setShowFormModal(false);
      resetForm();
      loadServices();
    } catch {
      toast.error("Operation failed");
    }
  };

  return (
    <div className="container mt-4 position-relative">
      <ToastContainer position="top-right" autoClose={2500} />

      {/* 🔙 Back to Dashboard */}
      <Link
        to="/employee-dashboard"
        className="btn btn-outline-dark position-absolute top-0 end-0"
      >
        ← Back to Dashboard
      </Link>

      <h3 className="mb-4">Services Management</h3>

      {/* ADD BUTTON */}
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
      <div className="table-responsive shadow-sm">
        <table className="table table-bordered table-hover">
          <thead className="bg-black text-white text-center">
            <tr>
              <th>Service</th>
              <th>Description</th>
              <th>Vendor</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  No services found
                </td>
              </tr>
            ) : (
              services.map((s) => (
                <tr key={s.service_id}>
                  <td>{s.service_name}</td>
                  <td>{s.service_description}</td>
                  <td>
                    {s.vendor_name}{" "}
                    <span className="text-muted">
                      ({s.vendor_category})
                    </span>
                  </td>
                  <td>{s.phone}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= ADD MODAL ================= */}
      {showFormModal && (
        <div className="modal fade show d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5>Add Service</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowFormModal(false)}
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input
                    className="form-control mb-2"
                    placeholder="Service Name"
                    value={form.service_name}
                    onChange={(e) =>
                      setForm({ ...form, service_name: e.target.value })
                    }
                  />

                  <textarea
                    className="form-control mb-2"
                    placeholder="Service Description"
                    value={form.service_description}
                    onChange={(e) =>
                      setForm({ ...form, service_description: e.target.value })
                    }
                  />

                  <select
                    className="form-select"
                    value={form.vendor_id}
                    onChange={(e) =>
                      setForm({ ...form, vendor_id: e.target.value })
                    }
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
                    Save Service
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Services;
