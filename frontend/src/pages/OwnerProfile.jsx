import { useEffect, useState } from "react";
import { Upload, CheckCircle2 } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetMe, getUser } from "../utils/api";
import { CLAY_BASE, CLAY_OWNER, injectClay } from "../styles/claystyles";

const PAGE_CSS = `
  .profile-grid { display:grid; grid-template-columns:260px 1fr; gap:24px; }
  @media(max-width:760px){ .profile-grid{grid-template-columns:1fr;} }

  .avatar-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:28px; padding:32px 24px; box-shadow:0 8px 28px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95); text-align:center; animation:fadeUp .6s ease both; height:fit-content; position:relative; overflow:hidden; }
  .avatar-card::before { content:''; position:absolute; top:0; left:0; right:0; height:5px; background:linear-gradient(90deg,#ffa726,#e040fb,#66bb6a); border-radius:28px 28px 0 0; }
  .avatar-ring { width:110px; height:110px; border-radius:50%; margin:0 auto 16px; background:linear-gradient(135deg,#ffe0b2,#fff8e1); border:4px solid rgba(255,255,255,.95); box-shadow:0 8px 28px rgba(255,167,38,.28),inset 0 2px 0 rgba(255,255,255,.8); display:flex; align-items:center; justify-content:center; font-size:2.8rem; }
  .avatar-name { font-family:'Nunito',sans-serif; font-size:1.3rem; font-weight:900; color:#2d2d4e; margin-bottom:10px; }
  .avatar-role-badge { display:inline-block; background:rgba(255,248,225,.9); color:#e65100; border:1.5px solid rgba(255,224,130,.6); border-radius:50px; padding:5px 16px; font-size:.75rem; font-weight:700; margin-bottom:20px; }

  .pg-count-pill { background:rgba(255,255,255,.7); border:2px solid rgba(255,255,255,.9); border-radius:16px; padding:14px 18px; box-shadow:0 3px 12px rgba(0,0,0,.07); margin-bottom:12px; }
  .pill-label { font-size:.65rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; }
  .pill-val { font-family:'Nunito',sans-serif; font-size:2rem; font-weight:900; color:#e65100; }

  .trust-ring-wrap { text-align:center; margin-top:6px; }
  .trust-ring { width:88px; height:88px; position:relative; display:inline-flex; align-items:center; justify-content:center; }
  .trust-ring svg { position:absolute; top:0; left:0; transform:rotate(-90deg); }
  .ring-bg   { fill:none; stroke:rgba(200,200,220,.3); stroke-width:7; }
  .ring-fill { fill:none; stroke-width:7; stroke-linecap:round; stroke:#ffa726; }
  .trust-num { font-family:'Nunito',sans-serif; font-size:1.4rem; font-weight:900; color:#e65100; z-index:1; }
  .trust-lbl { font-size:.65rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-top:4px; }

  .details-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:28px; padding:32px; box-shadow:0 8px 28px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95); animation:fadeUp .7s ease both; }
  .detail-row { display:grid; grid-template-columns:120px 1fr; gap:12px; align-items:center; padding:11px 0; border-bottom:1.5px solid rgba(255,255,255,.7); }
  .detail-row:last-child { border-bottom:none; }
  .detail-label { font-size:.72rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.4px; }
  .detail-value { font-size:.88rem; color:#2d2d4e; font-weight:500; }

  .upload-btn { width:100%; padding:13px 20px; border-radius:16px; cursor:pointer; background:rgba(255,255,255,.72); border:2px dashed rgba(255,167,38,.55); font-family:'Poppins',sans-serif; font-size:.88rem; font-weight:600; color:#f57f17; box-shadow:0 4px 14px rgba(0,0,0,.06); transition:transform .15s,box-shadow .15s,border-color .2s; display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:14px; }
  .upload-btn:hover { transform:translateY(-2px); border-color:rgba(255,167,38,.8); }

  .stat-row { display:flex; align-items:center; justify-content:space-between; padding:13px 16px; background:rgba(255,255,255,.55); border:2px solid rgba(255,255,255,.85); border-radius:15px; margin-bottom:10px; box-shadow:0 3px 12px rgba(0,0,0,.05); transition:transform .15s; }
  .stat-row:hover { transform:translateX(4px); }
  .stat-row-label { font-size:.82rem; color:#5a5a7a; font-weight:600; }
  .stat-row-value { font-family:'Nunito',sans-serif; font-size:1.35rem; font-weight:900; }
  .v-orange{color:#e65100;} .v-green{color:#2e7d32;}

  .verified-badge   { display:inline-flex; align-items:center; gap:6px; background:rgba(232,245,233,.9); color:#2e7d32; border:1.5px solid rgba(165,214,167,.5); border-radius:50px; padding:5px 14px; font-size:.78rem; font-weight:700; }
  .unverified-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(255,249,196,.9); color:#f57f17; border:1.5px solid rgba(255,224,130,.5); border-radius:50px; padding:5px 14px; font-size:.78rem; font-weight:700; }
`;


const css = injectClay(CLAY_BASE, CLAY_OWNER, PAGE_CSS);

const C = 2 * Math.PI * 36;

function TrustRing({ value = 0 }) {
  const offset = C * (1 - Math.min(value / 100, 1));
  return (
    <div className="trust-ring-wrap">
      <div className="trust-ring">
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle className="ring-bg" cx="44" cy="44" r="36" />
          <circle className="ring-fill" cx="44" cy="44" r="36" strokeDasharray={C} strokeDashoffset={offset} />
        </svg>
        <span className="trust-num">{value}</span>
      </div>
      <div className="trust-lbl">Trust Score</div>
    </div>
  );
}

export default function OwnerProfile() {
  const [user, setUser]       = useState(getUser());
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
        <RoleNavigation role="owner" />
        <main className="clay-main"><div className="clay-empty"><span className="clay-empty-emoji">⏳</span> Loading profile…</div></main>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="owner" />

        <main className="clay-main">
          <div className="clay-container">
            <h2 className="clay-page-title">🏢 Profile</h2>
            <p className="clay-page-sub">Manage your identity documents and track your trust score.</p>

            <div className="profile-grid">
              {/* Avatar */}
              <div className="avatar-card">
                <div className="avatar-ring">
                  {user?.name ? user.name[0].toUpperCase() : "🏢"}
                </div>
                <div className="avatar-name">{user?.name}</div>
                <span className="avatar-role-badge">🏢 PG Owner</span>

                <div className="pg-count-pill">
                  <div className="pill-label">PGs Listed</div>
                  <div className="pill-val">{user?.totalPGs ?? 0}</div>
                </div>

                <TrustRing value={user?.trustScore || 0} />
              </div>

              {/* Details */}
              <div className="details-card">
                <div className="clay-section-title">📋 Your Details</div>

                {[
                  { label: "Full Name", value: user?.name,  icon: "👤" },
                  { label: "Email",     value: user?.email, icon: "📧" },
                  { label: "Phone",     value: user?.phone || "Not provided", icon: "📱" },
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
                  Upload Document (Property Docs / PAN / Aadhaar)
                </button>

                <div className="stat-row">
                  <span className="stat-row-label">🔐 Verification Status</span>
                  {user?.verificationStatus === "verified" ? (
                    <span className="verified-badge"><CheckCircle2 size={14} /> Verified</span>
                  ) : (
                    <span className="unverified-badge">⏳ {user?.verificationStatus || "Unverified"}</span>
                  )}
                </div>

                <div className="stat-row">
                  <span className="stat-row-label">⭐ Your Trust Score</span>
                  <span className="stat-row-value v-orange">{user?.trustScore || 0}<span style={{ fontSize:".65rem", color:"#bbb" }}>/100</span></span>
                </div>

                <div className="stat-row">
                  <span className="stat-row-label">📊 Profile Completion</span>
                  <span className="stat-row-value v-green">{user?.profileCompletion || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}