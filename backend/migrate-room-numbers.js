const mongoose = require("mongoose");
const Room = require("./models/Room");
const PGStay = require("./models/PGStay");
require("dotenv").config();

async function migrateRoomNumbers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get all PGs
    const pgs = await PGStay.find({});
    console.log(`Found ${pgs.length} PGs`);

    for (const pg of pgs) {
      console.log(`Processing PG: ${pg.name} (${pg._id})`);

      // Get all rooms for this PG
      const rooms = await Room.find({ pgStay: pg._id }).sort({ createdAt: 1 });
      console.log(`Found ${rooms.length} rooms`);

      for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        if (!room.roomNumber) {
          const roomNumber = `R${i + 1}`;
          room.roomNumber = roomNumber;
          await room.save();
          console.log(`Assigned ${roomNumber} to room ${room._id}`);
        } else {
          console.log(`Room ${room._id} already has roomNumber: ${room.roomNumber}`);
        }
      }
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

migrateRoomNumbers();