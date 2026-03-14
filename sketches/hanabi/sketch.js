// Hanabi 花火 — Japanese firework pattern animation
// Inspired by traditional tenugui textile designs

const hanabi = [];
const scatterDots = [];
const BG = [245, 240, 232]; // warm off-white like cotton

// Color palette from the tenugui
const PALETTE = {
  red:    [205, 50, 55],
  navy:   [55, 48, 130],
  teal:   [120, 170, 155],
  mauve:  [160, 115, 155],
};

// Burst color combos seen on the fabric
const COMBOS = [
  ['red', 'navy'],
  ['red', 'navy', 'teal'],
  ['red', 'teal', 'mauve'],
  ['navy', 'teal'],
  ['red', 'teal'],
  ['navy', 'teal', 'red'],
  ['red', 'mauve', 'teal'],
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  // Spawn initial hanabi
  for (let i = 0; i < 7; i++) {
    spawnHanabi(random(60, width - 60), random(60, height - 60));
  }

  // Scatter some small dots
  for (let i = 0; i < 30; i++) {
    scatterDots.push({
      x: random(width),
      y: random(height),
      size: random(2, 5),
      color: PALETTE[random(['red', 'navy', 'teal', 'mauve'])],
      birth: floor(random(-200, 0)),
      lifespan: random(200, 400),
    });
  }
}

function draw() {
  background(...BG);

  // Draw scatter dots
  for (let i = scatterDots.length - 1; i >= 0; i--) {
    const d = scatterDots[i];
    const age = frameCount - d.birth;
    if (age > d.lifespan) {
      d.x = random(width);
      d.y = random(height);
      d.birth = frameCount;
      d.lifespan = random(200, 400);
      d.color = PALETTE[random(['red', 'navy', 'teal', 'mauve'])];
      d.size = random(2, 5);
    }
    let alpha = 255;
    if (age < 30) alpha = map(age, 0, 30, 0, 255);
    else if (age > d.lifespan - 40) alpha = map(age, d.lifespan - 40, d.lifespan, 255, 0);
    fill(...d.color, alpha);
    ellipse(d.x, d.y, d.size, d.size);
  }

  // Draw hanabi
  for (let i = hanabi.length - 1; i >= 0; i--) {
    hanabi[i].update();
    hanabi[i].draw();
    if (hanabi[i].isDead()) {
      hanabi.splice(i, 1);
    }
  }

  // Auto-spawn
  if (frameCount % 80 === 0 && hanabi.length < 10) {
    spawnHanabi(random(80, width - 80), random(80, height - 80));
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
    this.maxRadius = random(50, 110);
    this.rotation = random(TWO_PI);
    this.rotSpeed = random(-0.002, 0.002);
    this.growDuration = random(30, 50);
    this.fadeDuration = random(40, 70);

    // Pick a color combo from the fabric
    const combo = random(COMBOS);
    this.colors = combo.map(name => PALETTE[name]);

    // Burst params
    this.numRays = floor(random(14, 26));
    // For dual-ring type
    this.innerRays = floor(random(8, 14));
    this.outerRays = floor(random(14, 22));
  }

  getAge() { return frameCount - this.birth; }

  getAlpha() {
    const age = this.getAge();
    if (age < this.growDuration) return map(age, 0, this.growDuration, 0, 255);
    if (age > this.lifespan - this.fadeDuration) return map(age, this.lifespan - this.fadeDuration, this.lifespan, 255, 0);
    return 255;
  }

  getScale() {
    const age = this.getAge();
    if (age < this.growDuration) {
      const t = age / this.growDuration;
      return t * t * (3 - 2 * t);
    }
    return 1;
  }

  isDead() { return this.getAge() > this.lifespan; }

  update() { this.rotation += this.rotSpeed; }

  draw() {
    const alpha = this.getAlpha();
    const scale = this.getScale();
    const r = this.maxRadius * scale;

    push();
    translate(this.x, this.y);
    rotate(this.rotation);

    switch (this.type) {
      case 0: this.drawInterleavedPetals(r, alpha); break;
      case 1: this.drawDualRing(r, alpha); break;
      case 2: this.drawDotCluster(r, alpha); break;
      case 3: this.drawThreeColorBurst(r, alpha); break;
    }

    pop();
  }

  // Type 0: Interleaved colored petals — the main pattern on the fabric
  // Tapered dashes radiating out, alternating 2-3 colors
  drawInterleavedPetals(r, alpha) {
    const n = this.numRays;
    for (let i = 0; i < n; i++) {
      const angle = (TWO_PI / n) * i;
      const col = this.colors[i % this.colors.length];
      fill(...col, alpha);

      push();
      rotate(angle);
      // Teardrop petal — wider at tip, narrow at base
      this.drawPetal(r * 0.18, r * 0.75, r * 0.08);
      pop();
    }

    // Center dot
    fill(...this.colors[0], alpha);
    ellipse(0, 0, r * 0.1, r * 0.1);
  }

  // Type 1: Dual ring — inner ring short dashes, outer ring longer, different colors
  drawDualRing(r, alpha) {
    // Inner ring
    const innerN = this.innerRays;
    for (let i = 0; i < innerN; i++) {
      const angle = (TWO_PI / innerN) * i;
      const col = this.colors[0];
      fill(...col, alpha);

      push();
      rotate(angle);
      this.drawPetal(r * 0.08, r * 0.35, r * 0.06);
      pop();
    }

    // Outer ring
    const outerN = this.outerRays;
    const colIdx = this.colors.length > 1 ? 1 : 0;
    for (let i = 0; i < outerN; i++) {
      const angle = (TWO_PI / outerN) * i + PI / outerN; // offset
      const col = this.colors[i % 2 === 0 ? colIdx : (this.colors.length > 2 ? 2 : 0)];
      fill(...col, alpha);

      push();
      rotate(angle);
      this.drawPetal(r * 0.4, r * 0.85, r * 0.065);
      pop();
    }

    // Center
    fill(...this.colors[this.colors.length - 1], alpha);
    ellipse(0, 0, r * 0.09, r * 0.09);
  }

  // Type 2: Dot cluster — concentric rings of dots (navy+mauve pattern from fabric)
  drawDotCluster(r, alpha) {
    // Inner ring
    const innerN = 8;
    const innerR = r * 0.25;
    for (let i = 0; i < innerN; i++) {
      const angle = (TWO_PI / innerN) * i;
      const col = this.colors[0];
      fill(...col, alpha);
      ellipse(cos(angle) * innerR, sin(angle) * innerR, r * 0.08, r * 0.08);
    }

    // Middle ring
    const midN = 12;
    const midR = r * 0.5;
    for (let i = 0; i < midN; i++) {
      const angle = (TWO_PI / midN) * i + PI / midN;
      const col = this.colors.length > 1 ? this.colors[1] : this.colors[0];
      fill(...col, alpha);
      ellipse(cos(angle) * midR, sin(angle) * midR, r * 0.065, r * 0.065);
    }

    // Outer scattered
    const outerN = 16;
    const outerR = r * 0.75;
    for (let i = 0; i < outerN; i++) {
      const angle = (TWO_PI / outerN) * i;
      const dist = outerR + random(-r * 0.08, r * 0.08);
      const col = this.colors[i % this.colors.length];
      fill(...col, alpha * 0.7);
      const s = r * random(0.035, 0.06);
      ellipse(cos(angle) * dist, sin(angle) * dist, s, s);
    }

    // Center
    fill(...this.colors[0], alpha);
    ellipse(0, 0, r * 0.09, r * 0.09);
  }

  // Type 3: Three-color burst — like the big multicolor ones on the fabric
  drawThreeColorBurst(r, alpha) {
    const n = this.numRays;
    // Two layers — shorter background, longer foreground
    // Background layer (every other, secondary color)
    for (let i = 0; i < n; i += 2) {
      const angle = (TWO_PI / n) * i + PI / n * 0.5;
      const col = this.colors.length > 2 ? this.colors[2] : this.colors[this.colors.length - 1];
      fill(...col, alpha * 0.7);

      push();
      rotate(angle);
      this.drawPetal(r * 0.12, r * 0.55, r * 0.055);
      pop();
    }

    // Foreground layer — all rays, alternating 2 colors
    for (let i = 0; i < n; i++) {
      const angle = (TWO_PI / n) * i;
      const col = this.colors[i % 2];
      fill(...col, alpha);

      push();
      rotate(angle);
      this.drawPetal(r * 0.15, r * 0.8, r * 0.07);
      pop();
    }

    // Center accent
    fill(...this.colors[0], alpha);
    ellipse(0, 0, r * 0.12, r * 0.12);
    if (this.colors.length > 1) {
      fill(...this.colors[1], alpha);
      ellipse(0, 0, r * 0.06, r * 0.06);
    }
  }

  // Draw a tapered petal shape — narrow at start, wider at end (like the tenugui dashes)
  drawPetal(startDist, endDist, maxWidth) {
    const len = endDist - startDist;
    beginShape();
    // Taper: narrow at base (near center), wide at tip
    const baseW = maxWidth * 0.3;
    const tipW = maxWidth;
    // Left edge
    vertex(startDist, -baseW / 2);
    // Tip (rounded with bezier)
    bezierVertex(
      startDist + len * 0.6, -tipW / 2,
      endDist - len * 0.1, -tipW / 2,
      endDist, 0
    );
    // Right edge back
    bezierVertex(
      endDist - len * 0.1, tipW / 2,
      startDist + len * 0.6, tipW / 2,
      startDist, baseW / 2
    );
    endShape(CLOSE);
  }
}
