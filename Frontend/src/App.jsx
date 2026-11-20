import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import "./App.css";

// Context
import { CartWishlistProvider } from "./context/CartWishlistContext";

// Layout Components
import Topbar from "./Components/Topbar/Topbar";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import FloatingIcons from "./Components/FloatingIcons/FloatingIcons";

// Loader
import Loader from "./Components/Loader/Loader";

// Components
import MachineryDetails from "./Components/MachineryDetails/MachineryDetails";

// Pages
import Home from "./Pages/Home/Home";
import Product from "./Pages/Product/Product";
import ProductDetails from "./Pages/ProductDetails/ProductDetails";
import Team from "./Pages/Team/Team";
import Blog from "./Pages/Blog/Blog";
import BlogDetails from "./Pages/BlogDetails/BlogDetails";
import Contact from "./Pages/Contact/Contact";
import FAQs from "./Pages/FAQs/FAQs";
import MachineryAndEquipment from "./Pages/MachineryAndEquipment/MachineryAndEquipment";
import MachinaryEquipment from "./Pages/MachinaryEquipment/MachinaryEquipment";
import Cart from "./Pages/Cart/Cart";
import Wishlist from "./Pages/Wishlist/Wishlist";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import Profile from "./Pages/Profile/Profile";
import OrderDetails from "./Pages/OrderDetails/OrderDetails";
import Service from "./Pages/Service/Service";

const LOADER_DURATION = 1200;

// Automatically scrolls to top on every route change
const ScrollToTopOnRouteChange = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
};

// Floating Scroll-to-Top Button
const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={handleScrollTop}
      aria-label="Scroll to top"
      title="Back to top"
      style={{
        position: "fixed",
        bottom: "25px",
        right: "25px",
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
        zIndex: 999,
        transition: "opacity 0.3s ease, transform 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      ↑
    </button>
  );
};

const AppContent = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const navigationEntry = performance.getEntriesByType("navigation")[0];
    const isRefresh = navigationEntry?.type === "reload";
    const hasLoaded =
      sessionStorage.getItem("rhinco_website_loaded") === "true";

    // Show loader on first visit and browser refresh
    if (isRefresh || !hasLoaded) {
      setLoading(true);

      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem("rhinco_website_loaded", "true");
      }, LOADER_DURATION);

      return () => clearTimeout(timer);
    }

    // No loader during internal page navigation
    setLoading(false);
  }, []);

  return (
    <>
      <ScrollToTopOnRouteChange />

      {/* Premium Website Loader */}
      {loading ? (
        <Loader duration={LOADER_DURATION} />
      ) : (
        /* Main Website */
        <div className="App">
          {/* Header */}
          <Topbar />
          <Navbar />

          {/* Website Pages */}
          <main className="App-main">
            <Routes>
              {/* Home */}
              <Route path="/" element={<Home />} />

              {/* Machinery Routes */}
              <Route path="/machinery" element={<MachinaryEquipment />} />
              <Route
                path="/machine-catalogue"
                element={<MachinaryEquipment />}
              />
              <Route
                path="/machinery-equipment"
                element={<MachineryAndEquipment />}
              />
              <Route
                path="/machinery-details/:name"
                element={<MachineryDetails />}
              />

              {/* Product Routes */}
              <Route path="/products" element={<Product />} />
              <Route path="/product/:name" element={<ProductDetails />} />
              <Route path="/product-details" element={<ProductDetails />} />
              <Route
                path="/product-details/:name"
                element={<ProductDetails />}
              />

              {/* Blog Routes */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog-details" element={<BlogDetails />} />
              <Route path="/blog/:slug" element={<BlogDetails />} />
              <Route path="/blog-details/:slug" element={<BlogDetails />} />

              {/* Static Pages */}
              <Route path="/team" element={<Team />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/service" element={<Service />} />
              <Route path="/faq" element={<FAQs />} />
              <Route path="/services" element={<MachineryAndEquipment />} />

              {/* Cart & Wishlist */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />

              {/* Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/create-user" element={<Register />} />

              {/* User Profile */}
              <Route path="/account" element={<Profile />} />
              <Route path="/profile" element={<Profile />} />

              {/* Order Details */}
              <Route
                path="/order-details/:orderId"
                element={<OrderDetails />}
              />
              <Route path="/order/:orderId" element={<OrderDetails />} />
              <Route path="/orders/:orderId" element={<OrderDetails />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />

          {/* Floating Icons & Scroll-to-Top - Hidden During Loader */}
          <FloatingIcons />
          <ScrollToTopButton />
        </div>
      )}
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <CartWishlistProvider>
        <AppContent />
      </CartWishlistProvider>
    </BrowserRouter>
  );
};

export default App;