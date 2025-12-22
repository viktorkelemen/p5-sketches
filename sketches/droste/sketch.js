// Droste Effect - WebGL Version
// Infinite recursive zoom using complex logarithm
// exp(log(z) + i*theta) creates recursive spiral zoom

let drosteShader;
let time = 0;
let spiralAngle = 0.15;
let zoomSpeed = 0.3;
let branches = 1;

const vertShader = `
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  varying vec2 vTexCoord;

  void main() {
    vTexCoord = aTexCoord;
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    gl_Position = positionVec4;
  }
`;

const fragShader = `
  precision highp float;

  varying vec2 vTexCoord;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_spiralAngle;
  uniform float u_zoomSpeed;
  uniform float u_branches;

  #define PI 3.14159265359
  #define TWO_PI 6.28318530718

  // HSB to RGB conversion
  vec3 hsb2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb); // Cubic smoothing
    return c.z * mix(vec3(1.0), rgb, c.y);
  }

  void main() {
    // Center and scale coordinates
    vec2 uv = vTexCoord - 0.5;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;
    uv *= 4.0; // Scale factor

    // Convert to polar
    float r = length(uv);
    float theta = atan(uv.y, uv.x);

    // Handle center singularity
    if (r < 0.001) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    // Droste transformation parameters
    float logZoom = u_time * u_zoomSpeed;

    // Apply Droste transformation
    // z' = exp(log(z) + i*spiralAngle*log(|z|))
    float logR = log(r);
    float newLogR = logR + logZoom;
    float newTheta = theta + u_spiralAngle * logR + u_time * 0.5;

    // Wrap logR to create repetition
    float period = TWO_PI / abs(u_spiralAngle);
    newLogR = mod(mod(newLogR, period) + period, period);

    // Convert back to Cartesian
    float newR = exp(newLogR);
    float branchedTheta = newTheta * u_branches;
    float newX = newR * cos(branchedTheta);
    float newY = newR * sin(branchedTheta);

    // Create pattern
    float gridSize = 0.5;
    float gx = floor(newX / gridSize);
    float gy = floor(newY / gridSize);

    // Fractional position within cell
    float fx = (newX / gridSize) - gx;
    float fy = (newY / gridSize) - gy;

    // Distance from cell center
    float dx = fx - 0.5;
    float dy = fy - 0.5;
    float distFromCenter = sqrt(dx * dx + dy * dy);

    // Base hue from angle
    float hue = mod(newTheta * 180.0 / PI + 180.0, 360.0) / 360.0;

    // Ring pattern and checker
    float ringPattern = sin(newR * 8.0) * 0.5 + 0.5;
    float checker = mod(gx + gy, 2.0) < 1.0 ? 1.0 : 0.0;

    // Brightness calculation
    float bri;
    if (distFromCenter < 0.3) {
      bri = 0.8 + ringPattern * 0.2;
    } else {
      bri = 0.3 + checker * 0.4 + ringPattern * 0.2;
    }

    // Radial gradient fade
    float radialFade = mix(1.0, 0.3, clamp(log(newR + 1.0) / 3.0, 0.0, 1.0));
    bri *= radialFade;

    // Saturation varies with pattern
    float sat = 0.6 + ringPattern * 0.3;

    vec3 col = hsb2rgb(vec3(hue, sat, clamp(bri, 0.0, 1.0)));

    gl_FragColor = vec4(col, 1.0);
  }
`;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  // Create shader from strings
  drosteShader = createShader(vertShader, fragShader);
}

function draw() {
  shader(drosteShader);

  // Pass uniforms to shader
  drosteShader.setUniform('u_resolution', [width, height]);
  drosteShader.setUniform('u_time', time);
  drosteShader.setUniform('u_spiralAngle', spiralAngle);
  drosteShader.setUniform('u_zoomSpeed', zoomSpeed);
  drosteShader.setUniform('u_branches', branches);

  // Draw a quad that fills the screen
  quad(-1, -1, 1, -1, 1, 1, -1, 1);

  time += deltaTime / 1000;

  // Reset shader to draw text
  resetShader();

  // Info overlay
  push();
  translate(-width / 2, -height / 2);
  fill(230);
  noStroke();
  textSize(14);
  textFont('monospace');
  text("Droste Effect (WebGL) | Click to change pattern", 10, 25);
  text("Arrow keys: adjust spiral | R: reset", 10, 45);
  pop();
}

function mousePressed() {
  branches = (branches % 3) + 1;
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    spiralAngle += 0.02;
  } else if (keyCode === DOWN_ARROW) {
    spiralAngle -= 0.02;
  } else if (keyCode === LEFT_ARROW) {
    zoomSpeed -= 0.1;
  } else if (keyCode === RIGHT_ARROW) {
    zoomSpeed += 0.1;
  } else if (key === 'r' || key === 'R') {
    spiralAngle = 0.15;
    zoomSpeed = 0.3;
    branches = 1;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
