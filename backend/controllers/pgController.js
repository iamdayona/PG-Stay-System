const PGStay = require("../models/PGStay");
const Room   = require("../models/Room");

// GET /api/pgs/recommendations  (tenant only)
// Returns verified PGs sorted by trust score + preference match (location, budget, amenities)
exports.getRecommendations = async (req, res) => {
  try {
    const user  = req.user;
    const prefs = user.preferences || {};

    // Build base filter
    const filter = { verificationStatus: "verified", isActive: true };

    // If tenant has location preference, pre-filter (soft — still show others after)
    // We score rather than hard-filter, so no DB-level location filter here

    const pgs = await PGStay.find(filter)
      .populate("owner", "name email trustScore verificationStatus");

    const results = await Promise.all(
      pgs.map(async (pg) => {
        const availableRoomCount = await Room.countDocuments({
          pgStay: pg._id,
          availability: true,
        });

        // ── Match score: base trust + preference bonuses ──
        let matchScore = pg.trustScore;

        // Amenity match: +5 per matched amenity
        if (prefs.amenities?.length > 0) {
          const matched = (pg.amenities || []).filter((a) =>
            prefs.amenities.includes(a)
          ).length;
          matchScore = Math.min(100, matchScore + matched * 5);
        }

        // Location match: +10 if location contains preference
        if (prefs.location && pg.location) {
          const prefLoc = prefs.location.toLowerCase();
          if (pg.location.toLowerCase().includes(prefLoc)) {
            matchScore = Math.min(100, matchScore + 10);
          }
        }

        // Budget match: +5 if rent is within budget range
        if (prefs.budgetMin !== undefined && prefs.budgetMax !== undefined) {
          if (pg.rent >= (prefs.budgetMin || 0) && pg.rent <= (prefs.budgetMax || 999999)) {
            matchScore = Math.min(100, matchScore + 5);
          }
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

// GET /api/pgs  — with optional filters (location, budgetMin, budgetMax, amenities, roomType, capacity)
exports.getAllPGs = async (req, res) => {
  try {
    const { location, budgetMin, budgetMax, amenities, roomType, capacity } = req.query;
    const filter = { verificationStatus: "verified", isActive: true };

    if (location)  filter.location = { $regex: location, $options: "i" };
    if (budgetMin || budgetMax) {
      filter.rent = {};
      if (budgetMin) filter.rent.$gte = Number(budgetMin);
      if (budgetMax) filter.rent.$lte = Number(budgetMax);
    }
    if (amenities) {
      const list = amenities.split(",").map((a) => a.trim());
      filter.amenities = { $all: list };
    }

    let pgs = await PGStay.find(filter).populate("owner", "name email");

    // Room-type filter: only keep PGs that have at least one matching available room
    if (roomType) {
      const roomFilter = { availability: true, roomType };
      if (roomType === "Shared" && capacity) roomFilter.capacity = { $gte: Number(capacity) };

      const pgIdsWithMatchingRooms = await Room.distinct("pgStay", roomFilter);
      pgs = pgs.filter((pg) =>
        pgIdsWithMatchingRooms.some((id) => id.toString() === pg._id.toString())
      );
    }

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
        const totalRooms    = await Room.countDocuments({ pgStay: pg._id });
        const occupiedRooms = await Room.countDocuments({ pgStay: pg._id, availability: false });
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

    if (!req.file)
      return res.status(400).json({ message: "License document is required to create a PG listing" });

    const fileType = req.file.mimetype === "application/pdf" ? "pdf" : "image";

    const pg = await PGStay.create({
      owner: req.user._id,
      name,
      location,
      rent:        Number(rent),
      amenities:   amenities ? (Array.isArray(amenities) ? amenities : JSON.parse(amenities)) : [],
      description: description || "",
      licenseDocument: {
        url:      req.file.path,
        publicId: req.file.filename,
        fileType,
      },
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

    if (req.user.role === "owner" && pg.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized to update this PG" });

    const { name, location, rent, amenities, description } = req.body;
    if (name)                 pg.name        = name;
    if (location)             pg.location    = location;
    if (rent)                 pg.rent        = Number(rent);
    if (amenities)            pg.amenities   = amenities;
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

const cloudinary = require("cloudinary").v2;

// POST /api/pgs/:id/images  (owner only)
exports.uploadImages = async (req, res) => {
  try {
    const pg = await PGStay.findById(req.params.id);
    if (!pg) return res.status(404).json({ message: "PG not found" });

    if (pg.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No images uploaded" });

    const remaining = 10 - pg.images.length;
    if (remaining <= 0)
      return res.status(400).json({ message: "Maximum 10 images already reached" });

    const toAdd     = req.files.slice(0, remaining);
    const newImages = toAdd.map((file) => ({
      url:      file.path,
      publicId: file.filename,
      caption:  "",
    }));

    pg.images.push(...newImages);
    await pg.save();

    res.status(201).json({ data: pg.images });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/pgs/:id/images/:imgId  (owner only)
exports.deleteImage = async (req, res) => {
  try {
    const pg = await PGStay.findById(req.params.id);
    if (!pg) return res.status(404).json({ message: "PG not found" });

    if (pg.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const img = pg.images.id(req.params.imgId);
    if (!img) return res.status(404).json({ message: "Image not found" });

    await cloudinary.uploader.destroy(img.publicId);
    img.deleteOne();
    await pg.save();

    res.json({ message: "Image deleted", data: pg.images });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};