// Saturn - Cosmic Visualization
// A mesmerizing visualization of Saturn with its iconic rings

let stars = [];
let ringParticles = [];
let moons = [];
let time = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

  // Create background stars
  for (let i = 0; i < 300; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(0.5, 3),
      twinkle: random(TWO_PI),
      speed: random(0.02, 0.08)
    });
  }

  // Create ring particles
  for (let i = 0; i < 2000; i++) {
    let angle = random(TWO_PI);
    let ringIndex = floor(random(3));
    let baseRadius = 180 + ringIndex * 40;
    let radius = baseRadius + random(-15, 15);

    ringParticles.push({
      angle: angle,
      radius: radius,
      speed: random(0.001, 0.003) * (ringIndex === 1 ? -1 : 1),
      size: random(1, 3),
      brightness: random(40, 80),
      ringIndex: ringIndex
    });
  }

  // Create moons
  for (let i = 0; i < 4; i++) {
    moons.push({
      angle: random(TWO_PI),
      radius: 320 + i * 50,
      speed: 0.005 / (i + 1),
      size: 8 - i * 1.5,
      hue: random(30, 50)
    });
  }
}

function draw() {
  background(240, 20, 5);

  // Draw twinkling stars
  noStroke();
  for (let star of stars) {
    let twinkle = sin(star.twinkle + time * star.speed) * 0.5 + 0.5;
    fill(60, 10, 80 + twinkle * 20, 60 + twinkle * 40);
    circle(star.x, star.y, star.size * (0.8 + twinkle * 0.4));
  }

  translate(width / 2, height / 2);

  // Draw Saturn's glow
  for (let i = 20; i > 0; i--) {
    let alpha = map(i, 0, 20, 30, 0);
    fill(35, 40, 70, alpha);
    noStroke();
    ellipse(0, 0, 280 + i * 15, 280 + i * 15);
  }

  // Draw back rings (behind planet)
  drawRings(true);

  // Draw Saturn body with bands
  drawSaturnBody();

  // Draw front rings (in front of planet)
  drawRings(false);

  // Draw moons
  for (let moon of moons) {
    moon.angle += moon.speed;
    let x = cos(moon.angle) * moon.radius;
    let y = sin(moon.angle) * moon.radius * 0.3;

    // Only draw if in front of planet or far enough
    if (y > 0 || abs(x) > 150) {
      // Moon glow
      for (let i = 5; i > 0; i--) {
        fill(moon.hue, 20, 60, 10);
        circle(x, y, moon.size + i * 3);
      }
      fill(moon.hue, 15, 85);
      circle(x, y, moon.size);
    }
  }

  // Draw mystical symbols around Saturn
  drawMysticalSymbols();

  time += deltaTime / 1000;
}

function drawSaturnBody() {
  // Saturn's main body with atmospheric bands
  push();

  // Base sphere
  for (let i = 0; i < 140; i++) {
    let y = map(i, 0, 140, -140, 140);
    let bandWidth = sqrt(140 * 140 - y * y) * 2;

    // Create band color variation
    let bandNoise = noise(i * 0.1, time * 0.5);
    let hue = 35 + sin(i * 0.15) * 10;
    let sat = 35 + bandNoise * 25;
    let bri = 65 + sin(i * 0.2 + time) * 10;

    stroke(hue, sat, bri);
    strokeWeight(2);
    line(-bandWidth / 2, y, bandWidth / 2, y);
  }

  // Polar regions
  fill(35, 20, 75);
  noStroke();
  ellipse(0, -130, 60, 20);
  ellipse(0, 130, 60, 20);

  pop();
}

function drawRings(isBack) {
  for (let particle of ringParticles) {
    particle.angle += particle.speed;

    let x = cos(particle.angle) * particle.radius;
    let y = sin(particle.angle) * particle.radius * 0.3;

    // Determine if particle is in front or back
    let isInBack = sin(particle.angle) < 0;

    if (isBack === isInBack) {
      // Ring colors based on distance
      let hue = 35 + particle.ringIndex * 5;
      let sat = 25 + particle.ringIndex * 10;

      // Add shadow when behind planet
      let brightness = particle.brightness;
      if (isBack && abs(x) < 130) {
        brightness *= 0.4;
      }

      fill(hue, sat, brightness, 70);
      noStroke();
      circle(x, y, particle.size);
    }
  }
}

function drawMysticalSymbols() {
  push();

  // Saturn's astrological symbol
  let symbolAlpha = 40 + sin(time * 2) * 20;
  stroke(45, 60, 90, symbolAlpha);
  strokeWeight(2);
  noFill();

  // Draw Saturn symbol at corners
  let positions = [
    { x: -width/2 + 80, y: -height/2 + 80 },
    { x: width/2 - 80, y: -height/2 + 80 },
    { x: -width/2 + 80, y: height/2 - 80 },
    { x: width/2 - 80, y: height/2 - 80 }
  ];

  for (let pos of positions) {
    push();
    translate(pos.x, pos.y);
    rotate(time * 0.2);
    drawSaturnSymbol(25);
    pop();
  }

  // Orbital paths
  stroke(45, 30, 50, 20);
  strokeWeight(1);
  for (let i = 0; i < 4; i++) {
    let r = 320 + i * 50;
    ellipse(0, 0, r * 2, r * 0.6);
  }

  pop();
}

function drawSaturnSymbol(size) {
  // Saturn astrological symbol (h with cross)
  // Vertical line
  line(0, -size, 0, size * 0.6);

  // Cross at bottom
  line(-size * 0.4, size * 0.3, size * 0.4, size * 0.3);

  // Curved top
  noFill();
  arc(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6, -HALF_PI, HALF_PI);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Redistribute stars
  for (let star of stars) {
    star.x = random(width);
    star.y = random(height);
  }
}
