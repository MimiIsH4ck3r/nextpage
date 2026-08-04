//localStorage.clear();

export const API_KEY = "AIzaSyBFp9esiRmoHXSH0sZ9gDfE9j3EeWQKKK4";

export function ratingStars(rating) {
  let stars = "";
  for (let i = 0; i < (rating | 0); i++) {
    stars += `<i class="fa-solid fa-star"></i>`;
  }
  if (rating % 1 != 0) {
    stars += `<i class="fa-solid fa-star-half-stroke"></i>`;
  }
  return stars + " ";
}

export function shortenText(text, length) {
  if (text && text.length > length) {
    let newText = text.slice(0, length) + `... `;
    return newText;
  }
  return text || "No description available.";
}

export const genresList = [
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
];

export function handleError(status, message) {
  console.error(`Error (${status}):`, message);
  window.location.href = `./error.html?status=${status}&message=${encodeURIComponent(message)}`;
}

const goBackButton = document.getElementById("goBack");
if (goBackButton) {
  goBackButton.addEventListener("click", () => {
    if (window.location.pathname.includes("/error.html")) {
      console.log("Redirecting to index.html");
      window.location.href = "./index.html";
    }
    window.history.back();
  });
}

window.signOut = () => {
  localStorage.removeItem("currentUser");
  location.reload();
};

window.signIn = () => {};

if (localStorage.getItem("currentUser")) {
  document.getElementById("profile-container").innerHTML += /*html*/ `
    <div tabindex="0" class="profile">
      <img class="profile-img" src="./assets/default-profile-picture.jpg" alt="Profile picture">
      <nav class="popup">
        <button class="profile-button" onclick=""> 
          <i class=""></i>
          <span> Profile</span>
        </button> 
        <button class="profile-button" onclick="signOut()"> 
        <span> ${JSON.parse(localStorage.getItem("currentUser")).username}</span>
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      </nav>
    </div>
  `;
} else {
  document.querySelector("#profile-container").innerHTML += /*html*/ `
    <a style="font-size: 25px" href="./login.html">
      <i class="fa-solid fa-right-to-bracket"></i>
    </a>
  `;
}
