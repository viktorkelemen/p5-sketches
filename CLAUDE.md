# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A collection of mathematical visualizations and creative coding sketches built with p5.js. Each sketch is a standalone HTML page that loads p5.js from CDN and its own `sketch.js` file.

## Development

No build process or package manager—sketches run directly in the browser. Open `index.html` in a browser to see all sketches, or open individual sketch HTML files directly.

## Architecture

```
index.html              # Gallery homepage with all sketch cards
sketches/
  <sketch-name>/
    index.html          # Loads p5.js from CDN + sketch.js
    sketch.js           # p5.js sketch code
```

### Sketch Patterns

**Standard p5.js structure**: Each sketch implements `setup()`, `draw()`, and often `mousePressed()`, `keyPressed()`, `windowResized()`.

**Two rendering approaches**:
1. **CPU-based** (most attractors): Use density arrays + `loadPixels()/updatePixels()` for point accumulation. Example: `sketches/clifford-attractor/sketch.js`
2. **WebGL/shader-based** (fractals needing GPU): Embed GLSL shaders as template strings with vertex/fragment shaders. Example: `sketches/droste/sketch.js`

**Common patterns**:
- `colorMode(HSB, 360, 100, 100, 100)` for HSB color
- `pixelDensity(1)` when doing direct pixel manipulation
- Density/histogram rendering with logarithmic scaling: `log(density[i] + 1) / log(maxDensity + 1)`
- Map mathematical coordinates to screen: `map(x, -3, 3, 0, width)`

### HTML Template

Sketches use a minimal template loading p5.js from cdnjs with SRI hash:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js" integrity="sha512-..." crossorigin="anonymous"></script>
```

## Sketch Categories

- **Fractals**: Burning Ship, Newton, Lyapunov, Apollonian Gasket, Buddhabrot, Kleinian, Rauzy
- **Strange Attractors**: Clifford, De Jong, Ikeda, Hopalong, Mira, Popcorn
- **Physics/Dynamics**: Magnetic Pendulum, Hofstadter Butterfly
- **Mathematical Functions**: Weierstrass, Domain Coloring, Schwarz-Christoffel, Droste

## Interactions

Most sketches support:
- **Click**: Zoom, regenerate, or change parameters
- **R key**: Reset to default view
- **Arrow keys**: Adjust parameters (where applicable)

## Development Workflow

After every code change:
1. **Run tests** if they exist: `npm run docker:test` (runs Playwright E2E tests in Docker)
2. **Code review** the changes for bugs, performance issues, and style

### Testing

E2E tests use Playwright in Docker:
```bash
npm run serve              # Start local server on port 3000
npm run docker:test        # Run tests in Docker
```

Test files are in `tests/` directory. Each sketch can have its own `.spec.ts` file.
