// Hanabi 花火 — Japanese firework pattern animation
// Inspired by traditional tenugui textile designs

const hanabi = [];
const BG = [245, 240, 232]; // warm off-white like cotton

// Color palette from the tenugui
const PALETTE = [
  [205, 50, 55],    // red (crimson)
  [55, 48, 130],    // deep indigo/navy
  [120, 170, 160],  // sage teal
  [155, 110, 155],  // muted purple/mauve
  [190, 70, 80],    // warm red
  [75, 65, 145],    // blue-purple
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  // Start with a few hanabi
  for (let i = 0; i < 6; i++) {
    spawnHanabi(random(width), random(height));
  }
}

function draw() {
  background(...BG);

  for (let i = hanabi.length - 1; i >= 0; i--) {
    hanabi[i].update();
    hanabi[i].draw();
    if (hanabi[i].isDead()) {
      hanabi.splice(i, 1);
    }
  }

  // Occasionally spawn new ones
  if (frameCount % 90 === 0 && hanabi.length < 12) {
    spawnHanabi(random(width), random(height));
  }
}

function mousePressed() {
  spawnHanabi(mouseX, mouseY);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function spawnHanabi(x, y) {
  const type = floor(random(4));
  hanabi.push(new Hanabi(x, y, type));
}

class Hanabi {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.birth = frameCount;
    this.lifespan = random(300, 500);
    this.maxRadius = random(40, 100);
    this.numRays = floor(random(12, 24));
    this.rotation = random(TWO_PI);
    this.rotSpeed = random(-0.003, 0.003);
    this.color1 = random(PALETTE);
    this.color2 = random(PALETTE);
    // Make sure colors are different
    while (this.color2 === this.color1) {
      this.color2 = random(PALETTE);
    }
    this.phase = 0; // 0: growing, 1: alive, 2: fading
    this.growDuration = random(30, 60);
    this.fadeDuration = random(40, 80);
    this.dotPattern = floor(random(3)); // variations in dot arrangement
    this.innerDots = floor(random(5, 10));
  }

  getAge() {
    return frameCount - this.birth;
  }

  getAlpha() {
    const age = this.getAge();
    if (age < this.growDuration) {
      return map(age, 0, this.growDuration, 0, 255);
    } else if (age > this.lifespan - this.fadeDuration) {
      return map(age, this.lifespan - this.fadeDuration, this.lifespan, 255, 0);
    }
    return 255;
  }

  getScale() {
    const age = this.getAge();
    if (age < this.growDuration) {
      // Ease out
      const t = age / this.growDuration;
      return t * t * (3 - 2 * t); // smoothstep
    }
    return 1;
  }

  isDead() {
    return this.getAge() > this.lifespan;
  }

  update() {
    this.rotation += this.rotSpeed;
  }

  draw() {
    const alpha = this.getAlpha();
    const scale = this.getScale();
    const r = this.maxRadius * scale;

    push();
    translate(this.x, this.y);
    rotate(this.rotation);

    switch (this.type) {
      case 0: this.drawDashBurst(r, alpha); break;
      case 1: this.drawDotCluster(r, alpha); break;
      case 2: this.drawMixedBurst(r, alpha); break;
      case 3: this.drawPetalBurst(r, alpha); break;
    }

    pop();
  }

  // Type 0: Radial dashes like the red bursts on the tenugui
  drawDashBurst(r, alpha) {
    const col = [...this.color1, alpha];
    fill(...col);

    for (let i = 0; i < this.numRays; i++) {
      const angle = (TWO_PI / this.numRays) * i;
      const dashLen = r * random(0.25, 0.4);
      const dashStart = r * 0.3;
      const dashWidth = max(2, r * 0.06);

      push();
      rotate(angle);

      // Elongated dash
      const cx = dashStart + dashLen / 2;
      ellipse(cx, 0, dashLen, dashWidth);

      // Dot at tip
      const dotR = max(2, r * 0.05);
      ellipse(dashStart + dashLen + dotR, 0, dotR * 2, dotR * 2);
      pop();
    }

    // Center dot
    fill(...this.color2, alpha);
    ellipse(0, 0, r * 0.12, r * 0.12);
  }

  // Type 1: Dot cluster like the navy dot patterns
  drawDotCluster(r, alpha) {
    const col = [...this.color1, alpha];
    fill(...col);

    // Inner ring of dots
    const innerR = r * 0.35;
    const innerCount = this.innerDots;
    for (let i = 0; i < innerCount; i++) {
      const angle = (TWO_PI / innerCount) * i;
      const dotSize = max(3, r * 0.08);
      ellipse(cos(angle) * innerR, sin(angle) * innerR, dotSize, dotSize);
    }

    // Outer ring of dots
    fill(...this.color2, alpha);
    const outerR = r * 0.7;
    const outerCount = this.numRays;
    for (let i = 0; i < outerCount; i++) {
      const angle = (TWO_PI / outerCount) * i;
      const dotSize = max(2.5, r * 0.065);
      ellipse(cos(angle) * outerR, sin(angle) * outerR, dotSize, dotSize);
    }

    // Scattered small dots
    fill(...this.color1, alpha * 0.6);
    for (let i = 0; i < 8; i++) {
      const angle = random(TWO_PI);
      const dist = random(innerR, outerR);
      const dotSize = max(2, r * 0.04);
      ellipse(cos(angle) * dist, sin(angle) * dist, dotSize, dotSize);
    }

    // Center
    fill(...this.color1, alpha);
    ellipse(0, 0, r * 0.1, r * 0.1);
  }

  // Type 2: Mixed — dashes with alternating colors (like the red+blue bursts)
  drawMixedBurst(r, alpha) {
    for (let i = 0; i < this.numRays; i++) {
      const angle = (TWO_PI / this.numRays) * i;
      const col = i % 2 === 0 ? this.color1 : this.color2;
      fill(...col, alpha);

      push();
      rotate(angle);

      const dashLen = r * random(0.3, 0.45);
      const dashStart = r * 0.2;
      const dashWidth = max(2, r * 0.055);

      // Tapered dash (wider at base, narrower at tip)
      beginShape();
      const bw = dashWidth;
      const tw = dashWidth * 0.4;
      vertex(dashStart, -bw / 2);
      vertex(dashStart + dashLen, -tw / 2);
      vertex(dashStart + dashLen, tw / 2);
      vertex(dashStart, bw / 2);
      endShape(CLOSE);

      pop();
    }

    // Center dots ring
    fill(...this.color2, alpha);
    const dotRing = r * 0.15;
    for (let i = 0; i < 6; i++) {
      const angle = (TWO_PI / 6) * i;
      ellipse(cos(angle) * dotRing, sin(angle) * dotRing, r * 0.05, r * 0.05);
    }
  }

  // Type 3: Petal-like burst (teal/green ones from the tenugui)
  drawPetalBurst(r, alpha) {
    const col = [...this.color1, alpha];

    for (let i = 0; i < this.numRays; i++) {
      const angle = (TWO_PI / this.numRays) * i;

      push();
      rotate(angle);
      fill(...col);

      // Petal shape — elongated ellipse
      const petalLen = r * random(0.35, 0.5);
      const petalWidth = max(2, r * 0.07);
      const petalStart = r * 0.15;

      ellipse(petalStart + petalLen / 2, 0, petalLen, petalWidth);

      // Small accent dot
      fill(...this.color2, alpha * 0.8);
      const accentSize = max(1.5, r * 0.035);
      ellipse(petalStart + petalLen * 0.3, 0, accentSize, accentSize);

      pop();
    }

    // Center
    fill(...this.color2, alpha);
    ellipse(0, 0, r * 0.14, r * 0.14);

    // Inner accent ring
    noFill();
    stroke(...this.color1, alpha * 0.4);
    strokeWeight(max(1, r * 0.02));
    ellipse(0, 0, r * 0.3, r * 0.3);
    noStroke();
  }
}
