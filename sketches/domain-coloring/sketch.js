// Domain Coloring
// Visualize complex functions using color
// Hue = phase, Brightness = magnitude

let minX = -3;
let maxX = 3;
let minY = -3;
let maxY = 3;
let currentFunction = 0;
let time = 0;

let functionNames = [
  "z",
  "z^2",
  "z^3 - 1",
  "1/z",
  "sin(z)",
  "exp(z)",
  "z^z",
  "(z^2 - 1)(z - 2 - i)^2 / (z^2 + 2 + 2i)",
  "gamma approx",
  "Riemann zeta approx"
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  colorMode(HSB, 360, 100, 100);
  noLoop();
  drawDomainColoring();
}

// Complex number operations
function cAdd(a, b) {
  return { re: a.re + b.re, im: a.im + b.im };
}

function cSub(a, b) {
  return { re: a.re - b.re, im: a.im - b.im };
}

function cMul(a, b) {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re
  };
}

function cDiv(a, b) {
  let denom = b.re * b.re + b.im * b.im;
  // Handle division by zero - return infinity representation
  if (denom < 1e-20) {
    return { re: Infinity, im: Infinity };
  }
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom
  };
}

function cAbs(z) {
  return sqrt(z.re * z.re + z.im * z.im);
}

function cArg(z) {
  return atan2(z.im, z.re);
}

function cExp(z) {
  let r = exp(z.re);
  return { re: r * cos(z.im), im: r * sin(z.im) };
}

function cLog(z) {
  return { re: log(cAbs(z)), im: cArg(z) };
}

function cPow(z, w) {
  // z^w = exp(w * log(z))
  if (z.re === 0 && z.im === 0) return { re: 0, im: 0 };
  let logZ = cLog(z);
  let wLogZ = cMul(w, logZ);
  return cExp(wLogZ);
}

function cSin(z) {
  // sin(z) = (e^(iz) - e^(-iz)) / 2i
  let iz = { re: -z.im, im: z.re };
  let eiz = cExp(iz);
  let emiz = cExp({ re: z.im, im: -z.re });
  let diff = cSub(eiz, emiz);
  return cDiv(diff, { re: 0, im: 2 });
}

function cCos(z) {
  let iz = { re: -z.im, im: z.re };
  let eiz = cExp(iz);
  let emiz = cExp({ re: z.im, im: -z.re });
  let sum = cAdd(eiz, emiz);
  return { re: sum.re / 2, im: sum.im / 2 };
}

// Gamma function approximation (Stirling)
function cGamma(z) {
  // Use Lanczos approximation simplified
  if (z.re < 0.5) {
    // Reflection formula
    let oneMinusZ = cSub({ re: 1, im: 0 }, z);
    let sinPiZ = cSin(cMul({ re: PI, im: 0 }, z));
    let gamma1mz = cGamma(oneMinusZ);
    return cDiv({ re: PI, im: 0 }, cMul(sinPiZ, gamma1mz));
  }

  z = cSub(z, { re: 1, im: 0 });

  let g = 7;
  let c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

  let x = { re: c[0], im: 0 };
  for (let i = 1; i < g + 2; i++) {
    let denom = cAdd(z, { re: i, im: 0 });
    x = cAdd(x, cDiv({ re: c[i], im: 0 }, denom));
  }

  let t = cAdd(z, { re: g + 0.5, im: 0 });
  let sqrt2pi = sqrt(2 * PI);

  // (t^(z+0.5)) * e^(-t) * x * sqrt(2*pi)
  let pow1 = cPow(t, cAdd(z, { re: 0.5, im: 0 }));
  let expmt = cExp({ re: -t.re, im: -t.im });

  return cMul(cMul(cMul(pow1, expmt), x), { re: sqrt2pi, im: 0 });
}

// Riemann zeta approximation (direct sum for Re(s) > 1)
function cZeta(s) {
  let result = { re: 0, im: 0 };

  for (let n = 1; n <= 50; n++) {
    // n^(-s) = exp(-s * log(n))
    let term = cExp(cMul({ re: -s.re, im: -s.im }, { re: log(n), im: 0 }));
    result = cAdd(result, term);
  }

  return result;
}

function evaluateFunction(z) {
  switch (currentFunction) {
    case 0: // z
      return z;
    case 1: // z^2
      return cMul(z, z);
    case 2: // z^3 - 1
      return cSub(cMul(cMul(z, z), z), { re: 1, im: 0 });
    case 3: // 1/z
      return cDiv({ re: 1, im: 0 }, z);
    case 4: // sin(z)
      return cSin(z);
    case 5: // exp(z)
      return cExp(z);
    case 6: // z^z
      return cPow(z, z);
    case 7: // (z^2 - 1)(z - 2 - i)^2 / (z^2 + 2 + 2i)
      let z2 = cMul(z, z);
      let num1 = cSub(z2, { re: 1, im: 0 });
      let factor = cSub(z, { re: 2, im: 1 });
      let num2 = cMul(factor, factor);
      let num = cMul(num1, num2);
      let den = cAdd(z2, { re: 2, im: 2 });
      return cDiv(num, den);
    case 8: // Gamma function
      return cGamma(z);
    case 9: // Riemann zeta
      return cZeta(z);
    default:
      return z;
  }
}

function drawDomainColoring() {
  loadPixels();

  // Iterate py (height) in outer loop for better cache locality with row-major pixel buffer
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      let x = map(px, 0, width, minX, maxX);
      let y = map(py, 0, height, maxY, minY); // Flip y

      let z = { re: x, im: y };
      let w = evaluateFunction(z);

      // Get phase (hue) and magnitude (brightness)
      let phase = cArg(w);
      let mag = cAbs(w);

      // Map phase to hue (0 to 360)
      let hue = map(phase, -PI, PI, 0, 360);
      if (hue < 0) hue += 360;

      // Map magnitude to brightness with logarithmic scaling
      // Use contour lines for magnitude
      let logMag = log(mag + 1);
      let bri = 50 + 40 * (0.5 + 0.5 * cos(logMag * PI));

      // Add saturation variation for contours
      let sat = 70 + 20 * (0.5 + 0.5 * sin(logMag * 2 * PI));

      // Handle special values
      if (isNaN(hue) || isNaN(bri) || !isFinite(mag)) {
        hue = 0;
        sat = 0;
        bri = 0;
      }

      let c = color(hue, sat, constrain(bri, 0, 100));
      let idx = (px + py * width) * 4;
      pixels[idx] = red(c);
      pixels[idx + 1] = green(c);
      pixels[idx + 2] = blue(c);
      pixels[idx + 3] = 255;
    }
  }

  updatePixels();

  // Display function name
  fill(255);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  text(`f(z) = ${functionNames[currentFunction]}`, 10, 10);
  text("Click to change function | Scroll to zoom", 10, 32);
}

function mousePressed() {
  currentFunction = (currentFunction + 1) % functionNames.length;
  drawDomainColoring();
}

function mouseWheel(event) {
  let zoomFactor = event.delta > 0 ? 1.2 : 0.8;

  let mouseRe = map(mouseX, 0, width, minX, maxX);
  let mouseIm = map(mouseY, 0, height, maxY, minY);

  minX = mouseRe + (minX - mouseRe) * zoomFactor;
  maxX = mouseRe + (maxX - mouseRe) * zoomFactor;
  minY = mouseIm + (minY - mouseIm) * zoomFactor;
  maxY = mouseIm + (maxY - mouseIm) * zoomFactor;

  drawDomainColoring();
  return false;
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    minX = -3;
    maxX = 3;
    minY = -3;
    maxY = 3;
    drawDomainColoring();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  drawDomainColoring();
}
