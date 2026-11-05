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
import Contact from "./Pages/Contact/Contact";
import FAQs from "./Pages/FAQs/FAQs";
import MachineryAndEquipment from "./Pages/MachineryAndEquipment/MachineryAndEquipment";

const App = () => {
  return (
    <BrowserRouter>
      <div className="App">

        {/* Topbar - Common on all pages */}
        <Topbar />
        <Navbar />

        {/* Page Routing */}
        <main className="App-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/machine-details" element={<MachineryDetails />} />
            <Route path="/machine-catalogue" element={<MachineryCatalogue />} />

            <Route path="/products" element={<Product />} />
            <Route path="/product-details" element={<ProductDetails />} />
            <Route path="/contact" element={<Contact/>} />
            <Route path="/faq" element={<FAQs/>} />
            <Route path="/machinery-details" element={<MachineryAndEquipment />} />

          </Routes>
        </main>

        <Footer />

      </div>
    </BrowserRouter>
  );
};

export default App;