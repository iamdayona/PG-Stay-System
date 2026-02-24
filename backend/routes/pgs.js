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

router.get("/recommendations", protect, authorize("tenant"), getRecommendations);
router.get("/owner/mine", protect, authorize("owner"), getOwnerPGs);
router.get("/", protect, getAllPGs);
router.get("/:id", protect, getPGById);
router.post("/", protect, authorize("owner"), createPG);
router.put("/:id", protect, authorize("owner", "admin"), updatePG);
router.delete("/:id", protect, authorize("owner", "admin"), deletePG);

module.exports = router;