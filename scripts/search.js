import { API_KEY } from "./config.js";

const result = document.getElementById("results");

const searchQuery = new URLSearchParams(location.search);
const query = searchQuery.get("q")?.trim();

async function searchBooks() {
  if (query) {
    const response =
      await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query,
      )}&key=${API_KEY}
`);

    const data = await response.json();

    console.log(data);

    result.innerHTML = `<h2 class="txt-color">Search results for "${query}"</h2><div class="row g-4">
      ${data.items
        .map(function (book) {
          return `
          <div class="col-lg-6">
        <div class="search-book">
          <div class="row align-items-center">
            <div class="col-md-4 text-center">
              <img src="${
                book.volumeInfo.imageLinks?.thumbnail ??
                "https://placehold.co/128x190?text=No+Image"
              }" class="search-img" />
            </div>

            <div class="col-md-8">
              <h3 class="txt-color">${book.volumeInfo.title}</h3>
              <p class="txt-sec-color">${
                book.volumeInfo.description ?? "No description available."
              }</p>

              <a href="https://www.googleapis.com/books/v1/volumes" class="btn btn-outline-light">
                View Details
              </a>
            </div>
          </div>
        </div>
      </div>`;
        })
        .join("")}
    </div>;

      `;
  }
}
searchBooks();
