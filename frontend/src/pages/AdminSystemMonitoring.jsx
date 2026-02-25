import { useEffect, useState } from "react";
import { Activity, Server, Users, Database, CheckCircle, Wifi } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiAdminSystemStats } from "../utils/api";

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
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.55;}}

  .clay-main { position:relative; z-index:1; padding:36px 24px; }
  .clay-container { max-width:1050px; margin:0 auto; }
  .clay-page-title { font-family:'Nunito',sans-serif; font-size:1.9rem; font-weight:900; color:#2d2d4e; margin-bottom:4px; }
  .clay-page-sub   { color:#7a7a9a; font-size:.92rem; margin-bottom:28px; }

  /* ── System stat cards ── */
  .sys-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  @media(max-width:800px){ .sys-grid{grid-template-columns:repeat(2,1fr);} }

  .sys-card {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:22px; padding:22px;
    box-shadow:0 6px 24px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.95);
    animation:fadeUp .6s ease both; position:relative; overflow:hidden;
    transition:transform .2s, box-shadow .2s;
  }
  .sys-card:hover { transform:translateY(-4px); box-shadow:0 14px 36px rgba(0,0,0,.1); }
  .sys-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:22px 22px 0 0; }
  .sc-blue::before   { background:linear-gradient(90deg,#42a5f5,#90caf9); }
  .sc-green::before  { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .sc-purple::before { background:linear-gradient(90deg,#ce93d8,#e040fb); }
  .sc-orange::before { background:linear-gradient(90deg,#ffa726,#ffcc02); }

  .sc-icon { width:44px; height:44px; border-radius:14px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; border:2px solid rgba(255,255,255,.9); box-shadow:0 3px 12px rgba(0,0,0,.09); }
  .sc-icon-blue   { background:linear-gradient(135deg,#bbdefb,#e3f2fd); }
  .sc-icon-green  { background:linear-gradient(135deg,#c8e6c9,#e8f5e9); }
  .sc-icon-purple { background:linear-gradient(135deg,#e1bee7,#f3e5f5); }
  .sc-icon-orange { background:linear-gradient(135deg,#ffe0b2,#fff8e1); }

  .sc-label { font-size:.7rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
  .sc-value { font-family:'Nunito',sans-serif; font-size:1.5rem; font-weight:900; color:#2d2d4e; margin-bottom:10px; }

  /* Health badge */
  .health-badge { display:inline-flex; align-items:center; gap:5px; border-radius:50px; padding:4px 11px; font-size:.7rem; font-weight:700; }
  .hb-good { background:rgba(232,245,233,.9); color:#2e7d32; border:1.5px solid rgba(165,214,167,.5); }

  /* Pulse dot */
  .pulse-dot { width:8px; height:8px; border-radius:50%; background:#66bb6a; animation:pulse 1.5s ease infinite; display:inline-block; }

  /* ── DB Summary card ── */
  .clay-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:28px; box-shadow:0 8px 28px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.95); animation:fadeUp .7s ease both; position:relative; overflow:hidden; margin-bottom:20px; }
  .clay-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:24px 24px 0 0; background:linear-gradient(90deg,#ef5350,#e040fb,#42a5f5); }
  .clay-section-title { font-family:'Nunito',sans-serif; font-size:1.1rem; font-weight:800; color:#2d2d4e; margin-bottom:20px; }

  .db-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  @media(max-width:700px){ .db-grid{grid-template-columns:repeat(2,1fr);} }

  .db-tile {
    background:rgba(255,255,255,.6); border:2px solid rgba(255,255,255,.85); border-radius:18px; padding:20px 16px;
    text-align:center; box-shadow:0 4px 14px rgba(0,0,0,.06);
    transition:transform .2s; cursor:default;
    position:relative; overflow:hidden;
  }
  .db-tile::before { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; border-radius:0 0 18px 18px; }
  .dt-1::before { background:linear-gradient(90deg,#42a5f5,#90caf9); }
  .dt-2::before { background:linear-gradient(90deg,#ffa726,#ffcc02); }
  .dt-3::before { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .dt-4::before { background:linear-gradient(90deg,#ce93d8,#e040fb); }
  .db-tile:hover { transform:translateY(-3px); }
  .db-emoji { font-size:1.8rem; margin-bottom:8px; }
  .db-value { font-family:'Nunito',sans-serif; font-size:2.2rem; font-weight:900; color:#2d2d4e; line-height:1; margin-bottom:5px; }
  .db-label { font-size:.72rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.4px; }

  .empty-state { text-align:center; padding:32px; color:#9a9ab0; }
`;

export default function AdminSystemMonitoring() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiAdminSystemStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sysCards = [
    { label:"Server Status", value: stats?.serverStatus || "Online", icon: Server,   iconCls:"sc-icon-blue",   cardCls:"sc-blue",   status:"good" },
    { label:"Database",      value: stats?.dbStatus     || "Online", icon: Database, iconCls:"sc-icon-green",  cardCls:"sc-green",  status:"good" },
    { label:"Total Users",   value: stats?.totalUsers   ?? "—",      icon: Users,    iconCls:"sc-icon-purple", cardCls:"sc-purple", status:null   },
    { label:"Total Bookings",value: stats?.totalBookings?? "—",      icon: Activity, iconCls:"sc-icon-orange", cardCls:"sc-orange", status:null   },
  ];

  const dbItems = [
    { emoji:"👥", label:"Total Users",    value: stats?.totalUsers    ?? 0, cls:"dt-1" },
    { emoji:"🏠", label:"Total PG Stays", value: stats?.totalPGs      ?? 0, cls:"dt-2" },
    { emoji:"📋", label:"Total Bookings", value: stats?.totalBookings ?? 0, cls:"dt-3" },
    { emoji:"⭐", label:"Total Feedback", value: stats?.totalFeedback ?? 0, cls:"dt-4" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="admin" />
        <main className="clay-main">
          <div className="clay-container">

            <h2 className="clay-page-title">📡 System Monitoring</h2>
            <p className="clay-page-sub">Real-time overview of system health, service status, and database metrics.</p>

            {/* System stat cards */}
            <div className="sys-grid">
              {sysCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <div key={i} className={`sys-card ${card.cardCls}`} style={{ animationDelay:`${i*.08}s` }}>
                    <div className={`sc-icon ${card.iconCls}`}>
                      <Icon size={20} color={card.cardCls === "sc-blue" ? "#1e88e5" : card.cardCls === "sc-green" ? "#43a047" : card.cardCls === "sc-purple" ? "#8e24aa" : "#fb8c00"} />
                    </div>
                    <div className="sc-label">{card.label}</div>
                    <div className="sc-value">{loading ? "…" : card.value}</div>
                    {card.status === "good" && (
                      <span className="health-badge hb-good">
                        <span className="pulse-dot" /> Healthy
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Database Summary */}
            <div className="clay-card">
              <div className="clay-section-title">🗄️ Database Summary</div>
              {loading ? (
                <div className="empty-state">⏳ Loading database metrics…</div>
              ) : (
                <div className="db-grid">
                  {dbItems.map((item) => (
                    <div key={item.label} className={`db-tile ${item.cls}`}>
                      <div className="db-emoji">{item.emoji}</div>
                      <div className="db-value">{item.value}</div>
                      <div className="db-label">{item.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </>
  );
}