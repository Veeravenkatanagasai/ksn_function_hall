import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../services/api";
import "./EmployeeLogin.css";

const EmployeeLogin = () => {
  const [emp_email, setEmpEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { emp_email, password });
      
      // Success feedback
      toast.success("Identity Verified. Welcome back!");
      
      localStorage.setItem("emp_role", res.data.employee.emp_role);
      
      // Delay navigation slightly to let the user see the success toast
      setTimeout(() => {
        navigate("/employee-dashboard");
      }, 1500);
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Invalid Credentials. Access Denied.");
    }
  };

  return (
    <main className="auth-master-wrapper">
      <ToastContainer theme="dark" position="top-center" />
      
      <div className="auth-grid">
        {/* Visual Sidebar */}
        <section className="auth-visual d-none d-lg-flex">
          <div className="visual-content animate__animated animate__fadeIn">
            <div className="badge-pill">Secure Access v4.0</div>
            <h1 className="visual-title">Pulse <span className="text-gradient">Core</span></h1>
            <p className="visual-subtitle">Your gateway to the centralized enterprise workflow.</p>
            
            <div className="visual-cards mt-5">
              <div className="mini-card card-anim-1">
                <i className="bi bi-shield-lock-fill text-primary"></i>
                <span>Biometric Encryption</span>
              </div>
              <div className="mini-card card-anim-2">
                <i className="bi bi-cpu-fill text-warning"></i>
                <span>Quantum Syncing</span>
              </div>
            </div>
          </div>
          <div className="mesh-gradient"></div>
        </section>

        {/* Form Content */}
        <section className="auth-form-container">
          <div className="form-box">
            <header className="form-header animate__animated animate__fadeInDown">
              <Link to="/" className="btn-back">
                <i className="bi bi-arrow-left"></i> Home
              </Link>
              <h2 className="display-5 fw-extrabold mt-4">Welcome Back</h2>
              <p className="text-muted">Enter your workspace credentials to continue.</p>
            </header>

            <form onSubmit={handleLogin} className="mt-4 animate__animated animate__fadeInUp">
              <div className="input-field mb-4">
                <label>Corporate Email</label>
                <div className="input-wrapper">
                  <i className="bi bi-envelope-at"></i>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={emp_email}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="input-field mb-4">
                <label>Security Password</label>
                <div className="input-wrapper">
                  <i className="bi bi-key"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password" 
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className={`btn-auth-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                    <div className="d-flex align-items-center justify-content-center gap-2">
                        <span className="spinner-border spinner-border-sm"></span>
                        <span>Authenticating...</span>
                    </div>
                ) : "Sign In to Workspace"}
              </button>
            </form>

            <footer className="form-footer animate__animated animate__fadeIn">
               <p>Trouble logging in? <Link to="/support">Contact IT Desk</Link></p>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
};

export default EmployeeLogin;