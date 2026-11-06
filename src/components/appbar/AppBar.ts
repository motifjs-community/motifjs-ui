import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { iconPart, mark, part, put, shown, text } from "../../core/draw-parts";
import { glyph } from "../../core/glyphs";
import type { IconSource } from "../../core/icon-source";
import { onLanguage } from "../../core/on-language";
import { scrollParent, watchScroll } from "../../core/scroll-watch";
import { uiLocale } from "../../core/ui-locale";
import { Button } from "../button/Button";
import { Toolbar } from "../toolbar/Toolbar";
import type { ToolbarItem } from "../toolbar/toolbar-item";
import type { ToolbarOverflow } from "../toolbar/toolbar-overflow";
import type { AppBarNavigation } from "./app-bar-navigation";
import type { AppBarNavigationClickEventArgs } from "./app-bar-navigation-click-event-args";
import type { AppBarPosition } from "./app-bar-position";
import type { AppBarProps } from "./app-bar-props";
import type { AppBarScrollBehavior } from "./app-bar-scroll-behavior";
import type { AppBarTitleAlign } from "./app-bar-title-align";
import type { AppBarTone } from "./app-bar-tone";

const OWN = ['title', 'subtitle', 'titleAlign', 'headingLevel', 'logo', 'navigation', 'navigationGlyph', 'navigationLabel', 'actions', 'actionsLabel', 'overflow', 'content', 'tone', 'prominent', 'position', 'scrollBehavior', 'scrollTarget'] as const;

/**
 * The top bar of an application (`<header>`): a menu or back button, a logo, a title with a subtitle, a control such as
 * a search box, and commands. The commands are a `Toolbar`, so those that do not fit move into its "more" menu and the
 * arrow keys move between them. The bar can stay at the top while the page scrolls, rise above the content or leave
 * when scrolling down (`scrollBehavior`), and it keeps clear of the notch of a phone.
 *
 * @example
 * <AppBar title="Orders" navigation="menu" onNavigationClick={() => this.drawer.show()}
 *     actions={[{ icon: searchIcon, hint: 'Search', click: () => this.search() }]} />
 * <AppBar title="Invoice" subtitle={() => this.invoice.number} navigation="back" scrollBehavior="hide" />
 * <AppBar title="Inbox" tone="accent"><TextBox label="Search" labelMode="hidden" /></AppBar>
 */
export class AppBar extends Control<HTMLElement, AppBarProps> {
    navigationClick = new Emitter<AppBarNavigationClickEventArgs>();
    row: Component<HTMLDivElement>;
    start: Component<HTMLDivElement>;
    logoHost: Component<HTMLSpanElement>;
    titles: Component<HTMLDivElement>;
    titlePart: Component<HTMLDivElement>;
    subtitlePart: Component<HTMLDivElement>;
    contentHost: Component<HTMLDivElement>;
    actionsHost: Component<HTMLDivElement>;
    toolbar: Toolbar;
    navigationButton: Button | null = null;
    logoPart: ComponentBase | null = null;
    placed: ComponentBase | null = null;
    stopScroll: (() => void) | null = null;

    constructor(props?: IBaseProp<AppBarProps>) {
        super('header', props);
        const own = (this.props ?? {}) as AppBarProps;
        const el = this.element;
        el.classList.add('mx-app-bar');
        this.row = part<HTMLDivElement>(this, 'div', 'mx-app-bar__row');
        this.start = part<HTMLDivElement>(this.row, 'div', 'mx-app-bar__start');
        this.logoHost = part<HTMLSpanElement>(this.start, 'span', 'mx-app-bar__logo');
        this.titles = part<HTMLDivElement>(this.row, 'div', 'mx-app-bar__titles');
        this.titlePart = part<HTMLDivElement>(this.titles, 'div', 'mx-app-bar__title');
        this.subtitlePart = part<HTMLDivElement>(this.titles, 'div', 'mx-app-bar__subtitle');
        this.contentHost = part<HTMLDivElement>(this.row, 'div', 'mx-app-bar__content');
        this.actionsHost = part<HTMLDivElement>(this.row, 'div', 'mx-app-bar__actions');
        this.toolbar = new Toolbar({
            label: () => this.actionsText,
            items: () => this.actions,
            overflow: () => this.overflow
        });
        this.actionsHost.controls.add(this.toolbar);
        if (this.childs?.length) this.contentHost.controls.add(...this.childs);
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onNavigationClick) this.onNavigationClick(own.onNavigationClick);

        for (const name of ['title', 'subtitle', 'headingLevel'] as const) this.observeProperty(name, () => this.drawTitles());
        for (const name of ['navigation', 'navigationGlyph', 'navigationLabel'] as const) this.observeProperty(name, () => this.drawNavigation());
        for (const name of ['titleAlign', 'tone', 'prominent', 'position'] as const) this.observeProperty(name, () => this.drawLook());
        for (const name of ['scrollBehavior', 'scrollTarget'] as const) this.observeProperty(name, () => this.followScroll());
        this.observeProperty('logo', () => this.drawLogo());
        this.observeProperty('actions', () => this.drawActions());
        this.observeProperty('content', () => this.placeContent());
        onLanguage(this, () => this.drawNavigation());
        // A hidden bar comes back for the keyboard, or focus would be out of sight.
        el.addEventListener('focusin', () => mark(el, 'data-hidden', false));
        this.motif.setDisposable(() => {
            this.stopScroll?.();
            this.navigationClick.dispose();
        });
    }

    // In the page now: what scrolls around the bar can be found.
    override onMounted(): void {
        this.followScroll();
    }

    // Properties (see AppBarProps).

    get title(): string {
        return this.getProperty<string | undefined>('title') ?? '';
    }
    set title(value: Bind<string>) {
        this.assignProperty('title', value);
    }
    get subtitle(): string {
        return this.getProperty<string | undefined>('subtitle') ?? '';
    }
    set subtitle(value: Bind<string>) {
        this.assignProperty('subtitle', value);
    }
    get titleAlign(): AppBarTitleAlign {
        return this.getProperty<AppBarTitleAlign | undefined>('titleAlign') ?? 'start';
    }
    set titleAlign(value: Bind<AppBarTitleAlign>) {
        this.assignProperty('titleAlign', value);
    }
    get headingLevel(): number | null {
        return this.getProperty<number | null | undefined>('headingLevel') ?? null;
    }
    set headingLevel(value: Bind<number | null>) {
        this.assignProperty('headingLevel', value);
    }
    get logo(): IconSource | null {
        return this.getProperty<IconSource | null | undefined>('logo') ?? null;
    }
    set logo(value: Bind<IconSource | null | undefined>) {
        this.assignProperty('logo', value);
    }
    get navigation(): AppBarNavigation {
        return this.getProperty<AppBarNavigation | undefined>('navigation') ?? 'none';
    }
    set navigation(value: Bind<AppBarNavigation>) {
        this.assignProperty('navigation', value);
    }
    get navigationGlyph(): string {
        return this.getProperty<string | undefined>('navigationGlyph') || (this.navigation === 'back' ? 'arrow-start' : 'menu');
    }
    set navigationGlyph(value: Bind<string>) {
        this.assignProperty('navigationGlyph', value);
    }
    get navigationLabel(): string {
        return this.getProperty<string | undefined>('navigationLabel') || (this.navigation === 'back' ? uiLocale.strings.back : uiLocale.strings.navigationMenu);
    }
    set navigationLabel(value: Bind<string>) {
        this.assignProperty('navigationLabel', value);
    }
    get actions(): readonly ToolbarItem[] {
        return this.getProperty<readonly ToolbarItem[] | undefined>('actions') ?? [];
    }
    set actions(value: Bind<readonly ToolbarItem[]>) {
        this.assignProperty('actions', value);
    }
    get actionsLabel(): string {
        return this.getProperty<string | undefined>('actionsLabel') ?? '';
    }
    set actionsLabel(value: Bind<string>) {
        this.assignProperty('actionsLabel', value);
    }
    get actionsText(): string {
        return this.actionsLabel || uiLocale.strings.appBarActions;
    }
    get overflow(): ToolbarOverflow {
        return this.getProperty<ToolbarOverflow | undefined>('overflow') ?? 'menu';
    }
    set overflow(value: Bind<ToolbarOverflow>) {
        this.assignProperty('overflow', value);
    }
    get content(): ComponentBase | null {
        return this.getProperty<ComponentBase | null | undefined>('content') ?? null;
    }
    set content(value: Bind<ComponentBase | null>) {
        this.assignProperty('content', value);
    }
    get tone(): AppBarTone {
        return this.getProperty<AppBarTone | undefined>('tone') ?? 'surface';
    }
    set tone(value: Bind<AppBarTone>) {
        this.assignProperty('tone', value);
    }
    get prominent(): boolean {
        return this.getProperty<boolean | undefined>('prominent') ?? false;
    }
    set prominent(value: Bind<boolean>) {
        this.assignProperty('prominent', value);
    }
    get position(): AppBarPosition {
        return this.getProperty<AppBarPosition | undefined>('position') ?? 'sticky';
    }
    set position(value: Bind<AppBarPosition>) {
        this.assignProperty('position', value);
    }
    get scrollBehavior(): AppBarScrollBehavior {
        return this.getProperty<AppBarScrollBehavior | undefined>('scrollBehavior') ?? 'none';
    }
    set scrollBehavior(value: Bind<AppBarScrollBehavior>) {
        this.assignProperty('scrollBehavior', value);
    }
    get scrollTarget(): HTMLElement | null {
        return this.getProperty<HTMLElement | null | undefined>('scrollTarget') ?? null;
    }
    set scrollTarget(value: Bind<HTMLElement | null>) {
        this.assignProperty('scrollTarget', value);
    }
    get onNavigationClick(): MotifEvent<AppBarNavigationClickEventArgs> {
        return this.navigationClick.event;
    }

    drawTitles(): void {
        const title = this.titlePart.element;
        const level = this.headingLevel;
        text(title, this.title);
        text(this.subtitlePart.element, this.subtitle);
        shown(title, this.title !== '');
        shown(this.subtitlePart.element, this.subtitle !== '');
        shown(this.titles.element, this.title !== '' || this.subtitle !== '');
        put(title, 'role', level ? 'heading' : null);
        put(title, 'aria-level', level ? String(level) : null);
    }

    drawNavigation(): void {
        const on = this.navigation !== 'none';
        if (on && !this.navigationButton) {
            this.navigationButton = new Button({
                variant: 'ghost',
                icon: () => glyph(this.navigationGlyph),
                hint: () => this.navigationLabel,
                onclick: (e: Event) => this.navigationClick.fire({ navigation: this.navigation, originalEvent: e, source: this })
            });
            this.navigationButton.element.classList.add('mx-app-bar__navigation');
            this.start.controls.insert(0, this.navigationButton);
        }
        if (this.navigationButton) {
            shown(this.navigationButton.element, on);
            mark(this.navigationButton.element, 'data-back', this.navigation === 'back');
        }
        this.drawStart();
    }

    drawLogo(): void {
        void this.logoPart?.dispose();
        this.logoPart = this.logo ? iconPart(this.logoHost, this.logo) : null;
        this.drawStart();
    }

    drawStart(): void {
        shown(this.logoHost.element, !!this.logoPart);
        shown(this.start.element, !!this.logoPart || this.navigation !== 'none');
    }

    drawActions(): void {
        shown(this.actionsHost.element, this.actions.length > 0);
    }

    placeContent(): void {
        const control = this.content;
        const old = this.placed;
        if (control !== old) {
            if (old && old.parent === this.contentHost) this.contentHost.controls.remove(old);
            this.placed = control;
            if (control) this.contentHost.controls.add(control);
        }
        shown(this.contentHost.element, !!control || !!this.childs?.length);
    }

    drawLook(): void {
        const el = this.element;
        put(el, 'data-tone', this.tone);
        put(el, 'data-position', this.position);
        put(el, 'data-title-align', this.titleAlign);
        mark(el, 'data-prominent', this.prominent);
    }

    followScroll(): void {
        this.stopScroll?.();
        this.stopScroll = null;
        const el = this.element;
        mark(el, 'data-lifted', false);
        mark(el, 'data-hidden', false);
        if (this.scrollBehavior === 'none' || !el.isConnected) return;
        this.stopScroll = watchScroll(this.scrollTarget ?? scrollParent(el), (top, moved) => {
            mark(el, 'data-lifted', top > 0);
            if (this.scrollBehavior !== 'hide' || moved === 0) return;
            mark(el, 'data-hidden', moved > 0 && top > el.offsetHeight);
        });
    }
}
