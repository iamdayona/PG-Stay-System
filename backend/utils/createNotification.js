const Notification = require("../models/Notification");
const User = require("../models/User");
const sendEmail = require("./sendEmail");

/**
 * Create a notification for a user and email it to their registered address.
 * @param {string} userId - recipient user ID
 * @param {string} message - notification message
 * @param {string} type - "application" | "success" | "alert" | "info"
 */
const createNotification = async (userId, message, type = "info", options = {}) => {
  try {
    await Notification.create({
      user: userId,
      message,
      type,
      booking: options.booking || null,
      documentUrl: options.documentUrl || "",
    });
  } catch (err) {
    // Notifications are non-critical — log but don't crash
    console.error("Notification creation failed:", err.message);
  }

  try {
    const user = await User.findById(userId).select("email name");
    if (!user || !user.email) return;

    const subject = `PGStay notification: ${type === "alert" ? "Action required" : "Update"}`;
    const text = `${message}\n\nLog in to your PGStay account to view the notification.`;
    const html = `<p>${message}</p><p>Log in to your PGStay account to view the notification.</p>`;

    await sendEmail({
      to: user.email,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error("Notification email failed:", err.message);
  }
};

module.exports = createNotification;
