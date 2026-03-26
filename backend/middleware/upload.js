const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Validate Cloudinary credentials
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("\n❌ CLOUDINARY CREDENTIALS MISSING IN .env");
  console.error("   Add these to backend/.env:");
  console.error("   CLOUDINARY_CLOUD_NAME=your_cloud_name");
  console.error("   CLOUDINARY_API_KEY=your_api_key");
  console.error("   CLOUDINARY_API_SECRET=your_api_secret");
  console.error("   Sign up free at https://cloudinary.com\n");
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── PG image uploads (jpg/png/webp, max 5MB each) ─────────────────────────
const pgStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "pg-stays",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 800, crop: "limit", quality: "auto" }],
  },
});

const upload = multer({
  storage: pgStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

// ── Aadhaar / identity document uploads (jpg/png/pdf, max 15MB) ───────────
const aadhaarStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: "pg-aadhaar",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: file.mimetype === "application/pdf" ? "raw" : "image",
    // No transformation for documents — keep original fidelity
  }),
});

const uploadAadhaar = multer({
  storage: aadhaarStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG, PNG, or PDF files are allowed for documents"), false);
  },
});

// ── Profile photo uploads (jpg/png/webp, max 5MB) ─────────────────────────
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "pg-profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face", quality: "auto" }],
  },
});

const uploadProfilePhoto = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed for profile photo"), false);
  },
});

module.exports = { upload, uploadAadhaar, uploadProfilePhoto };