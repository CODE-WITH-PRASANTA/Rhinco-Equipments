import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";




import "./App.css";
import Topbar from "./Components/Topbar/Topbar";
import Home from "./Pages/Home/Home";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";

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
          </Routes>
        </main>

        <Footer />

      </div>
    </BrowserRouter>
  );
};

export default App;