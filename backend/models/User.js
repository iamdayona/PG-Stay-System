const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["tenant", "owner", "admin"],
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    // Tenant-specific
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    preferences: {
      location: { type: String, default: "" },
      budgetMin: { type: Number, default: 0 },
      budgetMax: { type: Number, default: 50000 },
      roomType: { type: String, default: "" },
      amenities: { type: [String], default: [] },
    },
    // Verification
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified"],
      default: "unverified",
    },
    documentUrl: {
      type: String,
      default: "",
    },
    trustScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    profileCompletion: {
      type: Number,
      default: 40,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);