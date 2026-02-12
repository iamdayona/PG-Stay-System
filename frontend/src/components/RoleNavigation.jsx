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
