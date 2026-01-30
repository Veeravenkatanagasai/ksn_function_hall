import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Lock, ArrowLeft, ChevronRight, ShieldCheck } from "lucide-react";
import api from "../../services/api";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/admin/login", { email, password });
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Back Button */}
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/")}
        className="back-btn"
      >
        <ArrowLeft size={18} />
        <span>Back to Website</span>
      </motion.button>

      <div className="login-container">
        {/* Left Side: Branding/Visual */}
        <div className="login-visual">
          <div className="visual-overlay"></div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="visual-content"
          >
            <div className="brand-icon">
              <ShieldCheck size={40} strokeWidth={1.5} />
            </div>
            <h1>Control Center</h1>
            <p>Secure administrative access to manage your ecosystem and monitor performance metrics in real-time.</p>
          </motion.div>
        </div>

        {/* Right Side: Form */}
        <div className="login-form-side">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="form-box"
          >
            <div className="form-header">
              <h2>Administrator Login</h2>
              <p>Enter your credentials to access the panel</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="input-field">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <User className="icon" size={18} />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-field">
                <label>Password</label>
                <div className="input-wrapper">
                  <Lock className="icon" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <div className="loader"></div>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>

            <footer className="form-footer">
              <p>&copy; 2025 Enterprise Portals Inc. All rights reserved.</p>
            </footer>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;