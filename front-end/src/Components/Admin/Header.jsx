import { useMemo, useState } from "react";
import {
  BsFilter,
  BsArrowCounterclockwise,
  BsClockHistory,
} from "react-icons/bs";
import "./Header.css";

const Header = ({ filters, setFilters }) => {
  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("admin")) || {};
    } catch {
      return {};
    }
  }, []);

  const adminName = admin.name || "Admin";

  const lastLogin = admin.last_login
    ? new Date(admin.last_login + "Z").toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })
    : "First Login";

  const [localFilters, setLocalFilters] = useState(filters);

  const resetFilters = () => {
    const empty = { fromDate: "", toDate: "" };
    setLocalFilters(empty);
    setFilters(empty);
  };

  return (
    <header className="hd-wrapper">
      {/* LEFT */}
      <div className="hd-left">
        <h1 className="hd-title">
          Welcome, <span>{adminName}</span>
        </h1>

        <p className="hd-login">
          <BsClockHistory size={14} />
          <span>Last Login: {lastLogin}</span>
        </p>
      </div>

      {/* RIGHT */}
      <div className="hd-right">
        <div className="hd-filter-card">
          <div className="hd-input">
            <label>From</label>
            <input
              type="date"
              value={localFilters.fromDate}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  fromDate: e.target.value,
                })
              }
            />
          </div>

          <div className="hd-input">
            <label>To</label>
            <input
              type="date"
              value={localFilters.toDate}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  toDate: e.target.value,
                })
              }
            />
          </div>

          <div className="hd-actions">
            <button
              className="hd-btn primary"
              onClick={() => setFilters(localFilters)}
            >
              <BsFilter />
              Filter
            </button>

            <button className="hd-btn ghost" onClick={resetFilters}>
              <BsArrowCounterclockwise />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
