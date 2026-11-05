
import React from "react";
import { Link } from "react-router-dom";
import "./BlogDetailsBreadcrumb.css";

// Import your background image
import breadcrumbBg from "../../assets/bg.png";

const BlogDetailsBreadcrumb = ({
  title = "Blog Details",
  subtitle = "Explore quality agricultural products and machinery.",
  breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Blog Details", path: "/blog-details" },
  ],
}) => {
  return (
    <section
      className="ProductBreadcrumb"
      style={{ backgroundImage: `url(${breadcrumbBg})` }}
    >
      <div className="BlogDetails-Breadcrumb-overlay">
        <div className="BlogDetails-Breadcrumb-container">
          <div className="BlogDetails-Breadcrumb-content">
            <span className="BlogDetails-Breadcrumb-small-title">
              FARMTECH AGRO
            </span>

            <h1 className="BlogDetails-Breadcrumb-title">{title}</h1>

            <p className="BlogDetails-Breadcrumb-subtitle">{subtitle}</p>

            <nav
              className="BlogDetails-Breadcrumb-navigation"
              aria-label="Breadcrumb"
            >
              <Link
                to="/"
                className="BlogDetails-Breadcrumb-link"
              >
                Home
              </Link>

              {breadcrumbs.map((item, index) => (
                <React.Fragment key={`${item.label}-${index}`}>
                  <span className="BlogDetails-Breadcrumb-separator">›</span>

                  {index === breadcrumbs.length - 1 ? (
                    <span
                      className="BlogDetails-Breadcrumb-current"
                      aria-current="page"
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.path || "#"}
                      className="BlogDetails-Breadcrumb-link"
                    >
                      {item.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="BlogDetails-Breadcrumb-decoration">
            <span className="BlogDetails-Breadcrumb-decoration-circle" />
            <span className="BlogDetails-Breadcrumb-decoration-circle" />
            <span className="BlogDetails-Breadcrumb-decoration-circle" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogDetailsBreadcrumb;
