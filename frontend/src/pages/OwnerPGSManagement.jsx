import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetOwnerPGs, apiCreatePG, apiUpdatePG, apiGetRooms, apiAddRoom, apiUpdateRoom } from "../utils/api";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&family=Poppins:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  .clay-page {
    min-height:100vh;
    background:linear-gradient(135deg,#fff8e1 0%,#f3e5f5 30%,#e8f5e9 60%,#fff3e0 100%);
    font-family:'Poppins',sans-serif; position:relative; overflow-x:hidden;
  }
  .clay-page::before {
    content:''; position:fixed; width:520px; height:520px;
    background:radial-gradient(circle,rgba(255,224,130,.45) 0%,transparent 70%);
    border-radius:50%; top:-160px; left:-160px;
    animation:floatBlob 9s ease-in-out infinite; pointer-events:none; z-index:0;
  }
  .clay-page::after {
    content:''; position:fixed; width:420px; height:420px;
    background:radial-gradient(circle,rgba(206,147,216,.3) 0%,transparent 70%);
    border-radius:50%; bottom:-110px; right:-110px;
    animation:floatBlob 11s ease-in-out infinite reverse; pointer-events:none; z-index:0;
  }
  @keyframes floatBlob{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(28px,18px) scale(1.05);}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}

  .clay-main { position:relative; z-index:1; padding:36px 24px; }
  .clay-container { max-width:1000px; margin:0 auto; }
  .clay-page-title { font-family:'Nunito',sans-serif; font-size:1.9rem; font-weight:900; color:#2d2d4e; margin-bottom:4px; }
  .clay-page-sub   { color:#7a7a9a; font-size:.92rem; margin-bottom:28px; }

  /* ── PG Selector ── */
  .pg-tab-row { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px; }
  .pg-tab {
    padding:9px 20px; border:2.5px solid rgba(255,255,255,.85); border-radius:50px;
    font-family:'Poppins',sans-serif; font-size:.82rem; font-weight:700; cursor:pointer;
    background:rgba(255,255,255,.65); backdrop-filter:blur(12px); color:#5a5a7a;
    box-shadow:0 4px 14px rgba(0,0,0,.07), 0 3px 0 rgba(0,0,0,.05);
    transition:all .18s;
  }
  .pg-tab:hover { transform:translateY(-2px); }
  .pg-tab.active {
    background:linear-gradient(135deg,#ffa726,#ff8f00); color:white;
    border-color:transparent;
    box-shadow:0 5px 0 #e65100, 0 8px 20px rgba(255,167,38,.4);
    transform:translateY(-2px);
  }
  .new-pg-tab {
    padding:9px 20px; border:2.5px dashed rgba(255,167,38,.5); border-radius:50px;
    font-family:'Poppins',sans-serif; font-size:.82rem; font-weight:700; cursor:pointer;
    background:rgba(255,248,225,.6); color:#f57f17;
    transition:all .18s;
  }
  .new-pg-tab:hover { border-color:rgba(255,167,38,.8); background:rgba(255,248,225,.9); }

  /* ── Glass card ── */
  .clay-card {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:28px;
    box-shadow:0 8px 28px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.95);
    margin-bottom:24px; animation:fadeUp .6s ease both;
    position:relative; overflow:hidden;
  }
  .clay-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:24px 24px 0 0; }
  .card-orange::before { background:linear-gradient(90deg,#ffa726,#ffcc02); }
  .card-amber::before  { background:linear-gradient(90deg,#ff8f00,#ffa726); }

  .clay-section-title { font-family:'Nunito',sans-serif; font-size:1.1rem; font-weight:800; color:#2d2d4e; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; }
  .card-header-right { display:flex; align-items:center; gap:10px; }

  /* ── Form ── */
  .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
  @media(max-width:600px){ .form-grid{grid-template-columns:1fr;} }
  .form-group { display:flex; flex-direction:column; }

  .clay-label { font-size:.72rem; font-weight:700; color:#5a5a7a; margin-bottom:7px; letter-spacing:.4px; text-transform:uppercase; }
  .clay-input {
    padding:12px 15px;
    background:rgba(255,255,255,.8); border:2px solid rgba(255,255,255,.9); border-radius:14px;
    font-family:'Poppins',sans-serif; font-size:.88rem; color:#2d2d4e;
    box-shadow:0 3px 10px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.9);
    transition:border-color .2s, box-shadow .2s; outline:none;
  }
  .clay-input::placeholder { color:#bbb; }
  .clay-input:focus {
    border-color:rgba(255,167,38,.55);
    box-shadow:0 0 0 3px rgba(255,167,38,.12), inset 0 1px 0 rgba(255,255,255,.9);
  }

  /* ── Alert ── */
  .clay-alert { border-radius:14px; padding:12px 16px; margin-bottom:18px; font-size:.85rem; font-weight:500; display:flex; align-items:center; gap:8px; animation:fadeIn .3s ease; }
  .alert-info    { background:rgba(255,248,225,.9); border:2px solid rgba(255,224,130,.6); color:#f57f17; }
  .alert-success { background:rgba(232,245,233,.9); border:2px solid rgba(165,214,167,.5); color:#2e7d32; }

  /* ── Buttons ── */
  .clay-btn { padding:12px 22px; border:none; border-radius:14px; font-family:'Poppins',sans-serif; font-size:.88rem; font-weight:700; cursor:pointer; transition:transform .15s, box-shadow .15s, filter .15s; }
  .clay-btn:active { transform:scale(.97) translateY(2px) !important; }
  .clay-btn:disabled { opacity:.6; cursor:not-allowed; }
  .clay-btn-orange {
    background:linear-gradient(135deg,#ffa726,#fb8c00); color:white;
    box-shadow:0 5px 0 #e65100, 0 8px 20px rgba(255,167,38,.35), inset 0 1px 0 rgba(255,255,255,.3);
  }
  .clay-btn-orange:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); box-shadow:0 7px 0 #e65100, 0 12px 26px rgba(255,167,38,.45); }
  .clay-btn-green {
    background:linear-gradient(135deg,#66bb6a,#43a047); color:white;
    box-shadow:0 5px 0 #2e7d32, 0 8px 18px rgba(102,187,106,.3), inset 0 1px 0 rgba(255,255,255,.3);
    display:flex; align-items:center; gap:7px;
  }
  .clay-btn-green:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }
  .clay-btn-w { width:100%; margin-top:8px; justify-content:center; }

  /* ── Rooms grid ── */
  .rooms-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
  @media(max-width:700px){ .rooms-grid{grid-template-columns:repeat(2,1fr);} }
  @media(max-width:420px){ .rooms-grid{grid-template-columns:1fr;} }

  .room-card {
    background:rgba(255,255,255,.6); backdrop-filter:blur(12px);
    border:2px solid rgba(255,255,255,.85); border-radius:18px; padding:18px;
    box-shadow:0 4px 16px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.9);
    transition:transform .2s; animation:fadeUp .5s ease both;
    position:relative; overflow:hidden;
  }
  .room-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:18px 18px 0 0; }
  .room-avail::before  { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .room-unavail::before{ background:linear-gradient(90deg,#ef9a9a,#e57373); }
  .room-card:hover { transform:translateY(-3px); }

  .room-type { font-family:'Nunito',sans-serif; font-size:.95rem; font-weight:800; color:#2d2d4e; margin-bottom:5px; }
  .room-rent { font-size:.82rem; color:#7a7a9a; margin-bottom:14px; font-weight:500; }

  /* Toggle switch */
  .toggle-row { display:flex; align-items:center; justify-content:space-between; }
  .toggle-label { font-size:.75rem; font-weight:700; color:#5a5a7a; }
  .toggle-wrap { position:relative; width:44px; height:24px; }
  .toggle-wrap input { opacity:0; width:0; height:0; }
  .toggle-slider {
    position:absolute; cursor:pointer; inset:0; border-radius:50px;
    transition:.3s; background:rgba(200,200,220,.5);
    box-shadow:inset 0 2px 4px rgba(0,0,0,.1);
  }
  .toggle-slider::before {
    content:''; position:absolute; height:18px; width:18px; left:3px; bottom:3px;
    background:white; border-radius:50%; transition:.3s;
    box-shadow:0 2px 6px rgba(0,0,0,.15);
  }
  .toggle-wrap input:checked + .toggle-slider { background:linear-gradient(135deg,#66bb6a,#43a047); box-shadow:0 3px 10px rgba(102,187,106,.35); }
  .toggle-wrap input:checked + .toggle-slider::before { transform:translateX(20px); }

  .empty-state { text-align:center; padding:32px; color:#9a9ab0; font-size:.88rem; }
  .empty-emoji { font-size:2.5rem; margin-bottom:10px; display:block; }
`;

export default function OwnerPGManagement() {
  const [pgs, setPgs]           = useState([]);
  const [rooms, setRooms]       = useState([]);
  const [selectedPG, setSelectedPG] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [message, setMessage]   = useState("");
  const [msgType, setMsgType]   = useState("info");

  const [pgForm, setPgForm] = useState({ name:"", location:"", rent:"", amenities:"" });

  const fetchPGs = async () => {
    try {
      const res = await apiGetOwnerPGs();
      setPgs(res.data);
      if (res.data.length > 0 && !selectedPG) {
        selectPG(res.data[0]);
      }
    } catch (err) { console.error(err); }
  };

  const selectPG = (pg) => {
    setSelectedPG(pg);
    setPgForm({ name: pg.name, location: pg.location, rent: pg.rent, amenities: pg.amenities?.join(", ") || "" });
    fetchRooms(pg._id);
  };

  const fetchRooms = async (pgId) => {
    try { const res = await apiGetRooms(pgId); setRooms(res.data); } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPGs(); }, []);

  const handleSavePG = async () => {
    setSaving(true); setMessage("");
    try {
      const payload = {
        name: pgForm.name, location: pgForm.location, rent: Number(pgForm.rent),
        amenities: pgForm.amenities.split(",").map((a) => a.trim()).filter(Boolean),
      };
      if (selectedPG) {
        await apiUpdatePG(selectedPG._id, payload);
        setMessage("PG details updated successfully!"); setMsgType("success");
      } else {
        const res = await apiCreatePG(payload);
        setSelectedPG(res.data);
        setMessage("PG Stay created successfully!"); setMsgType("success");
      }
      await fetchPGs();
    } catch (err) { setMessage(err.message); setMsgType("info"); }
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
        roomType, rent: Number(rent),
        capacity: roomType.includes("Double") ? 2 : roomType.includes("Triple") ? 3 : 1,
        availability: true,
      });
      fetchRooms(selectedPG._id);
    } catch (err) { alert(err.message); }
  };

  const handleNewPG = () => {
    setSelectedPG(null);
    setPgForm({ name:"", location:"", rent:"", amenities:"" });
    setRooms([]);
    setMessage("");
  };

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="owner" />

        <main className="clay-main">
          <div className="clay-container">
            <h2 className="clay-page-title">🏢 PG & Room Management</h2>
            <p className="clay-page-sub">Create, update and manage your PG properties and rooms.</p>

            {/* PG Tabs */}
            {pgs.length > 0 && (
              <div className="pg-tab-row">
                {pgs.map((pg) => (
                  <button key={pg._id} className={`pg-tab ${selectedPG?._id === pg._id ? "active" : ""}`} onClick={() => selectPG(pg)}>
                    🏠 {pg.name}
                  </button>
                ))}
                <button className="new-pg-tab" onClick={handleNewPG}>+ Add New PG</button>
              </div>
            )}

            {/* PG Form */}
            <div className="clay-card card-orange">
              <div className="clay-section-title">
                📝 {selectedPG ? "Edit PG Details" : "Create New PG Stay"}
              </div>

              {message && (
                <div className={`clay-alert ${msgType === "success" ? "alert-success" : "alert-info"}`}>
                  {msgType === "success" ? "✅" : "ℹ️"} {message}
                </div>
              )}

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

              <button className="clay-btn clay-btn-orange clay-btn-w" onClick={handleSavePG} disabled={saving}>
                {saving ? "⏳ Saving…" : selectedPG ? "Update PG Details →" : "Create PG Stay →"}
              </button>
            </div>

            {/* Rooms */}
            <div className="clay-card card-amber">
              <div className="clay-section-title">
                <span>🚪 Room Management</span>
                <button className="clay-btn clay-btn-green" onClick={handleAddRoom}>
                  <Plus size={15} /> Add Room
                </button>
              </div>

              {rooms.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-emoji">🚪</span>
                  No rooms added yet. Click "Add Room" to get started.
                </div>
              ) : (
                <div className="rooms-grid">
                  {rooms.map((room, i) => (
                    <div key={room._id} className={`room-card ${room.availability ? "room-avail" : "room-unavail"}`} style={{ animationDelay: `${i * .06}s` }}>
                      <div className="room-type">{room.roomType}</div>
                      <div className="room-rent">₹{room.rent}/month</div>
                      <div className="toggle-row">
                        <span className="toggle-label">{room.availability ? "✅ Available" : "❌ Unavailable"}</span>
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