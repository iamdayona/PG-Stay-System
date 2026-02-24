import { useEffect, useState } from "react";
import { MapPin, IndianRupee, Star } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetRecommendations, apiGetAllPGs, apiApply, apiGetRooms } from "../utils/api";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&family=Poppins:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  .clay-page {
    min-height:100vh;
    background:linear-gradient(135deg,#fce4ec 0%,#e8f5e9 35%,#e3f2fd 65%,#f3e5f5 100%);
    font-family:'Poppins',sans-serif; position:relative; overflow-x:hidden;
  }
  .clay-page::before {
    content:''; position:fixed; width:500px; height:500px;
    background:radial-gradient(circle,rgba(255,183,197,.4) 0%,transparent 70%);
    border-radius:50%; top:-150px; left:-150px;
    animation:floatBlob 8s ease-in-out infinite; pointer-events:none; z-index:0;
  }
  .clay-page::after {
    content:''; position:fixed; width:400px; height:400px;
    background:radial-gradient(circle,rgba(167,210,255,.35) 0%,transparent 70%);
    border-radius:50%; bottom:-100px; right:-100px;
    animation:floatBlob 10s ease-in-out infinite reverse; pointer-events:none; z-index:0;
  }
  @keyframes floatBlob{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(30px,20px) scale(1.05);}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}

  .clay-main { position:relative; z-index:1; padding:36px 24px; }
  .clay-container { max-width:1100px; margin:0 auto; }
  .clay-page-title { font-family:'Nunito',sans-serif; font-size:1.9rem; font-weight:900; color:#2d2d4e; margin-bottom:4px; }
  .clay-page-sub { color:#7a7a9a; font-size:.92rem; margin-bottom:28px; }

  /* ── Layout ── */
  .find-layout { display:grid; grid-template-columns:260px 1fr; gap:24px; }
  @media(max-width:800px){ .find-layout{grid-template-columns:1fr;} }

  /* ── Filter Panel ── */
  .filter-panel {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:24px;
    box-shadow:0 8px 32px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.95);
    height:fit-content; position:sticky; top:80px;
    animation:fadeUp .6s ease both;
  }
  .filter-title {
    font-family:'Nunito',sans-serif; font-size:1rem; font-weight:800; color:#2d2d4e;
    margin-bottom:20px; display:flex; align-items:center; gap:8px;
  }
  .filter-group { margin-bottom:18px; }
  .clay-label { display:block; font-size:.72rem; font-weight:700; color:#5a5a7a; margin-bottom:7px; letter-spacing:.4px; text-transform:uppercase; }
  .clay-input {
    width:100%; padding:10px 13px;
    background:rgba(255,255,255,.8); border:2px solid rgba(255,255,255,.9); border-radius:12px;
    font-family:'Poppins',sans-serif; font-size:.85rem; color:#2d2d4e;
    box-shadow:0 3px 10px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.9);
    transition:border-color .2s, box-shadow .2s; outline:none;
  }
  .clay-input::placeholder { color:#bbb; }
  .clay-input:focus {
    border-color:rgba(66,165,245,.55);
    box-shadow:0 0 0 3px rgba(66,165,245,.12), inset 0 1px 0 rgba(255,255,255,.9);
  }
  .budget-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .clay-checkbox-row { display:flex; align-items:center; gap:8px; margin-bottom:8px; cursor:pointer; }
  .clay-checkbox-row input { width:15px; height:15px; accent-color:#42a5f5; cursor:pointer; }
  .clay-checkbox-row label { font-size:.82rem; color:#5a5a7a; cursor:pointer; }
  .clay-divider { height:1.5px; background:rgba(255,255,255,.7); margin:16px 0; border-radius:4px; }

  .clay-btn {
    padding:11px 20px; border:none; border-radius:13px; width:100%;
    font-family:'Poppins',sans-serif; font-size:.85rem; font-weight:700;
    cursor:pointer; transition:transform .15s, box-shadow .15s, filter .15s; margin-bottom:8px;
  }
  .clay-btn:active { transform:scale(.97) translateY(2px) !important; }
  .clay-btn-blue {
    background:linear-gradient(135deg,#42a5f5,#1e88e5); color:white;
    box-shadow:0 5px 0 #1565c0, 0 8px 20px rgba(66,165,245,.35), inset 0 1px 0 rgba(255,255,255,.3);
  }
  .clay-btn-blue:hover { filter:brightness(1.06); transform:translateY(-2px); }
  .clay-btn-ghost {
    background:rgba(255,255,255,.72); border:2px solid rgba(255,255,255,.9); color:#5a5a7a;
    box-shadow:0 4px 0 rgba(0,0,0,.07), 0 6px 16px rgba(0,0,0,.05);
  }
  .clay-btn-ghost:hover { transform:translateY(-2px); background:rgba(255,255,255,.88); }

  /* ── Listings ── */
  .listings-col { display:flex; flex-direction:column; gap:18px; }

  .pg-card {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:24px;
    box-shadow:0 8px 28px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.95);
    transition:transform .22s, box-shadow .22s, border-color .22s;
    animation:fadeUp .6s ease both;
    position:relative; overflow:hidden;
  }
  .pg-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:24px 24px 0 0;
    background:linear-gradient(90deg,#42a5f5,#66bb6a); opacity:0; transition:opacity .2s;
  }
  .pg-card:hover { transform:translateY(-5px); box-shadow:0 18px 44px rgba(0,0,0,.12); border-color:rgba(66,165,245,.25); }
  .pg-card:hover::before { opacity:1; }

  .pg-card-inner { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
  .pg-name { font-family:'Nunito',sans-serif; font-size:1.15rem; font-weight:900; color:#2d2d4e; margin-bottom:6px; }
  .pg-meta-row { display:flex; align-items:center; gap:6px; color:#7a7a9a; font-size:.82rem; margin-bottom:5px; }
  .pg-price { font-family:'Nunito',sans-serif; font-size:1.1rem; font-weight:800; color:#1565c0; display:flex; align-items:center; gap:3px; }
  .pg-tags { display:flex; gap:7px; flex-wrap:wrap; margin-top:10px; }

  .clay-badge {
    display:inline-flex; align-items:center; gap:4px;
    border-radius:50px; padding:4px 11px; font-size:.7rem; font-weight:700;
    border:1.5px solid rgba(255,255,255,.85);
    box-shadow:0 2px 8px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.8);
  }
  .badge-blue   { background:rgba(227,242,253,.9); color:#1565c0; border-color:rgba(144,202,249,.5); }
  .badge-green  { background:rgba(232,245,233,.9); color:#2e7d32; border-color:rgba(165,214,167,.5); }
  .badge-gray   { background:rgba(245,245,255,.9); color:#5a5a7a; border-color:rgba(200,200,220,.5); }

  .rooms-text { font-size:.72rem; color:#9a9ab0; margin-top:10px; font-weight:600; }

  .apply-btn {
    flex-shrink:0; padding:12px 22px; border:none; border-radius:16px;
    font-family:'Poppins',sans-serif; font-size:.88rem; font-weight:700;
    cursor:pointer; transition:transform .15s, box-shadow .15s, filter .15s;
    background:linear-gradient(135deg,#42a5f5,#1e88e5); color:white;
    box-shadow:0 5px 0 #1565c0, 0 8px 18px rgba(66,165,245,.35), inset 0 1px 0 rgba(255,255,255,.3);
    align-self:flex-start;
  }
  .apply-btn:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }
  .apply-btn:active { transform:scale(.97) translateY(2px) !important; }
  .apply-btn:disabled { opacity:.6; cursor:not-allowed; }

  .empty-state { text-align:center; padding:48px; color:#9a9ab0; font-size:.9rem; }
  .empty-emoji { font-size:3rem; margin-bottom:12px; display:block; }
`;

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
      const roomsRes = await apiGetRooms(pg._id);
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
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
  };

  const resetFilters = () => {
    setFilters({ location: "", budgetMin: "", budgetMax: "", roomType: [], amenities: [] });
    setLoading(true);
    apiGetRecommendations().then((res) => setPgListings(res.data)).catch(console.error).finally(() => setLoading(false));
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
              {/* Filter Panel */}
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
                    <input className="clay-input" type="number" placeholder="Min"
                      value={filters.budgetMin} onChange={(e) => setFilters({ ...filters, budgetMin: e.target.value })} />
                    <input className="clay-input" type="number" placeholder="Max"
                      value={filters.budgetMax} onChange={(e) => setFilters({ ...filters, budgetMax: e.target.value })} />
                  </div>
                </div>

                <div className="filter-group">
                  <label className="clay-label">Room Type</label>
                  {["Single", "Double", "Triple"].map((type) => (
                    <div key={type} className="clay-checkbox-row">
                      <input type="checkbox" id={type} checked={filters.roomType.includes(type)} onChange={() => toggleFilter("roomType", type)} />
                      <label htmlFor={type}>{type}</label>
                    </div>
                  ))}
                </div>

                <div className="filter-group">
                  <label className="clay-label">Amenities</label>
                  {["WiFi", "AC", "Meals", "Laundry"].map((a) => (
                    <div key={a} className="clay-checkbox-row">
                      <input type="checkbox" id={a} checked={filters.amenities.includes(a)} onChange={() => toggleFilter("amenities", a)} />
                      <label htmlFor={a}>{a}</label>
                    </div>
                  ))}
                </div>

                <div className="clay-divider" />
                <button className="clay-btn clay-btn-blue" onClick={handleApplyFilters}>Apply Filters</button>
                <button className="clay-btn clay-btn-ghost" onClick={resetFilters}>↺ Reset</button>
              </div>

              {/* Listings */}
              <div className="listings-col">
                {loading ? (
                  <div className="empty-state"><span className="empty-emoji">⏳</span>Finding PG stays for you…</div>
                ) : pgListings.length === 0 ? (
                  <div className="empty-state"><span className="empty-emoji">🏠</span>No PG stays found. Try different filters!</div>
                ) : (
                  pgListings.map((pg, i) => (
                    <div key={pg._id} className="pg-card" style={{ animationDelay: `${i * .07}s` }}>
                      <div className="pg-card-inner">
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <div className="pg-name">{pg.name}</div>
                            {pg.matchScore !== undefined && (
                              <span className="clay-badge badge-blue">⚡ {pg.matchScore}% match</span>
                            )}
                            {pg.verificationStatus === "verified" && (
                              <span className="clay-badge badge-green">✓ Verified</span>
                            )}
                          </div>
                          <div className="pg-meta-row"><MapPin size={14} />{pg.location}</div>
                          <div className="pg-price"><IndianRupee size={15} />{pg.rent}<span style={{ fontSize: ".72rem", color: "#9a9ab0", fontWeight: 500, marginLeft: 2 }}>/month</span></div>
                          <div className="pg-tags">
                            <span className="clay-badge badge-green">⭐ Trust {pg.trustScore}/100</span>
                            {pg.amenities?.map((a) => (
                              <span key={a} className="clay-badge badge-gray">{a}</span>
                            ))}
                          </div>
                          <div className="rooms-text">🚪 {pg.availableRoomCount ?? pg.availableRooms ?? 0} room(s) available</div>
                        </div>
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