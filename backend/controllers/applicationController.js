const Booking = require("../models/Booking");
const Room = require("../models/Room");
const PGStay = require("../models/PGStay");
const Notification = require("../models/Notification");

// Helper: create notification
const createNotification = async (userId, message, type = "info", bookingId = null) => {
  await Notification.create({
    user: userId,
    message,
    type,
    relatedBooking: bookingId,
  });
};

// @desc    Tenant applies for a room
// @route   POST /api/applications
// @access  Private (tenant)
exports.applyForRoom = async (req, res) => {
  try {
    const { pgStayId, roomId } = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (!room.availability)
      return res.status(400).json({ message: "Room is not available" });

    // Check if tenant already applied for this room
    const existing = await Booking.findOne({
      tenant: req.user.id,
      room: roomId,
      status: { $in: ["Pending", "Under Review", "Approved"] },
    });
    if (existing)
      return res.status(400).json({ message: "You already applied for this room" });

    const pg = await PGStay.findById(pgStayId).populate("owner");
    if (!pg) return res.status(404).json({ message: "PG Stay not found" });

    const booking = await Booking.create({
      tenant: req.user.id,
      pgStay: pgStayId,
      room: roomId,
      rentAmount: room.rent,
      status: "Pending",
    });

    // Notify tenant
    await createNotification(
      req.user.id,
      `Your application for ${pg.name} has been submitted successfully.`,
      "info",
      booking._id
    );

    // Notify owner
    await createNotification(
      pg.owner._id,
      `New application received from ${req.user.name} for ${pg.name}.`,
      "application",
      booking._id
    );

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tenant's own applications
// @route   GET /api/applications/my
// @access  Private (tenant)
exports.getMyApplications = async (req, res) => {
  try {
    const bookings = await Booking.find({ tenant: req.user.id })
      .populate("pgStay", "name location trustScore")
      .populate("room", "roomType rent")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get applications for owner's PG stays
// @route   GET /api/applications/owner
// @access  Private (owner)
exports.getOwnerApplications = async (req, res) => {
  try {
    const ownerPGs = await PGStay.find({ owner: req.user.id }).select("_id");
    const pgIds = ownerPGs.map((pg) => pg._id);

    const bookings = await Booking.find({ pgStay: { $in: pgIds } })
      .populate("tenant", "name email phone trustScore verificationStatus")
      .populate("pgStay", "name location")
      .populate("room", "roomType rent")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Owner approves application
// @route   PUT /api/applications/:id/approve
// @access  Private (owner)
exports.approveApplication = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("pgStay")
      .populate("room")
      .populate("tenant", "name");

    if (!booking) return res.status(404).json({ message: "Application not found" });

    if (booking.pgStay.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = "Approved";
    booking.allocationDate = new Date();
    await booking.save();

    // Mark room as unavailable
    await Room.findByIdAndUpdate(booking.room._id, {
      availability: false,
      occupiedBy: booking.tenant._id,
    });

    // Sync available rooms on PG
    const allRooms = await Room.find({ pgStay: booking.pgStay._id });
    const available = allRooms.filter((r) => r.availability).length;
    await PGStay.findByIdAndUpdate(booking.pgStay._id, { availableRooms: available });

    // Notify tenant
    await createNotification(
      booking.tenant._id,
      `Your application to ${booking.pgStay.name} has been approved! Room allocated successfully.`,
      "success",
      booking._id
    );

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Owner rejects application
// @route   PUT /api/applications/:id/reject
// @access  Private (owner)
exports.rejectApplication = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("pgStay")
      .populate("tenant", "name");

    if (!booking) return res.status(404).json({ message: "Application not found" });

    if (booking.pgStay.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = "Rejected";
    await booking.save();

    // Notify tenant
    await createNotification(
      booking.tenant._id,
      `Your application to ${booking.pgStay.name} was not approved this time.`,
      "alert",
      booking._id
    );

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applications (admin)
// @route   GET /api/applications/all
// @access  Private (admin)
exports.getAllApplications = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("tenant", "name email trustScore")
      .populate("pgStay", "name location")
      .populate("room", "roomType rent")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};