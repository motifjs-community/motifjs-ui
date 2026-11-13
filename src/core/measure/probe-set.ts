import type { Component, ComponentBase } from '@motifx/core';
import { part, removePart } from '../draw-parts';
import { css, put } from '../part-writes';
import { tellLook } from './look';
import { observe } from './observers';
import type { Size } from './size';
import { Watcher } from './watcher';
import type { WindowBound } from './window-bound';

// The probes stand in a box as large as the owner's place for absolute parts, which clips them and is never seen: a
// long length never widens the page, and a share (25%) is a share of that room.
const BOX: readonly [string, string][] = [
  ['position', 'absolute'],
  ['inset', '0'],
  ['overflow', 'hidden'],
  ['visibility', 'hidden'],
  ['pointer-events', 'none'],
  ['contain', 'strict'],
];

/** How a length is known in a probe set: its axis and itself. */
export function lengthKey(length: string, block: boolean): string {
  return `${block ? 'block' : 'inline'} ${length}`;
}

/** The hidden probes of one owner: parts sized by a length, read as that length in pixels. */
export class ProbeSet implements WindowBound {
  /** By key: the length, its axis, its probe once made, what it was read as, whether it was laid out then, and the look it was read under (-1: read again). */
  readonly lengths = new Map<string, { length: string; block: boolean; probe: Component<HTMLSpanElement> | null; px: number; laidOut: boolean; version: number }>();
  private box: Component<HTMLSpanElement> | null = null;
  private readonly undo = new Map<string, () => void>();
  private attached = false;
  private stopped = false;

  constructor(private readonly owner: ComponentBase) {}

  get isStopped(): boolean {
    return this.stopped;
  }

  /** Notes `length` under `key` the first time; its probe is made with `make`. */
  note(key: string, length: string, block: boolean): void {
    if (!this.lengths.has(key)) this.lengths.set(key, { length, block, probe: null, px: 0, laidOut: false, version: -1 });
  }

  /** Makes the probe of `key`: a token (`--name`) or any CSS length. */
  make(key: string): void {
    const entry = this.lengths.get(key);
    if (!entry || entry.probe || this.stopped || this.owner.isDisposed) return;
    const probe = part<HTMLSpanElement>(this.box ?? this.makeBox(), 'span', 'mx-measure-probe');
    css(probe, 'position', 'absolute');
    css(probe, entry.block ? 'inline-size' : 'block-size', '0');
    css(probe, entry.block ? 'block-size' : 'inline-size', entry.length.startsWith('--') ? `var(${entry.length})` : entry.length);
    entry.probe = probe;
    if (this.attached) this.watch(key, probe);
  }

  attach(): void {
    this.attached = true;
    for (const [key, entry] of this.lengths) if (entry.probe) this.watch(key, entry.probe);
  }

  detach(): void {
    this.attached = false;
    for (const undo of this.undo.values()) undo();
    this.undo.clear();
  }

  arrived(): void {}

  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    this.detach();
    removePart(this.box);
    this.box = null;
  }

  private makeBox(): Component<HTMLSpanElement> {
    const box = part<HTMLSpanElement>(this.owner, 'span', 'mx-measure-probes');
    put(box, 'aria-hidden', 'true');
    for (const [name, value] of BOX) css(box, name, value);
    this.box = box;
    // The probes go with the box and the box with its owner: one watcher follows them all.
    Watcher.of(box).hold(this);
    return box;
  }

  private watch(key: string, probe: ComponentBase): void {
    this.undo.get(key)?.();
    this.undo.set(key, observe(probe, 'border', (size) => this.resized(key, size)));
  }

  /** A probe came out another size (a stylesheet that came late, another language): it is read again, and the owner's look watches hear it. */
  private resized(key: string, size: Size): void {
    const entry = this.lengths.get(key);
    if (!entry) return;
    const px = entry.block ? size.height : size.width;
    if (entry.version !== -1 && px === entry.px) return;
    entry.version = -1;
    tellLook(this.owner);
  }
}
