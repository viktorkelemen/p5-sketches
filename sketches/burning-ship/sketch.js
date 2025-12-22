// Burning Ship Fractal
// Like Mandelbrot but uses |Re(z)| + i|Im(z)| before squaring

let minX = -2.5;
let maxX = 1.5;
let minY = -2;
let maxY = 2;
let maxIterations = 100;
let zoomFactor = 0.5;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  colorMode(HSB, 360, 100, 100);
  drawFractal();
}

function drawFractal() {
  loadPixels();

  for (let px = 0; px < width; px++) {
    for (let py = 0; py < height; py++) {
      // Map pixel to complex plane
      let x0 = map(px, 0, width, minX, maxX);
      let y0 = map(py, 0, height, minY, maxY);

      let x = 0;
      let y = 0;
      let iteration = 0;

      // Burning Ship iteration: z = (|Re(z)| + i|Im(z)|)^2 + c
      while (x * x + y * y <= 4 && iteration < maxIterations) {
        let xTemp = x * x - y * y + x0;
        y = abs(2 * x * y) + y0;
        x = abs(xTemp);
        iteration++;
      }

      let idx = (px + py * width) * 4;

      if (iteration === maxIterations) {
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
      } else {
        // Smooth coloring
        let smoothed = iteration + 1 - log(log(sqrt(x * x + y * y))) / log(2);
        let hue = (smoothed * 8) % 360;
        let sat = 85;
        let bri = map(iteration, 0, maxIterations, 100, 50);

        // Convert HSB to RGB
        let c = color(hue, sat, bri);
        pixels[idx] = red(c);
        pixels[idx + 1] = green(c);
        pixels[idx + 2] = blue(c);
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

  let rangeX = (maxX - minX) * zoomFactor;
  let rangeY = (maxY - minY) * zoomFactor;

  minX = clickX - rangeX / 2;
  maxX = clickX + rangeX / 2;
  minY = clickY - rangeY / 2;
  maxY = clickY + rangeY / 2;

  maxIterations += 20;

  drawFractal();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    // Reset view
    minX = -2.5;
    maxX = 1.5;
    minY = -2;
    maxY = 2;
    maxIterations = 100;
    drawFractal();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  drawFractal();
}
