import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider } from "./context/useRole";
import { ToastContainer } from "./components/Toast";

// Public pages
import Home        from "./pages/Home";
import Login       from "./pages/Login";
import Register    from "./pages/Register";
import About       from "./pages/About";
import Contact     from "./pages/Contact";
import Help        from "./pages/Help";

// Admin pages
import AdminDashboard         from "./pages/AdminDashboard";
import AdminVerifyMonitor     from "./pages/AdminVerifyMonitor";
import AdminMonitorTrustScores from "./pages/AdminMonitorTrustScores";
import AdminHandleComplaints  from "./pages/AdminHandleComplaints";
import AdminSystemMonitoring  from "./pages/AdminSystemMonitoring";

// Owner pages
import OwnerDashboard      from "./pages/OwnerDashboard";
import OwnerPGSManagement  from "./pages/OwnerPGSManagement";
import OwnerApplications   from "./pages/OwnerApplications";
import OwnerNotifications  from "./pages/OwnerNotifications";
import OwnerProfile        from "./pages/OwnerProfile";

// Tenant pages
import TenantDashboard     from "./pages/TenantDashboard";
import TenantFindPGs       from "./pages/TenantFindPGs";
import TenantApplications  from "./pages/TenantApplications";
import TenantNotifications from "./pages/TenantNotifications";
import TenantProfile       from "./pages/TenantProfile";

// Route guard
import { getUser } from "./utils/api";

function PrivateRoute({ children, role }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <RoleProvider>
        {/* Global toast notifications */}
        <ToastContainer />

        <Routes>
          {/* Public */}
          <Route path="/"        element={<Home />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about"   element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help"    element={<Help />} />

          {/* Admin */}
          <Route path="/admin/dashboard"       element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/verifymonitor"   element={<PrivateRoute role="admin"><AdminVerifyMonitor /></PrivateRoute>} />
          <Route path="/admin/monitortrustscore" element={<PrivateRoute role="admin"><AdminMonitorTrustScores /></PrivateRoute>} />
          <Route path="/admin/handlecomplaints"  element={<PrivateRoute role="admin"><AdminHandleComplaints /></PrivateRoute>} />
          <Route path="/admin/systemmonitoring"  element={<PrivateRoute role="admin"><AdminSystemMonitoring /></PrivateRoute>} />

          {/* Owner */}
          <Route path="/owner/dashboard"      element={<PrivateRoute role="owner"><OwnerDashboard /></PrivateRoute>} />
          <Route path="/owner/pgsmanagement"  element={<PrivateRoute role="owner"><OwnerPGSManagement /></PrivateRoute>} />
          <Route path="/owner/applications"   element={<PrivateRoute role="owner"><OwnerApplications /></PrivateRoute>} />
          <Route path="/owner/notifications"  element={<PrivateRoute role="owner"><OwnerNotifications /></PrivateRoute>} />
          <Route path="/owner/profile"        element={<PrivateRoute role="owner"><OwnerProfile /></PrivateRoute>} />

          {/* Tenant */}
          <Route path="/tenant/dashboard"     element={<PrivateRoute role="tenant"><TenantDashboard /></PrivateRoute>} />
          <Route path="/tenant/findpgs"       element={<PrivateRoute role="tenant"><TenantFindPGs /></PrivateRoute>} />
          <Route path="/tenant/applications"  element={<PrivateRoute role="tenant"><TenantApplications /></PrivateRoute>} />
          <Route path="/tenant/notifications" element={<PrivateRoute role="tenant"><TenantNotifications /></PrivateRoute>} />
          <Route path="/tenant/profile"       element={<PrivateRoute role="tenant"><TenantProfile /></PrivateRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RoleProvider>
    </BrowserRouter>
  );
}
