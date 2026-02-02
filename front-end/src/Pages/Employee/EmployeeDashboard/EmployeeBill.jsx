import React, { useEffect, useState } from "react";
import api from "../../../services/api";

const EmployeeBills = () => {
  const [bookings, setBookings] = useState([]);
  const [bills, setBills] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);

  const [form, setForm] = useState({
    booking_id: "",
    bill_category: "",
    bill_description: "",
    bill_amount: "",
    bill_photo: null,
  });

  /* ================= PAGINATION ================= */
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 20;
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchClosedBookings();
  }, []);

  const fetchClosedBookings = async () => {
    try {
      const res = await api.get("/bills/closed-bookings");
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings", err);
    }
  };

  const fetchBillsByBooking = async (booking_id) => {
    try {
      const res = await api.get(`/bills/${booking_id}`);
      setBills(res.data);
    } catch (err) {
      console.error("Error fetching booking bills:", err);
    }
  };

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const openBookingModal = (bookingId) => {
    setSelectedBooking(bookingId);
    fetchBillsByBooking(bookingId);
  };

  const closeBookingModal = () => {
    setSelectedBooking(null);
  };

  const openAddBillModal = () => {
    setForm({
      booking_id: selectedBooking,
      bill_category: "",
      bill_description: "",
      bill_amount: "",
      bill_photo: null,
    });
    setShowBillModal(true);
  };

  const closeBillModal = () => {
    setShowBillModal(false);
  };

  /* ================= ADD BILL ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) fd.append(key, value);
    });

    try {
       await api.post("/bills/create", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  alert("Bill added");
      fetchBillsByBooking(selectedBooking);
      closeBillModal();
    } catch (err) {
      console.error(err);
      alert("Failed to add bill");
    }
  };

  /* ================= FILTER BILLS ================= */
  const billsForBooking = bills.filter(
    (b) => b.booking_id === selectedBooking
  );

  /* ================= PAGINATION ================= */
  const indexOfLast = currentPage * bookingsPerPage;
  const indexOfFirst = indexOfLast - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirst, indexOfLast);

  return (
    <div className="eb-container">
      {/* ===== HEADER ===== */}
      <div className="eb-header">
        <h2>Employee Bills Management</h2>
        <button
          className="eb-back-btn"
          onClick={() => (window.location.href = "/employee-dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      {/* ===== BOOKINGS ===== */}
      <div className="booking-grid">
        {currentBookings.map((b) => (
          <div
            key={b.booking_id}
            className="booking-card"
            onClick={() => openBookingModal(b.booking_id)}
          >
            <h3>Booking #{b.booking_id}</h3>
            <p>View Bills</p>
          </div>
        ))}
      </div>

      {/* ===== PAGINATION ===== */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
            onClick={() => setCurrentPage(i + 1)}
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

            <button className="eb-add-btn" onClick={openAddBillModal}>
              + Add Bill
            </button>

            <div className="bill-card-grid">
              {bills.length === 0 && <p>No bills added</p>}
              {bills.map((b) => (
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

                  <p>
                    <strong>Status:</strong>{" "}
                    <span style={{ color: b.payment_status === "PAID" ? "green" : "red" }}>
                      {b.payment_status}
                    </span>
                  </p>

                  {b.payment_status === "PAID" && (
                    <>
                      <p><strong>Paid Amount:</strong> ₹{b.payment_amount}</p>
                      <p><strong>Method:</strong> {b.payment_method}</p>
                    </>
                  )}
                </div>
              ))}
            </div>

            <button className="eb-cancel-btn" onClick={closeBookingModal}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ===== ADD BILL MODAL ===== */}
      {showBillModal && (
        <div className="eb-modal-backdrop" onClick={closeBillModal}>
          <div className="eb-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Bill</h3>

            <form onSubmit={handleSubmit}>
              <label className="eb-label">
          Category <span className="eb-required">*</span>
        </label>
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

              <label className="eb-label">
          Description <span className="eb-required">*</span>
        </label>

              <input
                name="bill_description"
                placeholder="Description"
                value={form.bill_description}
                onChange={handleChange}
                required
              />
               <label className="eb-label">
          Amount <span className="eb-required">*</span>
        </label>

              <input
                type="number"
                name="bill_amount"
                placeholder="Amount"
                value={form.bill_amount}
                onChange={handleChange}
                required
              />

              <label className="eb-label">
          Bill Photo
        </label>

              <input type="file" name="bill_photo" onChange={handleChange} />

              <button type="submit">Save</button>
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
