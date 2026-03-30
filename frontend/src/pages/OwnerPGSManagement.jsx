import { useEffect, useState, useRef } from "react";
import RoleNavigation from "../context/RoleNavigation";
import Modal from "../components/Modal";
import { toast } from "../components/Toast";
import { apiGetOwnerPGs, apiCreatePG, apiUpdatePG, apiGetRooms, apiAddRoom, apiUpdateRoom } from "../utils/api";
import { CLAY_BASE, CLAY_OWNER, injectClay } from "../styles/claystyles";
import { Plus, Trash2, ImagePlus, ChevronDown, X } from "lucide-react";
import { apiUploadPGImages, apiDeletePGImage } from "../utils/api";

/* ─── Predefined amenities list ─── */
const AMENITY_OPTIONS = [
  "Furnished Room",
  "Clean Bathroom & Toilets",
  "Electricity & Power Supply",
  "Running Water",
  "Safe Drinking Water",
  "Food / Meal Service",
  "Internet / Wi-Fi",
  "Housekeeping",
  "Laundry Facilities",
  "Security & Safety",
  "Refrigerator",
  "Induction or Microwave for Basic Cooking",
  "Common Lounge or Seating Area",
  "Parking for Bikes",
  "AC",
  "CCTV",
  "Gym",
  "24/7 Water Supply",
];

const PAGE_CSS = `
  .pg-tab-row { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:28px; }
  .pg-tab { padding:10px 22px; border:2.5px solid rgba(255,255,255,.85); border-radius:50px; font-family:'Poppins',sans-serif; font-size:.83rem; font-weight:700; cursor:pointer; background:rgba(255,255,255,.65); backdrop-filter:blur(12px); color:#5a5a7a; box-shadow:0 4px 14px rgba(0,0,0,.07),0 3px 0 rgba(0,0,0,.05); transition:all .18s; }
  .pg-tab:hover { transform:translateY(-2px); }
  .pg-tab.active { background:linear-gradient(135deg,#ffa726,#ff8f00); color:white; border-color:transparent; box-shadow:0 5px 0 #e65100,0 8px 20px rgba(255,167,38,.4); transform:translateY(-2px); }
  .new-pg-tab { padding:10px 22px; border:2.5px dashed rgba(255,167,38,.55); border-radius:50px; font-family:'Poppins',sans-serif; font-size:.83rem; font-weight:700; cursor:pointer; background:rgba(255,248,225,.6); color:#f57f17; transition:all .18s; }
  .new-pg-tab:hover { border-color:rgba(255,167,38,.85); background:rgba(255,248,225,.9); transform:translateY(-2px); }
  .pg-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:32px; box-shadow:0 8px 28px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95); margin-bottom:24px; animation:fadeUp .6s ease both; position:relative; overflow:visible; }
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
  .amenity-wrapper { position:relative; }
  .amenity-display { display:flex; align-items:center; justify-content:space-between; min-height:44px; padding:10px 14px; background:rgba(255,255,255,.7); border:2px solid rgba(255,255,255,.9); border-radius:14px; cursor:pointer; box-shadow:0 3px 10px rgba(0,0,0,.06); gap:8px; flex-wrap:wrap; overflow:visible; }
  .amenity-display:hover { border-color:rgba(255,167,38,.5); }
  .amenity-tag { display:inline-flex; align-items:center; gap:4px; background:linear-gradient(135deg,rgba(255,167,38,.2),rgba(255,204,2,.2)); border:1.5px solid rgba(255,167,38,.4); border-radius:20px; padding:3px 10px; font-size:.75rem; font-weight:600; color:#e65100; }
  .amenity-tag button { background:none; border:none; cursor:pointer; color:#e65100; display:flex; padding:0; }
  .amenity-placeholder { color:#9a9ab0; font-size:.85rem; font-style:italic; }
  .amenity-dropdown { position:absolute; top:calc(100% + 6px); left:0; right:0; background:rgba(255,255,255,.97); backdrop-filter:blur(20px); border:2px solid rgba(255,255,255,.9); border-radius:18px; box-shadow:0 12px 40px rgba(0,0,0,.14); z-index:500; max-height:260px; overflow-y:auto; padding:8px 0; }
  .amenity-option { padding:10px 16px; cursor:pointer; font-size:.85rem; font-weight:500; color:#3a3a5e; display:flex; align-items:center; gap:10px; transition:background .12s; }
  .amenity-option:hover { background:rgba(255,167,38,.08); }
  .amenity-option.selected { color:#e65100; background:rgba(255,167,38,.1); }
  .amenity-check { width:16px; height:16px; border-radius:4px; border:2px solid rgba(255,167,38,.5); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:.65rem; }
  .amenity-check.checked { background:linear-gradient(135deg,#ffa726,#fb8c00); border-color:transparent; color:white; }
  .amenity-divider { height:1px; background:rgba(0,0,0,.06); margin:6px 8px; }
  .amenity-other-row { display:flex; gap:6px; padding:6px 10px 10px; }
  .amenity-other-input { flex:1; padding:8px 12px; border:2px solid rgba(255,167,38,.3); border-radius:10px; font-size:.83rem; outline:none; background:rgba(255,248,225,.5); font-family:inherit; }
  .amenity-other-input:focus { border-color:rgba(255,167,38,.7); }
  .amenity-add-btn { padding:8px 14px; background:linear-gradient(135deg,#ffa726,#fb8c00); color:white; border:none; border-radius:10px; font-size:.8rem; font-weight:700; cursor:pointer; white-space:nowrap; }
  .room-type-row { display:flex; gap:12px; margin-bottom:4px; }
  .room-type-btn { flex:1; padding:12px; border:2.5px solid rgba(200,200,220,.5); border-radius:14px; font-size:.88rem; font-weight:700; cursor:pointer; background:rgba(255,255,255,.6); color:#5a5a7a; transition:all .16s; text-align:center; }
  .room-type-btn.active { border-color:#ffa726; background:linear-gradient(135deg,rgba(255,167,38,.15),rgba(255,204,2,.1)); color:#e65100; box-shadow:0 3px 12px rgba(255,167,38,.2); }
  /* ── License document upload ── */
  .license-upload-zone { width:100%; padding:18px 16px; border-radius:14px; cursor:pointer; background:rgba(255,255,255,.72); border:2.5px dashed rgba(255,167,38,.55); font-family:'Poppins',sans-serif; font-size:.85rem; font-weight:600; color:#5a5a7a; transition:all .2s; display:flex; align-items:center; gap:12px; }
  .license-upload-zone:hover { border-color:rgba(255,167,38,.85); background:rgba(255,248,225,.6); }
  .license-upload-zone input[type="file"] { display:none; }
  .license-upload-ready { border-color:rgba(102,187,106,.7); background:rgba(232,245,233,.6); color:#2e7d32; }
  .license-error { color:#c62828; font-size:.78rem; font-weight:600; margin-top:6px; display:flex; align-items:center; gap:5px; }
  .license-required-badge { display:inline-flex; align-items:center; gap:4px; background:rgba(255,235,238,.9); color:#c62828; border:1.5px solid rgba(239,154,154,.5); border-radius:50px; padding:3px 10px; font-size:.72rem; font-weight:700; margin-left:8px; }
`;

const css = injectClay(CLAY_BASE, CLAY_OWNER, PAGE_CSS);

/* ─── Helper: capitalise first letter of every word ─── */
const toTitleCase = (str) =>
  str.replace(/(^|\s)(\S)/g, (_, space, char) => space + char.toUpperCase());

/* ─── Amenity Multi-Select Dropdown ─── */
function AmenitySelector({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [otherText, setOtherText] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (opt) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };

  const addOther = () => {
    const val = otherText.trim();
    if (!val) return;
    const titled = toTitleCase(val);
    if (!selected.includes(titled)) onChange([...selected, titled]);
    setOtherText("");
  };

  return (
    <div className="amenity-wrapper" ref={ref}>
      <div className="amenity-display" onClick={() => setOpen((o) => !o)}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", flex:1 }}>
          {selected.length === 0
            ? <span className="amenity-placeholder">Select amenities…</span>
            : selected.map((s) => (
                <span key={s} className="amenity-tag">
                  {s}
                  <button onClick={(e) => { e.stopPropagation(); toggle(s); }}>
                    <X size={11} />
                  </button>
                </span>
              ))}
        </div>
        <ChevronDown
          size={16}
          color="#9a9ab0"
          style={{ flexShrink:0, transform: open ? "rotate(180deg)" : "none", transition:"transform .2s" }}
        />
      </div>

      {open && (
        <div className="amenity-dropdown">
          {AMENITY_OPTIONS.map((opt) => {
            const sel = selected.includes(opt);
            return (
              <div key={opt} className={`amenity-option${sel ? " selected" : ""}`} onClick={() => toggle(opt)}>
                <span className={`amenity-check${sel ? " checked" : ""}`}>{sel ? "✓" : ""}</span>
                {opt}
              </div>
            );
          })}
          <div className="amenity-divider" />
          <div style={{ padding:"4px 10px 2px", fontSize:".78rem", fontWeight:700, color:"#9a9ab0" }}>
            ➕ Others — type your own
          </div>
          <div className="amenity-other-row">
            <input
              className="amenity-other-input"
              placeholder="Type custom amenity…"
              value={otherText}
              onChange={(e) => setOtherText(toTitleCase(e.target.value))}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOther(); } }}
              onClick={(e) => e.stopPropagation()}
            />
            <button className="amenity-add-btn" onClick={(e) => { e.stopPropagation(); addOther(); }}>Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OwnerPGManagement() {
  const [pgs, setPgs]               = useState([]);
  const [rooms, setRooms]           = useState([]);
  const [selectedPG, setSelectedPG] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [pgForm, setPgForm]         = useState({ name:"", location:"", rent:"", amenities:[] });
  const [uploading, setUploading]   = useState(false);
  const [pgImages, setPgImages]     = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomForm, setRoomForm]           = useState({ roomType:"", rent:"", capacity:"2" });
  const [addingRoom, setAddingRoom]       = useState(false);

  // License document state (only required when creating new PG)
  const [licenseFile, setLicenseFile]   = useState(null);
  const [licenseError, setLicenseError] = useState("");

  const fetchPGs = async () => {
    try {
      const res = await apiGetOwnerPGs();
      setPgs(res.data);
      if (res.data.length > 0 && !selectedPG) selectPG(res.data[0]);
    } catch (err) { toast.error(err.message); }
  };

  const selectPG = (pg) => {
    setSelectedPG(pg);
    setPgForm({ name: pg.name, location: pg.location, rent: pg.rent, amenities: pg.amenities || [] });
    setPgImages(pg.images || []);
    fetchRooms(pg._id);
  };

  const fetchRooms = async (pgId) => {
    try {
      const res = await apiGetRooms(pgId);
      setRooms(res.data);
    } catch (err) { toast.error(err.message); }
  };

  useEffect(() => { fetchPGs(); }, []);

  const handleSavePG = async () => {
    if (!pgForm.name || !pgForm.location || !pgForm.rent) {
      toast.warning("Name, location and rent are required");
      return;
    }
    // License document is mandatory only when creating a new PG
    if (!selectedPG && !licenseFile) {
      setLicenseError("Please upload the PG license document before submitting.");
      return;
    }
    setSaving(true);
    try {
      if (selectedPG) {
        const payload = {
          name:      pgForm.name,
          location:  pgForm.location,
          rent:      Number(pgForm.rent),
          amenities: pgForm.amenities,
        };
        await apiUpdatePG(selectedPG._id, payload);
        toast.success("PG details updated successfully!");
      } else {
        // Build multipart FormData for new PG creation (license required)
        const fd = new FormData();
        fd.append("name",      pgForm.name);
        fd.append("location",  pgForm.location);
        fd.append("rent",      String(pgForm.rent));
        fd.append("amenities", JSON.stringify(pgForm.amenities));
        fd.append("licenseDocument", licenseFile);
        const res = await apiCreatePG(fd);
        setSelectedPG(res.data);
        setLicenseFile(null);
        setLicenseError("");
        toast.success("PG Stay created successfully!");
      }
      await fetchPGs();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleToggleRoom = async (room) => {
    try {
      await apiUpdateRoom(room._id, { availability: !room.availability });
      toast.success(room.availability ? "Room marked as unavailable" : "Room marked as available");
      fetchRooms(selectedPG._id);
    } catch (err) { toast.error(err.message); }
  };

  const handleAddRoom = async () => {
    if (!selectedPG) { toast.warning("Save PG details first."); return; }
    if (!roomForm.roomType || !roomForm.rent) {
      toast.warning("Room type and rent are required");
      return;
    }
    setAddingRoom(true);
    try {
      const payload = {
        roomType:     roomForm.roomType,
        rent:         Number(roomForm.rent),
        availability: true,
        capacity:     roomForm.roomType === "Shared" ? (Number(roomForm.capacity) || 2) : 1,
      };
      await apiAddRoom(selectedPG._id, payload);
      toast.success("Room added successfully!");
      setShowRoomModal(false);
      setRoomForm({ roomType:"", rent:"", capacity:"2" });
      fetchRooms(selectedPG._id);
    } catch (err) { toast.error(err.message); }
    finally { setAddingRoom(false); }
  };

  const handleNewPG = () => {
    setSelectedPG(null);
    setPgForm({ name:"", location:"", rent:"", amenities:[] });
    setRooms([]);
    setLicenseFile(null);
    setLicenseError("");
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
    } catch (err) { toast.error(err.message); }
    finally { setUploading(false); e.target.value = ""; }
  };

  /* ✅ No browser alert — in-site toast only */
  const handleDeleteImage = async (imgId) => {
    try {
      const res = await apiDeletePGImage(selectedPG._id, imgId);
      setPgImages(res.data);
      toast.success("Successfully deleted the image");
    } catch (err) { toast.error(err.message); }
  };

  /* Auto-capitalise first letter of each word */
  const handleCapInput = (field, value) =>
    setPgForm((prev) => ({ ...prev, [field]: toTitleCase(value) }));

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="owner" />

        {/* ─── Add Room Modal ─── */}
        {showRoomModal && (
          <Modal
            title="➕ Add New Room"
            subtitle="Enter room details below"
            onClose={() => { setShowRoomModal(false); setRoomForm({ roomType:"", rent:"", capacity:"2" }); }}
            onConfirm={handleAddRoom}
            confirmLabel="Add Room"
            loading={addingRoom}
            fields={
              <div>
                {/* Single / Shared toggle */}
                <div className="form-group" style={{ marginBottom:16 }}>
                  <label className="clay-label">Room Type</label>
                  <div className="room-type-row">
                    {["Single", "Shared"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`room-type-btn${roomForm.roomType === type ? " active" : ""}`}
                        onClick={() => setRoomForm({ ...roomForm, roomType: type })}
                      >
                        {type === "Single" ? "🛏 Single" : "👥 Shared"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monthly Rent */}
                <div className="form-group" style={{ marginBottom:16 }}>
                  <label className="clay-label">Monthly Rent (₹)</label>
                  <input
                    className="clay-input"
                    type="number"
                    placeholder="e.g. 7500"
                    value={roomForm.rent}
                    onChange={(e) => setRoomForm({ ...roomForm, rent: e.target.value })}
                  />
                </div>

                {/* Capacity — only for Shared */}
                {roomForm.roomType === "Shared" && (
                  <div className="form-group">
                    <label className="clay-label">Room Capacity (persons)</label>
                    <input
                      className="clay-input"
                      type="number"
                      min="2"
                      max="10"
                      placeholder="e.g. 3"
                      value={roomForm.capacity}
                      onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                    />
                  </div>
                )}
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

            {/* ─── Create / Edit PG Card ─── */}
            <div className="pg-card card-orange">
              <div className="pg-section-title">
                📝 {selectedPG ? "Edit PG Details" : "Create New PG Stay"}
              </div>
              <div className="form-grid">
                {/* PG Name — auto capitalise */}
                <div className="form-group">
                  <label className="clay-label">PG Name</label>
                  <input
                    className="clay-input"
                    placeholder="e.g. Sunshine PG"
                    value={pgForm.name}
                    onChange={(e) => handleCapInput("name", e.target.value)}
                  />
                </div>

                {/* Location — auto capitalise */}
                <div className="form-group">
                  <label className="clay-label">Location</label>
                  <input
                    className="clay-input"
                    placeholder="Area, City"
                    value={pgForm.location}
                    onChange={(e) => handleCapInput("location", e.target.value)}
                  />
                </div>

                {/* Rent */}
                <div className="form-group">
                  <label className="clay-label">Base Rent / Month (₹)</label>
                  <input
                    className="clay-input"
                    type="number"
                    placeholder="e.g. 7500"
                    value={pgForm.rent}
                    onChange={(e) => setPgForm({ ...pgForm, rent: e.target.value })}
                  />
                </div>

                {/* Amenities dropdown */}
                <div className="form-group">
                  <label className="clay-label">Amenities</label>
                  <AmenitySelector
                    selected={pgForm.amenities}
                    onChange={(val) => setPgForm({ ...pgForm, amenities: val })}
                  />
                </div>
              </div>

              {/* License Document — required only for new PG creation */}
              {!selectedPG && (
                <div style={{ marginTop: 16 }}>
                  <label className="clay-label" style={{ display:"flex", alignItems:"center", marginBottom:8 }}>
                    📄 License / Registration Document
                    <span className="license-required-badge">* Required</span>
                  </label>
                  <label
                    className={`license-upload-zone${licenseFile ? " license-upload-ready" : ""}`}
                    htmlFor="pg-license-upload"
                  >
                    <input
                      id="pg-license-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setLicenseFile(file);
                        setLicenseError("");
                      }}
                    />
                    <span style={{ fontSize:"1.6rem" }}>{licenseFile ? "✅" : "📋"}</span>
                    <div>
                      <div style={{ fontWeight:700, color: licenseFile ? "#2e7d32" : "#2d2d4e", fontSize:".88rem" }}>
                        {licenseFile ? licenseFile.name : "Upload PG License / Registration Document"}
                      </div>
                      <div style={{ fontSize:".74rem", color:"#9a9ab0", marginTop:3 }}>
                        JPG · PNG · PDF &nbsp;·&nbsp; Max 15MB &nbsp;·&nbsp; Admin will verify before listing goes live
                      </div>
                    </div>
                  </label>
                  {licenseError && (
                    <div className="license-error">
                      <span>⚠️</span> {licenseError}
                    </div>
                  )}
                </div>
              )}

              <button className="update-btn" onClick={handleSavePG} disabled={saving}>
                {saving ? "⏳ Saving…" : selectedPG ? "Update PG Details →" : "Create PG Stay →"}
              </button>
            </div>

            {/* ─── Room Management Card ─── */}
            <div className="pg-card card-amber">
              <div className="pg-section-title">
                <span>🚪 Room Management</span>
                <button className="add-room-btn" onClick={() => setShowRoomModal(true)}>
                  <Plus size={15} /> Add Room
                </button>
              </div>

              {/* Photo Management */}
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
                        <span style={{ fontSize:".75rem", color:"#9a9ab0", fontWeight:500 }}>
                          JPG, PNG or WebP accepted
                        </span>
                        <input type="file" accept="image/*" multiple onChange={handleUploadImages} disabled={uploading} />
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
                    <div
                      key={room._id}
                      className={`room-card ${room.availability ? "room-avail" : "room-unavail"}`}
                      style={{ animationDelay:`${i * 0.06}s` }}
                    >
                      <div className="room-type">{room.roomType}</div>
                      <div className="room-rent">₹{room.rent}/month</div>
                      {room.roomType === "Shared" && room.capacity && (
                        <div style={{ fontSize:".78rem", color:"#7a7a9a", marginBottom:8 }}>
                          👥 Capacity: {room.capacity} persons
                        </div>
                      )}
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