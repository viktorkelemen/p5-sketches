// Buddhabrot
// Mandelbrot rendered by tracing escape trajectories
// Creates a "Buddha-like" figure emerging from chaos
// Color palette: Traditional Japanese colors (日本の伝統色)

let deepChannel, midChannel, shallowChannel;
let minX = -2, maxX = 1;
let minY = -1.5, maxY = 1.5;
let samplesPerFrame = 10000;
let maxValDeep = 1, maxValMid = 1, maxValShallow = 1;
let totalSamples = 0;

// Internal resolution (scaled to fullscreen)
const RENDER_WIDTH = 512;
const RENDER_HEIGHT = 384;

// Different iteration limits for depth channels (Nebulabrot technique)
let maxIterDeep = 2000;
let maxIterMid = 200;
let maxIterShallow = 20;

// Traditional Japanese colors (日本の伝統色) - warm to cool gradient
// Deep (2000 iter): Enji (臙脂) - dark red for innermost structures
const colorDeep = { r: 159, g: 53, b: 58 };
// Medium (200 iter): Murasaki (紫) - classic purple
const colorMid = { r: 136, g: 72, b: 152 };
// Shallow (20 iter): Ruri (瑠璃色) - lapis lazuli blue
const colorShallow = { r: 31, g: 71, b: 136 };
// Cold outer: Asagi (浅葱色) - pale blue-green for background
const colorOuter = { r: 72, g: 146, b: 155 };
// Highlight: Yamabuki (山吹色) - golden yellow for hot spots
const colorHighlight = { r: 255, g: 193, b: 37 };

// Color intensity multiplier
const COLOR_BOOST = 1.4;

// Pre-allocated trajectory buffers to avoid GC pressure
let trajectoryRe, trajectoryIm;
let maxTrajectoryLen;

// Zoom state
let zoomLevel = 1;
let centerX = -0.5;
let centerY = 0;

// Auto-zoom settings
let minZoom = 1;
let maxZoom = 24;     // Max zoom level
let zoomSpeed = 0.001; // Slower zoom increment per frame
let zoomDirection = 1; // 1 = zooming in, -1 = zooming out
let autoZoomTarget = { x: -0.75, y: 0.1 }; // Interesting point to zoom into

let renderBuffer;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noSmooth();
  colorMode(RGB, 255);

  // Create low-res offscreen buffer for rendering
  renderBuffer = createGraphics(RENDER_WIDTH, RENDER_HEIGHT);
  renderBuffer.pixelDensity(1);
  renderBuffer.noSmooth();

  initBuffers();
  updateViewBounds();
  background(0);
}

function initBuffers() {
  // Initialize accumulation buffers at render resolution
  deepChannel = new Float32Array(RENDER_WIDTH * RENDER_HEIGHT);
  midChannel = new Float32Array(RENDER_WIDTH * RENDER_HEIGHT);
  shallowChannel = new Float32Array(RENDER_WIDTH * RENDER_HEIGHT);

  // Pre-allocate trajectory buffers (sized for longest iteration limit)
  maxTrajectoryLen = maxIterDeep;
  trajectoryRe = new Float64Array(maxTrajectoryLen);
  trajectoryIm = new Float64Array(maxTrajectoryLen);

  // Reset max values
  maxValDeep = 1;
  maxValMid = 1;
  maxValShallow = 1;
  totalSamples = 0;
}

function updateViewBounds() {
  // Calculate view bounds based on zoom and center
  let viewWidth = 3 / zoomLevel;  // Original width is 3 (-2 to 1)
  let viewHeight = 3 / zoomLevel; // Original height is 3 (-1.5 to 1.5)

  // Adjust for aspect ratio
  let aspect = width / height;
  if (aspect > 1) {
    viewWidth = viewHeight * aspect;
  } else {
    viewHeight = viewWidth / aspect;
  }

  minX = centerX - viewWidth / 2;
  maxX = centerX + viewWidth / 2;
  minY = centerY - viewHeight / 2;
  maxY = centerY + viewHeight / 2;
}

function draw() {
  // Process multiple samples per frame
  for (let i = 0; i < samplesPerFrame; i++) {
    // Random point in complex plane (sample from current view bounds)
    // Only sample upper half (Im >= 0) due to vertical symmetry
    // Use max of absolute bounds to ensure coverage when zoomed below Y=0
    let cRe = random(minX, maxX);
    let positiveMaxIm = max(abs(minY), abs(maxY));
    let cIm = random(0, positiveMaxIm);

    // Skip points likely in the Mandelbrot set (cardioid and period-2 bulb)
    if (isInMainCardioidOrBulb(cRe, cIm)) {
      continue;
    }

    // Test if point escapes (not in Mandelbrot set)
    // Only trace points that escape
    traceOrbitOptimized(cRe, cIm, maxIterDeep, deepChannel, 'deep');
    traceOrbitOptimized(cRe, cIm, maxIterMid, midChannel, 'mid');
    traceOrbitOptimized(cRe, cIm, maxIterShallow, shallowChannel, 'shallow');
  }

  totalSamples += samplesPerFrame;

  // Update display periodically
  if (frameCount % 5 === 0) {
    updateDisplay();
  }

  // Auto-zoom: smoothly zoom in/out in a loop
  if (zoomDirection === 1) {
    // Zooming in
    centerX = lerp(centerX, autoZoomTarget.x, zoomSpeed * 2);
    centerY = lerp(centerY, autoZoomTarget.y, zoomSpeed * 2);
    zoomLevel *= (1 + zoomSpeed);

    if (zoomLevel >= maxZoom) {
      zoomDirection = -1; // Start zooming out
    }
  } else {
    // Zooming out
    centerX = lerp(centerX, -0.5, zoomSpeed * 2);
    centerY = lerp(centerY, 0, zoomSpeed * 2);
    zoomLevel *= (1 - zoomSpeed);

    if (zoomLevel <= minZoom) {
      zoomDirection = 1; // Start zooming in
      zoomLevel = minZoom;
    }
  }

  // Update view bounds
  updateViewBounds();

  // Clear periodically for fresh render at new zoom level
  if (frameCount % 60 === 0) {
    deepChannel.fill(0);
    midChannel.fill(0);
    shallowChannel.fill(0);
    maxValDeep = 1;
    maxValMid = 1;
    maxValShallow = 1;
  }

}

// Check if point is in main cardioid or period-2 bulb
function isInMainCardioidOrBulb(cRe, cIm) {
  let q = (cRe - 0.25) * (cRe - 0.25) + cIm * cIm;
  if (q * (q + (cRe - 0.25)) < 0.25 * cIm * cIm) {
    return true;
  }
  if ((cRe + 1) * (cRe + 1) + cIm * cIm < 0.0625) {
    return true;
  }
  return false;
}

// Optimized orbit tracing with pre-allocated arrays and symmetry
function traceOrbitOptimized(cRe, cIm, maxIter, channel, channelId) {
  let zRe = 0, zIm = 0;
  let trajectoryLen = 0;

  for (let i = 0; i < maxIter; i++) {
    let zRe2 = zRe * zRe;
    let zIm2 = zIm * zIm;

    if (zRe2 + zIm2 > 4) {
      let maxVal = channelId === 'deep' ? maxValDeep : (channelId === 'mid' ? maxValMid : maxValShallow);

      for (let j = 0; j < trajectoryLen; j++) {
        let re = trajectoryRe[j];
        let im = trajectoryIm[j];

        // Original point
        let px = floor(map(re, minX, maxX, 0, RENDER_WIDTH));
        let py = floor(map(im, minY, maxY, 0, RENDER_HEIGHT));

        if (px >= 0 && px < RENDER_WIDTH && py >= 0 && py < RENDER_HEIGHT) {
          let idx = px + py * RENDER_WIDTH;
          channel[idx]++;
          if (channel[idx] > maxVal) maxVal = channel[idx];
        }

        // Mirrored point (negative imaginary part)
        let pyMirror = floor(map(-im, minY, maxY, 0, RENDER_HEIGHT));
        if (px >= 0 && px < RENDER_WIDTH && pyMirror >= 0 && pyMirror < RENDER_HEIGHT) {
          let idx = px + pyMirror * RENDER_WIDTH;
          channel[idx]++;
          if (channel[idx] > maxVal) maxVal = channel[idx];
        }
      }

      if (channelId === 'deep') maxValDeep = maxVal;
      else if (channelId === 'mid') maxValMid = maxVal;
      else maxValShallow = maxVal;

      return;
    }

    // Store point with bounds check for safety
    if (trajectoryLen < maxTrajectoryLen) {
      trajectoryRe[trajectoryLen] = zRe;
      trajectoryIm[trajectoryLen] = zIm;
      trajectoryLen++;
    }

    let newRe = zRe2 - zIm2 + cRe;
    zIm = 2 * zRe * zIm + cIm;
    zRe = newRe;
  }
}

function updateDisplay() {
  renderBuffer.loadPixels();

  let logMaxDeep = log(maxValDeep + 1);
  let logMaxMid = log(maxValMid + 1);
  let logMaxShallow = log(maxValShallow + 1);

  for (let i = 0; i < RENDER_WIDTH * RENDER_HEIGHT; i++) {
    // Normalize each channel to 0-1 range with logarithmic scaling
    let dVal = log(deepChannel[i] + 1) / logMaxDeep;
    let mVal = log(midChannel[i] + 1) / logMaxMid;
    let sVal = log(shallowChannel[i] + 1) / logMaxShallow;

    // Apply gamma for better separation
    dVal = pow(dVal, 0.5);
    mVal = pow(mVal, 0.6);
    sVal = pow(sVal, 0.7);

    // Calculate intensity metrics
    let totalIntensity = dVal + mVal + sVal;
    let avgIntensity = totalIntensity / 3;

    // Background teal blend based on low overall intensity
    let outerBlend = pow(1 - avgIntensity, 1.5) * 0.4;

    // Highlight for bright convergence points
    let highlightBlend = pow(avgIntensity, 4) * 0.6;

    // Each channel contributes its color independently
    // Deep = warm red, Mid = purple, Shallow = blue
    let r = (colorDeep.r * dVal * 1.5 + colorMid.r * mVal * 0.9 + colorShallow.r * sVal * 0.4) * COLOR_BOOST;
    let g = (colorDeep.g * dVal * 0.6 + colorMid.g * mVal * 0.8 + colorShallow.g * sVal * 0.7) * COLOR_BOOST;
    let b = (colorDeep.b * dVal * 0.5 + colorMid.b * mVal * 1.3 + colorShallow.b * sVal * 1.5) * COLOR_BOOST;

    // Blend teal background in sparse regions
    r = lerp(r, colorOuter.r, outerBlend);
    g = lerp(g, colorOuter.g, outerBlend);
    b = lerp(b, colorOuter.b, outerBlend);

    // Add golden highlight in brightest areas
    r = lerp(r, colorHighlight.r, highlightBlend);
    g = lerp(g, colorHighlight.g, highlightBlend);
    b = lerp(b, colorHighlight.b, highlightBlend);

    let idx = i * 4;
    renderBuffer.pixels[idx] = constrain(r, 0, 255);
    renderBuffer.pixels[idx + 1] = constrain(g, 0, 255);
    renderBuffer.pixels[idx + 2] = constrain(b, 0, 255);
    renderBuffer.pixels[idx + 3] = 255;
  }

  renderBuffer.updatePixels();

  // Draw scaled to fullscreen
  image(renderBuffer, 0, 0, width, height);
}

function resetView() {
  updateViewBounds();
  deepChannel.fill(0);
  midChannel.fill(0);
  shallowChannel.fill(0);
  maxValDeep = 1;
  maxValMid = 1;
  maxValShallow = 1;
  totalSamples = 0;
  background(0);
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    // Full reset - restart auto-zoom
    zoomLevel = 1;
    zoomDirection = 1;
    centerX = -0.5;
    centerY = 0;
    totalSamples = 0;
    resetView();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
