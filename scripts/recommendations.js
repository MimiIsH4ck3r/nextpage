import { API_KEY } from "./config.js";
import { shortenText } from "./config.js";
import { genresList } from "./config.js";
import { handleError } from "./config.js";

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

//localStorage.removeItem("history");
function checkDate(bookDate, bookTime, currentDate, yesterday) {
  if (bookDate === currentDate) {
    return "Today at " + bookTime;
  }
  if (bookDate === yesterday) {
    return "Yesterday at " + bookTime;
  }
  return bookDate + " at " + bookTime;
}

const recentBooks = document.getElementById("recentBooks");
function loadRecentBooks() {
  if (!currentUser) {
    recentBooks.innerHTML = `
      <div class="text-center">
        <h4 class="txt-color mb-2">Login to See Recent Books</h4>
        <p class="txt-sec-color">Try browsing our collection with an account to see your recent views here.</p>
      </div>`;
    return;
  }
  const history = currentUser.history || [];
  console.log("History:", history);

  const currentDate = new Date()
    .toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" })
    .split(" ")[0];

  const yesterdayDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
  );
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toLocaleDateString("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  if (history.length === 0) {
    recentBooks.innerHTML = `  
      <div class="text-center">
        <h4 class="txt-color mb-2">No Recently Viewed Books</h4>
        <p class="txt-sec-color">Try browsing our collection to see your recent views here.</p>
      </div>`;
  } else {
    let html = "";
    html = history
      .slice(0, 6)
      .map((item) => {
        if (!item.timestamp) return "";

        const bookDate = item.timestamp.split(" ")[0];
        const bookTime =
          item.timestamp.split(" ")[1]?.slice(0, 8) || "00:00:00";

        return `
        <div class="col-lg-6 col-md-12">
          <div class="featured-book card-light">
              <div class="text-center">
                <img src="${
                  item.bookThumbnail ??
                  `https://placehold.co/128x190?text=No+Image`
                }" class="featured-img" />
              </div>

              <div>
                <h3 class="txt-color">
                  ${item.bookTitle || "Untitled"}
                </h3>
                <p class="txt-sec-color"> Last viewed:
                 ${checkDate(bookDate, bookTime, currentDate, yesterday)}
                </p>

                <a href="./books.html?id=${item.id}" class="btn btn-outline-light">View Details</a>
              </div>
          </div>
        </div>
      `;
      })
      .join("");
    recentBooks.innerHTML = `<div class="row g-4">${html}</div>`;
  }
}

function mapMainGenres(genres) {
  const lowerText = genres.toLowerCase();
  return genresList.filter((genre) => lowerText.includes(genre.toLowerCase()));
}

function getTop(scoreObject, limit) {
  const entries = Object.entries(scoreObject);
  if (entries.length === 0) return [];

  const sortedEntries = entries.sort((a, b) => b[1] - a[1]);

  return sortedEntries.slice(0, limit).map((entry) => entry[0]);
}

const recommendedBooks = document.getElementById("recommendedBooks");
async function fetchRecommendedBooks() {
  let recommendAuthors = {};
  let recommendCategories = {};
  if (!currentUser) return [];
  const history = currentUser.history || [];
  history.forEach((item) => {
    item.bookAuthors?.forEach((author) => {
      if (recommendAuthors[author]) {
        recommendAuthors[author] += 2;
      } else {
        recommendAuthors[author] = 2;
      }
    });
    item.bookCategories?.forEach((category) => {
      mapMainGenres(category).forEach((mainGenre) => {
        if (recommendCategories[mainGenre]) {
          recommendCategories[mainGenre] += 1;
        } else {
          recommendCategories[mainGenre] = 1;
        }
      });
    });
  });

  const isAuthor = Math.round(Math.random());
  const topRecommendations =
    isAuthor == 0
      ? getTop(recommendCategories, 2)
      : getTop(recommendAuthors, 1);

  if (topRecommendations.length === 0) return [];
  try {
    const requests = topRecommendations.map(async (searchKey) => {
      const queryParam = isAuthor
        ? `inauthor:"${searchKey}"`
        : `subject:"${searchKey}"`;

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(queryParam)}&maxResults=6&key=${API_KEY}`,
      );

      if (response.status === 503) {
        console.error(
          `Google Indexing Outage for query "${searchKey}". This recommendation cannot be completed.`,
        );
        return [];
      }
      if (response.status === 429) {
        console.error(
          `Rate limit exceeded for query "${searchKey}". This recommendation cannot be completed.`,
        );
        return [];
      }
      if (!response.ok) {
        const error = new Error("HTTP connection failed");
        error.status = response.status;
        throw error;
      }
      const data = await response.json();
      return data.items || [];
    });
    if (requests.length === 0) return false;
    const allItems = await Promise.all(requests);

    const finalBooks = allItems.flat();
    for (let i = finalBooks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [finalBooks[i], finalBooks[j]] = [finalBooks[j], finalBooks[i]];
    }
    const books = finalBooks.slice(0, 6);

    console.log("Final Recommended Items Array:", books);
    return books;
  } catch (error) {
    console.error(
      "Failed to fetch recommendation items from Google Books:",
      error,
    );
    handleError(error.status || 500, error);
    return false;
  }
}

async function loadRecommendedBooks() {
  const fetchResults = await fetchRecommendedBooks();
  if (fetchResults == 429) {
    recommendedBooks.innerHTML = `      
      <div class="text-center py-5">
        <h4 class="txt-color mb-2">Rate Limit Exceeded</h4>
        <p class="txt-sec-color">Please try again later.</p>
      </div>`;
    return false;
  }
  if (!fetchResults || fetchResults.length === 0) {
    recommendedBooks.innerHTML = `      
      <div class="text-center py-5">
        <h4 class="txt-color mb-2">No Recommendations Available</h4>
        <p class="txt-sec-color">Try browsing our collection to see personalized recommendations here.</p>
      </div>`;
    return false;
  } else {
    let html = "";
    html = fetchResults
      .map((item) => {
        return `
        <div class="col-lg-6 col-md-12">
          <div class="featured-book card-light">
              <div class="text-center">
                <img src="${
                  item.volumeInfo?.imageLinks?.thumbnail ??
                  `https://placehold.co/128x190?text=No+Image`
                }" class="featured-img" />
              </div>

              <div>
                <h3 class="txt-color">
                  ${shortenText(item.volumeInfo?.title, 40) || `Untitled`}
                </h3>
                <p class="txt-sec-color"> 
                ${shortenText(item.volumeInfo?.description, 200) || `No description available`}
                </p>

                <a href="./books.html?id=${item.id}" class="btn btn-outline-light">View Details</a>
              </div>
          </div>
        </div>
      `;
      })
      .join("");
    recommendedBooks.innerHTML = `<div class="row g-4">${html}</div>`;
  }
}

window.addEventListener("pageshow", (event) => {
  const freshUser = JSON.parse(localStorage.getItem("currentUser"));
  if (freshUser) {
    currentUser.history = freshUser.history || [];
  }

  loadRecentBooks();
});
loadRecommendedBooks();
