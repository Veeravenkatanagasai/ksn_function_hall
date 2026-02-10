import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  CreditCard,
  FileText,
  ImageIcon,
} from "lucide-react";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/employee-dashboard", name: "Overview", icon: <LayoutDashboard size={20} /> },
    { path: "/booking", name: "Bookings", icon: <FileText size={20} /> },
    { path: "/employeeshowbookings", name: "View Bookings", icon: <FileText size={20} /> },
    { path: "/employee-vendors", name: "Vendors", icon: <Users size={20} /> },
    { path: "/employee-services", name: "Services", icon: <UserCircle size={20} /> },
    { path: "/employee-contacts", name: "Contacts", icon: <UserCircle size={20} /> },
    { path: "/employee-staff", name: "Staff", icon: <Users size={20} /> },
    { path: "/employeemaintenancebill", name: "Maintenance Bill", icon: <CreditCard size={20} /> },
    { path: "/gallery", name: "Gallery", icon: <ImageIcon size={20} /> },
    { path: "/employeebill", name: "Bills", icon: <FileText size={20} /> },
  ];

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>Employee Portal</div>

      {/* Menu */}
      <nav className={styles.menu}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.link} ${active ? styles.active : ""}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.text}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
