import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetOwnerApplications, apiApproveApplication, apiRejectApplication } from "../utils/api";
import { CLAY_BASE, CLAY_OWNER, injectClay } from "../styles/claystyles";

const PAGE_CSS = `
  .app-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:28px; box-shadow:0 8px 28px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95); margin-bottom:22px; animation:fadeUp .6s ease both; position:relative; overflow:hidden; transition:transform .22s,box-shadow .22s; }
  .app-card:hover { transform:translateY(-3px); box-shadow:0 16px 40px rgba(0,0,0,.11); }
  .app-card::before { content:''; position:absolute; top:0; left:0; bottom:0; width:5px; border-radius:24px 0 0 24px; }
  .app-card.card-pending::before  { background:linear-gradient(180deg,#ffe082,#ffd54f); }
  .app-card.card-approved::before { background:linear-gradient(180deg,#66bb6a,#a5d6a7); }
  .app-card.card-rejected::before { background:linear-gradient(180deg,#ef9a9a,#e57373); }

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

  .action-btns { display:flex; gap:10px; }
  .btn-approve { background:linear-gradient(135deg,#66bb6a,#43a047); color:white; padding:11px 22px; border:none; border-radius:14px; font-family:'Poppins',sans-serif; font-size:.85rem; font-weight:700; cursor:pointer; box-shadow:0 5px 0 #2e7d32,0 8px 18px rgba(102,187,106,.35); transition:transform .15s,filter .15s; display:inline-flex; align-items:center; gap:7px; }
  .btn-approve:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }
  .btn-approve:disabled { opacity:.6; cursor:not-allowed; }
  .btn-reject  { background:linear-gradient(135deg,#ef9a9a,#e53935); color:white; padding:11px 22px; border:none; border-radius:14px; font-family:'Poppins',sans-serif; font-size:.85rem; font-weight:700; cursor:pointer; box-shadow:0 5px 0 #b71c1c,0 8px 18px rgba(239,83,80,.3); transition:transform .15s,filter .15s; display:inline-flex; align-items:center; gap:7px; }
  .btn-reject:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }
  .btn-reject:disabled { opacity:.6; cursor:not-allowed; }

  .approved-notice { display:flex; align-items:center; gap:8px; padding:12px 16px; background:rgba(232,245,233,.85); border:2px solid rgba(165,214,167,.5); border-radius:14px; font-size:.83rem; color:#2e7d32; font-weight:600; }
`;

const css = injectClay(CLAY_BASE, CLAY_OWNER, PAGE_CSS);

export default function OwnerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const fetchApps = async () => {
    try {
      const res = await apiGetOwnerApplications();
      setApplications(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchApps(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(id + "approve");
    try { await apiApproveApplication(id); await fetchApps(); }
    catch (err) { alert(err.message); }
    finally { setActionLoading(""); }
  };

  const handleReject = async (id) => {
    setActionLoading(id + "reject");
    try { await apiRejectApplication(id); await fetchApps(); }
    catch (err) { alert(err.message); }
    finally { setActionLoading(""); }
  };

  const getTrustClass = (score) => score >= 85 ? "trust-high" : score >= 70 ? "trust-mid" : "trust-low";
  const getCardClass  = (s)     => s === "Approved" ? "card-approved" : s === "Rejected" ? "card-rejected" : "card-pending";
  const getChipClass  = (s)     => s === "Approved" ? "chip-approved" : s === "Rejected" ? "chip-rejected" : "chip-pending";

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
              <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading applications…</div>
            ) : applications.length === 0 ? (
              <div className="clay-empty">
                <span className="clay-empty-emoji">📭</span>
                No applications received yet.<br/>
                <span style={{ color:"#ffa726", fontWeight:700 }}>Applications will appear here once tenants apply!</span>
              </div>
            ) : (
              applications.map((app, i) => (
                <div key={app._id} className={`app-card ${getCardClass(app.status)}`} style={{ animationDelay:`${i * .08}s` }}>

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
                      <div style={{ fontSize:".65rem", color:"#bbb", marginTop:2 }}>/100</div>
                    </div>
                  </div>

                  <div className="app-footer">
                    <span className={`status-chip ${getChipClass(app.status)}`}>
                      {app.status === "Approved" ? "✓" : app.status === "Rejected" ? "✗" : "⏳"} {app.status}
                    </span>

                    {app.status === "Pending" && (
                      <div className="action-btns">
                        <button className="clay-btn btn-approve" onClick={() => handleApprove(app._id)} disabled={actionLoading === app._id + "approve"}>
                          <CheckCircle2 size={15} />
                          {actionLoading === app._id + "approve" ? "Approving…" : "Approve"}
                        </button>
                        <button className="clay-btn btn-reject" onClick={() => handleReject(app._id)} disabled={actionLoading === app._id + "reject"}>
                          <XCircle size={15} />
                          {actionLoading === app._id + "reject" ? "Rejecting…" : "Reject"}
                        </button>
                      </div>
                    )}

                    {app.status === "Approved" && (
                      <div className="approved-notice">
                        <CheckCircle2 size={16} /> Room allocated successfully to {app.tenant?.name}
                      </div>
                    )}
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