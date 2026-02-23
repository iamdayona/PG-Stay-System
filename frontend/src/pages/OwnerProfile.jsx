import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { User, Upload, CheckCircle2 } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetMe, getUser } from "../utils/api";

export default function OwnerProfile() {
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetMe()
      .then((res) => setUser(res.user))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="owner" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-8 text-gray-800">PG Owner Profile & Verification</h2>

        {loading ? <p className="text-gray-500">Loading...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white border border-gray-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl mb-1 text-gray-800">{user?.name}</h3>
                <span className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded">PG Owner</span>
              </div>
            </Card>

            <Card className="md:col-span-2 p-6 bg-white border border-gray-300">
              <h3 className="text-lg mb-4 text-gray-800">Owner Details</h3>
              <div className="space-y-4 mb-8">
                {[
                  { label: "Name",  value: user?.name },
                  { label: "Email", value: user?.email },
                  { label: "Phone", value: user?.phone || "Not provided" },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-3 gap-4">
                    <span className="text-gray-600">{row.label}:</span>
                    <span className="col-span-2 text-gray-800">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-300 pt-6">
                <h3 className="text-lg mb-4 text-gray-800">Identity Verification</h3>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start border-gray-300">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document (Property Documents / PAN Card / Aadhaar)
                  </Button>
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-300 rounded">
                    <span className="text-gray-700">Verification Status:</span>
                    <div className="flex items-center gap-2">
                      {user?.verificationStatus === "verified" ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-green-600">Verified</span>
                        </>
                      ) : (
                        <span className="text-yellow-600 capitalize">{user?.verificationStatus}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-300 rounded">
                    <span className="text-gray-700">Owner Trust Score:</span>
                    <span className="text-2xl text-blue-600">{user?.trustScore}/100</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}