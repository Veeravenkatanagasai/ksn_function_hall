import { useEffect, useState } from "react";
import { generateInvoice } from "../../services/invoice";
import api from "../../services/api";
import "./Invoice.css";
import { useNavigate } from "react-router-dom";

const InvoiceStep = ({ data, onBack }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    generateInvoice(data)
      .then((res) => {
        setInvoice(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Invoice error:", err);
        setLoading(false);
      });
  }, [data]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Calculating invoice...</p>
      </div>
    );
  }

  const safe = (v) => Number(v || 0).toLocaleString("en-IN", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  const confirmBooking = async () => {
    const fd = new FormData();
    // Customer, Files, and Referral logic remains the same
    fd.append("name", data.customerName);
    fd.append("phone", data.phone);
    fd.append("alternatePhone", data.alternatePhone || "");
    fd.append("email", data.email || "");
    fd.append("address", data.address || "");

    if (data.aadharCustomer) fd.append("aadharCustomer", data.aadharCustomer);
    if (data.aadharBride) fd.append("aadharBride", data.aadharBride);
    if (data.aadharGroom) fd.append("aadharGroom", data.aadharGroom);
    if (data.weddingCard) fd.append("weddingCard", data.weddingCard);

    fd.append("referralName", data.referralName || "");
    fd.append("referralPhone", data.referralPhone || "");
    fd.append("referralEmail", data.referralEmail || "");

    fd.append("booking", JSON.stringify({
      category: data.category,
      hall: data.hall,
      timeSlot: data.timeSlot,
      eventDate: data.eventDate,
      startTime: data.startTime,
      endTime: data.endTime,
      discount: data.discount,
    }));

    fd.append("invoice", JSON.stringify(invoice));

    try {
  const res = await api.post("/bookings/confirm", fd, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  navigate(`/payments/${res.data.bookingId}`);
} catch (error) {
  console.error(error);
  alert("Error confirming booking");
}
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm invoice-card">
        <div className="card-header bg-white py-3">
          <h4 className="mb-0 text-center text-uppercase fw-bold text-secondary">
            Order Summary
          </h4>
        </div>

        <div className="card-body p-4">
          <div className="row mb-4">
            {/* Customer Details */}
            <div className="col-md-6 border-end">
              <h6 className="section-title">Customer Details</h6>
              <div className="detail-item"><span>Name:</span> {data.customerName}</div>
              <div className="detail-item"><span>Phone:</span> {data.phone}</div>
              <div className="detail-item"><span>Email:</span> {data.email || "N/A"}</div>
              <div className="detail-item"><span>Address:</span> {data.address || "N/A"}</div>
            </div>

            {/* Booking Details */}
            <div className="col-md-6 ps-md-4">
              <h6 className="section-title">Booking Details</h6>
              <div className="detail-item"><span>Category:</span> {data.category}</div>
              <div className="detail-item"><span>Hall:</span> {data.hall}</div>
              <div className="detail-item"><span>Date:</span> {data.eventDate}</div>
              <div className="detail-item"><span>Slot:</span> {data.timeSlot}</div>
              <div className="detail-item"><span>Time:</span> {data.startTime} - {data.endTime}</div>
              <div className="detail-item"><span>Duration:</span>{data.duration}</div>
            </div>
          </div>

          {/* Referral Section (Conditional) */}
            <div className="referral-box mb-4 p-2 bg-light rounded">
               <h6 className="section-title px-2">Referral Information</h6>
               <div className="detail-item"><span>Name:</span> {data.referralName} </div>
                <div className="detail-item"><span>Phone:</span> {data.referralPhone} </div>
                <div className="detail-item"><span>Email:</span> {data.referralEmail || "N/A"} </div>
            </div>

          {/* Invoice Table */}
          <div className="table-responsive">
            <table className="table table-borderless invoice-table">
              <thead className="table-light">
                <tr>
                  <th>Description</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Base Rent ({invoice.hours} hours @ ₹{safe(invoice.base_price_per_hour)}/hr)</td>
                  <td className="text-end">₹ {safe(invoice.baseAmount)}</td>
                </tr>

                {invoice.fixedCharges.length > 0 && (
                  <>
                    <tr className="table-group-divider"><td colSpan="2" className="fw-bold pt-3">Fixed Charges</td></tr>
                    {invoice.fixedCharges.map((f, i) => (
                      <tr key={i}>
                        <td className="ps-3 text-muted">{f.name}</td>
                        <td className="text-end">₹ {safe(f.amount)}</td>
                      </tr>
                    ))}
                      <tr className="fw-bold">
                      <td>Total Fixed Charges</td>
                      <td className="text-end">₹ {safe(invoice.fixedChargeAmount)}</td>
                      </tr>
                  </>
                )}

                <tr className="fw-bold border-top">
                  <td>Subtotal (Base Rent + Fixed Charges)</td>
                  <td className="text-end">₹ {safe(invoice.baseAmount + invoice.fixedChargeAmount)}</td>
                </tr>

                <tr className="border-top">
                  <td className="text-danger">Discount ({invoice.discount}%)</td>
                  <td className="text-end text-danger">- ₹ {safe(invoice.discountAmount)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="table-dark">
                  <td className="fw-bold">Grand Total</td>
                  <td className="text-end fw-bold">₹ {safe(invoice.grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Actions */}
          <div className="d-flex justify-content-between align-items-center mt-5">
            <button className="btn btn-link text-decoration-none text-muted" onClick={onBack}>
              <i className="bi bi-arrow-left"></i> Modify Details
            </button>
            <button className="btn btn-primary btn-lg px-5 shadow-sm confirm-btn" onClick={confirmBooking}>
              Confirm & Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceStep;
