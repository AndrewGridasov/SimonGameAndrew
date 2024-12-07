var buttonColors = ["red", "green", "yellow", "blue"];
var gamePattern = [];
var userClickedPattern = [];
var started = false;
var level = 0;
var clickEnabled = false;
var userName = "";

// Получаем имя пользователя из localStorage
$(document).ready(function () {
    userName = localStorage.getItem('currentUserName');  // Извлекаем имя из localStorage
    if (userName) {
        document.getElementById('current-user').textContent = "Текущий пользователь: " + userName;
        document.getElementById('user-name').textContent = "Добро пожаловать, " + userName + "!";
    } else {
        document.getElementById('current-user').textContent = "Текущий пользователь: Не указан";
        document.getElementById('user-name').textContent = "Добро пожаловать, Гость!";
    }
    
    loadLeaderboard();

    $("#filter-name").on("input", applyFiltersAndSort);
    $("#filter-color").on("change", applyFiltersAndSort);
    $("#sort-order").on("change", applyFiltersAndSort);
});

// Функция для сохранения результата игры
function saveGameResult(playerName, score) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const timestamp = new Date().getTime();

    const playerIndex = leaderboard.findIndex(entry => entry.name === playerName);

    if (playerIndex !== -1) {
        leaderboard[playerIndex] = { name: playerName, score: score, timestamp: timestamp };
    } else {
        leaderboard.push({ name: playerName, score: score, timestamp: timestamp });
    }

    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

// Функция для отображения результатов
function loadLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    let currentTime = new Date().getTime();

    leaderboard = leaderboard.filter(function(entry) {
        return (currentTime - entry.timestamp) <= 180000; 
    });

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    displayLeaderboard(leaderboard);
}

// Отображаем список лидеров
function displayLeaderboard(data) {
    var leaderboardList = $("#leaderboard-list");
    leaderboardList.empty(); 

    if (data.length === 0) {
        leaderboardList.append("<li class='list-group-item'>Пока нет рекордов</li>");
    } else {
        data.forEach(function (entry) {
            leaderboardList.append(
                "<li class='list-group-item'>" +
                "<strong>" + entry.name + "</strong> — Уровень: " + entry.score +
                "</li>"
            );
        });
    }
}

function applyFiltersAndSort() {
    var leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    var filterName = $("#filter-name").val().toLowerCase();
    var filterColor = $("#filter-color").val();
    var sortOrder = $("#sort-order").val();

    var filteredData = leaderboard.filter(function (entry) {
        var matchesName = entry.name.toLowerCase().includes(filterName);
        return matchesName;
    });

    if (sortOrder === "name") {
        filteredData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "score") {
        filteredData.sort((a, b) => b.score - a.score);
    }

    displayLeaderboard(filteredData);
}

$("#play-button").click(function () {
    startGame();
});

function startGame() {
    level = 0;
    gamePattern = [];
    userClickedPattern = [];
    started = false;
    clickEnabled = false;

    $("#level-title").text("Уровень " + level);
    $("#game-buttons").removeClass("d-none"); 
    nextSequence();
}

$(".simon-btn").click(function () {
    if (!clickEnabled || userClickedPattern.length >= gamePattern.length) return; 

    var userChosenColor = $(this).attr("id");
    userClickedPattern.push(userChosenColor);
    playSound(userChosenColor);
    animatePress(userChosenColor);
    checkAnswer(userClickedPattern.length - 1);
});

function checkAnswer(currentLevel) {
    if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
        if (userClickedPattern.length === gamePattern.length) {
            setTimeout(function () {
                nextSequence();
            }, 1000);
        }
    } else {
        playSound("wrong");
        $("body").addClass("game-over");
        $("#level-title").text("Игра окончена, " + userName + ". Нажмите 'Играть', чтобы начать заново");

        clickEnabled = false;

        setTimeout(function () {
            $("body").removeClass("game-over");
        }, 200);

        saveGameResult(userName, level);

        $("#play-button").removeClass("d-none"); 
    }
}

function nextSequence() {
    userClickedPattern = [];
    level++;
    $("#level-title").text("Уровень " + level);
    var randomNumber = Math.floor(Math.random() * 4);
    var randomChosenColor = buttonColors[randomNumber];
    gamePattern.push(randomChosenColor);

    showSequence();
}

function showSequence() {
    clickEnabled = false; 
    var i = 0;
    var intervalId = setInterval(function () {
        var currentColor = gamePattern[i];
        $("#" + currentColor).fadeIn(100).fadeOut(100).fadeIn(100);
        playSound(currentColor);
        i++;
        if (i >= gamePattern.length) {
            clearInterval(intervalId);
            clickEnabled = true; 
        }
    }, 600);
}

function playSound(color) {
    var audio;
    if (color === "wrong") {
        audio = new Audio("sounds/windows-error-sound-effect-35894.mp3");
    } else {
        audio = new Audio("sounds/item-pick-up-38258.mp3");
    }
    audio.play().catch(function (error) {
        console.error("Ошибка воспроизведения звука:", error);
    });
}

function animatePress(currentColor) {
    $("#" + currentColor).addClass("pressed");
    setTimeout(function () {
        $("#" + currentColor).removeClass("pressed");
    }, 100);
}

function generateRandomName() {
    const randomName = 'Игрок' + Math.floor(Math.random() * 1000);
    alert('Сгенерированное имя: ' + randomName);
    window.location.href = 'game.html?playerName=' + randomName;
}
