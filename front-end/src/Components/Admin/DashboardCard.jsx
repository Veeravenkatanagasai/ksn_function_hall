import { Link } from "react-router-dom";
import { BsArrowRightShort } from "react-icons/bs"; // Extra symbol for hover
import "./DashboardCard.css";

const DashboardCard = ({ title, value, icon: Icon, subtitle, link, variant }) => {
  return (
    <Link to={link} className="dashboard-card-wrapper h-100 text-decoration-none">
      <div className={`dashboard-card shadow-sm border-0 p-4 rounded-4 bg-white h-100`}>
        {/* Top Section: Title & Icon */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="card-title-text mb-0">{title}</h4>
          <div className={`card-icon-box ${variant}`}>
            <Icon size={22} />
          </div>
        </div>

        {/* Middle Section: Value */}
        <div className="card-body-section">
          <h2 className="card-value-text fw-bold mb-2">{value}</h2>
        </div>

        {/* Bottom Section: Subtitle & Symbol */}
        <div className="card-footer-section pt-2 border-top mt-3 d-flex justify-content-between align-items-center">
          <p className="card-subtitle-text mb-0 text-muted small">
            {subtitle}
          </p>
          <BsArrowRightShort className="hover-arrow" size={20} />
        </div>
      </div>
    </Link>
  );
};

export default DashboardCard;