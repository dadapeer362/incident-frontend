import React from "react";
import { Routes, Route } from "react-router-dom";
import { IncidentListPage } from "./pages/IncidentListPage";
import { IncidentRoomPage } from "./pages/IncidentRoomPage";

// ------------------ App Routes ------------------
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IncidentListPage />} />
      <Route path="/incidents/:id" element={<IncidentRoomPage />} />
    </Routes>
  );
}
