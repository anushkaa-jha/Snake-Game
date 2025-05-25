const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameOverDisplay = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const finalHighScoreDisplay = document.getElementById('finalHighScore');
const restartBtn = document.getElementById('restartBtn');
const pauseBtn = document.getElementById('pauseBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.querySelector('.settings-panel');
const closeSettingsBtn = document.querySelector('.close-settings');
const upBtn = document.getElementById('upBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const downBtn = document.getElementById('downBtn');
const gameSpeedSelect = document.getElementById('gameSpeed');
const wallBehaviorSelect = document.getElementById('wallBehavior');

let gridSize = 20;
let dotSize;
let snake = [];
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let apple = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoopId;
let isPaused = false;
let inGame = false;
let wallBehavior = 'solid';
let gameSpeed = 140;

function initGame() {
    gridSize = 20;
    dotSize = canvas.width / gridSize;
    const startX = Math.floor(gridSize / 4) * dotSize;
    const startY = Math.floor(gridSize / 2) * dotSize;
    snake = [
        { x: startX, y: startY },
        { x: startX - dotSize, y: startY },
        { x: startX - dotSize * 2, y: startY }
    ];
    
    direction = 'RIGHT';
    nextDirection = 'RIGHT';
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    highScoreDisplay.textContent = `High: ${highScore}`;
    gameSpeed = parseInt(gameSpeedSelect.value);
    wallBehavior = wallBehaviorSelect.value;
    placeApple();
    inGame = true;
    isPaused = false;
    pauseBtn.textContent = 'Pause';
    gameOverDisplay.classList.remove('show');
    if (gameLoopId) clearInterval(gameLoopId);
    gameLoopId = setInterval(gameLoop, gameSpeed);
    canvas.focus();
}

function randomPosition() {
    return Math.floor(Math.random() * gridSize) * dotSize;
}

function placeApple() {
    let newApplePosition;
    do {
        newApplePosition = {
            x: randomPosition(),
            y: randomPosition()
        };
    } while (snake.some(segment => segment.x === newApplePosition.x && segment.y === newApplePosition.y));
    
    apple = newApplePosition;
}

function drawDot(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, dotSize, dotSize);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, dotSize, dotSize);
}

function draw() {
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--panel-color');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawDot(apple.x, apple.y, getComputedStyle(document.documentElement).getPropertyValue('--apple-color'));
    
    snake.forEach((dot, index) => {
        const color = index === 0 ? 
            getComputedStyle(document.documentElement).getPropertyValue('--snake-head') : 
            getComputedStyle(document.documentElement).getPropertyValue('--snake-body');
        drawDot(dot.x, dot.y, color);
    });
    
    if (isPaused && inGame) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
        ctx.font = `bold ${dotSize * 1.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
}

function moveSnake() {
    direction = nextDirection;
    let head = { ...snake[0] };
    
    switch (direction) {
        case 'LEFT': head.x -= dotSize; break;
        case 'RIGHT': head.x += dotSize; break;
        case 'UP': head.y -= dotSize; break;
        case 'DOWN': head.y += dotSize; break;
    }
    
    if (wallBehavior === 'wrap') {
        head.x = (head.x + canvas.width) % canvas.width;
        head.y = (head.y + canvas.height) % canvas.height;
    } else {
        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
            gameOver();
            return;
        }
    }
    
    if (snake.some(dot => dot.x === head.x && dot.y === head.y)) {
        gameOver();
        return;
    }
    
    snake.unshift(head);
    
    if (head.x === apple.x && head.y === apple.y) {
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;
        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = `High: ${highScore}`;
            localStorage.setItem('snakeHighScore', highScore);
        }
        placeApple();
        if (score % 50 === 0 && gameSpeed > 40) {
            gameSpeed -= 10;
            clearInterval(gameLoopId);
            gameLoopId = setInterval(gameLoop, gameSpeed);
        }
    } else {
        snake.pop();
    }
}

function gameOver() {
    inGame = false;
    clearInterval(gameLoopId);
    finalScoreDisplay.textContent = score;
    finalHighScoreDisplay.textContent = highScore;
    gameOverDisplay.classList.add('show');
    canvas.blur();
}

function togglePause() {
    if (!inGame) return;
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    if (isPaused) {
        clearInterval(gameLoopId);
    } else {
        gameLoopId = setInterval(gameLoop, gameSpeed);
        canvas.focus();
    }
    draw();
}

function gameLoop() {
    if (inGame && !isPaused) {
        moveSnake();
        draw();
    }
}

function keyDownHandler(e) {
    if (!inGame || isPaused) return;
    const key = e.key;
    switch (key) {
        case 'ArrowLeft':
            if (direction !== 'RIGHT') nextDirection = 'LEFT';
            break;
        case 'ArrowRight':
            if (direction !== 'LEFT') nextDirection = 'RIGHT';
            break;
        case 'ArrowUp':
            if (direction !== 'DOWN') nextDirection = 'UP';
            break;
        case 'ArrowDown':
            if (direction !== 'UP') nextDirection = 'DOWN';
            break;
        case ' ':
        case 'p':
            togglePause();
            break;
    }
}

canvas.addEventListener('keydown', keyDownHandler);
restartBtn.addEventListener('click', initGame);
pauseBtn.addEventListener('click', togglePause);
settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.add('show');
    if (inGame && !isPaused) togglePause();
});
closeSettingsBtn.addEventListener('click', () => {
    settingsPanel.classList.remove('show');
    initGame();
});
upBtn.addEventListener('click', () => { if (direction !== 'DOWN') nextDirection = 'UP'; });
leftBtn.addEventListener('click', () => { if (direction !== 'RIGHT') nextDirection = 'LEFT'; });
rightBtn.addEventListener('click', () => { if (direction !== 'LEFT') nextDirection = 'RIGHT'; });
downBtn.addEventListener('click', () => { if (direction !== 'UP') nextDirection = 'DOWN'; });

let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, false);
canvas.addEventListener('touchmove', (e) => {
    if (!touchStartX || !touchStartY || !inGame || isPaused) return;
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && direction !== 'LEFT') nextDirection = 'RIGHT';
        else if (dx < 0 && direction !== 'RIGHT') nextDirection = 'LEFT';
    } else {
        if (dy > 0 && direction !== 'UP') nextDirection = 'DOWN';
        else if (dy < 0 && direction !== 'DOWN') nextDirection = 'UP';
    }
    touchStartX = 0;
    touchStartY = 0;
    e.preventDefault();
}, false);

initGame();
