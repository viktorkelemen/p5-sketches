// Binary Rain - Lo-fi Matrix-style visualization
// Falling binary digits with phosphor glow effect

let streams = [];
let charSize = 16;
let columns;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Courier New');
  textSize(charSize);
  textAlign(CENTER, CENTER);

  columns = floor(width / charSize);

  // Initialize streams
  for (let i = 0; i < columns; i++) {
    streams.push(new Stream(i * charSize + charSize / 2));
  }
}

function draw() {
  // Fade effect for trails
  background(0, 0, 0, 25);

  // Update and draw all streams
  for (let stream of streams) {
    stream.update();
    stream.draw();
  }

  // Scanline effect
  drawScanlines();

  // CRT vignette
  drawVignette();
}

class Stream {
  constructor(x) {
    this.x = x;
    this.chars = [];
    this.speed = random(2, 8);
    this.length = floor(random(8, 25));
    this.y = random(-500, 0);
    this.spawnTimer = 0;
    this.spawnDelay = floor(random(1, 5));
  }

  update() {
    // Move existing characters down
    for (let char of this.chars) {
      char.y += this.speed;
      char.age++;

      // Randomly change the character (glitch effect)
      if (random() < 0.03) {
        char.value = random() < 0.5 ? '0' : '1';
      }
    }

    // Spawn new characters
    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnDelay) {
      this.spawnTimer = 0;
      this.chars.push({
        y: this.y,
        value: random() < 0.5 ? '0' : '1',
        age: 0
      });
      this.y += charSize;
    }

    // Remove old characters
    this.chars = this.chars.filter(c => c.y < height + 50 && c.age < 100);

    // Reset stream if all characters are gone
    if (this.chars.length === 0) {
      this.y = random(-200, -50);
      this.speed = random(2, 8);
      this.length = floor(random(8, 25));
    }
  }

  draw() {
    for (let i = 0; i < this.chars.length; i++) {
      let char = this.chars[i];
      let isHead = i === this.chars.length - 1;

      // Calculate fade based on position in stream
      let fadeFromHead = map(i, 0, this.chars.length - 1, 0.1, 1);
      let fadeFromAge = map(char.age, 0, 100, 1, 0);
      let alpha = fadeFromHead * fadeFromAge;

      if (isHead) {
        // Bright white head with glow
        for (let g = 3; g > 0; g--) {
          fill(180, 255, 180, 30 * alpha);
          text(char.value, this.x, char.y);
        }
        fill(255, 255, 255, 255 * alpha);
      } else {
        // Green phosphor body
        let green = map(fadeFromHead, 0, 1, 80, 200);
        fill(0, green, 0, 200 * alpha);
      }

      text(char.value, this.x, char.y);
    }
  }
}

function drawScanlines() {
  // Horizontal scanlines for CRT effect
  noStroke();
  for (let y = 0; y < height; y += 3) {
    fill(0, 0, 0, 30);
    rect(0, y, width, 1);
  }
}

function drawVignette() {
  // Dark corners vignette effect
  let gradient = drawingContext.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, max(width, height) * 0.7
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');

  drawingContext.fillStyle = gradient;
  drawingContext.fillRect(0, 0, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  columns = floor(width / charSize);

  // Adjust streams for new width
  while (streams.length < columns) {
    streams.push(new Stream(streams.length * charSize + charSize / 2));
  }
  while (streams.length > columns) {
    streams.pop();
  }

  // Update x positions
  for (let i = 0; i < streams.length; i++) {
    streams[i].x = i * charSize + charSize / 2;
  }
}

function mousePressed() {
  // Create burst of characters at mouse position
  let col = floor(mouseX / charSize);
  if (col >= 0 && col < streams.length) {
    streams[col].y = mouseY;
    streams[col].speed = random(8, 15);
  }
}
