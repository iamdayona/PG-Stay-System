const express = require("express");
const router  = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { uploadAadhaar, uploadProfilePhoto } = require("../middleware/upload");
const User = require("../models/User");

router.post("/register", register);
router.post("/login",    login);
router.get("/me",        protect, getMe);
router.put("/profile",   protect, updateProfile);

// POST /api/auth/upload-aadhaar  — multipart, field name "aadhaar"
router.post("/upload-aadhaar", protect,
  uploadAadhaar.single("aadhaar"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const user = await User.findById(req.user._id);
      user.documentUrl      = req.file.path;          // Cloudinary secure URL
      user.documentFileType = req.file.mimetype === "application/pdf" ? "pdf" : "image";
      user.verificationStatus = "pending";

      // +10 to completion for uploading doc
      user.profileCompletion = Math.min(100, (user.profileCompletion || 40) + 10);
      await user.save();

      res.json({
        message: "Document uploaded. Verification is now pending.",
        documentUrl:      user.documentUrl,
        documentFileType: user.documentFileType,
        verificationStatus: user.verificationStatus,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// POST /api/auth/upload-profile-photo — multipart, field name "photo"
router.post("/upload-profile-photo", protect,
  uploadProfilePhoto.single("photo"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const user = await User.findById(req.user._id);
      user.profilePhotoUrl = req.file.path;
      await user.save();

      res.json({
        message: "Profile photo updated successfully.",
        profilePhotoUrl: user.profilePhotoUrl,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;