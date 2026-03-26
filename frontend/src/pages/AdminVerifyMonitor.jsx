import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Trash2, Eye, FileText, User, Home, Building2 } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import {
  apiAdminGetPGs, apiAdminVerifyPG, apiAdminRestrictPG, apiAdminDeletePG,
  apiAdminStats, apiAdminGetUsers, apiAdminVerifyUser, apiAdminSuspendUser,
} from "../utils/api";
import { toast } from "../components/Toast";
import { CLAY_BASE, CLAY_ADMIN, injectClay } from "../styles/claystyles";

const PAGE_CSS = `
  /* ── Stat grid ── */
  .stats6 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:28px; }
  @media(max-width:900px){ .stats6{grid-template-columns:repeat(2,1fr);} }
  @media(max-width:560px){ .stats6{grid-template-columns:1fr;} }
  .s-blue::before   { background:linear-gradient(90deg,#42a5f5,#90caf9); }
  .s-green::before  { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .s-yellow::before { background:linear-gradient(90deg,#ffe082,#ffd54f); }
  .s-red::before    { background:linear-gradient(90deg,#ef9a9a,#e53935); }
  .s-purple::before { background:linear-gradient(90deg,#ce93d8,#ab47bc); }
  .s-teal::before   { background:linear-gradient(90deg,#80deea,#00acc1); }
  .stat-lbl { font-size:.7rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
  .stat-val { font-family:'Nunito',sans-serif; font-size:2.2rem; font-weight:900; }
  .v-b{color:#1565c0;} .v-g{color:#2e7d32;} .v-y{color:#f57f17;} .v-r{color:#c62828;} .v-p{color:#7b1fa2;} .v-t{color:#00838f;}
  /* ── Section tabs ── */
  .section-tabs { display:flex; gap:10px; margin-bottom:24px; flex-wrap:wrap; }
  .sec-tab { padding:10px 22px; border-radius:50px; border:2.5px solid rgba(255,255,255,.85); background:rgba(255,255,255,.6); font-family:'Poppins',sans-serif; font-size:.85rem; font-weight:700; cursor:pointer; color:#5a5a7a; transition:all .18s; display:flex; align-items:center; gap:7px; }
  .sec-tab.active { background:linear-gradient(135deg,#ef5350,#e040fb); color:white; border-color:transparent; box-shadow:0 4px 0 #b71c1c,0 6px 14px rgba(239,83,80,.3); }
  .sec-tab-count { display:inline-flex; align-items:center; justify-content:center; min-width:20px; height:20px; padding:0 6px; border-radius:50px; font-size:.68rem; font-weight:800; background:rgba(255,255,255,.25); }
  .sec-tab:not(.active) .sec-tab-count { background:rgba(239,83,80,.15); color:#c62828; }
  /* ── Column headers ── */
  .col-header-pg   { display:grid; grid-template-columns:1.8fr 1fr 100px 90px 80px auto; gap:12px; padding:8px 18px; margin-bottom:6px; }
  .col-header-user { display:grid; grid-template-columns:1.6fr 1.2fr 100px 80px auto; gap:12px; padding:8px 18px; margin-bottom:6px; }
  .col-head { font-size:.67rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; }
  /* ── PG row ── */
  .pg-row { display:grid; grid-template-columns:1.8fr 1fr 100px 90px 80px auto; align-items:center; gap:12px; padding:14px 18px; background:rgba(255,255,255,.55); border:1.5px solid rgba(255,255,255,.8); border-radius:16px; margin-bottom:10px; transition:transform .15s,box-shadow .15s; position:relative; overflow:hidden; }
  .pg-row::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; border-radius:16px 0 0 16px; }
  .pg-row-verified::before  { background:linear-gradient(180deg,#66bb6a,#a5d6a7); }
  .pg-row-pending::before   { background:linear-gradient(180deg,#ffe082,#ffd54f); }
  .pg-row-restricted::before{ background:linear-gradient(180deg,#ef9a9a,#e53935); }
  /* ── User row ── */
  .user-row { display:grid; grid-template-columns:1.6fr 1.2fr 100px 80px auto; align-items:center; gap:12px; padding:14px 18px; background:rgba(255,255,255,.55); border:1.5px solid rgba(255,255,255,.8); border-radius:16px; margin-bottom:10px; transition:transform .15s,box-shadow .15s; position:relative; overflow:hidden; }
  .user-row::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; border-radius:16px 0 0 16px; }
  .user-row-verified::before  { background:linear-gradient(180deg,#66bb6a,#a5d6a7); }
  .user-row-pending::before   { background:linear-gradient(180deg,#ffe082,#ffd54f); }
  .user-row-unverified::before{ background:linear-gradient(180deg,#b0bec5,#90a4ae); }
  .user-row-suspended::before { background:linear-gradient(180deg,#ef9a9a,#e53935); }
  .row-hover:hover { transform:translateX(3px); box-shadow:0 4px 16px rgba(0,0,0,.08); }
  @media(max-width:900px){ .pg-row,.col-header-pg,.user-row,.col-header-user{grid-template-columns:1fr; gap:6px;} }
  /* ── Cell styles ── */
  .cell-name  { font-family:'Nunito',sans-serif; font-size:.95rem; font-weight:800; color:#2d2d4e; }
  .cell-sub   { font-size:.8rem; color:#7a7a9a; margin-top:2px; }
  .cell-email { font-size:.82rem; color:#7a7a9a; }
  .trust-cell { font-family:'Nunito',sans-serif; font-size:1rem; font-weight:800; }
  .complaints-cell { font-size:.88rem; font-weight:700; }
  .c-ok { color:#2e7d32; } .c-warn { color:#c62828; }
  /* ── Status chips ── */
  .status-chip { display:inline-flex; align-items:center; gap:5px; border-radius:50px; padding:4px 12px; font-size:.72rem; font-weight:700; border:1.5px solid rgba(255,255,255,.85); }
  .chip-v  { background:rgba(232,245,233,.9); color:#2e7d32; border-color:rgba(165,214,167,.6); }
  .chip-p  { background:rgba(255,249,196,.9); color:#f57f17; border-color:rgba(255,224,130,.6); }
  .chip-r  { background:rgba(255,235,238,.9); color:#c62828; border-color:rgba(239,154,154,.6); }
  .chip-u  { background:rgba(236,239,241,.9); color:#607d8b; border-color:rgba(176,190,197,.6); }
  .chip-s  { background:rgba(255,235,238,.9); color:#c62828; border-color:rgba(239,154,154,.6); }
  /* ── Action buttons ── */
  .act-group { display:flex; gap:6px; flex-wrap:wrap; }
  .act-btn { padding:7px 11px; border:none; border-radius:10px; font-family:'Poppins',sans-serif; font-size:.72rem; font-weight:700; cursor:pointer; transition:transform .12s,filter .12s; display:inline-flex; align-items:center; gap:4px; }
  .act-btn:hover:not(:disabled) { transform:translateY(-1px); filter:brightness(1.07); }
  .act-btn:disabled { opacity:.55; cursor:not-allowed; }
  .btn-verify   { background:linear-gradient(135deg,#66bb6a,#43a047); color:white; box-shadow:0 3px 0 #2e7d32; }
  .btn-restrict { background:linear-gradient(135deg,#ef9a9a,#e53935); color:white; box-shadow:0 3px 0 #b71c1c; }
  .btn-delete   { background:rgba(255,235,238,.9); border:1.5px solid rgba(239,154,154,.5); color:#c62828; }
  .btn-warn     { background:rgba(255,249,196,.9); border:1.5px solid rgba(255,224,130,.5); color:#f57f17; }
  .btn-view-doc { background:rgba(227,242,253,.9); border:1.5px solid rgba(144,202,249,.5); color:#1565c0; }
  /* ── Doc thumb ── */
  .doc-thumb { width:36px; height:36px; border-radius:8px; overflow:hidden; border:1.5px solid rgba(255,255,255,.85); flex-shrink:0; }
  .doc-thumb img { width:100%; height:100%; object-fit:cover; }
  .doc-thumb-pdf { width:36px; height:36px; border-radius:8px; background:linear-gradient(135deg,#ef5350,#e53935); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .no-doc { font-size:.75rem; color:#b0bec5; font-style:italic; }
  /* ── Avatar mini ── */
  .user-avatar { width:36px; height:36px; border-radius:50%; overflow:hidden; border:2px solid rgba(255,255,255,.85); flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:.9rem; font-weight:700; color:white; }
  .user-name-wrap { display:flex; align-items:center; gap:10px; }
`;

const css = injectClay(CLAY_BASE, CLAY_ADMIN, PAGE_CSS);

export default function AdminVerifyMonitor() {
  const [pgListings, setPgListings]   = useState([]);
  const [tenants, setTenants]         = useState([]);
  const [owners, setOwners]           = useState([]);
  const [stats, setStats]             = useState({});
  const [loading, setLoading]         = useState(true);
  const [activeSection, setActiveSection] = useState("pgs");
  const [actionLoading, setActionLoading] = useState("");

  const fetchData = async () => {
    try {
      const [pgsRes, statsRes, usersRes] = await Promise.all([
        apiAdminGetPGs(),
        apiAdminStats(),
        apiAdminGetUsers(),
      ]);
      setPgListings(pgsRes.data);
      setStats(statsRes.data);
      const allUsers = usersRes.data || [];
      setTenants(allUsers.filter((u) => u.role === "tenant"));
      setOwners(allUsers.filter((u) => u.role === "owner"));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── PG actions ──────────────────────────────────────────────────────
  const handleVerifyPG = async (id) => {
    setActionLoading(id + "v");
    try { await apiAdminVerifyPG(id);   toast.success("PG verified and is now live!"); await fetchData(); }
    catch (err) { toast.error(err.message); }
    finally { setActionLoading(""); }
  };
  const handleRestrictPG = async (id) => {
    setActionLoading(id + "r");
    try { await apiAdminRestrictPG(id); toast.warning("PG has been restricted."); await fetchData(); }
    catch (err) { toast.error(err.message); }
    finally { setActionLoading(""); }
  };
  const handleDeletePG = async (id, name) => {
    if (!window.confirm(`Delete "${name}" permanently? This cannot be undone.`)) return;
    setActionLoading(id + "d");
    try { await apiAdminDeletePG(id); toast.success("PG deleted."); await fetchData(); }
    catch (err) { toast.error(err.message); }
    finally { setActionLoading(""); }
  };

  // ── User actions ────────────────────────────────────────────────────
  const handleVerifyUser = async (id, name) => {
    setActionLoading(id + "uv");
    try { await apiAdminVerifyUser(id); toast.success(`${name} has been verified!`); await fetchData(); }
    catch (err) { toast.error(err.message); }
    finally { setActionLoading(""); }
  };
  const handleSuspendUser = async (id, name) => {
    if (!window.confirm(`Suspend ${name}? They will not be able to login.`)) return;
    setActionLoading(id + "us");
    try { await apiAdminSuspendUser(id); toast.warning(`${name} has been suspended.`); await fetchData(); }
    catch (err) { toast.error(err.message); }
    finally { setActionLoading(""); }
  };

  // ── Helpers ─────────────────────────────────────────────────────────
  const chipPG = (s) => s === "verified" ? "chip-v" : s === "pending" ? "chip-p" : "chip-r";
  const chipPGLabel = (s) => s === "verified" ? "✓ Verified" : s === "pending" ? "⏳ Pending" : "⛔ Restricted";
  const rowClassPG  = (s) => s === "verified" ? "pg-row-verified" : s === "pending" ? "pg-row-pending" : "pg-row-restricted";
  const tsColor     = (s) => s >= 85 ? "#2e7d32" : s >= 70 ? "#f57f17" : "#c62828";

  const chipUser = (u) => {
    if (!u.isActive) return "chip-s";
    if (u.verificationStatus === "verified")   return "chip-v";
    if (u.verificationStatus === "pending")    return "chip-p";
    return "chip-u";
  };
  const chipUserLabel = (u) => {
    if (!u.isActive) return "⛔ Suspended";
    if (u.verificationStatus === "verified")   return "✓ Verified";
    if (u.verificationStatus === "pending")    return "⏳ Pending";
    return "● Unverified";
  };
  const rowClassUser = (u) => {
    if (!u.isActive) return "user-row-suspended";
    if (u.verificationStatus === "verified")   return "user-row-verified";
    if (u.verificationStatus === "pending")    return "user-row-pending";
    return "user-row-unverified";
  };
  const avatarBg = (role) => role === "tenant"
    ? "linear-gradient(135deg,#42a5f5,#1e88e5)"
    : "linear-gradient(135deg,#ffa726,#fb8c00)";

  // ── Counts for tabs ──────────────────────────────────────────────────
  const pgPending      = pgListings.filter((p) => p.verificationStatus === "pending").length;
  const tenantPending  = tenants.filter((u) => u.verificationStatus === "pending" && u.isActive).length;
  const ownerPending   = owners.filter((u) => u.verificationStatus === "pending" && u.isActive).length;

  // ── Render user row (shared by tenants & owners) ─────────────────────
  const renderUserRow = (u) => (
    <div key={u._id} className={`user-row row-hover ${rowClassUser(u)}`}>
      {/* Name + avatar */}
      <div className="user-name-wrap">
        <div className="user-avatar" style={{background: avatarBg(u.role)}}>
          {u.profilePhotoUrl
            ? <img src={u.profilePhotoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>
            : (u.name?.[0]?.toUpperCase() || "?")}
        </div>
        <div>
          <div className="cell-name">{u.name}</div>
          <div className="cell-sub">Trust: <b style={{color:tsColor(u.trustScore)}}>{u.trustScore}</b>/100</div>
        </div>
      </div>
      {/* Email */}
      <div className="cell-email">{u.email}</div>
      {/* Status chip */}
      <div><span className={`status-chip ${chipUser(u)}`}>{chipUserLabel(u)}</span></div>
      {/* Document */}
      <div>
        {u.documentUrl ? (
          u.documentFileType === "pdf"
            ? <a href={u.documentUrl} target="_blank" rel="noreferrer" title="View PDF">
                <div className="doc-thumb-pdf"><FileText size={16} color="white"/></div>
              </a>
            : <a href={u.documentUrl} target="_blank" rel="noreferrer" title="View document">
                <div className="doc-thumb"><img src={u.documentUrl} alt="doc"/></div>
              </a>
        ) : <span className="no-doc">No doc</span>}
      </div>
      {/* Actions */}
      <div className="act-group">
        {u.verificationStatus !== "verified" && u.isActive && (
          <button className="act-btn btn-verify" onClick={() => handleVerifyUser(u._id, u.name)} disabled={!!actionLoading}>
            <CheckCircle2 size={12}/> Verify
          </button>
        )}
        {u.verificationStatus === "verified" && u.isActive && (
          <button className="act-btn btn-warn" onClick={() => handleSuspendUser(u._id, u.name)} disabled={!!actionLoading}>
            ⛔ Suspend
          </button>
        )}
        {!u.isActive && (
          <span style={{fontSize:".72rem",color:"#c62828",fontWeight:700}}>Suspended</span>
        )}
        {u.documentUrl && (
          <a className="act-btn btn-view-doc" href={u.documentUrl} target="_blank" rel="noreferrer">
            <Eye size={12}/> Doc
          </a>
        )}
      </div>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="admin" />
        <main className="clay-main">
          <div className="clay-container">
            <h2 className="clay-page-title">✅ Verification & Management</h2>
            <p className="clay-page-sub">Review, verify, restrict or remove users and PG listings.</p>

            {/* ── Stats ── */}
            <div className="stats6">
              {[
                { label:"PG Stays",          value: stats.totalPGs ?? pgListings.length, cls:"s-blue",   vcls:"v-b", icon:"🏠" },
                { label:"PGs Pending",        value: pgPending,                           cls:"s-yellow", vcls:"v-y", icon:"⏳" },
                { label:"Tenants",            value: tenants.length,                      cls:"s-teal",   vcls:"v-t", icon:"👤" },
                { label:"Tenants Pending",    value: tenantPending,                       cls:"s-yellow", vcls:"v-y", icon:"🪪" },
                { label:"Owners",             value: owners.length,                       cls:"s-purple", vcls:"v-p", icon:"🏢" },
                { label:"Owners Pending",     value: ownerPending,                        cls:"s-red",    vcls:"v-r", icon:"📋" },
              ].map((s, i) => (
                <div key={s.label} className={`clay-stat ${s.cls}`} style={{ animationDelay: `${i * 0.07}s` }}>
                  <div style={{ fontSize:"1.5rem", marginBottom:8 }}>{s.icon}</div>
                  <div className={`stat-val ${s.vcls}`}>{loading ? "…" : (s.value ?? 0)}</div>
                  <div className="stat-lbl" style={{ marginTop:6, marginBottom:0 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── Section tabs ── */}
            <div className="section-tabs">
              <button className={`sec-tab ${activeSection==="pgs"?"active":""}`}     onClick={() => setActiveSection("pgs")}>
                <Home size={15}/> PG Stays <span className="sec-tab-count">{pgListings.length}</span>
              </button>
              <button className={`sec-tab ${activeSection==="tenants"?"active":""}`} onClick={() => setActiveSection("tenants")}>
                <User size={15}/> Tenants <span className="sec-tab-count">{tenants.length}</span>
              </button>
              <button className={`sec-tab ${activeSection==="owners"?"active":""}`}  onClick={() => setActiveSection("owners")}>
                <Building2 size={15}/> Owners <span className="sec-tab-count">{owners.length}</span>
              </button>
            </div>

            {/* ══════════ PG STAYS section ══════════ */}
            {activeSection === "pgs" && (
              <div className="clay-card clay-card-p">
                <div className="clay-section-title">🏠 PG Verification & Management</div>
                {loading ? (
                  <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading…</div>
                ) : pgListings.length === 0 ? (
                  <div className="clay-empty"><span className="clay-empty-emoji">📭</span>No PG listings found.</div>
                ) : (
                  <>
                    <div className="col-header-pg">
                      <span className="col-head">PG Name</span>
                      <span className="col-head">Owner</span>
                      <span className="col-head">Status</span>
                      <span className="col-head">Trust</span>
                      <span className="col-head">Complaints</span>
                      <span className="col-head">Actions</span>
                    </div>
                    {pgListings.map((pg) => (
                      <div key={pg._id} className={`pg-row row-hover ${rowClassPG(pg.verificationStatus)}`}>
                        <div>
                          <div className="cell-name">{pg.name}</div>
                          <div className="cell-sub">{pg.address?.city || ""}</div>
                        </div>
                        <div className="cell-email">{pg.owner?.name || "—"}</div>
                        <div><span className={`status-chip ${chipPG(pg.verificationStatus)}`}>{chipPGLabel(pg.verificationStatus)}</span></div>
                        <div className="trust-cell" style={{ color: tsColor(pg.trustScore) }}>{pg.trustScore}/100</div>
                        <div className={`complaints-cell ${pg.complaints > 0 ? "c-warn" : "c-ok"}`}>
                          {pg.complaints > 0 ? `⚠️ ${pg.complaints}` : "✓ 0"}
                        </div>
                        <div className="act-group">
                          {pg.verificationStatus === "pending" && (
                            <>
                              <button className="act-btn btn-verify"   onClick={() => handleVerifyPG(pg._id)}  disabled={!!actionLoading}><CheckCircle2 size={12}/>Verify</button>
                              <button className="act-btn btn-restrict" onClick={() => handleRestrictPG(pg._id)} disabled={!!actionLoading}><XCircle size={12}/>Reject</button>
                            </>
                          )}
                          {pg.verificationStatus === "verified" && (
                            <button className="act-btn btn-warn" onClick={() => handleRestrictPG(pg._id)} disabled={!!actionLoading}>⛔ Restrict</button>
                          )}
                          <button className="act-btn btn-delete" onClick={() => handleDeletePG(pg._id, pg.name)} disabled={!!actionLoading}><Trash2 size={12}/></button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ══════════ TENANTS section ══════════ */}
            {activeSection === "tenants" && (
              <div className="clay-card clay-card-p">
                <div className="clay-section-title">👤 Tenant Verification</div>
                <p style={{fontSize:".82rem",color:"#7a7a9a",marginBottom:16}}>
                  Verify tenant identity documents (Aadhaar / Student ID). Click the document thumbnail to view full-size.
                </p>
                {loading ? (
                  <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading tenants…</div>
                ) : tenants.length === 0 ? (
                  <div className="clay-empty"><span className="clay-empty-emoji">📭</span>No tenants registered yet.</div>
                ) : (
                  <>
                    <div className="col-header-user">
                      <span className="col-head">Tenant</span>
                      <span className="col-head">Email</span>
                      <span className="col-head">Status</span>
                      <span className="col-head">Document</span>
                      <span className="col-head">Actions</span>
                    </div>
                    {tenants.map(renderUserRow)}
                  </>
                )}
              </div>
            )}

            {/* ══════════ OWNERS section ══════════ */}
            {activeSection === "owners" && (
              <div className="clay-card clay-card-p">
                <div className="clay-section-title">🏢 Owner Verification</div>
                <p style={{fontSize:".82rem",color:"#7a7a9a",marginBottom:16}}>
                  Verify owner identity (Aadhaar / PAN / Property docs). Click the document thumbnail to view full-size.
                </p>
                {loading ? (
                  <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading owners…</div>
                ) : owners.length === 0 ? (
                  <div className="clay-empty"><span className="clay-empty-emoji">📭</span>No owners registered yet.</div>
                ) : (
                  <>
                    <div className="col-header-user">
                      <span className="col-head">Owner</span>
                      <span className="col-head">Email</span>
                      <span className="col-head">Status</span>
                      <span className="col-head">Document</span>
                      <span className="col-head">Actions</span>
                    </div>
                    {owners.map(renderUserRow)}
                  </>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}