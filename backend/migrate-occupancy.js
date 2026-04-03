const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Room = require("./models/Room");
const Booking = require("./models/Booking");

const connectDB = require("./config/db");

const migrateRoomOccupancy = async () => {
  await connectDB();

  console.log("Starting room occupancy migration...");

  try {
    // Get all rooms
    const rooms = await Room.find();

    for (const room of rooms) {
      // Count active bookings for this room
      const activeBookingCount = await Booking.countDocuments({
        room: room._id,
        status: "Active"
      });

      // Update currentOccupancy
      room.currentOccupancy = activeBookingCount;
      await room.save();

      // Update availability based on new occupancy
      await Room.updateAvailability(room._id);

      console.log(`Updated room ${room._id}: occupancy = ${activeBookingCount}, available = ${room.availability}`);
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    mongoose.connection.close();
  }
};

migrateRoomOccupancy();