import { useEffect, useState, useRef } from "react";
import RoleNavigation from "../context/RoleNavigation";
import Modal from "../components/Modal";
import { toast } from "../components/Toast";
import ConfirmationModal from "../components/ConfirmationModal";
import { getUser, apiGetMe, apiGetOwnerPGs, apiCreatePG, apiUpdatePG, apiDeletePG, apiGetRooms, apiAddRoom, apiUpdateRoom, apiDeleteRoom, apiGetOwnerBookings } from "../utils/api";
import { CLAY_BASE, CLAY_OWNER, injectClay } from "../styles/claystyles";
import { Plus, Trash2, ImagePlus, ChevronDown, X, Edit3, MapPin } from "lucide-react";
import { apiUploadPGImages, apiDeletePGImage } from "../utils/api";
import { toSentenceCase } from "../utils/capitalization";

/* ─── Predefined amenities list ─── */
const AMENITY_OPTIONS = [
  "Furnished Room","Clean Bathroom & Toilets","Electricity & Power Supply",
  "Running Water","Safe Drinking Water","Food / Meal Service","Internet / Wi-Fi",
  "Housekeeping","Laundry Facilities","Security & Safety","Refrigerator",
  "Induction or Microwave for Basic Cooking","Common Lounge or Seating Area",
  "Parking for Vehicles","AC","CCTV","Gym","24/7 Water Supply",
];

const KERALA_CENTER = { lat: 10.8505, lng: 76.2711 };

const PAGE_CSS = `
  .pg-tab-row { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:28px; }
  .pg-tab { padding:10px 22px; border:2.5px solid rgba(255,255,255,.85); border-radius:50px; font-family:'Poppins',sans-serif; font-size:.83rem; font-weight:700; cursor:pointer; background:rgba(255,255,255,.65); backdrop-filter:blur(12px); color:#5a5a7a; box-shadow:0 4px 14px rgba(0,0,0,.07),0 3px 0 rgba(0,0,0,.05); transition:all .18s; }
  .pg-tab:hover { transform:translateY(-2px); }
  .pg-tab.active { background:linear-gradient(135deg,#ffa726,#ff8f00); color:white; border-color:transparent; box-shadow:0 5px 0 #e65100,0 8px 20px rgba(255,167,38,.4); transform:translateY(-2px); }
  .new-pg-tab { padding:10px 22px; border:2.5px dashed rgba(255,167,38,.55); border-radius:50px; font-family:'Poppins',sans-serif; font-size:.83rem; font-weight:700; cursor:pointer; background:rgba(255,248,225,.6); color:#f57f17; transition:all .18s; }
  .new-pg-tab:hover { border-color:rgba(255,167,38,.85); background:rgba(255,248,225,.9); transform:translateY(-2px); }
  .pg-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:24px; padding:32px; box-shadow:0 8px 28px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95); margin-bottom:24px; animation:fadeUp .6s ease both; position:relative; overflow:visible; }
  .pg-card.card-orange { z-index:1000; }
  .pg-card.card-amber  { z-index:0; }
  .pg-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:24px 24px 0 0; }
  .card-orange::before { background:linear-gradient(90deg,#ffa726,#ffcc02); }
  .card-amber::before  { background:linear-gradient(90deg,#ff8f00,#ffa726); }
  .pg-section-title { font-family:'Nunito',sans-serif; font-size:1.1rem; font-weight:800; color:#2d2d4e; margin-bottom:24px; display:flex; align-items:center; justify-content:space-between; }
  .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:8px; }
  @media(max-width:600px){ .form-grid{grid-template-columns:1fr;} }
  .form-group { display:flex; flex-direction:column; }
  .pg-alert { border-radius:14px; padding:12px 16px; margin-bottom:18px; font-size:.85rem; font-weight:500; display:flex; align-items:center; gap:8px; animation:fadeIn .3s ease; }
  .pg-alert-info    { background:rgba(255,248,225,.9); border:2px solid rgba(255,224,130,.6); color:#f57f17; }
  .pg-alert-success { background:rgba(232,245,233,.9); border:2px solid rgba(165,214,167,.5); color:#2e7d32; }
  .update-btn { width:100%; margin-top:18px; padding:14px 22px; border:none; border-radius:16px; font-family:'Poppins',sans-serif; font-size:.92rem; font-weight:700; cursor:pointer; justify-content:center; background:linear-gradient(135deg,#ffa726,#fb8c00); color:white; box-shadow:0 5px 0 #e65100,0 8px 20px rgba(255,167,38,.35),inset 0 1px 0 rgba(255,255,255,.3); transition:transform .15s,box-shadow .15s,filter .15s; }
  .update-btn:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }
  .update-btn:disabled { opacity:.6; cursor:not-allowed; }
  .delete-pg-btn { width:auto; padding:12px 18px; margin-left:12px; background:linear-gradient(135deg,#ef5350,#d32f2f); box-shadow:0 5px 0 #b71c1c,0 8px 20px rgba(239,83,80,.35),inset 0 1px 0 rgba(255,255,255,.2); }
  .room-action-btn { width:auto; padding:10px 14px; margin-top:10px; border:none; border-radius:12px; font-size:.82rem; font-weight:700; cursor:pointer; color:white; transition:filter .15s,transform .15s; }
  .room-edit-btn { background:linear-gradient(135deg,#42a5f5,#1e88e5); }
  .room-delete-btn { background:linear-gradient(135deg,#ef5350,#c62828); margin-left:8px; }
  .add-room-btn { padding:10px 20px; border:none; border-radius:14px; font-family:'Poppins',sans-serif; font-size:.85rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:7px; background:linear-gradient(135deg,#66bb6a,#43a047); color:white; box-shadow:0 5px 0 #2e7d32,0 8px 18px rgba(102,187,106,.3),inset 0 1px 0 rgba(255,255,255,.3); transition:transform .15s,box-shadow .15s,filter .15s; }
  .add-room-btn:hover { filter:brightness(1.06); transform:translateY(-2px); }
  .rooms-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
  @media(max-width:700px){ .rooms-grid{grid-template-columns:repeat(2,1fr);} }
  @media(max-width:420px){ .rooms-grid{grid-template-columns:1fr;} }
  .room-card { background:rgba(255,255,255,.62); backdrop-filter:blur(12px); border:2px solid rgba(255,255,255,.85); border-radius:18px; padding:18px; box-shadow:0 4px 16px rgba(0,0,0,.07),inset 0 1px 0 rgba(255,255,255,.9); transition:transform .2s; animation:fadeUp .5s ease both; position:relative; overflow:hidden; z-index:0; }
  .room-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:18px 18px 0 0; }
  .room-avail::before   { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .room-unavail::before { background:linear-gradient(90deg,#ef9a9a,#e57373); }
  .room-card:hover { transform:translateY(-3px); }
  .roommate-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px; margin-top:16px; }
  .roommate-card { background:rgba(255,255,255,.95); border:1px solid rgba(200,200,220,.8); border-radius:16px; padding:14px; display:flex; flex-direction:column; gap:10px; min-height:140px; }
  .roommate-avatar { width:44px; height:44px; border-radius:50%; overflow:hidden; display:grid; place-items:center; background:rgba(200,200,220,.25); color:#2d2d4e; font-weight:700; font-size:1rem; }
  .roommate-name { font-size:.95rem; font-weight:700; color:#2d2d4e; }
  .roommate-bio { font-size:.82rem; color:#5a5a7a; line-height:1.5; }
  .roommate-empty { margin-top:14px; color:#7a7a9a; font-size:.85rem; }
  .room-type  { font-family:'Nunito',sans-serif; font-size:.95rem; font-weight:800; color:#2d2d4e; margin-bottom:5px; }
  .room-rent  { font-size:.82rem; color:#7a7a9a; margin-bottom:14px; font-weight:500; }
  .toggle-row   { display:flex; align-items:center; justify-content:space-between; }
  .toggle-label { font-size:.75rem; font-weight:700; color:#5a5a7a; }
  .toggle-wrap  { position:relative; width:44px; height:24px; }
  .toggle-wrap input { opacity:0; width:0; height:0; position:absolute; }
  .toggle-slider { position:absolute; cursor:pointer; inset:0; border-radius:50px; transition:.3s; background:rgba(200,200,220,.5); box-shadow:inset 0 2px 4px rgba(0,0,0,.1); }
  .toggle-slider::before { content:''; position:absolute; height:18px; width:18px; left:3px; bottom:3px; background:white; border-radius:50%; transition:.3s; box-shadow:0 2px 6px rgba(0,0,0,.15); }
  .toggle-wrap input:checked + .toggle-slider { background:linear-gradient(135deg,#66bb6a,#43a047); box-shadow:0 3px 10px rgba(102,187,106,.35); }
  .toggle-wrap input:checked + .toggle-slider::before { transform:translateX(20px); }
  .room-empty { text-align:center; padding:40px 24px; color:#9a9ab0; font-size:.88rem; }
  .room-empty-emoji { font-size:2.5rem; margin-bottom:10px; display:block; }
  .photo-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:16px; }
  @media(max-width:600px){ .photo-grid{grid-template-columns:repeat(2,1fr);} }
  .photo-thumb { position:relative; border-radius:14px; overflow:hidden; aspect-ratio:4/3; background:rgba(200,200,220,.2); border:2px solid rgba(255,255,255,.8); box-shadow:0 4px 12px rgba(0,0,0,.08); }
  .photo-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
  .photo-del-btn { position:absolute; top:6px; right:6px; background:rgba(220,50,50,.88); border:none; border-radius:50%; width:26px; height:26px; cursor:pointer; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .2s; }
  .photo-thumb:hover .photo-del-btn { opacity:1; }
  .upload-zone { border:2.5px dashed rgba(255,167,38,.55); border-radius:16px; padding:24px; text-align:center; cursor:pointer; transition:all .18s; background:rgba(255,248,225,.4); }
  .upload-zone:hover { border-color:rgba(255,167,38,.9); background:rgba(255,248,225,.7); }
  .upload-zone-label { display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; color:#f57f17; font-weight:600; font-size:.88rem; }
  .upload-zone input[type="file"] { display:none; }
  .amenity-wrapper { position:relative; z-index:9999; overflow:visible; }
  .amenity-display { display:flex; align-items:center; justify-content:space-between; min-height:44px; padding:10px 14px; background:rgba(255,255,255,.7); border:2px solid rgba(255,255,255,.9); border-radius:14px; cursor:pointer; box-shadow:0 3px 10px rgba(0,0,0,.06); gap:8px; flex-wrap:wrap; overflow:visible; position:relative; }
  .amenity-display:hover { border-color:rgba(255,167,38,.5); }
  .amenity-tag { display:inline-flex; align-items:center; gap:4px; background:linear-gradient(135deg,rgba(255,167,38,.2),rgba(255,204,2,.2)); border:1.5px solid rgba(255,167,38,.4); border-radius:20px; padding:3px 10px; font-size:.75rem; font-weight:600; color:#e65100; }
  .amenity-tag button { background:none; border:none; cursor:pointer; color:#e65100; display:flex; padding:0; }
  .amenity-placeholder { color:#9a9ab0; font-size:.85rem; font-style:italic; }
  .amenity-dropdown { position:absolute; top:calc(100% + 6px); left:0; right:0; background:rgba(255,255,255,.97); backdrop-filter:blur(20px); border:2px solid rgba(255,255,255,.9); border-radius:18px; box-shadow:0 16px 50px rgba(0,0,0,.18); z-index:99999; max-height:260px; overflow-y:auto; padding:8px 0; }
  .amenity-option { padding:10px 16px; cursor:pointer; font-size:.85rem; font-weight:500; color:#3a3a5e; display:flex; align-items:center; gap:10px; transition:background .12s; }
  .amenity-option:hover { background:rgba(255,167,38,.08); }
  .amenity-option.selected { color:#e65100; background:rgba(255,167,38,.1); }
  .amenity-check { width:16px; height:16px; border-radius:4px; border:2px solid rgba(255,167,38,.5); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:.65rem; }
  .amenity-check.checked { background:linear-gradient(135deg,#ffa726,#fb8c00); border-color:transparent; color:white; }
  .amenity-divider { height:1px; background:rgba(0,0,0,.06); margin:6px 8px; }
  .amenity-other-row { display:flex; gap:6px; padding:6px 10px 10px; }
  .amenity-other-input { flex:1; padding:8px 12px; border:2px solid rgba(255,167,38,.3); border-radius:10px; font-size:.83rem; outline:none; background:rgba(255,248,225,.5); font-family:inherit; }
  .amenity-other-input:focus { border-color:rgba(255,167,38,.7); }
  .amenity-add-btn { padding:8px 14px; background:linear-gradient(135deg,#ffa726,#fb8c00); color:white; border:none; border-radius:10px; font-size:.8rem; font-weight:700; cursor:pointer; white-space:nowrap; }
  .room-type-row { display:flex; gap:12px; margin-bottom:4px; }
  .room-type-btn { flex:1; padding:12px; border:2.5px solid rgba(200,200,220,.5); border-radius:14px; font-size:.88rem; font-weight:700; cursor:pointer; background:rgba(255,255,255,.6); color:#5a5a7a; transition:all .16s; text-align:center; }
  .room-type-btn.active { border-color:#ffa726; background:linear-gradient(135deg,rgba(255,167,38,.15),rgba(255,204,2,.1)); color:#e65100; box-shadow:0 3px 12px rgba(255,167,38,.2); }
  .license-upload-zone { width:100%; padding:18px 16px; border-radius:14px; cursor:pointer; background:rgba(255,255,255,.72); border:2.5px dashed rgba(255,167,38,.55); font-family:'Poppins',sans-serif; font-size:.85rem; font-weight:600; color:#5a5a7a; transition:all .2s; display:flex; align-items:center; gap:12px; }
  .license-upload-zone:hover { border-color:rgba(255,167,38,.85); background:rgba(255,248,225,.6); }
  .license-upload-zone input[type="file"] { display:none; }
  .license-upload-ready { border-color:rgba(102,187,106,.7); background:rgba(232,245,233,.6); color:#2e7d32; }
  .license-error { color:#c62828; font-size:.78rem; font-weight:600; margin-top:6px; display:flex; align-items:center; gap:5px; }
  .license-required-badge { display:inline-flex; align-items:center; gap:4px; background:rgba(255,235,238,.9); color:#c62828; border:1.5px solid rgba(239,154,154,.5); border-radius:50px; padding:3px 10px; font-size:.72rem; font-weight:700; margin-left:8px; }
  /* ── Creation date read-only info box ── */
  .created-info-box { display:inline-flex; align-items:center; gap:8px; padding:8px 16px; background:rgba(255,248,225,.85); border:1.5px solid rgba(255,224,130,.5); border-radius:50px; font-size:.76rem; font-weight:700; color:#b86900; margin-bottom:18px; box-shadow:0 2px 8px rgba(255,167,38,.1); user-select:none; pointer-events:none; }
  .room-created-badge { display:inline-flex; align-items:center; gap:4px; font-size:.7rem; font-weight:600; color:#9a9ab0; margin-top:6px; background:rgba(245,245,250,.85); border:1px solid rgba(200,200,220,.4); border-radius:50px; padding:2px 9px; }
  /* ── Location display bar ── */
  .location-bar { display:flex; align-items:center; gap:10px; padding:11px 16px; background:rgba(255,255,255,.7); border:2px solid rgba(255,255,255,.9); border-radius:14px; box-shadow:0 3px 10px rgba(0,0,0,.06); min-height:46px; }
  .location-bar-text { flex:1; font-size:.88rem; color:#2d2d4e; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .location-bar-placeholder { flex:1; font-size:.85rem; color:#9a9ab0; font-style:italic; }
  .set-location-btn { flex-shrink:0; display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border:none; border-radius:10px; font-family:'Poppins',sans-serif; font-size:.82rem; font-weight:700; cursor:pointer; background:linear-gradient(135deg,#ffa726,#fb8c00); color:white; box-shadow:0 3px 0 #e65100,0 5px 12px rgba(255,167,38,.3); transition:all .15s; white-space:nowrap; }
  .set-location-btn:hover { filter:brightness(1.06); transform:translateY(-1px); }
  .clear-location-btn { flex-shrink:0; display:inline-flex; align-items:center; gap:4px; padding:6px 12px; border:1.5px solid rgba(239,83,80,.3); border-radius:10px; background:rgba(255,235,238,.7); color:#c62828; font-size:.75rem; font-weight:700; cursor:pointer; transition:all .15s; }
  .clear-location-btn:hover { background:rgba(255,235,238,.95); }
  /* ── Map popup overlay ── */
  .map-popup-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:9000; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn .2s ease; }
  .map-popup-box { background:white; border-radius:24px; width:min(700px,100%); max-height:90vh; display:flex; flex-direction:column; box-shadow:0 24px 64px rgba(0,0,0,.3); overflow:hidden; animation:slideUp .25s ease; }
  @keyframes slideUp { from{transform:translateY(24px);opacity:0;} to{transform:translateY(0);opacity:1;} }
  .map-popup-header { display:flex; align-items:center; justify-content:space-between; padding:18px 22px 14px; border-bottom:1.5px solid rgba(200,200,220,.3); }
  .map-popup-title { font-family:'Nunito',sans-serif; font-size:1.05rem; font-weight:800; color:#2d2d4e; display:flex; align-items:center; gap:8px; }
  .map-popup-close { width:34px; height:34px; border-radius:50%; border:none; background:rgba(200,200,220,.25); color:#5a5a7a; font-size:1rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .15s; }
  .map-popup-close:hover { background:rgba(200,200,220,.5); }
  .map-popup-body { flex:1; overflow:auto; padding:18px 22px 22px; display:flex; flex-direction:column; gap:12px; }
  .map-search-input-wrap { position:relative; }
  .map-search-input-wrap .clay-input { padding-right:40px; }
  .map-canvas { width:100%; height:360px; border-radius:16px; border:2px solid rgba(200,200,220,.3); overflow:hidden; background:rgba(200,200,220,.1); }
  .map-confirm-btn { width:100%; padding:13px; border:none; border-radius:14px; font-family:'Poppins',sans-serif; font-size:.92rem; font-weight:700; cursor:pointer; background:linear-gradient(135deg,#66bb6a,#43a047); color:white; box-shadow:0 4px 0 #2e7d32,0 6px 14px rgba(102,187,106,.3); transition:all .15s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .map-confirm-btn:hover { filter:brightness(1.06); transform:translateY(-1px); }
  .map-confirm-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; }
  .map-picked-pill { display:flex; align-items:center; gap:6px; padding:8px 14px; background:rgba(102,187,106,.1); border:1.5px solid rgba(102,187,106,.35); border-radius:50px; font-size:.8rem; font-weight:600; color:#2e7d32; }
`;

const css = injectClay(CLAY_BASE, CLAY_OWNER, PAGE_CSS);

const toTitleCase = (str) =>
  str.replace(/(^|\s)(\S)/g, (_, space, char) => space + char.toUpperCase());

/* ── Load Maps SDK once ─────────────────────────────────────────────────── */
let _ownerSdkPromise = null;
function loadMapsSDK(key) {
  if (window.google?.maps) return Promise.resolve();
  if (_ownerSdkPromise) return _ownerSdkPromise;
  _ownerSdkPromise = new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=en&region=IN`;
    s.async = true; s.defer = true;
    s.onload = res; s.onerror = () => rej(new Error("Maps failed to load"));
    document.head.appendChild(s);
  });
  return _ownerSdkPromise;
}

/* ── Amenity Multi-Select Dropdown ─────────────────────────────────────── */
function AmenitySelector({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [otherText, setOtherText] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const toggle = (opt) => onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  const addOther = () => {
    const val = otherText.trim();
    if (!val) return;
    const titled = toTitleCase(val);
    if (!selected.includes(titled)) onChange([...selected, titled]);
    setOtherText("");
  };
  return (
    <div className="amenity-wrapper" ref={ref}>
      <div className="amenity-display" onClick={() => setOpen((o) => !o)}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", flex:1 }}>
          {selected.length === 0
            ? <span className="amenity-placeholder">Select amenities…</span>
            : selected.map((s) => (
                <span key={s} className="amenity-tag">
                  {s}
                  <button onClick={(e) => { e.stopPropagation(); toggle(s); }}><X size={11} /></button>
                </span>
              ))}
        </div>
        <ChevronDown size={16} color="#9a9ab0" style={{ flexShrink:0, transform:open?"rotate(180deg)":"none", transition:"transform .2s" }} />
      </div>
      {open && (
        <div className="amenity-dropdown">
          {AMENITY_OPTIONS.map((opt) => {
            const sel = selected.includes(opt);
            return (
              <div key={opt} className={`amenity-option${sel?" selected":""}`} onClick={() => toggle(opt)}>
                <span className={`amenity-check${sel?" checked":""}`}>{sel?"✓":""}</span>{opt}
              </div>
            );
          })}
          <div className="amenity-divider" />
          <div style={{ padding:"4px 10px 2px", fontSize:".78rem", fontWeight:700, color:"#9a9ab0" }}>➕ Others — type your own</div>
          <div className="amenity-other-row">
            <input className="amenity-other-input" placeholder="Type custom amenity…" value={otherText}
              onChange={(e) => setOtherText(toTitleCase(e.target.value))}
              onKeyDown={(e) => { if (e.key==="Enter") { e.preventDefault(); addOther(); } }}
              onClick={(e) => e.stopPropagation()} />
            <button className="amenity-add-btn" onClick={(e) => { e.stopPropagation(); addOther(); }}>Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Map Popup Component ────────────────────────────────────────────────── */
function MapLocationPopup({ currentLocation, onConfirm, onClose }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapCanvasRef  = useRef(null);
  const mapObjRef     = useRef(null);
  const markerRef     = useRef(null);
  const inputRef      = useRef(null);
  const [mapsReady, setMapsReady]       = useState(false);
  const [pickedLocation, setPickedLocation] = useState(currentLocation || null);
  const [searchText, setSearchText]     = useState(currentLocation?.address || "");

  useEffect(() => {
    if (!apiKey) return;
    loadMapsSDK(apiKey).then(() => setMapsReady(true)).catch(() => {});
  }, [apiKey]);

  useEffect(() => {
    if (!mapsReady || !mapCanvasRef.current || mapObjRef.current) return;

    const initCenter = currentLocation?.lat
      ? { lat: currentLocation.lat, lng: currentLocation.lng }
      : KERALA_CENTER;
    const initZoom = currentLocation?.lat ? 15 : 8;

    mapObjRef.current = new window.google.maps.Map(mapCanvasRef.current, {
      center: initCenter, zoom: initZoom,
      mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
    });

    // Marker
    markerRef.current = new window.google.maps.Marker({
      map: mapObjRef.current,
      draggable: true,
      visible: !!currentLocation?.lat,
      position: currentLocation?.lat ? initCenter : KERALA_CENTER,
      animation: window.google.maps.Animation.DROP,
      title: "Drag to adjust",
    });

    // Marker drag end
    markerRef.current.addListener("dragend", () => {
      const pos = markerRef.current.getPosition();
      reverseGeocode(pos.lat(), pos.lng());
    });

    // Map click
    mapObjRef.current.addListener("click", (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      placeMarker(lat, lng);
      reverseGeocode(lat, lng);
    });

    // Autocomplete
    if (inputRef.current) {
      const auto = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "IN" },
        fields: ["geometry","formatted_address","name"],
        bounds: new window.google.maps.LatLngBounds({ lat:8.17, lng:74.85 }, { lat:12.79, lng:77.42 }),
        strictBounds: false,
      });
      auto.addListener("place_changed", () => {
        const place = auto.getPlace();
        if (!place.geometry?.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name || "";
        placeMarker(lat, lng);
        mapObjRef.current.panTo({ lat, lng });
        mapObjRef.current.setZoom(16);
        setSearchText(address);
        const loc = { lat, lng, address };
        setPickedLocation(loc);
        // Auto-confirm and close after autocomplete selection
        setTimeout(() => { onConfirm(loc); }, 500);
      });
    }
  }, [mapsReady]); // eslint-disable-line

  const placeMarker = (lat, lng) => {
    if (!markerRef.current) return;
    markerRef.current.setPosition({ lat, lng });
    markerRef.current.setVisible(true);
  };

  const reverseGeocode = (lat, lng) => {
    if (!window.google?.maps) return;
    new window.google.maps.Geocoder().geocode({ location: { lat, lng } }, (results, status) => {
      const address = status==="OK" && results[0]
        ? results[0].formatted_address
        : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setSearchText(address);
      setPickedLocation({ lat, lng, address });
    });
  };

  return (
    <div className="map-popup-overlay" onClick={onClose}>
      <div className="map-popup-box" onClick={(e) => e.stopPropagation()}>
        <div className="map-popup-header">
          <div className="map-popup-title"><MapPin size={18} color="#ffa726" /> Set PG Location on Map</div>
          <button className="map-popup-close" onClick={onClose}>✕</button>
        </div>
        <div className="map-popup-body">
          {!apiKey ? (
            <div style={{ padding:16, background:"rgba(255,249,196,.8)", border:"2px solid rgba(255,224,130,.5)", borderRadius:12, fontSize:".84rem", color:"#f57f17", fontWeight:600 }}>
              ⚠️ Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to your <code>.env</code> file to use the map.
            </div>
          ) : (
            <>
              <div className="map-search-input-wrap">
                <input
                  ref={inputRef}
                  type="text"
                  className="clay-input"
                  placeholder={mapsReady ? "Search for the PG location in Kerala…" : "Loading Maps…"}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  disabled={!mapsReady}
                  style={{ opacity: mapsReady ? 1 : 0.5 }}
                />
              </div>

              <div style={{ fontSize:".78rem", color:"#9a9ab0" }}>
                🖱️ Search above, or click anywhere on the map to drop a pin. Drag the pin to fine-tune.
              </div>

              <div className="map-canvas" ref={mapCanvasRef} />

              {pickedLocation?.lat && (
                <div className="map-picked-pill">
                  ✅ <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {pickedLocation.address}
                  </span>
                </div>
              )}

              <button
                className="map-confirm-btn"
                disabled={!pickedLocation?.lat}
                onClick={() => { onConfirm(pickedLocation); }}
              >
                <MapPin size={16} /> Confirm This Location
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────── */
export default function OwnerPGManagement() {
  const [pgs, setPgs]               = useState([]);
  const [rooms, setRooms]           = useState([]);
  const [roommatesByRoom, setRoommatesByRoom] = useState({});
  const [selectedPG, setSelectedPG] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [pgForm, setPgForm]         = useState({
    name:"", location:"", pgName:"", street:"", postOffice:"",
    placeOfResidence:"", district:"", pinNumber:"", rent:"",
    amenities:[], rules:[], mapLocation:null,
  });
  const [uploading, setUploading]   = useState(false);
  const [pgImages, setPgImages]     = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomForm, setRoomForm]           = useState({ roomNumber:"", roomType:"", rent:"", capacity:"2" });
  const [addingRoom, setAddingRoom]       = useState(false);
  const [selectedRoom, setSelectedRoom]   = useState(null);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [ownerVerified, setOwnerVerified] = useState(false);
  const [showMapPopup, setShowMapPopup]   = useState(false);  // ← map popup toggle
  const [confirmation, setConfirmation] = useState({ isOpen:false, title:"", message:"", operation:null, pgData:null });
  const [licenseFile, setLicenseFile]   = useState(null);
  const [licenseError, setLicenseError] = useState("");

  const parsePGAddress = (addressStr) => {
    if (!addressStr) return { pgName:"", street:"", postOffice:"", placeOfResidence:"", district:"", pinNumber:"" };
    return addressStr.split("\n").reduce((acc, line) => {
      if (line.includes("Name of Pg:"))            acc.pgName           = line.split(":")[1]?.trim()||"";
      else if (line.includes("Street name/locality:")) acc.street       = line.split(":")[1]?.trim()||"";
      else if (line.includes("Post office name:"))  acc.postOffice       = line.split(":")[1]?.trim()||"";
      else if (line.includes("Place of residence:")) acc.placeOfResidence= line.split(":")[1]?.trim()||"";
      else if (line.includes("District:"))          acc.district         = line.split(":")[1]?.trim()||"";
      else if (line.includes("Pin number:"))        acc.pinNumber        = line.split(":")[1]?.trim()||"";
      return acc;
    }, { pgName:"", street:"", postOffice:"", placeOfResidence:"", district:"", pinNumber:"" });
  };

  const formatPGAddress = () =>
    `Name of Pg: ${pgForm.pgName}\nStreet name/locality: ${pgForm.street}\nPost office name: ${pgForm.postOffice}\nPlace of residence: ${pgForm.placeOfResidence}\nDistrict: ${pgForm.district}\nPin number: ${pgForm.pinNumber}`;

  const fetchPGs = async () => {
    try {
      const res = await apiGetOwnerPGs();
      setPgs(res.data);
      if (res.data.length > 0 && !selectedPG) selectPG(res.data[0]);
    } catch (err) { toast.error(err.message); }
  };

  const fetchOwnerBookings = async () => {
    try {
      const res = await apiGetOwnerBookings();
      const grouped = (res?.data || []).reduce((acc, booking) => {
        const roomId = booking?.room?._id || booking?.room;
        if (!roomId) return acc;
        acc[roomId] = acc[roomId] || [];
        if (booking?.tenant) acc[roomId].push(booking.tenant);
        return acc;
      }, {});
      setRoommatesByRoom(grouped);
    } catch (err) { console.warn("Failed to fetch bookings:", err); }
  };

  const selectPG = (pg) => {
    setSelectedPG(pg);
    const addressParts = parsePGAddress(pg.address || "");
    let mapLocation = null;
    if (pg.coordinates?.coordinates?.length === 2) {
      const [savedLng, savedLat] = pg.coordinates.coordinates;
      mapLocation = { lat: savedLat, lng: savedLng, address: pg.location || "" };
    }
    setPgForm({
      name: pg.name, location: pg.location,
      pgName: addressParts.pgName||"", street: addressParts.street||"",
      postOffice: addressParts.postOffice||"", placeOfResidence: addressParts.placeOfResidence||"",
      district: addressParts.district||"", pinNumber: addressParts.pinNumber||"",
      rent: pg.rent, amenities: pg.amenities||[], rules: pg.rules||[], mapLocation,
    });
    setPgImages(pg.images || []);
    setSelectedRoom(null); setIsEditingRoom(false);
    fetchRooms(pg._id);
  };

  const fetchRooms = async (pgId) => {
    try { const res = await apiGetRooms(pgId); setRooms(res.data); }
    catch (err) { toast.error(err.message); }
  };

  useEffect(() => {
    const syncUser = async () => {
      try {
        const res = await apiGetMe();
        const freshUser = res.user;
        if (freshUser) {
          localStorage.setItem("user", JSON.stringify(freshUser));
          setOwnerVerified(freshUser.verificationStatus === "verified");
        }
      } catch (err) {
        const user = getUser();
        setOwnerVerified(user?.verificationStatus === "verified");
      }
    };

    syncUser();
    fetchPGs();
    fetchOwnerBookings();
  }, []);

  /* ── Map location confirmed ── */
  const handleMapConfirm = (loc) => {
    setPgForm((prev) => ({
      ...prev,
      mapLocation: loc,
      location: prev.location || (loc.address ? loc.address.split(",").slice(0,2).join(",").trim() : prev.location),
    }));
    setShowMapPopup(false);
    toast.success("Location pinned successfully!");
  };

  const actualSavePG = async () => {
    setConfirmation({ isOpen: false });
    setSaving(true);
    try {
      if (selectedPG) {
        const payload = {
          name: pgForm.name, location: pgForm.location, address: formatPGAddress(),
          rent: Number(pgForm.rent), amenities: pgForm.amenities, rules: pgForm.rules,
          ...(pgForm.mapLocation?.lat && { lat: pgForm.mapLocation.lat, lng: pgForm.mapLocation.lng }),
        };
        await apiUpdatePG(selectedPG._id, payload);
        toast.success("PG details updated successfully!");
      } else {
        const fd = new FormData();
        fd.append("name", pgForm.name); fd.append("location", pgForm.location);
        fd.append("address", formatPGAddress()); fd.append("rent", String(pgForm.rent));
        fd.append("amenities", JSON.stringify(pgForm.amenities));
        fd.append("rules", JSON.stringify(pgForm.rules));
        fd.append("licenseDocument", licenseFile);
        if (pgForm.mapLocation?.lat) {
          fd.append("lat", String(pgForm.mapLocation.lat));
          fd.append("lng", String(pgForm.mapLocation.lng));
        }
        const res = await apiCreatePG(fd);
        setSelectedPG(res.data); setLicenseFile(null); setLicenseError("");
        toast.success("PG Stay created! It will be visible once admin verifies it.");
      }
      await fetchPGs();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const showSavePGConfirmation = () => {
    if (!ownerVerified && !selectedPG) { toast.warning("Your owner account must be verified first."); return; }
    if (!pgForm.name || !pgForm.location || !pgForm.rent) { toast.warning("Name, location and rent are required"); return; }
    if (!selectedPG && !licenseFile) { setLicenseError("Please upload the PG license document before submitting."); return; }
    const operation = selectedPG ? "Update PG Details" : "Create New PG";
    setConfirmation({ isOpen:true, title:operation, message:`Are you sure you want to ${operation.toLowerCase()}?`, operation:"savePG", pgData:null });
  };

  const showDeletePGConfirmation = () => {
    setConfirmation({ isOpen:true, title:"Delete PG", message:`Are you sure you want to delete PG "${selectedPG.name}" and all rooms? This cannot be undone.`, operation:"deletePG", pgData:null });
  };

  const actualDeletePG = async () => {
    setConfirmation({ isOpen: false });
    if (!selectedPG) return;
    setSaving(true);
    try {
      await apiDeletePG(selectedPG._id);
      toast.success("PG deleted successfully.");
      setSelectedPG(null);
      setPgForm({ name:"", location:"", pgName:"", street:"", postOffice:"", placeOfResidence:"", district:"", pinNumber:"", rent:"", amenities:[], rules:[], mapLocation:null });
      setRooms([]); setPgImages([]);
      await fetchPGs();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleConfirmationYes = async () => {
    const { operation } = confirmation;
    if (operation === "savePG") actualSavePG();
    else if (operation === "deletePG") actualDeletePG();
    else if (typeof operation === "function") await operation();
  };

  const openRoomModal = (room = null) => {
    if (!ownerVerified) { toast.warning("Your owner account must be verified first."); return; }
    if (!selectedPG) { toast.warning("Save PG details first."); return; }
    if (room) {
      setRoomForm({ roomNumber:room.roomNumber, roomType:room.roomType, rent:String(room.rent), capacity:String(room.capacity||1) });
      setSelectedRoom(room); setIsEditingRoom(true);
    } else {
      setRoomForm({ roomNumber:"", roomType:"", rent:"", capacity:"2" });
      setSelectedRoom(null); setIsEditingRoom(false);
    }
    setShowRoomModal(true);
  };

  const closeRoomModal = () => {
    setShowRoomModal(false); setSelectedRoom(null); setIsEditingRoom(false);
    setRoomForm({ roomNumber:"", roomType:"", rent:"", capacity:"2" });
  };

  const handleAddOrUpdateRoom = async () => {
    if (!selectedPG) { toast.warning("Save PG details first."); return; }
    if (!roomForm.roomNumber || !roomForm.roomType || !roomForm.rent) { toast.warning("Room type and rent are required"); return; }
    setAddingRoom(true);
    try {
      const payload = { roomNumber:roomForm.roomNumber, roomType:roomForm.roomType, rent:Number(roomForm.rent), capacity:roomForm.roomType==="Shared"?(Number(roomForm.capacity)||2):1 };
      if (isEditingRoom && selectedRoom) { await apiUpdateRoom(selectedRoom._id, payload); toast.success("Room updated!"); }
      else { payload.availability = true; await apiAddRoom(selectedPG._id, payload); toast.success("Room added!"); }
      closeRoomModal(); fetchRooms(selectedPG._id);
    } catch (err) { toast.error(err.message); }
    finally { setAddingRoom(false); }
  };

  const handleDeleteRoom = async (room) => {
    setConfirmation({
      isOpen:true, title:"Delete Room?", message:`Delete room "${room.roomType}"? This cannot be undone.`,
      operation: async () => {
        try { await apiDeleteRoom(room._id); toast.success("Room deleted."); setConfirmation({ ...confirmation, isOpen:false }); fetchRooms(selectedPG._id); }
        catch (err) { toast.error(err.message); }
      }
    });
  };

  const handleNewPG = () => {
    setSelectedPG(null);
    setPgForm({ name:"", location:"", pgName:"", street:"", postOffice:"", placeOfResidence:"", district:"", pinNumber:"", rent:"", amenities:[], rules:[], mapLocation:null });
    setRooms([]); setLicenseFile(null); setLicenseError("");
  };

  const handleUploadImages = async (e) => {
    const files = Array.from(e.target.files);
    if (!selectedPG) { toast.warning("Save PG details first."); return; }
    if (files.length === 0) return;
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    setUploading(true);
    try { const res = await apiUploadPGImages(selectedPG._id, formData); setPgImages(res.data); toast.success(`${files.length} photo(s) uploaded! 🎉`); }
    catch (err) { toast.error(err.message); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const handleDeleteImage = async (imgId) => {
    try { const res = await apiDeletePGImage(selectedPG._id, imgId); setPgImages(res.data); toast.success("Image deleted"); }
    catch (err) { toast.error(err.message); }
  };

  const handleCapInput = (field, value) =>
    setPgForm((prev) => ({ ...prev, [field]: toTitleCase(value) }));

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="owner" />

        {/* Map Popup */}
        {showMapPopup && (
          <MapLocationPopup
            currentLocation={pgForm.mapLocation}
            onConfirm={handleMapConfirm}
            onClose={() => setShowMapPopup(false)}
          />
        )}

        {/* Add Room Modal */}
        {showRoomModal && (
          <Modal
            title={isEditingRoom ? "✏️ Edit Room" : "➕ Add New Room"}
            subtitle="Enter room details below"
            onClose={closeRoomModal}
            onConfirm={handleAddOrUpdateRoom}
            confirmLabel={isEditingRoom ? "Update Room" : "Add Room"}
            loading={addingRoom}
            fields={
              <div>
                <div className="form-group" style={{ marginBottom:16 }}>
                  <label className="clay-label">Room Number</label>
                  <input className="clay-input" type="text" placeholder="e.g. RP227"
                    value={roomForm.roomNumber} onChange={(e) => setRoomForm({ ...roomForm, roomNumber:e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom:16 }}>
                  <label className="clay-label">Room Type</label>
                  <div className="room-type-row">
                    {["Single","Shared"].map((type) => (
                      <button key={type} type="button" className={`room-type-btn${roomForm.roomType===type?" active":""}`}
                        onClick={() => setRoomForm({ ...roomForm, roomType:type })}>
                        {type==="Single" ? "🛏 Single" : "👥 Shared"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom:16 }}>
                  <label className="clay-label">Monthly Rent (₹)</label>
                  <input className="clay-input" type="number" placeholder="e.g. 7500"
                    value={roomForm.rent} onChange={(e) => setRoomForm({ ...roomForm, rent:e.target.value })} />
                </div>
                {roomForm.roomType === "Shared" && (
                  <div className="form-group">
                    <label className="clay-label">Capacity</label>
                    <input className="clay-input" type="number" min="2" max="10" placeholder="e.g. 3"
                      value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity:e.target.value })} />
                  </div>
                )}
              </div>
            }
          />
        )}

        <ConfirmationModal isOpen={confirmation.isOpen} title={confirmation.title} message={confirmation.message}
          onYes={handleConfirmationYes} onNo={() => setConfirmation({ isOpen:false })} />

        <main className="clay-main">
          <div className="clay-container">
            <h2 className="clay-page-title">🏢 PG &amp; Room Management</h2>
            <p className="clay-page-sub">Create, update and manage your PG properties and rooms.</p>

            {pgs.length > 0 && (
              <div className="pg-tab-row">
                {pgs.map((pg) => (
                  <button key={pg._id} className={`pg-tab${selectedPG?._id===pg._id?" active":""}`} onClick={() => selectPG(pg)}>
                    🏠 {pg.name}
                    {pg.trustScore !== undefined && (
                      <span style={{ fontSize:".7rem", color:pg.trustScore>=70?"#2e7d32":pg.trustScore>=50?"#f57f17":"#c62828", marginLeft:4 }}>
                        ({pg.trustScore})
                      </span>
                    )}
                  </button>
                ))}
                <button className="new-pg-tab" onClick={handleNewPG}>+ Add New PG</button>
              </div>
            )}

            {/* ─── Create / Edit PG Card ─── */}
            <div className="pg-card card-orange">
              <div className="pg-section-title">
                📝 {selectedPG ? "Edit PG Details" : "Create New PG Stay"}
                {selectedPG && selectedPG.trustScore !== undefined && (
                  <span style={{ fontSize:".9rem", color:"#2d2d4e", fontWeight:600, marginLeft:"auto", marginRight:16 }}>
                    Trust Score: <span style={{ color:selectedPG.trustScore>=70?"#2e7d32":selectedPG.trustScore>=50?"#f57f17":"#c62828" }}>{selectedPG.trustScore}/100</span>
                  </span>
                )}
                {selectedPG && (
                  <button className="clay-btn clay-btn-red" type="button" onClick={showDeletePGConfirmation} disabled={saving}>
                    <Trash2 size={14} /> Delete PG
                  </button>
                )}
              </div>

              {!ownerVerified && (
                <div className="pg-alert pg-alert-info" style={{ marginTop:0 }}>
                  Your owner account is pending admin verification. You can save draft PG details, but new listings will not become live until verified.
                </div>
              )}

              <div className="form-grid">
                {/* PG Name */}
                <div className="form-group">
                  <label className="clay-label">PG Name</label>
                  <input className="clay-input" placeholder="e.g. Sunshine PG"
                    value={pgForm.name} onChange={(e) => handleCapInput("name", e.target.value)} />
                </div>

                {/* Location text */}
                <div className="form-group">
                  <label className="clay-label">Location Label</label>
                  <input className="clay-input" placeholder="Area, City (e.g. Thrissur, Kerala)"
                    value={pgForm.location} onChange={(e) => handleCapInput("location", e.target.value)} />
                  <span style={{ fontSize:".73rem", color:"#9a9ab0", marginTop:4 }}>
                    Auto-filled when you pin on the map, or type manually.
                  </span>
                </div>

                {/* ── Map Location Bar ── full width */}
                <div className="form-group" style={{ gridColumn:"1 / -1" }}>
                  <label className="clay-label">📍 PG Location on Map</label>

                  <div className="location-bar">
                    <MapPin size={16} color={pgForm.mapLocation?.lat ? "#ffa726" : "#b0b0c8"} style={{ flexShrink:0 }} />

                    {pgForm.mapLocation?.lat ? (
                      <span className="location-bar-text" title={pgForm.mapLocation.address}>
                        {pgForm.mapLocation.address}
                      </span>
                    ) : (
                      <span className="location-bar-placeholder">No location pinned yet</span>
                    )}

                    {pgForm.mapLocation?.lat && (
                      <button className="clear-location-btn"
                        onClick={() => setPgForm((p) => ({ ...p, mapLocation: null }))}>
                        <X size={12} /> Clear
                      </button>
                    )}

                    <button className="set-location-btn" onClick={() => setShowMapPopup(true)}>
                      <MapPin size={14} />
                      {pgForm.mapLocation?.lat ? "Change Location" : "Set Location On Map"}
                    </button>
                  </div>

                  {pgForm.mapLocation?.lat && (
                    <div style={{ marginTop:6, fontSize:".73rem", color:"#9a9ab0" }}>
                      📌 Coordinates: {pgForm.mapLocation.lat.toFixed(5)}, {pgForm.mapLocation.lng.toFixed(5)}
                    </div>
                  )}
                </div>

                {/* Address fields */}
                <div className="form-group" style={{ gridColumn:"1 / -1" }}>
                  <label className="clay-label">📋 PG Address Details</label>
                </div>
                <div className="form-group">
                  <label className="clay-label">PG Name</label>
                  <input className="clay-input" placeholder="Name of the PG" value={pgForm.pgName}
                    onChange={(e) => setPgForm({ ...pgForm, pgName:toTitleCase(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="clay-label">Street / Locality</label>
                  <input className="clay-input" placeholder="Street name or locality" value={pgForm.street}
                    onChange={(e) => setPgForm({ ...pgForm, street:toTitleCase(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="clay-label">Post Office</label>
                  <input className="clay-input" placeholder="Post office name" value={pgForm.postOffice}
                    onChange={(e) => setPgForm({ ...pgForm, postOffice:toTitleCase(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="clay-label">Place of Residence</label>
                  <input className="clay-input" placeholder="City or town" value={pgForm.placeOfResidence}
                    onChange={(e) => setPgForm({ ...pgForm, placeOfResidence:toTitleCase(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="clay-label">District</label>
                  <input className="clay-input" placeholder="District" value={pgForm.district}
                    onChange={(e) => setPgForm({ ...pgForm, district:toTitleCase(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="clay-label">Pin Number</label>
                  <input className="clay-input" placeholder="Postal code" value={pgForm.pinNumber} maxLength="6"
                    onChange={(e) => setPgForm({ ...pgForm, pinNumber:e.target.value })} />
                </div>

                {/* Rent */}
                <div className="form-group">
                  <label className="clay-label">Base Rent / Month (₹)</label>
                  <input className="clay-input" type="number" placeholder="e.g. 7500"
                    value={pgForm.rent} onChange={(e) => setPgForm({ ...pgForm, rent:e.target.value })} />
                </div>

                {/* Amenities */}
                <div className="form-group">
                  <label className="clay-label">Amenities</label>
                  <AmenitySelector selected={pgForm.amenities} onChange={(val) => setPgForm({ ...pgForm, amenities:val })} />
                </div>
              </div>

              {/* Rules */}
              <div style={{ marginTop:24 }}>
                <label className="clay-label" style={{ display:"flex", alignItems:"center", marginBottom:12 }}>
                  📋 Rules & Regulations (Point-wise)
                </label>
                <p style={{ fontSize:".82rem", color:"#7a7a9a", marginBottom:14 }}>Add house rules that tenants must follow.</p>
                {pgForm.rules.length > 0 && (
                  <div style={{ marginBottom:16, display:"grid", gap:10 }}>
                    {pgForm.rules.map((rule, idx) => (
                      <div key={idx} style={{ background:"rgba(255,255,255,.7)", border:"2px solid rgba(255,255,255,.85)", borderRadius:14, padding:"12px 16px", display:"flex", alignItems:"center", gap:10, boxShadow:"0 3px 12px rgba(0,0,0,.06)" }}>
                        <span style={{ fontSize:"1rem", fontWeight:700, color:"#ffa726", minWidth:24 }}>{idx+1}.</span>
                        <span style={{ flex:1, fontSize:".88rem", color:"#2d2d4e", wordBreak:"break-word" }}>{rule}</span>
                        <button type="button" onClick={() => setPgForm({ ...pgForm, rules:pgForm.rules.filter((_,i)=>i!==idx) })}
                          style={{ background:"rgba(239,83,80,.15)", border:"1px solid rgba(239,83,80,.3)", color:"#c62828", borderRadius:8, padding:"6px 12px", fontSize:".75rem", fontWeight:700, cursor:"pointer" }}>
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display:"flex", gap:10, marginBottom:16 }}>
                  <input className="clay-input" placeholder="Type a rule (e.g. No noise after 10 PM)" id="new-rule-input" style={{ flex:1 }}
                    onChange={(e) => { const inp = document.getElementById("new-rule-input"); inp.value = toSentenceCase(inp.value); }}
                    onKeyDown={(e) => { if (e.key==="Enter") { const inp=document.getElementById("new-rule-input"); if(inp.value.trim()){setPgForm({...pgForm,rules:[...pgForm.rules,inp.value.trim()]});inp.value="";} } }} />
                  <button type="button"
                    onClick={() => { const inp=document.getElementById("new-rule-input"); if(inp.value.trim()){setPgForm({...pgForm,rules:[...pgForm.rules,inp.value.trim()]});inp.value="";} }}
                    style={{ padding:"11px 20px", background:"linear-gradient(135deg,#66bb6a,#43a047)", color:"white", border:"none", borderRadius:14, fontWeight:700, fontSize:".88rem", cursor:"pointer", boxShadow:"0 4px 0 #2e7d32", whiteSpace:"nowrap" }}>
                    ➕ Add Rule
                  </button>
                </div>
              </div>

              {selectedPG && selectedPG.createdAt && (
                <div className="created-info-box" aria-label="PG creation date (non-editable)">
                  📅 PG Listed On: {new Date(selectedPG.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })}
                  &nbsp;·&nbsp; {new Date(selectedPG.createdAt).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}
                </div>
              )}

              {selectedPG && (
                <div className={`pg-alert ${selectedPG.verificationStatus==="verified"?"pg-alert-success":"pg-alert-info"}`}>
                  {selectedPG.verificationStatus==="verified" ? "Your PG is verified and live for tenants to find."
                    : selectedPG.verificationStatus==="restricted" ? "This PG has been restricted by admin."
                    : "This PG is pending admin verification."}
                </div>
              )}

              {/* License */}
              {!selectedPG && (
                <div style={{ marginTop:16 }}>
                  <label className="clay-label" style={{ display:"flex", alignItems:"center", marginBottom:8 }}>
                    📄 License / Registration Document
                    <span className="license-required-badge">* Required</span>
                  </label>
                  <label className={`license-upload-zone${licenseFile?" license-upload-ready":""}`} htmlFor="pg-license-upload">
                    <input id="pg-license-upload" type="file" accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => { const f=e.target.files[0]; if(!f)return; setLicenseFile(f); setLicenseError(""); }} />
                    <span style={{ fontSize:"1.6rem" }}>{licenseFile?"✅":"📋"}</span>
                    <div>
                      <div style={{ fontWeight:700, color:licenseFile?"#2e7d32":"#2d2d4e", fontSize:".88rem" }}>
                        {licenseFile ? licenseFile.name : "Upload PG License / Registration Document"}
                      </div>
                      <div style={{ fontSize:".74rem", color:"#9a9ab0", marginTop:3 }}>JPG · PNG · PDF · Max 15MB</div>
                    </div>
                  </label>
                  {licenseError && <div className="license-error"><span>⚠️</span> {licenseError}</div>}
                </div>
              )}

              <button className="update-btn" onClick={showSavePGConfirmation} disabled={saving}>
                {saving ? "⏳ Saving…" : selectedPG ? "Update PG Details →" : "Create PG Stay →"}
              </button>
            </div>

            {/* ─── Room Management Card ─── */}
            <div className="pg-card card-amber">
              <div className="pg-section-title">
                <span>🚪 Room Management</span>
                <button className="add-room-btn" onClick={() => openRoomModal(null)} disabled={!ownerVerified}>
                  <Plus size={15} /> Add Room
                </button>
              </div>

              {selectedPG && (
                <div className="pg-card card-orange">
                  <div className="pg-section-title"><span>📸 PG Photos ({pgImages.length}/10)</span></div>
                  {pgImages.length > 0 && (
                    <div className="photo-grid">
                      {pgImages.map((img) => (
                        <div key={img._id} className="photo-thumb">
                          <img src={img.url} alt="PG" />
                          <button className="photo-del-btn" onClick={() => handleDeleteImage(img._id)}><Trash2 size={13} color="white" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  {pgImages.length < 10 && (
                    <div className="upload-zone">
                      <label className="upload-zone-label">
                        <ImagePlus size={28} />
                        {uploading ? "⏳ Uploading…" : "Click to upload photos (max 10, 5MB each)"}
                        <span style={{ fontSize:".75rem", color:"#9a9ab0", fontWeight:500 }}>JPG, PNG or WebP accepted</span>
                        <input type="file" accept="image/*" multiple onChange={handleUploadImages} disabled={uploading} />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {rooms.length === 0 ? (
                <div className="room-empty"><span className="room-empty-emoji">🚪</span>No rooms added yet. Click "Add Room" to get started.</div>
              ) : (
                <div className="rooms-grid">
                  {rooms.map((room, i) => (
                    <div key={room._id} className={`room-card ${room.availability?"room-avail":"room-unavail"}`} style={{ animationDelay:`${i*0.06}s` }}>
                      <div className="room-type">{room.roomType} - {room.roomNumber||"N/A"}</div>
                      <div className="room-rent">₹{room.rent}/month</div>
                      {room.roomType==="Shared" && room.capacity && (
                        <div style={{ fontSize:".78rem", color:"#7a7a9a", marginBottom:8 }}>👥 Capacity: {room.capacity} persons</div>
                      )}
                      {room.createdAt && (
                        <div className="room-created-badge">
                          🗓 Added: {new Date(room.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                        </div>
                      )}
                      <div className="toggle-row">
                        <span className="toggle-label">{room.availability?"✅ Available":"❌ Unavailable"}</span>
                        <label className="toggle-wrap">
                          <input type="checkbox" checked={room.availability}
                            onChange={async () => { await apiUpdateRoom(room._id,{availability:!room.availability}); fetchRooms(selectedPG._id); }} />
                          <span className="toggle-slider" />
                        </label>
                      </div>
                      {roommatesByRoom[room?._id]?.length > 0 ? (
                        <div className="roommate-grid">
                          {roommatesByRoom[room._id].filter(Boolean).map((tenant) => (
                            <div key={tenant?._id||Math.random()} className="roommate-card">
                              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                                <div className="roommate-avatar">
                                  {tenant?.profilePhotoUrl
                                    ? <img src={tenant.profilePhotoUrl} alt={tenant?.name||"Tenant"} style={{ width:"100%",height:"100%",objectFit:"cover" }} />
                                    : tenant?.name?.[0]?.toUpperCase()||"?"}
                                </div>
                                <div><div className="roommate-name">{tenant?.name||"Unknown"}</div></div>
                              </div>
                              <div className="roommate-bio">{tenant?.bio||"No bio available"}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="roommate-empty">No active tenants.</div>
                      )}
                      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:12 }}>
                        <button className="room-action-btn room-edit-btn" type="button" onClick={() => openRoomModal(room)}><Edit3 size={14} /> Edit</button>
                        <button className="room-action-btn room-delete-btn" type="button" onClick={() => handleDeleteRoom(room)}><Trash2 size={14} /> Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}