import React from "react";
import { MapPin, IndianRupee } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";

export default function FindPGs() {
  const pgListings = [
    { name: "Green Valley PG", location: "Sector 62, Noida", rent: 8000, trustScore: 92, matchScore: 95 },
    { name: "Sunshine Residency", location: "GTB Nagar, Delhi", rent: 12000, trustScore: 88, matchScore: 88 },
    { name: "Student Haven", location: "Kalkaji, Delhi", rent: 9500, trustScore: 85, matchScore: 82 },
    { name: "Comfort Stay PG", location: "Sector 15, Noida", rent: 7500, trustScore: 90, matchScore: 78 },
    { name: "Elite Accommodation", location: "Laxmi Nagar, Delhi", rent: 11000, trustScore: 87, matchScore: 75 },
    { name: "Modern Living PG", location: "Sector 18, Noida", rent: 10500, trustScore: 91, matchScore: 72 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="tenant" />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-8 text-gray-800">
        Search PG Accommodations</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filter Panel */}
        <div className="bg-white p-4 border border-gray-300 rounded">
          <h3 className="font-semibold mb-4">Filters</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="Enter location"
                className="w-full border border-gray-300 px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Budget Range</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" className="w-full border border-gray-300 px-3 py-2 rounded" />
                <input type="number" placeholder="Max" className="w-full border border-gray-300 px-3 py-2 rounded" />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Room Type</label>
              {["Single", "Double", "Triple"].map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <input type="checkbox" id={type} />
                  <label htmlFor={type} className="text-gray-700 text-sm">{type}</label>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Amenities</label>
              {["WiFi", "AC", "Meals", "Laundry"].map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <input type="checkbox" id={amenity} />
                  <label htmlFor={amenity} className="text-gray-700 text-sm">{amenity}</label>
                </div>
              ))}
            </div>

            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Listings */}
        <div className="md:col-span-3 space-y-4">
          {pgListings.map((pg, index) => (
            <div key={index} className="bg-white border border-gray-300 p-4 rounded">
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{pg.name}</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                      Match: {pg.matchScore}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 mb-1">
                    <MapPin size={16} />
                    <span>{pg.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-800 mb-1">
                    <IndianRupee size={16} />
                    <span>{pg.rent}/month</span>
                  </div>
                  <span className="inline-block bg-green-100 text-green-700 text-sm px-2 py-1 rounded">
                    Trust Score: {pg.trustScore}/100
                  </span>
                </div>

                <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}