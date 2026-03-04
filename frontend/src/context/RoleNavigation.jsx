import { useNavigate } from "react-router-dom";
import { useRole } from "./useRole";
import { clearAuth } from "../utils/api";

// ── Per-role colour themes ──────────────────────────────────────────────────
const THEMES = {
  tenant: {
    emoji: "🏠",
    tagBg: "rgba(227,242,253,.85)",
    tagColor: "#1565c0",
    tagBorder: "rgba(144,202,249,.5)",
    logoGrad: "linear-gradient(135deg,#42a5f5,#e040fb)",
    logoutBg: "linear-gradient(135deg,#42a5f5,#1e88e5)",
    logoutShadow: "0 4px 0 #1565c0, 0 6px 16px rgba(66,165,245,.35)",
  },
  owner: {
    emoji: "🏢",
    tagBg: "rgba(255,248,225,.85)",
    tagColor: "#e65100",
    tagBorder: "rgba(255,224,130,.5)",
    logoGrad: "linear-gradient(135deg,#ffa726,#e040fb)",
    logoutBg: "linear-gradient(135deg,#ffa726,#fb8c00)",
    logoutShadow: "0 4px 0 #e65100, 0 6px 16px rgba(255,167,38,.35)",
  },
  admin: {
    emoji: "🛡️",
    tagBg: "rgba(255,235,238,.85)",
    tagColor: "#c62828",
    tagBorder: "rgba(239,154,154,.5)",
    logoGrad: "linear-gradient(135deg,#ef5350,#e040fb)",
    logoutBg: "linear-gradient(135deg,#ef5350,#e53935)",
    logoutShadow: "0 4px 0 #b71c1c, 0 6px 16px rgba(239,83,80,.35)",
  },
};

// ── Scoped CSS injected into <head> once ───────────────────────────────────
const NAV_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@900&family=Poppins:wght@500;600;700&display=swap');

  .clay-nav-root {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 13px 36px;
    background: rgba(255,255,255,.62);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 2.5px solid rgba(255,255,255,.82);
    box-shadow: 0 4px 22px rgba(0,0,0,.07), inset 0 -1px 0 rgba(0,0,0,.03);
  }

  .clay-nav-logo {
    font-family: 'Nunito', sans-serif;
    font-weight: 900;
    font-size: 1.35rem;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    line-height: 1;
  }
  .clay-nav-logo span {
    -webkit-text-fill-color: #66bb6a;
  }

  .clay-nav-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    border-radius: 50px;
    border: 1.5px solid;
    font-family: 'Poppins', sans-serif;
    font-size: .74rem;
    font-weight: 700;
    box-shadow: 0 3px 10px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.9);
    white-space: nowrap;
    text-transform: capitalize;
  }

  .clay-nav-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .clay-nav-back {
    padding: 8px 18px;
    border-radius: 50px;
    border: 2px solid rgba(255,255,255,.88);
    font-family: 'Poppins', sans-serif;
    font-size: .78rem;
    font-weight: 700;
    color: #5a5a7a;
    background: rgba(255,255,255,.72);
    backdrop-filter: blur(10px);
    box-shadow: 0 3px 0 rgba(0,0,0,.06), 0 5px 14px rgba(0,0,0,.06),
                inset 0 1px 0 rgba(255,255,255,.95);
    cursor: pointer;
    transition: transform .15s, box-shadow .15s, background .15s;
    white-space: nowrap;
  }
  .clay-nav-back:hover {
    transform: translateY(-2px);
    background: rgba(255,255,255,.92);
    box-shadow: 0 5px 0 rgba(0,0,0,.07), 0 9px 20px rgba(0,0,0,.09),
                inset 0 1px 0 rgba(255,255,255,.95);
  }
  .clay-nav-back:active { transform: scale(.96) translateY(2px); }

  .clay-nav-logout {
    padding: 8px 20px;
    border-radius: 50px;
    border: none;
    font-family: 'Poppins', sans-serif;
    font-size: .78rem;
    font-weight: 700;
    color: white;
    cursor: pointer;
    transition: transform .15s, filter .15s;
    white-space: nowrap;
  }
  .clay-nav-logout:hover  { filter: brightness(1.08); transform: translateY(-2px); }
  .clay-nav-logout:active { transform: scale(.96) translateY(2px); }

  @media (max-width: 560px) {
    .clay-nav-root { padding: 11px 16px; }
    .clay-nav-tag  { display: none; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────

const RoleNavigation = ({ role }) => {
  const navigate    = useNavigate();
  const { setRole } = useRole();
  const theme       = THEMES[role] || THEMES.tenant;

  const handleLogout = () => {
    clearAuth();
    setRole(null);
    // replace:true removes the current page from history
    // so Back from /login goes to / (Home), never back to a protected page
    navigate("/login", { replace: true });
  };

  return (
    <>
      <style>{NAV_CSS}</style>

      <nav className="clay-nav-root">

        {/* Logo — clicking goes to that role's dashboard */}
        <div
          className="clay-nav-logo"
          style={{ backgroundImage: theme.logoGrad }}
          onClick={() => navigate(`/${role}/dashboard`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate(`/${role}/dashboard`)}
        >
          PG<span>Stay</span>
        </div>

        {/* Go Back + Logout */}
        <div className="clay-nav-right">
          <button className="clay-nav-back" onClick={() => navigate(-1)}>
            ← Go Back
          </button>

          <button
            className="clay-nav-logout"
            style={{
              background: theme.logoutBg,
              boxShadow:  theme.logoutShadow + ", inset 0 1px 0 rgba(255,255,255,.3)",
            }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

      </nav>
    </>
  );
};

export default RoleNavigation;