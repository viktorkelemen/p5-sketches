// Buddhabrot
// Mandelbrot rendered by tracing escape trajectories
// Creates a "Buddha-like" figure emerging from chaos

let redChannel, greenChannel, blueChannel;
let minX = -2, maxX = 1;
let minY = -1.5, maxY = 1.5;
let samplesPerFrame = 5000;
let maxVal = 1;
let rendering = true;
let totalSamples = 0;

// Different iteration limits for RGB channels (Nebulabrot technique)
let maxIterR = 5000;
let maxIterG = 500;
let maxIterB = 50;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  colorMode(RGB, 255);

  // Initialize accumulation buffers
  redChannel = new Float32Array(width * height);
  greenChannel = new Float32Array(width * height);
  blueChannel = new Float32Array(width * height);

  background(0);
}

function draw() {
  if (rendering) {
    // Process multiple samples per frame
    for (let i = 0; i < samplesPerFrame; i++) {
      // Random point in complex plane
      let cRe = random(-2, 1);
      let cIm = random(-1.5, 1.5);

      // Test if point escapes (not in Mandelbrot set)
      // Only trace points that escape
      traceOrbit(cRe, cIm, maxIterR, redChannel);
      traceOrbit(cRe, cIm, maxIterG, greenChannel);
      traceOrbit(cRe, cIm, maxIterB, blueChannel);
    }

    totalSamples += samplesPerFrame;

    // Update display periodically
    if (frameCount % 10 === 0) {
      updateDisplay();
    }
  }

  // Show progress
  fill(255);
  noStroke();
  textSize(14);
  textAlign(LEFT, TOP);
  text("Samples: " + totalSamples.toLocaleString() + " | Press SPACE to pause/resume", 10, 10);
}

function traceOrbit(cRe, cIm, maxIter, channel) {
  let zRe = 0, zIm = 0;
  let trajectory = [];

  // First pass: check if it escapes and record trajectory
  for (let i = 0; i < maxIter; i++) {
    let zRe2 = zRe * zRe;
    let zIm2 = zIm * zIm;

    if (zRe2 + zIm2 > 4) {
      // Point escapes - now add trajectory to accumulator
      for (let point of trajectory) {
        let px = floor(map(point.re, minX, maxX, 0, width));
        let py = floor(map(point.im, minY, maxY, 0, height));

        if (px >= 0 && px < width && py >= 0 && py < height) {
          let idx = px + py * width;
          channel[idx]++;
          if (channel[idx] > maxVal) maxVal = channel[idx];
        }
      }
      return;
    }

    trajectory.push({ re: zRe, im: zIm });

    let newRe = zRe2 - zIm2 + cRe;
    zIm = 2 * zRe * zIm + cIm;
    zRe = newRe;
  }
  // Point doesn't escape - discard trajectory
}

function updateDisplay() {
  loadPixels();

  // Logarithmic scaling for better dynamic range
  let logMax = log(maxVal + 1);

  for (let i = 0; i < width * height; i++) {
    let r = log(redChannel[i] + 1) / logMax * 255;
    let g = log(greenChannel[i] + 1) / logMax * 255;
    let b = log(blueChannel[i] + 1) / logMax * 255;

    let idx = i * 4;
    pixels[idx] = constrain(r, 0, 255);
    pixels[idx + 1] = constrain(g, 0, 255);
    pixels[idx + 2] = constrain(b, 0, 255);
    pixels[idx + 3] = 255;
  }

  updatePixels();
}

function keyPressed() {
  if (key === ' ') {
    rendering = !rendering;
  } else if (key === 'r' || key === 'R') {
    // Reset
    redChannel.fill(0);
    greenChannel.fill(0);
    blueChannel.fill(0);
    maxVal = 1;
    totalSamples = 0;
    background(0);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redChannel = new Float32Array(width * height);
  greenChannel = new Float32Array(width * height);
  blueChannel = new Float32Array(width * height);
  maxVal = 1;
  totalSamples = 0;
  background(0);
}
