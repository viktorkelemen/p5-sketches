// Burning Ship Fractal - Perturbation Theory for Infinite Zoom

let theShader;
let time = 0;
let autoZoom = true;
let zoomSpeed = 0.012;

// Arbitrary precision center and zoom (using Decimal.js)
let centerX, centerY, zoomLevel;
let targetX, targetY;

// Reference orbit storage
let refOrbitReal = [];
let refOrbitImag = [];
let refOrbitLen = 0;
const MAX_REF_ITER = 2000;

// Precision management
let currentPrecision = 50;

let hudDiv;

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

// Perturbation theory shader for Burning Ship
const fragShader = `
precision highp float;

varying vec2 vTexCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform int u_maxIter;
uniform int u_refLen;

// Pixel delta from center (in world coords, as double-float)
uniform vec2 u_pixelScale_hi;
uniform vec2 u_pixelScale_lo;

// Reference orbit (stored as hi/lo pairs for double-float precision)
// Limited to 100 to stay within WebGL uniform limits
uniform vec2 u_refReal[100];  // [i].x = hi, [i].y = lo
uniform vec2 u_refImag[100];

// ============================================
// Double-float arithmetic (for delta calculations)
// ============================================

vec2 quickTwoSum(float a, float b) {
  float s = a + b;
  float e = b - (s - a);
  return vec2(s, e);
}

vec2 twoSum(float a, float b) {
  float s = a + b;
  float v = s - a;
  float e = (a - (s - v)) + (b - v);
  return vec2(s, e);
}

vec2 twoProduct(float a, float b) {
  float p = a * b;
  float c = 4097.0 * a;
  float ah = c - (c - a);
  float al = a - ah;
  float d = 4097.0 * b;
  float bh = d - (d - b);
  float bl = b - bh;
  float e = ((ah * bh - p) + ah * bl + al * bh) + al * bl;
  return vec2(p, e);
}

vec2 df_add(vec2 a, vec2 b) {
  vec2 s = twoSum(a.x, b.x);
  vec2 t = twoSum(a.y, b.y);
  s.y += t.x;
  s = quickTwoSum(s.x, s.y);
  s.y += t.y;
  return quickTwoSum(s.x, s.y);
}

vec2 df_sub(vec2 a, vec2 b) {
  return df_add(a, vec2(-b.x, -b.y));
}

vec2 df_mul(vec2 a, vec2 b) {
  vec2 p = twoProduct(a.x, b.x);
  p.y += a.x * b.y + a.y * b.x;
  return quickTwoSum(p.x, p.y);
}

vec2 df_mul_f(vec2 a, float b) {
  vec2 p = twoProduct(a.x, b);
  p.y += a.y * b;
  return quickTwoSum(p.x, p.y);
}

vec2 df_set(float a) {
  return vec2(a, 0.0);
}

float df_to_float(vec2 a) {
  return a.x + a.y;
}

// ============================================
// Color palette
// ============================================

const int NUM_COLORS = 12;

vec3 getJapaneseColor(int index) {
  if (index == 0) return vec3(0.96, 0.79, 0.78);
  if (index == 1) return vec3(0.94, 0.36, 0.42);
  if (index == 2) return vec3(0.88, 0.07, 0.37);
  if (index == 3) return vec3(0.87, 0.55, 0.14);
  if (index == 4) return vec3(0.97, 0.84, 0.10);
  if (index == 5) return vec3(0.79, 0.69, 0.22);
  if (index == 6) return vec3(0.71, 0.83, 0.42);
  if (index == 7) return vec3(0.57, 0.82, 0.31);
  if (index == 8) return vec3(0.70, 0.85, 0.87);
  if (index == 9) return vec3(0.44, 0.55, 0.70);
  if (index == 10) return vec3(0.34, 0.27, 0.49);
  if (index == 11) return vec3(0.60, 0.33, 0.60);
  return vec3(0.0);
}

vec3 getColor(float t) {
  float idx = mod(t * float(NUM_COLORS), float(NUM_COLORS));
  int i0 = int(floor(idx));
  int i1 = int(mod(float(i0 + 1), float(NUM_COLORS)));
  float f = fract(idx);
  f = f * f * (3.0 - 2.0 * f);
  return mix(getJapaneseColor(i0), getJapaneseColor(i1), f);
}

// ============================================
// Burning Ship Perturbation Iteration
// ============================================

void main() {
  float aspect = u_resolution.x / u_resolution.y;

  // Pixel offset from center in normalized coords
  float px = (vTexCoord.x - 0.5) * aspect;
  float py = (vTexCoord.y - 0.5);

  // Delta c (difference from reference point) as double-float
  // dc = pixel_offset * scale
  vec2 dcReal = df_mul_f(vec2(u_pixelScale_hi.x, u_pixelScale_lo.x), px);
  vec2 dcImag = df_mul_f(vec2(u_pixelScale_hi.y, u_pixelScale_lo.y), py);

  // Delta z starts at (0, 0)
  vec2 dzReal = df_set(0.0);
  vec2 dzImag = df_set(0.0);

  int iteration = 0;
  bool escaped = false;
  bool glitched = false;

  // Store last reference values for final color calculation
  vec2 lastZr = df_set(0.0);
  vec2 lastZi = df_set(0.0);

  // Perturbation iteration
  // For Burning Ship: z_{n+1} = (|Re(z_n)| + i|Im(z_n)|)^2 + c
  // Where z_n = Z_n + dz_n (reference + perturbation)

  for (int i = 0; i < 100; i++) {
    if (i >= u_refLen || i >= u_maxIter) break;

    // Get reference orbit values (as double-float)
    vec2 Zr = u_refReal[i];
    vec2 Zi = u_refImag[i];
    lastZr = Zr;
    lastZi = Zi;

    // Compute z = Z + dz
    vec2 zReal = df_add(Zr, dzReal);
    vec2 zImag = df_add(Zi, dzImag);

    // Check escape: |z|^2 > 4
    float zr = df_to_float(zReal);
    float zi = df_to_float(zImag);
    float r2 = zr * zr + zi * zi;

    if (r2 > 256.0) {
      escaped = true;
      break;
    }

    // Burning Ship: take absolute values
    float absZr = abs(zr);
    float absZi = abs(zi);

    // Signs for perturbation formula
    float sgnZr = zr >= 0.0 ? 1.0 : -1.0;
    float sgnZi = zi >= 0.0 ? 1.0 : -1.0;

    // Reference absolute values and signs
    float Zr_f = df_to_float(Zr);
    float Zi_f = df_to_float(Zi);
    float sgnRefR = Zr_f >= 0.0 ? 1.0 : -1.0;
    float sgnRefI = Zi_f >= 0.0 ? 1.0 : -1.0;

    // Glitch detection: sign change between z and Z
    if (sgnZr != sgnRefR || sgnZi != sgnRefI) {
      // Sign flip - use direct computation for this pixel
      glitched = true;
    }

    if (glitched) {
      // Fall back to direct iteration for glitched pixels
      // z = |zr| + i|zi|, then z^2 + c
      float newZr = absZr * absZr - absZi * absZi + df_to_float(dcReal);
      float newZi = 2.0 * absZr * absZi + df_to_float(dcImag);

      // For glitched pixels, just use current z values as delta
      // (simplified approach - avoids illegal array indexing)
      dzReal = df_set(newZr);
      dzImag = df_set(newZi);
    } else {
      // Perturbation formula for Burning Ship:
      // dz_{n+1} = 2 * |Z_n| * sign(Z_n) * dz_n + dz_n^2 + dc
      // (with appropriate handling for real and imaginary parts)

      float absRefR = abs(Zr_f);
      float absRefI = abs(Zi_f);

      // dzReal_new = 2*|Zr|*sgnZr*dzReal - 2*|Zi|*sgnZi*dzImag + dzReal^2 - dzImag^2 + dcReal
      vec2 term1 = df_mul_f(dzReal, 2.0 * absRefR * sgnRefR);
      vec2 term2 = df_mul_f(dzImag, 2.0 * absRefI * sgnRefI);
      vec2 dzR2 = df_mul(dzReal, dzReal);
      vec2 dzI2 = df_mul(dzImag, dzImag);

      vec2 newDzReal = df_add(df_sub(df_add(df_sub(term1, term2), dzR2), dzI2), dcReal);

      // dzImag_new = 2*|Zr|*sgnZi*dzImag + 2*|Zi|*sgnZr*dzReal + 2*sgnZr*sgnZi*dzReal*dzImag + dcImag
      vec2 term3 = df_mul_f(dzImag, 2.0 * absRefR * sgnRefI);
      vec2 term4 = df_mul_f(dzReal, 2.0 * absRefI * sgnRefR);
      vec2 term5 = df_mul_f(df_mul(dzReal, dzImag), 2.0 * sgnRefR * sgnRefI);

      vec2 newDzImag = df_add(df_add(df_add(term3, term4), term5), dcImag);

      dzReal = newDzReal;
      dzImag = newDzImag;
    }

    iteration++;
  }

  if (!escaped && iteration >= u_maxIter) {
    gl_FragColor = vec4(0.05, 0.05, 0.15, 1.0);
  } else if (!escaped) {
    gl_FragColor = vec4(0.05, 0.05, 0.15, 1.0);
  } else {
    // Use the last stored reference values
    vec2 zReal = df_add(lastZr, dzReal);
    vec2 zImag = df_add(lastZi, dzImag);
    float zr = df_to_float(zReal);
    float zi = df_to_float(zImag);
    float mag = sqrt(zr * zr + zi * zi);

    float t = float(iteration) * 0.1 + u_time * 0.02;

    vec3 color = getColor(t);
    gl_FragColor = vec4(color * 0.4, 0.6);
  }
}
`;

function setup() {
  // Configure Decimal.js for high precision
  Decimal.set({ precision: currentPrecision });

  // Initialize with arbitrary precision
  centerX = new Decimal('-0.5');
  centerY = new Decimal('-0.5');
  zoomLevel = new Decimal('1');
  targetX = new Decimal('-1.762');
  targetY = new Decimal('-0.028');

  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  theShader = createShader(vertShader, fragShader);

  hudDiv = createDiv('');
  hudDiv.position(10, 10);
  hudDiv.style('color', 'white');
  hudDiv.style('font-family', 'monospace');
  hudDiv.style('font-size', '14px');
  hudDiv.style('text-shadow', '1px 1px 2px black');
  hudDiv.style('pointer-events', 'none');

  // Initial reference orbit
  computeReferenceOrbit();
}

// Compute reference orbit at center using arbitrary precision
function computeReferenceOrbit() {
  // Increase precision based on zoom level
  let logZoom = Decimal.log10(zoomLevel).toNumber();
  currentPrecision = Math.max(50, Math.floor(logZoom * 1.5) + 30);
  Decimal.set({ precision: currentPrecision });

  let zr = new Decimal(0);
  let zi = new Decimal(0);
  let cr = centerX;
  let ci = centerY;

  refOrbitReal = [];
  refOrbitImag = [];

  let maxIter = Math.min(MAX_REF_ITER, Math.floor(100 + logZoom * 30));
  maxIter = Math.min(maxIter, 100); // Shader limit

  for (let i = 0; i < maxIter; i++) {
    // Store current position (as double-float pairs)
    let [rHi, rLo] = splitDouble(zr.toNumber());
    let [iHi, iLo] = splitDouble(zi.toNumber());
    refOrbitReal.push([rHi, rLo]);
    refOrbitImag.push([iHi, iLo]);

    // Check escape
    let r2 = zr.mul(zr).add(zi.mul(zi));
    if (r2.gt(256)) break;

    // Burning Ship iteration: z = (|Re(z)| + i|Im(z)|)^2 + c
    let absZr = zr.abs();
    let absZi = zi.abs();

    let newZr = absZr.mul(absZr).sub(absZi.mul(absZi)).add(cr);
    let newZi = absZr.mul(absZi).mul(2).add(ci);

    zr = newZr;
    zi = newZi;
  }

  refOrbitLen = refOrbitReal.length;
}

// Split a 64-bit JS float into two 32-bit floats (hi + lo)
function splitDouble(x) {
  let hi = Math.fround(x);
  let lo = x - hi;
  return [hi, lo];
}

function updateHUD() {
  let logZoom = Decimal.log10(zoomLevel).toNumber();
  let zoomStr = logZoom < 15 ? zoomLevel.toExponential(2) : '10^' + logZoom.toFixed(1);
  hudDiv.html('Zoom: ' + zoomStr + 'x | Precision: ' + currentPrecision + ' digits');
}

function draw() {
  if (autoZoom) {
    // Move center towards target (using Decimal arithmetic)
    let dx = targetX.sub(centerX);
    let dy = targetY.sub(centerY);
    centerX = centerX.add(dx.mul(0.02));
    centerY = centerY.add(dy.mul(0.02));

    // Zoom in
    zoomLevel = zoomLevel.mul(1.0 + zoomSpeed);

    // Recompute reference orbit periodically
    if (frameCount % 30 === 0) {
      computeReferenceOrbit();
    }
  }

  let logZoom = Decimal.log10(zoomLevel).toNumber();
  let maxIter = 100; // Limited by shader array size

  // Scale in world units
  let scale = new Decimal(2).div(zoomLevel);
  let [scaleHi, scaleLo] = splitDouble(scale.toNumber());

  // Flatten reference orbit for shader
  let refRealFlat = [];
  let refImagFlat = [];
  for (let i = 0; i < refOrbitLen; i++) {
    refRealFlat.push(refOrbitReal[i][0], refOrbitReal[i][1]);
    refImagFlat.push(refOrbitImag[i][0], refOrbitImag[i][1]);
  }
  // Pad to 100 elements (200 floats each)
  while (refRealFlat.length < 200) {
    refRealFlat.push(0, 0);
    refImagFlat.push(0, 0);
  }

  shader(theShader);
  theShader.setUniform('u_time', time);
  theShader.setUniform('u_resolution', [width, height]);
  theShader.setUniform('u_maxIter', maxIter);
  theShader.setUniform('u_refLen', refOrbitLen);
  theShader.setUniform('u_pixelScale_hi', [scaleHi, scaleHi]);
  theShader.setUniform('u_pixelScale_lo', [scaleLo, scaleLo]);
  theShader.setUniform('u_refReal', refRealFlat);
  theShader.setUniform('u_refImag', refImagFlat);

  rect(0, 0, width, height);
  updateHUD();

  let dt = min(deltaTime / 1000, 0.1);
  time += dt;
}

function mousePressed() {
  let scale = new Decimal(2).div(zoomLevel);
  let aspect = width / height;

  let dx = scale.mul((mouseX / width - 0.5) * aspect);
  let dy = scale.mul(mouseY / height - 0.5);

  targetX = centerX.add(dx);
  targetY = centerY.add(dy);
  autoZoom = true;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
