import { useEffect, useState } from "react";
import RoleNavigation from "../context/RoleNavigation";
import Modal from "../components/Modal";
import { toast } from "../components/Toast";
import { apiGetOwnerPGs, apiCreatePG, apiUpdatePG, apiGetRooms, apiAddRoom, apiUpdateRoom } from "../utils/api";
import { CLAY_BASE, CLAY_OWNER, injectClay } from "../styles/claystyles";
import { Plus, Trash2, ImagePlus } from "lucide-react";
import { apiUploadPGImages, apiDeletePGImage } from "../utils/api";

const PAGE_CSS = `
  .pg-tab-row { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:28px; }
  .pg-tab { padding:10px 22px; border:2.5px solid rgba(255,255,255,.85); border-radius:50px; font-family:'Poppins',sans-serif; font-size:.83rem; font-weight:700; cursor:pointer; background:rgba(255,255,255,.65); backdrop-filter:blur(12px); color:#5a5a7a; box-shadow:0 4px 14px rgba(0,0,0,.07),0 3px 0 rgba(0,0,0,.05); transition:all .18s; }
  .pg-tab:hover { transform:translateY(-2px); }
  .pg-tab.active { background:linear-gradient(135deg,#ffa726,#ff8f00); color:white; border-color:transparent; box-shadow:0 5px 0 #e65100,0 8px 20px rgba(255,167,38,.4); transform:translateY(-2px); }
  .new-pg-tab { padding:10px 22px; border:2.5px dashed rgba(255,167,38,.55); border-radius:50px; font-family:'Poppins',sans-serif; font-size:.83rem; font-weight:700; cursor:pointer; background:rgba(255,248,225,.6); color:#f57f17; transition:all .18s; }
  .new-pg-tab:hover { border-color:rgba(255,167,38,.85); background:rgba(255,248,225,.9); transform:translateY(-2px); }

  .pg-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:32px; box-shadow:0 8px 28px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95); margin-bottom:24px; animation:fadeUp .6s ease both; position:relative; overflow:hidden; }
  .pg-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:24px 24px 0 0; }
  .card-orange::before { background:linear-gradient(90deg,#ffa726,#ffcc02); }
  .card-amber::before  { background:linear-gradient(90deg,#ff8f00,#ffa726); }

  .pg-section-title { font-family:'Nunito',sans-serif; font-size:1.1rem; font-weight:800; color:#2d2d4e; margin-bottom:24px; display:flex; align-items:center; justify-content:space-between; }
  .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:8px; }
  @media(max-width:600px){ .form-grid{grid-template-columns:1fr;} }
  .form-group { display:flex; flex-direction:column; }

  .pg-alert { border-radius:14px; padding:12px 16px; margin-bottom:18px; font-size:.85rem; font-weight:500; display:flex; align-items:center; gap:8px; animation:fadeIn .3s ease; }
  .pg-alert-info    { background:rgba(255,248,225,.9); border:2px solid rgba(255,224,130,.6); color:#f57f17; }
  .pg-alert-success { background:rgba(232,245,233,.9); border:2px solid rgba(165,214,167,.5); color:#2e7d32; }

  .update-btn { width:100%; margin-top:18px; padding:14px 22px; border:none; border-radius:16px; font-family:'Poppins',sans-serif; font-size:.92rem; font-weight:700; cursor:pointer; justify-content:center; background:linear-gradient(135deg,#ffa726,#fb8c00); color:white; box-shadow:0 5px 0 #e65100,0 8px 20px rgba(255,167,38,.35),inset 0 1px 0 rgba(255,255,255,.3); transition:transform .15s,box-shadow .15s,filter .15s; }
  .update-btn:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }
  .update-btn:disabled { opacity:.6; cursor:not-allowed; }

  .add-room-btn { padding:10px 20px; border:none; border-radius:14px; font-family:'Poppins',sans-serif; font-size:.85rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:7px; background:linear-gradient(135deg,#66bb6a,#43a047); color:white; box-shadow:0 5px 0 #2e7d32,0 8px 18px rgba(102,187,106,.3),inset 0 1px 0 rgba(255,255,255,.3); transition:transform .15s,box-shadow .15s,filter .15s; }
  .add-room-btn:hover { filter:brightness(1.06); transform:translateY(-2px); }

  .rooms-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
  @media(max-width:700px){ .rooms-grid{grid-template-columns:repeat(2,1fr);} }
  @media(max-width:420px){ .rooms-grid{grid-template-columns:1fr;} }

  .room-card { background:rgba(255,255,255,.62); backdrop-filter:blur(12px); border:2px solid rgba(255,255,255,.85); border-radius:18px; padding:18px; box-shadow:0 4px 16px rgba(0,0,0,.07),inset 0 1px 0 rgba(255,255,255,.9); transition:transform .2s; animation:fadeUp .5s ease both; position:relative; overflow:hidden; }
  .room-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:18px 18px 0 0; }
  .room-avail::before   { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .room-unavail::before { background:linear-gradient(90deg,#ef9a9a,#e57373); }
  .room-card:hover { transform:translateY(-3px); }
  .room-type  { font-family:'Nunito',sans-serif; font-size:.95rem; font-weight:800; color:#2d2d4e; margin-bottom:5px; }
  .room-rent  { font-size:.82rem; color:#7a7a9a; margin-bottom:14px; font-weight:500; }

  .toggle-row   { display:flex; align-items:center; justify-content:space-between; }
  .toggle-label { font-size:.75rem; font-weight:700; color:#5a5a7a; }
  .toggle-wrap  { position:relative; width:44px; height:24px; }
  .toggle-wrap input { opacity:0; width:0; height:0; position:absolute; }
  .toggle-slider { position:absolute; cursor:pointer; inset:0; border-radius:50px; transition:.3s; background:rgba(200,200,220,.5); box-shadow:inset 0 2px 4px rgba(0,0,0,.1); }
  .toggle-slider::before { content:''; position:absolute; height:18px; width:18px; left:3px; bottom:3px; background:white; border-radius:50%; transition:.3s; box-shadow:0 2px 6px rgba(0,0,0,.15); }
  .toggle-wrap input:checked + .toggle-slider { background:linear-gradient(135deg,#66bb6a,#43a047); box-shadow:0 3px 10px rgba(102,187,106,.35); }
  .toggle-wrap input:checked + .toggle-slider::before { transform:translateX(20px); }

  .room-empty { text-align:center; padding:40px 24px; color:#9a9ab0; font-size:.88rem; }
  .room-empty-emoji { font-size:2.5rem; margin-bottom:10px; display:block; }
  .photo-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:16px; }
@media(max-width:600px){ .photo-grid{grid-template-columns:repeat(2,1fr);} }
.photo-thumb { position:relative; border-radius:14px; overflow:hidden; aspect-ratio:4/3; background:rgba(200,200,220,.2); border:2px solid rgba(255,255,255,.8); box-shadow:0 4px 12px rgba(0,0,0,.08); }
.photo-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
.photo-del-btn { position:absolute; top:6px; right:6px; background:rgba(220,50,50,.88); border:none; border-radius:50%; width:26px; height:26px; cursor:pointer; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .2s; }
.photo-thumb:hover .photo-del-btn { opacity:1; }
.upload-zone { border:2.5px dashed rgba(255,167,38,.55); border-radius:16px; padding:24px; text-align:center; cursor:pointer; transition:all .18s; background:rgba(255,248,225,.4); }
.upload-zone:hover { border-color:rgba(255,167,38,.9); background:rgba(255,248,225,.7); }
.upload-zone-label { display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; color:#f57f17; font-weight:600; font-size:.88rem; }
.upload-zone input[type="file"] { display:none; }
`;

const css = injectClay(CLAY_BASE, CLAY_OWNER, PAGE_CSS);

export default function OwnerPGManagement() {
  const [pgs, setPgs]               = useState([]);
  const [rooms, setRooms]           = useState([]);
  const [selectedPG, setSelectedPG] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [pgForm, setPgForm]         = useState({ name: "", location: "", rent: "", amenities: "" });
  const [uploading, setUploading] = useState(false);
  const [pgImages, setPgImages]   = useState([]);
  // Modal state
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomForm, setRoomForm]           = useState({ roomType: "", rent: "", capacity: "1" });
  const [addingRoom, setAddingRoom]       = useState(false);
  
  const fetchPGs = async () => {
    try {
      const res = await apiGetOwnerPGs();
      setPgs(res.data);
      if (res.data.length > 0 && !selectedPG) selectPG(res.data[0]);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const selectPG = (pg) => {
    setSelectedPG(pg);
    setPgForm({ name: pg.name, location: pg.location, rent: pg.rent, amenities: pg.amenities?.join(", ") || "" });
    setPgImages(pg.images || []);
    fetchRooms(pg._id);
  };

  const fetchRooms = async (pgId) => {
    try {
      const res = await apiGetRooms(pgId);
      setRooms(res.data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => { fetchPGs(); }, []);

  const handleSavePG = async () => {
    if (!pgForm.name || !pgForm.location || !pgForm.rent) {
      toast.warning("Name, location and rent are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: pgForm.name,
        location: pgForm.location,
        rent: Number(pgForm.rent),
        amenities: pgForm.amenities.split(",").map((a) => a.trim()).filter(Boolean),
      };
      if (selectedPG) {
        await apiUpdatePG(selectedPG._id, payload);
        toast.success("PG details updated successfully!");
      } else {
        const res = await apiCreatePG(payload);
        setSelectedPG(res.data);
        toast.success("PG Stay created successfully!");
      }
      await fetchPGs();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRoom = async (room) => {
    try {
      await apiUpdateRoom(room._id, { availability: !room.availability });
      toast.success(room.availability ? "Room marked as unavailable" : "Room marked as available");
      fetchRooms(selectedPG._id);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAddRoom = async () => {
    if (!selectedPG) { toast.warning("Save PG details first."); return; }
    if (!roomForm.roomType || !roomForm.rent) {
      toast.warning("Room type and rent are required");
      return;
    }
    setAddingRoom(true);
    try {
      await apiAddRoom(selectedPG._id, {
        roomType: roomForm.roomType,
        rent: Number(roomForm.rent),
        capacity: Number(roomForm.capacity) || 1,
        availability: true,
      });
      toast.success("Room added successfully!");
      setShowRoomModal(false);
      setRoomForm({ roomType: "", rent: "", capacity: "1" });
      fetchRooms(selectedPG._id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAddingRoom(false);
    }
  };

  const handleNewPG = () => {
    setSelectedPG(null);
    setPgForm({ name: "", location: "", rent: "", amenities: "" });
    setRooms([]);
  };
  const handleUploadImages = async (e) => {
  const files = Array.from(e.target.files);
  if (!selectedPG) { toast.warning("Save PG details first before uploading photos."); return; }
  if (files.length === 0) return;

  const formData = new FormData();
  files.forEach((f) => formData.append("images", f));

  setUploading(true);
  try {
    const res = await apiUploadPGImages(selectedPG._id, formData);
    setPgImages(res.data);
    toast.success(`${files.length} photo(s) uploaded! 🎉`);
  } catch (err) {
    toast.error(err.message);
  } finally {
    setUploading(false);
    e.target.value = "";  // reset file input
  }
};

const handleDeleteImage = async (imgId) => {
  if (!window.confirm("Remove this photo?")) return;
  try {
    const res = await apiDeletePGImage(selectedPG._id, imgId);
    setPgImages(res.data);
    toast.success("Photo removed.");
  } catch (err) {
    toast.error(err.message);
  }
};
  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="owner" />

        {/* Add Room Modal */}
        {showRoomModal && (
          <Modal
            title="➕ Add New Room"
            subtitle="Enter room details below"
            onClose={() => { setShowRoomModal(false); setRoomForm({ roomType: "", rent: "", capacity: "1" }); }}
            onConfirm={handleAddRoom}
            confirmLabel="Add Room"
            loading={addingRoom}
            fields={
              <div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="clay-label">Room Type</label>
                  <input
                    className="clay-input"
                    placeholder="e.g. Single Room, Double AC Room"
                    value={roomForm.roomType}
                    onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="clay-label">Monthly Rent (₹)</label>
                  <input
                    className="clay-input"
                    type="number"
                    placeholder="e.g. 7500"
                    value={roomForm.rent}
                    onChange={(e) => setRoomForm({ ...roomForm, rent: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="clay-label">Capacity (persons)</label>
                  <input
                    className="clay-input"
                    type="number"
                    min="1"
                    max="6"
                    placeholder="1"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                  />
                </div>
              </div>
            }
          />
        )}

        <main className="clay-main">
          <div className="clay-container">
            <h2 className="clay-page-title">🏢 PG &amp; Room Management</h2>
            <p className="clay-page-sub">Create, update and manage your PG properties and rooms.</p>

            {pgs.length > 0 && (
              <div className="pg-tab-row">
                {pgs.map((pg) => (
                  <button
                    key={pg._id}
                    className={`pg-tab${selectedPG?._id === pg._id ? " active" : ""}`}
                    onClick={() => selectPG(pg)}
                  >
                    🏠 {pg.name}
                  </button>
                ))}
                <button className="new-pg-tab" onClick={handleNewPG}>+ Add New PG</button>
              </div>
            )}

            {/* Edit PG Card */}
            <div className="pg-card card-orange">
              <div className="pg-section-title">
                📝 {selectedPG ? "Edit PG Details" : "Create New PG Stay"}
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="clay-label">PG Name</label>
                  <input className="clay-input" placeholder="e.g. Sunshine PG" value={pgForm.name} onChange={(e) => setPgForm({ ...pgForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="clay-label">Location</label>
                  <input className="clay-input" placeholder="Area, City" value={pgForm.location} onChange={(e) => setPgForm({ ...pgForm, location: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="clay-label">Base Rent / Month (₹)</label>
                  <input className="clay-input" type="number" placeholder="e.g. 7500" value={pgForm.rent} onChange={(e) => setPgForm({ ...pgForm, rent: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="clay-label">Amenities (comma-separated)</label>
                  <input className="clay-input" placeholder="WiFi, AC, Meals, Laundry" value={pgForm.amenities} onChange={(e) => setPgForm({ ...pgForm, amenities: e.target.value })} />
                </div>
              </div>
              <button className="update-btn" onClick={handleSavePG} disabled={saving}>
                {saving ? "⏳ Saving…" : selectedPG ? "Update PG Details →" : "Create PG Stay →"}
              </button>
            </div>

            {/* Room Management Card */}
            <div className="pg-card card-amber">
              <div className="pg-section-title">
                <span>🚪 Room Management</span>
                <button className="add-room-btn" onClick={() => setShowRoomModal(true)}>
                  <Plus size={15} /> Add Room
                </button>
              </div>
{/* ─── Photo Management Card ─── */}
{selectedPG && (
  <div className="pg-card card-orange">
    <div className="pg-section-title">
      <span>📸 PG Photos ({pgImages.length}/10)</span>
    </div>

    {pgImages.length > 0 && (
      <div className="photo-grid">
        {pgImages.map((img) => (
          <div key={img._id} className="photo-thumb">
            <img src={img.url} alt="PG" />
            <button
              className="photo-del-btn"
              onClick={() => handleDeleteImage(img._id)}
              title="Delete photo"
            >
              <Trash2 size={13} color="white" />
            </button>
          </div>
        ))}
      </div>
    )}

    {pgImages.length < 10 && (
      <div className="upload-zone">
        <label className="upload-zone-label">
          <ImagePlus size={28} />
          {uploading ? "⏳ Uploading…" : "Click to upload photos (max 10, 5MB each)"}
          <span style={{ fontSize: ".75rem", color: "#9a9ab0", fontWeight: 500 }}>
            JPG, PNG or WebP accepted
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUploadImages}
            disabled={uploading}
          />
        </label>
      </div>
    )}
  </div>
)}
              {rooms.length === 0 ? (
                <div className="room-empty">
                  <span className="room-empty-emoji">🚪</span>
                  No rooms added yet. Click "Add Room" to get started.
                </div>
              ) : (
                <div className="rooms-grid">
                  {rooms.map((room, i) => (
                    <div key={room._id} className={`room-card ${room.availability ? "room-avail" : "room-unavail"}`} style={{ animationDelay: `${i * 0.06}s` }}>
                      <div className="room-type">{room.roomType}</div>
                      <div className="room-rent">₹{room.rent}/month</div>
                      <div className="toggle-row">
                        <span className="toggle-label">
                          {room.availability ? "✅ Available" : "❌ Unavailable"}
                        </span>
                        <label className="toggle-wrap">
                          <input type="checkbox" checked={room.availability} onChange={() => handleToggleRoom(room)} />
                          <span className="toggle-slider" />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
