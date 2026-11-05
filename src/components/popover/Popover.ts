import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { css, mark, part, put, shown, text } from "../../core/draw-parts";
import { homeOf } from "../../core/flow-home";
import { deepActiveElement, focusInitial } from "../../core/focus";
import { dismissMark } from "../../core/glyphs";
import { nextId } from "../../core/next-id";
import { isElement, isNode } from "../../core/node-kind";
import { onLanguage } from "../../core/on-language";
import { uiLocale } from "../../core/ui-locale";
import { placePopup } from "../../parts/popup/place-popup";
import type { PopupPlacement } from "../../parts/popup/popup-placement";
import { Button } from "../button/Button";
import type { TooltipTarget } from "../tooltip/tooltip-target";
import type { PopoverCloseReason } from "./popover-close-reason";
import type { PopoverClosingEventArgs } from "./popover-closing-event-args";
import type { PopoverProps } from "./popover-props";
import type { PopoverShowOn } from "./popover-show-on";

const OWN = ['target', 'content', 'showOn', 'placement', 'arrow', 'showClose', 'width', 'closeOnOutside', 'delay', 'hideDelay', 'value', 'label'] as const;

const hasPopover = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

function elementOf(target: TooltipTarget | null | undefined): HTMLElement | null {
    if (!target) {
        return null;
    }
    if (isElement(target)) {
        return target as HTMLElement;
    }
    return isElement(target.element) ? (target.element as HTMLElement) : null;
}

/**
 * Content next to the element it belongs to: a title, a close button, anything in it. It opens on a press on its
 * target (`showOn: 'click'`), when the pointer rests on the target (`'hover'`) or programmatically; it follows the target
 * while the page scrolls, opens on the other side when there is no room, and points at the target with an arrow
 * where the design language draws one. Focus goes in when it opens by a press and back to the target when it
 * closes; Escape, a press outside, focus leaving and the close button close it.
 *
 * @example
 * <Button ref={b => (this.info = b)} text="Details" />
 * <Popover target={() => this.info} title="Order 42" showClose>
 *   <p>Shipped yesterday.</p>
 * </Popover>
 */
export class Popover extends Control<HTMLDivElement, PopoverProps> {
    arrowPart: Component<HTMLSpanElement>;
    header: Component<HTMLDivElement>;
    titlePart: Component<HTMLDivElement>;
    closeButton: Button;
    body: Component<HTMLDivElement>;
    contentPart: ComponentBase | null = null;
    anchor: HTMLElement | null = null;
    opened = false;
    placedItself = false;
    watched: Document | null = null;
    frame = 0;
    showTimer: ReturnType<typeof setTimeout> | null = null;
    hideTimer: ReturnType<typeof setTimeout> | null = null;
    unlink: (() => void) | null = null;
    // The value is being given back: the observer must not open or close again.
    telling = false;
    openedEmitter = new Emitter<void>();
    closing = new Emitter<PopoverClosingEventArgs>();
    closed = new Emitter<PopoverCloseReason>();

    constructor(props?: IBaseProp<PopoverProps>) {
        super('div', props);
        const own = (this.props ?? {}) as PopoverProps;
        const el = this.element;
        el.classList.add('mx-popover');
        el.id = nextId('popover');
        el.setAttribute('role', 'dialog');
        el.tabIndex = -1;
        if (hasPopover) {
            el.popover = 'manual';
        } else {
            el.hidden = true;
        }
        this.arrowPart = part<HTMLSpanElement>(this, 'span', 'mx-popover__arrow');
        this.arrowPart.element.setAttribute('aria-hidden', 'true');
        this.header = part<HTMLDivElement>(this, 'div', 'mx-popover__header');
        this.titlePart = part<HTMLDivElement>(this.header, 'div', 'mx-popover__title');
        this.titlePart.element.id = nextId('popover-title');
        this.closeButton = new Button({ icon: dismissMark(), size: 'sm', onclick: () => this.close('close-button') });
        this.closeButton.element.classList.add('mx-popover__close');
        this.header.controls.add(this.closeButton);
        this.body = part<HTMLDivElement>(this, 'div', 'mx-popover__body');
        if (this.childs?.length) {
            this.body.controls.add(...this.childs);
        }

        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.title !== undefined) this.bindProperty('text', own.title);
        if (own.onOpened) this.openedEmitter.event(own.onOpened);
        if (own.onClosing) this.closing.event(own.onClosing);
        if (own.onClosed) this.closed.event(own.onClosed);

        this.observeProperty<string>('text', () => this.drawHeader());
        this.observeProperty<string>('label', () => this.drawHeader());
        this.observeProperty<boolean>('showClose', () => this.drawHeader());
        this.observeProperty<TooltipTarget | null>('target', target => this.attach(elementOf(target)));
        this.observeProperty<PopoverShowOn>('showOn', () => this.attach(this.anchor, true));
        this.observeProperty('content', () => this.drawContent());
        this.observeProperty('placement', () => this.place());
        this.observeProperty<boolean>('arrow', on => mark(el, 'data-arrow', on !== false));
        this.observeProperty<string | number | null>('width', width => css(el, 'inline-size', width === null || width === undefined || width === '' ? '' : typeof width === 'number' ? `${width}px` : width));
        this.observeProperty<boolean>('value', value => {
            if (this.telling) {
                return;
            }
            if (value && !this.opened) {
                queueMicrotask(() => {
                    if (!this.isDisposed && this.peekProperty('value')) this.open();
                });
            } else if (!value && this.opened) {
                this.close('code');
            }
        });
        onLanguage(this, () => {
            if (this.closeButton.hint !== uiLocale.strings.close) this.closeButton.hint = uiLocale.strings.close;
        });
        // A ref given later in the same build (`target={() => this.info}` above the button).
        const target = own.target;
        if (typeof target === 'function' && !this.anchor) {
            queueMicrotask(() => {
                if (!this.isDisposed && !this.anchor) this.bindProperty('target', target);
            });
        }
        el.addEventListener('keydown', e => this.keyDown(e));
        el.addEventListener('focusout', e => this.focusOut(e));
        el.addEventListener('pointerenter', () => this.pointerIn());
        el.addEventListener('pointerleave', () => this.pointerOut());
        el.addEventListener('click', e => e.stopPropagation());
        this.motif.setDisposable(() => {
            this.clearTimers();
            this.close('code');
            this.attach(null);
            if (this.placedItself) el.remove();
            this.openedEmitter.dispose();
            this.closing.dispose();
            this.closed.dispose();
        });
    }

    // Properties (see PopoverProps).

    get target(): TooltipTarget | null {
        return this.getProperty<TooltipTarget | null | undefined>('target') ?? null;
    }
    set target(value: Bind<TooltipTarget | null>) {
        this.assignProperty('target', value);
    }
    get title(): string {
        return this.text;
    }
    set title(value: Bind<string>) {
        this.text = value;
    }
    get label(): string {
        return this.getProperty<string | undefined>('label') ?? '';
    }
    set label(value: Bind<string>) {
        this.assignProperty('label', value);
    }
    get content(): ComponentBase | null {
        return this.getProperty<ComponentBase | null | undefined>('content') ?? null;
    }
    set content(value: Bind<ComponentBase | null>) {
        this.assignProperty('content', value);
    }
    get showOn(): PopoverShowOn {
        return this.getProperty<PopoverShowOn | undefined>('showOn') ?? 'click';
    }
    set showOn(value: Bind<PopoverShowOn>) {
        this.assignProperty('showOn', value);
    }
    get placement(): PopupPlacement {
        return this.getProperty<PopupPlacement | undefined>('placement') ?? 'bottom';
    }
    set placement(value: Bind<PopupPlacement>) {
        this.assignProperty('placement', value);
    }
    get arrow(): boolean {
        return this.getProperty<boolean | undefined>('arrow') !== false;
    }
    set arrow(value: Bind<boolean>) {
        this.assignProperty('arrow', value);
    }
    get showClose(): boolean {
        return !!this.getProperty<boolean>('showClose');
    }
    set showClose(value: Bind<boolean>) {
        this.assignProperty('showClose', value);
    }
    get width(): string | number | null {
        return this.getProperty<string | number | null | undefined>('width') ?? null;
    }
    set width(value: Bind<string | number | null>) {
        this.assignProperty('width', value);
    }
    get closeOnOutside(): boolean {
        return this.getProperty<boolean | undefined>('closeOnOutside') !== false;
    }
    set closeOnOutside(value: Bind<boolean>) {
        this.assignProperty('closeOnOutside', value);
    }
    get delay(): number {
        return this.getProperty<number | undefined>('delay') ?? 300;
    }
    set delay(value: Bind<number>) {
        this.assignProperty('delay', value, Number);
    }
    get hideDelay(): number {
        return this.getProperty<number | undefined>('hideDelay') ?? 200;
    }
    set hideDelay(value: Bind<number>) {
        this.assignProperty('hideDelay', value, Number);
    }
    /** Open or not. Reactive; setting it opens or closes. */
    get value(): boolean {
        return !!this.getProperty<boolean>('value');
    }
    set value(value: Bind<boolean>) {
        this.assignProperty('value', value, Boolean);
    }

    /** Whether it is open now. */
    get isOpen(): boolean {
        return this.opened;
    }

    get onOpened(): MotifEvent<void> {
        return this.openedEmitter.event;
    }

    /** About to close (`reason`); `cancel = true` keeps it open. */
    get onClosing(): MotifEvent<PopoverClosingEventArgs> {
        return this.closing.event;
    }

    get onClosed(): MotifEvent<PopoverCloseReason> {
        return this.closed.event;
    }

    /** Opens it next to its target; `false` without a target on the page, or when disabled. Focus goes in. */
    open(): boolean {
        const anchor = this.anchor;
        if (this.opened || !anchor?.isConnected || !this.isEnabled) {
            return false;
        }
        this.clearTimers();
        const el = this.element;
        if (!el.isConnected) {
            if (!this.isBuilt) {
                this.build();
            }
            homeOf(anchor).append(el);
            this.placedItself = true;
        }
        this.drawContent();
        if (hasPopover) {
            if (!el.matches(':popover-open')) el.showPopover();
        } else {
            el.hidden = false;
        }
        this.opened = true;
        this.listen(anchor.ownerDocument);
        this.place();
        put(anchor, 'aria-expanded', 'true');
        if (this.peekProperty<PopoverShowOn>('showOn') !== 'hover') {
            if (!focusInitial(el)) el.focus({ preventScroll: true });
        }
        this.tell(true);
        this.openedEmitter.fire();
        return true;
    }

    /** Closes it; `onClosing` may keep it open. Focus inside goes back to the target. */
    close(reason: PopoverCloseReason = 'code'): boolean {
        this.clearTimers();
        if (!this.opened) {
            return false;
        }
        const args: PopoverClosingEventArgs = { reason, cancel: false, source: this };
        this.closing.fire(args);
        if (args.cancel && !this.isDisposed) {
            return false;
        }
        const el = this.element;
        const focusInside = el.contains(deepActiveElement(el));
        this.opened = false;
        this.stopListening();
        if (hasPopover && el.matches(':popover-open')) {
            el.hidePopover();
        } else {
            el.hidden = true;
        }
        if (this.anchor) {
            put(this.anchor, 'aria-expanded', 'false');
            // Focus that leaves on its own (Tab, a press elsewhere) goes where it was going.
            if (focusInside && reason !== 'focus') this.anchor.focus({ preventScroll: true });
        }
        this.tell(false);
        this.closed.fire(reason);
        return true;
    }

    toggle(): void {
        if (this.opened) {
            this.close('toggle');
        } else {
            this.open();
        }
    }

    /** Lines it up with its target again, e.g. after its content changed size. */
    place(): void {
        const anchor = this.anchor;
        if (!this.opened || !anchor) {
            return;
        }
        if (!anchor.isConnected) {
            this.close('code');
            return;
        }
        const el = this.element;
        placePopup(el, anchor, this.peekProperty<PopupPlacement>('placement') ?? 'bottom', false);
        // The arrow points at the middle of the target, kept inside the popover's edge.
        const arrow = this.arrowPart.element;
        const box = el.getBoundingClientRect();
        const target = anchor.getBoundingClientRect();
        const across = el.dataset.side === 'start' || el.dataset.side === 'end';
        const half = (across ? arrow.offsetHeight : arrow.offsetWidth) / 2 || 6;
        const length = across ? box.height : box.width;
        const middle = across ? target.top + target.height / 2 - box.top : target.left + target.width / 2 - box.left;
        const at = Math.max(half + 4, Math.min(middle, length - half - 4));
        css(arrow, across ? 'top' : 'left', `${at.toFixed(2)}px`);
        css(arrow, across ? 'left' : 'top', '');
    }

    // The value given back: `x-model` and the `value` property follow what opened or closed.
    tell(open: boolean): void {
        this.telling = true;
        try {
            if (this.peekProperty<boolean>('value') !== open) {
                this.changeProperty('value', open);
            }
            this.bindings.writeModel(open);
        } finally {
            this.telling = false;
        }
    }

    drawHeader(): void {
        const title = this.peekProperty<string>('text') ?? '';
        const close = !!this.peekProperty<boolean>('showClose');
        const label = this.peekProperty<string>('label') ?? '';
        text(this.titlePart.element, title);
        shown(this.titlePart.element, title !== '');
        shown(this.closeButton.element, close);
        shown(this.header.element, title !== '' || close);
        put(this.element, 'aria-labelledby', title ? this.titlePart.element.id : null);
        put(this.element, 'aria-label', title ? null : label || null);
    }

    drawContent(): void {
        const content = this.peekProperty<ComponentBase | null>('content') ?? null;
        if (content === this.contentPart) {
            return;
        }
        if (this.contentPart) {
            this.body.controls.remove(this.contentPart);
        }
        this.contentPart = content;
        if (content) {
            this.body.controls.add(content);
        }
        this.place();
    }

    // The target's listeners, for the way it opens; the attributes that tie the two.
    attach(anchor: HTMLElement | null, again = false): void {
        if (anchor === this.anchor && !again) {
            return;
        }
        this.unlink?.();
        this.unlink = null;
        if (this.anchor && this.anchor !== anchor) {
            this.close('code');
            for (const name of ['aria-expanded', 'aria-controls', 'aria-haspopup']) this.anchor.removeAttribute(name);
        }
        this.anchor = anchor;
        if (!anchor) {
            return;
        }
        const showOn = this.peekProperty<PopoverShowOn>('showOn') ?? 'click';
        put(anchor, 'aria-controls', this.element.id);
        put(anchor, 'aria-expanded', this.opened ? 'true' : 'false');
        put(anchor, 'aria-haspopup', showOn === 'click' ? 'dialog' : null);
        const press = () => {
            if (this.isEnabled) this.toggle();
        };
        const enter = () => {
            this.clearTimers();
            this.showTimer = setTimeout(() => this.open(), this.delay);
        };
        const leave = () => this.pointerOut();
        const focusIn = () => {
            this.clearTimers();
            this.open();
        };
        const focusOut = (e: FocusEvent) => {
            const to = e.relatedTarget as Node | null;
            if (!to || !this.element.contains(to)) this.close('focus');
        };
        if (showOn === 'click') {
            anchor.addEventListener('click', press);
            this.unlink = () => anchor.removeEventListener('click', press);
        } else if (showOn === 'hover') {
            anchor.addEventListener('pointerenter', enter);
            anchor.addEventListener('pointerleave', leave);
            anchor.addEventListener('focusin', focusIn);
            anchor.addEventListener('focusout', focusOut);
            this.unlink = () => {
                anchor.removeEventListener('pointerenter', enter);
                anchor.removeEventListener('pointerleave', leave);
                anchor.removeEventListener('focusin', focusIn);
                anchor.removeEventListener('focusout', focusOut);
            };
        }
    }

    pointerIn(): void {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
    }

    pointerOut(): void {
        if (this.peekProperty<PopoverShowOn>('showOn') !== 'hover') {
            return;
        }
        this.clearTimers();
        this.hideTimer = setTimeout(() => {
            // Focus inside keeps it: the pointer only wandered off.
            if (!this.element.contains(deepActiveElement(this.element))) this.close('hover');
        }, this.hideDelay);
    }

    clearTimers(): void {
        if (this.showTimer) clearTimeout(this.showTimer);
        if (this.hideTimer) clearTimeout(this.hideTimer);
        this.showTimer = this.hideTimer = null;
    }

    listen(doc: Document): void {
        if (this.watched) {
            return;
        }
        this.watched = doc;
        doc.addEventListener('pointerdown', this.onPointerDown, true);
        doc.defaultView?.addEventListener('scroll', this.onScroll, true);
        doc.defaultView?.addEventListener('resize', this.schedule);
    }

    stopListening(): void {
        const doc = this.watched;
        this.watched = null;
        if (!doc) {
            return;
        }
        doc.removeEventListener('pointerdown', this.onPointerDown, true);
        doc.defaultView?.cancelAnimationFrame?.(this.frame);
        doc.defaultView?.removeEventListener('scroll', this.onScroll, true);
        doc.defaultView?.removeEventListener('resize', this.schedule);
    }

    schedule = (): void => {
        const view = this.watched?.defaultView;
        if (typeof view?.requestAnimationFrame !== 'function') {
            this.place();
            return;
        }
        view.cancelAnimationFrame(this.frame);
        this.frame = view.requestAnimationFrame(() => this.place());
    };

    // Its own content scrolling moves nothing.
    onScroll = (e: Event): void => {
        if (isNode(e.target) && this.element.contains(e.target)) {
            return;
        }
        this.schedule();
    };

    onPointerDown = (e: PointerEvent): void => {
        const target = e.target as Node;
        if (this.element.contains(target) || this.anchor?.contains(target)) {
            return;
        }
        if (this.peekProperty<boolean | undefined>('closeOnOutside') !== false) this.close('outside');
    };

    keyDown(e: KeyboardEvent): void {
        if (e.key !== 'Escape' || e.defaultPrevented) {
            return;
        }
        // Handled here: a window around the popover must not close too.
        e.preventDefault();
        e.stopPropagation();
        this.close('escape');
    }

    focusOut(e: FocusEvent): void {
        const to = e.relatedTarget as Node | null;
        if (to && !this.element.contains(to) && !this.anchor?.contains(to)) this.close('focus');
    }

    protected override applyProperty(name: string, value: unknown): void {
        super.applyProperty(name, value);
        if (name === 'enabled' && value === false) this.close('code');
    }
}
