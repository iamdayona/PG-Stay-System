import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Poppins:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .clay-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #fce4ec 0%, #e8f5e9 35%, #e3f2fd 65%, #f3e5f5 100%);
    display: flex;
    flex-direction: column;
    font-family: 'Poppins', sans-serif;
    position: relative;
    overflow: hidden;
  }

  /* Floating blob background shapes */
  .clay-page::before {
    content: '';
    position: fixed;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(255,183,197,0.45) 0%, transparent 70%);
    border-radius: 50%;
    top: -150px; left: -150px;
    animation: floatBlob 8s ease-in-out infinite;
    pointer-events: none;
  }
  .clay-page::after {
    content: '';
    position: fixed;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(167,210,255,0.4) 0%, transparent 70%);
    border-radius: 50%;
    bottom: -100px; right: -100px;
    animation: floatBlob 10s ease-in-out infinite reverse;
    pointer-events: none;
  }

  @keyframes floatBlob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, 20px) scale(1.05); }
  }

  /* Navbar */
  .clay-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 48px;
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(14px);
    border-bottom: 2px solid rgba(255,255,255,0.7);
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    position: sticky; top: 0; z-index: 100;
  }
  .clay-logo {
    font-family: 'Nunito', sans-serif;
    font-weight: 900;
    font-size: 1.4rem;
    background: linear-gradient(135deg, #e040fb, #42a5f5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
  }
  .clay-logo span { color: #66bb6a; -webkit-text-fill-color: #66bb6a; }

  /* Main */
  .clay-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
  }
  .clay-container { max-width: 980px; width: 100%; }

  /* Hero */
  .clay-hero {
    text-align: center;
    margin-bottom: 52px;
    animation: fadeUp 0.7s ease both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .clay-badge {
    display: inline-block;
    background: rgba(255,255,255,0.7);
    border: 2px solid rgba(255,255,255,0.9);
    box-shadow: 0 4px 14px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
    border-radius: 50px;
    padding: 6px 18px;
    font-size: 0.78rem;
    font-weight: 700;
    color: #e040fb;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 20px;
  }

  .clay-hero h1 {
    font-family: 'Nunito', sans-serif;
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 900;
    color: #2d2d4e;
    line-height: 1.2;
    margin-bottom: 16px;
  }
  .clay-hero h1 .accent-pink  { color: #e040fb; }
  .clay-hero h1 .accent-blue  { color: #42a5f5; }
  .clay-hero h1 .accent-green { color: #66bb6a; }

  .clay-hero p {
    color: #5a5a7a;
    font-size: 1.05rem;
    max-width: 580px;
    margin: 0 auto;
    line-height: 1.75;
  }

  /* Cards grid */
  .clay-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
    animation: fadeUp 0.9s ease 0.2s both;
  }
  @media (max-width: 640px) {
    .clay-grid { grid-template-columns: 1fr; }
    .clay-nav { padding: 14px 20px; }
  }

  /* Clay card */
  .clay-card {
    background: rgba(255,255,255,0.65);
    backdrop-filter: blur(18px);
    border: 2.5px solid rgba(255,255,255,0.85);
    border-radius: 28px;
    padding: 40px 36px;
    text-align: center;
    box-shadow:
      0 8px 32px rgba(0,0,0,0.08),
      0 2px 8px rgba(0,0,0,0.04),
      inset 0 1px 0 rgba(255,255,255,0.95),
      inset 0 -2px 0 rgba(0,0,0,0.04);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    position: relative;
    overflow: hidden;
  }
  .clay-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    border-radius: 28px 28px 0 0;
  }
  .clay-card.green-card::before { background: linear-gradient(90deg, #66bb6a, #a5d6a7); }
  .clay-card.blue-card::before  { background: linear-gradient(90deg, #42a5f5, #90caf9); }

  .clay-card:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow:
      0 20px 48px rgba(0,0,0,0.12),
      0 4px 12px rgba(0,0,0,0.06),
      inset 0 1px 0 rgba(255,255,255,0.95);
  }

  .clay-card-icon {
    width: 64px; height: 64px;
    border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.8rem;
    margin: 0 auto 20px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8);
    border: 2px solid rgba(255,255,255,0.9);
  }
  .green-card .clay-card-icon { background: linear-gradient(135deg, #c8e6c9, #e8f5e9); }
  .blue-card  .clay-card-icon { background: linear-gradient(135deg, #bbdefb, #e3f2fd); }

  .clay-card h2 {
    font-family: 'Nunito', sans-serif;
    font-size: 1.35rem;
    font-weight: 800;
    color: #2d2d4e;
    margin-bottom: 10px;
  }
  .clay-card p {
    color: #6b6b8a;
    font-size: 0.92rem;
    line-height: 1.7;
    margin-bottom: 28px;
  }

  /* Clay buttons */
  .clay-btn {
    width: 100%;
    padding: 14px 24px;
    border: none;
    border-radius: 16px;
    font-family: 'Poppins', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
    letter-spacing: 0.3px;
    position: relative;
  }
  .clay-btn:active { transform: scale(0.97) translateY(2px); }

  .clay-btn-green {
    background: linear-gradient(135deg, #66bb6a, #43a047);
    color: white;
    box-shadow:
      0 6px 0 #2e7d32,
      0 10px 24px rgba(102,187,106,0.4),
      inset 0 1px 0 rgba(255,255,255,0.3);
  }
  .clay-btn-green:hover {
    filter: brightness(1.06);
    box-shadow:
      0 8px 0 #2e7d32,
      0 14px 32px rgba(102,187,106,0.5),
      inset 0 1px 0 rgba(255,255,255,0.3);
    transform: translateY(-2px);
  }

  .clay-btn-blue {
    background: linear-gradient(135deg, #42a5f5, #1e88e5);
    color: white;
    box-shadow:
      0 6px 0 #1565c0,
      0 10px 24px rgba(66,165,245,0.4),
      inset 0 1px 0 rgba(255,255,255,0.3);
  }
  .clay-btn-blue:hover {
    filter: brightness(1.06);
    box-shadow:
      0 8px 0 #1565c0,
      0 14px 32px rgba(66,165,245,0.5),
      inset 0 1px 0 rgba(255,255,255,0.3);
    transform: translateY(-2px);
  }

  /* Features strip */
  .clay-features {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 40px;
    flex-wrap: wrap;
    animation: fadeUp 1s ease 0.4s both;
  }
  .clay-feature-pill {
    background: rgba(255,255,255,0.6);
    border: 2px solid rgba(255,255,255,0.85);
    box-shadow: 0 4px 12px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9);
    border-radius: 50px;
    padding: 8px 18px;
    font-size: 0.82rem;
    font-weight: 600;
    color: #4a4a6a;
    display: flex; align-items: center; gap: 7px;
  }
  .clay-feature-pill span:first-child { font-size: 1rem; }

  /* Footer */
  .clay-footer {
    background: rgba(255,255,255,0.5);
    backdrop-filter: blur(12px);
    border-top: 2px solid rgba(255,255,255,0.7);
    padding: 22px 48px;
  }
  .clay-footer-inner {
    max-width: 980px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }
  .clay-footer-copy {
    font-size: 0.82rem;
    color: #7a7a9a;
    font-weight: 500;
  }
  .clay-footer-links { display: flex; gap: 6px; }
  .clay-footer-link {
    background: rgba(255,255,255,0.7);
    border: 1.5px solid rgba(255,255,255,0.9);
    box-shadow: 0 3px 8px rgba(0,0,0,0.07), 0 2px 0 rgba(0,0,0,0.04);
    border-radius: 10px;
    padding: 7px 16px;
    font-family: 'Poppins', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    color: #5a5a7a;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s, color 0.15s;
    border: none;
    background: rgba(255,255,255,0.72);
    outline: 1.5px solid rgba(255,255,255,0.85);
  }
  .clay-footer-link:hover {
    color: #e040fb;
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0,0,0,0.1);
  }
`;

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <style>{styles}</style>
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