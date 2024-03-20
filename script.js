class Target {
    constructor(gameContainer, timerDuration, category) {
        this.gameContainer = gameContainer;
        this.timerDuration = timerDuration;
        this.category = category;
        this.targetPositions = [];
        this.clickCounter = 0;
        this.timerStarted = false;
        this.timerInterval = null;
        this.initialize();
    }

    initialize() {
        this.createTargets();
        this.updateTime();
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
        circle_target.style.left = `${x}px`;
        this.gameContainer.appendChild(circle_target);

        this.targetPositions.push({ x, y });

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

    updateTime() {
        const timeElement = document.getElementById('timer');
        if (timeElement) {
            const minutes = Math.floor(this.timerDuration / 60000);
            const seconds = Math.floor((this.timerDuration % 60000) / 1000);
            const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            timeElement.textContent = formattedTime;
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
        if (this.clickCounter === 1 && !this.timerStarted) {
            this.timerStarted = true;
            this.startTimer();
        }
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

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timerDuration -= 1000;
            if (this.timerDuration <= 0) {
                this.stopTimer();
                clearInterval(this.timerInterval);
                this.timerDuration = 0;
                this.showResultScreen(); // Call the function to show the result screen
            }
            this.updateTime();
        }, 1000);
    }

    stopTimer() {
        this.timerStarted = false;
    }
    showResultScreen() {
        const resultScreen = document.getElementById('result_screen');
        const popScreen_score = document.getElementById('popScreen_score')
        const popScreen_cat = document.getElementById('popScreen_cat')


        if (resultScreen) {
            resultScreen.classList.remove('hideScreen');
            resultScreen.classList.add('showScreen');
            resultScreen.style.zIndex = '2'

            popScreen_cat.textContent = `Category: ${this.category}`;
            popScreen_score.textContent = `Score: ${this.clickCounter}`;

            this.saveScore()
        }
    }
    saveScore() {
        const scores = JSON.parse(localStorage.getItem('scores')) || [];

        const newScore = {
            cat: this.category,
            score: this.clickCounter,
            timestamp: new Date().toLocaleString()
        };
        scores.push(newScore);
        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem('scores', JSON.stringify(scores));
    }
}

const UI = {
    screens: document.querySelectorAll('.screen'),
    start_btn: document.getElementById('start-btn'),
    back_home: document.getElementById('back_home'),
    chooseCategory: document.querySelectorAll('.choose-cat'),
    highscoreDisplay: document.getElementById('screenHighscore'),
    game_container: document.getElementById('game-container'),
    howTo_btn: document.getElementById('HowTo'),
    highscore_btn: document.getElementById('highscore'),
    popScreen: document.querySelectorAll('.popScreen'),
    close_screen: document.querySelectorAll('.popScreen-close'),

    init: function () {
        this.close_screen.forEach(button => {
            button.addEventListener('click', this.closePopScreen.bind(this));
        });

        this.howTo_btn.addEventListener('click', (e) => this.showscreen(e));
        this.highscore_btn.addEventListener('click', (e) => this.showscreen(e));

        this.start_btn.addEventListener('click', () => this.startGame());
        this.back_home.addEventListener('click', () => this.goBackHome());

        this.chooseCategory.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectCategory(e));
        });
    },
    closePopScreen: function (e) {
        const popScreen = e.target.closest('.popScreen');
        if (popScreen) {
            popScreen.classList.add('hideScreen');
        }
    },
    showscreen: function (e) {
        const getId = e.target.id;
        const popscreen = document.getElementById(getId + "_screen");
        if (popscreen) {
            popscreen.classList.remove('hideScreen');
            popscreen.classList.add('showScreen');

            if (getId === 'highscore') {
                const scoresJSON = localStorage.getItem('scores');
                let scores = scoresJSON ? JSON.parse(scoresJSON) : [];
                const cat20Container = document.getElementById('cat_twenty');
                const cat10Container = document.getElementById('cat_ten');

                // Filter and get top 3 scores for each category
                const getTopScores = (category) => {
                    const categoryScores = scores.filter(score => score.cat === category);
                    categoryScores.sort((a, b) => {
                        if (a.score !== b.score) {
                            return b.score - a.score; // Sort by score descending if scores are different
                        } else {
                            return new Date(b.timestamp) - new Date(a.timestamp); // Sort by timestamp descending if scores are equal
                        }
                    });
                    return categoryScores.slice(0, 3);
                };

                const scores_20s = getTopScores('20 seconds');
                const scores_10s = getTopScores('10 seconds');

                cat20Container.innerHTML = '<h3> Cat 20 </h3> <hr>';
                cat10Container.innerHTML = ' <h3> Cat 10 </h3> <hr>';


                const createTableRow = (score) => {
                    const row = document.createElement('div');
                    row.classList.add('top')
                    row.innerHTML = `<p class="title" style='font-size:20px;'> ${score.score}</p> <p class='title' style='font-size:10px;'>${score.timestamp}</p> <hr>`;
                    return row;
                };

                // Function to add scores to the container
                const addScoresToContainer = (scores, container) => {
                    scores.forEach(score => {
                        const row = createTableRow(score);
                        container.appendChild(row);
                    });
                };

                // Add scores to the containers
                addScoresToContainer(scores_20s, cat20Container);
                addScoresToContainer(scores_10s, cat10Container);
            }
        }
    },



    startGame: function () {
        UI.screens[1].classList.remove('down');
        UI.screens[0].classList.add('up');
    },
    goBackHome: function () {
        UI.screens[0].classList.remove('up');
        UI.screens[1].classList.add('down');
    },
    selectCategory: function (e) {
        const value = e.target.dataset.value;
        const category = e.target.textContent;
        const value_TimeCategory = value * 1000;
        UI.screens[1].classList.add('up');
        UI.highscoreDisplay.style.visibility = 'visible';
        UI.game_container.style.cursor = 'crosshair';
        const target = new Target(UI.game_container, value_TimeCategory, category);
    }
};

UI.init();
