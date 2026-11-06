import { reactive } from '@motifx/core';
import {
  getDensity,
  getIdentity,
  getTheme,
  setDensity,
  setIdentity,
  setTheme,
  type IdentityName,
  type ThemeChoice,
} from '@motifx-community/design-system';
import { uiLocale } from '@motifx-community/ui';
import { useLanguage } from './texts';

function stored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function store(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Private mode: the switch still works until the page is closed.
  }
}

/** The reader's choices for the whole site: design language, theme, density, language and direction, kept between visits. */
export class SiteSettings {
  private readonly state = reactive({
    identity: getIdentity(),
    theme: getTheme(),
    compact: getDensity() === 'compact',
    rtl: document.documentElement.dir === 'rtl',
    language: stored('mx-docs-language') ?? 'en',
  });

  constructor() {
    if (this.state.language !== 'en') this.language = this.state.language;
  }

  get identity(): IdentityName | 'default' {
    return this.state.identity;
  }
  set identity(id: IdentityName | 'default') {
    this.state.identity = id;
    setIdentity(id);
    store('mx-docs-identity', id === 'default' ? null : id);
  }

  get theme(): ThemeChoice {
    return this.state.theme;
  }
  set theme(id: ThemeChoice) {
    this.state.theme = id;
    setTheme(id);
    store('mx-docs-theme', id === 'system' ? null : id);
  }

  get compact(): boolean {
    return this.state.compact;
  }
  set compact(on: boolean) {
    this.state.compact = on;
    setDensity(on ? 'compact' : 'default');
    store('mx-docs-density', on ? 'compact' : null);
  }

  /** The language of the site's content and of the kit's controls (`uiLocale`); both are loaded the first time. */
  get language(): string {
    return this.state.language;
  }
  set language(code: string) {
    this.state.language = code;
    document.documentElement.lang = code;
    void uiLocale.use(code);
    void useLanguage(code);
    store('mx-docs-language', code === 'en' ? null : code);
  }

  get rtl(): boolean {
    return this.state.rtl;
  }
  set rtl(on: boolean) {
    this.state.rtl = on;
    document.documentElement.dir = on ? 'rtl' : 'ltr';
  }
}
