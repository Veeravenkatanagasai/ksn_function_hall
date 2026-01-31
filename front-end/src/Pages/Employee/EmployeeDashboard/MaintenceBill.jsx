import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import "./MaintenanceBill.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const MaintenanceBills = () => {
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    description: "",
    photo: null,
  });
  const [preview, setPreview] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Load bills from API
  const loadBills = async () => {
    try {
      const res = await api.get("/maintenance");
      setBills(res.data || []);
    } catch (err) {
      console.error("Failed to load bills:", err);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setForm({ ...form, photo: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Submit new bill
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("amount", form.amount);
    fd.append("description", form.description);
    if (form.photo) fd.append("photo", form.photo); // backend expects "photo"

    try {
      await api.post("/maintenance", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm({ name: "", amount: "", description: "", photo: null });
      setPreview("");
      setShowModal(false);
      loadBills();
    } catch (err) {
      console.error("Failed to save bill:", err.response?.data || err.message);
      alert("Error adding bill. Check console for details.");
    }
  };

  return (
    <div className="mb-container">
      {/* Top bar */}
      <div className="mb-topbar">
        <h2>Maintenance Bills</h2>
        <button className="mb-back-btn" onClick={() => navigate("/employee-dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Add Bill button */}
      <button className="mb-add-btn" onClick={() => setShowModal(true)}>
        + Add Maintenance Bill
      </button>

      {/* Bills Table */}
      <div className="mb-table-container">
        <table className="mb-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Photo</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill.maintenance_bill_id}>
                <td>{bill.maintenance_bill_name}</td>
                <td>₹{bill.maintenance_bill_amount}</td>
                <td>{bill.maintenance_bill_description}</td>
                <td>
                  {bill.maintenance_bill_photo && (
                  <a
                  href={bill.maintenance_bill_photo}
                  target="_blank"
                  rel="noopener noreferrer"
                  >
                  <img
                    src={bill.maintenance_bill_photo}
                    alt={bill.maintenance_bill_name}
                    className="mb-bill-img"
                    />
                </a>
                  )}
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Bill Modal */}
      {showModal && (
        <div className="mb-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="mb-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Maintenance Bill</h3>
            <form onSubmit={handleSubmit}>
              <label>Bill Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <label>Amount</label>
              <input
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
              />
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
              />
              <label>Photo</label>
              <input type="file" name="photo" onChange={handleChange} />
              {preview && <img src={preview} width="120" alt="Preview" />}

              <div className="mb-modal-buttons">
                <button type="submit">Add Bill</button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceBills;
