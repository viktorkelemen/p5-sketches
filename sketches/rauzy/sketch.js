// Rauzy Fractal
// From the Tribonacci substitution: 1→12, 2→13, 3→1
// Projects the stepped surface onto a plane perpendicular to the Tribonacci eigenvector

let points = [];
let iterations = 18;
let time = 0;

// Tribonacci constant (real root of x^3 - x^2 - x - 1 = 0)
const tribonacci = 1.839286755214161;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  generateRauzy();
}

function generateRauzy() {
  points = [];

  // Start with initial sequence
  let sequence = [1];

  // Apply substitution rules: 1→12, 2→13, 3→1
  for (let i = 0; i < iterations; i++) {
    let newSeq = [];
    for (let s of sequence) {
      if (s === 1) {
        newSeq.push(1, 2);
      } else if (s === 2) {
        newSeq.push(1, 3);
      } else {
        newSeq.push(1);
      }
    }
    sequence = newSeq;

    // Limit size for performance
    if (sequence.length > 200000) break;
  }

  // Generate points by walking through the sequence
  // Using the eigenvectors of the substitution matrix
  // Project onto the contracting eigenplane

  // Eigenvector for projection (perpendicular to expanding direction)
  let alpha = 2 * PI / 3;
  let v1 = { x: 1, y: 0 };
  let v2 = { x: cos(alpha), y: sin(alpha) };
  let v3 = { x: cos(2 * alpha), y: sin(2 * alpha) };

  // Scale factors based on Tribonacci
  let s = 1 / tribonacci;

  let x = 0, y = 0;
  let count1 = 0, count2 = 0, count3 = 0;

  for (let i = 0; i < sequence.length; i++) {
    let s_val = sequence[i];

    // Project position onto 2D
    let projX = count1 * v1.x + count2 * v2.x + count3 * v3.x;
    let projY = count1 * v1.y + count2 * v2.y + count3 * v3.y;

    points.push({
      x: projX,
      y: projY,
      type: s_val,
      index: i
    });

    // Update counts
    if (s_val === 1) count1++;
    else if (s_val === 2) count2++;
    else count3++;
  }

  // Find bounds for scaling
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (let p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  // Normalize points
  let rangeX = maxX - minX;
  let rangeY = maxY - minY;
  let scale = min(width, height) * 0.8 / max(rangeX, rangeY);

  for (let p of points) {
    p.x = (p.x - (minX + maxX) / 2) * scale;
    p.y = (p.y - (minY + maxY) / 2) * scale;
  }
}

function draw() {
  background(240, 20, 8);

  translate(width / 2, height / 2);

  noStroke();

  // Draw points colored by type
  for (let p of points) {
    let hue, sat, bri;

    if (p.type === 1) {
      hue = 0;    // Red
      sat = 70;
      bri = 80;
    } else if (p.type === 2) {
      hue = 120;  // Green
      sat = 70;
      bri = 70;
    } else {
      hue = 240;  // Blue
      sat = 70;
      bri = 80;
    }

    // Animate with subtle pulsing
    bri += sin(time * 2 + p.index * 0.001) * 10;

    fill(hue, sat, bri, 80);
    circle(p.x, p.y, 2);
  }

  time += deltaTime / 1000;

  // Info
  resetMatrix();
  fill(0, 0, 85);
  noStroke();
  textSize(14);
  text(`Rauzy Fractal | Iterations: ${iterations} | Points: ${points.length}`, 10, 25);
  text("Click to regenerate with more iterations", 10, 45);
}

function mousePressed() {
  iterations = min(iterations + 1, 22);
  generateRauzy();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    iterations = 15;
    generateRauzy();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateRauzy();
}
