import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Building2, FileText, Bell } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { Card } from "../components/ui/card";
import { apiGetOwnerPGs, apiGetOwnerApplications } from "../utils/api";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [pgSummary, setPgSummary]   = useState({ totalPGs: 0, totalRooms: 0, occupiedRooms: 0 });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([apiGetOwnerPGs(), apiGetOwnerApplications()])
      .then(([pgsRes, appsRes]) => {
        const pgs = pgsRes.data;
        const totalRooms    = pgs.reduce((s, p) => s + (p.totalRooms    || 0), 0);
        const occupiedRooms = pgs.reduce((s, p) => s + (p.occupiedRooms || 0), 0);
        setPgSummary({ totalPGs: pgs.length, totalRooms, occupiedRooms });
        setRecentApps(appsRes.data.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = recentApps.filter((a) => a.status === "Pending").length;

  const menuItems = [
    { icon: User,      title: "Profile & Verification", description: "Manage your owner profile and documents",   path: "/owner/profile" },
    { icon: Building2, title: "Manage PG Stays",        description: "Add and manage your PG properties",          path: "/owner/pgsmanagement" },
    { icon: FileText,  title: "Requests Received",      description: "Review and approve tenant applications",      path: "/owner/applications" },
    { icon: Bell,      title: "Notifications",          description: "View updates and messages",                   path: "/owner/notifications" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="owner" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl text-gray-800 mb-2">PG Stay Owner Dashboard</h2>
          <p className="text-gray-600">Manage your properties and tenant requests.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "PG Stays Listed",  value: pgSummary.totalPGs,                                  color: "text-blue-600" },
            { label: "Total Rooms",       value: pgSummary.totalRooms,                                 color: "text-blue-600" },
            { label: "Rooms Occupied",    value: pgSummary.occupiedRooms,                              color: "text-green-600" },
            { label: "Pending Requests",  value: recentApps.filter(a => a.status === "Pending").length, color: "text-yellow-600" },
          ].map((c, i) => (
            <Card key={i} className="p-6 bg-white border border-gray-300">
              <p className="text-gray-600 text-sm mb-1">{c.label}</p>
              <p className={`text-3xl ${c.color}`}>{loading ? "..." : c.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} onClick={() => navigate(item.path)} className="p-6 bg-white border border-gray-300 hover:border-blue-600 cursor-pointer transition-all">
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

        <Card className="mt-8 p-6 bg-white border border-gray-300">
          <h3 className="text-lg text-gray-800 mb-4">Recent Requests</h3>
          {loading ? <p className="text-sm text-gray-500">Loading...</p> : recentApps.length === 0 ? (
            <p className="text-sm text-gray-500">No recent requests.</p>
          ) : (
            <div className="space-y-3">
              {recentApps.map((app, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded">
                  <div>
                    <p className="text-sm text-gray-800">
                      {app.tenant?.name} applied for {app.pgStay?.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded ${
                    app.status === "Approved" ? "bg-green-100 text-green-700" :
                    app.status === "Rejected" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>{app.status}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}