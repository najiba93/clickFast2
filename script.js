 let count = 0;
        let timeLeft = 5;
        let timerRunning = false;
        const counterDisplay = document.getElementById('counter');
        const timerDisplay = document.getElementById('timer');
        const button = document.getElementById('incrementBtn');

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
            shape.style.left = `${Math.random() * window.innerWidth}px`;
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
                    }
                }, 1000);
            }
        }

        button.addEventListener('click', () => {
            startTimer();
            if (timeLeft > 0) {
                updateCounter();
            }
        });