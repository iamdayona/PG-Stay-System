import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Search, FileText, Bell, CheckCircle2, Clock } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetMe, apiGetMyApplications, getUser } from "../utils/api";

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
  .clay-page-sub { color:#7a7a9a; font-size:.92rem; margin-bottom:32px; }

  /* ── Stat Cards ── */
  .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-bottom:28px; }
  @media(max-width:720px){ .stats-grid{grid-template-columns:1fr;} }

  .clay-stat {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:22px; padding:22px 24px;
    box-shadow:0 6px 24px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.95);
    position:relative; overflow:hidden; animation:fadeUp .6s ease both;
    transition:transform .2s, box-shadow .2s;
  }
  .clay-stat:hover { transform:translateY(-4px); box-shadow:0 14px 36px rgba(0,0,0,.1); }
  .clay-stat::before {
    content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:22px 22px 0 0;
  }
  .stat-blue::before   { background:linear-gradient(90deg,#42a5f5,#90caf9); }
  .stat-green::before  { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .stat-purple::before { background:linear-gradient(90deg,#ce93d8,#e040fb); }

  .stat-label { font-size:.72rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:10px; }
  .stat-value { font-family:'Nunito',sans-serif; font-size:2.2rem; font-weight:900; line-height:1; }
  .stat-blue-v  { color:#1565c0; }
  .stat-green-v { color:#2e7d32; }
  .stat-purple-v{ color:#7b1fa2; }
  .stat-icon {
    position:absolute; top:18px; right:18px; width:40px; height:40px; border-radius:12px;
    display:flex; align-items:center; justify-content:center; font-size:1.15rem;
    background:rgba(255,255,255,.7); box-shadow:0 3px 10px rgba(0,0,0,.08);
  }

  /* ── Menu Grid ── */
  .menu-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:18px; margin-bottom:28px; }
  @media(max-width:640px){ .menu-grid{grid-template-columns:1fr;} }

  .menu-card {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:22px; padding:24px;
    box-shadow:0 6px 24px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.95);
    cursor:pointer; transition:transform .2s, box-shadow .2s, border-color .2s;
    display:flex; gap:16px; align-items:flex-start;
    animation:fadeUp .7s ease both;
    position:relative; overflow:hidden;
  }
  .menu-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:22px 22px 0 0;
    background:linear-gradient(90deg,#42a5f5,#e040fb); opacity:0; transition:opacity .2s;
  }
  .menu-card:hover { transform:translateY(-5px); box-shadow:0 16px 40px rgba(0,0,0,.12); border-color:rgba(66,165,245,.3); }
  .menu-card:hover::before { opacity:1; }

  .menu-icon {
    width:50px; height:50px; border-radius:16px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    background:linear-gradient(135deg,#bbdefb,#e3f2fd);
    border:2px solid rgba(255,255,255,.9);
    box-shadow:0 4px 14px rgba(66,165,245,.2), inset 0 1px 0 rgba(255,255,255,.8);
  }
  .menu-title { font-family:'Nunito',sans-serif; font-size:1rem; font-weight:800; color:#2d2d4e; margin-bottom:4px; }
  .menu-desc  { font-size:.78rem; color:#7a7a9a; line-height:1.5; }

  /* ── Activity Card ── */
  .clay-card {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:22px; padding:28px;
    box-shadow:0 6px 24px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.95);
    animation:fadeUp .8s ease both;
  }
  .clay-section-title {
    font-family:'Nunito',sans-serif; font-size:1.1rem; font-weight:800; color:#2d2d4e;
    margin-bottom:18px; display:flex; align-items:center; gap:8px;
  }

  .activity-item {
    display:flex; gap:14px; align-items:flex-start; padding:14px 16px;
    background:rgba(255,255,255,.55); border:1.5px solid rgba(255,255,255,.8); border-radius:16px;
    margin-bottom:10px; transition:transform .15s;
  }
  .activity-item:hover { transform:translateX(4px); }
  .activity-icon {
    width:38px; height:38px; border-radius:12px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    background:rgba(255,255,255,.7); box-shadow:0 2px 8px rgba(0,0,0,.08);
  }
  .activity-name { font-size:.88rem; font-weight:600; color:#2d2d4e; margin-bottom:2px; }
  .activity-date { font-size:.72rem; color:#9a9ab0; }
  .activity-status {
    margin-left:auto; font-size:.72rem; font-weight:700; padding:3px 10px; border-radius:50px;
    border:1.5px solid transparent;
  }
  .status-approved { background:rgba(232,245,233,.9); color:#2e7d32; border-color:rgba(165,214,167,.5); }
  .status-pending  { background:rgba(255,249,196,.9); color:#f57f17; border-color:rgba(255,224,130,.5); }
  .status-review   { background:rgba(227,242,253,.9); color:#1565c0; border-color:rgba(144,202,249,.5); }

  .empty-state { text-align:center; padding:32px; color:#9a9ab0; font-size:.88rem; }
  .empty-emoji { font-size:2.5rem; margin-bottom:10px; display:block; }
`;

export default function TenantDashboard() {
  const navigate = useNavigate();
  const [user, setUser]         = useState(getUser());
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([apiGetMe(), apiGetMyApplications()])
      .then(([meRes, appsRes]) => {
        setUser(meRes.user);
        setRecentApps(appsRes.data.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const menuItems = [
    { icon: User,     title: "Profile & Verification", desc: "Manage your profile and identity verification", path: "/tenant/profile",       emoji: "👤" },
    { icon: Search,   title: "Search PG",              desc: "Find and apply for PG accommodations",          path: "/tenant/findpgs",        emoji: "🔍" },
    { icon: FileText, title: "My Applications",        desc: "Track your application status",                 path: "/tenant/applications",   emoji: "📋" },
    { icon: Bell,     title: "Notifications",          desc: "View updates and feedback",                     path: "/tenant/notifications",  emoji: "🔔" },
  ];

  const activeCount = recentApps.filter((a) => ["Pending", "Under Review"].includes(a.status)).length;

  const statusClass = (s) => {
    if (s === "Approved")     return "status-approved";
    if (s === "Under Review") return "status-review";
    return "status-pending";
  };

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="tenant" />

        <main className="clay-main">
          <div className="clay-container">

            <h2 className="clay-page-title">🏠 Tenant Dashboard</h2>
            <p className="clay-page-sub">Welcome back, {user?.name || "Tenant"}! Manage your PG search and applications.</p>

            {/* Stats */}
            <div className="stats-grid">
              <div className="clay-stat stat-green" style={{ animationDelay: "0s" }}>
                <div className="stat-icon">✅</div>
                <div className="stat-label">Verification Status</div>
                <div className={`stat-value ${user?.verificationStatus === "verified" ? "stat-green-v" : "stat-purple-v"}`} style={{ fontSize: "1.1rem", marginTop: 4 }}>
                  {loading ? "…" : user?.verificationStatus === "verified" ? "Verified ✓" : (user?.verificationStatus || "Unverified")}
                </div>
              </div>
              <div className="clay-stat stat-blue" style={{ animationDelay: ".1s" }}>
                <div className="stat-icon">📋</div>
                <div className="stat-label">Active Requests</div>
                <div className="stat-value stat-blue-v">{loading ? "…" : activeCount}</div>
              </div>
              <div className="clay-stat stat-purple" style={{ animationDelay: ".2s" }}>
                <div className="stat-icon">👤</div>
                <div className="stat-label">Profile Completion</div>
                <div className="stat-value stat-purple-v">{loading ? "…" : `${user?.profileCompletion || 0}%`}</div>
              </div>
            </div>

            {/* Menu */}
            <div className="menu-grid">
              {menuItems.map((item, i) => (
                <div key={i} className="menu-card" style={{ animationDelay: `${.15 + i * .08}s` }} onClick={() => navigate(item.path)}>
                  <div className="menu-icon">
                    <span style={{ fontSize: "1.3rem" }}>{item.emoji}</span>
                  </div>
                  <div>
                    <div className="menu-title">{item.title}</div>
                    <div className="menu-desc">{item.desc}</div>
                  </div>
                  <span style={{ marginLeft: "auto", color: "#bbb", fontSize: "1.1rem" }}>›</span>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="clay-card">
              <div className="clay-section-title">⚡ Recent Activity</div>
              {loading ? (
                <div className="empty-state"><span className="empty-emoji">⏳</span>Loading activity…</div>
              ) : recentApps.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-emoji">🔍</span>
                  No recent activity. Start by searching for a PG!
                </div>
              ) : (
                recentApps.map((app, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-icon">
                      {app.status === "Approved"
                        ? <CheckCircle2 size={18} color="#43a047" />
                        : <Clock size={18} color="#f9a825" />
                      }
                    </div>
                    <div>
                      <div className="activity-name">{app.pgStay?.name || "PG Stay"}</div>
                      <div className="activity-date">{new Date(app.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`activity-status ${statusClass(app.status)}`}>{app.status}</span>
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