import { API_KEY } from "./config.js";
import { ratingStars } from "./config.js";
import { shortenDescription } from "./config.js";

async function fetchBooks(section) {
  if (Array.isArray(section.query)) // Check if it's editor's list
  {
    try {
      const allResponses = await Promise.all(
        section.query.map(async (book) => {
          const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(book)}&key=${API_KEY}`,
          );
          const data = await response.json();
          return data;
        }),
      );
      const individualBooks = allResponses.map(
        (response) => response.items?.[0],
      );
      const editorsList = { items: individualBooks };
      console.log(editorsList);
      return editorsList;
    } catch (error) {
      console.error("Error:", error);
    } finally {
    }
  } else {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(section.query)}${section.orderBy ? `&orderBy=${section.orderBy}` : ""}&maxResults=20&key=${API_KEY}`,
    );
    const data = await response.json();
    console.log(data);
    return data;
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
                          src="${
                            book.volumeInfo.imageLinks?.thumbnail ??
                            "https://placehold.co/128x190?text=No+Image"
                          }"
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
    "Harry Potter and the Philosopher's Stone",
    "Percy Jackson: The Lightning Thief",
    "The Hunger Games",
    "Powerless",
    "The Maze Runner",
    "The Martian",
    "Heroes of Olympus: The Lost Hero",
    "The Hobbit",
    "Artemis Fowl: Opal Deception",
  ];

  const homeRecommendations = [
    {
      id: "newReleases",
      title: "New Releases",
      query: "subject:general",
      orderBy: "newest",
    },
    {
      id: "editorsPick",
      title: "Editor's Pick",
      query: editorsPicks,
      orderBy: "newest",
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
    books.items = books.items.filter((item) => item.volumeInfo?.imageLinks);
    html += buildCarousel(section, books);
  }
  document.getElementById("rcm-sections").innerHTML = html;
}

// Load home Reviews
const reviewKeys = Object.keys(localStorage).filter((key) =>
  key.startsWith("reviews-"),
);
const reviewKeysId = reviewKeys.map((key) => key.split("-")[1]);

function loadHomeReviews() {
  const storageKeys = Object.keys(localStorage);
  const reviewKeys = storageKeys.filter((key) => key.startsWith("reviews-"));

  const allReviews = reviewKeys.map((key) => {
    const reviews = JSON.parse(localStorage.getItem(key) || "[]");
    return { reviews };
  });

  const homeReviewsContainer = document.querySelector("#reviewContainer");
  if (!homeReviewsContainer) return;

  let homeReviews = `<div class="row g-4">
  ${allReviews
    .map((item, index) => {
      const review = item.reviews[0]; // Get the first review left for this book
      if (!review) return "";

      return `<div class="col-lg-4 col-md-6 ${index === 0 ? "" : index === 1 ? "d-none d-sm-block" : "d-none d-md-block"}">
      <div class="card-light">
        <img src="${
          // Pulled instantly from local cache instead of Google servers!
          review.bookThumbnail ?? "https://placehold.co/128x190?text=No+Image"
        }" 
          alt="${review.bookTitle ?? "Book Cover"}" class="review-book" />
        <h3 class="txt-color">${review.bookTitle ?? "Untitled Book"}</h3>
        <div class="stars">
          ${ratingStars(review.rating)}
        </div>
        <p class="txt-sec-color review-text">${review.review}</p>
        <p class="review-user">— ${review.user.username}</p>
      </div>
    </div>`;
    })
    .join("\n")}
  </div>`;

  homeReviewsContainer.innerHTML = homeReviews;
}
console.log(localStorage);
loadHomeReviews();
