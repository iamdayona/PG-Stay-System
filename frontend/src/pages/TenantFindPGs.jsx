import { useEffect, useState } from "react";
import { MapPin, IndianRupee } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetRecommendations, apiGetAllPGs, apiApply, apiGetRooms } from "../utils/api";
import { CLAY_BASE, CLAY_TENANT, injectClay } from "../styles/claystyles";

const PAGE_CSS = `
  .find-layout { display:grid; grid-template-columns:260px 1fr; gap:24px; }
  @media(max-width:800px){ .find-layout{grid-template-columns:1fr;} }

  /* Filter panel */
  .filter-panel {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:24px;
    box-shadow:0 8px 32px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.95);
    height:fit-content; position:sticky; top:80px; animation:fadeUp .6s ease both;
  }
  .filter-title { font-family:'Nunito',sans-serif; font-size:1rem; font-weight:800; color:#2d2d4e; margin-bottom:20px; display:flex; align-items:center; gap:8px; }
  .filter-group { margin-bottom:18px; }
  .budget-row   { display:grid; grid-template-columns:1fr 1fr; gap:8px; }

  /* Checkboxes — the key fix */
  .clay-checkbox-row { display:flex; align-items:center; gap:10px; margin-bottom:9px; }
  .clay-checkbox-row input[type="checkbox"] { width:16px; height:16px; flex-shrink:0; accent-color:#42a5f5; cursor:pointer; margin:0; }
  .clay-checkbox-row label { font-size:.85rem; color:#5a5a7a; font-weight:500; cursor:pointer; user-select:none; line-height:1; }

  /* Divider */
  .clay-divider { height:1.5px; background:rgba(200,200,220,.35); border-radius:4px; margin:18px 0; }

  /* Buttons full-width in panel */
  .filter-panel .clay-btn { width:100%; justify-content:center; margin-bottom:10px; display:flex; }
  .filter-panel .clay-btn:last-child { margin-bottom:0; }

  /* Listings */
  .listings-col { display:flex; flex-direction:column; gap:18px; }

  /* PG card */
  .pg-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:24px; box-shadow:0 8px 28px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.95); transition:transform .22s, box-shadow .22s, border-color .22s; animation:fadeUp .6s ease both; position:relative; overflow:hidden; }
  .pg-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:24px 24px 0 0; background:linear-gradient(90deg,#42a5f5,#66bb6a); opacity:0; transition:opacity .2s; }
  .pg-card:hover { transform:translateY(-5px); box-shadow:0 18px 44px rgba(0,0,0,.12); border-color:rgba(66,165,245,.25); }
  .pg-card:hover::before { opacity:1; }

  .pg-card-inner { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
  .pg-title-row  { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:8px; }
  .pg-name       { font-family:'Nunito',sans-serif; font-size:1.15rem; font-weight:900; color:#2d2d4e; }
  .pg-meta-row   { display:flex; align-items:center; gap:6px; color:#7a7a9a; font-size:.82rem; margin-bottom:5px; }
  .pg-price      { font-family:'Nunito',sans-serif; font-size:1.1rem; font-weight:800; color:#1565c0; display:flex; align-items:center; gap:2px; margin-bottom:2px; }
  .pg-price-sub  { font-size:.72rem; color:#9a9ab0; font-weight:500; margin-left:1px; }
  .pg-tags       { display:flex; gap:7px; flex-wrap:wrap; margin-top:10px; }
  .rooms-text    { font-size:.72rem; color:#9a9ab0; margin-top:10px; font-weight:600; display:flex; align-items:center; gap:5px; }

  /* Apply button */
  .apply-btn { flex-shrink:0; padding:12px 22px; border:none; border-radius:16px; font-family:'Poppins',sans-serif; font-size:.88rem; font-weight:700; cursor:pointer; white-space:nowrap; align-self:flex-start; background:linear-gradient(135deg,#42a5f5,#1e88e5); color:white; box-shadow:0 5px 0 #1565c0, 0 8px 18px rgba(66,165,245,.35), inset 0 1px 0 rgba(255,255,255,.3); transition:transform .15s, box-shadow .15s, filter .15s; }
  .apply-btn:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); box-shadow:0 7px 0 #1565c0, 0 12px 26px rgba(66,165,245,.45); }
  .apply-btn:active   { transform:scale(.97) translateY(2px) !important; }
  .apply-btn:disabled { opacity:.6; cursor:not-allowed; }
`;

const css = injectClay(CLAY_BASE, CLAY_TENANT, PAGE_CSS);

export default function FindPGs() {
  const [pgListings, setPgListings] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [applying, setApplying]     = useState("");
  const [filters, setFilters]       = useState({
    location: "", budgetMin: "", budgetMax: "", roomType: [], amenities: [],
  });

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
      if (filters.location)             params.append("location",  filters.location);
      if (filters.budgetMin)            params.append("budgetMin", filters.budgetMin);
      if (filters.budgetMax)            params.append("budgetMax", filters.budgetMax);
      if (filters.amenities.length > 0) params.append("amenities", filters.amenities.join(","));
      const res = await apiGetAllPGs(params.toString() ? `?${params}` : "");
      setPgListings(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApply = async (pg) => {
    setApplying(pg._id);
    try {
      const roomsRes  = await apiGetRooms(pg._id);
      const available = roomsRes.data.filter((r) => r.availability);
      if (available.length === 0) { alert("No rooms available for this PG."); return; }
      await apiApply({ pgStayId: pg._id, roomId: available[0]._id });
      alert(`Applied successfully for ${pg.name}!`);
    } catch (err) { alert(err.message); }
    finally { setApplying(""); }
  };

  const toggleFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const resetFilters = () => {
    setFilters({ location: "", budgetMin: "", budgetMax: "", roomType: [], amenities: [] });
    setLoading(true);
    apiGetRecommendations()
      .then((res) => setPgListings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="tenant" />

        <main className="clay-main">
          <div className="clay-container">
            <h2 className="clay-page-title">🔍 Search PG Accommodations</h2>
            <p className="clay-page-sub">Browse verified PG stays filtered to your preferences.</p>

            <div className="find-layout">

              {/* ── Filter Panel ── */}
              <div className="filter-panel">
                <div className="filter-title">🎛️ Filters</div>

                <div className="filter-group">
                  <label className="clay-label">Location</label>
                  <input
                    className="clay-input" type="text" placeholder="Enter city or area"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  />
                </div>

                <div className="filter-group">
                  <label className="clay-label">Budget Range (₹)</label>
                  <div className="budget-row">
                    <input
                      className="clay-input" type="number" placeholder="Min"
                      value={filters.budgetMin}
                      onChange={(e) => setFilters({ ...filters, budgetMin: e.target.value })}
                    />
                    <input
                      className="clay-input" type="number" placeholder="Max"
                      value={filters.budgetMax}
                      onChange={(e) => setFilters({ ...filters, budgetMax: e.target.value })}
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label className="clay-label">Room Type</label>
                  {["Single", "Double", "Triple"].map((type) => (
                    <div key={type} className="clay-checkbox-row">
                      <input
                        type="checkbox" id={`rt-${type}`}
                        checked={filters.roomType.includes(type)}
                        onChange={() => toggleFilter("roomType", type)}
                      />
                      <label htmlFor={`rt-${type}`}>{type}</label>
                    </div>
                  ))}
                </div>

                <div className="filter-group">
                  <label className="clay-label">Amenities</label>
                  {["WiFi", "AC", "Meals", "Laundry"].map((a) => (
                    <div key={a} className="clay-checkbox-row">
                      <input
                        type="checkbox" id={`am-${a}`}
                        checked={filters.amenities.includes(a)}
                        onChange={() => toggleFilter("amenities", a)}
                      />
                      <label htmlFor={`am-${a}`}>{a}</label>
                    </div>
                  ))}
                </div>

                <div className="clay-divider" />
                <button className="clay-btn clay-btn-blue" onClick={handleApplyFilters}>
                  Apply Filters
                </button>
                <button className="clay-btn clay-btn-ghost" onClick={resetFilters}>
                  ↺ Reset
                </button>
              </div>

              {/* ── Listings ── */}
              <div className="listings-col">
                {loading ? (
                  <div className="clay-empty">
                    <span className="clay-empty-emoji">⏳</span>
                    Finding PG stays for you…
                  </div>
                ) : pgListings.length === 0 ? (
                  <div className="clay-empty">
                    <span className="clay-empty-emoji">🏠</span>
                    No PG stays found. Try different filters!
                  </div>
                ) : (
                  pgListings.map((pg, i) => (
                    <div
                      key={pg._id}
                      className="pg-card"
                      style={{ animationDelay: `${i * 0.07}s` }}
                    >
                      <div className="pg-card-inner">
                        <div style={{ flex: 1 }}>

                          {/* Name + badges */}
                          <div className="pg-title-row">
                            <span className="pg-name">{pg.name}</span>
                            {pg.matchScore !== undefined && (
                              <span className="clay-badge badge-blue">
                                ⚡ {pg.matchScore}% match
                              </span>
                            )}
                            {pg.verificationStatus === "verified" && (
                              <span className="clay-badge badge-green">✓ Verified</span>
                            )}
                          </div>

                          {/* Location */}
                          <div className="pg-meta-row">
                            <MapPin size={14} /> {pg.location}
                          </div>

                          {/* Price */}
                          <div className="pg-price">
                            <IndianRupee size={15} />
                            {pg.rent}
                            <span className="pg-price-sub">/month</span>
                          </div>

                          {/* Tags */}
                          <div className="pg-tags">
                            <span className="clay-badge badge-yellow">
                              ⭐ Trust {pg.trustScore}/100
                            </span>
                            {pg.amenities?.map((a) => (
                              <span key={a} className="clay-badge badge-gray">{a}</span>
                            ))}
                          </div>

                          {/* Rooms */}
                          <div className="rooms-text">
                            🚪 {pg.availableRoomCount ?? pg.availableRooms ?? 0} room(s) available
                          </div>
                        </div>

                        {/* Apply */}
                        <button
                          className="apply-btn"
                          onClick={() => handleApply(pg)}
                          disabled={applying === pg._id}
                        >
                          {applying === pg._id ? "⏳ Applying…" : "Apply →"}
                        </button>
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