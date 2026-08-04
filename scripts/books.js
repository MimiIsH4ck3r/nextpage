import { API_KEY } from "./config.js";
import { ratingStars } from "./config.js";
import { genresList } from "./config.js";
import { shortenText } from "./config.js";
import { handleError } from "./config.js";

const title = document.querySelector("title");

const searchParams = new URLSearchParams(location.search);
const id = searchParams.get("id");

const spinner = document.getElementById("api-spinner");
const detail = document.getElementById("bookDetail");

let data = null;
const isLoaded = await loadDetails();

if (isLoaded) {
  await updateHistory();
} else {
  detail.innerHTML = `
    <div class="text-center py-5">
      <h4 class="txt-color mb-2">An error occurred while fetching book details.</h4>
      <p class="txt-sec-color">Please try again later.</p>
    </div>`;
}

async function updateHistory() {
  if (!id) return;
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  let historyArray = currentUser.history || [];
  historyArray = historyArray.filter((item) => item.id !== id);

  const timestamp = new Date().toLocaleString("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
  historyArray.unshift({
    id: id,
    bookTitle: data.volumeInfo.title,
    bookThumbnail:
      data.volumeInfo.imageLinks?.thumbnail ??
      "https://placehold.co/128x190?text=No+Image",
    bookCategories: data.volumeInfo.categories ?? [],
    bookAuthors: data.volumeInfo.authors ?? [],
    timestamp: timestamp,
  });

  if (historyArray.length > 10) {
    historyArray = historyArray.slice(0, 10);
    console.log("History array exceeded 10 items. Oldest item removed.");
  }

  currentUser.history = historyArray;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const userIndex = users.findIndex((u) => u.username === currentUser.username);
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    localStorage.setItem("users", JSON.stringify(users));
  }
  console.log("Updated history:", historyArray);
}

async function loadDetails() {
  try {
    spinner?.style.display = "block";
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${id}?key=${API_KEY}`,
    );
    loadReviews();
    if (response.status === 503) {
      document.getElementById("bookDetail").innerHTML = `
    <div class="ui-error-panel">
      <h3>Google Indexing Outage</h3>
      <p>The ID <strong>"${id}"</strong> triggered an internal Google routing error. This book cannot be parsed.</p>
      <button onclick="location.reload()">Retry Query</button>
    </div>
  `;
      return false;
    }
    if (response.status === 429) {
      const error = new Error("Rate limit exceeded");
      return false;
    }
    if (!response.ok) {
      const error = new Error("HTTP connection failed");
      error.status = response.status;
      throw error;
    }

    data = (await response.json()) || {};
    console.log(data);
  } catch (error) {
    console.error("Error:", error);
    handleError(error.status || 500, error);
    return false;
  } finally {
    spinner?.style.display = "none";
  }

  if (!data || !data.volumeInfo) {
    document.getElementById("bookDetail").innerHTML =
      `<h2 class="txt-color">Book details not available.</h2>`;
    return false;
  }
  title.textContent = `${data.volumeInfo?.title || "Book Details"} | NextPage`;
  detail.innerHTML = `
    <div class="main-detail">
      <div class="container">
        <div class="book-img">
          <img src="${
            data.volumeInfo.imageLinks?.thumbnail ??
            "https://placehold.co/128x190?text=No+Image"
          }" alt="${data.volumeInfo.title} Cover" />
        </div>

        <div>
          <h1 class="book-title txt-color heading">
            ${data.volumeInfo.title}
          </h1>
          <p class="txt-sec-color star-rating">${data.volumeInfo.averageRating ? ratingStars(data.volumeInfo.averageRating) + data.volumeInfo.averageRating : "No rating yet"}</p>
          <p class="author txt-sec-color">by ${
            data.volumeInfo.authors
              ? data.volumeInfo.authors.join(", ")
              : "No author"
          }</p>
          <p class="txt-sec-color genre-chips">${data.volumeInfo.categories ? genreChips(data.volumeInfo.categories) : ""} </p>
          <p class="price">${data.saleInfo?.retailPrice?.amount ? data.saleInfo?.saleability.replaceAll("_", " ") + ": " + data.saleInfo.retailPrice.amount + data.saleInfo.retailPrice.currencyCode : data.saleInfo?.saleability.replaceAll("_", " ")}</p>
          <p>${data.saleInfo?.buyLink ? `<a class="btn btn-outline-light" href="${data.saleInfo.buyLink}">Buy Link here</a>` : ""}</p>
        </div>
      </div>
    </div>

    <h4 class="txt-color">Description</h4>
    <div class="txt-sec-color description">
        <p> ${data.volumeInfo.description ?? "No description available."}</p>
    </div>

    <h4 class="txt-color">More Details</h4>
    <div class="txt-sec-color more-details">
      ${data.volumeInfo.language ? `<p>Language: ${data.volumeInfo.language}</p>` : ""}
      ${data.volumeInfo.pageCount ? `<p>Page Count: ${data.volumeInfo.pageCount}</p>` : ""}
      ${data.volumeInfo.publisher ? `<p>Publisher: ${data.volumeInfo.publisher}</p>` : ""}
      ${data.volumeInfo.publishedDate ? `<p>Published Date: ${data.volumeInfo.publishedDate}</p>` : ""}
      ${data.volumeInfo.averageRating ? `<p>Average Rating: ${data.volumeInfo.averageRating}</p>` : ""}
      ${data.volumeInfo.ratingsCount ? `<p>Ratings Count: ${data.volumeInfo.ratingsCount}</p>` : ""}
      ${data.saleInfo.saleability ? `<p>Saleability: ${data.saleInfo.saleability.replaceAll("_", " ").toLowerCase()}</p>` : ""}
      ${data.volumeInfo.isEbook ? "<p>Available on ebook</p>" : "<p>Not available on ebook</p>"}
      ${data.saleInfo?.listPrice ? `<p>List Price: ${data.saleInfo.listPrice.amount + data.saleInfo.listPrice.currencyCode}</p>` : ""}
      ${data.saleInfo?.retailPrice ? `<p>Retail Price: ${data.saleInfo.retailPrice.amount + data.saleInfo.retailPrice.currencyCode}</p>` : ""}
    </div>`;
  return true;
}

function genreChips(genres) {
  let chips = "";
  for (let i = 0; i < genres.length; i++) {
    chips += `<i class="fa-solid fa-square"></i> ${genres[i]} `;
  }
  return chips;
}

const user = JSON.parse(localStorage.getItem("currentUser"));

const formContainer = document.querySelector(".form");
formContainer.innerHTML = `
  <form ${!user ? `style="cursor: pointer" onclick="window.location.href='./login.html'"` : ""}>
    <label class="txt-color" for="review">${user ? `Review this book` : ``}</label>
    <div class="star-rating">${
      user
        ? `
        <i class="fa-regular fa-star" data-rating="1"></i>
        <i class="fa-regular fa-star" data-rating="2"></i>
        <i class="fa-regular fa-star" data-rating="3"></i>
        <i class="fa-regular fa-star" data-rating="4"></i>
        <i class="fa-regular fa-star" data-rating="5"></i>`
        : ``
    }</div>
    ${user ? `<textarea id="review" name="review" class="form-control" rows="3"></textarea>` : `<button type="button" class="btn btn-outline-light" onclick="window.location.href='././login.html'">Login to review</button>`}

    <div ${user ? "" : 'style="display: none"'} class="text-end">
      <button type="submit" class="review-btn btn btn-outline-light"
        >
        Share
      </button>
    </div>
  </form>`;

const stars = document.querySelectorAll(".star-rating i");
let rating = 0;
stars.forEach((star) => {
  star.addEventListener("click", (event) => {
    event.preventDefault();
    rating = star.dataset.rating;

    stars.forEach((element) => {
      if (element.dataset.rating <= rating) {
        element.classList.replace("fa-regular", "fa-solid");
      } else {
        element.classList.replace("fa-solid", "fa-regular");
      }
    });
  });
});

const form = document.querySelector("form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const review = event.target.review.value.trim();
  if (!review) return;

  if (!data || !data.volumeInfo) {
    alert("Book data is not available. Cannot save review.");
    return;
  }

  const existingReviews = JSON.parse(
    localStorage.getItem(`reviews-${id}`) || "[]",
  );

  existingReviews.push({
    id,
    review,
    rating,
    user: {
      username: user.username,
    },
    bookTitle: data.volumeInfo.title,
    bookThumbnail: data.volumeInfo.imageLinks?.thumbnail,
  });

  localStorage.setItem(`reviews-${id}`, JSON.stringify(existingReviews));

  loadReviews();
});

function loadReviews() {
  const container = document.getElementById("reviewContainer");
  const reviews = JSON.parse(localStorage.getItem(`reviews-${id}`) || "[]");

  if (reviews.length === 0) {
    container.innerHTML = `<p class="txt-sec-color">No reviews yet. Be the first!</p>`;
  } else {
    container.innerHTML = reviews
      .map(
        (item) => `
      <div class="review-card">
        <div style="margin: 5px 0;">
          <img class="profile-img" src="./assets/default-profile-picture.jpg" alt="Profile" /> ${item.user.username}
        </div>  
        <div class="star-rating">
          ${ratingStars(item.rating)}
        </div>
        <p class="txt-sec-color">${item.review}</p>
      </div>
    `,
      )
      .join("");
  }
}
