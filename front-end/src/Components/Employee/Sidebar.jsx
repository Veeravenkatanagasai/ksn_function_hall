import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  CreditCard, 
  FileText, 
  Zap, 
  ImageIcon,
  ChevronRight
} from "lucide-react"; // Modern lightweight icons
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation(); // To highlight active link

  const menuItems = [
    { path: "/employee-dashboard", name: "Overview", icon: <LayoutDashboard size={20} /> },
    { path: "/booking", name: "Bookings", icon: <FileText size={20} /> },
    { path: "/bookings", name: "View Bookings", icon: <FileText size={20} /> },
    { path: "/employee-vendors", name: "Vendors", icon: <Users size={20} /> },
    { path: "/employee-services", name: "Services", icon: <UserCircle size={20} /> },
    { path: "/employee-contacts", name: "Contacts", icon: <UserCircle size={20} /> },
    { path: "/employee-staff", name: "Staff", icon: <Users size={20} /> },
    { path: "/employeemaintenancebill", name: "Maintenance Bill", icon: <CreditCard size={20} /> },
    { path: "/gallery", name: "Gallery", icon: <ImageIcon size={20} /> },
    { path: "/employeebill", name: "Bills", icon: <FileText size={20} /> }
  ];

  return (
    <aside className="sidebar-wrapper d-flex flex-column shadow-lg">
      {/* Brand Header */}
      <div className="sidebar-brand p-4">
        <small className="text-white-50 fw-bold">Employee Portal</small>
      </div>

      <hr className="sidebar-divider mx-4" />

      {/* Navigation Links */}
      <ul className="nav nav-pills flex-column mb-auto px-3 py-2">
        {menuItems.map((item) => (
          <li className="nav-item mb-2" key={item.path}>
            <Link
              to={item.path}
              className={`nav-link d-flex align-items-center justify-content-between ${
                location.pathname === item.path ? "active-link" : "inactive-link"
              }`}
            >
              <div className="d-flex align-items-center gap-3">
                {item.icon}
                <span>{item.name}</span>
              </div>
              <ChevronRight size={14} className="chevron" />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
