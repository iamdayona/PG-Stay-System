import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute    from "./components/PublicRoute";

import Home     from "./pages/Home";
import Login    from "./pages/Login";
import Register from "./pages/Register";
import About    from "./pages/About";
import Contact  from "./pages/Contact";
import Help     from "./pages/Help";

import AdminDashboard        from "./pages/AdminDashboard";
import AdminVerifyMonitor    from "./pages/AdminVerifyMonitor";
import AdminHandleComplaints from "./pages/AdminHandleComplaints";
import AdminSystemMonitoring from "./pages/AdminSystemMonitoring";
import AdminMonitorTrustScores from "./pages/AdminMonitorTrustScores";

import OwnerDashboard      from "./pages/OwnerDashboard";
import OwnerNotifications  from "./pages/OwnerNotifications";
import OwnerProfile        from "./pages/OwnerProfile";
import OwnerPGSManagement  from "./pages/OwnerPGSManagement";
import OwnerApplications   from "./pages/OwnerApplications";

import TenantDashboard     from "./pages/TenantDashboard";
import TenantProfile       from "./pages/TenantProfile";
import TenantFindPGs       from "./pages/TenantFindPGs";
import TenantApplications  from "./pages/TenantApplications";
import TenantNotifications from "./pages/TenantNotifications";

function App() {
  return (
    <Routes>

      {/* ── Public pages (no auth needed) ──────────────────────────────── */}
      <Route path="/" element={<Home />} />
      <Route path="/about"   element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/help"    element={<Help />} />

      {/* ── Auth pages (redirect to dashboard if already logged in) ─────── */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* ── Admin routes ────────────────────────────────────────────────── */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/verifymonitor" element={
        <ProtectedRoute role="admin"><AdminVerifyMonitor /></ProtectedRoute>
      } />
      <Route path="/admin/handlecomplaints" element={
        <ProtectedRoute role="admin"><AdminHandleComplaints /></ProtectedRoute>
      } />
      <Route path="/admin/systemmonitoring" element={
        <ProtectedRoute role="admin"><AdminSystemMonitoring /></ProtectedRoute>
      } />
      <Route path="/admin/monitortrustscore" element={
        <ProtectedRoute role="admin"><AdminMonitorTrustScores /></ProtectedRoute>
      } />

      {/* ── Owner routes ────────────────────────────────────────────────── */}
      <Route path="/owner/dashboard" element={
        <ProtectedRoute role="owner"><OwnerDashboard /></ProtectedRoute>
      } />
      <Route path="/owner/profile" element={
        <ProtectedRoute role="owner"><OwnerProfile /></ProtectedRoute>
      } />
      <Route path="/owner/pgsmanagement" element={
        <ProtectedRoute role="owner"><OwnerPGSManagement /></ProtectedRoute>
      } />
      <Route path="/owner/applications" element={
        <ProtectedRoute role="owner"><OwnerApplications /></ProtectedRoute>
      } />
      <Route path="/owner/notifications" element={
        <ProtectedRoute role="owner"><OwnerNotifications /></ProtectedRoute>
      } />

      {/* ── Tenant routes ────────────────────────────────────────────────── */}
      <Route path="/tenant/dashboard" element={
        <ProtectedRoute role="tenant"><TenantDashboard /></ProtectedRoute>
      } />
      <Route path="/tenant/profile" element={
        <ProtectedRoute role="tenant"><TenantProfile /></ProtectedRoute>
      } />
      <Route path="/tenant/findpgs" element={
        <ProtectedRoute role="tenant"><TenantFindPGs /></ProtectedRoute>
      } />
      <Route path="/tenant/applications" element={
        <ProtectedRoute role="tenant"><TenantApplications /></ProtectedRoute>
      } />
      <Route path="/tenant/notifications" element={
        <ProtectedRoute role="tenant"><TenantNotifications /></ProtectedRoute>
      } />

      {/* ── Catch-all: unknown URLs → Home ──────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;