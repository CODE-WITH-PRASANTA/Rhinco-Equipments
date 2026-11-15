import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./Layout/MainLayout/MainLayout";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Catagory from "./Components/Catagory/Catagory";
import AddPost from "./Components/AddPost/AddPost";
import ManageProduct from "./Components/ManageProduct/ManageProduct";
import MachineryEquipment from "./Components/MachineryEquipment/MachineryEquipment";
import EquipmentManagement from "./Components/EquipmentManagement/EquipmentManagement";
import TeamManagement from "./Components/TeamManagement/TeamManagement";
import BlogPosting from "./Components/BlogPosting/BlogPosting";
import BlogManagement from "./Components/BlogManagement/BlogManagement";
import ReviewManagement from "./Components/ReviewManagement/ReviewManagement";
import EnquiryManagement from "./Components/EnquiryManagement/EnquiryManagement";
import ProductOrders from "./Components/ProductOrders/ProductOrders";
import MachineryOrders from "./Components/MachineryOrders/MachineryOrders";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />
          <Route path="/category" element={<Catagory />} />
          <Route path="/products/add" element={<AddPost />} />
          <Route path="/products" element={<ManageProduct />} />
          <Route path="/machinery-equipment/add" element={<MachineryEquipment />} />
          <Route path="/machinery-equipment" element={<EquipmentManagement />} />
          <Route path="/product-orders" element={<ProductOrders />} />
          <Route path="/machinery-orders" element={<MachineryOrders />} />
          <Route path="/team" element={<TeamManagement />} />

          {/* Review & Enquiry Routes */}
          <Route path="/review" element={<ReviewManagement />} />
          <Route path="/reviews" element={<Navigate to="/review" replace />} />
          <Route path="/enquiry" element={<EnquiryManagement />} />
          <Route path="/enquiries" element={<Navigate to="/enquiry" replace />} />

          {/* Blog Routes */}
          <Route path="/blog/category" element={<Navigate to="/category" replace />} />
          <Route path="/blog" element={<BlogManagement />} />
          <Route path="/blog/new" element={<BlogPosting />} />
          <Route path="/blog/edit/:id" element={<BlogPosting />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
