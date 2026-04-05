import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../utils/api";

/**
 * PublicRoute  (/login and /register)
 *
 * - If a valid token + user exists in localStorage → send to their dashboard
 *   (handles the case where someone types /login while already logged in)
 * - After a back-button logout, clearAuth() will have wiped localStorage,
 *   so token is null → the login page renders normally, no auto-redirect.
 */
const PublicRoute = ({ children }) => {
  const token = getToken();
  const user = getUser();

  // Only auto-redirect if genuinely still logged in (token present in storage)
  if (token && user?.role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

export default PublicRoute;