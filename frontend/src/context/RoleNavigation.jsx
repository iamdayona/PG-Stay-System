import { useNavigate } from "react-router-dom";
import { useRole } from "./useRole";
import { clearAuth } from "../utils/api";

const RoleNavigation = ({ role }) => {
  const navigate  = useNavigate();
  const { setRole } = useRole();

  const handleLogout = () => {
    clearAuth();
    setRole(null);
    navigate("/login");
  };

  return (
    <div className="bg-white border-b border-gray-300 px-6 py-3 flex justify-between items-center">
      <p className="text-gray-700 text-sm">
        Logged in as <span className="font-medium capitalize">{role}</span>
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="border border-gray-300 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-50 transition text-sm"
        >
          Go Back
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default RoleNavigation;