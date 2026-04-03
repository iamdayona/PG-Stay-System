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
      enum: ["Active", "Cancelled", "Completed"],
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
      enum: ["unpaid", "pending", "paid", "due", "overdue"],
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
    paymentProof: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      uploadedAt: { type: Date, default: null },
      verificationStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      verifiedAt: { type: Date, default: null },
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