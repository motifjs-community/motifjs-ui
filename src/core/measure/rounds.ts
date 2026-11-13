import { errorHandler, untracked, type ComponentBase } from '@motifx/core';
import { viewOf, whenWindowGoes } from './element-of';
import type { Job } from './job';
import type { Loop } from './loop';
import { forgetReads } from './round-reads';
import type { View } from './view';
import type { WindowFrame } from './window-frame';

// The layer works in runs, one window at a time: at that window's next frame, before the screen is drawn (a timer
// stands in for a window that draws no frames), or at once through measureNow. A run is made of rounds: the notices of
// onLayout (they may write a state to measure and ask for reads), then every read, then every write. What a write asks
// for gets the next round a microtask later, after core has made the scrolls and focus moves written in it. The size
// and sight observers only note what they saw and ask for the next frame: work in their callbacks would make the
// browser hold back the reports of parts at the same depth or above, with an error.

const MOST_ROUNDS = 8;
const MOST_TRIES = 16;
/** A window that draws no frames (in the background, being closed) still runs its work this much later. */
const LONGEST_WAIT = 200;
const FRAME_TIME = 16;
const SKIPPED = Symbol('skipped');

const frames = new WeakMap<View, WindowFrame>();
/** Jobs not run yet, by owner and read: the same read and write asked for again run once. */
const queued = new WeakMap<ComponentBase, Map<unknown, Job>>();
const loops = new Set<Loop>();
const afterRead: (() => void)[] = [];
/** What development heard of outside a run: once a session. */
const warnedOutside = new Set<string>();
let phase: 'notice' | 'read' | 'write' | null = null;
let current: WindowFrame | null = null;
let runs = 0;
let again = 0;
let watching = false;

/**
 * Reads with the next round of `owner`'s window, with every other read of it, then hands what was read to `write` after
 * all of them. Asked for again before it runs (the same `read` and `write`), it runs once; asked for in a write, it runs
 * in the next round of the same frame. Nothing runs for an owner disposed by then. Returns what takes it back.
 */
export function measure<T>(owner: ComponentBase, read: () => T, write: (value: T) => void): () => void {
  const view = viewOf(owner);
  if (!view) return () => {};
  let asked = queued.get(owner);
  const known = asked?.get(read);
  if (known && known.write === write && !known.cancelled) return () => cancel(known);
  const job: Job = { owner, read, write: write as (value: unknown) => void, cancelled: false };
  if (!asked) queued.set(owner, (asked = new Map()));
  asked.set(read, job);
  queue(frameOf(view), job);
  return () => cancel(job);
}

/**
 * Runs the work waiting in `owner`'s window now, round after round, for what needs an answer at once: a test, a print,
 * an export. The rounds after the first run before core makes the scrolls written in them: a box counts them, the parts
 * inside it do not yet. Inside a round of any window it does nothing, and development hears of it.
 */
export function measureNow(owner: ComponentBase): void {
  const view = viewOf(owner);
  if (!view) return;
  const frame = frameOf(view);
  if (phase !== null || frame.running) warn(frame, 'now', 'measureNow() inside a run measures nothing at once; the work runs in a round of that run.');
  else begin(frame, false, true);
}

/** Resolves once the next run of `owner`'s window is over: what was asked before it is measured and written. */
export function whenMeasured(owner: ComponentBase): Promise<void> {
  const view = viewOf(owner);
  if (!view) return Promise.resolve();
  const frame = frameOf(view);
  return new Promise((done) => {
    frame.done.push(done);
    ask(frame);
  });
}

/** Whether work waits in `owner`'s window: asked for and not run yet, or a run going on. A test waits for it to be over. */
export function isMeasurePending(owner: ComponentBase): boolean {
  const view = viewOf(owner);
  const frame = view ? frames.get(view) : undefined;
  return !!frame && (frame.running || frame.jobs.length > 0 || frame.notices.size > 0);
}

/**
 * Reads in the middle of a write, after what it wrote: the one layout on purpose, for a fit that tries a layout and
 * measures it. Development hears of it outside a write, and of a run that does it more than MOST_TRIES times.
 */
export function readAgain<T>(read: () => T): T {
  const frame = current;
  if (phase !== 'write') warn(frame, 'again', 'readAgain() belongs in the write of a measure; anywhere else, read in the read.');
  else if (frame && ++frame.tries > MOST_TRIES) warn(frame, 'tries', `readAgain() laid the page out more than ${MOST_TRIES} times in one run; measure what may fit in the read instead.`);
  forgetReads();
  again++;
  try {
    return untracked(read);
  } finally {
    again--;
  }
}

/** Calls `notice` at the start of the next round of `component`'s window, before its reads; one per `key`, the last wins. */
export function queueNotice(component: ComponentBase, key: object, notice: () => void): void {
  const view = viewOf(component);
  if (!view) return;
  const frame = frameOf(view);
  frame.notices.set(key, { component, notice });
  ask(frame);
}

export function addLoop(loop: Loop): void {
  loops.add(loop);
  if (loop.view) ask(frameOf(loop.view));
}

export function removeLoop(loop: Loop): void {
  loops.delete(loop);
}

/** Runs `make` once the reads going on are over (at once outside them): a part made while reading would change the page under them. */
export function afterReads(make: () => void): void {
  if (phase === 'read') afterRead.push(make);
  else make();
}

export function isReading(): boolean {
  return phase === 'read';
}

/** The run a round going on belongs to, to keep what is read in it (a direction); -1 outside rounds. */
export function runNumber(): number {
  return current ? current.run : -1;
}

/** A layout read hit the page: development hears of one in a write or a notice, where it lays the page out again. */
export function noteRead(): void {
  if (again > 0) return;
  if (phase === 'write') warn(current, 'write', 'A layout read in the write of a measure lays the page out again; read it in the read.');
  else if (phase === 'notice') warn(current, 'notice', 'A layout read in an onLayout callback lays the page out once per callback; ask for it with measure().');
}

/** Tells development once about a call the layer took another way. */
export function warnOnce(kind: string, message: string): void {
  warn(null, kind, message);
}

function frameOf(view: View): WindowFrame {
  let frame = frames.get(view);
  if (!frame) {
    frame = { view, jobs: [], notices: new Map(), waiting: null, running: false, run: 0, rounds: 0, tries: 0, warned: new Set(), done: [] };
    frames.set(view, frame);
    watchClosing();
  }
  return frame;
}

function queue(frame: WindowFrame, job: Job): void {
  frame.jobs.push(job);
  ask(frame);
}

function cancel(job: Job): void {
  job.cancelled = true;
  forget(job);
}

function forget(job: Job): void {
  const asked = queued.get(job.owner);
  if (asked?.get(job.read) === job) asked.delete(job.read);
}

function ask(frame: WindowFrame): void {
  if (frame.waiting || frame.running) return;
  const view = frame.view;
  const go = () => begin(frame, true, false);
  let id = 0;
  try {
    if (!view.closed && typeof view.requestAnimationFrame === 'function') id = view.requestAnimationFrame(go);
  } catch {
    id = 0;
  }
  const timer = setTimeout(go, id ? LONGEST_WAIT : FRAME_TIME);
  frame.waiting = () => {
    clearTimeout(timer);
    if (!id) return;
    try {
      view.cancelAnimationFrame(id);
    } catch {
      // The window closed in between: its frame is gone with it.
    }
  };
}

function begin(frame: WindowFrame, withLoops: boolean, now: boolean): void {
  frame.waiting?.();
  frame.waiting = null;
  if (frame.running) return;
  frame.running = true;
  frame.rounds = 0;
  frame.tries = 0;
  frame.warned.clear();
  frame.run = ++runs;
  rounds(frame, withLoops, now);
}

function rounds(frame: WindowFrame, withLoops: boolean, now: boolean): void {
  for (;;) {
    current = frame;
    try {
      round(frame, withLoops && frame.rounds === 0);
    } catch (error) {
      report(error);
    } finally {
      phase = null;
      current = null;
      forgetReads();
    }
    const more = frame.jobs.length > 0 || frame.notices.size > 0;
    if (!more || frame.rounds >= MOST_ROUNDS) {
      end(frame, more);
      return;
    }
    if (!now) {
      // Core makes what this round wrote through method keys a microtask later: the next reads come after it.
      queueMicrotask(() => rounds(frame, false, false));
      return;
    }
  }
}

function round(frame: WindowFrame, withLoops: boolean): void {
  frame.rounds++;
  phase = 'notice';
  const notices = [...frame.notices];
  frame.notices.clear();
  for (const [key, { component, notice }] of notices) {
    const view = viewOf(component);
    if (view && view !== frame.view) queueNotice(component, key, notice);
    else if (view) attempt(notice, undefined);
  }
  const jobs = take(frame);
  if (withLoops) for (const loop of loops) if (loop.view === frame.view && !loop.job.cancelled) jobs.push(loop.job);
  phase = 'read';
  forgetReads();
  const values = jobs.map((job) => (job.cancelled || job.owner.isDisposed ? SKIPPED : attempt(job.read, SKIPPED)));
  phase = 'write';
  forgetReads();
  for (const make of afterRead.splice(0)) attempt(make, undefined);
  jobs.forEach((job, i) => {
    const value = values[i];
    if (value !== SKIPPED && !job.cancelled && !job.owner.isDisposed) attempt(() => job.write(value), undefined);
  });
}

/** The jobs of this round; one whose owner is in another window now goes to that window, still asked. */
function take(frame: WindowFrame): Job[] {
  const jobs: Job[] = [];
  for (const job of frame.jobs.splice(0)) {
    if (job.cancelled || job.owner.isDisposed) {
      forget(job);
      continue;
    }
    const view = viewOf(job.owner);
    if (view && view !== frame.view) {
      queue(frameOf(view), job);
      continue;
    }
    forget(job);
    jobs.push(job);
  }
  return jobs;
}

function end(frame: WindowFrame, more: boolean): void {
  frame.running = false;
  if (more) warn(frame, 'rounds', `Layout work still asked for more after ${MOST_ROUNDS} rounds; the rest waits for the next frame.`);
  if (more || hasLoops(frame.view)) ask(frame);
  for (const done of frame.done.splice(0)) done();
}

function hasLoops(view: View): boolean {
  for (const loop of loops) if (loop.view === view && !loop.job.cancelled && !loop.owner.isDisposed) return true;
  return false;
}

/** A window that closes takes its frame along; work whose owner is elsewhere now goes there. */
function watchClosing(): void {
  if (watching) return;
  watching = true;
  whenWindowGoes((view) => {
    const frame = frames.get(view);
    if (!frame) return;
    frame.waiting?.();
    frame.waiting = null;
    frames.delete(view);
    for (const job of frame.jobs.splice(0)) {
      const now = viewOf(job.owner);
      if (now && now !== view && !job.cancelled) queue(frameOf(now), job);
      else forget(job);
    }
    frame.notices.clear();
    for (const done of frame.done.splice(0)) done();
  });
}

function attempt<T>(fn: () => T, failed: T): T {
  try {
    return untracked(fn);
  } catch (error) {
    report(error);
    return failed;
  }
}

function report(error: unknown): void {
  errorHandler.report(error instanceof Error ? error : new Error(String(error)));
}

function warn(frame: WindowFrame | null, kind: string, message: string): void {
  const warned = frame ? frame.warned : warnedOutside;
  if (warned.has(kind) || !errorHandler.isDevelopment()) return;
  warned.add(kind);
  errorHandler.reportSuppressed('measure', new Error(`measure: ${message}`));
}
