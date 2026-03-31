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

    await createNotification(
      req.user._id,
      `Your booking for ${application.pgStay.name} is confirmed. Manage your stay from the PG management page.`,
      "success"
    );

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

    await Room.findByIdAndUpdate(application.room, { availability: true });
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
    if (agreementStartDate) booking.agreementStartDate = new Date(agreementStartDate);
    if (agreementEndDate) booking.agreementEndDate = new Date(agreementEndDate);

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