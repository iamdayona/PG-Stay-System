import { useEffect, useState } from "react";
import { Bell, CheckCircle2, AlertCircle, Star } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import {
  apiGetNotifications, apiMarkAllRead, apiSubmitFeedback,
  apiGetMyFeedback, apiGetMyApplications,
} from "../utils/api";
import { CLAY_BASE, CLAY_TENANT, injectClay } from "../styles/claystyles";

const PAGE_CSS = `

  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
  @media(max-width:760px){ .two-col{grid-template-columns:1fr;} }

  .section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .mark-read-btn { font-size:.75rem; font-weight:700; color:#42a5f5; background:none; border:none; cursor:pointer; padding:4px 10px; border-radius:8px; transition:background .15s; }
  .mark-read-btn:hover { background:rgba(66,165,245,.1); }
  .unread-count { display:inline-flex; align-items:center; background:rgba(255,235,238,.9); color:#c62828; border:1.5px solid rgba(239,154,154,.5); border-radius:50px; padding:2px 9px; font-size:.7rem; font-weight:700; margin-left:6px; }

  .notif-item { display:flex; gap:12px; padding:13px 14px; border-radius:16px; margin-bottom:10px; border:1.5px solid rgba(255,255,255,.8); transition:transform .15s; }
  .notif-item:hover { transform:translateX(3px); }
  .notif-read   { background:rgba(255,255,255,.45); }
  .notif-unread { background:rgba(227,242,253,.7); border-color:rgba(144,202,249,.5); }
  .notif-icon   { width:36px; height:36px; border-radius:11px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.7); box-shadow:0 2px 8px rgba(0,0,0,.08); }
  .notif-message{ font-size:.84rem; color:#2d2d4e; line-height:1.5; margin-bottom:3px; }
  .notif-time   { font-size:.7rem; color:#9a9ab0; }

  .stars-row  { display:flex; gap:6px; }
  .star-btn   { background:none; border:none; cursor:pointer; padding:2px; transition:transform .15s; }
  .star-btn:hover { transform:scale(1.2); }
  .star-filled{ color:#fdd835; fill:#fdd835; }
  .star-empty { color:#ddd; fill:none; }
  .star-label { font-size:.8rem; color:#7a7a9a; margin-top:5px; font-weight:500; }

  .feedback-item { padding:14px 16px; background:rgba(255,255,255,.55); border:1.5px solid rgba(255,255,255,.8); border-radius:16px; margin-bottom:10px; transition:transform .15s; }
  .feedback-item:hover { transform:translateX(3px); }
  .feedback-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px; }
  .feedback-pg      { font-size:.88rem; font-weight:700; color:#2d2d4e; }
  .feedback-stars   { display:flex; gap:2px; }
  .feedback-comment { font-size:.8rem; color:#7a7a9a; line-height:1.5; }
  .feedback-date    { font-size:.7rem; color:#bbb; margin-top:4px; }

`;

const css = injectClay(CLAY_BASE, CLAY_TENANT, PAGE_CSS);

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
            <div className="clay-card clay-card-p" style={{ "--bar-bg":"linear-gradient(90deg,#ef5350,#e040fb,#42a5f5)" }}>
              <style>{`.clay-card::before{background:linear-gradient(90deg,#ef5350,#e040fb,#42a5f5);}`}</style>
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
                    <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading…</div>
                  ) : notifications.length === 0 ? (
                    <div className="clay-empty"><span className="clay-empty-emoji">🔕</span>No notifications yet.</div>
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
            <div className="clay-card clay-card-p" style={{ "--bar-bg":"linear-gradient(90deg,#ef5350,#e040fb,#42a5f5)" }}>
              <style>{`.clay-card::before{background:linear-gradient(90deg,#ef5350,#e040fb,#42a5f5);}`}</style>
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
                      <div className="clay-empty" style={{ padding: "12px 0" }}>No approved bookings yet.</div>
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

                  <button className="clay-btn clay-btn-blue" onClick={handleFeedback} disabled={submitting || appliedPGs.length === 0}>
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