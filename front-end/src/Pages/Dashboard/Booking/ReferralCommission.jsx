// ReferralPayments.jsx
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { Modal, Button, Form } from "react-bootstrap";
import "./ReferralCommission.css";


const ReferralPayments = () => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");

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

  return (
    <div className="referral-payments-container">
      <div className="top-right-btn">
        <Button variant="secondary" onClick={() => window.location.href="/dashboard"}>
          &larr; Back to Dashboard
        </Button>
      </div>

      <div className="table-wrapper">
        <table className="table table-bordered mt-3 referral-table">
          <thead className="table-dark">
            <tr>
              <th>Booking ID</th>
              <th>Referral Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.booking_id}>
                <td>{row.booking_id}</td>
                <td>{row.referral_name}</td>
                <td>{row.referral_mobileno}</td>
                <td>{row.referral_email}</td>
                <td>
                  <Button
                    className="me-2"
                    variant="success"
                    disabled={row.referral_status === "PAID"}
                    onClick={() => openModal(row)}
                  >
                    Pay Now
                  </Button>
                  {row.booking_status === "CLOSED" && row.referral_status === "PAID" && (
                    <Button
                      variant="outline-primary"
                      onClick={() =>
                        window.open(
                        `${BASE_URL}/pdf/referral/${row.booking_id}`,
                        "_blank"
                      )
                      }
                    >
                      <i className="bi bi-file-earmark-pdf-fill me-2"></i>
                      View PDF
                    </Button>
                  )}
                </td>
              </tr>
            ))}
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
  );
};

export default ReferralPayments;
