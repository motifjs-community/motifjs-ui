import { SwipeTracker } from "../overlay/swipe-tracker";
import type { SlideTrackHost } from "./slide-track-host";

// A pointer that moved this far is a drag; one faster than this (px/ms) decides without the distance.
const SLOP = 8;
const FLICK = 0.3;
// The longest a move is waited for when the transition never says it ended (motion off).
const SETTLE = 700;

interface Drag {
    id: number;
    x: number;
    y: number;
    decided: boolean;
    taken: boolean;
    width: number;
    tracker: SwipeTracker;
}

/**
 * Panes side by side in a viewport, the current one in view: the track slides to a pane, follows a finger or a
 * pointer while it drags, and lands on the next or the previous pane when the drag was far or fast enough. Around
 * the ends (`loop`) the pane on the other side is set next to the current one for the move, so the track never
 * runs across every pane between. The gallery and the multi-view are built on it; the panes are the track's
 * children, each `1 / perView` of its width with `--_gap` between them.
 */
export class SlideTrack {
    viewport: HTMLElement;
    track: HTMLElement;
    host: SlideTrackHost;
    drag: Drag | null = null;
    wrapped: HTMLElement | null = null;
    settleTimer = 0;
    swallowClick = false;
    stop: () => void;

    constructor(viewport: HTMLElement, track: HTMLElement, host: SlideTrackHost) {
        this.viewport = viewport;
        this.track = track;
        this.host = host;
        const down = (e: PointerEvent) => this.pointerDown(e);
        const move = (e: PointerEvent) => this.pointerMove(e);
        const up = (e: PointerEvent) => this.pointerUp(e, false);
        const cancel = (e: PointerEvent) => this.pointerUp(e, true);
        // The click that follows a drag is not a click on what is under the pointer.
        const click = (e: MouseEvent) => {
            if (!this.swallowClick) return;
            this.swallowClick = false;
            e.stopPropagation();
            e.preventDefault();
        };
        const ended = (e: TransitionEvent) => {
            if (e.target === track && e.propertyName === 'translate') this.settle();
        };
        viewport.addEventListener('pointerdown', down);
        viewport.addEventListener('pointermove', move);
        viewport.addEventListener('pointerup', up);
        viewport.addEventListener('pointercancel', cancel);
        viewport.addEventListener('click', click, true);
        track.addEventListener('transitionend', ended);
        this.stop = () => {
            viewport.removeEventListener('pointerdown', down);
            viewport.removeEventListener('pointermove', move);
            viewport.removeEventListener('pointerup', up);
            viewport.removeEventListener('pointercancel', cancel);
            viewport.removeEventListener('click', click, true);
            track.removeEventListener('transitionend', ended);
            window.clearTimeout(this.settleTimer);
        };
    }

    /** Puts the pane in view where it stands now, without a drag. */
    layout(): void {
        this.place(this.first(this.host.index()), 0);
    }

    /** Slides from one pane to another; around the ends the far pane is brought next to the one leaving. */
    slide(from: number, to: number): void {
        this.settle();
        const count = this.host.count();
        const wraps = this.host.loop() && this.host.perView() === 1 && count > 1 && from >= 0;
        const forward = from === count - 1 && to === 0;
        const backward = from === 0 && to === count - 1;
        const pane = wraps && (forward || backward) ? this.host.pane(to) : null;
        if (!pane) {
            this.layout();
            return;
        }
        // The pane is moved to the far side of the track for this one move, and the track slides on to it.
        this.wrapped = pane;
        pane.style.translate = `calc(${-this.sign()} * ${forward ? count : -count} * ${this.step()}) 0`;
        this.place(forward ? count : -1, 0);
        this.settleTimer = window.setTimeout(() => this.settle(), SETTLE);
    }

    dispose(): void {
        this.stop();
        this.drag = null;
    }

    // After a move around the ends: the pane goes back to its place and the track jumps there without motion.
    settle(): void {
        window.clearTimeout(this.settleTimer);
        this.settleTimer = 0;
        const pane = this.wrapped;
        if (!pane) return;
        this.wrapped = null;
        pane.style.translate = '';
        this.track.toggleAttribute('data-no-motion', true);
        this.layout();
        // Read once so the jump is laid out before the motion comes back.
        void this.track.offsetWidth;
        this.track.removeAttribute('data-no-motion');
    }

    // The first pane in view: in a loop the index itself, else held so the last panes fill the viewport.
    first(index: number): number {
        const count = this.host.count();
        const per = this.host.perView();
        if (this.host.loop() && per === 1) return index;
        return Math.max(0, Math.min(index, count - per));
    }

    // The width of a pane and the gap after it, as the track measures it.
    step(): string {
        const per = this.host.perView();
        return `((100% - ${per - 1} * var(--_gap, 0px)) / ${per} + var(--_gap, 0px))`;
    }

    // Which way the panes run: to the right, or to the left in a right-to-left page.
    sign(): number {
        return getComputedStyle(this.track).direction === 'rtl' ? 1 : -1;
    }

    place(first: number, dx: number): void {
        this.track.style.translate = `calc(${this.sign()} * ${first} * ${this.step()} + ${dx}px) 0`;
    }

    pointerDown(e: PointerEvent): void {
        if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0) || !this.host.canDrag()) return;
        if (this.host.count() <= this.host.perView() && !this.host.loop()) return;
        this.settle();
        const tracker = new SwipeTracker();
        tracker.start(e.clientX, e.clientY);
        this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, decided: false, taken: false, width: this.viewport.clientWidth || 1, tracker };
    }

    pointerMove(e: PointerEvent): void {
        const drag = this.drag;
        if (!drag || e.pointerId !== drag.id) return;
        drag.tracker.move(e.clientX, e.clientY);
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        if (!drag.decided) {
            if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
            drag.decided = true;
            // A drag along the panes is the track's; up or down is the page's.
            if (Math.abs(dx) <= Math.abs(dy)) {
                this.drag = null;
                return;
            }
            drag.taken = true;
            this.viewport.setPointerCapture(e.pointerId);
            this.track.toggleAttribute('data-dragging', true);
            this.host.dragged(true);
        }
        e.preventDefault();
        this.place(this.first(this.host.index()), this.resist(dx));
    }

    // Past an end the track follows the pointer only a little.
    resist(dx: number): number {
        if (this.host.loop()) return dx;
        const first = this.first(this.host.index());
        const forward = this.sign() === 1 ? dx > 0 : dx < 0;
        const atEnd = forward ? first >= this.host.count() - this.host.perView() : first <= 0;
        return atEnd ? dx * 0.3 : dx;
    }

    pointerUp(e: PointerEvent, cancelled: boolean): void {
        const drag = this.drag;
        if (!drag || e.pointerId !== drag.id) return;
        this.drag = null;
        if (!drag.taken) return;
        if (this.viewport.hasPointerCapture(e.pointerId)) this.viewport.releasePointerCapture(e.pointerId);
        this.track.removeAttribute('data-dragging');
        this.host.dragged(false);
        this.swallowClick = true;
        window.setTimeout(() => (this.swallowClick = false), 0);
        const dx = e.clientX - drag.x;
        const speed = drag.tracker.velocity('x');
        const forward = this.sign() === 1 ? dx > 0 : dx < 0;
        const far = Math.abs(dx) > drag.width / 4 || Math.abs(speed) > FLICK;
        const index = this.host.index();
        if (!cancelled && far) {
            const to = this.next(index, forward ? 1 : -1);
            if (to >= 0) {
                this.host.swipeTo(to);
                return;
            }
        }
        this.place(this.first(index), 0);
    }

    next(index: number, direction: 1 | -1): number {
        const count = this.host.count();
        let to = index + direction;
        if (this.host.loop()) to = (to + count) % count;
        else if (to > count - this.host.perView()) return -1;
        return to >= 0 && to < count ? to : -1;
    }
}
