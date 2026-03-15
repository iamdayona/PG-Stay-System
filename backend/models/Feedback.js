const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

// One feedback per tenant per PG
FeedbackSchema.index({ tenant: 1, pgStay: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", FeedbackSchema);
