import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="w-full bg-white border-b border-gray-300 px-6 py-3 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-center flex-1">
          About PG Accommodation System
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Introduction
          </h2>
          <p className="text-gray-600 leading-relaxed">
            The PG Accommodation System is a web-based application designed to 
            simplify the process of finding and managing Paying Guest (PG) stays. 
            It connects tenants and PG owners on a single platform, making booking, 
            payment, and communication easy and transparent.
          </p>
        </section>

        {/* Objectives */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Objectives
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Provide an easy platform for tenants to find PG accommodations.</li>
            <li>Allow PG owners to manage rooms and bookings efficiently.</li>
            <li>Enable secure booking and payment tracking.</li>
            <li>Maintain trust score and feedback system.</li>
          </ul>
        </section>

        {/* Key Features */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            
            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">User Management</h3>
              <p className="text-gray-600 text-sm">
                Role-based access for tenants and PG owners.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Room Booking</h3>
              <p className="text-gray-600 text-sm">
                Easy booking system with real-time availability.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Online Payments</h3>
              <p className="text-gray-600 text-sm">
                Secure payment tracking and transaction history.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Feedback & Trust Score</h3>
              <p className="text-gray-600 text-sm">
                Ratings and reviews help maintain transparency and reliability.
              </p>
            </div>

          </div>
        </section>

        {/* Conclusion */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Conclusion
          </h2>
          <p className="text-gray-600 leading-relaxed">
            This system enhances the traditional PG accommodation process by 
            digitalizing bookings, payments, and communication. It ensures 
            efficiency, security, and convenience for both tenants and PG owners.
          </p>
        </section>

      </div>
    </div>
  );
}