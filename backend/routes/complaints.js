const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const Application = require("../models/Application");
const PGStay = require("../models/PGStay");
const { protect, authorize } = require("../middleware/auth");

// POST /api/complaints  — tenant submits a complaint
router.post("/", protect, authorize("tenant"), async (req, res) => {
  try {
    const { pgStayId, issue } = req.body;

    if (!pgStayId || !issue)
      return res.status(400).json({ message: "PG Stay and issue are required" });

    // Only tenants with an approved application can file a complaint
    const approved = await Application.findOne({
      tenant: req.user._id,
      pgStay: pgStayId,
      status: "Approved",
    });
    if (!approved)
      return res.status(403).json({ message: "You can only file complaints for PGs you have stayed at" });

    const complaint = await Complaint.create({
      reportedBy: req.user._id,
      pgStay: pgStayId,
      issue,
    });

    // Increment complaint counter on PG
    await PGStay.findByIdAndUpdate(pgStayId, { $inc: { complaints: 1 } });

    res.status(201).json({ data: complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/complaints/my  — tenant views their complaints
router.get("/my", protect, authorize("tenant"), async (req, res) => {
  try {
    const complaints = await Complaint.find({ reportedBy: req.user._id })
      .populate("pgStay", "name location")
      .sort({ createdAt: -1 });
    res.json({ data: complaints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
