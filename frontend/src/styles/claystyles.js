// ═══════════════════════════════════════════════════════════════
//  clayStyles.js  —  Master Claymorphism Design System
//  Single import for all 21 PGStay pages
//
//  USAGE IN ANY PAGE:
//    import { CLAY_BASE, CLAY_TENANT, injectClay } from "../styles/clayStyles";
//    ...
//    <style>{injectClay(CLAY_BASE, CLAY_TENANT)}</style>
//
//  Available exports:
//    CLAY_BASE     — fonts, reset, background blobs, animations,
//                    cards, inputs, buttons, badges, alerts (all roles)
//    CLAY_TENANT   — blue accent  (#42a5f5)
//    CLAY_OWNER    — orange accent (#ffa726)
//    CLAY_ADMIN    — red accent    (#ef5350)
//    CLAY_COMMON   — teal accent   (#00acc1)  [About/Contact/Help]
//    CLAY_AUTH     — auth-page layout helpers
//    CLAY_NAV      — sticky frosted-glass nav  (common pages)
//    CLAY_HERO     — public hero section        (common pages)
//    injectClay()  — merges any number of style strings
// ═══════════════════════════════════════════════════════════════

/* ─────────────────────────────────────────────────────────────
   BASE  — universal styles shared by every page
───────────────────────────────────────────────────────────── */
export const CLAY_BASE = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&family=Poppins:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  /* ── Page shell ── */
  .clay-page {
    min-height:100vh;
    font-family:'Poppins',sans-serif;
    position:relative; overflow-x:hidden;
  }

  /* floating blob decorations – colours set per role theme */
  .clay-page::before, .clay-page::after {
    content:''; position:fixed; border-radius:50%;
    pointer-events:none; z-index:0;
  }
  .clay-page::before { width:520px; height:520px; top:-160px; left:-160px; animation:floatBlob 9s ease-in-out infinite; }
  .clay-page::after  { width:420px; height:420px; bottom:-110px; right:-110px; animation:floatBlob 11s ease-in-out infinite reverse; }

  /* ── Animations ── */
  @keyframes floatBlob { 0%,100%{ transform:translate(0,0) scale(1); } 50%{ transform:translate(28px,18px) scale(1.05); } }
  @keyframes fadeUp    { from{ opacity:0; transform:translateY(22px); } to{ opacity:1; transform:translateY(0); } }
  @keyframes fadeIn    { from{ opacity:0; } to{ opacity:1; } }
  @keyframes pulse     { 0%,100%{ opacity:1; } 50%{ opacity:.5; } }
  @keyframes expand    { from{ opacity:0; max-height:0; } to{ opacity:1; max-height:400px; } }

  /* ── Layout ── */
  .clay-main      { position:relative; z-index:1; padding:36px 24px; }
  .clay-container { max-width:1100px; margin:0 auto; }
  @media(max-width:640px){ .clay-main{ padding:24px 16px; } }

  /* ── Page headings ── */
  .clay-page-title { font-family:'Nunito',sans-serif; font-size:1.9rem; font-weight:900; color:#2d2d4e; margin-bottom:4px; }
  .clay-page-sub   { color:#7a7a9a; font-size:.92rem; margin-bottom:32px; }

  /* ── Glass card ── */
  .clay-card {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:24px;
    box-shadow:0 8px 28px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.95);
    animation:fadeUp .6s ease both; position:relative; overflow:hidden;
    transition:transform .22s, box-shadow .22s;
  }
  .clay-card:hover { transform:translateY(-3px); box-shadow:0 16px 40px rgba(0,0,0,.11), inset 0 1px 0 rgba(255,255,255,.95); }
  .clay-card-p { padding:28px; }
  .clay-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:24px 24px 0 0; }

  .clay-section-title {
    font-family:'Nunito',sans-serif; font-size:1.1rem; font-weight:800; color:#2d2d4e;
    margin-bottom:18px; display:flex; align-items:center; gap:8px;
  }

  /* ── Stat card ── */
  .clay-stat {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:22px; padding:20px 22px;
    box-shadow:0 6px 24px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.95);
    position:relative; overflow:hidden; animation:fadeUp .6s ease both;
    transition:transform .2s, box-shadow .2s;
  }
  .clay-stat:hover { transform:translateY(-4px); box-shadow:0 14px 36px rgba(0,0,0,.1); }
  .clay-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:22px 22px 0 0; }
  .clay-stat-label { font-size:.7rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }
  .clay-stat-value { font-family:'Nunito',sans-serif; font-size:2.2rem; font-weight:900; line-height:1; }
  .clay-stat-icon  { position:absolute; top:16px; right:16px; width:38px; height:38px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; background:rgba(255,255,255,.72); box-shadow:0 3px 10px rgba(0,0,0,.08); }

  /* ── Divider ── */
  .clay-divider { height:2px; background:rgba(255,255,255,.7); border-radius:4px; margin:20px 0; }

  /* ── Form elements ── */
  .clay-label { display:block; font-size:.72rem; font-weight:700; color:#5a5a7a; margin-bottom:7px; letter-spacing:.4px; text-transform:uppercase; }
  .clay-input, .clay-select, .clay-textarea {
    width:100%; padding:12px 15px;
    background:rgba(255,255,255,.8); border:2px solid rgba(255,255,255,.9); border-radius:14px;
    font-family:'Poppins',sans-serif; font-size:.88rem; color:#2d2d4e;
    box-shadow:0 3px 10px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.9);
    transition:border-color .2s, box-shadow .2s; outline:none;
  }
  .clay-textarea { resize:vertical; }
  .clay-input::placeholder, .clay-textarea::placeholder { color:#bbb; }
  .clay-select { cursor:pointer; }

  /* ── Buttons ── */
  .clay-btn {
    padding:12px 22px; border:none; border-radius:14px;
    font-family:'Poppins',sans-serif; font-size:.88rem; font-weight:700;
    cursor:pointer; display:inline-flex; align-items:center; gap:7px;
    transition:transform .15s, box-shadow .15s, filter .15s;
  }
  .clay-btn:active { transform:scale(.97) translateY(2px) !important; }
  .clay-btn:disabled { opacity:.6; cursor:not-allowed; }
  .clay-btn-w { width:100%; justify-content:center; }

  .clay-btn-blue   { background:linear-gradient(135deg,#42a5f5,#1e88e5); color:white; box-shadow:0 5px 0 #1565c0,0 8px 20px rgba(66,165,245,.35),inset 0 1px 0 rgba(255,255,255,.3); }
  .clay-btn-blue:hover:not(:disabled)   { filter:brightness(1.06); transform:translateY(-2px); }
  .clay-btn-green  { background:linear-gradient(135deg,#66bb6a,#43a047);  color:white; box-shadow:0 5px 0 #2e7d32,0 8px 20px rgba(102,187,106,.3),inset 0 1px 0 rgba(255,255,255,.3); }
  .clay-btn-green:hover:not(:disabled)  { filter:brightness(1.06); transform:translateY(-2px); }
  .clay-btn-red    { background:linear-gradient(135deg,#ef9a9a,#e53935);   color:white; box-shadow:0 5px 0 #b71c1c,0 8px 20px rgba(239,83,80,.3),inset 0 1px 0 rgba(255,255,255,.3); }
  .clay-btn-red:hover:not(:disabled)    { filter:brightness(1.06); transform:translateY(-2px); }
  .clay-btn-orange { background:linear-gradient(135deg,#ffa726,#fb8c00);   color:white; box-shadow:0 5px 0 #e65100,0 8px 20px rgba(255,167,38,.35),inset 0 1px 0 rgba(255,255,255,.3); }
  .clay-btn-orange:hover:not(:disabled) { filter:brightness(1.06); transform:translateY(-2px); }
  .clay-btn-teal   { background:linear-gradient(135deg,#00acc1,#00838f);   color:white; box-shadow:0 5px 0 #006064,0 8px 20px rgba(0,172,193,.3),inset 0 1px 0 rgba(255,255,255,.3); }
  .clay-btn-teal:hover:not(:disabled)   { filter:brightness(1.06); transform:translateY(-2px); }
  .clay-btn-ghost  { background:rgba(255,255,255,.72); border:2px solid rgba(255,255,255,.9); color:#5a5a7a; box-shadow:0 4px 0 rgba(0,0,0,.07),0 6px 16px rgba(0,0,0,.06); }
  .clay-btn-ghost:hover:not(:disabled)  { transform:translateY(-2px); background:rgba(255,255,255,.9); }

  /* ── Badges ── */
  .clay-badge { display:inline-flex; align-items:center; gap:5px; border-radius:50px; padding:4px 12px; font-size:.72rem; font-weight:700; border:1.5px solid rgba(255,255,255,.85); box-shadow:0 2px 8px rgba(0,0,0,.07); }
  .badge-blue   { background:rgba(227,242,253,.9); color:#1565c0;  border-color:rgba(144,202,249,.6); }
  .badge-green  { background:rgba(232,245,233,.9); color:#2e7d32;  border-color:rgba(165,214,167,.6); }
  .badge-yellow { background:rgba(255,249,196,.9); color:#f57f17;  border-color:rgba(255,224,130,.6); }
  .badge-red    { background:rgba(255,235,238,.9); color:#c62828;  border-color:rgba(239,154,154,.6); }
  .badge-orange { background:rgba(255,248,225,.9); color:#e65100;  border-color:rgba(255,224,130,.6); }
  .badge-teal   { background:rgba(224,247,250,.9); color:#00838f;  border-color:rgba(128,222,234,.6); }
  .badge-purple { background:rgba(243,229,245,.9); color:#7b1fa2;  border-color:rgba(206,147,216,.6); }
  .badge-gray   { background:rgba(245,245,245,.9); color:#5a5a7a;  border-color:rgba(200,200,220,.6); }

  /* ── Alerts ── */
  .clay-alert { border-radius:14px; padding:12px 16px; margin-bottom:16px; font-size:.85rem; font-weight:500; display:flex; align-items:center; gap:8px; animation:fadeIn .3s ease; }
  .clay-alert-error   { background:rgba(255,235,238,.9); border:2px solid rgba(239,154,154,.5); color:#c62828; }
  .clay-alert-success { background:rgba(232,245,233,.9); border:2px solid rgba(165,214,167,.5); color:#2e7d32; }
  .clay-alert-info    { background:rgba(255,249,196,.9); border:2px solid rgba(255,224,130,.5); color:#f57f17; }

  /* ── Menu cards ── */
  .clay-menu-card {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:22px; padding:24px;
    box-shadow:0 6px 24px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.95);
    cursor:pointer; display:flex; gap:16px; align-items:flex-start;
    animation:fadeUp .7s ease both; position:relative; overflow:hidden;
    transition:transform .2s, box-shadow .2s, border-color .2s;
  }
  .clay-menu-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:22px 22px 0 0; opacity:0; transition:opacity .2s; }
  .clay-menu-card:hover { transform:translateY(-5px); box-shadow:0 16px 40px rgba(0,0,0,.12); }
  .clay-menu-card:hover::before { opacity:1; }
  .clay-menu-card-title { font-family:'Nunito',sans-serif; font-size:1rem; font-weight:800; color:#2d2d4e; margin-bottom:4px; }
  .clay-menu-card-desc  { font-size:.78rem; color:#7a7a9a; line-height:1.5; }
  .clay-menu-icon { width:50px; height:50px; border-radius:16px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:1.3rem; border:2px solid rgba(255,255,255,.9); box-shadow:0 4px 14px rgba(0,0,0,.1), inset 0 1px 0 rgba(255,255,255,.8); }

  /* ── Row items ── */
  .clay-row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:13px 16px; margin-bottom:10px; background:rgba(255,255,255,.55); border:1.5px solid rgba(255,255,255,.8); border-radius:16px; transition:transform .15s; }
  .clay-row:hover { transform:translateX(4px); }
  .clay-row-name { font-size:.88rem; font-weight:600; color:#2d2d4e; margin-bottom:2px; }
  .clay-row-sub  { font-size:.72rem; color:#9a9ab0; }

  /* ── Toggle switch ── */
  .clay-toggle-wrap { position:relative; width:44px; height:24px; }
  .clay-toggle-wrap input { opacity:0; width:0; height:0; }
  .clay-toggle-slider { position:absolute; cursor:pointer; inset:0; border-radius:50px; transition:.3s; background:rgba(200,200,220,.5); box-shadow:inset 0 2px 4px rgba(0,0,0,.1); }
  .clay-toggle-slider::before { content:''; position:absolute; height:18px; width:18px; left:3px; bottom:3px; background:white; border-radius:50%; transition:.3s; box-shadow:0 2px 6px rgba(0,0,0,.15); }
  .clay-toggle-wrap input:checked + .clay-toggle-slider { background:linear-gradient(135deg,#66bb6a,#43a047); box-shadow:0 3px 10px rgba(102,187,106,.35); }
  .clay-toggle-wrap input:checked + .clay-toggle-slider::before { transform:translateX(20px); }

  /* ── Profile layout ── */
  .clay-profile-grid { display:grid; grid-template-columns:260px 1fr; gap:24px; }
  .clay-avatar-card { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:28px; padding:32px 24px; box-shadow:0 8px 28px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.95); text-align:center; animation:fadeUp .6s ease both; height:fit-content; position:relative; overflow:hidden; }
  .clay-avatar-ring { width:110px; height:110px; border-radius:50%; margin:0 auto 16px; border:4px solid rgba(255,255,255,.95); display:flex; align-items:center; justify-content:center; font-size:2.8rem; }
  .clay-avatar-name { font-family:'Nunito',sans-serif; font-size:1.3rem; font-weight:900; color:#2d2d4e; margin-bottom:10px; }
  .clay-detail-row { display:grid; grid-template-columns:120px 1fr; gap:12px; align-items:center; padding:11px 0; border-bottom:1.5px solid rgba(255,255,255,.7); }
  .clay-detail-row:last-child { border-bottom:none; }
  .clay-detail-label { font-size:.72rem; font-weight:700; color:#9a9ab0; text-transform:uppercase; letter-spacing:.4px; }
  .clay-detail-value { font-size:.88rem; color:#2d2d4e; font-weight:500; }
  @media(max-width:760px){ .clay-profile-grid{ grid-template-columns:1fr; } }

  /* ── Upload button ── */
  .clay-upload-btn { width:100%; padding:13px 20px; border-radius:16px; cursor:pointer; background:rgba(255,255,255,.72); border:2px dashed rgba(200,200,220,.7); font-family:'Poppins',sans-serif; font-size:.88rem; font-weight:600; color:#7a7a9a; box-shadow:0 4px 14px rgba(0,0,0,.06); display:flex; align-items:center; justify-content:center; gap:10px; transition:transform .15s, border-color .2s, box-shadow .15s; }
  .clay-upload-btn:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(0,0,0,.1); }

  /* ── Stat row (profile) ── */
  .clay-stat-row { display:flex; align-items:center; justify-content:space-between; padding:13px 16px; background:rgba(255,255,255,.55); border:2px solid rgba(255,255,255,.85); border-radius:15px; margin-bottom:10px; box-shadow:0 3px 12px rgba(0,0,0,.05); transition:transform .15s; }
  .clay-stat-row:hover { transform:translateX(4px); }
  .clay-stat-row-label { font-size:.82rem; color:#5a5a7a; font-weight:600; }
  .clay-stat-row-value { font-family:'Nunito',sans-serif; font-size:1.35rem; font-weight:900; }

  /* ── Grid helpers ── */
  .clay-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .clay-grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .clay-grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  @media(max-width:800px){ .clay-grid-4{ grid-template-columns:repeat(2,1fr); } .clay-grid-3{ grid-template-columns:repeat(2,1fr); } }
  @media(max-width:480px){ .clay-grid-4,.clay-grid-3,.clay-grid-2{ grid-template-columns:1fr; } }

  /* ── Empty state ── */
  .clay-empty { text-align:center; padding:52px 24px; color:#9a9ab0; font-size:.9rem; }
  .clay-empty-emoji { font-size:3rem; margin-bottom:12px; display:block; }

  /* ── Notification item ── */
  .clay-notif { display:flex; gap:14px; align-items:flex-start; padding:15px 16px; border-radius:18px; margin-bottom:10px; border:2px solid rgba(255,255,255,.8); transition:transform .18s; position:relative; overflow:hidden; }
  .clay-notif:hover { transform:translateX(5px); }
  .clay-notif-read   { background:rgba(255,255,255,.4); }
  .clay-notif-unread { background:rgba(255,255,255,.72); }
  .clay-notif-icon { width:40px; height:40px; border-radius:13px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.72); box-shadow:0 3px 10px rgba(0,0,0,.08); }
  .clay-notif-msg  { font-size:.87rem; color:#2d2d4e; line-height:1.55; margin-bottom:4px; font-weight:500; }
  .clay-notif-time { font-size:.7rem; color:#9a9ab0; }
  .clay-notif-dot  { width:9px; height:9px; border-radius:50%; flex-shrink:0; margin-top:6px; }
`;

/* ─────────────────────────────────────────────────────────────
   ROLE THEMES  — override background + blobs + accent colours
───────────────────────────────────────────────────────────── */

/** 🔵 Tenant — blue #42a5f5 */
export const CLAY_TENANT = `
  .clay-page { background:linear-gradient(135deg,#e3f2fd 0%,#f3e5f5 30%,#e8f5e9 60%,#e3f2fd 100%); }
  .clay-page::before { background:radial-gradient(circle,rgba(144,202,249,.45) 0%,transparent 70%); }
  .clay-page::after  { background:radial-gradient(circle,rgba(206,147,216,.3)  0%,transparent 70%); }
  .clay-input:focus,.clay-textarea:focus { border-color:rgba(66,165,245,.55); box-shadow:0 0 0 3px rgba(66,165,245,.12),inset 0 1px 0 rgba(255,255,255,.9); }
  .clay-upload-btn:hover { border-color:rgba(66,165,245,.55); color:#1565c0; }
  .bar-primary   { background:linear-gradient(90deg,#42a5f5,#90caf9); }
  .bar-secondary { background:linear-gradient(90deg,#1e88e5,#42a5f5); }
  .bar-rainbow   { background:linear-gradient(90deg,#42a5f5,#e040fb,#66bb6a); }
  .v-accent  { color:#1565c0; }
  .v-primary { color:#1565c0; }
  .clay-menu-card::before { background:linear-gradient(90deg,#42a5f5,#e040fb); }
  .clay-menu-card:hover   { border-color:rgba(66,165,245,.3); }
  .clay-menu-icon { background:linear-gradient(135deg,#bbdefb,#e3f2fd); }
  .clay-notif-unread { background:rgba(227,242,253,.75); border-color:rgba(144,202,249,.6); }
  .clay-notif-unread::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; background:linear-gradient(180deg,#42a5f5,#90caf9); border-radius:18px 0 0 18px; }
  .clay-notif-dot { background:#42a5f5; box-shadow:0 0 0 3px rgba(66,165,245,.2); }
`;

/** 🟠 Owner — orange #ffa726 */
export const CLAY_OWNER = `
  .clay-page { background:linear-gradient(135deg,#fff8e1 0%,#f3e5f5 30%,#e8f5e9 60%,#fff3e0 100%); }
  .clay-page::before { background:radial-gradient(circle,rgba(255,224,130,.45) 0%,transparent 70%); }
  .clay-page::after  { background:radial-gradient(circle,rgba(206,147,216,.3)  0%,transparent 70%); }
  .clay-input:focus,.clay-textarea:focus { border-color:rgba(255,167,38,.55); box-shadow:0 0 0 3px rgba(255,167,38,.12),inset 0 1px 0 rgba(255,255,255,.9); }
  .clay-upload-btn:hover { border-color:rgba(255,167,38,.6); color:#f57f17; }
  .bar-primary   { background:linear-gradient(90deg,#ffa726,#ffcc02); }
  .bar-secondary { background:linear-gradient(90deg,#ff8f00,#ffa726); }
  .bar-rainbow   { background:linear-gradient(90deg,#ffa726,#e040fb,#66bb6a); }
  .v-accent  { color:#e65100; }
  .v-primary { color:#e65100; }
  .clay-menu-card::before { background:linear-gradient(90deg,#ffa726,#e040fb); }
  .clay-menu-card:hover   { border-color:rgba(255,167,38,.3); }
  .clay-menu-icon { background:linear-gradient(135deg,#ffe0b2,#fff8e1); }
  .clay-notif-unread { background:rgba(255,248,225,.75); border-color:rgba(255,224,130,.6); }
  .clay-notif-unread::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; background:linear-gradient(180deg,#ffa726,#ffcc02); border-radius:18px 0 0 18px; }
  .clay-notif-dot { background:#ffa726; box-shadow:0 0 0 3px rgba(255,167,38,.2); }
`;

/** 🔴 Admin — crimson #ef5350 */
export const CLAY_ADMIN = `
  .clay-page { background:linear-gradient(135deg,#fce4ec 0%,#f3e5f5 30%,#fafafa 65%,#fff3e0 100%); }
  .clay-page::before { background:radial-gradient(circle,rgba(239,154,154,.4) 0%,transparent 70%); }
  .clay-page::after  { background:radial-gradient(circle,rgba(206,147,216,.3)  0%,transparent 70%); }
  .clay-input:focus,.clay-textarea:focus { border-color:rgba(239,83,80,.45); box-shadow:0 0 0 3px rgba(239,83,80,.1),inset 0 1px 0 rgba(255,255,255,.9); }
  .clay-upload-btn:hover { border-color:rgba(239,83,80,.5); color:#c62828; }
  .bar-primary   { background:linear-gradient(90deg,#ef5350,#e53935); }
  .bar-secondary { background:linear-gradient(90deg,#b71c1c,#ef5350); }
  .bar-rainbow   { background:linear-gradient(90deg,#ef5350,#e040fb,#42a5f5); }
  .v-accent  { color:#c62828; }
  .v-primary { color:#c62828; }
  .clay-menu-card::before { background:linear-gradient(90deg,#ef5350,#e040fb); }
  .clay-menu-card:hover   { border-color:rgba(239,83,80,.25); }
  .clay-menu-icon { background:linear-gradient(135deg,#ffcdd2,#fce4ec); }
`;

/** 🩵 Common pages (About / Contact / Help) — teal #00acc1 */
export const CLAY_COMMON = `
  .clay-page { background:linear-gradient(135deg,#e0f7fa 0%,#f3e5f5 35%,#e8f5e9 65%,#e0f2f1 100%); }
  .clay-page::before { background:radial-gradient(circle,rgba(128,222,234,.4) 0%,transparent 70%); }
  .clay-page::after  { background:radial-gradient(circle,rgba(206,147,216,.28) 0%,transparent 70%); }
  .clay-input:focus,.clay-textarea:focus { border-color:rgba(0,172,193,.45); box-shadow:0 0 0 3px rgba(0,172,193,.1),inset 0 1px 0 rgba(255,255,255,.9); }
  .bar-primary   { background:linear-gradient(90deg,#00acc1,#80deea); }
  .bar-secondary { background:linear-gradient(90deg,#00838f,#00acc1); }
  .bar-rainbow   { background:linear-gradient(90deg,#00acc1,#ffa726,#ce93d8,#66bb6a); }
  .v-accent  { color:#00838f; }
  .v-primary { color:#00838f; }
  .clay-menu-card::before { background:linear-gradient(90deg,#00acc1,#8e24aa); }
  .clay-menu-card:hover   { border-color:rgba(0,172,193,.3); }
  .clay-menu-icon { background:linear-gradient(135deg,#b2ebf2,#e0f7fa); }
`;

/** 🔐 Auth pages */
export const CLAY_AUTH = `
  .clay-page { background:linear-gradient(135deg,#fce4ec 0%,#e8f5e9 35%,#e3f2fd 65%,#f3e5f5 100%); display:flex; flex-direction:column; }
  .clay-page::before { background:radial-gradient(circle,rgba(255,183,197,.4) 0%,transparent 70%); }
  .clay-page::after  { background:radial-gradient(circle,rgba(167,210,255,.35) 0%,transparent 70%); }
  .bar-primary { background:linear-gradient(90deg,#42a5f5,#e040fb); }
  .bar-rainbow { background:linear-gradient(90deg,#42a5f5,#e040fb,#66bb6a); }
`;

/* ─────────────────────────────────────────────────────────────
   NAV BAR  — sticky frosted glass (common public pages)
───────────────────────────────────────────────────────────── */
export const CLAY_NAV = `
  .clay-nav { position:sticky; top:0; z-index:50; background:rgba(255,255,255,.6); backdrop-filter:blur(20px); border-bottom:2px solid rgba(255,255,255,.8); box-shadow:0 4px 20px rgba(0,0,0,.06); padding:14px 28px; display:flex; align-items:center; justify-content:space-between; }
  .clay-nav-logo { font-family:'Nunito',sans-serif; font-weight:900; font-size:1.3rem; background:linear-gradient(135deg,#00acc1,#8e24aa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
`;

/* ─────────────────────────────────────────────────────────────
   HERO SECTION  — public pages (About / Contact / Help)
───────────────────────────────────────────────────────────── */
export const CLAY_HERO = `
  .clay-hero { position:relative; z-index:1; text-align:center; padding:56px 24px 36px; }
  .clay-hero-badge { display:inline-block; background:rgba(255,255,255,.65); backdrop-filter:blur(12px); border:2px solid rgba(255,255,255,.9); border-radius:50px; padding:7px 20px; font-size:.78rem; font-weight:700; color:#00838f; box-shadow:0 4px 14px rgba(0,172,193,.15),inset 0 1px 0 rgba(255,255,255,.95); margin-bottom:18px; animation:fadeIn .5s ease; }
  .clay-hero-title { font-family:'Nunito',sans-serif; font-size:2.6rem; font-weight:900; color:#1a2d3a; margin-bottom:14px; animation:fadeUp .6s ease; }
  .clay-hero-title span { background:linear-gradient(135deg,#00acc1,#8e24aa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .clay-hero-sub { font-size:.95rem; color:#5a7a8a; max-width:520px; margin:0 auto; line-height:1.7; animation:fadeUp .7s ease; }
`;

/* ─────────────────────────────────────────────────────────────
   HELPER  — merge any style strings into one injected block
   Usage:  <style>{injectClay(CLAY_BASE, CLAY_TENANT)}</style>
───────────────────────────────────────────────────────────── */
export const injectClay = (...parts) => parts.join('\n');