import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="overlay"></div>

      <div className="container text-center content">
        <h1 className="main-title mb-5">
          Function Hall Management
        </h1>

        <div className="row justify-content-center g-4">
          {/* Admin Card */}
          <div className="col-md-5">
            <div
              className="role-card admin"
              onClick={() => navigate("/admin-login")}
            >
              <h2>Admin</h2>
              <p>Manage employees, bookings, reports and settings</p>
              <button className="btn btn-danger mt-3">
                Admin Login
              </button>
            </div>
          </div>

          {/* Employee Card */}
          <div className="col-md-5">
            <div
              className="role-card employee"
              onClick={() => navigate("/employee-login")}
            >
              <h2>Employee</h2>
              <p>View tasks, update work status and schedules</p>
              <button className="btn btn-primary mt-3">
                Employee Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
