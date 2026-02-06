import React, { useEffect, useState } from "react";
import { fetchBookings } from "../../../services/showDetails";
import { useNavigate } from "react-router-dom";
import "./ShowBooking.css";
import api from "../../../services/api";
import ElectricityBill from "../../Employee/EmployeeDashboard/Electricity";

const AdminShowDetails = () => {
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState("INPROGRESS");
  const [searchBookingId, setSearchBookingId] = useState("");
  const [inputBookingId, setInputBookingId] = useState("");

  // ===== Cancellation =====
  const [cancellationDetails, setCancellationDetails] = useState(null);
  const [cancelPreview, setCancelPreview] = useState(null);
  const [showCancelPreview, setShowCancelPreview] = useState(false);
  const [showRefundPopup, setShowRefundPopup] = useState(false);
  const [cancelMethod, setCancelMethod] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelProof, setCancelProof] = useState(null);

    
  // ===== Pay remainming balance =====

  const [showBalancePopup, setShowBalancePopup] = useState(false); 
  const [balancePayLoading, setBalancePayLoading] = useState(false);
  const [showPaymentMethodPopup, setShowPaymentMethodPopup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  // ===== FINAL SETTLEMENT STATES =====
  const [showSettlementSummary, setShowSettlementSummary] = useState(false);
  const [showSettlementAction, setShowSettlementAction] = useState(false);

  const [settlementData, setSettlementData] = useState(null);
  const [settlementType, setSettlementType] = useState(""); // REFUND / COLLECT
  const [paymentMode, setPaymentMode] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [refundDetails, setRefundDetails] = useState(null);

  const [showElectricityCreate, setShowElectricityCreate] = useState(false);
  const [electricityData, setElectricityData] = useState(null);

  const [galleryData, setGalleryData] = useState([]);
  const [showGalleryPopup, setShowGalleryPopup] = useState(false);

  const [billsData, setBillsData] = useState([]);
const [showBillsPopup, setShowBillsPopup] = useState(false);
const [payPopup, setPayPopup] = useState(false);
const [selectedBill, setSelectedBill] = useState(null);
const [paymentAmount, setPaymentAmount] = useState("");
const [paymentType, setPaymentType] = useState("CASH");

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, [page,statusFilter,searchBookingId]);

  const loadBookings = async () => {
  try {
    // Ensure page >= 1
    const safePage = Math.max(1, page);

    const effectiveStatus = searchBookingId ? "ALL" : statusFilter;
    const searchTerm = searchBookingId ? searchBookingId.trim() : "";

    const res = await fetchBookings(safePage, 12, effectiveStatus, searchTerm);

    setBookings(Array.isArray(res.data) ? res.data : []);
    setTotalPages(res.totalPages);
  } catch (err) {
    console.error("Failed to load bookings:", err);
    setBookings([]);
    setTotalPages(1);
  }
};

  const handleSearchClick = () => {
  setSearchBookingId(inputBookingId.trim());
  setPage(1);
};
const handleSearchChange = (e) => {
  const value = e.target.value;
  setSearchBookingId(value);
  setPage(1);
};

const handleClearSearch = () => {
  setSearchBookingId("");
  setPage(1);
};


  // ✅ Calculate totals dynamically from arrays
  const fixedTotal = selectedBooking
    ? selectedBooking.fixed_charges.reduce((sum, fc) => sum + Number(fc.charges_value), 0)
    : 0;


  const hallCharge = Number(selectedBooking?.hall_charge || 0);
  const grossBeforeDiscount = fixedTotal + hallCharge;

  const netAmount = grossBeforeDiscount - Number(selectedBooking?.discount_amount || 0);

  /* ================== CANCEL BOOKING ================== */
  const openCancelPreview = async () => {
  try {
    const res = await api.get(
  `/cancellation/preview/${selectedBooking.booking_id}`
);

    setCancelPreview(res.data);
    setShowCancelPreview(true);

  } catch (err) {
    alert(err.response?.data?.message || "Failed to preview cancellation");
  }
};
const confirmRefund = async () => {
  if (!cancelPreview) return;

  try {
    setCancelLoading(true);

    const formData = new FormData();
    formData.append("booking_id", cancelPreview.booking_id);
    formData.append("payment_id", cancelPreview.payment_id);
    formData.append("total_amount", cancelPreview.total_amount);
    formData.append("penalty_percent", cancelPreview.penalty_percent);
    formData.append("penalty_amount", cancelPreview.penalty_amount);
    formData.append("refund_amount", cancelPreview.refund_amount);
    formData.append("cancellation_paid_method", cancelMethod);

    if (cancelProof) {
      formData.append("proof_image", cancelProof);
    }

    await api.post("/cancellation/confirm", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});

// ✅ update selected booking instantly
setSelectedBooking(prev => ({
  ...prev,
  booking_status: "CANCELLED"
}));

// ✅ fetch & set cancellation details immediately
const detailsRes = await api.get(
  `/cancellation/details/${cancelPreview.booking_id}`
);

setCancellationDetails(detailsRes.data);

alert("Cancellation completed successfully");

setShowRefundPopup(false);
setCancelPreview(null);
setCancelMethod("");
setCancelProof(null);
  } catch (err) {
    alert(err.response?.data?.message || "Cancellation failed");
  } finally {
    setCancelLoading(false);
  }
};

  const fetchCancellationDetails = async (bookingId) => {
  const res = await api.get(
    `/cancellation/details/${bookingId}`
  );
  setCancellationDetails(res.data);
};

useEffect(() => {
  if (
    selectedBooking?.booking_status === "CANCELLED" &&
    !cancellationDetails
  ) {
    fetchCancellationDetails(selectedBooking.booking_id);
  }
}, [selectedBooking]);

  // ===== pay remaing balance =====

const handlePayBalance = async () => {
  try {
    setBalancePayLoading(true);

          await api.post(
        `/payments/pay-balance/${selectedBooking.booking_id}`,
        {
          payment_method: paymentMethod
        }
      );


    const updated = await fetchBookings(page, 12, statusFilter, searchBookingId);
    setBookings(updated.data);

    const updatedBooking = updated.data.find(
      b => b.booking_id === selectedBooking.booking_id
    );
    setSelectedBooking(updatedBooking);
    setShowPaymentMethodPopup(false);
    setPaymentMethod("");

  } catch (err) {
    alert(err.response?.data?.message || "Balance payment failed");
  } finally {
    setBalancePayLoading(false);
  }
};

  // ===== FINAL SETTLEMENT STATES =====

const openFinalSettlement = async () => {
  try {
    const res = await api.get(
      `/refund/calculate/${selectedBooking.booking_id}`
    );

    const data = res.data;

    setSettlementData({
      total: Number(data.total_amount) || 0,
      refundable: Number(data.refundable_amount) || 0,
      electricity: Number(data.electricity_cost) || 0,
      generator: Number(data.generator_cost) || 0,
      settlement: Number(data.settlement_amount) || 0
    });

    setShowSettlementSummary(true);

  } catch (err) {
    alert("Failed to calculate settlement");
  }
};

const confirmFinalSettlement = async () => {
  try {
    setSettlementLoading(true);

    const formData = new FormData();
    formData.append("settlement_type", settlementType);
    formData.append("settlement_amount", settlementData.settlement);

    // Only for REFUND / COLLECT
    if (settlementType !== "SETTLED") {
      formData.append("payment_mode", paymentMode);
      formData.append("proof_image", proofFile);
    }

    await api.post(
  `/refund/confirm/${selectedBooking.booking_id}`,
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);

    alert("Final settlement completed");

    setShowSettlementAction(false);
    setSettlementData(null);

    const updated = await fetchBookings(page);
    setBookings(updated.data);

    setSelectedBooking(
      updated.data.find(b => b.booking_id === selectedBooking.booking_id)
    );
  } catch (err) {
    alert(err.response?.data?.message || "Settlement failed");
  } finally {
    setSettlementLoading(false);
  }
};

const handleSettledSave = async () => {
  try {
    setSettlementLoading(true);

    const formData = new FormData();
    formData.append("settlement_type", "SETTLED");
    formData.append("settlement_amount", 0);

    await api.post(
      `/refund/confirm/${selectedBooking.booking_id}`,
      formData
    );

    alert("Booking marked as settled");

    setShowSettlementSummary(false);
    setSettlementData(null);

    // Reload bookings
    const updated = await fetchBookings(page);
    setBookings(updated.data);

    setSelectedBooking(
      updated.data.find(
        b => b.booking_id === selectedBooking.booking_id
      )
    );

  } catch (err) {
    alert(err.response?.data?.message || "Failed to mark as settled");
  } finally {
    setSettlementLoading(false);
  }
};



useEffect(() => {
  if (selectedBooking?.booking_status === "CLOSED") {
    api
      .get(`/refund/details/${selectedBooking.booking_id}`)
      .then(res => setRefundDetails(res.data))
      .catch(() => setRefundDetails(null));
  } else {
    setRefundDetails(null);
  }
}, [selectedBooking]);
const refreshFinalSettlement = async (bookingId) => {
  try {
    const res = await api.get(`/refund/details/${bookingId}`);
    setRefundDetails(res.data);
  } catch (err) {
    console.error("Failed to refresh settlement");
  }
};


const fetchElectricityData = async (bookingId) => {
  try {
    const res = await api.get(`/electricity/${bookingId}`);
    setElectricityData(res.data);
  } catch (err) {
    setElectricityData(null);
  }
};
useEffect(() => {
  if (selectedBooking) {
    fetchElectricityData(selectedBooking.booking_id);
  } else {
    setElectricityData(null);
  }
}, [selectedBooking]);

// Move this to component scope
const fetchGallery = async (bookingId) => {
  try {
    const { data } = await api.get(
      `/gallery/stagewise/${bookingId}`
    );

    setGalleryData(data);        // store OBJECT
    setShowGalleryPopup(true);   // open popup ONLY here
  } catch (err) {
    console.error("Failed to fetch gallery", err);
    setGalleryData({
      PREFUNCTION: [],
      FUNCTION: [],
      POSTFUNCTION: []
    });
    setShowGalleryPopup(true);
  }
};

const deleteGalleryImage = async (galleryId) => {
  if (!window.confirm("Delete this image?")) return;

  try {
    await api.delete(
      `/gallery/image/${galleryId}`
    );

    // Refresh gallery after delete
    fetchGallery(selectedBooking.booking_id);
  } catch (err) {
    alert("Failed to delete image");
  }
};

useEffect(() => {
  if (!selectedBooking) return;

  api
    .get(`/gallery/stagewise/${selectedBooking.booking_id}`)
    .then(res => setGalleryData(res.data))
    .catch(() =>
      setGalleryData({
        PREFUNCTION: [],
        FUNCTION: [],
        POSTFUNCTION: []
      })
    );
}, [selectedBooking]);


const fetchBills = async (bookingId) => {
  try {
    const res = await api.get(`/bills/${bookingId}`);
    setBillsData(res.data || []);
    setShowBillsPopup(true);
  } catch (err) {
    alert("Failed to fetch bills");
  }
};

const openPayPopup = (bill) => {
  setSelectedBill(bill);
  setPaymentAmount(bill.bill_amount); // default
  setPaymentType("CASH");
  setPayPopup(true);
};

const confirmPayment = async () => {
  if (!paymentType) {
    alert("Please select payment method");
    return;
  }
  try {
    await api.post(`/bills/pay/${selectedBill.bill_id}`, {
      payment_amount: paymentAmount,
      payment_method: paymentType
    });
    alert("Payment successful");
    setPayPopup(false);
    fetchBills(selectedBill.booking_id); 
    await refreshFinalSettlement(selectedBill.booking_id);
  } catch (err) {
    console.error(err);
    alert("Payment failed");
  }
};

const BookingPDFButton = ({ bookingId }) => (
  <button
    className="btn btn-outline-primary"
    onClick={() =>
      window.open(
        `${BASE_URL}/pdf/booking/${bookingId}`,
        "_blank"
      )
    }
  >
    <i className="bi bi-file-earmark-pdf-fill me-2"></i>
    Booking PDF
  </button>
);

const hasGallery =
  galleryData &&
  (
    (galleryData.PREFUNCTION?.length ?? 0) > 0 ||
    (galleryData.FUNCTION?.length ?? 0) > 0 ||
    (galleryData.POSTFUNCTION?.length ?? 0) > 0
  );

  return (
    <div className="admin-wrapper py-4">
      {/* BACK TO DASHBOARD */}
      <button
        className="btn btn-outline-light position-fixed top-0 end-0 m-4 shadow back-fixed-btn"
        onClick={() => window.history.back()}
      >
        <i className="bi bi-arrow-left-circle-fill me-2"></i>
        Back to Dashboard
      </button>
      <div className="container">
        <h2 className="mb-4 fw-bold">Booking Management</h2>

        {/* ===== STATUS FILTER BUTTONS ===== */}
<div className="d-flex flex-wrap gap-2 mb-4">
  {[
    { label: "ALL", value: "ALL" },
    { label: "IN PROGRESS", value: "INPROGRESS" },
    { label: "ON HOLD", value: "ONHOLD" },
    { label: "ADVANCE", value: "ADVANCE" },
    { label: "CANCELLED", value: "CANCELLED" },
    { label: "CLOSED", value: "CLOSED" },
  ].map((btn) => (
    <button
  key={btn.value}
   disabled={!!searchBookingId}
  className={`btn ${
    statusFilter === btn.value
      ? "btn-primary"
      : "btn-outline-primary"
  }`}
  onClick={() => {
    setStatusFilter(btn.value);
    setPage(1); 
  }}
>
  {btn.label}
</button>
  ))}

  <div style={{ width: "160px" }}>
    <input
      type="text"
      className="form-control"
      placeholder="Search by Booking ID"
      value={inputBookingId}
      onChange={(e) => setInputBookingId(e.target.value)}
    />
  </div>

  <div style={{ width: "160px" }}>
    <button
      className="btn btn-outline-primary w-100"
      onClick={handleSearchClick}
    >
      Search
    </button>
  </div>

  {searchBookingId && (
    <div style={{ width: "90px" }}>
      <button
        className="btn btn-outline-secondary w-100"
        onClick={() => {
          setInputBookingId("");
          setSearchBookingId("");
          setPage(1);
        }}
      >
        Clear
      </button>
    </div>
  )}
</div>

        {/* BOOKING CARDS */}
        <div className="row g-4">
          {bookings.map((b) => (
            <div key={`booking-${b.booking_id}`} className="col-lg-4 col-md-6">
              <div
                className="glass-card h-100 d-flex justify-content-between align-items-start p-3"
                onClick={() => setSelectedBooking(b)}
              >
                {/* Left side: booking info */}
                <div>
                  <span className="badge-id">Booking #{b.booking_id}</span>
                  <h5 className="customer-name-titles">{b.customer_name}</h5>
                  <p><i className="bi bi-calendar"></i> {b.event_date}</p>
                  <p><i className="bi bi-tags-fill me-2 text-warning"></i>{b.category}</p>
                  <p><i className="bi bi-clock-fill me-2 text-info"></i>{b.time_slot}</p>
                  <p><i className="bi bi-geo-alt"></i> {b.hall}</p>
                </div>

                {/* Right side: booking status */}
                <div className="ms-3">
                  <span>{b.booking_status}</span>
                  {b.booking_status === "ADVANCE" && b.balance_due_date && (
                    <small className="d-block text-danger fw-semibold">
                      Balance Due By: {new Date(b.balance_due_date).toLocaleDateString("en-IN")}
                    </small>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <nav className="mt-5">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage(page - 1)}>Prev</button>
            </li>
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      </div>

      {/* MODAL */}
      {selectedBooking && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-container">

            {/* HEADER */}
            <div className="modal-header-line d-flex justify-content-between align-items-center p-3 border-bottom bg-light rounded-top">

                {/* Left: Booking Details */}
                <div>
                  <h5 className="fw-bold text-primary mb-1">
                    Booking Details — #{selectedBooking.booking_id}
                  </h5>
                  <small className="text-muted">
                    Booked On: {new Date(selectedBooking.booking_date).toLocaleDateString("en-IN")}
                  </small>
                </div>

                {/* Center: Status Badge + Balance Due */}
                <div className="text-center">
                  <h5 className="fw-bold text-primary mb-0">
                  Booking Status — {selectedBooking.booking_status}
                  </h5>

                  {/* Show Balance Due Date for ADVANCE */}
                  {selectedBooking.booking_status === "ADVANCE" && selectedBooking.balance_due_date && (
                    <div className="mt-1">
                      <small className="text-danger fw-semibold">
                        Balance Due By: {new Date(selectedBooking.balance_due_date).toLocaleDateString("en-IN")}
                      </small>
                    </div>
                  )}
                </div>

                {/* Right: Close Button */}
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => setSelectedBooking(null)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>



            <div className="modal-scroll-area">
              <div className="row g-4 mt-3">

                {/* LEFT COLUMN */}
                <div className="col-lg-6 border-end">

                  {/* CUSTOMER INFO */}
                  <div className="info-block">
                    <h6 className="section-title">Customer Info</h6>
                    <div className="data-row"><span>Name</span><strong>{selectedBooking.customer_name}</strong></div>
                    <div className="data-row"><span>Phone</span><strong>{selectedBooking.phone}</strong></div>
                    <div className="data-row"><span>Email</span><strong>{selectedBooking.email}</strong></div>
                    <div className="data-row"><span>Address</span><strong>{selectedBooking.address}</strong></div>
                  </div>

                  {/* EVENT INFO */}
                  <div className="info-block mt-4">
                    <h6 className="section-title">Event Details</h6>
                    <div className="data-row"><span>Event Date</span><strong>{selectedBooking.event_date}</strong></div>
                    <div className="data-row"><span>Category</span><strong>{selectedBooking.category}</strong></div>
                    <div className="data-row"><span>Hall</span><strong>{selectedBooking.hall}</strong></div>
                    <div className="data-row"><span>Start Time</span><strong>{selectedBooking.start_time}</strong></div>
                    <div className="data-row"><span>End Time</span><strong>{selectedBooking.end_time}</strong></div>
                    <div className="data-row"><span>Duration</span><strong>{selectedBooking.duration} hrs</strong></div>
                  </div>

                  {/* REFERRAL */}
                  <div className="info-block mt-4">
                    <h6 className="section-title">Referral Details</h6>
                    <div className="data-row"><span>Name</span><strong>{selectedBooking.referral_name || "N/A"}</strong></div>
                    <div className="data-row"><span>Mobile</span><strong>{selectedBooking.referral_mobileno || "N/A"}</strong></div>
                    <div className="data-row"><span>Email</span><strong>{selectedBooking.referral_email || "N/A"}</strong></div>
                    <div className="data-row"><span>Status</span><strong>{selectedBooking.referral_status || "N/A"}</strong></div>
                    {selectedBooking.referral_status === "PAID" && selectedBooking.referral_amount && (
                      <div className="mt-3 border border-success rounded p-3">
                        <h6 className="section-title text-success">Referral Payment Details</h6>
                        <div className="data-row">
                          <span>Amount Paid</span>
                          <strong>₹ {selectedBooking.referral_amount}</strong>
                        </div>
                        <div className="data-row">
                          <span>Payment Method</span>
                          <strong>{selectedBooking.referral_payment_method}</strong>
                        </div>
                        <div className="data-row">
                          <span>Paid On</span>
                          <strong>{new Date(selectedBooking.referral_payment_date).toLocaleString("en-IN")}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* FIXED CHARGES */}
                  <div className="info-block mt-4">
                    <h6 className="section-title">Fixed Charges</h6>
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Charge</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBooking.fixed_charges.map((fc, i) => (
                          <tr key={`fc-${i}`}>
                            <td>{fc.charges_name}</td>
                            <td>₹ {fc.charges_value}</td>
                          </tr>
                        ))}
                        <tr className="fw-bold">
                          <td>Total Fixed Charges</td>
                          <td>₹ {fixedTotal}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* NET SUMMARY */}
                  <div className="net-summary-box mt-4">
                    <div className="data-row"><span>Fixed</span><strong>₹ {fixedTotal}</strong></div>
                    <div className="data-row"><span>Hall</span><strong>₹ {hallCharge}</strong></div>
                    <hr />
                    <div className="data-row fw-bold">
                      <span>Gross Before Discount</span>
                      <span>₹ {grossBeforeDiscount.toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="data-row text-danger">
                      <span>Discount ({selectedBooking.discount_percent}%)</span>
                      <span>- ₹ {selectedBooking.discount_amount}</span>
                    </div>
                    <hr />
                    <div className="data-row net-total-row">
                      <span>NET AMOUNT</span>
                      <span>₹ {netAmount.toFixed(2)}</span>
                    </div>
                  </div>
                
                {/* DOCUMENTS */}
                  <div className="docs-section mt-4">
                    <h6 className="section-title">Documents</h6>
                    <div className="d-flex gap-3 flex-wrap">
                      {["wedding_card_path","aadhar_customer_path","aadhar_bride_path","aadhar_groom_path"].map((key) => (
                        selectedBooking[key] && (
                          <div key={key} className="doc-thumb text-center">
                            <img
                              src={selectedBooking[key]}
                              alt={key}
                              style={{ cursor: "pointer" }}
                              onClick={() => window.open(selectedBooking[key], "_blank")}
                            />
                            <span className="small d-block mt-1">{key.replace(/_/g, " ")}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="col-lg-6">

                  <div className="info-block mt-4">
                    <h6 className="section-title">Payment Details</h6>

                <div className="data-row">
                  <span>Payment Type</span>
                  <strong>{selectedBooking.payment_type || "N/A"}</strong>
                </div>

                <div className="data-row">
                  <span>Payment Method</span>
                  <strong>{selectedBooking.payment_method || "N/A"}</strong>
                </div>

                <div className="data-row">
                  <span>Paid Amount</span>
                  <strong className="text-success">₹ {selectedBooking.paid_amount}</strong>
                </div>

                <div className="data-row">
                  <span>Balance Amount</span>
                  <strong className="text-danger">₹ {selectedBooking.balance_amount}</strong>
                </div>

                <div className="data-row">
                  <span>Transaction Status</span>
                  <strong>
                    {selectedBooking.transaction_status || "N/A"}
                  </strong>
                  </div>
                  </div>
                      {selectedBooking.balance_paid_status === "clear" &&
                          Number(selectedBooking.balance_paid_amount) > 0 &&
                          Number(selectedBooking.balance_amount) === 0 && (

                            <div className="info-block mt-3 border border-success rounded p-3">
                              <h6 className="section-title text-success">
                                Balance Payment Details
                              </h6>
                              <div className="data-row">
                                <span>Balance Paid</span>
                                <strong>₹ {selectedBooking.balance_paid_amount}</strong>
                              </div>

                              <div className="data-row">
                                <span>Paid On</span>
                                <strong>
                                  {selectedBooking.balance_paid_date
                                    ? new Date(selectedBooking.balance_paid_date).toLocaleString("en-IN")
                                    : "N/A"}
                                </strong>
                              </div>

                              <div className="data-row">
                              <span>Payment Method</span>
                              <strong className="text-primary">
                                {selectedBooking.balance_paid_method || "N/A"}
                              </strong>
                            </div>

                              <div className="data-row">
                                <span>Status</span>
                                <strong className="text-success">{selectedBooking.balance_paid_status}</strong>
                              </div>
                            </div>
                          )}
                      {selectedBooking.booking_status === "CANCELLED" && cancellationDetails && (
                              <div className="info-block mt-4 border border-danger rounded p-3">
                                <h6 className="section-title text-danger">Cancellation Details</h6>

                                <div className="data-row">
                                  <span>Total Booking Amount</span>
                                  <strong>₹ {cancellationDetails.total_amount}</strong>
                                </div>

                                <div className="data-row">
                                  <span>Penalty (%)</span>
                                  <strong>{cancellationDetails.penalty_percent}%</strong>
                                </div>

                                <div className="data-row text-danger">
                                  <span>Penalty Amount</span>
                                  <strong>₹ {cancellationDetails.penalty_amount}</strong>
                                </div>

                                <div className="data-row text-success">
                                  <span>Refund Amount</span>
                                  <strong>₹ {cancellationDetails.refund_amount}</strong>
                                </div>

                                <div className="data-row text-success">
                                  <span>Final Amount</span>
                                  <strong>₹ {cancellationDetails.final_amount}</strong>
                                </div>

                                <div className="data-row text-success">
                                  <span>refund payment method</span>
                                  <strong>₹ {cancellationDetails.cancellation_paid_method}</strong>
                                </div>

                                <div className="data-row">
                                  <span>Cancelled On</span>
                                  <strong>
                                    {new Date(cancellationDetails.cancelled_at).toLocaleString("en-IN")}
                                  </strong>
                                </div>
                                {cancellationDetails.proof_image_path && (
                                    <div className="mt-2">
                                      <span className="fw-semibold">Refund Proof</span>
                                      <br />
                                      <img
                                        src={cancellationDetails.proof_image_path}
                                        width={120}
                                        className="rounded shadow mt-1"
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                          window.open(cancellationDetails.proof_image_path, "_blank")
                                        }
                                      />
                                    </div>
                                  )}
                              </div>
                            )}

                            {electricityData && (
  <div className="info-block mt-4 border border-warning rounded p-3">
    <h6 className="section-title text-warning">Electricity & Generator Details</h6>

    <div className="data-row">
      <span>Current Previous Reading</span>
      <strong>{electricityData.current_previous_units} units</strong>
    </div>
    <div className="data-row">
      <span>Current After Reading</span>
      <strong>{electricityData.current_after_current_units} units</strong>
    </div>
    <div className="data-row">
      <span>Per Unit Cost</span>
      <strong>₹ {electricityData.current_per_unit_cost}</strong>
    </div>
    <div className="data-row text-success">
      <span>Total Current Cost</span>
      <strong>₹ {electricityData.currnet_total_amount}</strong>
    </div>

    <div className="data-row mt-2">
      <span>Previous Reading Image</span>
      <img
  src={electricityData.current_previous_reading_image}
  alt="Current Previous"
  width={120}
  style={{ cursor: "pointer" }}
  onClick={() =>
    window.open(
      electricityData.current_previous_reading_image,
      "_blank"
    )
  }
/>
    </div>

    <div className="data-row mt-2">
      <span>After Reading Image</span>
      <img
  src={electricityData.current_after_reading_image}
  width={120}
  onClick={() =>
    window.open(
      electricityData.current_after_reading_image,
      "_blank"
    )
  }
/>
    </div>

    {/* GENERATOR */}
    <hr />
    <div className="data-row">
      <span>Generator Previous Reading</span>
      <strong>{electricityData.generator_previous_units} units</strong>
    </div>
    <div className="data-row">
      <span>Generator After Reading</span>
      <strong>{electricityData.generator_after_units} units</strong>
    </div>
    <div className="data-row">
      <span>Per Unit Cost</span>
      <strong>₹ {electricityData.generator_per_unit_cost}</strong>
    </div>
    <div className="data-row text-success">
      <span>Total Generator Cost</span>
      <strong>₹ {electricityData.generator_total_amount}</strong>
    </div>

    <div className="data-row mt-2">
      <span>Previous Reading Image</span>
      <img
  src={electricityData.generator_previous_reading_image}
  width={120}
  onClick={() =>
    window.open(
      electricityData.generator_previous_reading_image,
      "_blank"
    )
  }
/>
    </div>

    <div className="data-row mt-2">
      <span>After Reading Image</span>
      <img
  src={electricityData.generator_after_reading_image}
  width={120}
  onClick={() =>
    window.open(
      electricityData.generator_after_reading_image,
      "_blank"
    )
  }
/>

    </div>

    <hr />
    <div className="data-row fw-bold">
      <span>Grand Total</span>
      <strong>₹ {electricityData.grand_total}</strong>
    </div>
  </div>
)}

                        {selectedBooking.booking_status === "CLOSED" && refundDetails && (
                      <div className="info-block mt-4 border border-success rounded p-3">
                        <h6 className="section-title text-success">
                          Final Settlement Details
                        </h6>

                        <div className="data-row">
                          <span>Settlement Type</span>
                          <strong>{refundDetails.settlement_type}</strong>
                        </div>

                        <div className="data-row">
                          <span>Payment Mode</span>
                          <strong>{refundDetails.payment_mode}</strong>
                        </div>

                        <div className="data-row">
                        <span>Total Booking Amount</span>
                        <strong>₹ {refundDetails.total_amount}</strong>
                      </div>

                        <div className="data-row">
                          <span>Electricity Bill</span>
                          <strong>+₹ {refundDetails.electricity_bill}</strong>
                        </div>

                        <div className="data-row">
                          <span>Generator Bill</span>
                          <strong>+₹ {refundDetails.generator_bill}</strong>
                        </div>

                        <div className="data-row text-success">
                        <span>Refundable Amount</span>
                        <strong>-₹ {refundDetails.refundable_amount}</strong>
                      </div>

                      <div className="data-row fw-bold">
                            <span>
                              Settlement Amount (
                              {refundDetails.settlement_type === "REFUND"
                                ? "Refund Amount"
                                : "Collect Amount"}
                              )
                            </span>

                            <strong
                              className={
                                refundDetails.settlement_type === "REFUND"
                                  ? "text-success"
                                  : "text-danger"
                              }
                            >
                              ₹ {Math.abs(refundDetails.settlement_amount || 0).toFixed(2)}
                            </strong>
                          </div>


                        <div className="data-row fw-bold">
                        <span>Adjusted Booking Amount</span>
                        <strong className="text-primary">
                          ₹ {refundDetails.adjustable_amount}
                        </strong>
                      </div>

                      {/* Referral Amount */}
                            {refundDetails.referral_amount > 0 && (
                              <div className="data-row text-danger fw-bold">
                                <span>Referral Amount</span>
                                <strong>-₹ {refundDetails.referral_amount}</strong>
                              </div>
                            )}

                            <div className="data-row fw-bold text-primary border-top pt-2">
                              <span>Bills Amount Adjusted</span>
                              <strong>
                                -₹ {refundDetails.total_bill_amount}
                              </strong>
                            </div>

                            {/* Final Amount */}
                            <div className="data-row fw-bold text-primary border-top pt-2">
                              <span>Final Amount</span>
                              <strong>
                                ₹ {refundDetails.final_amount ?? refundDetails.adjustable_amount}
                              </strong>
                            </div>



                        <div className="data-row">
                          <span>Settled On</span>
                          <strong>
                            {new Date(refundDetails.refunded_at).toLocaleString("en-IN")}
                          </strong>
                        </div>

                        {refundDetails.proof_image && (
                          <div className="mt-2">
                            <span className="fw-semibold">Proof</span>
                            <br />
                            <img
                              src={refundDetails.proof_image}
                              alt="Settlement Proof"
                              width="120"
                              className="rounded shadow mt-1"
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                window.open(refundDetails.proof_image, "_blank")
                              }
                            />
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2 mt-3 align-items-center">

  {/* ================= ADVANCE ================= */}
  {selectedBooking.booking_status === "ADVANCE" && (
    <>
      {selectedBooking.balance_amount > 0 && (
        <button
          className="btn btn-success"
          onClick={() => setShowBalancePopup(true)}
        >
          Pay Remaining Balance
        </button>
      )}

      <BookingPDFButton bookingId={selectedBooking.booking_id} />
    </>
  )}

  {/* ================= ON HOLD ================= */}
  {selectedBooking.booking_status === "ONHOLD" && (
  <>
    {selectedBooking.balance_amount > 0 && (
      <button
        className="btn btn-warning me-2"
        onClick={() => setShowBalancePopup(true)}
      >
        Pay Remaining Balance
      </button>
    )}

    <BookingPDFButton bookingId={selectedBooking.booking_id} />
  </>
)}

  {/* ================= IN PROGRESS ================= */}
  {selectedBooking.booking_status === "INPROGRESS" && (
    <>
      <BookingPDFButton bookingId={selectedBooking.booking_id} />

      <button
        className="btn btn-warning"
        disabled={electricityData !== null}
        onClick={() => setShowElectricityCreate(true)}
      >
        Update Electricity Bill
      </button>

      <button
        className="btn btn-outline-primary"
        onClick={() => fetchGallery(selectedBooking.booking_id)}
      >
        View Gallery
      </button>

      <button
        className="btn btn-primary"
        disabled={electricityData === null}
        onClick={openFinalSettlement}
      >
        Final Settlement
      </button>
      <button
      className="btn btn-outline-danger"
      onClick={openCancelPreview}
    >
      Cancel Booking
    </button>
    </>
  )}

  {/* ================= CLOSED ================= */}
  {selectedBooking.booking_status === "CLOSED" && (
    <>
      <BookingPDFButton bookingId={selectedBooking.booking_id} />

      <button
        className="btn btn-outline-primary"
        onClick={() =>
          window.open(
            `${BASE_URL}/pdf/final/${selectedBooking.booking_id}`,
            "_blank"
          )
        }
      >
        <i className="bi bi-file-earmark-pdf-fill me-2"></i>
        View Settlement PDF
      </button>

      <button
  className="btn btn-outline-primary"
  disabled={!hasGallery}
  onClick={() => fetchBills(selectedBooking.booking_id)}
>
  View Bills
</button>

{!hasGallery && (
  <small className="text-muted d-block">
    Upload gallery to enable bills
  </small>
)}

      <button
        className="btn btn-outline-primary"
        onClick={() => fetchGallery(selectedBooking.booking_id)}
      >
        View Gallery
      </button>
    </>
  )}

  {/* ================= CANCELLED ================= */}
  {selectedBooking.booking_status === "CANCELLED" && (
    <>
      <BookingPDFButton bookingId={selectedBooking.booking_id} />
      <button
        className="btn btn-outline-danger"
        onClick={() =>
          window.open(
            `${BASE_URL}/pdf/cancellation/${selectedBooking.booking_id}`,
            "_blank"
          )
        }
      >
        <i className="bi bi-file-earmark-pdf-fill me-2"></i>
        Cancellation PDF
      </button>

    </>
  )}

</div>

            </div>

          </div>

        </div>
      )}

            {showCancelPreview && cancelPreview && (
  <div className="custom-modal-overlay">
    <div className="custom-modal-container small">

      <h5 className="text-danger">Cancellation Summary</h5>

      <div className="data-row">
        <span>Total Booking Amount</span>
        <strong>₹ {cancelPreview.total_amount}</strong>
      </div>

      <div className="data-row">
        <span>Penalty (%)</span>
        <strong>{cancelPreview.penalty_percent}%</strong>
      </div>

      <div className="data-row text-danger">
        <span>Penalty Amount</span>
        <strong>₹ {cancelPreview.penalty_amount}</strong>
      </div>

      <div className="data-row text-success">
        <span>Refund Amount</span>
        <strong>₹ {cancelPreview.refund_amount}</strong>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          className="btn btn-secondary"
          onClick={() => setShowCancelPreview(false)}
        >
          Close
        </button>

        <button
          className="btn btn-danger"
          onClick={() => {
            setShowCancelPreview(false);
            setShowRefundPopup(true);
          }}
        >
          Proceed to Refund
        </button>
      </div>

    </div>
  </div>
)}
{showRefundPopup && cancelPreview && (
  <div className="custom-modal-overlay">
    <div className="custom-modal-container small">

      <h5 className="fw-bold mb-3">Confirm Refund</h5>

      <div className="data-row text-danger">
        <span>Penalty Amount</span>
        <strong>₹ {cancelPreview.penalty_amount}</strong>
      </div>

      <div className="data-row text-success">
        <span>Refund Amount</span>
        <strong>₹ {cancelPreview.refund_amount}</strong>
      </div>

      <label className="fw-semibold mt-3">Refund Method</label>
      <select
        className="form-select mt-1"
        value={cancelMethod}
        onChange={(e) => {
        setCancelMethod(e.target.value);
        setCancelProof(null); // reset old file
      }}
      >
        <option value="">Select</option>
        <option value="RAZORPAY">Razorpay</option>
        <option value="PHONEPE">PhonePe</option>
        <option value="CASH">Cash</option>
      </select>
      {cancelMethod && (
  <>
    <label className="fw-semibold mt-3">
      {cancelMethod === "CASH"
        ? "Upload Signed Cash Voucher"
        : `Upload ${cancelMethod} Refund Screenshot`}
    </label>

    <input
      type="file"
      className="form-control mt-1"
      onChange={(e) => setCancelProof(e.target.files[0])}
      required
    />
  </>
)}

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          className="btn btn-secondary"
          onClick={() => setShowRefundPopup(false)}
        >
          Cancel
        </button>

        <button
          className="btn btn-success"
          disabled={!cancelMethod || !cancelProof || cancelLoading}
          onClick={confirmRefund}
        >
          {cancelLoading ? "Processing..." : "Confirm Refund"}
        </button>
      </div>

    </div>
  </div>
)}


            {/* ================= PAY BALANCE POPUP ================= */}
                {showBalancePopup && selectedBooking && (
                  <div className="custom-modal-overlay">
                    <div className="custom-modal-container small">

                      <h5 className="text-success mb-3">Pay Remaining Balance</h5>

                      <div className="data-row">
                         <span>Amount Paid</span>
                          <strong>
                            ₹ {Number(selectedBooking.paid_amount).toFixed(2)}
                          </strong>
                      </div>

                      <div className="data-row">
                        <span>Remaining Balance</span>
                        <strong>
                          ₹ {Number(selectedBooking.balance_amount).toFixed(2)}
                        </strong>
                      </div>

                      <div className="d-flex justify-content-end gap-2 mt-4">
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowBalancePopup(false)}
                        >
                          Cancel
                        </button>

                        <button
                          className="btn btn-success"
                          onClick={() => {
                            setShowBalancePopup(false);
                            setShowPaymentMethodPopup(true);
                          }}
                        >
                          Continue
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {showPaymentMethodPopup && selectedBooking && (
  <div className="custom-modal-overlay">
    <div className="custom-modal-container small">

      <h5 className="text-success mb-3">Select Payment Method</h5>

      <div className="data-row">
        <span>Payable Amount</span>
        <strong className="text-danger">
          ₹ {selectedBooking.balance_amount}
        </strong>
      </div>

      <div className="mt-3">
        <label className="fw-semibold">Payment Method</label>
        <select
          className="form-select mt-1"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="">Select</option>
          <option value="RAZORPAY">Razorpay</option>
          <option value="PHONEPE">PhonePe</option>
          <option value="CASH">Cash</option>
        </select>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          className="btn btn-secondary"
          onClick={() => setShowPaymentMethodPopup(false)}
        >
          Cancel
        </button>

        <button
          className="btn btn-success"
          disabled={!paymentMethod || balancePayLoading}
          onClick={handlePayBalance}
        >
          {balancePayLoading ? "Processing..." : "Pay Now"}
        </button>
      </div>

    </div>
  </div>
)}

{showSettlementSummary && settlementData && (
  <div className="custom-modal-overlay">
    <div className="custom-modal-container small">

      <h5 className="fw-bold mb-3">Final Settlement Summary</h5>

      <div className="data-row">
        <span>Total Booking Amount</span>
        <strong>₹ {settlementData.total.toFixed(2)}</strong>
      </div>

      <div className="data-row text-success">
        <span>Refundable Amount</span>
        <strong>₹ {settlementData.refundable.toFixed(2)}</strong>
      </div>

      <div className="data-row text-warning">
        <span>Electricity Cost</span>
        <strong>- ₹ {settlementData.electricity.toFixed(2)}</strong>
      </div>

      <div className="data-row text-warning">
        <span>Generator Cost</span>
        <strong>- ₹ {settlementData.generator.toFixed(2)}</strong>
      </div>

      <hr />

      <div className="alert alert-info text-center">
        <h6>Settlement Amount</h6>
        <h4>₹ {settlementData.settlement.toFixed(2)}</h4>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          className="btn btn-secondary"
          onClick={() => setShowSettlementSummary(false)}
        >
          Close
        </button>

        {settlementData.settlement === 0 ? (
  <button
    className="btn btn-primary"
    onClick={handleSettledSave}
  >
    Mark as Settled
  </button>
) : (
  <>
    <button
      className="btn btn-success"
      disabled={settlementData.settlement <= 0}
      onClick={() => {
        setSettlementType("REFUND");
        setShowSettlementSummary(false);
        setShowSettlementAction(true);
      }}
    >
      Refund
    </button>

    <button
      className="btn btn-danger"
      disabled={settlementData.settlement >= 0}
      onClick={() => {
        setSettlementType("COLLECT");
        setShowSettlementSummary(false);
        setShowSettlementAction(true);
      }}
    >
      Collect
    </button>
  </>
)}
      </div>

    </div>
  </div>
)}

{showSettlementAction && settlementData && (
  <div className="custom-modal-overlay">
    <div className="custom-modal-container small">

      <h5 className="fw-bold mb-3">
        {settlementType === "REFUND"
          ? "Refund to Customer"
          : "Collect from Customer"}
      </h5>

      <div className="alert alert-primary text-center">
        <h6>Amount</h6>
        <h4>₹ {settlementData.settlement.toFixed(2)}</h4>
      </div>

      <label className="fw-semibold">Payment Mode</label>
      <select
        className="form-select mt-1"
        value={paymentMode}
        onChange={(e) => setPaymentMode(e.target.value)}
      >
        <option value="">Select</option>
        <option value="UPI">UPI</option>
        <option value="CASH">Cash</option>
      </select>

      {paymentMode && (
        <>
          <label className="fw-semibold mt-3">
            {paymentMode === "UPI"
              ? "Upload UPI Screenshot"
              : "Upload Signed Cash Voucher"}
          </label>

          <input
            type="file"
            className="form-control mt-1"
            onChange={(e) => setProofFile(e.target.files[0])}
          />
        </>
      )}

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          className="btn btn-secondary"
          onClick={() => {
            setShowSettlementAction(false);
            setShowSettlementSummary(true);
          }}
        >
          Back
        </button>

        <button
          className="btn btn-success"
          disabled={!paymentMode || !proofFile || settlementLoading}
          onClick={confirmFinalSettlement}
        >
          {settlementLoading ? "Processing..." : "Confirm"}
        </button>
      </div>

    </div>
  </div>
)}

{showElectricityCreate && (
  <div className="custom-modal-overlay">
    <div className="custom-modal-container">
      <div className="custom-modal-body">
        <ElectricityBill
          bookingId={selectedBooking.booking_id}
          onClose={() => setShowElectricityCreate(false)}
          onSaved={() => fetchElectricityData(selectedBooking.booking_id)}
        />
      </div>
    </div>
  </div>
)}

{showGalleryPopup && (
  <div className="custom-modal-overlay">
    <div className="custom-modal-container gallery-modal">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Gallery - Booking #{selectedBooking.booking_id}</h5>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => setShowGalleryPopup(false)}
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <div className="gallery-stage">
        {["PREFUNCTION", "FUNCTION", "POSTFUNCTION"].map((stage) => (
          <div key={stage} className="mb-3">
            <h6 className="text-primary">{stage}</h6>

            <div className="d-flex flex-wrap gap-2">
              {(galleryData?.[stage] || []).length === 0 ? (
                <small className="text-muted">No images</small>
              ) : (
                galleryData[stage].map((img) => (
  <div
    key={img.gallery_id}
    className="position-relative"
    style={{ width: "120px" }}
  >
    <img
      src={img.image_path}
      alt={stage}
      width={120}
      className="rounded shadow"
      style={{ cursor: "pointer" }}
       onClick={() => window.open(img.image_path, "_blank")}
    />
    <span
      className="gallery-delete-icon"
      onClick={() => deleteGalleryImage(img.gallery_id)}
    >
      ×
    </span>
  </div>
                ))
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  </div>
)}

{showBillsPopup && (
  <div className="custom-modal-overlay">
    <div className="custom-modal-container large">
      <h5 className="fw-bold mb-3">Bills-#{selectedBooking.booking_id}</h5>

      {billsData.length === 0 ? (
        <p>No bills found for this booking.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Photo</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Pay</th>
            </tr>
          </thead>
          <tbody>
            {billsData.map((bill) => (
              <tr key={bill.bill_id}>
                <td>{bill.bill_category}</td>
                <td>{bill.bill_description}</td>
                <td>
                  {bill.bill_photo ? (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => window.open(bill.bill_photo, "_blank")}
                    >
                      View
                    </button>
                  ) : "No Photo"}
                </td>
                <td>₹ {bill.bill_amount}</td>
               <td>
          <span
            className={`badge ${
              bill.payment_status === "PAID"
                ? "bg-success"
                : "bg-danger"
            }`}
          >
            {bill.payment_status}
          </span>

          {bill.payment_status === "PAID" && (
            <div className="small text-muted mt-1">
              ₹ {bill.payment_amount} • {bill.payment_method}
            </div>
          )}</td>
                <td>
          {bill.payment_status === "UNPAID" ? (
            <button
              className="btn btn-sm btn-success"
              onClick={() => openPayPopup(bill)}
            >
              Pay
            </button>
          ) : (
            <span className="text-success fw-semibold">Paid</span>
          )}
        </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="d-flex justify-content-end mt-3">
        <button
          className="btn btn-secondary"
          onClick={() => setShowBillsPopup(false)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

{payPopup && selectedBill && (
  <div className="custom-modal-overlay">
    <div className="custom-modal-container small">

      <h5 className="fw-bold mb-3">Pay Bill</h5>

      {/* Bill Category */}
      <div className="mb-2">
        <label className="form-label">Bill Category</label>
        <input
          type="text"
          className="form-control"
          value={selectedBill.bill_category}
          disabled
        />
      </div>

      {/* Bill Amount */}
      <div className="mb-2">
        <label className="form-label">Bill Amount</label>
        <input
          type="number"
          className="form-control"
          value={selectedBill.bill_amount}
          disabled
        />
      </div>

      {/* Payment Amount */}
      <div className="mb-2">
        <label className="form-label">Payment Amount</label>
        <input
          type="number"
          className="form-control"
          value={paymentAmount}
          min="1"
          max={selectedBill.bill_amount}
          onChange={(e) => setPaymentAmount(e.target.value)}
        />
      </div>

      {/* Payment Method */}
      <div className="mb-2">
              <label>Payment Method:</label>
              <select
                className="form-control"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              >
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

      {/* Buttons */}
      <div className="d-flex justify-content-end">
        <button
          className="btn btn-primary me-2"
          onClick={confirmPayment}
        >
          Confirm
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setPayPopup(false)}
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}


    </div>
  );
};

export default AdminShowDetails;
