// Popcorn / Pickover Function
// x' = x - h*sin(y + tan(3*y))
// y' = y - h*sin(x + tan(3*x))
// Creates web-like density patterns

let h = 0.05;
let density;
let maxDensity = 1;
let time = 0;

let minX = -3, maxX = 3;
let minY = -3, maxY = 3;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  pixelDensity(1);

  density = new Float32Array(width * height);
  generatePopcorn();
}

function generatePopcorn() {
  density.fill(0);
  maxDensity = 1;

  let iterations = 50;

  // Sample many starting points
  for (let startX = 0; startX < width; startX += 2) {
    for (let startY = 0; startY < height; startY += 2) {
      let x = map(startX, 0, width, minX, maxX);
      let y = map(startY, 0, height, minY, maxY);

      // Iterate the popcorn function
      for (let i = 0; i < iterations; i++) {
        // Popcorn iteration
        let xNew = x - h * sin(y + tan(3 * y));
        let yNew = y - h * sin(x + tan(3 * x));

        // Check for NaN from tan
        if (isNaN(xNew) || isNaN(yNew)) break;
        if (abs(xNew) > 100 || abs(yNew) > 100) break;

        x = xNew;
        y = yNew;

        // Map to screen and accumulate
        let px = floor(map(x, minX, maxX, 0, width));
        let py = floor(map(y, minY, maxY, 0, height));

        if (px >= 0 && px < width && py >= 0 && py < height) {
          let idx = px + py * width;
          density[idx]++;
          if (density[idx] > maxDensity) maxDensity = density[idx];
        }
      }
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
      let hue = (300 - val * 100 + time * 15) % 360;
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
  text(`Popcorn/Pickover | h=${h.toFixed(3)}`, 10, 25);
  text("Click to zoom | R to reset", 10, 45);
}

function mousePressed() {
  let clickX = map(mouseX, 0, width, minX, maxX);
  let clickY = map(mouseY, 0, height, minY, maxY);

  let rangeX = (maxX - minX) * 0.5;
  let rangeY = (maxY - minY) * 0.5;

  minX = clickX - rangeX / 2;
  maxX = clickX + rangeX / 2;
  minY = clickY - rangeY / 2;
  maxY = clickY + rangeY / 2;

  generatePopcorn();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    minX = -3;
    maxX = 3;
    minY = -3;
    maxY = 3;
    generatePopcorn();
  } else if (keyCode === UP_ARROW) {
    h = min(h + 0.01, 0.2);
    generatePopcorn();
  } else if (keyCode === DOWN_ARROW) {
    h = max(h - 0.01, 0.01);
    generatePopcorn();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  density = new Float32Array(width * height);
  generatePopcorn();
}
