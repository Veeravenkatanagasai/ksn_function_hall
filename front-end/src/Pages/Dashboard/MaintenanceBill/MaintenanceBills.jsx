import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import "./MaintenanceBills.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


const MaintenanceBills = () => {
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [currentBill, setCurrentBill] = useState(null);

  const [form, setForm] = useState({
    name: "",
    amount: "",
    description: "",
    photo: null,
  });
  const [preview, setPreview] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [search, setSearch] = useState("");

  // Payment modal
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "cash" });

  // ===== Load bills =====
  const loadBills = async () => {
    try {
      const res = await api.get("/maintenance");
      const billsData = res.data;

      const billsWithPayments = await Promise.all(
        billsData.map(async (bill) => {
          const payRes = await api.get(`/maintenance/payment/${bill.maintenance_bill_id}`);
          return { ...bill, payments: payRes.data };
        })
      );

      setBills(billsWithPayments);
    } catch (err) {
      console.error("Failed to load bills:", err);
    }
  };

  useEffect(() => { loadBills(); }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setForm({ ...form, photo: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const openAddModal = () => {
    setCurrentBill(null);
    setForm({ name: "", amount: "", description: "", photo: null });
    setPreview("");
    setShowModal(true);
  };

  const openEditModal = (bill) => {
    setCurrentBill(bill);
    setForm({
      name: bill.maintenance_bill_name,
      amount: bill.maintenance_bill_amount,
      description: bill.maintenance_bill_description,
      photo: null,
    });
    setPreview(bill.maintenance_bill_photo);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("amount", form.amount);
    fd.append("description", form.description);
    if (form.photo) fd.append("photo", form.photo);

    try {
      if (currentBill) {
        await api.put(`/maintenance/${currentBill.maintenance_bill_id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/maintenance", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setShowModal(false);
      setForm({ name: "", amount: "", description: "", photo: null });
      setPreview("");
      loadBills();
    } catch (err) {
      console.error("Failed to save bill:", err);
    }
  };

  const handleDelete = async (billId) => {
    try {
      await api.delete(`/maintenance/${billId}`);
      setDeleteModal(false);
      loadBills();
    } catch (err) {
      console.error("Failed to delete bill:", err);
    }
  };

  const submitPayment = async () => {
    try {
      await api.post(`/maintenance/payment`, {
        billId: currentBill.maintenance_bill_id,
        amount: paymentForm.amount,
        method: paymentForm.method.toLowerCase(),
      });

      setPaymentForm({ amount: "", method: "cash" });
      setPaymentModal(false);
      loadBills();
    } catch (err) {
      console.error("Failed to add payment:", err);
    }
  };

  const filteredBills = bills.filter((b) =>
    b.maintenance_bill_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mb-container">
      {/* ===== FIXED HEADER ===== */}
      <header className="mb-header">
        <h2>Maintenance Bills</h2>
        <button className="btn btn-outline-light" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </header>

      {/* ===== CONTENT ===== */}
      <div className="mb-content">

        {/* TOOLBAR */}
        <div className="mb-toolbar">
          <input
            className="mb-search"
            placeholder="🔍 Search by name, phone or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Bill
          </button>
        </div>

      <div className="mb-table-container">
        <table className="mb-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Photo</th>
              <th>Payments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
  {filteredBills.map((bill) => {
    const isPaid = bill.payments.some(
      (p) => p.payment_status?.toLowerCase() === "paid"
    );

    return (
      <tr key={bill.maintenance_bill_id}>
        <td>{bill.maintenance_bill_name}</td>
        <td>₹{bill.maintenance_bill_amount}</td>
        <td>{bill.maintenance_bill_description}</td>
        <td>
          <a
          href={bill.maintenance_bill_photo}
          target="_blank"
          rel="noopener noreferrer"
        >

        <img
          src={bill.maintenance_bill_photo}
          alt={bill.maintenance_bill_name}
          className="mb-bill-img"
          style={{ cursor: "pointer" }}
        />
  </a>
</td>

        <td>
          <ul className="mb-payments-list">
            {bill.payments.map((p) => (
              <li key={p.maintenance_payment_id}>
                <span>₹{p.payment_amount}</span> |{" "}
                <span>{p.payment_method.toUpperCase()}</span> |{" "}
                <span>{p.payment_status}</span>
              </li>
            ))}
          </ul>
        </td>
        <td>
          <button
            className="mb-edit-btn"
            onClick={() => openEditModal(bill)}
          >
            Edit
          </button>

          <button
            className="mb-delete-btn"
            onClick={() => setDeleteModal(bill.maintenance_bill_id)}
          >
            Delete
          </button>

          <button
            className="mb-payment-btn"
            disabled={isPaid}
            onClick={() => {
              if (!isPaid) {
                setCurrentBill(bill);
                setPaymentModal(true);
              }
            }}
          >
            {isPaid ? "Paid" : "Add Payment"}
          </button>
        </td>
      </tr>
    );
  })}
</tbody>

        </table>
      </div>
      </div>

      {/* ===== ADD / EDIT BILL MODAL ===== */}
      {showModal && (
        <div className="mb-modal-overlay" onClick={() => setShowModal(false)}>
          <form className="mb-modal-content" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h3>{currentBill ? "Edit Bill" : "Add Bill"}</h3>
            <label>Bill Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
            <label>Amount</label>
            <input name="amount" value={form.amount} onChange={handleChange} required />
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} />
            <label>Photo</label>
            <input type="file" name="photo" onChange={handleChange} />
            {preview ? <img src={preview} width="120" /> :
             currentBill?.maintenance_bill_photo &&  (<img src={currentBill.maintenance_bill_photo} width="120" />)}
            <div className="mb-modal-buttons">
              <button type="submit">{currentBill ? "Update" : "Add"}</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ===== PAYMENT MODAL ===== */}
      {paymentModal && currentBill && (
        <div className="mb-modal-overlay" onClick={() => setPaymentModal(false)}>
          <div className="mb-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Payment for: {currentBill.maintenance_bill_name}</h3>
            <p><strong>Bill Amount:</strong> ₹{currentBill.maintenance_bill_amount}</p>
            <label>Payment Amount</label>
            <input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
            <label>Payment Method</label>
            <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
            </select>
            <div className="mb-modal-buttons">
              <button onClick={submitPayment}>Confirm Payment</button>
              <button onClick={() => setPaymentModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE MODAL ===== */}
      {deleteModal && (
        <div className="mb-modal-overlay" onClick={() => setDeleteModal(false)}>
          <div className="mb-modal-content" onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to delete this bill?</p>
            <div className="mb-modal-buttons">
              <button onClick={() => handleDelete(deleteModal)}>Yes, Delete</button>
              <button onClick={() => setDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MaintenanceBills;
