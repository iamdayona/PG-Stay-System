import { useEffect, useRef, useState } from "react";
import { Upload, CheckCircle2, Save, Camera, FileText, Eye } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { apiGetMe, apiUpdateProfile, apiUploadAadhaar, apiUploadProfilePhoto, getUser } from "../utils/api";
import { toast } from "../components/Toast";
import { CLAY_BASE, injectClay, CLAY_TENANT } from "../styles/claystyles";
import OtpField from "../components/OtpField";

const PAGE_CSS = `
  .profile-grid { display:grid; grid-template-columns:260px 1fr; gap:24px; }
  @media(max-width:760px){ .profile-grid{grid-template-columns:1fr;} }
  /* ── Avatar card ── */
  .avatar-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:28px; padding:32px 24px; box-shadow:0 8px 28px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95); text-align:center; animation:fadeUp .6s ease both; height:fit-content; position:relative; overflow:hidden; }
  .avatar-card::before { content:''; position:absolute; top:0; left:0; right:0; height:5px; background:linear-gradient(90deg,#42a5f5,#e040fb,#66bb6a); border-radius:28px 28px 0 0; }
  /* ── Profile photo ring ── */
  .avatar-ring-wrap { position:relative; width:110px; height:110px; margin:0 auto 16px; cursor:pointer; }
  .avatar-ring { width:110px; height:110px; border-radius:50%; background:linear-gradient(135deg,#bbdefb,#e3f2fd); border:4px solid rgba(255,255,255,.95); box-shadow:0 8px 28px rgba(66,165,245,.25),inset 0 2px 0 rgba(255,255,255,.8); display:flex; align-items:center; justify-content:center; font-size:2.8rem; overflow:hidden; }
  .avatar-ring img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
  .avatar-photo-overlay { position:absolute; bottom:0; right:0; width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#42a5f5,#1e88e5); border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(66,165,245,.4); transition:transform .15s; }
  .avatar-ring-wrap:hover .avatar-photo-overlay { transform:scale(1.1); }
  .avatar-photo-uploading { position:absolute; inset:0; border-radius:50%; background:rgba(66,165,245,.35); display:flex; align-items:center; justify-content:center; font-size:.72rem; font-weight:700; color:white; }
  .avatar-name { font-family:'Nunito',sans-serif; font-size:1.3rem; font-weight:900; color:#2d2d4e; margin-bottom:10px; }
  .avatar-role-badge { display:inline-block; background:rgba(227,242,253,.9); color:#1565c0; border:1.5px solid rgba(144,202,249,.5); border-radius:50px; padding:5px 16px; font-size:.75rem; font-weight:700; }
  /* ── Trust score ring ── */
  .score-ring { margin:22px auto 0; width:90px; height:90px; position:relative; display:flex; align-items:center; justify-content:center; }
  .score-ring svg { position:absolute; top:0; left:0; transform:rotate(-90deg); }
  .score-ring-bg   { fill:none; stroke:rgba(200,200,220,.3); stroke-width:7; }
  .score-ring-fill { fill:none; stroke-width:7; stroke-linecap:round; transition:stroke-dashoffset .8s ease; }
  .score-value { font-family:'Nunito',sans-serif; font-size:1.5rem; font-weight:900; color:#1565c0; z-index:1; }
  .score-label { font-size:.65rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; text-align:center; margin-top:6px; }
  /* ── Details card ── */
  .details-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:28px; padding:32px; box-shadow:0 8px 28px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95); animation:fadeUp .7s ease both; }
  .tab-row { display:flex; gap:8px; margin-bottom:24px; flex-wrap:wrap; }
  .tab-btn { padding:8px 20px; border-radius:50px; border:2px solid rgba(255,255,255,.85); background:rgba(255,255,255,.6); font-family:'Poppins',sans-serif; font-size:.82rem; font-weight:700; cursor:pointer; color:#5a5a7a; transition:all .18s; }
  .tab-btn.active { background:linear-gradient(135deg,#42a5f5,#1e88e5); color:white; border-color:transparent; box-shadow:0 4px 0 #1565c0,0 6px 14px rgba(66,165,245,.35); }
  .form-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
  @media(max-width:600px){ .form-grid2{grid-template-columns:1fr;} }
  .form-group { display:flex; flex-direction:column; gap:6px; }
  .save-btn { width:100%; padding:14px 22px; border:none; border-radius:16px; font-family:'Poppins',sans-serif; font-size:.92rem; font-weight:700; cursor:pointer; background:linear-gradient(135deg,#42a5f5,#1e88e5); color:white; box-shadow:0 5px 0 #1565c0,0 8px 20px rgba(66,165,245,.35),inset 0 1px 0 rgba(255,255,255,.3); transition:transform .15s,filter .15s; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:8px; }
  .save-btn:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }
  .save-btn:disabled { opacity:.6; cursor:not-allowed; }
  /* ── Aadhaar upload zone ── */
  .upload-zone { width:100%; padding:22px 20px; border-radius:18px; cursor:pointer; background:rgba(255,255,255,.72); border:2.5px dashed rgba(144,202,249,.7); font-family:'Poppins',sans-serif; font-size:.88rem; font-weight:600; color:#5a5a7a; box-shadow:0 4px 14px rgba(0,0,0,.06); transition:all .2s; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; margin-bottom:14px; text-align:center; }
  .upload-zone:hover { transform:translateY(-2px); border-color:rgba(66,165,245,.6); background:rgba(227,242,253,.6); }
  .upload-zone-icon { font-size:2rem; }
  .upload-zone-title { font-weight:700; color:#2d2d4e; font-size:.92rem; }
  .upload-zone-sub { font-size:.75rem; color:#9a9ab0; }
  .upload-zone-uploading { border-color:rgba(66,165,245,.8); background:rgba(227,242,253,.7); }
  /* ── Aadhaar preview ── */
  .doc-preview-box { background:rgba(227,242,253,.6); border:2px solid rgba(144,202,249,.5); border-radius:16px; padding:16px; margin-bottom:14px; display:flex; align-items:center; gap:14px; }
  .doc-preview-img { width:80px; height:60px; object-fit:cover; border-radius:10px; border:2px solid rgba(255,255,255,.9); box-shadow:0 3px 10px rgba(0,0,0,.1); }
  .doc-preview-pdf { width:80px; height:60px; border-radius:10px; border:2px solid rgba(255,255,255,.9); background:linear-gradient(135deg,#ef5350,#e53935); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; color:white; font-size:.65rem; font-weight:700; }
  .doc-preview-info { flex:1; }
  .doc-preview-label { font-size:.7rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:3px; }
  .doc-preview-status { font-size:.82rem; font-weight:700; color:#2d2d4e; margin-bottom:6px; }
  .doc-view-btn { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:10px; background:rgba(66,165,245,.15); border:1.5px solid rgba(66,165,245,.3); color:#1565c0; font-size:.76rem; font-weight:700; text-decoration:none; cursor:pointer; transition:all .15s; }
  .doc-view-btn:hover { background:rgba(66,165,245,.25); }
  /* ── Stat rows ── */
  .stat-row { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; background:rgba(255,255,255,.55); border:2px solid rgba(255,255,255,.85); border-radius:16px; margin-bottom:10px; box-shadow:0 3px 12px rgba(0,0,0,.06); transition:transform .15s; }
  .stat-row:hover { transform:translateX(4px); }
  .stat-row-label { font-size:.82rem; color:#5a5a7a; font-weight:600; display:flex; align-items:center; gap:8px; }
  .stat-row-value { font-family:'Nunito',sans-serif; font-size:1.4rem; font-weight:900; }
  .val-blue{color:#1565c0;} .val-green{color:#2e7d32;} .val-yellow{color:#f57f17;}
  .verified-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(232,245,233,.9); color:#2e7d32; border:1.5px solid rgba(165,214,167,.5); border-radius:50px; padding:6px 16px; font-size:.8rem; font-weight:700; }
  .pending-badge  { display:inline-flex; align-items:center; gap:6px; background:rgba(255,249,196,.9); color:#f57f17; border:1.5px solid rgba(255,224,130,.5); border-radius:50px; padding:6px 16px; font-size:.8rem; font-weight:700; }
  .unverified-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(255,235,238,.9); color:#c62828; border:1.5px solid rgba(239,154,154,.5); border-radius:50px; padding:6px 16px; font-size:.8rem; font-weight:700; }
  .upload-hint { font-size:.75rem; color:#9a9ab0; margin-bottom:18px; }
`;

const css = injectClay(CLAY_BASE, CLAY_TENANT, PAGE_CSS);
const CIRCUMFERENCE = 2 * Math.PI * 36;

function ScoreRing({ value, color = "#42a5f5" }) {
  const offset = CIRCUMFERENCE * (1 - Math.min(value / 100, 1));
  return (
    <>
      <div className="score-ring">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle className="score-ring-bg" cx="45" cy="45" r="36" />
          <circle className="score-ring-fill" cx="45" cy="45" r="36"
            stroke={color} strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset} />
        </svg>
        <span className="score-value" style={{ color }}>{value}</span>
      </div>
      <div className="score-label">Trust Score</div>
    </>
  );
}

export default function TenantProfile() {
  const [user, setUser]             = useState(getUser());
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [activeTab, setActiveTab]   = useState("details");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc]     = useState(false);

  const photoInputRef = useRef(null);
  const docInputRef   = useRef(null);

  const [form, setForm] = useState({
    name:"", phone:"", gender:"",
    prefLocation:"", prefBudgetMin:"", prefBudgetMax:"",
  });

  useEffect(() => {
    apiGetMe()
      .then((res) => {
        setUser(res.user);
        setForm({
          name:         res.user.name               || "",
          phone:        res.user.phone              || "",
          gender:       res.user.gender             || "",
          prefLocation: res.user.preferences?.location  || "",
          prefBudgetMin:res.user.preferences?.budgetMin || "",
          prefBudgetMax:res.user.preferences?.budgetMax || "",
        });
        setPhoneVerified(!!res.user.phone);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.warning("Name cannot be empty"); return; }
    setSaving(true);
    try {
      const res = await apiUpdateProfile({
        name: form.name, phone: form.phone, gender: form.gender,
        preferences: {
          location:  form.prefLocation,
          budgetMin: Number(form.prefBudgetMin) || 0,
          budgetMax: Number(form.prefBudgetMax) || 50000,
        },
      });
      setUser(res.user);
      localStorage.setItem("user", JSON.stringify(res.user));
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally { setSaving(false); }
  };

  // ── Profile photo ──────────────────────────────────────────────────
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file."); return; }
    if (file.size > 5 * 1024 * 1024)    { toast.error("Profile photo must be under 5MB."); return; }

    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await apiUploadProfilePhoto(fd);
      const updated = { ...user, profilePhotoUrl: res.profilePhotoUrl };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      toast.success("Profile photo updated!");
    } catch (err) {
      toast.error(err.message);
    } finally { setUploadingPhoto(false); }
  };

  // ── Aadhaar upload ─────────────────────────────────────────────────
  const handleDocChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) { toast.error("Only JPG, PNG, or PDF files allowed."); return; }
    if (file.size > 15 * 1024 * 1024) { toast.error("Document must be under 15MB."); return; }

    setUploadingDoc(true);
    try {
      const fd = new FormData();
      fd.append("aadhaar", file);
      const res = await apiUploadAadhaar(fd);
      const updated = {
        ...user,
        documentUrl: res.documentUrl,
        documentFileType: res.documentFileType,
        verificationStatus: res.verificationStatus,
      };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      toast.success("Aadhaar uploaded! Verification is now pending.");
    } catch (err) {
      toast.error(err.message);
    } finally { setUploadingDoc(false); }
  };

  const verificationBadge = () => {
    if (user?.verificationStatus === "verified")
      return <span className="verified-badge"><CheckCircle2 size={14}/> Verified</span>;
    if (user?.verificationStatus === "pending")
      return <span className="pending-badge">⏳ Pending Review</span>;
    return <span className="unverified-badge">❌ Unverified</span>;
  };

  if (loading) return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="tenant" />
        <main className="clay-main"><div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading profile…</div></main>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="tenant" />
        <main className="clay-main">
          <div className="clay-container">
            <h2 className="clay-page-title">👤 Profile & Verification</h2>
            <p className="clay-page-sub">Manage your identity and track your trust score.</p>

            <div className="profile-grid">
              {/* ── Left: avatar card ── */}
              <div className="avatar-card">
                {/* Profile photo with upload overlay */}
                <div className="avatar-ring-wrap" onClick={() => photoInputRef.current?.click()}>
                  <div className="avatar-ring">
                    {user?.profilePhotoUrl
                      ? <img src={user.profilePhotoUrl} alt="Profile" />
                      : (user?.name ? user.name[0].toUpperCase() : "🧑")}
                  </div>
                  {uploadingPhoto
                    ? <div className="avatar-photo-uploading">⏳</div>
                    : <div className="avatar-photo-overlay"><Camera size={14} color="white"/></div>}
                  <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhotoChange}/>
                </div>
                <div style={{fontSize:".7rem",color:"#9a9ab0",marginBottom:12}}>Tap photo to change</div>
                <div className="avatar-name">{user?.name}</div>
                <span className="avatar-role-badge">🏠 Tenant</span>
                <ScoreRing value={user?.trustScore || 0} />
              </div>

              {/* ── Right: details card ── */}
              <div className="details-card">
                <div className="tab-row">
                  <button className={`tab-btn ${activeTab==="details"?"active":""}`}     onClick={() => setActiveTab("details")}>📋 Details</button>
                  <button className={`tab-btn ${activeTab==="preferences"?"active":""}`} onClick={() => setActiveTab("preferences")}>🎛️ Preferences</button>
                  <button className={`tab-btn ${activeTab==="verification"?"active":""}`}onClick={() => setActiveTab("verification")}>🔐 Verification</button>
                </div>

                {/* ── Details tab ── */}
                {activeTab === "details" && (
                  <div>
                    <div className="clay-section-title">📋 Personal Details</div>
                    <div className="form-grid2">
                      <div className="form-group">
                        <label className="clay-label">Full Name</label>
                        <input className="clay-input" value={form.name} onChange={(e) => setForm({...form, name:e.target.value})} placeholder="Your full name" />
                      </div>
                      <div className="form-group">
                        <label className="clay-label">Phone Number</label>
                        <input className="clay-input" value={form.phone} onChange={(e) => setForm({...form, phone:e.target.value})} placeholder="+91 98765 43210" />
                      </div>
                      <div className="form-group">
                        <label className="clay-label">Email Address</label>
                        <input className="clay-input" value={user?.email || ""} disabled style={{opacity:.6}} />
                      </div>
                      <div className="form-group">
                        <label className="clay-label">Gender</label>
                        <select className="clay-input" value={form.gender} onChange={(e) => setForm({...form, gender:e.target.value})}>
                          <option value="">Prefer not to say</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <button className="save-btn" onClick={handleSave} disabled={saving}>
                      <Save size={16}/> {saving?"Saving…":"Save Changes"}
                    </button>
                  </div>
                )}

                {/* ── Preferences tab ── */}
                {activeTab === "preferences" && (
                  <div>
                    <div className="clay-section-title">🎛️ PG Search Preferences</div>
                    <div className="form-grid2">
                      <div className="form-group" style={{gridColumn:"1 / -1"}}>
                        <label className="clay-label">Preferred Location</label>
                        <input className="clay-input" value={form.prefLocation} onChange={(e) => setForm({...form, prefLocation:e.target.value})} placeholder="e.g. Koramangala, Bangalore" />
                      </div>
                      <div className="form-group">
                        <label className="clay-label">Min Budget (₹/month)</label>
                        <input className="clay-input" type="number" value={form.prefBudgetMin} onChange={(e) => setForm({...form, prefBudgetMin:e.target.value})} placeholder="e.g. 5000" />
                      </div>
                      <div className="form-group">
                        <label className="clay-label">Max Budget (₹/month)</label>
                        <input className="clay-input" type="number" value={form.prefBudgetMax} onChange={(e) => setForm({...form, prefBudgetMax:e.target.value})} placeholder="e.g. 15000" />
                      </div>
                    </div>
                    <p style={{fontSize:".8rem",color:"#9a9ab0",marginBottom:16}}>💡 These preferences personalise PG recommendations for you.</p>
                    <button className="save-btn" onClick={handleSave} disabled={saving}>
                      <Save size={16}/> {saving?"Saving…":"Save Preferences"}
                    </button>
                  </div>
                )}

                {/* ── Verification tab ── */}
                {activeTab === "verification" && (
                  <div>
                    <div className="clay-section-title">📱 Mobile Verification</div>
                    <p style={{fontSize:".82rem",color:"#7a7a9a",marginBottom:16}}>
                      Verify your mobile number to increase your trust score.
                    </p>
                    <OtpField
                      type="phone"
                      value={form.phone}
                      onChange={(val) => { setForm({...form, phone:val}); setPhoneVerified(false); }}
                      onVerified={() => { setPhoneVerified(true); toast.success("Mobile verified! Save your profile to update."); }}
                      accent="#42a5f5"
                      accentDark="#1565c0"
                    />
                    {phoneVerified && (
                      <button className="save-btn" onClick={handleSave} disabled={saving} style={{marginBottom:20}}>
                        <Save size={16}/> {saving?"Saving…":"Save Verified Number"}
                      </button>
                    )}

                    <div className="clay-divider" />
                    <div className="clay-section-title">🪪 Aadhaar / Identity Verification</div>
                    <p style={{fontSize:".82rem",color:"#7a7a9a",marginBottom:14}}>
                      Upload your Aadhaar card or Student ID for identity verification. Once uploaded, admin will review and verify your account.
                    </p>

                    {/* Show existing document preview */}
                    {user?.documentUrl && (
                      <div className="doc-preview-box">
                        {user.documentFileType === "pdf"
                          ? <div className="doc-preview-pdf"><FileText size={22}/><span>PDF</span></div>
                          : <img className="doc-preview-img" src={user.documentUrl} alt="Aadhaar" />}
                        <div className="doc-preview-info">
                          <div className="doc-preview-label">Uploaded Document</div>
                          <div className="doc-preview-status">Aadhaar / ID Card</div>
                          <a className="doc-view-btn" href={user.documentUrl} target="_blank" rel="noreferrer">
                            <Eye size={12}/> View Document
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Upload zone */}
                    <label
                      className={`upload-zone ${uploadingDoc ? "upload-zone-uploading" : ""}`}
                      htmlFor="tenant-doc-upload"
                      style={{cursor: uploadingDoc ? "not-allowed" : "pointer"}}
                    >
                      <input id="tenant-doc-upload" type="file" accept=".jpg,.jpeg,.png,.pdf"
                        style={{display:"none"}} onChange={handleDocChange} ref={docInputRef} disabled={uploadingDoc}/>
                      <div className="upload-zone-icon">{uploadingDoc ? "⏳" : "🪪"}</div>
                      <div className="upload-zone-title">
                        {uploadingDoc ? "Uploading…" : user?.documentUrl ? "Replace Document" : "Upload Aadhaar / ID"}
                      </div>
                      <div className="upload-zone-sub">JPG · PNG · PDF &nbsp;·&nbsp; Max 15MB</div>
                    </label>

                    <div className="clay-divider" />

                    {/* Status rows */}
                    <div className="stat-row">
                      <span className="stat-row-label">🔐 Verification Status</span>
                      {verificationBadge()}
                    </div>
                    <div className="stat-row">
                      <span className="stat-row-label">📊 Profile Completion</span>
                      <span className="stat-row-value val-blue">{user?.profileCompletion || 0}%</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-row-label">⭐ Trust Score</span>
                      <span className="stat-row-value val-green">{user?.trustScore || 0}<span style={{fontSize:".7rem",color:"#9a9ab0"}}>/100</span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}