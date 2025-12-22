// Newton Fractal
// Visualizes basins of attraction for Newton-Raphson root finding
// Using f(z) = z^3 - 1

let minX = -2;
let maxX = 2;
let minY = -2;
let maxY = 2;
let maxIterations = 50;
let tolerance = 0.0001;

// Roots of z^3 - 1
let roots = [];
let rootColors = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  colorMode(HSB, 360, 100, 100);

  // Calculate cube roots of unity
  for (let k = 0; k < 3; k++) {
    let angle = (2 * PI * k) / 3;
    roots.push({ re: cos(angle), im: sin(angle) });
    rootColors.push(color(k * 120, 80, 90));
  }

  drawFractal();
}

function drawFractal() {
  loadPixels();

  for (let px = 0; px < width; px++) {
    for (let py = 0; py < height; py++) {
      // Map pixel to complex plane
      let zRe = map(px, 0, width, minX, maxX);
      let zIm = map(py, 0, height, minY, maxY);

      let iteration = 0;
      let foundRoot = -1;

      // Newton's method: z_next = z - f(z)/f'(z)
      // For f(z) = z^3 - 1: z_next = z - (z^3 - 1)/(3z^2) = (2z^3 + 1)/(3z^2)
      while (iteration < maxIterations && foundRoot === -1) {
        // Calculate z^2
        let z2Re = zRe * zRe - zIm * zIm;
        let z2Im = 2 * zRe * zIm;

        // Calculate z^3
        let z3Re = z2Re * zRe - z2Im * zIm;
        let z3Im = z2Re * zIm + z2Im * zRe;

        // Calculate denominator: 3z^2
        let denomRe = 3 * z2Re;
        let denomIm = 3 * z2Im;
        let denomMag = denomRe * denomRe + denomIm * denomIm;

        if (denomMag < 0.0001) break;

        // Calculate numerator: 2z^3 + 1
        let numRe = 2 * z3Re + 1;
        let numIm = 2 * z3Im;

        // Complex division: (a + bi) / (c + di)
        let newZRe = (numRe * denomRe + numIm * denomIm) / denomMag;
        let newZIm = (numIm * denomRe - numRe * denomIm) / denomMag;

        zRe = newZRe;
        zIm = newZIm;

        // Check if we're close to a root
        for (let r = 0; r < roots.length; r++) {
          let distSq = (zRe - roots[r].re) ** 2 + (zIm - roots[r].im) ** 2;
          if (distSq < tolerance) {
            foundRoot = r;
            break;
          }
        }

        iteration++;
      }

      let idx = (px + py * width) * 4;

      if (foundRoot >= 0) {
        // Color based on which root and iteration count
        let hue = foundRoot * 120;
        let sat = 80;
        let bri = map(iteration, 0, maxIterations, 100, 30);

        let c = color(hue, sat, bri);
        pixels[idx] = red(c);
        pixels[idx + 1] = green(c);
        pixels[idx + 2] = blue(c);
      } else {
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
      }
      pixels[idx + 3] = 255;
    }
  }

  updatePixels();
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

  drawFractal();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    minX = -2;
    maxX = 2;
    minY = -2;
    maxY = 2;
    drawFractal();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  drawFractal();
}
