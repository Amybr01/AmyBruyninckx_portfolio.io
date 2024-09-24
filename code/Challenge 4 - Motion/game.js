// game.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let balloon;
let stones;
let score;
let gameRunning = false;

function initGame() {
    balloon = {
        x: canvas.width / 2,
        y: canvas.height - 100,
        radius: 30,
        color: 'red'
    };

    stones = [];
    score = 0;
    gameRunning = true;

    canvas.style.display = 'block';
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

    draw();
}

function drawBalloon() {
    ctx.beginPath();
    ctx.arc(balloon.x, balloon.y, balloon.radius, 0, Math.PI * 2);
    ctx.fillStyle = balloon.color;
    ctx.fill();
    ctx.closePath();
}

function drawStones() {
    stones.forEach(stone => {
        ctx.beginPath();
        ctx.rect(stone.x, stone.y, stone.width, stone.height);
        ctx.fillStyle = 'gray';
        ctx.fill();
        ctx.closePath();
    });
}

function updateStones() {
    stones.forEach(stone => {
        stone.y += stone.speed;
    });

    stones = stones.filter(stone => stone.y < canvas.height);

    if (Math.random() < 0.02) {  
        stones.push({
            x: Math.random() * canvas.width,
            y: 0,
            width: 50,
            height: 50,
            speed: 2 + Math.random() * 3
        });
    }
}

function checkCollision() {
    stones.forEach(stone => {
        let dx = stone.x - balloon.x;
        let dy = stone.y - balloon.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < balloon.radius + stone.width / 2) {
            gameOver();
        }
    });
}

function draw() {
    if (!gameRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBalloon();
    drawStones();
    updateStones();
    checkCollision();
    score++;
    requestAnimationFrame(draw);
}

function gameOver() {
    gameRunning = false;
    canvas.style.display = 'none';
    gameOverScreen.style.display = 'flex';
}

function requestDeviceOrientationPermission() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                } else {
                    alert('Permission to access device orientation was denied.');
                }
            })
            .catch(console.error);
    } else {
        window.addEventListener('deviceorientation', handleOrientation);
    }
}

function handleOrientation(event) {
    if (!gameRunning) return;

    let gamma = event.gamma; 
    let beta = event.beta;   

    if (gamma !== null && beta !== null) {
        // update de positie van de ballon
        balloon.x += gamma * 0.5;
        balloon.y += beta * 0.5;

        // zorg dat de ballon niet uit het canvas kan
        if (balloon.x < balloon.radius) balloon.x = balloon.radius;
        if (balloon.x > canvas.width - balloon.radius) balloon.x = canvas.width - balloon.radius;
        if (balloon.y < balloon.radius) balloon.y = balloon.radius;
        if (balloon.y > canvas.height - balloon.radius) balloon.y = canvas.height - balloon.radius;
    }
}

startButton.addEventListener('click', () => {
    requestDeviceOrientationPermission();
    initGame();
});

restartButton.addEventListener('click', () => {
    startScreen.style.display = 'flex';
    gameOverScreen.style.display = 'none';
    canvas.style.display = 'none';
    gameRunning = false;
});
