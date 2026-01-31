import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import "./BillsUpload.css";

const EmployeeBills = () => {
  const [bookings, setBookings] = useState([]);
  const [bills, setBills] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modal, setModal] = useState({ show: false, type: "", bill: null });

  const [form, setForm] = useState({
    booking_id: "",
    bill_category: "",
    bill_description: "",
    bill_amount: "",
    bill_photo: null,
  });

  // ========== Pagination ==========
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 20;
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);

  /* ================= FETCH CLOSED BOOKINGS ================= */
  useEffect(() => {
    fetchClosedBookings();
    fetchAllBills();
  }, []);

  const fetchClosedBookings = async () => {
    try {
      const res = await api.get("/bills/closed-bookings");
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const fetchAllBills = async () => {
    try {
      const res = await api.get("/bills");
      setBills(res.data);
    } catch (err) {
      console.error("Error fetching bills:", err);
    }
  };

  /* ================= HANDLE FORM CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  /* ================= OPEN / CLOSE MODAL ================= */
  const openBookingModal = (booking_id) => {
    setSelectedBooking(booking_id);
    setModal({ show: false, type: "", bill: null });
  };

  const closeBookingModal = () => {
    setSelectedBooking(null);
    setModal({ show: false, type: "", bill: null });
  };

  const openBillModal = (type, bill = null) => {
    setModal({ show: true, type, bill });

    if (bill) {
      setForm({
        booking_id: bill.booking_id,
        bill_category: bill.bill_category,
        bill_description: bill.bill_description,
        bill_amount: bill.bill_amount,
        bill_photo: null,
        existingPhoto: bill.bill_photo,
      });
    } else {
      setForm({
        booking_id: selectedBooking,
        bill_category: "",
        bill_description: "",
        bill_amount: "",
        bill_photo: null,
      });
    }
  };

  const closeBillModal = () => setModal({ show: false, type: "", bill: null });

  /* ================= ADD / EDIT BILL ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("booking_id", form.booking_id);
    fd.append("bill_category", form.bill_category);
    fd.append("bill_description", form.bill_description);
    fd.append("bill_amount", form.bill_amount);
    if (form.bill_photo) fd.append("bill_photo", form.bill_photo);

    try {
      if (modal.type === "add") {
  await api.post("/bills/create", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  alert("Bill added");
} else {
  await api.put(`/bills/update/${modal.bill.bill_id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  alert("Bill updated");
}
      fetchAllBills();
      closeBillModal();
    } catch (err) {
      console.error(err);
      alert("Error saving bill");
    }
  };

  /* ================= DELETE BILL ================= */
  const handleDelete = async (bill_id) => {
    if (!window.confirm("Delete this bill?")) return;
    try {
      await api.delete(`/bills/${bill_id}`);
      fetchAllBills();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FILTER BILLS BY BOOKING ================= */
  const billsForSelectedBooking = bills.filter(
    (b) => b.booking_id === selectedBooking
  );

  /* ================= PAGINATION ================= */
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="eb-container">
      {/* ===== HEADER ===== */}
      <div className="eb-header">
        <h2 className="eb-title">Bills Management</h2>
        <button
          className="eb-back-btn"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      {/* ===== BOOKING GRID ===== */}
      <div className="booking-grid">
        {currentBookings.map((b) => (
          <div
            key={b.booking_id}
            className="booking-card"
            onClick={() => openBookingModal(b.booking_id)}
          >
            <h3>Booking #{b.booking_id}</h3>
            <p>Click to view bills</p>
          </div>
        ))}
      </div>

      {/* ===== PAGINATION ===== */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
            onClick={() => paginate(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* ===== BOOKING BILLS MODAL ===== */}
      {selectedBooking && (
        <div className="eb-modal-backdrop" onClick={closeBookingModal}>
          <div
            className="eb-modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Bills for Booking #{selectedBooking}</h3>

            <button className="eb-add-btn" onClick={() => openBillModal("add")}>
              + Add Bill
            </button>

            <div className="bill-card-grid">
              {billsForSelectedBooking.length === 0 && <p>No bills added</p>}
              {billsForSelectedBooking.map((b) => (
                <div key={b.bill_id} className="bill-card">
                  <h4>{b.bill_category}</h4>
                  <p>{b.bill_description}</p>
                  <p><strong>₹{b.bill_amount}</strong></p>
                  {b.bill_photo && (
                    <img
                      src={b.bill_photo}
                      alt="bill"
                      width="120"
                      style={{ cursor: "pointer" }}
                      onClick={() => window.open(b.bill_photo, "_blank")}
                    />
                  )}

                  <div className="bill-card-actions">
                    <button onClick={() => openBillModal("edit", b)}>Edit</button>
                    <button onClick={() => handleDelete(b.bill_id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>

            <button className="eb-cancel-btn" onClick={closeBookingModal}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ===== ADD / EDIT BILL MODAL ===== */}
      {modal.show && (
        <div className="eb-modal-backdrop" onClick={closeBillModal}>
          <div className="eb-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{modal.type === "add" ? "Add Bill" : "Edit Bill"}</h3>
            <form onSubmit={handleSubmit}>
              <select
                name="bill_category"
                value={form.bill_category}
                onChange={handleChange}
                required
              >
                <option value="">Category</option>
                {["SECURITY", "CLEANING", "ELECTRICITY", "PLUMBING", "OTHER"].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  )
                )}
              </select>

              <input
                name="bill_description"
                placeholder="Description"
                value={form.bill_description}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="bill_amount"
                placeholder="Amount"
                value={form.bill_amount}
                onChange={handleChange}
                required
              />

              {modal.type === "edit" && form.existingPhoto && (
                <img
                  src={form.existingPhoto}
                  alt="Bill"
                  width="120"
                />
              )}

              <input type="file" name="bill_photo" onChange={handleChange} />

              <button type="submit">{modal.type === "add" ? "Save" : "Update"}</button>
              <button type="button" onClick={closeBillModal}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeBills;
