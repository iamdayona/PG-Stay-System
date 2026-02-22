import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle2, XCircle, Eye, Trash2 } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";

export default function AdminVerifyMonitor() {
  const pgListings = [
    {
      pgName: "Green Valley PG",
      owner: "Rajesh Kumar",
      status: "Verified",
      trustScore: 92,
      complaints: 0,
    },
    {
      pgName: "Sunshine Residency",
      owner: "Priya Sharma",
      status: "Pending",
      trustScore: 88,
      complaints: 0,
    },
    {
      pgName: "Student Haven",
      owner: "Amit Singh",
      status: "Verified",
      trustScore: 85,
      complaints: 2,
    },
    {
      pgName: "Comfort Stay PG",
      owner: "Neha Gupta",
      status: "Pending",
      trustScore: 90,
      complaints: 0,
    },
    {
      pgName: "Elite Accommodation",
      owner: "Vikram Patel",
      status: "Restricted",
      trustScore: 72,
      complaints: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="admin" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-8 text-gray-800">
          Admin Verification & Management
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white border border-gray-300 text-center">
            <p className="text-3xl text-blue-600 mb-2">48</p>
            <p className="text-sm text-gray-600">PG Stays Listed</p>
          </Card>

          <Card className="p-6 bg-white border border-gray-300 text-center">
            <p className="text-3xl text-green-600 mb-2">35</p>
            <p className="text-sm text-gray-600">Verified PG Stays</p>
          </Card>

          <Card className="p-6 bg-white border border-gray-300 text-center">
            <p className="text-3xl text-yellow-600 mb-2">10</p>
            <p className="text-sm text-gray-600">Pending Verification</p>
          </Card>

          <Card className="p-6 bg-white border border-gray-300 text-center">
            <p className="text-3xl text-red-600 mb-2">12</p>
            <p className="text-sm text-gray-600">Open Complaints</p>
          </Card>
        </div>

        {/* PG Verification Table */}
        <Card className="p-6 bg-white border border-gray-300 mb-6">
          <h3 className="text-lg mb-6 text-gray-800">
            PG Verification and Management
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-3 px-4">PG Name</th>
                  <th className="text-left py-3 px-4">Owner</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Trust Score</th>
                  <th className="text-left py-3 px-4">Complaints</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {pgListings.map((pg, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">{pg.pgName}</td>
                    <td className="py-3 px-4">{pg.owner}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded text-sm ${
                          pg.status === "Verified"
                            ? "bg-green-100 text-green-700"
                            : pg.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {pg.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`${
                          pg.trustScore >= 85
                            ? "text-green-600"
                            : pg.trustScore >= 75
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {pg.trustScore}/100
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={
                          pg.complaints > 0
                            ? "text-red-600"
                            : "text-gray-600"
                        }
                      >
                        {pg.complaints}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>

                        {pg.status === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>

                            <Button size="sm" variant="destructive">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        {pg.status === "Verified" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            Restrict
                          </Button>
                        )}

                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Complaints Section */}
        <Card className="p-6 bg-white border border-gray-300">
          <h3 className="text-lg mb-6 text-gray-800">
            Handle Complaints
          </h3>

          <div className="space-y-3">
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-800">
                    Complaint against Student Haven PG
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Reported by: John Doe — “Poor maintenance and hygiene issues”
                  </p>
                  <span className="text-xs text-gray-500">2 days ago</span>
                </div>

                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
