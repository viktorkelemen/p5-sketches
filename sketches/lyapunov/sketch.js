// Lyapunov Fractal
// Visualizes stability in logistic maps with varying parameters
// Sequence determines when to use parameter A vs B

let minA = 2;
let maxA = 4;
let minB = 2;
let maxB = 4;
let sequence = "AABABAB"; // Try: "AB", "AABB", "BBBBBBAAAAAA"
let iterations = 100;
let warmup = 50;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  colorMode(HSB, 360, 100, 100);
  drawFractal();
}

function drawFractal() {
  loadPixels();

  let seqLen = sequence.length;

  for (let px = 0; px < width; px++) {
    for (let py = 0; py < height; py++) {
      let a = map(px, 0, width, minA, maxA);
      let b = map(py, 0, height, minB, maxB);

      let x = 0.5; // Initial condition
      let lyapunov = 0;
      let count = 0;

      // Warmup iterations
      for (let i = 0; i < warmup; i++) {
        let r = sequence[i % seqLen] === 'A' ? a : b;
        x = r * x * (1 - x);
        if (x < 0.0001 || x > 0.9999) x = 0.5;
      }

      // Calculate Lyapunov exponent
      for (let i = 0; i < iterations; i++) {
        let r = sequence[(warmup + i) % seqLen] === 'A' ? a : b;
        x = r * x * (1 - x);

        if (x < 0.0001 || x > 0.9999) x = 0.5;

        let deriv = abs(r * (1 - 2 * x));
        // Only add to Lyapunov sum if derivative is positive (avoid log(0) = -Infinity)
        if (deriv > 1e-10) {
          lyapunov += log(deriv);
          count++;
        }
      }

      lyapunov = count > 0 ? lyapunov / count : 0;

      let idx = (px + py * width) * 4;

      if (lyapunov < 0) {
        // Stable - blue/cyan colors
        let intensity = map(lyapunov, -3, 0, 100, 20);
        let hue = map(lyapunov, -3, 0, 180, 240);
        let c = color(hue, 80, constrain(intensity, 20, 100));
        pixels[idx] = red(c);
        pixels[idx + 1] = green(c);
        pixels[idx + 2] = blue(c);
      } else {
        // Chaotic - yellow/red colors
        let intensity = map(lyapunov, 0, 2, 50, 100);
        let hue = map(lyapunov, 0, 2, 60, 0);
        let c = color(hue, 90, constrain(intensity, 50, 100));
        pixels[idx] = red(c);
        pixels[idx + 1] = green(c);
        pixels[idx + 2] = blue(c);
      }
      pixels[idx + 3] = 255;
    }
  }

  updatePixels();

  // Display current sequence
  fill(255);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  text("Sequence: " + sequence + " (Press 1-5 for presets, R to reset)", 10, 10);
}

function keyPressed() {
  let changed = false;

  if (key === '1') {
    sequence = "AB";
    changed = true;
  } else if (key === '2') {
    sequence = "AABB";
    changed = true;
  } else if (key === '3') {
    sequence = "AAABBB";
    changed = true;
  } else if (key === '4') {
    sequence = "AABABAB";
    changed = true;
  } else if (key === '5') {
    sequence = "BBBBBBAAAAAA";
    changed = true;
  } else if (key === 'r' || key === 'R') {
    minA = 2;
    maxA = 4;
    minB = 2;
    maxB = 4;
    changed = true;
  }

  if (changed) {
    drawFractal();
  }
}

function mousePressed() {
  let clickA = map(mouseX, 0, width, minA, maxA);
  let clickB = map(mouseY, 0, height, minB, maxB);

  let rangeA = (maxA - minA) * 0.5;
  let rangeB = (maxB - minB) * 0.5;

  minA = clickA - rangeA / 2;
  maxA = clickA + rangeA / 2;
  minB = clickB - rangeB / 2;
  maxB = clickB + rangeB / 2;

  drawFractal();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  drawFractal();
}
