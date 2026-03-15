import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleNavigation from "../context/RoleNavigation";
import { apiAdminStats } from "../utils/api";
import { CLAY_BASE, CLAY_ADMIN, injectClay } from "../styles/claystyles";

const PAGE_CSS = `
  /* 4-col stat grid */
  .stats4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  @media(max-width:800px){ .stats4{grid-template-columns:repeat(2,1fr);} }
  @media(max-width:480px){ .stats4{grid-template-columns:1fr;} }

  /* stat colour top-bars */
  .s-blue::before   { background:linear-gradient(90deg,#42a5f5,#90caf9); }
  .s-purple::before { background:linear-gradient(90deg,#ce93d8,#e040fb); }
  .s-yellow::before { background:linear-gradient(90deg,#ffe082,#ffd54f); }
  .s-green::before  { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .v-blue{color:#1565c0;} .v-purple{color:#7b1fa2;} .v-yellow{color:#f57f17;} .v-green{color:#2e7d32;}

  /* 2-col menu grid */
  .menu-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:28px; }
  @media(max-width:600px){ .menu-grid{grid-template-columns:1fr;} }

  /* pending row */
  .pend-row { display:flex; align-items:center; justify-content:space-between; padding:13px 16px; background:rgba(255,255,255,.55); border:1.5px solid rgba(255,255,255,.8); border-radius:16px; margin-bottom:10px; transition:transform .15s; gap:12px; }
  .pend-row:hover { transform:translateX(4px); }
  .pend-name  { font-size:.88rem; font-weight:600; color:#2d2d4e; margin-bottom:2px; }
  .pend-date  { font-size:.72rem; color:#9a9ab0; }
  .pend-badge { flex-shrink:0; font-size:.72rem; font-weight:700; padding:4px 12px; border-radius:50px; background:rgba(255,249,196,.9); color:#f57f17; }
`;

const css = injectClay(CLAY_BASE, CLAY_ADMIN, PAGE_CSS);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiAdminStats()
      .then((d) => setStats(d.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const menuItems = [
    { emoji:"✅", title:"Verification & Management", desc:"Review and verify user identities and PG listings", path:"/admin/verifymonitor" },
    { emoji:"🛡️", title:"Monitor Trust Scores",      desc:"Track and manage user trust scores",              path:"/admin/monitortrustscore" },
    { emoji:"⚠️", title:"Handle Complaints",         desc:"Review and resolve user complaints",              path:"/admin/handlecomplaints" },
    { emoji:"📡", title:"System Monitoring",         desc:"Monitor overall system health and activity",      path:"/admin/systemmonitoring" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="admin" />
        <main className="clay-main">
          <div className="clay-container">

            <h2 className="clay-page-title">🛡️ Admin Control Panel</h2>
            <p className="clay-page-sub">Monitor and manage the entire PG accommodation system.</p>

            {/* Stats — uses clay-stat from CLAY_BASE, colour from PAGE_CSS */}
            <div className="stats4">
              {[
                { label:"Total Users",           value:stats?.totalUsers,            icon:"👥", cls:"s-blue",   vcls:"v-blue",   d:"0s"   },
                { label:"PG Stays Listed",        value:stats?.totalPGs,              icon:"🏠", cls:"s-purple", vcls:"v-purple", d:".08s" },
                { label:"Pending Verifications",  value:stats?.pendingVerifications,  icon:"⏳", cls:"s-yellow", vcls:"v-yellow", d:".16s" },
                { label:"Active Bookings",        value:stats?.activeBookings,        icon:"✅", cls:"s-green",  vcls:"v-green",  d:".24s" },
              ].map((s) => (
                <div key={s.label} className={`clay-stat ${s.cls}`} style={{ animationDelay:s.d }}>
                  <div className="clay-stat-icon">{s.icon}</div>
                  <div className="clay-stat-label">{s.label}</div>
                  <div className={`clay-stat-value ${s.vcls}`}>{loading ? "…" : (s.value ?? 0)}</div>
                </div>
              ))}
            </div>

            {/* Menu — uses clay-menu-card + clay-menu-icon from CLAY_BASE */}
            <div className="menu-grid">
              {menuItems.map((item, i) => (
                <div key={i} className="clay-menu-card" style={{ animationDelay:`${.15+i*.08}s` }} onClick={() => navigate(item.path)}>
                  <div className="clay-menu-icon">{item.emoji}</div>
                  <div>
                    <div className="clay-menu-card-title">{item.title}</div>
                    <div className="clay-menu-card-desc">{item.desc}</div>
                  </div>
                  <span style={{ marginLeft:"auto", color:"#ccc", fontSize:"1.1rem" }}>›</span>
                </div>
              ))}
            </div>

            {/* Recent Pending — uses clay-card + clay-section-title + clay-empty from CLAY_BASE */}
            <div className="clay-card clay-card-p" style={{ "--bar-bg":"linear-gradient(90deg,#ef5350,#e040fb,#42a5f5)" }}>
              <style>{`.clay-card::before{background:linear-gradient(90deg,#ef5350,#e040fb,#42a5f5);}`}</style>
              <div className="clay-section-title">⏳ Recent Pending Verifications</div>
              {loading ? (
                <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading…</div>
              ) : !stats?.recentPGs?.length ? (
                <div className="clay-empty"><span className="clay-empty-emoji">✅</span>No pending verifications!</div>
              ) : (
                stats.recentPGs.map((pg, i) => (
                  <div key={i} className="pend-row">
                    <div>
                      <div className="pend-name">{pg.name} — {pg.owner?.name}</div>
                      <div className="pend-date">{new Date(pg.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className="pend-badge">⏳ Pending</span>
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