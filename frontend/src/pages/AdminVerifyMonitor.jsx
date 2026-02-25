import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Trash2 } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiAdminGetPGs, apiAdminVerifyPG, apiAdminRestrictPG, apiAdminDeletePG, apiAdminStats } from "../utils/api";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&family=Poppins:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  .clay-page {
    min-height:100vh;
    background:linear-gradient(135deg,#fce4ec 0%,#f3e5f5 30%,#fafafa 65%,#fff3e0 100%);
    font-family:'Poppins',sans-serif; position:relative; overflow-x:hidden;
  }
  .clay-page::before {
    content:''; position:fixed; width:520px; height:520px;
    background:radial-gradient(circle,rgba(239,154,154,.4) 0%,transparent 70%);
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

  .clay-main { position:relative; z-index:1; padding:36px 24px; }
  .clay-container { max-width:1100px; margin:0 auto; }
  .clay-page-title { font-family:'Nunito',sans-serif; font-size:1.9rem; font-weight:900; color:#2d2d4e; margin-bottom:4px; }
  .clay-page-sub   { color:#7a7a9a; font-size:.92rem; margin-bottom:28px; }

  /* Stats */
  .stats4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  @media(max-width:800px){ .stats4{grid-template-columns:repeat(2,1fr);} }

  .clay-stat { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:22px; padding:20px 22px; box-shadow:0 6px 24px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.95); position:relative; overflow:hidden; animation:fadeUp .6s ease both; transition:transform .2s; text-align:center; }
  .clay-stat:hover { transform:translateY(-4px); }
  .clay-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:22px 22px 0 0; }
  .s-blue::before   { background:linear-gradient(90deg,#42a5f5,#90caf9); }
  .s-green::before  { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .s-yellow::before { background:linear-gradient(90deg,#ffe082,#ffd54f); }
  .s-red::before    { background:linear-gradient(90deg,#ef9a9a,#e53935); }
  .stat-lbl { font-size:.7rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
  .stat-val { font-family:'Nunito',sans-serif; font-size:2.2rem; font-weight:900; }
  .v-b { color:#1565c0; } .v-g { color:#2e7d32; } .v-y { color:#f57f17; } .v-r { color:#c62828; }

  /* Table card */
  .clay-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:28px; box-shadow:0 8px 28px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.95); animation:fadeUp .7s ease both; position:relative; overflow:hidden; }
  .clay-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:24px 24px 0 0; background:linear-gradient(90deg,#ef5350,#e040fb,#42a5f5); }
  .clay-section-title { font-family:'Nunito',sans-serif; font-size:1.1rem; font-weight:800; color:#2d2d4e; margin-bottom:20px; }

  /* PG rows as cards instead of tr */
  .pg-row {
    display:grid; grid-template-columns:1.8fr 1fr 100px 90px 80px auto;
    align-items:center; gap:12px; padding:14px 18px;
    background:rgba(255,255,255,.55); border:1.5px solid rgba(255,255,255,.8); border-radius:16px;
    margin-bottom:10px; transition:transform .15s, box-shadow .15s;
    position:relative; overflow:hidden;
  }
  .pg-row::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; border-radius:16px 0 0 16px; }
  .pg-row-verified::before  { background:linear-gradient(180deg,#66bb6a,#a5d6a7); }
  .pg-row-pending::before   { background:linear-gradient(180deg,#ffe082,#ffd54f); }
  .pg-row-restricted::before{ background:linear-gradient(180deg,#ef9a9a,#e53935); }
  .pg-row:hover { transform:translateX(3px); box-shadow:0 4px 16px rgba(0,0,0,.08); }

  @media(max-width:900px){ .pg-row{grid-template-columns:1fr; gap:6px;} }

  .col-header { display:grid; grid-template-columns:1.8fr 1fr 100px 90px 80px auto; gap:12px; padding:8px 18px; margin-bottom:6px; }
  .col-head { font-size:.67rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; }

  .pg-name-cell { font-family:'Nunito',sans-serif; font-size:.95rem; font-weight:800; color:#2d2d4e; }
  .pg-owner-cell { font-size:.82rem; color:#7a7a9a; }

  /* Status chip */
  .status-chip { display:inline-flex; align-items:center; gap:5px; border-radius:50px; padding:4px 12px; font-size:.72rem; font-weight:700; border:1.5px solid rgba(255,255,255,.85); }
  .chip-v { background:rgba(232,245,233,.9); color:#2e7d32; border-color:rgba(165,214,167,.6); }
  .chip-p { background:rgba(255,249,196,.9); color:#f57f17; border-color:rgba(255,224,130,.6); }
  .chip-r { background:rgba(255,235,238,.9); color:#c62828; border-color:rgba(239,154,154,.6); }

  /* Trust score inline */
  .trust-cell { font-family:'Nunito',sans-serif; font-size:1rem; font-weight:800; }

  /* Complaints cell */
  .complaints-cell { font-size:.88rem; font-weight:700; }
  .c-ok  { color:#2e7d32; } .c-warn { color:#c62828; }

  /* Action buttons */
  .act-group { display:flex; gap:6px; flex-wrap:wrap; }
  .act-btn { padding:7px 11px; border:none; border-radius:10px; font-family:'Poppins',sans-serif; font-size:.72rem; font-weight:700; cursor:pointer; transition:transform .12s, filter .12s; display:inline-flex; align-items:center; gap:4px; }
  .act-btn:hover:not(:disabled) { transform:translateY(-1px); filter:brightness(1.07); }
  .act-btn:disabled { opacity:.55; cursor:not-allowed; }
  .btn-verify   { background:linear-gradient(135deg,#66bb6a,#43a047); color:white; box-shadow:0 3px 0 #2e7d32; }
  .btn-restrict { background:linear-gradient(135deg,#ef9a9a,#e53935); color:white; box-shadow:0 3px 0 #b71c1c; }
  .btn-delete   { background:rgba(255,235,238,.9); border:1.5px solid rgba(239,154,154,.5); color:#c62828; }
  .btn-warn     { background:rgba(255,249,196,.9); border:1.5px solid rgba(255,224,130,.5); color:#f57f17; }

  .empty-state { text-align:center; padding:44px; color:#9a9ab0; }
  .empty-emoji { font-size:3rem; margin-bottom:12px; display:block; }
`;

export default function AdminVerifyMonitor() {
  const [pgListings, setPgListings] = useState([]);
  const [stats, setStats]           = useState({});
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const fetchData = async () => {
    try {
      const [pgsRes, statsRes] = await Promise.all([apiAdminGetPGs(), apiAdminStats()]);
      setPgListings(pgsRes.data);
      setStats(statsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleVerify   = async (id) => { setActionLoading(id+"v"); try { await apiAdminVerifyPG(id);   await fetchData(); } catch(e){alert(e.message);} finally{setActionLoading("");} };
  const handleRestrict = async (id) => { setActionLoading(id+"r"); try { await apiAdminRestrictPG(id); await fetchData(); } catch(e){alert(e.message);} finally{setActionLoading("");} };
  const handleDelete   = async (id) => {
    if (!window.confirm("Delete this PG Stay permanently?")) return;
    setActionLoading(id+"d");
    try { await apiAdminDeletePG(id); await fetchData(); } catch(e){alert(e.message);} finally{setActionLoading("");}
  };

  const verified = pgListings.filter((p) => p.verificationStatus === "verified").length;
  const pending  = pgListings.filter((p) => p.verificationStatus === "pending").length;

  const chipClass  = (s) => s === "verified" ? "chip-v" : s === "pending" ? "chip-p" : "chip-r";
  const chipLabel  = (s) => s === "verified" ? "✓ Verified" : s === "pending" ? "⏳ Pending" : "⛔ Restricted";
  const rowClass   = (s) => s === "verified" ? "pg-row-verified" : s === "pending" ? "pg-row-pending" : "pg-row-restricted";
  const tsColor    = (s) => s >= 85 ? "#2e7d32" : s >= 70 ? "#f57f17" : "#c62828";

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="admin" />
        <main className="clay-main">
          <div className="clay-container">

            <h2 className="clay-page-title">✅ Verification & Management</h2>
            <p className="clay-page-sub">Review, verify, restrict or remove PG listings from the platform.</p>

            {/* Stats */}
            <div className="stats4">
              {[
                { label:"PG Stays Listed",      value: stats.totalPGs ?? pgListings.length, cls:"s-blue",   vcls:"v-b", d:"0s",   icon:"🏠" },
                { label:"Verified PG Stays",     value: verified,                            cls:"s-green",  vcls:"v-g", d:".08s", icon:"✅" },
                { label:"Pending Verification",  value: pending,                             cls:"s-yellow", vcls:"v-y", d:".16s", icon:"⏳" },
                { label:"Active Bookings",       value: stats.activeBookings ?? 0,           cls:"s-red",    vcls:"v-r", d:".24s", icon:"📋" },
              ].map((s) => (
                <div key={s.label} className={`clay-stat ${s.cls}`} style={{ animationDelay:s.d }}>
                  <div style={{ fontSize:"1.5rem", marginBottom:8 }}>{s.icon}</div>
                  <div className={`stat-val ${s.vcls}`}>{loading ? "…" : (s.value ?? 0)}</div>
                  <div className="stat-lbl" style={{ marginTop:6, marginBottom:0 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* PG Table as card rows */}
            <div className="clay-card">
              <div className="clay-section-title">🏠 PG Verification & Management</div>

              {loading ? (
                <div className="empty-state"><span className="empty-emoji">⏳</span>Loading PG listings…</div>
              ) : pgListings.length === 0 ? (
                <div className="empty-state"><span className="empty-emoji">📭</span>No PG listings found.</div>
              ) : (
                <>
                  <div className="col-header">
                    <span className="col-head">PG Name</span>
                    <span className="col-head">Owner</span>
                    <span className="col-head">Status</span>
                    <span className="col-head">Trust</span>
                    <span className="col-head">Complaints</span>
                    <span className="col-head">Actions</span>
                  </div>

                  {pgListings.map((pg) => (
                    <div key={pg._id} className={`pg-row ${rowClass(pg.verificationStatus)}`}>
                      <div className="pg-name-cell">{pg.name}</div>
                      <div className="pg-owner-cell">{pg.owner?.name || "—"}</div>
                      <div>
                        <span className={`status-chip ${chipClass(pg.verificationStatus)}`}>
                          {chipLabel(pg.verificationStatus)}
                        </span>
                      </div>
                      <div className="trust-cell" style={{ color: tsColor(pg.trustScore) }}>{pg.trustScore}/100</div>
                      <div className={`complaints-cell ${pg.complaints > 0 ? "c-warn" : "c-ok"}`}>
                        {pg.complaints > 0 ? `⚠️ ${pg.complaints}` : "✓ 0"}
                      </div>
                      <div className="act-group">
                        {pg.verificationStatus === "pending" && (
                          <>
                            <button className="act-btn btn-verify"   onClick={() => handleVerify(pg._id)}   disabled={actionLoading === pg._id+"v"}><CheckCircle2 size={12}/>Verify</button>
                            <button className="act-btn btn-restrict" onClick={() => handleRestrict(pg._id)} disabled={actionLoading === pg._id+"r"}><XCircle size={12}/>Reject</button>
                          </>
                        )}
                        {pg.verificationStatus === "verified" && (
                          <button className="act-btn btn-warn" onClick={() => handleRestrict(pg._id)} disabled={actionLoading === pg._id+"r"}>⛔ Restrict</button>
                        )}
                        <button className="act-btn btn-delete" onClick={() => handleDelete(pg._id)} disabled={actionLoading === pg._id+"d"}><Trash2 size={12}/></button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

          </div>
        </main>
      </div>
    </>
  );
}