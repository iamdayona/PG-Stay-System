import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetMyApplications } from "../utils/api";

export default function TenantApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetMyApplications()
      .then((res) => setApplications(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusIcon = (status) => {
    if (status === "Approved")    return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === "Rejected")    return <XCircle      className="w-5 h-5 text-red-600" />;
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  const getStatusColor = (status) => {
    if (status === "Approved")    return "bg-green-100 text-green-700";
    if (status === "Rejected")    return "bg-red-100 text-red-700";
    if (status === "Under Review") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  const stages = ["Pending", "Under Review", "Approved"];

  const getStageIndex = (status) => {
    if (status === "Approved")     return 2;
    if (status === "Under Review") return 1;
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="tenant" />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-8 text-gray-800">My Applications</h2>

        {loading ? (
          <p className="text-gray-500">Loading your applications...</p>
        ) : applications.length === 0 ? (
          <p className="text-gray-500">You haven't applied to any PG yet.</p>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => (
              <Card key={app._id} className="p-6 bg-white border border-gray-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl mb-2 text-gray-800">{app.pgStay?.name}</h3>
                    <p className="text-gray-600">{app.pgStay?.location}</p>
                    <p className="text-gray-800 mt-1">₹{app.rentAmount}/month</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Room: {app.room?.roomType} &nbsp;|&nbsp;
                      Applied on: {new Date(app.appliedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Status Tracker */}
                <div className="border-t border-gray-300 pt-6">
                  <h4 className="text-sm text-gray-700 mb-4">Application Status</h4>

                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300 -z-10" />

                    {stages.map((stage, idx) => {
                      const active = idx <= getStageIndex(app.status) && app.status !== "Rejected";
                      return (
                        <div key={stage} className="flex flex-col items-center flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? "bg-blue-600" : "bg-gray-300"}`}>
                            {active
                              ? <CheckCircle2 className="w-5 h-5 text-white" />
                              : <div className="w-2 h-2 rounded-full bg-white" />
                            }
                          </div>
                          <span className={`text-sm mt-2 ${active ? "text-blue-600" : "text-gray-500"}`}>
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-6">
                    {getStatusIcon(app.status)}
                    <span className={`px-4 py-2 rounded ${getStatusColor(app.status)}`}>
                      Current Status: {app.status}
                    </span>
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