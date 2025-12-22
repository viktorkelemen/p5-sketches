// ASCII Wave - Density-based ASCII art animation
// Characters represent luminosity in a flowing wave pattern

let charSize = 12;
let cols, rows;
let time = 0;

// ASCII density ramp from dark to light
const densityChars = ' .:-=+*#%@';

// Alternative ramps for different moods
const binaryRamp = ' 01';
const blockRamp = ' ░▒▓█';
const symbolRamp = ' ·•●○◐◑◒◓';

let currentRamp = densityChars;
let noiseScale = 0.02;
let waveSpeed = 0.02;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Courier New');
  textSize(charSize);
  textAlign(CENTER, CENTER);
  colorMode(HSB, 360, 100, 100, 100);

  cols = floor(width / charSize);
  rows = floor(height / charSize);
}

function draw() {
  background(0);

  time += waveSpeed;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let px = x * charSize + charSize / 2;
      let py = y * charSize + charSize / 2;

      // Calculate wave value using multiple noise layers
      let wave1 = sin(x * 0.1 + time * 2) * cos(y * 0.08 + time);
      let wave2 = sin(dist(x, y, cols/2, rows/2) * 0.1 - time * 1.5);
      let noiseVal = noise(x * noiseScale, y * noiseScale, time * 0.5);

      // Combine waves
      let value = (wave1 + wave2) * 0.25 + noiseVal * 0.5 + 0.5;
      value = constrain(value, 0, 1);

      // Map to character
      let charIndex = floor(value * (currentRamp.length - 1));
      let char = currentRamp.charAt(charIndex);

      // Color based on value and position
      let hue = (value * 60 + time * 20 + x * 0.5) % 360;
      let sat = 60;
      let bright = map(value, 0, 1, 30, 100);

      // Amber/green terminal color option
      if (mouseIsPressed) {
        hue = 120; // Green phosphor
        sat = 80;
      }

      fill(hue, sat, bright);
      text(char, px, py);
    }
  }

  // Scanline effect
  drawScanlines();

  // Info overlay
  drawInfo();
}

function drawScanlines() {
  noStroke();
  for (let y = 0; y < height; y += 2) {
    fill(0, 0, 0, 15);
    rect(0, y, width, 1);
  }
}

function drawInfo() {
  fill(0, 0, 100, 50);
  textSize(10);
  textAlign(LEFT, TOP);
  text('1-4: Change character set | Click: Phosphor mode', 10, 10);
  textSize(charSize);
  textAlign(CENTER, CENTER);
}

function keyPressed() {
  switch(key) {
    case '1':
      currentRamp = densityChars;
      break;
    case '2':
      currentRamp = binaryRamp;
      break;
    case '3':
      currentRamp = blockRamp;
      break;
    case '4':
      currentRamp = symbolRamp;
      break;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cols = floor(width / charSize);
  rows = floor(height / charSize);
}
