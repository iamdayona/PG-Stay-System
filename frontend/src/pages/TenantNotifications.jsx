import { useEffect, useState } from "react";
import { Bell, CheckCircle2, AlertCircle, Star } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import {
  apiGetNotifications, apiMarkAllRead, apiSubmitFeedback,
  apiGetMyFeedback, apiGetMyApplications,
} from "../utils/api";

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
  .clay-container { max-width:1000px; margin:0 auto; }
  .clay-page-title { font-family:'Nunito',sans-serif; font-size:1.9rem; font-weight:900; color:#2d2d4e; margin-bottom:4px; }
  .clay-page-sub { color:#7a7a9a; font-size:.92rem; margin-bottom:28px; }

  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
  @media(max-width:760px){ .two-col{grid-template-columns:1fr;} }

  /* ── Clay card ── */
  .clay-card {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:28px;
    box-shadow:0 8px 28px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.95);
    animation:fadeUp .6s ease both; margin-bottom:20px;
  }
  .clay-section-title {
    font-family:'Nunito',sans-serif; font-size:1.05rem; font-weight:800; color:#2d2d4e;
    margin-bottom:16px; display:flex; align-items:center; gap:8px;
  }
  .section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .mark-read-btn {
    font-size:.75rem; font-weight:700; color:#42a5f5; background:none; border:none; cursor:pointer;
    padding:4px 10px; border-radius:8px; transition:background .15s;
  }
  .mark-read-btn:hover { background:rgba(66,165,245,.1); }
  .unread-count {
    display:inline-flex; align-items:center; background:rgba(255,235,238,.9); color:#c62828;
    border:1.5px solid rgba(239,154,154,.5); border-radius:50px; padding:2px 9px;
    font-size:.7rem; font-weight:700; margin-left:6px;
    box-shadow:0 2px 6px rgba(239,83,80,.15);
  }

  /* Notification item */
  .notif-item {
    display:flex; gap:12px; padding:13px 14px; border-radius:16px; margin-bottom:10px;
    border:1.5px solid rgba(255,255,255,.8); transition:transform .15s;
  }
  .notif-item:hover { transform:translateX(3px); }
  .notif-read   { background:rgba(255,255,255,.45); }
  .notif-unread { background:rgba(227,242,253,.7); border-color:rgba(144,202,249,.5); }
  .notif-icon {
    width:36px; height:36px; border-radius:11px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    background:rgba(255,255,255,.7); box-shadow:0 2px 8px rgba(0,0,0,.08);
  }
  .notif-message { font-size:.84rem; color:#2d2d4e; line-height:1.5; margin-bottom:3px; }
  .notif-time { font-size:.7rem; color:#9a9ab0; }

  /* ── Feedback form ── */
  .clay-label { display:block; font-size:.72rem; font-weight:700; color:#5a5a7a; margin-bottom:7px; letter-spacing:.4px; text-transform:uppercase; }
  .clay-select {
    width:100%; padding:11px 14px;
    background:rgba(255,255,255,.8); border:2px solid rgba(255,255,255,.9); border-radius:14px;
    font-family:'Poppins',sans-serif; font-size:.88rem; color:#2d2d4e; outline:none;
    box-shadow:0 3px 10px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.9);
  }
  .clay-textarea {
    width:100%; padding:11px 14px; min-height:90px; resize:vertical;
    background:rgba(255,255,255,.8); border:2px solid rgba(255,255,255,.9); border-radius:14px;
    font-family:'Poppins',sans-serif; font-size:.88rem; color:#2d2d4e; outline:none;
    box-shadow:0 3px 10px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.9);
    transition:border-color .2s, box-shadow .2s;
  }
  .clay-textarea:focus {
    border-color:rgba(66,165,245,.55);
    box-shadow:0 0 0 3px rgba(66,165,245,.12), inset 0 1px 0 rgba(255,255,255,.9);
  }
  .form-group { margin-bottom:16px; }

  /* Stars */
  .stars-row { display:flex; gap:6px; }
  .star-btn {
    background:none; border:none; cursor:pointer; padding:2px;
    transition:transform .15s; font-size:0;
  }
  .star-btn:hover { transform:scale(1.2); }
  .star-filled { color:#fdd835; fill:#fdd835; }
  .star-empty  { color:#ddd; fill:none; }
  .star-label  { font-size:.8rem; color:#7a7a9a; margin-top:5px; font-weight:500; }

  /* Submit btn */
  .clay-btn-blue {
    width:100%; padding:13px 20px; border:none; border-radius:14px;
    font-family:'Poppins',sans-serif; font-size:.9rem; font-weight:700; cursor:pointer;
    background:linear-gradient(135deg,#42a5f5,#1e88e5); color:white;
    box-shadow:0 5px 0 #1565c0, 0 8px 20px rgba(66,165,245,.35), inset 0 1px 0 rgba(255,255,255,.3);
    transition:transform .15s, box-shadow .15s, filter .15s;
  }
  .clay-btn-blue:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }
  .clay-btn-blue:active { transform:scale(.97) translateY(2px) !important; }
  .clay-btn-blue:disabled { opacity:.6; cursor:not-allowed; }

  /* Alert */
  .clay-alert { border-radius:14px; padding:11px 15px; margin-bottom:14px; font-size:.82rem; font-weight:500; display:flex; align-items:center; gap:8px; animation:fadeIn .3s ease; }
  .alert-success { background:rgba(232,245,233,.85); border:2px solid rgba(165,214,167,.5); color:#2e7d32; }
  .alert-error   { background:rgba(255,235,238,.85); border:2px solid rgba(239,154,154,.5); color:#c62828; }

  /* Past feedback */
  .feedback-item {
    padding:14px 16px; background:rgba(255,255,255,.55); border:1.5px solid rgba(255,255,255,.8);
    border-radius:16px; margin-bottom:10px; transition:transform .15s;
  }
  .feedback-item:hover { transform:translateX(3px); }
  .feedback-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px; }
  .feedback-pg { font-size:.88rem; font-weight:700; color:#2d2d4e; }
  .feedback-stars { display:flex; gap:2px; }
  .feedback-comment { font-size:.8rem; color:#7a7a9a; line-height:1.5; }
  .feedback-date { font-size:.7rem; color:#bbb; margin-top:4px; }

  .empty-state { text-align:center; padding:28px; color:#9a9ab0; font-size:.84rem; }
  .empty-emoji { font-size:2rem; margin-bottom:8px; display:block; }
`;

export default function TenantNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [myFeedback, setMyFeedback]       = useState([]);
  const [appliedPGs, setAppliedPGs]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [rating, setRating]               = useState(0);
  const [pgStayId, setPgStayId]           = useState("");
  const [comment, setComment]             = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [feedbackMsg, setFeedbackMsg]     = useState("");

  const fetchAll = async () => {
    try {
      const [notifRes, feedbackRes, appsRes] = await Promise.all([
        apiGetNotifications(), apiGetMyFeedback(), apiGetMyApplications(),
      ]);
      setNotifications(notifRes.data);
      setMyFeedback(feedbackRes.data);
      const approved = appsRes.data.filter((a) => a.status === "Approved");
      setAppliedPGs(approved);
      if (approved.length > 0) setPgStayId(approved[0].pgStay?._id || "");
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleMarkAll = async () => {
    try {
      await apiMarkAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) { alert(err.message); }
  };

  const handleFeedback = async () => {
    if (!rating || !pgStayId) { setFeedbackMsg("Please select a PG and a rating."); return; }
    setSubmitting(true); setFeedbackMsg("");
    try {
      await apiSubmitFeedback({ pgStayId, rating, comment });
      setFeedbackMsg("Feedback submitted successfully!");
      setRating(0); setComment("");
      await fetchAll();
    } catch (err) { setFeedbackMsg(err.message); }
    finally { setSubmitting(false); }
  };

  const getIcon = (type) => {
    if (type === "success") return <CheckCircle2 size={16} color="#43a047" />;
    if (type === "alert")   return <AlertCircle  size={16} color="#e53935" />;
    return <Bell size={16} color="#1e88e5" />;
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="tenant" />

        <main className="clay-main">
          <div className="clay-container">
            <h2 className="clay-page-title">🔔 Notifications & Feedback</h2>
            <p className="clay-page-sub">Stay updated and share your PG experience.</p>

            <div className="two-col">
              {/* Left — Notifications */}
              <div>
                <div className="clay-card">
                  <div className="section-header">
                    <div className="clay-section-title">
                      <Bell size={16} /> Notifications
                      {unread > 0 && <span className="unread-count">{unread}</span>}
                    </div>
                    {unread > 0 && (
                      <button className="mark-read-btn" onClick={handleMarkAll}>✓ Mark all read</button>
                    )}
                  </div>

                  {loading ? (
                    <div className="empty-state"><span className="empty-emoji">⏳</span>Loading…</div>
                  ) : notifications.length === 0 ? (
                    <div className="empty-state"><span className="empty-emoji">🔕</span>No notifications yet.</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n._id} className={`notif-item ${n.isRead ? "notif-read" : "notif-unread"}`}>
                        <div className="notif-icon">{getIcon(n.type)}</div>
                        <div>
                          <div className="notif-message">{n.message}</div>
                          <div className="notif-time">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right — Feedback */}
              <div>
                <div className="clay-card">
                  <div className="clay-section-title">⭐ Submit Feedback</div>

                  {feedbackMsg && (
                    <div className={`clay-alert ${feedbackMsg.includes("success") ? "alert-success" : "alert-error"}`}>
                      {feedbackMsg.includes("success") ? "✅" : "⚠️"} {feedbackMsg}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="clay-label">Rate your experience</label>
                    <div className="stars-row">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} className="star-btn" onClick={() => setRating(s)}>
                          <Star
                            size={30}
                            className={s <= rating ? "star-filled" : "star-empty"}
                            style={s <= rating ? { fill: "#fdd835", color: "#fdd835" } : { color: "#ddd" }}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && <div className="star-label">You rated {rating} out of 5 ⭐</div>}
                  </div>

                  <div className="form-group">
                    <label className="clay-label">Select PG</label>
                    {appliedPGs.length === 0 ? (
                      <div className="empty-state" style={{ padding: "12px 0" }}>No approved bookings yet.</div>
                    ) : (
                      <select className="clay-select" value={pgStayId} onChange={(e) => setPgStayId(e.target.value)}>
                        {appliedPGs.map((a) => (
                          <option key={a._id} value={a.pgStay?._id}>{a.pgStay?.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="clay-label">Your Feedback</label>
                    <textarea
                      className="clay-textarea"
                      rows={4}
                      placeholder="Share your experience with this PG…"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>

                  <button className="clay-btn-blue" onClick={handleFeedback} disabled={submitting || appliedPGs.length === 0}>
                    {submitting ? "⏳ Submitting…" : "Submit Feedback →"}
                  </button>
                </div>

                {/* Past Feedback */}
                {myFeedback.length > 0 && (
                  <div className="clay-card" style={{ animationDelay: ".2s" }}>
                    <div className="clay-section-title">📝 Your Past Feedback</div>
                    {myFeedback.map((fb) => (
                      <div key={fb._id} className="feedback-item">
                        <div className="feedback-header">
                          <span className="feedback-pg">{fb.pgStay?.name}</span>
                          <div className="feedback-stars">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={14}
                                style={s <= fb.rating ? { fill: "#fdd835", color: "#fdd835" } : { color: "#ddd" }} />
                            ))}
                          </div>
                        </div>
                        <div className="feedback-comment">{fb.comment}</div>
                        <div className="feedback-date">{new Date(fb.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}