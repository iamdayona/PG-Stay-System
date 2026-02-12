import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { User, Upload, CheckCircle2 } from "lucide-react";

function UserProfile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-8 text-gray-800">Tenant Profile & Verification</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Side - Profile Overview */}
          <Card className="p-6 bg-white border border-gray-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <User className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl mb-1 text-gray-800">John Doe</h3>
              <span className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded">Tenant</span>
            </div>
          </Card>

          {/* Main Area - Profile Details */}
          <Card className="md:col-span-2 p-6 bg-white border border-gray-300">
            <h3 className="text-lg mb-4 text-gray-800">Profile Details</h3>

            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600">Name:</span>
                <span className="col-span-2 text-gray-800">John Doe</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600">Email:</span>
                <span className="col-span-2 text-gray-800">john.doe@example.com</span>
              </div>
              <div className="grid-cols-3 gap-4 grid">
                <span className="text-gray-600">Phone:</span>
                <span className="col-span-2 text-gray-800">+91 9876543210</span>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-6">
              <h3 className="text-lg mb-4 text-gray-800">Identity Verification</h3>

              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start border-gray-300">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document (Aadhaar / Student ID)
                </Button>

                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-300 rounded">
                  <span className="text-gray-700">Verification Status:</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-green-600">Verified</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-300 rounded">
                  <span className="text-gray-700">Profile Completion:</span>
                  <span className="text-2xl text-blue-600">90%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
