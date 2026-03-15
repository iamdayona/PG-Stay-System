const Feedback = require("../models/Feedback");
const Application = require("../models/Application");
const { recalcPGTrustScore } = require("../utils/trustScore");
const createNotification = require("../utils/createNotification");

// POST /api/feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { pgStayId, rating, comment } = req.body;

    if (!pgStayId || !rating)
      return res.status(400).json({ message: "PG Stay and rating are required" });

    if (rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be between 1 and 5" });

    // Only allow feedback if tenant has an approved application for this PG
    const approvedApp = await Application.findOne({
      tenant: req.user._id,
      pgStay: pgStayId,
      status: "Approved",
    });
    if (!approvedApp)
      return res.status(403).json({ message: "You can only review a PG you have stayed at" });

    // Upsert: update existing feedback or create new
    const feedback = await Feedback.findOneAndUpdate(
      { tenant: req.user._id, pgStay: pgStayId },
      { rating, comment: comment || "" },
      { upsert: true, new: true }
    );

    // Recalculate PG trust score
    await recalcPGTrustScore(pgStayId);

    res.status(201).json({ data: feedback });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/feedback/my
exports.getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ tenant: req.user._id })
      .populate("pgStay", "name location")
      .sort({ createdAt: -1 });
    res.json({ data: feedbacks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/feedback/:pgId
exports.getFeedbackForPG = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ pgStay: req.params.pgId })
      .populate("tenant", "name")
      .sort({ createdAt: -1 });
    res.json({ data: feedbacks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
