import { NavLink } from "react-router-dom";
import {
  BsGrid1X2,
  BsCalendarCheck,
  BsCreditCard,
  BsPeople,
  BsGear,
  BsPersonBadge,
  BsTag,
  BsBoxArrowRight,
  BsImages,
  BsReceipt,
} from "react-icons/bs";
import "./Sidebar.css";

const Sidebar = () => {
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: BsGrid1X2 },
    { path: "/booking", label: "Bookings", icon: BsCalendarCheck },
    { path: "/bookings", label: "View Bookings", icon: BsCalendarCheck },
    { path: "/vendors", label: "Vendors", icon: BsPeople },
    { path: "/dashboard-services", label: "Services", icon: BsGear },
    { path: "/staff", label: "Staff Management", icon: BsPersonBadge },
    { path: "/prices", label: "Rules", icon: BsTag },
    { path: "/employees", label: "Employees", icon: BsPersonBadge },
    { path: "/save-contact", label: "Contacts", icon: BsPeople },
    { path: "/referrals", label: "Referrals", icon: BsPeople },
    { path: "/gallery", label: "Gallery", icon: BsImages },
    { path: "/bills", label: "Bills", icon: BsReceipt },
    { path: "/paymentanalytics", label: "Revenue", icon: BsCreditCard },
    { path: "/maintenancebill", label: "Maintenance", icon: BsGear },
  ];

  return (
    <aside className="sb-container">
      <div className="sb-card">
        {/* Brand */}
        <div className="sb-top">
          <h2 className="sb-brand">KSN FUNCTION HALL</h2>
        </div>

        {/* Menu */}
        <nav className="sb-menu">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `sb-link ${isActive ? "sb-active" : ""}`
              }
            >
              <Icon className="sb-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="sb-bottom">
          <button
            className="sb-logout"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            <BsBoxArrowRight />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
