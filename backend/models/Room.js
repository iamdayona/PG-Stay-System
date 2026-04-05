const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    pgStay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PGStay",
      required: true,
    },
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },
    roomType: {
      type: String,
      required: [true, "Room type is required"],
      trim: true,
    },
    rent: {
      type: Number,
      required: [true, "Rent is required"],
    },
    capacity: {
      type: Number,
      default: 1,
    },
    currentOccupancy: {
      type: Number,
      default: 0,
    },
    availability: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure roomNumber is unique within each PG
RoomSchema.index({ pgStay: 1, roomNumber: 1 }, { unique: true });

// Static method to update room availability based on capacity
RoomSchema.statics.updateAvailability = async function (roomId) {
  const room = await this.findById(roomId);
  if (!room) return;

  const isAvailable = room.currentOccupancy < room.capacity;
  if (room.availability !== isAvailable) {
    room.availability = isAvailable;
    await room.save();
  }
  return room;
};

module.exports = mongoose.model("Room", RoomSchema);
