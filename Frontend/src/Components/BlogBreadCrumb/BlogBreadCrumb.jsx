
import React from "react";
import { Link } from "react-router-dom";
import "./BlogBreadCrumb.css";

// Import your background image
import breadcrumbBg from "../../assets/bg.png";

const BlogBreadCrumb = ({
  title = "Blog",
  subtitle = "Explore quality agricultural products and machinery.",
  breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Blog", path: "/blog" },
  ],
}) => {
  return (
    <section
      className="ProductBreadcrumb"
      style={{ backgroundImage: `url(${breadcrumbBg})` }}
    >
      <div className="Blog-BreadCrumb-overlay">
        <div className="Blog-BreadCrumb-container">
          <div className="Blog-BreadCrumb-content">
            <span className="Blog-BreadCrumb-small-title">
              FARMTECH AGRO
            </span>

            <h1 className="Blog-BreadCrumb-title">{title}</h1>

            <p className="Blog-BreadCrumb-subtitle">{subtitle}</p>

            <nav
              className="Blog-BreadCrumb-navigation"
              aria-label="Breadcrumb"
            >
              <Link
                to="/"
                className="Blog-BreadCrumb-link"
              >
                Home
              </Link>

              {breadcrumbs.map((item, index) => (
                <React.Fragment key={`${item.label}-${index}`}>
                  <span className="Blog-BreadCrumb-separator">›</span>

                  {index === breadcrumbs.length - 1 ? (
                    <span
                      className="Blog-BreadCrumb-current"
                      aria-current="page"
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.path || "#"}
                      className="Blog-BreadCrumb-link"
                    >
                      {item.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="Blog-BreadCrumb-decoration">
            <span className="Blog-BreadCrumb-decoration-circle" />
            <span className="Blog-BreadCrumb-decoration-circle" />
            <span className="Blog-BreadCrumb-decoration-circle" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogBreadCrumb;
