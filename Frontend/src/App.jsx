
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

// Context
import { CartWishlistProvider } from "./context/CartWishlistContext";

// Layout & Loader Components
import Topbar from "./Components/Topbar/Topbar";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
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
import Loader from "./Components/Loader/Loader";
import FloatingIcons from "./Components/FloatingIcons/FloatingIcons";

const LOADER_DURATION = 1200;

const AppContent = () => {
  const [loading, setLoading] = useState(true);

  // First website entry and browser refresh loader
  useEffect(() => {
    const navigationEntry =
      performance.getEntriesByType("navigation")[0];

    const isRefresh = navigationEntry?.type === "reload";

    const hasLoaded =
      sessionStorage.getItem("rhinco_website_loaded") === "true";

    if (isRefresh || !hasLoaded) {
      setLoading(true);

      const timer = setTimeout(() => {
        setLoading(false);

        sessionStorage.setItem(
          "rhinco_website_loaded",
          "true"
        );
      }, LOADER_DURATION);

      return () => clearTimeout(timer);
    }

    setLoading(false);
  }, []);

  return (
    <>
      {/* Premium Page Loader */}
      {loading && (
        <Loader
          duration={LOADER_DURATION}
          onComplete={() => {
            setLoading(false);

            sessionStorage.setItem(
              "rhinco_website_loaded",
              "true"
            );
          }}
        />
      )}

      {/* Main Website */}
      <div className="App">
        <Topbar />
        <Navbar />

        <main className="App-main">
          <Routes>
            {/* Home Route */}
            <Route path="/" element={<Home />} />

            {/* Machinery Routes */}
            <Route
              path="/machinery"
              element={<MachinaryEquipment />}
            />

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
            <Route
              path="/products"
              element={<Product />}
            />

            <Route
              path="/product/:name"
              element={<ProductDetails />}
            />

            <Route
              path="/product-details"
              element={<ProductDetails />}
            />

            <Route
              path="/product-details/:name"
              element={<ProductDetails />}
            />

            {/* Blog Routes */}
            <Route
              path="/blog"
              element={<Blog />}
            />

            <Route
              path="/blog-details"
              element={<BlogDetails />}
            />

            <Route
              path="/blog/:slug"
              element={<BlogDetails />}
            />

            <Route
              path="/blog-details/:slug"
              element={<BlogDetails />}
            />

            {/* Static & Support Pages */}
            <Route
              path="/team"
              element={<Team />}
            />

            <Route
              path="/contact"
              element={<Contact />}
            />

            <Route
              path="/faq"
              element={<FAQs />}
            />

            <Route
              path="/services"
              element={<MachineryAndEquipment />}
            />

            <Route
              path="/cart"
              element={<Cart />}
            />

            <Route
              path="/wishlist"
              element={<Wishlist />}
            />

            {/* Authentication & User Profile */}
            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="/signup"
              element={<Register />}
            />

            <Route
              path="/create-user"
              element={<Register />}
            />

            <Route
              path="/account"
              element={<Profile />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            {/* Order Details */}
            <Route
              path="/order-details/:orderId"
              element={<OrderDetails />}
            />

            <Route
              path="/order/:orderId"
              element={<OrderDetails />}
            />

            <Route
              path="/orders/:orderId"
              element={<OrderDetails />}
            />
          </Routes>
        </main>

        <Footer />
        <FloatingIcons/>
      </div>
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
