// Mira Fractal
// Quadratic recurrence: x' = y + F(x), y' = -x + F(x')
// where F(x) = a*x + 2*(1-a)*x^2 / (1 + x^2)

let a = 0.31;
let b = 0.9998;
let density;
let maxDensity = 1;
let time = 0;

// Presets with interesting patterns
let presets = [
  { a: 0.31, b: 0.9998 },
  { a: -0.48, b: 0.93 },
  { a: 0.7, b: 0.9998 },
  { a: -0.8, b: 0.99 },
  { a: 0.4, b: 0.9992 }
];
let currentPreset = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  pixelDensity(1);

  density = new Float32Array(width * height);
  generateMira();
}

function F(x) {
  return a * x + 2 * (1 - a) * x * x / (1 + x * x);
}

function generateMira() {
  density.fill(0);
  maxDensity = 1;

  let iterations = 500000;
  let x = 12;
  let y = 0;

  // First pass to find bounds
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (let i = 0; i < 10000; i++) {
    let xNew = b * y + F(x);
    let yNew = -x + F(xNew);

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

  // Keep aspect ratio
  let rangeX = maxX - minX;
  let rangeY = maxY - minY;
  let aspect = width / height;

  if (rangeX / rangeY > aspect) {
    let centerY = (minY + maxY) / 2;
    let newRangeY = rangeX / aspect;
    minY = centerY - newRangeY / 2;
    maxY = centerY + newRangeY / 2;
  } else {
    let centerX = (minX + maxX) / 2;
    let newRangeX = rangeY * aspect;
    minX = centerX - newRangeX / 2;
    maxX = centerX + newRangeX / 2;
  }

  // Second pass to accumulate
  x = 12;
  y = 0;

  for (let i = 0; i < iterations; i++) {
    let xNew = b * y + F(x);
    let yNew = -x + F(xNew);

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
  background(200, 20, 5);

  loadPixels();

  let logMax = log(maxDensity + 1);

  for (let i = 0; i < width * height; i++) {
    if (density[i] > 0) {
      let val = log(density[i] + 1) / logMax;
      let hue = (180 + val * 60 + time * 10) % 360;
      let sat = 50 + val * 50;
      let bri = pow(val, 0.6) * 100;

      let c = color(hue, sat, bri);
      let idx = i * 4;
      pixels[idx] = red(c);
      pixels[idx + 1] = green(c);
      pixels[idx + 2] = blue(c);
      pixels[idx + 3] = 255;
    } else {
      let idx = i * 4;
      pixels[idx] = 8;
      pixels[idx + 1] = 10;
      pixels[idx + 2] = 12;
      pixels[idx + 3] = 255;
    }
  }

  updatePixels();

  time += deltaTime / 1000;

  fill(0, 0, 85);
  noStroke();
  textSize(14);
  text(`Mira Fractal | a=${a.toFixed(3)} b=${b.toFixed(4)}`, 10, 25);
  text("Click: next preset | R: random", 10, 45);
}

function mousePressed() {
  currentPreset++;
  let p = presets[currentPreset % presets.length];
  a = p.a;
  b = p.b;
  generateMira();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    a = random(-1, 1);
    b = random(0.99, 0.9999);
    generateMira();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  density = new Float32Array(width * height);
  generateMira();
}
