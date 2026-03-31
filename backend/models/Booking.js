const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
    },
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
      enum: ["Active", "Cancelled"],
      default: "Active",
    },
    allocationDate: {
      type: Date,
      default: Date.now,
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
      default: Date.now,
    },
    lastReminderSent: {
      type: Date,
      default: null,
    },
    agreementStartDate: {
      type: Date,
    },
    agreementEndDate: {
      type: Date,
    },
    agreementDocument: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      fileType: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);