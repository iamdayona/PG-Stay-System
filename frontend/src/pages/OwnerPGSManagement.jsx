import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import RoleNavigation from "../context/RoleNavigation";
import {
  apiGetOwnerPGs,
  apiCreatePG,
  apiUpdatePG,
  apiGetRooms,
  apiAddRoom,
  apiUpdateRoom,
} from "../utils/api";

export default function OwnerPGManagement() {
  const [pgs, setPgs]       = useState([]);
  const [rooms, setRooms]   = useState([]);
  const [selectedPG, setSelectedPG] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [pgForm, setPgForm] = useState({
    name: "", location: "", rent: "", amenities: "",
  });

  const fetchPGs = async () => {
    try {
      const res = await apiGetOwnerPGs();
      setPgs(res.data);
      if (res.data.length > 0 && !selectedPG) {
        setSelectedPG(res.data[0]);
        setPgForm({
          name:      res.data[0].name,
          location:  res.data[0].location,
          rent:      res.data[0].rent,
          amenities: res.data[0].amenities.join(", "),
        });
        fetchRooms(res.data[0]._id);
      }
    } catch (err) { console.error(err); }
  };

  const fetchRooms = async (pgId) => {
    try {
      const res = await apiGetRooms(pgId);
      setRooms(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPGs(); }, []);

  const handleSavePG = async () => {
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        name:      pgForm.name,
        location:  pgForm.location,
        rent:      Number(pgForm.rent),
        amenities: pgForm.amenities.split(",").map((a) => a.trim()).filter(Boolean),
      };
      if (selectedPG) {
        await apiUpdatePG(selectedPG._id, payload);
        setMessage("PG details updated successfully.");
      } else {
        const res = await apiCreatePG(payload);
        setSelectedPG(res.data);
        setMessage("PG Stay created successfully.");
      }
      await fetchPGs();
    } catch (err) { setMessage(err.message); }
    finally { setSaving(false); }
  };

  const handleToggleRoom = async (room) => {
    try {
      await apiUpdateRoom(room._id, { availability: !room.availability });
      fetchRooms(selectedPG._id);
    } catch (err) { alert(err.message); }
  };

  const handleAddRoom = async () => {
    if (!selectedPG) { alert("Save PG details first."); return; }
    const roomType = prompt("Room type? (e.g. Single Room, Double AC Room)");
    if (!roomType) return;
    const rent = prompt("Room rent?");
    if (!rent) return;
    try {
      await apiAddRoom(selectedPG._id, {
        roomType,
        rent: Number(rent),
        capacity: roomType.includes("Double") ? 2 : roomType.includes("Triple") ? 3 : 1,
        availability: true,
      });
      fetchRooms(selectedPG._id);
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="owner" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-8 text-gray-800">PG and Room Management</h2>

        {/* PG selector */}
        {pgs.length > 1 && (
          <div className="mb-4 flex gap-2">
            {pgs.map((pg) => (
              <button
                key={pg._id}
                onClick={() => { setSelectedPG(pg); setPgForm({ name: pg.name, location: pg.location, rent: pg.rent, amenities: pg.amenities.join(", ") }); fetchRooms(pg._id); }}
                className={`px-4 py-2 rounded border text-sm ${selectedPG?._id === pg._id ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-300 text-gray-700"}`}
              >
                {pg.name}
              </button>
            ))}
          </div>
        )}

        {/* PG Form */}
        <Card className="p-6 bg-white border border-gray-300 mb-6">
          <h3 className="text-lg mb-6 text-gray-800">PG Details</h3>

          {message && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-300 rounded text-blue-700 text-sm">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><Label>PG Name</Label><Input value={pgForm.name} placeholder="Enter PG name" onChange={(e) => setPgForm({ ...pgForm, name: e.target.value })} /></div>
            <div><Label>Location</Label><Input value={pgForm.location} placeholder="Enter location" onChange={(e) => setPgForm({ ...pgForm, location: e.target.value })} /></div>
            <div><Label>Rent (per month)</Label><Input type="number" value={pgForm.rent} placeholder="Enter rent" onChange={(e) => setPgForm({ ...pgForm, rent: e.target.value })} /></div>
            <div><Label>Amenities</Label><Input value={pgForm.amenities} placeholder="WiFi, AC, Meals, etc." onChange={(e) => setPgForm({ ...pgForm, amenities: e.target.value })} /></div>
          </div>

          <Button className="mt-6" onClick={handleSavePG} disabled={saving}>
            {saving ? "Saving..." : "Save PG Details"}
          </Button>
        </Card>

        {/* Room Management */}
        <Card className="p-6 bg-white border border-gray-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg text-gray-800">Room Management</h3>
            <Button className="flex items-center gap-2" onClick={handleAddRoom}>
              <Plus size={16} /> Add Room
            </Button>
          </div>

          {rooms.length === 0 ? (
            <p className="text-gray-500 text-sm">No rooms added yet. Click "Add Room" to start.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <Card key={room._id} className="p-4 bg-gray-50 border border-gray-300">
                  <p className="text-gray-800 mb-1">{room.roomType}</p>
                  <p className="text-sm text-gray-500 mb-3">₹{room.rent}/month</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Available</span>
                    <Switch defaultChecked={room.availability} onChange={() => handleToggleRoom(room)} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}