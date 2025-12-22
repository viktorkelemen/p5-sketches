// Apollonian Gasket
// Recursive circle packing using Descartes' Circle Theorem

let circles = [];
let queue = [];
let minRadius = 2;
let time = 0;

class Circle {
  constructor(x, y, r, curvature) {
    this.x = x;
    this.y = y;
    this.r = abs(r);
    this.curvature = curvature; // k = 1/r (can be negative for outer circle)
    this.hue = random(360);
  }

  draw() {
    let alpha = map(this.r, minRadius, 200, 80, 40);
    let brightness = 70 + sin(time * 2 + this.hue * 0.1) * 20;
    stroke(this.hue, 70, brightness, alpha);
    strokeWeight(map(this.r, minRadius, 200, 0.5, 2));
    noFill();
    circle(this.x, this.y, this.r * 2);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  initGasket();
}

function initGasket() {
  circles = [];
  queue = [];

  let cx = width / 2;
  let cy = height / 2;
  let r = min(width, height) * 0.45;

  // Outer circle (negative curvature)
  let c0 = new Circle(cx, cy, r, -1 / r);
  circles.push(c0);

  // Three initial tangent circles inside
  // Using Soddy circles configuration
  let r1 = r / 2;
  let r2 = r / 3;
  let r3 = r / 3;

  // First circle at top
  let c1 = new Circle(cx, cy - r + r1, r1, 1 / r1);
  circles.push(c1);

  // Two circles at bottom using tangency constraints
  let d = r - r2;
  let angle1 = PI / 2 + PI / 3;
  let c2 = new Circle(
    cx + cos(angle1) * (r - r2),
    cy + sin(angle1) * (r - r2) * 0.5 + r * 0.2,
    r2,
    1 / r2
  );
  circles.push(c2);

  let angle2 = PI / 2 - PI / 3;
  let c3 = new Circle(
    cx + cos(angle2) * (r - r3),
    cy + sin(angle2) * (r - r3) * 0.5 + r * 0.2,
    r3,
    1 / r3
  );
  circles.push(c3);

  // Add initial triplets to queue
  queue.push([c0, c1, c2]);
  queue.push([c0, c1, c3]);
  queue.push([c0, c2, c3]);
  queue.push([c1, c2, c3]);

  // Process queue
  let iterations = 0;
  let maxIterations = 5000;
  let maxQueueSize = 10000; // Prevent unbounded queue growth

  while (queue.length > 0 && iterations < maxIterations) {
    let triplet = queue.shift();
    let newCircles = findNewCircles(triplet[0], triplet[1], triplet[2]);

    for (let nc of newCircles) {
      if (nc && nc.r > minRadius && nc.r < min(width, height) / 2) {
        if (!isDuplicate(nc)) {
          circles.push(nc);
          // Only add to queue if we haven't exceeded the queue size limit
          if (queue.length < maxQueueSize) {
            queue.push([triplet[0], triplet[1], nc]);
            queue.push([triplet[0], triplet[2], nc]);
            queue.push([triplet[1], triplet[2], nc]);
          }
        }
      }
    }
    iterations++;
  }
}

function findNewCircles(c1, c2, c3) {
  // Descartes' Circle Theorem
  // k4 = k1 + k2 + k3 +/- 2*sqrt(k1*k2 + k2*k3 + k3*k1)
  let k1 = c1.curvature;
  let k2 = c2.curvature;
  let k3 = c3.curvature;

  let sum = k1 + k2 + k3;
  let product = k1 * k2 + k2 * k3 + k3 * k1;

  if (product < 0) return [];

  let sqrtPart = 2 * sqrt(product);
  let k4a = sum + sqrtPart;
  let k4b = sum - sqrtPart;

  let results = [];

  for (let k4 of [k4a, k4b]) {
    if (abs(k4) > 0.0001) {
      let r4 = abs(1 / k4);

      // Find center using complex Descartes theorem
      // This is simplified - using geometric approach instead
      let center = findCenter(c1, c2, c3, r4, k4 > 0);
      if (center) {
        results.push(new Circle(center.x, center.y, r4, k4));
      }
    }
  }

  return results;
}

function findCenter(c1, c2, c3, r, internal) {
  // Find center of circle tangent to three given circles
  // Using numerical approach
  let bestX = 0, bestY = 0;
  let bestError = Infinity;

  // Start near centroid of the three circles
  let startX = (c1.x + c2.x + c3.x) / 3;
  let startY = (c1.y + c2.y + c3.y) / 3;

  // Gradient descent to find tangent circle center
  let x = startX;
  let y = startY;
  let step = r / 2;

  for (let iter = 0; iter < 100; iter++) {
    let d1 = dist(x, y, c1.x, c1.y);
    let d2 = dist(x, y, c2.x, c2.y);
    let d3 = dist(x, y, c3.x, c3.y);

    // Target distances (external or internal tangency)
    let t1 = c1.curvature < 0 ? c1.r - r : c1.r + r;
    let t2 = c2.curvature < 0 ? c2.r - r : c2.r + r;
    let t3 = c3.curvature < 0 ? c3.r - r : c3.r + r;

    let error = abs(d1 - t1) + abs(d2 - t2) + abs(d3 - t3);

    if (error < bestError) {
      bestError = error;
      bestX = x;
      bestY = y;
    }

    // Gradient step
    let gx = 0, gy = 0;
    if (d1 > 0.001) {
      gx += (d1 - t1) * (x - c1.x) / d1;
      gy += (d1 - t1) * (y - c1.y) / d1;
    }
    if (d2 > 0.001) {
      gx += (d2 - t2) * (x - c2.x) / d2;
      gy += (d2 - t2) * (y - c2.y) / d2;
    }
    if (d3 > 0.001) {
      gx += (d3 - t3) * (x - c3.x) / d3;
      gy += (d3 - t3) * (y - c3.y) / d3;
    }

    x -= gx * step;
    y -= gy * step;
    step *= 0.95;
  }

  if (bestError < r * 0.5) {
    return { x: bestX, y: bestY };
  }
  return null;
}

function isDuplicate(nc) {
  for (let c of circles) {
    if (dist(nc.x, nc.y, c.x, c.y) < 1 && abs(nc.r - c.r) < 1) {
      return true;
    }
  }
  return false;
}

function draw() {
  background(0, 0, 5);

  for (let c of circles) {
    c.draw();
  }

  time += deltaTime / 1000;

  // Info
  fill(0, 0, 80);
  noStroke();
  textSize(14);
  text("Circles: " + circles.length + " | Click to regenerate", 10, 25);
}

function mousePressed() {
  initGasket();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGasket();
}
