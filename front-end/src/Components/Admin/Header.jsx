import { useMemo, useState } from "react";
import { BsFilter, BsArrowCounterclockwise, BsClockHistory } from "react-icons/bs";

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
    ? new Date(admin.last_login).toLocaleString()
    : "First Login";

  const [localFilters, setLocalFilters] = useState(filters);

  return (
    <header className="header-modern mb-5">
      <div className="container-fluid p-0">
        <div className="row align-items-center">
          
          {/* LEFT: Welcome Section */}
          <div className="col-lg-6 mb-4 mb-lg-0">
            <h1 className="welcome-title">
              Welcome, <span className="admin-highlight">{adminName}!</span>
            </h1>
            <p className="last-login-tag">
              <BsClockHistory className="me-2 text-primary" />
              Last Login: {lastLogin}
            </p>
          </div>

          {/* RIGHT: Vertical Date Filters */}
          <div className="col-lg-6">
            <div className="filter-card p-3 shadow-sm border-0">
              <div className="row g-2 align-items-center">
                
                {/* Vertical Filter Group */}
                <div className="col-md-5">
                  <div className="vertical-input-group">
                    <label className="filter-label">Filter Data From:</label>
                    <input
                      type="date"
                      className="form-control form-control-sm modern-input"
                      value={localFilters.fromDate}
                      onChange={(e) => setLocalFilters({ ...localFilters, fromDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="vertical-input-group">
                    <label className="filter-label">To:</label>
                    <input
                      type="date"
                      className="form-control form-control-sm modern-input"
                      value={localFilters.toDate}
                      onChange={(e) => setLocalFilters({ ...localFilters, toDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Buttons Container */}
                <div className="col-md-3 d-flex gap-2 align-self-end pb-1">
                  <button className="btn btn-primary btn-sm modern-btn flex-grow-1" onClick={() => setFilters(localFilters)}>
                    <BsFilter className="me-1" /> Filter
                  </button>
                  <button className="btn btn-outline-secondary btn-sm modern-btn" onClick={() => {
                      const empty = { fromDate: "", toDate: "" };
                      setLocalFilters(empty);
                      setFilters(empty);
                    }}>
                    <BsArrowCounterclockwise />
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
