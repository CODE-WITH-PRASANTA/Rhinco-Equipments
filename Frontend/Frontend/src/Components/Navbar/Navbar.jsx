
import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";

import {
  Menu,
  X,
  ChevronDown,
  UserRound,
  Heart,
  ShoppingCart,
  Search,
  Tractor,
  Wheat,
  Leaf,
  Flower2,
  Apple,
  Droplets,
  Package,
  ArrowRight,
  Sprout,
  Shovel,
  Bug,
} from "lucide-react";

import logo from "../../assets/Rhino-logo-removebg-preview.png";
import "./Navbar.css";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const categoryRef = useRef(null);

  const categories = [
    {
      title: "Seeds & Planting",
      icon: Sprout,
      link: "/category/seeds",
    },
    {
      title: "Fertilizers",
      icon: Wheat,
      link: "/category/fertilizers",
    },
    {
      title: "Agricultural Tools",
      icon: Shovel,
      link: "/category/tools",
    },
    {
      title: "Pesticides",
      icon: Bug,
      link: "/category/pesticides",
    },
    {
      title: "Organic Products",
      icon: Leaf,
      link: "/category/organic",
    },
    {
      title: "Irrigation Products",
      icon: Droplets,
      link: "/category/irrigation",
    },
    {
      title: "Fruits & Vegetables",
      icon: Apple,
      link: "/category/produce",
    },
    {
      title: "Farm Machinery",
      icon: Tractor,
      link: "/category/machinery",
    },
    {
      title: "Garden Supplies",
      icon: Flower2,
      link: "/category/garden",
    },
    {
      title: "Farm Accessories",
      icon: Package,
      link: "/category/accessories",
    },
  ];

  const navLinks = [
    { title: "Home", link: "/" },
    { title: "Product", link: "/products" },
    { title: "Machinery & Equipment", link: "/machinery" },
    { title: "Team", link: "/team" },
    { title: "FAQ", link: "/faq" },
    { title: "Blog", link: "/blog" },
    { title: "Service", link: "/service" },
    { title: "Contact", link: "/contact" },
  ];

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target)
      ) {
        setCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Lock body scrolling when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setCategoryOpen(false);
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileCategoryOpen(false);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    if (searchValue.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(
        searchValue.trim()
      )}`;
    }
  };

  return (
    <header className="Navbar">

      <div className="Navbar-container">

        {/* LOGO */}
        <Link
          to="/"
          className="Navbar-logo"
          onClick={closeMobileMenu}
        >
          <img
            src={logo}
            alt="Farmtech Agro Logo"
            className="Navbar-logo-image"
          />
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="Navbar-navigation">

          {/* ALL CATEGORIES */}
          <div
            className={`Navbar-category-wrapper ${
              categoryOpen ? "Navbar-category-active" : ""
            }`}
            ref={categoryRef}
            onMouseEnter={() => setCategoryOpen(true)}
            onMouseLeave={() => setCategoryOpen(false)}
          >
            <button
              className="Navbar-category-button"
              onClick={() => setCategoryOpen((prev) => !prev)}
              aria-expanded={categoryOpen}
              aria-haspopup="true"
            >
              <Menu size={18} />
              <span>All Categories</span>
              <ChevronDown
                size={15}
                className="Navbar-category-arrow"
              />
            </button>

            {/* COMPACT CATEGORY DROPDOWN */}
            <div className="Navbar-category-dropdown">
              <div className="Navbar-category-grid">

                {categories.map((category) => {
                  const Icon = category.icon;

                  return (
                    <Link
                      to={category.link}
                      className="Navbar-category-item"
                      key={category.title}
                      onClick={() => setCategoryOpen(false)}
                    >
                      <div className="Navbar-category-icon">
                        <Icon size={19} />
                      </div>

                      <span className="Navbar-category-name">
                        {category.title}
                      </span>

                      <ArrowRight
                        size={14}
                        className="Navbar-category-item-arrow"
                      />
                    </Link>
                  );
                })}

              </div>
            </div>
          </div>

          {/* MAIN NAV LINKS */}
          <div className="Navbar-links">
            {navLinks.map((item) => (
              <NavLink
                to={item.link}
                key={item.title}
                end={item.link === "/"}
                className={({ isActive }) =>
                  `Navbar-link ${
                    isActive ? "Navbar-link-active" : ""
                  }`
                }
              >
                {item.title}
              </NavLink>
            ))}
          </div>

        </nav>

        {/* RIGHT ACTION ICONS */}
        <div className="Navbar-actions">

          <button
            className={`Navbar-action-btn Navbar-search-btn ${
              searchOpen ? "Navbar-action-active" : ""
            }`}
            aria-label="Search products"
            onClick={() => setSearchOpen((prev) => !prev)}
          >
            <Search size={21} />
          </button>

          <Link
            to="/account"
            className="Navbar-action-btn"
            aria-label="My Account"
            title="My Account"
          >
            <UserRound size={21} />
          </Link>

          <Link
            to="/wishlist"
            className="Navbar-action-btn Navbar-wishlist"
            aria-label="Wishlist"
            title="Wishlist"
          >
            <Heart size={21} />
            <span className="Navbar-count">0</span>
          </Link>

          <Link
            to="/cart"
            className="Navbar-action-btn Navbar-cart"
            aria-label="Shopping Cart"
            title="Shopping Cart"
          >
            <ShoppingCart size={21} />
            <span className="Navbar-count">0</span>
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button
            className="Navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={27} /> : <Menu size={27} />}
          </button>

        </div>

      </div>

      {/* SEARCH PANEL */}
      <div
        className={`Navbar-search-panel ${
          searchOpen ? "Navbar-search-panel-open" : ""
        }`}
      >
        <form
          className="Navbar-search-form"
          onSubmit={handleSearch}
        >
          <Search size={20} />

          <input
            type="text"
            placeholder="Search seeds, fertilizers, machinery..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />

          <button type="submit">Search</button>
        </form>
      </div>

      {/* MOBILE OVERLAY */}
      <div
        className={`Navbar-mobile-overlay ${
          mobileMenuOpen ? "Navbar-mobile-overlay-active" : ""
        }`}
        onClick={closeMobileMenu}
      />

      {/* MOBILE SIDEBAR */}
      <aside
        className={`Navbar-mobile-menu ${
          mobileMenuOpen ? "Navbar-mobile-menu-open" : ""
        }`}
        aria-hidden={!mobileMenuOpen}
      >

        <div className="Navbar-mobile-header">

          <Link
            to="/"
            className="Navbar-mobile-logo"
            onClick={closeMobileMenu}
          >
            <img src={logo} alt="Farmtech Agro" />
          </Link>

          <button
            className="Navbar-mobile-close"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <X size={25} />
          </button>

        </div>

        <div className="Navbar-mobile-content">

          {/* MOBILE CATEGORIES */}
          <div className="Navbar-mobile-category">

            <button
              className="Navbar-mobile-category-btn"
              onClick={() =>
                setMobileCategoryOpen((prev) => !prev)
              }
              aria-expanded={mobileCategoryOpen}
            >
              <span>
                <Menu size={19} />
                All Categories
              </span>

              <ChevronDown
                size={19}
                className={
                  mobileCategoryOpen
                    ? "Navbar-mobile-chevron-open"
                    : ""
                }
              />
            </button>

            <div
              className={`Navbar-mobile-category-list ${
                mobileCategoryOpen
                  ? "Navbar-mobile-category-list-open"
                  : ""
              }`}
            >
              {categories.map((category) => {
                const Icon = category.icon;

                return (
                  <Link
                    to={category.link}
                    key={category.title}
                    onClick={closeMobileMenu}
                  >
                    <Icon size={17} />
                    {category.title}
                  </Link>
                );
              })}
            </div>

          </div>

          {/* MOBILE NAVIGATION LINKS */}
          <div className="Navbar-mobile-links">
            {navLinks.map((item) => (
              <NavLink
                to={item.link}
                key={item.title}
                end={item.link === "/"}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  isActive ? "Navbar-mobile-link-active" : ""
                }
              >
                {item.title}
                <ArrowRight size={16} />
              </NavLink>
            ))}
          </div>

          {/* MOBILE ACCOUNT ACTIONS */}
          <div className="Navbar-mobile-actions">

            <Link to="/account" onClick={closeMobileMenu}>
              <UserRound size={19} />
              My Account
            </Link>

            <Link to="/wishlist" onClick={closeMobileMenu}>
              <Heart size={19} />
              Wishlist
            </Link>

            <Link to="/cart" onClick={closeMobileMenu}>
              <ShoppingCart size={19} />
              My Cart
            </Link>

          </div>

          <div className="Navbar-mobile-footer">
            <Sprout size={20} />
            <p>Growing A Better Future Together</p>
          </div>

        </div>

      </aside>

    </header>
  );
};

export default Navbar;
