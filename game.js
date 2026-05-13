const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 700;


// ======================================
// VARIABLES
// ======================================

let gameRunning = true;

let score = 0;

let roadOffset = 0;

let baseSpeed = 6;

let gameSpeed = 6;

let animationId;

let boostActive = false;

let boostFuel = 100;

let currentLane = 1;

const lanes = [75, 175, 275];


// ======================================
// GAME MODES
// ======================================

const gameModes = {

    highway: {

        road: "#444",
        bg: "#4fc3f7",
        grass: "#2e7d32",
        line: "white"
    },

    desert: {

        road: "#8d6e63",
        bg: "#ffcc80",
        grass: "#bf8f30",
        line: "#fff3c4"
    },

    snow: {

        road: "#90a4ae",
        bg: "#e1f5fe",
        grass: "#cfd8dc",
        line: "#ffffff"
    },

    night: {

        road: "#263238",
        bg: "#000814",
        grass: "#001d3d",
        line: "#90e0ef"
    }
};

let currentMode = "highway";


// ======================================
// PLAYER
// ======================================

const player = {

    x: lanes[currentLane],

    y: 560,

    width: 50,

    height: 90
};


// ======================================
// ENEMIES
// ======================================

const enemies = [];

let enemySpawnTimer = 0;

let enemySpawnInterval = 90;


// ======================================
// BUTTONS
// ======================================

const moveLeftBtn =
    document.getElementById("moveLeftBtn");

const moveRightBtn =
    document.getElementById("moveRightBtn");

const boostBtn =
    document.getElementById("boostBtn");


// ======================================
// KEYBOARD
// ======================================

document.addEventListener("keydown", (e) => {

    if (e.key === "ArrowLeft") {

        moveLeft();
    }

    if (e.key === "ArrowRight") {

        moveRight();
    }
});


// ======================================
// MOVE FUNCTIONS
// ======================================

function moveLeft() {

    if (currentLane > 0) {

        currentLane--;
    }
}

function moveRight() {

    if (currentLane < 2) {

        currentLane++;
    }
}


// ======================================
// BUTTON EVENTS
// ======================================

moveLeftBtn.addEventListener(
    "touchstart",
    moveLeft
);

moveLeftBtn.addEventListener(
    "mousedown",
    moveLeft
);

moveLeftBtn.addEventListener(
    "click",
    moveLeft
);


moveRightBtn.addEventListener(
    "touchstart",
    moveRight
);

moveRightBtn.addEventListener(
    "mousedown",
    moveRight
);

moveRightBtn.addEventListener(
    "click",
    moveRight
);


// ======================================
// BOOST
// ======================================

function enableBoost() {

    if (boostFuel > 0) {

        boostActive = true;
    }
}

function disableBoost() {

    boostActive = false;
}

boostBtn.addEventListener(
    "touchstart",
    enableBoost
);

boostBtn.addEventListener(
    "touchend",
    disableBoost
);

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


// ======================================
// MODE CHANGE
// ======================================

function changeMode(mode) {

    currentMode = mode;

    document.getElementById("modeName")
    .innerText =
        mode.charAt(0).toUpperCase()
        + mode.slice(1)
        + " Mode";
}


// ======================================
// DRAW ROAD
// ======================================

function drawRoad() {

    const mode =
        gameModes[currentMode];


    ctx.fillStyle = mode.bg;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.fillStyle = mode.grass;

    ctx.fillRect(
        0,
        0,
        40,
        canvas.height
    );

    ctx.fillRect(
        360,
        0,
        40,
        canvas.height
    );


    ctx.fillStyle = mode.road;

    ctx.fillRect(
        40,
        0,
        320,
        canvas.height
    );


    ctx.strokeStyle = mode.line;

    ctx.lineWidth = 5;

    ctx.setLineDash([40, 30]);

    ctx.lineDashOffset = -roadOffset;


    ctx.beginPath();

    ctx.moveTo(145, 0);

    ctx.lineTo(145, canvas.height);

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(255, 0);

    ctx.lineTo(255, canvas.height);

    ctx.stroke();


    roadOffset += gameSpeed;
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

    roundRect(x, y, 50, 90, 12);


    ctx.fillStyle = "#87CEEB";

    roundRect(x + 8, y + 15, 34, 20, 6);

    roundRect(x + 8, y + 45, 34, 20, 6);


    ctx.fillStyle = "black";

    ctx.fillRect(x - 4, y + 15, 5, 20);

    ctx.fillRect(x - 4, y + 55, 5, 20);

    ctx.fillRect(x + 49, y + 15, 5, 20);

    ctx.fillRect(x + 49, y + 55, 5, 20);
}


// ======================================
// PLAYER
// ======================================

function updatePlayer() {

    const targetX =
        lanes[currentLane];

    player.x +=
        (targetX - player.x) * 0.15;
}


function drawPlayer() {

    if(boostActive){

        ctx.fillStyle = "orange";

        ctx.beginPath();

        ctx.moveTo(
            player.x + 15,
            player.y + 90
        );

        ctx.lineTo(
            player.x + 25,
            player.y + 120
        );

        ctx.lineTo(
            player.x + 35,
            player.y + 90
        );

        ctx.fill();
    }


    drawCar(
        player.x,
        player.y,
        "#00ffff"
    );
}


// ======================================
// ENEMIES
// ======================================

function spawnEnemy() {

    const lane =
        lanes[
            Math.floor(
                Math.random() * lanes.length
            )
        ];

    const colors = [
        "#ff4444",
        "#44ff44",
        "#4488ff",
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
        colors[
            Math.floor(
                Math.random()
                * colors.length
            )
        ]
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

        drawCar(
            enemy.x,
            enemy.y,
            enemy.color
        );
    });
}


// ======================================
// COLLISION
// ======================================

function detectCollision() {

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
}


// ======================================
// BOOST
// ======================================

function updateBoost() {

    if (boostActive && boostFuel > 0) {

        gameSpeed = 12;

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
// UI
// ======================================

function updateUI() {

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

    score = 0;

    boostFuel = 100;

    currentLane = 1;

    player.x = lanes[currentLane];

    gameRunning = true;

    document
        .getElementById("gameOverScreen")
        .classList
        .add("hidden");

    gameLoop();
}


// ======================================
// GAME LOOP
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


    updatePlayer();

    updateEnemies();

    updateBoost();

    detectCollision();

    updateUI();


    drawRoad();

    drawEnemies();

    drawPlayer();


    animationId =
        requestAnimationFrame(gameLoop);
}


// ======================================
// START
// ======================================

restartGame();