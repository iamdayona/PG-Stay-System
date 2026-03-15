import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiAdminGetComplaints, apiAdminResolveComplaint, apiAdminRejectComplaint } from "../utils/api";
import { toast } from "../components/Toast";
import { CLAY_BASE, CLAY_ADMIN, injectClay } from "../styles/claystyles";

const PAGE_CSS = `
  .strip { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px; }
  .strip-card { background:rgba(255,255,255,.65); backdrop-filter:blur(16px); border:2.5px solid rgba(255,255,255,.85); border-radius:20px; padding:16px 20px; box-shadow:0 4px 16px rgba(0,0,0,.06),inset 0 1px 0 rgba(255,255,255,.95); position:relative; overflow:hidden; animation:fadeUp .6s ease both; text-align:center; }
  .strip-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:20px 20px 0 0; }
  .sc-yellow::before { background:linear-gradient(90deg,#ffe082,#ffd54f); }
  .sc-green::before  { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .sc-red::before    { background:linear-gradient(90deg,#ef9a9a,#e53935); }
  .strip-label { font-size:.68rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
  .strip-value { font-family:'Nunito',sans-serif; font-size:2rem; font-weight:900; }
  .sv-y{color:#f57f17;} .sv-g{color:#2e7d32;} .sv-r{color:#c62828;}

  .complaint-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:26px; box-shadow:0 8px 28px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95); margin-bottom:20px; animation:fadeUp .6s ease both; position:relative; overflow:hidden; transition:transform .2s,box-shadow .2s; }
  .complaint-card:hover { transform:translateY(-3px); box-shadow:0 16px 40px rgba(0,0,0,.11); }
  .complaint-card::before { content:''; position:absolute; top:0; left:0; bottom:0; width:5px; border-radius:24px 0 0 24px; }
  .complaint-card.cc-pending::before  { background:linear-gradient(180deg,#ffe082,#ffd54f); }
  .complaint-card.cc-resolved::before { background:linear-gradient(180deg,#66bb6a,#a5d6a7); }
  .complaint-card.cc-rejected::before { background:linear-gradient(180deg,#ef9a9a,#e53935); }

  .card-inner { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
  .card-left { flex:1; }
  .card-right { display:flex; flex-direction:column; align-items:flex-end; gap:12px; flex-shrink:0; }

  .alert-icon { width:44px; height:44px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; background:linear-gradient(135deg,#ffcdd2,#fce4ec); border:2px solid rgba(255,255,255,.9); box-shadow:0 3px 10px rgba(239,83,80,.18); flex-shrink:0; margin-bottom:14px; }
  .pg-name    { font-family:'Nunito',sans-serif; font-size:1.2rem; font-weight:900; color:#2d2d4e; margin-bottom:5px; }
  .reporter   { font-size:.8rem; color:#7a7a9a; margin-bottom:8px; display:flex; align-items:center; gap:6px; }
  .reporter-badge { background:rgba(227,242,253,.9); color:#1565c0; border:1.5px solid rgba(144,202,249,.5); border-radius:50px; padding:2px 9px; font-size:.68rem; font-weight:700; }
  .issue-box  { background:rgba(255,235,238,.6); border:1.5px solid rgba(239,154,154,.35); border-radius:14px; padding:12px 15px; margin-bottom:10px; font-size:.85rem; color:#4a2020; line-height:1.55; }
  .issue-label{ font-size:.65rem; font-weight:700; color:#e53935; text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; }
  .filed-date { font-size:.72rem; color:#9a9ab0; }

  .status-badge   { display:inline-flex; align-items:center; gap:6px; border-radius:50px; padding:6px 16px; font-size:.75rem; font-weight:700; border:1.5px solid rgba(255,255,255,.85); box-shadow:0 2px 8px rgba(0,0,0,.07); }
  .badge-pending  { background:rgba(255,249,196,.9); color:#f57f17; border-color:rgba(255,224,130,.6); }
  .badge-resolved { background:rgba(232,245,233,.9); color:#2e7d32; border-color:rgba(165,214,167,.6); }
  .badge-rejected { background:rgba(255,235,238,.9); color:#c62828; border-color:rgba(239,154,154,.6); }

  .action-btns { display:flex; gap:9px; }
  .btn-resolve { background:linear-gradient(135deg,#66bb6a,#43a047); color:white; padding:10px 18px; border:none; border-radius:13px; font-family:'Poppins',sans-serif; font-size:.82rem; font-weight:700; cursor:pointer; box-shadow:0 4px 0 #2e7d32,0 7px 16px rgba(102,187,106,.3); transition:transform .15s,filter .15s; display:inline-flex; align-items:center; gap:6px; }
  .btn-resolve:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }
  .btn-resolve:disabled { opacity:.6; cursor:not-allowed; }
  .btn-reject  { background:rgba(255,255,255,.72); border:2px solid rgba(239,154,154,.6); color:#c62828; padding:10px 18px; border-radius:13px; font-family:'Poppins',sans-serif; font-size:.82rem; font-weight:700; cursor:pointer; box-shadow:0 4px 0 rgba(239,83,80,.15); transition:transform .15s; display:inline-flex; align-items:center; gap:6px; }
  .btn-reject:hover:not(:disabled) { background:rgba(255,235,238,.9); transform:translateY(-2px); }
  .btn-reject:disabled { opacity:.6; cursor:not-allowed; }

  .resolved-note { display:flex; align-items:center; gap:7px; padding:10px 14px; background:rgba(232,245,233,.85); border:2px solid rgba(165,214,167,.5); border-radius:13px; font-size:.78rem; color:#2e7d32; font-weight:600; }
`;

const css = injectClay(CLAY_BASE, CLAY_ADMIN, PAGE_CSS);

export default function AdminHandleComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [actionId, setActionId]     = useState("");

  const fetchComplaints = async () => {
    try {
      const res = await apiAdminGetComplaints();
      setComplaints(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleResolve = async (id) => {
    setActionId(id + "r");
    try {
      await apiAdminResolveComplaint(id);
      toast.success("Complaint resolved successfully");
      await fetchComplaints();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionId("");
    }
  };

  const handleReject = async (id) => {
    setActionId(id + "x");
    try {
      await apiAdminRejectComplaint(id);
      toast.info("Complaint rejected");
      await fetchComplaints();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionId("");
    }
  };

  const pending  = complaints.filter((c) => c.status === "pending").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const total    = complaints.length;

  const cardClass  = (s) => s === "pending" ? "cc-pending" : s === "resolved" ? "cc-resolved" : "cc-rejected";
  const badgeClass = (s) => s === "pending" ? "badge-pending" : s === "resolved" ? "badge-resolved" : "badge-rejected";
  const badgeLabel = (s) => s === "pending" ? "⏳ Pending" : s === "resolved" ? "✅ Resolved" : "❌ Rejected";

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="admin" />
        <main className="clay-main">
          <div className="clay-container">

            <h2 className="clay-page-title">⚠️ Handle Complaints</h2>
            <p className="clay-page-sub">Review and resolve tenant-reported issues with PG stays.</p>

            {/* Strip */}
            <div className="strip">
              <div className="strip-card sc-yellow"><div className="strip-label">Pending</div><div className="strip-value sv-y">{pending}</div></div>
              <div className="strip-card sc-green" style={{ animationDelay:".08s" }}><div className="strip-label">Resolved</div><div className="strip-value sv-g">{resolved}</div></div>
              <div className="strip-card sc-red"   style={{ animationDelay:".16s" }}><div className="strip-label">Total</div><div className="strip-value sv-r">{total}</div></div>
            </div>

            {loading ? (
              <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading complaints…</div>
            ) : complaints.length === 0 ? (
              <div className="clay-empty"><span className="clay-empty-emoji">🎉</span>No complaints filed yet!</div>
            ) : (
              complaints.map((c, i) => (
                <div key={c._id} className={`complaint-card ${cardClass(c.status)}`} style={{ animationDelay:`${i*.08}s` }}>
                  <div className="card-inner">
                    <div className="card-left">
                      <div className="alert-icon">
                        {c.status === "pending" ? "⚠️" : c.status === "resolved" ? "✅" : "❌"}
                      </div>
                      <div className="pg-name">{c.pgStay?.name}</div>
                      <div className="reporter">
                        Reported by: <span className="reporter-badge">👤 {c.reportedBy?.name}</span>
                      </div>
                      <div className="issue-box">
                        <div className="issue-label">📋 Issue</div>
                        {c.issue}
                      </div>
                      <div className="filed-date">📅 Filed on {new Date(c.createdAt).toLocaleDateString()}</div>
                    </div>

                    <div className="card-right">
                      <span className={`status-badge ${badgeClass(c.status)}`}>
                        {badgeLabel(c.status)}
                      </span>

                      {c.status === "pending" && (
                        <div className="action-btns">
                          <button
                            className="clay-btn btn-resolve"
                            onClick={() => handleResolve(c._id)}
                            disabled={!!actionId}
                          >
                            <CheckCircle size={14} />
                            {actionId === c._id + "r" ? "Resolving…" : "Resolve"}
                          </button>
                          <button
                            className="clay-btn btn-reject"
                            onClick={() => handleReject(c._id)}
                            disabled={!!actionId}
                          >
                            <XCircle size={14} />
                            {actionId === c._id + "x" ? "Rejecting…" : "Reject"}
                          </button>
                        </div>
                      )}
                      {c.status === "resolved" && (
                        <div className="resolved-note"><CheckCircle size={14} /> Issue resolved</div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
}
