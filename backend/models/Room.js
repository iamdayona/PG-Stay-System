const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    pgStay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PGStay",
      required: true,
    },
    roomType: {
      type: String,
      required: true,
      enum: [
        "Single Room",
        "Double Room",
        "Triple Room",
        "Single AC Room",
        "Double AC Room",
        "Triple AC Room",
      ],
    },
    capacity: {
      type: Number,
      required: true,
      default: 1,
    },
    rent: {
      type: Number,
      required: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    occupiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", RoomSchema);