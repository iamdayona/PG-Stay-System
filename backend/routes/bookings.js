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
} = require("../controllers/bookingController");

router.use(protect, authorize("tenant"));
router.post("/", createBooking);
router.post("/decline", declineBooking);
router.get("/my", getMyBookings);
router.put("/:id/agreement", uploadAadhaar.single("agreement"), updateBookingAgreement);
router.put("/:id/pay", payBooking);

module.exports = router;
