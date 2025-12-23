// Kleinian Group Limit Sets
// "Indra's Pearls" - infinitely nested circles from Möbius transformations

let points = [];
let maxPoints = 50000;
let depth = 50;
let time = 0;

// Möbius transformation parameters
let ta, tb; // traces of the two generators

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  generateLimitSet();
}

function generateLimitSet() {
  points = [];

  // Parameters for the group generators
  // ta and tb are traces of the Möbius transformations
  // Use complex traces to avoid the singularity at real trace = 2
  // These parameters produce the classic "Indra's Pearls" limit sets
  let angle = time * 0.1;
  ta = createComplex(1.91, 0.05 + 0.02 * sin(angle));
  tb = createComplex(1.91, 0.05 + 0.02 * cos(angle));

  // Generate transformations a, b, A (a inverse), B (b inverse)
  let transforms = generateTransforms(ta, tb);

  // Find a fixed point of generator b to start from
  // Fixed point of Möbius (az+b)/(cz+d) satisfies cz² + (d-a)z - b = 0
  let b = transforms[1];
  let fixedPoint = findFixedPoint(b);

  if (!isFinite(fixedPoint.re) || !isFinite(fixedPoint.im)) {
    console.log("Invalid fixed point, using origin");
    fixedPoint = createComplex(0, 0);
  }

  // Start from fixed point and apply random walks (chaos game)
  let z = fixedPoint;

  // Burn-in: iterate without recording to get onto the limit set
  for (let i = 0; i < 100; i++) {
    let choice = floor(random(4));
    z = applyMobius(transforms[choice], z);
    if (!isFinite(z.re) || !isFinite(z.im) || complexMag(z) > 100) {
      z = fixedPoint; // Reset if escaped
    }
  }

  // Now collect points
  for (let i = 0; i < maxPoints; i++) {
    let choice = floor(random(4));
    z = applyMobius(transforms[choice], z);

    if (!isFinite(z.re) || !isFinite(z.im) || complexMag(z) > 100) {
      z = fixedPoint; // Reset if escaped
      continue;
    }

    points.push({
      x: z.re,
      y: z.im,
      hue: (i / maxPoints) * 360
    });
  }
}

function createComplex(re, im) {
  return { re: re, im: im };
}

function complexMag(z) {
  return sqrt(z.re * z.re + z.im * z.im);
}

function complexMult(a, b) {
  return createComplex(
    a.re * b.re - a.im * b.im,
    a.re * b.im + a.im * b.re
  );
}

function complexAdd(a, b) {
  return createComplex(a.re + b.re, a.im + b.im);
}

function complexSub(a, b) {
  return createComplex(a.re - b.re, a.im - b.im);
}

function complexDiv(a, b) {
  let denom = b.re * b.re + b.im * b.im;
  // Handle division by zero in Möbius transformations
  if (denom < 1e-20) {
    return createComplex(Infinity, Infinity);
  }
  return createComplex(
    (a.re * b.re + a.im * b.im) / denom,
    (a.im * b.re - a.re * b.im) / denom
  );
}

function complexSqrt(z) {
  let r = complexMag(z);
  let theta = atan2(z.im, z.re);
  return createComplex(
    sqrt(r) * cos(theta / 2),
    sqrt(r) * sin(theta / 2)
  );
}

// Find fixed point of Möbius transformation (az+b)/(cz+d)
// Solves cz² + (d-a)z - b = 0 using quadratic formula
function findFixedPoint(m) {
  // If c ≈ 0, fixed point is b/(a-d)
  if (complexMag(m.c) < 1e-10) {
    return complexDiv(m.b, complexSub(m.a, m.d));
  }

  // Quadratic: cz² + (d-a)z - b = 0
  // z = (-(d-a) ± sqrt((d-a)² + 4cb)) / 2c
  let dma = complexSub(m.d, m.a);
  let discriminant = complexAdd(
    complexMult(dma, dma),
    complexMult(createComplex(4, 0), complexMult(m.c, m.b))
  );
  let sqrtDisc = complexSqrt(discriminant);
  let numerator = complexSub(complexMult(createComplex(-1, 0), dma), sqrtDisc);
  let denominator = complexMult(createComplex(2, 0), m.c);
  return complexDiv(numerator, denominator);
}

function generateTransforms(ta, tb) {
  // Generate Möbius transformation matrices from traces
  // Using the Grandma's recipe from "Indra's Pearls"

  let tab = complexDiv(
    complexAdd(
      complexMult(ta, tb),
      complexSqrt(
        complexSub(
          complexSub(
            complexMult(complexMult(ta, ta), complexMult(tb, tb)),
            complexMult(createComplex(4, 0), complexAdd(complexMult(ta, ta), complexMult(tb, tb)))
          ),
          createComplex(-16, 0)
        )
      )
    ),
    createComplex(2, 0)
  );

  // Generator a
  let a = {
    a: complexDiv(ta, createComplex(2, 0)),
    b: complexDiv(
      complexSub(complexMult(ta, tab), complexMult(createComplex(2, 0), tb)),
      complexAdd(complexMult(tab, createComplex(2, 0)), createComplex(4, 0))
    ),
    c: complexDiv(
      complexAdd(complexMult(ta, tab), complexMult(createComplex(2, 0), tb)),
      complexAdd(complexMult(tab, createComplex(2, 0)), createComplex(-4, 0))
    ),
    d: complexDiv(ta, createComplex(2, 0))
  };

  // Generator b
  let b = {
    a: complexDiv(tb, createComplex(2, 0)),
    b: createComplex(0, 1),
    c: createComplex(0, 1),
    d: complexDiv(tb, createComplex(2, 0))
  };

  // Inverses
  let aInv = {
    a: a.d,
    b: complexMult(createComplex(-1, 0), a.b),
    c: complexMult(createComplex(-1, 0), a.c),
    d: a.a
  };

  let bInv = {
    a: b.d,
    b: complexMult(createComplex(-1, 0), b.b),
    c: complexMult(createComplex(-1, 0), b.c),
    d: b.a
  };

  return [a, b, aInv, bInv];
}

function applyMobius(m, z) {
  // Möbius transformation: (az + b) / (cz + d)
  let num = complexAdd(complexMult(m.a, z), m.b);
  let den = complexAdd(complexMult(m.c, z), m.d);
  return complexDiv(num, den);
}

function draw() {
  background(240, 30, 15);

  let scale = min(width, height) * 0.4;

  translate(width / 2, height / 2);

  noStroke();
  for (let p of points) {
    let hue = (p.hue + time * 50) % 360;
    fill(hue, 70, 80, 30);
    let x = p.x * scale;
    let y = p.y * scale;
    circle(x, y, 1.5);
  }

  time += deltaTime / 1000;

  // Regenerate periodically for animation
  if (frameCount % 120 === 0) {
    generateLimitSet();
  }

  // Info
  resetMatrix();
  fill(0, 0, 80);
  noStroke();
  textSize(14);
  text("Kleinian Limit Set | Click to regenerate", 10, 25);
}

function mousePressed() {
  time += 0.5;
  generateLimitSet();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
