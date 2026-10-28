// Shapes: tokens/shapes/kit.shapes.json → src/generated/shapes.css. Every shape becomes `--mx-shape-<name>`, a
// `polygon()` of the same number of points, each on its own ray from the centre at the same angle in every
// shape: so one shape turns into another smoothly (a clip-path between two of them is interpolated point by
// point). A shape fills the circle in its box: its farthest point touches the circle, so it stays inside its box at any turn.
//
// A shape is described, not drawn:
//   { "kind": "circle" }
//   { "kind": "ellipse", "rx": 0.7, "ry": 1 }                    the half axes, the larger one 1
//   { "kind": "rect", "width": 1, "height": 0.6, "round": 1 }    round: the corners' share of the shorter half side
//   { "kind": "polygon", "sides": 5, "round": 0.25 }             round: the corners' radius, a share of the radius
//   { "kind": "wave", "lobes": 9, "depth": 0.1, "sharp": 1 }     depth: how far in a valley goes; sharp < 1 makes the
//                                                                tips sharper and the valleys rounder
// Any of them may take "turn" (degrees) to start turned.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
/** Points of every shape: as many in each, so any two blend. */
export const POINTS = 180;

/** The signed distance from a point to a polygon's edge (negative inside). */
function polygonDistance(v, px, py) {
  let d = (px - v[0][0]) ** 2 + (py - v[0][1]) ** 2;
  let sign = 1;
  for (let i = 0, j = v.length - 1; i < v.length; j = i, i++) {
    const ex = v[j][0] - v[i][0];
    const ey = v[j][1] - v[i][1];
    const wx = px - v[i][0];
    const wy = py - v[i][1];
    const t = Math.min(Math.max((wx * ex + wy * ey) / (ex * ex + ey * ey), 0), 1);
    d = Math.min(d, (wx - ex * t) ** 2 + (wy - ey * t) ** 2);
    const below = py >= v[i][1];
    const above = py < v[j][1];
    const left = ex * wy > ey * wx;
    if ((below && above && left) || (!below && !above && !left)) sign = -sign;
  }
  return sign * Math.sqrt(d);
}

/** The signed distance from a point to a shape's edge (negative inside), the shape centred on 0,0 at unit size. */
function distanceOf(shape) {
  switch (shape.kind) {
    case 'circle':
      return (x, y) => Math.hypot(x, y) - 1;
    case 'ellipse': {
      const { rx, ry } = shape;
      // Not exact away from the edge, but its zero is the ellipse: that is all a ray needs.
      return (x, y) => (Math.hypot(x / rx, y / ry) - 1) * Math.min(rx, ry);
    }
    case 'rect': {
      const hw = shape.width / 2;
      const hh = shape.height / 2;
      const r = (shape.round ?? 0) * Math.min(hw, hh);
      return (x, y) => {
        const qx = Math.abs(x) - (hw - r);
        const qy = Math.abs(y) - (hh - r);
        return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
      };
    }
    case 'polygon': {
      // A regular polygon on the unit circle, its edge pushed out by the rounding: rounded corners.
      const corners = Array.from({ length: shape.sides }, (_, k) => {
        const a = (2 * Math.PI * k) / shape.sides;
        return [Math.sin(a), -Math.cos(a)];
      });
      return (x, y) => polygonDistance(corners, x, y) - (shape.round ?? 0);
    }
    case 'wave': {
      const { lobes, depth, sharp = 1 } = shape;
      return (x, y) => {
        const a = Math.atan2(x, -y);
        const valley = Math.pow((1 - Math.cos(lobes * a)) / 2, sharp);
        return Math.hypot(x, y) - (1 - depth * valley);
      };
    }
    default:
      throw new Error(`a shape of kind "${shape.kind}" is not known`);
  }
}

/** How far the edge is along a ray at angle a (0 up, clockwise). */
function reach(distance, a) {
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  let lo = 0;
  let hi = 4;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (distance(dx * mid, dy * mid) < 0) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** A shape as `polygon()`, filling the circle in its box (its farthest point on the circle). */
export function polygonOf(shape) {
  const distance = distanceOf(shape);
  const turn = ((shape.turn ?? 0) * Math.PI) / 180;
  const reaches = [];
  for (let i = 0; i < POINTS; i++) reaches.push(reach(distance, (2 * Math.PI * i) / POINTS - turn));
  const points = reaches.map((r, i) => {
    const a = (2 * Math.PI * i) / POINTS;
    return [Math.sin(a) * r, -Math.cos(a) * r];
  });
  const scale = 1 / Math.max(...reaches);
  const pct = (v) => `${Math.round((50 + v * scale * 50) * 100) / 100}%`;
  return `polygon(${points.map(([x, y]) => `${pct(x)} ${pct(y)}`).join(', ')})`;
}

export function renderShapes() {
  const shapes = JSON.parse(readFileSync(join(root, 'tokens', 'shapes', 'kit.shapes.json'), 'utf8'));
  const lines = Object.entries(shapes)
    .filter(([name]) => !name.startsWith('$'))
    .map(([name, shape]) => `    --mx-shape-${name}: ${polygonOf(shape)};`);
  return `/* Generated by scripts/build-shapes.mjs from tokens/shapes. Do not edit; edit the source and run \`npm run tokens\`. */\n@layer mx.components {\n  :root {\n${lines.join('\n')}\n  }\n}\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  mkdirSync(join(root, 'src', 'generated'), { recursive: true });
  const css = renderShapes();
  writeFileSync(join(root, 'src', 'generated', 'shapes.css'), css);
  console.log(`shapes: ${css.split('--mx-shape-').length - 1} shapes of ${POINTS} points → src/generated/shapes.css`);
}
