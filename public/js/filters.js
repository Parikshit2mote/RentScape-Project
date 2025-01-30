document.addEventListener("DOMContentLoaded", function () {
  const filters = document.querySelectorAll(".filter");
  const allCardsContainer = document.querySelector(".row"); // Assuming the cards are inside the row div
  const allCards = document.querySelectorAll(".listing-card");

  filters.forEach((filter) => {
    filter.addEventListener("click", function () {
      const selectedCategory = this.getAttribute("data-category");

      // Convert NodeList to an array and filter the listings based on the selected category
      const filteredCards = Array.from(allCards).filter(
        (card) =>
          selectedCategory === "All" ||
          card.getAttribute("data-category") === selectedCategory
      );

      // Sort the filtered cards based on price (ascending order)
      const sortedCards = filteredCards
        .map((card) => {
          return {
            card,
            price: parseFloat(
              card.querySelector(".card-text").innerText.replace(/[^\d.-]/g, "")
            ), // Extract price for sorting
          };
        })
        .sort((a, b) => a.price - b.price) // Sort by price in ascending order
        .map((item) => item.card); // Extract sorted cards

      // Clear the existing cards from the DOM
      allCardsContainer.innerHTML = "";

      // Append the sorted and filtered cards back to the DOM
      sortedCards.forEach((card) => {
        allCardsContainer.appendChild(card);
      });
    });
  });
});
