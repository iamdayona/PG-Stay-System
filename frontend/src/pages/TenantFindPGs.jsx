import { useEffect, useState } from "react";
import { MapPin, IndianRupee } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetRecommendations, apiGetAllPGs, apiApply, apiGetRooms } from "../utils/api";

export default function FindPGs() {
  const [pgListings, setPgListings] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [applying, setApplying]     = useState("");
  const [filters, setFilters]       = useState({
    location: "", budgetMin: "", budgetMax: "", roomType: [], amenities: [],
  });

  // Load recommendations on mount (uses tenant preferences)
  useEffect(() => {
    apiGetRecommendations()
      .then((res) => setPgListings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.location)  params.append("location",  filters.location);
      if (filters.budgetMin) params.append("budgetMin", filters.budgetMin);
      if (filters.budgetMax) params.append("budgetMax", filters.budgetMax);
      if (filters.amenities.length > 0) params.append("amenities", filters.amenities.join(","));

      const res = await apiGetAllPGs(params.toString() ? `?${params}` : "");
      setPgListings(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApply = async (pg) => {
    setApplying(pg._id);
    try {
      // Get available rooms for this PG
      const roomsRes = await apiGetRooms(pg._id);
      const available = roomsRes.data.filter((r) => r.availability);

      if (available.length === 0) {
        alert("No rooms available for this PG.");
        return;
      }

      // Pick first available room (in a full app you'd show a picker)
      const room = available[0];
      await apiApply({ pgStayId: pg._id, roomId: room._id });
      alert(`Applied successfully for ${pg.name}!`);
    } catch (err) {
      alert(err.message);
    } finally {
      setApplying("");
    }
  };

  const toggleFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="tenant" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-8 text-gray-800">Search PG Accommodations</h2>

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
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Budget Range</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={filters.budgetMin} onChange={(e) => setFilters({ ...filters, budgetMin: e.target.value })} className="w-full border border-gray-300 px-3 py-2 rounded" />
                  <input type="number" placeholder="Max" value={filters.budgetMax} onChange={(e) => setFilters({ ...filters, budgetMax: e.target.value })} className="w-full border border-gray-300 px-3 py-2 rounded" />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Room Type</label>
                {["Single", "Double", "Triple"].map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <input type="checkbox" id={type} checked={filters.roomType.includes(type)} onChange={() => toggleFilter("roomType", type)} />
                    <label htmlFor={type} className="text-gray-700 text-sm">{type}</label>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Amenities</label>
                {["WiFi", "AC", "Meals", "Laundry"].map((a) => (
                  <div key={a} className="flex items-center gap-2">
                    <input type="checkbox" id={a} checked={filters.amenities.includes(a)} onChange={() => toggleFilter("amenities", a)} />
                    <label htmlFor={a} className="text-gray-700 text-sm">{a}</label>
                  </div>
                ))}
              </div>
              <button onClick={handleApplyFilters} className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setFilters({ location: "", budgetMin: "", budgetMax: "", roomType: [], amenities: [] });
                  setLoading(true);
                  apiGetRecommendations().then((res) => setPgListings(res.data)).catch(console.error).finally(() => setLoading(false));
                }}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
              >
                Reset (Show Recommendations)
              </button>
            </div>
          </div>

          {/* Listings */}
          <div className="md:col-span-3 space-y-4">
            {loading ? (
              <p className="text-gray-500">Loading PG Stays...</p>
            ) : pgListings.length === 0 ? (
              <p className="text-gray-500">No PG Stays found matching your criteria.</p>
            ) : (
              pgListings.map((pg) => (
                <div key={pg._id} className="bg-white border border-gray-300 p-4 rounded">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{pg.name}</h3>
                        {pg.matchScore !== undefined && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                            Match: {pg.matchScore}%
                          </span>
                        )}
                        {pg.verificationStatus === "verified" && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">✓ Verified</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 mb-1">
                        <MapPin size={16} /><span>{pg.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-800 mb-1">
                        <IndianRupee size={16} /><span>{pg.rent}/month</span>
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="bg-green-100 text-green-700 text-sm px-2 py-1 rounded">
                          Trust Score: {pg.trustScore}/100
                        </span>
                        {pg.amenities?.map((a) => (
                          <span key={a} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{a}</span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {pg.availableRoomCount ?? pg.availableRooms ?? 0} room(s) available
                      </p>
                    </div>
                    <button
                      onClick={() => handleApply(pg)}
                      disabled={applying === pg._id}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 h-fit disabled:opacity-50"
                    >
                      {applying === pg._id ? "Applying..." : "Apply"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}