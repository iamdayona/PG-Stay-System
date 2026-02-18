import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import RoleNavigation from "../context/RoleNavigation";
import {
  Activity,
  Server,
  Users,
  Database,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function AdminSystemMonitoring() {
  const systemStats = [
    {
      title: "Server Status",
      value: "Operational",
      icon: Server,
      status: "good",
    },
    {
      title: "Database",
      value: "Connected",
      icon: Database,
      status: "good",
    },
    {
      title: "Active Users",
      value: "132",
      icon: Users,
      status: "neutral",
    },
    {
      title: "System Load",
      value: "72%",
      icon: Activity,
      status: "warning",
    },
  ];

  const logs = [
    {
      message: "PG listing approved: Green Valley PG",
      time: "10 minutes ago",
      status: "success",
    },
    {
      message: "High traffic detected on Find PGs page",
      time: "45 minutes ago",
      status: "warning",
    },
    {
      message: "Database backup completed successfully",
      time: "2 hours ago",
      status: "success",
    },
    {
      message: "Temporary login failure detected",
      time: "4 hours ago",
      status: "alert",
    },
  ];

  const statusBadge = (status) => {
    if (status === "success") {
      return (
        <Badge className="bg-green-100 text-green-700">
          Success
        </Badge>
      );
    }
    if (status === "warning") {
      return (
        <Badge className="bg-yellow-100 text-yellow-700">
          Warning
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-700">
        Alert
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="admin" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-6 text-gray-800">
          System Monitoring
        </h2>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="p-5 bg-white border border-gray-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-xl font-semibold text-gray-800">
                      {stat.value}
                    </p>
                  </div>
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>

                <div className="mt-3">
                  {stat.status === "good" && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Healthy
                    </span>
                  )}

                  {stat.status === "warning" && (
                    <span className="text-sm text-yellow-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Moderate Load
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* System Logs */}
        <Card className="p-6 bg-white border border-gray-300">
          <h3 className="text-lg mb-4 text-gray-800">
            Recent System Activity
          </h3>

          <div className="space-y-4">
            {logs.map((log, index) => (
              <div
                key={index}
                className="flex justify-between items-start p-4 bg-gray-50 border border-gray-300 rounded"
              >
                <div>
                  <p className="text-sm text-gray-800 mb-1">
                    {log.message}
                  </p>
                  <span className="text-xs text-gray-500">
                    {log.time}
                  </span>
                </div>

                {statusBadge(log.status)}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}