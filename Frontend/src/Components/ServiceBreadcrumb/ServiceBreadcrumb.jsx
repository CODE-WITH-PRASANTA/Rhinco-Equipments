
import React from "react";
import { Link } from "react-router-dom";
import "./ServiceBreadcrumb.css";

import breadcrumbBg from "../../assets/bg.png";

const ServiceBreadcrumb = ({
  title = "Our Services",
  subtitle = "Discover our professional services designed to deliver quality, reliability and the best solutions for your needs.",
  image = breadcrumbBg,
  brandName = "FARMTECH AGRO",
  breadcrumbs = [
    { label: "Services", path: "/services" },
  ],
}) => {
  return (
    <section
      className="ServiceBreadcrumb"
      style={{ backgroundImage: `url(${image})` }}
      aria-labelledby="ServiceBreadcrumb-title"
    >
      {/* Background Overlay */}
      <div className="ServiceBreadcrumb-overlay">

        {/* Decorative Background */}
        <div className="ServiceBreadcrumb-decoration">
          <span className="ServiceBreadcrumb-circle ServiceBreadcrumb-circle--one" />
          <span className="ServiceBreadcrumb-circle ServiceBreadcrumb-circle--two" />
          <span className="ServiceBreadcrumb-circle ServiceBreadcrumb-circle--three" />

          <span className="ServiceBreadcrumb-decoration-dot" />
        </div>

        {/* Main Container */}
        <div className="ServiceBreadcrumb-container">

          {/* Content */}
          <div className="ServiceBreadcrumb-content">

            {/* Brand Label */}
            {brandName && (
              <div className="ServiceBreadcrumb-brand">
                <span className="ServiceBreadcrumb-brand-line" />
                <span>{brandName}</span>
              </div>
            )}

            {/* Heading */}
            <h1
              className="ServiceBreadcrumb-title"
              id="ServiceBreadcrumb-title"
            >
              {title}
            </h1>

            {/* Accent */}
            <div className="ServiceBreadcrumb-accent">
              <span />
              <span />
              <span />
            </div>

            {/* Description */}
            {subtitle && (
              <p className="ServiceBreadcrumb-subtitle">
                {subtitle}
              </p>
            )}

            {/* Breadcrumb Navigation */}
            <nav
              className="ServiceBreadcrumb-navigation"
              aria-label="Breadcrumb"
            >
              <Link
                to="/"
                className="ServiceBreadcrumb-link"
              >
                Home
              </Link>

              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                  <React.Fragment
                    key={`${item.label}-${index}`}
                  >
                    <span
                      className="ServiceBreadcrumb-separator"
                      aria-hidden="true"
                    >
                      /
                    </span>

                    {isLast ? (
                      <span
                        className="ServiceBreadcrumb-current"
                        aria-current="page"
                      >
                        {item.label}
                      </span>
                    ) : (
                      <Link
                        to={item.path || "/"}
                        className="ServiceBreadcrumb-link"
                      >
                        {item.label}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>

          </div>

          {/* Decorative Side Element */}
          <div className="ServiceBreadcrumb-side-decoration">
            <div className="ServiceBreadcrumb-side-inner">
              <span className="ServiceBreadcrumb-side-dot" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ServiceBreadcrumb;
