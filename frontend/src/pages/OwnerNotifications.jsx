import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Clock, AlertCircle, ArrowLeft } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import Modal from "../components/Modal";
import { apiGetNotifications, apiMarkAllRead, apiMarkRead, apiVerifyPayment } from "../utils/api";
import { toast } from "../components/Toast";
import { CLAY_BASE, CLAY_OWNER, injectClay } from "../styles/claystyles";

const PAGE_CSS = `
  .page-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:28px; flex-wrap:wrap; }
  .unread-badge { background:rgba(255,235,238,.9); color:#c62828; border:1.5px solid rgba(239,154,154,.5); border-radius:50px; padding:4px 12px; font-size:.75rem; font-weight:700; }
  .mark-all-btn { padding:10px 20px; border:2px solid rgba(255,255,255,.9); border-radius:14px; cursor:pointer; background:rgba(255,255,255,.72); color:#5a5a7a; font-family:'Poppins',sans-serif; font-size:.82rem; font-weight:700; box-shadow:0 4px 0 rgba(0,0,0,.07); transition:transform .15s,box-shadow .15s; }
  .mark-all-btn:hover { transform:translateY(-2px); }

  .btn-view-doc {
    background:linear-gradient(135deg,#42a5f5,#1e88e5);
    color:white;
    padding:10px 16px;
    border:none;
    border-radius:14px;
    font-family:'Poppins',sans-serif;
    font-size:.85rem;
    font-weight:700;
    cursor:pointer;
    box-shadow:0 5px 0 #1565c0,0 8px 18px rgba(66,165,245,.35);
    transition:transform .15s,filter .15s;
    display:inline-flex;
    align-items:center;
    gap:8px;
  }
  .btn-view-doc:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }
  .btn-view-doc:disabled { opacity:.6; cursor:not-allowed; }

  .btn-mark-paid {
    background:linear-gradient(135deg,#66bb6a,#43a047);
    color:white;
    padding:10px 16px;
    border:none;
    border-radius:14px;
    font-family:'Poppins',sans-serif;
    font-size:.85rem;
    font-weight:700;
    cursor:pointer;
    box-shadow:0 5px 0 #2e7d32,0 8px 18px rgba(102,187,106,.35);
    transition:transform .15s,filter .15s;
    display:inline-flex;
    align-items:center;
    gap:8px;
  }
  .btn-mark-paid:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }
  .btn-mark-paid:disabled { opacity:.6; cursor:not-allowed; }

  .clay-card::before { background:linear-gradient(90deg,#ffa726,#e040fb,#66bb6a); }

  .notif-item { display:flex; gap:14px; align-items:flex-start; padding:15px 16px; border-radius:18px; margin-bottom:10px; border:2px solid rgba(255,255,255,.8); transition:transform .18s; position:relative; overflow:hidden; }
  .notif-item:hover { transform:translateX(5px); }
  .notif-read   { background:rgba(255,255,255,.4); }
  .notif-button { width:100%; border:none; background:transparent; padding:0; text-align:left; cursor:pointer; }
  .notif-unread { background:rgba(255,248,225,.75); border-color:rgba(255,224,130,.6); }
  .notif-unread::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; background:linear-gradient(180deg,#ffa726,#ffcc02); border-radius:18px 0 0 18px; }
  .notif-icon-wrap { width:40px; height:40px; border-radius:13px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.72); box-shadow:0 3px 10px rgba(0,0,0,.08); }
  .notif-message { font-size:.87rem; color:#2d2d4e; line-height:1.55; margin-bottom:4px; font-weight:500; }
  .notif-time    { font-size:.7rem; color:#9a9ab0; }
  .unread-dot { width:9px; height:9px; border-radius:50%; background:#ffa726; flex-shrink:0; margin-top:6px; box-shadow:0 0 0 3px rgba(255,167,38,.2); }

  .stats-strip { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:22px; }
  .strip-stat { background:rgba(255,255,255,.65); backdrop-filter:blur(14px); border:2px solid rgba(255,255,255,.85); border-radius:18px; padding:16px 18px; box-shadow:0 4px 16px rgba(0,0,0,.06),inset 0 1px 0 rgba(255,255,255,.95); text-align:center; animation:fadeUp .6s ease both; }
  .strip-label { font-size:.65rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
  .strip-value { font-family:'Nunito',sans-serif; font-size:1.8rem; font-weight:900; }
  .sv-orange{color:#e65100;} .sv-red{color:#c62828;} .sv-green{color:#2e7d32;}
`;

const css = injectClay(CLAY_BASE, CLAY_OWNER, PAGE_CSS);

export default function OwnerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState(null);
  const [markingRead, setMarkingRead] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

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
    if (type === "success") return <CheckCircle2 size={18} color="#43a047" />;
    if (type === "alert") return <AlertCircle size={18} color="#e53935" />;
    if (type === "application") return <Clock size={18} color="#ffa726" />;
    return <Bell size={18} color="#ffa726" />;
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

  const closeModal = () => {
    setSelectedNotification(null);
    setDocumentPreviewUrl(null);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedNotification?.booking) return toast.error("This notification is not linked to a booking.");
    setVerifyingPayment(true);

    try {
      await apiVerifyPayment(selectedNotification.booking, { verified: true });
      toast.success("Payment marked paid for tenant booking.");
      await fetchNotifs();
      closeModal();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setVerifyingPayment(false);
    }
  };

  const unread = notifications.filter((n) => !n.isRead).length;
  const total = notifications.length;
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
                <div className="strip-stat" style={{ animationDelay: "0s" }}>
                  <div className="strip-label">Total</div>
                  <div className="strip-value sv-orange">{total}</div>
                </div>
                <div className="strip-stat" style={{ animationDelay: ".08s" }}>
                  <div className="strip-label">Unread</div>
                  <div className="strip-value sv-red">{unread}</div>
                </div>
                <div className="strip-stat" style={{ animationDelay: ".16s" }}>
                  <div className="strip-label">Read</div>
                  <div className="strip-value sv-green">{readCnt}</div>
                </div>
              </div>
            )}

            {/* Notifications card */}
            <div className="clay-card clay-card-p" style={{ "--bar-bg": "linear-gradient(90deg,#ef5350,#e040fb,#42a5f5)" }}>
              <style>{`.clay-card::before{background:linear-gradient(90deg,#ef5350,#e040fb,#42a5f5);}`}</style>
              {loading ? (
                <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading notifications…</div>
              ) : notifications.length === 0 ? (
                <div className="clay-empty">
                  <span className="clay-empty-emoji">🔕</span>
                  No notifications yet.<br />
                  <span style={{ color: "#ffa726", fontWeight: 700 }}>You'll be notified when tenants apply!</span>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n._id}
                    className={`notif-button notif-item ${n.isRead ? "notif-read" : "notif-unread"}`}
                    onClick={() => handleOpenNotification(n)}
                  >
                    <div className="notif-icon-wrap">{getIcon(n.type)}</div>
                    <div style={{ flex: 1 }}>
                      <div className="notif-message">{n.message}</div>
                      <div className="notif-time">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    {!n.isRead && <div className="unread-dot" />}
                  </button>
                ))
              )}
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
          loading={markingRead || verifyingPayment}
        >
          {documentPreviewUrl ? (
            <>
              <button
                className="btn-approve"
                onClick={() => setDocumentPreviewUrl(null)}
                style={{ marginBottom: "10px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <ArrowLeft size={14} /> Back to Notification
              </button>
              <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
                <iframe
                  src={documentPreviewUrl}
                  title="Payment Proof Document"
                  width="100%"
                  height="400"
                  style={{ border: "none" }}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ marginTop: 4, lineHeight: 1.75, color: "#2d2d4e" }}>
                {selectedNotification.message}
              </div>

              {selectedNotification.documentUrl && (
                <div style={{ marginTop: 8, display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn-view-doc"
                    onClick={() => setDocumentPreviewUrl(selectedNotification.documentUrl)}
                  >
                    View Document
                  </button>

                  {selectedNotification.booking && (
                    <button
                      type="button"
                      className="btn-mark-paid"
                      onClick={handleMarkAsPaid}
                      disabled={verifyingPayment || markingRead}
                    >
                      <CheckCircle2 size={14} /> {verifyingPayment ? "Marking Paid…" : "Mark as Paid"}
                    </button>
                  )}
                </div>
              )}

              {!selectedNotification.documentUrl && selectedNotification.booking && (
                <div style={{ marginTop: 16, display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="btn-mark-paid"
                    onClick={handleMarkAsPaid}
                    disabled={verifyingPayment || markingRead}
                  >
                    <CheckCircle2 size={14} /> {verifyingPayment ? "Marking Paid…" : "Mark as Paid"}
                  </button>
                </div>
              )}

              <div style={{ marginTop: 18, fontSize: ".82rem", color: "#7a7a9a" }}>
                Type: {selectedNotification.type || "general"}
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}