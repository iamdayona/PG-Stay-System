import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MessageSquare } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetOwnerComplaints, apiOwnerUpdateComplaint } from "../utils/api";
import { toast } from "../components/Toast";
import { CLAY_BASE, CLAY_OWNER, injectClay } from "../styles/claystyles";
import { toSentenceCase } from "../utils/capitalization";

const PAGE_CSS = `
  .complaint-row { display:grid; grid-template-columns:1fr; gap:18px; }
  .complaint-card { background:rgba(255,255,255,.68); border:1px solid rgba(66,165,245,.18); border-radius:22px; padding:24px; box-shadow:0 8px 28px rgba(0,0,0,.06); }
  .complaint-header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:14px; }
  .complaint-title { font-size:1rem; font-weight:800; color:#2d2d4e; }
  .complaint-meta { font-size:.78rem; color:#7a7a9a; }
  .complaint-issue { background:rgba(255,243,224,.9); border:1px solid rgba(255,202,128,.55); border-radius:16px; padding:16px; margin-bottom:14px; color:#5d4037; line-height:1.6; }
  .complaint-actions { display:flex; flex-wrap:wrap; gap:12px; margin-top:10px; }
  .action-btn { display:inline-flex; align-items:center; gap:8px; border:none; border-radius:16px; padding:10px 18px; cursor:pointer; font-weight:700; transition:transform .15s,filter .15s; }
  .action-resolve { background:linear-gradient(135deg,#66bb6a,#43a047); color:white; }
  .action-will { background:linear-gradient(135deg,#42a5f5,#1e88e5); color:white; }
  .action-input { width:100%; min-height:88px; border:1px solid rgba(144,202,249,.6); border-radius:14px; padding:14px; font-size:.92rem; resize:vertical; margin-top:12px; }
  .resolved-message { background:rgba(232,245,233,.95); border:1px solid rgba(165,214,167,.6); border-radius:16px; padding:16px; color:#2e7d32; margin-top:14px; line-height:1.7; }
  .status-pill { display:inline-flex; align-items:center; gap:8px; border-radius:999px; padding:8px 14px; font-size:.82rem; font-weight:700; }
  .status-pending { background:rgba(255,249,196,.95); color:#f57f17; }
  .status-resolved { background:rgba(232,245,233,.95); color:#2e7d32; }
`;

const css = injectClay(CLAY_BASE, CLAY_OWNER, PAGE_CSS);

export default function OwnerComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState({});
  const [actionLoading, setActionLoading] = useState("");

  const fetchComplaints = async () => {
    try {
      const res = await apiGetOwnerComplaints();
      setComplaints(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleOwnerAction = async (complaintId, action) => {
    setActionLoading(`${complaintId}:${action}`);
    try {
      await apiOwnerUpdateComplaint(complaintId, {
        action,
        message: selectedMessage[complaintId] || (action === "resolved" ? "Resolved by owner." : "We will resolve this soon."),
      });
      toast.success(`Complaint ${action === "resolved" ? "resolved" : "updated"}.`);
      await fetchComplaints();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading("");
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="owner" />
        <main className="clay-main">
          <div className="clay-container">
            <h2 className="clay-page-title">⚠️ Owner Complaint Panel</h2>
            <p className="clay-page-sub">Review complaints raised by tenants and keep the admin informed of resolution status.</p>

            {loading ? (
              <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading complaints…</div>
            ) : complaints.length === 0 ? (
              <div className="clay-empty"><span className="clay-empty-emoji">🎉</span>No complaints found for your PGs yet.</div>
            ) : (
              <div className="complaint-row">
                {complaints.map((complaint) => (
                  <div key={complaint._id} className="complaint-card">
                    <div className="complaint-header">
                      <div>
                        <div className="complaint-title">{complaint.pgStay?.name}</div>
                        <div className="complaint-meta">Reported by {complaint.reportedBy?.name} · {new Date(complaint.createdAt).toLocaleDateString()}</div>
                      </div>
                      <span className={`status-pill ${complaint.status === "resolved" ? "status-resolved" : "status-pending"}`}>
                        {complaint.status === "resolved" ? "Resolved" : "Pending"}
                      </span>
                    </div>

                    <div className="complaint-issue">{complaint.issue}</div>
                    {complaint.status === "resolved" ? (
                      <div className="resolved-message">
                        <strong>Resolved:</strong> {complaint.ownerResponse || "This complaint has been resolved."}
                      </div>
                    ) : (
                      <>
                        <textarea
                          className="action-input"
                          placeholder="Enter a message to the tenant..."
                          value={selectedMessage[complaint._id] || ""}
                          onChange={(e) => setSelectedMessage((prev) => ({ ...prev, [complaint._id]: toSentenceCase(e.target.value) }))}
                        />
                        <div className="complaint-actions">
                          <button
                            className="action-btn action-will"
                            onClick={() => handleOwnerAction(complaint._id, "willResolve")}
                            disabled={actionLoading === `${complaint._id}:willResolve`}
                          >
                            <MessageSquare size={16} /> {actionLoading === `${complaint._id}:willResolve` ? "Updating…" : "Will resolve"}
                          </button>
                          <button
                            className="action-btn action-resolve"
                            onClick={() => handleOwnerAction(complaint._id, "resolved")}
                            disabled={actionLoading === `${complaint._id}:resolved`}
                          >
                            <CheckCircle2 size={16} /> {actionLoading === `${complaint._id}:resolved` ? "Resolving…" : "Resolved"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
