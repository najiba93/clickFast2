let count = 0;
let timeLeft = 5;
let timerRunning = false;
const counterDisplay = document.getElementById('counter');
const timerDisplay = document.getElementById('timer');
const button = document.getElementById('incrementBtn');
const usernameInput = document.getElementById('username');
const scoreboardBtn = document.getElementById('scoreboardBtn');
const resetBtn = document.getElementById('resetBtn');
const scoreboard = document.getElementById('scoreboard');

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createShape() {
    const shape = document.createElement('div');
    shape.classList.add('shape');
    shape.style.backgroundColor = getRandomColor();
    shape.style.left = `${Math.random() * (window.innerWidth - 30)}px`;
    shape.style.top = `${window.innerHeight - 50}px`;
    document.body.appendChild(shape);
    setTimeout(() => shape.remove(), 2000);
}

function updateCounter() {
    count++;
    counterDisplay.textContent = count;
    counterDisplay.classList.add('pulse');
    setTimeout(() => counterDisplay.classList.remove('pulse'), 300);
    createShape();
}

function startTimer() {
    if (!timerRunning) {
        timerRunning = true;
        const timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Temps restant : ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                timerDisplay.textContent = "Temps écoulé !";
                button.disabled = true;
                postScore();
            }
        }, 1000);
    }
}

function fetchScores() {
    console.log('Fetching scores from localStorage...');
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    console.log('Scores fetched:', scores);
    return scores;
}

function checkExistingScore(username) {
    console.log(`Checking existing score for username: ${username}`);
    const scores = fetchScores();
    const existingScore = scores.find(score => score.username.toLowerCase() === username.toLowerCase());
    console.log('Existing score:', existingScore);
    return existingScore || null;
}

function postScore() {
    const username = usernameInput.value.trim() || "Anonyme";
    console.log(`Posting score for ${username} with ${count} points`);
    const existingScore = checkExistingScore(username);
    const data = {
        createdAt: new Date().toISOString(),
        username: username,
        avatar: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.ytimg.com%2Fvi%2F0EpIWybDPfI%2Fhqdefault.jpg",
        score: count,
        website_url: "onyj.github.io/ClickFast"
    };

    let scores = fetchScores();
    if (existingScore) {
        if (count > existingScore.score) {
            console.log(`Updating score for ${username} from ${existingScore.score} to ${count}`);
            scores = scores.map(score => 
                score.username.toLowerCase() === username.toLowerCase() ? data : score
            );
            localStorage.setItem('scores', JSON.stringify(scores));
        } else {
            console.log(`No update: ${count} is not higher than ${existingScore.score}`);
        }
    } else {
        console.log(`Adding new score for ${username}`);
        scores.push(data);
        localStorage.setItem('scores', JSON.stringify(scores));
    }
    console.log('Scores after post:', fetchScores());
}

function getScores() {
    console.log('getScores called');
    const scores = fetchScores();
    console.log(`Scores to display: ${scores.length} entries`);

    if (scores.length === 0) {
        console.log('No scores available');
        scoreboard.innerHTML = "<p>Aucun score disponible.</p>";
        scoreboard.style.display = "block";
        return;
    }

    const uniqueScores = [];
    const seenUsernames = new Set();
    for (const score of scores.sort((a, b) => b.score - a.score)) {
        if (!seenUsernames.has(score.username.toLowerCase())) {
            uniqueScores.push(score);
            seenUsernames.add(score.username.toLowerCase());
        }
    }
    console.log('Unique scores:', uniqueScores);

    displayScores(uniqueScores.slice(0, 10));
}

function displayScores(scores) {
    console.log('Displaying scores:', scores);
    try {
        scoreboard.style.display = "block";
        scoreboard.innerHTML = "<h2>Scoreboard</h2><ul>" + 
            scores.map(score => `<li>${score.username} : ${score.score} points</li>`).join('') + 
            "</ul>";
        console.log('Scoreboard updated successfully');
    } catch (error) {
        console.error('Error displaying scores:', error);
        scoreboard.innerHTML = "<p>Erreur lors de l'affichage des scores.</p>";
        scoreboard.style.display = "block";
    }
}

function resetGame() {
    console.log('resetGame called');
    try {
        count = 0;
        timeLeft = 5;
        timerRunning = false;
        counterDisplay.textContent = count;
        timerDisplay.textContent = `Temps restant : ${timeLeft}s`;
        button.disabled = false;
        scoreboard.style.display = 'none';
        console.log('Game reset successfully');
    } catch (error) {
        console.error('Error resetting game:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, attaching event listeners');
    if (!button) console.error('incrementBtn not found');
    if (!scoreboardBtn) console.error('scoreboardBtn not found');
    if (!resetBtn) console.error('resetBtn not found');
    button.addEventListener('click', () => {
        if (!usernameInput.value.trim()) {
            alert("Veuillez entrer un pseudo !");
            return;
        }
        startTimer();
        if (timeLeft > 0) {
            updateCounter();
        }
    });
    scoreboardBtn.addEventListener('click', () => {
        console.log('Scoreboard button clicked');
        getScores();
    });
    resetBtn.addEventListener('click', resetGame);
});