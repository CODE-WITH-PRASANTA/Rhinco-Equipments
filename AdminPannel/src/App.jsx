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
import Enquiry from "./Components/Enquiry/Enquiry";
import Login from "./Components/Login/Login";
import ProtectedRoutes from "./Components/ProtectedRoutes/ProtectedRoutes"; // adjust path if needed

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route (No Sidebar/Topbar) */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Panel Routes */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="category" element={<Catagory />} />
            <Route path="products/add" element={<AddPost />} />
            <Route path="products" element={<ManageProduct />} />
            <Route path="machinery-equipment/add" element={<MachineryEquipment />} />
            <Route path="machinery-equipment" element={<EquipmentManagement />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="enquiry" element={<Enquiry />} />
          </Route>
        </Route>

        {/* Catch-all unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;