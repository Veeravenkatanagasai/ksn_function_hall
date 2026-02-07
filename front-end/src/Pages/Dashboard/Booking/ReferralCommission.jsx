// ReferralPayments.jsx
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { Modal, Button, Form } from "react-bootstrap";
import "./ReferralCommission.css";
import { Link } from "react-router-dom";


const ReferralPayments = () => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [searchBookingId, setSearchBookingId] = useState("");

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await api.get("/referral-payment/closed-bookings");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch referral bookings", err);
    }
  };

  fetchData();
}, []);

  const openModal = (row) => {
    setSelected(row);
    setShow(true);
  };

  const handlePay = async () => {
  try {
    await api.post("/referral-payment/pay", {
      referral_id: selected.referral_id,
      booking_id: selected.booking_id,
      referral_amount: amount,
      referral_payment_method: method,
    });

    alert("Payment Successful");
    setShow(false);
    window.location.reload();
  } catch (err) {
    console.error("Referral payment failed", err);
    alert("Payment failed");
  }
};

const filteredData = data.filter(row => {

  // 🔍 IF SEARCH IS ACTIVE → IGNORE STATUS FILTER
  if (searchBookingId) {
    return row.booking_id
      .toString()
      .includes(searchBookingId);
  }

  // ✅ STATUS FILTER ONLY WHEN NO SEARCH
  if (filterStatus === "PENDING") {
    return row.referral_status !== "PAID";
  }

  if (filterStatus === "PAID") {
    return row.referral_status === "PAID";
  }

  return true;
});


const pendingCount = data.filter(
  row => row.referral_status !== "PAID"
).length;

const paidCount = data.filter(
  row => row.referral_status === "PAID"
).length;

  return (
   <div className="referral-payments-container">
  {/* Fixed Header */}
  <div className="referral-header">
    <h3 className="referral-title">Referral Payments</h3>

    <Link to="/dashboard" className="btn btn-outline-light">
      ← Back to Dashboard
    </Link>
  </div>

  {/* Page Content */}
  <div className="referral-content">

    {/* Filters */}
    <div className="referral-filters">
      <div className="mb-3">
        <Button
          className="me-2 px-4"
          variant={filterStatus === "PENDING" ? "primary" : "outline-primary"}
          onClick={() => setFilterStatus("PENDING")}
        >
          Pending
          <span className="badge bg-light text-primary ms-2">
            {pendingCount}
          </span>
        </Button>

        <Button
          className="px-4"
          variant={filterStatus === "PAID" ? "success" : "outline-success"}
          onClick={() => setFilterStatus("PAID")}
        >
          Paid
          <span className="badge bg-light text-success ms-2">
            {paidCount}
          </span>
        </Button>
      </div>

      <Form.Control
        type="text"
        placeholder="🔍 Search by Booking ID"
        className="referral-search"
        value={searchBookingId}
        onChange={(e) => setSearchBookingId(e.target.value)}
      />
    </div>

    {/* Table */}
    <div className="referral-table-wrapper">
      <table className="table table-bordered referral-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Referral Name</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-muted py-4">
                No records found
              </td>
            </tr>
          ) : (
            filteredData.map(row => (
              <tr key={row.booking_id}>
                <td>{row.booking_id}</td>
                <td>{row.referral_name}</td>
                <td>{row.referral_mobileno}</td>
                <td>{row.referral_email}</td>
                <td>
                  <Button
                    size="sm"
                    variant="success"
                    disabled={row.referral_status === "PAID"}
                    onClick={() => openModal(row)}
                  >
                    Pay Now
                  </Button>

                  {row.referral_status === "PAID" && (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="ms-2"
                      onClick={() =>
                        window.open(
                          `${BASE_URL}/pdf/referral/${row.booking_id}`,
                          "_blank"
                        )
                      }
                    >
                      View PDF
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
      <Modal show={show} onHide={() => setShow(false)} centered backdrop="static" keyboard={false} dialogClassName="referral-modal">
  <Modal.Header closeButton className="referral-modal-header">
    <Modal.Title>Referral Payment</Modal.Title>
  </Modal.Header>

  <Modal.Body className="referral-modal-body">
          <Form>
            <Form.Group>
              <Form.Label>Referral Amount</Form.Label>
              <Form.Control
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select onChange={e => setMethod(e.target.value)}>
                <option value="">Select</option>
                <option value="RAZORPAY">Razorpay</option>
                <option value="PHONEPE">PhonePe</option>
                <option value="CASH">Cash</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="custom-modal-footer">
          <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
          <Button variant="primary" onClick={handlePay}>Pay</Button>
        </Modal.Footer>
      </Modal>
      </div>
    </div>
  );
};

export default ReferralPayments;
