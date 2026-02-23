import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import RoleNavigation from "../context/RoleNavigation";
import {
  User,
  Search,
  FileText,
  Bell,
  CheckCircle2,
  Clock,
} from "lucide-react";

function TenantDashboard() {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: User,
      title: "Profile & Verification",
      description: "Manage your profile and identity verification",
      path: "/tenant/profile",
    },
    {
      icon: Search,
      title: "Search PG",
      description: "Find and apply for PG accommodations",
      path: "/tenant/findpgs",
    },
    {
      icon: FileText,
      title: "My Applications",
      description: "Track your application status",
      path: "/tenant/applications",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "View updates and feedback",
      path: "/tenant/notifications",
    },
  ];

  return (

    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="tenant" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-2">
          Tenant Dashboard
        </h2>
        <p className="text-gray-600 mb-8">
          Welcome back! Manage your PG search and applications.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-gray-600">Verification Status</p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-600" />
              <span>Verified</span>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600">Active Requests</p>
            <p className="text-3xl text-blue-600">3</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600">Profile Completion</p>
            <p className="text-3xl text-green-600">90%</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                onClick={() => navigate(item.path)}
                className="p-6 cursor-pointer hover:border-blue-600"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                    <Icon className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 p-6">
          <h3 className="text-lg mb-4">Recent Activity</h3>

          <div className="space-y-3">
            <div className="flex gap-3 p-3 border rounded bg-gray-50">
              <CheckCircle2 className="text-green-600" />
              <div>
                <p>Application approved for Green Valley PG</p>
                <small className="text-gray-500">2 hours ago</small>
              </div>
            </div>

            <div className="flex gap-3 p-3 border rounded bg-gray-50">
              <Clock className="text-yellow-600" />
              <div>
                <p>Sunshine Residency is reviewing your application</p>
                <small className="text-gray-500">1 day ago</small>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default TenantDashboard;
