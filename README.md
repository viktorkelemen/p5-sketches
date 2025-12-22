# p5-sketches

A collection of mathematical visualizations and creative coding sketches built with [p5.js](https://p5js.org/).

## Sketches

Open `index.html` in a browser to view all sketches with a navigation interface.

### Fractals

#### Burning Ship
A variant of the Mandelbrot set that uses absolute values before squaring: `z = (|Re(z)| + i|Im(z)|)² + c`. Creates an eerie shipwreck-like silhouette. Click to zoom, R to reset.

#### Newton Fractal
Visualizes basins of attraction from Newton-Raphson root finding on `z³ - 1`. The boundaries between roots create psychedelic interference patterns. Click to zoom.

#### Lyapunov Fractal
Visualizes stability in logistic maps with alternating parameters. Blue regions are stable, red/yellow are chaotic. Press 1-5 for different sequences.

#### Apollonian Gasket
Recursive circle packing using Descartes' Circle Theorem. Each gap is filled with the largest possible tangent circle. Connected to hyperbolic geometry.

#### Buddhabrot
The Mandelbrot set rendered by tracing escape trajectories. Uses the Nebulabrot technique with different iteration limits for RGB channels. A Buddha-like figure emerges.

#### Kleinian Limit Sets
"Indra's Pearls" - limit sets of Kleinian groups. Infinitely nested circles from iterated Möbius transformations.

#### Rauzy Fractal
From the Tribonacci substitution sequence (1→12, 2→13, 3→1). A fractal that tiles the plane non-periodically, related to quasicrystals.

### Strange Attractors

#### Clifford Attractor
`x' = sin(ay) + c·cos(ax)`, `y' = sin(bx) + d·cos(by)`. Creates flowing, fabric-like structures. Click to randomize parameters.

#### De Jong Attractor
`x' = sin(ay) - cos(bx)`, `y' = sin(cx) - cos(dy)`. Peter de Jong's attractor with beautiful preset parameters. Click for presets, R for random.

#### Ikeda Map
From laser physics - models light in a ring cavity. Creates spiraling, galaxy-like forms with a characteristic spiral structure.

#### Hopalong Attractor
Martin's attractor: `x' = y - sign(x)·√|bx - c|`, `y' = a - x`. Surprisingly symmetric despite its chaotic nature.

#### Mira Fractal
Quadratic recurrence with the Gumowski-Mira function. Creates organic, cellular shapes.

#### Popcorn / Pickover
`x' = x - h·sin(y + tan(3y))`, `y' = y - h·sin(x + tan(3x))`. The tangent creates singularities that form web-like patterns.

### Physics & Dynamics

#### Magnetic Pendulum
Simulates a pendulum over three magnets. Initial position determines which magnet it settles on, creating fractal basin boundaries.

#### Hofstadter Butterfly
The energy spectrum of Bloch electrons in a magnetic field. Eigenvalues of the Harper matrix form a fractal structure. A beautiful example of fractals in quantum mechanics.

### Mathematical Functions

#### Weierstrass Function
`W(x) = Σ aⁿ·cos(bⁿπx)` - continuous everywhere but differentiable nowhere. Creates infinitely jagged coastline-like curves. Scroll to zoom, drag to pan.

#### Domain Coloring
Visualizes complex functions using color: hue represents phase, brightness represents magnitude. Includes z², z³-1, sin(z), exp(z), z^z, Gamma function, and Riemann zeta approximations.

#### Schwarz-Christoffel Maps
Conformal maps that transform the unit disk to polygons. Watch how circles and radial lines smoothly morph into squares, triangles, and other shapes.

#### Droste Effect
Infinite recursive zoom using complex logarithm: `exp(log(z) + iθ)`. Creates self-similar spiral patterns that zoom infinitely.

### Saturn & Witchcraft Collection

#### Saturn
A cosmic visualization of Saturn with particle-based rings, orbiting moons, and atmospheric bands.

#### Sigil
A mystical pentagram with rotating runes, flickering candles, and particle effects. Click to conjure energy bursts.

#### Saturn Occult
Saturn as an ancient deity - combines cosmic imagery with occult symbols like hexagrams and alchemical sigils.

## Running the Sketches

1. Open `index.html` in a modern web browser
2. Click on any sketch card to enter the visualization
3. Most sketches support interaction:
   - **Click**: Zoom, regenerate, or change parameters
   - **R key**: Reset to default view
   - **Arrow keys**: Adjust parameters (where applicable)

## Technologies

- [p5.js](https://p5js.org/) - JavaScript library for creative coding

## Mathematical Background

These visualizations explore concepts from:
- **Complex Analysis**: Domain coloring, conformal maps, Möbius transformations
- **Dynamical Systems**: Strange attractors, chaotic maps, basin boundaries
- **Number Theory**: Fractals from iteration, substitution sequences
- **Quantum Mechanics**: Hofstadter butterfly, Harper equation
- **Analysis**: Pathological functions (Weierstrass), fractal dimensions
