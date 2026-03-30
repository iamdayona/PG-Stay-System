const express = require("express");
const router = express.Router();
const {
  getRecommendations,
  getAllPGs,
  getPGById,
  getOwnerPGs,
  createPG,
  updatePG,
  deletePG,
} = require("../controllers/pgController");
const { protect, authorize } = require("../middleware/auth");
const { upload, uploadLicense } = require("../middleware/upload");
const { uploadImages, deleteImage } = require("../controllers/pgController");

router.get("/recommendations", protect, authorize("tenant"), getRecommendations);
router.get("/owner/mine", protect, authorize("owner"), getOwnerPGs);
router.get("/", protect, getAllPGs);
router.get("/:id", protect, getPGById);

// License document upload is handled by uploadLicense middleware (required for new PG)
router.post("/", protect, authorize("owner"), uploadLicense.single("licenseDocument"), createPG);

router.put("/:id", protect, authorize("owner", "admin"), updatePG);
router.delete("/:id", protect, authorize("owner", "admin"), deletePG);
router.post(
  "/:id/images",
  protect,
  authorize("owner"),
  upload.array("images", 10),
  uploadImages
);
router.delete(
  "/:id/images/:imgId",
  protect,
  authorize("owner"),
  deleteImage
);

module.exports = router;