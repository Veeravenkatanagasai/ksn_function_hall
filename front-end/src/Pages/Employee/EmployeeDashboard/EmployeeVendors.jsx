import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchVendors, addVendor } from "../../../services/vendor";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);

  const [form, setForm] = useState({
    vendor_name: "",
    vendor_category: "",
    vendor_address: "",
    phone: "",
    email: ""
  });

  /* ================= LOAD ================= */
  const loadVendors = async () => {
    try {
      const res = await fetchVendors();
      setVendors(res.data);
    } catch {
      toast.error("Failed to load vendors");
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  /* ================= FORM ================= */
  const resetForm = () => {
    setForm({
      vendor_name: "",
      vendor_category: "",
      vendor_address: "",
      phone: "",
      email: ""
    });
  };

  const validateForm = () => {
    if (!form.vendor_name.trim()) return toast.error("Vendor name is required");
    if (!form.vendor_category.trim()) return toast.error("Vendor category is required");
    if (!/^\d{10}$/.test(form.phone)) return toast.error("Phone must be 10 digits");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error("Invalid email");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await addVendor(form);
      toast.success("Vendor added successfully");
      setShowFormModal(false);
      resetForm();
      loadVendors();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="container mt-4 position-relative">

      {/* 🔙 Back to Dashboard */}
      <Link
        to="/employee-dashboard"
        className="btn btn-outline-dark position-absolute top-0 end-0"
      >
        ← Back to Dashboard
      </Link>

      <ToastContainer position="top-right" autoClose={2500} />

      <h3 className="mb-4">Vendors Management</h3>

      {/* ADD BUTTON */}
      <button
        className="btn btn-primary mb-3"
        onClick={() => {
          resetForm();
          setShowFormModal(true);
        }}
      >
        + Add Vendor
      </button>

      {/* ================= TABLE ================= */}
      <div className="table-responsive shadow-sm">
        <table className="table table-bordered table-hover">
          <thead className="bg-black text-white text-center">
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No vendors found
                </td>
              </tr>
            ) : (
              vendors.map((v) => (
                <tr key={v.vendor_id}>
                  <td>{v.vendor_name}</td>
                  <td>{v.vendor_category}</td>
                  <td>{v.vendor_address}</td>
                  <td>{v.phone}</td>
                  <td>{v.email}</td>
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
                <h5>Add Vendor</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowFormModal(false)}
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <label className="form-label">
                    Vendor Name <span className="required">*</span>
                  </label>
                  <input
                    className="form-control mb-2"
                    placeholder="Vendor Name"
                    value={form.vendor_name} required
                    onChange={(e) =>
                      setForm({ ...form, vendor_name: e.target.value })
                    }
                  />
                  <label className="form-label">
                    Category <span className="required">*</span>
                  </label>

                  <input
                    className="form-control mb-2"
                    placeholder="Category"
                    value={form.vendor_category} required
                    onChange={(e) =>
                      setForm({ ...form, vendor_category: e.target.value })
                    }
                  />
                  <label className="form-label">
                    Address <span className="required">*</span>
                  </label>

                  <input
                    className="form-control mb-2"
                    placeholder="Address"
                    value={form.vendor_address} required
                    onChange={(e) =>
                      setForm({ ...form, vendor_address: e.target.value })
                    }
                  />
                    <label className="form-label">
                  Phone <span className="required">*</span>
                </label>
                  <input
                    className="form-control mb-2"
                    placeholder="Phone"
                    value={form.phone}
                    required
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                <label className="form-label">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    className="form-control mb-2"
                    placeholder="Email"
                    value={form.email}
                    required
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
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
                    Save Vendor
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

export default Vendors;
