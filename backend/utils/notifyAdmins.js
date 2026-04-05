const User = require("../models/User");
const sendEmail = require("./sendEmail");

/**
 * Notify ALL admin users by email when an important platform event occurs.
 *
 * @param {Object} opts
 * @param {string} opts.subject  - Email subject line
 * @param {string} opts.text     - Plain-text email body
 * @param {string} opts.html     - HTML email body
 */
const notifyAdmins = async ({ subject, text, html }) => {
    try {
        const admins = await User.find({ role: "admin", isActive: true }).select("email name");
        if (!admins.length) return;

        // Fire all emails in parallel; individual failures are silently swallowed
        await Promise.allSettled(
            admins.map((admin) =>
                sendEmail({
                    to: admin.email,
                    subject: `[PGStay Admin Alert] ${subject}`,
                    text: `Hi ${admin.name},\n\n${text}\n\n— PGStay Automated System`,
                    html: `
            <div style="font-family:Poppins,sans-serif;max-width:600px;margin:0 auto;padding:24px;border-radius:16px;border:1px solid #f5c6cb;background:#fff9f9;">
              <div style="font-size:1.1rem;font-weight:800;color:#c62828;margin-bottom:8px;">🔔 PGStay Admin Alert</div>
              <p style="color:#2d2d4e;font-size:.95rem;margin-bottom:16px;">Hi <strong>${admin.name}</strong>,</p>
              <div style="background:rgba(255,235,238,.6);border:1.5px solid rgba(239,154,154,.35);border-radius:12px;padding:16px 18px;color:#4a2020;font-size:.9rem;line-height:1.6;margin-bottom:16px;">
                ${html}
              </div>
              <p style="color:#9a9ab0;font-size:.78rem;margin-top:16px;">This is an automated notification from PGStay. Please log in to the admin panel to take action.</p>
            </div>
          `,
                })
            )
        );
    } catch (err) {
        // Never crash the main request due to admin notification failure
        console.error("[notifyAdmins] Failed:", err.message);
    }
};

module.exports = notifyAdmins;