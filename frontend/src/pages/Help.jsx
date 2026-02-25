import { useState } from "react";
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
  @keyframes expand{from{opacity:0;max-height:0;transform:translateY(-8px);}to{opacity:1;max-height:400px;transform:translateY(0);}}

  .clay-nav { position:sticky; top:0; z-index:50; background:rgba(255,255,255,.6); backdrop-filter:blur(20px); border-bottom:2px solid rgba(255,255,255,.8); box-shadow:0 4px 20px rgba(0,0,0,.06); padding:14px 28px; display:flex; align-items:center; justify-content:space-between; }
  .nav-logo { font-family:'Nunito',sans-serif; font-weight:900; font-size:1.3rem; background:linear-gradient(135deg,#00acc1,#8e24aa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .nav-back { padding:9px 20px; border:none; border-radius:50px; cursor:pointer; background:linear-gradient(135deg,#00acc1,#00838f); color:white; font-family:'Poppins',sans-serif; font-size:.82rem; font-weight:700; box-shadow:0 4px 0 #006064,0 7px 16px rgba(0,172,193,.3),inset 0 1px 0 rgba(255,255,255,.3); transition:transform .15s,box-shadow .15s; }
  .nav-back:hover { transform:translateY(-2px); box-shadow:0 6px 0 #006064,0 10px 22px rgba(0,172,193,.38); }

  .clay-hero { position:relative; z-index:1; text-align:center; padding:56px 24px 36px; }
  .hero-badge { display:inline-block; background:rgba(255,255,255,.65); backdrop-filter:blur(12px); border:2px solid rgba(255,255,255,.9); border-radius:50px; padding:7px 20px; font-size:.78rem; font-weight:700; color:#00838f; box-shadow:0 4px 14px rgba(0,172,193,.15); margin-bottom:18px; animation:fadeIn .5s ease; }
  .hero-title { font-family:'Nunito',sans-serif; font-size:2.6rem; font-weight:900; color:#1a2d3a; margin-bottom:14px; animation:fadeUp .6s ease; }
  .hero-title span { background:linear-gradient(135deg,#00acc1,#8e24aa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .hero-sub { font-size:.95rem; color:#5a7a8a; max-width:520px; margin:0 auto; line-height:1.7; animation:fadeUp .7s ease; }

  .clay-main { position:relative; z-index:1; max-width:920px; margin:0 auto; padding:0 24px 60px; }

  .cc { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:26px; padding:30px 32px; box-shadow:0 8px 28px rgba(0,0,0,.07),inset 0 1px 0 rgba(255,255,255,.95); margin-bottom:24px; animation:fadeUp .6s ease both; position:relative; overflow:hidden; }
  .cc::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:26px 26px 0 0; }
  .cc-teal::before   { background:linear-gradient(90deg,#00acc1,#80deea); }
  .cc-green::before  { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .cc-purple::before { background:linear-gradient(90deg,#ce93d8,#e040fb); }
  .sec-title { font-family:'Nunito',sans-serif; font-size:1.2rem; font-weight:900; color:#1a2d3a; margin-bottom:20px; display:flex; align-items:center; gap:9px; }

  /* ── How it works — 3 steps ── */
  .steps-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  @media(max-width:640px){ .steps-grid{grid-template-columns:1fr;} }

  .step-card {
    background:rgba(255,255,255,.6); border:2px solid rgba(255,255,255,.85); border-radius:20px; padding:24px 18px;
    text-align:center; box-shadow:0 4px 14px rgba(0,0,0,.06); transition:transform .2s, box-shadow .2s;
    position:relative; overflow:hidden;
  }
  .step-card:hover { transform:translateY(-5px); box-shadow:0 14px 32px rgba(0,0,0,.1); }
  .step-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:20px 20px 0 0; }
  .s-1::before { background:linear-gradient(90deg,#00acc1,#80deea); }
  .s-2::before { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .s-3::before { background:linear-gradient(90deg,#ffa726,#ffcc02); }

  .step-num { width:44px; height:44px; border-radius:14px; margin:0 auto 14px; display:flex; align-items:center; justify-content:center; font-family:'Nunito',sans-serif; font-size:1.3rem; font-weight:900; color:white; box-shadow:0 4px 14px rgba(0,0,0,.15); }
  .sn-1 { background:linear-gradient(135deg,#00acc1,#00838f); }
  .sn-2 { background:linear-gradient(135deg,#66bb6a,#43a047); }
  .sn-3 { background:linear-gradient(135deg,#ffa726,#fb8c00); }

  .step-emoji { font-size:1.8rem; margin-bottom:10px; }
  .step-title { font-family:'Nunito',sans-serif; font-size:1rem; font-weight:800; color:#1a2d3a; margin-bottom:8px; }
  .step-desc  { font-size:.78rem; color:#6a8898; line-height:1.6; }

  /* ── FAQ Accordion ── */
  .faq-item {
    background:rgba(255,255,255,.6); border:2px solid rgba(255,255,255,.85); border-radius:18px;
    margin-bottom:10px; overflow:hidden; box-shadow:0 3px 12px rgba(0,0,0,.06);
    transition:box-shadow .2s;
  }
  .faq-item.open { box-shadow:0 6px 22px rgba(0,172,193,.12); border-color:rgba(128,222,234,.6); }

  .faq-q {
    width:100%; padding:18px 20px; background:none; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:space-between; gap:12px;
    font-family:'Poppins',sans-serif; text-align:left;
  }
  .faq-q-text { font-size:.9rem; font-weight:700; color:#1a2d3a; display:flex; align-items:center; gap:10px; }
  .faq-q-icon { font-size:1rem; flex-shrink:0; }
  .faq-chevron { font-size:.85rem; color:#9a9ab0; transition:transform .25s; flex-shrink:0; }
  .faq-item.open .faq-chevron { transform:rotate(180deg); color:#00acc1; }

  .faq-a {
    padding:0 20px 18px; font-size:.84rem; color:#4a6070; line-height:1.75;
    border-top:1.5px solid rgba(128,222,234,.25); padding-top:14px;
    animation:expand .3s ease;
  }

  /* ── Support categories ── */
  .support-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
  @media(max-width:640px){ .support-grid{grid-template-columns:1fr;} }

  .sup-card {
    background:rgba(255,255,255,.6); border:2px solid rgba(255,255,255,.85); border-radius:18px; padding:22px 18px;
    text-align:center; box-shadow:0 4px 14px rgba(0,0,0,.06); transition:transform .2s;
    position:relative; overflow:hidden;
  }
  .sup-card:hover { transform:translateY(-4px); box-shadow:0 12px 28px rgba(0,0,0,.1); }
  .sup-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:18px 18px 0 0; }
  .sup-1::before { background:linear-gradient(90deg,#42a5f5,#90caf9); }
  .sup-2::before { background:linear-gradient(90deg,#ffa726,#ffcc02); }
  .sup-3::before { background:linear-gradient(90deg,#ef9a9a,#e53935); }

  .sup-icon { font-size:2rem; margin-bottom:12px; }
  .sup-title { font-family:'Nunito',sans-serif; font-size:.95rem; font-weight:800; color:#1a2d3a; margin-bottom:8px; }
  .sup-desc  { font-size:.76rem; color:#6a8898; line-height:1.6; }
  .sup-badge { display:inline-block; margin-top:12px; padding:4px 12px; border-radius:50px; font-size:.68rem; font-weight:700; }
  .sb-1 { background:rgba(227,242,253,.9); color:#1565c0; }
  .sb-2 { background:rgba(255,248,225,.9); color:#e65100; }
  .sb-3 { background:rgba(255,235,238,.9); color:#c62828; }
`;

const FAQS = [
  { q:"How do I register as a tenant?", a:"Click on Sign Up, choose the Tenant role, and fill in your details to create an account. Verification is completed via email.", icon:"👤" },
  { q:"How is trust score calculated?",  a:"Trust score is based on user feedback, ratings, booking history, and identity verification status. It updates automatically after each interaction.", icon:"⭐" },
  { q:"Can I cancel my booking?",        a:"Yes, booking cancellation depends on the PG owner's cancellation policy. Check your booking details for specific terms and deadlines.", icon:"❌" },
  { q:"How do I list my PG as an owner?",a:"Register as a PG Owner, complete profile verification, then use the PG Management page to add your property details, rooms, and amenities.", icon:"🏢" },
  { q:"What happens if I have a complaint?", a:"Visit the Help & Support section and submit your issue. Our admin team reviews all complaints and responds within 24–48 hours.", icon:"⚠️" },
];

export default function Help() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">

        <nav className="clay-nav">
          <span className="nav-logo">PGStay</span>
          <button className="nav-back" onClick={() => navigate(-1)}>← Go Back</button>
        </nav>

        <div className="clay-hero">
          <div className="hero-badge">🆘 Help & Support</div>
          <h1 className="hero-title">How Can We<br/><span>Help You?</span></h1>
          <p className="hero-sub">Find answers to common questions, learn how the system works, or reach out to our support team.</p>
        </div>

        <main className="clay-main">

          {/* How It Works */}
          <div className="cc cc-teal" style={{ animationDelay:".05s" }}>
            <div className="sec-title">🔎 How PG Stay System Works</div>
            <div className="steps-grid">
              {[
                { num:"1", emoji:"🔍", title:"Search PG",     desc:"Browse PG accommodations by location, amenities, rent, and trust score to find your ideal match.", sn:"sn-1", s:"s-1" },
                { num:"2", emoji:"📋", title:"Book Room",      desc:"Select your preferred room type, check real-time availability, and confirm your booking instantly.",  sn:"sn-2", s:"s-2" },
                { num:"3", emoji:"💳", title:"Make Payment",   desc:"Complete secure payment and receive booking confirmation with full transaction details.",            sn:"sn-3", s:"s-3" },
              ].map((step) => (
                <div key={step.num} className={`step-card ${step.s}`}>
                  <div className={`step-num ${step.sn}`}>{step.num}</div>
                  <div className="step-emoji">{step.emoji}</div>
                  <div className="step-title">{step.title}</div>
                  <div className="step-desc">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="cc cc-purple" style={{ animationDelay:".13s" }}>
            <div className="sec-title">❓ Frequently Asked Questions</div>
            {FAQS.map((faq, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? "open" : ""}`}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="faq-q-text"><span className="faq-q-icon">{faq.icon}</span>{faq.q}</span>
                  <span className="faq-chevron">▾</span>
                </button>
                {openFaq === i && <div className="faq-a">{faq.a}</div>}
              </div>
            ))}
          </div>

          {/* Support Categories */}
          <div className="cc cc-green" style={{ animationDelay:".21s" }}>
            <div className="sec-title">🛠️ Support Categories</div>
            <div className="support-grid">
              {[
                { icon:"🏠", title:"Tenant Support",    desc:"Assistance with bookings, payments, applications, and account-related issues.",    badge:"For Tenants",    bcls:"sb-1", cls:"sup-1" },
                { icon:"🏢", title:"Owner Support",     desc:"Help with listing PGs, managing rooms, verifying identity, and monitoring trust.", badge:"For Owners",     bcls:"sb-2", cls:"sup-2" },
                { icon:"🔧", title:"Technical Support", desc:"Report bugs, login issues, payment failures, and other system-related problems.",   badge:"System Issues",  bcls:"sb-3", cls:"sup-3" },
              ].map((s) => (
                <div key={s.title} className={`sup-card ${s.cls}`}>
                  <div className="sup-icon">{s.icon}</div>
                  <div className="sup-title">{s.title}</div>
                  <div className="sup-desc">{s.desc}</div>
                  <span className={`sup-badge ${s.bcls}`}>{s.badge}</span>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </>
  );
}