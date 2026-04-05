const PGStay = require("../models/PGStay");
const Room   = require("../models/Room");

// GET /api/pgs/recommendations  (tenant only)
//
// Scoring model — each dimension contributes a weighted sub-score
// that is summed into a final matchScore [0–100]:
//
//  Dimension          Max pts  Description
//  ─────────────────  ───────  ────────────────────────────────────
//  Trust score         40 pts  PG's own trust score normalised
//  Location match      25 pts  Exact ≥ partial word match
//  Budget fit          15 pts  In range = full pts; ±20% = partial
//  Amenity overlap     15 pts  Matched / requested amenities
//  Availability         5 pts  Has at least one free room
//
// PGs are then sorted by matchScore DESC, then trustScore DESC as
// a tie-breaker. Only PGs with at least 1 available room are shown.
exports.getRecommendations = async (req, res) => {
  try {
    const user  = req.user;
    const prefs = user.preferences || {};

    // Only return verified, active PGs
    const pgs = await PGStay.find({ verificationStatus: "verified", isActive: true })
      .populate("owner", "name email trustScore verificationStatus")
      .lean();

    // Fetch available room counts for all PGs in one query
    const pgIds = pgs.map((pg) => pg._id);
    const availabilityAgg = await Room.aggregate([
      { $match: { pgStay: { $in: pgIds }, availability: true } },
      { $group: { _id: "$pgStay", count: { $sum: 1 } } },
    ]);
    const availMap = Object.fromEntries(
      availabilityAgg.map(({ _id, count }) => [_id.toString(), count])
    );

    // ── Helpers ──────────────────────────────────────────────────
    const clamp     = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));
    const normalize = (s) => (s || "").toLowerCase().trim().replace(/[^a-z0-9\s]/g, " ");

    // ── Score each PG ────────────────────────────────────────────
    const scored = pgs.map((pg) => {
      const availableRoomCount = availMap[pg._id.toString()] || 0;
      let matchScore = 0;

      // ── 1. Trust score component (40 pts) ──────────────────────
      // Normalise trustScore [0,100] → [0,40]
      matchScore += Math.round(((pg.trustScore || 50) / 100) * 40);

      // ── 2. Location match (25 pts) ─────────────────────────────
      if (prefs.location && pg.location) {
        const prefText  = normalize(prefs.location);
        const pgText    = normalize(pg.location);
        const prefWords = prefText.split(/\s+/).filter(Boolean);

        if (pgText.includes(prefText)) {
          // Exact substring match → full points
          matchScore += 25;
        } else {
          // Partial: count how many pref words appear in pg location
          const matched = prefWords.filter((w) => pgText.includes(w)).length;
          const partial = prefWords.length > 0
            ? Math.round((matched / prefWords.length) * 15)
            : 0;
          matchScore += partial;
        }
      }

      // ── 3. Budget fit (15 pts) ─────────────────────────────────
      const budgetMin = prefs.budgetMin || 0;
      const budgetMax = prefs.budgetMax || Infinity;
      if (budgetMin > 0 || prefs.budgetMax) {
        if (pg.rent >= budgetMin && pg.rent <= budgetMax) {
          // Perfect fit — full points
          matchScore += 15;
        } else {
          // Within ±20% of budget bounds — partial credit
          const lowerBound = budgetMin * 0.8;
          const upperBound = budgetMax * 1.2;
          if (pg.rent >= lowerBound && pg.rent <= upperBound) {
            matchScore += 7;
          }
          // Outside ±20% → no budget points
        }
      }

      // ── 4. Amenity overlap (15 pts) ────────────────────────────
      if (prefs.amenities?.length > 0) {
        const pgAmenities   = (pg.amenities || []).map((a) => a.toLowerCase());
        const prefAmenities = prefs.amenities.map((a) => a.toLowerCase());
        const matchedCount  = prefAmenities.filter((a) => pgAmenities.includes(a)).length;
        const amenityScore  = Math.round((matchedCount / prefAmenities.length) * 15);
        matchScore += amenityScore;
      }

      // ── 5. Availability bonus (5 pts) ──────────────────────────
      if (availableRoomCount > 0) matchScore += 5;

      return {
        ...pg,
        availableRoomCount,
        matchScore: clamp(matchScore),
        // Breakdown for debugging / transparency (stripped client-side)
        _scoreBreakdown: {
          trustComponent:  Math.round(((pg.trustScore || 50) / 100) * 40),
          locationMatch:   prefs.location ? (pg.location?.toLowerCase().includes(normalize(prefs.location)) ? 25 : "partial") : "n/a",
          budgetFit:       (budgetMin > 0 || prefs.budgetMax) ? (pg.rent >= budgetMin && pg.rent <= budgetMax ? 15 : 0) : "n/a",
          amenityOverlap:  prefs.amenities?.length > 0 ? `${(pg.amenities||[]).filter(a => prefs.amenities.map(x=>x.toLowerCase()).includes(a.toLowerCase())).length}/${prefs.amenities.length}` : "n/a",
          availability:    availableRoomCount > 0 ? 5 : 0,
        },
      };
    });

    // ── Sort: matchScore DESC → trustScore DESC → name ASC ───────
    scored.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (b.trustScore !== a.trustScore) return b.trustScore - a.trustScore;
      return (a.name || "").localeCompare(b.name || "");
    });

    res.json({ data: scored });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── NEW: GET /api/pgs/nearby?lat=&lng=&radius= ───────────────────────────
// Returns verified PGs near a coordinate point, sorted by distance.
// Query params:
//   lat     — latitude  (required)
//   lng     — longitude (required)
//   radius  — search radius in metres (optional, default 10000 = 10 km)
exports.getNearbyPGs = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng query parameters are required" });
    }

    const latitude  = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDist   = parseInt(radius) || 10000; // default 10 km

    // $near requires the 2dsphere index and returns results sorted by distance
    // GeoJSON uses [longitude, latitude] order
    const pgs = await PGStay.find({
      verificationStatus: "verified",
      isActive: true,
      coordinates: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: maxDist,
        },
      },
    }).populate("owner", "name email phone trustScore");

    const results = await Promise.all(
      pgs.map(async (pg) => {
        const availableRoomCount = await Room.countDocuments({
          pgStay: pg._id,
          availability: true,
        });

        // Calculate straight-line distance in km using Haversine formula
        let distanceKm = null;
        if (pg.coordinates?.coordinates?.length === 2) {
          const [pgLng, pgLat] = pg.coordinates.coordinates;
          const R = 6371; // Earth radius in km
          const dLat = ((pgLat - latitude) * Math.PI) / 180;
          const dLng = ((pgLng - longitude) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((latitude * Math.PI) / 180) *
            Math.cos((pgLat * Math.PI) / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distanceKm = parseFloat((R * c).toFixed(2));
        }

        return { ...pg.toObject(), availableRoomCount, distanceKm };
      })
    );

    res.json({ data: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ─────────────────────────────────────────────────────────────────────────

// GET /api/pgs
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

    let pgs = await PGStay.find(filter).populate("owner", "name email phone");

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
    const pg = await PGStay.findById(req.params.id).populate("owner", "name email phone trustScore");
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
    if (req.user.role === "owner" && req.user.verificationStatus !== "verified") {
      return res.status(403).json({ message: "Owner account must be verified by admin before creating PG listings." });
    }

    const { name, location, address, rent, amenities, description, rules, lat, lng } = req.body;

    if (!name || !location || !rent)
      return res.status(400).json({ message: "Name, location and rent are required" });

    if (!req.file)
      return res.status(400).json({ message: "License document is required to create a PG listing" });

    const fileType = req.file.mimetype === "application/pdf" ? "pdf" : "image";

    // Build coordinates object only when lat/lng are provided
    // GeoJSON stores [longitude, latitude] — note the swap from Google Maps {lat, lng}
    let coordinatesField = undefined;
    if (lat && lng) {
      coordinatesField = {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };
    }

    const pg = await PGStay.create({
      owner:       req.user._id,
      name,
      location,
      address:     address || "",
      rent:        Number(rent),
      amenities:   amenities ? (Array.isArray(amenities) ? amenities : JSON.parse(amenities)) : [],
      description: description || "",
      rules:       rules ? (Array.isArray(rules) ? rules : JSON.parse(rules)) : [],
      licenseDocument: {
        url:      req.file.path,
        publicId: req.file.filename,
        fileType,
      },
      ...(coordinatesField && { coordinates: coordinatesField }),
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

    const { name, location, address, rent, amenities, description, rules, lat, lng } = req.body;
    if (name)                  pg.name        = name;
    if (location)              pg.location    = location;
    if (address !== undefined) pg.address     = address;
    if (rent)                  pg.rent        = Number(rent);
    if (amenities)             pg.amenities   = amenities;
    if (description !== undefined) pg.description = description;
    if (rules !== undefined)   pg.rules       = rules;

    // Update coordinates if new ones are provided
    // GeoJSON: [longitude, latitude]
    if (lat && lng) {
      pg.coordinates = {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };
    }

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

// POST /api/pgs/:id/images
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

// DELETE /api/pgs/:id/images/:imgId
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