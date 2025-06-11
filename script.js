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
