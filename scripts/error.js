const searchParams = new URLSearchParams(location.search);
const errorMessage = searchParams.get("message")?.trim();

const errorElement = document.getElementById("error");

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

function checkErrorStatus(status) {
  const errorDictionary = {
    403: {
      title: "Access Denied",
      desc: "Your account or IP address has been restricted from accessing this app.",
    },
    404: {
      title: "Page Not Found",
      desc: "The page you are looking for doesn't exist or has been moved.",
    },
    410: {
      title: "Resource Gone",
      desc: "This feature or archive has been permanently removed from our servers.",
    },
    429: {
      title: "Too Many Requests",
      desc: "Too many requests in a given amount of time. Please try again later.",
    },
    451: {
      title: "Unavailable Legally",
      desc: "This content is unavailable in your region due to local licensing laws.",
    },
    500: {
      title: "Internal Server Error",
      desc: "Our servers encountered an internal crash. We are fixing it right now.",
    },
    502: {
      title: "Bad Gateway",
      desc: "Our server gateway received an invalid response. Please try refreshing.",
    },
    503: {
      title: "Under Maintenance",
      desc: "We are currently upgrading our systems. Please check back in a few minutes.",
    },
    504: {
      title: "Gateway Timeout",
      desc: "The server took too long to respond. Your network route timed out.",
    },
  };

  const urlParams = new URLSearchParams(window.location.search);
  const statusCode = urlParams.get("status") || "500";

  if (errorDictionary[statusCode]) {
    errorElement.innerHTML = `<h2>Error ${statusCode} <i class="fa-solid fa-circle-exclamation"></i></h2>
    <h3>${errorDictionary[statusCode].title}</h3>
    <p class="txt-sec-color">${errorDictionary[statusCode].desc}</p>`;
    console.error(
      `Error ${statusCode}: ${errorDictionary[statusCode].title} - ${errorDictionary[statusCode].desc}
      ${errorMessage ? errorMessage : ""}`,
    );
  }
}

checkErrorStatus(status);
