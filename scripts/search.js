import { API_KEY } from "./config.js";
import { shortenText } from "./config.js";
import { genresList } from "./config.js";
import { handleError } from "./config.js";

const result = document.getElementById("results");
const pagination = document.getElementById("pagination");
const filter = document.querySelector(".div-filter");

const searchParams = new URLSearchParams(location.search);
const query = searchParams.get("q")?.trim();

const genres = searchParams.getAll("genres");
const excludeGenres = searchParams.getAll("exclude-genres");

const spinner = document.getElementById("api-spinner");

function loadFilterList() {
  const genresMenu = document.querySelector(".g-dropdown-menu");
  const exGenresMenu = document.querySelector(".ex-g-dropdown-menu");

  genresMenu.innerHTML = genresList
    .map((genre) => {
      const fixedGenre = genre
        .toLowerCase()
        .replaceAll(" ", "-")
        .replaceAll("&", "and");
      return `<li>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" name="genres" id="${fixedGenre}" value="${genre}"/>
        <label class="form-check-label" for="${fixedGenre}">${genre}</label>
      </div>
    </li>`;
    })
    .join("");

  exGenresMenu.innerHTML = genresList
    .map((genre) => {
      const fixedGenre = genre
        .toLowerCase()
        .replaceAll(" ", "-")
        .replaceAll("&", "and");
      return `<li>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" name="exclude-genres" id="ex-${fixedGenre}" value="${genre}"/>
        <label class="form-check-label" for="ex-${fixedGenre}">${genre}</label>
      </div>
    </li>`;
    })
    .join("");
}
loadFilterList();

filter.addEventListener("change", (event) => {
  if (event.target.type === "checkbox") {
    const dropdown = event.target.closest(".dropdown");
    const button = dropdown.querySelector(".dropdown-toggle");

    const checkedCount = dropdown.querySelectorAll("input:checked").length;
    const defaultText = button.getAttribute("data-default-text");
    button.textContent =
      checkedCount > 0 ? `${defaultText} (${checkedCount})` : defaultText;
  }
});

const bookPerPage = 10;
let startIndex = 0;
let currentPage = 1;
let totalItemsCount = 0;

function previous(event) {
  if (event) event.preventDefault();
  if (currentPage > 1) {
    currentPage -= 1;
    startIndex = (currentPage - 1) * bookPerPage;
    searchBooks();
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function next() {
  if (event) event.preventDefault();
  const totalPages = Math.ceil(Math.min(totalItemsCount, 100) / bookPerPage);
  if (currentPage < totalPages) {
    currentPage += 1;
    startIndex = (currentPage - 1) * bookPerPage;
    searchBooks();
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function loadBooks(books) {
  const totalPages = Math.ceil(Math.min(totalItemsCount, 100) / bookPerPage);
  const searchHeadlineText =
    query || (genres.length ? genres.join(", ") : excludeGenres.join(", "));
  const totalFilters = genres.length + excludeGenres.length;
  const isNoBooks = books.length === 0;
  result.innerHTML = `
    <div class="row g-4">
      <h3 class="txt-color">${isNoBooks ? "No books found for" : "Search results for"} "${searchHeadlineText}" (${totalFilters} filter)</h3>
      ${books
        .map(
          (book) => `
            <div class="col-md-6">
              <div class="card-dark">
                <div class="text-center">
                  <img src="${
                    book.volumeInfo?.imageLinks?.thumbnail ??
                    "https://placehold.co/128x190?text=No+Image"
                  }" class="search-img" />
                </div>

                <div>
                  <h3 class="txt-color">${shortenText(book.volumeInfo?.title, 100) || "Untitled"}</h3>
                  <p class="txt-sec-color">${shortenText(book.volumeInfo?.description, 150)}</p>
                  <a href="./books.html?id=${book.id}&key=${API_KEY}" class="btn btn-outline-light">
                    View Details
                  </a>
                </div>
              </div>
            </div>`,
        )
        .join("")}
    </div>`;
  if (totalPages > 1) {
    pagination.innerHTML = `
          <ul class="pagination">
            <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
              <a href="#" class="txt-color btn btn-outline-light page-link" id="prevBtn"
                >Previous</a
              >
            </li>
            <div style="display: flex" id="paginationPages">
            ${Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              return `<a class="txt-color btn btn-outline-light page-link page-link-number ${pageNumber === currentPage ? "active" : ""}">${pageNumber}</a>`;
            }).join("")}</div>
            <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
              <a href="#" class="txt-color btn btn-outline-light page-link" id="nextBtn"
                >Next</a
              >
            </li>
          </ul>`;
    document.getElementById("prevBtn").addEventListener("click", previous);
    document.getElementById("nextBtn").addEventListener("click", next);
  } else {
    pagination.innerHTML = "";
  }
}

async function searchBooks() {
  if (!query && genres.length === 0 && excludeGenres.length === 0) return;

  let finalBooks = [];
  spinner.style.display = "block";
  try {
    let apiQuery = encodeURIComponent(query || "");

    if (genres.length > 0) {
      const genreString = genres.map((g) => `subject:${g}`).join("+OR+");
      apiQuery += (apiQuery ? "+" : "") + `(${genreString})`;
    }
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${apiQuery}&startIndex=${startIndex}&maxResults=${bookPerPage}&key=${API_KEY}`,
    );

    if (response.status === 503) {
      result.innerHTML = `
    <div class="text-center py-5">
      <h3 class="txt-color">Google Indexing Outage</h3>
      <p class="txt-sec-color">The query <strong>"${query}"</strong> triggered an internal Google routing error. This search cannot be completed.</p>
    </div>
  `;
    }
    if (response.status === 429) {
      result.innerHTML = `
    <div class="text-center py-5">
      <h3 class="txt-color">Exceed Rate Limit</h3>
      <p class="txt-sec-color">The query <strong>"${query}"</strong> triggered an internal Google routing error. This search cannot be completed.</p>
    </div>
  `;
      return;
    }
    if (!response.ok) {
      const error = new Error("HTTP connection failed");
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    const fetchedBooks = data?.items || [];
    totalItemsCount = data?.totalItems || 0;

    const lowerExcludeGenres = excludeGenres.map((genre) =>
      genre.toLowerCase(),
    );
    const filteredData = fetchedBooks.filter((book) => {
      const bookCategories = book.volumeInfo?.categories || [];

      const hasExcludedGenre = bookCategories.some((category) => {
        return lowerExcludeGenres.some((excluded) =>
          category.toLowerCase().includes(excluded),
        );
      });

      return !hasExcludedGenre;
    });
    const droppedCount = fetchedBooks.length - filteredData.length;
    totalItemsCount = Math.max(0, (data?.totalItems || 0) - droppedCount);

    console.log(filteredData);

    loadBooks(filteredData);
  } catch (error) {
    console.error("Error:", error);
    handleError(error.status || 500, error);
    finalBooks = [];
  } finally {
    spinner.style.display = "none";
  }
}

searchBooks();
