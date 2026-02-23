import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Bell, CheckCircle2, AlertCircle, Star } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import {
  apiGetNotifications,
  apiMarkAllRead,
  apiSubmitFeedback,
  apiGetMyFeedback,
  apiGetOwnerPGs,
  apiGetMyApplications,
} from "../utils/api";

export default function TenantNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [myFeedback, setMyFeedback]       = useState([]);
  const [appliedPGs, setAppliedPGs]       = useState([]);
  const [loading, setLoading]             = useState(true);

  const [rating, setRating]     = useState(0);
  const [pgStayId, setPgStayId] = useState("");
  const [comment, setComment]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const fetchAll = async () => {
    try {
      const [notifRes, feedbackRes, appsRes] = await Promise.all([
        apiGetNotifications(),
        apiGetMyFeedback(),
        apiGetMyApplications(),
      ]);
      setNotifications(notifRes.data);
      setMyFeedback(feedbackRes.data);
      // Only approved apps can get feedback
      const approved = appsRes.data.filter((a) => a.status === "Approved");
      setAppliedPGs(approved);
      if (approved.length > 0) setPgStayId(approved[0].pgStay?._id || "");
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleMarkAll = async () => {
    try {
      await apiMarkAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) { alert(err.message); }
  };

  const handleFeedback = async () => {
    if (!rating || !pgStayId) {
      setFeedbackMsg("Please select a PG and rating.");
      return;
    }
    setSubmitting(true);
    setFeedbackMsg("");
    try {
      await apiSubmitFeedback({ pgStayId, rating, comment });
      setFeedbackMsg("Feedback submitted successfully!");
      setRating(0);
      setComment("");
      await fetchAll();
    } catch (err) {
      setFeedbackMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getIcon = (type) => {
    if (type === "success") return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (type === "alert")   return <AlertCircle  className="w-5 h-5 text-red-600" />;
    return <Bell className="w-5 h-5 text-blue-600" />;
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="tenant" />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-8 text-gray-800">Tenant Notifications & Feedback</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notifications */}
          <Card className="p-6 bg-white border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg text-gray-800 flex items-center gap-2">
                <Bell className="w-5 h-5" /> Notifications
                {unread > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">{unread}</span>}
              </h3>
              {unread > 0 && (
                <button onClick={handleMarkAll} className="text-xs text-blue-600 hover:underline">
                  Mark all read
                </button>
              )}
            </div>

            {loading ? <p className="text-sm text-gray-500">Loading...</p> : notifications.length === 0 ? (
              <p className="text-sm text-gray-500">No notifications yet.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif._id} className={`p-3 border rounded flex gap-3 ${notif.isRead ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"}`}>
                    {getIcon(notif.type)}
                    <div className="flex-1">
                      <p className="text-gray-800 text-sm mb-1">{notif.message}</p>
                      <span className="text-xs text-gray-500">{new Date(notif.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Feedback */}
          <div>
            <Card className="p-6 bg-white border border-gray-300">
              <h3 className="text-lg mb-4 text-gray-800">Submit Feedback</h3>

              {feedbackMsg && (
                <div className={`mb-4 p-3 rounded text-sm ${feedbackMsg.includes("success") ? "bg-green-50 text-green-700 border border-green-300" : "bg-red-50 text-red-700 border border-red-300"}`}>
                  {feedbackMsg}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-700 mb-2 block">Rate your PG experience</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRating(star)}>
                        <Star className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && <p className="text-sm text-gray-600 mt-1">{rating} out of 5 stars</p>}
                </div>

                <div>
                  <label className="text-sm text-gray-700 mb-2 block">PG Name</label>
                  {appliedPGs.length === 0 ? (
                    <p className="text-sm text-gray-500">No approved bookings to review yet.</p>
                  ) : (
                    <select
                      value={pgStayId}
                      onChange={(e) => setPgStayId(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800"
                    >
                      {appliedPGs.map((a) => (
                        <option key={a._id} value={a.pgStay?._id}>{a.pgStay?.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-700 mb-2 block">Your Feedback</label>
                  <Textarea
                    rows={4}
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="border-gray-300"
                  />
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleFeedback}
                  disabled={submitting || appliedPGs.length === 0}
                >
                  {submitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </Card>

            {/* Recent Feedback */}
            {myFeedback.length > 0 && (
              <Card className="p-6 bg-white border border-gray-300 mt-6">
                <h3 className="text-lg mb-4 text-gray-800">Your Recent Feedback</h3>
                <div className="space-y-3">
                  {myFeedback.map((fb) => (
                    <div key={fb._id} className="p-3 bg-gray-50 border border-gray-300 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-800">{fb.pgStay?.name}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-4 h-4 ${s <= fb.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{fb.comment}</p>
                      <span className="text-xs text-gray-500 block mt-1">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}