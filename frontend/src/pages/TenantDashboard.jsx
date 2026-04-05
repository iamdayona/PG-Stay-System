import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Search, FileText, Bell, CheckCircle2, Clock, MapPin, IndianRupee } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetMe, apiGetMyApplications, apiGetMyBookings, apiGetRecommendations, getUser } from "../utils/api";
import { CLAY_BASE, injectClay, CLAY_TENANT } from "../styles/claystyles";

const PAGE_CSS = `
  .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-bottom:28px; }
  @media(max-width:720px){ .stats-grid{grid-template-columns:1fr;} }
  .stat-blue::before   { background:linear-gradient(90deg,#42a5f5,#90caf9); }
  .stat-green::before  { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .stat-purple::before { background:linear-gradient(90deg,#ce93d8,#e040fb); }
  .stat-label    { font-size:.72rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:10px; }
  .stat-value    { font-family:'Nunito',sans-serif; font-size:2.2rem; font-weight:900; line-height:1; }
  .stat-blue-v   { color:#1565c0; }
  .stat-green-v  { color:#2e7d32; }
  .stat-purple-v { color:#7b1fa2; }
  .stat-icon { position:absolute; top:18px; right:18px; width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.15rem; background:rgba(255,255,255,.7); box-shadow:0 3px 10px rgba(0,0,0,.08); }

  .menu-grid { display:flex; flex-wrap:wrap; gap:18px; margin-bottom:28px; justify-content:space-between; }
  .menu-grid > .menu-card { flex:0 1 calc(50% - 9px); }
  .menu-grid > .menu-card:last-child { flex:0 1 calc(50% - 9px); margin:0 auto; }
  @media(max-width:640px){ .menu-grid{ justify-content:center; } .menu-grid > .menu-card { flex:0 1 100%; } .menu-grid > .menu-card:last-child { margin:0; } }
  .menu-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:22px; padding:24px; box-shadow:0 6px 24px rgba(0,0,0,.07),inset 0 1px 0 rgba(255,255,255,.95); cursor:pointer; transition:transform .2s,box-shadow .2s,border-color .2s; display:flex; gap:16px; align-items:flex-start; animation:fadeUp .7s ease both; position:relative; overflow:hidden; }
  .menu-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:22px 22px 0 0; background:linear-gradient(90deg,#42a5f5,#e040fb); opacity:0; transition:opacity .2s; }
  .menu-card:hover { transform:translateY(-5px); box-shadow:0 16px 40px rgba(0,0,0,.12); border-color:rgba(66,165,245,.3); }
  .menu-card:hover::before { opacity:1; }
  .menu-icon  { width:50px; height:50px; border-radius:16px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#bbdefb,#e3f2fd); border:2px solid rgba(255,255,255,.9); box-shadow:0 4px 14px rgba(66,165,245,.2),inset 0 1px 0 rgba(255,255,255,.8); }
  .menu-title { font-family:'Nunito',sans-serif; font-size:1rem; font-weight:800; color:#2d2d4e; margin-bottom:4px; }
  .menu-desc  { font-size:.78rem; color:#7a7a9a; line-height:1.5; }

  .activity-item { display:flex; gap:14px; align-items:flex-start; padding:14px 16px; background:rgba(255,255,255,.55); border:1.5px solid rgba(255,255,255,.8); border-radius:16px; margin-bottom:10px; transition:transform .15s; }
  .activity-item:hover { transform:translateX(4px); }
  .activity-icon { width:38px; height:38px; border-radius:12px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.7); box-shadow:0 2px 8px rgba(0,0,0,.08); }
  .activity-name   { font-size:.88rem; font-weight:600; color:#2d2d4e; margin-bottom:2px; }
  .activity-date   { font-size:.72rem; color:#9a9ab0; }
  .activity-status { margin-left:auto; font-size:.72rem; font-weight:700; padding:3px 10px; border-radius:50px; border:1.5px solid transparent; }
  .status-approved { background:rgba(232,245,233,.9); color:#2e7d32; border-color:rgba(165,214,167,.5); }
  .status-pending  { background:rgba(255,249,196,.9); color:#f57f17; border-color:rgba(255,224,130,.5); }
  .status-rejected { background:rgba(255,235,238,.9); color:#c62828; border-color:rgba(239,154,154,.5); }

  .rec-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
  .rec-card { background:rgba(255,255,255,.6); backdrop-filter:blur(14px); border:2px solid rgba(255,255,255,.85); border-radius:20px; padding:20px; box-shadow:0 6px 20px rgba(0,0,0,.07),inset 0 1px 0 rgba(255,255,255,.95); cursor:pointer; transition:transform .2s,box-shadow .2s,border-color .2s; position:relative; overflow:hidden; animation:fadeUp .6s ease both; }
  .rec-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:20px 20px 0 0; background:linear-gradient(90deg,#42a5f5,#66bb6a); opacity:0; transition:opacity .2s; }
  .rec-card:hover { transform:translateY(-4px); box-shadow:0 14px 36px rgba(0,0,0,.11); border-color:rgba(66,165,245,.25); }
  .rec-card:hover::before { opacity:1; }
  .rec-name { font-family:'Nunito',sans-serif; font-size:1rem; font-weight:900; color:#2d2d4e; margin-bottom:4px; }
  .rec-loc  { display:flex; align-items:center; gap:5px; font-size:.78rem; color:#7a7a9a; margin-bottom:7px; }
  .rec-price { font-family:'Nunito',sans-serif; font-size:.95rem; font-weight:800; color:#1565c0; display:flex; align-items:center; gap:3px; margin-bottom:4px; }
  .rec-header { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:4px; }
  .rec-divider { height:1px; background:rgba(200,200,220,.3); margin:10px 0; }
  .rec-tags { display:flex; gap:6px; flex-wrap:wrap; }
  .rec-tag  { font-size:.68rem; font-weight:600; padding:2px 9px; border-radius:50px; background:rgba(227,242,253,.9); color:#1565c0; border:1px solid rgba(144,202,249,.4); }
  .rec-trust-high { background:rgba(232,245,233,.9); color:#2e7d32; border:1px solid rgba(165,214,167,.4); }
  .rec-trust-mid  { background:rgba(255,249,196,.9); color:#f57f17; border:1px solid rgba(255,224,130,.4); }
  .rec-trust-low  { background:rgba(255,235,238,.9); color:#c62828; border:1px solid rgba(239,154,154,.4); }
  .rec-match-badge { display:inline-flex; align-items:center; gap:3px; font-size:.68rem; font-weight:700; padding:3px 10px; border-radius:50px; white-space:nowrap; }
  .rec-match-high { background:rgba(232,245,233,.9); color:#2e7d32; border:1px solid rgba(165,214,167,.4); }
  .rec-match-mid  { background:rgba(255,249,196,.9); color:#f57f17; border:1px solid rgba(255,224,130,.4); }
  .rec-match-low  { background:rgba(227,242,253,.9); color:#1565c0; border:1px solid rgba(144,202,249,.4); }
  .rec-empty { text-align:center; padding:24px 16px; color:#9a9ab0; font-size:.88rem; }
  .rec-empty-emoji { font-size:2rem; display:block; margin-bottom:8px; }
`;

const css = injectClay(CLAY_BASE, CLAY_TENANT, PAGE_CSS);

export default function TenantDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [recentApps, setRecentApps] = useState([]);
  const [recommendations, setRecs] = useState([]);
  const [hasManagement, setHasManagement] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiGetMe(), apiGetMyApplications(), apiGetMyBookings()])
      .then(([meRes, appsRes, bookingsRes]) => {
        setUser(meRes.user);
        setRecentApps(appsRes.data.slice(0, 3));
        setHasManagement(
          appsRes.data.some((app) => app.status === "Approved") ||
          (bookingsRes.data || []).length > 0
        );

        // Only fetch recommendations if the tenant has set at least one preference
        const prefs = meRes.user?.preferences;
        const hasPrefs = Boolean(
          prefs?.location ||
          (prefs?.amenities?.length > 0) ||
          (prefs?.budgetMin && prefs.budgetMin > 0) ||
          (prefs?.budgetMax && prefs.budgetMax > 0)
        );
        return hasPrefs ? apiGetRecommendations() : null;
      })
      .then((recRes) => {
        if (recRes?.data) setRecs(recRes.data.slice(0, 1));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const menuItems = [
    { icon: User, title: "Profile", desc: "Manage your profile and verify your identity", path: "/tenant/profile", emoji: "👤" },
    { icon: Search, title: "Search PG", desc: "Find and apply for PG accommodations", path: "/tenant/findpgs", emoji: "🔍" },
    { icon: FileText, title: "My Applications", desc: "Track your application status", path: "/tenant/applications", emoji: "📋" },
    ...(hasManagement ? [{ icon: FileText, title: "My PG Stay", desc: "Manage your confirmed PG booking and agreement", path: "/tenant/pgmanagement", emoji: "🏠" }] : []),
    { icon: Bell, title: "Notifications & Feedback", desc: "View updates and share your experience", path: "/tenant/notifications", emoji: "🔔" },
  ];

  const activeCount = recentApps.filter((a) => a.status === "Pending").length;

  const statusClass = (s) => {
    if (s === "Approved") return "status-approved";
    if (s === "Rejected") return "status-rejected";
    return "status-pending";
  };

  const trustClass = (score) => {
    if (score >= 75) return "rec-trust-high";
    if (score >= 50) return "rec-trust-mid";
    return "rec-trust-low";
  };

  const matchClass = (score) => {
    if (score >= 75) return "rec-match-high";
    if (score >= 50) return "rec-match-mid";
    return "rec-match-low";
  };

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="tenant" />

        <main className="clay-main">
          <div className="clay-container">

            <h2 className="clay-page-title">🏠 Dashboard</h2>
            <p className="clay-page-sub">
              Welcome back, {user?.name || "Tenant"}! Manage your PG search and applications.
            </p>

            {/* ── Stats ── */}
            <div className="stats-grid">
              <div className="clay-stat stat-green" style={{ animationDelay: "0s" }}>
                <div className="stat-icon">✅</div>
                <div className="stat-label">Verification Status</div>
                <div
                  className={`stat-value ${user?.verificationStatus === "verified" ? "stat-green-v" : "stat-purple-v"}`}
                  style={{ fontSize: "1.1rem", marginTop: 4 }}
                >
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

            {/* ── Quick-access menu ── */}
            <div className="menu-grid">
              {menuItems.map((item, i) => (
                <div
                  key={i}
                  className="menu-card"
                  style={{ animationDelay: `${0.15 + i * 0.08}s` }}
                  onClick={() => navigate(item.path)}
                >
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

            {/* ── Recent Activity ── */}
            <div className="clay-card clay-card-p" style={{ marginBottom: 24 }}>
              <style>{`.clay-card::before{background:linear-gradient(90deg,#ef5350,#e040fb,#42a5f5);}`}</style>
              <div className="clay-section-title">⚡ Recent Activity</div>
              {loading ? (
                <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading activity…</div>
              ) : recentApps.length === 0 ? (
                <div className="clay-empty">
                  <span className="clay-empty-emoji">🔍</span>
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

            {/* ── Preference-based Recommendations ── */}
            {recommendations.length > 0 && (
              <div className="clay-card clay-card-p">
                <div className="clay-section-title">✨ Recommended for You</div>
                <p style={{ fontSize: ".82rem", color: "#7a7a9a", marginBottom: 16 }}>
                  Sorted by preference match &amp; trust score.{" "}
                  <span
                    style={{ color: "#42a5f5", fontWeight: 700, cursor: "pointer" }}
                    onClick={() => navigate("/tenant/profile")}
                  >
                    Update preferences
                  </span>
                </p>
                <div className="rec-grid">
                  {recommendations.map((pg, i) => (
                    <div
                      key={pg._id}
                      className="rec-card"
                      style={{ animationDelay: `${i * 0.07}s` }}
                      onClick={() => navigate("/tenant/findpgs")}
                    >
                      {/* Name + match badge */}
                      <div className="rec-header">
                        <div className="rec-name">{pg.name}</div>
                        <span className={`rec-match-badge ${matchClass(pg.matchScore)}`}>
                          ⚡ {pg.matchScore}% match
                        </span>
                      </div>

                      {/* Location */}
                      <div className="rec-loc">
                        <MapPin size={12} /> {pg.location}
                      </div>

                      {/* Rent */}
                      <div className="rec-price">
                        <IndianRupee size={14} />
                        {pg.rent?.toLocaleString("en-IN")}
                        <span style={{ fontWeight: 500, color: "#7a7a9a", fontSize: ".78rem" }}>/mo</span>
                      </div>

                      <div className="rec-divider" />

                      {/* Tags: trust, availability, amenities */}
                      <div className="rec-tags">
                        <span className={`rec-tag ${trustClass(pg.trustScore)}`}>
                          ⭐ Trust {pg.trustScore}/100
                        </span>
                        {pg.availableRoomCount > 0 && (
                          <span className="rec-tag rec-trust-high">
                            🟢 {pg.availableRoomCount} room{pg.availableRoomCount > 1 ? "s" : ""} free
                          </span>
                        )}
                        {(pg.amenities || []).slice(0, 3).map((a) => (
                          <span key={a} className="rec-tag">{a}</span>
                        ))}
                        {(pg.amenities || []).length > 3 && (
                          <span className="rec-tag">+{pg.amenities.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}