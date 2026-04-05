const mongoose = require("mongoose");

const PGStaySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "PG name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },

    // ── Google Maps coordinates (GeoJSON Point) ───────────────────────────
    // Stored as GeoJSON so MongoDB $near / $geoWithin queries work natively.
    // IMPORTANT: GeoJSON order is [longitude, latitude] — opposite of Google Maps {lat, lng}.
    // The frontend sends { lat, lng } and we store as [lng, lat] in the controller.
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined, // optional — existing PGs won't break
      },
    },
    // ─────────────────────────────────────────────────────────────────────

    rent: {
      type: Number,
      required: [true, "Rent is required"],
    },
    amenities: {
      type: [String],
      default: [],
    },
    trustScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "restricted"],
      default: "pending",
    },
    totalRooms: {
      type: Number,
      default: 0,
    },
    availableRooms: {
      type: Number,
      default: 0,
    },
    complaints: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    rules: {
      type: [String],
      default: [],
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, required: true },
          caption: { type: String, default: "" },
        },
      ],
      default: [],
      validate: [arr => arr.length <= 10, "Maximum 10 images allowed"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    licenseDocument: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      fileType: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// ── 2dsphere index enables $near, $geoWithin geospatial queries ──────────
// This index is what allows "find PGs within X km of a point" on the backend.
// The index is sparse so existing docs without coordinates are not indexed.
PGStaySchema.index({ coordinates: "2dsphere" }, { sparse: true });

module.exports = mongoose.model("PGStay", PGStaySchema);