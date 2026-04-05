import { useEffect, useState, useRef } from "react";
import { CheckCircle2, XCircle, Trash2, Eye, FileText, User, Home, Building2, MapPin } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import ConfirmationModal from "../components/ConfirmationModal";
import {
  apiAdminGetPGs, apiAdminVerifyPG, apiAdminRestrictPG, apiAdminUnrestrictPG, apiAdminDeletePG,
  apiAdminStats, apiAdminGetUsers, apiAdminVerifyUser, apiAdminSuspendUser, apiAdminUnsuspendUser, apiAdminDeleteUser,
  apiGetPGRoommates,
} from "../utils/api";
import { toast } from "../components/Toast";
import { CLAY_BASE, CLAY_ADMIN, injectClay } from "../styles/claystyles";

const PAGE_CSS = `
  .stats6{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px;}
  @media(max-width:900px){.stats6{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:560px){.stats6{grid-template-columns:1fr;}}
  .s-blue::before{background:linear-gradient(90deg,#42a5f5,#90caf9);}
  .s-green::before{background:linear-gradient(90deg,#66bb6a,#a5d6a7);}
  .s-yellow::before{background:linear-gradient(90deg,#ffe082,#ffd54f);}
  .s-red::before{background:linear-gradient(90deg,#ef9a9a,#e53935);}
  .s-purple::before{background:linear-gradient(90deg,#ce93d8,#ab47bc);}
  .s-teal::before{background:linear-gradient(90deg,#80deea,#00acc1);}
  .stat-lbl{font-size:.7rem;font-weight:700;color:#9a9ab0;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;}
  .stat-val{font-family:'Nunito',sans-serif;font-size:2.2rem;font-weight:900;}
  .v-b{color:#1565c0;}.v-g{color:#2e7d32;}.v-y{color:#f57f17;}.v-r{color:#c62828;}.v-p{color:#7b1fa2;}.v-t{color:#00838f;}
  .section-tabs{display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap;}
  .sec-tab{padding:10px 22px;border-radius:50px;border:2.5px solid rgba(255,255,255,.85);background:rgba(255,255,255,.6);font-family:'Poppins',sans-serif;font-size:.85rem;font-weight:700;cursor:pointer;color:#5a5a7a;transition:all .18s;display:flex;align-items:center;gap:7px;}
  .sec-tab.active{background:linear-gradient(135deg,#ef5350,#e040fb);color:white;border-color:transparent;box-shadow:0 4px 0 #b71c1c,0 6px 14px rgba(239,83,80,.3);}
  .sec-tab-count{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:50px;font-size:.68rem;font-weight:800;background:rgba(255,255,255,.25);}
  .sec-tab:not(.active) .sec-tab-count{background:rgba(239,83,80,.15);color:#c62828;}
  .col-header-pg{display:grid;grid-template-columns:1.8fr 1.2fr 110px 90px 100px 90px 90px 200px;gap:10px;padding:10px 18px;margin-bottom:8px;}
  .col-header-user{display:grid;grid-template-columns:minmax(260px,1fr) minmax(260px,1.4fr) 120px 120px 160px;gap:14px;padding:10px 18px;margin-bottom:8px;}
  .col-head{font-size:.67rem;font-weight:700;color:#9a9ab0;text-transform:uppercase;letter-spacing:.5px;}
  .col-header-pg,.col-header-user{justify-items:start;}
  .col-header-pg span:nth-child(3),.col-header-pg span:nth-child(4),.col-header-pg span:nth-child(5),.col-header-pg span:nth-child(6),.col-header-pg span:nth-child(7){justify-self:center;width:100%;text-align:center;}
  .pg-row>div:nth-child(3),.pg-row>div:nth-child(4),.pg-row>div:nth-child(5),.pg-row>div:nth-child(6),.pg-row>div:nth-child(7){justify-self:center;width:100%;display:flex;align-items:center;justify-content:center;}
  .col-header-user span:nth-child(3),.col-header-user span:nth-child(4),.user-row>div:nth-child(3),.user-row>.doc-slot{justify-self:center;}
  .search-bar{display:flex;justify-content:flex-end;margin-bottom:22px;}
  .search-input{width:100%;max-width:420px;background:rgba(255,255,255,.92);border:1px solid rgba(160,160,190,.4);border-radius:999px;padding:12px 16px;font-size:.95rem;color:#2d2d4e;outline:none;transition:border-color .18s,box-shadow .18s;}
  .search-input:focus{border-color:#4f7cff;box-shadow:0 0 0 4px rgba(79,124,255,.12);}
  .pg-row{display:grid;grid-template-columns:1.8fr 1.2fr 110px 90px 100px 90px 90px 200px;align-items:center;gap:10px;padding:14px 18px;min-height:72px;background:rgba(255,255,255,.55);border:1.5px solid rgba(255,255,255,.8);border-radius:16px;margin-bottom:10px;transition:transform .15s,box-shadow .15s;position:relative;overflow:hidden;justify-items:start;}
  .pg-row::before{content:'';position:absolute;top:0;left:0;bottom:0;width:4px;border-radius:16px 0 0 16px;}
  .pg-row-verified::before{background:linear-gradient(180deg,#66bb6a,#a5d6a7);}
  .pg-row-pending::before{background:linear-gradient(180deg,#ffe082,#ffd54f);}
  .pg-row-restricted::before{background:linear-gradient(180deg,#ef9a9a,#e53935);}
  .user-row{display:grid;grid-template-columns:minmax(260px,1fr) minmax(260px,1.4fr) 120px 120px 160px;align-items:center;gap:14px;padding:14px 18px;min-height:72px;background:rgba(255,255,255,.55);border:1.5px solid rgba(255,255,255,.8);border-radius:16px;margin-bottom:10px;transition:transform .15s,box-shadow .15s;position:relative;overflow:hidden;}
  .user-row::before{content:'';position:absolute;top:0;left:0;bottom:0;width:4px;border-radius:16px 0 0 16px;}
  .user-row-verified::before{background:linear-gradient(180deg,#66bb6a,#a5d6a7);}
  .user-row-pending::before{background:linear-gradient(180deg,#ffe082,#ffd54f);}
  .user-row-unverified::before{background:linear-gradient(180deg,#b0bec5,#90a4ae);}
  .user-row-suspended::before{background:linear-gradient(180deg,#ef9a9a,#e53935);}
  .row-hover:hover{transform:translateX(3px);box-shadow:0 4px 16px rgba(0,0,0,.08);}
  @media(max-width:900px){.pg-row,.col-header-pg,.user-row,.col-header-user{grid-template-columns:1fr;gap:6px;}}
  .cell-name{font-family:'Nunito',sans-serif;font-size:.95rem;font-weight:800;color:#2d2d4e;}
  .cell-sub{font-size:.8rem;color:#7a7a9a;margin-top:4px;}
  .cell-email{font-size:.82rem;color:#7a7a9a;}
  .trust-cell{font-family:'Nunito',sans-serif;font-size:1rem;font-weight:800;}
  .user-name-wrap{display:flex;align-items:center;gap:14px;}
  .user-name-wrap>div{min-width:0;}
  .doc-slot{display:flex;align-items:center;justify-content:center;min-width:78px;min-height:48px;}
  .doc-slot .doc-thumb,.doc-thumb-pdf,.doc-slot .no-doc{width:78px;height:48px;border-radius:14px;}
  .doc-slot .no-doc{display:inline-flex;align-items:center;justify-content:center;background:rgba(242,242,250,.85);color:#9a9ab0;font-size:.78rem;font-weight:700;}
  .complaints-cell{font-size:.88rem;font-weight:700;}
  .c-ok{color:#2e7d32;}.c-warn{color:#c62828;}
  .status-chip{display:inline-flex;align-items:center;gap:5px;border-radius:50px;padding:4px 12px;font-size:.72rem;font-weight:700;border:1.5px solid rgba(255,255,255,.85);}
  .chip-v{background:rgba(232,245,233,.9);color:#2e7d32;border-color:rgba(165,214,167,.6);}
  .chip-p{background:rgba(255,249,196,.9);color:#f57f17;border-color:rgba(255,224,130,.6);}
  .chip-r{background:rgba(255,235,238,.9);color:#c62828;border-color:rgba(239,154,154,.6);}
  .chip-u{background:rgba(236,239,241,.9);color:#607d8b;border-color:rgba(176,190,197,.6);}
  .act-group{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-start;align-items:center;min-width:0;}
  .act-btn{min-width:80px;padding:7px 11px;height:34px;border:none;border-radius:10px;font-family:'Poppins',sans-serif;font-size:.74rem;font-weight:700;cursor:pointer;transition:transform .12s,filter .12s;display:inline-flex;align-items:center;justify-content:center;gap:5px;white-space:nowrap;}
  .act-btn:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.07);}
  .act-btn:disabled{opacity:.55;cursor:not-allowed;}
  .btn-verify{background:linear-gradient(135deg,#66bb6a,#43a047);color:white;box-shadow:0 3px 0 #2e7d32;}
  .btn-restrict{background:linear-gradient(135deg,#ef9a9a,#e53935);color:white;box-shadow:0 3px 0 #b71c1c;}
  .btn-delete{background:rgba(255,235,238,.9);border:1.5px solid rgba(239,154,154,.5);color:#c62828;}
  .btn-warn{background:rgba(255,249,196,.9);border:1.5px solid rgba(255,224,130,.5);color:#f57f17;}
  .btn-view-doc{background:rgba(227,242,253,.9);border:1.5px solid rgba(144,202,249,.5);color:#1565c0;}
  .btn-view-map{background:rgba(232,245,233,.9);border:1.5px solid rgba(165,214,167,.5);color:#2e7d32;}
  .doc-thumb{width:36px;height:36px;border-radius:8px;overflow:hidden;border:1.5px solid rgba(200,200,220,.5);box-shadow:0 2px 6px rgba(0,0,0,.1);flex-shrink:0;display:block;}
  .owner-warning{display:inline-flex;align-items:center;padding:8px 12px;border-radius:999px;background:rgba(255,242,205,.95);color:#b86900;font-size:.73rem;font-weight:700;border:1px solid rgba(255,214,10,.4);}
  .doc-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
  .doc-thumb-pdf{width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#ef5350,#e53935);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 6px rgba(239,83,80,.3);}
  .license-cell{display:flex;align-items:center;justify-content:center;}
  .no-doc{font-size:.75rem;color:#b0bec5;font-style:italic;}
  .user-avatar{width:36px;height:36px;border-radius:50%;overflow:hidden;border:2px solid rgba(255,255,255,.85);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.9rem;font-weight:700;color:white;}
  .occupants-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:2000;animation:fadeIn .2s ease-out;}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  .occupants-modal-content{background:white;border-radius:20px;padding:28px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 12px 48px rgba(0,0,0,.25);animation:slideUp .25s ease-out;}
  @keyframes slideUp{from{transform:translateY(20px);opacity:0;}to{transform:translateY(0);opacity:1;}}
  .occupants-modal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}
  .occupants-modal-title{font-family:'Nunito',sans-serif;font-size:1.35rem;font-weight:900;color:#2d2d4e;}
  .occupants-modal-close{background:linear-gradient(135deg,#42a5f5,#1e88e5);color:white;border:none;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.2rem;font-weight:bold;}
  .occupants-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;}
  .occupant-card{background:linear-gradient(135deg,rgba(255,255,255,.95),rgba(242,242,250,.85));border:1.5px solid rgba(200,200,220,.4);border-radius:16px;padding:18px;}
  .occupant-avatar{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#42a5f5,#1e88e5);display:flex;align-items:center;justify-content:center;color:white;font-family:'Nunito',sans-serif;font-size:1.5rem;font-weight:900;flex-shrink:0;overflow:hidden;margin-bottom:12px;}
  .occupant-avatar img{width:100%;height:100%;object-fit:cover;}
  .occupant-name{font-family:'Nunito',sans-serif;font-size:.95rem;font-weight:800;color:#2d2d4e;margin-bottom:6px;}
  .occupant-bio{font-size:.82rem;color:#7a7a9a;line-height:1.4;word-break:break-word;}
  .occupants-empty{text-align:center;padding:32px 20px;color:#9a9ab0;font-size:.9rem;font-style:italic;}
  /* PG Map Popup */
  .pg-map-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9500;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease;}
  .pg-map-box{background:white;border-radius:24px;width:min(680px,100%);max-height:90vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.3);overflow:hidden;animation:slideUp .25s ease;}
  .pg-map-header{display:flex;align-items:center;justify-content:space-between;padding:18px 22px 14px;border-bottom:1.5px solid rgba(200,200,220,.3);}
  .pg-map-title{font-family:'Nunito',sans-serif;font-size:1.05rem;font-weight:800;color:#2d2d4e;display:flex;align-items:center;gap:8px;}
  .pg-map-close{width:34px;height:34px;border-radius:50%;border:none;background:rgba(200,200,220,.25);color:#5a5a7a;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;}
  .pg-map-canvas{width:100%;height:400px;background:rgba(200,200,220,.1);}
  .pg-map-footer{padding:14px 22px;border-top:1.5px solid rgba(200,200,220,.2);display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
  .pg-map-address{font-size:.82rem;color:#5a5a7a;flex:1;}
  .pg-map-coords{font-size:.72rem;color:#9a9ab0;}
`;

const css = injectClay(CLAY_BASE, CLAY_ADMIN, PAGE_CSS);

const KERALA_CENTER = { lat: 10.8505, lng: 76.2711 };

// ── Load Maps SDK once ────────────────────────────────────────────────────
let _adminSdkPromise = null;
function loadMapsSDK(key) {
  if (window.google?.maps) return Promise.resolve();
  if (_adminSdkPromise) return _adminSdkPromise;
  _adminSdkPromise = new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=en&region=IN`;
    s.async = true; s.defer = true;
    s.onload = res; s.onerror = () => rej(new Error("Maps SDK failed to load"));
    document.head.appendChild(s);
  });
  return _adminSdkPromise;
}

/* ── PG Map Popup ────────────────────────────────────────────────────────── */
function PGMapPopup({ pg, onClose }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapCanvasRef = useRef(null);
  const mapObjRef    = useRef(null);
  const [mapsReady, setMapsReady] = useState(false);

  // Extract coordinates — GeoJSON stores [lng, lat]
  const hasCoords = pg.coordinates?.coordinates?.length === 2;
  const pgLat = hasCoords ? pg.coordinates.coordinates[1] : null;
  const pgLng = hasCoords ? pg.coordinates.coordinates[0] : null;

  useEffect(() => {
    if (!apiKey) return;
    loadMapsSDK(apiKey).then(() => setMapsReady(true)).catch(() => {});
  }, [apiKey]);

  useEffect(() => {
    if (!mapsReady || !mapCanvasRef.current || mapObjRef.current) return;

    const center = hasCoords ? { lat: pgLat, lng: pgLng } : KERALA_CENTER;
    const zoom   = hasCoords ? 16 : 8;

    mapObjRef.current = new window.google.maps.Map(mapCanvasRef.current, {
      center, zoom,
      mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
    });

    if (hasCoords) {
      const svgIcon = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50"><path d="M20 0C9 0 0 9 0 20c0 15 20 30 20 30S40 35 40 20C40 9 31 0 20 0z" fill="#e53935"/><circle cx="20" cy="20" r="12" fill="white"/><text x="20" y="26" text-anchor="middle" font-size="14" font-weight="bold" fill="#c62828">🏠</text></svg>`);
      new window.google.maps.Marker({
        map: mapObjRef.current,
        position: { lat: pgLat, lng: pgLng },
        title: pg.name,
        animation: window.google.maps.Animation.DROP,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + svgIcon,
          scaledSize: new window.google.maps.Size(40, 50),
          anchor: new window.google.maps.Point(20, 50),
        },
      });

      // Info window auto-open
      const infoWin = new window.google.maps.InfoWindow({
        content: `<div style="font-family:Poppins,sans-serif;padding:6px 4px;min-width:200px">
          <div style="font-weight:800;font-size:1rem;color:#2d2d4e;margin-bottom:6px">${pg.name}</div>
          <div style="font-size:.82rem;color:#5a5a7a;margin-bottom:4px">📍 ${pg.location}</div>
          <div style="font-size:.78rem;color:#1565c0;font-weight:700">₹${pg.rent}/month</div>
          <div style="font-size:.72rem;color:#9a9ab0;margin-top:4px">⭐ Trust: ${pg.trustScore}/100</div>
        </div>`,
      });
      const marker = mapObjRef.current.data; // We need the actual marker
      // Re-create for infowindow
      const m = new window.google.maps.Marker({ map: mapObjRef.current, position: { lat:pgLat, lng:pgLng }, visible:false });
      infoWin.open(mapObjRef.current);
    }
  }, [mapsReady]); // eslint-disable-line

  return (
    <div className="pg-map-overlay" onClick={onClose}>
      <div className="pg-map-box" onClick={(e) => e.stopPropagation()}>
        <div className="pg-map-header">
          <div className="pg-map-title">
            <MapPin size={18} color="#e53935" />
            {pg.name} — Location
          </div>
          <button className="pg-map-close" onClick={onClose}>✕</button>
        </div>

        {!apiKey ? (
          <div style={{ padding:24, fontSize:".88rem", color:"#f57f17", fontWeight:600 }}>
            ⚠️ Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to your <code>.env</code> to view maps.
          </div>
        ) : !hasCoords ? (
          <div style={{ padding:40, textAlign:"center", color:"#9a9ab0" }}>
            <div style={{ fontSize:"3rem", marginBottom:12 }}>📍</div>
            <div style={{ fontSize:".95rem", fontWeight:700, color:"#5a5a7a", marginBottom:6 }}>No Location Pinned</div>
            <div style={{ fontSize:".82rem" }}>The owner has not pinned this PG on the map yet.</div>
          </div>
        ) : (
          <div className="pg-map-canvas" ref={mapCanvasRef} />
        )}

        <div className="pg-map-footer">
          <div className="pg-map-address">
            <strong>{pg.name}</strong> — {pg.location}
          </div>
          {hasCoords && (
            <div className="pg-map-coords">
              {pgLat.toFixed(5)}, {pgLng.toFixed(5)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminVerifyMonitor() {
  const [pgListings, setPgListings] = useState([]);
  const [tenants, setTenants]       = useState([]);
  const [owners, setOwners]         = useState([]);
  const [stats, setStats]           = useState({});
  const [loading, setLoading]       = useState(true);
  const [activeSection, setActiveSection] = useState("pgs");
  const [searchQuery, setSearchQuery]     = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({ isOpen:false, title:"", message:"", callback:null });
  const [viewingDoc, setViewingDoc]       = useState(null);
  const [selectedPG, setSelectedPG]       = useState(null);   // occupants modal
  const [mapViewPG, setMapViewPG]         = useState(null);   // ← map popup
  const [occupants, setOccupants]         = useState([]);
  const [occupantsLoading, setOccupantsLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [pgsRes, statsRes, usersRes] = await Promise.all([apiAdminGetPGs(), apiAdminStats(), apiAdminGetUsers()]);
      setPgListings(pgsRes.data);
      setStats(statsRes.data);
      const allUsers = (usersRes.data||[]).sort((a,b) => {
        if (a.verificationStatus==="pending" && b.verificationStatus!=="pending") return -1;
        if (b.verificationStatus==="pending" && a.verificationStatus!=="pending") return 1;
        return new Date(b.createdAt)-new Date(a.createdAt);
      });
      setTenants(allUsers.filter((u) => u.role==="tenant"));
      setOwners(allUsers.filter((u) => u.role==="owner"));
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleVerifyPG    = async (id) => { setActionLoading(id+"v"); try { await apiAdminVerifyPG(id); toast.success("PG verified!"); await fetchData(); } catch(err){toast.error(err.message);} finally{setActionLoading("");} };
  const handleRestrictPG  = async (id) => { setActionLoading(id+"r"); try { await apiAdminRestrictPG(id); toast.warning("PG restricted."); await fetchData(); } catch(err){toast.error(err.message);} finally{setActionLoading("");} };
  const handleUnrestrictPG= async (id) => { setActionLoading(id+"u"); try { await apiAdminUnrestrictPG(id); toast.success("PG unrestricted."); await fetchData(); } catch(err){toast.error(err.message);} finally{setActionLoading("");} };
  const handleDeletePG    = async (id, name) => {
    setConfirmDialog({ isOpen:true, title:"Delete PG Listing?", message:`Delete "${name}" permanently?`,
      callback: async () => { setConfirmDialog({...confirmDialog,isOpen:false}); setActionLoading(id+"d"); try{await apiAdminDeletePG(id);toast.success("PG deleted.");await fetchData();}catch(err){toast.error(err.message);}finally{setActionLoading("");} } });
  };

  const handleVerifyUser  = async (id,name) => { setActionLoading(id+"uv"); try{await apiAdminVerifyUser(id);toast.success(`${name} verified!`);await fetchData();}catch(err){toast.error(err.message);}finally{setActionLoading("");} };
  const handleSuspendUser = async (id,name) => {
    setConfirmDialog({ isOpen:true, title:"Suspend User?", message:`Suspend ${name}?`,
      callback: async()=>{ setConfirmDialog({...confirmDialog,isOpen:false}); setActionLoading(id+"us"); try{await apiAdminSuspendUser(id);toast.warning(`${name} suspended.`);await fetchData();}catch(err){toast.error(err.message);}finally{setActionLoading("");} } });
  };
  const handleUnsuspendUser=async(id,name)=>{
    setConfirmDialog({ isOpen:true, title:"Lift Suspension?", message:`Lift suspension for ${name}?`,
      callback:async()=>{ setConfirmDialog({...confirmDialog,isOpen:false});setActionLoading(id+"uu");try{await apiAdminUnsuspendUser(id);toast.success("Suspension lifted.");await fetchData();}catch(err){toast.error(err.message);}finally{setActionLoading("");} } });
  };
  const handleDeleteUser  = async(id,name)=>{
    setConfirmDialog({ isOpen:true, title:"Delete User?", message:`Delete ${name} permanently?`,
      callback:async()=>{ setConfirmDialog({...confirmDialog,isOpen:false});setActionLoading(id+"ud");try{await apiAdminDeleteUser(id);toast.success(`${name} deleted.`);await fetchData();}catch(err){toast.error(err.message);}finally{setActionLoading("");} } });
  };

  const fetchOccupants = async (pgId) => {
    try {
      setOccupantsLoading(true);
      const res = await apiGetPGRoommates(pgId);
      const all = [];
      if (res.data && Array.isArray(res.data)) {
        res.data.forEach((roomData) => {
          if (roomData.tenants && Array.isArray(roomData.tenants)) {
            roomData.tenants.forEach((t) => { if (t && t._id) all.push(t); });
          }
        });
      }
      setOccupants(all);
    } catch { toast.error("Failed to fetch occupants"); }
    finally { setOccupantsLoading(false); }
  };

  const handleOpenOccupantsModal = async (pg) => { setSelectedPG(pg); await fetchOccupants(pg._id); };

  const chipPG      = (s) => s==="verified"?"chip-v":s==="pending"?"chip-p":"chip-r";
  const chipPGLabel = (s) => s==="verified"?"✓ Verified":s==="pending"?"⏳ Pending":"⛔ Restricted";
  const rowClassPG  = (s) => s==="verified"?"pg-row-verified":s==="pending"?"pg-row-pending":"pg-row-restricted";
  const tsColor     = (s) => s>=85?"#2e7d32":s>=70?"#f57f17":"#c62828";
  const chipUser    = (u) => !u.isActive?"chip-s":u.verificationStatus==="verified"?"chip-v":u.verificationStatus==="pending"?"chip-p":"chip-u";
  const chipUserLabel=(u)=> !u.isActive?"⛔ Suspended":u.verificationStatus==="verified"?"✓ Verified":u.verificationStatus==="pending"?"⏳ Pending":"● Unverified";
  const rowClassUser=(u)=> !u.isActive?"user-row-suspended":u.verificationStatus==="verified"?"user-row-verified":u.verificationStatus==="pending"?"user-row-pending":"user-row-unverified";
  const avatarBg    =(role)=> role==="tenant"?"linear-gradient(135deg,#42a5f5,#1e88e5)":"linear-gradient(135deg,#ffa726,#fb8c00)";

  const pgPending     = pgListings.filter((p) => p.verificationStatus==="pending").length;
  const tenantPending = tenants.filter((u) => u.verificationStatus==="pending"&&u.isActive).length;
  const ownerPending  = owners.filter((u) => u.verificationStatus==="pending"&&u.isActive).length;
  const searchLower   = searchQuery.trim().toLowerCase();

  const filteredPGs     = pgListings.filter((pg) => !searchLower || [pg.name,pg.owner?.name,pg.owner?.email,pg.location].some((v)=>v?.toLowerCase().includes(searchLower)));
  const filteredTenants = tenants.filter((u) => !searchLower || [u.name,u.email].some((v)=>v?.toLowerCase().includes(searchLower)));
  const filteredOwners  = owners.filter((u) => !searchLower || [u.name,u.email].some((v)=>v?.toLowerCase().includes(searchLower)));

  const renderUserRow = (u) => (
    <div key={u._id} className={`user-row row-hover ${rowClassUser(u)}`}>
      <div className="user-name-wrap">
        <div className="user-avatar" style={{ background:avatarBg(u.role) }}>
          {u.profilePhotoUrl ? <img src={u.profilePhotoUrl} alt="" style={{ width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%" }} /> : u.name?.[0]?.toUpperCase()||"?"}
        </div>
        <div>
          <div className="cell-name">{u.name}</div>
          <div className="cell-sub">Trust: <b style={{ color:tsColor(u.trustScore) }}>{u.trustScore}</b>/100</div>
        </div>
      </div>
      <div className="cell-email">{u.email}</div>
      <div><span className={`status-chip ${chipUser(u)}`}>{chipUserLabel(u)}</span></div>
      <div className="doc-slot">
        {u.documentUrl ? <button onClick={() => setViewingDoc(u)} className="act-btn btn-view-doc"><Eye size={12} /> View</button> : <span className="no-doc">No doc</span>}
      </div>
      <div className="act-group">
        {u.isActive ? (
          <>
            {u.verificationStatus!=="verified" && <button className="act-btn btn-verify" onClick={() => handleVerifyUser(u._id,u.name)} disabled={!!actionLoading}><CheckCircle2 size={12} /> Verify</button>}
            <button className="act-btn btn-warn" onClick={() => handleSuspendUser(u._id,u.name)} disabled={!!actionLoading}>⛔ Suspend</button>
            <button className="act-btn btn-delete" onClick={() => handleDeleteUser(u._id,u.name)} disabled={!!actionLoading}><Trash2 size={12} /> Delete</button>
          </>
        ) : (
          <>
            <span style={{ fontSize:".72rem", color:"#c62828", fontWeight:700 }}>🔒 Suspended</span>
            <button className="act-btn btn-verify" onClick={() => handleUnsuspendUser(u._id,u.name)} disabled={!!actionLoading}>✓ Lift</button>
            <button className="act-btn btn-delete" onClick={() => handleDeleteUser(u._id,u.name)} disabled={!!actionLoading}><Trash2 size={12} /> Delete</button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <style>{css}</style>

      <ConfirmationModal isOpen={confirmDialog.isOpen} title={confirmDialog.title} message={confirmDialog.message}
        onYes={confirmDialog.callback||(()=>{})} onNo={() => setConfirmDialog({...confirmDialog,isOpen:false})} />

      {/* ── PG Map Popup ── */}
      {mapViewPG && <PGMapPopup pg={mapViewPG} onClose={() => setMapViewPG(null)} />}

      <div className="clay-page">
        <RoleNavigation role="admin" />
        <main className="clay-main">
          <div className="clay-container">
            <h2 className="clay-page-title">✅ Verification & Management</h2>
            <p className="clay-page-sub">Review, verify, restrict or remove users and PG listings.</p>

            {/* Stats */}
            <div className="stats6">
              {[
                { label:"PG Stays",      value:stats.totalPGs??pgListings.length, cls:"s-blue",   vcls:"v-b", icon:"🏠" },
                { label:"PGs Pending",   value:pgPending,                          cls:"s-yellow", vcls:"v-y", icon:"⏳" },
                { label:"Tenants",       value:tenants.length,                     cls:"s-teal",   vcls:"v-t", icon:"👤" },
                { label:"Tenants Pending",value:tenantPending,                     cls:"s-yellow", vcls:"v-y", icon:"🪪" },
                { label:"Owners",        value:owners.length,                      cls:"s-purple", vcls:"v-p", icon:"🏢" },
                { label:"Owners Pending",value:ownerPending,                       cls:"s-red",    vcls:"v-r", icon:"📋" },
              ].map((s,i) => (
                <div key={s.label} className={`clay-stat ${s.cls}`} style={{ animationDelay:`${i*0.07}s` }}>
                  <div style={{ fontSize:"1.5rem", marginBottom:8 }}>{s.icon}</div>
                  <div className={`stat-val ${s.vcls}`}>{loading?"…":(s.value??0)}</div>
                  <div className="stat-lbl" style={{ marginTop:6, marginBottom:0 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Section tabs */}
            <div className="section-tabs">
              <button className={`sec-tab${activeSection==="pgs"?" active":""}`} onClick={() => setActiveSection("pgs")}>
                <Home size={15} /> PG Stays <span className="sec-tab-count">{pgListings.length}</span>
              </button>
              <button className={`sec-tab${activeSection==="tenants"?" active":""}`} onClick={() => setActiveSection("tenants")}>
                <User size={15} /> Tenants <span className="sec-tab-count">{tenants.length}</span>
              </button>
              <button className={`sec-tab${activeSection==="owners"?" active":""}`} onClick={() => setActiveSection("owners")}>
                <Building2 size={15} /> Owners <span className="sec-tab-count">{owners.length}</span>
              </button>
            </div>

            <div className="search-bar">
              <input className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PG, owner, tenant or email..." />
            </div>

            {/* ══ PG STAYS ══ */}
            {activeSection === "pgs" && (
              <div className="clay-card clay-card-p">
                <div className="clay-section-title">🏠 PG Verification & Management</div>
                {loading ? (
                  <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading…</div>
                ) : filteredPGs.length === 0 ? (
                  <div className="clay-empty"><span className="clay-empty-emoji">📭</span>No PG listings found.</div>
                ) : (
                  <>
                    <div className="col-header-pg">
                      <span className="col-head">PG Name</span>
                      <span className="col-head">Owner</span>
                      <span className="col-head">Status</span>
                      <span className="col-head">Trust</span>
                      <span className="col-head">Complaints</span>
                      <span className="col-head">License</span>
                      <span className="col-head">Map</span>
                      <span className="col-head">Actions</span>
                    </div>

                    {filteredPGs.map((pg) => (
                      <div key={pg._id}
                        className={`pg-row row-hover ${rowClassPG(pg.verificationStatus)}`}
                        onClick={(e) => { if (!e.target.closest("button")&&!e.target.closest(".act-group")) handleOpenOccupantsModal(pg); }}
                        style={{ cursor:"pointer" }}
                      >
                        <div>
                          <div className="cell-name">{pg.name}</div>
                          <div className="cell-sub">{pg.location||""}</div>
                        </div>
                        <div className="cell-email">{pg.owner?.name||pg.owner?.email||"—"}</div>
                        <div><span className={`status-chip ${chipPG(pg.verificationStatus)}`}>{chipPGLabel(pg.verificationStatus)}</span></div>
                        <div className="trust-cell" style={{ color:tsColor(pg.trustScore) }}>{pg.trustScore}/100</div>
                        <div className={`complaints-cell ${pg.complaints>0?"c-warn":"c-ok"}`}>
                          {pg.complaints>0?`⚠️ ${pg.complaints}`:"✓ 0"}
                        </div>

                        {/* License */}
                        <div className="license-cell">
                          {pg.licenseDocument?.url
                            ? <button onClick={() => setViewingDoc({documentUrl:pg.licenseDocument.url,documentFileType:pg.licenseDocument.fileType})} className="act-btn btn-view-doc"><Eye size={12} /> View</button>
                            : <span style={{ fontSize:".72rem", color:"#9a9ab0" }}>—</span>}
                        </div>

                        {/* ── Map button ── */}
                        <div>
                          <button
                            className="act-btn btn-view-map"
                            onClick={(e) => { e.stopPropagation(); setMapViewPG(pg); }}
                            title={pg.coordinates?.coordinates?.length ? "View location on map" : "No location pinned yet"}
                            style={{ opacity: pg.coordinates?.coordinates?.length ? 1 : 0.5 }}
                          >
                            <MapPin size={12} />
                            {pg.coordinates?.coordinates?.length ? "Map" : "No Pin"}
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="act-group">
                          {pg.verificationStatus==="pending" && (
                            <>
                              <button className="act-btn btn-verify" onClick={() => handleVerifyPG(pg._id)}
                                disabled={!!actionLoading||pg.owner?.verificationStatus!=="verified"}
                                title={pg.owner?.verificationStatus!=="verified"?"Verify owner first":""}>
                                <CheckCircle2 size={12} /> Verify
                              </button>
                              <button className="act-btn btn-restrict" onClick={() => handleRestrictPG(pg._id)} disabled={!!actionLoading}>
                                <XCircle size={12} /> Reject
                              </button>
                            </>
                          )}
                          {pg.verificationStatus==="pending"&&pg.owner?.verificationStatus!=="verified" && (
                            <span className="owner-warning">Verify owner first</span>
                          )}
                          {pg.verificationStatus==="verified" && (
                            <button className="act-btn btn-warn" onClick={() => handleRestrictPG(pg._id)} disabled={!!actionLoading}>⛔ Restrict</button>
                          )}
                          {pg.verificationStatus==="restricted" && (
                            <button className="act-btn btn-verify" onClick={() => handleUnrestrictPG(pg._id)} disabled={!!actionLoading}>✅ Unrestrict</button>
                          )}
                          <button className="act-btn btn-delete" onClick={() => handleDeletePG(pg._id,pg.name)} disabled={!!actionLoading}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ══ TENANTS ══ */}
            {activeSection==="tenants" && (
              <div className="clay-card clay-card-p">
                <div className="clay-section-title">👤 Tenant Verification</div>
                <p style={{ fontSize:".82rem", color:"#7a7a9a", marginBottom:16 }}>Verify tenant Aadhaar / Student ID documents.</p>
                {loading ? <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading…</div>
                  : filteredTenants.length===0 ? <div className="clay-empty"><span className="clay-empty-emoji">📭</span>No tenants yet.</div>
                  : (<><div className="col-header-user"><span className="col-head">Tenant</span><span className="col-head">Email</span><span className="col-head">Status</span><span className="col-head">Document</span><span className="col-head">Actions</span></div>{filteredTenants.map(renderUserRow)}</>)}
              </div>
            )}

            {/* ══ OWNERS ══ */}
            {activeSection==="owners" && (
              <div className="clay-card clay-card-p">
                <div className="clay-section-title">🏢 Owner Verification</div>
                <p style={{ fontSize:".82rem", color:"#7a7a9a", marginBottom:16 }}>Verify owner Aadhaar / PAN / Property docs.</p>
                {loading ? <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Loading…</div>
                  : filteredOwners.length===0 ? <div className="clay-empty"><span className="clay-empty-emoji">📭</span>No owners yet.</div>
                  : (<><div className="col-header-user"><span className="col-head">Owner</span><span className="col-head">Email</span><span className="col-head">Status</span><span className="col-head">Document</span><span className="col-head">Actions</span></div>{filteredOwners.map(renderUserRow)}</>)}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Document View Modal */}
      {viewingDoc && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, backgroundColor:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ backgroundColor:"white", borderRadius:16, padding:20, maxWidth:"90vw", maxHeight:"90vh", overflow:"auto", position:"relative" }}>
            <button onClick={() => setViewingDoc(null)}
              style={{ position:"absolute", top:10, left:10, background:"linear-gradient(135deg,#42a5f5,#1e88e5)", color:"white", border:"none", borderRadius:"50%", width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:18, fontWeight:"bold" }}>
              ←
            </button>
            <div style={{ marginTop:50 }}>
              {viewingDoc.documentFileType==="pdf"
                ? <iframe src={viewingDoc.documentUrl} width="100%" height="600px" style={{ border:"none", borderRadius:8 }} title="Document" />
                : <img src={viewingDoc.documentUrl} alt="Document" style={{ maxWidth:"100%", maxHeight:"600px", borderRadius:8 }} />}
            </div>
          </div>
        </div>
      )}

      {/* Occupants Modal */}
      {selectedPG && (
        <div className="occupants-modal-overlay" onClick={() => setSelectedPG(null)}>
          <div className="occupants-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="occupants-modal-header">
              <div>
                <div className="occupants-modal-title">👥 Current Occupants</div>
                <div style={{ fontSize:".85rem", color:"#7a7a9a", marginTop:4 }}>{selectedPG.name}</div>
              </div>
              <button className="occupants-modal-close" onClick={() => setSelectedPG(null)}>✕</button>
            </div>
            {occupantsLoading ? <div style={{ textAlign:"center", padding:32, color:"#9a9ab0" }}>⏳ Loading…</div>
              : occupants.length > 0 ? (
                <div className="occupants-grid">
                  {occupants.map((o) => (
                    <div key={o._id} className="occupant-card">
                      <div className="occupant-avatar">
                        {o.profilePhotoUrl ? <img src={o.profilePhotoUrl} alt={o.name} /> : o.name?.[0]?.toUpperCase()||"?"}
                      </div>
                      <div className="occupant-name">{o.name||"Unknown"}</div>
                      <div className="occupant-bio">{o.bio||"No bio available"}</div>
                    </div>
                  ))}
                </div>
              ) : <div className="occupants-empty">No occupants in this PG</div>}
          </div>
        </div>
      )}
    </>
  );
}