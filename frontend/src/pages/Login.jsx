import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useRole } from "../context/RoleContext";

export default function Login() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedRole) {
      alert("Please select a role");
      return;
    }

    setRole(selectedRole);

    // Route to respective dashboard based on role
    if (selectedRole === "tenant") {
      navigate("/tenant/dashboard");
    } else if (selectedRole === "owner") {
      navigate("/owner/dashboard");
    } else if (selectedRole === "admin") {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-300 px-8 py-4">
        <h1 className="text-2xl text-blue-600">
          PG Accommodation Management System
        </h1>
      </header>

      {/* Main Auth Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="max-w-md w-full p-8 bg-white border border-gray-300">
          <h2 className="text-2xl mb-6 text-center text-gray-800">
            {isLogin ? "Login" : "Register"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-gray-700">Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                className="mt-2 border-gray-300"
                required
              />
            </div>

            <div>
              <Label className="text-gray-700">Password</Label>
              <Input
                type="password"
                placeholder="Enter your password"
                className="mt-2 border-gray-300"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <Label className="text-gray-700">Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  className="mt-2 border-gray-300"
                  required
                />
              </div>
            )}

            {/* Role Selection */}
            <div className="border-t border-gray-300 pt-4">
              <Label className="text-gray-700 mb-3 block">
                Select Your Role *
              </Label>

              <div className="space-y-3">
                {/* Tenant */}
                <div
                  onClick={() => setSelectedRole("tenant")}
                  className={`p-4 border-2 rounded cursor-pointer transition-all ${
                    selectedRole === "tenant"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        selectedRole === "tenant"
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-400"
                      }`}
                    >
                      {selectedRole === "tenant" && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-800">Tenant</p>
                      <p className="text-xs text-gray-600">
                        Search and apply for PG accommodations
                      </p>
                    </div>
                  </div>
                </div>

                {/* Owner */}
                <div
                  onClick={() => setSelectedRole("owner")}
                  className={`p-4 border-2 rounded cursor-pointer transition-all ${
                    selectedRole === "owner"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        selectedRole === "owner"
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-400"
                      }`}
                    >
                      {selectedRole === "owner" && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-800">PG Owner</p>
                      <p className="text-xs text-gray-600">
                        List and manage PG properties
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin */}
                <div
                  onClick={() => setSelectedRole("admin")}
                  className={`p-4 border-2 rounded cursor-pointer transition-all ${
                    selectedRole === "admin"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        selectedRole === "admin"
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-400"
                      }`}
                    >
                      {selectedRole === "admin" && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-800">Admin</p>
                      <p className="text-xs text-gray-600">
                        Manage and verify system operations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-6"
            >
              {isLogin ? "Login" : "Register"}
            </Button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline text-sm"
            >
              {isLogin
                ? "Don't have an account? Register here"
                : "Already have an account? Login here"}
            </button>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-300 px-8 py-6">
        <div className="flex gap-8 justify-center">
          <a href="#" className="text-gray-600 hover:text-blue-600">
            About
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-600">
            Contact
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-600">
            Help
          </a>
        </div>
      </footer>
    </div>
  );
}
