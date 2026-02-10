import { useEffect, useState } from "react";
import {
  fetchCategories,
  fetchHalls,
  fetchTimeSlots,
} from "../../services/dropdown";
import { fetchPriceRule } from "../../services/priceRule";
import { fetchBlockedDates } from "../../services/booking";
import DatePicker from "react-datepicker";
import { jwtDecode } from "jwt-decode";
import "react-datepicker/dist/react-datepicker.css";
import "./Booking.css";

const BookingStep = ({ data, setData, onBack, onNext }) => {
  const [categories, setCategories] = useState([]);
  const [halls, setHalls] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [errors, setErrors] = useState({});

  /* ---------- Role ---------- */
  const token =
    localStorage.getItem("adminToken") ||
    localStorage.getItem("employeeToken");

  const userRole = (() => {
    try {
      return token ? jwtDecode(token)?.role?.toLowerCase() : "employee";
    } catch {
      return "employee";
    }
  })();

  /* ---------- Load dropdowns ---------- */
  useEffect(() => {
    (async () => {
      setCategories(await fetchCategories());
      setHalls(await fetchHalls());
      setTimeSlots(await fetchTimeSlots());
    })();
  }, []);

  /* ---------- Fetch price rule (ONLY YES) ---------- */
  useEffect(() => {
    if (
      data.pricingRule === "YES" &&
      data.category &&
      data.hall &&
      data.timeSlot &&
      data.eventDate
    ) {
      fetchPriceRule({
        category: data.category,
        hall: data.hall,
        timeSlot: data.timeSlot,
        date: data.eventDate,
      })
        .then((rule) =>
          setData((p) => ({
            ...p,
            startTime: rule.start_time || "",
            endTime: rule.end_time || "",
          }))
        )
        .catch(() => {
          alert("No price rule found");
          setData((p) => ({
            ...p,
            startTime: "",
            endTime: "",
            duration: "",
          }));
        });
    }
  }, [data.pricingRule, data.category, data.hall, data.timeSlot, data.eventDate]);

  /* ---------- Duration ---------- */
  useEffect(() => {
    if (!data.startTime || !data.endTime) {
      setData((p) => ({ ...p, duration: "" }));
      return;
    }

    const start = new Date(`2025-01-01T${data.startTime}`);
    let end = new Date(`2025-01-01T${data.endTime}`);
    if (end < start) end.setDate(end.getDate() + 1);

    setData((p) => ({
      ...p,
      duration: ((end - start) / 36e5).toFixed(2),
    }));
  }, [data.startTime, data.endTime]);

  /* ---------- Blocked dates ---------- */
  useEffect(() => {
    if (data.hall && data.timeSlot) {
      fetchBlockedDates({ hall: data.hall, timeSlot: data.timeSlot }).then(
        (dates) =>
          setBlockedDates(
            dates.map((d) => {
              const [y, m, day] = d.split("-");
              return new Date(y, m - 1, day);
            })
          )
      );
    }
  }, [data.hall, data.timeSlot]);

  /* ---------- Validation ---------- */
  const validate = () => {
    const e = {};

    if (!data.pricingRule) e.pricingRule = "Pricing rule required";
    if (!data.eventDate) e.eventDate = "Event date required";
    if (!data.startTime) e.startTime = "Start time required";
    if (!data.endTime) e.endTime = "End time required";
    if (!data.duration) e.duration = "Duration required";

    if (!data.category) e.category = "Category required";
    if (!data.hall) e.hall = "Hall required";
    if (!data.timeSlot) e.timeSlot = "Time slot required";

    if (data.pricingRule === "NO" && !data.totalAmount) {
      e.totalAmount = "Total amount required";
    }

    if (data.discount === "" || data.discount == null) {
      e.discount = "Discount required";
    }

    if (userRole === "employee" && data.discount > 10) {
      e.discount = "Max 10% allowed";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => validate() && onNext();
  const req = () => <span className="text-danger">*</span>;

  /* ---------- UI ---------- */
  return (
    <div className="container p-4 bg-white rounded shadow">
      <div className="row g-4">

        {/* Pricing Rule */}
        <div className="col-md-4">
          <label>Pricing Rule {req()}</label>
          <select
            className="form-control"
            value={data.pricingRule || ""}
            onChange={(e) =>
  setData(prev => ({
    ...prev,
    pricingRule: e.target.value,
    hall: "",
    timeSlot: "",
    startTime: "",
    endTime: "",
    duration: "",
    totalAmount: "",
    discount: 0,
  }))
}

          >
            <option value="">-- Select --</option>
            <option value="YES">Pricing Rule (Auto)</option>
            <option value="NO">Custom Price</option>
          </select>
        </div>

        {/* Category / Slot / Hall */}
        <div className="col-md-4">
          <label>Category {req()}</label>
          <select
            className="form-control"
            value={data.category || ""}
            onChange={(e) =>
              setData({ ...data, category: e.target.value })
            }
          >
            <option value="">-- Select --</option>
            {categories.map((c) => (
              <option key={c.category_name} value={c.category_name}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label>Time Slot {req()}</label>
          <select
            className="form-control"
            value={data.timeSlot || ""}
            onChange={(e) =>
              setData({ ...data, timeSlot: e.target.value })
            }
          >
            <option value="">-- Select --</option>
            {timeSlots.map((s) => (
              <option key={s.slot_name} value={s.slot_name}>
                {s.slot_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label>Hall {req()}</label>
          <select
            className="form-control"
            value={data.hall || ""}
            onChange={(e) =>
              setData({ ...data, hall: e.target.value })
            }
          >
            <option value="">-- Select --</option>
            {halls.map((h) => (
              <option key={h.hall_name} value={h.hall_name}>
                {h.hall_name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="col-md-4">
          <label>Event Date {req()}</label>
          <DatePicker
            className="form-control"
            selected={data.eventDate ? new Date(data.eventDate) : null}
            onChange={(d) =>
              setData({ ...data, eventDate: d.toLocaleDateString("en-CA") })
            }
            excludeDates={blockedDates}
            minDate={new Date()}
          />
        </div>

        {/* Time */}
        <div className="col-md-4">
          <label>Start Time {req()}</label>
          <input
            type="time"
            className="form-control"
            value={data.startTime || ""}
            readOnly={data.pricingRule === "YES"}
            onChange={(e) =>
              setData({ ...data, startTime: e.target.value })
            }
          />
        </div>

        <div className="col-md-4">
          <label>End Time {req()}</label>
          <input
            type="time"
            className="form-control"
            value={data.endTime || ""}
            onChange={(e) =>
              setData({ ...data, endTime: e.target.value })
            }
          />
        </div>

        <div className="col-md-4">
          <label>Duration (hrs)</label>
          <input className="form-control" readOnly value={data.duration || ""} />
        </div>

        {/* Custom Amount */}
        {data.pricingRule === "NO" && (
          <div className="col-md-4">
            <label>Total Amount {req()}</label>
            <input
              type="number"
              className="form-control"
              value={data.totalAmount || ""}
              onChange={(e) =>
                setData({ ...data, totalAmount: e.target.value })
              }
            />
          </div>
        )}

        {/* Discount */}
        <div className="col-md-4">
          <label>
            Discount (%) {req()}
            {userRole === "employee" && (
              <small className="text-muted ms-2">(Max 10%)</small>
            )}
          </label>
          <input
            type="number"
            className="form-control"
            max={userRole === "admin" ? 100 : 10}
            value={data.discount}
            onChange={(e) =>
              setData({
                ...data,
                discount: Math.min(
                  Number(e.target.value) || 0,
                  userRole === "admin" ? 100 : 10
                ),
              })
            }
          />
        </div>
      </div>

      <div className="d-flex justify-content-between mt-5">
        <button className="btn btn-outline-secondary" onClick={onBack}>
          ← Back
        </button>
        <button className="btn btn-warning fw-bold" onClick={handleNext}>
          Generate Order →
        </button>
      </div>
    </div>
  );
};

export default BookingStep;
