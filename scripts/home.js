import { API_KEY } from "./config.js";
import { ratingStars } from "./config.js";
import { shortenText } from "./config.js";
import { handleError } from "./config.js";

const spinner = document.getElementById("api-spinner");
const recommendedSection = document.getElementById("rcm-sections");

async function fetchBooks(section) {
  if (Array.isArray(section.query)) // Check if it's editor's list
  {
    spinner.style.display = "block";
    try {
      const allResponses = await Promise.all(
        section.query.map(async (id) => {
          const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${id}?key=${API_KEY}`,
          );
          if (response.status === 503) {
            recommendedSection.innerHTML = `
        <div class="text-center py-5">
          <h3 class="txt-color">Google Indexing Outage for query "${section.query}".</h3>
          <p class="txt-sec-color">This recommendation cannot be completed. Please try again later.</p>
        </div>`;
            return false;
          }
          if (response.status === 429) {
            recommendedSection.innerHTML = `
        <div class="text-center py-5">
        <h3 class="txt-color">Rate limit exceeded for query "${section.query}".</h3>
        <p class="txt-sec-color">This recommendation cannot be completed. Please try again later.</p>
        </div>`;
            return false;
          }
          if (!response.ok) {
            const error = new Error("HTTP connection failed");
            error.status = response.status;
            throw error;
          }
          const data = (await response.json()) || {};
          return data;
        }),
      );
      return { items: allResponses.filter((book) => book !== null) };
    } catch (error) {
      console.error("Error:", error);
      handleError(error.status || 500, error.message);
      return false;
    } finally {
      spinner.style.display = "none";
    }
  } else {
    try {
      spinner.style.display = "block";
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(section.query)}&maxResults=20&key=${API_KEY}`,
      );
      if (response.status === 503) {
        recommendedSection.innerHTML = `
        <div class="text-center py-5">
          <h3 class="txt-color">Google Indexing Outage for query "${section.query}".</h3>
          <p class="txt-sec-color">This recommendation cannot be completed. Please try again later.</p>
        </div>`;
        return false;
      }
      if (response.status === 429) {
        recommendedSection.innerHTML = `
        <div class="text-center py-5">
        <h3 class="txt-color">Rate limit exceeded for query "${section.query}".</h3>
        <p class="txt-sec-color">This recommendation cannot be completed. Please try again later.</p>
        </div>`;
        return false;
      }
      if (!response.ok) {
        const error = new Error("HTTP connection failed");
        error.status = response.status;
        throw error;
      }
      const data = (await response.json()) || {};
      return data;
    } catch (error) {
      console.error("Error:", error);
      handleError(error.status || 500, error.message);
      return false;
    } finally {
      spinner.style.display = "none";
    }
  }
}

function buildCarousel(section, books) {
  return `<div
        id="${section.id}"
        class="carousel slide"
        data-bs-ride="carousel"
      >
        <h3 class="txt-color carousel-row-title">${section.title}</h3>
        <div class="carousel-inner">
        ${(() => {
          let carouselHTML = "";
          for (let i = 0; i < books.items.length; i += 5) {
            carouselHTML += `<div class="carousel-item ${i === 0 ? "active" : ""}">
            <div class="container">
              <div  class="carousel-row row justify-content-center">`;
            const group = books.items.slice(i, i + 5);
            carouselHTML += group
              .map((book, index) => {
                return ` 
                      <div class="col-6 col-sm-4 col-md-3 col-lg-2 ${index === 0 ? "" : index === 1 ? "" : index === 2 ? "d-none d-sm-block" : index === 3 ? "d-none d-md-block" : "d-none d-lg-block"} text-center">
                        <a href="./books.html?id=${book.id}">
                          <img
                          class="rcm-book"
                          src="${book.volumeInfo.imageLinks.thumbnail}"
                          />
                        </a>
                      </div>
                    `;
              })
              .join("\n");
            carouselHTML += `</div>
              </div>
                </div>`;
          }
          return carouselHTML;
        })()}</div>
      

        <a
          class="carousel-control-prev"
          href="#${section.id}"
          role="button"
          data-bs-slide="prev"
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        </a>
        <a
          class="carousel-control-next"
          href="#${section.id}"
          role="button"
          data-bs-slide="next"
        >
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
        </a>
      </div>`;
}

async function loadRcmBooks() {
  const editorsPicks = [
    "YQNbEAAAQBAJ", // "Harry Potter and the Philosopher's Stone"
    "ku9TsH3M1-YC", // "Percy Jackson: The Lightning Thief"
    "hlb_sM1AN0gC", // "The Hunger Games"
    "tjmlEQAAQBAJ", // "Powerless"
    "6gfDfhmmHxMC", // "The Maze Runner"
    "JeiGsRd4mywC", // "Heroes of Olympus: The Lost Hero"
    "_kan_wrvIVoC", // "The City of Ember"
    "HtfNL5MwRlYC", // "Steve Jobs: The Man Who Thought Different"
    "0ahZNyx58BEC", // "Artemis Fowl: The Opal Deception"
    "U799AY3yfqcC", // "The Hobbit"
  ];

  const homeRecommendations = [
    {
      id: "editorsPick",
      title: "Editor's Pick",
      query: editorsPicks,
    },
    {
      id: "famousFantasies",
      title: "Famous Fantasies",
      query: "subject:Fantasy",
    },
  ];
  let html = "";
  for (const section of homeRecommendations) {
    const books = await fetchBooks(section);
    if (!books || !books.items || books.items.length === 0) {
      console.log(books);
      continue;
    }
    books.items = books.items.filter((item) => item.volumeInfo?.imageLinks);
    if (books.items.length > 0) html += buildCarousel(section, books);
  }
  if (html.trim() === "") {
    html = `
        <div class="text-center py-5">
          <h4 class="txt-color mb-2">An error occurred while fetching recommendations.</h4>
          <p class="txt-sec-color">Please try again later.</p>
        </div>`;
  }
  recommendedSection.innerHTML = html;
}

// Load home Reviews
const reviewKeys = Object.keys(localStorage).filter((key) =>
  key.startsWith("reviews-"),
);
const reviewKeysId = reviewKeys.map((key) => key.split("-")[1]);

function loadHomeReviews() {
  console.log(localStorage);
  const storageKeys = Object.keys(localStorage);
  const reviewKeys = storageKeys.filter((key) => key.startsWith("reviews-"));

  const allReviews = reviewKeys.map((key) => {
    const reviews = JSON.parse(localStorage.getItem(key) || "[]");
    return { reviews };
  });

  const homeReviewsContainer = document.querySelector("#reviewContainer");
  if (!homeReviewsContainer) return;

  if (allReviews.length === 0) {
    homeReviewsContainer.innerHTML = `
      <div class="text-center py-5">
        <h4 class="txt-color mb-2">No Reviews Available</h4>
        <p class="txt-sec-color">Be the first to review a book!</p>
      </div>`;
    return;
  }

  let homeReviews = `<div class="row g-4">
  ${allReviews
    .map((item, index) => {
      const review = item.reviews[0];
      if (!review) return "";
      if (index >= 3) return "";
      return `<div class="col-lg-4 col-md-6 ${index === 0 ? "" : index === 1 ? "d-none d-sm-block" : "d-none d-md-block"}">
      <div class="card-light">
        <img src="${
          review.bookThumbnail ?? "https://placehold.co/128x190?text=No+Image"
        }" 
          alt="${review.bookTitle ?? `Book Cover`}" class="review-book" />
        <h3 class="txt-color">${review.bookTitle ?? "Untitled Book"}</h3>
        <div class="stars">${ratingStars(review.rating)}</div>
        <p class="txt-sec-color review-text">${shortenText(review.review, 180)}</p>
        <small class="review-user">— ${review.user.username}</small>
      </div>
    </div>`;
    })
    .join("\n")}
  </div>`;

  homeReviewsContainer.innerHTML = homeReviews;
}
loadHomeReviews();
loadRcmBooks();
