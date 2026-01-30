// src/pages/Admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Admin/Sidebar";
import Header from "../../Components/Admin/Header";
import DashboardCard from "../../Components/Admin/DashboardCard";
import {
  BsCalendarCheck,
  BsPeople,
  BsTools,
  BsCurrencyRupee,
} from "react-icons/bs";
import { getDashboardStats } from "../../services/dashboard";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
  });

  const [stats, setStats] = useState({
    bookings: 0,
    vendors: 0,
    services: 0,
    revenue: 0,
  });

  // 🔐 Auth check
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  // 📊 Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardStats(filters);
       setStats({
          bookings: data?.bookings ?? 0,
          vendors: data?.vendors ?? 0,
          services: data?.services ?? 0,
          revenue: data?.revenue ?? 0,
    });
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      }
    };
    fetchData();
  }, [filters]);

  return (
    <div className="admin-container">
      <Sidebar />

      <main className="main-content">
        <Header filters={filters} setFilters={setFilters} />

        {/* DASHBOARD CARDS */}
        <section className="stats-grid">
  <DashboardCard
    title="Total Bookings"
    value={stats.bookings}
    icon={BsCalendarCheck}
    subtitle="Recent bookings shown in Bookings page"
    link="/bookings"
    variant="primary"
  />

  <DashboardCard
    title="Total Vendors"
    value={stats.vendors}
    icon={BsPeople}
    subtitle="Manage vendors from Vendors section"
    link="/vendors"
    variant="success"
  />

  <DashboardCard
    title="Total Services"
    value={stats.services}
    icon={BsTools}
    subtitle="Available services overview"
    link="/dashboard-services"
    variant="warning"
  />

</section>


      {/* QUICK ACTIONS */}
<section className="quick-actions mt-4">
  <div className="card p-4 shadow-sm border-0 rounded-4">
    <h5 className="mb-3 fw-bold">Quick Actions</h5>

    <div className="d-flex flex-wrap gap-2">
      <button
        className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
        onClick={() => navigate("/bookings")}
      >
        <BsCalendarCheck /> View Bookings
      </button>

    </div>
  </div>
</section>

      </main>
    </div>
  );
};

export default AdminDashboard;
