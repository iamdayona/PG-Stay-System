import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useRole } from "../context/useRole";
import { Link } from "react-router-dom";
import { apiLogin, saveAuth } from "../utils/api";

export default function Login() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const [selectedRole, setSelectedRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiLogin({ email, password });
      saveAuth(data.token, data.user);
      setRole(data.user.role);

      if (data.user.role === "admin")        navigate("/admin/dashboard");
      else if (data.user.role === "tenant")  navigate("/tenant/dashboard");
      else if (data.user.role === "owner")   navigate("/owner/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
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

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="max-w-md w-full p-8 bg-white border border-gray-300">
          <h2 className="text-2xl mb-6 text-center text-gray-800">Login</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

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

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-5"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </Card>
      </main>

      <footer className="bg-white border-t border-gray-300 px-8 py-6">
        <div className="flex gap-8 justify-center">
          <Link to="/about"   className="text-gray-600 hover:text-blue-600">About</Link>
          <Link to="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link>
          <Link to="/help"    className="text-gray-600 hover:text-blue-600">Help</Link>
        </div>
      </footer>
    </div>
  );
}