export const API_KEY = "AIzaSyBFp9esiRmoHXSH0sZ9gDfE9j3EeWQKKK4";

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
      <img src="./assets/default-profile-picture.jpg" alt="Profile picture">
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
