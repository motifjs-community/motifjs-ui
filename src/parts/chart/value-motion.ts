import type { ComponentBase } from '@motifx/core';
import { windowOf } from '../../core/page-documents';
import { motionOf } from './chart-text';

/**
 * Values that move to new ones over the design language's normal motion. Values that come quicker than that are being
 * driven, by a drag or a fast feed: they are drawn at once, so what is drawn keeps up with them.
 */
export class ValueMotion {
    owner: ComponentBase;
    draw: (values: readonly (number | null)[]) => void;
    shown: (number | null)[] = [];
    frame = 0;
    changedAt = -Infinity;

    constructor(owner: ComponentBase, draw: (values: readonly (number | null)[]) => void) {
        this.owner = owner;
        this.draw = draw;
    }

    /** Values taken at once, as at the first draw. */
    set(values: readonly (number | null)[]): void {
        this.stop();
        this.shown = [...values];
    }

    move(values: readonly (number | null)[]): void {
        this.stop();
        const view = windowOf(this.owner);
        const duration = motionOf(this.owner, '--mx-motion-duration-normal');
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
        if (this.frame) windowOf(this.owner)?.cancelAnimationFrame(this.frame);
        this.frame = 0;
    }
}
