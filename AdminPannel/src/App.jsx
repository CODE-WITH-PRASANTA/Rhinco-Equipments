import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./Layout/MainLayout/MainLayout";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Catagory from "./Components/Catagory/Catagory";
import AddPost from "./Components/AddPost/AddPost";
import ManageProduct from "./Components/ManageProduct/ManageProduct";
import MachineryEquipment from "./Components/MachineryEquipment/MachineryEquipment";
import EquipmentManagement from "./Components/EquipmentManagement/EquipmentManagement";
import TeamManagement from "./Components/TeamManagement/TeamManagement";

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
          <Route path="/team" element={<TeamManagement />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;