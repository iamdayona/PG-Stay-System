import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import Modal from "../components/Modal";
import ConfirmationModal from "../components/ConfirmationModal";
import { toast } from "../components/Toast";
import { apiAdminTrustScores, apiAdminSuspendUser, apiAdminWarnUser } from "../utils/api";
import { CLAY_BASE, CLAY_ADMIN, injectClay } from "../styles/claystyles";

const PAGE_CSS = `
.trust-strip { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:28px; }
  .ts-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:22px; padding:20px; box-shadow:0 6px 24px rgba(0,0,0,.07),inset 0 1px 0 rgba(255,255,255,.95); text-align:center; position:relative; overflow:hidden; animation:fadeUp .6s ease both; }
  .ts-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:22px 22px 0 0; }
  .tc-green::before  { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .tc-yellow::before { background:linear-gradient(90deg,#ffe082,#ffd54f); }
  .tc-red::before    { background:linear-gradient(90deg,#ef9a9a,#e53935); }
  .ts-icon  { font-size:1.8rem; margin-bottom:8px; }
  .ts-label { font-size:.68rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
  .ts-value { font-family:'Nunito',sans-serif; font-size:2.4rem; font-weight:900; }
  .ts-sub   { font-size:.72rem; color:#9a9ab0; margin-top:4px; }
  .tv-g{color:#2e7d32;} .tv-y{color:#f57f17;} .tv-r{color:#c62828;}

  .clay-card::before { background:linear-gradient(90deg,#ef5350,#e040fb,#42a5f5); }
  .overflow-wrap { overflow-x:auto; }
  .data-table { width:100%; border-collapse:collapse; }
  .data-table th { font-size:.7rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; padding:10px 14px; text-align:left; border-bottom:2px solid rgba(255,255,255,.7); }
  .data-table td { padding:12px 14px; border-bottom:1.5px solid rgba(255,255,255,.6); vertical-align:middle; }
  .data-table tr:last-child td { border-bottom:none; }
  .data-table tr:hover td { background:rgba(255,255,255,.35); }

  .row-name { font-size:.88rem; font-weight:700; color:#2d2d4e; }
  .row-type  { font-size:.72rem; font-weight:700; padding:3px 10px; border-radius:50px; display:inline-block; }
  .type-pg     { background:rgba(227,242,253,.9); color:#1565c0; }
  .type-tenant { background:rgba(232,245,233,.9); color:#2e7d32; }
  .type-owner  { background:rgba(255,248,225,.9); color:#e65100; }
  .row-owner { font-size:.82rem; color:#7a7a9a; }

  .score-wrap { display:flex; align-items:center; gap:10px; }
  .score-num  { font-family:'Nunito',sans-serif; font-size:1rem; font-weight:800; width:48px; }
  .score-bar  { flex:1; height:8px; background:rgba(200,200,220,.3); border-radius:50px; overflow:hidden; min-width:60px; }
  .score-fill { height:100%; border-radius:50px; transition:width .5s ease; }
  .sf-high { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .sf-mid  { background:linear-gradient(90deg,#ffe082,#ffd54f); }
  .sf-low  { background:linear-gradient(90deg,#ef9a9a,#e53935); }
  .score-high{color:#2e7d32;} .score-mid{color:#f57f17;} .score-low{color:#c62828;}

  .trust-badge { display:inline-flex; align-items:center; gap:5px; border-radius:50px; padding:4px 11px; font-size:.7rem; font-weight:700; border:1.5px solid rgba(255,255,255,.85); }
  .tb-high { background:rgba(232,245,233,.9); color:#2e7d32; border-color:rgba(165,214,167,.6); }
  .tb-mid  { background:rgba(255,249,196,.9); color:#f57f17; border-color:rgba(255,224,130,.6); }
  .tb-low  { background:rgba(255,235,238,.9); color:#c62828; border-color:rgba(239,154,154,.6); }

  .action-wrap { display:flex; gap:7px; }
  .act-btn { padding:7px 14px; border:none; border-radius:11px; font-family:'Poppins',sans-serif; font-size:.75rem; font-weight:700; cursor:pointer; transition:transform .15s,filter .15s; }
  .act-btn:hover { transform:translateY(-1px); filter:brightness(1.06); }
  .btn-suspend { background:rgba(255,235,238,.9); border:1.5px solid rgba(239,154,154,.6); color:#c62828; }
  .btn-warn    { background:rgba(255,249,196,.9); border:1.5px solid rgba(255,224,130,.6); color:#f57f17; }
`;

const css = injectClay(CLAY_BASE, CLAY_ADMIN, PAGE_CSS);

export default function AdminMonitorTrustScores() {
  const [data, setData] = useState({ pgs: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningTarget, setWarningTarget] = useState(null);
  const [warningMessage, setWarningMessage] = useState("");
  const [warningLoading, setWarningLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", callback: null });

  const fetchData = async () => {
    try {
      const res = await apiAdminTrustScores();
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSuspend = async (userId) => {
    setConfirmDialog({
      isOpen: true,
      title: "Suspend User?",
      message: "Are you sure you want to suspend this user?",
      callback: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          await apiAdminSuspendUser(userId);
          await fetchData();
          toast.success("User suspended successfully.");
        } catch (err) { toast.error(err.message); }
      }
    });
  };

  const openWarnModal = (item) => {
    setWarningTarget(item);
    setWarningMessage("");
    setWarningOpen(true);
  };

  const handleSendWarning = async () => {
    if (!warningTarget || !warningMessage.trim()) return;
    setWarningLoading(true);
    try {
      await apiAdminWarnUser(warningTarget.warnTargetId, { message: warningMessage.trim() });
      toast.success("Warning sent successfully.");
      setWarningOpen(false);
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setWarningLoading(false);
    }
  };

  const allItems = [
    ...data.pgs.map((p) => ({ name: p.name, type: "PG", owner: p.owner?.name || "—", score: p.trustScore, _id: p._id, isUser: false, warnTargetId: p.owner?._id })),
    ...data.users.map((u) => ({ name: u.name, type: u.role, owner: "—", score: u.trustScore, _id: u._id, isUser: true, warnTargetId: u._id })),
  ];

  const high = allItems.filter((i) => i.score >= 80).length;
  const medium = allItems.filter((i) => i.score >= 60 && i.score < 80).length;
  const low = allItems.filter((i) => i.score < 60).length;

  const scoreClass = (s) => s >= 80 ? "score-high" : s >= 60 ? "score-mid" : "score-low";
  const barClass = (s) => s >= 80 ? "sf-high" : s >= 60 ? "sf-mid" : "sf-low";
  const badgeClass = (s) => s >= 80 ? "tb-high" : s >= 60 ? "tb-mid" : "tb-low";
  const typeClass = (t) => t === "PG" ? "type-pg" : t === "owner" ? "type-owner" : "type-tenant";
  const badgeLabel = (s) => s >= 80 ? "High Trust" : s >= 60 ? "Medium" : "Low Trust";

  return (
    <>
      <style>{css}</style>
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onYes={confirmDialog.callback || (() => { })}
        onNo={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
      <div className="clay-page">
        <RoleNavigation role="admin" />
        <main className="clay-main">
          <div className="clay-container">

            <h2 className="clay-page-title">🛡️ Monitor Trust Scores</h2>
            <p className="clay-page-sub">Track and act on trust scores across users and PG listings.</p>

            {/* Trust summary */}
            <div className="trust-strip">
              <div className="ts-card tc-green">
                <div className="ts-icon">🛡️</div>
                <div className="ts-label">High Trust (≥80)</div>
                <div className="ts-value tv-g">{loading ? "…" : high}</div>
                <div className="ts-sub">Healthy accounts</div>
              </div>
              <div className="ts-card tc-yellow" style={{ animationDelay: ".1s" }}>
                <div className="ts-icon">⚠️</div>
                <div className="ts-label">Medium Trust (60–79)</div>
                <div className="ts-value tv-y">{loading ? "…" : medium}</div>
                <div className="ts-sub">Needs attention</div>
              </div>
              <div className="ts-card tc-red" style={{ animationDelay: ".2s" }}>
                <div className="ts-icon">🚨</div>
                <div className="ts-label">Low Trust (&lt;60)</div>
                <div className="ts-value tv-r">{loading ? "…" : low}</div>
                <div className="ts-sub">Action required</div>
              </div>
            </div>

            {/* Table */}
            <div className="clay-card clay-card-p" style={{ "--bar-bg": "linear-gradient(90deg,#ef5350,#e040fb,#42a5f5)" }}>
              <style>{`.clay-card::before{background:linear-gradient(90deg,#ef5350,#e040fb,#42a5f5);}`}</style>
              <div className="clay-section-title">📊 Trust Score Details</div>
              {loading ? (
                <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading trust data…</div>
              ) : allItems.length === 0 ? (
                <div className="clay-empty"><span className="clay-empty-emoji">📊</span>No data yet.</div>
              ) : (
                <div className="overflow-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Owner</th>
                        <th>Trust Score</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allItems.map((item, i) => (
                        <tr key={i}>
                          <td><span className="row-name">{item.name}</span></td>
                          <td><span className={`row-type ${typeClass(item.type)}`}>{item.type}</span></td>
                          <td><span className="row-owner">{item.owner}</span></td>
                          <td>
                            <div className="score-wrap">
                              <span className={`score-num ${scoreClass(item.score)}`}>{item.score}</span>
                              <div className="score-bar">
                                <div className={`score-fill ${barClass(item.score)}`} style={{ width: `${item.score}%` }} />
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`trust-badge ${badgeClass(item.score)}`}>
                              {item.score >= 80 ? <ShieldCheck size={12} /> : item.score >= 60 ? <ShieldAlert size={12} /> : <ShieldX size={12} />}
                              {badgeLabel(item.score)}
                            </span>
                          </td>
                          <td>
                            <div className="action-wrap">
                              {item.isUser && item.score < 60 ? (
                                <button className="act-btn btn-suspend" onClick={() => handleSuspend(item._id)}>🚫 Suspend</button>
                              ) : (
                                <button
                                  className="act-btn btn-warn"
                                  onClick={() => openWarnModal(item)}
                                  disabled={!item.warnTargetId}
                                  title={!item.warnTargetId ? "No warning target available." : ""}
                                >⚠️ Warn</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {warningOpen && (
              <Modal
                title="Send Warning"
                subtitle={warningTarget?.isUser ? "Warn this user directly." : "Warn the owner of this PG."}
                onClose={() => setWarningOpen(false)}
                onConfirm={handleSendWarning}
                confirmLabel={warningLoading ? "Sending…" : "Send Warning"}
                loading={warningLoading}
              >
                <div style={{ padding: 0, minWidth: 320 }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>Target</label>
                    <div style={{ padding: 12, borderRadius: 14, background: "#f8f8fb", border: "1px solid #d8d8e8" }}>
                      {warningTarget ? `${warningTarget.name} (${warningTarget.type})` : "No target selected."}
                    </div>
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>Message</label>
                    <textarea
                      value={warningMessage}
                      onChange={(e) => setWarningMessage(e.target.value)}
                      rows={5}
                      style={{ width: "100%", padding: 12, borderRadius: 14, border: "1px solid #d8d8e8", resize: "vertical" }}
                      placeholder="Enter the warning message to send by email and notification"
                    />
                  </div>
                </div>
              </Modal>
            )}

          </div>
        </main>
      </div>
    </>
  );
}