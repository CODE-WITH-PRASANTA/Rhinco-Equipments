
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  FiGrid,
  FiPackage,
  FiTool,
  FiLayers,
  FiUsers,
  FiEdit3,
  FiChevronDown,
  FiFileText,
  FiPlusSquare,
  FiMail,
  FiUserPlus,
  FiX,
  FiTruck,
} from "react-icons/fi";

import "./Sidebar.css";

const BrandMark = ({ className = "" }) => (
  <div className={className}>
    <FiTruck size={24} />
  </div>
);

const Sidebar = ({
  isCollapsed,
  isMobileOpen,
  onClose,
}) => {
  const location = useLocation();

  const isBlogPage =
    location.pathname === "/blog" ||
    location.pathname.startsWith("/blog/");

  const [blogOpen, setBlogOpen] = useState(isBlogPage);

  const menuItems = [
    {
      text: "Dashboard",
      path: "/",
      icon: <FiGrid size={20} />,
    },
    {
      text: "Product",
      path: "/products",
      icon: <FiPackage size={20} />,
    },
    {
      text: "Machinery & Equipment",
      path: "/machinery-equipment",
      icon: <FiTool size={20} />,
    },
    {
      text: "Category",
      path: "/category",
      icon: <FiLayers size={20} />,
    },
    {
      text: "Team",
      path: "/team",
      icon: <FiUsers size={20} />,
    },
    {
      type: "dropdown",
      text: "Blog",
      icon: <FiEdit3 size={20} />,
    },
    {
      text: "Enquiry",
      path: "/enquiry",
      icon: <FiMail size={20} />,
    },
    {
      text: "Cold Lead",
      path: "/cold-lead",
      icon: <FiUserPlus size={20} />,
    },
  ];

  const handleNavClick = () => {
    if (isMobileOpen && onClose) {
      onClose();
    }
  };

  const handleBlogToggle = () => {
    if (!isCollapsed || isMobileOpen) {
      setBlogOpen((prev) => !prev);
    }
  };

  return (
    <aside
      className={`Sidebar ${
        isCollapsed ? "collapsed" : ""
      } ${
        isMobileOpen ? "mobile-open" : ""
      }`}
    >
      <div className="Sidebar-sheen" />

      {/* LOGO */}
      <div className="Sidebar-logo">
        <div className="Sidebar-logo-iconWrap">
          <BrandMark className="Sidebar-logo-icon" />
        </div>

        {(!isCollapsed || isMobileOpen) && (
          <div className="Sidebar-logo-text-group">
            <span className="Sidebar-logo-text">
              Rhino's Equipment
            </span>
          </div>
        )}

        {isMobileOpen && (
          <button
            type="button"
            className="Sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="Sidebar-nav">
        {menuItems.map((item) => {
          if (item.type === "dropdown") {
            return (
              <div
                key={item.text}
                className={`Sidebar-dropdown-wrapper ${
                  blogOpen || isBlogPage ? "is-open" : ""
                }`}
              >
                <button
                  type="button"
                  className={`Sidebar-link Sidebar-dropdown-toggle ${
                    isBlogPage ? "active" : ""
                  }`}
                  onClick={handleBlogToggle}
                  title={isCollapsed ? item.text : undefined}
                  aria-expanded={blogOpen || isBlogPage}
                >
                  <span className="Sidebar-icon">
                    {item.icon}
                  </span>

                  {(!isCollapsed || isMobileOpen) && (
                    <>
                      <span className="Sidebar-text">
                        {item.text}
                      </span>

                      <FiChevronDown
                        size={16}
                        className={`Sidebar-chevron ${
                          blogOpen || isBlogPage ? "rotated" : ""
                        }`}
                      />
                    </>
                  )}
                </button>

                {(!isCollapsed || isMobileOpen) &&
                  (blogOpen || isBlogPage) && (
                    <div className="Sidebar-submenu">
                      <NavLink
                        to="/blog"
                        end
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          `Sidebar-submenu-link ${
                            isActive ? "active" : ""
                          }`
                        }
                      >
                        <FiFileText size={16} />
                        <span>Blog Management</span>
                      </NavLink>

                      <NavLink
                        to="/blog/new"
                        end
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          `Sidebar-submenu-link ${
                            isActive ? "active" : ""
                          }`
                        }
                      >
                        <FiPlusSquare size={16} />
                        <span>Blog Posting</span>
                      </NavLink>
                    </div>
                  )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.text}
              to={item.path}
              end={item.path === "/"}
              title={isCollapsed ? item.text : undefined}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `Sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="Sidebar-icon">
                {item.icon}
              </span>

              {(!isCollapsed || isMobileOpen) && (
                <span className="Sidebar-text">
                  {item.text}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
