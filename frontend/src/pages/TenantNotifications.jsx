import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Bell, CheckCircle2, AlertCircle, Star } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";

export default function TenantNotifications() {
  const notifications = [
    { 
      type: "success", 
      message: "Your application to Green Valley PG has been approved!", 
      time: "2 hours ago" 
    },
    { 
      type: "info", 
      message: "Reminder: Monthly rent payment due on Feb 5, 2026", 
      time: "1 day ago" 
    },
    { 
      type: "update", 
      message: "Sunshine Residency is reviewing your application", 
      time: "2 days ago" 
    },
    { 
      type: "alert", 
      message: "Please complete identity verification to proceed", 
      time: "3 days ago" 
    },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "alert":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="tenant" />
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-8 text-gray-800">
          Tenant Notifications & Feedback
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Notifications */}
          <Card className="p-6 bg-white border border-gray-300">
            <h3 className="text-lg mb-4 text-gray-800 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h3>
            
            <div className="space-y-4">
              {notifications.map((notif, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 border border-gray-300 rounded flex gap-3"
                >
                  {getNotificationIcon(notif.type)}
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm mb-1">
                      {notif.message}
                    </p>
                    <span className="text-xs text-gray-500">
                      {notif.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Feedback */}
          <div>
            <Card className="p-6 bg-white border border-gray-300">
              <h3 className="text-lg mb-4 text-gray-800">
                Submit Feedback
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-700 mb-2 block">
                    Rate your PG experience
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star}>
                        <Star
                          className={`w-8 h-8 ${
                            star <= 4
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    4 out of 5 stars
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-700 mb-2 block">
                    PG Name
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800">
                    <option>Green Valley PG</option>
                    <option>Sunshine Residency</option>
                    <option>Student Haven</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-700 mb-2 block">
                    Your Feedback
                  </label>
                  <Textarea
                    rows={6}
                    placeholder="Share your experience..."
                    className="border-gray-300"
                  />
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Submit Feedback
                </Button>
              </div>
            </Card>

            {/* Recent Feedback */}
            <Card className="p-6 bg-white border border-gray-300 mt-6">
              <h3 className="text-lg mb-4 text-gray-800">
                Your Recent Feedback
              </h3>
              
              <div className="p-3 bg-gray-50 border border-gray-300 rounded">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-800">
                    Green Valley PG
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((star) => (
                      <Star
                        key={star}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <Star className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  Great facilities and friendly staff. Highly recommended!
                </p>
                <span className="text-xs text-gray-500 block mt-1">
                  Jan 30, 2026
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
