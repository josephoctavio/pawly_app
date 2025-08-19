// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Pets from "./pages/Pets";
import PetProfile from "./pages/PetProfile";
import Tasks from "./pages/Tasks";
import AddTask from "./pages/AddTask";
import Settings from "./pages/Settings";
import AddPet from "./pages/AddPet";
import LandingPage from "./pages/LandingPage"; // <- new import

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page first */}
        <Route path="/" element={<LandingPage />} />

        {/* Authenticated app pages */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pets" element={<Pets />} />
          <Route path="pets/add" element={<AddPet />} />
          <Route path="pets/:id" element={<PetProfile />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/new" element={<AddTask />} />
          <Route path="settings" element={<Settings />} />

          {/* fallback inside app layout */}
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
