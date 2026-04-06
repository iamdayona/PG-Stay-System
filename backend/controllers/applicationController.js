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

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (!room.availability)
      return res.status(400).json({ message: "This room is not available" });

    // Prevent duplicate active application for same PG
    const existing = await Application.findOne({
      tenant: req.user._id,
      pgStay: pgStayId,
      status: { $in: ["Pending", "Approved"] },
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

    await createNotification(
      pg.owner._id,
      `New application from ${req.user.name} for ${pg.name}`,
      "application"
    );

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
    const apps = await Application.find({
      tenant: req.user._id,
      status: { $in: ["Pending", "Approved"] },
    })
      .populate("pgStay", "name location rent trustScore")
      .populate("room", "roomType rent capacity currentOccupancy")
      .sort({ createdAt: -1 });
    res.json({ data: apps });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/applications/owner  (owner)
exports.getOwnerApplications = async (req, res) => {
  try {
    const ownerPGs = await PGStay.find({ owner: req.user._id }).select("_id");
    const pgIds = ownerPGs.map((pg) => pg._id);

    const apps = await Application.find({ pgStay: { $in: pgIds } })
      .populate("tenant", "name email trustScore verificationStatus")
      .populate("pgStay", "name location")
      .populate("room", "roomType rent capacity currentOccupancy")
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

    if (app.pgStay.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (app.status !== "Pending")
      return res.status(400).json({ message: "Application cannot be approved in its current state" });

    app.status = "Approved";
    await app.save();

    // ── For single-capacity rooms: when owner approves one tenant, auto-reject
    // all other PENDING applications for the same room so the owner isn't
    // bombarded with stale requests.  For multi-capacity rooms we leave pending
    // apps open until occupancy actually fills up at booking time.
    const room = await Room.findById(app.room._id);
    const remainingSlots = room ? room.capacity - room.currentOccupancy : 1;

    if (room && remainingSlots <= 1) {
      // Only one slot left (or it's single capacity) — reject all other pending apps for this room
      const pendingOthers = await Application.find({
        room: app.room._id,
        status: "Pending",
        _id: { $ne: app._id },
      })
        .populate("tenant", "name")
        .populate("pgStay", "name owner");

      for (const other of pendingOthers) {
        other.status = "Rejected";
        other.message =
          `Your application for ${other.pgStay?.name || app.pgStay.name} has been rejected ` +
          `because the room's last available slot was approved for another tenant.`;
        await other.save();

        await createNotification(
          other.tenant._id,
          `Your application for ${other.pgStay?.name || app.pgStay.name} was rejected — ` +
            `the room's last slot was given to another applicant. Please try another PG.`,
          "alert"
        );
      }
    }

    // Notify the approved tenant
    await createNotification(
      app.tenant._id,
      `Your application for ${app.pgStay.name} has been approved! Please confirm your booking from PG Management.`,
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
    app.message = req.body.message || "Your application was not approved by the owner.";
    await app.save();

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