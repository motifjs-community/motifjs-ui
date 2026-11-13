import type { Component, ComponentBase } from '@motifx/core';
import { removePart } from '../../core/draw-parts';
import { everyFrame, mediaOf, onLayout, onMedia, rectOf, styleOf } from '../../core/measure';
import { put } from '../../core/part-writes';
import { svgComponent } from '../../parts/chart/svg-parts';
import { linePath, ringPath } from './wave-geometry';

const REDUCED = '(prefers-reduced-motion: reduce)';

/** What a frame reads: the size of the drawing, the thickness of its line, and the bar's `--_fraction` now. */
interface WaveRead {
  width: number;
  height: number;
  thickness: number;
  shown: number;
}

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
  private readonly path: Component<SVGPathElement>;
  /** The line's own drawing; the arc's path goes into the circle (`holder`). */
  private readonly svg: Component<SVGSVGElement> | null = null;
  private readonly stopSize: () => void;
  private readonly stopSight: () => void;
  /** Reduced motion asked for in the bar's window. */
  private calm: boolean;
  private readonly stopCalm: () => void;
  private look: WaveLook;
  private target = 0;
  private swingFrom = 0;
  private swingTo = 0;
  private swingSince = 0;
  private phase = 0;
  private stopFrames: (() => void) | null = null;
  private last = 0;
  private seen = true;

  constructor(
    private readonly host: Component<HTMLElement>,
    private readonly holder: ComponentBase,
    readonly shape: 'line' | 'circle',
    look: WaveLook,
  ) {
    this.look = look;
    // Parts of `holder` (the track, or the ring), as SVG parts are.
    if (shape === 'line') {
      const svg = svgComponent(holder, 'svg', 'mx-progress__wave');
      svg.attr.add({ 'aria-hidden': 'true' });
      this.svg = svg;
      this.path = svgComponent(svg, 'path');
    } else {
      this.path = svgComponent(holder, 'path', 'mx-progress__arc');
    }
    this.calm = mediaOf(host, REDUCED);
    this.stopCalm = onMedia(host, REDUCED, (calm) => (this.calm = calm));
    this.stopSize = onLayout(this.svg ?? holder, 'size', () => this.kick(), { owner: host });
    this.stopSight = onLayout(host, 'sight', (seen) => {
      this.seen = seen;
      if (seen) this.kick();
      else this.stop();
    });
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
    this.kick();
  }

  dispose(): void {
    this.stop();
    this.stopSize();
    this.stopSight();
    this.stopCalm();
    removePart(this.svg ?? this.path);
  }

  /** Draws at every frame of the bar's window until nothing moves. */
  private kick(): void {
    if (this.stopFrames || !this.seen) return;
    this.stopFrames = everyFrame(this.host, this.readFrame, this.drawFrame);
  }

  private stop(): void {
    this.stopFrames?.();
    this.stopFrames = null;
    this.last = 0;
  }

  private readonly readFrame = (): WaveRead => {
    const box = rectOf(this.svg ?? this.holder);
    const stroke = styleOf(this.path, ['stroke-width'])['stroke-width'];
    const fraction = styleOf(this.host, ['--_fraction'])['--_fraction'];
    return { width: box.width, height: box.height, thickness: parseFloat(stroke) || 0, shown: parseFloat(fraction) || 0 };
  };

  private readonly drawFrame = (read: WaveRead): false | void => {
    const now = performance.now();
    const spent = this.last ? Math.min(now - this.last, 100) : 0;
    this.last = now;
    const swing = this.swingAt(now);
    const look = this.look;
    const travels = swing > 0 && look.speed > 0 && !this.calm;
    if (travels) this.phase = (this.phase + ((look.backward ? -1 : 1) * spent) / look.speed + 1) % 1;
    this.draw(read, swing);
    if (travels || swing !== this.swingTo || Math.abs(read.shown - this.target) > 1e-4) return;
    this.stopFrames = null;
    this.last = 0;
    return false;
  };

  private swingAt(now: number): number {
    const { grow, easing } = this.look;
    const done = grow > 0 ? (now - this.swingSince) / grow : 1;
    if (done >= 1) return this.swingTo;
    return this.swingFrom + (this.swingTo - this.swingFrom) * easing(Math.max(0, done));
  }

  private draw(read: WaveRead, amplitude: number): void {
    const swing = { amplitude, length: this.look.length, phase: this.phase };
    const { shown, width, height, thickness: t } = read;
    let d: string;
    if (this.shape === 'line') {
      d = linePath(shown * width, height, t, swing);
    } else {
      // The ring's middle line: the drawing holds the circle and room for the wave all round.
      const centre = width / 2;
      d = ringPath(centre, centre - this.look.amplitude - t / 2, t, shown, swing);
    }
    put(this.path, 'd', d);
  }
}
