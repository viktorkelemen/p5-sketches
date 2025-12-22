// Synesthesia Bloom
// An audio-reactive garden where sound becomes visible growth

let mic;
let fft;
let started = false;

// Element arrays - persistent accumulation
let roots = [];
let stems = [];
let leaves = [];
let blooms = [];
let pollen = [];

// Frequency band energies (smoothed)
let bassEnergy = 0;
let lowMidEnergy = 0;
let midEnergy = 0;
let highMidEnergy = 0;
let trebleEnergy = 0;

// Timing
let time = 0;

// Spawn points for stems (spread across ground)
let spawnPoints = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

  // Initialize FFT
  fft = new p5.FFT(0.8, 512);

  // Create spawn points along the ground
  for (let i = 0; i < 12; i++) {
    spawnPoints.push({
      x: map(i, 0, 11, width * 0.1, width * 0.9),
      lastStem: 0
    });
  }

  // Start with black canvas
  background(0);
}

function startAudio() {
  let overlay = document.getElementById('start-overlay');
  let statusText = overlay.querySelector('.pulse');
  statusText.textContent = 'Requesting microphone access...';

  userStartAudio()
    .then(() => {
      mic = new p5.AudioIn();
      mic.start(
        () => {
          fft.setInput(mic);
          started = true;
          overlay.style.display = 'none';
        },
        (err) => {
          console.error('Mic start error:', err);
          statusText.textContent = 'Microphone access denied. Please refresh and allow access.';
          statusText.style.color = '#ff6b6b';
        }
      );
    })
    .catch((err) => {
      console.error('Audio context error:', err);
      statusText.textContent = 'Audio initialization failed. Please refresh and try again.';
      statusText.style.color = '#ff6b6b';
    });
}

function mousePressed() {
  if (!started) {
    startAudio();
  }
}

function draw() {
  if (!started) {
    return;
  }

  time += deltaTime / 1000;

  // Semi-transparent overlay for persistence/trails
  noStroke();
  fill(0, 0, 0, 2);
  rect(0, 0, width, height);

  // Analyze frequency bands
  analyzeAudio();

  // Spawn new elements based on audio
  spawnElements();

  // Update and draw all elements (back to front)
  updateAndDrawRoots();
  updateAndDrawStems();
  updateAndDrawLeaves();
  updateAndDrawBlooms();
  updateAndDrawPollen();

  // Cleanup old elements
  cleanupElements();
}

function analyzeAudio() {
  fft.analyze();

  // Get energy from different frequency bands
  // Smooth the values for less jittery visuals
  let smoothing = 0.3;

  bassEnergy = lerp(bassEnergy, fft.getEnergy("bass") / 255, smoothing);
  lowMidEnergy = lerp(lowMidEnergy, fft.getEnergy("lowMid") / 255, smoothing);
  midEnergy = lerp(midEnergy, fft.getEnergy("mid") / 255, smoothing);
  highMidEnergy = lerp(highMidEnergy, fft.getEnergy("highMid") / 255, smoothing);
  trebleEnergy = lerp(trebleEnergy, fft.getEnergy("treble") / 255, smoothing);
}

// ============ SPAWNING ============

function spawnElements() {
  // Roots - spawn on strong bass
  if (bassEnergy > 0.3 && random() < bassEnergy * 0.4) {
    spawnRoot();
  }

  // Stems - grow from spawn points on low-mid energy
  if (lowMidEnergy > 0.25 && random() < lowMidEnergy * 0.3) {
    spawnStem();
  }

  // Leaves - spawn along existing stems on mid energy
  if (midEnergy > 0.2 && random() < midEnergy * 0.5 && stems.length > 0) {
    spawnLeaf();
  }

  // Blooms - spawn at stem tips on high-mid energy
  if (highMidEnergy > 0.25 && random() < highMidEnergy * 0.4 && stems.length > 0) {
    spawnBloom();
  }

  // Pollen - constant stream on treble, more with intensity
  let pollenCount = floor(trebleEnergy * 8);
  for (let i = 0; i < pollenCount; i++) {
    spawnPollen();
  }
}

function spawnRoot() {
  let x = random(width * 0.05, width * 0.95);
  let groundY = height - random(20, 80);

  roots.push({
    x: x,
    y: groundY,
    radius: 0,
    maxRadius: random(50, 200) * (0.5 + bassEnergy),
    speed: random(1, 3),
    hue: random(340, 380) % 360, // Crimsons, reds, some into orange
    sat: random(60, 90),
    birth: time,
    life: 1
  });
}

function spawnStem() {
  // Pick a spawn point
  let sp = random(spawnPoints);

  // Don't spawn too many from same point too quickly
  if (time - sp.lastStem < 0.5) return;
  sp.lastStem = time;

  let x = sp.x + random(-30, 30);
  let groundY = height - random(10, 40);

  stems.push({
    x: x,
    baseY: groundY,
    points: [{x: x, y: groundY}],
    targetHeight: random(height * 0.3, height * 0.75),
    growthSpeed: random(1, 3),
    curve: random(-0.3, 0.3),
    noiseOffset: random(1000),
    hue: random(150, 180), // Teals, deep greens
    sat: random(50, 80),
    thickness: random(2, 5),
    birth: time,
    life: 1,
    growing: true
  });
}

function spawnLeaf() {
  let stem = random(stems);
  if (stem.points.length < 3) return;

  // Pick a point along the stem
  let idx = floor(random(1, stem.points.length - 1));
  let pt = stem.points[idx];

  let side = random() > 0.5 ? 1 : -1;
  let angle = side * random(PI/6, PI/3);

  leaves.push({
    x: pt.x,
    y: pt.y,
    angle: angle + (side > 0 ? 0 : PI),
    size: 0,
    maxSize: random(15, 45) * (0.5 + midEnergy),
    growthSpeed: random(0.5, 2),
    hue: random(70, 130), // Lime to yellow-greens
    sat: random(60, 90),
    shape: floor(random(3)), // 0: arc, 1: crescent, 2: angular
    birth: time,
    life: 1
  });
}

function spawnBloom() {
  let stem = random(stems);
  if (stem.points.length < 2) return;

  // Spawn at or near the top of the stem
  let pt = stem.points[stem.points.length - 1];

  let petalCount = floor(random(5, 12));
  let petalLengths = [];
  for (let i = 0; i < petalCount; i++) {
    petalLengths.push(random(0.7, 1));
  }

  blooms.push({
    x: pt.x + random(-10, 10),
    y: pt.y + random(-20, 10),
    radius: 0,
    maxRadius: random(20, 60) * (0.5 + highMidEnergy),
    petalCount: petalCount,
    petalLengths: petalLengths,
    rotation: random(TWO_PI),
    rotationSpeed: random(-0.02, 0.02),
    hue: random(300, 350), // Magentas, hot pinks
    sat: random(70, 100),
    birth: time,
    life: 1,
    style: floor(random(3)) // 0: radial lines, 1: circles, 2: geometric
  });
}

function spawnPollen() {
  // Spawn from blooms or random upper area
  let x, y;

  if (blooms.length > 0 && random() > 0.3) {
    let bloom = random(blooms);
    x = bloom.x + random(-bloom.radius, bloom.radius);
    y = bloom.y + random(-bloom.radius, bloom.radius);
  } else {
    x = random(width);
    y = random(height * 0.3, height * 0.7);
  }

  pollen.push({
    x: x,
    y: y,
    vx: random(-0.5, 0.5),
    vy: random(-1.5, -0.3),
    size: random(1, 4),
    hue: random() > 0.5 ? random(40, 60) : random(170, 190), // Golds or pale cyans
    sat: random(20, 50),
    bright: random(80, 100),
    birth: time,
    life: 1
  });
}

// ============ UPDATE AND DRAW ============

function updateAndDrawRoots() {
  for (let root of roots) {
    // Grow outward
    if (root.radius < root.maxRadius) {
      root.radius += root.speed * (0.5 + bassEnergy);
    }

    // Fade over time
    let age = time - root.birth;
    if (age > 8) {
      root.life -= 0.005;
    }

    // Draw concentric ripples
    push();
    translate(root.x, root.y);
    noFill();

    let rings = 4;
    for (let i = 0; i < rings; i++) {
      let r = root.radius * (i + 1) / rings;
      let alpha = map(i, 0, rings - 1, 40, 10) * root.life;
      alpha *= map(root.radius, 0, root.maxRadius, 1, 0.3);

      stroke(root.hue, root.sat, 60, alpha);
      strokeWeight(2 + bassEnergy * 3);

      // Wavy circle
      beginShape();
      for (let a = 0; a < TWO_PI; a += 0.1) {
        let wave = sin(a * 6 + time * 2) * 5 * bassEnergy;
        let px = cos(a) * (r + wave);
        let py = sin(a) * (r * 0.3 + wave * 0.3); // Flatten vertically
        vertex(px, py);
      }
      endShape(CLOSE);
    }
    pop();
  }
}

function updateAndDrawStems() {
  for (let stem of stems) {
    // Grow upward
    if (stem.growing) {
      let tip = stem.points[stem.points.length - 1];

      if (tip.y > height - stem.targetHeight) {
        let growAmount = stem.growthSpeed * (0.5 + lowMidEnergy * 2);
        let noiseVal = noise(stem.noiseOffset + time * 0.5);
        let curve = (noiseVal - 0.5) * 60 + stem.curve * 20;

        stem.points.push({
          x: tip.x + curve * 0.1,
          y: tip.y - growAmount
        });

        if (stem.points.length > 200) {
          stem.growing = false;
        }
      } else {
        stem.growing = false;
      }
    }

    // Fade over time
    let age = time - stem.birth;
    if (age > 15) {
      stem.life -= 0.002;
    }

    // Draw the stem as a flowing curve
    if (stem.points.length > 1) {
      noFill();
      stroke(stem.hue, stem.sat, 50, 60 * stem.life);
      strokeWeight(stem.thickness);

      beginShape();
      // Duplicate first point for proper curve start
      curveVertex(stem.points[0].x, stem.points[0].y);
      for (let pt of stem.points) {
        curveVertex(pt.x, pt.y);
      }
      // Duplicate last point for proper curve end
      let last = stem.points[stem.points.length - 1];
      curveVertex(last.x, last.y);
      endShape();

      // Glow effect
      stroke(stem.hue, stem.sat * 0.5, 70, 20 * stem.life);
      strokeWeight(stem.thickness + 4);

      beginShape();
      curveVertex(stem.points[0].x, stem.points[0].y);
      for (let pt of stem.points) {
        curveVertex(pt.x, pt.y);
      }
      curveVertex(last.x, last.y);
      endShape();
    }
  }
}

function updateAndDrawLeaves() {
  for (let leaf of leaves) {
    // Grow
    if (leaf.size < leaf.maxSize) {
      leaf.size += leaf.growthSpeed * (0.5 + midEnergy);
    }

    // Fade
    let age = time - leaf.birth;
    if (age > 12) {
      leaf.life -= 0.003;
    }

    push();
    translate(leaf.x, leaf.y);
    rotate(leaf.angle);

    let alpha = 50 * leaf.life;
    noStroke();

    if (leaf.shape === 0) {
      // Arc shape
      fill(leaf.hue, leaf.sat, 60, alpha);
      arc(leaf.size / 2, 0, leaf.size, leaf.size * 0.6, -PI/3, PI/3, PIE);
    } else if (leaf.shape === 1) {
      // Crescent - draw as a proper crescent shape
      fill(leaf.hue, leaf.sat, 55, alpha);
      beginShape();
      // Outer arc
      for (let a = -PI/2; a <= PI/2; a += 0.1) {
        vertex(cos(a) * leaf.size * 0.5, sin(a) * leaf.size * 0.5);
      }
      // Inner arc (reverse direction)
      for (let a = PI/2; a >= -PI/2; a -= 0.1) {
        vertex(leaf.size * 0.15 + cos(a) * leaf.size * 0.35, sin(a) * leaf.size * 0.35);
      }
      endShape(CLOSE);
    } else {
      // Angular/triangular
      fill(leaf.hue, leaf.sat, 65, alpha);
      triangle(0, 0, leaf.size, -leaf.size * 0.3, leaf.size, leaf.size * 0.3);
    }

    pop();
  }
}

function updateAndDrawBlooms() {
  for (let bloom of blooms) {
    // Grow
    if (bloom.radius < bloom.maxRadius) {
      bloom.radius += 0.5 + highMidEnergy * 2;
    }

    // Rotate
    bloom.rotation += bloom.rotationSpeed;

    // Pulse with audio
    let pulse = 1 + highMidEnergy * 0.3;

    // Fade
    let age = time - bloom.birth;
    if (age > 10) {
      bloom.life -= 0.003;
    }

    push();
    translate(bloom.x, bloom.y);
    rotate(bloom.rotation);

    let alpha = 60 * bloom.life;
    let r = bloom.radius * pulse;

    if (bloom.style === 0) {
      // Radial lines
      stroke(bloom.hue, bloom.sat, 70, alpha);
      strokeWeight(2);
      for (let i = 0; i < bloom.petalCount; i++) {
        let angle = (TWO_PI / bloom.petalCount) * i;
        let len = r * bloom.petalLengths[i];
        line(0, 0, cos(angle) * len, sin(angle) * len);
      }
      // Center glow
      noStroke();
      for (let g = 3; g > 0; g--) {
        fill(bloom.hue, bloom.sat * 0.5, 90, alpha * 0.3 / g);
        circle(0, 0, r * 0.3 * g);
      }
    } else if (bloom.style === 1) {
      // Circle clusters
      noStroke();
      for (let i = 0; i < bloom.petalCount; i++) {
        let angle = (TWO_PI / bloom.petalCount) * i;
        let dist = r * 0.6;
        fill(bloom.hue + i * 5, bloom.sat, 70, alpha * 0.7);
        circle(cos(angle) * dist, sin(angle) * dist, r * 0.4);
      }
      fill(bloom.hue, bloom.sat, 90, alpha);
      circle(0, 0, r * 0.25);
    } else {
      // Geometric flower
      noStroke();
      fill(bloom.hue, bloom.sat, 65, alpha * 0.6);
      beginShape();
      for (let i = 0; i < bloom.petalCount * 2; i++) {
        let angle = (TWO_PI / (bloom.petalCount * 2)) * i;
        let rad = i % 2 === 0 ? r : r * 0.4;
        vertex(cos(angle) * rad, sin(angle) * rad);
      }
      endShape(CLOSE);

      // Inner detail
      fill(bloom.hue + 20, bloom.sat * 0.7, 85, alpha);
      circle(0, 0, r * 0.2);
    }

    pop();
  }
}

function updateAndDrawPollen() {
  for (let p of pollen) {
    // Float upward with slight drift
    p.x += p.vx + sin(time * 3 + p.x * 0.01) * 0.3;
    p.y += p.vy;
    p.vx += random(-0.1, 0.1);
    p.vx = constrain(p.vx, -2, 2); // Clamp to prevent runaway drift

    // Fade
    let age = time - p.birth;
    if (age > 5) {
      p.life -= 0.01;
    }

    // Draw
    noStroke();
    let alpha = 70 * p.life * (0.5 + trebleEnergy);

    // Glow
    fill(p.hue, p.sat * 0.5, p.bright, alpha * 0.3);
    circle(p.x, p.y, p.size * 3);

    // Core
    fill(p.hue, p.sat, p.bright, alpha);
    circle(p.x, p.y, p.size);
  }
}

// ============ CLEANUP ============

function cleanupElements() {
  // Remove dead elements
  roots = roots.filter(r => r.life > 0);
  stems = stems.filter(s => s.life > 0);
  leaves = leaves.filter(l => l.life > 0);
  blooms = blooms.filter(b => b.life > 0);
  pollen = pollen.filter(p => p.life > 0 && p.y > -50);

  // Cap maximum elements for performance
  if (roots.length > 50) roots.splice(0, roots.length - 50);
  if (stems.length > 80) stems.splice(0, stems.length - 80);
  if (leaves.length > 200) leaves.splice(0, leaves.length - 200);
  if (blooms.length > 100) blooms.splice(0, blooms.length - 100);
  if (pollen.length > 500) pollen.splice(0, pollen.length - 500);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);

  // Recreate spawn points
  spawnPoints = [];
  for (let i = 0; i < 12; i++) {
    spawnPoints.push({
      x: map(i, 0, 11, width * 0.1, width * 0.9),
      lastStem: 0
    });
  }
}
