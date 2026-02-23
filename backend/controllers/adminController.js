const User = require("../models/User");
const PGStay = require("../models/PGStay");
const Booking = require("../models/Booking");
const Feedback = require("../models/Feedback");
const Notification = require("../models/Notification");

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
    const totalPGs = await PGStay.countDocuments();
    const pendingVerifications = await PGStay.countDocuments({ verificationStatus: "pending" });
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: "Approved" });

    // Recent system activity
    const recentPGs = await PGStay.find({ verificationStatus: "pending" })
      .populate("owner", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPGs,
        pendingVerifications,
        totalBookings,
        activeBookings,
        recentPGs,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all PG stays with verification status
// @route   GET /api/admin/pgs
// @access  Private (admin)
exports.getAllPGsAdmin = async (req, res) => {
  try {
    const pgs = await PGStay.find()
      .populate("owner", "name email phone trustScore")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: pgs.length, data: pgs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify a PG stay
// @route   PUT /api/admin/pgs/:id/verify
// @access  Private (admin)
exports.verifyPG = async (req, res) => {
  try {
    const pg = await PGStay.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: "verified" },
      { new: true }
    ).populate("owner", "name");

    if (!pg) return res.status(404).json({ message: "PG Stay not found" });

    // Notify owner
    await Notification.create({
      user: pg.owner._id,
      message: `Your PG Stay '${pg.name}' has been verified by admin.`,
      type: "success",
    });

    res.json({ success: true, data: pg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Restrict a PG stay
// @route   PUT /api/admin/pgs/:id/restrict
// @access  Private (admin)
exports.restrictPG = async (req, res) => {
  try {
    const pg = await PGStay.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: "restricted", isActive: false },
      { new: true }
    ).populate("owner", "name");

    if (!pg) return res.status(404).json({ message: "PG Stay not found" });

    // Notify owner
    await Notification.create({
      user: pg.owner._id,
      message: `Your PG Stay '${pg.name}' has been restricted by admin. Please contact support.`,
      type: "alert",
    });

    res.json({ success: true, data: pg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a PG stay (admin)
// @route   DELETE /api/admin/pgs/:id
// @access  Private (admin)
exports.deletePGAdmin = async (req, res) => {
  try {
    const pg = await PGStay.findByIdAndDelete(req.params.id);
    if (!pg) return res.status(404).json({ message: "PG Stay not found" });
    res.json({ success: true, message: "PG Stay deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all trust scores (admin)
// @route   GET /api/admin/trustscores
// @access  Private (admin)
exports.getTrustScores = async (req, res) => {
  try {
    const pgs = await PGStay.find()
      .select("name trustScore verificationStatus complaints owner")
      .populate("owner", "name trustScore");

    const users = await User.find({ role: { $ne: "admin" } })
      .select("name role trustScore verificationStatus");

    res.json({ success: true, data: { pgs, users } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Suspend user account
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (admin)
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    await Notification.create({
      user: user._id,
      message: "Your account has been suspended. Please contact admin for support.",
      type: "alert",
    });

    res.json({ success: true, message: "User suspended", data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify user identity
// @route   PUT /api/admin/users/:id/verify
// @access  Private (admin)
exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: "verified", profileCompletion: 100 },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    await Notification.create({
      user: user._id,
      message: "Your identity has been verified. Your profile is now fully verified.",
      type: "success",
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get system monitoring stats
// @route   GET /api/admin/system
// @access  Private (admin)
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPGs = await PGStay.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalFeedback = await Feedback.countDocuments();

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPGs,
        totalBookings,
        totalFeedback,
        serverStatus: "Operational",
        dbStatus: "Connected",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};