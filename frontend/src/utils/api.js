const BASE_URL = import.meta.env.VITE_API_URL;

// Token helpers
export const getToken = () => localStorage.getItem("token");
export const getUser  = () => {
  try {
    const raw = localStorage.getItem("user");
    // Guard against the literal string "undefined" being stored
    if (!raw || raw === "undefined" || raw === "null") return null;
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("user"); // wipe corrupt value so it doesn't keep crashing
    return null;
  }
};
export const saveAuth = (token, user) => {
  if (token) localStorage.setItem("token", token);
  if (user)  localStorage.setItem("user", JSON.stringify(user));
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

  if (res.status === 401) {
    const errorMessage = data?.message || "Unauthorized";
    if (endpoint !== "/auth/login") {
      clearAuth();
      window.location.href = "/login";
    }
    throw new Error(errorMessage);
  }

  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ── Auth ──────────────────────────────────────────────
export const apiLogin         = (body) => request("/auth/login",    { method: "POST", body: JSON.stringify(body) });
export const apiRegister      = (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) });
export const apiGetMe         = ()     => request("/auth/me");
export const apiUpdateProfile = (body) => request("/auth/profile",  { method: "PUT",  body: JSON.stringify(body) });

// Upload Aadhaar / identity document (multipart, max 15MB, JPG/PNG/PDF)
export const apiUploadAadhaar = (formData) => {
  const token = getToken();
  return fetch(`${BASE_URL}/auth/upload-aadhaar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");
    return data;
  });
};

// Upload profile photo (multipart, max 5MB, image only)
export const apiUploadProfilePhoto = (formData) => {
  const token = getToken();
  return fetch(`${BASE_URL}/auth/upload-profile-photo`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");
    return data;
  });
};

// ── PG Stays ──────────────────────────────────────────
export const apiGetRecommendations = ()           => request("/pgs/recommendations");
export const apiGetAllPGs          = (params = "") => request(`/pgs${params}`);
export const apiGetPGById          = (id)         => request(`/pgs/${id}`);
export const apiGetOwnerPGs        = ()           => request("/pgs/owner/mine");
export const apiCreatePG = (formData) => {
  const token = getToken();
  return fetch(`${BASE_URL}/pgs`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData, // FormData — browser sets Content-Type multipart automatically
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create PG");
    return data;
  });
};
export const apiUpdatePG           = (id, body)   => request(`/pgs/${id}`, { method: "PUT",   body: JSON.stringify(body) });
export const apiDeletePG           = (id)         => request(`/pgs/${id}`, { method: "DELETE" });

export const apiUploadPGImages = (pgId, formData) => {
  const token = getToken();
  return fetch(`${BASE_URL}/pgs/${pgId}/images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");
    return data;
  });
};

export const apiDeletePGImage = (pgId, imgId) =>
  request(`/pgs/${pgId}/images/${imgId}`, { method: "DELETE" });

// ── Rooms ─────────────────────────────────────────────
export const apiGetRooms   = (pgId)        => request(`/rooms/${pgId}`);
export const apiAddRoom    = (pgId, body)  => request(`/rooms/${pgId}`,   { method: "POST",   body: JSON.stringify(body) });
export const apiUpdateRoom = (roomId, body)=> request(`/rooms/${roomId}`, { method: "PUT",    body: JSON.stringify(body) });
export const apiDeleteRoom = (roomId)      => request(`/rooms/${roomId}`, { method: "DELETE" });

// ── Applications ──────────────────────────────────────
export const apiApply                = (body) => request("/applications",             { method: "POST", body: JSON.stringify(body) });
export const apiGetMyApplications    = ()     => request("/applications/my");
export const apiGetOwnerApplications = ()     => request("/applications/owner");
export const apiApproveApplication   = (id)  => request(`/applications/${id}/approve`, { method: "PUT" });
export const apiRejectApplication    = (id)  => request(`/applications/${id}/reject`,  { method: "PUT" });

// ── Bookings ──────────────────────────────────────────
export const apiGetMyBookings        = ()     => request("/bookings/my");
export const apiCreateBooking        = (body) => request("/bookings", { method: "POST", body: JSON.stringify(body) });
export const apiDeclineBooking       = (body) => request("/bookings/decline", { method: "POST", body: JSON.stringify(body) });
export const apiGetPGRoommates       = (pgId) => request(`/bookings/pg/${pgId}/roommates`);
export const apiGetOwnerBookings     = ()     => request("/bookings/owner");
export const apiOwnerCancelBooking   = (id)   => request(`/bookings/${id}/cancel-by-owner`, { method: "PUT" });
export const apiUploadBookingAgreement = (bookingId, formData) => {
  const token = getToken();
  return fetch(`${BASE_URL}/bookings/${bookingId}/agreement`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Agreement upload failed");
    return data;
  });
};
export const apiPayBooking          = (bookingId) => request(`/bookings/${bookingId}/pay`, { method: "PUT" });
export const apiCancelBooking       = (bookingId) => request("/bookings/cancel", { method: "POST", body: JSON.stringify({ bookingId }) });
export const apiUploadPaymentProof  = (bookingId, formData) => {
  const token = getToken();
  return fetch(`${BASE_URL}/bookings/${bookingId}/payment-proof`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Payment proof upload failed");
    return data;
  });
};
export const apiVerifyPayment       = (bookingId, body) => request(`/bookings/${bookingId}/verify-payment`, { method: "PUT", body: JSON.stringify(body) });

// ── Feedback ──────────────────────────────────────────
export const apiSubmitFeedback = (body)  => request("/feedback",       { method: "POST", body: JSON.stringify(body) });
export const apiGetMyFeedback  = ()      => request("/feedback/my");
export const apiGetPGFeedback  = (pgId)  => request(`/feedback/${pgId}`);

// ── Notifications ─────────────────────────────────────
export const apiGetNotifications = ()   => request("/notifications");
export const apiMarkRead         = (id) => request(`/notifications/${id}/read`, { method: "PUT" });
export const apiMarkAllRead      = ()   => request("/notifications/read-all",   { method: "PUT" });

// ── Complaints ────────────────────────────────────────
export const apiSubmitComplaint   = (body) => request("/complaints",    { method: "POST", body: JSON.stringify(body) });
export const apiGetMyComplaints   = ()     => request("/complaints/my");
export const apiGetOwnerComplaints = ()     => request("/complaints/owner");
export const apiOwnerUpdateComplaint = (id, body) => request(`/complaints/${id}/owner`, { method: "PUT", body: JSON.stringify(body) });

// ── Admin ─────────────────────────────────────────────
export const apiAdminStats       = ()     => request("/admin/stats");
export const apiAdminGetPGs      = ()     => request("/admin/pgs");
export const apiAdminVerifyPG    = (id)   => request(`/admin/pgs/${id}/verify`,      { method: "PUT" });
export const apiAdminRestrictPG  = (id)   => request(`/admin/pgs/${id}/restrict`,    { method: "PUT" });
export const apiAdminUnrestrictPG = (id)   => request(`/admin/pgs/${id}/unrestrict`,  { method: "PUT" });
export const apiAdminDeletePG    = (id)   => request(`/admin/pgs/${id}`,             { method: "DELETE" });
export const apiAdminGetUsers    = ()     => request("/admin/users");
export const apiAdminTrustScores = ()     => request("/admin/trustscores");
export const apiAdminSuspendUser = (id)   => request(`/admin/users/${id}/suspend`,   { method: "PUT" });
export const apiAdminUnsuspendUser = (id) => request(`/admin/users/${id}/unsuspend`, { method: "PUT" });
export const apiAdminVerifyUser  = (id)   => request(`/admin/users/${id}/verify`,    { method: "PUT" });
export const apiAdminDeleteUser  = (id)   => request(`/admin/users/${id}`,           { method: "DELETE" });
export const apiAdminWarnUser    = (id, body) => request(`/admin/users/${id}/warn`,    { method: "PUT", body: JSON.stringify(body) });
export const apiAdminSystemStats = ()     => request("/admin/system");
export const apiAdminGetComplaints    = ()   => request("/admin/complaints");
export const apiAdminResolveComplaint = (id) => request(`/admin/complaints/${id}/resolve`, { method: "PUT" });
export const apiAdminRejectComplaint  = (id) => request(`/admin/complaints/${id}/reject`,  { method: "PUT" });

// ── Google Maps: Nearby PGs ───────────────────────────────────────────────
// Calls GET /api/pgs/nearby?lat=&lng=&radius=
// Returns PGs near the given coordinate, sorted by distance, with distanceKm field.
export const apiGetNearbyPGs = ({ lat, lng, radius = 10000 }) =>
  request(`/pgs/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);