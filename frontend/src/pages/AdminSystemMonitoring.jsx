import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import RoleNavigation from "../context/RoleNavigation";
import { Activity, Server, Users, Database, CheckCircle, AlertTriangle } from "lucide-react";
import { apiAdminSystemStats } from "../utils/api";

export default function AdminSystemMonitoring() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiAdminSystemStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const systemStats = [
    { title: "Server Status", value: stats?.serverStatus || "...", icon: Server,   status: "good" },
    { title: "Database",      value: stats?.dbStatus     || "...", icon: Database, status: "good" },
    { title: "Total Users",   value: stats?.totalUsers   ?? "...", icon: Users,    status: "neutral" },
    { title: "Total Bookings",value: stats?.totalBookings?? "...", icon: Activity, status: "neutral" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="admin" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-6 text-gray-800">System Monitoring</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-5 bg-white border border-gray-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-xl font-semibold text-gray-800">{loading ? "..." : stat.value}</p>
                  </div>
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="mt-3">
                  {stat.status === "good" && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Healthy
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-6 bg-white border border-gray-300">
          <h3 className="text-lg mb-4 text-gray-800">Database Summary</h3>
          {loading ? <p className="text-gray-500 text-sm">Loading...</p> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Users",    value: stats?.totalUsers },
                { label: "Total PG Stays", value: stats?.totalPGs },
                { label: "Total Bookings", value: stats?.totalBookings },
                { label: "Total Feedback", value: stats?.totalFeedback },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-gray-50 border border-gray-300 rounded text-center">
                  <p className="text-2xl font-semibold text-blue-600">{item.value ?? 0}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}