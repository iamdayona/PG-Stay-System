import { useEffect, useState } from "react";
import { User, Upload, CheckCircle2 } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetMe, getUser } from "../utils/api";

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

  .clay-main { position:relative; z-index:1; padding:36px 24px; }
  .clay-container { max-width:1000px; margin:0 auto; }
  .clay-page-title { font-family:'Nunito',sans-serif; font-size:1.9rem; font-weight:900; color:#2d2d4e; margin-bottom:4px; }
  .clay-page-sub { color:#7a7a9a; font-size:.92rem; margin-bottom:28px; }

  .profile-grid { display:grid; grid-template-columns:260px 1fr; gap:24px; }
  @media(max-width:760px){ .profile-grid{grid-template-columns:1fr;} }

  /* ── Avatar card ── */
  .avatar-card {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:28px; padding:32px 24px;
    box-shadow:0 8px 28px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.95);
    text-align:center; animation:fadeUp .6s ease both;
    height:fit-content; position:relative; overflow:hidden;
  }
  .avatar-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:5px;
    background:linear-gradient(90deg,#42a5f5,#e040fb,#66bb6a); border-radius:28px 28px 0 0;
  }

  .avatar-ring {
    width:110px; height:110px; border-radius:50%; margin:0 auto 16px;
    background:linear-gradient(135deg,#bbdefb,#e3f2fd);
    border:4px solid rgba(255,255,255,.95);
    box-shadow:0 8px 28px rgba(66,165,245,.25), inset 0 2px 0 rgba(255,255,255,.8);
    display:flex; align-items:center; justify-content:center;
    font-size:2.8rem;
  }
  .avatar-name { font-family:'Nunito',sans-serif; font-size:1.3rem; font-weight:900; color:#2d2d4e; margin-bottom:10px; }
  .avatar-role-badge {
    display:inline-block; background:rgba(227,242,253,.9); color:#1565c0;
    border:1.5px solid rgba(144,202,249,.5);
    border-radius:50px; padding:5px 16px; font-size:.75rem; font-weight:700;
    box-shadow:0 2px 8px rgba(66,165,245,.15);
  }

  /* Score ring */
  .score-ring {
    margin:22px auto 0; width:90px; height:90px;
    position:relative; display:flex; align-items:center; justify-content:center;
  }
  .score-ring svg { position:absolute; top:0; left:0; transform:rotate(-90deg); }
  .score-ring-bg { fill:none; stroke:rgba(200,200,220,.3); stroke-width:7; }
  .score-ring-fill { fill:none; stroke-width:7; stroke-linecap:round; transition:stroke-dashoffset .8s ease; }
  .score-value { font-family:'Nunito',sans-serif; font-size:1.5rem; font-weight:900; color:#1565c0; z-index:1; }
  .score-label { font-size:.65rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; text-align:center; margin-top:6px; }

  /* ── Details card ── */
  .details-card {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:28px; padding:32px;
    box-shadow:0 8px 28px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.95);
    animation:fadeUp .7s ease both;
  }
  .clay-section-title {
    font-family:'Nunito',sans-serif; font-size:1.1rem; font-weight:800; color:#2d2d4e;
    margin-bottom:18px; display:flex; align-items:center; gap:8px;
  }

  .detail-row {
    display:grid; grid-template-columns:130px 1fr; gap:12px; align-items:center;
    padding:12px 0; border-bottom:1.5px solid rgba(255,255,255,.7);
  }
  .detail-row:last-child { border-bottom:none; }
  .detail-label { font-size:.75rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.4px; }
  .detail-value { font-size:.9rem; color:#2d2d4e; font-weight:500; }

  .clay-divider { height:2px; background:rgba(255,255,255,.7); margin:24px 0; border-radius:4px; }

  /* Upload button */
  .upload-btn {
    width:100%; padding:13px 20px; border-radius:16px; cursor:pointer;
    background:rgba(255,255,255,.72); border:2px dashed rgba(144,202,249,.7);
    font-family:'Poppins',sans-serif; font-size:.88rem; font-weight:600; color:#5a5a7a;
    box-shadow:0 4px 14px rgba(0,0,0,.07); transition:transform .15s, box-shadow .15s, border-color .2s;
    display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:14px;
  }
  .upload-btn:hover { transform:translateY(-2px); border-color:rgba(66,165,245,.5); box-shadow:0 8px 22px rgba(0,0,0,.1); }

  /* Stat rows */
  .stat-row {
    display:flex; align-items:center; justify-content:space-between; padding:14px 18px;
    background:rgba(255,255,255,.55); border:2px solid rgba(255,255,255,.85); border-radius:16px;
    margin-bottom:10px; box-shadow:0 3px 12px rgba(0,0,0,.06);
    transition:transform .15s;
  }
  .stat-row:hover { transform:translateX(4px); }
  .stat-row-label { font-size:.82rem; color:#5a5a7a; font-weight:600; display:flex; align-items:center; gap:8px; }
  .stat-row-value { font-family:'Nunito',sans-serif; font-size:1.4rem; font-weight:900; }
  .val-blue  { color:#1565c0; }
  .val-green { color:#2e7d32; }
  .val-yellow{ color:#f57f17; }

  /* Verification status */
  .verified-badge {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(232,245,233,.9); color:#2e7d32;
    border:1.5px solid rgba(165,214,167,.5); border-radius:50px; padding:6px 16px;
    font-size:.8rem; font-weight:700; box-shadow:0 3px 10px rgba(102,187,106,.15);
  }
  .pending-badge {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,249,196,.9); color:#f57f17;
    border:1.5px solid rgba(255,224,130,.5); border-radius:50px; padding:6px 16px;
    font-size:.8rem; font-weight:700; box-shadow:0 3px 10px rgba(255,193,7,.15);
  }

  .empty-state { text-align:center; padding:64px; color:#9a9ab0; }
`;

const CIRCUMFERENCE = 2 * Math.PI * 36;

function ScoreRing({ value, max = 100, color = "#42a5f5" }) {
  const pct    = Math.min(value / max, 1);
  const offset = CIRCUMFERENCE * (1 - pct);
  return (
    <>
      <div className="score-ring">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle className="score-ring-bg" cx="45" cy="45" r="36" />
          <circle
            className="score-ring-fill"
            cx="45" cy="45" r="36"
            stroke={color}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="score-value" style={{ color }}>{value}</span>
      </div>
      <div className="score-label">Trust Score</div>
    </>
  );
}

export default function TenantProfile() {
  const [user, setUser]     = useState(getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetMe()
      .then((res) => setUser(res.user))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="tenant" />
        <main className="clay-main"><div className="empty-state">⏳ Loading profile…</div></main>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="tenant" />

        <main className="clay-main">
          <div className="clay-container">
            <h2 className="clay-page-title">👤 Profile & Verification</h2>
            <p className="clay-page-sub">Manage your identity and track your trust score.</p>

            <div className="profile-grid">
              {/* Avatar card */}
              <div className="avatar-card">
                <div className="avatar-ring">
                  {user?.name ? user.name[0].toUpperCase() : "🧑"}
                </div>
                <div className="avatar-name">{user?.name}</div>
                <span className="avatar-role-badge">🏠 Tenant</span>
                <ScoreRing value={user?.trustScore || 0} />
              </div>

              {/* Details card */}
              <div className="details-card">
                <div className="clay-section-title">📋 Profile Details</div>

                {[
                  { label: "Full Name", value: user?.name,   icon: "👤" },
                  { label: "Email",     value: user?.email,  icon: "📧" },
                  { label: "Phone",     value: user?.phone  || "Not provided", icon: "📱" },
                  { label: "Gender",    value: user?.gender || "Not specified", icon: "👥" },
                ].map((row) => (
                  <div key={row.label} className="detail-row">
                    <div className="detail-label">{row.icon} {row.label}</div>
                    <div className="detail-value">{row.value}</div>
                  </div>
                ))}

                <div className="clay-divider" />

                <div className="clay-section-title">🔐 Identity Verification</div>

                <button className="upload-btn">
                  <Upload size={16} />
                  Upload Document (Aadhaar / Student ID)
                </button>

                <div className="stat-row">
                  <span className="stat-row-label">🔐 Verification Status</span>
                  {user?.verificationStatus === "verified" ? (
                    <span className="verified-badge"><CheckCircle2 size={14} /> Verified</span>
                  ) : (
                    <span className="pending-badge">⏳ {user?.verificationStatus || "Unverified"}</span>
                  )}
                </div>

                <div className="stat-row">
                  <span className="stat-row-label">📊 Profile Completion</span>
                  <span className="stat-row-value val-blue">{user?.profileCompletion || 0}%</span>
                </div>

                <div className="stat-row">
                  <span className="stat-row-label">⭐ Trust Score</span>
                  <span className="stat-row-value val-green">{user?.trustScore || 0}<span style={{ fontSize: ".7rem", color: "#9a9ab0", fontWeight: 500 }}>/100</span></span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}