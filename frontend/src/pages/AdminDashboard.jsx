import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertCircle, Users, Building2 } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiAdminStats } from "../utils/api";

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
  .clay-page-sub   { color:#7a7a9a; font-size:.92rem; margin-bottom:32px; }

  /* ── Stats 4-col ── */
  .stats4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  @media(max-width:800px){ .stats4{grid-template-columns:repeat(2,1fr);} }
  @media(max-width:480px){ .stats4{grid-template-columns:1fr;} }

  .clay-stat {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:22px; padding:20px 22px;
    box-shadow:0 6px 24px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.95);
    position:relative; overflow:hidden; animation:fadeUp .6s ease both;
    transition:transform .2s, box-shadow .2s;
  }
  .clay-stat:hover { transform:translateY(-4px); box-shadow:0 14px 36px rgba(0,0,0,.1); }
  .clay-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:22px 22px 0 0; }
  .s-blue::before   { background:linear-gradient(90deg,#42a5f5,#90caf9); }
  .s-purple::before { background:linear-gradient(90deg,#ce93d8,#e040fb); }
  .s-yellow::before { background:linear-gradient(90deg,#ffe082,#ffd54f); }
  .s-green::before  { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }

  .stat-icon { position:absolute; top:16px; right:16px; width:38px; height:38px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; background:rgba(255,255,255,.72); box-shadow:0 3px 10px rgba(0,0,0,.08); }
  .stat-label { font-size:.7rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }
  .stat-value { font-family:'Nunito',sans-serif; font-size:2.2rem; font-weight:900; line-height:1; }
  .v-blue   { color:#1565c0; } .v-purple { color:#7b1fa2; } .v-yellow { color:#f57f17; } .v-green { color:#2e7d32; }

  /* ── Menu ── */
  .menu-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:28px; }
  @media(max-width:600px){ .menu-grid{grid-template-columns:1fr;} }

  .menu-card {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:22px; padding:24px;
    box-shadow:0 6px 24px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.95);
    cursor:pointer; transition:transform .2s, box-shadow .2s, border-color .2s;
    display:flex; gap:16px; align-items:flex-start;
    animation:fadeUp .7s ease both; position:relative; overflow:hidden;
  }
  .menu-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:22px 22px 0 0; background:linear-gradient(90deg,#ef5350,#e040fb); opacity:0; transition:opacity .2s; }
  .menu-card:hover { transform:translateY(-5px); box-shadow:0 16px 40px rgba(0,0,0,.12); border-color:rgba(239,83,80,.25); }
  .menu-card:hover::before { opacity:1; }

  .menu-icon { width:50px; height:50px; border-radius:16px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:1.3rem; background:linear-gradient(135deg,#ffcdd2,#fce4ec); border:2px solid rgba(255,255,255,.9); box-shadow:0 4px 14px rgba(239,83,80,.18), inset 0 1px 0 rgba(255,255,255,.8); }
  .menu-title { font-family:'Nunito',sans-serif; font-size:1rem; font-weight:800; color:#2d2d4e; margin-bottom:4px; }
  .menu-desc  { font-size:.78rem; color:#7a7a9a; line-height:1.5; }

  /* ── Recent verifications ── */
  .clay-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:22px; padding:28px; box-shadow:0 6px 24px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.95); animation:fadeUp .8s ease both; position:relative; overflow:hidden; }
  .clay-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:22px 22px 0 0; background:linear-gradient(90deg,#ef5350,#e040fb,#42a5f5); }
  .clay-section-title { font-family:'Nunito',sans-serif; font-size:1.1rem; font-weight:800; color:#2d2d4e; margin-bottom:18px; }

  .pend-row { display:flex; align-items:center; justify-content:space-between; padding:13px 16px; background:rgba(255,255,255,.55); border:1.5px solid rgba(255,255,255,.8); border-radius:16px; margin-bottom:10px; transition:transform .15s; gap:12px; }
  .pend-row:hover { transform:translateX(4px); }
  .pend-name { font-size:.88rem; font-weight:600; color:#2d2d4e; margin-bottom:2px; }
  .pend-date { font-size:.72rem; color:#9a9ab0; }
  .pend-badge { flex-shrink:0; font-size:.72rem; font-weight:700; padding:4px 12px; border-radius:50px; background:rgba(255,249,196,.9); color:#f57f17; }

  .empty-state { text-align:center; padding:32px; color:#9a9ab0; font-size:.88rem; }
  .empty-emoji { font-size:2.5rem; margin-bottom:10px; display:block; }
`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiAdminStats()
      .then((data) => setStats(data.data))
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

            {/* Stats */}
            <div className="stats4">
              {[
                { label:"Total Users",           value: stats?.totalUsers,           icon:"👥", cls:"s-blue",   vcls:"v-blue",   d:"0s" },
                { label:"PG Stays Listed",        value: stats?.totalPGs,             icon:"🏠", cls:"s-purple", vcls:"v-purple", d:".08s" },
                { label:"Pending Verifications",  value: stats?.pendingVerifications, icon:"⏳", cls:"s-yellow", vcls:"v-yellow", d:".16s" },
                { label:"Active Bookings",        value: stats?.activeBookings,       icon:"✅", cls:"s-green",  vcls:"v-green",  d:".24s" },
              ].map((s) => (
                <div key={s.label} className={`clay-stat ${s.cls}`} style={{ animationDelay:s.d }}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className={`stat-value ${s.vcls}`}>{loading ? "…" : (s.value ?? 0)}</div>
                </div>
              ))}
            </div>

            {/* Menu */}
            <div className="menu-grid">
              {menuItems.map((item, i) => (
                <div key={i} className="menu-card" style={{ animationDelay:`${.15+i*.08}s` }} onClick={() => navigate(item.path)}>
                  <div className="menu-icon">{item.emoji}</div>
                  <div>
                    <div className="menu-title">{item.title}</div>
                    <div className="menu-desc">{item.desc}</div>
                  </div>
                  <span style={{ marginLeft:"auto", color:"#ccc", fontSize:"1.1rem" }}>›</span>
                </div>
              ))}
            </div>

            {/* Recent Pending */}
            <div className="clay-card">
              <div className="clay-section-title">⏳ Recent Pending Verifications</div>
              {loading ? (
                <div className="empty-state"><span className="empty-emoji">⏳</span>Loading…</div>
              ) : !stats?.recentPGs?.length ? (
                <div className="empty-state"><span className="empty-emoji">✅</span>No pending verifications!</div>
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