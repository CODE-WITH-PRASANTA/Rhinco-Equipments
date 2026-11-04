
import React from "react";
import { Link } from "react-router-dom";
import "./FaqBreadCrumb.css";

// Import your background image
import breadcrumbBg from "../../assets/bg.png";

const FaqBreadCrumb = ({
  title = "Faq",
  subtitle = "Explore quality agricultural products and machinery.",
  breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Faq", path: "/faq" },
  ],
}) => {
  return (
    <section
      className="ProductBreadcrumb"
      style={{ backgroundImage: `url(${breadcrumbBg})` }}
    >
      <div className="Faq-BreadCrumb-overlay">
        <div className="Faq-BreadCrumb-container">
          <div className="Faq-BreadCrumb-content">
            <span className="Faq-BreadCrumb-small-title">
              FARMTECH AGRO
            </span>

            <h1 className="Faq-BreadCrumb-title">{title}</h1>

            <p className="Faq-BreadCrumb-subtitle">{subtitle}</p>

            <nav
              className="Faq-BreadCrumb-navigation"
              aria-label="Breadcrumb"
            >
              <Link
                to="/"
                className="Faq-BreadCrumb-link"
              >
                Home
              </Link>

              {breadcrumbs.map((item, index) => (
                <React.Fragment key={`${item.label}-${index}`}>
                  <span className="Faq-BreadCrumb-separator">›</span>

                  {index === breadcrumbs.length - 1 ? (
                    <span
                      className="Faq-BreadCrumb-current"
                      aria-current="page"
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.path || "#"}
                      className="Faq-BreadCrumb-link"
                    >
                      {item.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="Faq-BreadCrumb-decoration">
            <span className="Faq-BreadCrumb-decoration-circle" />
            <span className="Faq-BreadCrumb-decoration-circle" />
            <span className="Faq-BreadCrumb-decoration-circle" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqBreadCrumb;
