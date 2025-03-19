const game = document.getElementById('game');
const lightArea = document.getElementById('light-area');
const player = document.getElementById('player');
const levelElement = document.getElementById('level');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const eatenCountElement = document.getElementById('eaten-count');
const finalSidesElement = document.getElementById('final-sides');
const gameTimeElement = document.getElementById('game-time');
const retryButton = document.getElementById('retry');

let playerSides = 2;
let playerSize = 50;
let playerWidth = 2;
let playerX = lightArea.offsetLeft + lightArea.offsetWidth / 2 - playerWidth / 2;
let playerY = lightArea.offsetTop + lightArea.offsetHeight / 2 - playerSize / 2;
let score = 0;
let level = 1;
let levelProgress = 0;
let levelThreshold = 3;
let eatenCount = 0;
let gameTime = 0;
let isGameOver = false;
let playerRotation = 0;
const rotationSpeed = 1 / 8;

let enemies = [];
const playerSpeed = 5 / 3;

const keys = {
    w: false,
    s: false,
    a: false,
    d: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
};

function initPlayer() {
    if (playerSides === 2) {
        playerSize = 50;
        playerWidth = 10;
    } else if (playerSides >= 3) {
        playerSize = 50;
        playerWidth = 50;
    }

    player.style.width = playerWidth + 'px';
    player.style.height = playerSize + 'px';
    player.style.borderRadius = '0%';
    player.innerText = '';
    player.style.left = playerX + 'px';
    player.style.top = playerY + 'px';

    if (playerSides === 2) {
        player.style.clipPath = 'none';
        player.style.backgroundColor = '#fff';
    } else if (playerSides === 3) {
        player.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
    } else if (playerSides >= 4) {
        const angle = 360 / playerSides;
        const points = [];
        for (let i = 0; i < playerSides; i++) {
            const x = 50 + 50 * Math.cos(((angle * i) * Math.PI) / 180);
            const y = 50 + 50 * Math.sin(((angle * i) * Math.PI) / 180);
            points.push(`${x}% ${y}%`);
        }
        player.style.clipPath = `polygon(${points.join(', ')})`;
    }

    lightArea.style.borderRadius = '0';
}

document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

game.addEventListener('mousemove', (e) => {
    if (isGameOver) return;
    const rect = lightArea.getBoundingClientRect();
    playerX = Math.max(rect.left, Math.min(e.clientX - playerWidth / 2, rect.left + rect.width - playerWidth));
    playerY = Math.max(rect.top, Math.min(e.clientY - playerSize / 2, rect.top + rect.height - playerSize));
    player.style.left = playerX + 'px';
    player.style.top = playerY + 'px';
});

function updatePlayerPosition() {
    if (isGameOver) return;

    if (keys.w || keys.ArrowUp) playerY = Math.max(lightArea.offsetTop, playerY - playerSpeed);
    if (keys.s || keys.ArrowDown) playerY = Math.min(lightArea.offsetTop + lightArea.offsetHeight - playerSize, playerY + playerSpeed);
    if (keys.a || keys.ArrowLeft) playerX = Math.max(lightArea.offsetLeft, playerX - playerSpeed);
    if (keys.d || keys.ArrowRight) playerX = Math.min(lightArea.offsetLeft + lightArea.offsetWidth - playerWidth, playerX + playerSpeed);

    playerRotation += rotationSpeed;
    if (playerRotation >= 360) playerRotation -= 360;

    player.style.left = playerX + 'px';
    player.style.top = playerY + 'px';
    player.style.transform = `rotate(${playerRotation}deg)`;

    requestAnimationFrame(updatePlayerPosition);
}

function createEnemy() {
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    const sides = Math.floor(Math.random() * (level + 4)); // Изменено с 2 на 4
    enemy.dataset.sides = sides;

    const size = 30 + Math.random() * 40;
    enemy.style.width = size + 'px';
    enemy.style.height = size + 'px';

    const inner = document.createElement('div');
    inner.style.width = '100%';
    inner.style.height = '100%';
    inner.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    inner.style.border = '2px solid #fff';

    if (sides === 0) {
        inner.style.borderRadius = '50%';
    } else if (sides === 2) {
        enemy.style.width = '2px';
        enemy.style.height = '50px';
        inner.style.backgroundColor = '#fff';
    } else if (sides === 3) {
        inner.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
    } else if (sides >= 4) {
        const angle = 360 / sides;
        const points = [];
        for (let i = 0; i < sides; i++) {
            const x = 50 + 50 * Math.cos(((angle * i) * Math.PI) / 180);
            const y = 50 + 50 * Math.sin(((angle * i) * Math.PI) / 180);
            points.push(`${x}% ${y}%`);
        }
        inner.style.clipPath = `polygon(${points.join(', ')})`;
    }

    enemy.appendChild(inner);

    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.max(game.clientWidth, game.clientHeight) / 2 + 100;
    enemy.style.left = game.clientWidth / 2 + Math.cos(angle) * distance + 'px';
    enemy.style.top = game.clientHeight / 2 + Math.sin(angle) * distance + 'px';

    const targetX = Math.random() * game.clientWidth;
    const targetY = Math.random() * game.clientHeight;

    game.appendChild(enemy);
    enemies.push(enemy);

    const dx = targetX - parseFloat(enemy.style.left);
    const dy = targetY - parseFloat(enemy.style.top);
    const speed = 1 + level * 0.2;

    const rotationSpeed = (Math.random() * 4 - 2);
    let rotation = 0;

    const moveInterval = setInterval(() => {
        if (!enemy.parentElement) {
            clearInterval(moveInterval);
            return;
        }

        const x = parseFloat(enemy.style.left);
        const y = parseFloat(enemy.style.top);

        enemy.style.left = x + (dx / distance) * speed + 'px';
        enemy.style.top = y + (dy / distance) * speed + 'px';

        rotation += rotationSpeed;
        enemy.style.transform = `rotate(${rotation}deg)`;

        if (Math.abs(x - game.clientWidth / 2) > distance || Math.abs(y - game.clientHeight / 2) > distance) {
            game.removeChild(enemy);
            clearInterval(moveInterval);
            enemies = enemies.filter(e => e !== enemy);
        }

        if (!isGameOver && checkCollision(player, enemy)) {
            handleCollision(enemy);
            clearInterval(moveInterval);
        }
    }, 20);
}

function checkCollision(player, enemy) {
    const playerRect = player.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect();

    const isColliding = !(
        playerRect.right < enemyRect.left ||
        playerRect.left > enemyRect.right ||
        playerRect.bottom < enemyRect.top ||
        playerRect.top > enemyRect.bottom
    );

    if (!isColliding) return false;

    const playerCenterX = playerRect.left + playerRect.width / 2;
    const playerCenterY = playerRect.top + playerRect.height / 2;
    const enemyCenterX = enemyRect.left + enemyRect.width / 2;
    const enemyCenterY = enemyRect.top + enemyRect.height / 2;

    const distance = Math.sqrt(
        Math.pow(playerCenterX - enemyCenterX, 2) + Math.pow(playerCenterY - enemyCenterY, 2)
    );

    return distance < (playerRect.width / 2 + enemyRect.width / 2);
}

function handleCollision(enemy) {
    const enemySides = parseInt(enemy.dataset.sides);

    enemies = enemies.filter(e => e !== enemy);

    if (enemySides === 0) {
        gameOver();
    } else if (enemySides <= playerSides) {
        absorbEnemy(enemy);

        score += (enemySides === 2) ? 2 : (enemySides + 1);
        levelProgress += (enemySides === 2) ? 2 : (enemySides + 1);
        eatenCount++;
        scoreElement.innerText = score;

        if (levelProgress >= levelThreshold) {
            level++;
            levelProgress = 0;
            levelThreshold += 3;
            levelElement.innerText = level;
            playerSides++;
            initPlayer();
        }
    } else {
        gameOver();
    }
}

function absorbEnemy(enemy) {
    const playerRect = player.getBoundingClientRect();
    const playerCenterX = playerRect.left + playerRect.width / 2;
    const playerCenterY = playerRect.top + playerRect.height / 2;

    const enemyRect = enemy.getBoundingClientRect();
    const enemyCenterX = enemyRect.left + enemyRect.width / 2;
    const enemyCenterY = enemyRect.top + enemyRect.height / 2;

    const targetX = playerCenterX - enemyCenterX;
    const targetY = playerCenterY - enemyCenterY;

    enemy.style.setProperty('--targetX', `${targetX}px`);
    enemy.style.setProperty('--targetY', `${targetY}px`);
    enemy.classList.add('absorbing');

    enemy.addEventListener('animationend', () => {
        game.removeChild(enemy);
    });
}

function gameOver() {
    isGameOver = true;

    // Эффект разваливания фигуры игрока
    explodePlayer();

    // Задержка перед показом экрана завершения игры
    setTimeout(() => {
        game.classList.add('blur');
        gameOverScreen.style.display = 'block';
        player.style.display = 'none';

        finalScoreElement.innerText = score;
        eatenCountElement.innerText = eatenCount;
        finalSidesElement.innerText = playerSides;
        gameTimeElement.innerText = Math.floor(gameTime);

        // Анимация вылета таблички "Поражение"
        animateGameOverScreen();
    }, 2000); // Задержка 2 секунды (время анимации разваливания)
}

function explodePlayer() {
    const pieces = 6; // Количество кусочков, на которые разваливается игрок
    const playerRect = player.getBoundingClientRect();
    const centerX = playerRect.left + playerRect.width / 2;
    const centerY = playerRect.top + playerRect.height / 2;

    for (let i = 0; i < pieces; i++) {
        const piece = document.createElement('div');
        piece.classList.add('player-piece');
        piece.style.width = playerRect.width / 3 + 'px';
        piece.style.height = playerRect.height / 3 + 'px';
        piece.style.backgroundColor = '#fff';
        piece.style.position = 'absolute';
        piece.style.left = centerX + 'px';
        piece.style.top = centerY + 'px';
        piece.style.borderRadius = '50%'; // Делаем кусочки круглыми
        piece.style.transformOrigin = 'center center';

        // Случайное смещение для эффекта падения
        const offsetX = (Math.random() - 0.5) * 50; // Случайное смещение по X
        const offsetY = Math.random() * 100; // Случайное смещение по Y

        // Анимация падения
        piece.animate(
            [
                { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
                { transform: `translate(${offsetX}px, ${offsetY}px) rotate(360deg)`, opacity: 0.5 },
            ],
            {
                duration: 2000,
                easing: 'ease-out',
                fill: 'forwards',
            }
        );

        game.appendChild(piece);

        // Удаление кусочка после завершения анимации
        piece.addEventListener('animationend', () => {
            game.removeChild(piece);
        });
    }
}

function animateGameOverScreen() {
    const gameOverRect = gameOverScreen.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    // Начальные координаты для анимации
    gameOverScreen.style.left = playerRect.left + 'px';
    gameOverScreen.style.top = playerRect.top + 'px';
    gameOverScreen.style.transform = 'scale(0)';
    gameOverScreen.style.opacity = '0';

    // Анимация увеличения и перемещения
    gameOverScreen.animate(
        [
            { transform: 'scale(0)', opacity: 0 },
            { transform: 'scale(1)', opacity: 1 },
        ],
        {
            duration: 1000,
            easing: 'ease-out',
            fill: 'forwards',
        }
    );

    // Перемещение в центр экрана
    const targetX = (window.innerWidth - gameOverRect.width) / 2;
    const targetY = (window.innerHeight - gameOverRect.height) / 2;

    gameOverScreen.animate(
        [
            { left: playerRect.left + 'px', top: playerRect.top + 'px' },
            { left: targetX + 'px', top: targetY + 'px' },
        ],
        {
            duration: 1000,
            easing: 'ease-out',
            fill: 'forwards',
        }
    );
}

// Обработчик для кнопки "Играть снова"
retryButton.addEventListener('click', () => {
    window.location.reload();
});

function initGame() {
    initPlayer();
    setInterval(createEnemy, 1000);
    updatePlayerPosition();

    setInterval(() => {
        if (!isGameOver) gameTime++;
    }, 1000);
}

// Запуск игры
initGame();
