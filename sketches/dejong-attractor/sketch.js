// De Jong Attractor
// x' = sin(a*y) - cos(b*x)
// y' = sin(c*x) - cos(d*y)

let a, b, c, d;
let x, y;
let density;
let maxDensity = 1;
let time = 0;
let hueOffset = 0;

// Some beautiful presets
let presets = [
  { a: -2.24, b: 0.43, c: -0.65, d: -2.43 },
  { a: 2.01, b: -2.53, c: 1.61, d: -0.33 },
  { a: -2.7, b: -0.09, c: -0.86, d: -2.2 },
  { a: -0.827, b: -1.637, c: 1.659, d: -0.943 },
  { a: 1.4, b: -2.3, c: 2.4, d: -2.1 }
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
  d = p.d;

  density.fill(0);
  maxDensity = 1;
  x = random(-0.1, 0.1);
  y = random(-0.1, 0.1);
  hueOffset = random(360);
}

function randomizeParams() {
  a = random(-3, 3);
  b = random(-3, 3);
  c = random(-3, 3);
  d = random(-3, 3);

  density.fill(0);
  maxDensity = 1;
  x = random(-0.1, 0.1);
  y = random(-0.1, 0.1);
  hueOffset = random(360);
}

function generateAttractor() {
  let iterations = 500000;

  for (let i = 0; i < iterations; i++) {
    // De Jong attractor equations
    let xNew = sin(a * y) - cos(b * x);
    let yNew = sin(c * x) - cos(d * y);

    x = xNew;
    y = yNew;

    if (i < 100) continue;

    let px = floor(map(x, -2.5, 2.5, 0, width));
    let py = floor(map(y, -2.5, 2.5, 0, height));

    if (px >= 0 && px < width && py >= 0 && py < height) {
      let idx = px + py * width;
      density[idx]++;
      if (density[idx] > maxDensity) maxDensity = density[idx];
    }
  }
}

function draw() {
  background(260, 30, 5);

  loadPixels();

  let logMax = log(maxDensity + 1);

  for (let i = 0; i < width * height; i++) {
    if (density[i] > 0) {
      let val = log(density[i] + 1) / logMax;
      let hue = (val * 120 + hueOffset + time * 10) % 360;
      let sat = 60 + val * 40;
      let bri = pow(val, 0.7) * 100;

      let c = color(hue, sat, bri);
      let idx = i * 4;
      pixels[idx] = red(c);
      pixels[idx + 1] = green(c);
      pixels[idx + 2] = blue(c);
      pixels[idx + 3] = 255;
    } else {
      let idx = i * 4;
      pixels[idx] = 10;
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
  text(`a=${a.toFixed(2)} b=${b.toFixed(2)} c=${c.toFixed(2)} d=${d.toFixed(2)}`, 10, 25);
  text("Click: next preset | R: random", 10, 45);
}

function mousePressed() {
  currentPreset++;
  loadPreset(currentPreset);
  generateAttractor();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    randomizeParams();
    generateAttractor();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  density = new Float32Array(width * height);
  density.fill(0);
  maxDensity = 1;
  generateAttractor();
}
