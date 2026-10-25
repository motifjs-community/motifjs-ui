import { reactive } from '@motifx/core';
import { getDensity, getTheme, setDensity, setTheme, type ThemeChoice } from '@motifx-community/design-system';

function store(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Private mode: the switch still works until the page is closed.
  }
}

/** The reader's choices for the whole site: theme, density and direction, kept between visits. */
export class SiteSettings {
  private readonly state = reactive({
    theme: getTheme(),
    compact: getDensity() === 'compact',
    rtl: document.documentElement.dir === 'rtl',
  });

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

  get rtl(): boolean {
    return this.state.rtl;
  }
  set rtl(on: boolean) {
    this.state.rtl = on;
    document.documentElement.dir = on ? 'rtl' : 'ltr';
  }
}
