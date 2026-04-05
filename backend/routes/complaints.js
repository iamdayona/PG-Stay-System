const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const Application = require("../models/Application");
const Booking = require("../models/Booking");
const PGStay = require("../models/PGStay");
const { protect, authorize } = require("../middleware/auth");
const createNotification = require("../utils/createNotification");
const sendEmail = require("../utils/sendEmail");
const notifyAdmins = require("../utils/notifyAdmins");

// POST /api/complaints  — tenant submits a complaint
router.post("/", protect, authorize("tenant"), async (req, res) => {
  try {
    const { pgStayId, issue } = req.body;

    if (!pgStayId || !issue)
      return res.status(400).json({ message: "PG Stay and issue are required" });

    const tenantId = req.user._id;
    console.log("[Complaint] tenantId:", tenantId.toString(), "pgStayId:", pgStayId);

    const validBooking = await Booking.findOne({
      tenant: tenantId,
      pgStay: pgStayId,
      status: { $in: ["Active", "Completed"] },
    });
    console.log("[Complaint] validBooking:", validBooking ? validBooking._id.toString() : null, validBooking ? validBooking.status : null);

    const validApplication = await Application.findOne({
      tenant: tenantId,
      pgStay: pgStayId,
      status: { $in: ["Approved", "Booked"] },
    });
    console.log("[Complaint] validApplication:", validApplication ? validApplication._id.toString() : null, validApplication ? validApplication.status : null);

    if (!validBooking && !validApplication)
      return res.status(403).json({ message: "You can only file complaints for PGs you have stayed at" });

    const complaint = await Complaint.create({
      reportedBy: req.user._id,
      pgStay: pgStayId,
      issue,
      messages: [{ sender: "tenant", text: issue }],
    });

    const pg = await PGStay.findById(pgStayId).populate("owner", "name email");
    await PGStay.findByIdAndUpdate(pgStayId, { $inc: { complaints: 1 } });

    if (pg?.owner?.email) {
      sendEmail({
        to: pg.owner.email,
        subject: `New complaint filed for your PG ${pg.name}`,
        text: `A tenant has filed a complaint for your PG "${pg.name}".\n\nIssue: ${issue}\nTenant: ${req.user.name} (${req.user.email})\n\nPlease review the complaint in the owner complaints dashboard.`,
        html: `<p>A tenant has filed a complaint for your PG "<strong>${pg.name}</strong>".</p><p><strong>Issue:</strong> ${issue}</p><p><strong>Tenant:</strong> ${req.user.name} (${req.user.email})</p><p>Please review the complaint in the owner complaints dashboard.</p>`,
      });

      await createNotification(
        pg.owner._id,
        `A new complaint has been filed for your PG "${pg.name}". Check your owner complaint panel.`,
        "alert"
      );
    }

    // Notify all admins about the new complaint
    notifyAdmins({
      subject: `New complaint filed — "${pg?.name || pgStayId}"`,
      text: `A tenant has filed a complaint that requires admin review.\n\nPG: ${pg?.name || "Unknown"}\nLocation: ${pg?.location || "Unknown"}\nTenant: ${req.user.name} (${req.user.email})\nOwner: ${pg?.owner?.name || "Unknown"} (${pg?.owner?.email || "Unknown"})\n\nIssue:\n${issue}\n\nPlease log in to the admin panel to review and take action on this complaint.`,
      html: `A tenant has filed a complaint that requires your review.<br><br>
             🏠 <strong>PG:</strong> ${pg?.name || "Unknown"}<br>
             📍 Location: ${pg?.location || "Unknown"}<br>
             👤 <strong>Tenant:</strong> ${req.user.name} (${req.user.email})<br>
             🏢 <strong>Owner:</strong> ${pg?.owner?.name || "Unknown"} (${pg?.owner?.email || "Unknown"})<br><br>
             📋 <strong>Issue:</strong><br>
             <div style="background:rgba(255,235,238,.6);border-radius:8px;padding:10px 14px;margin-top:6px;">${issue}</div><br>
             Please log in to the admin panel to review and take action.`,
    }).catch(() => { }); // fire-and-forget

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

// GET /api/complaints/owner — owner views complaints for their PGs
router.get("/owner", protect, authorize("owner"), async (req, res) => {
  try {
    const ownerPGs = await PGStay.find({ owner: req.user._id }).select("_id");
    const pgIds = ownerPGs.map((pg) => pg._id);

    const complaints = await Complaint.find({ pgStay: { $in: pgIds } })
      .populate("reportedBy", "name email")
      .populate("pgStay", "name")
      .sort({ createdAt: -1 });

    res.json({ data: complaints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/complaints/:id/owner — owner updates complaint status or adds a response
router.put("/:id/owner", protect, authorize("owner"), async (req, res) => {
  try {
    const { action, message } = req.body;
    if (!action || !["resolved", "willResolve"].includes(action)) {
      return res.status(400).json({ message: "Action must be 'resolved' or 'willResolve'" });
    }

    const complaint = await Complaint.findById(req.params.id).populate("pgStay", "owner name");
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    if (complaint.pgStay.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    complaint.ownerAction = action;
    if (message) {
      complaint.ownerResponse = message;
      complaint.messages.push({ sender: "owner", text: message });
    }

    if (action === "resolved") {
      complaint.status = "resolved";
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    await createNotification(
      complaint.reportedBy,
      message
        ? `Owner update for your complaint: ${message}`
        : `Your complaint about ${complaint.pgStay.name} has been updated by the owner.`,
      "info"
    );

    res.json({ data: complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;