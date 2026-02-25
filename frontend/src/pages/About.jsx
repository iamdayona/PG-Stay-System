import { useNavigate } from "react-router-dom";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&family=Poppins:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  .clay-page {
    min-height:100vh;
    background:linear-gradient(135deg,#e0f7fa 0%,#f3e5f5 35%,#e8f5e9 65%,#e0f2f1 100%);
    font-family:'Poppins',sans-serif; position:relative; overflow-x:hidden;
  }
  .clay-page::before {
    content:''; position:fixed; width:500px; height:500px;
    background:radial-gradient(circle,rgba(128,222,234,.4) 0%,transparent 70%);
    border-radius:50%; top:-150px; left:-150px;
    animation:floatBlob 10s ease-in-out infinite; pointer-events:none; z-index:0;
  }
  .clay-page::after {
    content:''; position:fixed; width:420px; height:420px;
    background:radial-gradient(circle,rgba(206,147,216,.28) 0%,transparent 70%);
    border-radius:50%; bottom:-100px; right:-100px;
    animation:floatBlob 13s ease-in-out infinite reverse; pointer-events:none; z-index:0;
  }
  @keyframes floatBlob{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(24px,16px) scale(1.05);}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}

  /* ── Nav ── */
  .clay-nav {
    position:sticky; top:0; z-index:50;
    background:rgba(255,255,255,.6); backdrop-filter:blur(20px);
    border-bottom:2px solid rgba(255,255,255,.8);
    box-shadow:0 4px 20px rgba(0,0,0,.06);
    padding:14px 28px; display:flex; align-items:center; justify-content:space-between;
  }
  .nav-logo { font-family:'Nunito',sans-serif; font-weight:900; font-size:1.3rem; background:linear-gradient(135deg,#00acc1,#8e24aa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .nav-back {
    padding:9px 20px; border:none; border-radius:50px; cursor:pointer;
    background:linear-gradient(135deg,#00acc1,#00838f); color:white;
    font-family:'Poppins',sans-serif; font-size:.82rem; font-weight:700;
    box-shadow:0 4px 0 #006064, 0 7px 16px rgba(0,172,193,.3), inset 0 1px 0 rgba(255,255,255,.3);
    transition:transform .15s, box-shadow .15s;
  }
  .nav-back:hover { transform:translateY(-2px); box-shadow:0 6px 0 #006064, 0 10px 22px rgba(0,172,193,.38); }
  .nav-back:active { transform:translateY(1px); box-shadow:0 2px 0 #006064; }

  /* ── Hero ── */
  .clay-hero {
    position:relative; z-index:1; text-align:center; padding:60px 24px 40px;
  }
  .hero-badge {
    display:inline-block; background:rgba(255,255,255,.65); backdrop-filter:blur(12px);
    border:2px solid rgba(255,255,255,.9); border-radius:50px; padding:7px 20px;
    font-size:.78rem; font-weight:700; color:#00838f;
    box-shadow:0 4px 14px rgba(0,172,193,.15), inset 0 1px 0 rgba(255,255,255,.95);
    margin-bottom:20px; animation:fadeIn .5s ease;
  }
  .hero-title {
    font-family:'Nunito',sans-serif; font-size:2.8rem; font-weight:900; color:#1a2d3a;
    line-height:1.15; margin-bottom:16px; animation:fadeUp .6s ease;
  }
  .hero-title span { background:linear-gradient(135deg,#00acc1,#8e24aa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .hero-sub { font-size:1rem; color:#5a7a8a; max-width:600px; margin:0 auto; line-height:1.7; animation:fadeUp .7s ease; }

  /* ── Sections ── */
  .clay-main { position:relative; z-index:1; max-width:920px; margin:0 auto; padding:0 24px 60px; }

  /* clay section card */
  .cc {
    background:rgba(255,255,255,.65); backdrop-filter:blur(18px);
    border:2.5px solid rgba(255,255,255,.85); border-radius:26px; padding:32px;
    box-shadow:0 8px 28px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.95);
    margin-bottom:24px; animation:fadeUp .6s ease both; position:relative; overflow:hidden;
  }
  .cc::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:26px 26px 0 0; }
  .cc-teal::before   { background:linear-gradient(90deg,#00acc1,#80deea); }
  .cc-purple::before { background:linear-gradient(90deg,#ce93d8,#e040fb); }
  .cc-green::before  { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .cc-rainbow::before{ background:linear-gradient(90deg,#00acc1,#e040fb,#66bb6a); }

  .sec-title { font-family:'Nunito',sans-serif; font-size:1.3rem; font-weight:900; color:#1a2d3a; margin-bottom:18px; display:flex; align-items:center; gap:10px; }

  /* prose */
  .clay-prose { font-size:.9rem; color:#4a6070; line-height:1.8; }

  /* objectives list */
  .obj-list { list-style:none; padding:0; }
  .obj-list li { display:flex; align-items:flex-start; gap:12px; padding:10px 0; border-bottom:1.5px solid rgba(255,255,255,.7); font-size:.88rem; color:#4a6070; line-height:1.6; }
  .obj-list li:last-child { border-bottom:none; }
  .obj-dot { width:28px; height:28px; border-radius:9px; background:linear-gradient(135deg,#b2ebf2,#e0f7fa); border:2px solid rgba(255,255,255,.9); display:flex; align-items:center; justify-content:center; font-size:.85rem; flex-shrink:0; box-shadow:0 2px 8px rgba(0,172,193,.12); }

  /* 2-col features */
  .features-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media(max-width:640px){ .features-grid{grid-template-columns:1fr;} }

  .feat-card {
    background:rgba(255,255,255,.6); border:2px solid rgba(255,255,255,.85); border-radius:18px; padding:20px;
    box-shadow:0 4px 14px rgba(0,0,0,.06); transition:transform .2s, box-shadow .2s;
    position:relative; overflow:hidden;
  }
  .feat-card:hover { transform:translateY(-4px); box-shadow:0 12px 28px rgba(0,0,0,.1); }
  .feat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:18px 18px 0 0; }
  .fc-1::before { background:linear-gradient(90deg,#00acc1,#80deea); }
  .fc-2::before { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .fc-3::before { background:linear-gradient(90deg,#ffa726,#ffcc02); }
  .fc-4::before { background:linear-gradient(90deg,#ce93d8,#e040fb); }

  .feat-emoji { font-size:1.6rem; margin-bottom:10px; }
  .feat-title { font-family:'Nunito',sans-serif; font-size:.95rem; font-weight:800; color:#1a2d3a; margin-bottom:6px; }
  .feat-desc  { font-size:.78rem; color:#6a8898; line-height:1.55; }
`;

export default function About() {
  const navigate = useNavigate();

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">

        {/* Nav */}
        <nav className="clay-nav">
          <span className="nav-logo">PGStay</span>
          <button className="nav-back" onClick={() => navigate(-1)}>← Go Back</button>
        </nav>

        {/* Hero */}
        <div className="clay-hero">
          <div className="hero-badge">🏠 About PG Accommodation System</div>
          <h1 className="hero-title">Smart PG Living,<br/><span>Made Simple</span></h1>
          <p className="hero-sub">
            A modern web platform connecting tenants and PG owners — making the search, booking, and management of Paying Guest stays transparent and effortless.
          </p>
        </div>

        {/* Sections */}
        <main className="clay-main">

          {/* Introduction */}
          <div className="cc cc-teal" style={{ animationDelay:".05s" }}>
            <div className="sec-title">📖 Introduction</div>
            <p className="clay-prose">
              The PG Accommodation System is a web-based application designed to simplify the process of finding and managing Paying Guest (PG) stays. It connects tenants and PG owners on a single platform, making booking, payment, and communication easy and transparent.
            </p>
          </div>

          {/* Objectives */}
          <div className="cc cc-purple" style={{ animationDelay:".12s" }}>
            <div className="sec-title">🎯 Objectives</div>
            <ul className="obj-list">
              {[
                ["🔍","Provide an easy platform for tenants to find PG accommodations."],
                ["🏢","Allow PG owners to manage rooms and bookings efficiently."],
                ["🔒","Enable secure booking and payment tracking."],
                ["⭐","Maintain trust score and feedback system for accountability."],
              ].map(([emoji, text], i) => (
                <li key={i}><span className="obj-dot">{emoji}</span><span>{text}</span></li>
              ))}
            </ul>
          </div>

          {/* Key Features */}
          <div className="cc cc-green" style={{ animationDelay:".2s" }}>
            <div className="sec-title">✨ Key Features</div>
            <div className="features-grid">
              {[
                { emoji:"👥", title:"User Management",      desc:"Role-based access for tenants, PG owners, and administrators.",    cls:"fc-1" },
                { emoji:"📋", title:"Room Booking",          desc:"Easy booking system with real-time room availability.",             cls:"fc-2" },
                { emoji:"💳", title:"Online Payments",       desc:"Secure payment tracking with full transaction history.",            cls:"fc-3" },
                { emoji:"⭐", title:"Feedback & Trust Score",desc:"Ratings and reviews help maintain transparency and reliability.",   cls:"fc-4" },
              ].map((f) => (
                <div key={f.title} className={`feat-card ${f.cls}`}>
                  <div className="feat-emoji">{f.emoji}</div>
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Conclusion */}
          <div className="cc cc-rainbow" style={{ animationDelay:".28s" }}>
            <div className="sec-title">🚀 Conclusion</div>
            <p className="clay-prose">
              This system enhances the traditional PG accommodation process by digitalizing bookings, payments, and communication. It ensures efficiency, security, and convenience for both tenants and PG owners — building a trustworthy and seamless rental experience for everyone.
            </p>
          </div>

        </main>
      </div>
    </>
  );
}