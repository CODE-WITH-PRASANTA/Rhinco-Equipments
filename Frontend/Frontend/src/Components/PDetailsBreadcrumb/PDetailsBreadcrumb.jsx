
import React from "react";
import { Link } from "react-router-dom";
import "./PDetailsBreadcrumb.css";

// Import your background image
import breadcrumbBg from "../../assets/bg.png";

const PDetailsBreadcrumb = ({
  title = "Our Product Details",
  subtitle = "Explore quality agricultural products and machinery.",
  breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Product Details", path: "/product-details" },
  ],
}) => {
  return (
    <section
      className="ProductBreadcrumb"
      style={{ backgroundImage: `url(${breadcrumbBg})` }}
    >
      <div className="PDetails-Breadcrumb-overlay">
        <div className="PDetails-Breadcrumb-container">
          <div className="PDetails-Breadcrumb-content">
            <span className="PDetails-Breadcrumb-small-title">
              FARMTECH AGRO
            </span>

            <h1 className="PDetails-Breadcrumb-title">{title}</h1>

            <p className="PDetails-Breadcrumb-subtitle">{subtitle}</p>

            <nav
              className="PDetails-Breadcrumb-navigation"
              aria-label="Breadcrumb"
            >
              <Link
                to="/"
                className="PDetails-Breadcrumb-link"
              >
                Home
              </Link>

              {breadcrumbs.map((item, index) => (
                <React.Fragment key={`${item.label}-${index}`}>
                  <span className="PDetails-Breadcrumb-separator">›</span>

                  {index === breadcrumbs.length - 1 ? (
                    <span
                      className="PDetails-Breadcrumb-current"
                      aria-current="page"
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.path || "#"}
                      className="PDetails-Breadcrumb-link"
                    >
                      {item.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="PDetails-Breadcrumb-decoration">
            <span className="PDetails-Breadcrumb-decoration-circle" />
            <span className="PDetails-Breadcrumb-decoration-circle" />
            <span className="PDetails-Breadcrumb-decoration-circle" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PDetailsBreadcrumb;
