import { API_KEY } from "./config.js";
import { shortenText } from "./config.js";
import { genresList } from "./config.js";

const result = document.getElementById("results");
const pagination = document.getElementById("paginationPages");
const filter = document.querySelector(".div-filter");
const searchByDropdown = document.querySelector(".sb-dropdown-menu");

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

  exGenresMenu.innerHTML = genresList.map((genre) => {
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
  });
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

const searchBy = document.querySelector(".sb-dropdown-menu");
searchBy.addEventListener("click", (event) => {
  event.target;
});

const bookPerPage = 10;
let startIndex = 0;
let currentPage = 1;
let totalItemsCount = 0;

document.getElementById("prevBtn").addEventListener("click", previous);
document.getElementById("nextBtn").addEventListener("click", next);

function previous() {
  if (currentPage > 1) {
    currentPage -= 1;
    startIndex = (currentPage - 1) * bookPerPage;
    searchBooks();
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function next() {
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

  result.innerHTML = `<div class="row g-4">
${
  books.length === 0
    ? `<h3 class="txt-color">No books found for "${query ? query : genres ? genres : excludeGenres ? excludeGenres : ""}" (${genres.length + excludeGenres.length} filter)</h3>`
    : `<h3 class="txt-color">Search results for "${query ? query : genres ? genres : excludeGenres ? excludeGenres : ""}" (${genres.length + excludeGenres.length} filter)</h3>` +
      books
        .map((book) => {
          return `
              <div class="col-lg-6">
                <div class="card-dark">
                  <div class="row align-items-center">
                    <div class="col-md-4 text-center">
                      <img src="${
                        book.volumeInfo?.imageLinks?.thumbnail ??
                        "https://placehold.co/128x190?text=No+Image"
                      }" class="search-img" />
                    </div>

                    <div class="col-md-8">
                      <h3 class="txt-color">${book.volumeInfo?.title || "Untitled"}</h3>
                      <p class="txt-sec-color">${shortenText(book.volumeInfo?.description, 150)}</p>
                      <a href="./books.html?id=${book.id}&key=${API_KEY}" class="btn btn-outline-light">
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              </div>`;
        })
        .join("")
}
    </div>`;
  if (totalPages > 1) {
    pagination.innerHTML = Array.from({ length: totalPages }, (_, index) => {
      const pageNumber = index + 1;
      return `<a page-number="${pageNumber}" class="txt-color btn btn-outline-light page-link page-link-number ${pageNumber === currentPage ? "active" : ""}">${pageNumber}</a>`;
    }).join("");
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

    const data = await response.json();
    const fetchedBooks = data?.items || [];
    totalItemsCount = data?.totalItems || 0;

    let uniqueItems = [];
    for (const book of fetchedBooks) {
      if (book && book.id) {
        const alreadyExists = uniqueItems.some((item) => item.id === book.id);
        if (!alreadyExists) {
          uniqueItems.push(book);
        }
      }
    }

    const lowerExcludeGenres = excludeGenres.map((genre) =>
      genre.toLowerCase(),
    );
    const filteredData = uniqueItems.filter((book) => {
      const bookCategories = book.volumeInfo?.categories || [];

      const hasExcludedGenre = bookCategories.some((category) => {
        const lowerCategory = category.toLowerCase();
        return lowerExcludeGenres.some((excluded) =>
          lowerCategory.includes(excluded),
        );
      });

      return !hasExcludedGenre;
    });
    console.log(filteredData);

    loadBooks(filteredData);
  } catch (error) {
    console.error("Error:", error);
    finalBooks = [];
  } finally {
    spinner.style.display = "none";
  }
}

searchBooks();
