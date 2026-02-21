import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">

      <div className="max-w-6xl w-full px-6 py-12">

        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to PG Stay Accommodation System
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A smart platform that connects tenants and PG owners efficiently.
            Search for verified PG accommodations, book rooms easily,
            manage payments securely, and monitor trust scores — all in one place.
          </p>
        </div>

        {/* Register & Login Section */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Register Column */}
          <div className="bg-white p-10 rounded-xl shadow-lg text-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Don’t Have an Account?
            </h2>

            <p className="text-gray-600 mb-6">
              Create a new account to explore PG listings,
              book rooms, and manage your accommodation easily.
            </p>

            <button
              onClick={() => navigate("/register")}
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition w-full"
            >
              Register Here
            </button>
          </div>

          {/* Login Column */}
          <div className="bg-white p-10 rounded-xl shadow-lg text-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Already Have an Account?
            </h2>

            <p className="text-gray-600 mb-6">
              Login to access your dashboard, manage bookings,
              track payments, and monitor trust scores.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition w-full"
            >
              Login Here
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}