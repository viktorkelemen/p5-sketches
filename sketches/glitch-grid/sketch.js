// Glitch Grid - Lo-fi data corruption visualization
// Binary data stream with glitch artifacts and pixel sorting

let grid = [];
let cellSize = 8;
let cols, rows;
let time = 0;
let glitchLines = [];
let corruptionZones = [];
let dataStream = '';

// Glitch characters
const glitchChars = '01█▓▒░╔╗╚╝║═╬┼├┤┬┴▲▼◄►●○■□';

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Courier New');
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();

  cols = floor(width / cellSize);
  rows = floor(height / cellSize);

  // Initialize grid with binary data
  initGrid();

  // Generate initial data stream
  generateDataStream();
}

function initGrid() {
  grid = [];
  for (let y = 0; y < rows; y++) {
    let row = [];
    for (let x = 0; x < cols; x++) {
      row.push({
        value: random() < 0.5 ? 0 : 1,
        corrupted: false,
        hue: random(180, 220),
        brightness: random(20, 60),
        char: random() < 0.5 ? '0' : '1',
        glitchTimer: 0
      });
    }
    grid.push(row);
  }
}

function generateDataStream() {
  dataStream = '';
  for (let i = 0; i < cols * 3; i++) {
    dataStream += random() < 0.5 ? '0' : '1';
    if (random() < 0.1) dataStream += ' ';
  }
}

function draw() {
  background(0, 0, 5);
  time += deltaTime / 1000;

  // Update glitch effects
  updateGlitches();

  // Draw the grid
  drawGrid();

  // Draw glitch lines
  drawGlitchLines();

  // Draw data stream at bottom
  drawDataStream();

  // Draw corruption zones
  drawCorruptionZones();

  // Occasional screen tear
  if (random() < 0.02) {
    screenTear();
  }

  // Scanlines
  drawScanlines();

  // Random glitch trigger
  if (random() < 0.05) {
    triggerGlitch();
  }
}

function updateGlitches() {
  // Decay glitch timers
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let cell = grid[y][x];
      if (cell.glitchTimer > 0) {
        cell.glitchTimer -= deltaTime / 1000;
        if (cell.glitchTimer <= 0) {
          cell.corrupted = false;
          cell.char = cell.value === 0 ? '0' : '1';
        }
      }
    }
  }

  // Update corruption zones
  corruptionZones = corruptionZones.filter(z => {
    z.life -= deltaTime / 1000;
    z.radius += 0.5;
    return z.life > 0;
  });

  // Update glitch lines
  glitchLines = glitchLines.filter(l => {
    l.life -= deltaTime / 1000;
    return l.life > 0;
  });
}

function drawGrid() {
  textSize(cellSize);
  textAlign(CENTER, CENTER);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let cell = grid[y][x];
      let px = x * cellSize + cellSize / 2;
      let py = y * cellSize + cellSize / 2;

      // Check if in corruption zone
      let inCorruption = false;
      for (let zone of corruptionZones) {
        if (dist(px, py, zone.x, zone.y) < zone.radius) {
          inCorruption = true;
          break;
        }
      }

      if (cell.corrupted || inCorruption) {
        // Glitched cell
        let glitchHue = random() < 0.5 ? 0 : random(280, 320); // Red or magenta
        let flicker = random() < 0.3;
        if (flicker) {
          fill(glitchHue, 100, 100, 90);
        } else {
          fill(glitchHue, 80, 80, 70);
        }

        // Random glitch character
        if (random() < 0.1 || inCorruption) {
          cell.char = glitchChars.charAt(floor(random(glitchChars.length)));
        }
      } else {
        // Normal cell - subtle blue/cyan palette
        let wave = sin(x * 0.1 + y * 0.05 + time) * 0.5 + 0.5;
        let bright = cell.brightness + wave * 20;
        fill(cell.hue, 50, bright, 60);
      }

      text(cell.char, px, py);
    }
  }
}

function drawGlitchLines() {
  for (let line of glitchLines) {
    let alpha = map(line.life, 0, line.maxLife, 0, 100);

    // Horizontal displacement
    push();
    fill(0, 100, 100, alpha);
    noStroke();

    let offset = sin(time * 50) * line.intensity * 20;
    rect(line.x + offset, line.y, line.width, line.height);

    // RGB split effect
    fill(180, 100, 100, alpha * 0.5);
    rect(line.x + offset - 3, line.y, line.width, line.height);

    fill(300, 100, 100, alpha * 0.5);
    rect(line.x + offset + 3, line.y, line.width, line.height);
    pop();
  }
}

function drawDataStream() {
  // Scrolling binary at bottom
  let streamY = height - 20;
  textSize(10);
  textAlign(LEFT, CENTER);

  let offset = (time * 100) % (dataStream.length * 6);

  for (let i = 0; i < dataStream.length; i++) {
    let x = i * 6 - offset;
    if (x > -10 && x < width + 10) {
      let char = dataStream.charAt(i);
      let flicker = random() < 0.02;

      if (flicker) {
        fill(0, 100, 100); // Red glitch
      } else {
        fill(120, 60, 60, 80); // Green data
      }
      text(char, x, streamY);
    }
  }

  // Regenerate stream occasionally
  if (random() < 0.005) {
    generateDataStream();
  }
}

function drawCorruptionZones() {
  for (let zone of corruptionZones) {
    let alpha = map(zone.life, 0, zone.maxLife, 0, 30);
    noFill();
    stroke(zone.hue, 80, 80, alpha);
    strokeWeight(2);
    circle(zone.x, zone.y, zone.radius * 2);
    strokeWeight(1);
    circle(zone.x, zone.y, zone.radius * 1.5);
    noStroke();
  }
}

function screenTear() {
  // Horizontal screen tear effect
  let y = random(height);
  let tearHeight = random(5, 30);
  let offset = random(-20, 20);

  push();
  let section = get(0, y, width, tearHeight);
  image(section, offset, y);
  pop();
}

function drawScanlines() {
  for (let y = 0; y < height; y += 2) {
    fill(0, 0, 0, 20);
    rect(0, y, width, 1);
  }
}

function triggerGlitch() {
  // Random glitch type
  let type = floor(random(4));

  switch(type) {
    case 0:
      // Corrupt a row
      let row = floor(random(rows));
      for (let x = 0; x < cols; x++) {
        if (random() < 0.3) {
          grid[row][x].corrupted = true;
          grid[row][x].glitchTimer = random(0.2, 0.8);
          grid[row][x].char = glitchChars.charAt(floor(random(glitchChars.length)));
        }
      }
      break;

    case 1:
      // Corrupt a column
      let col = floor(random(cols));
      for (let y = 0; y < rows; y++) {
        if (random() < 0.3) {
          grid[y][col].corrupted = true;
          grid[y][col].glitchTimer = random(0.2, 0.8);
          grid[y][col].char = glitchChars.charAt(floor(random(glitchChars.length)));
        }
      }
      break;

    case 2:
      // Add glitch line
      glitchLines.push({
        x: 0,
        y: random(height),
        width: width,
        height: random(2, 10),
        intensity: random(0.5, 2),
        life: random(0.1, 0.4),
        maxLife: random(0.1, 0.4)
      });
      break;

    case 3:
      // Add corruption zone
      corruptionZones.push({
        x: random(width),
        y: random(height),
        radius: random(20, 50),
        hue: random([0, 280, 320]),
        life: random(0.5, 1.5),
        maxLife: random(0.5, 1.5)
      });
      break;
  }
}

function mousePressed() {
  // Create corruption zone at mouse
  corruptionZones.push({
    x: mouseX,
    y: mouseY,
    radius: 10,
    hue: random([0, 180, 280]),
    life: 2,
    maxLife: 2
  });

  // Corrupt nearby cells
  let cx = floor(mouseX / cellSize);
  let cy = floor(mouseY / cellSize);
  let radius = 5;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      let x = cx + dx;
      let y = cy + dy;
      if (x >= 0 && x < cols && y >= 0 && y < rows) {
        if (random() < 0.6) {
          grid[y][x].corrupted = true;
          grid[y][x].glitchTimer = random(0.5, 2);
          grid[y][x].char = glitchChars.charAt(floor(random(glitchChars.length)));
        }
      }
    }
  }
}

function keyPressed() {
  if (key === ' ') {
    // Major glitch event
    for (let i = 0; i < 10; i++) {
      triggerGlitch();
    }
  } else if (key === 'r' || key === 'R') {
    // Reset grid
    initGrid();
    corruptionZones = [];
    glitchLines = [];
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);
  initGrid();
}
