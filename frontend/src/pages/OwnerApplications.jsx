import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetOwnerApplications, apiApproveApplication, apiRejectApplication } from "../utils/api";

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
  .clay-container { max-width:900px; margin:0 auto; }
  .clay-page-title { font-family:'Nunito',sans-serif; font-size:1.9rem; font-weight:900; color:#2d2d4e; margin-bottom:4px; }
  .clay-page-sub   { color:#7a7a9a; font-size:.92rem; margin-bottom:28px; }

  /* ── App Card ── */
  .app-card {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:28px;
    box-shadow:0 8px 28px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.95);
    margin-bottom:22px; animation:fadeUp .6s ease both;
    position:relative; overflow:hidden;
    transition:transform .22s, box-shadow .22s;
  }
  .app-card:hover { transform:translateY(-3px); box-shadow:0 16px 40px rgba(0,0,0,.11); }
  .app-card::before { content:''; position:absolute; top:0; left:0; bottom:0; width:5px; border-radius:24px 0 0 24px; }
  .card-pending  ::before { background:linear-gradient(180deg,#ffe082,#ffd54f); }
  .card-approved ::before { background:linear-gradient(180deg,#66bb6a,#a5d6a7); }
  .card-rejected ::before { background:linear-gradient(180deg,#ef9a9a,#e57373); }
  .card-pending  { border-left-color:rgba(255,224,130,.5); }
  .card-approved { border-left-color:rgba(165,214,167,.5); }
  .card-rejected { border-left-color:rgba(239,154,154,.5); }

  /* Apply left-side border via ::before on the card itself */
  .app-card.card-pending::before  { background:linear-gradient(180deg,#ffe082,#ffd54f); }
  .app-card.card-approved::before { background:linear-gradient(180deg,#66bb6a,#a5d6a7); }
  .app-card.card-rejected::before { background:linear-gradient(180deg,#ef9a9a,#e57373); }

  /* ── Card header ── */
  .app-header { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:16px; }
  .tenant-name { font-family:'Nunito',sans-serif; font-size:1.3rem; font-weight:900; color:#2d2d4e; margin-bottom:4px; }
  .app-detail  { font-size:.82rem; color:#7a7a9a; margin-bottom:2px; }

  /* Trust score pill */
  .trust-score {
    text-align:center; padding:12px 20px;
    background:rgba(255,255,255,.7); border:2px solid rgba(255,255,255,.9); border-radius:16px;
    box-shadow:0 3px 12px rgba(0,0,0,.07); flex-shrink:0;
  }
  .trust-label { font-size:.65rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; }
  .trust-value { font-family:'Nunito',sans-serif; font-size:1.8rem; font-weight:900; line-height:1; }
  .trust-high   { color:#2e7d32; } .trust-mid { color:#f57f17; } .trust-low { color:#c62828; }

  /* ── Divider + actions ── */
  .app-footer { border-top:2px solid rgba(255,255,255,.7); padding-top:16px; margin-top:4px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }

  .status-chip {
    display:inline-flex; align-items:center; gap:6px; border-radius:50px; padding:6px 16px;
    font-size:.78rem; font-weight:700; border:1.5px solid rgba(255,255,255,.85);
    box-shadow:0 2px 8px rgba(0,0,0,.07);
  }
  .chip-pending  { background:rgba(255,249,196,.9); color:#f57f17; border-color:rgba(255,224,130,.6); }
  .chip-approved { background:rgba(232,245,233,.9); color:#2e7d32; border-color:rgba(165,214,167,.6); }
  .chip-rejected { background:rgba(255,235,238,.9); color:#c62828; border-color:rgba(239,154,154,.6); }

  .action-btns { display:flex; gap:10px; }

  .clay-btn { padding:11px 22px; border:none; border-radius:14px; font-family:'Poppins',sans-serif; font-size:.85rem; font-weight:700; cursor:pointer; transition:transform .15s, box-shadow .15s, filter .15s; display:inline-flex; align-items:center; gap:7px; }
  .clay-btn:active { transform:scale(.97) translateY(2px) !important; }
  .clay-btn:disabled { opacity:.6; cursor:not-allowed; }

  .btn-approve {
    background:linear-gradient(135deg,#66bb6a,#43a047); color:white;
    box-shadow:0 5px 0 #2e7d32, 0 8px 18px rgba(102,187,106,.35), inset 0 1px 0 rgba(255,255,255,.3);
  }
  .btn-approve:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }

  .btn-reject {
    background:linear-gradient(135deg,#ef9a9a,#e53935); color:white;
    box-shadow:0 5px 0 #b71c1c, 0 8px 18px rgba(239,83,80,.3), inset 0 1px 0 rgba(255,255,255,.3);
  }
  .btn-reject:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }

  /* Approved notice */
  .approved-notice {
    display:flex; align-items:center; gap:8px; padding:12px 16px;
    background:rgba(232,245,233,.85); border:2px solid rgba(165,214,167,.5); border-radius:14px;
    font-size:.83rem; color:#2e7d32; font-weight:600;
    box-shadow:0 3px 10px rgba(102,187,106,.12);
  }

  .empty-state { text-align:center; padding:64px; color:#9a9ab0; font-size:.92rem; }
  .empty-emoji { font-size:3.5rem; margin-bottom:14px; display:block; }
`;

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
              <div className="empty-state"><span className="empty-emoji">⏳</span>Loading applications…</div>
            ) : applications.length === 0 ? (
              <div className="empty-state">
                <span className="empty-emoji">📭</span>
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