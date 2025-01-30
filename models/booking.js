const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing", // Reference to the listing (room/restaurant) being booked
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the user who made the booking
      required: true,
    },
    startDate: {
      type: Date,
      required: true, // Date the booking starts
    },
    endDate: {
      type: Date,
      required: true, // Date the booking ends
    },
    status: {
      type: String,
      enum: ["Booked", "Cancelled"], // Status of the booking
      default: "Booked",
    },
  },
  { timestamps: true }
);

// Add custom method to check availability
bookingSchema.statics.checkAvailability = async function (
  listingId,
  startDate,
  endDate
) {
  const existingBookings = await this.find({
    listing: listingId,
    $or: [
      { startDate: { $lt: endDate }, endDate: { $gt: startDate } }, // Overlapping bookings
    ],
  });
  return existingBookings.length === 0; // Return true if no overlapping bookings
};

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
