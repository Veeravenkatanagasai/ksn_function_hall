import { useEffect, useState } from "react";
import { generateInvoice } from "../../services/invoice";
import api from "../../services/api";
import "./Invoice.css";

const InvoiceStep = ({ data, onBack, onConfirmed }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
  setLoading(true);

  generateInvoice(data)
    .then((res) => {
      setInvoice({
        ...res,
        isCustom: data.pricingRule === "NO",
      });
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

  const safe = (v) =>
    Number(v || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const confirmBooking = async () => {
    if (confirmLoading) return; // safety guard

    setConfirmLoading(true);

    const fd = new FormData();
    // Customer details
    fd.append("name", data.customerName);
    fd.append("phone", data.phone);
    fd.append("alternatePhone", data.alternatePhone || "");
    fd.append("email", data.email || "");
    fd.append("address", data.address || "");
    fd.append("noofGuests", data.noofGuests ?? 0);
    fd.append("furnitureDetails", data.furnitureRequired ? data.furnitureDetails || "Yes" : "No");
    if (data.category === "Marriage") {
    fd.append("brideName", data.brideName);
    fd.append("groomName", data.groomName);
    }

    // Files
    if (data.aadharCustomer) fd.append("aadharCustomer", data.aadharCustomer);
    if (data.aadharBride) fd.append("aadharBride", data.aadharBride);
    if (data.aadharGroom) fd.append("aadharGroom", data.aadharGroom);
    if (data.weddingCard) fd.append("weddingCard", data.weddingCard);

    // Referral
    fd.append("referralName", data.referralName || "");
    fd.append("referralPhone", data.referralPhone || "");
    fd.append("referralEmail", data.referralEmail || "");

    // Booking and invoice
    fd.append(
      "booking",
      JSON.stringify({
       pricingRule: data.pricingRule,
    category: data.category,
    hall: data.hall,
    timeSlot: data.timeSlot,
    eventDate: data.eventDate,
    startTime: data.startTime,
    endTime: data.endTime,
    duration: data.duration,
    discount: data.discount,
      })
    );
    fd.append("invoice", JSON.stringify(invoice));

    try {
      const res = await api.post("/bookings/confirm", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onConfirmed(res.data.bookingId);
    } catch (error) {
      console.error(error);
      alert("Error confirming booking");
      setConfirmLoading(false);
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
              <div className="detail-item"><span>Name:</span> {data.customerName || "N/A"}</div>
              {data.category === "Marriage" && (
                  <>
                    <div className="detail-item">
                      <span>Bride Name:</span> {data.brideName || "N/A"}
                    </div>
                    <div className="detail-item">
                      <span>Groom Name:</span> {data.groomName || "N/A"}
                    </div>
                  </>
                )}
              <div className="detail-item"><span>Phone:</span> {data.phone || "N/A"}</div>
              <div className="detail-item"><span>Email:</span> {data.email || "N/A"}</div>
              <div className="detail-item"><span>Address:</span> {data.address || "N/A"}</div>
              <div className="detail-item"><span>No. of Guests:</span> {data.noofGuests ?? 0}</div>
              <div className="detail-item">
                <span>Furniture:</span> {data.furnitureRequired ? data.furnitureDetails || "Yes" : "No"}
              </div>
            </div>

            {/* Booking Details */}
            <div className="col-md-6 ps-md-4">
              <h6 className="section-title">Booking Details</h6>
              <div className="detail-item"><span>Category:</span> {data.category || "N/A"}</div>
              <div className="detail-item"><span>Hall:</span> {data.hall || "N/A"}</div>
              <div className="detail-item"><span>Date:</span> {data.eventDate || "N/A"}</div>
              <div className="detail-item"><span>Time Slot:</span> {data.timeSlot || "N/A"}</div>
              <div className="detail-item"><span>Slot:</span> {data.startTime || "N/A"} - {data.endTime || "N/A"}</div>
              <div className="detail-item"><span>Duration:</span> {data.duration || 0} hours</div>
            </div>
          </div>

          {/* Referral Section */}
          {data.referralName && (
            <div className="referral-box mb-4 p-2 bg-light rounded">
              <h6 className="section-title px-2">Referral Information</h6>
              <div className="detail-item"><span>Name:</span> {data.referralName}</div>
              <div className="detail-item"><span>Phone:</span> {data.referralPhone}</div>
              <div className="detail-item"><span>Email:</span> {data.referralEmail || "N/A"}</div>
            </div>
          )}

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
  <td>
    {invoice.isCustom
      ? "Custom Booking Amount"
      : `Base Rent (${invoice.hours} hours @ ₹${safe(invoice.base_price_per_hour)}/hr)`
    }
  </td>
  <td className="text-end">₹ {safe(invoice.baseAmount)}</td>
</tr>


                {invoice.fixedCharges.length > 0 && (
                  <>
                    <tr className="table-group-divider">
                      <td colSpan="2" className="fw-bold pt-3">Fixed Charges</td>
                    </tr>
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
              ← Modify Details
            </button>
            <button
            className="btn btn-primary btn-lg px-5 shadow-sm confirm-btn"
            onClick={confirmBooking}
            disabled={confirmLoading}
          >
            {confirmLoading ? "Processing..." : "Confirm & Book Now"}
          </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceStep;
