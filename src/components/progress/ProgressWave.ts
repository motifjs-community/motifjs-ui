import { ResizeWatch } from '../../core/resize-watch';
import { linePath, ringPath } from './wave-geometry';

const SVG = 'http://www.w3.org/2000/svg';

/** What the design language gives a wave: lengths in px, times in ms, the shares of the work as 0 to 1. */
export interface WaveLook {
  amplitude: number;
  length: number;
  /** One wave length's travel; 0: still. */
  speed: number;
  backward: boolean;
  /** From this share the line is a wave, from `end` on straight again. */
  start: number;
  end: number;
  /** How long the swing takes to grow in or flatten out. */
  grow: number;
  easing: (t: number) => number;
}

/**
 * A ProgressBar's line or arc drawn as a wave that travels: straight while little is done, a wave while it
 * grows, straight again near the end, the swing easing in and out. The length drawn is the bar's own
 * `--_fraction`, so it glides with the rest of the bar. It draws a frame only while something moves (the wave,
 * its swing, the value) and the bar is in sight, and keeps still under reduced motion.
 */
export class ProgressWave {
  private readonly path: SVGPathElement;
  /** The line's own drawing; the arc's path goes into the circle. */
  private readonly svg: SVGSVGElement | null = null;
  private readonly sizes: ResizeWatch;
  private readonly sight: IntersectionObserver | null = null;
  private readonly calm: MediaQueryList | null;
  private look: WaveLook;
  private target = 0;
  private swingFrom = 0;
  private swingTo = 0;
  private swingSince = 0;
  private phase = 0;
  private frame = 0;
  private last = 0;
  private seen = true;
  private width = 0;
  private height = 0;
  private thickness = 0;

  constructor(
    private readonly host: HTMLElement,
    holder: Element,
    readonly shape: 'line' | 'circle',
    look: WaveLook,
  ) {
    this.look = look;
    const view = host.ownerDocument.defaultView;
    this.path = document.createElementNS(SVG, 'path');
    if (shape === 'line') {
      this.svg = document.createElementNS(SVG, 'svg');
      this.svg.classList.add('mx-progress__wave');
      this.svg.setAttribute('aria-hidden', 'true');
      this.svg.append(this.path);
      holder.append(this.svg);
    } else {
      this.path.classList.add('mx-progress__arc');
      holder.append(this.path);
    }
    this.calm = view?.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
    this.sizes = new ResizeWatch(() => {
      this.measure();
      this.kick();
    });
    this.sizes.observe(this.svg ?? holder);
    const Sight = view?.IntersectionObserver;
    if (typeof Sight === 'function') {
      this.sight = new Sight((entries) => {
        this.seen = entries[entries.length - 1].isIntersecting;
        if (this.seen) this.kick();
        else this.stop();
      });
      this.sight.observe(host);
    }
    this.measure();
  }

  /** The language's wave and the share of the work done now (0 to 1). */
  update(look: WaveLook, target: number): void {
    this.look = look;
    this.target = target;
    const swing = target > look.start && target < look.end ? look.amplitude : 0;
    if (swing !== this.swingTo) {
      this.swingFrom = this.swingAt(performance.now());
      this.swingTo = swing;
      this.swingSince = performance.now();
    }
    this.measure();
    this.kick();
  }

  /** Reads the size of the drawing and the thickness of its line again. */
  measure(): void {
    const box = (this.svg ?? (this.path.ownerSVGElement as SVGSVGElement | null))?.getBoundingClientRect();
    this.width = box?.width ?? 0;
    this.height = box?.height ?? 0;
    this.thickness = parseFloat(getComputedStyle(this.path).strokeWidth) || 0;
  }

  dispose(): void {
    this.stop();
    this.sizes.disconnect();
    this.sight?.disconnect();
    (this.svg ?? this.path).remove();
  }

  private kick(): void {
    if (this.frame || !this.seen) return;
    const view = this.host.ownerDocument.defaultView;
    if (view) this.frame = view.requestAnimationFrame(this.tick);
  }

  private stop(): void {
    if (this.frame) this.host.ownerDocument.defaultView?.cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.last = 0;
  }

  private readonly tick = (now: number): void => {
    this.frame = 0;
    const spent = this.last ? Math.min(now - this.last, 100) : 0;
    this.last = now;
    const swing = this.swingAt(now);
    const look = this.look;
    const travels = swing > 0 && look.speed > 0 && !this.calm?.matches;
    if (travels) this.phase = (this.phase + ((look.backward ? -1 : 1) * spent) / look.speed + 1) % 1;
    const shown = parseFloat(getComputedStyle(this.host).getPropertyValue('--_fraction')) || 0;
    this.draw(shown, swing);
    if (travels || swing !== this.swingTo || Math.abs(shown - this.target) > 1e-4) this.kick();
    else this.last = 0;
  };

  private swingAt(now: number): number {
    const { grow, easing } = this.look;
    const done = grow > 0 ? (now - this.swingSince) / grow : 1;
    if (done >= 1) return this.swingTo;
    return this.swingFrom + (this.swingTo - this.swingFrom) * easing(Math.max(0, done));
  }

  private draw(shown: number, amplitude: number): void {
    const swing = { amplitude, length: this.look.length, phase: this.phase };
    const t = this.thickness;
    let d: string;
    if (this.shape === 'line') {
      d = linePath(shown * this.width, this.height, t, swing);
    } else {
      // The ring's middle line: the drawing holds the circle and room for the wave all round.
      const centre = this.width / 2;
      d = ringPath(centre, centre - this.look.amplitude - t / 2, t, shown, swing);
    }
    if (this.path.getAttribute('d') !== d) this.path.setAttribute('d', d);
  }
}
