const Booking = require("../models/Booking");
const createNotification = require("./createNotification");
const sendEmail = require("./sendEmail");

const DAYS_PER_MONTH = 30;
const OVERDUE_GRACE_DAYS = 7;

const sameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  return d1.toDateString() === d2.toDateString();
};

exports.checkDuePayments = async () => {
  try {
    const today = new Date();
    const bookings = await Booking.find({ status: "Active" })
      .populate("tenant", "name email")
      .populate("pgStay", "name");

    for (const booking of bookings) {
      const lastPaid = booking.lastPaymentDate || booking.allocationDate || booking.createdAt;
      if (!lastPaid) continue;

      const nextDue = new Date(lastPaid);
      nextDue.setDate(nextDue.getDate() + DAYS_PER_MONTH);

      if (today < nextDue) continue;
      if (booking.lastReminderSent && sameDay(booking.lastReminderSent, today)) continue;

      const overdueDate = new Date(nextDue);
      overdueDate.setDate(overdueDate.getDate() + OVERDUE_GRACE_DAYS);
      const isOverdue = today > overdueDate;
      const newStatus = isOverdue ? "overdue" : "unpaid";
      booking.paymentStatus = newStatus;
      booking.lastReminderSent = today;
      await booking.save();

      const message = `Rent reminder for ${booking.pgStay.name}: ₹${booking.rentAmount} is due on ${nextDue.toLocaleDateString()}. Please pay by the due date to avoid delay.`;
      await createNotification(booking.tenant._id, message, "alert");

      if (booking.tenant.email) {
        await sendEmail({
          to: booking.tenant.email,
          subject: "PGStay Monthly Rent Reminder",
          text: message,
          html: `<p>${message}</p>`,
        });
      }
    }
  } catch (err) {
    console.error("Payment reminder error:", err.message);
  }
};
