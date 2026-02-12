import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerProfile from "./pages/OwnerProfile";
import PGSManagement from "./pages/PGSManagement";
import OwnerApplications from "./pages/OwnerApplications";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Owner Routes */}
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/profile" element={<OwnerProfile />} />
        <Route path="/owner/pgsmanagement" element={<PGSManagement />} />
        <Route path="/owner/applications" element={<OwnerApplications />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;