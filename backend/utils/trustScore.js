const Feedback = require("../models/Feedback");
const PGStay = require("../models/PGStay");

/**
 * Recalculate and save a PG's trust score based on its feedback ratings.
 * Score = average of all ratings * 20 (maps 1-5 stars to 20-100)
 * Falls back to 50 if no feedback yet.
 */
const recalcPGTrustScore = async (pgStayId) => {
  try {
    const feedbacks = await Feedback.find({ pgStay: pgStayId });
    if (feedbacks.length === 0) return;
    const avg = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
    const score = Math.round(avg * 20);
    await PGStay.findByIdAndUpdate(pgStayId, { trustScore: score });
  } catch (err) {
    console.error("Trust score recalc failed:", err.message);
  }
};

module.exports = { recalcPGTrustScore };
