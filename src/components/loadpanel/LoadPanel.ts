import { Component, Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { mark, part, shown, text } from "../../core/draw-parts";
import { deepActiveElement, focusInitial, isFocusable } from "../../core/focus";
import { isElement } from "../../core/node-kind";
import { onLanguage } from "../../core/on-language";
import { uiLocale } from "../../core/ui-locale";
import { inertAround } from "../../parts/overlay/inert-around";
import { Button } from "../button/Button";
import { Spinner } from "../progress/Spinner";
import type { LoadPanelProps } from "./load-panel-props";
import type { LoadPanelTarget } from "./load-panel-target";

const OWN = ['target', 'value', 'delay', 'shade', 'showPane', 'showIndicator', 'cancelable', 'cancelText', 'closeOnOutside'] as const;

/**
 * A "loading" layer over a container or the whole page: a shade, a pane with a turning indicator and a message,
 * a Cancel button when the work can be stopped. What is under it cannot be pressed or focused meanwhile; focus
 * that was inside waits on the pane and comes back afterwards. It shows after `delay`, so quick work does not
 * flash it. `value` (or `x-model`) shows and hides it; so do `show()` and `hide()`.
 *
 * @example
 * <LoadPanel target={() => this.ordersPanel} message="Loading orders" x-model={() => this.state.loading} />
 *
 * const panel = new LoadPanel({ cancelable: true, onCancel: () => this.job.stop() });
 * panel.show();
 */
export class LoadPanel extends Control<HTMLDivElement, LoadPanelProps> {
    pane: Component<HTMLDivElement>;
    spinner: Spinner;
    messagePart: Component<HTMLDivElement>;
    cancelButton: Button;
    shownNow = false;
    timer: ReturnType<typeof setTimeout> | null = null;
    host: HTMLElement | null = null;
    undo: (() => void) | null = null;
    returnTo: HTMLElement | null = null;
    // The value is being given back: the observer must not show or hide again.
    telling = false;
    shownEmitter = new Emitter<void>();
    hiddenEmitter = new Emitter<void>();
    cancelled = new Emitter<void>();

    constructor(props?: IBaseProp<LoadPanelProps>) {
        super('div', props);
        const own = (this.props ?? {}) as LoadPanelProps;
        const el = this.element;
        el.classList.add('mx-load-panel');
        el.tabIndex = -1;
        shown(el, false);
        this.pane = part<HTMLDivElement>(this, 'div', 'mx-load-panel__pane');
        this.pane.element.setAttribute('role', 'status');
        this.spinner = new Spinner({ size: 'lg' });
        this.spinner.element.classList.add('mx-load-panel__indicator');
        this.spinner.element.setAttribute('aria-hidden', 'true');
        this.pane.controls.add(this.spinner);
        this.messagePart = part<HTMLDivElement>(this.pane, 'div', 'mx-load-panel__message');
        this.cancelButton = new Button({ onclick: () => this.cancel() });
        this.cancelButton.element.classList.add('mx-load-panel__cancel');
        this.pane.controls.add(this.cancelButton);

        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.message !== undefined) this.bindProperty('text', own.message);
        if (own.onShown) this.shownEmitter.event(own.onShown);
        if (own.onHidden) this.hiddenEmitter.event(own.onHidden);
        if (own.onCancel) this.cancelled.event(own.onCancel);

        this.observeProperty<string>('text', () => this.drawTexts());
        this.observeProperty<string>('cancelText', () => this.drawTexts());
        this.observeProperty<boolean>('shade', on => mark(el, 'data-shade', on !== false));
        this.observeProperty<boolean>('showPane', on => mark(el, 'data-pane', on !== false));
        this.observeProperty<boolean>('showIndicator', on => shown(this.spinner.element, on !== false));
        this.observeProperty<boolean>('cancelable', on => shown(this.cancelButton.element, !!on));
        this.observeProperty<boolean>('value', value => {
            if (this.telling) {
                return;
            }
            if (value) {
                this.show();
            } else {
                this.hide();
            }
        });
        onLanguage(this, () => this.drawTexts());
        el.addEventListener('click', e => {
            if (e.target === el && this.peekProperty<boolean>('closeOnOutside')) this.hide();
        });
        el.addEventListener('keydown', e => {
            if (e.key === 'Escape' && this.peekProperty<boolean>('cancelable')) {
                e.preventDefault();
                e.stopPropagation();
                this.cancel();
            }
        });
        this.motif.setDisposable(() => {
            this.hide();
            this.shownEmitter.dispose();
            this.hiddenEmitter.dispose();
            this.cancelled.dispose();
        });
    }

    // Properties (see LoadPanelProps).

    get target(): LoadPanelTarget {
        return this.getProperty<LoadPanelTarget | undefined>('target') ?? null;
    }
    set target(value: Bind<LoadPanelTarget>) {
        this.assignProperty('target', value);
    }
    get message(): string {
        return this.text;
    }
    set message(value: Bind<string>) {
        this.text = value;
    }
    /** Shown or not. Reactive; setting it shows or hides. */
    get value(): boolean {
        return !!this.getProperty<boolean>('value');
    }
    set value(value: Bind<boolean>) {
        this.assignProperty('value', value, Boolean);
    }
    get delay(): number {
        return this.getProperty<number | undefined>('delay') ?? 0;
    }
    set delay(value: Bind<number>) {
        this.assignProperty('delay', value, Number);
    }
    get shade(): boolean {
        return this.getProperty<boolean | undefined>('shade') !== false;
    }
    set shade(value: Bind<boolean>) {
        this.assignProperty('shade', value);
    }
    get showPane(): boolean {
        return this.getProperty<boolean | undefined>('showPane') !== false;
    }
    set showPane(value: Bind<boolean>) {
        this.assignProperty('showPane', value);
    }
    get showIndicator(): boolean {
        return this.getProperty<boolean | undefined>('showIndicator') !== false;
    }
    set showIndicator(value: Bind<boolean>) {
        this.assignProperty('showIndicator', value);
    }
    get cancelable(): boolean {
        return !!this.getProperty<boolean>('cancelable');
    }
    set cancelable(value: Bind<boolean>) {
        this.assignProperty('cancelable', value, Boolean);
    }
    get cancelText(): string {
        return this.getProperty<string | undefined>('cancelText') ?? '';
    }
    set cancelText(value: Bind<string>) {
        this.assignProperty('cancelText', value);
    }
    get closeOnOutside(): boolean {
        return !!this.getProperty<boolean>('closeOnOutside');
    }
    set closeOnOutside(value: Bind<boolean>) {
        this.assignProperty('closeOnOutside', value, Boolean);
    }

    /** Whether it is on the screen now (after its delay). */
    get isShown(): boolean {
        return this.shownNow;
    }

    get onShown(): MotifEvent<void> {
        return this.shownEmitter.event;
    }

    get onHidden(): MotifEvent<void> {
        return this.hiddenEmitter.event;
    }

    /** The Cancel button was pressed (or Escape); the panel hides after. */
    get onCancel(): MotifEvent<void> {
        return this.cancelled.event;
    }

    /** Shows it over its target after `delay`; `false` when it is shown or waiting already. */
    show(): boolean {
        if (this.shownNow || this.timer) {
            return false;
        }
        this.tell(true);
        const delay = this.delay;
        if (delay > 0) {
            this.timer = setTimeout(() => {
                this.timer = null;
                this.mount();
            }, delay);
        } else {
            this.mount();
        }
        return true;
    }

    /** Hides it; what it covered can be used again, and focus goes back where it was. */
    hide(): void {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.tell(false);
        if (!this.shownNow) {
            return;
        }
        const el = this.element;
        const focusInside = el.contains(deepActiveElement(el));
        this.shownNow = false;
        this.undo?.();
        this.undo = null;
        shown(el, false);
        if (focusInside) {
            const back = this.returnTo;
            if (back?.isConnected && isFocusable(back)) {
                back.focus({ preventScroll: true });
            } else if (this.host) {
                focusInitial(this.host);
            }
        }
        this.returnTo = null;
        this.host = null;
        this.hiddenEmitter.fire();
    }

    /** What the Cancel button does: tells `onCancel`, then hides. */
    cancel(): void {
        this.cancelled.fire();
        this.hide();
    }

    mount(): void {
        const target = this.peekProperty<LoadPanelTarget | undefined>('target') ?? null;
        const host = target === null ? this.element.ownerDocument.body : isElement(target) ? (target as HTMLElement) : (target.element as HTMLElement);
        if (!host?.isConnected) {
            this.tell(false);
            return;
        }
        const el = this.element;
        if (!this.isBuilt) {
            this.build();
        }
        mark(el, 'data-page', target === null);
        if (el.parentElement !== host) {
            host.append(el);
        }
        const active = deepActiveElement();
        this.returnTo = active && (target === null || host.contains(active)) ? active : null;
        const busy = host.getAttribute('aria-busy');
        host.setAttribute('aria-busy', 'true');
        if (target !== null) host.setAttribute('data-mx-covered', '');
        const free = inertAround(el, host);
        this.undo = () => {
            free();
            if (busy === null) host.removeAttribute('aria-busy');
            else host.setAttribute('aria-busy', busy);
            host.removeAttribute('data-mx-covered');
        };
        this.host = host;
        this.shownNow = true;
        shown(el, true);
        // Focus that was under it waits on the pane (the Cancel button when there is one), never dropped.
        if (this.returnTo) {
            if (this.peekProperty<boolean>('cancelable')) this.cancelButton.focus();
            else el.focus({ preventScroll: true });
        }
        this.shownEmitter.fire();
    }

    tell(value: boolean): void {
        this.telling = true;
        try {
            if (this.peekProperty<boolean>('value') !== value) {
                this.changeProperty('value', value);
            }
            this.bindings.writeModel(value);
        } finally {
            this.telling = false;
        }
    }

    drawTexts(): void {
        const strings = uiLocale.strings;
        text(this.messagePart.element, this.peekProperty<string>('text') || strings.loading);
        const cancel = this.peekProperty<string>('cancelText') || strings.cancel;
        if (this.cancelButton.text !== cancel) this.cancelButton.text = cancel;
    }
}
