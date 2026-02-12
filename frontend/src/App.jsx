import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerProfile from "./pages/OwnerProfile";
import PGSManagement from "./pages/PGSManagement";
import OwnerApplications from "./pages/OwnerApplications";
import TenantFindPGs from "./pages/TenantFindPGs";
import TenantApplications from "./pages/TenantApplications";
import TenantNotifications from "./pages/TenantNotifications";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Tenant Routes */}
      <Route path="/tenant/findpgs" element={<TenantFindPGs />} />
      <Route path="/tenant/applications" element={<TenantApplications />} />
      <Route path="/tenant/notifications" element={<TenantNotifications />} />

      {/* Owner Routes */}
      <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      <Route path="/owner/profile" element={<OwnerProfile />} />
      <Route path="/owner/pgsmanagement" element={<PGSManagement />} />
      <Route path="/owner/applications" element={<OwnerApplications />} />
    </Routes>
  );
}

export default App;
