import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getToken, getUser, clearAuth } from "../utils/api";

const ProtectedRoute = ({ children, role, isDashboard = false }) => {
  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();

  useEffect(() => {
    if (!isDashboard) return;

    window.history.pushState(null, "", window.location.href);

    const handlePop = () => {
      clearAuth();
      // Stack becomes [/ , /login] so Back from login → Home
      window.history.replaceState(null, "", "/");
      window.history.pushState(null, "", "/login");
      window.location.reload();
    };

    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [navigate, isDashboard]);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;