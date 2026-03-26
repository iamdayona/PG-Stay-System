/**
 * backend/routes/verify.js
 *
 * Add to backend/.env:
 *   EMAIL_USER=your_gmail@gmail.com
 *   EMAIL_PASS=your_gmail_app_password
 *   TWILIO_SID=ACxxxxxxxxxxxxxxxxx
 *   TWILIO_AUTH=your_auth_token
 *   TWILIO_PHONE=+1xxxxxxxxxx
 */

const express    = require("express");
const nodemailer = require("nodemailer");
const twilio     = require("twilio");
const router     = express.Router();

// ── OTP store (in-memory) ─────────────────────────────────────────────────
const otpStore = new Map();
const OTP_TTL  = 5 * 60 * 1000; // 5 minutes

function makeOTP()         { return Math.floor(100000 + Math.random() * 900000).toString(); }
function save(key, otp)    { otpStore.set(key, { otp, exp: Date.now() + OTP_TTL }); }
function verify(key, input) {
  const r = otpStore.get(key);
  if (!r)                return { ok: false, msg: "No OTP found. Request a new one." };
  if (Date.now() > r.exp){ otpStore.delete(key); return { ok: false, msg: "OTP expired. Request a new one." }; }
  if (r.otp !== input)   return { ok: false, msg: "Incorrect OTP. Try again." };
  otpStore.delete(key);
  return { ok: true };
}

// ── Nodemailer ────────────────────────────────────────────────────────────
const mailer = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,        // true = port 465 (blocked), false = port 587 with STARTTLS
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { rejectUnauthorized: false },  // avoids cert issues on local networks
});

// ── Twilio ────────────────────────────────────────────────────────────────
const sms = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// POST /api/verify/send-email   { email }
router.post("/send-email", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required." });
  const otp = makeOTP();
  save(`email:${email}`, otp);
  try {
    await mailer.sendMail({
      from: `"PGStay" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "PGStay — Email Verification OTP",
      html: `
        <div style="font-family:sans-serif;max-width:460px;margin:0 auto;padding:28px;
                    background:#f0f4ff;border-radius:18px;">
          <h2 style="margin:0 0 8px;color:#1565c0;">PG<span style="color:#66bb6a">Stay</span></h2>
          <p style="color:#555;">Your email verification OTP:</p>
          <div style="font-size:38px;font-weight:900;letter-spacing:10px;color:#1565c0;
                      background:#fff;border-radius:12px;padding:16px;text-align:center;
                      margin:16px 0;">${otp}</div>
          <p style="color:#999;font-size:13px;">Expires in 5 minutes. Do not share it.</p>
        </div>`,
    });
    res.json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("Email error:", err.message);
    res.status(500).json({ message: "Failed to send email OTP. Check EMAIL_USER/EMAIL_PASS in .env" });
  }
});

// POST /api/verify/confirm-email   { email, otp }
router.post("/confirm-email", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP required." });
  const r = verify(`email:${email}`, otp);
  if (!r.ok) return res.status(400).json({ message: r.msg });
  res.json({ message: "Email verified!" });
});

// POST /api/verify/send-phone   { phone }  — E.164 format: +919876543210
router.post("/send-phone", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone number is required." });
  const otp = makeOTP();
  save(`phone:${phone}`, otp);
  try {
    await sms.messages.create({
      body: `Your PGStay OTP is: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE,
      to: phone,
    });
    res.json({ message: "OTP sent via SMS." });
  } catch (err) {
    console.error("Twilio error:", err.message);
    res.status(500).json({ message: "Failed to send SMS OTP. Check TWILIO_* in .env" });
  }
});

// POST /api/verify/confirm-phone   { phone, otp }
router.post("/confirm-phone", (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP required." });
  const r = verify(`phone:${phone}`, otp);
  if (!r.ok) return res.status(400).json({ message: r.msg });
  res.json({ message: "Phone verified!" });
});

module.exports = router;