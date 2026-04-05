import { useEffect, useState } from "react";
import { Bell, CheckCircle2, AlertCircle, Star } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import Modal from "../components/Modal";
import {
  apiGetNotifications, apiMarkAllRead, apiSubmitFeedback,
  apiGetMyFeedback, apiGetMyBookings, apiMarkRead,
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
  .notif-button { width:100%; border:none; background:transparent; padding:0; text-align:left; cursor:pointer; }
  .notif-read   { background:rgba(255,255,255,.45); }
  .notif-unread { background:rgba(227,242,253,.7); border-color:rgba(144,202,249,.5); }
  .notif-icon   { width:36px; height:36px; border-radius:11px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.7); box-shadow:0 2px 8px rgba(0,0,0,.08); }
  .notif-message{ font-size:.84rem; color:#2d2d4e; line-height:1.5; margin-bottom:3px; }
  .notif-time   { font-size:.7rem; color:#9a9ab0; }

  /* ── Feedback form ── */
  .form-group { margin-bottom:16px; }
  .stars-row  { display:flex; gap:6px; }
  .star-btn   { background:none; border:none; cursor:pointer; padding:2px; transition:transform .15s; }
  .star-btn:hover { transform:scale(1.2); }
  .star-filled{ color:#fdd835; fill:#fdd835; }
  .star-empty { color:#ddd; fill:none; }
  .star-label { font-size:.8rem; color:#7a7a9a; margin-top:5px; font-weight:500; }

  /* ── Past feedback ── */
  .past-feedback-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:24px; box-shadow:0 8px 28px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95); margin-top:20px; position:relative; overflow:hidden; animation:fadeUp .6s ease both; }
  .past-feedback-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:24px 24px 0 0; background:linear-gradient(90deg,#42a5f5,#66bb6a,#e040fb); }

  .feedback-item { padding:14px 16px; background:rgba(255,255,255,.55); border:1.5px solid rgba(255,255,255,.8); border-radius:16px; margin-bottom:10px; transition:transform .15s; }
  .feedback-item:hover { transform:translateX(3px); }
  .feedback-item:last-child { margin-bottom:0; }
  .feedback-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px; }
  .feedback-pg      { font-size:.88rem; font-weight:700; color:#2d2d4e; }
  .feedback-stars   { display:flex; gap:2px; }
  .feedback-comment { font-size:.8rem; color:#7a7a9a; line-height:1.5; }
  .feedback-date    { font-size:.7rem; color:#bbb; margin-top:4px; }
`;

const css = injectClay(CLAY_BASE, CLAY_TENANT, PAGE_CSS);

export default function TenantNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [appliedPGs, setAppliedPGs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [pgStayId, setPgStayId] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [markingRead, setMarkingRead] = useState(false);

  const fetchAll = async () => {
    try {
      const [notifRes, feedbackRes, bookingsRes] = await Promise.all([
        apiGetNotifications(), apiGetMyFeedback(), apiGetMyBookings(),
      ]);
      // Only show real DB notifications — no dummy/static data
      setNotifications(notifRes.data || []);
      setMyFeedback(feedbackRes.data || []);
      // Only active bookings can receive feedback
      const activeBookings = (bookingsRes.data || []).filter((b) => b.status === "Active");
      setAppliedPGs(activeBookings);
      if (activeBookings.length > 0) setPgStayId(activeBookings[0].pgStay?._id || "");
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
    if (type === "alert") return <AlertCircle size={16} color="#e53935" />;
    return <Bell size={16} color="#1e88e5" />;
  };

  const handleOpenNotification = async (notification) => {
    setSelectedNotification(notification);
    if (!notification.isRead) {
      setMarkingRead(true);
      try {
        await apiMarkRead(notification._id);
        setNotifications((prev) => prev.map((n) =>
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
      } catch (err) {
        console.error(err);
      } finally {
        setMarkingRead(false);
      }
    }
  };

  const closeModal = () => setSelectedNotification(null);

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
              {/* ── Left: Notifications ── */}
              <div>
                <div className="clay-card clay-card-p">
                  <style>{`.clay-card::before{background:linear-gradient(90deg,#ef5350,#e040fb,#42a5f5);}`}</style>
                  <div className="section-header">
                    <div className="clay-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                      <button
                        key={n._id}
                        className={`notif-item notif-button ${n.isRead ? "notif-read" : "notif-unread"}`}
                        onClick={() => handleOpenNotification(n)}
                      >
                        <div className="notif-icon">{getIcon(n.type)}</div>
                        <div>
                          <div className="notif-message">{n.message}</div>
                          <div className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* ── Right: Feedback form ── */}
              <div>
                <div className="clay-card clay-card-p">
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
                      <div className="clay-empty" style={{ padding: "12px 0", fontSize: ".82rem" }}>
                        No approved bookings yet. You can leave feedback once your application is approved.
                      </div>
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

                {/* Past Feedback — properly placed as a separate full-width card below feedback form */}
                {myFeedback.length > 0 && (
                  <div className="past-feedback-card">
                    <div className="clay-section-title" style={{ marginBottom: 16 }}>📝 Your Past Feedback</div>
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
                        {fb.comment && <div className="feedback-comment">{fb.comment}</div>}
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
      {selectedNotification && (
        <Modal
          title="Notification details"
          subtitle={new Date(selectedNotification.createdAt).toLocaleDateString()}
          onClose={closeModal}
          onConfirm={closeModal}
          confirmLabel="Close"
          loading={markingRead}
        >
          <div style={{ marginTop: 12, lineHeight: 1.75, color: "#2d2d4e" }}>
            {selectedNotification.message}
          </div>
          <div style={{ marginTop: 18, fontSize: ".82rem", color: "#7a7a9a" }}>
            Type: {selectedNotification.type || "general"}
          </div>
        </Modal>
      )}
    </>
  );
}