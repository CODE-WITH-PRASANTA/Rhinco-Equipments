
import React from "react";
import { Link } from "react-router-dom";
import "./TeamBreadcrumb.css";

// Import your background image
import breadcrumbBg from "../../assets/bg.png";

const TeamBreadcrumb = ({
  title = "Our Team",
  subtitle = "Explore quality agricultural products and machinery.",
  breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Team", path: "/team" },
  ],
}) => {
  return (
    <section
      className="ProductBreadcrumb"
      style={{ backgroundImage: `url(${breadcrumbBg})` }}
    >
      <div className="Team-Breadcrumb-overlay">
        <div className="Team-Breadcrumb-container">
          <div className="Team-Breadcrumb-content">
            <span className="Team-Breadcrumb-small-title">
              FARMTECH AGRO
            </span>

            <h1 className="Team-Breadcrumb-title">{title}</h1>

            <p className="Team-Breadcrumb-subtitle">{subtitle}</p>

            <nav
              className="Team-Breadcrumb-navigation"
              aria-label="Breadcrumb"
            >
              <Link
                to="/"
                className="Team-Breadcrumb-link"
              >
                Home
              </Link>

              {breadcrumbs.map((item, index) => (
                <React.Fragment key={`${item.label}-${index}`}>
                  <span className="Team-Breadcrumb-separator">›</span>

                  {index === breadcrumbs.length - 1 ? (
                    <span
                      className="Team-Breadcrumb-current"
                      aria-current="page"
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.path || "#"}
                      className="Team-Breadcrumb-link"
                    >
                      {item.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="Team-Breadcrumb-decoration">
            <span className="Team-Breadcrumb-decoration-circle" />
            <span className="Team-Breadcrumb-decoration-circle" />
            <span className="Team-Breadcrumb-decoration-circle" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamBreadcrumb;
