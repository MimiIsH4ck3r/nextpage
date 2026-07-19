import { API_KEY } from "./config.js";

const searchParams = new URLSearchParams(location.search);
const id = searchParams.get("id");

async function loadDetails() {
  if (!id) {
    console.error("No book ID found in the URL.");
    return;
  }

  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${id}?key=${API_KEY}`,
  );
  const data = await response.json();
  console.log(data);

  const detail = document.getElementById("bookDetail");
  detail.innerHTML = `
    <div class="row main-detail">
      <div class="col-md-3 book-img">
        <img src="${
          data.volumeInfo.imageLinks?.thumbnail ??
          "https://placehold.co/128x190?text=No+Image"
        }" alt="${data.volumeInfo.title} Cover" />
      </div>

      <div class="col-md-9">
        <h1 class="book-title txt-color heading">
          ${data.volumeInfo.title}
        </h1>
        <p class="txt-sec-color">${data.volumeInfo.averageRating ? ratingStars(data.volumeInfo.averageRating) + data.volumeInfo.averageRating : "No rating yet"}</p>
        <p class="author txt-sec-color">by ${
          data.volumeInfo.authors
            ? data.volumeInfo.authors.join(", ")
            : "No author"
        }</p>
        <p class="txt-sec-color">${data.volumeInfo.categories ? genreChips(data.volumeInfo.categories) : ""} </p>
        <p class="price">${data.saleInfo?.retailPrice?.amount ? data.saleInfo?.saleability.replaceAll("_", " ") + ": " + data.saleInfo.retailPrice.amount + data.saleInfo.retailPrice.currencyCode : data.saleInfo?.saleability.replaceAll("_", " ")}</p>
        <p>${data.saleInfo?.buyLink ? `<p><button class="btn btn-outline-light" href="${data.saleInfo.buyLink}">Buy Link here</button></p>` : ""}</p>
      </div>
    </div>

    <h4 class="txt-color">Description</h4>
    <div class="txt-sec-color description">
        <p> ${data.volumeInfo.description ?? "No description available."}</p>
    </div>

    <h4 class="txt-color">More Details</h4>
    <div class="txt-sec-color more-details">
      <p>${data.volumeInfo.language ? "Language: " + data.volumeInfo.language : ""}</p>
      <p>${data.volumeInfo.pageCount ? "Page Count: " + data.volumeInfo.pageCount : ""} pages</p>
      <p>${data.volumeInfo.publisher ? "Publisher: " + data.volumeInfo.publisher : ""} </p>
      <p>${data.volumeInfo.publishedDate ? "Published Date: " + data.volumeInfo.publishedDate : ""} </p>
      <p>${data.volumeInfo.averageRating ? "Average Rating: " + data.volumeInfo.averageRating : ""} </p>
      <p>${data.volumeInfo.ratingsCount ? "Ratings Count: " + data.volumeInfo.ratingsCount : ""} </p>
      <p>${data.saleInfo.saleability ? "Saleability: " + data.saleInfo.saleability.replaceAll("_", " ").toLowerCase() : ""} </p>
      <p>${data.volumeInfo.isEbook ? "Available on ebook" : "Not available on ebook"} </p>
      <p>${data.saleInfo?.listPrice ? "List Price: " + data.saleInfo.listPrice.amount + data.saleInfo.listPrice.currencyCode : ""} </p>
      <p>${data.saleInfo?.retailPrice ? "Retail Price: " + data.saleInfo.retailPrice.amount + data.saleInfo.retailPrice.currencyCode : ""} </p>
    </div>`;
}
loadDetails();

function ratingStars(rating) {
  let stars = "";
  for (let i = 0; i < (rating | 0); i++) {
    stars += `<i class="fa-solid fa-star"></i>`;
  }
  if (rating % 1 != 0) {
    stars += `<i class="fa-solid fa-star-half-stroke"></i>`;
  }
  return stars + " ";
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
  <form ${!user ? `style="cursor: pointer" onclick='location.href = \"./login.html\"'` : ""}>
    <label class="txt-color" for="review">${user ? `Review this book` : `Login to review`}</label>
    <div class="star-rating">
        <i class="fa-regular fa-star" data-rating="1"></i>
        <i class="fa-regular fa-star" data-rating="2"></i>
        <i class="fa-regular fa-star" data-rating="3"></i>
        <i class="fa-regular fa-star" data-rating="4"></i>
        <i class="fa-regular fa-star" data-rating="5"></i>
    </div>
    <textarea 
      id="review"
      name="review" 
      class="form-control"
      rows="3"> 
    </textarea>

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
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const review = event.target.review.value.trim();

  event.target.review.value = "";

  const existingReviews = JSON.parse(
    localStorage.getItem(`reviews-${id}`) || "[]",
  );

  existingReviews.push({
    review,
    rating,
    user: {
      username: user.username,
    },
  });

  localStorage.setItem(`reviews-${id}`, JSON.stringify(existingReviews));

  loadReviews();
});

function loadReviews() {
  let review = "";

  const reviews = JSON.parse(localStorage.getItem(`reviews-${id}`) || "[]");
  console.log(reviews);

  for (let i = 0; i < reviews.length; i++) {
    review += `
        <div class="review-card">
          <div style="margin: 5px 0;">
            <img class="profile-img" src="./assets/default-profile-picture.jpg" /> ${reviews[i].user.username}
          </div>  
          <div class="star-rating">
          ${ratingStars(reviews[i].rating)}
          </div>
          <p class="txt-sec-color">${reviews[i].review}</p>
        </div>
      `;
  }
  document.querySelector("#reviewContainer").innerHTML = review;
}

loadReviews();
