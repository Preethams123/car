// ======================================
// CANVAS
// ======================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 700;


// ======================================
// GAME VARIABLES
// ======================================

let gameRunning = true;

let score = 0;

let roadOffset = 0;

let baseSpeed = 6;

let gameSpeed = baseSpeed;

let difficultyTimer = 0;

let animationId;

let invincible = false;


// ======================================
// BOOST SYSTEM
// ======================================

let boostActive = false;

let boostFuel = 100;


// ======================================
// LANES
// ======================================

const lanes = [75, 175, 275];


// ======================================
// MODES
// ======================================

const gameModes = {

    highway: {

        road: "#444",
        side: "#222",
        line: "white",
        bg: "#87CEEB"
    },

    desert: {

        road: "#8B5A2B",
        side: "#D2B48C",
        line: "#fff3b0",
        bg: "#F4A460"
    },

    mud: {

        road: "#4E342E",
        side: "#3E2723",
        line: "#BCAAA4",
        bg: "#795548"
    }
};


const weatherModes = {

    day: null,

    night: "rgba(0,0,40,0.5)",

    rainy: "rgba(80,80,120,0.25)"
};


let currentMode = "highway";

let currentWeather = "day";


// ======================================
// PLAYER
// ======================================

let currentLane = 1;

const player = {

    x: lanes[currentLane],
    y: 560,

    width: 50,
    height: 90
};
// ======================================
// MOBILE CONTROLS
// ======================================

const leftBtn =
    document.getElementById("leftBtn");

const rightBtn =
    document.getElementById("rightBtn");


// LEFT

leftBtn.addEventListener("touchstart", () => {

    if (currentLane > 0) {

        currentLane--;
    }
});


// RIGHT

rightBtn.addEventListener("touchstart", () => {

    if (currentLane < 2) {

        currentLane++;
    }
});

// ======================================
// INPUTS
// ======================================

document.addEventListener("keydown", (e) => {

    if (e.key === "ArrowLeft") {

        if (currentLane > 0) {

            currentLane--;
        }
    }

    if (e.key === "ArrowRight") {

        if (currentLane < 2) {

            currentLane++;
        }
    }
});


// ======================================
// BOOST BUTTON
// ======================================

const boostBtn =
    document.getElementById("boostBtn");


function enableBoost() {

    if (boostFuel > 0) {

        boostActive = true;
    }
}


function disableBoost() {

    boostActive = false;
}


// DESKTOP

boostBtn.addEventListener(
    "mousedown",
    enableBoost
);

boostBtn.addEventListener(
    "mouseup",
    disableBoost
);

boostBtn.addEventListener(
    "mouseleave",
    disableBoost
);


// MOBILE

boostBtn.addEventListener(
    "touchstart",
    enableBoost
);

boostBtn.addEventListener(
    "touchend",
    disableBoost
);


// ======================================
// ENEMIES
// ======================================

const enemies = [];

let enemySpawnTimer = 0;

let enemySpawnInterval = 90;


// ======================================
// OBSTACLES
// ======================================

const obstacles = [];

let obstacleSpawnTimer = 0;


// ======================================
// RAIN
// ======================================

const rainDrops = [];

for (let i = 0; i < 120; i++) {

    rainDrops.push({

        x: Math.random() * canvas.width,

        y: Math.random() * canvas.height,

        speed: 4 + Math.random() * 5
    });
}


// ======================================
// DRAW ROAD
// ======================================

function drawRoad() {

    const mode = gameModes[currentMode];


    ctx.fillStyle = mode.bg;

    ctx.fillRect(0, 0, canvas.width, canvas.height);


    ctx.fillStyle = mode.road;

    ctx.fillRect(25, 0, 350, canvas.height);


    ctx.fillStyle = mode.side;

    ctx.fillRect(0, 0, 25, canvas.height);

    ctx.fillRect(375, 0, 25, canvas.height);


    ctx.strokeStyle = mode.line;

    ctx.lineWidth = 5;

    ctx.setLineDash([40, 30]);

    ctx.lineDashOffset = -roadOffset;


    ctx.beginPath();
    ctx.moveTo(133, 0);
    ctx.lineTo(133, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(266, 0);
    ctx.lineTo(266, canvas.height);
    ctx.stroke();


    roadOffset += gameSpeed;


    applyWeatherEffects();
}


// ======================================
// WEATHER EFFECTS
// ======================================

function applyWeatherEffects() {

    const overlay = weatherModes[currentWeather];

    if (overlay) {

        ctx.fillStyle = overlay;

        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (currentWeather === "rainy") {

        drawRain();
    }
}


// ======================================
// RAIN
// ======================================

function drawRain() {

    ctx.strokeStyle = "rgba(255,255,255,0.5)";

    rainDrops.forEach(drop => {

        ctx.beginPath();

        ctx.moveTo(drop.x, drop.y);

        ctx.lineTo(drop.x - 3, drop.y + 12);

        ctx.stroke();

        drop.y += drop.speed;

        if (drop.y > canvas.height) {

            drop.y = -20;

            drop.x = Math.random() * canvas.width;
        }
    });
}


// ======================================
// ROUND RECT
// ======================================

function roundRect(x, y, width, height, radius) {

    ctx.beginPath();

    ctx.moveTo(x + radius, y);

    ctx.lineTo(x + width - radius, y);

    ctx.quadraticCurveTo(
        x + width,
        y,
        x + width,
        y + radius
    );

    ctx.lineTo(x + width, y + height - radius);

    ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
    );

    ctx.lineTo(x + radius, y + height);

    ctx.quadraticCurveTo(
        x,
        y + height,
        x,
        y + height - radius
    );

    ctx.lineTo(x, y + radius);

    ctx.quadraticCurveTo(
        x,
        y,
        x + radius,
        y
    );

    ctx.closePath();

    ctx.fill();
}


// ======================================
// DRAW CAR
// ======================================

function drawCar(x, y, color) {

    ctx.fillStyle = "rgba(0,0,0,0.3)";

    ctx.beginPath();

    ctx.ellipse(
        x + 25,
        y + 95,
        28,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    const gradient =
        ctx.createLinearGradient(
            x,
            y,
            x,
            y + 90
        );

    gradient.addColorStop(0, color);

    gradient.addColorStop(1, "#111");

    ctx.fillStyle = gradient;

    roundRect(x, y + 8, 50, 78, 12);


    ctx.fillStyle = "#d9d9d9";

    roundRect(x + 8, y + 22, 34, 30, 8);


    ctx.fillStyle = "#87CEEB";

    roundRect(x + 10, y + 25, 30, 10, 4);

    roundRect(x + 10, y + 40, 30, 10, 4);


    ctx.fillStyle = "black";

    ctx.fillRect(x - 4, y + 18, 5, 18);

    ctx.fillRect(x - 4, y + 58, 5, 18);

    ctx.fillRect(x + 49, y + 18, 5, 18);

    ctx.fillRect(x + 49, y + 58, 5, 18);


    ctx.fillStyle = "yellow";

    ctx.fillRect(x + 5, y + 8, 10, 4);

    ctx.fillRect(x + 35, y + 8, 10, 4);


    ctx.fillStyle = "red";

    ctx.fillRect(x + 5, y + 82, 10, 4);

    ctx.fillRect(x + 35, y + 82, 10, 4);
}


// ======================================
// PLAYER
// ======================================

function drawPlayer() {

    drawCar(player.x, player.y, "#00ffff");
}


function updatePlayer() {

    const targetX = lanes[currentLane];

    player.x += (targetX - player.x) * 0.15;
}


// ======================================
// ENEMIES
// ======================================

function spawnEnemy() {

    const lane =
        lanes[Math.floor(Math.random() * lanes.length)];

    for (let enemy of enemies) {

        if (

            enemy.x === lane &&
            enemy.y < 250

        ) {

            return;
        }
    }


    const colors = [
        "#ff4444",
        "#4488ff",
        "#44ff44",
        "#ffaa00",
        "#bb66ff"
    ];

    enemies.push({

        x: lane,
        y: -120,

        width: 50,
        height: 90,

        speed: gameSpeed,

        color:
            colors[Math.floor(Math.random() * colors.length)]
    });
}


function updateEnemies() {

    enemySpawnTimer++;

    if (enemySpawnTimer >= enemySpawnInterval) {

        spawnEnemy();

        enemySpawnTimer = 0;
    }

    for (let i = enemies.length - 1; i >= 0; i--) {

        enemies[i].y += enemies[i].speed;

        if (enemies[i].y > canvas.height) {

            enemies.splice(i, 1);
        }
    }
}


function drawEnemies() {

    enemies.forEach(enemy => {

        drawCar(enemy.x, enemy.y, enemy.color);
    });
}


// ======================================
// OBSTACLES
// ======================================

function spawnObstacle() {

    const lane =
        lanes[Math.floor(Math.random() * lanes.length)];


    const blockedLanes = [];

    obstacles.forEach(obstacle => {

        if (obstacle.y < 250) {

            blockedLanes.push(obstacle.x);
        }
    });


    if (

        blockedLanes.length >= 2 &&
        blockedLanes.includes(lane)

    ) {

        return;
    }


    for (let obstacle of obstacles) {

        if (

            obstacle.x === lane &&
            obstacle.y < 250

        ) {

            return;
        }
    }


    for (let enemy of enemies) {

        if (

            enemy.x === lane &&
            enemy.y < 250

        ) {

            return;
        }
    }


    const types = [
        "tree",
        "barricade",
        "hole",
        "oil"
    ];

    const type =
        types[Math.floor(Math.random() * types.length)];


    obstacles.push({

        x: lane,
        y: -100,

        width: 60,
        height: 60,

        speed: gameSpeed,

        type
    });
}


function updateObstacles() {

    obstacleSpawnTimer++;

    if (obstacleSpawnTimer >= 240) {

        spawnObstacle();

        obstacleSpawnTimer = 0;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {

        obstacles[i].y += obstacles[i].speed;

        if (obstacles[i].y > canvas.height) {

            obstacles.splice(i, 1);
        }
    }
}


// ======================================
// DRAW OBSTACLES
// ======================================

function drawTree(x, y) {

    ctx.fillStyle = "#5D4037";

    ctx.fillRect(x + 20, y + 30, 15, 30);

    ctx.fillStyle = "green";

    ctx.beginPath();

    ctx.arc(
        x + 28,
        y + 20,
        25,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


function drawBarricade(x, y) {

    ctx.fillStyle = "orange";

    ctx.fillRect(x, y, 60, 30);

    ctx.fillStyle = "white";

    ctx.fillRect(x + 10, y + 10, 10, 10);

    ctx.fillRect(x + 40, y + 10, 10, 10);
}


function drawHole(x, y) {

    ctx.fillStyle = "black";

    ctx.beginPath();

    ctx.ellipse(
        x + 30,
        y + 30,
        30,
        20,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


function drawOil(x, y) {

    ctx.fillStyle = "rgba(20,20,20,0.8)";

    ctx.beginPath();

    ctx.ellipse(
        x + 30,
        y + 30,
        35,
        15,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


function drawObstacles() {

    obstacles.forEach(obstacle => {

        if (obstacle.type === "tree") {

            drawTree(obstacle.x, obstacle.y);
        }

        if (obstacle.type === "barricade") {

            drawBarricade(obstacle.x, obstacle.y);
        }

        if (obstacle.type === "hole") {

            drawHole(obstacle.x, obstacle.y);
        }

        if (obstacle.type === "oil") {

            drawOil(obstacle.x, obstacle.y);
        }
    });
}


// ======================================
// COLLISION
// ======================================

function detectCollision() {

    if (invincible) return;


    for (let enemy of enemies) {

        if (

            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y

        ) {

            gameOver();
        }
    }


    for (let obstacle of obstacles) {

        if (

            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y

        ) {

            gameOver();
        }
    }
}


// ======================================
// SCORE
// ======================================

function updateScore() {

    score += gameSpeed * 0.05;

    document.getElementById("score")
    .innerText =
        "Score : " + Math.floor(score);

    document.getElementById("speed")
    .innerText =
        "Speed : " + gameSpeed.toFixed(1);

    document.getElementById("boostMeter")
    .innerText =
        "Boost : " + Math.floor(boostFuel);
}


// ======================================
// BOOST
// ======================================

function updateBoost() {

    if (boostActive && boostFuel > 0) {

        gameSpeed = baseSpeed + 6;

        boostFuel -= 0.5;
    }
    else {

        gameSpeed = baseSpeed;
    }


    if (!boostActive && boostFuel < 100) {

        boostFuel += 0.2;
    }
}


// ======================================
// DIFFICULTY
// ======================================

function updateDifficulty() {

    difficultyTimer++;

    if (difficultyTimer >= 500) {

        baseSpeed += 0.3;

        if (enemySpawnInterval > 40) {

            enemySpawnInterval -= 2;
        }

        difficultyTimer = 0;
    }
}


// ======================================
// MODES
// ======================================

function changeMode(mode) {

    currentMode = mode;
}


function changeWeather(weather) {

    currentWeather = weather;
}


// ======================================
// GAME OVER
// ======================================

function gameOver() {

    gameRunning = false;

    cancelAnimationFrame(animationId);

    document
        .getElementById("gameOverScreen")
        .classList
        .remove("hidden");
}


// ======================================
// RESTART
// ======================================

function restartGame() {

    enemies.length = 0;

    obstacles.length = 0;

    score = 0;

    baseSpeed = 6;

    gameSpeed = 6;

    boostFuel = 100;

    currentLane = 1;

    player.x = lanes[currentLane];

    invincible = true;

    setTimeout(() => {

        invincible = false;

    }, 2000);

    gameRunning = true;

    document
        .getElementById("gameOverScreen")
        .classList
        .add("hidden");

    gameLoop();
}


// ======================================
// MAIN LOOP
// ======================================

function gameLoop() {

    if (!gameRunning) {
        return;
    }

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // UPDATE

    updatePlayer();

    updateEnemies();

    updateObstacles();

    updateBoost();

    updateDifficulty();

    detectCollision();

    updateScore();


    // DRAW

    drawRoad();

    drawObstacles();

    drawEnemies();

    drawPlayer();


    animationId =
        requestAnimationFrame(gameLoop);
}


// ======================================
// START
// ======================================

restartGame();