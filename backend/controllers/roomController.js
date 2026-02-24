const Room = require("../models/Room");
const PGStay = require("../models/PGStay");

// @desc    Get rooms for a PG stay
// @route   GET /api/rooms/:pgId
// @access  Private
exports.getRoomsByPG = async (req, res) => {
  try {
    const rooms = await Room.find({ pgStay: req.params.pgId });
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add room to PG stay
// @route   POST /api/rooms/:pgId
// @access  Private (owner)
exports.addRoom = async (req, res) => {
  try {
    const pg = await PGStay.findById(req.params.pgId);
    if (!pg) return res.status(404).json({ message: "PG Stay not found" });

    if (pg.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { roomType, capacity, rent, availability } = req.body;

    const room = await Room.create({
      pgStay: req.params.pgId,
      roomType,
      capacity,
      rent,
      availability: availability !== undefined ? availability : true,
    });

    // Update total rooms count on PG
    const allRooms = await Room.find({ pgStay: req.params.pgId });
    const available = allRooms.filter((r) => r.availability).length;
    await PGStay.findByIdAndUpdate(req.params.pgId, {
      totalRooms: allRooms.length,
      availableRooms: available,
    });

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update room (availability, rent, etc.)
// @route   PUT /api/rooms/:roomId
// @access  Private (owner)
exports.updateRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.roomId).populate("pgStay");
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.pgStay.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    room = await Room.findByIdAndUpdate(req.params.roomId, req.body, {
      new: true,
      runValidators: true,
    });

    // Sync availableRooms count on PG
    const allRooms = await Room.find({ pgStay: room.pgStay._id });
    const available = allRooms.filter((r) => r.availability).length;
    await PGStay.findByIdAndUpdate(room.pgStay._id, {
      totalRooms: allRooms.length,
      availableRooms: available,
    });

    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:roomId
// @access  Private (owner)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId).populate("pgStay");
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.pgStay.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await room.deleteOne();
    res.json({ success: true, message: "Room removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};