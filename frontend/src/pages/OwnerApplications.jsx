import { CheckCircle2, XCircle, Eye } from "lucide-react";

import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import RoleNavigation from "../components/RoleNavigation";

export default function OwnerApplications() {
  const applications = [
    {
      tenantName: "John Doe",
      pgName: "Green Valley PG",
      roomType: "Single AC",
      appliedDate: "Feb 1, 2026",
      trustScore: 85,
      status: "Pending",
    },
    {
      tenantName: "Priya Sharma",
      pgName: "Green Valley PG",
      roomType: "Double",
      appliedDate: "Jan 30, 2026",
      trustScore: 92,
      status: "Pending",
    },
    {
      tenantName: "Rahul Kumar",
      pgName: "Sunshine Residency",
      roomType: "Single",
      appliedDate: "Jan 28, 2026",
      trustScore: 78,
      status: "Approved",
    },
    {
      tenantName: "Anjali Singh",
      pgName: "Green Valley PG",
      roomType: "Triple",
      appliedDate: "Jan 25, 2026",
      trustScore: 65,
      status: "Rejected",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="owner" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-8 text-gray-800">
          Applications Received
        </h2>

        <div className="space-y-4">
          {applications.map((app, index) => (
            <Card
              key={index}
              className="p-6 bg-white border border-gray-300"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl text-gray-800 mb-1">
                        {app.tenantName}
                      </h3>
                      <p className="text-gray-600">
                        {app.pgName} – {app.roomType}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied on: {app.appliedDate}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">
                        Trust Score
                      </p>
                      <span
                        className={`text-2xl ${
                          app.trustScore >= 85
                            ? "text-green-600"
                            : app.trustScore >= 75
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {app.trustScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Status Section */}
                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        Current Status:
                      </span>
                      <span
                        className={`px-3 py-1 rounded text-sm ${
                          app.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : app.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    {/* Actions */}
                    {app.status === "Pending" && (
                      <div className="flex gap-3 mt-4">
                        <Button className="bg-blue-600 hover:bg-blue-700 w-40">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>

                        <Button className="bg-green-600 hover:bg-green-700 w-40">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve
                        </Button>

                        <Button className="bg-red-600 hover:bg-red-700 w-40">
                          <XCircle className="w-4 h-4 mr-2" />
                           Reject
                        </Button>
                      </div>
                    )}

                    {app.status === "Approved" && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Allocation Status:
                        </p>
                        <div className="bg-green-50 border border-green-300 p-3 rounded">
                          <p className="text-sm text-green-700">
                            Room allocated successfully
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}