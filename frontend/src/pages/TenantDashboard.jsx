import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import RoleNavigation from "../context/RoleNavigation";
import { User, Search, FileText, Bell, CheckCircle2, Clock } from "lucide-react";
import { apiGetMe, apiGetMyApplications, getUser } from "../utils/api";

export default function TenantDashboard() {
  const navigate = useNavigate();
  const [user, setUser]         = useState(getUser());
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([apiGetMe(), apiGetMyApplications()])
      .then(([meRes, appsRes]) => {
        setUser(meRes.user);
        setRecentApps(appsRes.data.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const menuItems = [
    { icon: User,     title: "Profile & Verification", description: "Manage your profile and identity verification", path: "/tenant/profile" },
    { icon: Search,   title: "Search PG",              description: "Find and apply for PG accommodations",          path: "/tenant/findpgs" },
    { icon: FileText, title: "My Applications",        description: "Track your application status",                 path: "/tenant/applications" },
    { icon: Bell,     title: "Notifications",          description: "View updates and feedback",                     path: "/tenant/notifications" },
  ];

  const activeCount = recentApps.filter((a) => ["Pending", "Under Review"].includes(a.status)).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="tenant" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-2">Tenant Dashboard</h2>
        <p className="text-gray-600 mb-8">Welcome back, {user?.name}! Manage your PG search and applications.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-white border border-gray-300">
            <p className="text-sm text-gray-600">Verification Status</p>
            <div className="flex items-center gap-2 mt-1">
              {user?.verificationStatus === "verified" ? (
                <><CheckCircle2 className="text-green-600 w-5 h-5" /><span className="text-green-600">Verified</span></>
              ) : (
                <span className="text-yellow-600 capitalize">{user?.verificationStatus || "Unverified"}</span>
              )}
            </div>
          </Card>
          <Card className="p-6 bg-white border border-gray-300">
            <p className="text-sm text-gray-600">Active Requests</p>
            <p className="text-3xl text-blue-600">{loading ? "..." : activeCount}</p>
          </Card>
          <Card className="p-6 bg-white border border-gray-300">
            <p className="text-sm text-gray-600">Profile Completion</p>
            <p className="text-3xl text-green-600">{loading ? "..." : `${user?.profileCompletion || 0}%`}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} onClick={() => navigate(item.path)} className="p-6 bg-white border border-gray-300 cursor-pointer hover:border-blue-600 transition-all">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                    <Icon className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 p-6 bg-white border border-gray-300">
          <h3 className="text-lg mb-4">Recent Activity</h3>
          {loading ? <p className="text-sm text-gray-500">Loading...</p> : recentApps.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity. Start by searching for a PG!</p>
          ) : (
            <div className="space-y-3">
              {recentApps.map((app, i) => (
                <div key={i} className="flex gap-3 p-3 border rounded bg-gray-50">
                  {app.status === "Approved"
                    ? <CheckCircle2 className="text-green-600 w-5 h-5" />
                    : <Clock className="text-yellow-600 w-5 h-5" />
                  }
                  <div>
                    <p className="text-sm">{app.pgStay?.name} — {app.status}</p>
                    <small className="text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}