
import React from "react";
import { Link } from "react-router-dom";
import "./BlogDetailsBreadcrumb.css";

// Import your background image
import breadcrumbBg from "../../assets/bg.png";

const BlogDetailsBreadcrumb = ({
  article = null,
  title,
  subtitle,
  breadcrumbs,
}) => {
  const displayTitle = title || article?.title || "Blog Details";
  const displaySubtitle =
    subtitle ||
    (article?.category
      ? `${article.category} • ${article.readTime || "5 min read"}`
      : "Expert Agricultural Machinery & Modern Farming Insights");

  const displayBreadcrumbs =
    breadcrumbs || [
      { label: "Blog", path: "/blog" },
      { label: article?.title || "Article Details", path: "#" },
    ];

  return (
    <section
      className="ProductBreadcrumb"
      style={{ backgroundImage: `url(${breadcrumbBg})` }}
    >
      <div className="BlogDetails-Breadcrumb-overlay">
        <div className="BlogDetails-Breadcrumb-container">
          <div className="BlogDetails-Breadcrumb-content">
            <span className="BlogDetails-Breadcrumb-small-title">
              RHINCO EQUIPMENTS
            </span>

            <h1 className="BlogDetails-Breadcrumb-title">{displayTitle}</h1>

            <p className="BlogDetails-Breadcrumb-subtitle">{displaySubtitle}</p>

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

              {displayBreadcrumbs.map((item, index) => (
                <React.Fragment key={`${item.label}-${index}`}>
                  <span className="BlogDetails-Breadcrumb-separator">›</span>

                  {index === displayBreadcrumbs.length - 1 ? (
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
