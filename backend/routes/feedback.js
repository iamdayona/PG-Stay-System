const express = require("express");
const router = express.Router();
const {
  submitFeedback,
  getFeedbackForPG,
  getMyFeedback,
} = require("../controllers/feedbackController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("tenant"), submitFeedback);
router.get("/my", protect, authorize("tenant"), getMyFeedback);
router.get("/:pgId", protect, getFeedbackForPG);

module.exports = router;