const User = require("../models/User");
const PGStay = require("../models/PGStay");
const Room = require("../models/Room");
const Application = require("../models/Application");
const Feedback = require("../models/Feedback");
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");
const createNotification = require("../utils/createNotification");
const mongoose = require("mongoose");

// GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalPGs, pendingVerifications, activeBookings, recentPGs] =
      await Promise.all([
        User.countDocuments({ isActive: true }),
        PGStay.countDocuments({ isActive: true }),
        PGStay.countDocuments({ verificationStatus: "pending" }),
        Application.countDocuments({ status: "Approved" }),
        PGStay.find({ verificationStatus: "pending" })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("owner", "name"),
      ]);

    res.json({
      data: { totalUsers, totalPGs, pendingVerifications, activeBookings, recentPGs },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/pgs
exports.getAllPGsAdmin = async (req, res) => {
  try {
    const pgs = await PGStay.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    const results = await Promise.all(
      pgs.map(async (pg) => {
        const complaints = await Complaint.countDocuments({
          pgStay: pg._id,
          status: "pending",
        });
        return { ...pg.toObject(), complaints };
      })
    );

    res.json({ data: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/pgs/:id/verify
exports.verifyPG = async (req, res) => {
  try {
    const pg = await PGStay.findById(req.params.id).populate("owner", "name _id");
    if (!pg) return res.status(404).json({ message: "PG not found" });

    pg.verificationStatus = "verified";
    await pg.save();

    await createNotification(
      pg.owner._id,
      `Your PG "${pg.name}" has been verified and is now live on the platform!`,
      "success"
    );

    res.json({ data: pg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/pgs/:id/restrict
exports.restrictPG = async (req, res) => {
  try {
    const pg = await PGStay.findById(req.params.id).populate("owner", "name _id");
    if (!pg) return res.status(404).json({ message: "PG not found" });

    pg.verificationStatus = "restricted";
    await pg.save();

    await createNotification(
      pg.owner._id,
      `Your PG "${pg.name}" has been restricted by admin. Please contact support.`,
      "alert"
    );

    res.json({ data: pg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/pgs/:id
exports.deletePGAdmin = async (req, res) => {
  try {
    const pg = await PGStay.findById(req.params.id);
    if (!pg) return res.status(404).json({ message: "PG not found" });

    await pg.deleteOne();
    await Room.deleteMany({ pgStay: req.params.id });

    res.json({ message: "PG deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/trustscores
exports.getTrustScores = async (req, res) => {
  try {
    const [pgs, users] = await Promise.all([
      PGStay.find({ isActive: true }).populate("owner", "name"),
      User.find({ isActive: true, role: { $in: ["tenant", "owner"] } }),
    ]);
    res.json({ data: { pgs, users } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/users/:id/suspend
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin")
      return res.status(400).json({ message: "Cannot suspend an admin" });

    user.isActive = false;
    user.trustScore = Math.max(0, user.trustScore - 20);
    await user.save();

    res.json({ data: user, message: "User suspended" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/users/:id/verify
exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.verificationStatus = "verified";
    user.trustScore = Math.min(100, user.trustScore + 20);
    user.profileCompletion = Math.min(100, user.profileCompletion + 20);
    await user.save();

    await createNotification(
      user._id,
      "Your identity has been verified! Your trust score has been updated.",
      "success"
    );

    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/system
exports.getSystemStats = async (req, res) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "Online" : "Offline";

    const [totalUsers, totalPGs, totalBookings, totalFeedback] = await Promise.all([
      User.countDocuments(),
      PGStay.countDocuments(),
      Application.countDocuments({ status: "Approved" }),
      Feedback.countDocuments(),
    ]);

    res.json({
      data: {
        serverStatus: "Online",
        dbStatus,
        totalUsers,
        totalPGs,
        totalBookings,
        totalFeedback,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/complaints
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("reportedBy", "name email")
      .populate("pgStay", "name")
      .sort({ createdAt: -1 });
    res.json({ data: complaints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/complaints/:id/resolve
exports.resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("pgStay", "name complaints");
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = "resolved";
    complaint.resolvedAt = new Date();
    await complaint.save();

    // Notify reporter
    await createNotification(
      complaint.reportedBy,
      `Your complaint about "${complaint.pgStay.name}" has been resolved.`,
      "success"
    );

    res.json({ data: complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/complaints/:id/reject
exports.rejectComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = "rejected";
    await complaint.save();

    res.json({ data: complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
