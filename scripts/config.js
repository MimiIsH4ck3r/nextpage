export const API_KEY = "AIzaSyBFp9esiRmoHXSH0sZ9gDfE9j3EeWQKKK4";

window.handleSignOut = () => {
  localStorage.removeItem("currentUser");
  // localStorage.removeItem("cart");
  location.reload();
};

window.signIn = () => {};

//// Nếu người dùng đăng đăng nhập.
if (localStorage.getItem("currentUser")) {
  document.querySelector("#profile-container").innerHTML += /*html*/ `
    <div tabindex="0" class="avatar">
      <img src="" />
      <div class="popup">
        <button class="action-button" onclick="handleSignOut()">
        </button>
      </div>
    </div>
  `;
} else {
  document.querySelector("#profile-container").innerHTML += /*html*/ `
    <a style="font-size: 25px" href="./login.html">
      <i class="fa-solid fa-right-to-bracket"></i>
    </a>
  `;
}
