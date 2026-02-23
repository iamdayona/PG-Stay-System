const express = require("express");
const router = express.Router();
const {
  getRoomsByPG,
  addRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");
const { protect, authorize } = require("../middleware/auth");

router.get("/:pgId", protect, getRoomsByPG);
router.post("/:pgId", protect, authorize("owner"), addRoom);
router.put("/:roomId", protect, authorize("owner"), updateRoom);
router.delete("/:roomId", protect, authorize("owner"), deleteRoom);

module.exports = router;