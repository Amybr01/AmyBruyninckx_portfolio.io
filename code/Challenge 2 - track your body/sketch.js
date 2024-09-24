let video;
let handpose;
let predictions = [];
let balls = [];
let gameStarted = false;
let modelReadyFlag = false;
let score = 0;
let spawnInterval = 60; 

let frameCountSinceLastSpawn = 0;

function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();

    video.elt.addEventListener('loadeddata', () => {
    });

    handpose = ml5.handpose(video, { detectionConfidence: 0.8 }, () => { 
        modelReadyFlag = true;
    });

    handpose.on('predict', results => {
        predictions = results;
    });

    let startButton = select('#startButton');
    startButton.mousePressed(startGame);
}

function startGame() {
    let startButton = select('#startButton');
    startButton.hide();

    gameStarted = true;
    score = 0;
    console.log('Game Started');
}

function draw() {
    if (!gameStarted || !modelReadyFlag) {
        return;
    }

    background(220);

    image(video, 0, 0, width, height);

    drawKeypoints();
    spawnNewBalls();

    for (let i = balls.length - 1; i >= 0; i--) {
        let ball = balls[i];
        ball.update();
        ball.display();

        if (ball.y > height + ball.r) {
            balls.splice(i, 1);
        }
    }

    fill(0);
    textSize(24);
    text(`Score: ${score}`, 10, height - 30);
}

function drawKeypoints() {
    if (predictions.length === 0) {
        console.log('No hand detected');
        return;
    }

    for (let i = 0; i < predictions.length; i++) {
        let prediction = predictions[i];
        let indexFinger = prediction.landmarks[8]; // wijs vinger punt

        fill(255, 0, 0);
        noStroke();
        ellipse(indexFinger[0], indexFinger[1], 10, 10);

        for (let j = balls.length - 1; j >= 0; j--) {
            let ball = balls[j];
            if (ball.checkCollision(indexFinger)) {
                if (ball.color === 'red') {
                    score--;
                } else {
                    score++;
                }
                balls.splice(j, 1);
            }
        }
    }
}

function spawnNewBalls() {
    frameCountSinceLastSpawn++;
    if (frameCountSinceLastSpawn >= spawnInterval) {
        let color = random(['green', 'yellow', 'red']);
        balls.push(new Ball(random(width), random(-height, 0), random(15, 30), color));
        frameCountSinceLastSpawn = 0;
    }
}

class Ball {
    constructor(x, y, r, color) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
        this.ySpeed = random(1, 3);
    }

    update() {
        this.y += this.ySpeed;
    }

    display() {
        if (this.color === 'green') {
            fill(0, 255, 0); // Groen
        } else if (this.color === 'yellow') {
            fill(255, 255, 0); // geel
        } else if (this.color === 'red') {
            fill(255, 0, 0); //rood
        }
        noStroke();
        ellipse(this.x, this.y, this.r * 2);
    }

    checkCollision(finger) {
        if (finger && finger[0] !== undefined && finger[1] !== undefined) {
            let d = dist(this.x, this.y, finger[0], finger[1]);
            return d < this.r + 10;
        }
        return false;
    }
}
