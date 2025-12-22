// Schwarz-Christoffel Maps
// Conformal maps from disk/half-plane to polygons
// Visualized by showing how circles and lines transform

let time = 0;
let currentShape = 0;
let shapeNames = ["Square", "Triangle", "Pentagon", "Star", "L-Shape"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  background(240, 20, 10);

  // Draw original domain on left
  push();
  translate(width / 4, height / 2);
  drawOriginalDomain();
  pop();

  // Draw mapped domain on right
  push();
  translate(3 * width / 4, height / 2);
  drawMappedDomain();
  pop();

  // Labels
  fill(0, 0, 90);
  noStroke();
  textSize(16);
  textAlign(CENTER);
  text("Unit Disk (z-plane)", width / 4, 40);
  text(`${shapeNames[currentShape]} (w-plane)`, 3 * width / 4, 40);

  textAlign(LEFT);
  textSize(14);
  text("Click to change shape", 10, height - 20);

  time += deltaTime / 1000;
}

function drawOriginalDomain() {
  let scale = min(width / 4, height / 2) * 0.7;

  // Draw unit circle
  noFill();
  stroke(60, 70, 80);
  strokeWeight(2);
  circle(0, 0, scale * 2);

  // Draw radial lines
  strokeWeight(1);
  for (let angle = 0; angle < TWO_PI; angle += PI / 12) {
    let hue = map(angle, 0, TWO_PI, 0, 360);
    stroke(hue, 60, 70, 60);
    let x = cos(angle) * scale;
    let y = sin(angle) * scale;
    line(0, 0, x, y);
  }

  // Draw concentric circles
  for (let r = 0.2; r < 1; r += 0.2) {
    stroke(180, 40, 60, 50);
    circle(0, 0, r * scale * 2);
  }

  // Animate a point
  let theta = time * 0.5;
  let r = 0.7 + 0.2 * sin(time * 2);
  let px = r * cos(theta) * scale;
  let py = r * sin(theta) * scale;

  fill(0, 80, 100);
  noStroke();
  circle(px, py, 10);
}

function drawMappedDomain() {
  let scale = min(width / 4, height / 2) * 0.6;

  // Draw many transformed curves
  strokeWeight(1);

  // Transform radial lines
  for (let angle = 0; angle < TWO_PI; angle += PI / 24) {
    let hue = map(angle, 0, TWO_PI, 0, 360);
    stroke(hue, 60, 70, 60);

    beginShape();
    noFill();
    for (let r = 0.01; r <= 0.99; r += 0.02) {
      let z = { re: r * cos(angle), im: r * sin(angle) };
      let w = schwarzChristoffel(z, currentShape);

      let x = w.re * scale;
      let y = -w.im * scale; // Flip for screen coordinates

      if (abs(x) < width && abs(y) < height) {
        vertex(x, y);
      }
    }
    endShape();
  }

  // Transform concentric circles
  for (let r = 0.1; r < 1; r += 0.1) {
    stroke(180, 40, 60, 50);
    beginShape();
    noFill();
    for (let angle = 0; angle <= TWO_PI + 0.1; angle += 0.05) {
      let z = { re: r * cos(angle), im: r * sin(angle) };
      let w = schwarzChristoffel(z, currentShape);

      let x = w.re * scale;
      let y = -w.im * scale;

      if (abs(x) < width && abs(y) < height) {
        vertex(x, y);
      }
    }
    endShape();
  }

  // Animate the same point in mapped domain
  let theta = time * 0.5;
  let r = 0.7 + 0.2 * sin(time * 2);
  let z = { re: r * cos(theta), im: r * sin(theta) };
  let w = schwarzChristoffel(z, currentShape);

  fill(0, 80, 100);
  noStroke();
  circle(w.re * scale, -w.im * scale, 10);
}

function schwarzChristoffel(z, shape) {
  // Simplified/approximate Schwarz-Christoffel transforms
  // These are approximations for visualization

  switch (shape) {
    case 0: // Square (using z + z^3/3 + z^5/5 approximation)
      return scSquare(z);
    case 1: // Triangle
      return scTriangle(z);
    case 2: // Pentagon
      return scPolygon(z, 5);
    case 3: // Star
      return scStar(z);
    case 4: // L-shape
      return scLShape(z);
    default:
      return z;
  }
}

function cMul(a, b) {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}

function cAdd(a, b) {
  return { re: a.re + b.re, im: a.im + b.im };
}

function cPow(z, n) {
  let r = sqrt(z.re * z.re + z.im * z.im);
  let theta = atan2(z.im, z.re);
  let rn = pow(r, n);
  return { re: rn * cos(n * theta), im: rn * sin(n * theta) };
}

function scSquare(z) {
  // Approximation using series
  let result = { re: 0, im: 0 };
  let zPow = z;

  for (let k = 0; k < 10; k++) {
    let n = 2 * k + 1;
    let coef = 1 / n;
    if (k % 2 === 1) coef *= -1;

    result = cAdd(result, { re: zPow.re * coef, im: zPow.im * coef });
    zPow = cMul(zPow, cMul(z, z));
  }

  return { re: result.re * 1.5, im: result.im * 1.5 };
}

function scTriangle(z) {
  // Approximate triangle mapping
  let z3 = cPow(z, 1.5);
  return { re: z3.re * 1.2, im: z3.im * 1.2 };
}

function scPolygon(z, n) {
  // General polygon approximation
  let zn = cPow(z, 2 / n);
  return { re: zn.re * 1.5, im: zn.im * 1.5 };
}

function scStar(z) {
  // Star shape (non-convex)
  let r = sqrt(z.re * z.re + z.im * z.im);
  let theta = atan2(z.im, z.re);

  // Modulate radius for star effect
  let starR = r * (1 + 0.5 * cos(5 * theta));

  let z2 = { re: starR * cos(theta), im: starR * sin(theta) };
  return { re: z2.re * 1.2, im: z2.im * 1.2 };
}

function scLShape(z) {
  // L-shape approximation
  let r = sqrt(z.re * z.re + z.im * z.im);
  let theta = atan2(z.im, z.re);

  // Bend the mapping for L shape
  let newTheta = theta;
  if (theta > 0 && theta < PI / 2) {
    newTheta = theta * 1.5;
  }

  return {
    re: r * cos(newTheta) * 1.3,
    im: r * sin(newTheta) * 1.3
  };
}

function mousePressed() {
  currentShape = (currentShape + 1) % shapeNames.length;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
