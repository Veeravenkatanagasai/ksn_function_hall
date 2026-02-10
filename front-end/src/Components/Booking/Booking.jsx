import { useEffect, useState } from "react";
import {
  fetchCategories,
  fetchHalls,
  fetchTimeSlots,
} from "../../services/dropdown";
import { fetchPriceRule } from "../../services/priceRule";
import "./Booking.css";
import { fetchBlockedDates } from "../../services/booking";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { jwtDecode } from "jwt-decode";


const BookingStep = ({ data, setData, onBack, onNext }) => {
  const [categories, setCategories] = useState([]);
  const [halls, setHalls] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [errors, setErrors] = useState({});
  const [usePricingRule, setUsePricingRule] = useState(true);
  const [customBasePrice, setCustomBasePrice] = useState("");

  const adminToken = localStorage.getItem("adminToken");
const employeeToken = localStorage.getItem("employeeToken");

const token = adminToken || employeeToken;

let userRole = "employee";

if (token) {
  try {
    const decoded = jwtDecode(token);
    userRole = decoded?.role?.toLowerCase() || "employee";
  } catch (err) {
    console.error("❌ Invalid token:", err);
  }
}
  /* ---------- Load dropdowns ---------- */
  useEffect(() => {
    const loadDropdowns = async () => {
      setCategories(await fetchCategories());
      setHalls(await fetchHalls());
      setTimeSlots(await fetchTimeSlots());
    };
    loadDropdowns();
  }, []);

  /* Fetch price rule from DB if using default pricing */
  useEffect(() => {
    if (usePricingRule && data.category && data.hall && data.timeSlot && data.eventDate) {
      fetchPriceRule({
        category: data.category,
        hall: data.hall,
        timeSlot: data.timeSlot,
        date: data.eventDate,
      })
        .then((rule) => {
          setData((p) => ({
            ...p,
            startTime: rule.start_time || "",
            endTime: rule.end_time || "",
            basePricePerHour: rule.base_price_per_hour || 0,
          }));
        })
        .catch(() => {
          alert("No price rule found for this selection");
          setData((p) => ({
            ...p,
            startTime: "",
            endTime: "",
            duration: "",
            basePricePerHour: 0,
          }));
        });
    }
  }, [data.category, data.hall, data.timeSlot, data.eventDate, usePricingRule]);


  /* ---------- Duration calculation ---------- */
  useEffect(() => {
    if (data.startTime && data.endTime) {
      const start = new Date(`2025-01-01T${data.startTime}`);
      let end = new Date(`2025-01-01T${data.endTime}`);

      // Handle overnight booking
      if (end < start) end.setDate(end.getDate() + 1);

      const hours = ((end - start) / 36e5).toFixed(2);
      setData((p) => ({ ...p, duration: hours }));
    } else {
      setData((p) => ({ ...p, duration: "" }));
    }
  }, [data.startTime, data.endTime]);

  useEffect(() => {
  if (data.hall && data.timeSlot) {
    fetchBlockedDates({
      hall: data.hall,
      timeSlot: data.timeSlot,
    }).then((dates) => {
      setBlockedDates(
        dates.map(d => {
          const [y, m, day] = d.split("-");
          return new Date(y, m - 1, day);
        })
      );
    });
  }
}, [data.hall, data.timeSlot]);

  const validate = () => {
  const e = {};

  if (!data.category) e.category = "Category is required";
  if (!data.timeSlot) e.timeSlot = "Time slot is required";
  if (!data.hall) e.hall = "Hall is required";
  if (!data.eventDate) e.eventDate = "Event date is required";
  if (!data.startTime) e.startTime = "Start time is required";
  if (!data.endTime) e.endTime = "End time is required";
  if (!data.duration) e.duration = "Duration is required";

  if (data.discount === "" || data.discount == null) {
    e.discount = "Discount is required";
  }

  if (userRole === "employee" && data.discount > 10) {
    e.discount = "Employees can give max 10% discount";
  }
if (!usePricingRule && (!customBasePrice || customBasePrice <= 0)) {
      e.basePricePerHour = "Enter base price per hour";
    }
  setErrors(e);
  return Object.keys(e).length === 0;
};



const handleNext = () => {
  if (!validate()) return;

  const updatedData = {
    ...data,
    basePricePerHour: usePricingRule ? data.basePricePerHour : Number(customBasePrice),
    usePricingRule,
  };

  setData(updatedData);  
  onNext(updatedData);   
};

const isFormComplete =
  data.category &&
  data.timeSlot &&
  data.hall &&
  data.eventDate &&
  data.startTime &&
  data.endTime &&
  data.duration &&
  data.discount !== "" &&
  data.discount !== null &&
  data.discount !== undefined&&
  (usePricingRule || customBasePrice);



const req = (msg) => <span className="text-danger ms-1">*</span>;
    

  return (
    <div className="container p-4 bg-white rounded shadow">
      <div className="row g-4">

        {/* Category */}
        <div className="col-md-4">
          <label>Category {req()}</label>
          <select
            className={`form-control ${errors.category ? "is-invalid" : ""}`}
            value={data.category}
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
          <div className="invalid-feedback">{errors.category}</div>
        </div>

        {/* Time Slot */}
        <div className="col-md-4">
          <label>Time Slot {req()}</label>
          <select
            className={`form-control ${errors.timeSlot ? "is-invalid" : ""}`}
            value={data.timeSlot}
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
          <div className="invalid-feedback">{errors.timeSlot}</div>
        </div>

        {/* Hall */}
        <div className="col-md-4">
          <label>Hall {req()}</label>
          <select
            className={`form-control ${errors.hall ? "is-invalid" : ""}`}
            value={data.hall}
            disabled={!data.category}
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
          <div className="invalid-feedback">{errors.hall}</div>
        </div>

        {/* Event Date */}
        <div className="col-md-4">
  <label>Event Date {req()}</label>
  <DatePicker
    className={`form-control ${errors.eventDate ? "is-invalid" : ""}`}
    selected={data.eventDate ? new Date(data.eventDate) : null}
    disabled={!data.hall || !data.timeSlot}
    onChange={(date) =>
      setData({
        ...data,
        eventDate: date.toLocaleDateString("en-CA"),
      })
    }
    excludeDates={blockedDates}   // ✅ DISABLED DATES
    minDate={new Date()}          // optional: no past dates
    placeholderText="Select event date"
    dateFormat="yyyy-MM-dd"
  />
  <div className="invalid-feedback d-block">{errors.eventDate}</div>
</div>

        {/* Start Time (Fixed from DB) */}
        <div className="col-md-4">
          <label>Start Time {req()}</label>
          <input
            type="time"
            className={`form-control ${errors.startTime ? "is-invalid" : ""}`}
            value={data.startTime || ""}
            readOnly
          />
          <div className="invalid-feedback">{errors.startTime}</div>
        </div>

        {/* End Time (Adjustable) */}
        <div className="col-md-4">
          <label>End Time {req()}</label>
          <input
            type="time"
           className={`form-control ${errors.endTime ? "is-invalid" : ""}`}
            value={data.endTime || ""}
            onChange={(e) =>
              setData({ ...data, endTime: e.target.value })
            }
          />
          <div className="invalid-feedback">{errors.endTime}</div>
        </div>

        {/* Duration */}
        <div className="col-md-4">
          <label>Duration (hrs) {req()}</label>
          <input
            type="text"
            className={`form-control ${errors.duration ? "is-invalid" : ""}`}
            value={data.duration || ""}
            readOnly
          />
          <div className="invalid-feedback">{errors.duration}</div>
        </div>

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
              min="0"
              max={userRole === "admin" ? 100 : 10}
              className={`form-control ${errors.discount ? "is-invalid" : ""}`}
              value={data.discount}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                const max = userRole === "admin" ? 100 : 10;

                setData({
                  ...data,
                  discount: Math.min(value, max),
                });
              }}
            />

          <div className="invalid-feedback">{errors.discount}</div>
        </div>
         {/* Pricing Rule Radio */}
        <div className="col-12 mt-3">
          <label>Use Default Pricing Rule?</label>
          <div>
            <input
              type="radio"
              id="pricing-yes"
              name="pricingRule"
              checked={usePricingRule}
              onChange={() => setUsePricingRule(true)}
            />
            <label htmlFor="pricing-yes" className="ms-2 me-3">Yes</label>

            <input
              type="radio"
              id="pricing-no"
              name="pricingRule"
              checked={!usePricingRule}
              onChange={() => setUsePricingRule(false)}
            />
            <label htmlFor="pricing-no" className="ms-2">No (Custom Price)</label>
          </div>
        </div>

        {/* Custom Base Price Input */}
        {!usePricingRule && (
          <div className="col-md-4 mt-3">
            <label>Base Price Per Hour {req()}</label>
            <input
              type="number"
              className={`form-control ${errors.basePricePerHour ? "is-invalid" : ""}`}
              value={customBasePrice}
              onChange={(e) => setCustomBasePrice(e.target.value)}
            />
            <div className="invalid-feedback">{errors.basePricePerHour}</div>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-between mt-5">
        <button className="btn btn-outline-secondary" onClick={onBack}>
          ← Back
        </button>
        <button
          className="btn btn-warning fw-bold"
          onClick={handleNext}
          disabled={!isFormComplete}
        >
          Generate Order →
        </button>

      </div>
    </div>
  );
};

export default BookingStep;
