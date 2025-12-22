// Weierstrass Function
// Continuous everywhere, differentiable nowhere
// W(x) = Σ a^n * cos(b^n * π * x)
// where 0 < a < 1, ab > 1 + 3π/2

let a = 0.5;
let b = 7;
let numTerms = 20;
let time = 0;
let zoom = 1;
let panX = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  background(220, 30, 10);

  let centerY = height / 2;

  // Draw grid
  stroke(220, 20, 20);
  strokeWeight(1);
  line(0, centerY, width, centerY);

  // Calculate and draw the Weierstrass function
  strokeWeight(1.5);
  noFill();

  // Draw individual harmonic components faintly
  for (let n = 0; n < min(numTerms, 8); n++) {
    let hue = (n * 45 + time * 20) % 360;
    stroke(hue, 60, 50, 30);
    beginShape();
    for (let px = 0; px < width; px++) {
      let x = map(px, 0, width, -2 / zoom + panX, 2 / zoom + panX);
      let y = pow(a, n) * cos(pow(b, n) * PI * x);
      let py = map(y, -2, 2, height * 0.9, height * 0.1);
      vertex(px, py);
    }
    endShape();
  }

  // Draw the full function
  stroke(40, 90, 100);
  strokeWeight(2);
  beginShape();

  let prevY = null;

  for (let px = 0; px < width; px++) {
    let x = map(px, 0, width, -2 / zoom + panX, 2 / zoom + panX);

    // Calculate Weierstrass function
    let y = 0;
    for (let n = 0; n < numTerms; n++) {
      y += pow(a, n) * cos(pow(b, n) * PI * x);
    }

    let py = map(y, -2, 2, height * 0.9, height * 0.1);

    // Handle extreme values
    if (py > -1000 && py < height + 1000) {
      vertex(px, py);
    }
  }
  endShape();

  // Animate time for subtle movement
  time += deltaTime / 1000;

  // Info display
  fill(0, 0, 90);
  noStroke();
  textSize(14);
  textAlign(LEFT, TOP);
  text(`Weierstrass Function: W(x) = Σ ${a}^n · cos(${b}^n · π · x)`, 10, 10);
  text(`Terms: ${numTerms} | Zoom: ${zoom.toFixed(1)}x`, 10, 30);
  text("Scroll to zoom | Drag to pan | Up/Down: change terms", 10, 50);

  // Show fractal dimension info
  let D = 2 + log(a) / log(b);
  text(`Hausdorff Dimension ≈ ${D.toFixed(3)}`, 10, 70);
}

function mouseWheel(event) {
  let zoomFactor = event.delta > 0 ? 0.9 : 1.1;
  zoom *= zoomFactor;
  zoom = constrain(zoom, 0.1, 1000);
  return false;
}

function mouseDragged() {
  let dx = (pmouseX - mouseX) / width * 4 / zoom;
  panX += dx;
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    numTerms = min(numTerms + 1, 50);
  } else if (keyCode === DOWN_ARROW) {
    numTerms = max(numTerms - 1, 1);
  } else if (key === 'r' || key === 'R') {
    zoom = 1;
    panX = 0;
    numTerms = 20;
  } else if (key === '1') {
    a = 0.5;
    b = 3;
  } else if (key === '2') {
    a = 0.5;
    b = 7;
  } else if (key === '3') {
    a = 0.7;
    b = 5;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
