const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

// Controller to create a new booking
exports.createBooking = async (req, res, next) => {
  const listingId = req.params.id;
  // console.log(req.params.listingId); // Log the listingId from the URL
  // console.log(req.body); // Log the body to see the incoming data
  const { startDate, endDate } = req.body;
  const userId = req.user._id;

  // Check if the listing exists
  const listing = await Listing.findById(listingId);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found." });
  }

  // Check if the user is trying to book their own listing (optional logic)
  if (listing.owner.toString() === userId) {
    return res.status(400).json({ error: "You cannot book your own listing." });
  }

  // Check if the listing is available for the selected dates
  const isAvailable = await Booking.checkAvailability(
    listingId,
    new Date(startDate),
    new Date(endDate)
  );

  if (!isAvailable) {
    return res
      .status(400)
      .json({ error: "Listing is not available for the selected dates." });
  }

  // Check if the user already has a booking for the same listing and time period
  const overlappingBooking = await Booking.findOne({
    user: userId,
    listing: listingId,
    $or: [
      { startDate: { $lt: endDate, $gte: startDate } },
      { endDate: { $gt: startDate, $lte: endDate } },
    ],
  });

  if (overlappingBooking) {
    req.flash(
      "error",
      "You already have a booking for this listing during the selected dates!"
    );
    res.redirect(`/listings/${listing.id}`);
  }

  // Create the booking
  const booking = new Booking({
    user: userId,
    listing: listingId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  await booking.save();
  req.flash("success", "Booked Successfully!");
  res.redirect(`/listings/${listing.id}`);
};

// Controller to get all bookings for a listing (to display availability)
exports.getBookingsForListing = async (req, res, next) => {
  try {
    const listingId = req.params.id;
    // console.log("Listing ID from request params:", listingId); // Log to verify the ID

    const bookings = await Booking.find({ listing: listingId }).select(
      "startDate endDate"
    );
    // console.log("Bookings found:", bookings); // Log to verify the bookings

    if (!bookings.length) {
      return res
        .status(404)
        .json({ message: "No bookings found for this listing." });
    }

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve bookings." });
  }
};

// Controller to get all bookings for a user
exports.getBookingsForUser = async (req, res, next) => {
  const { userId } = req.user; // Assuming user is attached to req.user from isLoggedIn middleware

  // Fetch all bookings for the user
  const bookings = await Booking.find({ user: userId });

  res.status(200).json({ bookings });
};
