import { Link } from "react-router-dom";
import { BsArrowRightShort } from "react-icons/bs";
import "./DashboardCard.css";

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  link,
  variant = "primary",
}) => {
  return (
    <Link to={link} className="dc-wrapper">
      <div className="dc-card">
        {/* Header */}
        <div className="dc-header">
          <h4 className="dc-title">{title}</h4>
          <div className={`dc-icon ${variant}`}>
            <Icon size={22} />
          </div>
        </div>

        {/* Value */}
        <div className="dc-body">
          <h2 className="dc-value">{value}</h2>
        </div>

        {/* Footer */}
        <div className="dc-footer">
          <span className="dc-subtitle">{subtitle}</span>
          <BsArrowRightShort className="dc-arrow" size={22} />
        </div>
      </div>
    </Link>
  );
};

export default DashboardCard;
