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
const PALETTE_KEYS = Object.keys(PALETTE);

// Burst color combos seen on the fabric
// Note: same colors in different order = different interleave pattern
const COMBOS = [
  ['red', 'navy'],
  ['red', 'navy', 'teal'],
  ['red', 'teal', 'mauve'],
  ['navy', 'teal'],
  ['red', 'teal'],
  ['navy', 'teal', 'red'],   // navy-first interleave
  ['red', 'mauve', 'teal'],
];

// Layout constants — tweak these to adjust proportions
const LAYOUT = {
  // Petal distances (as fraction of radius)
  petalStart: 0.18,
  petalEnd: 0.75,
  petalWidth: 0.08,
  // Dual ring
  innerStart: 0.08,
  innerEnd: 0.35,
  innerWidth: 0.06,
  outerStart: 0.4,
  outerEnd: 0.85,
  outerWidth: 0.065,
  // Dot cluster rings
  dotInnerR: 0.25,
  dotMidR: 0.5,
  dotOuterR: 0.75,
  dotInnerSize: 0.08,
  dotMidSize: 0.065,
  // Three-color burst
  bgStart: 0.12,
  bgEnd: 0.55,
  bgWidth: 0.055,
  fgStart: 0.15,
  fgEnd: 0.8,
  fgWidth: 0.07,
  // Center dot
  centerSize: 0.1,
};

// Minimum distance between hanabi centers
const MIN_SPAWN_DIST = 80;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  for (let i = 0; i < 7; i++) {
    trySpawnHanabi(random(60, width - 60), random(60, height - 60));
  }

  for (let i = 0; i < 30; i++) {
    scatterDots.push(createScatterDot(floor(random(-200, 0))));
  }
}

function createScatterDot(birth) {
  return {
    x: random(width),
    y: random(height),
    size: random(2, 5),
    color: PALETTE[random(PALETTE_KEYS)],
    birth: birth,
    lifespan: random(200, 400),
  };
}

function draw() {
  background(...BG);
  noStroke();

  drawScatterDots();
  updateAndDrawHanabi();

  if (frameCount % 80 === 0 && hanabi.length < 10) {
    trySpawnHanabi(random(80, width - 80), random(80, height - 80));
  }
}

function drawScatterDots() {
  for (let i = 0; i < scatterDots.length; i++) {
    const d = scatterDots[i];
    const age = frameCount - d.birth;
    if (age > d.lifespan) {
      scatterDots[i] = createScatterDot(frameCount);
      continue;
    }
    let alpha = 255;
    if (age < 30) alpha = map(age, 0, 30, 0, 255);
    else if (age > d.lifespan - 40) alpha = map(age, d.lifespan - 40, d.lifespan, 255, 0);
    fill(...d.color, alpha);
    ellipse(d.x, d.y, d.size, d.size);
  }
}

function updateAndDrawHanabi() {
  let writeIdx = 0;
  for (let i = 0; i < hanabi.length; i++) {
    hanabi[i].update();
    hanabi[i].draw();
    if (!hanabi[i].isDead()) {
      hanabi[writeIdx++] = hanabi[i];
    }
  }
  hanabi.length = writeIdx;
}

function mousePressed() {
  spawnHanabi(mouseX, mouseY);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Spawn only if far enough from existing hanabi
function trySpawnHanabi(x, y) {
  for (const h of hanabi) {
    if (dist(x, y, h.x, h.y) < MIN_SPAWN_DIST) return;
  }
  spawnHanabi(x, y);
}

// Force spawn (click)
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
    // Varied sizes — some small, some much larger
    const sizeRoll = random();
    if (sizeRoll < 0.3) this.maxRadius = random(30, 55);       // small
    else if (sizeRoll < 0.7) this.maxRadius = random(55, 110);  // medium
    else if (sizeRoll < 0.9) this.maxRadius = random(110, 170);  // large
    else this.maxRadius = random(170, 240);                      // extra large
    this.rotation = random(TWO_PI);
    this.rotSpeed = random(-0.002, 0.002);
    this.growDuration = random(30, 50);
    this.fadeDuration = random(40, 70);

    const combo = random(COMBOS);
    this.colors = combo.map(name => PALETTE[name]);

    // Scale ray count with size
    const sizeFactor = map(this.maxRadius, 30, 240, 0.7, 1.5);
    this.numRays = floor(random(14, 26) * sizeFactor);
    this.innerRays = floor(random(8, 14) * sizeFactor);
    this.outerRays = floor(random(14, 22) * sizeFactor);

    // Pre-compute outer dot offsets for dot cluster (avoids random() in draw)
    this.outerDotOffsets = [];
    const outerN = 16;
    for (let i = 0; i < outerN; i++) {
      this.outerDotOffsets.push({
        angleFrac: i / outerN,
        distJitter: random(-0.08, 0.08),
        sizeFrac: random(0.035, 0.06),
      });
    }
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
      return t * t * (3 - 2 * t); // smoothstep
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
    noStroke();

    switch (this.type) {
      case 0: this.drawInterleavedPetals(r, alpha); break;
      case 1: this.drawDualRing(r, alpha); break;
      case 2: this.drawDotCluster(r, alpha); break;
      case 3: this.drawThreeColorBurst(r, alpha); break;
    }

    pop();
  }

  // Type 0: Interleaved colored petals — the main pattern on the fabric
  drawInterleavedPetals(r, alpha) {
    const n = this.numRays;
    const L = LAYOUT;
    for (let i = 0; i < n; i++) {
      const angle = (TWO_PI / n) * i;
      fill(...this.colors[i % this.colors.length], alpha);
      push();
      rotate(angle);
      drawPetal(r * L.petalStart, r * L.petalEnd, r * L.petalWidth);
      pop();
    }

    fill(...this.colors[0], alpha);
    ellipse(0, 0, r * L.centerSize, r * L.centerSize);
  }

  // Type 1: Dual ring — inner short dashes, outer longer, different colors
  drawDualRing(r, alpha) {
    const L = LAYOUT;

    // Inner ring
    const innerN = this.innerRays;
    for (let i = 0; i < innerN; i++) {
      const angle = (TWO_PI / innerN) * i;
      fill(...this.colors[0], alpha);
      push();
      rotate(angle);
      drawPetal(r * L.innerStart, r * L.innerEnd, r * L.innerWidth);
      pop();
    }

    // Outer ring (offset rotation)
    const outerN = this.outerRays;
    const colIdx = this.colors.length > 1 ? 1 : 0;
    for (let i = 0; i < outerN; i++) {
      const angle = (TWO_PI / outerN) * i + PI / outerN;
      const ci = i % 2 === 0 ? colIdx : (this.colors.length > 2 ? 2 : 0);
      fill(...this.colors[ci], alpha);
      push();
      rotate(angle);
      drawPetal(r * L.outerStart, r * L.outerEnd, r * L.outerWidth);
      pop();
    }

    fill(...this.colors[this.colors.length - 1], alpha);
    ellipse(0, 0, r * L.centerSize * 0.9, r * L.centerSize * 0.9);
  }

  // Type 2: Dot cluster — concentric rings of dots
  drawDotCluster(r, alpha) {
    const L = LAYOUT;

    // Inner ring
    const innerN = 8;
    const innerR = r * L.dotInnerR;
    for (let i = 0; i < innerN; i++) {
      const angle = (TWO_PI / innerN) * i;
      fill(...this.colors[0], alpha);
      ellipse(cos(angle) * innerR, sin(angle) * innerR, r * L.dotInnerSize, r * L.dotInnerSize);
    }

    // Middle ring
    const midN = 12;
    const midR = r * L.dotMidR;
    const midCol = this.colors.length > 1 ? this.colors[1] : this.colors[0];
    for (let i = 0; i < midN; i++) {
      const angle = (TWO_PI / midN) * i + PI / midN;
      fill(...midCol, alpha);
      ellipse(cos(angle) * midR, sin(angle) * midR, r * L.dotMidSize, r * L.dotMidSize);
    }

    // Outer scattered (pre-computed offsets)
    const outerBaseR = r * L.dotOuterR;
    for (let i = 0; i < this.outerDotOffsets.length; i++) {
      const od = this.outerDotOffsets[i];
      const angle = TWO_PI * od.angleFrac;
      const d = outerBaseR + r * od.distJitter;
      fill(...this.colors[i % this.colors.length], alpha * 0.7);
      const s = r * od.sizeFrac;
      ellipse(cos(angle) * d, sin(angle) * d, s, s);
    }

    fill(...this.colors[0], alpha);
    ellipse(0, 0, r * L.centerSize * 0.9, r * L.centerSize * 0.9);
  }

  // Type 3: Three-color burst — layered foreground + background
  drawThreeColorBurst(r, alpha) {
    const n = this.numRays;
    const L = LAYOUT;
    const bgCol = this.colors.length > 2 ? this.colors[2] : this.colors[this.colors.length - 1];

    // Background layer (every other ray)
    for (let i = 0; i < n; i += 2) {
      const angle = (TWO_PI / n) * i + PI / n * 0.5;
      fill(...bgCol, alpha * 0.7);
      push();
      rotate(angle);
      drawPetal(r * L.bgStart, r * L.bgEnd, r * L.bgWidth);
      pop();
    }

    // Foreground layer — all rays, alternating 2 colors
    for (let i = 0; i < n; i++) {
      const angle = (TWO_PI / n) * i;
      fill(...this.colors[i % 2], alpha);
      push();
      rotate(angle);
      drawPetal(r * L.fgStart, r * L.fgEnd, r * L.fgWidth);
      pop();
    }

    // Center accent
    fill(...this.colors[0], alpha);
    ellipse(0, 0, r * L.centerSize * 1.2, r * L.centerSize * 1.2);
    if (this.colors.length > 1) {
      fill(...this.colors[1], alpha);
      ellipse(0, 0, r * L.centerSize * 0.6, r * L.centerSize * 0.6);
    }
  }
}

// Standalone petal draw — tapered: narrow at base (near center), wide at tip
function drawPetal(startDist, endDist, maxWidth) {
  const len = endDist - startDist;
  const baseW = maxWidth * 0.3;
  const tipW = maxWidth;
  beginShape();
  vertex(startDist, -baseW / 2);
  bezierVertex(
    startDist + len * 0.6, -tipW / 2,
    endDist - len * 0.1, -tipW / 2,
    endDist, 0
  );
  bezierVertex(
    endDist - len * 0.1, tipW / 2,
    startDist + len * 0.6, tipW / 2,
    startDist, baseW / 2
  );
  endShape(CLOSE);
}
