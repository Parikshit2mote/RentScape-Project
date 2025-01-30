const express = require("express");
const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");

const bookingController = require("../controllers/booking.js");

// Route to create a new booking
router.post("/", isLoggedIn, wrapAsync(bookingController.createBooking));

// Route to get all bookings for a listing (to display availability)
// router.get(
//   "/listings/:id/bookings",
//   wrapAsync(bookingController.getBookingsForListing)
// );

module.exports = router;
