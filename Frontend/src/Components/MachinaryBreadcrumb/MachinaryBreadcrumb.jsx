
import React from "react";
import { Link } from "react-router-dom";
import "./MachinaryBreadcrumb.css";

// Import your background image
import breadcrumbBg from "../../assets/bg.png";

const MachinaryBreadcrumb = ({
  title = "Machinery & Equipment",
  subtitle = "Explore quality agricultural products and machinery.",
  breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Machinery & Equipment", path: "/machinary" },
  ],
}) => {
  return (
    <section
      className="ProductBreadcrumb"
      style={{ backgroundImage: `url(${breadcrumbBg})` }}
    >
      <div className="Machinary-Breadcrumb-overlay">
        <div className="Machinary-Breadcrumb-container">
          <div className="Machinary-Breadcrumb-content">
            <span className="Machinary-Breadcrumb-small-title">
              FARMTECH AGRO
            </span>

            <h1 className="Machinary-Breadcrumb-title">{title}</h1>

            <p className="Machinary-Breadcrumb-subtitle">{subtitle}</p>

            <nav
              className="Machinary-Breadcrumb-navigation"
              aria-label="Breadcrumb"
            >
              <Link
                to="/"
                className="Machinary-Breadcrumb-link"
              >
                Home
              </Link>

              {breadcrumbs.map((item, index) => (
                <React.Fragment key={`${item.label}-${index}`}>
                  <span className="Machinary-Breadcrumb-separator">›</span>

                  {index === breadcrumbs.length - 1 ? (
                    <span
                      className="Machinary-Breadcrumb-current"
                      aria-current="page"
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.path || "#"}
                      className="Machinary-Breadcrumb-link"
                    >
                      {item.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="Machinary-Breadcrumb-decoration">
            <span className="Machinary-Breadcrumb-decoration-circle" />
            <span className="Machinary-Breadcrumb-decoration-circle" />
            <span className="Machinary-Breadcrumb-decoration-circle" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MachinaryBreadcrumb;
