const BASE_URL = "http://localhost:5000/api";

// Token helpers
export const getToken = () => localStorage.getItem("token");
export const getUser  = () => JSON.parse(localStorage.getItem("user") || "null");
export const saveAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Core fetch wrapper
const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ── Auth ──────────────────────────────────────────────
export const apiLogin    = (body) => request("/auth/login",   { method: "POST", body: JSON.stringify(body) });
export const apiRegister = (body) => request("/auth/register",{ method: "POST", body: JSON.stringify(body) });
export const apiGetMe    = ()     => request("/auth/me");
export const apiUpdateProfile = (body) => request("/auth/profile", { method: "PUT", body: JSON.stringify(body) });

// ── PG Stays ──────────────────────────────────────────
export const apiGetRecommendations = () => request("/pgs/recommendations");
export const apiGetAllPGs          = (params = "") => request(`/pgs${params}`);
export const apiGetPGById          = (id) => request(`/pgs/${id}`);
export const apiGetOwnerPGs        = () => request("/pgs/owner/mine");
export const apiCreatePG           = (body) => request("/pgs", { method: "POST", body: JSON.stringify(body) });
export const apiUpdatePG           = (id, body) => request(`/pgs/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const apiDeletePG           = (id) => request(`/pgs/${id}`, { method: "DELETE" });

// ── Rooms ─────────────────────────────────────────────
export const apiGetRooms    = (pgId) => request(`/rooms/${pgId}`);
export const apiAddRoom     = (pgId, body) => request(`/rooms/${pgId}`, { method: "POST", body: JSON.stringify(body) });
export const apiUpdateRoom  = (roomId, body) => request(`/rooms/${roomId}`, { method: "PUT", body: JSON.stringify(body) });
export const apiDeleteRoom  = (roomId) => request(`/rooms/${roomId}`, { method: "DELETE" });

// ── Applications ──────────────────────────────────────
export const apiApply              = (body) => request("/applications", { method: "POST", body: JSON.stringify(body) });
export const apiGetMyApplications  = () => request("/applications/my");
export const apiGetOwnerApplications = () => request("/applications/owner");
export const apiApproveApplication = (id) => request(`/applications/${id}/approve`, { method: "PUT" });
export const apiRejectApplication  = (id) => request(`/applications/${id}/reject`,  { method: "PUT" });

// ── Feedback ──────────────────────────────────────────
export const apiSubmitFeedback  = (body) => request("/feedback", { method: "POST", body: JSON.stringify(body) });
export const apiGetMyFeedback   = () => request("/feedback/my");
export const apiGetPGFeedback   = (pgId) => request(`/feedback/${pgId}`);

// ── Notifications ─────────────────────────────────────
export const apiGetNotifications = () => request("/notifications");
export const apiMarkRead         = (id) => request(`/notifications/${id}/read`, { method: "PUT" });
export const apiMarkAllRead      = () => request("/notifications/read-all", { method: "PUT" });

// ── Admin ─────────────────────────────────────────────
export const apiAdminStats       = () => request("/admin/stats");
export const apiAdminGetPGs      = () => request("/admin/pgs");
export const apiAdminVerifyPG    = (id) => request(`/admin/pgs/${id}/verify`,   { method: "PUT" });
export const apiAdminRestrictPG  = (id) => request(`/admin/pgs/${id}/restrict`, { method: "PUT" });
export const apiAdminDeletePG    = (id) => request(`/admin/pgs/${id}`,          { method: "DELETE" });
export const apiAdminGetUsers    = () => request("/admin/users");
export const apiAdminTrustScores = () => request("/admin/trustscores");
export const apiAdminSuspendUser = (id) => request(`/admin/users/${id}/suspend`, { method: "PUT" });
export const apiAdminVerifyUser  = (id) => request(`/admin/users/${id}/verify`,  { method: "PUT" });
export const apiAdminSystemStats = () => request("/admin/system");