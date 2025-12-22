// Hopalong Attractor (Martin Attractor)
// x' = y - sign(x) * sqrt(|b*x - c|)
// y' = a - x

let a, b, c;
let density;
let maxDensity = 1;
let time = 0;

// Beautiful presets
let presets = [
  { a: 0.4, b: 1.0, c: 0.0 },
  { a: 7.16878, b: 8.43659, c: 2.55919 },
  { a: 7.7867, b: 0.132, c: 9.0423 },
  { a: 1.1, b: 0.5, c: 1.0 },
  { a: -11, b: 0.05, c: 0.5 }
];
let currentPreset = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  pixelDensity(1);

  density = new Float32Array(width * height);
  loadPreset(0);
  generateAttractor();
}

function loadPreset(idx) {
  let p = presets[idx % presets.length];
  a = p.a;
  b = p.b;
  c = p.c;
}

function generateAttractor() {
  density.fill(0);
  maxDensity = 1;

  let iterations = 1000000;
  let x = 0;
  let y = 0;

  // First pass to find bounds
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (let i = 0; i < 10000; i++) {
    let xNew = y - (x < 0 ? -1 : 1) * sqrt(abs(b * x - c));
    let yNew = a - x;

    x = xNew;
    y = yNew;

    if (i > 100) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  // Add padding
  let padX = (maxX - minX) * 0.1;
  let padY = (maxY - minY) * 0.1;
  minX -= padX;
  maxX += padX;
  minY -= padY;
  maxY += padY;

  // Second pass to accumulate
  x = 0;
  y = 0;

  for (let i = 0; i < iterations; i++) {
    let xNew = y - (x < 0 ? -1 : 1) * sqrt(abs(b * x - c));
    let yNew = a - x;

    x = xNew;
    y = yNew;

    if (i < 100) continue;

    let px = floor(map(x, minX, maxX, 0, width));
    let py = floor(map(y, minY, maxY, 0, height));

    if (px >= 0 && px < width && py >= 0 && py < height) {
      let idx = px + py * width;
      density[idx]++;
      if (density[idx] > maxDensity) maxDensity = density[idx];
    }
  }
}

function draw() {
  background(280, 20, 5);

  loadPixels();

  let logMax = log(maxDensity + 1);

  for (let i = 0; i < width * height; i++) {
    if (density[i] > 0) {
      let val = log(density[i] + 1) / logMax;
      let hue = (320 - val * 100 + time * 8) % 360;
      let sat = 60 + val * 40;
      let bri = pow(val, 0.5) * 100;

      let c = color(hue, sat, bri);
      let idx = i * 4;
      pixels[idx] = red(c);
      pixels[idx + 1] = green(c);
      pixels[idx + 2] = blue(c);
      pixels[idx + 3] = 255;
    } else {
      let idx = i * 4;
      pixels[idx] = 12;
      pixels[idx + 1] = 8;
      pixels[idx + 2] = 15;
      pixels[idx + 3] = 255;
    }
  }

  updatePixels();

  time += deltaTime / 1000;

  fill(0, 0, 85);
  noStroke();
  textSize(14);
  text(`Hopalong | a=${a.toFixed(2)} b=${b.toFixed(2)} c=${c.toFixed(2)}`, 10, 25);
  text("Click: next preset | R: random", 10, 45);
}

function mousePressed() {
  currentPreset++;
  loadPreset(currentPreset);
  generateAttractor();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    a = random(-12, 12);
    b = random(-1, 10);
    c = random(-1, 10);
    generateAttractor();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  density = new Float32Array(width * height);
  generateAttractor();
}
