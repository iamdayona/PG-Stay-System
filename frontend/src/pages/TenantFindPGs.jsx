import { useEffect, useState, useRef, useCallback } from "react";
import { MapPin } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import { toast } from "../components/Toast";
import PGDetailsModal from "../components/PGDetailsModal";
import {
  apiGetAllPGs, apiApply, apiGetRooms, apiGetMe,
  apiGetPGRoommates, apiGetNearbyPGs,
} from "../utils/api";
import { CLAY_BASE, CLAY_TENANT, injectClay } from "../styles/claystyles";
import { toTitleCase } from "../utils/capitalization";

const ALL_AMENITIES = [
  "Furnished Room","Clean Bathroom & Toilets","Electricity & Power Supply",
  "Running Water","Safe Drinking Water","Food / Meal Service","Internet / Wi-Fi",
  "Housekeeping","Laundry Facilities","Security & Safety","Refrigerator",
  "Induction or Microwave for Basic Cooking","Common Lounge or Seating Area",
  "Parking for Bikes","AC","CCTV","Gym","24/7 Water Supply",
];

const KERALA_CENTER = { lat: 10.8505, lng: 76.2711 };

const PAGE_CSS = `
  .find-layout{display:grid;grid-template-columns:280px 1fr;gap:24px;}
  @media(max-width:800px){.find-layout{grid-template-columns:1fr;}}
  .filter-panel{background:rgba(255,255,255,.65);backdrop-filter:blur(18px);border:2.5px solid rgba(255,255,255,.85);border-radius:24px;padding:24px;box-shadow:0 8px 32px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95);height:fit-content;position:sticky;top:80px;animation:fadeUp .6s ease both;}
  .filter-title{font-family:'Nunito',sans-serif;font-size:1rem;font-weight:800;color:#2d2d4e;margin-bottom:20px;display:flex;align-items:center;gap:8px;}
  .filter-group{margin-bottom:18px;}
  .budget-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .rt-btn-row{display:flex;flex-direction:column;gap:8px;}
  .rt-btn{width:100%;padding:10px 14px;border:2px solid rgba(200,200,220,.5);border-radius:12px;font-family:'Poppins',sans-serif;font-size:.83rem;font-weight:600;cursor:pointer;background:rgba(255,255,255,.6);color:#5a5a7a;transition:all .16s;text-align:left;display:flex;align-items:center;gap:10px;}
  .rt-btn.active{border-color:#42a5f5;background:linear-gradient(135deg,rgba(66,165,245,.12),rgba(144,202,249,.08));color:#1565c0;box-shadow:0 3px 10px rgba(66,165,245,.18);}
  .rt-cap-input{width:100%;margin-top:8px;padding:9px 12px;border:2px solid rgba(144,202,249,.4);border-radius:10px;font-family:'Poppins',sans-serif;font-size:.83rem;outline:none;background:rgba(227,242,253,.4);}
  .amenity-list{max-height:200px;overflow-y:auto;padding-right:4px;scrollbar-width:thin;}
  .amenity-list::-webkit-scrollbar{width:4px;}
  .amenity-list::-webkit-scrollbar-thumb{background:rgba(66,165,245,.3);border-radius:4px;}
  .clay-checkbox-row{display:flex;align-items:center;gap:10px;margin-bottom:9px;}
  .clay-checkbox-row input[type="checkbox"]{width:16px;height:16px;flex-shrink:0;accent-color:#42a5f5;cursor:pointer;margin:0;}
  .clay-checkbox-row label{font-size:.82rem;color:#5a5a7a;font-weight:500;cursor:pointer;user-select:none;line-height:1.3;}
  .clay-divider{height:1.5px;background:rgba(200,200,220,.35);border-radius:4px;margin:18px 0;}
  .filter-panel .clay-btn{width:100%;justify-content:center;margin-bottom:10px;display:flex;}
  .filter-panel .clay-btn:last-child{margin-bottom:0;}
  .listings-col{display:flex;flex-direction:column;gap:18px;}
  .pg-card{background:rgba(255,255,255,.65);backdrop-filter:blur(18px);border:2.5px solid rgba(255,255,255,.85);border-radius:24px;padding:24px;box-shadow:0 8px 28px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95);transition:transform .22s,box-shadow .22s,border-color .22s;animation:fadeUp .6s ease both;position:relative;overflow:hidden;}
  .pg-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;border-radius:24px 24px 0 0;background:linear-gradient(90deg,#42a5f5,#66bb6a);opacity:0;transition:opacity .2s;}
  .pg-card:hover{transform:translateY(-5px);box-shadow:0 18px 44px rgba(0,0,0,.12);border-color:rgba(66,165,245,.25);}
  .pg-card:hover::before{opacity:1;}
  .pg-card-highlighted{border-color:rgba(66,165,245,.5)!important;box-shadow:0 8px 32px rgba(66,165,245,.2),inset 0 1px 0 rgba(255,255,255,.95)!important;}
  .pg-card-highlighted::before{opacity:1!important;}
  .pg-card-inner{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;}
  .pg-title-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;}
  .pg-name{font-family:'Nunito',sans-serif;font-size:1.15rem;font-weight:900;color:#2d2d4e;}
  .pg-meta-row{display:flex;align-items:center;gap:6px;color:#7a7a9a;font-size:.82rem;margin-bottom:5px;}
  .pg-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;padding-bottom:2px;}
  .rooms-text{font-size:.72rem;color:#9a9ab0;margin-top:10px;font-weight:600;display:flex;align-items:center;gap:5px;}
  .distance-badge{display:inline-flex;align-items:center;gap:4px;background:rgba(102,187,106,.15);border:1.5px solid rgba(102,187,106,.4);border-radius:50px;padding:3px 10px;font-size:.75rem;font-weight:700;color:#2e7d32;margin-top:6px;}
  .apply-btn{flex-shrink:0;padding:12px 22px;border:none;border-radius:16px;font-family:'Poppins',sans-serif;font-size:.88rem;font-weight:700;cursor:pointer;white-space:nowrap;align-self:flex-start;background:linear-gradient(135deg,#42a5f5,#1e88e5);color:white;box-shadow:0 5px 0 #1565c0,0 8px 18px rgba(66,165,245,.35),inset 0 1px 0 rgba(255,255,255,.3);transition:transform .15s,box-shadow .15s,filter .15s;}
  .apply-btn:hover:not(:disabled){filter:brightness(1.06);transform:translateY(-2px);}
  .apply-btn:disabled{opacity:.6;cursor:not-allowed;}
  .apply-btn-locked{background:linear-gradient(135deg,#b0bec5,#90a4ae);box-shadow:0 5px 0 #607d8b,0 8px 18px rgba(144,164,174,.3),inset 0 1px 0 rgba(255,255,255,.3);}
  .apply-btn-applied{background:linear-gradient(135deg,#66bb6a,#43a047);box-shadow:0 5px 0 #2e7d32,0 8px 18px rgba(102,187,106,.35),inset 0 1px 0 rgba(255,255,255,.3);cursor:default;}
  .apply-btn-applied:hover{filter:none;transform:none;}
  .verify-gate{background:rgba(255,235,238,.85);border:2px solid rgba(239,154,154,.5);border-radius:18px;padding:18px 20px;margin-bottom:24px;display:flex;align-items:flex-start;gap:14px;}
  .verify-gate-icon{font-size:1.8rem;flex-shrink:0;}
  .verify-gate-title{font-family:'Nunito',sans-serif;font-size:1rem;font-weight:800;color:#c62828;margin-bottom:4px;}
  .verify-gate-sub{font-size:.82rem;color:#7a7a9a;}
  .verify-gate-link{display:inline-block;margin-top:8px;padding:7px 16px;border-radius:10px;background:linear-gradient(135deg,#42a5f5,#1e88e5);color:white;font-size:.82rem;font-weight:700;cursor:pointer;border:none;}
  .gallery{display:flex;gap:8px;overflow-x:auto;padding:10px 0 4px;scrollbar-width:thin;}
  .gallery::-webkit-scrollbar{height:4px;}
  .gallery::-webkit-scrollbar-thumb{background:rgba(180,180,200,.4);border-radius:4px;}
  .gallery-img{flex-shrink:0;width:130px;height:86px;border-radius:12px;object-fit:cover;border:2px solid rgba(255,255,255,.85);box-shadow:0 3px 10px rgba(0,0,0,.1);transition:transform .2s;cursor:pointer;}
  .gallery-img:hover{transform:scale(1.04);}
  .gallery-placeholder{flex-shrink:0;width:130px;height:86px;border-radius:12px;background:rgba(200,200,220,.2);border:2px dashed rgba(180,180,200,.4);display:flex;align-items:center;justify-content:center;color:#b0b0c8;font-size:.75rem;}
  /* Map section */
  .map-section{background:rgba(255,255,255,.65);backdrop-filter:blur(18px);border:2.5px solid rgba(255,255,255,.85);border-radius:24px;padding:24px;box-shadow:0 8px 28px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.95);margin-bottom:24px;animation:fadeUp .5s ease both;}
  .map-section-title{font-family:'Nunito',sans-serif;font-size:1rem;font-weight:800;color:#2d2d4e;margin-bottom:14px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
  .map-container{width:100%;height:380px;border-radius:16px;border:2px solid rgba(255,255,255,.85);box-shadow:0 4px 18px rgba(0,0,0,.1);overflow:hidden;background:rgba(200,200,220,.1);}
  .map-result-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(66,165,245,.12);border:1.5px solid rgba(66,165,245,.3);border-radius:50px;font-size:.78rem;font-weight:600;color:#1565c0;margin-top:10px;}
  /* Filter map search area */
  .map-filter-box{background:rgba(66,165,245,.06);border:1.5px solid rgba(66,165,245,.2);border-radius:16px;padding:14px;margin-bottom:18px;}
  .map-filter-label{font-family:'Nunito',sans-serif;font-size:.82rem;font-weight:800;color:#1565c0;margin-bottom:8px;display:flex;align-items:center;gap:6px;}
  .active-filters-bar{display:flex;gap:8px;flex-wrap:wrap;padding:10px 14px;background:rgba(66,165,245,.06);border:1.5px solid rgba(66,165,245,.2);border-radius:14px;margin-bottom:16px;align-items:center;}
  .active-filter-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:rgba(66,165,245,.15);border:1.5px solid rgba(66,165,245,.35);border-radius:50px;font-size:.74rem;font-weight:700;color:#1565c0;}
`;

const css = injectClay(CLAY_BASE, CLAY_TENANT, PAGE_CSS);

// ── Load Google Maps SDK once ──────────────────────────────────────────────
let _sdkPromise = null;
function loadMapsSDK(key) {
  if (window.google?.maps) return Promise.resolve();
  if (_sdkPromise) return _sdkPromise;
  _sdkPromise = new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=en&region=IN`;
    s.async = true; s.defer = true;
    s.onload = res; s.onerror = () => rej(new Error("Maps SDK failed to load"));
    document.head.appendChild(s);
  });
  return _sdkPromise;
}

export default function FindPGs() {
  const [pgListings, setPgListings]   = useState([]);   // full list (default / after filter)
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [applying, setApplying]       = useState("");
  const [appliedPGs, setAppliedPGs]   = useState([]);
  const [selectedPGDetails, setSelectedPGDetails] = useState(null);
  const [pgRooms, setPgRooms]         = useState({});
  const [roommatesByPG, setRoommatesByPG] = useState({});
  const [activePickerPGId, setActivePickerPGId] = useState(null);
  const [selectedRoomByPG, setSelectedRoomByPG] = useState({});

  // ── Pending filter state (changed by user, NOT yet applied) ──
  const [pendingFilters, setPendingFilters] = useState({
    budgetMin: "", budgetMax: "", amenities: [], roomType: "", capacity: "",
    locationText: "", locationCoords: null,   // { lat, lng, address }
  });

  // ── Active (applied) filter state — drives the current results ──
  const [activeFilters, setActiveFilters] = useState(null); // null = no filter active

  // Map state
  const [mapsReady, setMapsReady]           = useState(false);
  const [mapSearching, setMapSearching]     = useState(false);
  const [highlightedPGId, setHighlightedPGId] = useState(null);

  const mapRef        = useRef(null);
  const mapObj        = useRef(null);
  const filterInputRef = useRef(null);
  const markersRef    = useRef([]);
  const pinRef        = useRef(null);
  const infoWinRef    = useRef(null);
  // Store resolved location coords here between autocomplete pick and filter apply
  const pendingLocationRef = useRef(null);

  const parseAddress = (s) => {
    if (!s) return {};
    return s.split("\n").reduce((acc, line) => {
      if (line.includes("Name of Pg:"))               acc.pgName           = line.split(":")[1]?.trim()||"";
      else if (line.includes("Street name/locality:")) acc.street          = line.split(":")[1]?.trim()||"";
      else if (line.includes("Post office name:"))     acc.postOffice      = line.split(":")[1]?.trim()||"";
      else if (line.includes("Place of residence:"))   acc.placeOfResidence= line.split(":")[1]?.trim()||"";
      else if (line.includes("District:"))             acc.district        = line.split(":")[1]?.trim()||"";
      else if (line.includes("Pin number:"))           acc.pinNumber       = line.split(":")[1]?.trim()||"";
      return acc;
    }, {});
  };

  // ── Load all PGs on mount ────────────────────────────────────────────
  useEffect(() => {
    Promise.all([apiGetAllPGs(), apiGetMe()])
      .then(([pgRes, meRes]) => {
        setPgListings(pgRes.data);
        setUser(meRes.user);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Load Maps SDK ────────────────────────────────────────────────────
  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) return;
    loadMapsSDK(key).then(() => setMapsReady(true)).catch(() => {});
  }, []);

  // ── Init map + autocomplete ──────────────────────────────────────────
  useEffect(() => {
    if (!mapsReady || !mapRef.current || mapObj.current) return;
    mapObj.current = new window.google.maps.Map(mapRef.current, {
      center: KERALA_CENTER, zoom: 8,
      mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
    });
    infoWinRef.current = new window.google.maps.InfoWindow();

    if (filterInputRef.current) {
      const auto = new window.google.maps.places.Autocomplete(filterInputRef.current, {
        componentRestrictions: { country: "IN" },
        fields: ["geometry","formatted_address","name"],
        bounds: new window.google.maps.LatLngBounds({ lat:8.17,lng:74.85 },{ lat:12.79,lng:77.42 }),
        strictBounds: false,
      });
      auto.addListener("place_changed", () => {
        const place = auto.getPlace();
        if (!place.geometry?.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name || "";
        // Store resolved coords for when Apply Filters is clicked
        pendingLocationRef.current = { lat, lng };
        setPendingFilters((prev) => ({ ...prev, locationText: address, locationCoords: { lat, lng } }));
      });
    }
  }, [mapsReady]); // eslint-disable-line

  // ── Place markers for an array of PGs ───────────────────────────────
  const placeMarkers = useCallback((pgs, centerLat, centerLng) => {
    if (!mapObj.current || !window.google?.maps) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    let hasCoords = false;

    pgs.forEach((pg) => {
      if (!pg.coordinates?.coordinates?.length) return;
      const [pgLng, pgLat] = pg.coordinates.coordinates;
      bounds.extend({ lat: pgLat, lng: pgLng });
      hasCoords = true;

      const svgIcon = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
          <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="#1e88e5"/>
          <circle cx="18" cy="18" r="10" fill="white"/>
          <text x="18" y="23" text-anchor="middle" font-size="13" font-weight="bold" fill="#1565c0">🏠</text>
        </svg>`
      );

      const marker = new window.google.maps.Marker({
        map: mapObj.current,
        position: { lat: pgLat, lng: pgLng },
        title: pg.name,
        animation: window.google.maps.Animation.DROP,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + svgIcon,
          scaledSize: new window.google.maps.Size(36, 44),
          anchor: new window.google.maps.Point(18, 44),
        },
      });

      const distHtml = pg.distanceKm != null
        ? `<div style="color:#2e7d32;font-weight:700;font-size:.75rem;margin-top:4px">📍 ${pg.distanceKm} km away</div>`
        : "";

      marker.addListener("click", () => {
        infoWinRef.current.setContent(
          `<div style="font-family:Poppins,sans-serif;min-width:180px;padding:4px 2px">
            <div style="font-weight:800;font-size:.95rem;color:#2d2d4e;margin-bottom:4px">${pg.name}</div>
            <div style="font-size:.78rem;color:#5a5a7a;margin-bottom:3px">📍 ${pg.location}</div>
            <div style="font-size:.78rem;color:#1565c0;font-weight:700;margin-bottom:3px">₹${pg.rent}/month</div>
            ${distHtml}
            <div style="font-size:.72rem;color:#9a9ab0;margin-top:3px">⭐ Trust: ${pg.trustScore}/100</div>
            <div style="font-size:.72rem;color:#388e3c;margin-top:2px">🚪 ${pg.availableRoomCount??0} room(s) available</div>
          </div>`
        );
        infoWinRef.current.open(mapObj.current, marker);
        setHighlightedPGId(pg._id);
        document.getElementById(`pgcard-${pg._id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
      marker.addListener("mouseover", () => setHighlightedPGId(pg._id));
      marker.addListener("mouseout",  () => setHighlightedPGId(null));
      markersRef.current.push(marker);
    });

    if (hasCoords) {
      // If a search pin exists, also include it in bounds
      if (centerLat != null && centerLng != null) bounds.extend({ lat: centerLat, lng: centerLng });
      mapObj.current.fitBounds(bounds, { top:60, right:60, bottom:60, left:60 });
      window.google.maps.event.addListenerOnce(mapObj.current, "idle", () => {
        if (mapObj.current.getZoom() > 15) mapObj.current.setZoom(15);
      });
    }
  }, []);

  // ── Place/update search pin ──────────────────────────────────────────
  const placeSearchPin = useCallback((lat, lng) => {
    if (!mapObj.current || !window.google?.maps) return;
    const redSvg = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24S32 28 32 16C32 7.16 24.84 0 16 0z" fill="#e53935"/>
        <circle cx="16" cy="16" r="8" fill="white"/>
        <circle cx="16" cy="16" r="4" fill="#e53935"/>
      </svg>`
    );
    if (pinRef.current) {
      pinRef.current.setPosition({ lat, lng });
      pinRef.current.setVisible(true);
    } else {
      pinRef.current = new window.google.maps.Marker({
        map: mapObj.current,
        position: { lat, lng },
        animation: window.google.maps.Animation.DROP,
        zIndex: 999,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + redSvg,
          scaledSize: new window.google.maps.Size(32, 40),
          anchor: new window.google.maps.Point(16, 40),
        },
      });
    }
  }, []);

  // ── Auto-place markers whenever pgListings changes (default view) ────
  useEffect(() => {
    if (!mapsReady || activeFilters !== null) return;
    // Default: show all PG markers
    placeMarkers(pgListings, null, null);
  }, [pgListings, mapsReady, placeMarkers, activeFilters]);

  // ── APPLY FILTERS ────────────────────────────────────────────────────
  const handleApplyFilters = async () => {
    setLoading(true);
    const f = pendingFilters;

    // Snapshot active filters for display
    setActiveFilters({ ...f });

    try {
      if (f.locationCoords) {
        // Location filter active → nearby search, then apply other filters client-side
        setMapSearching(true);
        placeSearchPin(f.locationCoords.lat, f.locationCoords.lng);
        mapObj.current?.panTo(f.locationCoords);

        const res = await apiGetNearbyPGs({ lat: f.locationCoords.lat, lng: f.locationCoords.lng, radius: 15000 });
        let nearby = res.data || [];

        // Apply remaining filters client-side on nearby results
        nearby = applyClientFilters(nearby, f);

        setPgListings(nearby);
        placeMarkers(nearby, f.locationCoords.lat, f.locationCoords.lng);

        if (nearby.length === 0) {
          toast.warning("No PGs found matching your filters within 15 km.");
        } else {
          toast.success(`Found ${nearby.length} PG${nearby.length!==1?"s":""} matching your filters.`);
        }
      } else {
        // No location filter → server-side filters (budget, roomType, amenities)
        if (pinRef.current) pinRef.current.setVisible(false);
        if (infoWinRef.current) infoWinRef.current.close();

        const p = new URLSearchParams();
        if (f.budgetMin)            p.append("budgetMin",  f.budgetMin);
        if (f.budgetMax)            p.append("budgetMax",  f.budgetMax);
        if (f.amenities.length > 0) p.append("amenities",  f.amenities.join(","));
        if (f.roomType)             p.append("roomType",   f.roomType);
        if (f.roomType === "Shared" && f.capacity) p.append("capacity", f.capacity);

        const res = await apiGetAllPGs(p.toString() ? `?${p}` : "");
        const results = res.data || [];
        setPgListings(results);
        placeMarkers(results, null, null);

        toast.success(`Showing ${results.length} PG${results.length!==1?"s":""} matching your filters.`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setMapSearching(false);
    }
  };

  // ── Client-side filter helper (used after nearby API call) ───────────
  const applyClientFilters = (pgs, f) => {
    return pgs.filter((pg) => {
      if (f.budgetMin && pg.rent < Number(f.budgetMin)) return false;
      if (f.budgetMax && pg.rent > Number(f.budgetMax)) return false;
      if (f.amenities.length > 0) {
        const pgAmenities = pg.amenities || [];
        if (!f.amenities.every((a) => pgAmenities.includes(a))) return false;
      }
      if (f.roomType) {
        // Check if any room matches the type (if rooms are included in PG data)
        // Fallback: match against pg.roomTypes if available
        if (pg.roomTypes && !pg.roomTypes.includes(f.roomType)) return false;
      }
      return true;
    });
  };

  // ── RESET FILTERS ────────────────────────────────────────────────────
  const resetFilters = () => {
    setPendingFilters({ budgetMin:"", budgetMax:"", amenities:[], roomType:"", capacity:"", locationText:"", locationCoords:null });
    pendingLocationRef.current = null;
    setActiveFilters(null);
    setHighlightedPGId(null);
    if (pinRef.current) pinRef.current.setVisible(false);
    if (infoWinRef.current) infoWinRef.current.close();
    if (mapObj.current) { mapObj.current.panTo(KERALA_CENTER); mapObj.current.setZoom(8); }
    setLoading(true);
    apiGetAllPGs()
      .then((r) => {
        setPgListings(r.data);
        // Markers will be updated via the pgListings useEffect (activeFilters is now null)
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  const toggleAmenity = (v) =>
    setPendingFilters((p) => ({
      ...p,
      amenities: p.amenities.includes(v) ? p.amenities.filter((a) => a !== v) : [...p.amenities, v],
    }));

  // ── Active filter chips for the results bar ──────────────────────────
  const buildActiveChips = (f) => {
    if (!f) return [];
    const chips = [];
    if (f.locationText) chips.push(`📍 ${f.locationText.split(",")[0]} (15 km)`);
    if (f.budgetMin || f.budgetMax) chips.push(`₹${f.budgetMin||"0"} – ${f.budgetMax||"∞"}`);
    if (f.roomType) chips.push(`🛏 ${f.roomType}${f.roomType==="Shared"&&f.capacity?` (${f.capacity}p)`:""}`);
    if (f.amenities.length > 0) chips.push(`✅ ${f.amenities.length} amenity${f.amenities.length>1?"ies":""}`);
    return chips;
  };

  const isVerified  = user?.verificationStatus === "verified";
  const hasDocument = !!user?.documentUrl;
  const apiKeySet   = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const activeChips = buildActiveChips(activeFilters);
  const filtersAreActive = activeFilters !== null;

  const loadRoomsForPG = async (pgId) => {
    if (pgRooms[pgId]) return;
    try { const res = await apiGetRooms(pgId); setPgRooms((p) => ({ ...p, [pgId]: res.data })); }
    catch (err) { toast.error(err.message); }
  };

  const handleOpenRoomPicker = async (pg) => {
    if (!hasDocument) { toast.error("Upload your Aadhaar in profile first."); return; }
    if (!isVerified)  { toast.error("Wait for admin verification to apply."); return; }
    await loadRoomsForPG(pg._id);
    setActivePickerPGId(pg._id);
    setSelectedRoomByPG((p) => ({ ...p, [pg._id]: "" }));
  };

  const handleCloseRoomPicker = (pgId) => {
    if (activePickerPGId === pgId) setActivePickerPGId(null);
    setSelectedRoomByPG((p) => ({ ...p, [pgId]: "" }));
  };

  const handleApplyForRoom = async (pgId, pgName) => {
    const roomId = selectedRoomByPG[pgId];
    if (!roomId) { toast.error("Select a room first."); return; }
    setApplying(pgId);
    try {
      await apiApply({ pgStayId: pgId, roomId });
      setAppliedPGs((p) => [...p, pgId]);
      toast.success(`Applied for ${pgName}! 🎉`);
      handleCloseRoomPicker(pgId);
    } catch (err) { toast.error(err.message); }
    finally { setApplying(""); }
  };

  const handleViewDetails = async (pg) => {
    if (!pgRooms[pg._id]) {
      try { const r = await apiGetRooms(pg._id); setPgRooms((p) => ({ ...p, [pg._id]: r.data })); } catch {}
    }
    if (!roommatesByPG[pg._id]) {
      try { const r = await apiGetPGRoommates(pg._id); setRoommatesByPG((p) => ({ ...p, [pg._id]: r.data })); } catch {}
    }
    setSelectedPGDetails(pg);
    setActivePickerPGId(null);
  };

  // ── PG Card renderer ─────────────────────────────────────────────────
  const renderPGCard = (pg, i) => (
    <div key={pg._id} id={`pgcard-${pg._id}`}
      className={`pg-card${highlightedPGId === pg._id ? " pg-card-highlighted" : ""}`}
      style={{ animationDelay: `${i * 0.07}s` }}
      onMouseEnter={() => setHighlightedPGId(pg._id)}
      onMouseLeave={() => setHighlightedPGId(null)}
    >
      <div className="pg-card-inner">
        <div style={{ flex:1, minWidth:0 }}>
          <div className="pg-title-row">
            <span className="pg-name">{pg.name}</span>
            {pg.matchScore !== undefined && <span className="clay-badge badge-blue">⚡ {pg.matchScore}% match</span>}
            {pg.verificationStatus === "verified" && <span className="clay-badge badge-green">✓ Verified</span>}
          </div>
          <div className="pg-meta-row"><MapPin size={14} /> {pg.location}</div>

          {pg.distanceKm != null && <div className="distance-badge">📍 {pg.distanceKm} km away</div>}

          <div className="pg-tags">
            <span className="clay-badge badge-yellow">⭐ Trust {pg.trustScore}/100</span>
            {(pg.amenities||[]).map((a) => <span key={a} className="clay-badge badge-gray">{a}</span>)}
          </div>

          {pg.images?.length > 0 ? (
            <div className="gallery">{pg.images.map((img) => <img key={img._id} className="gallery-img" src={img.url} alt={pg.name} />)}</div>
          ) : (
            <div className="gallery"><div className="gallery-placeholder">📷 No photos yet</div></div>
          )}
          <div className="rooms-text">🚪 {pg.availableRoomCount ?? pg.availableRooms ?? 0} room(s) available</div>
        </div>

        <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
          <button
            style={{ padding:"10px 16px", background:"rgba(66,165,245,.15)", border:"2px solid rgba(66,165,245,.4)", borderRadius:"12px", color:"#1565c0", fontFamily:"Poppins,sans-serif", fontSize:".82rem", fontWeight:700, cursor:"pointer", transition:"all .15s", whiteSpace:"nowrap" }}
            onClick={() => handleViewDetails(pg)}
            onMouseEnter={(e) => { e.currentTarget.style.background="rgba(66,165,245,.25)"; e.currentTarget.style.borderColor="rgba(66,165,245,.7)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background="rgba(66,165,245,.15)"; e.currentTarget.style.borderColor="rgba(66,165,245,.4)"; }}
          >👁️ View Details</button>

          <button
            className={`apply-btn${!isVerified?" apply-btn-locked":""}${appliedPGs.includes(pg._id)?" apply-btn-applied":""}`}
            onClick={() => !appliedPGs.includes(pg._id) && handleOpenRoomPicker(pg)}
            disabled={applying === pg._id}
          >
            {applying === pg._id ? "⏳ Applying…" : appliedPGs.includes(pg._id) ? "✓ Applied" : !isVerified ? "🔒 Apply for Room" : "Apply for Room"}
          </button>
          {!isVerified && <span style={{ fontSize:".68rem", color:"#9a9ab0", textAlign:"right", maxWidth:90 }}>Verify first</span>}
        </div>

        {/* Room picker modal */}
        {activePickerPGId === pg._id && (
          <div style={{ position:"fixed", inset:0, display:"flex", justifyContent:"center", alignItems:"center", padding:20, background:"rgba(0,0,0,.45)", zIndex:999 }}>
            <div style={{ width:"min(600px,100%)", background:"#fff", borderRadius:22, padding:20, boxShadow:"0 20px 60px rgba(0,0,0,.25)", border:"2px solid #dbe2f1" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ fontSize:".95rem", fontWeight:800, color:"#283e7f" }}>Select room to apply</div>
                <button onClick={() => handleCloseRoomPicker(pg._id)} style={{ border:"none", background:"transparent", fontSize:"1.2rem", cursor:"pointer", color:"#8f9bb8" }}>✕</button>
              </div>
              {pgRooms[pg._id]?.length > 0 ? (
                <>
                  <select value={selectedRoomByPG[pg._id]||""} onChange={(e) => setSelectedRoomByPG((p)=>({...p,[pg._id]:e.target.value}))}
                    style={{ width:"100%", padding:"10px", borderRadius:"10px", border:"1px solid #c7d5ee", marginBottom:"12px" }}>
                    <option value="">-- Choose room --</option>
                    {pgRooms[pg._id].map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.roomNumber?`${room.roomNumber} · `:"N/A · "}{room.roomType} | ₹{room.rent} | cap {room.capacity??"N/A"} | {room.availability?"Available":"Full"}
                      </option>
                    ))}
                  </select>
                  <button className="apply-btn" onClick={() => handleApplyForRoom(pg._id, pg.name)}
                    disabled={applying===pg._id||appliedPGs.includes(pg._id)} style={{ width:"100%", marginBottom:10 }}>
                    {applying===pg._id ? "⏳ Applying…" : "Apply for Selected Room"}
                  </button>
                  <button style={{ width:"100%", padding:"10px", borderRadius:"10px", border:"1px solid #c7d5ee", background:"#fff", color:"#455a64", cursor:"pointer" }}
                    onClick={() => handleCloseRoomPicker(pg._id)}>Close</button>
                </>
              ) : (
                <div style={{ fontSize:".86rem", color:"#606e92" }}>Loading room list...</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">
        <RoleNavigation role="tenant" />
        {selectedPGDetails && (
          <PGDetailsModal pg={selectedPGDetails} rooms={pgRooms[selectedPGDetails._id]||[]}
            roommatesByRoom={roommatesByPG[selectedPGDetails._id]||[]}
            onClose={() => setSelectedPGDetails(null)} parseAddress={parseAddress} />
        )}
        <main className="clay-main">
          <div className="clay-container">
            <h2 className="clay-page-title">🔍 Search PG Accommodations</h2>
            <p className="clay-page-sub">Browse verified PG stays filtered to your preferences.</p>

            {/* Verification gate */}
            {!loading && !isVerified && (
              <div className="verify-gate">
                <div className="verify-gate-icon">🪪</div>
                <div>
                  <div className="verify-gate-title">{!hasDocument ? "Upload Aadhaar to Apply" : "Verification Pending"}</div>
                  <div className="verify-gate-sub">
                    {!hasDocument ? "Upload your Aadhaar before applying to any PG." : "Your Aadhaar is under review — apply once verified."}
                  </div>
                  {!hasDocument && <button className="verify-gate-link" onClick={() => window.location.href="/tenant/profile"}>Go to Profile & Upload →</button>}
                </div>
              </div>
            )}

            {/* ── Google Maps section ── */}
            {apiKeySet ? (
              <div className="map-section">
                <div className="map-section-title">
                  🗺️ PG Locations Map
                  {filtersAreActive && activeFilters?.locationText && (
                    <span style={{ fontSize:".78rem", fontWeight:500, color:"#5a5a7a", marginLeft:"auto" }}>
                      Within 15 km of {activeFilters.locationText.split(",")[0]}
                    </span>
                  )}
                  {!filtersAreActive && (
                    <span style={{ fontSize:".78rem", fontWeight:500, color:"#5a5a7a", marginLeft:"auto" }}>
                      Showing all PGs
                    </span>
                  )}
                </div>
                <div className="map-container" ref={mapRef} />
                {mapSearching && (
                  <div style={{ textAlign:"center", padding:"20px 0", color:"#9a9ab0", fontSize:".88rem" }}>
                    ⏳ Searching within 15 km…
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background:"rgba(255,249,196,.8)", border:"2px solid rgba(255,224,130,.5)", borderRadius:"16px", padding:"14px 18px", marginBottom:24, fontSize:".84rem", color:"#f57f17", fontWeight:600 }}>
                💡 Set <code>VITE_GOOGLE_MAPS_API_KEY</code> in your <code>.env</code> to enable the interactive map.
              </div>
            )}

            <div className="find-layout">
              {/* ── Filter Panel ── */}
              <div className="filter-panel">
                <div className="filter-title">🎛️ Filters</div>

                {/* Location Search */}
                {apiKeySet && (
                  <div className="map-filter-box">
                    <div className="map-filter-label">📍 Search by Location</div>
                    <input
                      ref={filterInputRef}
                      type="text"
                      className="clay-input"
                      placeholder={mapsReady ? "Type a location…" : "Loading Maps…"}
                      value={pendingFilters.locationText}
                      onChange={(e) => {
                        // If user clears the text, also clear the stored coords
                        const val = e.target.value;
                        setPendingFilters((prev) => ({
                          ...prev,
                          locationText: val,
                          locationCoords: val ? prev.locationCoords : null,
                        }));
                        if (!val) pendingLocationRef.current = null;
                      }}
                      disabled={!mapsReady}
                      style={{ opacity: mapsReady ? 1 : 0.5, width:"100%", boxSizing:"border-box" }}
                    />
                    <p style={{ fontSize:".72rem", color:"#9a9ab0", marginTop:6, marginBottom:0 }}>
                      Searches PGs within 15 km of location.
                    </p>
                  </div>
                )}

                {/* Budget */}
                <div className="filter-group">
                  <label className="clay-label">Budget Range (₹)</label>
                  <div className="budget-row">
                    <input className="clay-input" type="number" placeholder="Min" value={pendingFilters.budgetMin}
                      onChange={(e) => setPendingFilters((p) => ({ ...p, budgetMin: e.target.value }))} />
                    <input className="clay-input" type="number" placeholder="Max" value={pendingFilters.budgetMax}
                      onChange={(e) => setPendingFilters((p) => ({ ...p, budgetMax: e.target.value }))} />
                  </div>
                </div>

                {/* Room Type */}
                <div className="filter-group">
                  <label className="clay-label">Room Type</label>
                  <div className="rt-btn-row">
                    {[{key:"Single",emoji:"🛏",label:"Single Room"},{key:"Shared",emoji:"👥",label:"Shared Room"}].map(({key,emoji,label}) => (
                      <button key={key}
                        className={`rt-btn${pendingFilters.roomType === key ? " active" : ""}`}
                        onClick={() => setPendingFilters((p) => ({
                          ...p,
                          roomType: p.roomType === key ? "" : key,
                          capacity: p.roomType === key ? "" : p.capacity,
                        }))}>
                        <span>{emoji}</span> {label}
                      </button>
                    ))}
                  </div>
                  {pendingFilters.roomType === "Shared" && (
                    <input className="rt-cap-input" type="number" min="2" max="20" placeholder="Capacity (persons)"
                      value={pendingFilters.capacity}
                      onChange={(e) => setPendingFilters((p) => ({ ...p, capacity: e.target.value }))} />
                  )}
                </div>

                {/* Amenities */}
                <div className="filter-group">
                  <label className="clay-label">Amenities</label>
                  <div className="amenity-list">
                    {ALL_AMENITIES.map((a) => (
                      <div key={a} className="clay-checkbox-row">
                        <input type="checkbox" id={`am-${a}`} checked={pendingFilters.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                        <label htmlFor={`am-${a}`}>{a}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="clay-divider" />
                <button className="clay-btn clay-btn-blue" onClick={handleApplyFilters}>Apply Filters</button>
                <button className="clay-btn clay-btn-ghost" onClick={resetFilters}>↺ Reset</button>
              </div>

              {/* ── Listings ── */}
              <div className="listings-col">
                {/* Active filter summary bar */}
                {filtersAreActive && activeChips.length > 0 && (
                  <div className="active-filters-bar">
                    <span style={{ fontSize:".76rem", fontWeight:800, color:"#5a5a7a", marginRight:4 }}>Active:</span>
                    {activeChips.map((chip) => (
                      <span key={chip} className="active-filter-chip">{chip}</span>
                    ))}
                    <button onClick={resetFilters}
                      style={{ marginLeft:"auto", padding:"4px 12px", border:"none", borderRadius:8, background:"rgba(239,83,80,.12)", color:"#c62828", fontSize:".74rem", fontWeight:700, cursor:"pointer" }}>
                      ✕ Clear all
                    </button>
                  </div>
                )}

                {loading ? (
                  <div className="clay-empty"><span className="clay-empty-emoji">⏳</span>Finding PG stays for you…</div>
                ) : pgListings.length === 0 ? (
                  <div className="clay-empty">
                    <span className="clay-empty-emoji">🏠</span>
                    {filtersAreActive
                      ? "No PGs found matching your filters."
                      : "No verified PG stays found."
                    }<br/>
                    <span style={{ color:"#42a5f5", fontWeight:700 }}>
                      {filtersAreActive ? "Try adjusting or resetting your filters." : "Check back soon!"}
                    </span>
                    {filtersAreActive && (
                      <button onClick={resetFilters}
                        style={{ marginTop:12, padding:"8px 20px", border:"none", borderRadius:10, background:"linear-gradient(135deg,#42a5f5,#1e88e5)", color:"white", fontWeight:700, cursor:"pointer" }}>
                        Reset Filters
                      </button>
                    )}
                  </div>
                ) : (
                  pgListings.map((pg, i) => renderPGCard(pg, i))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}