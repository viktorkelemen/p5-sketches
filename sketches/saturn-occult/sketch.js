// Saturn Occult - Dark Cosmic Ritual
// Saturn as an occult deity with hexagram, alchemical symbols, and dark energy

let stars = [];
let orbits = [];
let sigils = [];
let darkEnergy = [];
let time = 0;
let hexagramAngle = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

  // Create deep space stars
  for (let i = 0; i < 400; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(0.5, 2.5),
      brightness: random(30, 80),
      twinkleSpeed: random(0.02, 0.1),
      twinkleOffset: random(TWO_PI)
    });
  }

  // Create orbital sigil paths
  for (let i = 0; i < 7; i++) {
    orbits.push({
      radius: 220 + i * 35,
      speed: (0.003 / (i + 1)) * (i % 2 === 0 ? 1 : -1),
      angle: random(TWO_PI),
      sigilCount: 3 + i,
      hue: 270 + i * 10
    });
  }

  // Create floating alchemical sigils
  for (let i = 0; i < 12; i++) {
    sigils.push({
      angle: (TWO_PI / 12) * i,
      radius: random(320, 400),
      type: floor(random(6)),
      rotationSpeed: random(-0.02, 0.02),
      rotation: random(TWO_PI),
      size: random(20, 35),
      pulseOffset: random(TWO_PI)
    });
  }

  // Create dark energy particles
  for (let i = 0; i < 100; i++) {
    darkEnergy.push(createDarkParticle());
  }
}

function createDarkParticle() {
  let angle = random(TWO_PI);
  let radius = random(100, 450);
  return {
    x: cos(angle) * radius,
    y: sin(angle) * radius,
    angle: angle,
    radius: radius,
    speed: random(0.005, 0.02),
    size: random(3, 12),
    alpha: random(20, 60),
    spiralSpeed: random(-0.001, 0.001)
  };
}

function draw() {
  // Deep void background
  background(260, 40, 4);

  // Draw stars
  drawStars();

  translate(width / 2, height / 2);

  // Draw dark energy vortex
  drawDarkVortex();

  // Update and draw dark energy particles
  updateDarkEnergy();

  // Draw orbital circles with sigils
  drawOrbitalRings();

  // Draw the hexagram
  push();
  rotate(hexagramAngle);
  drawHexagram(160);
  pop();

  // Draw Saturn in the center
  drawOccultSaturn();

  // Draw alchemical sigils
  drawAlchemicalSigils();

  // Draw Saturn's symbol prominently
  drawSaturnSymbolLarge();

  // Draw connecting energy lines
  drawEnergyConnections();

  // Clamp deltaTime to prevent animation jumps after tab switching
  let dt = min(deltaTime / 1000, 0.1);
  time += dt;
  hexagramAngle += 0.003 * dt * 60;
}

function drawStars() {
  push();
  noStroke();
  for (let star of stars) {
    let twinkle = sin(time * star.twinkleSpeed + star.twinkleOffset);
    let brightness = star.brightness + twinkle * 20;
    let alpha = 50 + twinkle * 30;
    fill(45, 10, brightness, alpha);
    circle(star.x, star.y, star.size);
  }
  pop();
}

function drawDarkVortex() {
  noFill();
  for (let i = 20; i > 0; i--) {
    let radius = 100 + i * 25;
    let alpha = map(i, 0, 20, 20, 2);
    let distortion = sin(time + i * 0.3) * 10;

    stroke(280, 60, 30, alpha);
    strokeWeight(2);

    beginShape();
    for (let a = 0; a < TWO_PI; a += 0.1) {
      let r = radius + sin(a * 6 + time * 2) * distortion;
      let x = cos(a) * r;
      let y = sin(a) * r;
      vertex(x, y);
    }
    endShape(CLOSE);
  }
}

function updateDarkEnergy() {
  for (let p of darkEnergy) {
    p.angle += p.speed;
    p.radius += p.spiralSpeed * 50;

    // Keep particles in bounds
    if (p.radius < 80 || p.radius > 480) {
      p.spiralSpeed *= -1;
    }

    let x = cos(p.angle) * p.radius;
    let y = sin(p.angle) * p.radius;

    // Draw with ethereal effect
    noStroke();
    fill(270, 70, 20, p.alpha * 0.3);
    circle(x, y, p.size * 2);
    fill(280, 60, 40, p.alpha);
    circle(x, y, p.size);
  }
}

function drawOrbitalRings() {
  for (let orbit of orbits) {
    orbit.angle += orbit.speed;

    // Draw orbital path
    noFill();
    stroke(orbit.hue, 40, 40, 15);
    strokeWeight(1);
    circle(0, 0, orbit.radius * 2);

    // Draw sigils on orbit
    for (let i = 0; i < orbit.sigilCount; i++) {
      let angle = orbit.angle + (TWO_PI / orbit.sigilCount) * i;
      let x = cos(angle) * orbit.radius;
      let y = sin(angle) * orbit.radius;

      let pulse = sin(time * 3 + i) * 0.3 + 0.7;

      fill(orbit.hue, 50, 60, 40 * pulse);
      noStroke();
      circle(x, y, 6);

      stroke(orbit.hue, 60, 80, 60 * pulse);
      strokeWeight(1);
      noFill();
      circle(x, y, 10);
    }
  }
}

function drawHexagram(size) {
  // Hexagram (Star of David / Seal of Solomon) - associated with Saturn in occultism

  // Outer glow
  noFill();
  for (let g = 8; g > 0; g--) {
    stroke(45, 70, 60, 5);
    strokeWeight(g * 2);
    drawHexagramShape(size);
  }

  // Main hexagram
  stroke(45, 80, 90, 70);
  strokeWeight(2);
  drawHexagramShape(size);

  // Inner hexagram
  stroke(280, 60, 70, 50);
  strokeWeight(1.5);
  drawHexagramShape(size * 0.6);

  // Points glow
  for (let i = 0; i < 6; i++) {
    let angle = (TWO_PI / 6) * i - HALF_PI;
    let x = cos(angle) * size;
    let y = sin(angle) * size;
    let pulse = sin(time * 4 + i) * 0.3 + 0.7;

    noStroke();
    fill(45, 70, 80, 30 * pulse);
    circle(x, y, 15);
    fill(45, 50, 100, 60 * pulse);
    circle(x, y, 6);
  }
}

function drawHexagramShape(size) {
  // Two overlapping triangles
  noFill();

  // Upward triangle
  beginShape();
  for (let i = 0; i < 3; i++) {
    let angle = (TWO_PI / 3) * i - HALF_PI;
    vertex(cos(angle) * size, sin(angle) * size);
  }
  endShape(CLOSE);

  // Downward triangle
  beginShape();
  for (let i = 0; i < 3; i++) {
    let angle = (TWO_PI / 3) * i + HALF_PI;
    vertex(cos(angle) * size, sin(angle) * size);
  }
  endShape(CLOSE);
}

function drawOccultSaturn() {
  // Saturn as dark sphere with mystical rings

  // Dark aura
  noStroke();
  for (let i = 15; i > 0; i--) {
    let alpha = map(i, 0, 15, 25, 0);
    fill(270, 50, 20, alpha);
    circle(0, 0, 100 + i * 8);
  }

  // Saturn body - dark and mysterious
  for (let i = 0; i < 50; i++) {
    let y = map(i, 0, 50, -50, 50);
    let bandWidth = sqrt(2500 - y * y) * 2;

    let bandNoise = noise(i * 0.1, time * 0.3);
    let hue = 270 + sin(i * 0.15) * 20;
    let bri = 25 + bandNoise * 15;

    stroke(hue, 40, bri);
    strokeWeight(2);
    line(-bandWidth / 2, y, bandWidth / 2, y);
  }

  // Mysterious eye in center
  let eyePulse = sin(time * 2) * 0.2 + 0.8;
  fill(300, 80, 50, 60 * eyePulse);
  noStroke();
  ellipse(0, 0, 30, 15);
  fill(300, 90, 30);
  circle(0, 0, 8);
  fill(45, 80, 100, 80);
  circle(-2, -1, 3);

  // Saturn's rings (tilted, dark)
  drawOccultRings();
}

function drawOccultRings() {
  noFill();

  for (let r = 0; r < 3; r++) {
    let ringRadius = 70 + r * 20;

    // Front of rings - draw as individual line segments for varying alpha
    strokeWeight(3 - r * 0.5);
    for (let a = 0; a < PI; a += 0.05) {
      let alpha = 50 + sin(a * 8 + time * 3) * 20;
      stroke(280, 50, 60, alpha);
      let x1 = cos(a) * ringRadius;
      let y1 = sin(a) * ringRadius * 0.25;
      let x2 = cos(a + 0.05) * ringRadius;
      let y2 = sin(a + 0.05) * ringRadius * 0.25;
      line(x1, y1, x2, y2);
    }

    // Back of rings (behind planet)
    stroke(280, 40, 30, 30);
    strokeWeight(2 - r * 0.3);
    arc(0, 0, ringRadius * 2, ringRadius * 0.5, PI, TWO_PI);
  }
}

function drawAlchemicalSigils() {
  for (let sigil of sigils) {
    sigil.rotation += sigil.rotationSpeed;
    let pulse = sin(time * 2 + sigil.pulseOffset) * 0.3 + 0.7;

    let x = cos(sigil.angle + time * 0.1) * sigil.radius;
    let y = sin(sigil.angle + time * 0.1) * sigil.radius;

    push();
    translate(x, y);
    rotate(sigil.rotation);

    // Glow
    noStroke();
    fill(45, 60, 50, 15 * pulse);
    circle(0, 0, sigil.size * 2);

    // Draw sigil based on type
    stroke(45, 70, 80, 60 * pulse);
    strokeWeight(1.5);
    noFill();

    switch (sigil.type) {
      case 0: // Earth (inverted triangle with line)
        triangle(0, -sigil.size / 2, -sigil.size / 2, sigil.size / 2, sigil.size / 2, sigil.size / 2);
        line(-sigil.size / 3, sigil.size / 6, sigil.size / 3, sigil.size / 6);
        break;
      case 1: // Saturn cross
        line(0, -sigil.size / 2, 0, sigil.size / 2);
        line(-sigil.size / 3, 0, sigil.size / 3, 0);
        arc(sigil.size / 4, -sigil.size / 4, sigil.size / 2, sigil.size / 2, -PI, 0);
        break;
      case 2: // Circle with cross
        circle(0, 0, sigil.size);
        line(0, -sigil.size / 2, 0, sigil.size / 2);
        line(-sigil.size / 2, 0, sigil.size / 2, 0);
        break;
      case 3: // Crescent
        arc(0, 0, sigil.size, sigil.size, QUARTER_PI, PI + QUARTER_PI);
        arc(sigil.size / 4, 0, sigil.size * 0.7, sigil.size * 0.7, QUARTER_PI, PI + QUARTER_PI);
        break;
      case 4: // Serpent
        noFill();
        beginShape();
        for (let t = 0; t < TWO_PI; t += 0.2) {
          let sx = sin(t * 2) * sigil.size / 3;
          let sy = map(t, 0, TWO_PI, -sigil.size / 2, sigil.size / 2);
          vertex(sx, sy);
        }
        endShape();
        break;
      case 5: // Eye
        ellipse(0, 0, sigil.size, sigil.size / 2);
        circle(0, 0, sigil.size / 3);
        break;
    }

    pop();
  }
}

function drawSaturnSymbolLarge() {
  // Large Saturn symbol at top
  push();
  translate(0, -height / 2 + 80);

  let pulse = sin(time * 1.5) * 0.2 + 0.8;

  // Glow
  noStroke();
  fill(45, 60, 50, 10 * pulse);
  circle(0, 0, 120);

  stroke(45, 70, 85, 70 * pulse);
  strokeWeight(3);
  noFill();

  // Saturn symbol (stylized h with cross)
  let s = 35;
  // Vertical line
  line(0, -s, 0, s * 0.8);
  // Horizontal cross
  line(-s * 0.5, s * 0.4, s * 0.5, s * 0.4);
  // Curved hook
  arc(-s * 0.4, -s * 0.2, s * 0.8, s * 0.8, -HALF_PI, HALF_PI);

  pop();
}

function drawEnergyConnections() {
  // Subtle energy lines connecting various elements
  stroke(280, 50, 50, 10 + sin(time * 2) * 5);
  strokeWeight(1);

  // Connect hexagram points to sigils occasionally
  if (frameCount % 3 === 0) {
    let hexPoint = floor(random(6));
    let sigilIndex = floor(random(sigils.length));
    let sigil = sigils[sigilIndex];

    let hAngle = (TWO_PI / 6) * hexPoint - HALF_PI + hexagramAngle;
    let hx = cos(hAngle) * 160;
    let hy = sin(hAngle) * 160;

    let sx = cos(sigil.angle + time * 0.1) * sigil.radius;
    let sy = sin(sigil.angle + time * 0.1) * sigil.radius;

    line(hx, hy, sx, sy);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Redistribute stars
  for (let star of stars) {
    star.x = random(width);
    star.y = random(height);
  }
}

function mousePressed() {
  // Create burst of dark energy
  for (let i = 0; i < 15; i++) {
    let p = createDarkParticle();
    let angle = random(TWO_PI);
    let dist = random(20, 80);
    p.x = mouseX - width / 2 + cos(angle) * dist;
    p.y = mouseY - height / 2 + sin(angle) * dist;
    p.radius = dist + 100;
    p.angle = atan2(p.y, p.x);
    darkEnergy.push(p);
  }

  // Remove old particles if too many
  while (darkEnergy.length > 200) {
    darkEnergy.shift();
  }
}
