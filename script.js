// Variables globales
let count = 0;
let timeLeft = 5;
let timerRunning = false;
let gameStarted = false;
let timerInterval = null;

// Tableau en mémoire pour stocker les pseudos des joueurs ayant joué (pas de localStorage)
let playedUsers = [];

// Éléments du DOM
const elements = {
    counterDisplay: document.getElementById('counter'),
    timerDisplay: document.getElementById('timer'),
    incrementBtn: document.getElementById('incrementBtn'),
    startBtn: document.getElementById('startBtn'),
    usernameInput: document.getElementById('username'),
    scoreboardBtn: document.getElementById('scoreboardBtn'),
    resetBtn: document.getElementById('resetBtn'),
    playersBtn: document.getElementById('playersBtn'),
    scoreboard: document.getElementById('scoreboard'),
    playersHistory: document.getElementById('playersHistory')
};

// Effacer localStorage au démarrage pour supprimer les données résiduelles
function clearLocalStorage() {
    localStorage.removeItem('clickfast_scores');
    localStorage.removeItem('clickfast_players');
}

// Fonction pour obtenir des couleurs aléatoires
function getRandomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F39C12', '#E74C3C', '#9B59B6'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Fonction pour créer des formes animées
function createShape() {
    const shape = document.createElement('div');
    shape.classList.add('animated-shape');
    shape.style.cssText = `
        width: 30px;
        height: 30px;
        border-radius: 50%;
        position: fixed;
        background-color: ${getRandomColor()};
        left: ${Math.random() * (window.innerWidth - 30)}px;
        top: ${window.innerHeight - 50}px;
        pointer-events: none;
        z-index: 1000;
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        animation: moveUp 2s linear forwards;
    `;
    
    document.body.appendChild(shape);
    
    setTimeout(() => {
        if (shape.parentNode) {
            shape.remove();
        }
    }, 2000);
}

// Fonction pour afficher des notifications
function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        max-width: 350px;
        word-wrap: break-word;
        white-space: pre-line;
        animation: slideIn 0.3s ease-out;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    const colors = {
        success: 'background: rgba(16, 185, 129, 0.9);',
        warning: 'background: rgba(245, 158, 11, 0.9);',
        error: 'background: rgba(239, 68, 68, 0.9);',
        info: 'background: rgba(59, 130, 246, 0.9);'
    };
    
    notification.style.cssText += colors[type] || colors.info;
    notification.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Fonction pour mettre à jour le compteur
function updateCounter() {
    if (!gameStarted) return;
    
    count++;
    elements.counterDisplay.textContent = count;
    elements.counterDisplay.classList.add('pulse');
    setTimeout(() => elements.counterDisplay.classList.remove('pulse'), 600);
    
    createShape();
}

// Fonction pour démarrer le timer
function startTimer() {
    if (timerRunning) return;
    
    const username = elements.usernameInput.value.trim();
    if (!username) {
        showNotification('⚠️ Veuillez entrer votre pseudo avant de commencer !', 'warning');
        elements.usernameInput.focus();
        return;
    }

    if (username.length > 20) {
        showNotification('⚠️ Le pseudo ne peut pas dépasser 20 caractères !', 'warning');
        return;
    }

    gameStarted = true;
    timerRunning = true;
    elements.incrementBtn.disabled = false;
    elements.startBtn.disabled = true;
    elements.usernameInput.disabled = true;
    
    count = 0;
    timeLeft = 5;
    elements.counterDisplay.textContent = count;
    elements.timerDisplay.textContent = `Objectif : Cliquez le plus rapidement possible en 5 secondes !\nTemps restant : ${timeLeft}s`;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        elements.timerDisplay.textContent = `Objectif : Cliquez le plus rapidement possible en 5 secondes !\nTemps restant : ${timeLeft}s`;
        
        if (timeLeft <= 2) {
            elements.timerDisplay.style.color = '#ef4444';
        } else if (timeLeft <= 3) {
            elements.timerDisplay.style.color = '#f59e0b';
        }
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// Fonction pour terminer le jeu
function endGame() {
    clearInterval(timerInterval);
    gameStarted = false;
    timerRunning = false;
    elements.incrementBtn.disabled = true;
    const cps = (count / 5).toFixed(2);
    elements.timerDisplay.textContent = `🎉 Temps écoulé ! Votre score : ${cps} CPS`;
    elements.timerDisplay.style.color = '#10b981';
    
    let message = `🎯 Bravo ${elements.usernameInput.value} ! Vous avez cliqué ${count} fois en 5 secondes (${cps} CPS) !`;
    if (count >= 50) {
        message += '\n🔥 Performance exceptionnelle !';
    } else if (count >= 30) {
        message += '\n⚡ Très bon score !';
    } else if (count >= 20) {
        message += '\n👍 Bon travail !';
    } else {
        message += '\n💪 Vous pouvez faire mieux !';
    }
    
    showNotification(message, 'success');
    
    // Ajouter le pseudo à la liste en mémoire et envoyer à l'API
    const username = elements.usernameInput.value.trim();
    if (!playedUsers.includes(username)) {
        playedUsers.push(username);
        savePlayerToAPI(username); // Simuler l'envoi à l'API
    }
}

// Fonction pour simuler l'enregistrement d'un joueur via une API
async function savePlayerToAPI(username) {
    try {
        const response = await fetch('https://ton-api.com/joueurs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        if (!response.ok) throw new Error('Erreur réseau');

        console.log(`✅ Joueur ${username} enregistré avec succès`);
        return { success: true };
    } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement du joueur :', error);
        showNotification("Erreur lors de l'envoi à l'API", 'error');
        return { success: false };
    }
}


// Fonction pour récupérer les joueurs ayant joué via une API (simulation)
async function fetchOnlinePlayers() {
    try {
        // Simulation d'une requête GET à une API
        // Exemple réel :
        // const response = await fetch('https://votre-api.com/joueurs');
        // const data = await response.json();
        // return data.map(player => player.username);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve([...playedUsers]); // Renvoie les pseudos en mémoire
            }, 1000);
        });
    } catch (error) {
        showNotification('⚠️ Erreur lors de la récupération des joueurs', 'error');
        console.error('Erreur API :', error);
        return playedUsers; // Liste de secours
    }
}

// Fonction pour afficher les joueurs ayant joué
async function showPlayersHistory() {
    elements.playersHistory.style.display = 'block';
    elements.scoreboard.style.display = 'none';

    const players = await fetchOnlinePlayers();
    
    if (players.length === 0) {
        elements.playersHistory.innerHTML = `
            <h2>👥 Joueurs ayant joué</h2>
            <p>Aucun joueur n'a encore joué.</p>
        `;
        return;
    }

    const playersList = players.map((player, index) => {
        const trophy = index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎮';
        return `
            <li>
                <strong>${trophy} ${player}</strong><br>
                📅 Joué le ${new Date().toLocaleDateString('fr-FR')}
            </li>
        `;
    }).join('');

    elements.playersHistory.innerHTML = `
        <h2>👥 Joueurs ayant joué</h2>
        <p>🎮 ${players.length} joueur${players.length > 1 ? 's' : ''} ayant joué</p>
        <ul>${playersList}</ul>
    `;
}

// Fonction pour afficher le classement (désactivée)
function showScoreboard() {
    elements.scoreboard.style.display = 'block';
    elements.playersHistory.style.display = 'none';
    elements.scoreboard.innerHTML = `
        <h2>🏆 Classement</h2>
        <p>Le classement n'est pas disponible (aucun historique enregistré).</p>
    `;
}

// Fonction pour réinitialiser le jeu
function resetGame() {
    clearInterval(timerInterval);
    count = 0;
    timeLeft = 5;
    timerRunning = false;
    gameStarted = false;

    elements.counterDisplay.textContent = '0';
    elements.timerDisplay.textContent = 'Temps restant : 5s';
    elements.timerDisplay.style.color = '#e0e7ff';
    elements.incrementBtn.disabled = true;
    elements.startBtn.disabled = false;
    elements.usernameInput.disabled = false;
    elements.scoreboard.style.display = 'none';
    elements.playersHistory.style.display = 'none';
    
    showNotification('🔄 Nouvelle partie prête !', 'info');
}

// Event listeners
elements.incrementBtn.addEventListener('click', updateCounter);
elements.startBtn.addEventListener('click', startTimer);
elements.scoreboardBtn.addEventListener('click', showScoreboard);
elements.playersBtn.addEventListener('click', showPlayersHistory);
elements.resetBtn.addEventListener('click', resetGame);

elements.usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !timerRunning) {
        startTimer();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameStarted && !elements.incrementBtn.disabled) {
        e.preventDefault();
        updateCounter();
    }
});

elements.incrementBtn.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Initialisation du jeu
function initGame() {
    elements.incrementBtn.disabled = true;
    showNotification('🎮 Bienvenue dans ClickFast !\nEntrez votre pseudo et commencez le défi !', 'info');
    console.log('Initialisation : liste des joueurs en mémoire vide');
    clearLocalStorage(); // Effacer les données résiduelles
}

initGame();