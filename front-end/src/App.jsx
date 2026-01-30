import React from "react";
import {Routes, Route,Navigate } from "react-router-dom";

import Home from "./Pages/Home/Home";
import AdminLogin from "./Pages/Admin/AdminLogin";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import Booking from "./Pages/Booking/Booking";
import PriceMaster from "./Pages/Dashboard/HallPricing/PriceMaster";
import ShowBookings from "./Pages/Dashboard/Booking/showbookings";
import EmployeeLogin from "./Pages/Employee/EmployeeLogin";
import EmployeeDashboard from "./Pages/Employee/EmployeeDashboard";
import Employees from "./Pages/Employee/Employee";
import SaveContact from "./Pages/Dashboard/Contacts/SaveContacts";
import Staff from "./Pages/Dashboard/Contacts/Staff";
import Vendor from "./Pages/Dashboard/Services/Vendors";
import DashboardServices from "./Pages/Dashboard/Services/Services";
import ReferralCommission from "./Pages/Dashboard/Booking/ReferralCommission";
import Payments from "./Pages/Booking/Payment";
import EmployeeVendors from "./Pages/Employee/EmployeeDashboard/EmployeeVendors";
import EmployeeServices from "./Pages/Employee/EmployeeDashboard/EmployeeServices";
import EmployeeSaveContact from "./Pages/Employee/EmployeeDashboard/EmployeeSaveContacts";
import EmployeeStaff from "./Pages/Employee/EmployeeDashboard/Staff";
import ElectricityBill from "./Pages/Employee/EmployeeDashboard/Electricity";
import GalleryUpload from "./Pages/Dashboard/Booking/GalleryUpload";
import BillsUpload from "./Pages/Dashboard/Booking/BillsUpload";
import PaymentAnalytics from "./Pages/Dashboard/Booking/PaymentAnalytics";
import MaintenanceBill from "./Pages/Employee/EmployeeDashboard/MaintenceBill";
import MaintenanceBills from "./Pages/Dashboard/MaintenanceBill/MaintenanceBills";
import EmployeeBill from "./Pages/Employee/EmployeeDashboard/EmployeeBill";

/* ================= ADMIN PROTECTED ROUTE ================= */
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin-login" replace />;
};

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
          <Route
          path="/dashboard"
          element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
          }
          />
        <Route path="/booking" element={<Booking />} />
        <Route path="/prices" element={<PriceMaster/>} />
        <Route path="/bookings" element={<ShowBookings />} />
        {/* Employee Routes */}
        <Route path="/employee-login" element={<EmployeeLogin />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/save-contact" element={<SaveContact />} />
        <Route path="/staff" element={<Staff />}/>
        <Route path="/vendors" element={<Vendor />} />
        <Route path="/dashboard-services" element={<DashboardServices />}/>
        <Route path="/referrals" element={<ReferralCommission />} />
        <Route path="/payments/:bookingId" element={<Payments />} />
        <Route path="/employee-vendors"element={<EmployeeVendors/>}  />
        <Route path="/employee-services" element={<EmployeeServices/>} />    
        <Route path="/employee-contacts" element={<EmployeeSaveContact />} />
        <Route path="/employee-staff" element={<EmployeeStaff />} />
        <Route path="/electricity" element={<ElectricityBill/>} />
        <Route path="/gallery" element={<GalleryUpload/>} />
        <Route path="/bills" element={<BillsUpload/>} />
        <Route path="/paymentanalytics" element={<PaymentAnalytics/>} />
        <Route path="/employeemaintenancebill" element={<MaintenanceBill/>} />
        <Route path="/maintenancebill" element={<MaintenanceBills/>}/>
        <Route path="/employeebill" element={<EmployeeBill/>}/>

      </Routes>
  );
}

export default App;
