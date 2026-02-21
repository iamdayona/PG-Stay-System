import { useNavigate } from "react-router-dom";

export default function Contact() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="w-full bg-white border-b border-gray-300 px-6 py-3 flex justify-between items-center">
        <h1 className="text-3xl text-blue-600 text-center flex-1">
          Contact Us
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>

      {/* Contact Content */}
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

        {/* Contact Numbers */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            📞 Contact Numbers
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg shadow">
              <p className="font-semibold">General Enquiries</p>
              <p className="text-gray-600">+91 97785 41454</p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow">
              <p className="font-semibold">Tenant Support</p>
              <p className="text-gray-600">+91 89216 94353</p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow">
              <p className="font-semibold">Owner Support</p>
              <p className="text-gray-600">+91 80783 29968</p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow">
              <p className="font-semibold">Technical Support</p>
              <p className="text-gray-600">+91 88485 07913</p>
            </div>
          </div>
        </section>

        {/* Email Addresses */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            📧 Email Addresses
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg shadow">
              <p className="font-semibold">General Enquiries</p>
              <p className="text-gray-600">dayonasuby@gmail.com</p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow">
              <p className="font-semibold">Tenant Support</p>
              <p className="text-gray-600">aromalharikumar05@gmail.com</p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow">
              <p className="font-semibold">Owner Support</p>
              <p className="text-gray-600">anaghasunny2@gmail.com</p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow">
              <p className="font-semibold">Technical Support</p>
              <p className="text-gray-600">ageeshcyriacbaiju33@gmail.com</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}