// Sigil - Witchcraft Visualization
// A mystical pentagram with candles, runes, and magical energy

let particles = [];
let runes = [];
let candles = [];
let time = 0;
let pentagramRotation = 0;

// Mystical rune-like symbols
const runeShapes = [
  [[0, -1], [0, 1]], // vertical line
  [[-0.5, -1], [0, 0], [0.5, -1]], // arrow up
  [[-0.5, 1], [0, 0], [0.5, 1]], // arrow down
  [[-0.5, -0.5], [0.5, 0.5]], // diagonal
  [[0, -1], [-0.5, 0], [0, 1], [0.5, 0], [0, -1]], // diamond
  [[-0.5, -1], [-0.5, 1], [0.5, 0]], // triangle left
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

  // Create floating magical particles
  for (let i = 0; i < 150; i++) {
    particles.push(createParticle());
  }

  // Create runes around the circle
  for (let i = 0; i < 8; i++) {
    let angle = (TWO_PI / 8) * i - HALF_PI;
    runes.push({
      angle: angle,
      radius: 280,
      shape: floor(random(runeShapes.length)),
      rotation: random(TWO_PI),
      rotSpeed: random(-0.01, 0.01),
      pulse: random(TWO_PI)
    });
  }

  // Create candles at pentagram points
  for (let i = 0; i < 5; i++) {
    let angle = (TWO_PI / 5) * i - HALF_PI;
    candles.push({
      angle: angle,
      radius: 200,
      flicker: random(TWO_PI),
      height: random(30, 50)
    });
  }
}

function createParticle() {
  let angle = random(TWO_PI);
  let radius = random(50, 350);
  return {
    x: cos(angle) * radius,
    y: sin(angle) * radius,
    vx: random(-0.5, 0.5),
    vy: random(-1, -0.3),
    size: random(2, 6),
    life: random(100, 255),
    hue: random(260, 320), // Purple to magenta range
    decay: random(0.5, 1.5)
  };
}

function draw() {
  // Dark mystical background with slight purple tint
  background(270, 30, 8);

  // Draw ambient glow in center
  drawAmbientGlow();

  translate(width / 2, height / 2);

  // Update and draw particles
  updateParticles();

  // Draw outer protective circle
  drawOuterCircle();

  // Draw runes
  drawRunes();

  // Draw inner circles
  drawInnerCircles();

  // Draw pentagram
  push();
  rotate(pentagramRotation);
  drawPentagram();
  pop();

  // Draw candles at pentagram points
  drawCandles();

  // Draw central eye/sigil
  drawCentralSigil();

  // Draw energy lines connecting elements
  drawEnergyLines();

  // Clamp deltaTime to prevent animation jumps after tab switching
  let dt = min(deltaTime / 1000, 0.1);
  time += dt;
  pentagramRotation += 0.002 * dt * 60;
}

function drawAmbientGlow() {
  push();
  translate(width / 2, height / 2);
  noStroke();
  for (let i = 30; i > 0; i--) {
    let alpha = map(i, 0, 30, 15, 0);
    let pulse = sin(time * 2) * 5;
    fill(280, 50, 30, alpha);
    circle(0, 0, 400 + i * 15 + pulse);
  }
  pop();
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];

    // Spiral motion towards center occasionally
    let toCenterX = -p.x * 0.001;
    let toCenterY = -p.y * 0.001;

    p.x += p.vx + toCenterX;
    p.y += p.vy + toCenterY;
    p.life -= p.decay;

    // Draw particle with glow
    noStroke();
    for (let g = 3; g > 0; g--) {
      fill(p.hue, 70, 80, p.life * 0.1 / g);
      circle(p.x, p.y, p.size + g * 4);
    }
    fill(p.hue, 50, 100, p.life * 0.4);
    circle(p.x, p.y, p.size);

    // Respawn dead particles
    if (p.life <= 0) {
      particles[i] = createParticle();
    }
  }
}

function drawOuterCircle() {
  // Multiple layered circles
  noFill();
  for (let i = 0; i < 3; i++) {
    let radius = 300 - i * 15;
    let alpha = 60 - i * 15;
    let weight = 3 - i;

    stroke(280, 60, 70, alpha + sin(time * 3 + i) * 10);
    strokeWeight(weight);
    circle(0, 0, radius * 2);
  }

  // Decorative dots around outer circle
  let dotCount = 36;
  for (let i = 0; i < dotCount; i++) {
    let angle = (TWO_PI / dotCount) * i + time * 0.1;
    let x = cos(angle) * 310;
    let y = sin(angle) * 310;
    let pulse = sin(time * 4 + i * 0.5) * 0.5 + 0.5;

    fill(280, 50, 70 + pulse * 30, 50 + pulse * 30);
    noStroke();
    circle(x, y, 4 + pulse * 2);
  }
}

function drawRunes() {
  for (let rune of runes) {
    rune.rotation += rune.rotSpeed;
    rune.pulse += 0.05;

    let x = cos(rune.angle) * rune.radius;
    let y = sin(rune.angle) * rune.radius;

    push();
    translate(x, y);
    rotate(rune.rotation);

    let glow = sin(rune.pulse) * 0.3 + 0.7;

    // Rune glow
    noStroke();
    fill(45, 70, 60, 20 * glow);
    circle(0, 0, 50);

    // Draw rune shape
    stroke(45, 80, 90, 70 * glow);
    strokeWeight(2);
    noFill();

    let shape = runeShapes[rune.shape];
    beginShape();
    for (let point of shape) {
      vertex(point[0] * 15, point[1] * 15);
    }
    endShape();

    pop();
  }
}

function drawInnerCircles() {
  noFill();

  // Inner circle with arcane pattern
  stroke(300, 50, 60, 40);
  strokeWeight(2);
  circle(0, 0, 380);

  // Rotating arc segments
  for (let i = 0; i < 6; i++) {
    let startAngle = (TWO_PI / 6) * i + time * 0.5;
    stroke(280, 60, 70, 30);
    arc(0, 0, 360, 360, startAngle, startAngle + PI / 8);
  }
}

function drawPentagram() {
  let radius = 180;
  let points = [];

  // Calculate pentagram points
  for (let i = 0; i < 5; i++) {
    let angle = (TWO_PI / 5) * i - HALF_PI;
    points.push({
      x: cos(angle) * radius,
      y: sin(angle) * radius
    });
  }

  // Draw pentagram with glow effect
  for (let g = 5; g > 0; g--) {
    stroke(280, 70, 80, 15);
    strokeWeight(g * 3);
    drawPentagramLines(points);
  }

  // Main pentagram lines
  stroke(300, 60, 90, 80);
  strokeWeight(2);
  drawPentagramLines(points);

  // Draw points as glowing orbs
  for (let i = 0; i < 5; i++) {
    let pulse = sin(time * 3 + i) * 0.3 + 0.7;

    // Glow
    noStroke();
    for (let g = 5; g > 0; g--) {
      fill(300, 60, 70, 10 * pulse);
      circle(points[i].x, points[i].y, 20 + g * 6);
    }

    fill(300, 50, 100, 80);
    circle(points[i].x, points[i].y, 10);
  }
}

function drawPentagramLines(points) {
  // Connect every other point to form the star
  noFill();
  beginShape();
  for (let i = 0; i < 6; i++) {
    let idx = (i * 2) % 5;
    vertex(points[idx].x, points[idx].y);
  }
  endShape(CLOSE);
}

function drawCandles() {
  for (let candle of candles) {
    let x = cos(candle.angle + pentagramRotation) * candle.radius;
    let y = sin(candle.angle + pentagramRotation) * candle.radius;

    push();
    translate(x, y);

    // Candle body
    fill(40, 20, 90, 80);
    noStroke();
    rect(-6, 0, 12, candle.height, 2);

    // Flame
    candle.flicker += 0.2;
    let flickerOffset = sin(candle.flicker) * 2;
    let flameHeight = 20 + sin(candle.flicker * 1.3) * 5;

    // Flame glow
    for (let g = 8; g > 0; g--) {
      fill(30, 80, 90, 8);
      ellipse(flickerOffset, -flameHeight / 2, 15 + g * 4, flameHeight + g * 5);
    }

    // Flame core
    fill(40, 90, 100, 90);
    beginShape();
    vertex(0 + flickerOffset, -flameHeight);
    bezierVertex(-8 + flickerOffset, -flameHeight * 0.6, -6, -5, 0, 0);
    bezierVertex(6, -5, 8 + flickerOffset, -flameHeight * 0.6, 0 + flickerOffset, -flameHeight);
    endShape();

    // Inner flame
    fill(50, 70, 100, 90);
    beginShape();
    vertex(0 + flickerOffset * 0.5, -flameHeight * 0.8);
    bezierVertex(-3, -flameHeight * 0.4, -3, -3, 0, 0);
    bezierVertex(3, -3, 3, -flameHeight * 0.4, 0 + flickerOffset * 0.5, -flameHeight * 0.8);
    endShape();

    pop();
  }
}

function drawCentralSigil() {
  push();

  // Pulsing central glow
  let pulse = sin(time * 2) * 0.3 + 0.7;

  noStroke();
  for (let i = 10; i > 0; i--) {
    fill(280, 60, 50, 5 * pulse);
    circle(0, 0, 60 + i * 8);
  }

  // Central eye symbol
  stroke(300, 70, 90, 70);
  strokeWeight(2);
  noFill();

  // Eye outline
  beginShape();
  vertex(-30, 0);
  bezierVertex(-15, -20, 15, -20, 30, 0);
  bezierVertex(15, 20, -15, 20, -30, 0);
  endShape();

  // Iris
  circle(0, 0, 25);

  // Pupil
  fill(280, 90, 20);
  circle(0, 0, 12);

  // Pupil highlight
  fill(300, 30, 100, 60);
  circle(-3, -3, 4);

  // Rotating symbols around eye
  for (let i = 0; i < 3; i++) {
    let angle = (TWO_PI / 3) * i + time;
    let x = cos(angle) * 45;
    let y = sin(angle) * 45;

    stroke(45, 70, 80, 50);
    strokeWeight(1.5);
    push();
    translate(x, y);
    rotate(angle + HALF_PI);
    line(0, -5, 0, 5);
    line(-3, -3, 3, -3);
    pop();
  }

  pop();
}

function drawEnergyLines() {
  // Occasional energy arcs between elements
  if (frameCount % 60 < 30) {
    let startAngle = random(TWO_PI);
    let endAngle = startAngle + random(PI / 4, PI / 2);

    stroke(280, 70, 90, 20);
    strokeWeight(1);
    noFill();

    let r = random(150, 280);
    arc(0, 0, r * 2, r * 2, startAngle + time, endAngle + time);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  // Spawn burst of particles on click
  for (let i = 0; i < 20; i++) {
    let p = createParticle();
    p.x = mouseX - width / 2;
    p.y = mouseY - height / 2;
    p.vx = random(-3, 3);
    p.vy = random(-3, 3);
    p.life = 255;
    particles.push(p);
  }

  // Limit particle count to prevent performance issues
  while (particles.length > 300) {
    particles.shift();
  }
}
