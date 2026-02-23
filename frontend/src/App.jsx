import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home"

import Login from "./pages/Login";
import Register from "./pages/Register";

import About from "./pages/About";
import Contact from "./pages/Contact";
import Help from "./pages/Help";

import AdminVerifyMonitor from "./pages/AdminVerifyMonitor";
import AdminDashboard from "./pages/AdminDashboard";
import AdminHandleComplaints from "./pages/AdminHandleComplaints";
import AdminSystemMonitoring from "./pages/AdminSystemMonitoring";
import AdminMonitorTrustScores from "./pages/AdminMonitorTrustScores";

import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerNotifications from "./pages/OwnerNotifications";
import OwnerProfile from "./pages/OwnerProfile";
import OwnerPGSManagement from "./pages/OwnerPGSManagement";
import OwnerApplications from "./pages/OwnerApplications";

import TenantProfile from "./pages/TenantProfile";
import TenantFindPGs from "./pages/TenantFindPGs";
import TenantApplications from "./pages/TenantApplications";
import TenantNotifications from "./pages/TenantNotifications";
import TenantDashboard from "./pages/TenantDashboard";



function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Login */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/help" element={<Help />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/verifymonitor" element={<AdminVerifyMonitor />} />
      <Route path="/admin/handlecomplaints" element={<AdminHandleComplaints />} />
      <Route path="/admin/systemmonitoring" element={<AdminSystemMonitoring />} />
      <Route path="/admin/monitortrustscore" element={<AdminMonitorTrustScores />} />

      {/* Tenant Routes */}
      <Route path="/tenant/profile" element={<TenantProfile />} />
      <Route path="/tenant/dashboard" element={<TenantDashboard />} />
      <Route path="/tenant/findpgs" element={<TenantFindPGs />} />
      <Route path="/tenant/applications" element={<TenantApplications />} />
      <Route path="/tenant/notifications" element={<TenantNotifications />} />

      {/* Owner Routes */}
      <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      <Route path="/owner/profile" element={<OwnerProfile />} />
      <Route path="/owner/pgsmanagement" element={<OwnerPGSManagement />} />
      <Route path="/owner/applications" element={<OwnerApplications />} />
      <Route path="/owner/notifications" element={<OwnerNotifications />} />
    </Routes>
  );
}

export default App;
