const express = require("express");
const router = express.Router();
const {
  applyForRoom,
  getMyApplications,
  getOwnerApplications,
  approveApplication,
  rejectApplication,
  getAllApplications,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("tenant"), applyForRoom);
router.get("/my", protect, authorize("tenant"), getMyApplications);
router.get("/owner", protect, authorize("owner"), getOwnerApplications);
router.get("/all", protect, authorize("admin"), getAllApplications);
router.put("/:id/approve", protect, authorize("owner"), approveApplication);
router.put("/:id/reject", protect, authorize("owner"), rejectApplication);

module.exports = router;