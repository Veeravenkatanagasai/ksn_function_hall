import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Link } from "react-router-dom";
import "./PaymentAnalytics.css";

/* ================= COLORS ================= */

// Inflow colors
const COLORS_INFLOW = ["#4CAF50", "#2312db"];

// Net revenue colors
const COLORS_NET = ["#2E7D32", "#C62828"];

// Outflow category colors
const OUTFLOW_COLOR_MAP = {
  CLEANING: "#1E88E5",
  ELECTRICITY: "#FB8C00",
  SECURITY: "#8E24AA",
  PLUMBING: "#43A047",

  "Referral Commission": "#E53935",
  "Cancellation Refunds": "#6D4C41",
  "Total Bills": "#1976D2"
};

const DEFAULT_OUTFLOW_COLOR = "#9E9E9E";

/* ================= COMPONENT ================= */

const PaymentAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [closedBookings, setClosedBookings] = useState([]);

  const fetchAnalytics = async (fromDate = "", toDate = "", booking_id = "") => {
    const res = await api.get("/payments/payment-analytics", 
      { params: { from: fromDate, to: toDate, booking_id } }
    );

    setAnalytics(res.data);
    setClosedBookings(res.data.closedBookings || []);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (!analytics) return <p>Loading analytics...</p>;

  /* ================= STATUS ================= */

  const bookingStatus = bookingId
    ? analytics.inflows.total_amount > 0
      ? "CLOSED"
      : "CANCELLED"
    : null;

  /* ================= INFLOWS ================= */

  const inflowData = bookingId
    ? bookingStatus === "CLOSED"
      ? [
          {
            name: "Booking Income",
            value: analytics.inflows.total_amount
          }
        ]
      : [
          {
            name: "Cancellation Charges",
            value: analytics.inflows.cancellation_charges
          }
        ]
    : [
        {
          name: "Booking Income",
          value: analytics.inflows.total_amount
        },
        {
          name: "Cancellation Charges",
          value: analytics.inflows.cancellation_charges
        }
      ];

  /* ================= OUTFLOWS ================= */

  const outflowData = bookingId
    ? bookingStatus === "CLOSED"
      ? [
                 ...(analytics.billCategories || [])
          .filter(cat => Number(cat.value) > 0)
          .map(cat => ({
            name: cat.name,
            value: Number(cat.value)
          })),

        // referral
        analytics.outflows.referral_commission > 0 && {
          name: "Referral Commission",
          value: analytics.outflows.referral_commission
        }
      ].filter(Boolean)
      :[
          {
            name: "Cancellation Refunds",
            value: analytics.outflows.cancellation_refunds
          }
        ]
    : [
        {
          name: "Total Bills",
          value: analytics.outflows.total_bill_amount
        },
        {
          name: "Referral Commission",
          value: analytics.outflows.referral_commission
        },
        {
          name: "Cancellation Refunds",
          value: analytics.outflows.cancellation_refunds
        },
        {
        name: "Maintenance Payments",
        value: analytics.outflows.maintenance_payments
      }
      ];

  /* ================= NET ================= */

  const netRevenueData = [
    { name: "Inflows", value: analytics.inflows.total },
    { name: "Outflows", value: analytics.outflows.total }
  ];

  /* ================= PIE RENDER ================= */

  const renderPie = (data, title, total, useCategoryColors = false, customColors = null) => {
  const filteredData = data.filter(d => d.value > 0);

  return (
    <div className="pie-chart-container">
      <h3 className="pie-title">{title}</h3>

      {total !== undefined && (
        <h4 className="pie-total">
          ₹ {Number(total).toLocaleString("en-IN")}
        </h4>
      )}

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={filteredData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            labelLine={true}
            label={({ name, value }) =>
              `${name}: ₹${value.toLocaleString("en-IN")}`
            }
          >
            {filteredData.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  customColors
                    ? customColors[index % customColors.length] // use custom color array
                    : useCategoryColors
                    ? OUTFLOW_COLOR_MAP[entry.name] || DEFAULT_OUTFLOW_COLOR
                    : COLORS_INFLOW[index % COLORS_INFLOW.length]
                }
              />
            ))}
          </Pie>
          <Tooltip formatter={v => `₹${v.toLocaleString("en-IN")}`} />
          <Legend verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

  /* ================= UI ================= */

  return (
    <div className="payment-analytics-page">
    {/* Fixed Header */}
    <div className="payment-header">
      <h2 className="payment-title">Payment Analytics Dashboard</h2>

      <Link to="/dashboard" className="btn btn-outline-light">
        ← Back to Dashboard
      </Link>
    </div>

    {/* Page Content */}
    <div className="payment-content">
      <p className="payment-subtitle">
        Inflows, Outflows, and Net Revenue visualization
      </p>

      {/* Filters */}
      <div className="payment-filters">
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} />

        <div className="payment-booking-filter">
          <select value={bookingId} onChange={e => setBookingId(e.target.value)}>
            <option value="">All Bookings</option>
            {closedBookings.map(id => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>

          {bookingStatus && (
            <span
              className={`payment-status-badge ${
                bookingStatus === "CLOSED" ? "closed" : "cancelled"
              }`}
            >
              {bookingStatus}
            </span>
          )}
        </div>

        <button onClick={() => fetchAnalytics(from, to, bookingId)}>
          Apply
        </button>

        <button
          onClick={() => {
            setFrom("");
            setTo("");
            setBookingId("");
            fetchAnalytics();
          }}
        >
          Reset
        </button>
      </div>

      {/* Charts */}
      <div className="charts-row">
        {renderPie(inflowData, "🟢 Inflows", analytics.inflows.total)}
        {renderPie(outflowData, "🔴 Outflows", analytics.outflows.total, true)}
      </div>

      {/* Net Revenue below */}
        <div className="net-revenue-container">
        {renderPie(netRevenueData, "🔵 Net Revenue", undefined, false, COLORS_NET)}
        </div>


      <h2 className="total-net-revenue">
        💰 Total Net Revenue: ₹
        {(analytics.totalRevenue ?? 0).toLocaleString("en-IN")}
      </h2>
    </div>
    </div>
  );
};

export default PaymentAnalytics;
