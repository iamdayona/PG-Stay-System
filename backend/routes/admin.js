const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllPGsAdmin,
  verifyPG,
  restrictPG,
  unrestrictPG,
  deletePGAdmin,
  getAllUsers,
  getTrustScores,
  suspendUser,
  unsuspendUser,
  verifyUser,
  deleteUserAdmin,
  warnUser,
  getSystemStats,
  getComplaints,
  resolveComplaint,
  rejectComplaint,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

// All admin routes are protected and admin only
router.use(protect, authorize("admin"));

router.get("/stats", getDashboardStats);
router.get("/pgs", getAllPGsAdmin);
router.put("/pgs/:id/verify", verifyPG);
router.put("/pgs/:id/restrict", restrictPG);
router.put("/pgs/:id/unrestrict", unrestrictPG);
router.delete("/pgs/:id", deletePGAdmin);
router.get("/users", getAllUsers);
router.get("/trustscores", getTrustScores);
router.put("/users/:id/suspend", suspendUser);
router.put("/users/:id/unsuspend", unsuspendUser);
router.put("/users/:id/verify", verifyUser);
router.put("/users/:id/warn", warnUser);
router.delete("/users/:id", deleteUserAdmin);
router.get("/system", getSystemStats);

// Complaint routes (new)
router.get("/complaints", getComplaints);
router.put("/complaints/:id/resolve", resolveComplaint);
router.put("/complaints/:id/reject", rejectComplaint);

module.exports = router;
