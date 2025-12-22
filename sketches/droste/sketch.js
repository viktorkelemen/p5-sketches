// Droste Effect
// Infinite recursive zoom using complex logarithm
// exp(log(z) + i*theta) creates recursive spiral zoom

let time = 0;
let spiralAngle = 0.15;
let zoomSpeed = 0.3;
let branches = 1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  pixelDensity(1);
}

function draw() {
  loadPixels();

  let cx = width / 2;
  let cy = height / 2;
  let scale = min(width, height) / 4;

  // Droste parameters
  let logZoom = time * zoomSpeed;

  for (let px = 0; px < width; px++) {
    for (let py = 0; py < height; py++) {
      // Map to complex plane centered at origin
      let x = (px - cx) / scale;
      let y = (py - cy) / scale;

      // Convert to polar
      let r = sqrt(x * x + y * y);
      let theta = atan2(y, x);

      if (r < 0.001) {
        let idx = (px + py * width) * 4;
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 255;
        continue;
      }

      // Apply Droste transformation
      // z' = exp(log(z) + i*spiralAngle*log(|z|))
      // This creates the recursive spiral effect

      let logR = log(r);
      let newLogR = logR + logZoom;
      let newTheta = theta + spiralAngle * logR + time * 0.5;

      // Wrap logR to create repetition
      let period = TWO_PI / abs(spiralAngle);
      newLogR = ((newLogR % period) + period) % period;

      // Convert back
      let newR = exp(newLogR);
      let newX = newR * cos(newTheta * branches);
      let newY = newR * sin(newTheta * branches);

      // Create pattern based on transformed coordinates
      let pattern = createPattern(newX, newY, newR, newTheta);

      let idx = (px + py * width) * 4;
      pixels[idx] = red(pattern);
      pixels[idx + 1] = green(pattern);
      pixels[idx + 2] = blue(pattern);
      pixels[idx + 3] = 255;
    }
  }

  updatePixels();

  time += deltaTime / 1000;

  // Info
  fill(0, 0, 90);
  noStroke();
  textSize(14);
  text("Droste Effect | Click to change pattern", 10, 25);
  text("Arrow keys: adjust spiral", 10, 45);
}

function createPattern(x, y, r, theta) {
  // Create an interesting pattern that shows the recursion

  // Checkerboard-like pattern
  let gridSize = 0.5;
  let gx = floor(x / gridSize);
  let gy = floor(y / gridSize);

  // Fractional position within cell
  let fx = (x / gridSize) - gx;
  let fy = (y / gridSize) - gy;

  // Distance from cell center
  let dx = fx - 0.5;
  let dy = fy - 0.5;
  let distFromCenter = sqrt(dx * dx + dy * dy);

  // Base hue from angle
  let hue = (theta * 180 / PI + 180) % 360;

  // Brightness from pattern
  let bri;

  // Create nested squares/circles pattern
  let ringPattern = sin(r * 8) * 0.5 + 0.5;
  let checker = ((gx + gy) % 2 === 0) ? 1 : 0;

  // Combine patterns
  if (distFromCenter < 0.3) {
    // Inner circle
    bri = 80 + ringPattern * 20;
  } else {
    // Outer area with checker
    bri = 30 + checker * 40 + ringPattern * 20;
  }

  // Add radial gradient
  let radialFade = map(log(r + 1), 0, 3, 1, 0.3);
  bri *= radialFade;

  // Saturation varies with pattern
  let sat = 60 + ringPattern * 30;

  return color(hue, sat, constrain(bri, 0, 100));
}

function mousePressed() {
  branches = (branches % 3) + 1;
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    spiralAngle += 0.02;
  } else if (keyCode === DOWN_ARROW) {
    spiralAngle -= 0.02;
  } else if (keyCode === LEFT_ARROW) {
    zoomSpeed -= 0.1;
  } else if (keyCode === RIGHT_ARROW) {
    zoomSpeed += 0.1;
  } else if (key === 'r' || key === 'R') {
    spiralAngle = 0.15;
    zoomSpeed = 0.3;
    branches = 1;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
