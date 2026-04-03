const Booking = require("../models/Booking");
const createNotification = require("./createNotification");

const checkExpiredBookings = async () => {
  try {
    const now = new Date();
    const expiredBookings = await Booking.find({
      status: "Active",
      agreementEndDate: { $lte: now }
    }).populate("tenant", "name").populate("pgStay", "name");

    for (const booking of expiredBookings) {
      booking.status = "Completed";
      await booking.save();

      await createNotification(
        booking.tenant._id,
        `Your agreement end date for ${booking.pgStay.name} has been reached. You can now book another PG.`,
        "info"
      );
    }
  } catch (err) {
    console.error("Error checking expired bookings:", err);
  }
};

module.exports = checkExpiredBookings;