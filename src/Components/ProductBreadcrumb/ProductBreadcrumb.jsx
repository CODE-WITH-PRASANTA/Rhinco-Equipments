
import React from "react";
import { Link } from "react-router-dom";
import "./ProductBreadcrumb.css";

// Import your background image
import breadcrumbBg from "../../assets/bg.png";

const ProductBreadcrumb = ({
  title = "Our Products",
  subtitle = "Explore quality agricultural products and machinery.",
  breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
  ],
}) => {
  return (
    <section
      className="ProductBreadcrumb"
      style={{ backgroundImage: `url(${breadcrumbBg})` }}
    >
      <div className="ProductBreadcrumb-overlay">
        <div className="ProductBreadcrumb-container">
          <div className="ProductBreadcrumb-content">
            <span className="ProductBreadcrumb-small-title">
              FARMTECH AGRO
            </span>

            <h1 className="ProductBreadcrumb-title">{title}</h1>

            <p className="ProductBreadcrumb-subtitle">{subtitle}</p>

            <nav
              className="ProductBreadcrumb-navigation"
              aria-label="Breadcrumb"
            >
              <Link
                to="/"
                className="ProductBreadcrumb-link"
              >
                Home
              </Link>

              {breadcrumbs.map((item, index) => (
                <React.Fragment key={`${item.label}-${index}`}>
                  <span className="ProductBreadcrumb-separator">›</span>

                  {index === breadcrumbs.length - 1 ? (
                    <span
                      className="ProductBreadcrumb-current"
                      aria-current="page"
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.path || "#"}
                      className="ProductBreadcrumb-link"
                    >
                      {item.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="ProductBreadcrumb-decoration">
            <span className="ProductBreadcrumb-decoration-circle" />
            <span className="ProductBreadcrumb-decoration-circle" />
            <span className="ProductBreadcrumb-decoration-circle" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductBreadcrumb;
