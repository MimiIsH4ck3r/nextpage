import { API_KEY } from "./config.js";
import { ratingStars } from "./config.js";
import { shortenText } from "./config.js";

const reviewContainer = document.querySelector("#bookReviews");
const spinner = document.getElementById("api-spinner");

function loadReviews(searchedReviews) {
  let allReviews = [];
  const isSearched = searchedReviews && searchedReviews.length > 0;
  if (!searchedReviews) {
    const storageKeys = Object.keys(localStorage);
    const reviewKeys = storageKeys.filter((key) => key.startsWith("reviews-"));

    allReviews = reviewKeys
      .map((key) => {
        const reviews = JSON.parse(localStorage.getItem(key) || "[]");
        return reviews;
      })
      .flat();
  } else {
    allReviews = searchedReviews;
  }

  console.log("All reviews:", allReviews);
  console.log("searched reviews:", searchedReviews);

  if (allReviews.length === 0) {
    reviewContainer.innerHTML = `
      <div class="text-center py-5">
        <h4 class="txt-color mb-2">No Reviews Found</h4>
        <p class="txt-sec-color">Try adjusting your search keywords or add a new review.</p>
      </div>`;
    return;
  }

  reviewContainer.innerHTML = `<h2 class="txt-color">${isSearched ? "Search Results" : "All Reviews"}</h2>
  <div class="row g-4">
  ${allReviews
    .map((item, index) => {
      if (!item) return "";
      return `<div class="col-lg-6 ${index === 2 ? "d-none d-sm-block" : ""}">
      <div class="card-dark">
        <div class="d-flex align-items-center mb-3">
          <img src="${
            item.bookThumbnail ?? "https://placehold.co/128x190?text=No+Image"
          }" 
            alt="${item.bookTitle ?? "Book Cover"}" class="review-book" />
            <div>
                <h5 class="txt-color mb-1">
                    ${item.bookTitle ?? "Untitled Book"}
                </h5>
                <small class="review-user">reviewed by ${item.user.username}</small>
            </div>
          </div>
            <div class="stars">
            ${ratingStars(item.rating)}
            </div>
        <p class="txt-sec-color review-text">${shortenText(item.review, 170)}</p>
        <a href="./books.html?id=${item.id}" class="btn btn-outline-light"
                >View Details
              </a>
      </div>
    </div>`;
    })
    .join("\n")}
  </div>`;
}
loadReviews();

document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const searchInput = document.getElementById("q");
  const query = searchInput.value.trim();
  if (!query) return;
  spinner.style.display = "block";
  try {
    const storageKeys = Object.keys(localStorage);
    const reviewKeys = storageKeys.filter((key) => key.startsWith("reviews-"));

    let allReviews = reviewKeys
      .map((key) => {
        const reviews = JSON.parse(localStorage.getItem(key) || "[]");
        return reviews;
      })
      .flat();

    const filteredReviews = allReviews.filter((item) =>
      item.bookTitle.toLowerCase().includes(query.toLowerCase()),
    );
    console.log("Filtered Reviews:", filteredReviews);
    loadReviews(filteredReviews);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    spinner.style.display = "none";
  }
});

document.getElementById("q").addEventListener("input", (event) => {
  const query = event.target.value.trim();
  if (!query) {
    loadReviews();
  }
});
