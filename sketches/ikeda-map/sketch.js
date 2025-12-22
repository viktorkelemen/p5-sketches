// Ikeda Map
// From laser physics - models light in a ring cavity
// x' = 1 + u*(x*cos(t) - y*sin(t))
// y' = u*(x*sin(t) + y*cos(t))
// where t = 0.4 - 6/(1 + x^2 + y^2)

let u = 0.918; // Control parameter
let density;
let maxDensity = 1;
let time = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  pixelDensity(1);

  density = new Float32Array(width * height);
  generateAttractor();
}

function generateAttractor() {
  density.fill(0);
  maxDensity = 1;

  let iterations = 500000;

  // Start from multiple initial conditions
  for (let start = 0; start < 10; start++) {
    let x = random(-1, 1);
    let y = random(-1, 1);

    for (let i = 0; i < iterations / 10; i++) {
      // Ikeda map equations
      let t = 0.4 - 6 / (1 + x * x + y * y);
      let cosT = cos(t);
      let sinT = sin(t);

      let xNew = 1 + u * (x * cosT - y * sinT);
      let yNew = u * (x * sinT + y * cosT);

      x = xNew;
      y = yNew;

      if (i < 100) continue;

      // Map to screen (centered around attractor)
      let px = floor(map(x, -1, 3, 0, width));
      let py = floor(map(y, -2, 2, 0, height));

      if (px >= 0 && px < width && py >= 0 && py < height) {
        let idx = px + py * width;
        density[idx]++;
        if (density[idx] > maxDensity) maxDensity = density[idx];
      }
    }
  }
}

function draw() {
  background(220, 30, 5);

  loadPixels();

  let logMax = log(maxDensity + 1);

  for (let i = 0; i < width * height; i++) {
    if (density[i] > 0) {
      let val = log(density[i] + 1) / logMax;
      let hue = (280 - val * 80 + time * 15) % 360;
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
      pixels[idx + 1] = 8;
      pixels[idx + 2] = 12;
      pixels[idx + 3] = 255;
    }
  }

  updatePixels();

  time += deltaTime / 1000;

  fill(0, 0, 85);
  noStroke();
  textSize(14);
  text(`Ikeda Map | u = ${u.toFixed(3)}`, 10, 25);
  text("Click to change parameter", 10, 45);
}

function mousePressed() {
  u = random(0.8, 0.95);
  generateAttractor();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  density = new Float32Array(width * height);
  generateAttractor();
}
