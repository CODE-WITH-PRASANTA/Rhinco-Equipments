import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Topbar from "./Components/Topbar/Topbar";
import Home from "./Pages/Home/Home";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import MachineryDetails from "./Components/MachineryDetails/MachineryDetails";
import MachineryCatalogue from "./Components/MachineryCatalogue/MachineryCatalogue";
import Product from "./Pages/Product/Product";
import ProductDetails from "./Pages/ProductDetails/ProductDetails";
import Team from "./Pages/Team/Team";
import Blog from "./Pages/Blog/Blog";
import BlogDetails from "./Pages/BlogDetails/BlogDetails";
import Contact from "./Pages/Contact/Contact";
import FAQs from "./Pages/FAQs/FAQs";

import MachineryAndEquipment from "./Pages/MachineryAndEquipment/MachineryAndEquipment";
import Cart from "./Pages/Cart/Cart";
import Wishlist from "./Pages/Wishlist/Wishlist";
import MachinaryEquipment from "./Pages/MachinaryEquipment/MachinaryEquipment";
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
            <Route path="/" element={<Home />} />

            <Route
              path="/machine-details"
              element={<MachineryDetails />}
            />
            <Route
              path="/machine-details/:name"
              element={<MachineryDetails />}
            />
            <Route
              path="/machinery/:name"
              element={<MachineryDetails />}
            />
            <Route
              path="/machinery-details/:name"
              element={<MachineryDetails />}
            />

            <Route
              path="/machine-catalogue"
              element={<MachineryCatalogue />}
            />

            <Route path="/products" element={<Product />} />

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

            <Route
              path="/Product-Details"
              element={<ProductDetails />}
            />

            <Route path="/team" element={<Team />} />

            <Route path="/blog" element={<Blog />} />

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

            <Route path="/contact" element={<Contact />} />

            <Route path="/faq" element={<FAQs />} />

            <Route path="/cart" element={<Cart />} />

            <Route path="/wishlist" element={<Wishlist />} />

            <Route
              path="/machinery-details"
              element={<MachineryDetails />}
            />

            <Route
              path="/machinery"
              element={<MachinaryEquipment />}
            />

            <Route path="/login" element={<Login />} />
            <Route path="/account" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/create-user" element={<Register />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;