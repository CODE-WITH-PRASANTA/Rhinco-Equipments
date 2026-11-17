import React, { useEffect, useState } from "react";
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
  FiStar,
  FiX,
  FiSettings,
} from "react-icons/fi";

import logo from "../../assets/logo.png";
import "./Sidebar.css";

const menuItems = [
  {
    text: "Dashboard",
    path: "/",
    icon: <FiGrid size={20} />,
  },
  {
    text: "Category",
    path: "/category",
    icon: <FiLayers size={20} />,
  },
  {
    type: "dropdown",
    text: "Product Management",
    icon: <FiPackage size={20} />,
    children: [
      {
        text: "Add Product",
        path: "/products/add",
        icon: <FiPlusSquare size={16} />,
      },
      {
        text: "Manage Product",
        path: "/products",
        icon: <FiFileText size={16} />,
      },
    ],
  },
  {
    type: "dropdown",
    text: "Machinery & Equipment",
    icon: <FiTool size={20} />,
    children: [
      {
        text: "Add Equipment",
        path: "/machinery-equipment/add",
        icon: <FiPlusSquare size={16} />,
      },
      {
        text: "Manage Equipment",
        path: "/machinery-equipment",
        icon: <FiFileText size={16} />,
      },
    ],
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
    children: [
      {
        text: "Blog Posting",
        path: "/blog/new",
        icon: <FiPlusSquare size={16} />,
      },
      {
        text: "Blog Management",
        path: "/blog",
        icon: <FiFileText size={16} />,
      },
    ],
  },
  {
    text: "Enquiry",
    path: "/enquiry",
    icon: <FiMail size={20} />,
  },
  {
    text: "Reviews",
    path: "/review",
    icon: <FiStar size={20} />,
  },
  {
    text: "Settings",
    path: "/settings",
    icon: <FiSettings size={20} />,
  },
];

const isPathActive = (pathname, path) =>
  pathname === path || pathname.startsWith(path + "/");

const Sidebar = ({ isCollapsed, isMobileOpen, onClose }) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState("");

  const showText = !isCollapsed || isMobileOpen;

  // Automatically open the dropdown of the active route
  useEffect(() => {
    const activeDropdown = menuItems.find(
      (item) =>
        item.type === "dropdown" &&
        item.children?.some((child) =>
          isPathActive(location.pathname, child.path)
        )
    );

    setOpenDropdown(activeDropdown?.text || "");
  }, [location.pathname]);

  const handleNavClick = () => {
    if (isMobileOpen && onClose) onClose();
  };

  const handleDropdownToggle = (text) => {
    if (isCollapsed && !isMobileOpen) return;
    setOpenDropdown((prev) => (prev === text ? "" : text));
  };

  const isChildActive = (children) =>
    children?.some((child) => isPathActive(location.pathname, child.path));

  return (
    <aside
      className={`Sidebar ${isCollapsed ? "collapsed" : ""} ${
        isMobileOpen ? "mobile-open" : ""
      }`}
    >
      <div className="Sidebar-sheen" />

      {/* LOGO */}
      <div className="Sidebar-logo">
        <div className="Sidebar-logo-iconWrap">
          <img
            src={logo}
            alt="Rhino's Equipment logo"
            className="Sidebar-logo-img"
          />
        </div>

        {showText && (
          <div className="Sidebar-logo-text-group">
            <span className="Sidebar-logo-text">Rhino's Equipment</span>
            <span className="Sidebar-logo-tagline">Admin Panel</span>
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
          // DROPDOWN MENU
          if (item.type === "dropdown") {
            const isOpen = openDropdown === item.text;
            const isActive = isChildActive(item.children);

            return (
              <div
                key={item.text}
                className={`Sidebar-dropdown-wrapper ${
                  isOpen || isActive ? "is-open" : ""
                }`}
              >
                <button
                  type="button"
                  className={`Sidebar-link Sidebar-dropdown-toggle ${
                    isActive ? "active" : ""
                  }`}
                  onClick={() => handleDropdownToggle(item.text)}
                  title={!showText ? item.text : undefined}
                  aria-expanded={isOpen}
                >
                  <span className="Sidebar-icon">{item.icon}</span>

                  {showText && (
                    <>
                      <span className="Sidebar-text">{item.text}</span>
                      <FiChevronDown
                        size={16}
                        className={`Sidebar-chevron ${
                          isOpen ? "rotated" : ""
                        }`}
                      />
                    </>
                  )}
                </button>

                {/* SUBMENU */}
                {showText && isOpen && (
                  <div className="Sidebar-submenu">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        end
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          `Sidebar-submenu-link ${isActive ? "active" : ""}`
                        }
                      >
                        {child.icon}
                        <span>{child.text}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // NORMAL MENU
          return (
            <NavLink
              key={item.text}
              to={item.path}
              end={item.path === "/"}
              title={!showText ? item.text : undefined}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `Sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="Sidebar-icon">{item.icon}</span>
              {showText && <span className="Sidebar-text">{item.text}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;