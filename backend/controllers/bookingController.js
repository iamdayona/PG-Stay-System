const Booking = require("../models/Booking");
const Application = require("../models/Application");
const Room = require("../models/Room");
const PGStay = require("../models/PGStay");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");
const sendEmail = require("../utils/sendEmail");

// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { applicationId } = req.body;
    if (!applicationId)
      return res.status(400).json({ message: "Application ID is required" });

    const application = await Application.findById(applicationId)
      .populate("pgStay", "name owner")
      .populate("room", "roomType rent")
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

    // Update room occupancy and availability
    const room = await Room.findById(application.room._id);
    room.currentOccupancy += 1;
    await room.save();
    await Room.updateAvailability(application.room._id);

    // Sync availableRooms count on PG
    const availableRooms = await Room.countDocuments({
      pgStay: application.pgStay._id,
      availability: true,
    });
    await PGStay.findByIdAndUpdate(application.pgStay._id, { availableRooms });

    // If room is now full, reject all other approved applications for this room
    if (room.currentOccupancy >= room.capacity) {
      const otherApprovedAppsForRoom = await Application.find({
        room: application.room._id,
        status: "Approved",
        _id: { $ne: application._id }, // Exclude current application
      }).populate("pgStay", "name").populate("tenant", "name");

      for (const app of otherApprovedAppsForRoom) {
        app.status = "Rejected";
        app.message = `Room capacity reached. Another tenant booked this room first.`;
        await app.save();

        // Notify tenant about auto-rejection due to capacity
        await createNotification(
          app.tenant._id,
          `Your approved application for ${app.pgStay.name} was automatically cancelled because the room capacity was reached by another tenant.`,
          "alert"
        );

        // Notify PG owner about auto-rejection
        await createNotification(
          app.pgStay.owner,
          `The approved application from ${app.tenant.name} for ${app.pgStay.name} was automatically cancelled due to room capacity being reached.`,
          "info"
        );
      }
    }

    // Auto-reject other approved applications by this tenant
    const otherApprovedApps = await Application.find({
      tenant: req.user._id,
      status: "Approved",
      _id: { $ne: application._id }, // Exclude current application
    }).populate("pgStay", "name owner");

    for (const app of otherApprovedApps) {
      app.status = "Rejected";
      await app.save();

      // Notify tenant about auto-rejection
      await createNotification(
        req.user._id,
        `Your approved application for ${app.pgStay.name} was automatically cancelled because you booked another PG.`,
        "alert"
      );

      // Notify PG owner about auto-rejection
      await createNotification(
        app.pgStay.owner,
        `The approved application from ${req.user.name} for ${app.pgStay.name} was automatically cancelled as they booked another property.`,
        "info"
      );
    }

    await createNotification(
      req.user._id,
      `Your booking for ${application.pgStay.name} is confirmed. Manage your stay from the PG management page.`,
      "success"
    );

    application.status = "Booked";
    await application.save();

    await createNotification(
      application.pgStay.owner,
      `${req.user.name} confirmed a booking for ${application.pgStay.name}.`,
      "info"
    );

    res.status(201).json({ data: booking });
  } catch (err) {
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
      .filter(booking => booking?.room?._id && booking?.tenant) // Filter out invalid bookings
      .forEach((booking) => {
        const roomId = booking.room._id.toString();
        if (!roommatesByRoom[roomId]) {
          roommatesByRoom[roomId] = {
            room: booking.room,
            tenants: []
          };
        }
        roommatesByRoom[roomId].tenants.push(booking.tenant);
      });

    res.json({ data: Object.values(roommatesByRoom) });
  } catch (err) {
    console.error('Error in getPGRoommates:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/owner (owner only)
exports.getOwnerBookings = async (req, res) => {
  try {
    // Get all PGs owned by this user
    const ownerPGs = await PGStay.find({ owner: req.user._id }).select("_id");
    const pgIds = ownerPGs.filter(pg => pg?._id).map((pg) => pg._id);

    const bookings = await Booking.find({ pgStay: { $in: pgIds }, status: "Active" })
      .populate("tenant", "name email trustScore profilePhotoUrl bio")
      .populate("pgStay", "name location")
      .populate("room", "roomType rent")
      .populate("application", "appliedDate")
      .sort({ createdAt: -1 });

    // Calculate days remaining until cancellation is allowed
    const bookingsWithDays = bookings
      .filter(booking => booking != null) // Filter out null bookings
      .map((booking) => {
        const joinDate = booking.agreementStartDate || booking.allocationDate;
        const daysElapsed = joinDate ? Math.floor((Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
        const canCancel = daysElapsed >= 2;
        const daysRemaining = Math.max(0, 2 - daysElapsed);

        return {
          ...booking.toObject(),
          daysElapsed,
          canCancel,
          daysRemaining,
        };
      });

    res.json({ data: bookingsWithDays });
  } catch (err) {
    console.error('Error in getOwnerBookings:', err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bookings/decline
exports.declineBooking = async (req, res) => {
  try {
    const { applicationId } = req.body;
    if (!applicationId)
      return res.status(400).json({ message: "Application ID is required" });

    const application = await Application.findById(applicationId).populate("pgStay", "name");
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    if (application.tenant.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (application.status !== "Approved")
      return res.status(400).json({ message: "Only approved applications may be declined at this stage" });

    application.status = "Rejected";
    await application.save();

    // Update room occupancy and availability
    const room = await Room.findById(application.room);
    if (room && room.currentOccupancy > 0) {
      room.currentOccupancy -= 1;
      await room.save();
      await Room.updateAvailability(application.room);
    }

    const availableRooms = await Room.countDocuments({ pgStay: application.pgStay, availability: true });
    await PGStay.findByIdAndUpdate(application.pgStay, { availableRooms });

    await createNotification(
      req.user._id,
      `You declined the booking for ${application.pgStay.name}. You may search for another PG.`,
      "alert"
    );

    await createNotification(
      application.pgStay.owner,
      `${req.user.name} declined the approved booking for ${application.pgStay.name}.`,
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
      if (booking.agreementStartDate) return res.status(400).json({ message: "Agreement start date is already finalized and cannot be changed" });
      booking.agreementStartDate = new Date(agreementStartDate);
    }
    if (agreementEndDate) {
      if (booking.agreementEndDate) return res.status(400).json({ message: "Agreement end date is already finalized and cannot be changed" });
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

    await createNotification(
      req.user._id,
      `Your agreement details for ${booking.pgStay.name} were updated successfully.`,
      "success"
    );

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

    await createNotification(
      req.user._id,
      `Payment recorded for ${booking.pgStay.name}. Next payment will be due in 30 days.`,
      "success"
    );

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

    // Check if can cancel (within 2 days of join date)
    const joinDate = booking.agreementStartDate || booking.allocationDate;
    const daysElapsed = Math.floor((Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysElapsed >= 2) return res.status(400).json({ message: "Cannot cancel booking after 2 days" });

    booking.status = "Cancelled";
    await booking.save();

    // Mark related application as cancelled so it doesn't remain in active list and tenant can reapply
    if (booking.application) {
      const app = await Application.findById(booking.application);
      if (app) {
        app.status = "Cancelled";
        app.message = "Booking was cancelled by tenant.";
        await app.save();
      }
    }

    // Update room occupancy
    const room = await Room.findById(booking.room);
    if (room && room.currentOccupancy > 0) {
      room.currentOccupancy -= 1;
      await room.save();
      await Room.updateAvailability(booking.room);
    }

    const availableRooms = await Room.countDocuments({ pgStay: booking.pgStay._id, availability: true });
    await PGStay.findByIdAndUpdate(booking.pgStay._id, { availableRooms });

    await createNotification(
      req.user._id,
      `Your booking for ${booking.pgStay.name} has been cancelled.`,
      "alert"
    );

    await createNotification(
      booking.pgStay.owner,
      `${booking.tenant.name} cancelled their booking for ${booking.pgStay.name}.`,
      "info"
    );

    res.json({ data: booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/:id/cancel-by-owner (owner only)
exports.ownerCancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("pgStay", "name owner")
      .populate("tenant", "name email")
      .populate("room", "roomType");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Verify owner is cancelling their own PG's booking
    if (booking.pgStay.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only the PG owner can cancel this booking" });

    if (booking.status === "Cancelled")
      return res.status(400).json({ message: "This booking is already cancelled" });

    // Check if 2 days have passed since agreementStartDate
    const joinDate = booking.agreementStartDate || booking.allocationDate;
    const daysElapsed = Math.floor((Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24));

    if (daysElapsed < 2) {
      const daysRemaining = 2 - daysElapsed;
      return res.status(400).json({
        message: `You can only cancel this booking after 2 days from the tenant's join date. ${daysRemaining} day(s) remaining.`,
        daysRemaining,
      });
    }

    // Cancel the booking
    booking.status = "Cancelled";
    await booking.save();

    // Update room occupancy and availability
    const room = await Room.findById(booking.room);
    if (room && room.currentOccupancy > 0) {
      room.currentOccupancy -= 1;
      await room.save();
      await Room.updateAvailability(booking.room);
    }

    // Sync availableRooms on PG
    const availableRooms = await Room.countDocuments({
      pgStay: booking.pgStay._id,
      availability: true,
    });
    await PGStay.findByIdAndUpdate(booking.pgStay._id, { availableRooms });

    // Notify both parties
    await createNotification(
      req.user._id,
      `You cancelled the booking for ${booking.tenant.name} at ${booking.pgStay.name}.`,
      "alert"
    );

    await createNotification(
      booking.tenant._id,
      `Your booking for ${booking.pgStay.name} has been cancelled by the owner. Please search for another PG.`,
      "alert"
    );

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

    await createNotification(
      req.user._id,
      `Occupancy dates for ${booking.pgStay.name} have been updated.`,
      "success"
    );

    await createNotification(
      booking.pgStay.owner,
      `Occupancy dates for the booking at ${booking.pgStay.name} have been updated by the tenant.`,
      "info"
    );

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

    booking.paymentProof = {
      url: req.file.path,
      publicId: req.file.filename,
      uploadedAt: new Date(),
      verificationStatus: "pending",
      verifiedBy: null,
      verifiedAt: null,
    };
    booking.paymentStatus = "unpaid"; // waiting for owner verification
    await booking.save();

    await createNotification(
      booking.pgStay.owner,
      `Payment proof uploaded for ${booking.pgStay.name}. Please verify and update payment status.`,
      "alert",
      { booking: booking._id, documentUrl: booking.paymentProof.url }
    );

    res.json({ data: booking, message: "Payment proof uploaded. Waiting for owner verification." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/:id/verify-payment (owner only)
exports.verifyPayment = async (req, res) => {
  try {
    const { verified } = req.body; // true = verified, false = rejected
    if (typeof verified !== "boolean") return res.status(400).json({ message: "Verification status is required" });

    const booking = await Booking.findById(req.params.id)
      .populate("pgStay", "name owner")
      .populate("tenant", "name");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Verify owner is verifying their own PG's booking
    if (booking.pgStay.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only the PG owner can verify payments" });

    if (!booking.paymentProof.url) return res.status(400).json({ message: "No payment proof found" });

    booking.paymentProof.verificationStatus = verified ? "verified" : "rejected";
    booking.paymentProof.verifiedBy = req.user._id;
    booking.paymentProof.verifiedAt = new Date();

    if (verified) {
      booking.paymentStatus = "paid";
      booking.lastPaymentDate = new Date();
    } else {
      booking.paymentStatus = "unpaid";
      booking.paymentProof = {
        url: "",
        publicId: "",
        uploadedAt: null,
        verificationStatus: "pending",
        verifiedBy: null,
        verifiedAt: null,
      };
    }

    await booking.save();

    const message = verified
      ? `Payment verified for ${booking.pgStay.name}. Thank you!`
      : `Payment rejected for ${booking.pgStay.name}. Please upload valid proof.`;

    await createNotification(booking.tenant._id, message, verified ? "success" : "alert");

    await createNotification(
      req.user._id,
      `Payment ${verified ? "verified" : "rejected"} for ${booking.tenant.name} at ${booking.pgStay.name}.`,
      "info"
    );

    res.json({ data: booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};