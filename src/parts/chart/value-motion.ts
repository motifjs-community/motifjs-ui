import { motionOf } from './chart-text';

/**
 * Values that move to new ones over the design language's normal motion. Values that come quicker than that are being
 * driven, by a drag or a fast feed: they are drawn at once, so what is drawn keeps up with them.
 */
export class ValueMotion {
    element: Element;
    draw: (values: readonly (number | null)[]) => void;
    shown: (number | null)[] = [];
    frame = 0;
    changedAt = -Infinity;

    constructor(element: Element, draw: (values: readonly (number | null)[]) => void) {
        this.element = element;
        this.draw = draw;
    }

    /** Values taken at once, as at the first draw. */
    set(values: readonly (number | null)[]): void {
        this.stop();
        this.shown = [...values];
    }

    move(values: readonly (number | null)[]): void {
        this.stop();
        const view = this.element.ownerDocument.defaultView;
        const duration = motionOf(this.element, '--mx-motion-duration-normal');
        const start = view?.performance.now() ?? 0;
        const driven = start - this.changedAt < duration;
        this.changedAt = start;
        const from = this.shown;
        if (driven || duration <= 0 || !view?.requestAnimationFrame) {
            this.shown = [...values];
            this.draw(this.shown);
            return;
        }
        const step = () => {
            const t = Math.min(1, (view.performance.now() - start) / duration);
            const eased = 1 - (1 - t) ** 3;
            this.shown = values.map((v, i) => {
                const old = from[i];
                return v === null || old === null || old === undefined ? v : old + (v - old) * eased;
            });
            this.draw(this.shown);
            this.frame = t < 1 ? view.requestAnimationFrame(step) : 0;
        };
        step();
    }

    stop(): void {
        if (this.frame) cancelAnimationFrame(this.frame);
        this.frame = 0;
    }
}
