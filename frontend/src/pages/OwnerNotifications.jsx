import React from "react";
import { Bell, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function OwnerNotifications() {
  const notifications = [
    {
      type: "application",
      message: "New application received from John Doe for Green Valley PG",
      time: "30 minutes ago",
    },
    {
      type: "application",
      message: "Priya Sharma applied for Sunshine Residency - Double Room",
      time: "2 hours ago",
    },
    {
      type: "success",
      message: "Your PG 'Green Valley' has been verified by admin",
      time: "1 day ago",
    },
    {
      type: "info",
      message: "Reminder: Update room availability status",
      time: "2 days ago",
    },
    {
      type: "alert",
      message: "Complaint received - Please address maintenance issues",
      time: "3 days ago",
    },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "alert":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "application":
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: 24 }}>
      <h2 style={{ fontSize: 24, marginBottom: 24 }}>
        Owner Notifications
      </h2>

      <div style={{ background: "#fff", padding: 20, borderRadius: 6 }}>
        {notifications.map((notif, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: 12,
              padding: 12,
              marginBottom: 12,
              border: "1px solid #ddd",
              borderRadius: 6,
              background: "#f9f9f9",
            }}
          >
            {getNotificationIcon(notif.type)}
            <div>
              <p style={{ marginBottom: 4 }}>{notif.message}</p>
              <small style={{ color: "#666" }}>{notif.time}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


