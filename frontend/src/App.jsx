import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerProfile from "./pages/OwnerProfile";
import PGSManagement from "./pages/PGSManagement";
import OwnerApplications from "./pages/OwnerApplications";
import TenantFindPGs from "./pages/TenantFindPGs";
import TenantApplications from "./pages/TenantApplications";
import TenantNotifications from "./pages/TenantNotifications";

import OwnerNotifications from "./pages/OwnerNotifications";
import AdminVerifyMonitor from "./pages/AdminVerifyMonitor";
import AdminDashboard from "./pages/AdminDashboard";
import TenantDashboard from "./pages/TenantDashboard";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Tenant Routes */}
      <Route path="/tenant/findpgs" element={<TenantFindPGs />} />
      <Route path="/tenant/applications" element={<TenantApplications />} />
      <Route path="/tenant/notifications" element={<TenantNotifications />} />
      {/* Login */}
      <Route path="/login" element={<Login />} />
      <Route path="/userprofile" element={<UserProfile />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/verifymonitor" element={<AdminVerifyMonitor />} />

       {/* Tenant Routes */}
      <Route path="/tenant/dashboard" element={<TenantDashboard />} />

      {/* Owner Routes */}
      <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      <Route path="/owner/profile" element={<OwnerProfile />} />
      <Route path="/owner/pgsmanagement" element={<PGSManagement />} />
      <Route path="/owner/applications" element={<OwnerApplications />} />
      <Route path="/owner/notifications" element={<OwnerNotifications />} />
    </Routes>
  );
}

export default App;
