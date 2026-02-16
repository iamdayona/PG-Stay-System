import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { CheckCircle2, AlertCircle, Users, Building2 } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: CheckCircle2,
      title: "Verification & Management",
      description: "Review and verify user identities and PG listings",
      path: "/admin/verifymonitor",
    },
    {
      icon: AlertCircle,
      title: "Monitor Trust Scores",
      description: "Track and manage user trust scores",
      path: "/admin/monitortrustscore",
    },
    {
      icon: Users,
      title: "Handle Complaints",
      description: "Review and resolve user complaints",
      path: "/admin/handlecomplaints",
    },
    {
      icon: Building2,
      title: "System Monitoring",
      description: "Monitor overall system health and activity",
      path: "/admin/systemmonitoring",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="admin" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl text-gray-800 mb-2">Admin Control Panel</h2>
          <p className="text-gray-600">
            Monitor and manage the PG accommodation system.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white border border-gray-300">
            <p className="text-gray-600 text-sm mb-1">Total Users</p>
            <p className="text-3xl text-blue-600">248</p>
          </Card>

          <Card className="p-6 bg-white border border-gray-300">
            <p className="text-gray-600 text-sm mb-1">PG Stays Listed</p>
            <p className="text-3xl text-blue-600">48</p>
          </Card>

          <Card className="p-6 bg-white border border-gray-300">
            <p className="text-gray-600 text-sm mb-1">
              Pending Verifications
            </p>
            <p className="text-3xl text-yellow-600">10</p>
          </Card>

          <Card className="p-6 bg-white border border-gray-300">
            <p className="text-gray-600 text-sm mb-1">Open Complaints</p>
            <p className="text-3xl text-red-600">12</p>
          </Card>
        </div>

        {/* Menu Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                onClick={() => navigate(item.path)}
                className="p-6 bg-white border border-gray-300 hover:border-blue-600 cursor-pointer transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg text-gray-800 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="mt-8 p-6 bg-white border border-gray-300">
          <h3 className="text-lg text-gray-800 mb-4">
            Recent System Activity
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 border border-gray-300 rounded">
              <div>
                <p className="text-sm text-gray-800">
                  New PG listing pending verification: Elite Accommodation
                </p>
                <span className="text-xs text-gray-500">15 minutes ago</span>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded">
                Pending
              </span>
            </div>

            <div className="flex justify-between p-3 bg-gray-50 border border-gray-300 rounded">
              <div>
                <p className="text-sm text-gray-800">
                  Complaint filed against Student Haven PG
                </p>
                <span className="text-xs text-gray-500">1 hour ago</span>
              </div>
              <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded">
                Action Required
              </span>
            </div>

            <div className="flex justify-between p-3 bg-gray-50 border border-gray-300 rounded">
              <div>
                <p className="text-sm text-gray-800">
                  Green Valley PG verified successfully
                </p>
                <span className="text-xs text-gray-500">3 hours ago</span>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded">
                Completed
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
