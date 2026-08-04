if (localStorage.getItem("currentUser")) location.href = "././index.html";

let form = document.querySelector("form");
form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!localStorage.getItem("users")) {
    alert("No user found");
  } else {
    const users = JSON.parse(localStorage.getItem("users"));
    const username = document.getElementById("username");
    const password = document.getElementById("password");

    if (
      users.find(
        (index) =>
          index.username === username.value.trim() &&
          index.password === password.value.trim(),
      )
    ) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify(
          users.find(
            (index) =>
              index.username === username.value.trim() &&
              index.password === password.value.trim() &&
              index.history,
          ),
        ),
      );

      location.href = "/index.html";
    } else {
      alert("Username or password is incorrect");
    }
  }
});
