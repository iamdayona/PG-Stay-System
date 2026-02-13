import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";

export default function TenantApplications() {
  const applications = [
    {
      pgName: "Green Valley PG",
      location: "Sector 62, Noida",
      rent: 8000,
      appliedDate: "Jan 28, 2026",
      status: "Approved",
    },
    {
      pgName: "Sunshine Residency",
      location: "GTB Nagar, Delhi",
      rent: 12000,
      appliedDate: "Feb 1, 2026",
      status: "Under Review",
    },
    {
      pgName: "Student Haven",
      location: "Kalkaji, Delhi",
      rent: 9500,
      appliedDate: "Jan 15, 2026",
      status: "Rejected",
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "Under Review":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "Rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Under Review":
        return "bg-yellow-100 text-yellow-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="tenant" />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-8 text-gray-800">My Applications</h2>

        <div className="space-y-6">
          {applications.map((app, index) => (
            <Card key={index} className="p-6 bg-white border border-gray-300">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl mb-2 text-gray-800">
                    {app.pgName}
                  </h3>
                  <p className="text-gray-600">{app.location}</p>
                  <p className="text-gray-800 mt-1">
                    ₹{app.rent}/month
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Applied on: {app.appliedDate}
                  </p>
                </div>

                <Button variant="outline" className="border-gray-300">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>

              {/* Status Tracker */}
              <div className="border-t border-gray-300 pt-6">
                <h4 className="text-sm text-gray-700 mb-4">
                  Application Status
                </h4>

                <div className="flex items-center justify-between relative">
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300 -z-10"></div>

                  {["Submitted", "Under Review", "Approved"].map(
                    (status, idx) => {
                      const isActive =
                        (app.status === "Approved" && idx <= 2) ||
                        (app.status === "Under Review" && idx <= 1) ||
                        (app.status === "Submitted" && idx === 0) ||
                        (app.status === "Rejected" && idx === 0);

                      return (
                        <div
                          key={status}
                          className="flex flex-col items-center flex-1"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isActive
                                ? "bg-blue-600"
                                : "bg-gray-300"
                            }`}
                          >
                            {isActive ? (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>

                          <span
                            className={`text-sm mt-2 ${
                              isActive
                                ? "text-blue-600"
                                : "text-gray-500"
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 mt-6">
                  {getStatusIcon(app.status)}
                  <span
                    className={`px-4 py-2 rounded ${getStatusColor(
                      app.status
                    )}`}
                  >
                    Current Status: {app.status}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
