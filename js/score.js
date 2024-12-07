import { apiURL, retryRequest } from "./request_sender.js";

const myLeaderboardList = document.getElementById("leaderboard-list");

let myUsersData = [];
let myItemsPerPage = 5;
let myCurrentPage = 0;
let myTotalPages = 0;

const populateLeaderboard = () => {
  myLeaderboardList.innerHTML = "";

  myUsersData
    .slice(
      myCurrentPage * myItemsPerPage,
      myCurrentPage * myItemsPerPage + myItemsPerPage
    )
    .forEach((player) => {
      const listItem = document.createElement("li");
      listItem.className = "list-group-item d-flex justify-content-between align-items-center";

      const playerName = document.createElement("span");
      playerName.textContent = player.Login;

      const playerScore = document.createElement("span");
      playerScore.className = "badge bg-primary rounded-pill";
      playerScore.textContent = player.Score;

      listItem.appendChild(playerName);
      listItem.appendChild(playerScore);
      myLeaderboardList.appendChild(listItem);
    });
};

const loadLeaderboardData = async () => {
  try {
    const response = await retryRequest(`${apiURL}/players`, { method: "GET" });
    myUsersData = await response.json();
    myTotalPages = Math.ceil(myUsersData.length / myItemsPerPage);

    populateLeaderboard(); 
  } catch (error) {
    console.error("Ошибка при загрузке данных лидеров:", error);
  }
};

let currentFilter = null;

function filterPlayersByColor(color) {
  currentFilter = color; 
  
  const filteredPlayers = myUsersData.filter(player => player.Color === color);

  if (filteredPlayers.length === 0) {
    myLeaderboardList.innerHTML = "Нет игроков с таким цветом!";
    return;
  }

  myLeaderboardList.innerHTML = "";
  filteredPlayers.forEach((player) => {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item d-flex justify-content-between align-items-center";

    const playerName = document.createElement("span");
    playerName.textContent = player.Login;

    const playerScore = document.createElement("span");
    playerScore.className = "badge bg-primary rounded-pill";
    playerScore.textContent = player.Score;

    listItem.appendChild(playerName);
    listItem.appendChild(playerScore);
    myLeaderboardList.appendChild(listItem);
  });
}


document.getElementById("red").onclick = () => {
  filterPlayersByColor("red");
};

document.getElementById("green").onclick = () => {
  filterPlayersByColor("green");
};

document.getElementById("yellow").onclick = () => {
  filterPlayersByColor("yellow");
};

document.getElementById("blue").onclick = () => {
  filterPlayersByColor("blue");
};

document.querySelectorAll(".pagination > li").forEach((pageButton) => {
  pageButton.onclick = (event) => {
    myCurrentPage = Math.max(
      0,
      Math.min(+event.target.dataset.value, myTotalPages - 1)
    );
    populateLeaderboard();
  };
});

document.querySelectorAll(".buttons-count button").forEach((countButton) => {
  countButton.onclick = (event) => {
    myItemsPerPage = +event.target.textContent;
    myTotalPages = Math.ceil(myUsersData.length / myItemsPerPage);
    myCurrentPage = 0; 
    populateLeaderboard();
  };
});

document.querySelectorAll(".sort-icon").forEach((sortButton) => {
  sortButton.onclick = (event) => {
    const sortField = event.target.dataset.type;
    const sortDirection =
      myLeaderboardList.dataset.sortDirection === "asc" ? "desc" : "asc";
    myLeaderboardList.dataset.sortDirection = sortDirection;

    myUsersData.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (sortField === "Score") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    populateLeaderboard();
  };
});

document.querySelector(".search-container > input")?.addEventListener("input", (event) => {
  const searchQuery = event.target.value.toLowerCase();
  const filteredPlayers = myUsersData.filter((player) =>
    player.Login.toLowerCase().includes(searchQuery)
  );

  myLeaderboardList.innerHTML = ""; 
  filteredPlayers.forEach((player) => {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item d-flex justify-content-between align-items-center";

    const playerName = document.createElement("span");
    playerName.textContent = player.Login;

    const playerScore = document.createElement("span");
    playerScore.className = "badge bg-primary rounded-pill";
    playerScore.textContent = player.Score;

    listItem.appendChild(playerName);
    listItem.appendChild(playerScore);
    myLeaderboardList.appendChild(listItem);
  });
});

loadLeaderboardData();
