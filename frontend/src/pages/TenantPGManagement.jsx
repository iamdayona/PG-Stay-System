import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Send, Calendar, XCircle, Info } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import {
  apiGetMyApplications,
  apiGetMyBookings,
  apiCreateBooking,
  apiDeclineBooking,
  apiCancelBooking,
  apiSubmitComplaint,
  apiGetMyComplaints,
  apiUploadPaymentProof,
  apiGetPGRoommates,
  getUser,
} from "../utils/api";
import { toast } from "../components/Toast";
import { CLAY_BASE, CLAY_TENANT, injectClay } from "../styles/claystyles";

const PAGE_CSS = `
  .grid-two { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:24px; }
  @media(max-width:860px){ .grid-two{grid-template-columns:1fr;} }
  .book-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2px solid rgba(255,255,255,.85); border-radius:24px; padding:24px; box-shadow:0 8px 28px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95); margin-bottom:24px; }
  .section-title { font-size:1rem; font-weight:800; color:#2d2d4e; margin-bottom:12px; }
  .info-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
  .info-card { background:rgba(241,248,255,.85); border:1px solid rgba(66,165,245,.2); border-radius:18px; padding:16px; }
  .info-label { font-size:.75rem; color:#7a7a9a; margin-bottom:6px; text-transform:uppercase; letter-spacing:.5px; }
  .info-value { font-size:.95rem; font-weight:700; color:#2d2d4e; }
  .btn-row { display:flex; flex-wrap:wrap; gap:12px; margin-top:14px; }
  .btn-action { cursor:pointer; border:none; border-radius:16px; font-size:.92rem; font-weight:700; padding:11px 18px; transition:transform .15s,filter .15s; display:inline-flex; align-items:center; gap:7px; }
  .btn-book { background:linear-gradient(135deg,#43a047,#66bb6a); color:white; }
  .btn-decline { background:linear-gradient(135deg,#ef5350,#f06257); color:white; }
  .btn-upload { background:linear-gradient(135deg,#42a5f5,#1e88e5); color:white; }
  .btn-pay { background:linear-gradient(135deg,#ffb300,#ffa000); color:white; }
  .btn-send { background:linear-gradient(135deg,#8e24aa,#d81b60); color:white; }
  .btn-action:hover { transform:translateY(-1px); }
  .btn-action:disabled { opacity:.55; cursor:not-allowed; transform:none; }
  .status-pill { display:inline-flex; align-items:center; gap:8px; padding:8px 14px; border-radius:999px; font-size:.82rem; font-weight:700; }
  .status-active { background:rgba(232,245,233,.95); color:#2e7d32; }
  .status-unpaid { background:rgba(255,249,196,.95); color:#f57f17; }
  .status-overdue { background:rgba(255,235,238,.95); color:#c62828; }
  .complaint-panel { background:rgba(255,255,255,.68); border:1px solid rgba(255,235,238,.9); border-radius:22px; padding:20px; margin-top:20px; }
  .complaint-input { width:100%; min-height:120px; border:1px solid rgba(166,166,188,.6); border-radius:14px; padding:14px; font-size:.92rem; color:#333; background:#fff; resize:vertical; }
  .card-note { font-size:.84rem; color:#7a7a9a; margin-top:10px; }
  .file-row { display:flex; align-items:center; gap:12px; margin-top:14px; }
  .file-label { font-size:.9rem; font-weight:700; color:#2d2d4e; }
  .tickets-list { margin-top:14px; }
  .ticket-card { background:rgba(255,255,255,.9); border:1px solid rgba(66,165,245,.15); border-radius:18px; padding:16px; margin-bottom:12px; }
  .ticket-meta { font-size:.78rem; color:#7a7a9a; margin-top:10px; }
  .occupants-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-top:16px; }
  .occupant-card { background:rgba(255,255,255,.9); border:2px solid rgba(255,255,255,.85); border-radius:18px; padding:18px; display:flex; flex-direction:column; gap:12px; box-shadow:0 4px 14px rgba(0,0,0,.06); transition:transform .2s; }
  .occupant-card:hover { transform:translateY(-2px); }
  .occupant-card.you-card { border:2.5px solid rgba(66,165,245,.6); background:linear-gradient(135deg,rgba(227,242,253,.8),rgba(255,255,255,.9)); }
  .occupant-avatar { width:60px; height:60px; border-radius:50%; overflow:hidden; background:rgba(200,200,220,.2); display:flex; align-items:center; justify-content:center; font-size:1.8rem; font-weight:700; color:#2d2d4e; flex-shrink:0; }
  .occupant-avatar img { width:100%; height:100%; object-fit:cover; }
  .occupant-info { display:flex; flex-direction:column; gap:8px; }
  .occupant-name { font-size:.95rem; font-weight:700; color:#2d2d4e; display:flex; align-items:center; gap:6px; }
  .occupant-badge { display:inline-flex; align-items:center; gap:4px; background:rgba(66,165,245,.15); color:#1565c0; border:1px solid rgba(66,165,245,.3); border-radius:50px; padding:3px 10px; font-size:.72rem; font-weight:700; width:fit-content; }
  .occupant-bio { font-size:.82rem; color:#7a7a9a; line-height:1.4; }
  .occupants-empty { text-align:center; padding:24px; color:#9a9ab0; font-size:.88rem; }
  /* Approved apps list */
  .app-list { display:flex; flex-direction:column; gap:14px; margin-top:16px; }
  .app-item { background:rgba(241,248,255,.9); border:1.5px solid rgba(66,165,245,.25); border-radius:18px; padding:18px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
  .app-item.selected { border-color:#43a047; background:rgba(232,245,233,.9); }
  .app-item-info { flex:1; min-width:180px; }
  .app-item-name { font-size:.95rem; font-weight:800; color:#2d2d4e; margin-bottom:4px; }
  .app-item-meta { font-size:.8rem; color:#7a7a9a; }
  .app-item-actions { display:flex; gap:10px; flex-wrap:wrap; }
  .capacity-badge { display:inline-block; font-size:.72rem; font-weight:700; padding:3px 10px; border-radius:50px; background:rgba(255,243,224,.9); color:#e65100; border:1px solid rgba(255,152,0,.3); margin-left:8px; }
  .alert-box { background:rgba(255,243,224,.95); border:1.5px solid rgba(255,152,0,.4); border-radius:18px; padding:16px 20px; margin-bottom:18px; display:flex; gap:12px; align-items:flex-start; }
  .alert-box-text { font-size:.88rem; color:#b26200; line-height:1.5; }
`;

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");

const apiUpdateAgreementDates = (bookingId, body) => {
  const token = getToken();
  return fetch(`${BASE_URL}/bookings/${bookingId}/agreement`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Update failed");
    return data;
  });
};

const css = injectClay(CLAY_BASE, CLAY_TENANT, PAGE_CSS);

export default function TenantPGManagement() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const paymentProofInputRef = useRef(null);
  const [actionLoading, setActionLoading] = useState("");
  const [agreementStart, setAgreementStart] = useState("");
  const [agreementEnd, setAgreementEnd] = useState("");
  const [occupants, setOccupants] = useState([]);
  const [occupantsLoading, setOccupantsLoading] = useState(false);
  const currentUser = getUser();

  const fetchData = async () => {
    try {
      const [appsRes, bookingsRes, complaintsRes] = await Promise.all([
        apiGetMyApplications(),
        apiGetMyBookings(),
        apiGetMyComplaints(),
      ]);
      setApplications(appsRes.data);
      setBookings(bookingsRes.data);
      setComplaints(complaintsRes.data);
      // Auto-select first approved app if nothing selected
      const approvedApps = appsRes.data.filter((a) => a.status === "Approved");
      if (approvedApps.length > 0) setSelectedApplicationId((prev) => prev || approvedApps[0]._id);
      if (bookingsRes.data?.[0]) {
        setAgreementStart(bookingsRes.data[0].agreementStartDate?.split("T")[0] || "");
        setAgreementEnd(bookingsRes.data[0].agreementEndDate?.split("T")[0] || "");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const approvedApplications = applications.filter((app) => app.status === "Approved");
  const activeBooking = bookings[0] ?? null;

  const fetchOccupants = async (pgId) => {
    if (!pgId) return;
    setOccupantsLoading(true);
    try {
      const res = await apiGetPGRoommates(pgId);
      const allOccupants = (res?.data || [])
        .flatMap((item) => item?.tenants || [])
        .filter((t) => t != null);
      setOccupants(allOccupants);
    } catch (err) {
      setOccupants([]);
    } finally {
      setOccupantsLoading(false);
    }
  };

  useEffect(() => {
    if (activeBooking?.pgStay?._id) fetchOccupants(activeBooking.pgStay._id);
    else setOccupants([]);
  }, [activeBooking?.pgStay?._id]);

  useEffect(() => {
    if (activeBooking?.paymentStatus === "paid") {
      setPaymentProofFile(null);
      if (paymentProofInputRef.current) paymentProofInputRef.current.value = "";
    }
  }, [activeBooking?.paymentStatus]);

  const handleBook = async (appId) => {
    const targetId = appId || selectedApplicationId;
    if (!targetId) return toast.error("Select an approved application to book.");
    setActionLoading(`book-${targetId}`);
    try {
      await apiCreateBooking({ applicationId: targetId });
      toast.success("Booking confirmed! Other approved applications have been auto-rejected.");
      await fetchData();
    } catch (err) {
      toast.error(err.message);
      await fetchData(); // refresh in case auto-rejection happened
    } finally {
      setActionLoading("");
    }
  };

  const handleDecline = async (appId) => {
    const targetId = appId || selectedApplicationId;
    if (!targetId) return toast.error("Select an approved application to decline.");
    setActionLoading(`decline-${targetId}`);
    try {
      await apiDeclineBooking({ applicationId: targetId });
      toast.info("Application declined. You can search for another PG.");
      await fetchData();
      if (approvedApplications.length <= 1) navigate("/tenant/findpgs");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleUploadPaymentProof = async () => {
    if (!activeBooking) return toast.error("No active booking found.");
    if (!paymentProofFile) return toast.error("Please select a payment proof file.");
    setActionLoading("paymentProof");
    try {
      const formData = new FormData();
      formData.append("proof", paymentProofFile);
      await apiUploadPaymentProof(activeBooking._id, formData);
      toast.success("Payment proof uploaded. Waiting for owner verification.");
      setPaymentProofFile(null);
      if (paymentProofInputRef.current) paymentProofInputRef.current.value = "";
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleCancelBooking = async () => {
    if (!activeBooking) return toast.error("No active booking found.");
    setActionLoading("cancel");
    try {
      await apiCancelBooking(activeBooking._id);
      toast.success("Booking cancelled. You may book another PG.");
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleSaveAgreementDates = async () => {
    if (!activeBooking) return toast.error("No active booking found.");
    if (activeBooking.agreementStartDate || activeBooking.agreementEndDate)
      return toast.info("Agreement dates are finalized and cannot be changed.");
    if (!agreementStart || !agreementEnd)
      return toast.error("Please enter both agreement start and end dates.");
    if (new Date(agreementStart) >= new Date(agreementEnd))
      return toast.error("Agreement start date must be before end date.");
    setActionLoading("agreement");
    try {
      await apiUpdateAgreementDates(activeBooking._id, {
        agreementStartDate: agreementStart,
        agreementEndDate: agreementEnd,
      });
      toast.success("Agreement dates saved successfully.");
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleSubmitComplaint = async () => {
    if (!activeBooking) return toast.error("You can only file a complaint for an active booking.");
    if (!complaintText.trim()) return toast.error("Please describe your issue.");
    setActionLoading("complaint");
    try {
      await apiSubmitComplaint({ pgStayId: activeBooking.pgStay._id, issue: complaintText.trim() });
      toast.success("Complaint filed. The owner will be notified.");
      setComplaintText("");
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const statusLabel = (status) => {
    if (status === "paid") return "Paid";
    if (status === "pending") return "Verification Pending";
    if (status === "due") return "Due";
    if (status === "overdue") return "Overdue";
    return "Unpaid";
  };

  const roomSlotsLabel = (app) => {
    const room = app.room;
    if (!room) return null;
    const remaining = (room.capacity || 1) - (room.currentOccupancy || 0);
    return `${remaining} slot${remaining !== 1 ? "s" : ""} left`;
  };

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="tenant" />
        <main className="clay-main">
          <div className="clay-container">
            <h2 className="clay-page-title">🏠 PG Stay Management</h2>
            <p className="clay-page-sub">
              Book your approved PG, upload agreements, track payments, and raise complaints.
            </p>

            {loading ? (
              <div className="clay-empty">
                <span className="clay-empty-emoji">⏳</span>Loading your PG stay details…
              </div>
            ) : (
              <>
                {!activeBooking && approvedApplications.length === 0 ? (
                  <div className="clay-empty">
                    <span className="clay-empty-emoji">📭</span>
                    No approved applications yet.
                    <br />
                    <span style={{ color: "#42a5f5", fontWeight: 700 }}>
                      Search PGs and apply to start your stay.
                    </span>
                  </div>
                ) : (
                  <>
                    {/* ── Active Booking ─────────────────────────────────── */}
                    {activeBooking ? (
                      <>
                        <div className="book-card">
                          <div className="section-title">✅ Active Booking</div>
                          <div className="info-row">
                            <div className="info-card">
                              <div className="info-label">PG Name</div>
                              <div className="info-value">{activeBooking.pgStay?.name}</div>
                            </div>
                            <div className="info-card">
                              <div className="info-label">Room</div>
                              <div className="info-value">{activeBooking.room?.roomType}</div>
                            </div>
                          </div>
                          <div className="info-row">
                            <div className="info-card">
                              <div className="info-label">Payment Status</div>
                              <div className={`info-value status-${activeBooking.paymentStatus}`}>
                                {statusLabel(activeBooking.paymentStatus)}
                              </div>
                            </div>
                            <div className="info-card">
                              <div className="info-label">Booking Date</div>
                              <div className="info-value">
                                {new Date(activeBooking.allocationDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="info-row">
                            <div className="info-card">
                              <div className="info-label">Agreement Start</div>
                              <div className="info-value">
                                {activeBooking.agreementStartDate
                                  ? new Date(activeBooking.agreementStartDate).toLocaleDateString()
                                  : "Not set"}
                              </div>
                            </div>
                            <div className="info-card">
                              <div className="info-label">Agreement End</div>
                              <div className="info-value">
                                {activeBooking.agreementEndDate
                                  ? new Date(activeBooking.agreementEndDate).toLocaleDateString()
                                  : "Not set"}
                              </div>
                            </div>
                          </div>
                          <div className="btn-row">
                            <button
                              className="btn-action btn-decline"
                              disabled={actionLoading === "cancel"}
                              onClick={handleCancelBooking}
                            >
                              <AlertTriangle size={16} />
                              {actionLoading === "cancel" ? "Cancelling…" : "Cancel Booking"}
                            </button>
                          </div>
                        </div>

                        {/* Occupants */}
                        <div className="book-card">
                          <div className="section-title">👥 Current Occupants</div>
                          {occupantsLoading ? (
                            <div style={{ textAlign: "center", padding: "24px", color: "#7a7a9a", fontSize: ".88rem" }}>
                              ⏳ Loading occupants…
                            </div>
                          ) : occupants && occupants.length > 0 ? (
                            <div className="occupants-grid">
                              {occupants.map((occupant) => {
                                const isYou = currentUser?._id === occupant?._id;
                                return (
                                  <div
                                    key={occupant?._id || Math.random()}
                                    className={`occupant-card${isYou ? " you-card" : ""}`}
                                  >
                                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                      <div className="occupant-avatar">
                                        {occupant?.profilePhotoUrl ? (
                                          <img src={occupant.profilePhotoUrl} alt={occupant?.name || "Occupant"} />
                                        ) : (
                                          occupant?.name?.[0]?.toUpperCase() || "?"
                                        )}
                                      </div>
                                      <div className="occupant-info" style={{ flex: 1 }}>
                                        <div className="occupant-name">
                                          {occupant?.name || "Unknown Tenant"}
                                          {isYou && <span className="occupant-badge">✓ You</span>}
                                        </div>
                                        <div className="occupant-bio">{occupant?.bio || "No bio available"}</div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="occupants-empty">No occupants at the moment</div>
                          )}
                        </div>
                      </>
                    ) : (
                      /* ── Pending Booking Confirmation ─────────────────── */
                      <div className="book-card">
                        <div className="section-title">📌 Confirm Your Booking</div>

                        {approvedApplications.length > 1 && (
                          <div className="alert-box">
                            <Info size={18} style={{ color: "#e65100", flexShrink: 0, marginTop: 2 }} />
                            <div className="alert-box-text">
                              You have <strong>{approvedApplications.length} approved applications</strong>.
                              When you confirm one booking, all other approved applications will be
                              <strong> automatically rejected</strong> and the respective PG owners will be notified.
                              Choose wisely!
                            </div>
                          </div>
                        )}

                        <p className="card-note">
                          Select an approved application to confirm your booking or decline it.
                        </p>

                        <div className="app-list">
                          {approvedApplications.map((app) => (
                            <div
                              key={app._id}
                              className={`app-item${selectedApplicationId === app._id ? " selected" : ""}`}
                              onClick={() => setSelectedApplicationId(app._id)}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="app-item-info">
                                <div className="app-item-name">
                                  {app.pgStay?.name}
                                  {app.room?.capacity > 1 && (
                                    <span className="capacity-badge">{roomSlotsLabel(app)}</span>
                                  )}
                                </div>
                                <div className="app-item-meta">
                                  {app.room?.roomType} · ₹{app.rentAmount}/mo ·{" "}
                                  {app.pgStay?.location}
                                </div>
                              </div>
                              <div className="app-item-actions">
                                <button
                                  className="btn-action btn-book"
                                  disabled={actionLoading === `book-${app._id}`}
                                  onClick={(e) => { e.stopPropagation(); handleBook(app._id); }}
                                >
                                  <CheckCircle2 size={15} />
                                  {actionLoading === `book-${app._id}` ? "Booking…" : "Book"}
                                </button>
                                <button
                                  className="btn-action btn-decline"
                                  disabled={actionLoading === `decline-${app._id}`}
                                  onClick={(e) => { e.stopPropagation(); handleDecline(app._id); }}
                                >
                                  <XCircle size={15} />
                                  {actionLoading === `decline-${app._id}` ? "Declining…" : "Decline"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Agreement Dates ────────────────────────────────── */}
                    {activeBooking && (
                      <div className="book-card">
                        <div className="section-title">📋 Agreement Time Period</div>
                        <p className="card-note">Set your agreement start and end dates.</p>
                        <div className="info-row">
                          <div className="info-card">
                            <div className="info-label">Start Date</div>
                            <input
                              type="date"
                              className="clay-input"
                              value={agreementStart}
                              onChange={(e) => setAgreementStart(e.target.value)}
                              disabled={!!(activeBooking?.agreementStartDate || activeBooking?.agreementEndDate)}
                            />
                          </div>
                          <div className="info-card">
                            <div className="info-label">End Date</div>
                            <input
                              type="date"
                              className="clay-input"
                              value={agreementEnd}
                              onChange={(e) => setAgreementEnd(e.target.value)}
                              disabled={!!(activeBooking?.agreementStartDate || activeBooking?.agreementEndDate)}
                            />
                          </div>
                        </div>
                        <div className="btn-row">
                          <button
                            className="btn-action btn-upload"
                            disabled={actionLoading === "agreement"}
                            onClick={handleSaveAgreementDates}
                          >
                            <Calendar size={16} />
                            {actionLoading === "agreement" ? "Saving…" : "Save Agreement Dates"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── Payment Proof ──────────────────────────────────── */}
                    <div className="book-card">
                      <div className="section-title">💳 Payment Proof</div>
                      <p className="card-note">
                        Upload payment proof (screenshot/receipt). Owner will verify and update payment status.
                      </p>
                      <div className="file-row">
                        <div className="file-label">Upload payment proof</div>
                        <input
                          ref={paymentProofInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setPaymentProofFile(e.target.files?.[0] ?? null)}
                        />
                      </div>
                      <div className="btn-row">
                        <button
                          className="btn-action btn-upload"
                          disabled={actionLoading === "paymentProof"}
                          onClick={handleUploadPaymentProof}
                        >
                          <Calendar size={16} />
                          {actionLoading === "paymentProof" ? "Uploading…" : "Upload Proof"}
                        </button>
                      </div>
                    </div>

                    {/* ── Complaint & Support ────────────────────────────── */}
                    <div className="book-card">
                      <div className="section-title">🛠️ Complaint & Support</div>
                      <p className="card-note">
                        File a complaint about your PG stay. The owner and admin will be notified.
                      </p>
                      <textarea
                        className="complaint-input"
                        value={complaintText}
                        onChange={(e) => setComplaintText(e.target.value)}
                        placeholder="Describe the issue you are facing…"
                      />
                      <div className="btn-row">
                        <button
                          className="btn-action btn-send"
                          disabled={actionLoading === "complaint"}
                          onClick={handleSubmitComplaint}
                        >
                          <Send size={16} />
                          {actionLoading === "complaint" ? "Submitting…" : "Submit Complaint"}
                        </button>
                      </div>
                    </div>

                    {/* ── Complaint History ──────────────────────────────── */}
                    {complaints.length > 0 && (
                      <div className="book-card">
                        <div className="section-title">📣 Your Complaints</div>
                        <div className="tickets-list">
                          {complaints.map((ticket) => (
                            <div key={ticket._id} className="ticket-card">
                              <div>
                                <strong>Issue:</strong> {ticket.issue}
                              </div>
                              <div className="ticket-meta">
                                Status: {ticket.status} · Owner action: {ticket.ownerAction || "pending"}
                              </div>
                              {ticket.ownerResponse && (
                                <div className="ticket-meta">Owner message: {ticket.ownerResponse}</div>
                              )}
                              <div className="ticket-meta">
                                Filed: {new Date(ticket.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}