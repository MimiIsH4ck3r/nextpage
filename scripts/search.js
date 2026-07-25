import { API_KEY } from "./config.js";
import { shortenDescription } from "./config.js";

const result = document.getElementById("results");
const pagination = document.getElementById("paginationPages");
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
    "Education",
    "Fiction",
    "Fantasy",
    "Historical",
    "Horror",
    "Humor",
    "Mystery",
    "Magic",
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
    "Alternative History",
    "Ancient Civilizations",
    "Art History",
    "Artificial Intelligence",
    "Artists",
    "Astronomy",
    "Baking",
    "Biographical Fiction",
    "Board Books",
    "Career Beginnings",
    "Chapter Books",
    "Clean And Wholesome",
    "College Life",
    "Coming Of Age",
    "Contemporary Romance",
    "Cozy Mystery",
    "Crafts & Hobbies",
    "Crime",
    "Criminal Law",
    "Cyber Security",
    "Cyberpunk",
    "Dance",
    "Dark Fantasy",
    "Dystopian",
    "E-Commerce",
    "Early Readers",
    "Emotional Self-Help",
    "Entrepreneurship",
    "Epic Fantasy",
    "Espionage",
    "Evolutionary Biology",
    "Fashion Design",
    "Gardening",
    "Genetics",
    "Graphic Design",
    "Historical Romance",
    "History Of Science",
    "Internal Medicine",
    "International Law",
    "Journaling",
    "Landscape Photography",
    "Leadership",
    "Legal Thriller",
    "Lgbtq",
    "Magical Realism",
    "Marketing",
    "Model Building",
    "Motivational",
    "Music Theory",
    "Nursing",
    "Paranormal Romance",
    "Personal Finance",
    "Pharmacology",
    "Picture Books",
    "Police Procedural",
    "Post-Apocalyptic",
    "Presidents",
    "Programming Languages",
    "Psychiatry",
    "Psychological Suspense",
    "Quantum Physics",
    "Quick And Easy Cooking",
    "Quilting",
    "Real Estate",
    "Regional And Ethnic Cooking",
    "Romantic Suspense",
    "Screenwriting",
    "Space Opera",
    "Sports Figures",
    "Steampunk",
    "Stress Management",
    "Sword And Sorcery",
    "Theater History",
    "Time Management",
    "Time Travel",
    "True Crime",
    "Tudor Period",
    "Urban Fantasy",
    "Vegan",
    "Web Design",
    "Wine And Spirits",
    "Woodworking",
    "World War Ii",
    "Young Adult Contemporary",
    "Young Adult Dystopian",
    "Young Adult Fantasy",
  ];

  genresList.map((genre) => {
    const fixedGenre = genre
      .toLowerCase()
      .replaceAll(" ", "-")
      .replaceAll("&", "and");
    genresMenu.innerHTML += `
    <li>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" name="genres" id="${fixedGenre}" value="${genre}"/>
        <label class="form-check-label" for="${fixedGenre}">${genre}</label>
      </div>
    </li>`;
  });

  genresList.map((genre) => {
    const fixedGenre = genre
      .toLowerCase()
      .replaceAll(" ", "-")
      .replaceAll("&", "and");
    exGenresMenu.innerHTML += `
    <li>
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
    if (checkedCount > 0) {
      button.textContent = `${defaultText} (${checkedCount})`;
    } else {
      button.textContent = defaultText;
    }
  }
});

const searchBy = document.querySelector(".sb-dropdown-menu");
searchBy.addEventListener("click", (event) => {
  event.target;
});

// Cleaner signature passing explicit dataset values directly
function loadBooks(books, page) {
  result.innerHTML = `<div class="row g-4">
${
  books.length === 0
    ? `<h3 class="txt-color">No books found for "${query || ""}" (${genres.length + excludeGenres.length} filter)</h3>`
    : `<h3 class="txt-color">Search results for "${query || ""}" (${genres.length + excludeGenres.length} filter)</h3>` +
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
                      <p class="txt-sec-color">${shortenDescription(book.volumeInfo?.description, 150)}</p>
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
  pagination.innerHTML = `${Array.from({ length: totalPages }, (_, index) => {
    const pageNumber = index + 1;
    return `<a page-number="${pageNumber}" class="txt-color btn btn-outline-light page-link ${pageNumber === currentPage ? "active" : ""}">${pageNumber}</a>`;
  }).join("")}`;
}

const bookPerPage = 10;
let startIndex = 0;
let currentPage = 1;
const maxItems = 100;
const totalPages = Math.ceil(maxItems / bookPerPage);
document.getElementById("prevBtn").addEventListener("click", previous);
document.getElementById("nextBtn").addEventListener("click", next);

function previous() {
  startIndex = startIndex >= 10 ? startIndex - 10 : 0;
  searchBooks();
}
function next() {
  if (currentPage < totalPages) {
    currentPage += 1;
    startIndex = (currentPage - 1) * bookPerPage;
    searchBooks();
  }
}

const spinner = document.getElementById("api-spinner");
const outputContent = document.getElementById("output-content");

async function searchBooks() {
  if (!query) return;

  let finalBooks = [];
  if (genres.length <= 1) {
    spinner.style.display = "block";
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          query,
        )}${genres.length === 1 ? `+subject:${genres[0]}` : ""}&startIndex=${startIndex}&maxResults=${bookPerPage}&key=${API_KEY}`,
      );

      const data = await response.json();
      finalBooks = data?.items || [];
    } catch (error) {
      console.error("Error:", error);
      finalBooks = [];
    } finally {
      spinner.style.display = "none";
    }
  } else {
    spinner.style.display = "block";
    try {
      const allRespond = genres.map((genre) => {
        return fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
            query,
          )}+subject:${genre}&startIndex=${startIndex}&maxResults=${bookPerPage}&key=${API_KEY}`,
        ).then((response) => response.json());
      });
      const results = await Promise.all(allRespond);

      const allItems = results.map((result) => result?.items || []).flat();
      const uniqueItems = [];

      for (const book of allItems) {
        if (book && book.id) {
          const alreadyExists = uniqueItems.some((item) => item.id === book.id);
          if (!alreadyExists) {
            uniqueItems.push(book);
          }
        }
      }
      finalBooks = uniqueItems;
    } catch (error) {
      console.error("Error:", error);
      finalBooks = [];
    } finally {
      spinner.style.display = "none";
    }
  }
  console.log(finalBooks);

  const lowerExcludeGenres = excludeGenres.map((genre) => genre.toLowerCase());

  const filteredData = finalBooks.filter((book) => {
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

  loadBooks(filteredData, currentPage);
}
searchBooks();
