const Feedback = require("../models/Feedback");
const PGStay = require("../models/PGStay");
const Booking = require("../models/Booking");

// Helper: recalculate and update PG trust score from all feedback
const updatePGTrustScore = async (pgId) => {
  const feedbacks = await Feedback.find({ pgStay: pgId });
  if (feedbacks.length === 0) return;

  const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
  // Map 1-5 stars to 0-100 trust score
  const trustScore = Math.round((avgRating / 5) * 100);

  await PGStay.findByIdAndUpdate(pgId, { trustScore });
};

// @desc    Submit feedback for a PG Stay
// @route   POST /api/feedback
// @access  Private (tenant)
exports.submitFeedback = async (req, res) => {
  try {
    const { pgStayId, rating, comment, bookingId } = req.body;

    if (!pgStayId || !rating) {
      return res.status(400).json({ message: "PG Stay and rating are required" });
    }

    // Check PG exists
    const pg = await PGStay.findById(pgStayId);
    if (!pg) return res.status(404).json({ message: "PG Stay not found" });

    // Prevent duplicate feedback per tenant per PG
    const existing = await Feedback.findOne({
      tenant: req.user.id,
      pgStay: pgStayId,
    });
    if (existing) {
      return res.status(400).json({ message: "You have already submitted feedback for this PG" });
    }

    const feedback = await Feedback.create({
      tenant: req.user.id,
      pgStay: pgStayId,
      booking: bookingId || null,
      rating,
      comment: comment || "",
    });

    // Recalculate PG trust score
    await updatePGTrustScore(pgStayId);

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get feedback for a specific PG stay
// @route   GET /api/feedback/:pgId
// @access  Private
exports.getFeedbackForPG = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ pgStay: req.params.pgId })
      .populate("tenant", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: feedbacks.length, data: feedbacks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get feedback submitted by logged-in tenant
// @route   GET /api/feedback/my
// @access  Private (tenant)
exports.getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ tenant: req.user.id })
      .populate("pgStay", "name location")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: feedbacks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};