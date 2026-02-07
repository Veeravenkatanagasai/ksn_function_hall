import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchVendors,
  addVendor,
} from "../../../services/vendor";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [form, setForm] = useState({
    vendor_name: "",
    vendor_category: "",
    vendor_address: "",
    phone: "",
    email: "",
  });

  const [showFormModal, setShowFormModal] = useState(false);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const res = await fetchVendors();
      setVendors(res.data);
    } catch {
      toast.error("Failed to load vendors");
    }
  };

  const resetForm = () => {
    setForm({
      vendor_name: "",
      vendor_category: "",
      vendor_address: "",
      phone: "",
      email: "",
    });
  };

  const validateForm = () => {
  if (!form.vendor_name.trim()) {
    toast.error("Vendor name required");
    return false;
  }

  if (!form.vendor_category.trim()) {
    toast.error("Vendor category required");
    return false;
  }

  if (!/^\d{10}$/.test(form.phone)) {
    toast.error("Phone must be exactly 10 digits");
    return false;
  }

  if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    toast.error("Invalid email");
    return false;
  }

  return true;
};


  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    await addVendor(form);
    toast.success("Vendor added");
    setShowFormModal(false);
    resetForm();
    loadVendors();
  } catch {
    toast.error("Something went wrong");
  }
};


  /* ================= FILTER LOGIC ================= */
  const filteredVendors = vendors.filter((v) => {
    const matchSearch =
      v.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
      v.phone.includes(search) ||
      v.email.toLowerCase().includes(search.toLowerCase());

    const matchCategory = categoryFilter
      ? v.vendor_category === categoryFilter
      : true;

    return matchSearch && matchCategory;
  });

  const categories = [...new Set(vendors.map(v => v.vendor_category))];

  return (
    <section className="vendors-page">
      <ToastContainer position="top-right" autoClose={2500} />

      {/* HEADER */}
      <header className="vendors-header">
        <h2>Vendors Management</h2>
        <Link to="/employee-dashboard" className="btn btn-outline-light">
          ← Back to Dashboard
        </Link>
      </header>

      {/* CONTENT */}
      <main className="vendors-content">

        {/* SEARCH + FILTER BAR */}
        <div className="vendors-toolbar">
          <input
            type="text"
            placeholder="🔍 Search by name, phone or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowFormModal(true);
            }}
          >
            + Add Vendor
          </button>
        </div>

        {/* TABLE */}
        <div className="vendors-table-wrapper">
          <table className="vendors-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty">
                    No vendors found
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => (
                  <tr key={v.vendor_id}>
                    <td>{v.vendor_name}</td>
                    <td>
                      <span className="category-chip">
                        {v.vendor_category}
                      </span>
                    </td>
                    <td>{v.vendor_address}</td>
                    <td>{v.phone}</td>
                    <td>{v.email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ADD / EDIT MODAL */}
      {showFormModal && (
        <div className="vendors-modal">
          <div className="vendors-modal-card">
            <h4>Add Vendor</h4>

            <form onSubmit={handleSubmit}>
              {[
                ["Vendor Name", "vendor_name"],
                ["Category", "vendor_category"],
                ["Address", "vendor_address"],
                ["Phone", "phone"],
                ["Email", "email"],
              ].map(([label, key]) => (
                <div className="field" key={key}>
                  <label>{label}</label>
                  <input
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    required
                  />
                </div>
              ))}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowFormModal(false)}
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

    </section>
  );
};

export default Vendors;
