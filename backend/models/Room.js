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
      required: [true, "Room type is required"],
      trim: true,
    },
    rent: {
      type: Number,
      required: [true, "Rent is required"],
    }
    capacity: {
      type: Number,
      default: 1,
    },
    availability: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", RoomSchema);
