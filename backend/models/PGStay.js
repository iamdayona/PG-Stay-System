const mongoose = require("mongoose");

const PGStaySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "PG name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    rent: {
      type: Number,
      required: [true, "Rent is required"],
    },
    amenities: {
      type: [String],
      default: [],
    },
    trustScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "restricted"],
      default: "pending",
    },
    totalRooms: {
      type: Number,
      default: 0,
    },
    availableRooms: {
      type: Number,
      default: 0,
    },
    complaints: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PGStay", PGStaySchema);