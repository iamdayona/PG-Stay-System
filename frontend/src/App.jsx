// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home";

// Owner Pages
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerProfile from "./pages/OwnerProfile";
import PGSManagement from "./pages/PGSManagement";
import OwnerApplications from "./pages/OwnerApplications";
import OwnerNotifications from "./pages/OwnerNotifications";

// Tenant Pages
import TenantDashboard from "./pages/TenantDashboard";
import UserProfile from "./pages/UserProfile"; // New page

// Components
import RoleNavigation from "./components/RoleNavigation";

// Unified layout for all roles
function RoleLayout({ role, children }) {
  return (
    <div>
      {/* Blue top bar appears only once */}
      <RoleNavigation role={role} />
      <main>{children}</main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Owner Routes */}
        <Route
          path="/owner/dashboard"
          element={
            <RoleLayout role="owner">
              <OwnerDashboard />
            </RoleLayout>
          }
        />
        <Route
          path="/owner/profile"
          element={
            <RoleLayout role="owner">
              <OwnerProfile />
            </RoleLayout>
          }
        />
        <Route
          path="/owner/pgsmanagement"
          element={
            <RoleLayout role="owner">
              <PGSManagement />
            </RoleLayout>
          }
        />
        <Route
          path="/owner/applications"
          element={
            <RoleLayout role="owner">
              <OwnerApplications />
            </RoleLayout>
          }
        />
        <Route
          path="/owner/notifications"
          element={
            <RoleLayout role="owner">
              <OwnerNotifications />
            </RoleLayout>
          }
        />

        {/* Tenant Routes */}
        <Route
          path="/tenant/dashboard"
          element={
            <RoleLayout role="tenant">
              <TenantDashboard />
            </RoleLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <RoleLayout role="tenant">
              <UserProfile />
            </RoleLayout>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
