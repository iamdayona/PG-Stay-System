import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetOwnerPGs, apiGetOwnerApplications } from "../utils/api";
import { CLAY_BASE, CLAY_OWNER, injectClay } from "../styles/claystyles";

const PAGE_CSS = `
  .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  @media(max-width:800px){ .stats-grid{grid-template-columns:repeat(2,1fr);} }
  @media(max-width:480px){ .stats-grid{grid-template-columns:1fr;} }
  .s-orange::before { background:linear-gradient(90deg,#ffa726,#ffcc02); }
  .s-amber::before  { background:linear-gradient(90deg,#ff8f00,#ffa726); }
  .s-green::before  { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .s-red::before    { background:linear-gradient(90deg,#ef9a9a,#e53935); }
  .stat-icon  { position:absolute; top:16px; right:16px; width:38px; height:38px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; background:rgba(255,255,255,.72); box-shadow:0 3px 10px rgba(0,0,0,.08); }
  .stat-label { font-size:.7rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }
  .stat-value { font-family:'Nunito',sans-serif; font-size:2.2rem; font-weight:900; line-height:1; }
  .v-orange{color:#e65100;} .v-green{color:#2e7d32;} .v-red{color:#c62828;} .v-amber{color:#f57f17;}

  .menu-grid { display:flex; flex-wrap:wrap; gap:18px; margin-bottom:28px; justify-content: space-between; }
  .menu-grid > .menu-card { flex: 0 1 calc(50% - 9px); }
  .menu-grid > .menu-card:last-child { flex: 0 1 calc(50% - 9px); margin: 0 auto; }
  @media(max-width:600px){ .menu-grid{ justify-content: center; } .menu-grid > .menu-card { flex: 0 1 100%; } .menu-grid > .menu-card:last-child { margin: 0; } }
  .menu-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:22px; padding:24px; box-shadow:0 6px 24px rgba(0,0,0,.07),inset 0 1px 0 rgba(255,255,255,.95); cursor:pointer; transition:transform .2s,box-shadow .2s,border-color .2s; display:flex; gap:16px; align-items:flex-start; animation:fadeUp .7s ease both; position:relative; overflow:hidden; }
  .menu-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:22px 22px 0 0; background:linear-gradient(90deg,#ffa726,#e040fb); opacity:0; transition:opacity .2s; }
  .menu-card:hover { transform:translateY(-5px); box-shadow:0 16px 40px rgba(0,0,0,.12); border-color:rgba(255,167,38,.3); }
  .menu-card:hover::before { opacity:1; }
  .menu-icon  { width:50px; height:50px; border-radius:16px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:1.3rem; background:linear-gradient(135deg,#ffe0b2,#fff8e1); border:2px solid rgba(255,255,255,.9); box-shadow:0 4px 14px rgba(255,167,38,.2),inset 0 1px 0 rgba(255,255,255,.8); }
  .menu-title { font-family:'Nunito',sans-serif; font-size:1rem; font-weight:800; color:#2d2d4e; margin-bottom:4px; }
  .menu-desc  { font-size:.78rem; color:#7a7a9a; line-height:1.5; }

  .req-item { display:flex; align-items:center; justify-content:space-between; padding:13px 16px; background:rgba(255,255,255,.55); border:1.5px solid rgba(255,255,255,.8); border-radius:16px; margin-bottom:10px; transition:transform .15s; gap:12px; }
  .req-item:hover { transform:translateX(4px); }
  .req-name  { font-size:.88rem; font-weight:600; color:#2d2d4e; margin-bottom:2px; }
  .req-date  { font-size:.72rem; color:#9a9ab0; }
  .req-badge { flex-shrink:0; font-size:.72rem; font-weight:700; padding:4px 12px; border-radius:50px; }
  .b-approved{ background:rgba(232,245,233,.9); color:#2e7d32; }
  .b-pending { background:rgba(255,249,196,.9); color:#f57f17; }
  .b-rejected{ background:rgba(255,235,238,.9); color:#c62828; }
`;

const css = injectClay(CLAY_BASE, CLAY_OWNER, PAGE_CSS);

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [pgSummary, setPgSummary] = useState({ totalPGs: 0, totalRooms: 0, occupiedRooms: 0 });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiGetOwnerPGs(), apiGetOwnerApplications()])
      .then(([pgsRes, appsRes]) => {
        const pgs = pgsRes.data;
        setPgSummary({
          totalPGs: pgs.length,
          totalRooms: pgs.reduce((s, p) => s + (p.totalRooms || 0), 0),
          occupiedRooms: pgs.reduce((s, p) => s + (p.occupiedRooms || 0), 0),
        });
        setRecentApps(appsRes.data.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = recentApps.filter((a) => a.status === "Pending").length;

  const menuItems = [
    { emoji: "👤", title: "Profile", desc: "Manage your owner profile and documents", path: "/owner/profile" },
    { emoji: "🏢", title: "Manage PG Stays", desc: "Add and manage your PG properties", path: "/owner/pgsmanagement" },
    { emoji: "📋", title: "Requests Received", desc: "Review and approve tenant applications", path: "/owner/applications" },
    { emoji: "⚠️", title: "Handle Complaints", desc: "Respond to tenant complaints for your PGs", path: "/owner/complaints" },
    { emoji: "🔔", title: "Notifications", desc: "View updates and messages", path: "/owner/notifications" },
  ];

  const badgeClass = (s) => s === "Approved" ? "b-approved" : s === "Rejected" ? "b-rejected" : "b-pending";

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="owner" />

        <main className="clay-main">
          <div className="clay-container">

            <h2 className="clay-page-title">🏢 Owner Dashboard</h2>
            <p className="clay-page-sub">Manage your properties and review tenant requests.</p>

            {/* Stats */}
            <div className="stats-grid">
              {[
                { label: "PG Stays Listed", value: pgSummary.totalPGs, icon: "🏠", cls: "s-orange", vcls: "v-orange", delay: "0s" },
                { label: "Total Rooms", value: pgSummary.totalRooms, icon: "🚪", cls: "s-amber", vcls: "v-amber", delay: ".08s" },
                { label: "Rooms Occupied", value: pgSummary.occupiedRooms, icon: "✅", cls: "s-green", vcls: "v-green", delay: ".16s" },
                { label: "Pending Requests", value: recentApps.filter((a) => a.status === "Pending").length, icon: "⏳", cls: "s-red", vcls: "v-red", delay: ".24s" },
              ].map((s) => (
                <div key={s.label} className={`clay-stat ${s.cls}`} style={{ animationDelay: s.delay }}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className={`stat-value ${s.vcls}`}>{loading ? "…" : s.value}</div>
                </div>
              ))}
            </div>

            {/* Menu */}
            <div className="menu-grid">
              {menuItems.map((item, i) => (
                <div key={i} className="menu-card" style={{ animationDelay: `${.15 + i * .08}s` }} onClick={() => navigate(item.path)}>
                  <div className="menu-icon">{item.emoji}</div>
                  <div>
                    <div className="menu-title">{item.title}</div>
                    <div className="menu-desc">{item.desc}</div>
                  </div>
                  <span style={{ marginLeft: "auto", color: "#ccc", fontSize: "1.1rem" }}>›</span>
                </div>
              ))}
            </div>

            {/* Recent Requests */}
            <div className="clay-card clay-card-p" style={{ "--bar-bg": "linear-gradient(90deg,#ef5350,#e040fb,#42a5f5)" }}>
              <style>{`.clay-card::before{background:linear-gradient(90deg,#ef5350,#e040fb,#42a5f5);}`}</style>
              <div className="clay-section-title">⚡ Recent Requests</div>
              {loading ? (
                <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading…</div>
              ) : recentApps.length === 0 ? (
                <div className="clay-empty"><span className="clay-empty-emoji">📭</span>No recent requests yet.</div>
              ) : (
                recentApps.map((app, i) => (
                  <div key={i} className="req-item">
                    <div>
                      <div className="req-name">{app.tenant?.name} → {app.pgStay?.name}</div>
                      <div className="req-date">{new Date(app.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`req-badge ${badgeClass(app.status)}`}>{app.status}</span>
                  </div>
                ))
              )}
            </div>

          </div>
        </main>
      </div>
    </>
  );
}