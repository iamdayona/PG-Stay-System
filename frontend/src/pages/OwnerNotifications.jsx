import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { apiGetNotifications, apiMarkAllRead } from "../utils/api";

export default function OwnerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await apiGetNotifications();
      setNotifications(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const handleMarkAll = async () => {
    try {
      await apiMarkAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) { alert(err.message); }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":     return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "alert":       return <AlertCircle  className="w-5 h-5 text-red-600" />;
      case "application": return <Clock        className="w-5 h-5 text-blue-600" />;
      default:            return <Bell         className="w-5 h-5 text-blue-600" />;
    }
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="owner" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl text-gray-800">
            Owner Notifications {unread > 0 && <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded ml-2">{unread} unread</span>}
          </h2>
          {unread > 0 && (
            <Button variant="outline" className="border-gray-300" onClick={handleMarkAll}>
              Mark all as read
            </Button>
          )}
        </div>

        <Card className="p-6 bg-white border border-gray-300">
          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="text-gray-500 text-sm">No notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`flex gap-3 p-4 border rounded ${
                    notif.isRead ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"
                  }`}
                >
                  {getIcon(notif.type)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 mb-1">{notif.message}</p>
                    <small className="text-gray-500">
                      {new Date(notif.createdAt).toLocaleString()}
                    </small>
                  </div>
                  {!notif.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}