import { useEffect, useState } from "react";
import { MapPin, IndianRupee, ShieldAlert } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { toast } from "../components/Toast";
import PGDetailsModal from "../components/PGDetailsModal";
import { apiGetRecommendations, apiGetAllPGs, apiApply, apiGetRooms, apiGetMe } from "../utils/api";
import { CLAY_BASE, CLAY_TENANT, injectClay } from "../styles/claystyles";
import { toTitleCase } from "../utils/capitalization";

// ── Master amenity list (mirrors OwnerPGSManagement) ──────────────────────
const ALL_AMENITIES = [
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
  .find-layout { display:grid; grid-template-columns:280px 1fr; gap:24px; }
  @media(max-width:800px){ .find-layout{grid-template-columns:1fr;} }

  /* ── Filter panel ── */
  .filter-panel { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:24px; box-shadow:0 8px 32px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95); height:fit-content; position:sticky; top:80px; animation:fadeUp .6s ease both; }
  .filter-title { font-family:'Nunito',sans-serif; font-size:1rem; font-weight:800; color:#2d2d4e; margin-bottom:20px; display:flex; align-items:center; gap:8px; }
  .filter-group { margin-bottom:18px; }
  .budget-row   { display:grid; grid-template-columns:1fr 1fr; gap:8px; }

  /* ── Room-type buttons ── */
  .rt-btn-row { display:flex; flex-direction:column; gap:8px; }
  .rt-btn { width:100%; padding:10px 14px; border:2px solid rgba(200,200,220,.5); border-radius:12px; font-family:'Poppins',sans-serif; font-size:.83rem; font-weight:600; cursor:pointer; background:rgba(255,255,255,.6); color:#5a5a7a; transition:all .16s; text-align:left; display:flex; align-items:center; gap:10px; }
  .rt-btn.active { border-color:#42a5f5; background:linear-gradient(135deg,rgba(66,165,245,.12),rgba(144,202,249,.08)); color:#1565c0; box-shadow:0 3px 10px rgba(66,165,245,.18); }
  .rt-cap-input { width:100%; margin-top:8px; padding:9px 12px; border:2px solid rgba(144,202,249,.4); border-radius:10px; font-family:'Poppins',sans-serif; font-size:.83rem; outline:none; background:rgba(227,242,253,.4); transition:border-color .15s; }
  .rt-cap-input:focus { border-color:rgba(66,165,245,.7); }

  /* ── Amenity checkboxes — scrollable ── */
  .amenity-list { max-height:200px; overflow-y:auto; padding-right:4px; scrollbar-width:thin; }
  .amenity-list::-webkit-scrollbar { width:4px; }
  .amenity-list::-webkit-scrollbar-thumb { background:rgba(66,165,245,.3); border-radius:4px; }
  .clay-checkbox-row { display:flex; align-items:center; gap:10px; margin-bottom:9px; }
  .clay-checkbox-row input[type="checkbox"] { width:16px; height:16px; flex-shrink:0; accent-color:#42a5f5; cursor:pointer; margin:0; }
  .clay-checkbox-row label { font-size:.82rem; color:#5a5a7a; font-weight:500; cursor:pointer; user-select:none; line-height:1.3; }

  .clay-divider { height:1.5px; background:rgba(200,200,220,.35); border-radius:4px; margin:18px 0; }
  .filter-panel .clay-btn { width:100%; justify-content:center; margin-bottom:10px; display:flex; }
  .filter-panel .clay-btn:last-child { margin-bottom:0; }

  /* ── Listings ── */
  .listings-col { display:flex; flex-direction:column; gap:18px; }
  .pg-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:24px; box-shadow:0 8px 28px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95); transition:transform .22s,box-shadow .22s,border-color .22s; animation:fadeUp .6s ease both; position:relative; overflow:hidden; }
  .pg-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:24px 24px 0 0; background:linear-gradient(90deg,#42a5f5,#66bb6a); opacity:0; transition:opacity .2s; }
  .pg-card:hover { transform:translateY(-5px); box-shadow:0 18px 44px rgba(0,0,0,.12); border-color:rgba(66,165,245,.25); }
  .pg-card:hover::before { opacity:1; }

  .pg-card-inner { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
  .pg-title-row  { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:8px; }
  .pg-name       { font-family:'Nunito',sans-serif; font-size:1.15rem; font-weight:900; color:#2d2d4e; }
  .pg-meta-row   { display:flex; align-items:center; gap:6px; color:#7a7a9a; font-size:.82rem; margin-bottom:5px; }
  .pg-price      { font-family:'Nunito',sans-serif; font-size:1.1rem; font-weight:800; color:#1565c0; display:flex; align-items:center; gap:2px; margin-bottom:2px; }
  .pg-price-sub  { font-size:.72rem; color:#9a9ab0; font-weight:500; margin-left:1px; }
  /* ── Amenity tags — wrap fully, no clipping ── */
  .pg-tags       { display:flex; gap:6px; flex-wrap:wrap; margin-top:10px; padding-bottom:2px; }
  .rooms-text    { font-size:.72rem; color:#9a9ab0; margin-top:10px; font-weight:600; display:flex; align-items:center; gap:5px; }

  .apply-btn { flex-shrink:0; padding:12px 22px; border:none; border-radius:16px; font-family:'Poppins',sans-serif; font-size:.88rem; font-weight:700; cursor:pointer; white-space:nowrap; align-self:flex-start; background:linear-gradient(135deg,#42a5f5,#1e88e5); color:white; box-shadow:0 5px 0 #1565c0,0 8px 18px rgba(66,165,245,.35),inset 0 1px 0 rgba(255,255,255,.3); transition:transform .15s,box-shadow .15s,filter .15s; }
  .apply-btn:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }
  .apply-btn:disabled { opacity:.6; cursor:not-allowed; }
  .apply-btn-locked { background:linear-gradient(135deg,#b0bec5,#90a4ae); box-shadow:0 5px 0 #607d8b,0 8px 18px rgba(144,164,174,.3),inset 0 1px 0 rgba(255,255,255,.3); }
  .apply-btn-applied { background:linear-gradient(135deg,#66bb6a,#43a047); box-shadow:0 5px 0 #2e7d32,0 8px 18px rgba(102,187,106,.35),inset 0 1px 0 rgba(255,255,255,.3); cursor:default; }
  .apply-btn-applied:hover { filter:none; transform:none; }

  /* ── Verification gate banner ── */
  .verify-gate { background:rgba(255,235,238,.85); border:2px solid rgba(239,154,154,.5); border-radius:18px; padding:18px 20px; margin-bottom:24px; display:flex; align-items:flex-start; gap:14px; }
  .verify-gate-icon { font-size:1.8rem; flex-shrink:0; }
  .verify-gate-title { font-family:'Nunito',sans-serif; font-size:1rem; font-weight:800; color:#c62828; margin-bottom:4px; }
  .verify-gate-sub   { font-size:.82rem; color:#7a7a9a; }
  .verify-gate-link  { display:inline-block; margin-top:8px; padding:7px 16px; border-radius:10px; background:linear-gradient(135deg,#42a5f5,#1e88e5); color:white; font-size:.82rem; font-weight:700; cursor:pointer; border:none; }
  .verify-gate-link:hover { filter:brightness(1.08); }

  .gallery { display:flex; gap:8px; overflow-x:auto; padding:10px 0 4px; scrollbar-width:thin; }
  .gallery::-webkit-scrollbar { height:4px; }
  .gallery::-webkit-scrollbar-thumb { background:rgba(180,180,200,.4); border-radius:4px; }
  .gallery-img { flex-shrink:0; width:130px; height:86px; border-radius:12px; object-fit:cover; border:2px solid rgba(255,255,255,.85); box-shadow:0 3px 10px rgba(0,0,0,.1); transition:transform .2s; cursor:pointer; }
  .gallery-img:hover { transform:scale(1.04); }
  .gallery-placeholder { flex-shrink:0; width:130px; height:86px; border-radius:12px; background:rgba(200,200,220,.2); border:2px dashed rgba(180,180,200,.4); display:flex; align-items:center; justify-content:center; color:#b0b0c8; font-size:.75rem; }
`;

const css = injectClay(CLAY_BASE, CLAY_TENANT, PAGE_CSS);

export default function FindPGs() {
  const [pgListings, setPgListings] = useState([]);
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [applying, setApplying]     = useState("");
  const [appliedPGs, setAppliedPGs] = useState([]);
  const [selectedPGDetails, setSelectedPGDetails] = useState(null);
  const [roomTypeFilter, setRoomTypeFilter] = useState(""); // "Single" | "Shared"
  const [capacityFilter, setCapacityFilter] = useState("");
  const [pgRooms, setPgRooms] = useState({});
  const [activePickerPGId, setActivePickerPGId] = useState(null);
  const [selectedRoomByPG, setSelectedRoomByPG] = useState({});
  const [filters, setFilters] = useState({
    location: "", budgetMin: "", budgetMax: "", amenities: [],
  });

  // Helper: parse formatted address string into individual fields
  const parseAddress = (addressStr) => {
    if (!addressStr) return { pgName:"", street:"", postOffice:"", placeOfResidence:"", district:"", pinNumber:"" };
    const parts = addressStr.split("\n").reduce((acc, line) => {
      if (line.includes("Name of Pg:")) acc.pgName = line.split(":")[1]?.trim() || "";
      else if (line.includes("Street name/locality:")) acc.street = line.split(":")[1]?.trim() || "";
      else if (line.includes("Post office name:")) acc.postOffice = line.split(":")[1]?.trim() || "";
      else if (line.includes("Place of residence:")) acc.placeOfResidence = line.split(":")[1]?.trim() || "";
      else if (line.includes("District:")) acc.district = line.split(":")[1]?.trim() || "";
      else if (line.includes("Pin number:")) acc.pinNumber = line.split(":")[1]?.trim() || "";
      return acc;
    }, { pgName:"", street:"", postOffice:"", placeOfResidence:"", district:"", pinNumber:"" });
    return parts;
  };

  useEffect(() => {
    Promise.all([apiGetAllPGs(), apiGetMe()])
      .then(([pgRes, meRes]) => {
        setPgListings(pgRes.data);
        setUser(meRes.user);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const isVerified = user?.verificationStatus === "verified";
  const hasDocument = !!user?.documentUrl;

  const loadRoomsForPG = async (pgId) => {
    if (pgRooms[pgId]) return;
    try {
      const res = await apiGetRooms(pgId);
      setPgRooms((prev) => ({ ...prev, [pgId]: res.data }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleOpenRoomPicker = async (pg) => {
    if (!hasDocument) {
      toast.error("Please upload your Aadhaar document in your profile first.");
      return;
    }
    if (!isVerified) {
      toast.error("Your Aadhaar is under review. You can apply once admin verifies you.");
      return;
    }

    await loadRoomsForPG(pg._id);
    setActivePickerPGId(pg._id);
    setSelectedRoomByPG((prev) => ({ ...prev, [pg._id]: "" }));
  };

  const handleCloseRoomPicker = (pgId) => {
    if (activePickerPGId === pgId) setActivePickerPGId(null);
    setSelectedRoomByPG((prev) => ({ ...prev, [pgId]: "" }));
  };

  const handleApplyForRoom = async (pgId, pgName) => {
    const roomId = selectedRoomByPG[pgId];
    if (!roomId) {
      toast.error("Select a room from the list before applying.");
      return;
    }

    setApplying(pgId);
    try {
      await apiApply({ pgStayId: pgId, roomId });
      setAppliedPGs((prev) => [...prev, pgId]);
      toast.success(`Application submitted for ${pgName}! 🎉`);
      handleCloseRoomPicker(pgId);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setApplying("");
    }
  };

  const handleViewDetails = async (pg) => {
    await loadRoomsForPG(pg._id);
    setSelectedPGDetails(pg);
    setActivePickerPGId(null);
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.location)             params.append("location",  filters.location);
      if (filters.budgetMin)            params.append("budgetMin", filters.budgetMin);
      if (filters.budgetMax)            params.append("budgetMax", filters.budgetMax);
      if (filters.amenities.length > 0) params.append("amenities", filters.amenities.join(","));
      if (roomTypeFilter)               params.append("roomType",  roomTypeFilter);
      if (roomTypeFilter === "Shared" && capacityFilter)
                                        params.append("capacity",  capacityFilter);
      const res = await apiGetAllPGs(params.toString() ? `?${params}` : "");
      setPgListings(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (pg) => {
    if (!hasDocument) {
      toast.error("Please upload your Aadhaar document in your profile first.");
      return;
    }
    if (!isVerified) {
      toast.error("Your Aadhaar is under review. You can apply once admin verifies you.");
      return;
    }
    setApplying(pg._id);
    try {
      const roomsRes  = await apiGetRooms(pg._id);
      let available = roomsRes.data.filter((r) => r.availability);

      // Filter by room type if selected
      if (roomTypeFilter) {
        const matched = available.filter((r) => r.roomType === roomTypeFilter);
        if (matched.length > 0) available = matched;
      }
      // Filter by capacity if entered (only relevant for Shared)
      if (roomTypeFilter === "Shared" && capacityFilter) {
        const cap = Number(capacityFilter);
        const capMatched = available.filter((r) => r.capacity >= cap);
        if (capMatched.length > 0) available = capMatched;
      }

      if (available.length === 0) {
        toast.warning("No matching rooms available for this PG right now.");
        return;
      }
      await apiApply({ pgStayId: pg._id, roomId: available[0]._id });
      setAppliedPGs((prev) => [...prev, pg._id]);
      toast.success(`Application submitted for ${pg.name}! 🎉`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setApplying("");
    }
  };

  const toggleAmenity = (value) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(value)
        ? prev.amenities.filter((v) => v !== value)
        : [...prev.amenities, value],
    }));
  };

  const resetFilters = () => {
    setFilters({ location: "", budgetMin: "", budgetMax: "", amenities: [] });
    setRoomTypeFilter("");
    setCapacityFilter("");
    setLoading(true);
    apiGetAllPGs()
      .then((res) => setPgListings(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="tenant" />
        
        {/* PG Details Modal */}
        {selectedPGDetails && (
          <PGDetailsModal
            pg={selectedPGDetails}
            rooms={pgRooms[selectedPGDetails._id] || []}
            onClose={() => setSelectedPGDetails(null)}
            parseAddress={parseAddress}
          />
        )}
        
        <main className="clay-main">
          <div className="clay-container">
            <h2 className="clay-page-title">🔍 Search PG Accommodations</h2>
            <p className="clay-page-sub">Browse verified PG stays filtered to your preferences.</p>

            {/* ── Verification gate banner ── */}
            {!loading && !isVerified && (
              <div className="verify-gate">
                <div className="verify-gate-icon">🪪</div>
                <div>
                  <div className="verify-gate-title">
                    {!hasDocument ? "Upload Aadhaar to Apply" : "Verification Pending"}
                  </div>
                  <div className="verify-gate-sub">
                    {!hasDocument
                      ? "You need to upload your Aadhaar document before you can apply to any PG."
                      : "Your Aadhaar has been submitted. Admin is reviewing it — you'll be able to apply once verified."}
                  </div>
                  {!hasDocument && (
                    <button className="verify-gate-link" onClick={() => window.location.href = "/tenant/profile"}>
                      Go to Profile & Upload →
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="find-layout">
              {/* ── Filter Panel ── */}
              <div className="filter-panel">
                <div className="filter-title">🎛️ Filters</div>

                {/* Location */}
                <div className="filter-group">
                  <label className="clay-label">Location</label>
                  <input className="clay-input" type="text" placeholder="Enter city or area"
                    value={filters.location} onChange={(e) => setFilters({ ...filters, location: toTitleCase(e.target.value) })} />
                </div>

                {/* Budget */}
                <div className="filter-group">
                  <label className="clay-label">Budget Range (₹)</label>
                  <div className="budget-row">
                    <input className="clay-input" type="number" placeholder="Min"
                      value={filters.budgetMin} onChange={(e) => setFilters({ ...filters, budgetMin: e.target.value })} />
                    <input className="clay-input" type="number" placeholder="Max"
                      value={filters.budgetMax} onChange={(e) => setFilters({ ...filters, budgetMax: e.target.value })} />
                  </div>
                </div>

                {/* Room Type */}
                <div className="filter-group">
                  <label className="clay-label">Room Type</label>
                  <div className="rt-btn-row">
                    {[
                      { key: "Single", emoji: "🛏", label: "Single Room" },
                      { key: "Shared", emoji: "👥", label: "Shared Room" },
                    ].map(({ key, emoji, label }) => (
                      <button
                        key={key}
                        className={`rt-btn${roomTypeFilter === key ? " active" : ""}`}
                        onClick={() => { setRoomTypeFilter(roomTypeFilter === key ? "" : key); setCapacityFilter(""); }}
                      >
                        <span>{emoji}</span> {label}
                      </button>
                    ))}
                  </div>
                  {/* Capacity input — only when Shared is selected */}
                  {roomTypeFilter === "Shared" && (
                    <input
                      className="rt-cap-input"
                      type="number"
                      min="2"
                      max="20"
                      placeholder="Capacity (persons)"
                      value={capacityFilter}
                      onChange={(e) => setCapacityFilter(e.target.value)}
                    />
                  )}
                </div>

                {/* Amenities */}
                <div className="filter-group">
                  <label className="clay-label">Amenities</label>
                  <div className="amenity-list">
                    {ALL_AMENITIES.map((a) => (
                      <div key={a} className="clay-checkbox-row">
                        <input type="checkbox" id={`am-${a}`}
                          checked={filters.amenities.includes(a)}
                          onChange={() => toggleAmenity(a)} />
                        <label htmlFor={`am-${a}`}>{a}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="clay-divider" />
                <button className="clay-btn clay-btn-blue" onClick={handleApplyFilters}>Apply Filters</button>
                <button className="clay-btn clay-btn-ghost" onClick={resetFilters}>↺ Reset</button>
              </div>

              {/* ── Listings ── */}
              <div className="listings-col">
                {loading ? (
                  <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Finding PG stays for you…</div>
                ) : pgListings.length === 0 ? (
                  <div className="clay-empty">
                    <span className="clay-empty-emoji">🏠</span>
                    No verified PG stays found.<br/>
                    <span style={{ color:"#42a5f5", fontWeight:700 }}>Try different filters or check back soon!</span>
                  </div>
                ) : (
                  pgListings.map((pg, i) => (
                    <div key={pg._id} className="pg-card" style={{ animationDelay: `${i * 0.07}s` }}>
                      <div className="pg-card-inner">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="pg-title-row">
                            <span className="pg-name">{pg.name}</span>
                            {pg.matchScore !== undefined && (
                              <span className="clay-badge badge-blue">⚡ {pg.matchScore}% match</span>
                            )}
                            {pg.verificationStatus === "verified" && (
                              <span className="clay-badge badge-green">✓ Verified</span>
                            )}
                          </div>
                          <div className="pg-meta-row"><MapPin size={14} /> {pg.location}</div>
                          {/* Amenity tags — full wrap, no clipping */}
                          <div className="pg-tags">
                            <span className="clay-badge badge-yellow">⭐ Trust {pg.trustScore}/100</span>
                            {(pg.amenities || []).map((a) => (
                              <span key={a} className="clay-badge badge-gray">{a}</span>
                            ))}
                          </div>
                          {/* Photo gallery */}
                          {pg.images && pg.images.length > 0 ? (
                            <div className="gallery">
                              {pg.images.map((img) => (
                                <img key={img._id} className="gallery-img" src={img.url} alt={pg.name} />
                              ))}
                            </div>
                          ) : (
                            <div className="gallery">
                              <div className="gallery-placeholder">📷 No photos yet</div>
                            </div>
                          )}
                          <div className="rooms-text">
                            🚪 {pg.availableRoomCount ?? pg.availableRooms ?? 0} room(s) available
                          </div>
                        </div>

                        {/* View Details & Apply buttons */}
                        <div style={{ flexShrink: 0, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                          <button
                            style={{
                              padding:"10px 16px",
                              background:"rgba(66,165,245,.15)",
                              border:"2px solid rgba(66,165,245,.4)",
                              borderRadius:"12px",
                              color:"#1565c0",
                              fontFamily:"Poppins,sans-serif",
                              fontSize:".82rem",
                              fontWeight:700,
                              cursor:"pointer",
                              transition:"all .15s",
                              whiteSpace:"nowrap"
                            }}
                            onClick={() => handleViewDetails(pg)}
                            onMouseEnter={(e) => {
                              e.target.style.background = "rgba(66,165,245,.25)";
                              e.target.style.borderColor = "rgba(66,165,245,.7)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "rgba(66,165,245,.15)";
                              e.target.style.borderColor = "rgba(66,165,245,.4)";
                            }}
                          >
                            👁️ View Details
                          </button>
                          <button
                            className={`apply-btn${!isVerified ? " apply-btn-locked" : ""}${appliedPGs.includes(pg._id) ? " apply-btn-applied" : ""}`}
                            onClick={() => !appliedPGs.includes(pg._id) && handleOpenRoomPicker(pg)}
                            disabled={applying === pg._id}
                            title={!isVerified ? "Verify your Aadhaar to apply" : appliedPGs.includes(pg._id) ? "Already applied" : ""}
                          >
                            {applying === pg._id
                              ? "⏳ Applying…"
                              : appliedPGs.includes(pg._id)
                                ? "✓ Applied"
                                : !isVerified
                                  ? "🔒 Apply for Room"
                                  : "Apply for Room"}
                          </button>
                          {!isVerified && (
                            <span style={{ fontSize:".68rem", color:"#9a9ab0", textAlign:"right", maxWidth:90 }}>
                              Verify first
                            </span>
                          )}
                        </div>

                        {activePickerPGId === pg._id && (
                          <div style={{ position:'fixed', inset:0, display:'flex', justifyContent:'center', alignItems:'center', padding:20, background:'rgba(0,0,0,.45)', zIndex:999 }}>
                            <div style={{ width:'min(600px,100%)', background:'#fff', borderRadius:22, padding:20, boxShadow:'0 20px 60px rgba(0,0,0,.25)', border:'2px solid #dbe2f1' }}>
                              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                                <div style={{ fontSize:'.95rem', fontWeight:800, color:'#283e7f' }}>Select room to apply</div>
                                <button onClick={() => handleCloseRoomPicker(pg._id)} style={{ border:'none', background:'transparent', fontSize:'1.2rem', cursor:'pointer', color:'#8f9bb8' }}>✕</button>
                              </div>

                              {pgRooms[pg._id] && pgRooms[pg._id].length > 0 ? (
                                <>
                                  <select
                                    value={selectedRoomByPG[pg._id] || ''}
                                    onChange={(e) => setSelectedRoomByPG((prev) => ({ ...prev, [pg._id]: e.target.value }))}
                                    style={{ width:'100%', padding:'10px', borderRadius:'10px', border:'1px solid #c7d5ee', marginBottom:'12px' }}
                                  >
                                    <option value="">-- Choose room --</option>
                                    {pgRooms[pg._id].map((room) => (
                                      <option key={room._id} value={room._id}>
                                        {room.roomType} | ₹{room.rent} | cap {room.capacity} | occ {room.currentOccupancy ?? 0} | {room.availability ? 'Available' : 'Full'}
                                      </option>
                                    ))}
                                  </select>

                                  <button
                                    className="apply-btn"
                                    onClick={() => handleApplyForRoom(pg._id, pg.name)}
                                    disabled={applying === pg._id || appliedPGs.includes(pg._id)}
                                    style={{ width:'100%', marginBottom: 10 }}
                                  >
                                    {applying === pg._id ? '⏳ Applying…' : 'Apply for Selected Room'}
                                  </button>

                                  <button
                                    style={{ width:'100%', padding:'10px', borderRadius:'10px', border:'1px solid #c7d5ee', background:'#fff', color:'#455a64', cursor:'pointer' }}
                                    onClick={() => handleCloseRoomPicker(pg._id)}
                                  >
                                    Close
                                  </button>
                                </>
                              ) : (
                                <div style={{ fontSize:'.86rem', color:'#606e92' }}>Loading room list...</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}