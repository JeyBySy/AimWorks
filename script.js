const screens = document.querySelectorAll('.screen');
const start_btn = document.getElementById('start-btn')
const chooseCategory = document.querySelectorAll('.choose-cat');
const highscoreDisplay = document.getElementById('screenHighscore')

start_btn.addEventListener('click', () => screens[0].classList.add('up'))

chooseCategory.forEach(btn => {
    btn.addEventListener('click', () => {
        screens[1].classList.add('up')
        highscoreDisplay.style.visibility = 'visible'
        document.body.style.cursor = 'crosshair'
    })
})