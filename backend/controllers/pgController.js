const PGStay = require("../models/PGStay");
const Room = require("../models/Room");

// GET /api/pgs/recommendations  (tenant only)
// Returns verified PGs sorted by trust score + amenity match
exports.getRecommendations = async (req, res) => {
  try {
    const user = req.user;
    const pgs = await PGStay.find({ verificationStatus: "verified", isActive: true })
      .populate("owner", "name email trustScore verificationStatus");

    // Attach available room count
    const results = await Promise.all(
      pgs.map(async (pg) => {
        const availableRoomCount = await Room.countDocuments({
          pgStay: pg._id,
          availability: true,
        });

        // Score: base trust + amenity match bonus
        let matchScore = pg.trustScore;
        if (user.preferences?.amenities?.length > 0) {
          const matched = (pg.amenities || []).filter((a) =>
            user.preferences.amenities.includes(a)
          ).length;
          matchScore = Math.min(100, matchScore + matched * 5);
        }

        return { ...pg.toObject(), availableRoomCount, matchScore };
      })
    );

    // Sort by matchScore descending
    results.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ data: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/pgs  — with optional filters
exports.getAllPGs = async (req, res) => {
  try {
    const { location, budgetMin, budgetMax, amenities } = req.query;
    const filter = { verificationStatus: "verified", isActive: true };

    if (location) filter.location = { $regex: location, $options: "i" };
    if (budgetMin || budgetMax) {
      filter.rent = {};
      if (budgetMin) filter.rent.$gte = Number(budgetMin);
      if (budgetMax) filter.rent.$lte = Number(budgetMax);
    }
    if (amenities) {
      const list = amenities.split(",").map((a) => a.trim());
      filter.amenities = { $all: list };
    }

    const pgs = await PGStay.find(filter).populate("owner", "name email");

    const results = await Promise.all(
      pgs.map(async (pg) => {
        const availableRoomCount = await Room.countDocuments({
          pgStay: pg._id,
          availability: true,
        });
        return { ...pg.toObject(), availableRoomCount };
      })
    );

    res.json({ data: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/pgs/:id
exports.getPGById = async (req, res) => {
  try {
    const pg = await PGStay.findById(req.params.id).populate("owner", "name email trustScore");
    if (!pg) return res.status(404).json({ message: "PG not found" });
    res.json({ data: pg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/pgs/owner/mine
exports.getOwnerPGs = async (req, res) => {
  try {
    const pgs = await PGStay.find({ owner: req.user._id });

    const results = await Promise.all(
      pgs.map(async (pg) => {
        const totalRooms = await Room.countDocuments({ pgStay: pg._id });
        const occupiedRooms = await Room.countDocuments({
          pgStay: pg._id,
          availability: false,
        });
        return { ...pg.toObject(), totalRooms, occupiedRooms };
      })
    );

    res.json({ data: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/pgs
exports.createPG = async (req, res) => {
  try {
    const { name, location, rent, amenities, description } = req.body;

    if (!name || !location || !rent)
      return res.status(400).json({ message: "Name, location and rent are required" });

    const pg = await PGStay.create({
      owner: req.user._id,
      name,
      location,
      rent: Number(rent),
      amenities: amenities || [],
      description: description || "",
    });

    res.status(201).json({ data: pg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/pgs/:id
exports.updatePG = async (req, res) => {
  try {
    const pg = await PGStay.findById(req.params.id);
    if (!pg) return res.status(404).json({ message: "PG not found" });

    // Owner can only update their own PG (admin can update any)
    if (req.user.role === "owner" && pg.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized to update this PG" });

    const { name, location, rent, amenities, description } = req.body;
    if (name) pg.name = name;
    if (location) pg.location = location;
    if (rent) pg.rent = Number(rent);
    if (amenities) pg.amenities = amenities;
    if (description !== undefined) pg.description = description;

    await pg.save();
    res.json({ data: pg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/pgs/:id
exports.deletePG = async (req, res) => {
  try {
    const pg = await PGStay.findById(req.params.id);
    if (!pg) return res.status(404).json({ message: "PG not found" });

    if (req.user.role === "owner" && pg.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized to delete this PG" });

    await pg.deleteOne();
    await Room.deleteMany({ pgStay: req.params.id });

    res.json({ message: "PG deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
