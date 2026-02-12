<<<<<<< HEAD
import React from "react";

function RoleNavigation({ role }) {
  return (
    <div>
      {/* Top nav with role-based dashboard title */}
      <nav className="bg-blue-600 text-white px-6 py-4">
        <h1 className="text-xl font-semibold">
          {role === "tenant" ? "Tenant Dashboard" : "Dashboard"}
        </h1>
      </nav>

      {/* Sub-header showing the logged-in role */}
      <div className="bg-white border-b border-gray-300 px-6 py-3">
        <p className="text-gray-700 text-sm">
          Logged in as <span className="font-medium capitalize">{role}</span>
        </p>
      </div>
    </div>
  );
}

export default RoleNavigation;
=======
const RoleNavigation = ({ role }) => {
  return (
    <div className="bg-white border-b border-gray-300 px-6 py-3">
      <p className="text-gray-700 text-sm">
        Logged in as <span className="font-medium capitalize">{role}</span>
      </p>
    </div>
  );
};

export default RoleNavigation;
>>>>>>> main
