import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useRole } from "../context/useRole";
import { Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔐 Predefined Admin Accounts
  const adminAccounts = [
    { email: "ageeshcyriacbaiju33@gmail.com", password: "Ageesh@123" },
    { email: "anaghasunny2@gmail.com", password: "Anagha@123" },
    { email: "aromalharikumar05@gmail.com", password: "Aromal@123" },
    { email: "dayonasuby@gmail.com", password: "Dayona@123" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔴 Check if Admin credentials match
    const isAdmin = adminAccounts.find(
      (admin) => admin.email === email && admin.password === password
    );

    if (isAdmin) {
      setRole("admin");
      navigate("/admin/dashboard");
      return;
    }

    if (!selectedRole) {
      alert("Please select a role");
      return;
    }

    setRole(selectedRole);

    if (selectedRole === "tenant") {
      navigate("/tenant/dashboard");
    } else if (selectedRole === "owner") {
      navigate("/owner/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-300 px-8 py-4 text-center">
        <h1 className="text-3xl text-blue-600">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-gray-700">Password</Label>
              <Input
                type="password"
                placeholder="Enter your password"
                className="mt-2 border-gray-300"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            {/* Role Selection (Admin Removed) */}
            <div className="border-t border-gray-300 pt-4">
              <Label className="text-gray-700 mb-3 block">
                Select Your Role *
              </Label>

              <div className="space-y-3">
                {/* Tenant */}
                <div
                  onClick={() => setSelectedRole("tenant")}
                  className={`p-4 border-2 rounded cursor-pointer transition-all ${selectedRole === "tenant"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${selectedRole === "tenant"
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
                  className={`p-4 border-2 rounded cursor-pointer transition-all ${selectedRole === "owner"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${selectedRole === "owner"
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
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-5"
            >
              Login
            </Button>
          </form>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-300 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-600 space-y-3">

          {/* First Line */}
          <div>
            © {new Date().getFullYear()} PG Stay Recommendation and Management System
          </div>

          {/* Second Line */}
          <div className="flex justify-center space-x-8">
            <button
              onClick={() => navigate("/about")}
              className="hover:text-blue-600 transition"
            >
              About
            </button>

            <button
              onClick={() => navigate("/contact")}
              className="hover:text-blue-600 transition"
            >
              Contact
            </button>

            <button
              onClick={() => navigate("/help")}
              className="hover:text-blue-600 transition"
            >
              Help
            </button>
          </div>

        </div>
      </footer>
    </div>
  );
}