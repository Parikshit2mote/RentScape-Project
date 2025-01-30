document.addEventListener("DOMContentLoaded", function () {
  var mapElement = document.getElementById("map");

  if (!mapElement) {
    return; // Stop execution if #map does not exist
  }

  var location = mapElement.getAttribute("data-location") || "";

  if (!location) {
    return; // Stop execution if location is not available
  }

  var lat = 0; // Default latitude
  var lon = 0; // Default longitude

  // Fetch location data using geocoding API
  fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      location
    )}&format=json`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data && data[0]) {
        lat = parseFloat(data[0].lat);
        lon = parseFloat(data[0].lon);

        // Initialize the map
        var map = L.map("map").setView([lat, lon], 13);

        // Add OpenStreetMap tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Add a default marker
        L.marker([lat, lon])
          .addTo(map)
          .bindPopup(`Location: ${location}`)
          .openPopup();
      }
    })
    .catch((error) => console.error("Error fetching location data:", error));

  // Resize map when window resizes
  window.addEventListener("resize", function () {
    setTimeout(() => {
      map.invalidateSize();
    }, 400);
  });
});
