import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetNotifications, apiMarkAllRead } from "../utils/api";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&family=Poppins:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  .clay-page {
    min-height:100vh;
    background:linear-gradient(135deg,#fff8e1 0%,#f3e5f5 30%,#e8f5e9 60%,#fff3e0 100%);
    font-family:'Poppins',sans-serif; position:relative; overflow-x:hidden;
  }
  .clay-page::before {
    content:''; position:fixed; width:520px; height:520px;
    background:radial-gradient(circle,rgba(255,224,130,.45) 0%,transparent 70%);
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
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}

  .clay-main { position:relative; z-index:1; padding:36px 24px; }
  .clay-container { max-width:800px; margin:0 auto; }

  .page-header {
    display:flex; align-items:center; justify-content:space-between; gap:16px;
    margin-bottom:28px; flex-wrap:wrap;
  }
  .clay-page-title { font-family:'Nunito',sans-serif; font-size:1.9rem; font-weight:900; color:#2d2d4e; display:flex; align-items:center; gap:12px; }
  .unread-badge {
    background:rgba(255,235,238,.9); color:#c62828; border:1.5px solid rgba(239,154,154,.5);
    border-radius:50px; padding:4px 12px; font-size:.75rem; font-weight:700;
    box-shadow:0 2px 8px rgba(239,83,80,.15);
  }

  .mark-all-btn {
    padding:10px 20px; border:none; border-radius:14px; cursor:pointer;
    background:rgba(255,255,255,.72); border:2px solid rgba(255,255,255,.9); color:#5a5a7a;
    font-family:'Poppins',sans-serif; font-size:.82rem; font-weight:700;
    box-shadow:0 4px 0 rgba(0,0,0,.07), 0 6px 16px rgba(0,0,0,.06);
    transition:transform .15s, box-shadow .15s;
  }
  .mark-all-btn:hover { transform:translateY(-2px); box-shadow:0 6px 0 rgba(0,0,0,.07), 0 10px 22px rgba(0,0,0,.08); }

  /* ── Main card ── */
  .clay-card {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:28px;
    box-shadow:0 8px 28px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.95);
    animation:fadeUp .6s ease both;
    position:relative; overflow:hidden;
  }
  .clay-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:24px 24px 0 0;
    background:linear-gradient(90deg,#ffa726,#e040fb,#66bb6a);
  }

  /* ── Notification items ── */
  .notif-item {
    display:flex; gap:14px; align-items:flex-start; padding:15px 16px;
    border-radius:18px; margin-bottom:10px; border:2px solid rgba(255,255,255,.8);
    transition:transform .18s, box-shadow .18s;
    position:relative; overflow:hidden;
  }
  .notif-item:hover { transform:translateX(5px); box-shadow:0 6px 20px rgba(0,0,0,.08); }
  .notif-read   { background:rgba(255,255,255,.4); }
  .notif-unread { background:rgba(255,248,225,.75); border-color:rgba(255,224,130,.6); }

  /* left accent on unread */
  .notif-unread::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; background:linear-gradient(180deg,#ffa726,#ffcc02); border-radius:18px 0 0 18px; }

  .notif-icon-wrap {
    width:40px; height:40px; border-radius:13px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    background:rgba(255,255,255,.72); box-shadow:0 3px 10px rgba(0,0,0,.08);
  }
  .notif-message { font-size:.87rem; color:#2d2d4e; line-height:1.55; margin-bottom:4px; font-weight:500; }
  .notif-time    { font-size:.7rem; color:#9a9ab0; }

  .unread-dot {
    width:9px; height:9px; border-radius:50%; background:#ffa726;
    flex-shrink:0; margin-top:6px;
    box-shadow:0 0 0 3px rgba(255,167,38,.2);
    animation:fadeIn .3s ease;
  }

  /* Empty / loading */
  .empty-state { text-align:center; padding:52px 24px; color:#9a9ab0; font-size:.9rem; }
  .empty-emoji { font-size:3rem; margin-bottom:12px; display:block; }

  /* Stats strip */
  .stats-strip {
    display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:22px;
  }
  .strip-stat {
    background:rgba(255,255,255,.65); backdrop-filter:blur(14px);
    border:2px solid rgba(255,255,255,.85); border-radius:18px; padding:16px 18px;
    box-shadow:0 4px 16px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.95);
    text-align:center; animation:fadeUp .6s ease both;
  }
  .strip-label { font-size:.65rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
  .strip-value { font-family:'Nunito',sans-serif; font-size:1.8rem; font-weight:900; }
  .sv-orange { color:#e65100; } .sv-red { color:#c62828; } .sv-green { color:#2e7d32; }
`;

export default function OwnerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await apiGetNotifications();
      setNotifications(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const handleMarkAll = async () => {
    try {
      await apiMarkAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) { alert(err.message); }
  };

  const getIcon = (type) => {
    if (type === "success")     return <CheckCircle2 size={18} color="#43a047" />;
    if (type === "alert")       return <AlertCircle  size={18} color="#e53935" />;
    if (type === "application") return <Clock        size={18} color="#ffa726" />;
    return <Bell size={18} color="#ffa726" />;
  };

  const unread  = notifications.filter((n) => !n.isRead).length;
  const total   = notifications.length;
  const readCnt = total - unread;

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="owner" />

        <main className="clay-main">
          <div className="clay-container">

            <div className="page-header">
              <div className="clay-page-title">
                🔔 Notifications
                {unread > 0 && <span className="unread-badge">{unread} unread</span>}
              </div>
              {unread > 0 && (
                <button className="mark-all-btn" onClick={handleMarkAll}>✓ Mark all as read</button>
              )}
            </div>

            {/* Stats strip */}
            {!loading && total > 0 && (
              <div className="stats-strip">
                <div className="strip-stat" style={{ animationDelay:"0s" }}>
                  <div className="strip-label">Total</div>
                  <div className="strip-value sv-orange">{total}</div>
                </div>
                <div className="strip-stat" style={{ animationDelay:".08s" }}>
                  <div className="strip-label">Unread</div>
                  <div className="strip-value sv-red">{unread}</div>
                </div>
                <div className="strip-stat" style={{ animationDelay:".16s" }}>
                  <div className="strip-label">Read</div>
                  <div className="strip-value sv-green">{readCnt}</div>
                </div>
              </div>
            )}

            {/* Notifications card */}
            <div className="clay-card">
              {loading ? (
                <div className="empty-state"><span className="empty-emoji">⏳</span>Loading notifications…</div>
              ) : notifications.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-emoji">🔕</span>
                  No notifications yet.<br/>
                  <span style={{ color:"#ffa726", fontWeight:700 }}>You'll be notified when tenants apply!</span>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className={`notif-item ${n.isRead ? "notif-read" : "notif-unread"}`}>
                    <div className="notif-icon-wrap">{getIcon(n.type)}</div>
                    <div style={{ flex:1 }}>
                      <div className="notif-message">{n.message}</div>
                      <div className="notif-time">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    {!n.isRead && <div className="unread-dot" />}
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