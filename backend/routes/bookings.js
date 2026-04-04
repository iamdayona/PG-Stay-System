const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { uploadAadhaar } = require("../middleware/upload");
const {
  createBooking,
  getMyBookings,
  declineBooking,
  cancelBooking,
  updateBookingAgreement,
  updateOccupancyDates,
  uploadPaymentProof,
  getPGRoommates,
  verifyPayment,
  ownerCancelBooking,
  getOwnerBookings,
} = require("../controllers/bookingController");

// Tenant routes
router.use(protect);
router.post("/", authorize("tenant"), createBooking);
router.post("/decline", authorize("tenant"), declineBooking);
router.post("/cancel", authorize("tenant"), cancelBooking);
router.get("/my", authorize("tenant"), getMyBookings);
router.get("/pg/:pgId/roommates", getPGRoommates);
router.put("/:id/agreement", authorize("tenant"), uploadAadhaar.single("agreement"), updateBookingAgreement);
router.put("/:id/occupancy-dates", authorize("tenant"), updateOccupancyDates);
router.post("/:id/payment-proof", authorize("tenant"), uploadAadhaar.single("proof"), uploadPaymentProof);

// Owner routes
router.put("/:id/verify-payment", authorize("owner"), verifyPayment);
router.get("/owner", authorize("owner"), getOwnerBookings);
router.put("/:id/cancel-by-owner", authorize("owner"), ownerCancelBooking);

module.exports = router;
