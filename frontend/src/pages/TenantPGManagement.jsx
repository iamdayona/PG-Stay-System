import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle, FileText, UploadCloud, Send, ArrowRight } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import {
  apiGetMyApplications,
  apiGetMyBookings,
  apiCreateBooking,
  apiDeclineBooking,
  apiUploadBookingAgreement,
  apiPayBooking,
  apiSubmitComplaint,
  apiGetMyComplaints,
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
  .btn-action { cursor:pointer; border:none; border-radius:16px; font-size:.92rem; font-weight:700; padding:11px 18px; transition:transform .15s,filter .15s; }
  .btn-book { background:linear-gradient(135deg,#43a047,#66bb6a); color:white; }
  .btn-decline { background:linear-gradient(135deg,#ef5350,#f06257); color:white; }
  .btn-upload { background:linear-gradient(135deg,#42a5f5,#1e88e5); color:white; }
  .btn-pay { background:linear-gradient(135deg,#ffb300,#ffa000); color:white; }
  .btn-send { background:linear-gradient(135deg,#8e24aa,#d81b60); color:white; }
  .btn-action:hover { transform:translateY(-1px); }
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
`; 

const css = injectClay(CLAY_BASE, CLAY_TENANT, PAGE_CSS);

export default function TenantPGManagement() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [agreementFile, setAgreementFile] = useState(null);
  const [agreementStart, setAgreementStart] = useState("");
  const [agreementEnd, setAgreementEnd] = useState("");
  const [actionLoading, setActionLoading] = useState("");

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
      const approvedApp = appsRes.data.find((app) => app.status === "Approved");
      setSelectedApplicationId(approvedApp?._id || "");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const approvedApplications = applications.filter((app) => app.status === "Approved");
  const activeBooking = bookings[0] ?? null;

  const handleBook = async () => {
    if (!selectedApplicationId) return toast.error("Select an approved application to book.");
    setActionLoading("book");
    try {
      await apiCreateBooking({ applicationId: selectedApplicationId });
      toast.success("Booking confirmed. Manage your stay below.");
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleDecline = async () => {
    if (!selectedApplicationId) return toast.error("Select an approved application to decline.");
    setActionLoading("decline");
    try {
      await apiDeclineBooking({ applicationId: selectedApplicationId });
      toast.info("Approved application declined. You can search for another PG.");
      await fetchData();
      navigate("/tenant/findpgs");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleAgreementUpload = async () => {
    if (!activeBooking) return toast.error("No active booking to update.");
    setActionLoading("agreement");
    try {
      const formData = new FormData();
      if (agreementStart) formData.append("agreementStartDate", agreementStart);
      if (agreementEnd)   formData.append("agreementEndDate", agreementEnd);
      if (agreementFile)  formData.append("agreement", agreementFile);
      await apiUploadBookingAgreement(activeBooking._id, formData);
      toast.success("Agreement details updated successfully.");
      await fetchData();
      setAgreementFile(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const handlePay = async () => {
    if (!activeBooking) return toast.error("No active booking found.");
    setActionLoading("pay");
    try {
      await apiPayBooking(activeBooking._id);
      toast.success("Payment recorded. Next reminder will be sent in 30 days.");
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
    if (status === "overdue") return "Overdue";
    return "Due";
  };

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="tenant" />
        <main className="clay-main">
          <div className="clay-container">
            <h2 className="clay-page-title">🏠 PG Stay Management</h2>
            <p className="clay-page-sub">Book your approved PG, upload agreements, track payments, and raise complaints.</p>

            {loading ? (
              <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading your PG stay details…</div>
            ) : (
              <>
                {!activeBooking && approvedApplications.length === 0 ? (
                  <div className="clay-empty">
                    <span className="clay-empty-emoji">📭</span>
                    No approved applications yet.<br />
                    <span style={{ color: "#42a5f5", fontWeight: 700 }}>Search PGs and apply to start your stay.</span>
                  </div>
                ) : (
                  <>
                    {activeBooking ? (
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
                          <div className="info-card">
                            <div className="info-label">Monthly Rent</div>
                            <div className="info-value">₹{activeBooking.rentAmount}</div>
                          </div>
                          <div className="info-card">
                            <div className="info-label">Payment Status</div>
                            <div className={`info-value status-${activeBooking.paymentStatus}`}>{statusLabel(activeBooking.paymentStatus)}</div>
                          </div>
                        </div>
                        <div className="info-row">
                          <div className="info-card">
                            <div className="info-label">Booking Date</div>
                            <div className="info-value">{new Date(activeBooking.allocationDate).toLocaleDateString()}</div>
                          </div>
                          <div className="info-card">
                            <div className="info-label">Agreement Start</div>
                            <div className="info-value">{activeBooking.agreementStartDate ? new Date(activeBooking.agreementStartDate).toLocaleDateString() : "Not set"}</div>
                          </div>
                          <div className="info-card">
                            <div className="info-label">Agreement End</div>
                            <div className="info-value">{activeBooking.agreementEndDate ? new Date(activeBooking.agreementEndDate).toLocaleDateString() : "Not set"}</div>
                          </div>
                        </div>
                        <div className="btn-row">
                          <button className="btn-action btn-pay" onClick={handlePay} disabled={actionLoading === "pay"}>
                            <UploadCloud size={16} /> {actionLoading === "pay" ? "Recording…" : "Mark Payment Paid"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="book-card">
                        <div className="section-title">📌 Confirm Your Booking</div>
                        <p className="card-note">You have approved applications waiting for booking confirmation. Select one to either confirm or decline.</p>
                        <div className="info-row">
                          <div className="info-card">
                            <div className="info-label">Approved Application</div>
                            <select
                              className="clay-select"
                              value={selectedApplicationId}
                              onChange={(e) => setSelectedApplicationId(e.target.value)}
                            >
                              <option value="">Select approved PG</option>
                              {approvedApplications.map((app) => (
                                <option key={app._id} value={app._id}>
                                  {app.pgStay?.name} — ₹{app.rentAmount}/mo
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="btn-row">
                          <button className="btn-action btn-book" disabled={actionLoading === "book"} onClick={handleBook}>
                            <CheckCircle2 size={16} /> {actionLoading === "book" ? "Booking…" : "Book PG"}
                          </button>
                          <button className="btn-action btn-decline" disabled={actionLoading === "decline"} onClick={handleDecline}>
                            <AlertTriangle size={16} /> {actionLoading === "decline" ? "Cancelling…" : "Reject Booking"}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid-two">
                      <div className="book-card">
                        <div className="section-title">📄 Agreement Details</div>
                        <div className="info-row">
                          <div className="info-card">
                            <div className="info-label">Start Date</div>
                            <input
                              type="date"
                              className="clay-input"
                              value={agreementStart}
                              onChange={(e) => setAgreementStart(e.target.value)}
                            />
                          </div>
                          <div className="info-card">
                            <div className="info-label">End Date</div>
                            <input
                              type="date"
                              className="clay-input"
                              value={agreementEnd}
                              onChange={(e) => setAgreementEnd(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="file-row">
                          <div className="file-label">Upload agreement document</div>
                          <input type="file" accept=".pdf,image/*" onChange={(e) => setAgreementFile(e.target.files?.[0] ?? null)} />
                        </div>
                        <div className="btn-row">
                          <button className="btn-action btn-upload" disabled={actionLoading === "agreement"} onClick={handleAgreementUpload}>
                            <UploadCloud size={16} /> {actionLoading === "agreement" ? "Updating…" : "Save Agreement"}
                          </button>
                        </div>
                        <div className="card-note">Upload your signed agreement and set the permitted stay period.</div>
                      </div>

                      <div className="book-card">
                        <div className="section-title">🛠️ Complaint & Support</div>
                        <p className="card-note">File a complaint about your PG stay. The owner and admin will be notified.</p>
                        <textarea
                          className="complaint-input"
                          value={complaintText}
                          onChange={(e) => setComplaintText(e.target.value)}
                          placeholder="Describe the issue you are facing…"
                        />
                        <div className="btn-row">
                          <button className="btn-action btn-send" disabled={actionLoading === "complaint"} onClick={handleSubmitComplaint}>
                            <Send size={16} /> {actionLoading === "complaint" ? "Submitting…" : "Submit Complaint"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {complaints.length > 0 && (
                      <div className="book-card">
                        <div className="section-title">📣 Your Complaints</div>
                        <div className="tickets-list">
                          {complaints.map((ticket) => (
                            <div key={ticket._id} className="ticket-card">
                              <div><strong>Issue:</strong> {ticket.issue}</div>
                              <div className="ticket-meta">Status: {ticket.status} · Owner action: {ticket.ownerAction || "pending"}</div>
                              {ticket.ownerResponse && <div className="ticket-meta">Owner message: {ticket.ownerResponse}</div>}
                              <div className="ticket-meta">Filed: {new Date(ticket.createdAt).toLocaleDateString()}</div>
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
