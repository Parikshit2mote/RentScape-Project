function disableBookedDates(bookings) {
  const disabledDates = bookings.reduce((dates, booking) => {
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);

    // Disable each date in the range (startDate to endDate)
    while (startDate <= endDate) {
      dates.push(startDate.toISOString().split("T")[0]); // Format date as YYYY-MM-DD
      startDate.setDate(startDate.getDate() + 1); // Increment date by 1
    }
    return dates;
  }, []);
}
// Form Validation
bookingForm.addEventListener("submit", function (e) {
  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);

  if (!startDate || !endDate) {
    e.preventDefault();
    bookingFeedback.innerHTML = `<div class="alert alert-danger">Please select both start and end dates.</div>`;
  } else if (startDate >= endDate) {
    e.preventDefault();
    bookingFeedback.innerHTML = `<div class="alert alert-danger">End date must be after the start date.</div>`;
  } else {
    bookingFeedback.innerHTML = ""; // Clear feedback
  }
});
