const filtersBox = document.querySelector(".filters-box"),
    arrowIcons = document.querySelectorAll(".icon");

const handleIcons = (scrollVal) => {
    let maxScrollableWidth = filtersBox.scrollWidth - filtersBox.clientWidth;
    arrowIcons[0].style.display = scrollVal <= 0 ? "none" : "flex";
    arrowIcons[1].style.display = maxScrollableWidth - scrollVal <= 1 ? "none" : "flex";
}

arrowIcons.forEach(icon => {
    icon.addEventListener("click", () => {
        let scrollWidth = filtersBox.scrollLeft += icon.id === "left" ? -340 : 340;
        handleIcons(scrollWidth);
    });
});

filtersBox.addEventListener("scroll", () => {
    handleIcons(filtersBox.scrollLeft);
});

// Initialize the icons' visibility
handleIcons(filtersBox.scrollLeft);
