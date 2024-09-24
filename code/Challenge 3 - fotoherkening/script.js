let video;
let poseNet;
let handpose;
let poses = [];
let hands = [];
let modelReady = false;

function setup() {
  noCanvas();
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.parent('camera-container');

  poseNet = ml5.poseNet(video, () => {
    console.log('PoseNet Model Loaded!');
    checkModelsReady();
  });

  poseNet.on('pose', results => {
    poses = results;
  });

  handpose = ml5.handpose(video, () => {
    console.log('Handpose Model Loaded!');
    checkModelsReady();
  });

  handpose.on('predict', results => {
    hands = results;
  });

  const captureBtn = document.getElementById('capture-btn');
  captureBtn.addEventListener('click', capturePhoto);
}

function checkModelsReady() {
  if (poseNet && handpose) {
    modelReady = true;
    document.querySelector("h1").innerText = "Models Loaded! Click 'Capture Photo' to detect body parts";
  }
}

function capturePhoto() {
  if (modelReady) {
    video.loadPixels();
    const capturedImage = video.canvas.toDataURL();
    addImageToResults(capturedImage);
  }
}

function addImageToResults(imageSrc) {
  const resultContainer = document.getElementById('result-container');
  const resultCard = document.createElement('div');
  resultCard.className = 'result-card';

  const img = document.createElement('img');
  img.src = imageSrc;
  resultCard.appendChild(img);

  const classifyInfo = document.createElement('div');
  classifyInfo.className = 'classify-info';
  classifyInfo.innerHTML = '<h2>&nbsp;</h2>';
  resultCard.appendChild(classifyInfo);

  resultContainer.appendChild(resultCard);

  img.addEventListener('click', () => {
    classifyImage(img);
  });
}

async function classifyImage(imageElement) {
  const classifyInfo = imageElement.nextElementSibling;
  classifyInfo.innerHTML = '';

  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = imageElement.width;
  offscreenCanvas.height = imageElement.height;
  const ctx = offscreenCanvas.getContext('2d');
  ctx.drawImage(imageElement, 0, 0, offscreenCanvas.width, offscreenCanvas.height);

  const img = new Image();
  img.src = offscreenCanvas.toDataURL();
  await new Promise(resolve => img.onload = resolve);

  await detectPosesAndHands(offscreenCanvas);

  const bodyParts = detectBodyParts();
  for (let part of bodyParts) {
    classifyInfo.innerHTML += `<h2>${part}</h2>`;
  }
}

async function detectPosesAndHands(canvas) {
  poses = [];
  hands = [];

  const img = new Image();
  img.src = canvas.toDataURL();
  await new Promise(resolve => img.onload = resolve);

  poseNet.singlePose(img, (error, results) => {
    if (error) {
      console.error(error);
    } else {
      poses = results ? [results] : [];
    }
  });

  handpose.predict(img, (error, results) => {
    if (error) {
      console.error(error);
    } else {
      hands = results;
    }
  });

  await new Promise(resolve => setTimeout(resolve, 1000));
}

function detectBodyParts() {
  const bodyParts = [];
  const keypoints = poses[0] ? poses[0].pose.keypoints : [];

  const isVisible = (parts) => {
    return parts.some(partName => {
      const point = keypoints.find(p => p.part === partName);
      return point && point.score > 0.5;
    });
  };

  if (isVisible(['nose', 'leftEye', 'rightEye'])) bodyParts.push('Face');
  if (isVisible(['leftElbow', 'rightElbow'])) bodyParts.push('Elbow');
  if (hands.length > 0) {
    bodyParts.push('Hand');
    const landmarks = hands[0].landmarks;
    if (landmarks[8]) {
      bodyParts.push('Finger');
    }
  }

  return bodyParts;
}
