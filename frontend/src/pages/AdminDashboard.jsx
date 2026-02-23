import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { CheckCircle2, AlertCircle, Users, Building2 } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiAdminStats } from "../utils/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiAdminStats()
      .then((data) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const menuItems = [
    { icon: CheckCircle2, title: "Verification & Management", description: "Review and verify user identities and PG listings", path: "/admin/verifymonitor" },
    { icon: AlertCircle,  title: "Monitor Trust Scores",      description: "Track and manage user trust scores",              path: "/admin/monitortrustscore" },
    { icon: Users,        title: "Handle Complaints",         description: "Review and resolve user complaints",              path: "/admin/handlecomplaints" },
    { icon: Building2,    title: "System Monitoring",         description: "Monitor overall system health and activity",      path: "/admin/systemmonitoring" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="admin" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl text-gray-800 mb-2">Admin Control Panel</h2>
          <p className="text-gray-600">Monitor and manage the PG accommodation system.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users",           value: stats?.totalUsers,           color: "text-blue-600" },
            { label: "PG Stays Listed",        value: stats?.totalPGs,             color: "text-blue-600" },
            { label: "Pending Verifications",  value: stats?.pendingVerifications, color: "text-yellow-600" },
            { label: "Active Bookings",        value: stats?.activeBookings,       color: "text-green-600" },
          ].map((c, i) => (
            <Card key={i} className="p-6 bg-white border border-gray-300">
              <p className="text-gray-600 text-sm mb-1">{c.label}</p>
              <p className={`text-3xl ${c.color}`}>
                {loading ? "..." : (c.value ?? 0)}
              </p>
            </Card>
          ))}
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
                    <h3 className="text-lg text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent PGs pending verification */}
        <Card className="mt-8 p-6 bg-white border border-gray-300">
          <h3 className="text-lg text-gray-800 mb-4">Recent Pending Verifications</h3>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : stats?.recentPGs?.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending verifications.</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentPGs?.map((pg, i) => (
                <div key={i} className="flex justify-between p-3 bg-gray-50 border border-gray-300 rounded">
                  <div>
                    <p className="text-sm text-gray-800">{pg.name} — {pg.owner?.name}</p>
                    <span className="text-xs text-gray-500">{new Date(pg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded">Pending</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}