/**
 * Lengths of design tokens for drawing, read from hidden probes that stay in the element. A stylesheet that arrives late,
 * or a design language that changes, changes a probe's size, and `changed` is called to draw again with the new length.
 */
export class TokenLengths {
    probes = new Map<string, HTMLSpanElement>();
    used = new Map<string, number>();
    observer: ResizeObserver | null = null;

    constructor(host: HTMLElement, tokens: readonly string[], changed: () => void) {
        const doc = host.ownerDocument;
        for (const token of tokens) {
            const probe = doc.createElement('span');
            probe.className = 'mx-token-probe';
            probe.setAttribute('aria-hidden', 'true');
            // A token name, or a length worked out from tokens (`calc(var(--share) * 1000px)`).
            const length = token.includes('(') ? token : `var(${token})`;
            probe.style.cssText = `position:absolute;inset-block-start:0;inset-inline-start:0;block-size:0;inline-size:${length};visibility:hidden;pointer-events:none;`;
            host.append(probe);
            this.probes.set(token, probe);
        }
        const Observer = doc.defaultView?.ResizeObserver;
        if (!Observer) return;
        // The first report of each probe is its size as it was read: only a length that differs from it draws again.
        this.observer = new Observer(entries => {
            if (entries.some(e => this.used.has(this.tokenOf(e.target)) && this.measure(e.target as HTMLElement) !== this.used.get(this.tokenOf(e.target)))) changed();
        });
        for (const probe of this.probes.values()) this.observer.observe(probe);
    }

    tokenOf(probe: Element): string {
        for (const [token, el] of this.probes) if (el === probe) return token;
        return '';
    }

    measure(probe: HTMLElement): number {
        return probe.getBoundingClientRect().width;
    }

    /** The token's length in pixels, or `fallback` where nothing is laid out yet. */
    get(token: string, fallback: number): number {
        const probe = this.probes.get(token);
        const width = probe ? this.measure(probe) : 0;
        this.used.set(token, width);
        return width > 0 ? width : fallback;
    }

    dispose(): void {
        this.observer?.disconnect();
        for (const probe of this.probes.values()) probe.remove();
    }
}
