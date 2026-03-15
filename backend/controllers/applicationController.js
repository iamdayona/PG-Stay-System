const Application = require("../models/Application");
const Room = require("../models/Room");
const PGStay = require("../models/PGStay");
const createNotification = require("../utils/createNotification");

// POST /api/applications
exports.applyForRoom = async (req, res) => {
  try {
    const { pgStayId, roomId } = req.body;

    if (!pgStayId || !roomId)
      return res.status(400).json({ message: "PG Stay and Room are required" });

    // Check room exists and is available
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (!room.availability)
      return res.status(400).json({ message: "This room is not available" });

    // Prevent duplicate active application
    const existing = await Application.findOne({
      tenant: req.user._id,
      pgStay: pgStayId,
      status: { $in: ["Pending", "Under Review", "Approved"] },
    });
    if (existing)
      return res.status(400).json({ message: "You already have an active application for this PG" });

    const pg = await PGStay.findById(pgStayId).populate("owner", "name");
    if (!pg) return res.status(404).json({ message: "PG not found" });

    const application = await Application.create({
      tenant: req.user._id,
      pgStay: pgStayId,
      room: roomId,
      rentAmount: room.rent,
    });

    // Notify the PG owner
    await createNotification(
      pg.owner._id,
      `New application from ${req.user.name} for ${pg.name}`,
      "application"
    );

    // Notify the tenant
    await createNotification(
      req.user._id,
      `Your application for ${pg.name} has been submitted successfully`,
      "info"
    );

    res.status(201).json({ data: application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/applications/my  (tenant)
exports.getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ tenant: req.user._id })
      .populate("pgStay", "name location rent trustScore")
      .populate("room", "roomType rent")
      .sort({ createdAt: -1 });
    res.json({ data: apps });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/applications/owner  (owner)
exports.getOwnerApplications = async (req, res) => {
  try {
    // Get all PGs owned by this user
    const ownerPGs = await PGStay.find({ owner: req.user._id }).select("_id");
    const pgIds = ownerPGs.map((pg) => pg._id);

    const apps = await Application.find({ pgStay: { $in: pgIds } })
      .populate("tenant", "name email trustScore verificationStatus")
      .populate("pgStay", "name location")
      .populate("room", "roomType rent")
      .sort({ createdAt: -1 });

    res.json({ data: apps });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/applications/all  (admin)
exports.getAllApplications = async (req, res) => {
  try {
    const apps = await Application.find()
      .populate("tenant", "name email")
      .populate("pgStay", "name location")
      .populate("room", "roomType")
      .sort({ createdAt: -1 });
    res.json({ data: apps });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/applications/:id/approve  (owner)
exports.approveApplication = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate("pgStay", "name owner")
      .populate("tenant", "name")
      .populate("room");

    if (!app) return res.status(404).json({ message: "Application not found" });

    // Only the PG owner can approve
    if (app.pgStay.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (app.status !== "Pending" && app.status !== "Under Review")
      return res.status(400).json({ message: "Application cannot be approved in its current state" });

    app.status = "Approved";
    await app.save();

    // Mark room as occupied
    await Room.findByIdAndUpdate(app.room._id, { availability: false });

    // Sync availableRooms on PG
    const availableRooms = await Room.countDocuments({
      pgStay: app.pgStay._id,
      availability: true,
    });
    await PGStay.findByIdAndUpdate(app.pgStay._id, { availableRooms });

    // Notify tenant
    await createNotification(
      app.tenant._id,
      `Your application for ${app.pgStay.name} has been approved! Welcome aboard.`,
      "success"
    );

    res.json({ data: app });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/applications/:id/reject  (owner)
exports.rejectApplication = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate("pgStay", "name owner")
      .populate("tenant", "name");

    if (!app) return res.status(404).json({ message: "Application not found" });

    if (app.pgStay.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    app.status = "Rejected";
    await app.save();

    // Notify tenant
    await createNotification(
      app.tenant._id,
      `Your application for ${app.pgStay.name} was not approved. Try applying to other PGs!`,
      "alert"
    );

    res.json({ data: app });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
