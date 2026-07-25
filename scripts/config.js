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

export function shortenDescription(des, length) {
  if (des && des.length > length) {
    let newDes =
      des.slice(0, length) + `... (click "View details" to see more)`;
    return newDes;
  }
  return des || "No description available.";
}
window.handleSignOut = () => {
  localStorage.removeItem("currentUser");
  // localStorage.removeItem("cart");
  location.reload();
};

window.signIn = () => {};

//// Nếu người dùng đăng đăng nhập.
if (localStorage.getItem("currentUser")) {
  document.getElementById("profile-container").innerHTML += /*html*/ `
    <div tabindex="0" class="profile">
      <img class="profile-img" src="./assets/default-profile-picture.jpg" alt="Profile picture">
      <nav class="popup">
        <button class="profile-button" onclick=""> 
          <i class=""></i>
          <span> Profile</span>
        </button> 
        <button class="profile-button" onclick="handleSignOut()"> 
          <i class="fa-solid fa-right-from-bracket"></i>
          <span> Logout</span>
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
