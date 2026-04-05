const PGStay = require("../models/PGStay");
const Room = require("../models/Room");
const notifyAdmins = require("../utils/notifyAdmins");

// GET /api/pgs/recommendations  (tenant only)
exports.getRecommendations = async (req, res) => {
  try {
    const user = req.user;
    const prefs = user.preferences || {};

    const filter = { verificationStatus: "verified", isActive: true };

    const pgs = await PGStay.find(filter)
      .populate("owner", "name email phone trustScore verificationStatus");

    const results = await Promise.all(
      pgs.map(async (pg) => {
        const availableRoomCount = await Room.countDocuments({
          pgStay: pg._id,
          availability: true,
        });

        let matchScore = pg.trustScore;

        if (prefs.amenities?.length > 0) {
          const matched = (pg.amenities || []).filter((a) =>
            prefs.amenities.includes(a)
          ).length;
          matchScore = Math.min(100, matchScore + matched * 5);
        }

        let locationMatch = 0;
        if (prefs.location && pg.location) {
          const normalize = (text) => text.toLowerCase().trim().replace(/[^a-z0-9\s]/g, " ");
          const prefText = normalize(prefs.location);
          const pgText = normalize(pg.location);
          const prefWords = prefText.split(/\s+/).filter(Boolean);
          const pgWords = pgText.split(/\s+/).filter(Boolean);

          const exactMatch = pgText.includes(prefText);
          const wordMatch = prefWords.every((word) => pgWords.some((pgWord) => pgWord.includes(word)));

          if (exactMatch || (prefWords.length > 0 && wordMatch)) {
            matchScore = Math.min(100, matchScore + 50);
            locationMatch = 1;
          }
        }

        if (prefs.budgetMin !== undefined && prefs.budgetMax !== undefined) {
          if (pg.rent >= (prefs.budgetMin || 0) && pg.rent <= (prefs.budgetMax || 999999)) {
            matchScore = Math.min(100, matchScore + 5);
          }
        }

        return { ...pg.toObject(), availableRoomCount, matchScore, locationMatch };
      })
    );

    results.sort((a, b) => {
      if (b.locationMatch !== a.locationMatch) return b.locationMatch - a.locationMatch;
      return b.matchScore - a.matchScore;
    });

    res.json({ data: results });
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

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDist = parseInt(radius) || 10000; // default 10 km

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
        const totalRooms = await Room.countDocuments({ pgStay: pg._id });
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
      owner: req.user._id,
      name,
      location,
      address: address || "",
      rent: Number(rent),
      amenities: amenities ? (Array.isArray(amenities) ? amenities : JSON.parse(amenities)) : [],
      description: description || "",
      rules: rules ? (Array.isArray(rules) ? rules : JSON.parse(rules)) : [],
      licenseDocument: {
        url: req.file.path,
        publicId: req.file.filename,
        fileType,
      },
      ...(coordinatesField && { coordinates: coordinatesField }),
    });

    // Notify all admins about the new PG pending verification
    notifyAdmins({
      subject: `New PG listing pending verification — "${name}"`,
      text: `A new PG listing has been submitted and is awaiting verification.\n\nPG Name: ${name}\nLocation: ${location}\nRent: ₹${rent}/month\nOwner: ${req.user.name} (${req.user.email})\n\nPlease log in to the admin panel to review and verify this listing.`,
      html: `A new PG listing has been submitted for verification.<br><br>
             🏠 <strong>${name}</strong><br>
             📍 Location: ${location}<br>
             💰 Rent: ₹${rent}/month<br>
             👤 Owner: ${req.user.name} (${req.user.email})<br>
             🪪 Status: <span style="color:#f57f17;font-weight:700;">Pending verification</span><br><br>
             Please log in to the admin panel to review the license document and verify this listing.`,
    }).catch(() => { }); // fire-and-forget

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
    if (name) pg.name = name;
    if (location) pg.location = location;
    if (address !== undefined) pg.address = address;
    if (rent) pg.rent = Number(rent);
    if (amenities) pg.amenities = amenities;
    if (description !== undefined) pg.description = description;
    if (rules !== undefined) pg.rules = rules;

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

    const toAdd = req.files.slice(0, remaining);
    const newImages = toAdd.map((file) => ({
      url: file.path,
      publicId: file.filename,
      caption: "",
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