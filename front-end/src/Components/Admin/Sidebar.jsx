import { NavLink } from "react-router-dom";
import { 
  BsGrid1X2, BsCalendarCheck, BsCreditCard,
  BsPeople, BsGear, BsPersonBadge, BsTag, BsBoxArrowRight, 
  BsFileText, BsLightning, BsImages, BsReceipt
} from "react-icons/bs";
import "./Sidebar.css";

const Sidebar = () => {
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <BsGrid1X2 /> },
    { path: "/booking", label: "Bookings", icon: <BsCalendarCheck /> },
    { path: "/bookings", label: "View Bookings", icon: <BsCalendarCheck /> },
    { path: "/vendors", label: "Vendors", icon: <BsPeople /> },
    { path: "/dashboard-services", label: "Services", icon: <BsGear /> },
    { path: "/staff", label: "Staff Management", icon: <BsPersonBadge /> },
    { path: "/prices", label: "Rules", icon: <BsTag /> },
    { path: "/employees", label: "Employees", icon: <BsPersonBadge /> },
    { path: "/save-contact", label: "Contacts", icon: <BsPeople /> },
    { path: "/referrals", label: "Referrals", icon: <BsPeople /> }, 
    { path: "/gallery", label: "Gallery", icon: <BsImages /> },
    { path: "/bills", label: "Bills", icon: <BsReceipt /> },
    { path: "/paymentanalytics", label: "Payments", icon: <BsCreditCard /> },
    { path: "/maintenancebill", label: "Maintenance", icon: <BsGear /> }
  ];

  return (
    <aside className="sidebar-container">
      <div className="dark-floating-sidebar">
        {/* Top Branding Section */}
        <div className="sidebar-top">
          <h2 className="brand-title">KSN FUNCTION HALL</h2>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `menu-link ${isActive ? "active-link" : ""}`}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Logout Section */}
        <div className="sidebar-bottom">
          <button
            className="logout-btn-red w-100"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            <BsBoxArrowRight className="me-2" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
