beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
        <input id="username" value="TestUser">
        <div id="counter">0</div>
        <div id="timer">Temps restant : 5s</div>
        <button id="incrementBtn">Incrémenter</button>
        <button id="scoreboardBtn">Voir le Scoreboard</button>
        <button id="resetBtn">Rejouer</button>
        <div id="scoreboard" style="display: none;"></div>
    `;
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

test('updateCounter increments count and creates shape', () => {
    const counterDisplay = document.getElementById('counter');
    updateCounter();
    expect(counterDisplay.textContent).toBe('1');
    expect(document.querySelector('.shape')).not.toBeNull();
});

test('postScore saves new score to localStorage', () => {
    count = 10;
    usernameInput.value = "TestUser";
    postScore();
    const scores = JSON.parse(localStorage.getItem('scores'));
    expect(scores.length).toBe(1);
    expect(scores[0].username).toBe("TestUser");
    expect(scores[0].score).toBe(10);
});

test('postScore updates existing score if higher', () => {
    localStorage.setItem('scores', JSON.stringify([{ username: "TestUser", score: 5 }]));
    count = 10;
    usernameInput.value = "TestUser";
    postScore();
    const scores = JSON.parse(localStorage.getItem('scores'));
    expect(scores.length).toBe(1);
    expect(scores[0].score).toBe(10);
});

test('getScores displays scores in scoreboard', () => {
    localStorage.setItem('scores', JSON.stringify([
        { username: "User1", score: 15 },
        { username: "User2", score: 10 }
    ]));
    getScores();
    const scoreboard = document.getElementById('scoreboard');
    expect(scoreboard.style.display).toBe('block');
    expect(scoreboard.innerHTML).toContain('User1 : 15 points');
    expect(scoreboard.innerHTML).toContain('User2 : 10 points');
});

test('getScores displays empty message when no scores', () => {
    getScores();
    const scoreboard = document.getElementById('scoreboard');
    expect(scoreboard.style.display).toBe('block');
    expect(scoreboard.innerHTML).toContain('Aucun score disponible');
});

test('resetGame resets game state', () => {
    count = 10;
    timeLeft = 0;
    timerRunning = true;
    counterDisplay.textContent = '10';
    timerDisplay.textContent = 'Temps écoulé !';
    button.disabled = true;
    scoreboard.style.display = 'block';
    resetGame();
    expect(count).toBe(0);
    expect(timeLeft).toBe(5);
    expect(timerRunning).toBe(false);
    expect(counterDisplay.textContent).toBe('0');
    expect(timerDisplay.textContent).toBe('Temps restant : 5s');
    expect(button.disabled).toBe(false);
    expect(scoreboard.style.display).toBe('none');
});