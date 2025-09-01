document.addEventListener("DOMContentLoaded", function () {
  const filters = document.querySelectorAll(".filter");
  const allCardsContainer = document.querySelector(".row"); // Assuming the cards are inside the row div
  const allListingLinks = document.querySelectorAll(".listing-link");

  filters.forEach((filter) => {
    filter.addEventListener("click", function () {
      const selectedCategory = this.getAttribute("data-category");

      // Convert NodeList to an array and filter the listing links based on the selected category
      const filteredLinks = Array.from(allListingLinks).filter(
        (link) =>
          selectedCategory === "All" ||
          link.querySelector(".listing-card").getAttribute("data-category") === selectedCategory
      );

      // Sort the filtered links based on price (ascending order)
      const sortedLinks = filteredLinks
        .map((link) => {
          return {
            link,
            price: parseFloat(
              link.querySelector(".card-text").innerText.replace(/[^\d.-]/g, "")
            ), // Extract price for sorting
          };
        })
        .sort((a, b) => a.price - b.price) // Sort by price in ascending order
        .map((item) => item.link); // Extract sorted links

      // Clear the existing content from the DOM
      allCardsContainer.innerHTML = "";

      // Append the sorted and filtered listing links back to the DOM
      sortedLinks.forEach((link) => {
        allCardsContainer.appendChild(link);
      });
    });
  });
});
