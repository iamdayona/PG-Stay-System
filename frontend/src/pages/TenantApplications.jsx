import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetMyApplications } from "../utils/api";

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

  .clay-main { position:relative; z-index:1; padding:36px 24px; }
  .clay-container { max-width:860px; margin:0 auto; }
  .clay-page-title { font-family:'Nunito',sans-serif; font-size:1.9rem; font-weight:900; color:#2d2d4e; margin-bottom:4px; }
  .clay-page-sub { color:#7a7a9a; font-size:.92rem; margin-bottom:28px; }

  /* App card */
  .app-card {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:28px;
    box-shadow:0 8px 28px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.95);
    margin-bottom:22px; animation:fadeUp .6s ease both;
    transition:transform .22s, box-shadow .22s;
    position:relative; overflow:hidden;
  }
  .app-card:hover { transform:translateY(-4px); box-shadow:0 18px 44px rgba(0,0,0,.12); }

  /* Colored left bar based on status */
  .app-card::before {
    content:''; position:absolute; top:0; left:0; bottom:0; width:5px; border-radius:24px 0 0 24px;
  }
  .app-approved::before { background:linear-gradient(180deg,#66bb6a,#a5d6a7); }
  .app-rejected::before { background:linear-gradient(180deg,#ef9a9a,#e57373); }
  .app-pending::before  { background:linear-gradient(180deg,#ffe082,#ffd54f); }
  .app-review::before   { background:linear-gradient(180deg,#42a5f5,#90caf9); }

  .app-header { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:6px; }
  .app-name { font-family:'Nunito',sans-serif; font-size:1.25rem; font-weight:900; color:#2d2d4e; }
  .app-location { color:#7a7a9a; font-size:.82rem; margin-bottom:6px; }
  .app-rent { font-family:'Nunito',sans-serif; font-size:1.05rem; font-weight:800; color:#1565c0; }
  .app-meta { font-size:.75rem; color:#9a9ab0; margin-top:5px; }

  /* Status badge */
  .status-badge {
    display:inline-flex; align-items:center; gap:6px;
    border-radius:50px; padding:6px 16px; font-size:.78rem; font-weight:700;
    border:1.5px solid rgba(255,255,255,.85);
    box-shadow:0 3px 10px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.8);
    white-space:nowrap;
  }
  .badge-approved { background:rgba(232,245,233,.9); color:#2e7d32; border-color:rgba(165,214,167,.5); }
  .badge-rejected { background:rgba(255,235,238,.9); color:#c62828; border-color:rgba(239,154,154,.5); }
  .badge-pending  { background:rgba(255,249,196,.9); color:#f57f17; border-color:rgba(255,224,130,.5); }
  .badge-review   { background:rgba(227,242,253,.9); color:#1565c0; border-color:rgba(144,202,249,.5); }

  /* Tracker */
  .tracker { margin-top:22px; padding-top:22px; border-top:2px solid rgba(255,255,255,.7); }
  .tracker-label { font-size:.72rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:18px; }

  .tracker-steps { display:flex; align-items:flex-start; position:relative; }
  .tracker-line {
    position:absolute; top:20px; left:20px; right:20px; height:3px;
    background:rgba(200,200,220,.4); border-radius:4px; z-index:0;
  }
  .tracker-line-fill {
    height:100%; border-radius:4px;
    background:linear-gradient(90deg,#42a5f5,#66bb6a);
    transition:width .5s ease;
  }

  .tracker-step { flex:1; display:flex; flex-direction:column; align-items:center; position:relative; z-index:1; }
  .step-dot {
    width:42px; height:42px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    border:3px solid rgba(255,255,255,.9);
    box-shadow:0 4px 14px rgba(0,0,0,.1);
    transition:all .3s ease;
  }
  .step-dot-active {
    background:linear-gradient(135deg,#42a5f5,#1e88e5);
    box-shadow:0 4px 14px rgba(66,165,245,.35);
  }
  .step-dot-done {
    background:linear-gradient(135deg,#66bb6a,#43a047);
    box-shadow:0 4px 14px rgba(102,187,106,.35);
  }
  .step-dot-inactive { background:rgba(200,200,220,.5); }
  .step-label { font-size:.72rem; font-weight:700; color:#9a9ab0; margin-top:8px; text-align:center; }
  .step-label-active { color:#1565c0; }
  .step-label-done   { color:#2e7d32; }

  .empty-state { text-align:center; padding:64px; color:#9a9ab0; font-size:.92rem; }
  .empty-emoji { font-size:3.5rem; margin-bottom:14px; display:block; }
`;

export default function TenantApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetMyApplications()
      .then((res) => setApplications(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stages = ["Pending", "Under Review", "Approved"];

  const getStageIndex = (status) => {
    if (status === "Approved")     return 2;
    if (status === "Under Review") return 1;
    return 0;
  };

  const getCardClass = (status) => {
    if (status === "Approved")     return "app-approved";
    if (status === "Rejected")     return "app-rejected";
    if (status === "Under Review") return "app-review";
    return "app-pending";
  };

  const getBadgeClass = (status) => {
    if (status === "Approved")     return "badge-approved";
    if (status === "Rejected")     return "badge-rejected";
    if (status === "Under Review") return "badge-review";
    return "badge-pending";
  };

  const getStatusIcon = (status) => {
    if (status === "Approved") return <CheckCircle2 size={14} />;
    if (status === "Rejected") return <XCircle size={14} />;
    return <Clock size={14} />;
  };

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="tenant" />

        <main className="clay-main">
          <div className="clay-container">
            <h2 className="clay-page-title">📋 My Applications</h2>
            <p className="clay-page-sub">Track the status of your PG applications in real time.</p>

            {loading ? (
              <div className="empty-state"><span className="empty-emoji">⏳</span>Loading your applications…</div>
            ) : applications.length === 0 ? (
              <div className="empty-state">
                <span className="empty-emoji">📭</span>
                You haven't applied to any PG yet.<br/>
                <span style={{ color: "#42a5f5", fontWeight: 700 }}>Go search for your perfect stay!</span>
              </div>
            ) : (
              applications.map((app, i) => {
                const stageIdx = getStageIndex(app.status);
                const fillPct = app.status === "Rejected" ? 0 : (stageIdx / (stages.length - 1)) * 100;
                return (
                  <div key={app._id} className={`app-card ${getCardClass(app.status)}`} style={{ animationDelay: `${i * .08}s` }}>

                    <div className="app-header">
                      <div>
                        <div className="app-name">{app.pgStay?.name}</div>
                        <div className="app-location">📍 {app.pgStay?.location}</div>
                        <div className="app-rent">₹{app.rentAmount}/month</div>
                        <div className="app-meta">
                          🛏 {app.room?.roomType} &nbsp;·&nbsp; Applied {new Date(app.appliedDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`status-badge ${getBadgeClass(app.status)}`}>
                        {getStatusIcon(app.status)} {app.status}
                      </span>
                    </div>

                    {/* Progress Tracker */}
                    {app.status !== "Rejected" && (
                      <div className="tracker">
                        <div className="tracker-label">Application Progress</div>
                        <div className="tracker-steps">
                          <div className="tracker-line">
                            <div className="tracker-line-fill" style={{ width: `${fillPct}%` }} />
                          </div>
                          {stages.map((stage, idx) => {
                            const done   = idx < stageIdx;
                            const active = idx === stageIdx;
                            return (
                              <div key={stage} className="tracker-step">
                                <div className={`step-dot ${done ? "step-dot-done" : active ? "step-dot-active" : "step-dot-inactive"}`}>
                                  {done
                                    ? <CheckCircle2 size={18} color="white" />
                                    : active
                                      ? <div style={{ width: 10, height: 10, borderRadius: "50%", background: "white" }} />
                                      : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,.6)" }} />
                                  }
                                </div>
                                <span className={`step-label ${done ? "step-label-done" : active ? "step-label-active" : ""}`}>
                                  {stage}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {app.status === "Rejected" && (
                      <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(255,235,238,.7)", borderRadius: 14, fontSize: ".82rem", color: "#c62828", fontWeight: 600 }}>
                        ❌ This application was not approved. Try applying to other PGs!
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </>
  );
}