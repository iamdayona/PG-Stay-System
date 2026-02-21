import { useNavigate } from "react-router-dom";

export default function Help() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="w-full bg-white border-b border-gray-300 px-6 py-3 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-center flex-1">
          Help & Support
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">

        {/* How It Works */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            🔎 How PG Stay System Works
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-2">1. Search PG</h3>
              <p className="text-gray-600 text-sm">
                Browse available PG accommodations based on location,
                amenities, rent, and trust score.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-2">2. Book Room</h3>
              <p className="text-gray-600 text-sm">
                Select room type, check availability, and confirm your
                booking instantly.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-2">3. Make Payment</h3>
              <p className="text-gray-600 text-sm">
                Complete secure payment and receive booking confirmation.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            ❓ Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-lg shadow">
              <h4 className="font-semibold">
                How do I register as a tenant?
              </h4>
              <p className="text-gray-600 text-sm mt-2">
                Click on Sign Up, choose Tenant role, and fill in your details
                to create an account.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow">
              <h4 className="font-semibold">
                How is trust score calculated?
              </h4>
              <p className="text-gray-600 text-sm mt-2">
                Trust score is based on user feedback, ratings, and booking
                history.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow">
              <h4 className="font-semibold">
                Can I cancel my booking?
              </h4>
              <p className="text-gray-600 text-sm mt-2">
                Yes, booking cancellation depends on the PG owner’s policy.
                Check booking details for cancellation status.
              </p>
            </div>
          </div>
        </section>

        {/* Support Categories */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            🛠 Support Categories
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="font-semibold mb-2">Tenant Support</h3>
              <p className="text-gray-600 text-sm">
                Assistance with bookings, payments, and account issues.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="font-semibold mb-2">Owner Support</h3>
              <p className="text-gray-600 text-sm">
                Help with listing PGs, managing rooms, and monitoring trust scores.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="font-semibold mb-2">Technical Support</h3>
              <p className="text-gray-600 text-sm">
                Report bugs, login issues, and system-related problems.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}