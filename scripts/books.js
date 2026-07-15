import { API_KEY } from "./config.js";

const searchParams = new URLSearchParams(location.search);
const id = searchParams.get("id");

async function loadDetails() {
  if (!id) {
    console.error("No book ID found in the URL.");
    return;
  }

  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${id}?key=${API_KEY}`,
  );
  const data = await response.json();
  console.log(data);

  const detail = document.querySelector(".detail-div");
  detail.innerHTML = `
    <div class="col-md-3 book-img">
      <img src="${
        data.volumeInfo.imageLinks?.thumbnail ??
        "https://placehold.co/128x190?text=No+Image"
      }" alt="${data.volumeInfo.title} Cover" />
    </div>

    <div class="col-md-9">
      <h1 class="book-title txt-color heading">
        ${data.volumeInfo.title}
      </h1>
      <p>Rating: ${data.volumeInfo.averageRating ?? "No rating yet"}</p>
      <p class="author txt-sec-color">by ${
        data.volumeInfo.authors
          ? data.volumeInfo.authors.join(", ")
          : "No author"
      }</p>
 
      <p class="price">${data.saleInfo?.retailPrice?.amount ? data.saleInfo?.saleability.replaceAll("_", " ") + ": " + data.saleInfo.retailPrice.amount + data.saleInfo.retailPrice.currencyCode : data.saleInfo?.saleability.replaceAll("_", " ")}</p>

      <div class="txt-sec-color description">
        <h4 class="txt-color">Description</h4>
          ${data.volumeInfo.description ?? "No description available."}
      </div>
      <div class="txt-sec-color">
        <h4 class="txt-color">More Details</h4>
        <div class="more-details">
          <p>${data.volumeInfo.language ? "Language: " + data.volumeInfo.language : ""}</p>
          <p>${data.volumeInfo.pageCount ? "Page Count: " + data.volumeInfo.pageCount : ""} pages</p>
          <p>${data.volumeInfo.publisher ? "Publisher: " + data.volumeInfo.publisher : ""} </p>
          <p>${data.volumeInfo.publishedDate ? "Published Date: " + data.volumeInfo.publishedDate : ""} </p>
          <p>${data.volumeInfo.mainCategory ? "Main Category: " + data.volumeInfo.mainCategory : ""} </p>
          <p>${data.volumeInfo.averageRating ? "Average Rating: " + data.volumeInfo.averageRating : ""} </p>
          <p>${data.volumeInfo.ratingsCount ? "Ratings Count: " + data.volumeInfo.ratingsCount : ""} </p>
          <p>${data.volumeInfo.saleability ? "Saleability: " + data.volumeInfo.saleability.replaceAll("_", ",").toLowerCase() : ""} </p>
          <p>${data.volumeInfo.isEbook ? "Available on ebook" : "Not available on ebook"} </p>
          <p>${data.volumeInfo.listPrice ? "List Price:" + data.volumeInfo.listPrice.amount + data.volumeInfo.listPrice.currencyCode : ""} </p>
          <p>${data.saleInfo.retailPrice ? "Retail Price:" + data.volumeInfo.retailPrice.amount + data.volumeInfo.retailPrice.currencyCode : ""} </p>
          <p>${data.saleInfo.retailPrice ? "<a>Link here to </a>Retail Price:" + data.volumeInfo.retailPrice.amount + data.volumeInfo.retailPrice.currencyCode : ""} </p>
          <p>${data.saleInfo?.buyLink ? `<p><a href="${data.saleInfo.buyLink}" target="_blank">Buy Link here</a></p>` : ""}</p>
        </div>
      </div>
    </div>`;
}
loadDetails();
