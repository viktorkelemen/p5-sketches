// Clifford Attractor
// x' = sin(a*y) + c*cos(a*x)
// y' = sin(b*x) + d*cos(b*y)

let a, b, c, d;
let x, y;
let points = [];
let density;
let maxDensity = 1;
let time = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  pixelDensity(1);

  density = new Float32Array(width * height);

  randomizeParams();
  generateAttractor();
}

function randomizeParams() {
  // Clifford attractor parameters
  a = random(-3, 3);
  b = random(-3, 3);
  c = random(-3, 3);
  d = random(-3, 3);

  // Reset
  density.fill(0);
  maxDensity = 1;
  x = random(-0.1, 0.1);
  y = random(-0.1, 0.1);
}

function generateAttractor() {
  let iterations = 500000;

  for (let i = 0; i < iterations; i++) {
    // Clifford attractor equations
    let xNew = sin(a * y) + c * cos(a * x);
    let yNew = sin(b * x) + d * cos(b * y);

    x = xNew;
    y = yNew;

    // Skip first iterations for warmup
    if (i < 100) continue;

    // Map to screen coordinates
    let px = floor(map(x, -3, 3, 0, width));
    let py = floor(map(y, -3, 3, 0, height));

    if (px >= 0 && px < width && py >= 0 && py < height) {
      let idx = px + py * width;
      density[idx]++;
      if (density[idx] > maxDensity) maxDensity = density[idx];
    }
  }
}

function draw() {
  background(240, 30, 5);

  loadPixels();

  let logMax = log(maxDensity + 1);

  for (let i = 0; i < width * height; i++) {
    if (density[i] > 0) {
      let val = log(density[i] + 1) / logMax;
      let hue = (val * 200 + time * 20) % 360;
      let sat = 70 + val * 30;
      let bri = val * 100;

      let c = color(hue, sat, bri);
      let idx = i * 4;
      pixels[idx] = red(c);
      pixels[idx + 1] = green(c);
      pixels[idx + 2] = blue(c);
      pixels[idx + 3] = 255;
    } else {
      let idx = i * 4;
      pixels[idx] = 5;
      pixels[idx + 1] = 5;
      pixels[idx + 2] = 10;
      pixels[idx + 3] = 255;
    }
  }

  updatePixels();

  time += deltaTime / 1000;

  // Display parameters
  fill(0, 0, 80);
  noStroke();
  textSize(14);
  textAlign(LEFT, TOP);
  text(`a=${a.toFixed(3)} b=${b.toFixed(3)} c=${c.toFixed(3)} d=${d.toFixed(3)}`, 10, 10);
  text("Click to randomize", 10, 30);
}

function mousePressed() {
  randomizeParams();
  generateAttractor();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  density = new Float32Array(width * height);
  density.fill(0);
  maxDensity = 1;
  generateAttractor();
}
