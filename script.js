let publicKey = "56e0628701c1c231592b72589a11fdd9";
let privateKey = "ff5d6123be0b350d257060506ead64aab4289460";

// create a function to generate a hash value for the Marvel API request
function generateHash(timestamp, privateKey, publicKey) {
  let message = timestamp + privateKey + publicKey;
  let hash = CryptoJS.MD5(message).toString();
  return hash;
}

// create variable to get the elements from HTML page
let input = document.getElementById("searchInput");
let button = document.getElementById("searchButton");
let showResult = document.getElementById("searchResult");
let listContainer = document.querySelector(".list");

// create a function to display the value in the input element and remove any existing elements
function displayWords(value) {
  input.value = value;
  removeElements();
}

// create a function to remove all elements from the list container
function removeElements() {
  listContainer.innerHTML = "";
}

// crete a function for the more details on superhero
function More_Details() {
  // Get the character name from the HTML element
  let characterName = document.querySelector(".character-name").textContent;

  // Generate the timestamp, hash, and URL for the API request
  const timestamp = new Date().getTime();
  const hash = CryptoJS.MD5(timestamp + privateKey + publicKey).toString();
  const url = `https://gateway.marvel.com:443/v1/public/characters?ts=${timestamp}&apikey=${publicKey}&hash=${hash}&name=${characterName}`;

  // API request
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // character data from the API response
      const character = data.data.results[0];

      // other information provided by the API (comics, events, series, stories, etc.)
      const comics = character.comics.items;
      const events = character.events.items;
      const series = character.series.items;
      const stories = character.stories.items;

      // get the character data in local storage so it can be accessed by the new page
      localStorage.setItem("characterData", JSON.stringify(character));

      // Redirect to a new page in your application to display the additional details about the superhero in the same tab
      window.location.href = "moreDetails.html";
    });
}

// Add an event listener for when a key is released while the input element is focused
input.addEventListener("keyup", async () => {
  removeElements();
  if (input.value.length < 2) {return false; }
  let timestamp = new Date().getTime();
  let hashValue = generateHash(timestamp, privateKey, publicKey);
  const url = `https://gateway.marvel.com:443/v1/public/characters?ts=${timestamp}&apikey=${publicKey}&hash=${hashValue}&nameStartsWith=${input.value}`;
  const response = await fetch(url);
  const jsonData = await response.json();
  jsonData.data["results"].forEach((result) => {
    let name = result.name;
    let div = document.createElement("div");
    div.style.cursor = " pointer";
    div.classList.add("autocomplete-items");
    div.setAttribute("onclick", "displayWords('" + name + "')");
    let word = "<b>" + name.substr(0, input.value.length) + "</b>";
    word += name.substr(input.value.length);
    // Add image and favourite button to each result
    let img = document.createElement("img");
    img.src = result.thumbnail["path"] + "." + result.thumbnail["extension"];
    let favouriteButton = document.createElement("button");
    favouriteButton.textContent = favourites.some(favourite => favourite.name === name) ? "Added To Favourites" : "Add to Favourites";
    favouriteButton.onclick = function(event) {
      event.stopPropagation(); // Prevent the click from triggering the onclick of the parent div
      favourite(name, img.src);
      favouriteButton.textContent = favourites.some(favourite => favourite.name === name) ? "Added To Favourites" : "Add to Favourites";
    };
    div.appendChild(img);
    div.appendChild(document.createElement("br"));
    div.innerHTML += `<p class= "item">${word}</p>`;
    div.appendChild(favouriteButton);
    listContainer.appendChild(div);
  });
});


// Add an event listener for when the search button is clicked
button.addEventListener("click", (getResult = async () => {
  if (input.value.trim().length < 1) {
    alert("Input Can't be empty !");
  }
  else {
    removeElements();
    showResult.innerHTML = "";
    let timestamp = new Date().getTime();
    let hashValue = generateHash(timestamp, privateKey, publicKey);
    const url = `https://gateway.marvel.com:443/v1/public/characters?ts=${timestamp}&apikey=${publicKey}&hash=${hashValue}&name=${input.value}`;
    const response = await fetch(url);
    const jsonData = await response.json();
    jsonData.data["results"].forEach(element => {
      showResult.innerHTML = `<div class="card-container">
              <div class="container-character-image">
                  <img src="${element.thumbnail["path"] + "." + element.thumbnail["extension"]}" />
              </div>
              <div class="character-name">${element.name}</div>
              <div class="character-description">${element.description}</div>
              <button id="moreDetailsButton" onclick="More_Details()">More Details</button>
          </div>`;
    });
  }
}));
