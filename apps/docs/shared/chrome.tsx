import { reactive } from '@motifx/core';
import { getDensity, getTheme, setDensity, setTheme, type ThemeChoice } from '@motifx-community/design-system';
import { Button } from '@motifx-community/ui';

const THEMES: { id: ThemeChoice; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'high-contrast', label: 'High contrast' },
];

const PAGES = [
  { id: 'home', label: 'Overview', href: 'index.html' },
  { id: 'tokens', label: 'Tokens', href: 'tokens/index.html' },
  { id: 'control', label: 'Control', href: 'control/index.html' },
  { id: 'keyboard', label: 'Keyboard', href: 'keyboard/index.html' },
  { id: 'label', label: 'Label', href: 'label/index.html' },
  { id: 'panel', label: 'Panel', href: 'panel/index.html' },
  { id: 'stack', label: 'Stack', href: 'stack/index.html' },
  { id: 'grid', label: 'Grid', href: 'grid/index.html' },
  { id: 'groupbox', label: 'GroupBox', href: 'groupbox/index.html' },
  { id: 'splitcontainer', label: 'SplitContainer', href: 'splitcontainer/index.html' },
  { id: 'button', label: 'Button', href: 'button/index.html' },
  { id: 'form', label: 'MxForm', href: 'form/index.html' },
] as const;

const store = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* private mode: the toggle still works for this page */
  }
};

/**
 * Shared page chrome: the nav plus the three switches — theme and density
 * through the design system's helpers (`data-theme`, `data-density`) and
 * direction (dir="rtl", to show the logical-properties claim is real).
 */
export function Chrome(props: { root: string; active: (typeof PAGES)[number]['id'] }) {
  const html = document.documentElement;
  const s = reactive({
    theme: getTheme(),
    compact: getDensity() === 'compact',
    rtl: html.dir === 'rtl',
  });

  const chooseTheme = (id: ThemeChoice) => {
    s.theme = id;
    setTheme(id);
    store('mx-docs-theme', id === 'system' ? null : id);
  };
  const toggleDensity = () => {
    s.compact = !s.compact;
    setDensity(s.compact ? 'compact' : 'default');
    store('mx-docs-density', s.compact ? 'compact' : null);
  };
  const toggleDir = () => {
    s.rtl = !s.rtl;
    html.dir = s.rtl ? 'rtl' : 'ltr';
  };

  return (
    <header class="docs-header">
      <div class="docs-header__inner">
        <nav aria-label="Pages" class="docs-nav">
          <span class="docs-brand">@motifx-community/ui</span>
          {PAGES.map((p) => (
            <a key={p.id} href={props.root + p.href} aria-current={p.id === props.active ? 'page' : null}>
              {p.label}
            </a>
          ))}
        </nav>
        <div class="docs-controls">
          <div role="group" aria-label="Theme" class="docs-group">
            {THEMES.map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant={() => (s.theme === t.id ? 'solid' : 'ghost')}
                aria-pressed={() => s.theme === t.id}
                onclick={() => chooseTheme(t.id)}
              >
                {t.label}
              </Button>
            ))}
          </div>
          <Button size="sm" variant={() => (s.compact ? 'solid' : 'outline')} aria-pressed={() => s.compact} onclick={toggleDensity}>
            Compact
          </Button>
          <Button size="sm" variant={() => (s.rtl ? 'solid' : 'outline')} aria-pressed={() => s.rtl} onclick={toggleDir}>
            RTL
          </Button>
        </div>
      </div>
    </header>
  );
}
