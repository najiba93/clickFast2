// Variables globales
let count = 0;
let timeLeft = 5;
let timerRunning = false;
let gameStarted = false;
let timerInterval = null;

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

// Fonction pour mettre à jour le compteur
function updateCounter() {
    if (!gameStarted) return;
    
    count++;
    elements.counterDisplay.textContent = count;
    elements.counterDisplay.classList.add('pulse');
    setTimeout(() => elements.counterDisplay.classList.remove('pulse'), 600);
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
    
    // Réinitialiser le compteur et le timer
    count = 0;
    timeLeft = 5;
    elements.counterDisplay.textContent = count;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        elements.timerDisplay.textContent = `Temps restant : ${timeLeft}s`;
        
        // Changer la couleur quand il reste peu de temps
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
    elements.timerDisplay.textContent = "🎉 Temps écoulé !";
    elements.timerDisplay.style.color = '#10b981';
    
    postScore();
    
    // Message de fin personnalisé
    setTimeout(() => {
        let message = `🎯 Bravo ! Vous avez cliqué ${count} fois en 5 secondes !`;
        
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
    }, 100);
}

// Fonction pour récupérer les scores depuis localStorage
function fetchScores() {
    const scores = localStorage.getItem('clickfast_scores');
    return scores ? JSON.parse(scores) : [];
}

// Fonction pour récupérer tous les joueurs
function fetchAllPlayers() {
    const players = localStorage.getItem('clickfast_players');
    return players ? JSON.parse(players) : [];
}

// Fonction pour enregistrer un joueur dans l'historique
function savePlayerToHistory(username) {
    let players = fetchAllPlayers();
    
    // Vérifier si le joueur existe déjà
    const existingPlayerIndex = players.findIndex(player => 
        player.username.toLowerCase() === username.toLowerCase()
    );
    
    if (existingPlayerIndex === -1) {
        // Nouveau joueur
        const newPlayer = {
            username: username,
            firstPlayed: new Date().toISOString(),
            totalGames: 1,
            bestScore: count
        };
        players.push(newPlayer);
    } else {
        // Joueur existant
        players[existingPlayerIndex].totalGames += 1;
        players[existingPlayerIndex].lastPlayed = new Date().toISOString();
        
        // Mettre à jour le meilleur score si nécessaire
        if (count > players[existingPlayerIndex].bestScore) {
            players[existingPlayerIndex].bestScore = count;
        }
    }
    
    localStorage.setItem('clickfast_players', JSON.stringify(players));
}

// Fonction pour enregistrer le score
function postScore() {
    const username = elements.usernameInput.value.trim();
    let scores = fetchScores();

    const newScore = { 
        username, 
        score: count, 
        date: new Date().toISOString(),
        timestamp: Date.now()
    };

    // Enregistrer le joueur dans l'historique
    savePlayerToHistory(username);

    const existingScoreIndex = scores.findIndex(score => 
        score.username.toLowerCase() === username.toLowerCase()
    );

    if (existingScoreIndex !== -1) {
        // Joueur existant
        const oldScore = scores[existingScoreIndex].score;
        if (count > oldScore) {
            scores[existingScoreIndex] = newScore;
            showNotification(`🎊 Nouveau record personnel !\nAncien record : ${oldScore} clics\nNouveau record : ${count} clics`, 'success');
        } else {
            showNotification(`Votre record reste ${oldScore} clics`, 'info');
        }
    } else {
        // Nouveau joueur
        scores.push(newScore);
        showNotification(`🎉 Bienvenue ${username} !\nPremier score : ${count} clics`, 'success');
    }

    // Trier les scores par ordre décroissant
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('clickfast_scores', JSON.stringify(scores));
}

// Fonction pour afficher le classement
function showScoreboard() {
    const scores = fetchScores();
    elements.scoreboard.style.display = "block";
    elements.playersHistory.style.display = "none";

    if (scores.length === 0) {
        elements.scoreboard.innerHTML = `
            <h2>🏆 Classement</h2>
            <p>Aucun score disponible.<br>Soyez le premier à jouer !</p>
        `;
        return;
    }

    const top10 = scores.slice(0, 10);
    const scoresList = top10.map((score, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        const date = new Date(score.date).toLocaleDateString('fr-FR');
        const time = new Date(score.date).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        return `
            <li>
                <strong>${medal} ${score.username}</strong><br>
                🎯 ${score.score} clics<br>
                📅 ${date} à ${time}
            </li>
        `;
    }).join('');

    elements.scoreboard.innerHTML = `
        <h2>🏆 Top 10 - Classement</h2>
        <p>🎮 ${scores.length} score${scores.length > 1 ? 's' : ''} enregistré${scores.length > 1 ? 's' : ''}</p>
        <ul>${scoresList}</ul>
    `;
}

// Fonction pour afficher l'historique des joueurs
function showPlayersHistory() {
    const players = fetchAllPlayers();
    elements.playersHistory.style.display = "block";
    elements.scoreboard.style.display = "none";

    if (players.length === 0) {
        elements.playersHistory.innerHTML = `
            <h2>👥 Historique des Joueurs</h2>
            <p>Aucun joueur enregistré.</p>
        `;
        return;
    }

    // Trier par meilleur score (décroissant)
    players.sort((a, b) => b.bestScore - a.bestScore);

    const playersList = players.map((player, index) => {
        const firstPlayed = new Date(player.firstPlayed).toLocaleDateString('fr-FR');
        const lastPlayed = player.lastPlayed ? 
            new Date(player.lastPlayed).toLocaleDateString('fr-FR') : 
            firstPlayed;
        
        const trophy = index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎮';
        
        return `
            <li>
                <strong>${trophy} ${player.username}</strong><br>
                🏆 Meilleur score : ${player.bestScore} clics<br>
                📊 ${player.totalGames} partie${player.totalGames > 1 ? 's' : ''}<br>
                📅 Première fois : ${firstPlayed}
                ${player.lastPlayed ? `<br>🕐 Dernière fois : ${lastPlayed}` : ''}
            </li>
        `;
    }).join('');

    const totalGames = players.reduce((sum, player) => sum + player.totalGames, 0);

    elements.playersHistory.innerHTML = `
        <h2>👥 Historique des Joueurs</h2>
        <p>📈 ${players.length} joueur${players.length > 1 ? 's' : ''} unique${players.length > 1 ? 's' : ''}<br>
        🎮 ${totalGames} partie${totalGames > 1 ? 's' : ''} jouée${totalGames > 1 ? 's' : ''}</p>
        <ul>${playersList}</ul>
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

// Fonction pour afficher des notifications
function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
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
    
    // Couleurs selon le type
    const colors = {
        success: 'background: rgba(16, 185, 129, 0.9);',
        warning: 'background: rgba(245, 158, 11, 0.9);',
        error: 'background: rgba(239, 68, 68, 0.9);',
        info: 'background: rgba(59, 130, 246, 0.9);'
    };
    
    notification.style.cssText += colors[type] || colors.info;
    notification.textContent = message;
    
    // Ajouter l'animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Supprimer après 4 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        notification.style.cssText += `
            @keyframes slideOut {
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Event listeners
elements.incrementBtn.addEventListener('click', updateCounter);
elements.startBtn.addEventListener('click', startTimer);
elements.scoreboardBtn.addEventListener('click', showScoreboard);
elements.playersBtn.addEventListener('click', showPlayersHistory);
elements.resetBtn.addEventListener('click', resetGame);

// Permettre de commencer avec la touche Entrée
elements.usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !timerRunning) {
        startTimer();
    }
});

// Permettre de cliquer avec la barre d'espace quand le jeu est actif
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameStarted && !elements.incrementBtn.disabled) {
        e.preventDefault();
        updateCounter();
    }
});

// Empêcher le clic droit sur le bouton de jeu pour éviter la triche
elements.incrementBtn.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Initialisation du jeu
function initGame() {
    elements.incrementBtn.disabled = true;
    showNotification('🎮 Bienvenue dans ClickFast !\nEntrez votre pseudo et commencez le défi !', 'info');
}

// Fonction pour nettoyer les données (utile pour le développement)
function clearAllData() {
    if (confirm('⚠️ Êtes-vous sûr de vouloir supprimer toutes les données ?\nCette action est irréversible !')) {
        localStorage.removeItem('clickfast_scores');
        localStorage.removeItem('clickfast_players');
        showNotification('🗑️ Toutes les données ont été supprimées !', 'warning');
        
        // Masquer les panneaux s'ils sont ouverts
        elements.scoreboard.style.display = 'none';
        elements.playersHistory.style.display = 'none';
    }
}

// Fonction pour exporter les données
function exportData() {
    const scores = fetchScores();
    const players = fetchAllPlayers();
    
    const data = {
        scores: scores,
        players: players,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `clickfast-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('📁 Données exportées avec succès !', 'success');
}

// Ajouter des raccourcis clavier pour les développeurs (mode debug)
document.addEventListener('keydown', (e) => {
    // Ctrl + Alt + C = Clear data
    if (e.ctrlKey && e.altKey && e.key === 'c') {
        clearAllData();
    }
    
    // Ctrl + Alt + E = Export data
    if (e.ctrlKey && e.altKey && e.key === 'e') {
        exportData();
    }
});

// Démarrer le jeu
initGame();