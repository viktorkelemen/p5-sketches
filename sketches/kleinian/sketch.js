// Kleinian Group Limit Sets
// "Indra's Pearls" - infinitely nested circles from Möbius transformations

let points = [];
let maxPoints = 100000;
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
  let t = map(sin(time * 0.5), -1, 1, 1.95, 2.05);
  ta = createComplex(t, 0);
  tb = createComplex(t, 0);

  // Generate transformations a, b, A (a inverse), B (b inverse)
  let transforms = generateTransforms(ta, tb);

  // Start from a seed point and apply random walks
  for (let i = 0; i < maxPoints; i++) {
    // Start near the limit set
    let z = createComplex(random(-0.1, 0.1), random(-0.1, 0.1));

    // Random walk through the group
    for (let j = 0; j < depth; j++) {
      let choice = floor(random(4));
      z = applyMobius(transforms[choice], z);

      // Bail out if point escapes
      if (complexMag(z) > 10) break;
    }

    if (complexMag(z) < 10) {
      points.push({
        x: z.re,
        y: z.im,
        hue: (i / maxPoints) * 360
      });
    }
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
  background(240, 20, 5);

  let scale = min(width, height) * 0.3;

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
