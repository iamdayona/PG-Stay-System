import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetOwnerApplications, apiApproveApplication, apiRejectApplication } from "../utils/api";

export default function OwnerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const fetchApps = async () => {
    try {
      const res = await apiGetOwnerApplications();
      setApplications(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchApps(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(id + "approve");
    try {
      await apiApproveApplication(id);
      await fetchApps();
    } catch (err) { alert(err.message); }
    finally { setActionLoading(""); }
  };

  const handleReject = async (id) => {
    setActionLoading(id + "reject");
    try {
      await apiRejectApplication(id);
      await fetchApps();
    } catch (err) { alert(err.message); }
    finally { setActionLoading(""); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="owner" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-8 text-gray-800">Applications Received</h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : applications.length === 0 ? (
          <p className="text-gray-500">No applications received yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app._id} className="p-6 bg-white border border-gray-300">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl text-gray-800 mb-1">{app.tenant?.name}</h3>
                        <p className="text-gray-600">{app.pgStay?.name} – {app.room?.roomType}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Applied on: {new Date(app.appliedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Trust Score</p>
                        <span className={`text-2xl ${
                          app.tenant?.trustScore >= 85 ? "text-green-600" :
                          app.tenant?.trustScore >= 75 ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {app.tenant?.trustScore}/100
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-300 pt-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Current Status:</span>
                        <span className={`px-3 py-1 rounded text-sm ${
                          app.status === "Approved" ? "bg-green-100 text-green-700" :
                          app.status === "Rejected" ? "bg-red-100 text-red-700"    :
                          "bg-yellow-100 text-yellow-700"
                        }`}>{app.status}</span>
                      </div>

                      {app.status === "Pending" && (
                        <div className="flex gap-3 mt-4">
                          <Button
                            className="bg-green-600 hover:bg-green-700 w-40"
                            onClick={() => handleApprove(app._id)}
                            disabled={actionLoading === app._id + "approve"}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {actionLoading === app._id + "approve" ? "Approving..." : "Approve"}
                          </Button>
                          <Button
                            className="bg-red-600 hover:bg-red-700 w-40"
                            onClick={() => handleReject(app._id)}
                            disabled={actionLoading === app._id + "reject"}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {actionLoading === app._id + "reject" ? "Rejecting..." : "Reject"}
                          </Button>
                        </div>
                      )}

                      {app.status === "Approved" && (
                        <div className="mt-4 bg-green-50 border border-green-300 p-3 rounded">
                          <p className="text-sm text-green-700">Room allocated successfully</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}