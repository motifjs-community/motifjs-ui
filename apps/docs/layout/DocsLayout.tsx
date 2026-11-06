import { Component, reactive, RouterView, untracked, useNavigation } from '@motifx/core';
import { defaultDesignLanguage, designLanguages, type DesignLanguageName, type ThemeChoice } from '@motifx-community/design-system';
import { Button, TextBox } from '@motifx-community/ui';
import { version as VERSION } from "../../../package.json";
import { GROUPS, PAGES, SECTIONS } from '../app/pages';
import { PageOutline } from '../app/PageOutline';
import { SiteSettings } from '../app/SiteSettings';
import { tx } from '../app/texts';
import { Rich } from '../shared/doc';
import { PageFeedback } from '../shared/PageFeedback';
import { MenuIcon, SearchIcon, SourceIcon } from './icons';

const THEMES: { id: ThemeChoice; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'high-contrast', label: 'High contrast' },
];

/** The languages the kit ships a pack for. */
const LANGUAGES: { id: string; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'tr', label: 'Türkçe' },
];

/** Every design language the design system ships, the default one first: a new one shows up here by itself. */
const DESIGN_LANGUAGES: { id: DesignLanguageName | 'default'; label: string }[] = [defaultDesignLanguage, ...designLanguages.filter((id) => id !== defaultDesignLanguage)].map((id) => ({
  id: id === defaultDesignLanguage ? 'default' : id,
  label: id.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' '),
}));

/** How far below the top bar a section heading may be and still count as the one being read. */
const READING_LINE = 140;

/**
 * The frame of the site: the top bar, the side menu (a drawer on narrow screens), the page the
 * router shows, and on the right its sections and related pages.
 */
export class DocsLayout extends Component<HTMLDivElement> {
  private readonly nav = useNavigation();
  private readonly state = reactive({ navOpen: false, filter: '', closed: [] as string[] });
  private menuButton: Button | null = null;
  private main: Component<HTMLElement> | null = null;

  override onConfigured(): void {
    this.class.add('docs-shell');
    this.bindings.watch(() => this.element.toggleAttribute('data-nav-open', this.state.navOpen));
    let first = true;
    this.bindings.watch(() => {
      void this.nav.uri;
      untracked(() => this.pageChanged(first));
      first = false;
    });
    this.bindings.watch(() => {
      const page = this.page;
      document.title = page && page.id !== 'home' ? `${tx(page.title)} · MotifJS UI` : 'MotifJS UI';
    });
  }

  override onMounted(): void {
    const onScroll = () => this.followScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !this.state.navOpen) return;
      this.state.navOpen = false;
      this.menuButton?.focus();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('keydown', onKey);
    this.motif.setDisposable(() => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('keydown', onKey);
    });
  }

  private get settings(): SiteSettings {
    return this.getService(SiteSettings)!;
  }

  private get outline(): PageOutline {
    return this.getService(PageOutline)!;
  }

  private get page() {
    return PAGES.find((p) => p.id === this.nav.meta.page);
  }

  private neighbour(step: number) {
    const at = PAGES.findIndex((p) => p.id === this.nav.meta.page);
    return at < 0 ? undefined : PAGES[at + step];
  }

  private pageChanged(first: boolean): void {
    this.state.navOpen = false;
    // A new page is read from its top: focus goes there, as after a full page load.
    if (!first) this.main?.element.focus({ preventScroll: true });
    requestAnimationFrame(() => this.followScroll());
  }

  /** The button goes with the notice, so focus moves on to the page. */
  private closeNotice(): void {
    this.settings.noticeClosed = true;
    this.main?.element.focus({ preventScroll: true });
  }

  /** The section being read: the last one whose heading has passed the reading line. */
  private followScroll(): void {
    let current = this.outline.sections[0]?.anchor ?? '';
    for (const { anchor } of this.outline.sections) {
      const heading = document.getElementById(anchor);
      if (heading && heading.getBoundingClientRect().top < READING_LINE) current = anchor;
    }
    this.outline.current = current;
  }

  /** A page matches the filter by its label, its title or its group's title ("grid" finds every DataGrid page). */
  private matches(page: { label: string; title: string }, group: string): boolean {
    const filter = this.state.filter.trim().toLocaleLowerCase();
    return !filter || [page.label, page.title, group].some((text) => text.toLocaleLowerCase().includes(filter) || tx(text).toLocaleLowerCase().includes(filter));
  }

  /** A group shows its pages unless closed; a filter shows every match. */
  private groupOpen(title: string): boolean {
    return !!this.state.filter.trim() || !this.state.closed.includes(title);
  }

  private toggleGroup(title: string): void {
    const closed = this.state.closed;
    const at = closed.indexOf(title);
    if (at >= 0) closed.splice(at, 1);
    else closed.push(title);
  }

  override view() {
    const s = this.state;
    const settings = this.settings;
    const outline = this.outline;
    return (
      <>
        <a class="docs-skip" href="#content">
          {() => tx('Skip to content')}
        </a>
        <header class="docs-topbar">
          <Button
            class="docs-menu-toggle"
            variant="ghost"
            icon={() => <MenuIcon />}
            hint={() => tx('Menu')}
            aria-controls="docs-sidebar"
            aria-expanded={() => s.navOpen}
            onclick={() => (s.navOpen = !s.navOpen)}
            ref={(b: Button) => (this.menuButton = b)}
          />
          <a class="docs-brand" rel="router" href="/">
            <img src="/favicon.svg" alt="" />
            <span class="docs-brand__name">
              MotifJS <strong>UI</strong>
            </span>
          </a>
          <nav class="docs-topnav" aria-label={() => tx('Site')}>
            {SECTIONS.map((section) => (
              <a key={section.title} rel="router" href={section.path} aria-current={() => (this.page?.section === section.title ? 'true' : false)}>
                {() => tx(section.title)}
              </a>
            ))}
          </nav>
          <div class="docs-topbar__tools" onfocusin={(e: FocusEvent) => (e.target as HTMLElement).scrollIntoView({ block: 'nearest', inline: 'nearest' })}>
            <Button
              text={() => tx('Design language')}
              size="sm"
              variant="ghost"
              menu={DESIGN_LANGUAGES.map((t) => ({ text: t.label, checked: () => settings.designLanguage === t.id, click: () => (settings.designLanguage = t.id) }))}
            />
            <Button
              text={() => tx('Theme')}
              size="sm"
              variant="ghost"
              menu={THEMES.map((t) => ({ text: () => tx(t.label), checked: () => settings.theme === t.id, click: () => (settings.theme = t.id) }))}
            />
            <Button
              text={() => tx('Language')}
              size="sm"
              variant="ghost"
              menu={LANGUAGES.map((l) => ({ text: l.label, checked: () => settings.language === l.id, click: () => (settings.language = l.id) }))}
            />
            <Button text={() => tx('Compact')} size="sm" variant="ghost" toggle x-model={() => settings.compact} />
            <Button text="RTL" size="sm" variant="ghost" toggle x-model={() => settings.rtl} />
            <a class="docs-topbar__link" href="https://motifjs.com">
              motifjs.com
            </a>
            <a class="docs-topbar__source" href="https://github.com/motifjs-community/motifjs-ui" aria-label={() => tx('Source on GitHub')}>
              <SourceIcon />
            </a>
          </div>
        </header>

        <div class="docs-scrim" onclick={() => (s.navOpen = false)} />
        <nav id="docs-sidebar" class="docs-sidebar" aria-label={() => tx('Documentation')}>
          <TextBox
            class="docs-filter"
            type="search"
            label={() => tx('Search pages')}
            labelMode="hidden"
            placeholder={() => tx('Search pages')}
            variant="underline"
            icon={() => <SearchIcon />}
            clearButton
            stretch
            x-model={() => s.filter}
          />
          {GROUPS.map((group) => (
            <div key={group.title} class="docs-sidebar__group" x-wait={() => !group.pages.some((p) => this.matches(p, group.title))}>
              <button type="button" class="docs-sidebar__title" aria-expanded={() => this.groupOpen(group.title)} onclick={() => this.toggleGroup(group.title)}>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                {() => tx(group.title)}
              </button>
              <ul x-wait={() => !this.groupOpen(group.title)}>
                {group.pages.map((p) => (
                  <li key={p.id} x-wait={() => !this.matches(p, group.title)}>
                    <a rel="router" href={p.path} aria-current={() => (this.nav.meta.page === p.id ? 'page' : false)}>
                      {() => tx(p.label)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p class="docs-sidebar__empty" x-wait={() => PAGES.some((p) => this.matches(p, p.group))}>
            {() => tx('No page matches.')}
          </p>
        </nav>

        <main id="content" class="docs-main" tabindex="-1" ref={(c: Component<HTMLElement>) => (this.main = c)}>
          <header class="docs-pagehead">
            <h1>{() => tx(this.page?.title ?? 'Page not found')}</h1>
            <span class="docs-pagehead__tag">{() => tx(this.page?.group ?? '')}</span>
            <span class="docs-pagehead__version">@motifx-community/ui {VERSION}</span>
          </header>
          <aside class="docs-notice" role="note" x-wait={() => settings.noticeClosed}>
            <span class="mx-glyph docs-notice__icon" data-icon="caution" aria-hidden="true" />
            <p>
              <Rich text="Parts of this topic may have been translated by a machine or AI. Please [tell us](https://github.com/motifjs-community/motifjs-ui/issues) about any parts you think are wrong." />
            </p>
            <Button
              class="docs-notice__close"
              size="sm"
              variant="ghost"
              icon={() => <span class="mx-glyph" data-icon="dismiss" aria-hidden="true" />}
              hint={() => tx('Close')}
              onclick={() => this.closeNotice()}
            />
          </aside>
          <div class="docs-body">
            <article class="docs-article">
              <RouterView />
              <PageFeedback />
              <nav class="docs-pager" aria-label={() => tx('Previous and next page')}>
                <a class="docs-pager__link" rel="router prev" href={() => this.neighbour(-1)?.path ?? '/'} x-wait={() => !this.neighbour(-1)}>
                  <small>{() => tx('Previous')}</small>
                  <span>{() => tx(this.neighbour(-1)?.title ?? '')}</span>
                </a>
                <span x-wait={() => !!this.neighbour(-1)} />
                <a class="docs-pager__link docs-pager__link--next" rel="router next" href={() => this.neighbour(1)?.path ?? '/'} x-wait={() => !this.neighbour(1)}>
                  <small>{() => tx('Next')}</small>
                  <span>{() => tx(this.neighbour(1)?.title ?? '')}</span>
                </a>
              </nav>
            </article>
            <div class="docs-rail">
              <nav aria-label={() => tx('On this page')} x-wait={() => !outline.sections.length}>
                <p class="docs-rail__title">{() => tx('On this page')}</p>
                <ul class="docs-rail__sections">
                  {outline.sections.map((entry) => (
                    <li key={entry.anchor}>
                      <a href={`#${entry.anchor}`} aria-current={() => (outline.current === entry.anchor ? 'location' : false)}>
                        {() => tx(entry.title)}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav aria-label={() => tx('Related pages')} x-wait={() => !this.page?.related.length}>
                <p class="docs-rail__title">{() => tx('Related pages')}</p>
                <ul class="docs-rail__related">
                  {(this.page?.related ?? []).map((id) => PAGES.find((p) => p.id === id)!).map((p) => (
                    <li key={p.id}>
                      <a rel="router" href={p.path}>
                        {() => tx(p.title)}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </main>
      </>
    );
  }
}
