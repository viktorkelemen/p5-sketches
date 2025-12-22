// Magnetic Pendulum Basins
// Visualization of which magnet a pendulum settles on based on initial position
// Creates fractal basin boundaries

let minX = -2;
let maxX = 2;
let minY = -2;
let maxY = 2;

// Magnet positions (equilateral triangle)
let magnets = [];
let magnetColors = [];

// Physics parameters
let magnetStrength = 1;
let friction = 0.2;
let gravity = 0.5;
let pendulumHeight = 0.2;

let computing = false;
let currentRow = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  colorMode(HSB, 360, 100, 100);

  // Three magnets in equilateral triangle
  for (let i = 0; i < 3; i++) {
    let angle = (i * TWO_PI) / 3 - HALF_PI;
    magnets.push({
      x: cos(angle),
      y: sin(angle)
    });
    magnetColors.push(color(i * 120, 80, 90));
  }

  computing = true;
  currentRow = 0;
  background(0);
}

function draw() {
  if (computing) {
    // Process multiple rows per frame for speed
    let rowsPerFrame = 5;

    for (let r = 0; r < rowsPerFrame && currentRow < height; r++) {
      computeRow(currentRow);
      currentRow++;
    }

    if (currentRow >= height) {
      computing = false;
    }

    // Progress indicator
    fill(255);
    noStroke();
    textSize(14);
    let progress = floor((currentRow / height) * 100);
    text(`Computing: ${progress}%`, 10, 25);
  } else {
    // Display info
    fill(255);
    noStroke();
    textSize(14);
    text("Magnetic Pendulum Basins | Click to zoom", 10, 25);
  }
}

function computeRow(row) {
  loadPixels();

  for (let col = 0; col < width; col++) {
    let x0 = map(col, 0, width, minX, maxX);
    let y0 = map(row, 0, height, minY, maxY);

    // Simulate pendulum from this starting position
    let result = simulatePendulum(x0, y0);

    let idx = (col + row * width) * 4;

    if (result.magnet >= 0) {
      // Color based on which magnet and how long it took
      let hue = result.magnet * 120;
      let brightness = map(result.time, 0, 500, 100, 30);
      let c = color(hue, 80, brightness);

      pixels[idx] = red(c);
      pixels[idx + 1] = green(c);
      pixels[idx + 2] = blue(c);
    } else {
      pixels[idx] = 20;
      pixels[idx + 1] = 20;
      pixels[idx + 2] = 20;
    }
    pixels[idx + 3] = 255;
  }

  updatePixels();
}

function simulatePendulum(x0, y0) {
  let x = x0;
  let y = y0;
  let vx = 0;
  let vy = 0;

  let dt = 0.02;
  let maxTime = 500;

  for (let t = 0; t < maxTime; t++) {
    // Calculate forces from each magnet
    let fx = 0;
    let fy = 0;

    for (let m of magnets) {
      let dx = m.x - x;
      let dy = m.y - y;
      let dist3D = sqrt(dx * dx + dy * dy + pendulumHeight * pendulumHeight);
      let dist3 = dist3D * dist3D * dist3D;

      fx += magnetStrength * dx / dist3;
      fy += magnetStrength * dy / dist3;
    }

    // Restoring force (gravity pulling toward center)
    let distFromCenter = sqrt(x * x + y * y);
    if (distFromCenter > 0.001) {
      fx -= gravity * x / distFromCenter;
      fy -= gravity * y / distFromCenter;
    }

    // Friction
    fx -= friction * vx;
    fy -= friction * vy;

    // Update velocity and position
    vx += fx * dt;
    vy += fy * dt;
    x += vx * dt;
    y += vy * dt;

    // Check if settled near a magnet
    let speed = sqrt(vx * vx + vy * vy);
    if (speed < 0.01) {
      for (let i = 0; i < magnets.length; i++) {
        let dx = magnets[i].x - x;
        let dy = magnets[i].y - y;
        let dist = sqrt(dx * dx + dy * dy);
        if (dist < 0.3) {
          return { magnet: i, time: t };
        }
      }
    }

    // Escape check
    if (abs(x) > 10 || abs(y) > 10) {
      return { magnet: -1, time: t };
    }
  }

  // Didn't settle - find closest magnet
  let closest = 0;
  let closestDist = Infinity;
  for (let i = 0; i < magnets.length; i++) {
    let dx = magnets[i].x - x;
    let dy = magnets[i].y - y;
    let dist = sqrt(dx * dx + dy * dy);
    if (dist < closestDist) {
      closestDist = dist;
      closest = i;
    }
  }

  return { magnet: closest, time: maxTime };
}

function mousePressed() {
  // Zoom into clicked location
  let clickX = map(mouseX, 0, width, minX, maxX);
  let clickY = map(mouseY, 0, height, minY, maxY);

  let rangeX = (maxX - minX) * 0.5;
  let rangeY = (maxY - minY) * 0.5;

  minX = clickX - rangeX / 2;
  maxX = clickX + rangeX / 2;
  minY = clickY - rangeY / 2;
  maxY = clickY + rangeY / 2;

  computing = true;
  currentRow = 0;
  background(0);
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    minX = -2;
    maxX = 2;
    minY = -2;
    maxY = 2;
    computing = true;
    currentRow = 0;
    background(0);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  computing = true;
  currentRow = 0;
  background(0);
}
