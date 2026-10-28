/** How a wave swings: `amplitude` and `length` in px, `phase` in waves (it travels as the phase grows). */
export interface WaveSwing {
  amplitude: number;
  length: number;
  phase: number;
}

const fix = (n: number) => Math.round(n * 100) / 100;

/**
 * The path of a line `length` long, `thickness` thick, along the middle of a box `height` high, as a wave:
 * its round ends stay inside the length. Straight where the amplitude is 0; empty at no length.
 */
export function linePath(length: number, height: number, thickness: number, swing: WaveSwing): string {
  if (length <= 0) return '';
  const middle = height / 2;
  const from = thickness / 2;
  const to = Math.max(from, length - thickness / 2);
  if (swing.amplitude <= 0 || swing.length <= 0) return `M${fix(from)} ${fix(middle)}H${fix(to)}`;
  const y = (x: number) => middle + swing.amplitude * Math.sin(2 * Math.PI * (x / swing.length - swing.phase));
  const points = [`M${fix(from)} ${fix(y(from))}`];
  for (let x = Math.ceil(from); x < to; x++) points.push(`L${fix(x)} ${fix(y(x))}`);
  points.push(`L${fix(to)} ${fix(y(to))}`);
  return points.join('');
}

/**
 * The path of an arc on a circle `radius` round a centre `centre` px from the top and the start of its box,
 * clockwise from angle 0 over `fraction` of the circle, `thickness` thick, as a wave whose length is fitted so
 * whole waves go round. Its round ends stay inside the arc; the whole circle is one closed line.
 */
export function ringPath(centre: number, radius: number, thickness: number, fraction: number, swing: WaveSwing): string {
  if (fraction <= 0 || radius <= 0) return '';
  const around = 2 * Math.PI * radius;
  const length = swing.length > 0 ? around / Math.max(1, Math.round(around / swing.length)) : 0;
  const whole = fraction >= 1;
  const from = whole ? 0 : thickness / 2;
  const to = whole ? around : Math.max(from, fraction * around - thickness / 2);
  const point = (s: number) => {
    const r = length > 0 ? radius + swing.amplitude * Math.sin(2 * Math.PI * (s / length - swing.phase)) : radius;
    const angle = s / radius;
    return `${fix(centre + r * Math.cos(angle))} ${fix(centre + r * Math.sin(angle))}`;
  };
  const points = [`M${point(from)}`];
  for (let s = Math.ceil(from); s < to; s++) points.push(`L${point(s)}`);
  points.push(whole ? 'Z' : `L${point(to)}`);
  return points.join('');
}

/** A CSS `cubic-bezier(…)` as a function of time (0 to 1); anything else is linear. */
export function easing(css: string | null): (t: number) => number {
  const m = /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/.exec(css ?? '');
  if (!m) return (t) => t;
  const [x1, y1, x2, y2] = m.slice(1).map(Number);
  const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (t) => {
    if (t <= 0 || t >= 1) return Math.min(1, Math.max(0, t));
    // The curve's x is found by halving, then its y read there.
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < t) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}
