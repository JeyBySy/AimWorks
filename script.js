class Target {
    constructor(gameContainer, score) {
        this.gameContainer = gameContainer;
        this.score = score
        this.targetPositions = [];
        this.createTargets();
        this.clickCounter = 0;
    }

    createTargets() {
        const maxTargets = 3; // Total number of targets to create

        for (let i = 0;i < maxTargets;i++) {
            this.createTarget();
        }
    }

    createTarget() {
        const circle_target = document.createElement('div');
        circle_target.classList.add('target');
        circle_target.style.position = "absolute";
        const { x, y } = this.getRandomLocation();
        circle_target.style.top = `${y}px`;
        circle_target.style.left = `${x}px`; // Change right to left for absolute positioning
        this.gameContainer.appendChild(circle_target);

        this.targetPositions.push({ x, y });

        // Add a click event listener to the target
        circle_target.addEventListener('click', () => {
            this.handleTargetClick(circle_target);
        });
    }
    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `${this.clickCounter}`;
        }
    }

    getRandomLocation() {

        const containerWidth = this.gameContainer.offsetWidth;
        const containerHeight = this.gameContainer.offsetHeight;
        const targetSize = 160;

        let x, y;
        do {
            x = Math.random() * containerWidth;
            y = Math.random() * containerHeight;

            x = Math.floor(x) % (containerWidth - targetSize);
            y = Math.floor(y) % (containerHeight - targetSize);
        } while (this.isOverlap(x, y));

        return { x, y };
    }


    isOverlap(newX, newY) {
        const minDistance = 100; // Increase the minimum distance between targets
        for (const pos of this.targetPositions) {
            const distance = Math.sqrt(Math.pow(pos.x - newX, 2) + Math.pow(pos.y - newY, 2));
            if (distance < minDistance) {
                return true; // Overlapping detected
            }
        }
        return false; // No overlapping detected
    }

    handleTargetClick(targetElement) {
        const indexToRemove = this.targetPositions.findIndex(pos => pos.x === parseFloat(targetElement.style.left) && pos.y === parseFloat(targetElement.style.top));
        const { x, y } = this.getRandomLocation();

        targetElement.style.transition = 'transform 0.3s ease';
        targetElement.style.transform = 'scale(0)';
        this.clickCounter++;

        setTimeout(() => {
            targetElement.style.top = `${y}px`;
            targetElement.style.left = `${x}px`;
            targetElement.style.transform = 'scale(1)';

            this.updateScore();

            if (indexToRemove !== -1) {
                this.targetPositions.splice(indexToRemove, 1);
            }
            this.targetPositions.push({ x, y });
        }, 150);

    }
}


const screens = document.querySelectorAll('.screen');
const start_btn = document.getElementById('start-btn');
const chooseCategory = document.querySelectorAll('.choose-cat');
const highscoreDisplay = document.getElementById('screenHighscore');
const score = document.getElementById('score');
const game_container = document.getElementById('game-container');

start_btn.addEventListener('click', () => screens[0].classList.add('up'));

chooseCategory.forEach(btn => {
    btn.addEventListener('click', () => {
        screens[1].classList.add('up');
        highscoreDisplay.style.visibility = 'visible';
        document.body.style.cursor = 'crosshair';
        const target = new Target(game_container, score); // Create a new target instance
    });
});
