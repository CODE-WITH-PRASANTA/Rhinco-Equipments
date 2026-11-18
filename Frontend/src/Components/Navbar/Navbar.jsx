
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, NavLink } from "react-router-dom";

import {
  Menu,
  X,
  ChevronDown,
  UserRound,
  Heart,
  ShoppingCart,
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
  LogOut,
  HelpCircle,
  MapPin,
} from "lucide-react";

import logo from "../../assets/Rhino-logo-removebg-preview.png";
import "./Navbar.css";
import { getCartCount, getWishlistCount } from "../../utils/cartWishlist";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const CATEGORIES_API = `${API_URL}/categories`;
const PRODUCTS_API = `${API_URL}/products`;
const MACHINERY_API = `${API_URL}/machinery`;

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(getCartCount);
  const [wishlistCount, setWishlistCount] = useState(getWishlistCount);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("rhinco_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const updateCounts = () => {
      setCartCount(getCartCount());
      setWishlistCount(getWishlistCount());
    };

    const updateAuth = () => {
      try {
        const saved = localStorage.getItem("rhinco_user");
        setCurrentUser(saved ? JSON.parse(saved) : null);
      } catch (e) {
        setCurrentUser(null);
      }
    };

    window.addEventListener("rhinco_cart_updated", updateCounts);
    window.addEventListener("rhinco_wishlist_updated", updateCounts);
    window.addEventListener("rhinco_auth_updated", updateAuth);
    window.addEventListener("storage", () => {
      updateCounts();
      updateAuth();
    });

    return () => {
      window.removeEventListener("rhinco_cart_updated", updateCounts);
      window.removeEventListener("rhinco_wishlist_updated", updateCounts);
      window.removeEventListener("rhinco_auth_updated", updateAuth);
      window.removeEventListener("storage", () => {
        updateCounts();
        updateAuth();
      });
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("rhinco_user");
    localStorage.removeItem("rhinco_token");
    localStorage.removeItem("rhinco_delivery_address");
    localStorage.removeItem("rhinco_saved_addresses");
    localStorage.removeItem("rhinco_cart_delivery_address");
    localStorage.removeItem("rhinco_current_address");
    setCurrentUser(null);
    setAccountMenuOpen(false);
    window.dispatchEvent(new CustomEvent("rhinco_auth_updated", { detail: null }));
  };

  const categoryRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const displayedCategories = categories;

  const getCategoryIcon = (name) => {
    const lower = (name || "").toLowerCase();
    if (lower.includes("seed") || lower.includes("plant")) return Sprout;
    if (lower.includes("fertiliz")) return Wheat;
    if (lower.includes("tool") || lower.includes("tillage") || lower.includes("shovel")) return Shovel;
    if (lower.includes("pest")) return Bug;
    if (lower.includes("organic") || lower.includes("leaf")) return Leaf;
    if (lower.includes("irrigat") || lower.includes("water") || lower.includes("spray")) return Droplets;
    if (lower.includes("fruit") || lower.includes("vegetable")) return Apple;
    if (lower.includes("machin") || lower.includes("tractor")) return Tractor;
    if (lower.includes("garden")) return Flower2;
    if (lower.includes("accessor") || lower.includes("suppl")) return Package;
    return Leaf;
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);

      const [catRes, prodRes, machRes] = await Promise.all([
        fetch(CATEGORIES_API).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(PRODUCTS_API).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(MACHINERY_API).then((r) => r.json()).catch(() => ({ data: [] })),
      ]);

      const rawCats = Array.isArray(catRes?.data) ? catRes.data : [];
      const rawProds = Array.isArray(prodRes?.data) ? prodRes.data : [];
      const rawMachs = Array.isArray(machRes?.data) ? machRes.data : [];

      const clean = (s) => (s || "").trim().toLowerCase();
      const categoryMap = new Map();

      // Seed with DB categories
      rawCats.forEach((cat) => {
        if (cat.status !== "Inactive" && cat.name) {
          const key = clean(cat.name);
          categoryMap.set(key, {
            _id: cat._id,
            name: cat.name,
            productsCount: 0,
            machineryCount: 0,
          });
        }
      });

      // Count products
      rawProds.forEach((prod) => {
        if (!prod.category) return;
        const key = clean(prod.category);
        if (!categoryMap.has(key)) {
          categoryMap.set(key, {
            _id: `prod-${key}`,
            name: prod.category,
            productsCount: 0,
            machineryCount: 0,
          });
        }
        categoryMap.get(key).productsCount += 1;
      });

      // Count machinery
      rawMachs.forEach((mach) => {
        if (!mach.category) return;
        const key = clean(mach.category);
        if (!categoryMap.has(key)) {
          categoryMap.set(key, {
            _id: `mach-${key}`,
            name: mach.category,
            productsCount: 0,
            machineryCount: 0,
          });
        }
        categoryMap.get(key).machineryCount += 1;
      });

      // ONLY SHOW CATEGORIES THAT HAVE AT LEAST ONE PRODUCT OR MACHINERY
      const activeCats = Array.from(categoryMap.values()).filter(
        (c) => c.productsCount > 0 || c.machineryCount > 0
      );

      activeCats.sort((a, b) => {
        const totalA = a.productsCount + a.machineryCount;
        const totalB = b.productsCount + b.machineryCount;
        if (totalB !== totalA) return totalB - totalA;
        return a.name.localeCompare(b.name);
      });

      setCategories(activeCats);
    } catch (err) {
      console.warn("Could not fetch categories in Navbar:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    window.addEventListener("blog_categories_updated", fetchCategories);
    return () => {
      window.removeEventListener("blog_categories_updated", fetchCategories);
    };
  }, []);

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
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileCategoryOpen(false);
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
                {categoriesLoading && (
                  <div style={{ gridColumn: "1 / -1", padding: "16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                    Loading categories...
                  </div>
                )}

                {!categoriesLoading && displayedCategories.length === 0 && (
                  <div style={{ gridColumn: "1 / -1", padding: "16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                    No categories found
                  </div>
                )}

                {!categoriesLoading &&
                  displayedCategories.map((category) => {
                    const catName = category.name;
                    const Icon = getCategoryIcon(catName);
                    const hasBoth = category.productsCount > 0 && category.machineryCount > 0;
                    const defaultUrl = category.productsCount > 0
                      ? `/products?category=${encodeURIComponent(catName)}`
                      : `/machinery?category=${encodeURIComponent(catName)}`;

                    return (
                      <div
                        className="Navbar-category-row"
                        key={category._id || category.name}
                      >
                        <Link
                          to={defaultUrl}
                          className="Navbar-category-info-link"
                          onClick={() => setCategoryOpen(false)}
                        >
                          <div className="Navbar-category-icon">
                            <Icon size={18} />
                          </div>

                          <div className="Navbar-category-text-wrap">
                            <span className="Navbar-category-name" title={catName}>
                              {catName}
                            </span>
                            <span className="Navbar-category-counts-hint">
                              {hasBoth
                                ? `${category.productsCount} Products • ${category.machineryCount} Machinery`
                                : category.productsCount > 0
                                ? `${category.productsCount} Products`
                                : `${category.machineryCount} Machinery`}
                            </span>
                          </div>
                        </Link>

                        <div className="Navbar-category-actions">
                          {hasBoth ? (
                            <>
                              <Link
                                to={`/products?category=${encodeURIComponent(catName)}`}
                                className="Navbar-cat-btn Navbar-cat-btn--prod"
                                onClick={() => setCategoryOpen(false)}
                                title={`Open ${catName} in Products`}
                              >
                                <Package size={11} /> Product
                              </Link>
                              <Link
                                to={`/machinery?category=${encodeURIComponent(catName)}`}
                                className="Navbar-cat-btn Navbar-cat-btn--mach"
                                onClick={() => setCategoryOpen(false)}
                                title={`Open ${catName} in Machinery`}
                              >
                                <Tractor size={11} /> Machinery
                              </Link>
                            </>
                          ) : category.productsCount > 0 ? (
                            <Link
                              to={`/products?category=${encodeURIComponent(catName)}`}
                              className="Navbar-cat-btn Navbar-cat-btn--prod"
                              onClick={() => setCategoryOpen(false)}
                              title={`Open ${catName} in Products`}
                            >
                              <Package size={11} /> Product
                            </Link>
                          ) : (
                            <Link
                              to={`/machinery?category=${encodeURIComponent(catName)}`}
                              className="Navbar-cat-btn Navbar-cat-btn--mach"
                              onClick={() => setCategoryOpen(false)}
                              title={`Open ${catName} in Machinery`}
                            >
                              <Tractor size={11} /> Machinery
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="Navbar-category-footer">
                <Link
                  to="/products"
                  className="Navbar-category-footer-link"
                  onClick={() => setCategoryOpen(false)}
                >
                  All Products &rarr;
                </Link>
                <Link
                  to="/machinery"
                  className="Navbar-category-footer-link"
                  onClick={() => setCategoryOpen(false)}
                >
                  Machinery Catalogue &rarr;
                </Link>
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

          {/* USER ACCOUNT */}
          {currentUser ? (
            <div
              className="Navbar-user-wrapper"
              onMouseEnter={() => setAccountMenuOpen(true)}
              onMouseLeave={() => setAccountMenuOpen(false)}
            >
              <Link
                to="/account?tab=profile"
                className={`Navbar-user-pill ${accountMenuOpen ? "active" : ""}`}
                aria-label="My Account"
                title={`${currentUser.name} (Account)`}
                onClick={() => setAccountMenuOpen(false)}
              >
                <div className="Navbar-user-avatar">
                  {(currentUser.name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="Navbar-user-info">
                  <span className="Navbar-user-greeting">Welcome</span>
                  <span className="Navbar-user-name">{currentUser.name}</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`Navbar-user-chevron ${accountMenuOpen ? "open" : ""}`}
                />
              </Link>

              {/* Attractive Dropdown Menu */}
              {accountMenuOpen && (
                <div className="Navbar-user-dropdown">
                  <div className="Navbar-user-dropdown-header">
                    <h4 className="Navbar-dropdown-user-name">{currentUser.name}</h4>
                    <p className="Navbar-dropdown-user-email">{currentUser.email}</p>
                    <span className="Navbar-dropdown-user-badge">
                      {currentUser.role || "Member"} Account
                    </span>
                  </div>

                  <Link
                    to="/account?tab=profile"
                    className="Navbar-user-dropdown-link"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <UserRound size={17} />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/account?tab=orders"
                    className="Navbar-user-dropdown-link"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <Package size={17} />
                    <span>My Orders</span>
                  </Link>

                  <Link
                    to="/account?tab=address"
                    className="Navbar-user-dropdown-link"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <MapPin size={17} />
                    <span>My Address</span>
                  </Link>

                  <Link
                    to="/account?tab=enquiries"
                    className="Navbar-user-dropdown-link"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <Tractor size={17} />
                    <span>Machinery Enquiries</span>
                  </Link>

                  <Link
                    to="/account?tab=help"
                    className="Navbar-user-dropdown-link"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <HelpCircle size={17} />
                    <span>Help Center</span>
                  </Link>

                  <div className="Navbar-dropdown-divider" />

                  <button
                    type="button"
                    className="Navbar-user-dropdown-logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="Navbar-signin-pill"
              aria-label="Sign In"
              title="Sign In"
            >
              <UserRound size={17} />
              <span>Sign In</span>
            </Link>
          )}

          <Link
            to="/wishlist"
            className="Navbar-action-btn Navbar-wishlist"
            aria-label="Wishlist"
            title="Wishlist"
          >
            <Heart size={21} />
            <span className="Navbar-count">{wishlistCount}</span>
          </Link>

          <Link
            to="/cart"
            className="Navbar-action-btn Navbar-cart"
            aria-label="Shopping Cart"
            title="Shopping Cart"
          >
            <ShoppingCart size={21} />
            <span className="Navbar-count">{cartCount}</span>
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
              {categoriesLoading && (
                <div style={{ padding: "12px", color: "#94a3b8", fontSize: "13px" }}>
                  Loading categories...
                </div>
              )}
              {!categoriesLoading &&
                categories.map((category) => {
                  const catName = category.name;
                  const Icon = getCategoryIcon(catName);
                  const hasBoth = category.productsCount > 0 && category.machineryCount > 0;

                  return (
                    <div
                      key={category._id || category.name}
                      className="Navbar-mobile-cat-row"
                    >
                      <span className="Navbar-mobile-cat-title">
                        <Icon size={17} />
                        {catName}
                      </span>
                      <div className="Navbar-mobile-cat-actions">
                        {hasBoth ? (
                          <>
                            <Link
                              to={`/products?category=${encodeURIComponent(catName)}`}
                              className="Navbar-cat-btn Navbar-cat-btn--prod"
                              onClick={closeMobileMenu}
                            >
                              Product
                            </Link>
                            <Link
                              to={`/machinery?category=${encodeURIComponent(catName)}`}
                              className="Navbar-cat-btn Navbar-cat-btn--mach"
                              onClick={closeMobileMenu}
                            >
                              Machinery
                            </Link>
                          </>
                        ) : category.productsCount > 0 ? (
                          <Link
                            to={`/products?category=${encodeURIComponent(catName)}`}
                            className="Navbar-cat-btn Navbar-cat-btn--prod"
                            onClick={closeMobileMenu}
                          >
                            Product
                          </Link>
                        ) : (
                          <Link
                            to={`/machinery?category=${encodeURIComponent(catName)}`}
                            className="Navbar-cat-btn Navbar-cat-btn--mach"
                            onClick={closeMobileMenu}
                          >
                            Machinery
                          </Link>
                        )}
                      </div>
                    </div>
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

            {currentUser ? (
              <>
                <div className="Navbar-mobile-user-card">
                  <div className="Navbar-mobile-user-avatar">
                    {(currentUser.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="Navbar-mobile-user-details">
                    <span className="Navbar-mobile-user-name">{currentUser.name}</span>
                    <span className="Navbar-mobile-user-email">{currentUser.email}</span>
                  </div>
                </div>

                <Link
                  to="/account?tab=profile"
                  onClick={closeMobileMenu}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <UserRound size={18} />
                  My Profile
                </Link>

                <Link
                  to="/account?tab=orders"
                  onClick={closeMobileMenu}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Package size={18} />
                  My Orders
                </Link>

                <Link
                  to="/account?tab=address"
                  onClick={closeMobileMenu}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <MapPin size={18} />
                  My Address
                </Link>

                <Link
                  to="/account?tab=enquiries"
                  onClick={closeMobileMenu}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Tractor size={18} />
                  Machinery Enquiries
                </Link>

                <Link
                  to="/account?tab=help"
                  onClick={closeMobileMenu}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <HelpCircle size={18} />
                  Help Center
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    textAlign: "left",
                    marginTop: "4px",
                  }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  style={{
                    backgroundColor: "#166534",
                    color: "#ffffff",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    color: "#334155",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Create User
                </Link>
              </div>
            )}

            <Link to="/wishlist" onClick={closeMobileMenu}>
              <Heart size={19} />
              Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
            </Link>

            <Link to="/cart" onClick={closeMobileMenu}>
              <ShoppingCart size={19} />
              My Cart {cartCount > 0 && `(${cartCount})`}
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
