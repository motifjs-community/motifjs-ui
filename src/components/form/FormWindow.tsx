import { Component, reactive, read, type ComponentBase } from '@motifx/core';
import type { MxForm } from './MxForm';

type Edge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const EDGES: { edge: Edge }[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map((edge) => ({ edge: edge as Edge }));

// Events that stop at the window's root: inside the window they bubble as
// usual, but they never reach the component the window was added to (a list
// row's onclick must not fire for a click in a window opened from that row).
// Capture-phase listeners above (e.g. app-wide shortcuts) still see them.
const CONTAINED_EVENTS = [
  'click', 'dblclick', 'auxclick', 'contextmenu',
  'pointerdown', 'pointerup', 'pointermove', 'pointerover', 'pointerout', 'pointercancel',
  'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'wheel',
  'touchstart', 'touchmove', 'touchend', 'touchcancel',
  'keydown', 'keyup', 'keypress', 'beforeinput', 'input', 'change', 'submit', 'reset', 'select', 'invalid',
  'focusin', 'focusout', 'copy', 'cut', 'paste',
  'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
] as const;

// How much of a moved window must stay on screen, in px.
const KEEP_VISIBLE_X = 48;
const KEEP_VISIBLE_Y = 32;

/**
 * The floating presentation of an {@link MxForm}: a native `<dialog>` that
 * opens modeless (`show`) or modal (`showModal`: top layer, the rest of the
 * page inert, Tab kept inside). It owns the window geometry — moving,
 * resizing from the edges, docking into a minimize target — and contains the
 * window's events. Internal: created by `MxForm`.
 *
 * Geometry is physical (left/top, pointer coordinates), not logical: a window
 * goes where the pointer puts it, in LTR and RTL alike.
 */
export class FormWindow extends Component<HTMLDialogElement> {
  private readonly ui = reactive({ docked: false, placed: false });
  private rect: Rect | null = null;
  private gesture: { kind: 'move' | Edge; x: number; y: number; start: Rect } | null = null;

  constructor(
    readonly form: MxForm,
    readonly modal: boolean,
    /** Adds this window back to where it was shown (after being docked). */
    private readonly attachToHost: (win: FormWindow) => void,
    /** `false` for a window created ahead of time (JSX `x-model`), opened later with `open()`. */
    private readonly openOnMount = true,
  ) {
    super('dialog');
  }

  /** Whether the window currently sits docked in its minimize target. Reactive. */
  get isMinimizedIn(): boolean {
    return this.ui.docked;
  }

  private get canResize(): boolean {
    return read(this.form.props.resizable) !== false && this.form.windowState === 'normal' && !this.ui.docked;
  }

  override onConfigured(): void {
    this.class.add('mx-form-window');
    this.attr.add({
      'data-modal': this.modal ? '' : null,
      'aria-labelledby': this.form.titleId,
      'data-window-state': () => this.form.windowState,
      'data-active': () => (this.form.isActive ? '' : null),
      'data-minimized-in': () => (this.ui.docked ? '' : null),
      'data-placed': () => (this.ui.placed ? '' : null),
    });
    // Escape on a modal: the form decides; the browser must not close the
    // <dialog> behind the form's back.
    this.motif.on('cancel', (_s, e: Event) => e.preventDefault());
    // A click anywhere in this window (not in a window nested inside it) brings it to the front.
    this.motif.on('pointerdown', (_s, e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.('.mx-form-window') === this.element) this.form.activate();
    });

    const stop = (e: Event) => e.stopPropagation();
    for (const type of CONTAINED_EVENTS) this.element.addEventListener(type, stop);
    this.motif.setDisposable(() => {
      for (const type of CONTAINED_EVENTS) this.element.removeEventListener(type, stop);
    });
  }

  override view() {
    return (
      <>
        {EDGES.map((item) => (
          <div
            key={item.edge}
            class="mx-form-window__resize"
            data-edge={item.edge}
            aria-hidden="true"
            x-display={() => this.canResize}
            onpointerdown={(e: PointerEvent) => this.begin(e, item.edge)}
            onpointermove={(e: PointerEvent) => this.track(e)}
            onpointerup={(e: PointerEvent) => this.end(e)}
            onpointercancel={(e: PointerEvent) => this.end(e)}
          ></div>
        ))}
      </>
    );
  }

  override onMounted(): void {
    if (this.openOnMount) this.open();
  }

  /** Opens the native dialog (modal or not) and tells the form. */
  open(): void {
    const el = this.element;
    if (!el.open) {
      if (this.modal) el.showModal();
      else el.show();
    }
    this.form.windowOpened(this);
  }

  /** Closes the native dialog. */
  closeNative(): void {
    if (this.element.open) this.element.close();
  }

  // ---- docking (minimize to a target) -------------------------------------

  /** Moves the window into `target` (a taskbar-like area); it keeps its state. */
  minimizeInto(target: ComponentBase): void {
    target.controls.add(this);
    this.ui.docked = true;
  }

  /** Puts a docked window back where it was shown. */
  restoreFromTarget(): void {
    if (!this.ui.docked) return;
    this.ui.docked = false;
    this.attachToHost(this);
  }

  // ---- moving and resizing --------------------------------------------------

  /** Starts moving the window from a pointerdown on its title bar. */
  beginMove(e: PointerEvent): void {
    if (this.form.windowState !== 'normal' || this.ui.docked) return;
    this.begin(e, 'move');
  }

  private begin(e: PointerEvent, kind: 'move' | Edge): void {
    if (e.button !== 0) return;
    this.place();
    this.gesture = { kind, x: e.clientX, y: e.clientY, start: { ...this.rect! } };
    (e.currentTarget as HTMLElement | null)?.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  }

  /** Pointer moved during a move/resize gesture. */
  track(e: PointerEvent): void {
    const g = this.gesture;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    const s = g.start;
    let { x, y, w, h } = s;
    if (g.kind === 'move') {
      x += dx;
      y += dy;
    } else {
      const style = getComputedStyle(this.element);
      const minW = parseFloat(style.minWidth) || 0;
      const minH = parseFloat(style.minHeight) || 0;
      if (g.kind.includes('e')) w = Math.max(minW, s.w + dx);
      if (g.kind.includes('w')) {
        w = Math.max(minW, s.w - dx);
        x = s.x + s.w - w;
      }
      if (g.kind.includes('s')) h = Math.max(minH, s.h + dy);
      if (g.kind.includes('n')) {
        h = Math.max(minH, s.h - dy);
        y = s.y + s.h - h;
      }
    }
    // Keep enough of the window on screen to grab it again.
    x = Math.min(Math.max(x, KEEP_VISIBLE_X - w), window.innerWidth - KEEP_VISIBLE_X);
    y = Math.min(Math.max(y, 0), window.innerHeight - KEEP_VISIBLE_Y);
    this.rect = { x, y, w, h };
    this.apply();
  }

  /** Ends a move/resize gesture. */
  end(e: PointerEvent): void {
    if (!this.gesture) return;
    this.gesture = null;
    (e.currentTarget as HTMLElement | null)?.releasePointerCapture?.(e.pointerId);
  }

  /** Switches from the centered default to explicit coordinates, keeping the current spot. */
  private place(): void {
    if (this.rect) return;
    const r = this.element.getBoundingClientRect();
    this.rect = { x: r.left, y: r.top, w: r.width, h: r.height };
    this.ui.placed = true;
    this.apply();
  }

  private apply(): void {
    const { x, y, w, h } = this.rect!;
    const style = this.element.style;
    style.setProperty('--_mx-x', `${x}px`);
    style.setProperty('--_mx-y', `${y}px`);
    style.setProperty('--_mx-w', `${w}px`);
    style.setProperty('--_mx-h', `${h}px`);
  }
}
