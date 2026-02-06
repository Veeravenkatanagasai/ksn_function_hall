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
  BsReceipt,
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
    <div className="admin-dashboard-container">
      <Sidebar />

      <main className="admin-dashboard-main">
        <Header filters={filters} setFilters={setFilters} />

        <section className="admin-dashboard-grid">
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

        <section className="admin-dashboard-actions">
          <div className="admin-dashboard-actions-card">
            <h5>Quick Actions</h5>

            <div className="admin-dashboard-actions-buttons">
              <button onClick={() => navigate("/bookings")}>
                <BsCalendarCheck /> View Bookings
              </button>

              <button onClick={() => navigate("/paymentanalytics")}>
                <BsCurrencyRupee /> View Revenue
              </button>

              <button onClick={() => navigate("/bills")}>
                <BsReceipt /> View Bills
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;