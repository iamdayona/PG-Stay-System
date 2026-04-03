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
    const dayOfMonth = today.getDate();
    const monthEndDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    const bookings = await Booking.find({ status: "Active" })
      .populate("tenant", "name email")
      .populate("pgStay", "name");

    for (const booking of bookings) {
      if (booking.agreementEndDate && today > new Date(booking.agreementEndDate)) continue;

      // At start of new billing cycle, reset to unpaid if previously paid
      if (booking.paymentStatus === "paid") {
        const lastPaid = booking.lastPaymentDate || booking.allocationDate || booking.createdAt;
        if (lastPaid) {
          const lastPaidMonth = new Date(lastPaid).getMonth();
          const lastPaidYear = new Date(lastPaid).getFullYear();
          if (lastPaidYear < today.getFullYear() || lastPaidMonth < today.getMonth()) {
            booking.paymentStatus = "unpaid";
            booking.paymentProof = {
              url: "",
              publicId: "",
              uploadedAt: null,
              verificationStatus: "pending",
              verifiedBy: null,
              verifiedAt: null,
            };
            await booking.save();
          }
        }
      }

      // 25th reminder
      if (dayOfMonth === 25 && booking.paymentStatus !== "paid") {
        if (!booking.lastReminderSent || !sameDay(booking.lastReminderSent, today)) {
          const message = `Monthly rent reminder for ${booking.pgStay.name}: Please upload your rent payment proof by the end of this month.`;
          booking.lastReminderSent = today;
          await booking.save();
          await createNotification(booking.tenant._id, message, "alert", { booking: booking._id });
          if (booking.tenant.email) {
            await sendEmail({
              to: booking.tenant.email,
              subject: "PGStay Rent Reminder",
              text: message,
              html: `<p>${message}</p>`,
            });
          }
        }
      }

      // End of month due update
      if (dayOfMonth === monthEndDay && booking.paymentStatus !== "paid") {
        if (booking.paymentStatus !== "due" && booking.paymentStatus !== "overdue") {
          booking.paymentStatus = "due";
          await booking.save();
          const dueMessage = `Your payment for ${booking.pgStay.name} is now due. Please upload proof or contact the owner.`;
          await createNotification(booking.tenant._id, dueMessage, "alert", { booking: booking._id });
          if (booking.tenant.email) {
            await sendEmail({
              to: booking.tenant.email,
              subject: "PGStay Payment Due",
              text: dueMessage,
              html: `<p>${dueMessage}</p>`,
            });
          }
        }
      }

    }
  } catch (err) {
    console.error("Payment reminder error:", err.message);
  }
};
