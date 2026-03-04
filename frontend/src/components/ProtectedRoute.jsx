import { Navigate, useLocation } from "react-router-dom";
import { getToken, getUser } from "../utils/api";

/**
 * ProtectedRoute
 * - If not logged in  → redirect to /login (replaces history so back won't return here)
 * - If wrong role     → redirect to their own dashboard
 * - Otherwise        → render the page
 *
 * Usage:
 *   <Route path="/tenant/dashboard" element={
 *     <ProtectedRoute role="tenant"><TenantDashboard /></ProtectedRoute>
 *   } />
 */
const ProtectedRoute = ({ children, role }) => {
  const token = getToken();
  const user  = getUser();
  const location = useLocation();

  // ── Not logged in at all ───────────────────────────────────────────────────
  if (!token || !user) {
    // replace:true means the protected page is removed from history
    // so pressing Back from /login won't return to it
    return <Navigate to="/login" replace />;
  }

  // ── Logged in but wrong role (e.g. owner trying to access /tenant/*) ───────
  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;