import { API_KEY } from "./config.js";

const result = document.getElementById("results");
const filter = document.querySelector(".div-filter");

const searchParams = new URLSearchParams(location.search);
const query = searchParams.get("q")?.trim();

const genres = searchParams.getAll("genres");
const excludeGenres = searchParams.getAll("exclude-genres");

function loadFilterList() {
  const genresMenu = document.querySelector(".g-dropdown-menu");
  const exGenresMenu = document.querySelector(".ex-g-dropdown-menu");

  const genresList = [
    "Adult",
    "Adventure",
    "Biography",
    "Childrens",
    "Christian",
    "Classics",
    "Comics",
    "Contemporary",
    "Crime",
    "Dystopia",
    "Entrepreneurship",
    "Fiction",
    "Fantasy",
    "Historical",
    "Horror",
    "Humor",
    "Mystery",
    "Nonfiction",
    "Paranormal",
    "Poetry",
    "Psychology",
    "Religion",
    "Romance",
    "Science Fiction",
    "Self Help",
    "Thriller",
    "Young Adult",
  ];

  genresList.map((genre) => {
    genresMenu.innerHTML += `
    <li>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" name="genres" id="${genre.toLowerCase().replaceAll(" ", "-")}" value="${genre}"/>
        <label class="form-check-label" for="${genre.toLowerCase().replaceAll(" ", "-")}"
        >${genre}</label
      ></div>
    </li>
  `;
  });

  genresList.map((genre) => {
    exGenresMenu.innerHTML += `
    <li>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" name="exclude-genres" id="ex-${genre.toLowerCase().replaceAll(" ", "-")}" value="${genre}"/>
        <label class="form-check-label" for="ex-${genre.toLowerCase().replaceAll(" ", "-")}"
        >${genre}</label
      ></div>
    </li>
  `;
  });
}
loadFilterList();

function shortenDescription(des) {
  if (des.length > 200) {
    let newDes = des.slice(0, 200) + `... (click "View details" to see more)`;
    return newDes;
  }
  return des;
}

filter.addEventListener("change", (event) => {
  if (event.target.type === "checkbox") {
    const dropdown = event.target.closest(".dropdown");

    const button = dropdown.querySelector(".dropdown-toggle");
    const checkedCount = dropdown.querySelectorAll("input:checked").length;

    const defaultText = button.getAttribute("data-default-text");
    if (checkedCount > 0) {
      button.textContent = `${defaultText} (${checkedCount})`;
    } else {
      button.textContent = defaultText;
    }
  }
});

function loadBooks(data) {
  const books = data?.items || [];
  result.innerHTML = `<div class="row g-4">
${
  books.length === 0
    ? `
      <h3 class="txt-color">No books found for "${query}" (${genres.length} filter)</h3>`
    : `<h3 class="txt-color">Search results for "${query}" (${genres.length} filter)</h3>` +
      books
        .map((book) => {
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
                        book.volumeInfo.description
                          ? shortenDescription(book.volumeInfo.description)
                          : "No description available."
                      }</p>
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
    </div>;`;
}

async function searchBooks() {
  if (query && genres.length <= 1) {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query,
      )}+subject:${genres}&key=${API_KEY}`,
    );

    const data = await response.json();
    console.log(data);

    loadBooks(data);
  } else if (query && genres.length >= 2) {
    const allRespond = genres.map((genre) => {
      return fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          query,
        )}+subject:${genre}&key=${API_KEY}`,
      ).then((response) => response.json());
    });
    const results = await Promise.all(allRespond);
    console.log(allRespond);

    const allItems = results.map((result) => result?.items || []).flat();

    const uniqueItems = [];

    for (const book of allItems) {
      const alreadyExists = uniqueItems.some((item) => item.id === book.id);

      if (!alreadyExists) {
        uniqueItems.push(book);
      }
    }

    const data = {
      items: uniqueItems,
    };

    console.log(data);

    loadBooks(data);
  }
}
searchBooks();
