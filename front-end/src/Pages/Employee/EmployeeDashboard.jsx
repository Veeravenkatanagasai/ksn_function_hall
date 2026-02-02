import React, { useEffect, useState } from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { FaTools, FaFileInvoiceDollar, FaImages, FaSignOutAlt, FaIdCard, FaThLarge } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import Sidebar from "../../Components/Employee/Sidebar";

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const navigate = useNavigate();

useEffect(() => {
  api.get("/employees/profile")
    .then(res => setSelectedEmployee(res.data))
    .catch(() => navigate("/employee-login"));
}, []);


  const logout = async () => {
  try {
    await api.post("/auth/logout");
    navigate("/");
  } catch (err) {
    console.error(err);
    alert("Logout failed");
  }
};



  if (!selectedEmployee) return null;

  return (
    // 1. Flex wrapper to hold Sidebar and Content side-by-side
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      
      {/* LEFT SIDE: Sidebar */}
      <div style={{ width: "250px", minWidth: "250px" }}>
        <Sidebar />
      </div>

      {/* RIGHT SIDE: Remaining Part (Main Content) */}
      <div className="flex-grow-1 p-4">
        
        {/* ================= HEADER ================= */}
        <div className="bg-white p-3 rounded-4 shadow-sm d-flex justify-content-between align-items-center mb-4 border">
          <h4 className="mb-0">
            Welcome, <span className="text-primary">{selectedEmployee.emp_name}</span>!
          </h4>
          <Button variant="danger" className="d-flex align-items-center gap-2" onClick={logout}>
            <FaSignOutAlt /> Logout
          </Button>
        </div>

        {/* ================= PROFILE SNAPSHOT ================= */}
        <Card className="mb-4 border-0 shadow-sm rounded-4">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center gap-2 mb-3 text-secondary">
              <FaIdCard />
              <h5 className="mb-0">Your Profile Snapshot</h5>
            </div>
            <div className="row">
              <div className="col-md-4">
                <p className="mb-1"><b>Name:</b> {selectedEmployee.emp_name}</p>
              </div>
              <div className="col-md-4 text-md-center">
                <p className="mb-1">
                  <b>Role:</b>{" "}
                  <Badge bg="primary" className="px-3 py-2 rounded-pill">
                    {selectedEmployee.emp_role}
                  </Badge>
                </p>
              </div>
              <div className="col-md-4 text-md-end">
                <p className="mb-1"><b>Employee ID:</b> {selectedEmployee.emp_id}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-4">
                <p className="mb-1"><b>Email:</b> {selectedEmployee.emp_email}</p>
              </div>
              <div className="col-md-4 text-md-center">
                <p className="mb-1"><b>Phone:</b> {selectedEmployee.emp_phone}</p>
              </div>
              <div className="col-md-4 text-md-end">
                <p className="mb-1"><b>Username:</b> {selectedEmployee.username}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-4">
                <p className="mb-1"><b>Last Login:</b> {selectedEmployee.last_login}</p>
              </div>
              <div className="col-md-4 text-md-end">
                <p className="mb-1"><b>Login Count:</b> {selectedEmployee.login_count}</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* ================= QUICK ACCESS ================= */}
        <div className="d-flex align-items-center gap-2 mb-3 text-dark">
            <FaThLarge />
            <h5 className="mb-0">Quick Access Modules</h5>
        </div>

        <div className="row g-4">
          {[
            { title: "Bills", icon: <FaFileInvoiceDollar size={40} />, linkText: "update Bills", linkPath: "/employeebill" },
            { title: "Gallery", icon: < FaImages size={40} />, linkText: "update Gallery", linkPath: "/gallery" },
            { title: "Maintenance-Bills", icon: <FaTools size={40} />, linkText: "update Bills", linkPath: "/employeemaintenancebill" },
          ].map((item, index) => (
            <div className="col-lg-4 col-md-6" key={index}>
              <Card className="text-center border-0 shadow-sm h-100 rounded-4 py-4 hover-shadow transition">
                <Card.Body>
                  <div className="text-primary mb-3">{item.icon}</div>
                  <h5 className="fw-bold">{item.title}</h5>
                  <Button
                variant="link"
                className="text-decoration-none p-0"
                onClick={() => navigate(item.linkPath)}
              >
                {item.linkText} →
              </Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;