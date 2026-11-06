import type { ColorHsva } from './color-hsva';
import type { ColorRgba } from './color-rgba';

const clamp = (n: number, low: number, high: number) => Math.min(Math.max(n, low), high);

/**
 * Reads a color written as `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb(…)` or `rgba(…)`; `null` when it is none
 * of them.
 */
export function parseColor(text: string | null | undefined): ColorRgba | null {
  const t = (text ?? '').trim().toLowerCase();
  let m = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(t);
  if (m) {
    let hex = m[1];
    if (hex.length <= 4) hex = [...hex].map((c) => c + c).join('');
    const n = (i: number) => parseInt(hex.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: hex.length === 8 ? Math.round((n(6) / 255) * 100) / 100 : 1 };
  }
  m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+)(%)?)?\s*\)$/.exec(t);
  if (m) {
    const alpha = m[4] === undefined ? 1 : Number(m[4]) / (m[5] ? 100 : 1);
    return { r: clamp(Math.round(Number(m[1])), 0, 255), g: clamp(Math.round(Number(m[2])), 0, 255), b: clamp(Math.round(Number(m[3])), 0, 255), a: clamp(alpha, 0, 1) };
  }
  return null;
}

/** `#rrggbb`, or `#rrggbbaa` when it is not opaque. */
export function formatColor(c: ColorRgba): string {
  const hex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${hex(c.r)}${hex(c.g)}${hex(c.b)}${c.a < 1 ? hex(c.a * 255) : ''}`;
}

export function rgbaToHsva({ r, g, b, a }: ColorRgba): ColorHsva {
  const [rr, gg, bb] = [r / 255, g / 255, b / 255];
  const max = Math.max(rr, gg, bb);
  const d = max - Math.min(rr, gg, bb);
  let h = 0;
  if (d) {
    if (max === rr) h = ((gg - bb) / d) % 6;
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max ? d / max : 0, v: max, a };
}

export function hsvaToRgba({ h, s, v, a }: ColorHsva): ColorRgba {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
  };
  return { r: Math.round(f(5)), g: Math.round(f(3)), b: Math.round(f(1)), a };
}
