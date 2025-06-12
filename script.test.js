/**
 * @jest-environment jsdom
 */
const { updateCounter, postScore, getScores, resetGame } = require('./script');


// Avant chaque test, on prépare l'environnement
beforeEach(() => {
    Object.defineProperty(global, 'localStorage', {
        value: {
            getItem: jest.fn(() => JSON.stringify([])), // ✅ Assure un JSON valide
            setItem: jest.fn(),
            clear: jest.fn()
        },
        writable: true
    });

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
});

// 🔄 Restaurer les mocks après chaque test
afterEach(() => {
    jest.restoreAllMocks();
});

// ✅ Test de `updateCounter`
test('updateCounter increments count and creates shape', () => {
    updateCounter();
    expect(document.getElementById('counter').textContent).toBe('1');
    expect(document.querySelector('.shape')).not.toBeNull();
});

// ✅ Test de `postScore`
test('postScore saves new score to localStorage', () => {
    document.getElementById('username').value = "TestUser";

    postScore();

    expect(localStorage.setItem).toHaveBeenCalledTimes(1); // ✅ Vérifie que `setItem()` a bien été appelé
    expect(localStorage.setItem).toHaveBeenCalledWith(
        'scores',
        expect.stringContaining('"username":"TestUser"') // ✅ Vérifie que `TestUser` est bien stocké
    );
});

// ✅ Test de `resetGame`
test('resetGame resets game state', () => {
    resetGame();
    expect(document.getElementById('counter').textContent).toBe('0');
});
