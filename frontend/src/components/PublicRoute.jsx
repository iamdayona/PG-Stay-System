import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../utils/api";

/**
 * PublicRoute
 * - If already logged in → redirect to their dashboard (can't re-visit login/register)
 * - Otherwise           → show the page (Login / Register)
 *
 * Because we use replace:true on logout (in RoleNavigation),
 * pressing Back from /login always goes to / (Home), never back to a protected page.
 *
 * Usage:
 *   <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
 *   <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
 */
const PublicRoute = ({ children }) => {
  const token = getToken();
  const user  = getUser();

  if (token && user?.role) {
    // Already logged in — send them to their dashboard
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

export default PublicRoute;