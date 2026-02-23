const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllPGsAdmin,
  verifyPG,
  restrictPG,
  deletePGAdmin,
  getAllUsers,
  getTrustScores,
  suspendUser,
  verifyUser,
  getSystemStats,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

// All admin routes are protected and admin only
router.use(protect, authorize("admin"));

router.get("/stats", getDashboardStats);
router.get("/pgs", getAllPGsAdmin);
router.put("/pgs/:id/verify", verifyPG);
router.put("/pgs/:id/restrict", restrictPG);
router.delete("/pgs/:id", deletePGAdmin);
router.get("/users", getAllUsers);
router.get("/trustscores", getTrustScores);
router.put("/users/:id/suspend", suspendUser);
router.put("/users/:id/verify", verifyUser);
router.get("/system", getSystemStats);

module.exports = router;