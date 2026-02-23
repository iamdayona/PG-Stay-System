import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Link } from "react-router-dom";
import { apiRegister, saveAuth } from "../utils/api";
import { useRole } from "../context/useRole";

export default function Register() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const [selectedRole, setSelectedRole] = useState("");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedRole) {
      setError("Please select a role.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiRegister({ name, email, password, role: selectedRole });
      saveAuth(data.token, data.user);
      setRole(data.user.role);

      if (data.user.role === "tenant") navigate("/tenant/dashboard");
      else if (data.user.role === "owner") navigate("/owner/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-300 px-8 py-4 text-center">
        <h1 className="text-3xl text-blue-600">
          PG Accommodation Management System
        </h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="max-w-md w-full p-8 bg-white border border-gray-300">
          <h2 className="text-2xl mb-6 text-center">Register</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Full Name</Label>
              <Input
                type="text"
                placeholder="Enter your full name"
                className="mt-2 border-gray-300"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label>Email</Label>
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
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Enter your password"
                className="mt-2 border-gray-300"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <Label>Select Role *</Label>
              <div className="space-y-3 mt-2">
                {[
                  { value: "tenant", label: "Tenant", desc: "Search and apply for PG accommodations" },
                  { value: "owner",  label: "PG Owner", desc: "List and manage PG properties" },
                ].map((r) => (
                  <div
                    key={r.value}
                    onClick={() => setSelectedRole(r.value)}
                    className={`p-4 border-2 rounded cursor-pointer transition-all ${
                      selectedRole === r.value
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedRole === r.value ? "border-blue-600 bg-blue-600" : "border-gray-400"
                      }`}>
                        {selectedRole === r.value && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="text-gray-800">{r.label}</p>
                        <p className="text-xs text-gray-600">{r.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-5"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </Card>
      </main>

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