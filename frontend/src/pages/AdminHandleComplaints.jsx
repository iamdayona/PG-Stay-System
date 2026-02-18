import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";

export default function AdminHandleComplaints() {
  const complaints = [
    {
      id: 1,
      pgName: "Student Haven PG",
      reportedBy: "Tenant – Rahul",
      issue: "Poor hygiene and unclean washrooms",
      date: "Feb 14, 2026",
      status: "pending",
    },
    {
      id: 2,
      pgName: "Elite Accommodation",
      reportedBy: "Tenant – Sneha",
      issue: "Owner not responding after advance payment",
      date: "Feb 13, 2026",
      status: "pending",
    },
    {
      id: 3,
      pgName: "Green Valley PG",
      reportedBy: "Tenant – Aman",
      issue: "Electricity issues resolved late",
      date: "Feb 10, 2026",
      status: "resolved",
    },
  ];

  const statusBadge = (status) => {
    if (status === "pending") {
      return (
        <span className="px-3 py-1 text-xs rounded bg-yellow-100 text-yellow-700">
          Pending
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs rounded bg-green-100 text-green-700">
        Resolved
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="admin" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-6 text-gray-800">
          Handle Complaints
        </h2>

        <div className="space-y-6">
          {complaints.map((complaint) => (
            <Card
              key={complaint.id}
              className="p-6 bg-white border border-gray-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {complaint.pgName}
                  </h3>

                  <p className="text-sm text-gray-600 mb-2">
                    Reported by: {complaint.reportedBy}
                  </p>

                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Issue:</strong> {complaint.issue}
                  </p>

                  <p className="text-xs text-gray-500">
                    Filed on {complaint.date}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  {statusBadge(complaint.status)}

                  {complaint.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Resolve
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-600 hover:bg-red-50 flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}