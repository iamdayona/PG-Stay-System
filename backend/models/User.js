const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      validate: {
        validator: (v) => /^[A-Za-z\s]+$/.test(v.trim()),
        message: "Name must contain alphabets only (no numbers or special characters).",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
        message: "Please enter a valid email address (e.g. name@gmail.com).",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 5,
      select: false,
    },
    role: {
      type: String,
      enum: ["tenant", "owner", "admin"],
      required: true,
    },
    phone: { type: String, default: "" },
    // Profile photo (Cloudinary URL)
    profilePhotoUrl: { type: String, default: "" },
    // Tenant-specific
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    preferences: {
      location:  { type: String, default: "" },
      budgetMin: { type: Number, default: 0 },
      budgetMax: { type: Number, default: 50000 },
      roomType:  { type: String, default: "" },
      amenities: { type: [String], default: [] },
    },
    // Verification
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified"],
      default: "unverified",
    },
    // Aadhaar / identity document (Cloudinary URL)
    documentUrl:      { type: String, default: "" },
    documentFileType: { type: String, default: "" }, // "image" or "pdf"
    profilePhotoUrl:  { type: String, default: "" },
    trustScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    profileCompletion: { type: Number, default: 40 },
    isActive:          { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);