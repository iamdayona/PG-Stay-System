import { useNavigate } from "react-router-dom";
const RoleNavigation = ({ role }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-300 px-6 py-3 flex justify-between items-center">
      <p className="text-gray-700 text-sm">
        Logged in as <span className="font-medium capitalize">{role}</span>
      </p>
      <button
      onClick={() => navigate(-1)}
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
    >
      Go Back
    </button>
    </div>
  );
};

export default RoleNavigation;
