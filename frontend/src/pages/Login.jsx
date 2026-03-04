import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useRole } from "../context/useRole";
import { apiLogin, saveAuth } from "../utils/api";
import { CLAY_BASE, CLAY_AUTH, injectClay } from "../styles/claystyles";

const PAGE_CSS = `
   @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
  @keyframes shake { 0%,100%{transform:translateX(0);} 20%,60%{transform:translateX(-6px);} 40%,80%{transform:translateX(6px);} }

  .clay-logo { font-family:'Nunito',sans-serif; font-weight:900; font-size:1.4rem; background:linear-gradient(135deg,#e040fb,#42a5f5); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .clay-logo span { -webkit-text-fill-color:#66bb6a; }
  .clay-nav { display:flex; align-items:center; justify-content:space-between; padding:16px 48px; background:rgba(255,255,255,.55); backdrop-filter:blur(14px); border-bottom:2px solid rgba(255,255,255,.7); box-shadow:0 4px 24px rgba(0,0,0,.06); position:sticky; top:0; z-index:100; }
  .clay-nav-tag { font-size:.82rem; font-weight:600; color:#7a7a9a; }

  .clay-main { flex:1; display:flex; align-items:center; justify-content:center; padding:52px 24px; position:relative; z-index:1; }

  .login-card { background:rgba(255,255,255,.68); backdrop-filter:blur(20px); border:2.5px solid rgba(255,255,255,.88); border-radius:32px; padding:48px 44px; width:100%; max-width:460px; box-shadow:0 12px 48px rgba(0,0,0,.1),inset 0 1px 0 rgba(255,255,255,.95); animation:fadeUp .7s ease both; position:relative; overflow:hidden; }
  .login-card::before { content:''; position:absolute; top:0; left:0; right:0; height:5px; background:linear-gradient(90deg,#e040fb,#42a5f5,#66bb6a); border-radius:32px 32px 0 0; }

  .login-icon { width:72px; height:72px; border-radius:22px; margin:0 auto 24px; display:flex; align-items:center; justify-content:center; font-size:2rem; background:linear-gradient(135deg,#bbdefb,#e3f2fd); border:2px solid rgba(255,255,255,.9); box-shadow:0 6px 20px rgba(66,165,245,.2),inset 0 1px 0 rgba(255,255,255,.8); }
  .login-title { font-family:'Nunito',sans-serif; font-size:1.9rem; font-weight:900; color:#2d2d4e; text-align:center; margin-bottom:4px; }
  .login-sub { text-align:center; color:#7a7a9a; font-size:.88rem; margin-bottom:32px; }

  .form-group { margin-bottom:20px; }
  .clay-divider { display:flex; align-items:center; gap:12px; margin:24px 0; }
  .clay-divider-line { flex:1; height:2px; background:rgba(255,255,255,.7); border-radius:4px; }
  .clay-divider-text { font-size:.75rem; font-weight:600; color:#9a9ab0; white-space:nowrap; }

  .clay-error { background:rgba(255,235,238,.85); border:2px solid rgba(239,154,154,.6); border-radius:14px; padding:12px 16px; margin-bottom:20px; color:#c62828; font-size:.85rem; font-weight:500; animation:shake .4s ease,fadeIn .3s ease; display:flex; align-items:center; gap:8px; }

  .clay-btn-primary { width:100%; padding:15px 24px; border:none; border-radius:16px; font-family:'Poppins',sans-serif; font-size:1rem; font-weight:700; cursor:pointer; transition:transform .15s,box-shadow .15s,filter .15s; background:linear-gradient(135deg,#42a5f5,#1e88e5); color:white; box-shadow:0 6px 0 #1565c0,0 10px 24px rgba(66,165,245,.4),inset 0 1px 0 rgba(255,255,255,.3); margin-top:8px; }
  .clay-btn-primary:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); box-shadow:0 8px 0 #1565c0,0 14px 32px rgba(66,165,245,.5); }
  .clay-btn-primary:active { transform:scale(.97) translateY(2px) !important; }
  .clay-btn-primary:disabled { opacity:.6; cursor:not-allowed; }

  .login-footer-text { text-align:center; font-size:.85rem; color:#7a7a9a; margin-top:24px; }
  .clay-link { color:#42a5f5; font-weight:700; text-decoration:none; transition:color .15s; }
  .clay-link:hover { color:#1e88e5; text-decoration:underline; }

  .clay-footer { background:rgba(255,255,255,.5); backdrop-filter:blur(12px); border-top:2px solid rgba(255,255,255,.7); padding:22px 48px; position:relative; z-index:1; }
  .clay-footer-inner { max-width:1100px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
  .clay-footer-copy { font-size:.82rem; color:#7a7a9a; font-weight:500; }
  .clay-footer-links { display:flex; gap:6px; }
  .clay-footer-btn { background:rgba(255,255,255,.72); outline:1.5px solid rgba(255,255,255,.85); border:none; border-radius:10px; padding:7px 16px; font-family:'Poppins',sans-serif; font-size:.8rem; font-weight:600; color:#5a5a7a; cursor:pointer; box-shadow:0 3px 8px rgba(0,0,0,.07); transition:transform .15s,color .15s,box-shadow .15s; }
  .clay-footer-btn:hover { color:#e040fb; transform:translateY(-2px); box-shadow:0 6px 14px rgba(0,0,0,.1); }

  @media(max-width:520px){ .login-card{padding:36px 24px;} .clay-nav{padding:14px 20px;} }
`;

const css = injectClay(CLAY_BASE, CLAY_AUTH, PAGE_CSS);

export default function Login() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiLogin({ email, password });
      saveAuth(data.token, data.user);
      setRole(data.user.role);
      if (data.user.role === "admin")       navigate("/admin/dashboard");
      else if (data.user.role === "tenant") navigate("/tenant/dashboard");
      else if (data.user.role === "owner")  navigate("/owner/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">

        {/* Nav */}
        <nav className="clay-nav">
          <div className="clay-logo">PG<span>Stay</span></div>
          <div className="clay-nav-tag">🏠 Smart PG Management</div>
        </nav>

        {/* Main */}
        <main className="clay-main">
          <div className="login-card">

            <div className="login-icon">🔑</div>
            <h2 className="login-title">Welcome Back!</h2>
            <p className="login-sub">Sign in to your PGStay account</p>

            {error && (
              <div className="clay-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="clay-label">Email Address</label>
                <input
                  className="clay-input"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="clay-label">Password</label>
                <input
                  className="clay-input"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="clay-btn-primary"
                disabled={loading}
              >
                {loading ? "⏳ Signing in..." : "Login →"}
              </button>
            </form>

            <div className="clay-divider">
              <div className="clay-divider-line" />
              <span className="clay-divider-text">New to PGStay?</span>
              <div className="clay-divider-line" />
            </div>

            <p className="login-footer-text">
              Don't have an account?{" "}
              <Link to="/register" className="clay-link">Register here</Link>
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="clay-footer">
          <div className="clay-footer-inner">
            <div className="clay-footer-copy">
              © {new Date().getFullYear()} PGStay · All rights reserved
            </div>
            <div className="clay-footer-links">
              {[["About", "/about"], ["Contact", "/contact"], ["Help", "/help"]].map(
                ([label, path]) => (
                  <button key={label} className="clay-footer-btn" onClick={() => navigate(path)}>
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