import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { part } from "../../core/draw-parts";
import { appRootOf, placeOnPage } from "../../core/page-layer";
import { focusFirstIn, focusOn, holdsFocus, rememberFocus } from "../../core/focus";
import type { FocusMark } from "../../core/focus-mark";
import { isInPage } from "../../core/measure";
import { onLanguage } from "../../core/on-language";
import { mark, put, shown, text } from "../../core/part-writes";
import { uiLocale } from "../../core/ui-locale";
import { inertAround } from "../../parts/overlay/inert-around";
import { Button } from "../button/Button";
import { Spinner } from "../progress/Spinner";
import type { LoadPanelProps } from "./load-panel-props";
import type { LoadPanelTarget } from "./load-panel-target";

const OWN = ['target', 'value', 'delay', 'shade', 'showPane', 'showIndicator', 'cancelable', 'cancelText', 'closeOnOutside'] as const;

/**
 * A loading layer over a container or the whole page: a shade, a box with a rotating indicator and a message, and
 * a Cancel button when the work can be stopped. The covered area cannot be clicked or focused in the meantime, and focus
 * that was inside moves to the box and returns afterward. It appears after `delay`, so quick operations show
 * nothing. `value` (or `x-model`), `show()` and `hide()` control it.
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
    // The target given; `null` covers the page.
    targetPart: ComponentBase | null = null;
    // The component covered while shown; `null` over the page.
    host: ComponentBase | null = null;
    undo: (() => void) | null = null;
    returnTo: FocusMark | null = null;
    // The value is being given back: the observer must not show or hide again.
    telling = false;
    shownEmitter = new Emitter<void>();
    hiddenEmitter = new Emitter<void>();
    cancelled = new Emitter<void>();

    constructor(props?: IBaseProp<LoadPanelProps>) {
        super('div', props);
        const own = (this.props ?? {}) as LoadPanelProps;
        this.class.add('mx-load-panel');
        put(this, 'tabindex', '-1');
        shown(this, false);
        this.pane = part<HTMLDivElement>(this, 'div', 'mx-load-panel__pane');
        this.pane.attr.add({ role: 'status' });
        this.spinner = new Spinner({ size: 'lg' });
        this.spinner.class.add('mx-load-panel__indicator');
        this.spinner.attr.add({ 'aria-hidden': 'true' });
        this.pane.controls.add(this.spinner);
        this.messagePart = part<HTMLDivElement>(this.pane, 'div', 'mx-load-panel__message');
        this.cancelButton = new Button({ onclick: () => this.cancel() });
        this.cancelButton.class.add('mx-load-panel__cancel');
        this.pane.controls.add(this.cancelButton);

        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.message !== undefined) this.bindProperty('text', own.message);
        if (own.onShown) this.shownEmitter.event(own.onShown);
        if (own.onHidden) this.hiddenEmitter.event(own.onHidden);
        if (own.onCancel) this.cancelled.event(own.onCancel);

        this.observeProperty<LoadPanelTarget | undefined>('target', target => this.takeTarget(target ?? null));
        this.observeProperty<string>('text', () => this.drawTexts());
        this.observeProperty<string>('cancelText', () => this.drawTexts());
        this.observeProperty<boolean>('shade', on => mark(this, 'data-shade', on !== false));
        this.observeProperty<boolean>('showPane', on => mark(this, 'data-pane', on !== false));
        this.observeProperty<boolean>('showIndicator', on => shown(this.spinner, on !== false));
        this.observeProperty<boolean>('cancelable', on => shown(this.cancelButton, !!on));
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
        // A press on the shade itself, not on the pane.
        this.motif.on('click:self', () => {
            if (this.peekProperty<boolean>('closeOnOutside')) this.hide();
        });
        this.motif.on('keydown', (_, e) => {
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
    /** Indicates whether the panel is shown. Reactive. Set it to show or hide the panel. */
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

    /** Indicates whether the panel is currently on screen, after its delay. */
    get isShown(): boolean {
        return this.shownNow;
    }

    get onShown(): MotifEvent<void> {
        return this.shownEmitter.event;
    }

    get onHidden(): MotifEvent<void> {
        return this.hiddenEmitter.event;
    }

    /** Occurs when the Cancel button or Escape is pressed. The panel hides afterward. */
    get onCancel(): MotifEvent<void> {
        return this.cancelled.event;
    }

    /** Shows the panel over its target after `delay`. Returns `false` while it is shown or waiting. */
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

    /** Hides the panel. The covered area can be used again, and focus returns to where it was. */
    hide(): void {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.tell(false);
        if (!this.shownNow) {
            return;
        }
        const focusInside = holdsFocus(this);
        this.shownNow = false;
        this.undo?.();
        this.undo = null;
        shown(this, false);
        if (focusInside && !this.returnTo?.restore({ preventScroll: true }) && this.host) {
            focusFirstIn(this.host);
        }
        this.returnTo = null;
        this.host = null;
        this.hiddenEmitter.fire();
    }

    /** The action of the Cancel button: raises `onCancel`, and then hides the panel. */
    cancel(): void {
        this.cancelled.fire();
        this.hide();
    }

    mount(): void {
        const target = this.targetPart;
        // What it covers: the target, or the page.
        if (target && !isInPage(target)) {
            this.tell(false);
            return;
        }
        if (!this.isBuilt) {
            this.build();
        }
        mark(this, 'data-page', !target);
        // Over the page: the page's layer holds it; over a target: a child of the target's component.
        if (!target) {
            if (!isInPage(this)) placeOnPage(this, this);
        } else if (this.parent !== target) {
            target.controls.add(this);
        }
        const focus = rememberFocus();
        this.returnTo = focus && (!target || focus.isIn(target)) ? focus : null;
        // The components around the panel, up to its target (with none, the page).
        const free = inertAround(this, target);
        if (target) {
            // Held over the target's own values, which come back when the hold ends.
            const busy = target.attr.hold({ 'aria-busy': 'true', 'data-mx-covered': '' });
            this.undo = () => {
                free();
                busy.dispose();
            };
        } else {
            // Over the page: the app's root in its window is busy, held over its own value as a target's is.
            const busy = appRootOf(this).attr.hold({ 'aria-busy': 'true' });
            this.undo = () => {
                free();
                busy.dispose();
            };
        }
        this.host = target;
        this.shownNow = true;
        shown(this, true);
        // Focus that was under it waits on the pane (the Cancel button when there is one), never dropped.
        if (this.returnTo) {
            if (this.peekProperty<boolean>('cancelable')) this.cancelButton.focus();
            else focusOn(this, { preventScroll: true });
        }
        this.shownEmitter.fire();
    }

    /** Keeps the target, the component it covers (`null` for the page). */
    takeTarget(target: LoadPanelTarget): void {
        this.targetPart = target;
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
        text(this.messagePart, this.peekProperty<string>('text') || strings.loading);
        const cancel = this.peekProperty<string>('cancelText') || strings.cancel;
        if (this.cancelButton.text !== cancel) this.cancelButton.text = cancel;
    }
}
