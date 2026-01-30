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



const BookingStep = ({ data, setData, onBack, onNext }) => {
  const [categories, setCategories] = useState([]);
  const [halls, setHalls] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);

  /* ---------- Load dropdowns ---------- */
  useEffect(() => {
    const loadDropdowns = async () => {
      setCategories(await fetchCategories());
      setHalls(await fetchHalls());
      setTimeSlots(await fetchTimeSlots());
    };
    loadDropdowns();
  }, []);

  /* ---------- Fetch price rule from DB ---------- */
  useEffect(() => {
    if (
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
        .then((rule) => {
          setData((p) => ({
            ...p,
            startTime: rule.start_time || "",
            endTime: rule.end_time || "",
          }));
        })
        .catch(() => {
          setData((p) => ({
            ...p,
            startTime: "",
            endTime: "",
            duration: "",
          }));
          alert("No price rule found for this selection");
        });
    }
  }, [data.category, data.hall, data.timeSlot, data.eventDate]);

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

    

  return (
    <div className="container p-4 bg-white rounded shadow">
      <div className="row g-4">

        {/* Category */}
        <div className="col-md-4">
          <label>Category</label>
          <select
            className="form-control"
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
        </div>

        {/* Time Slot */}
        <div className="col-md-4">
          <label>Time Slot</label>
          <select
            className="form-control"
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
        </div>

        {/* Hall */}
        <div className="col-md-4">
          <label>Hall</label>
          <select
            className="form-control"
            value={data.hall}
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

        {/* Event Date */}
        <div className="col-md-4">
  <label>Event Date</label>
  <DatePicker
    className="form-control"
    selected={data.eventDate ? new Date(data.eventDate) : null}
    onChange={(date) =>
      setData({
        ...data,
        eventDate: date.toISOString().split("T")[0],
      })
    }
    excludeDates={blockedDates}   // ✅ DISABLED DATES
    minDate={new Date()}          // optional: no past dates
    placeholderText="Select event date"
    dateFormat="yyyy-MM-dd"
  />
</div>

        {/* Start Time (Fixed from DB) */}
        <div className="col-md-4">
          <label>Start Time</label>
          <input
            type="time"
            className="form-control"
            value={data.startTime || ""}
            readOnly
          />
        </div>

        {/* End Time (Adjustable) */}
        <div className="col-md-4">
          <label>End Time</label>
          <input
            type="time"
            className="form-control"
            value={data.endTime || ""}
            onChange={(e) =>
              setData({ ...data, endTime: e.target.value })
            }
          />
        </div>

        {/* Duration */}
        <div className="col-md-4">
          <label>Duration (hrs)</label>
          <input
            type="text"
            className="form-control"
            value={data.duration || ""}
            readOnly
          />
        </div>

        {/* Discount */}
        <div className="col-md-4">
          <label>Discount (%)</label>
          <input
            type=""
            min="0"
            max="10"
            className="form-control"
            value={data.discount}
            onChange={(e) =>
              setData({
                ...data,
                discount: Math.min(10, Number(e.target.value) || 0),
              })
            }
          />
        </div>
      </div>

      <div className="d-flex justify-content-between mt-5">
        <button className="btn btn-outline-secondary" onClick={onBack}>
          ← Back
        </button>
        <button className="btn btn-warning fw-bold" onClick={onNext}>
          Generate Order →
        </button>
      </div>
    </div>
  );
};

export default BookingStep;
