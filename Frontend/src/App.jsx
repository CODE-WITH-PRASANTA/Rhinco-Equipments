import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Topbar from "./Components/Topbar/Topbar";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import MachineryDetails from "./Components/MachineryDetails/MachineryDetails";

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

const App = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <Topbar />
        <Navbar />

        <main className="App-main">
          <Routes>
            {/* Home Route */}
            <Route path="/" element={<Home />} />

            {/* Machinery Routes */}
            <Route path="/machinery" element={<MachinaryEquipment />} />
            <Route path="/machine-catalogue" element={<MachinaryEquipment />} />
            <Route path="/machinery-equipment" element={<MachineryAndEquipment />} />
            <Route path="/machine-details" element={<MachineryDetails />} />
            <Route path="/machine-details/:name" element={<MachineryDetails />} />
            <Route path="/machinery/:name" element={<MachineryDetails />} />
            <Route path="/machinery-details/:name" element={<MachineryDetails />} />

            {/* Product Routes */}
            <Route path="/products" element={<Product />} />
            <Route path="/product/:name" element={<ProductDetails />} />
            <Route path="/product-details" element={<ProductDetails />} />
            <Route path="/product-details/:name" element={<ProductDetails />} />

            {/* Blog Routes */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog-details" element={<BlogDetails />} />
            <Route path="/blog/:slug" element={<BlogDetails />} />
            <Route path="/blog-details/:slug" element={<BlogDetails />} />

            {/* Static & Support Pages */}
            <Route path="/team" element={<Team />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQs />} />
            <Route path="/services" element={<MachineryAndEquipment />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />

            {/* Authentication & User Profile */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/create-user" element={<Register />} />
            <Route path="/account" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;