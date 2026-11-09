
import React from "react";
import { Link } from "react-router-dom";
import "./ContactBreadcrumb.css";

// Import your background image
import breadcrumbBg from "../../assets/bg.png";

const ContactBreadcrumb = ({
  title = "Contact Us",
  subtitle = "Get in touch with our team for any inquiries or support.",
  breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Contact", path: "/contact" },
  ],
}) => {
  return (
    <section
      className="ProductBreadcrumb"
      style={{ backgroundImage: `url(${breadcrumbBg})` }}
    >
      <div className="Contact-BreadCrumb-overlay">
        <div className="Contact-BreadCrumb-container">
          <div className="Contact-BreadCrumb-content">
            <span className="Contact-BreadCrumb-small-title">
              FARMTECH AGRO
            </span>

            <h1 className="Contact-BreadCrumb-title">{title}</h1>

            <p className="Contact-BreadCrumb-subtitle">{subtitle}</p>

            <nav
              className="Contact-BreadCrumb-navigation"
              aria-label="Breadcrumb"
            >
              <Link
                to="/"
                className="Contact-BreadCrumb-link"
              >
                Home
              </Link>

              {breadcrumbs.map((item, index) => (
                <React.Fragment key={`${item.label}-${index}`}>
                  <span className="Contact-BreadCrumb-separator">›</span>

                  {index === breadcrumbs.length - 1 ? (
                    <span
                      className="Contact-BreadCrumb-current"
                      aria-current="page"
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.path || "#"}
                      className="Contact-BreadCrumb-link"
                    >
                      {item.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="Contact-BreadCrumb-decoration">
            <span className="Contact-BreadCrumb-decoration-circle" />
            <span className="Contact-BreadCrumb-decoration-circle" />
            <span className="Contact-BreadCrumb-decoration-circle" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactBreadcrumb;
