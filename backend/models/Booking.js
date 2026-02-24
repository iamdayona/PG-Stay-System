const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pgStay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PGStay",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Under Review", "Approved", "Rejected"],
      default: "Pending",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    allocationDate: {
      type: Date,
      default: null,
    },
    rentAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "overdue"],
      default: "unpaid",
    },
    lastPaymentDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);