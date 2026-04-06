const Booking = require("../models/Booking");
const Application = require("../models/Application");
const Room = require("../models/Room");
const PGStay = require("../models/PGStay");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");
const sendEmail = require("../utils/sendEmail");

// ─── Helper: sync PG availableRooms count ───────────────────────────────────
async function syncPGAvailableRooms(pgStayId) {
  const count = await Room.countDocuments({ pgStay: pgStayId, availability: true });
  await PGStay.findByIdAndUpdate(pgStayId, { availableRooms: count });
}

// ─── Helper: auto-reject remaining approved apps for a room that is now full ─
async function autoRejectRoomApps(roomId, excludeApplicationId, pgStayName, pgOwnerId) {
  const others = await Application.find({
    room: roomId,
    status: "Approved",
    _id: { $ne: excludeApplicationId },
  })
    .populate("tenant", "name")
    .populate("pgStay", "name owner");

  for (const app of others) {
    app.status = "Rejected";
    app.message =
      `Your approved application for ${app.pgStay?.name || pgStayName} has been automatically ` +
      `rejected because the room is now fully occupied (another tenant booked the last slot). ` +
      `Please apply to another PG.`;
    await app.save();

    await createNotification(
      app.tenant._id,
      `Your approved application for ${app.pgStay?.name || pgStayName} was auto-rejected — ` +
        `the room reached full capacity. Please search for another PG.`,
      "alert"
    );

    await createNotification(
      app.pgStay?.owner || pgOwnerId,
      `The approved application from ${app.tenant.name} for ${app.pgStay?.name || pgStayName} ` +
        `was automatically rejected because the room is now fully occupied.`,
      "info"
    );
  }
}

// ─── Helper: auto-reject all OTHER approved apps a tenant holds (cross-PG) ──
async function autoRejectTenantOtherApps(tenantId, bookedApplicationId, tenantName) {
  const others = await Application.find({
    tenant: tenantId,
    status: "Approved",
    _id: { $ne: bookedApplicationId },
  }).populate("pgStay", "name owner");

  for (const app of others) {
    app.status = "Rejected";
    app.message =
      `Your approved application for ${app.pgStay?.name} has been automatically rejected ` +
      `because you confirmed a booking at another PG. You cannot hold active bookings in multiple PGs.`;
    await app.save();

    await createNotification(
      tenantId,
      `Your approved application for ${app.pgStay?.name} was auto-rejected — ` +
        `you already confirmed a booking at another PG.`,
      "alert"
    );

    await createNotification(
      app.pgStay.owner,
      `The approved application from ${tenantName} for ${app.pgStay?.name} was automatically ` +
        `rejected — the tenant confirmed a booking at another PG.`,
      "info"
    );
  }
}

// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { applicationId } = req.body;
    if (!applicationId)
      return res.status(400).json({ message: "Application ID is required" });

    const application = await Application.findById(applicationId)
      .populate("pgStay", "name owner")
      .populate("room", "roomType rent capacity currentOccupancy")
      .populate("tenant", "name email");

    if (!application)
      return res.status(404).json({ message: "Application not found" });

    if (application.tenant._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (application.status !== "Approved")
      return res.status(400).json({ message: "Only approved applications can be booked" });

    const existingBooking = await Booking.findOne({ application: application._id });
    if (existingBooking)
      return res.status(400).json({ message: "This application is already booked" });

    // ── FCFS guard: re-check live room capacity before creating booking ──────
    const room = await Room.findById(application.room._id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.currentOccupancy >= room.capacity) {
      // Room filled up — auto-reject this application and inform the tenant
      application.status = "Rejected";
      application.message =
        `Your approved application for ${application.pgStay.name} was automatically rejected ` +
        `because the room is now fully occupied (another tenant booked it first). ` +
        `Please apply to another PG.`;
      await application.save();

      await createNotification(
        req.user._id,
        `Your approved application for ${application.pgStay.name} was auto-rejected — ` +
          `the room reached full capacity before you confirmed. Please apply to another PG.`,
        "alert"
      );

      return res.status(409).json({
        message:
          "This room is now fully occupied — another tenant booked the last slot first. " +
          "Your application has been rejected. Please apply to another PG.",
      });
    }

    // ── Create booking ───────────────────────────────────────────────────────
    const booking = await Booking.create({
      application: application._id,
      tenant: req.user._id,
      pgStay: application.pgStay._id,
      room: application.room._id,
      rentAmount: application.rentAmount,
      allocationDate: new Date(),
      lastPaymentDate: new Date(),
      status: "Active",
    });

    // ── Update room occupancy & availability ─────────────────────────────────
    room.currentOccupancy += 1;
    await room.save();
    await Room.updateAvailability(application.room._id);
    await syncPGAvailableRooms(application.pgStay._id);

    // ── If room is now full → auto-reject remaining approved apps for this room
    if (room.currentOccupancy >= room.capacity) {
      await autoRejectRoomApps(
        application.room._id,
        application._id,
        application.pgStay.name,
        application.pgStay.owner
      );
    }

    // ── Mark this application as Booked ─────────────────────────────────────
    application.status = "Booked";
    await application.save();

    // ── Auto-reject ALL other approved apps this tenant has (cross-PG) ──────
    await autoRejectTenantOtherApps(req.user._id, application._id, req.user.name);

    // ── Success notifications ────────────────────────────────────────────────
    await createNotification(
      req.user._id,
      `Your booking for ${application.pgStay.name} is confirmed! Manage your stay from the PG management page.`,
      "success"
    );

    await createNotification(
      application.pgStay.owner,
      `${req.user.name} confirmed a booking for ${application.pgStay.name}.`,
      "info"
    );

    res.status(201).json({ data: booking });
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ tenant: req.user._id, status: "Active" })
      .populate("pgStay", "name location rent")
      .populate("room", "roomType rent")
      .sort({ createdAt: -1 });
    res.json({ data: bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/pg/:pgId/roommates
exports.getPGRoommates = async (req, res) => {
  try {
    const { pgId } = req.params;
    if (!pgId) return res.status(400).json({ message: "PG ID is required" });

    const activeBookings = await Booking.find({ pgStay: pgId, status: "Active" })
      .populate("tenant", "name profilePhotoUrl bio")
      .populate("room", "roomType rent capacity currentOccupancy availability roomNumber");

    const roommatesByRoom = {};
    activeBookings
      .filter((b) => b?.room?._id && b?.tenant)
      .forEach((booking) => {
        const roomId = booking.room._id.toString();
        if (!roommatesByRoom[roomId]) {
          roommatesByRoom[roomId] = { room: booking.room, tenants: [] };
        }
        roommatesByRoom[roomId].tenants.push(booking.tenant);
      });

    res.json({ data: Object.values(roommatesByRoom) });
  } catch (err) {
    console.error("getPGRoommates error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/owner
exports.getOwnerBookings = async (req, res) => {
  try {
    const ownerPGs = await PGStay.find({ owner: req.user._id }).select("_id");
    const pgIds = ownerPGs.filter((pg) => pg?._id).map((pg) => pg._id);

    const bookings = await Booking.find({ pgStay: { $in: pgIds }, status: "Active" })
      .populate("tenant", "name email trustScore profilePhotoUrl bio")
      .populate("pgStay", "name location")
      .populate("room", "roomType rent")
      .populate("application", "appliedDate")
      .sort({ createdAt: -1 });

    const bookingsWithDays = bookings
      .filter((b) => b != null)
      .map((booking) => {
        const joinDate = booking.agreementStartDate || booking.allocationDate;
        const daysElapsed = joinDate
          ? Math.floor((Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        const canCancel = daysElapsed >= 2;
        const daysRemaining = Math.max(0, 2 - daysElapsed);
        return { ...booking.toObject(), daysElapsed, canCancel, daysRemaining };
      });

    res.json({ data: bookingsWithDays });
  } catch (err) {
    console.error("getOwnerBookings error:", err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bookings/decline
exports.declineBooking = async (req, res) => {
  try {
    const { applicationId } = req.body;
    if (!applicationId)
      return res.status(400).json({ message: "Application ID is required" });

    const application = await Application.findById(applicationId)
      .populate("pgStay", "name owner")
      .populate("tenant", "name");

    if (!application)
      return res.status(404).json({ message: "Application not found" });

    if (application.tenant._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (application.status !== "Approved")
      return res.status(400).json({ message: "Only approved applications may be declined at this stage" });

    application.status = "Rejected";
    application.message = "Declined by tenant.";
    await application.save();

    // Room occupancy is only incremented at actual booking creation, not at
    // approval — so no decrement needed here. Just refresh availability.
    await Room.updateAvailability(application.room);
    await syncPGAvailableRooms(application.pgStay._id);

    await createNotification(
      req.user._id,
      `You declined the approved application for ${application.pgStay.name}. You may search for another PG.`,
      "alert"
    );

    await createNotification(
      application.pgStay.owner,
      `${req.user.name} declined the approved application for ${application.pgStay.name}. The slot is available for other tenants.`,
      "info"
    );

    res.json({ data: application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/:id/agreement
exports.updateBookingAgreement = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, tenant: req.user._id, status: "Active" });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const { agreementStartDate, agreementEndDate } = req.body;
    if (agreementStartDate) {
      if (booking.agreementStartDate)
        return res.status(400).json({ message: "Agreement start date is already finalized and cannot be changed" });
      booking.agreementStartDate = new Date(agreementStartDate);
    }
    if (agreementEndDate) {
      if (booking.agreementEndDate)
        return res.status(400).json({ message: "Agreement end date is already finalized and cannot be changed" });
      booking.agreementEndDate = new Date(agreementEndDate);
    }

    if (req.file) {
      booking.agreementDocument = {
        url: req.file.path,
        publicId: req.file.filename,
        fileType: req.file.mimetype === "application/pdf" ? "pdf" : "image",
      };
    }

    await booking.save();
    res.json({ data: booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/:id/pay
exports.payBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, tenant: req.user._id, status: "Active" })
      .populate("pgStay", "name");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.paymentStatus = "paid";
    booking.lastPaymentDate = new Date();
    await booking.save();

    await createNotification(req.user._id, `Payment recorded for ${booking.pgStay.name}. Next payment will be due in 30 days.`, "success");
    res.json({ data: booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bookings/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ message: "Booking ID is required" });

    const booking = await Booking.findOne({ _id: bookingId, tenant: req.user._id, status: "Active" })
      .populate("pgStay", "name owner")
      .populate("tenant", "name");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const joinDate = booking.agreementStartDate || booking.allocationDate;
    const daysElapsed = Math.floor((Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysElapsed >= 2) return res.status(400).json({ message: "Cannot cancel booking after 2 days" });

    booking.status = "Cancelled";
    await booking.save();

    if (booking.application) {
      const app = await Application.findById(booking.application);
      if (app) { app.status = "Cancelled"; app.message = "Booking was cancelled by tenant."; await app.save(); }
    }

    const room = await Room.findById(booking.room);
    if (room && room.currentOccupancy > 0) {
      room.currentOccupancy -= 1;
      await room.save();
      await Room.updateAvailability(booking.room);
    }

    await syncPGAvailableRooms(booking.pgStay._id);

    await createNotification(req.user._id, `Your booking for ${booking.pgStay.name} has been cancelled.`, "alert");
    await createNotification(booking.pgStay.owner, `${booking.tenant.name} cancelled their booking for ${booking.pgStay.name}.`, "info");

    res.json({ data: booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/:id/cancel-by-owner
exports.ownerCancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("pgStay", "name owner")
      .populate("tenant", "name email")
      .populate("room", "roomType");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.pgStay.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only the PG owner can cancel this booking" });

    if (booking.status === "Cancelled")
      return res.status(400).json({ message: "This booking is already cancelled" });

    const joinDate = booking.agreementStartDate || booking.allocationDate;
    const daysElapsed = Math.floor((Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysElapsed < 2) {
      const daysRemaining = 2 - daysElapsed;
      return res.status(400).json({
        message: `You can only cancel this booking after 2 days from the tenant's join date. ${daysRemaining} day(s) remaining.`,
        daysRemaining,
      });
    }

    booking.status = "Cancelled";
    await booking.save();

    const room = await Room.findById(booking.room);
    if (room && room.currentOccupancy > 0) {
      room.currentOccupancy -= 1;
      await room.save();
      await Room.updateAvailability(booking.room);
    }
    await syncPGAvailableRooms(booking.pgStay._id);

    await createNotification(req.user._id, `You cancelled the booking for ${booking.tenant.name} at ${booking.pgStay.name}.`, "alert");
    await createNotification(booking.tenant._id, `Your booking for ${booking.pgStay.name} has been cancelled by the owner. Please search for another PG.`, "alert");

    res.json({ data: booking, message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/:id/occupancy-dates
exports.updateOccupancyDates = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, tenant: req.user._id, status: "Active" }).populate("pgStay", "name owner");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const { occupancyStartDate, occupancyEndDate } = req.body;
    if (!occupancyStartDate || !occupancyEndDate)
      return res.status(400).json({ message: "Both occupancy start and end dates are required" });
    if (new Date(occupancyStartDate) >= new Date(occupancyEndDate))
      return res.status(400).json({ message: "Start date must be before end date" });

    booking.occupancyStartDate = new Date(occupancyStartDate);
    booking.occupancyEndDate = new Date(occupancyEndDate);
    await booking.save();
    res.json({ data: booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bookings/:id/payment-proof
exports.uploadPaymentProof = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, tenant: req.user._id, status: "Active" }).populate("pgStay", "name owner");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (!req.file) return res.status(400).json({ message: "Payment proof file is required" });

    booking.paymentProof = { url: req.file.path, publicId: req.file.filename, uploadedAt: new Date(), verificationStatus: "pending", verifiedBy: null, verifiedAt: null };
    booking.paymentStatus = "unpaid";
    await booking.save();

    await createNotification(booking.pgStay.owner, `Payment proof uploaded for ${booking.pgStay.name}. Please verify and update payment status.`, "alert", { booking: booking._id, documentUrl: booking.paymentProof.url });
    res.json({ data: booking, message: "Payment proof uploaded. Waiting for owner verification." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/:id/verify-payment (owner only)
exports.verifyPayment = async (req, res) => {
  try {
    const { verified } = req.body;
    if (typeof verified !== "boolean") return res.status(400).json({ message: "Verification status is required" });

    const booking = await Booking.findById(req.params.id).populate("pgStay", "name owner").populate("tenant", "name");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.pgStay.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only the PG owner can verify payments" });
    if (!booking.paymentProof.url) return res.status(400).json({ message: "No payment proof found" });

    booking.paymentProof.verificationStatus = verified ? "verified" : "rejected";
    booking.paymentProof.verifiedBy = req.user._id;
    booking.paymentProof.verifiedAt = new Date();

    if (verified) { booking.paymentStatus = "paid"; booking.lastPaymentDate = new Date(); }
    else { booking.paymentStatus = "unpaid"; booking.paymentProof = { url: "", publicId: "", uploadedAt: null, verificationStatus: "pending", verifiedBy: null, verifiedAt: null }; }

    await booking.save();
    const msg = verified ? `Payment verified for ${booking.pgStay.name}. Thank you!` : `Payment rejected for ${booking.pgStay.name}. Please upload valid proof.`;
    await createNotification(booking.tenant._id, msg, verified ? "success" : "alert");
    await createNotification(req.user._id, `Payment ${verified ? "verified" : "rejected"} for ${booking.tenant.name} at ${booking.pgStay.name}.`, "info");
    res.json({ data: booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};