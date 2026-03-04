const Notification = require("../models/Notification");

/**
 * Create a notification for a user
 * @param {string} userId - recipient user ID
 * @param {string} message - notification message
 * @param {string} type - "application" | "success" | "alert" | "info"
 */
const createNotification = async (userId, message, type = "info") => {
  try {
    await Notification.create({ user: userId, message, type });
  } catch (err) {
    // Notifications are non-critical — log but don't crash
    console.error("Notification creation failed:", err.message);
  }
};

module.exports = createNotification;
