import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Trash2 } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetOwnerApplications, apiApproveApplication, apiRejectApplication, apiGetOwnerBookings, apiOwnerCancelBooking, apiVerifyPayment } from "../utils/api";
import { toast } from "../components/Toast";
import { CLAY_BASE, CLAY_OWNER, injectClay } from "../styles/claystyles";

const PAGE_CSS = `
  .app-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:28px; box-shadow:0 8px 28px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95); margin-bottom:22px; animation:fadeUp .6s ease both; transition:transform .22s,box-shadow .22s; position:relative; overflow:hidden; }
  .app-card:hover { transform:translateY(-3px); box-shadow:0 16px 40px rgba(0,0,0,.11); }
  .app-card::before { content:''; position:absolute; top:0; left:0; bottom:0; width:5px; border-radius:24px 0 0 24px; }
  .app-card.card-pending::before  { background:linear-gradient(180deg,#ffe082,#ffd54f); }
  .app-card.card-approved::before { background:linear-gradient(180deg,#66bb6a,#a5d6a7); }
  .app-card.card-rejected::before { background:linear-gradient(180deg,#ef9a9a,#e57373); }
  .app-card.card-booked::before   { background:linear-gradient(180deg,#42a5f5,#1e88e5); }

  .app-header  { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:16px; }
  .tenant-name { font-family:'Nunito',sans-serif; font-size:1.3rem; font-weight:900; color:#2d2d4e; margin-bottom:4px; }
  .app-detail  { font-size:.82rem; color:#7a7a9a; margin-bottom:2px; }

  .trust-score  { text-align:center; padding:12px 20px; background:rgba(255,255,255,.7); border:2px solid rgba(255,255,255,.9); border-radius:16px; box-shadow:0 3px 12px rgba(0,0,0,.07); flex-shrink:0; }
  .trust-label  { font-size:.65rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; }
  .trust-value  { font-family:'Nunito',sans-serif; font-size:1.8rem; font-weight:900; line-height:1; }
  .trust-high{color:#2e7d32;} .trust-mid{color:#f57f17;} .trust-low{color:#c62828;}

  .app-footer { border-top:2px solid rgba(255,255,255,.7); padding-top:16px; margin-top:4px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }

  .status-chip { display:inline-flex; align-items:center; gap:6px; border-radius:50px; padding:6px 16px; font-size:.78rem; font-weight:700; border:1.5px solid rgba(255,255,255,.85); box-shadow:0 2px 8px rgba(0,0,0,.07); }
  .chip-pending  { background:rgba(255,249,196,.9); color:#f57f17; border-color:rgba(255,224,130,.6); }
  .chip-approved { background:rgba(232,245,233,.9); color:#2e7d32; border-color:rgba(165,214,167,.6); }
  .chip-rejected { background:rgba(255,235,238,.9); color:#c62828; border-color:rgba(239,154,154,.6); }
  .chip-booked   { background:rgba(227,242,253,.9); color:#1565c0; border-color:rgba(144,202,249,.6); }

  .action-btns { display:flex; gap:10px; }
  .btn-approve { background:linear-gradient(135deg,#66bb6a,#43a047); color:white; padding:11px 22px; border:none; border-radius:14px; font-family:'Poppins',sans-serif; font-size:.85rem; font-weight:700; cursor:pointer; box-shadow:0 5px 0 #2e7d32,0 8px 18px rgba(102,187,106,.35); transition:transform .15s,filter .15s; display:inline-flex; align-items:center; gap:7px; }
  .btn-approve:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }
  .btn-approve:disabled { opacity:.6; cursor:not-allowed; }
  .btn-reject  { background:linear-gradient(135deg,#ef9a9a,#e53935); color:white; padding:11px 22px; border:none; border-radius:14px; font-family:'Poppins',sans-serif; font-size:.85rem; font-weight:700; cursor:pointer; box-shadow:0 5px 0 #b71c1c,0 8px 18px rgba(239,83,80,.3); transition:transform .15s,filter .15s; display:inline-flex; align-items:center; gap:7px; }
  .btn-reject:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }
  .btn-reject:disabled { opacity:.6; cursor:not-allowed; }

  .btn-cancel { background:linear-gradient(135deg,#ef9a9a,#e53935); color:white; padding:10px 18px; border:none; border-radius:12px; font-family:'Poppins',sans-serif; font-size:.80rem; font-weight:700; cursor:pointer; box-shadow:0 5px 0 #b71c1c,0 8px 14px rgba(239,83,80,.3); transition:transform .15s,filter .15s,opacity .15s; display:inline-flex; align-items:center; gap:6px; }
  .btn-cancel:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }
  .btn-cancel:disabled { opacity:.5; cursor:not-allowed; }

  .cancel-info { display:flex; align-items:center; gap:8px; padding:10px 14px; background:rgba(255,235,238,.75); border:1.5px solid rgba(239,154,154,.4); border-radius:12px; font-size:.78rem; color:#c62828; font-weight:600; }

  .approved-notice { display:flex; align-items:center; gap:8px; padding:12px 16px; background:rgba(232,245,233,.85); border:2px solid rgba(165,214,167,.5); border-radius:14px; font-size:.83rem; color:#2e7d32; font-weight:600; }

  .section-title { font-family:'Nunito',sans-serif; font-size:1.2rem; font-weight:800; color:#2d2d4e; margin-top:32px; margin-bottom:16px; }
`;

const css = injectClay(CLAY_BASE, CLAY_OWNER, PAGE_CSS);

export default function OwnerApplications() {
  const [applications, setApplications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const fetchData = async () => {
    try {
      const [appsRes, bookingsRes] = await Promise.all([
        apiGetOwnerApplications(),
        apiGetOwnerBookings()
      ]);
      setApplications(appsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id, tenantName) => {
    setActionLoading(id + "approve");
    try {
      await apiApproveApplication(id);
      toast.success(`Application approved for ${tenantName}!.`);
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleReject = async (id, tenantName) => {
    setActionLoading(id + "reject");
    try {
      await apiRejectApplication(id);
      toast.info(`Application from ${tenantName} has been rejected.`);
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleCancelBooking = async (bookingId, tenantName) => {
    setActionLoading(bookingId + "cancel");
    try {
      await apiOwnerCancelBooking(bookingId);
      toast.success(`Booking for ${tenantName} has been cancelled.`);
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleVerifyPayment = async (bookingId, tenantName, verified) => {
    setActionLoading(bookingId + (verified ? "verify" : "reject"));
    try {
      await apiVerifyPayment(bookingId, { verified });
      toast.success(`Payment ${verified ? "verified" : "rejected"} for ${tenantName}.`);
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const getTrustClass = (score) => score >= 85 ? "trust-high" : score >= 70 ? "trust-mid" : "trust-low";
  const getCardClass = (s) => s === "Approved" ? "card-approved" : s === "Rejected" ? "card-rejected" : "card-pending";
  const getChipClass = (s) => s === "Approved" ? "chip-approved" : s === "Rejected" ? "chip-rejected" : "chip-pending";

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="owner" />
        <main className="clay-main">
          <div className="clay-container">
            <h2 className="clay-page-title">📋 Applications Received</h2>
            <p className="clay-page-sub">Review tenant applications and approve or reject them.</p>

            {loading ? (
              <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading…</div>
            ) : applications.length === 0 ? (
              <div className="clay-empty">
                <span className="clay-empty-emoji">📭</span>
                No applications received yet.<br />
                <span style={{ color: "#ffa726", fontWeight: 700 }}>Applications will appear here once tenants apply!</span>
              </div>
            ) : (
              applications.map((app, i) => (
                <div key={app._id} className={`app-card ${getCardClass(app.status)}`} style={{ animationDelay: `${i * .08}s` }}>
                  <div className="app-header">
                    <div>
                      <div className="tenant-name">👤 {app.tenant?.name}</div>
                      <div className="app-detail">🏠 {app.pgStay?.name} — {app.room?.roomType}</div>
                      <div className="app-detail">📅 Applied: {new Date(app.appliedDate).toLocaleDateString()}</div>
                      <div className="app-detail">💰 Rent: ₹{app.rentAmount}/month</div>
                    </div>
                    <div className="trust-score">
                      <div className="trust-label">Trust Score</div>
                      <div className={`trust-value ${getTrustClass(app.tenant?.trustScore)}`}>
                        {app.tenant?.trustScore ?? "—"}
                      </div>
                      <div style={{ fontSize: ".65rem", color: "#bbb", marginTop: 2 }}>/100</div>
                    </div>
                  </div>

                  <div className="app-footer">
                    <span className={`status-chip ${getChipClass(app.status)}`}>
                      {app.status === "Approved" ? "✓" : app.status === "Rejected" ? "✗" : "⏳"} {app.status}
                    </span>

                    {app.status === "Pending" && (
                      <div className="action-btns">
                        <button
                          className="clay-btn btn-approve"
                          onClick={() => handleApprove(app._id, app.tenant?.name)}
                          disabled={!!actionLoading}
                        >
                          <CheckCircle2 size={15} />
                          {actionLoading === app._id + "approve" ? "Approving…" : "Approve"}
                        </button>
                        <button
                          className="clay-btn btn-reject"
                          onClick={() => handleReject(app._id, app.tenant?.name)}
                          disabled={!!actionLoading}
                        >
                          <XCircle size={15} />
                          {actionLoading === app._id + "reject" ? "Rejecting…" : "Reject"}
                        </button>
                      </div>
                    )}

                    {app.status === "Approved" && (
                      <div className="approved-notice">
                        <CheckCircle2 size={16} /> The application of the tenant {app.tenant?.name} is approved.
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Bookings Section */}
            {bookings.length > 0 && (
              <>
                <div style={{ marginTop: "40px" }}>
                  <h3 className="section-title">🏠 Active Bookings</h3>
                  <p style={{ color: "#7a7a9a", fontSize: ".9rem", marginBottom: "20px" }}>
                    Manage active tenant bookings. You can cancel a booking after 2 days from the tenant's join date.
                  </p>

                  {bookings.map((booking, i) => (
                    <div key={booking._id} className="app-card card-booked" style={{ animationDelay: `${i * .08}s` }}>
                      <div className="app-header">
                        <div>
                          <div className="tenant-name">👤 {booking.tenant?.name}</div>
                          <div className="app-detail">🏠 {booking.pgStay?.name} — {booking.room?.roomType}</div>
                          <div className="app-detail">📅 Join Date: {new Date(booking.agreementStartDate || booking.allocationDate).toLocaleDateString()}</div>
                          <div className="app-detail">💰 Rent: ₹{booking.rentAmount}/month</div>
                          <div className="app-detail" style={{ marginTop: "6px" }}>
                            {booking.canCancel ? (
                              <span style={{ color: "#2e7d32", fontWeight: 600 }}>✓ Can be cancelled (2+ days elapsed)</span>
                            ) : (
                              <span style={{ color: "#f57f17", fontWeight: 600 }}>⏳ Can cancel in {booking.daysRemaining} day(s)</span>
                            )}
                          </div>
                        </div>
                        <div className="trust-score">
                          <div className="trust-label">Trust Score</div>
                          <div className={`trust-value ${getTrustClass(booking.tenant?.trustScore)}`}>
                            {booking.tenant?.trustScore ?? "—"}
                          </div>
                          <div style={{ fontSize: ".65rem", color: "#bbb", marginTop: 2 }}>/100</div>
                        </div>
                      </div>

                      <div className="app-footer">
                        <div>
                          <span className="status-chip chip-booked">✓ Active Booking</span>
                          <span className="status-chip" style={{ marginLeft: 8 }}>
                            {booking.paymentStatus === "paid" ? "Paid" : booking.paymentStatus === "pending" ? "Pending" : booking.paymentStatus === "due" ? "Due" : booking.paymentStatus === "overdue" ? "Overdue" : "Unpaid"}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {booking.paymentProof?.url && (
                            <a
                              href={booking.paymentProof.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-approve"
                              style={{ padding: "8px 14px", fontSize: ".78rem" }}
                            >
                              View Proof
                            </a>
                          )}

                          {booking.paymentStatus === "pending" && (
                            <>
                              <button
                                className="btn-approve"
                                onClick={() => handleVerifyPayment(booking._id, booking.tenant?.name, true)}
                                disabled={actionLoading === booking._id + "verify"}
                              >
                                <CheckCircle2 size={14} /> {actionLoading === booking._id + "verify" ? "Verifying…" : "Verify"}
                              </button>
                              <button
                                className="btn-reject"
                                onClick={() => handleVerifyPayment(booking._id, booking.tenant?.name, false)}
                                disabled={actionLoading === booking._id + "reject"}
                              >
                                <XCircle size={14} /> {actionLoading === booking._id + "reject" ? "Rejecting…" : "Reject"}
                              </button>
                            </>
                          )}

                          {booking.canCancel ? (
                            <button
                              className="btn-cancel"
                              onClick={() => handleCancelBooking(booking._id, booking.tenant?.name)}
                              disabled={actionLoading === booking._id + "cancel"}
                            >
                              <Trash2 size={14} />
                              {actionLoading === booking._id + "cancel" ? "Cancelling…" : "Cancel Booking"}
                            </button>
                          ) : (
                            <div className="cancel-info">
                              ⏳ Can cancel after {booking.daysRemaining} days (Policy: 2 days from join date)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
