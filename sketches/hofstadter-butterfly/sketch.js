// Hofstadter Butterfly
// Energy spectrum of Bloch electrons in a magnetic field
// The Harper equation eigenvalues form a fractal structure

let resolution = 200;
let time = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  noLoop();
  drawButterfly();
}

function drawButterfly() {
  background(240, 30, 5);

  let scale = min(width, height) * 0.45;
  translate(width / 2, height / 2);

  // For each value of magnetic flux (alpha = p/q)
  for (let q = 1; q <= resolution; q++) {
    for (let p = 1; p < q; p++) {
      // Only use coprime p, q
      if (gcd(p, q) !== 1) continue;

      let alpha = p / q;

      // Find eigenvalues of Harper matrix for this alpha
      let eigenvalues = computeHarperEigenvalues(alpha, q);

      // Plot each eigenvalue
      for (let e of eigenvalues) {
        let x = map(alpha, 0, 1, -scale, scale);
        let y = map(e, -4, 4, scale, -scale);

        // Color by q value
        let hue = (q * 7) % 360;
        let sat = 70;
        let bri = map(q, 1, resolution, 100, 50);

        stroke(hue, sat, bri, 60);
        strokeWeight(map(q, 1, resolution, 2, 0.5));
        point(x, y);
      }
    }
  }

  // Draw axes
  resetMatrix();
  stroke(0, 0, 50);
  strokeWeight(1);
  line(width / 2 - scale, height / 2, width / 2 + scale, height / 2);
  line(width / 2, height / 2 - scale, width / 2, height / 2 + scale);

  // Labels
  fill(0, 0, 80);
  noStroke();
  textSize(14);
  textAlign(CENTER);
  text("Magnetic Flux (p/q)", width / 2, height / 2 + scale + 30);

  push();
  translate(width / 2 - scale - 30, height / 2);
  rotate(-HALF_PI);
  text("Energy", 0, 0);
  pop();

  textAlign(LEFT);
  text("Hofstadter Butterfly | Resolution: " + resolution, 10, 25);
  text("Click to increase resolution", 10, 45);
}

function computeHarperEigenvalues(alpha, q) {
  // Harper equation: E*psi_n = psi_{n+1} + psi_{n-1} + 2*cos(2*pi*alpha*n)*psi_n
  // This creates a q x q tridiagonal matrix

  // Build the matrix
  let matrix = [];
  for (let i = 0; i < q; i++) {
    matrix[i] = [];
    for (let j = 0; j < q; j++) {
      matrix[i][j] = 0;
    }
  }

  // Fill diagonal: 2*cos(2*pi*alpha*n)
  for (let n = 0; n < q; n++) {
    matrix[n][n] = 2 * cos(TWO_PI * alpha * n);
  }

  // Fill off-diagonals (1s)
  for (let n = 0; n < q - 1; n++) {
    matrix[n][n + 1] = 1;
    matrix[n + 1][n] = 1;
  }

  // Periodic boundary conditions
  matrix[0][q - 1] = 1;
  matrix[q - 1][0] = 1;

  // Find eigenvalues using power iteration and deflation (simplified)
  // For visualization, we'll use the characteristic polynomial approach for small q
  // or QR iteration approximation

  return approximateEigenvalues(matrix, q);
}

function approximateEigenvalues(matrix, n) {
  // Simplified eigenvalue estimation using Gershgorin circles
  // and iterative refinement

  let eigenvalues = [];

  // For small matrices, use direct methods
  if (n <= 3) {
    // Direct calculation for small n
    if (n === 1) {
      return [matrix[0][0]];
    } else if (n === 2) {
      let a = matrix[0][0], b = matrix[0][1];
      let c = matrix[1][0], d = matrix[1][1];
      let trace = a + d;
      let det = a * d - b * c;
      let disc = sqrt(trace * trace - 4 * det);
      return [(trace + disc) / 2, (trace - disc) / 2];
    }
  }

  // For larger matrices, use QR iteration approximation
  // Clone matrix
  let A = matrix.map(row => [...row]);

  // Simple QR iteration (limited iterations for speed)
  for (let iter = 0; iter < min(n * 2, 30); iter++) {
    let { Q, R } = qrDecomposition(A, n);
    A = multiplyMatrices(R, Q, n);
  }

  // Diagonal elements approximate eigenvalues
  for (let i = 0; i < n; i++) {
    eigenvalues.push(A[i][i]);
  }

  return eigenvalues;
}

function qrDecomposition(A, n) {
  let Q = [];
  let R = [];

  for (let i = 0; i < n; i++) {
    Q[i] = [];
    R[i] = [];
    for (let j = 0; j < n; j++) {
      Q[i][j] = (i === j) ? 1 : 0;
      R[i][j] = A[i][j];
    }
  }

  // Gram-Schmidt process
  for (let j = 0; j < n; j++) {
    // Get column j
    let v = [];
    for (let i = 0; i < n; i++) {
      v[i] = R[i][j];
    }

    // Subtract projections
    for (let k = 0; k < j; k++) {
      let dot = 0;
      let qk = [];
      for (let i = 0; i < n; i++) {
        qk[i] = Q[i][k];
        dot += v[i] * qk[i];
      }
      for (let i = 0; i < n; i++) {
        v[i] -= dot * qk[i];
      }
    }

    // Normalize
    let norm = 0;
    for (let i = 0; i < n; i++) {
      norm += v[i] * v[i];
    }
    norm = sqrt(norm);

    if (norm > 0.0001) {
      for (let i = 0; i < n; i++) {
        Q[i][j] = v[i] / norm;
      }
    }
  }

  // R = Q^T * A
  R = multiplyMatrices(transpose(Q, n), A, n);

  return { Q, R };
}

function transpose(M, n) {
  let T = [];
  for (let i = 0; i < n; i++) {
    T[i] = [];
    for (let j = 0; j < n; j++) {
      T[i][j] = M[j][i];
    }
  }
  return T;
}

function multiplyMatrices(A, B, n) {
  let C = [];
  for (let i = 0; i < n; i++) {
    C[i] = [];
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += A[i][k] * B[k][j];
      }
      C[i][j] = sum;
    }
  }
  return C;
}

function gcd(a, b) {
  while (b !== 0) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function mousePressed() {
  resolution = min(resolution + 50, 500);
  drawButterfly();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    resolution = 200;
    drawButterfly();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  drawButterfly();
}
