import { useNavigate } from "react-router-dom";
import { CLAY_BASE,CLAY_COMMON, CLAY_NAV, CLAY_HERO, injectClay } from "../styles/claystyles";

const PAGE_CSS = `
  .nav-back { padding:9px 20px; border:none; border-radius:50px; cursor:pointer; background:linear-gradient(135deg,#00acc1,#00838f); color:white; font-family:'Poppins',sans-serif; font-size:.82rem; font-weight:700; box-shadow:0 4px 0 #006064,0 7px 16px rgba(0,172,193,.3),inset 0 1px 0 rgba(255,255,255,.3); transition:transform .15s,box-shadow .15s; }
  .nav-back:hover { transform:translateY(-2px); box-shadow:0 6px 0 #006064,0 10px 22px rgba(0,172,193,.38); }

  .clay-main { position:relative; z-index:1; max-width:920px; margin:0 auto; padding:0 24px 60px; }

  .cc { background:rgba(255,255,255,.65); backdrop-filter:blur(18px); border:2.5px solid rgba(255,255,255,.85); border-radius:26px; padding:30px 32px; box-shadow:0 8px 28px rgba(0,0,0,.07),inset 0 1px 0 rgba(255,255,255,.95); margin-bottom:24px; animation:fadeUp .6s ease both; position:relative; overflow:hidden; }
  .cc::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; border-radius:26px 26px 0 0; }
  .cc-teal::before   { background:linear-gradient(90deg,#00acc1,#80deea); }
  .cc-purple::before { background:linear-gradient(90deg,#ce93d8,#e040fb); }
  .sec-title { font-family:'Nunito',sans-serif; font-size:1.2rem; font-weight:900; color:#1a2d3a; margin-bottom:20px; display:flex; align-items:center; gap:9px; }

  .contact-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media(max-width:600px){ .contact-grid{grid-template-columns:1fr;} }
  .contact-card { background:rgba(255,255,255,.6); border:2px solid rgba(255,255,255,.85); border-radius:18px; padding:20px; box-shadow:0 4px 14px rgba(0,0,0,.06); transition:transform .2s,box-shadow .2s; position:relative; overflow:hidden; display:flex; gap:14px; align-items:flex-start; }
  .contact-card:hover { transform:translateY(-4px); box-shadow:0 12px 28px rgba(0,0,0,.1); }
  .contact-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:18px 18px 0 0; }
  .cn-1::before { background:linear-gradient(90deg,#00acc1,#80deea); }
  .cn-2::before { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .cn-3::before { background:linear-gradient(90deg,#ffa726,#ffcc02); }
  .cn-4::before { background:linear-gradient(90deg,#ce93d8,#e040fb); }
  .contact-icon  { width:44px; height:44px; border-radius:13px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:1.1rem; border:2px solid rgba(255,255,255,.9); box-shadow:0 3px 10px rgba(0,0,0,.08); }
  .ci-1 { background:linear-gradient(135deg,#b2ebf2,#e0f7fa); }
  .ci-2 { background:linear-gradient(135deg,#c8e6c9,#e8f5e9); }
  .ci-3 { background:linear-gradient(135deg,#ffe0b2,#fff8e1); }
  .ci-4 { background:linear-gradient(135deg,#e1bee7,#f3e5f5); }
  .contact-label { font-family:'Nunito',sans-serif; font-size:.82rem; font-weight:800; color:#1a2d3a; margin-bottom:5px; }
  .contact-value { font-size:.88rem; color:#4a6070; font-weight:500; }
  .contact-value a { color:inherit; text-decoration:none; }
  .contact-value a:hover { color:#00838f; text-decoration:underline; }

  .team-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:13px; }
  @media(max-width:700px){ .team-grid{grid-template-columns:repeat(2,1fr);} }
  @media(max-width:420px){ .team-grid{grid-template-columns:1fr;} }
  .team-card { background:rgba(255,255,255,.6); border:2px solid rgba(255,255,255,.85); border-radius:18px; padding:20px 14px; text-align:center; box-shadow:0 4px 14px rgba(0,0,0,.06); transition:transform .2s; position:relative; overflow:hidden; }
  .team-card:hover { transform:translateY(-4px); box-shadow:0 12px 28px rgba(0,0,0,.1); }
  .team-card::before { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; border-radius:0 0 18px 18px; }
  .tc-1::before { background:linear-gradient(90deg,#00acc1,#80deea); }
  .tc-2::before { background:linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .tc-3::before { background:linear-gradient(90deg,#ffa726,#ffcc02); }
  .tc-4::before { background:linear-gradient(90deg,#ce93d8,#e040fb); }
  .team-avatar { width:56px; height:56px; border-radius:50%; margin:0 auto 10px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; border:3px solid rgba(255,255,255,.95); box-shadow:0 4px 14px rgba(0,172,193,.2); }
  .ta-1 { background:linear-gradient(135deg,#b2ebf2,#e0f7fa); }
  .ta-2 { background:linear-gradient(135deg,#c8e6c9,#e8f5e9); }
  .ta-3 { background:linear-gradient(135deg,#ffe0b2,#fff8e1); }
  .ta-4 { background:linear-gradient(135deg,#e1bee7,#f3e5f5); }
  .team-role  { font-size:.68rem; font-weight:700; color:#00838f; text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; }
  .team-name  { font-family:'Nunito',sans-serif; font-size:.85rem; font-weight:800; color:#1a2d3a; margin-bottom:6px; }
  .team-email { font-size:.68rem; color:#8aaab8; word-break:break-all; line-height:1.4; }
`;

const css = injectClay(CLAY_BASE,CLAY_COMMON, CLAY_NAV, CLAY_HERO, PAGE_CSS);

const CONTACTS = [
  { label:"General Enquiries", phone:"+91 97785 41454", email:"dayonasuby@gmail.com",          cls:"cn-1", icls:"ci-1", emoji:"🌐" },
  { label:"Tenant Support",    phone:"+91 89216 94353", email:"aromalharikumar05@gmail.com",   cls:"cn-2", icls:"ci-2", emoji:"🏠" },
  { label:"Owner Support",     phone:"+91 80783 29968", email:"anaghasunny2@gmail.com",        cls:"cn-3", icls:"ci-3", emoji:"🏢" },
  { label:"Technical Support", phone:"+91 88485 07913", email:"ageeshcyriacbaiju33@gmail.com",cls:"cn-4", icls:"ci-4", emoji:"🔧" },
];

const TEAM = [
  { role:"General",   initials:"D",  cls:"tc-1", acls:"ta-1", email:"dayonasuby@gmail.com" },
  { role:"Tenant",    initials:"A",  cls:"tc-2", acls:"ta-2", email:"aromalharikumar05@gmail.com" },
  { role:"Owner",     initials:"A",  cls:"tc-3", acls:"ta-3", email:"anaghasunny2@gmail.com" },
  { role:"Technical", initials:"A",  cls:"tc-4", acls:"ta-4", email:"ageeshcyriacbaiju33@gmail.com" },
];

export default function Contact() {
  const navigate = useNavigate();

  return (
    <>
      <style>{css}</style>
      <div className="clay-page">

        <nav className="clay-nav">
          <span className="clay-nav-logo">PGStay</span>
          <button className="nav-back" onClick={() => navigate(-1)}>← Go Back</button>
        </nav>

        <div className="clay-hero">
          <div className="clay-hero-badge">📬 Contact Us</div>
          <h1 className="clay-hero-title">We're Here<br/><span>to Help You</span></h1>
          <p className="clay-hero-sub">Reach out to our team for any queries about bookings, accounts, or technical issues. We're always just a call or email away.</p>
        </div>

        <main className="clay-main">

          {/* Phone numbers */}
          <div className="cc cc-teal" style={{ animationDelay:".05s" }}>
            <div className="sec-title">📞 Contact Numbers</div>
            <div className="contact-grid">
              {CONTACTS.map((c) => (
                <div key={c.label} className={`contact-card ${c.cls}`}>
                  <div className={`contact-icon ${c.icls}`}>{c.emoji}</div>
                  <div>
                    <div className="contact-label">{c.label}</div>
                    <div className="contact-value"><a href={`tel:${c.phone}`}>{c.phone}</a></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email addresses */}
          <div className="cc cc-purple" style={{ animationDelay:".13s" }}>
            <div className="sec-title">📧 Email Addresses</div>
            <div className="contact-grid">
              {CONTACTS.map((c) => (
                <div key={c.label} className={`contact-card ${c.cls}`}>
                  <div className={`contact-icon ${c.icls}`}>{c.emoji}</div>
                  <div>
                    <div className="contact-label">{c.label}</div>
                    <div className="contact-value"><a href={`mailto:${c.email}`}>{c.email}</a></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="cc" style={{ animationDelay:".21s", "--before-bg":"none" }}>
            <style>{`.cc-team::before{background:linear-gradient(90deg,#00acc1,#ffa726,#ce93d8,#66bb6a);}`}</style>
            <div className="cc-team" style={{ position:"absolute", top:0, left:0, right:0, height:4, borderRadius:"26px 26px 0 0", background:"linear-gradient(90deg,#00acc1,#ffa726,#ce93d8,#66bb6a)" }} />
            <div className="sec-title" style={{ marginTop:4 }}>👥 Our Team</div>
            <div className="team-grid">
              {TEAM.map((m) => (
                <div key={m.email} className={`team-card ${m.cls}`}>
                  <div className={`team-avatar ${m.acls}`}>{m.initials}</div>
                  <div className="team-role">{m.role} Support</div>
                  <div className="team-email">{m.email}</div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </>
  );
}