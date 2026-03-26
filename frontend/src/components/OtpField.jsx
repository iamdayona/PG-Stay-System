/**
 * OtpField.jsx  —  src/components/OtpField.jsx
 *
 * Reusable OTP verification widget (claymorphism styled).
 *
 * Props:
 *   type        "email" | "phone"
 *   value       current field value (controlled)
 *   onChange    (val) => void
 *   onVerified  () => void  — fires when OTP confirmed
 *   accent      optional colour hex (default #42a5f5)
 *   accentDark  optional shadow colour
 *   disabled    lock field (e.g. already verified on load)
 */
import { useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;

async function apiPost(endpoint, body) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
}

// Normalize phone to E.164 (+91xxxxxxxxxx)
function toE164(val) {
    const digits = val.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    return `+${digits}`;
}

const CSS = `
  .otpf-wrap { margin-bottom:20px; }
  .otpf-label { display:block; font-family:'Poppins',sans-serif; font-size:.74rem;
    font-weight:700; color:#7a7a9a; text-transform:uppercase; letter-spacing:.4px; margin-bottom:6px; }
  .otpf-row { display:flex; gap:8px; }
  .otpf-input { flex:1; padding:12px 16px; border-radius:14px;
    border:2.5px solid rgba(255,255,255,.85); background:rgba(255,255,255,.65);
    backdrop-filter:blur(10px); font-family:'Poppins',sans-serif; font-size:.9rem;
    color:#2d2d4e; box-shadow:0 4px 14px rgba(0,0,0,.06),inset 0 1px 0 rgba(255,255,255,.9);
    outline:none; transition:border-color .2s, box-shadow .2s; }
  .otpf-input:focus { border-color:var(--otpf-a,#42a5f5);
    box-shadow:0 0 0 3px color-mix(in srgb,var(--otpf-a,#42a5f5) 15%,transparent),
               inset 0 1px 0 rgba(255,255,255,.9); }
  .otpf-input:disabled { opacity:.6; cursor:not-allowed; background:rgba(232,245,233,.5); }
  .otpf-send { padding:12px 16px; border-radius:14px; border:none;
    font-family:'Poppins',sans-serif; font-size:.78rem; font-weight:700;
    color:white; cursor:pointer; white-space:nowrap;
    background:var(--otpf-a,#42a5f5);
    box-shadow:0 4px 0 var(--otpf-d,#1565c0),0 6px 14px color-mix(in srgb,var(--otpf-a,#42a5f5) 30%,transparent);
    transition:transform .15s,filter .15s; }
  .otpf-send:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-2px);}
  .otpf-send:active{transform:scale(.96) translateY(2px);}
  .otpf-send:disabled{opacity:.6;cursor:not-allowed;transform:none;}
  .otpf-verified { display:inline-flex; align-items:center; gap:6px;
    background:rgba(232,245,233,.9); color:#2e7d32;
    border:1.5px solid rgba(165,214,167,.6); border-radius:50px;
    padding:10px 16px; font-size:.78rem; font-weight:700; white-space:nowrap; }
  .otpf-otp-row { display:flex; gap:8px; margin-top:10px; animation:otpfIn .25s ease; }
  .otpf-otp-input { flex:1; padding:11px 14px; border-radius:14px;
    border:2.5px solid rgba(255,255,255,.85); background:rgba(255,255,255,.65);
    backdrop-filter:blur(10px); font-family:'Poppins',sans-serif; font-size:.95rem;
    font-weight:700; color:#2d2d4e; letter-spacing:6px; text-align:center;
    box-shadow:0 4px 14px rgba(0,0,0,.06),inset 0 1px 0 rgba(255,255,255,.9);
    outline:none; transition:border-color .2s; }
  .otpf-otp-input:focus { border-color:var(--otpf-a,#42a5f5);
    box-shadow:0 0 0 3px color-mix(in srgb,var(--otpf-a,#42a5f5) 15%,transparent); }
  .otpf-confirm { padding:11px 18px; border-radius:14px; border:none;
    font-family:'Poppins',sans-serif; font-size:.78rem; font-weight:700;
    color:white; cursor:pointer; white-space:nowrap;
    background:linear-gradient(135deg,#66bb6a,#43a047);
    box-shadow:0 4px 0 #2e7d32,0 6px 14px rgba(102,187,106,.3);
    transition:transform .15s,filter .15s; }
  .otpf-confirm:hover:not(:disabled){filter:brightness(1.07);transform:translateY(-2px);}
  .otpf-confirm:active{transform:scale(.96) translateY(2px);}
  .otpf-confirm:disabled{opacity:.6;cursor:not-allowed;}
  .otpf-resend { background:none; border:none; cursor:pointer;
    font-family:'Poppins',sans-serif; font-size:.74rem; font-weight:600;
    color:var(--otpf-a,#42a5f5); text-decoration:underline;
    margin-top:5px; padding:0; transition:opacity .15s; }
  .otpf-resend:disabled{opacity:.45;cursor:not-allowed;text-decoration:none;}
  .otpf-msg { font-size:.78rem; font-weight:600; padding:8px 12px;
    border-radius:10px; margin-top:6px; animation:otpfIn .25s ease; }
  .otpf-msg.err { background:rgba(255,235,238,.85); color:#c62828;
    border:1.5px solid rgba(239,154,154,.5); }
  .otpf-msg.ok  { background:rgba(227,242,253,.85); color:#1565c0;
    border:1.5px solid rgba(144,202,249,.4); }
  @keyframes otpfIn { from{opacity:0;transform:translateY(4px);} to{opacity:1;transform:none;} }
`;

let injected = false;
function injectCSS() {
    if (injected || typeof document === "undefined") return;
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    injected = true;
}

export default function OtpField({
    type = "email",
    value = "",
    onChange,
    onVerified,
    accent = "#42a5f5",
    accentDark = "#1565c0",
    disabled = false,
}) {
    injectCSS();

    const isEmail = type === "email";
    const label = isEmail ? "Email Address" : "Mobile Number";
    const placeholder = isEmail ? "you@example.com" : "+91 98765 43210";

    const [step, setStep] = useState(disabled ? "verified" : "idle");
    const [otp, setOtp] = useState("");
    const [msg, setMsg] = useState(null);   // { text, kind:"ok"|"err" }
    const [sending, setSending] = useState(false);
    const [checking, setChecking] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    function startCooldown(s = 30) {
        setCooldown(s);
        const iv = setInterval(() => setCooldown(c => { if (c <= 1) { clearInterval(iv); return 0; } return c - 1; }), 1000);
    }

    async function handleSend() {
        if (!value.trim()) { setMsg({ text: `Enter your ${type} first.`, kind: "err" }); return; }
        setSending(true); setMsg(null);
        try {
            const payload = isEmail
                ? { email: value }
                : { phone: toE164(value) };
            await apiPost(isEmail ? "/verify/send-email" : "/verify/send-phone", payload);
            setStep("sent"); setOtp("");
            setMsg({ text: isEmail ? "OTP sent! Check your inbox." : "OTP sent via SMS.", kind: "ok" });
            startCooldown(30);
        } catch (e) {
            setMsg({ text: e.message, kind: "err" });
        } finally { setSending(false); }
    }

    async function handleConfirm() {
        if (otp.length < 6) { setMsg({ text: "Enter the 6-digit OTP.", kind: "err" }); return; }
        setChecking(true); setMsg(null);
        try {
            const payload = isEmail
                ? { email: value, otp }
                : { phone: toE164(value), otp };
            await apiPost(isEmail ? "/verify/confirm-email" : "/verify/confirm-phone", payload);
            setStep("verified"); setMsg(null);
            onVerified?.();
        } catch (e) {
            setMsg({ text: e.message, kind: "err" });
        } finally { setChecking(false); }
    }

    const isVerified = step === "verified";
    const isSent = step === "sent";

    return (
        <div className="otpf-wrap" style={{ "--otpf-a": accent, "--otpf-d": accentDark }}>
            <label className="otpf-label">{label}</label>

            <div className="otpf-row">
                <input
                    className="otpf-input"
                    type={isEmail ? "email" : "tel"}
                    placeholder={placeholder}
                    value={value}
                    onChange={e => { onChange?.(e.target.value); if (step !== "idle") { setStep("idle"); setMsg(null); } }}
                    disabled={isVerified}
                />
                {isVerified
                    ? <span className="otpf-verified">✅ Verified</span>
                    : <button className="otpf-send" onClick={handleSend}
                        disabled={sending || (isSent && cooldown > 0)}>
                        {sending ? "Sending…" : isSent ? "Resend?" : "Send OTP"}
                    </button>
                }
            </div>

            {isSent && (
                <>
                    <div className="otpf-otp-row">
                        <input className="otpf-otp-input" type="text" inputMode="numeric"
                            maxLength={6} placeholder="— — — — — —"
                            value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} />
                        <button className="otpf-confirm" onClick={handleConfirm}
                            disabled={checking || otp.length < 6}>
                            {checking ? "Checking…" : "Verify ✓"}
                        </button>
                    </div>
                    <button className="otpf-resend" onClick={handleSend} disabled={cooldown > 0 || sending}>
                        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                    </button>
                </>
            )}

            {msg && <div className={`otpf-msg ${msg.kind}`}>{msg.text}</div>}
        </div>
    );
}