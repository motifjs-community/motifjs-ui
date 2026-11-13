import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { part } from "../../core/draw-parts";
import { onDocument } from "../../core/window-events";
import { placeInTree } from "../../core/flow-home";
import { focusFirstIn, focusOn, holdsFocus } from "../../core/focus";
import { dismissMark } from "../../core/glyphs";
import { boxOf, isInPage, measure, onLayout, type Box } from "../../core/measure";
import { nextId } from "../../core/next-id";
import { isElement } from "../../core/node-kind";
import { onLanguage } from "../../core/on-language";
import { css, kept, mark, put, text } from "../../core/part-writes";
import { uiLocale } from "../../core/ui-locale";
import { placeNear } from "../../parts/popup/place-near";
import type { Placed } from "../../parts/popup/placed";
import type { PopupPlacement } from "../../parts/popup/popup-placement";
import { Button } from "../button/Button";
import type { TooltipTarget } from "../tooltip/tooltip-target";
import type { PopoverCloseReason } from "./popover-close-reason";
import type { PopoverClosingEventArgs } from "./popover-closing-event-args";
import type { PopoverProps } from "./popover-props";
import type { PopoverShowOn } from "./popover-show-on";

const OWN = ['target', 'content', 'showOn', 'placement', 'arrow', 'showClose', 'width', 'closeOnOutside', 'delay', 'hideDelay', 'value', 'label'] as const;

const hasPopover = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

/**
 * Content next to the element it belongs to, with a title, a close button and any content. It opens on a click on its
 * target (`showOn: 'click'`), when the pointer rests on the target (`'hover'`) or programmatically. It follows the target
 * during page scrolling, opens on the opposite side if there is no room, and shows an arrow toward the target
 * where the design language includes one. Focus moves in when a click opens it, and returns to the target when it
 * closes. Escape, a click outside, focus leaving and the close button close it.
 *
 * @example
 * <Button ref={b => (this.info = b)} text="Details" />
 * <Popover target={() => this.info} title="Order 42" showClose>
 *   <p>Shipped yesterday.</p>
 * </Popover>
 */
export class Popover extends Control<HTMLDivElement, PopoverProps> {
    /** The ids of the popover and its title, for the attributes that point at them. */
    popoverId = nextId('popover');
    titleId = nextId('popover-title');
    arrowPart: Component<HTMLSpanElement>;
    header: Component<HTMLDivElement>;
    titlePart: Component<HTMLDivElement>;
    closeButton: Button;
    body: Component<HTMLDivElement>;
    contentPart: ComponentBase | null = null;
    /** The target it opens next to. */
    anchor: ComponentBase | null = null;
    opened = false;
    placedItself = false;
    /** Stops listening to the page while it is open. */
    stopPage: (() => void)[] = [];
    /** Takes back the placing asked for last. */
    stopPlace: (() => void) | null = null;
    /** The arrow as read with the last placing: its length along the edge decides how near a corner it may go. */
    arrowBox: Box | null = null;
    showTimer: ReturnType<typeof setTimeout> | null = null;
    hideTimer: ReturnType<typeof setTimeout> | null = null;
    unlink: (() => void) | null = null;
    /** Focus is leaving the target (`hover`) or the popover: where it lands decides whether it closes. */
    leaving: 'target' | 'popover' | null = null;
    // The value is being given back: the observer must not open or close again.
    telling = false;
    openedEmitter = new Emitter<void>();
    closing = new Emitter<PopoverClosingEventArgs>();
    closed = new Emitter<PopoverCloseReason>();

    constructor(props?: IBaseProp<PopoverProps>) {
        super('div', props);
        const own = (this.props ?? {}) as PopoverProps;
        this.class.add('mx-popover');
        this.attr.add({ id: this.popoverId, role: 'dialog' });
        put(this, 'tabindex', '-1');
        if (hasPopover) {
            this.attr.add({ popover: 'manual' });
        } else {
            kept(this, false);
        }
        this.arrowPart = part<HTMLSpanElement>(this, 'span', 'mx-popover__arrow');
        this.arrowPart.attr.add({ 'aria-hidden': 'true' });
        this.header = part<HTMLDivElement>(this, 'div', 'mx-popover__header');
        this.titlePart = part<HTMLDivElement>(this.header, 'div', 'mx-popover__title');
        this.titlePart.attr.add({ id: this.titleId });
        this.closeButton = new Button({ icon: dismissMark(), size: 'sm', onclick: () => this.close('close-button') });
        this.closeButton.class.add('mx-popover__close');
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
        this.observeProperty<TooltipTarget | null>('target', target => this.attach(this.takeIn(target)));
        this.observeProperty<PopoverShowOn>('showOn', () => this.attach(this.anchor, true));
        this.observeProperty('content', () => this.drawContent());
        this.observeProperty('placement', () => this.place());
        this.observeProperty<boolean>('arrow', on => mark(this, 'data-arrow', on !== false));
        this.observeProperty<string | number | null>('width', width => css(this, 'inline-size', width === null || width === undefined || width === '' ? '' : typeof width === 'number' ? `${width}px` : width));
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
        this.motif.on('keydown', (_, e) => this.keyDown(e));
        this.motif.on('focusout', (_, e) => this.focusOut(e));
        this.motif.on('pointerenter', () => this.pointerIn());
        this.motif.on('pointerleave', () => this.pointerOut());
        this.motif.on('click', (_, e) => e.stopPropagation());
        this.motif.on('toggle', (_, e) => {
            if ((e as ToggleEvent).newState === 'open') this.moveFocusIn();
        });
        this.motif.setDisposable(() => {
            this.clearTimers();
            this.close('code');
            this.attach(null);
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
    /** Indicates whether it is open. Reactive. Set it to open or close the popover. */
    get value(): boolean {
        return !!this.getProperty<boolean>('value');
    }
    set value(value: Bind<boolean>) {
        this.assignProperty('value', value, Boolean);
    }

    /** Indicates whether it is currently open. */
    get isOpen(): boolean {
        return this.opened;
    }

    get onOpened(): MotifEvent<void> {
        return this.openedEmitter.event;
    }

    /** Occurs before it closes (`reason`). Set `cancel = true` to keep it open. */
    get onClosing(): MotifEvent<PopoverClosingEventArgs> {
        return this.closing.event;
    }

    get onClosed(): MotifEvent<PopoverCloseReason> {
        return this.closed.event;
    }

    /**
     * Opens it next to its target, and focus moves in. Returns `false` if there is no target on the page or it is
     * disabled.
     */
    open(): boolean {
        const anchor = this.anchor;
        if (this.opened || !anchor || !isInPage(anchor) || !this.isEnabled) {
            return false;
        }
        this.clearTimers();
        // Placed where its place is in the page; a popover closed without the popover API is out of the page itself.
        if (!this.parent || !isInPage(this.parent)) {
            if (!this.isBuilt) {
                this.build();
            }
            placeInTree(anchor, this);
            this.placedItself = true;
        }
        this.drawContent();
        // The browser shows it a moment later; focus moves in once it is open (its `toggle` event).
        if (hasPopover) {
            this.attr.add({ showPopover: true });
        } else {
            kept(this, true);
        }
        this.opened = true;
        this.listen(anchor);
        this.place();
        put(anchor, 'aria-expanded', 'true');
        if (!hasPopover) this.moveFocusIn();
        this.tell(true);
        this.openedEmitter.fire();
        return true;
    }

    /** Closes it. `onClosing` can keep it open. Focus inside returns to the target. */
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
        const focusInside = holdsFocus(this);
        this.opened = false;
        this.stopListening();
        if (hasPopover) {
            this.attr.add({ showPopover: false });
        } else {
            kept(this, false);
        }
        // A target already disposed has nothing left to write to or to focus.
        if (this.anchor && !this.anchor.isDisposed) {
            put(this.anchor, 'aria-expanded', 'false');
            // Focus that leaves on its own (Tab, a click elsewhere) goes where it was going.
            if (focusInside && reason !== 'focus') focusOn(this.anchor, { preventScroll: true });
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

    /** Repositions it relative to its target, for example after its content changes size. */
    place(): void {
        const anchor = this.anchor;
        if (!this.opened || !anchor) {
            return;
        }
        if (!isInPage(anchor)) {
            this.close('code');
            return;
        }
        const placement = this.peekProperty<PopupPlacement>('placement') ?? 'bottom';
        measure(this, this.readArrow, this.keepArrow);
        this.stopPlace = placeNear(this, anchor, { placement, placed: this.drawArrow });
    }

    readArrow = (): Box => boxOf(this.arrowPart);

    keepArrow = (arrow: Box): void => {
        this.arrowBox = arrow;
    };

    // The arrow points at the middle of the target, kept inside the popover's edge.
    drawArrow = (where: Placed): void => {
        if (!this.opened) {
            return;
        }
        const arrow = this.arrowBox;
        const box = where.rect;
        const target = where.anchor;
        const across = where.side === 'start' || where.side === 'end';
        const half = (arrow ? (across ? arrow.offsetHeight : arrow.offsetWidth) : 0) / 2 || 6;
        const length = across ? box.height : box.width;
        const middle = across ? target.top + target.height / 2 - box.top : target.left + target.width / 2 - box.left;
        const at = Math.max(half + 4, Math.min(middle, length - half - 4));
        css(this.arrowPart, across ? 'top' : 'left', `${at.toFixed(2)}px`);
        css(this.arrowPart, across ? 'left' : 'top', '');
    };

    // Focus already inside (put there by an `onOpened` handler) stays where it is.
    moveFocusIn(): void {
        if (!this.opened || this.peekProperty<PopoverShowOn>('showOn') === 'hover' || holdsFocus(this)) {
            return;
        }
        if (!focusFirstIn(this)) focusOn(this, { preventScroll: true });
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
        text(this.titlePart, title);
        kept(this.titlePart, title !== '');
        kept(this.closeButton, close);
        kept(this.header, title !== '' || close);
        put(this, 'aria-labelledby', title ? this.titleId : null);
        put(this, 'aria-label', title ? null : label || null);
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

    /** The target given, when it has an element to open next to (a fragment has none). */
    takeIn(target: TooltipTarget | null | undefined): ComponentBase | null {
        return target && isElement(target.element) ? target : null;
    }

    // The target's listeners, for the way it opens; the attributes that tie the two.
    attach(anchor: ComponentBase | null, again = false): void {
        if (anchor === this.anchor && !again) {
            return;
        }
        this.unlink?.();
        this.unlink = null;
        if (this.anchor && this.anchor !== anchor) {
            this.close('code');
            if (!this.anchor.isDisposed) for (const name of ['aria-expanded', 'aria-controls', 'aria-haspopup']) put(this.anchor, name, null);
        }
        this.anchor = anchor;
        if (!anchor || anchor.isDisposed) {
            return;
        }
        const showOn = this.peekProperty<PopoverShowOn>('showOn') ?? 'click';
        put(anchor, 'aria-controls', this.popoverId);
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
        // Focus that goes somewhere while it is open closes it unless it lands in the popover (onFocusIn).
        const focusOut = (_: ComponentBase, e: FocusEvent) => {
            if (e.relatedTarget && this.opened) this.leaving = 'target';
            else this.close('focus');
        };
        if (showOn === 'click') {
            void anchor.motif.on('click', press);
            this.unlink = () => void anchor.motif.off('click', press);
        } else if (showOn === 'hover') {
            void anchor.motif.on('pointerenter', enter);
            void anchor.motif.on('pointerleave', leave);
            void anchor.motif.on('focusin', focusIn);
            void anchor.motif.on('focusout', focusOut);
            this.unlink = () => {
                void anchor.motif.off('pointerenter', enter);
                void anchor.motif.off('pointerleave', leave);
                void anchor.motif.off('focusin', focusIn);
                void anchor.motif.off('focusout', focusOut);
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
            if (!holdsFocus(this)) this.close('hover');
        }, this.hideDelay);
    }

    clearTimers(): void {
        if (this.showTimer) clearTimeout(this.showTimer);
        if (this.hideTimer) clearTimeout(this.hideTimer);
        this.showTimer = this.hideTimer = null;
    }

    listen(anchor: ComponentBase): void {
        if (this.stopPage.length) {
            return;
        }
        // A press outside, focus landing, and the page scrolling or changing size, while it is open. Its own content
        // scrolling moves nothing.
        this.stopPage = [
            onDocument(anchor, 'pointerdown', this.onPointerDown, true),
            onDocument(anchor, 'focusin', this.onFocusIn, true),
            onLayout(this, 'scroll', () => this.place(), { except: this }),
            onLayout(this, 'page', () => this.place()),
        ];
    }

    stopListening(): void {
        this.leaving = null;
        for (const stop of this.stopPage.splice(0)) stop();
        this.stopPlace?.();
        this.stopPlace = null;
    }

    onPointerDown = (e: PointerEvent): void => {
        if (this.motif.isEventFrom(e) || this.anchor?.motif.isEventFrom(e)) {
            return;
        }
        if (this.peekProperty<boolean | undefined>('closeOnOutside') !== false) this.close('outside');
    };

    // Focus that left the popover may land in it or on its target; focus that left the target, only in the popover.
    onFocusIn = (e: FocusEvent): void => {
        const from = this.leaving;
        this.leaving = null;
        if (!from || this.motif.isEventFrom(e) || (from === 'popover' && this.anchor?.motif.isEventFrom(e))) {
            return;
        }
        this.close('focus');
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

    // Focus that goes nowhere keeps it open; focus that goes somewhere closes it unless it lands here or on the target (onFocusIn).
    focusOut(e: FocusEvent): void {
        if (e.relatedTarget && this.opened) this.leaving = 'popover';
    }

    protected override applyProperty(name: string, value: unknown): void {
        super.applyProperty(name, value);
        if (name === 'enabled' && value === false) this.close('code');
    }
}
