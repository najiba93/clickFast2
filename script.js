document.addEventListener("DOMContentLoaded", () => {
    let score = 0;
    let timeLeft = 5;
    let timerRunning = false;

    const buttonClicker = document.getElementById("button-clicker");
    const scoreElement = document.getElementById("score");
    const timerElement = document.getElementById("timer");
    const resetButton = document.getElementById("button-reset");

    function startTimer() {
        if (!timerRunning) {
            timerRunning = true;
            const timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    timerElement.textContent = timeLeft;
                } else {
                    clearInterval(timerInterval);
                    timerRunning = false;
                }
            }, 1000);
        }
    }

    buttonClicker.addEventListener("click", () => {
        if (timeLeft > 0) {
            score++;
            scoreElement.textContent = score;
            startTimer();
        }
    });

    resetButton.addEventListener("click", () => {
        score = 0;
        timeLeft = 5;
        scoreElement.textContent = score;
        timerElement.textContent = timeLeft;
        timerRunning = false;
    });
});
document.body.innerHTML = `
    <div id="score">0</div>
    <button id="button-clicker">Click me!</button>
`;

const { handleGameButton } = require("./script.js");

test("Le score s'incrémente après un clic", () => {
    const button = document.getElementById("button-clicker");
    const score = document.getElementById("score");

    button.click(); // Simuler un clic
    expect(parseInt(score.textContent)).toBeGreaterThan(0);
});
document.body.innerHTML = `
    <div id="timer">5</div>
`;

const { startTimer } = require("./script.js");

test("Le timer doit décompter correctement", (done) => {
    const timer = document.getElementById("timer");
    startTimer(); // Simuler le début du jeu

    setTimeout(() => {
        expect(parseInt(timer.textContent)).toBe(0);
        done();
    }, 6000); // Attendre 6 secondes pour s'assurer que le timer est à 0
});
document.body.innerHTML = `
    <div id="score">10</div>
    <button id="button-reset">Reset</button>
`;

const { handleResetButton } = require("./script.js");

test("Le score revient à zéro après un reset", () => {
    const resetButton = document.getElementById("button-reset");
    const score = document.getElementById("score");

    resetButton.click(); // Simuler un reset
    expect(parseInt(score.textContent)).toBe(0);
});
module.exports = { startTimer, handleGameButton, handleResetButton };
const postData = async (username, score) => {
  const url = "https://672e1217229a881691eed80f.mockapi.io/scores";
  const data = {
    createdAt: new Date().toISOString(),
    username: username,
    score: score,
    avatar: "https://example.com/avatar.jpg", // Change l'URL selon besoin
    website_url: "https://najiba93.github.io/clickFast2/"
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Erreur lors de l'envoi");

    console.log("Score enregistré :", await response.json());
  } catch (error) {
    console.error("Erreur d'enregistrement :", error);
  }
};

// Utilisation : postData("Najiba", 150);

const getData = async () => {
  const url = "https://672e1217229a881691eed80f.mockapi.io/scores";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erreur de récupération");

    const data = await response.json();
    console.log("Scores récupérés :", data);
  } catch (error) {
    console.error("Erreur :", error);
  }
};

// Utilisation : getData();

const displayScores = async () => {
  const url = "https://672e1217229a881691eed80f.mockapi.io/scores";
  const scoreList = document.getElementById("score-list");

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erreur de récupération");

    const data = await response.json();
    scoreList.innerHTML = ""; // Nettoyer la liste

    data.sort((a, b) => b.score - a.score); // Trier par score décroissant

    data.forEach(user => {
      const listItem = document.createElement("li");
      listItem.textContent = `${user.username} - ${user.score} pts`;
      scoreList.appendChild(listItem);
    });

    console.log("Scores affichés !");
  } catch (error) {
    console.error("Erreur :", error);
  }
};

// Affichage automatique au chargement de la page
document.addEventListener("DOMContentLoaded", displayScores);


