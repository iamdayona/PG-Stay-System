import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import RoleNavigation from "../context/RoleNavigation";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

export default function AdminMonitorTrustScores() {
  const trustData = [
    {
      id: 1,
      name: "Green Valley PG",
      type: "PG",
      owner: "Ramesh Kumar",
      trustScore: 92,
      lastUpdated: "Feb 15, 2026",
    },
    {
      id: 2,
      name: "Sunshine Residency",
      type: "PG",
      owner: "Anita Sharma",
      trustScore: 76,
      lastUpdated: "Feb 14, 2026",
    },
    {
      id: 3,
      name: "Student Haven PG",
      type: "PG",
      owner: "Vikram Singh",
      trustScore: 48,
      lastUpdated: "Feb 13, 2026",
    },
    {
      id: 4,
      name: "Tenant – Rahul",
      type: "User",
      owner: "-",
      trustScore: 85,
      lastUpdated: "Feb 12, 2026",
    },
  ];

  const trustBadge = (score) => {
    if (score >= 80) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" />
          High Trust
        </Badge>
      );
    }
    if (score >= 60) {
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <ShieldAlert className="w-4 h-4" />
          Medium Trust
        </Badge>
      );
    }
    return (
      <Badge variant="danger" className="flex items-center gap-1">
        <ShieldX className="w-4 h-4" />
        Low Trust
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="admin" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-6 text-gray-800">
          Monitor Trust Scores
        </h2>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-5 bg-white border border-gray-300">
            <p className="text-sm text-gray-600">High Trust</p>
            <p className="text-2xl font-semibold text-green-600">18</p>
          </Card>

          <Card className="p-5 bg-white border border-gray-300">
            <p className="text-sm text-gray-600">Medium Trust</p>
            <p className="text-2xl font-semibold text-yellow-600">6</p>
          </Card>

          <Card className="p-5 bg-white border border-gray-300">
            <p className="text-sm text-gray-600">Low Trust</p>
            <p className="text-2xl font-semibold text-red-600">3</p>
          </Card>
        </div>

        {/* Trust Score Table */}
        <Card className="p-6 bg-white border border-gray-300">
          <h3 className="text-lg mb-4 text-gray-800">
            Trust Score Details
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Type</th>
                  <th className="p-3 border">Owner</th>
                  <th className="p-3 border">Trust Score</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {trustData.map((item) => (
                  <tr key={item.id} className="text-center">
                    <td className="p-3 border text-left">
                      {item.name}
                    </td>
                    <td className="p-3 border">{item.type}</td>
                    <td className="p-3 border">{item.owner}</td>
                    <td className="p-3 border font-semibold">
                      {item.trustScore}/100
                    </td>
                    <td className="p-3 border">
                      {trustBadge(item.trustScore)}
                    </td>
                    <td className="p-3 border">
                      {item.trustScore < 60 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                        >
                          Warn
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
