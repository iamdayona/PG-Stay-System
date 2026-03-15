const Room = require("../models/Room");
const PGStay = require("../models/PGStay");

// GET /api/rooms/:pgId
exports.getRoomsByPG = async (req, res) => {
  try {
    const rooms = await Room.find({ pgStay: req.params.pgId });
    res.json({ data: rooms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/rooms/:pgId
exports.addRoom = async (req, res) => {
  try {
    const pg = await PGStay.findById(req.params.pgId);
    if (!pg) return res.status(404).json({ message: "PG not found" });

    if (pg.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const { roomType, rent, capacity, availability } = req.body;
    if (!roomType || !rent)
      return res.status(400).json({ message: "Room type and rent are required" });

    const room = await Room.create({
      pgStay: req.params.pgId,
      roomType,
      rent: Number(rent),
      capacity: capacity || 1,
      availability: availability !== undefined ? availability : true,
    });

    // Update totalRooms and availableRooms on PG
    const totalRooms = await Room.countDocuments({ pgStay: pg._id });
    const availableRooms = await Room.countDocuments({ pgStay: pg._id, availability: true });
    await PGStay.findByIdAndUpdate(pg._id, { totalRooms, availableRooms });

    res.status(201).json({ data: room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/rooms/:roomId
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId).populate("pgStay");
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.pgStay.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const { roomType, rent, capacity, availability } = req.body;
    if (roomType !== undefined) room.roomType = roomType;
    if (rent !== undefined) room.rent = Number(rent);
    if (capacity !== undefined) room.capacity = capacity;
    if (availability !== undefined) room.availability = availability;

    await room.save();

    // Sync availableRooms count on the PG
    const availableRooms = await Room.countDocuments({
      pgStay: room.pgStay._id,
      availability: true,
    });
    await PGStay.findByIdAndUpdate(room.pgStay._id, { availableRooms });

    res.json({ data: room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/rooms/:roomId
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId).populate("pgStay");
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.pgStay.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await room.deleteOne();

    const totalRooms = await Room.countDocuments({ pgStay: room.pgStay._id });
    const availableRooms = await Room.countDocuments({
      pgStay: room.pgStay._id,
      availability: true,
    });
    await PGStay.findByIdAndUpdate(room.pgStay._id, { totalRooms, availableRooms });

    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
