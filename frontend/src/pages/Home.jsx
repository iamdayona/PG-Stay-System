import { useNavigate } from "react-router-dom";
import { CLAY_BASE, CLAY_AUTH, injectClay } from "../styles/claystyles";

const PAGE_CSS = `
  @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }

  .clay-logo { font-family:'Nunito',sans-serif; font-weight:900; font-size:1.4rem; background:linear-gradient(135deg,#e040fb,#42a5f5); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .clay-logo span { color:#66bb6a; -webkit-text-fill-color:#66bb6a; }
  .clay-nav { display:flex; align-items:center; justify-content:space-between; padding:18px 48px; background:rgba(255,255,255,.55); backdrop-filter:blur(14px); border-bottom:2px solid rgba(255,255,255,.7); box-shadow:0 4px 24px rgba(0,0,0,.06); position:sticky; top:0; z-index:100; }

  .clay-main { flex:1; display:flex; align-items:center; justify-content:center; padding:48px 24px; }
  .clay-container { max-width:980px; width:100%; }

  .clay-hero { text-align:center; margin-bottom:52px; animation:fadeUp .7s ease both; }
  .clay-badge { display:inline-block; background:rgba(255,255,255,.7); border:2px solid rgba(255,255,255,.9); box-shadow:0 4px 14px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.9); border-radius:50px; padding:6px 18px; font-size:.78rem; font-weight:700; color:#e040fb; letter-spacing:1px; text-transform:uppercase; margin-bottom:20px; }
  .clay-hero h1 { font-family:'Nunito',sans-serif; font-size:clamp(2rem,5vw,3.2rem); font-weight:900; color:#2d2d4e; line-height:1.2; margin-bottom:16px; }
  .clay-hero h1 .accent-pink  { color:#e040fb; }
  .clay-hero h1 .accent-blue  { color:#42a5f5; }
  .clay-hero h1 .accent-green { color:#66bb6a; }
  .clay-hero p { color:#5a5a7a; font-size:1.05rem; max-width:580px; margin:0 auto; line-height:1.75; }

  .clay-grid { display:grid; grid-template-columns:1fr 1fr; gap:28px; animation:fadeUp .9s ease .2s both; }
  @media(max-width:640px){ .clay-grid{grid-template-columns:1fr;} .clay-nav{padding:14px 20px;} }

  .clay-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:28px; padding:40px 36px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95); transition:transform .25s,box-shadow .25s; position:relative; overflow:hidden; }
  .clay-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:28px 28px 0 0; }
  .clay-card.green-card::before { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .clay-card.blue-card::before  { background:linear-gradient(90deg,#42a5f5,#90caf9); }
  .clay-card:hover { transform:translateY(-6px) scale(1.01); box-shadow:0 20px 48px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.95); }

  .clay-card-icon { width:64px; height:64px; border-radius:18px; display:flex; align-items:center; justify-content:center; font-size:1.8rem; margin:0 auto 20px; box-shadow:0 6px 18px rgba(0,0,0,.1),inset 0 1px 0 rgba(255,255,255,.8); border:2px solid rgba(255,255,255,.9); }
  .green-card .clay-card-icon { background:linear-gradient(135deg,#c8e6c9,#e8f5e9); }
  .blue-card  .clay-card-icon { background:linear-gradient(135deg,#bbdefb,#e3f2fd); }
  .clay-card h2 { font-family:'Nunito',sans-serif; font-size:1.35rem; font-weight:800; color:#2d2d4e; margin-bottom:10px; }
  .clay-card p  { color:#6b6b8a; font-size:.92rem; line-height:1.7; margin-bottom:28px; }

  .clay-features { display:flex; justify-content:center; gap:16px; margin-top:40px; flex-wrap:wrap; animation:fadeUp 1s ease .4s both; }
  .clay-feature-pill { background:rgba(255,255,255,.6); border:2px solid rgba(255,255,255,.85); box-shadow:0 4px 12px rgba(0,0,0,.07); border-radius:50px; padding:8px 18px; font-size:.82rem; font-weight:600; color:#4a4a6a; display:flex; align-items:center; gap:7px; }

  .clay-footer { background:rgba(255,255,255,.5); backdrop-filter:blur(12px); border-top:2px solid rgba(255,255,255,.7); padding:22px 48px; }
  .clay-footer-inner { max-width:980px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
  .clay-footer-copy { font-size:.82rem; color:#7a7a9a; font-weight:500; }
  .clay-footer-links { display:flex; gap:6px; }
  .clay-footer-link { background:rgba(255,255,255,.72); outline:1.5px solid rgba(255,255,255,.85); border:none; border-radius:10px; padding:7px 16px; font-family:'Poppins',sans-serif; font-size:.8rem; font-weight:600; color:#5a5a7a; cursor:pointer; transition:transform .15s,box-shadow .15s,color .15s; }
  .clay-footer-link:hover { color:#e040fb; transform:translateY(-2px); box-shadow:0 6px 14px rgba(0,0,0,.1); }
`;

const css = injectClay(CLAY_BASE, CLAY_AUTH, PAGE_CSS);

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">

        {/* Navbar */}
        <nav className="clay-nav">
          <div className="clay-logo">PG<span>Stay</span></div>
          <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#7a7a9a" }}>
            🏠 Smart PG Management
          </div>
        </nav>

        {/* Main */}
        <main className="clay-main">
          <div className="clay-container">

            {/* Hero */}
            <div className="clay-hero">

              <h1>
                Find Your Perfect{" "}
                <span className="accent-pink">PG Stay</span>
                <br />
                with{" "}
                <span className="accent-blue">Smart</span>{" "}
                <span className="accent-green">Recommendations</span>
                <br />
                and{" "}
                <span className="accent-pink">Management</span>
              </h1>
              <p>
                A platform that connects tenants and PG owners effortlessly.
                Search verified listings, book rooms, manage payments, and track
                trust scores — all in one cozy place.
              </p>
            </div>

            {/* Cards */}
            <div className="clay-grid">

              {/* Register */}
              <div className="clay-card green-card">
                <div className="clay-card-icon">🏡</div>
                <h2>New Here?</h2>
                <p>
                  Create your account to explore PG listings,
                  book rooms, and manage your accommodation with ease.
                </p>
                <button
                  className="clay-btn clay-btn-green"
                  onClick={() => navigate("/register")}
                >
                  Register Now →
                </button>
              </div>

              {/* Login */}
              <div className="clay-card blue-card">
                <div className="clay-card-icon">👋</div>
                <h2>Welcome Back!</h2>
                <p>
                  Log in to access your dashboard, manage bookings,
                  track payments, and monitor your trust score.
                </p>
                <button
                  className="clay-btn clay-btn-blue"
                  onClick={() => navigate("/login")}
                >
                  Login Here →
                </button>
              </div>

            </div>

            {/* Feature pills */}
            <div className="clay-features">
              {[
                ["🔍", "Smart Search"],
                ["✅", "Verified Listings"],
                ["💳", "Secure Payments"],
                ["⭐", "Trust Scores"],
                ["📱", "Easy Booking"],
              ].map(([icon, label]) => (
                <div className="clay-feature-pill" key={label}>
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="clay-footer">
          <div className="clay-footer-inner">
            <div className="clay-footer-copy">
              © {new Date().getFullYear()} PG Stay Recomendation and Management System · All rights reserved
            </div>
            <div className="clay-footer-links">
              {[["About", "/about"], ["Contact", "/contact"], ["Help", "/help"]].map(
                ([label, path]) => (
                  <button
                    key={label}
                    className="clay-footer-link"
                    onClick={() => navigate(path)}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}