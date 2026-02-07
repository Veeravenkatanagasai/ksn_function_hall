import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchBooking, payNow } from "../../services/payment";
import { toast } from "react-toastify";

import "./Payment.css";

const MakePayment = ({ bookingId, onFinish }) => {
  const navigate = useNavigate();

  const [booking, setBooking] = useState({});
  const [paymentType, setPaymentType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [balanceDays, setBalanceDays] = useState(3);
  const [pdfPath, setPdfPath] = useState(false);
  const [isPaid, setIsPaid] = useState(false); // 🔒 NEW STATE

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


  useEffect(() => {
    fetchBooking(bookingId)
      .then(res => {
        setBooking(res.data);
        setBalance(res.data.gross_total_before_discount);
      })
      .catch(err => console.error(err));
  }, [bookingId]);

  const handlePayment = async () => {
    if (!paymentType || !paymentMethod || !paidAmount) {
      toast.error("Please fill all payment details");
      return;
    }

    if (paidAmount > balance) {
      toast.error("Paid amount cannot exceed remaining balance");
      return;
    }

    if (booking.booking_status === "CANCELLED") {
      toast.error("Cannot pay for CANCELLED booking");
      return;
    }

    try {
      const response = await payNow({
        booking_id: bookingId,
        payment_type: paymentType.toUpperCase(),
        payment_method: paymentMethod.toUpperCase(),
        paid_amount: Number(paidAmount),
        balance_days: paymentType === "ADVANCE" ? balanceDays : 0
      });

toast.success("Payment Successful");

alert("✅ Payment Successful!\n\nYou can now download the receipt.");

      setBalance(prev => prev - paidAmount);
      setPdfPath(true);
      setIsPaid(true); // 🔒 LOCK FORM

      setBooking(prev => ({
        ...prev,
        booking_status: response.data.booking_status
      }));
    } catch (err) {
      toast.error(err.response?.data?.error || "Payment failed");
    }
  };
 useEffect(() => {
  if (paymentType === "FULL") {
    setPaidAmount(balance);
  } else {
    setPaidAmount(0);
  }
}, [paymentType, balance]);

const isPayEnabled =
  !isPaid &&
  booking.booking_status !== "CANCELLED" &&
  paymentType &&
  paymentMethod &&
  paidAmount > 0 &&
  paidAmount <= balance &&
  (paymentType !== "ADVANCE" || balanceDays > 0);



  return (
    <div className="payment-container">
  <div className="payment-card">

    <div className="payment-header">
      <h3>💳 Make Payment</h3>
    </div>

    {/* Booking Summary */}
    <div className="summary-card">
      <div>
        <label>Booking ID</label>
        <p>{booking.booking_id}</p>
      </div>
      <div>
        <label>Total Amount</label>
        <p>₹ {booking.gross_total_before_discount}</p>
      </div>
      <div>
        <label>Remaining Balance</label>
        <p className="balance">₹ {balance}</p>
      </div>
      <div>
        <label>Status</label>
        <span className={`status ${booking.booking_status?.toLowerCase()}`}>
          {booking.booking_status}
        </span>
      </div>
    </div>

    {booking.booking_status !== "CANCELLED" && (
      <div className="form-section">

        {/* Payment Type */}
        <div className="form-group">
          <label>Payment Type</label>
          <select
            className="form-select"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            disabled={isPaid}
          >
            <option value="">Select Payment Type</option>
            <option value="ADVANCE">Advance Payment</option>
            <option value="FULL">Full Payment</option>
          </select>
        </div>

        {/* Advance Days */}
        {paymentType === "ADVANCE" && (
          <div className="form-group">
            <label>Advance Balance Days</label>
            <input
              type="number"
              className="form-control"
              value={balanceDays}
              onChange={(e) => setBalanceDays(Number(e.target.value))}
              disabled={isPaid}
            />
          </div>
        )}

        {/* Amount */}
        <div className="form-group">
          <label>Paid Amount</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter paid amount"
            value={paidAmount}
            onChange={(e) => setPaidAmount(Number(e.target.value))}
            disabled={isPaid || paymentType === "FULL"}
          />
        </div>

        {/* Payment Method */}
        <div className="form-group">
          <label>Payment Method</label>
          <select
            className="form-select"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={isPaid}
          >
            <option value="">Select Payment Method</option>
            <option value="CASH">Cash</option>
            <option value="RAZORPAY">Razorpay</option>
            <option value="PHONEPE">PhonePe</option>
          </select>
        </div>

        {/* Pay Button */}
        <button
          className="btn btn-success pay-btn"
          onClick={handlePayment}
          disabled={!isPayEnabled}
        >
          💰 Pay Now
        </button>
      </div>
    )}

    {/* PDF */}
    {pdfPath && (
  <button
    className="btn btn-primary download-btn"
    onClick={() =>
      window.open(
        `${BASE_URL}/pdf/booking/${bookingId}`,
        "_blank"
      )
    }
  >
    📄 Download PDF Receipt
  </button>
)}


  </div>
</div>

  );
};

export default MakePayment;
