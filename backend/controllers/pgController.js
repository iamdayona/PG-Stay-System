const PGStay = require("../models/PGStay");
const Room = require("../models/Room");
const User = require("../models/User");

// ─────────────────────────────────────────────
// RECOMMENDATION ENGINE
// Weighted Multi-Criteria Scoring (Hybrid Filtering)
// Justified by Literature Survey: Roy & Dutta (2022),
// Patil & Khaiyum (2023), Nicula et al. (2025)
//
// Final Score =
//   Location Match  × 0.30
//   Budget Match    × 0.25
//   Room Type Match × 0.20
//   Amenities Match × 0.15
//   Trust Score     × 0.10
// ─────────────────────────────────────────────
const computeRecommendationScore = (pg, preferences, rooms) => {
  const {
    location = "",
    budgetMin = 0,
    budgetMax = 50000,
    roomType = "",
    amenities = [],
  } = preferences;

  // 1. Location match (0 or 1)
  const locationScore =
    location && pg.location.toLowerCase().includes(location.toLowerCase())
      ? 1
      : location
      ? 0
      : 1;

  // 2. Budget match — how well rent fits in range (normalized 0–1)
  let budgetScore = 0;
  if (pg.rent >= budgetMin && pg.rent <= budgetMax) {
    // Closer to midpoint = better score
    const mid = (budgetMin + budgetMax) / 2;
    const range = (budgetMax - budgetMin) / 2 || 1;
    budgetScore = 1 - Math.abs(pg.rent - mid) / range;
    budgetScore = Math.max(0, budgetScore);
  }

  // 3. Room type match (0 or 1)
  const hasMatchingRoom =
    !roomType ||
    rooms.some(
      (r) =>
        r.availability &&
        r.roomType.toLowerCase().includes(roomType.toLowerCase())
    );
  const roomTypeScore = hasMatchingRoom ? 1 : 0;

  // 4. Amenities match (proportion matched)
  let amenitiesScore = 1;
  if (amenities.length > 0) {
    const pgAmenitiesLower = pg.amenities.map((a) => a.toLowerCase());
    const matched = amenities.filter((a) =>
      pgAmenitiesLower.includes(a.toLowerCase())
    ).length;
    amenitiesScore = matched / amenities.length;
  }

  // 5. Trust score (normalized 0–1)
  const trustScore = pg.trustScore / 100;

  // Weighted final score
  const finalScore =
    locationScore * 0.3 +
    budgetScore * 0.25 +
    roomTypeScore * 0.2 +
    amenitiesScore * 0.15 +
    trustScore * 0.1;

  return Math.round(finalScore * 100); // return as percentage
};

// @desc    Get recommended PG stays for tenant
// @route   GET /api/pgs/recommendations
// @access  Private (tenant)
exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const preferences = user.preferences || {};

    // Query filters
    const query = { verificationStatus: "verified", isActive: true };
    if (preferences.location) {
      query.location = { $regex: preferences.location, $options: "i" };
    }
    if (preferences.budgetMax) {
      query.rent = { $lte: preferences.budgetMax };
    }
    if (preferences.budgetMin) {
      query.rent = { ...query.rent, $gte: preferences.budgetMin };
    }

    const pgs = await PGStay.find(query).populate("owner", "name email");

    // Attach rooms and compute scores
    const results = await Promise.all(
      pgs.map(async (pg) => {
        const rooms = await Room.find({ pgStay: pg._id });
        const matchScore = computeRecommendationScore(pg, preferences, rooms);
        const availableRooms = rooms.filter((r) => r.availability);
        return {
          ...pg.toObject(),
          matchScore,
          availableRoomCount: availableRooms.length,
          rooms: availableRooms,
        };
      })
    );

    // Sort by match score descending
    results.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all PG stays (with optional filters from query params)
// @route   GET /api/pgs
// @access  Private
exports.getAllPGs = async (req, res) => {
  try {
    const { location, budgetMin, budgetMax, amenities } = req.query;
    const query = { isActive: true };

    if (location) query.location = { $regex: location, $options: "i" };
    if (budgetMax) query.rent = { $lte: Number(budgetMax) };
    if (budgetMin) query.rent = { ...query.rent, $gte: Number(budgetMin) };
    if (amenities) {
      const amenityList = amenities.split(",");
      query.amenities = { $all: amenityList };
    }

    const pgs = await PGStay.find(query).populate("owner", "name email phone");
    res.json({ success: true, count: pgs.length, data: pgs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single PG stay
// @route   GET /api/pgs/:id
// @access  Private
exports.getPGById = async (req, res) => {
  try {
    const pg = await PGStay.findById(req.params.id).populate(
      "owner",
      "name email phone"
    );
    if (!pg) return res.status(404).json({ message: "PG Stay not found" });
    const rooms = await Room.find({ pgStay: pg._id });
    res.json({ success: true, data: { ...pg.toObject(), rooms } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get PG stays owned by logged-in owner
// @route   GET /api/pgs/owner/mine
// @access  Private (owner)
exports.getOwnerPGs = async (req, res) => {
  try {
    const pgs = await PGStay.find({ owner: req.user.id });
    const results = await Promise.all(
      pgs.map(async (pg) => {
        const rooms = await Room.find({ pgStay: pg._id });
        const occupied = rooms.filter((r) => !r.availability).length;
        return {
          ...pg.toObject(),
          totalRooms: rooms.length,
          occupiedRooms: occupied,
          availableRooms: rooms.length - occupied,
          rooms,
        };
      })
    );
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create PG stay
// @route   POST /api/pgs
// @access  Private (owner)
exports.createPG = async (req, res) => {
  try {
    const { name, location, rent, amenities, description } = req.body;
    const pg = await PGStay.create({
      owner: req.user.id,
      name,
      location,
      rent,
      amenities: amenities || [],
      description: description || "",
    });
    res.status(201).json({ success: true, data: pg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update PG stay
// @route   PUT /api/pgs/:id
// @access  Private (owner)
exports.updatePG = async (req, res) => {
  try {
    let pg = await PGStay.findById(req.params.id);
    if (!pg) return res.status(404).json({ message: "PG Stay not found" });

    if (pg.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    pg = await PGStay.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: pg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete PG stay
// @route   DELETE /api/pgs/:id
// @access  Private (owner/admin)
exports.deletePG = async (req, res) => {
  try {
    const pg = await PGStay.findById(req.params.id);
    if (!pg) return res.status(404).json({ message: "PG Stay not found" });

    if (pg.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await pg.deleteOne();
    res.json({ success: true, message: "PG Stay removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};