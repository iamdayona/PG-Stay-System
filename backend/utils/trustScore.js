const Feedback  = require("../models/Feedback");
const Complaint  = require("../models/Complaint");
const Booking    = require("../models/Booking");
const PGStay     = require("../models/PGStay");

/**
 * ═══════════════════════════════════════════════════════════════════
 *  PGStay — Professional Trust Score Engine
 *
 *  Score is a weighted composite of six independent signals, each
 *  normalised to [0, 100] before weighting:
 *
 *  Signal                   Weight   Rationale
 *  ───────────────────────  ──────   ──────────────────────────────
 *  1. Feedback rating avg    35 %    Most direct quality signal
 *  2. Feedback volume         10 %   Credibility through volume
 *  3. Complaint ratio         25 %   Strongest negative signal
 *  4. Booking completion      15 %   Real tenant satisfaction proxy
 *  5. Amenity richness         5 %   Offering quality
 *  6. Profile completeness    10 %   Owner accountability
 *
 *  Admin bonuses/penalties applied AFTER composite:
 *    +15  PG verified by admin
 *    −25  PG currently restricted
 *
 *  Final score clamped to [10, 100].
 *  PGs with zero activity start at a neutral 50.
 * ═══════════════════════════════════════════════════════════════════
 */

// ── Weights (must sum to 1.0) ─────────────────────────────────────
const W = {
  feedbackRating:    0.35,
  feedbackVolume:    0.10,
  complaintRatio:    0.25,
  bookingCompletion: 0.15,
  amenityRichness:   0.05,
  profileComplete:   0.10,
};

const clamp    = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const mapRange = (v, inMin, inMax, outMin = 0, outMax = 100) => {
  if (inMax === inMin) return outMin;
  return clamp(outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin));
};

/**
 * Recalculate and persist the trust score for a single PG.
 * @param {string|ObjectId} pgStayId
 * @returns {Promise<number>} The new trust score
 */
const recalcPGTrustScore = async (pgStayId) => {
  try {
    const pg = await PGStay.findById(pgStayId);
    if (!pg) return 50;

    // Fetch all signals in parallel
    const [
      feedbacks,
      totalComplaints,
      pendingComplaints,
      totalBookings,
      completedBookings,
    ] = await Promise.all([
      Feedback.find({ pgStay: pgStayId }).select("rating").lean(),
      Complaint.countDocuments({ pgStay: pgStayId }),
      Complaint.countDocuments({ pgStay: pgStayId, status: "pending" }),
      Booking.countDocuments({ pgStay: pgStayId }),
      Booking.countDocuments({ pgStay: pgStayId, status: "Completed" }),
    ]);

    // ── Signal 1: Feedback rating average (1–5 stars → 0–100) ────
    let s_feedbackRating = 50; // neutral default
    if (feedbacks.length > 0) {
      const avg = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
      s_feedbackRating = mapRange(avg, 1, 5, 0, 100);
    }

    // ── Signal 2: Feedback volume credibility (log-scaled) ───────
    // 0 reviews → 0,  5+ reviews → 100
    const s_feedbackVolume = clamp(
      Math.round((Math.log1p(feedbacks.length) / Math.log1p(5)) * 100)
    );

    // ── Signal 3: Complaint ratio (inverted) ─────────────────────
    // complaintRatio = total complaints / max(bookings,1)
    // ratio 0 → 100 pts;  ratio ≥ 0.3 (30%+) → 0 pts
    // Each unresolved/pending complaint adds an extra −8 penalty
    const complaintRatio = totalComplaints / Math.max(totalBookings, 1);
    const pendingPenalty = pendingComplaints * 8;
    const s_complaintRatio = clamp(
      Math.round(mapRange(complaintRatio, 0, 0.3, 100, 0)) - pendingPenalty
    );

    // ── Signal 4: Booking completion rate ────────────────────────
    // completedBookings / totalBookings; neutral 50 when no bookings yet
    let s_bookingCompletion = 50;
    if (totalBookings > 0) {
      s_bookingCompletion = Math.round((completedBookings / totalBookings) * 100);
    }

    // ── Signal 5: Amenity richness (0 → 0,  8+ → 100) ───────────
    const s_amenityRichness = clamp(
      Math.round(((pg.amenities || []).length / 8) * 100)
    );

    // ── Signal 6: Profile completeness ───────────────────────────
    let profilePoints = 0;
    if (pg.description && pg.description.trim().length > 20) profilePoints += 40;
    if (pg.address    && pg.address.trim().length > 5)        profilePoints += 30;
    if ((pg.rules || []).length > 0)                          profilePoints += 20;
    if (pg.coordinates?.coordinates?.length === 2)            profilePoints += 10;
    const s_profileComplete = clamp(profilePoints);

    // ── Weighted composite ────────────────────────────────────────
    const composite = Math.round(
      s_feedbackRating    * W.feedbackRating    +
      s_feedbackVolume    * W.feedbackVolume    +
      s_complaintRatio    * W.complaintRatio    +
      s_bookingCompletion * W.bookingCompletion +
      s_amenityRichness   * W.amenityRichness   +
      s_profileComplete   * W.profileComplete
    );

    // ── Admin status adjustment ───────────────────────────────────
    let statusAdj = 0;
    if (pg.verificationStatus === "verified")   statusAdj = +15;
    if (pg.verificationStatus === "restricted") statusAdj = -25;

    const finalScore = clamp(composite + statusAdj, 10, 100);

    await PGStay.findByIdAndUpdate(pgStayId, { trustScore: finalScore });
    return finalScore;
  } catch (err) {
    console.error("[TrustScore] recalcPGTrustScore failed:", err.message);
    return 50;
  }
};

/**
 * Batch-recalculate trust scores for ALL active PGs.
 * Safe to call from a scheduled cron job.
 * @returns {Promise<{ updated: number, errors: number }>}
 */
const recalcAllPGTrustScores = async () => {
  const summary = { updated: 0, errors: 0 };
  try {
    const pgs = await PGStay.find({ isActive: true }).select("_id").lean();
    const results = await Promise.allSettled(
      pgs.map((pg) => recalcPGTrustScore(pg._id))
    );
    results.forEach((r) => {
      if (r.status === "fulfilled") summary.updated++;
      else summary.errors++;
    });
    console.log(`[TrustScore] Batch complete — updated: ${summary.updated}, errors: ${summary.errors}`);
  } catch (err) {
    console.error("[TrustScore] recalcAllPGTrustScores failed:", err.message);
  }
  return summary;
};

module.exports = { recalcPGTrustScore, recalcAllPGTrustScores };