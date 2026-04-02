const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { uploadAadhaar } = require("../middleware/upload");
const {
  createBooking,
  getMyBookings,
  declineBooking,
  updateBookingAgreement,
  payBooking,
  ownerCancelBooking,
  getOwnerBookings,
} = require("../controllers/bookingController");

// Tenant routes
router.use(protect);
router.post("/", authorize("tenant"), createBooking);
router.post("/decline", authorize("tenant"), declineBooking);
router.get("/my", authorize("tenant"), getMyBookings);
router.put("/:id/agreement", authorize("tenant"), uploadAadhaar.single("agreement"), updateBookingAgreement);
router.put("/:id/pay", authorize("tenant"), payBooking);

// Owner routes - to cancel bookings
router.get("/owner", authorize("owner"), getOwnerBookings);
router.put("/:id/cancel-by-owner", authorize("owner"), ownerCancelBooking);

module.exports = router;
