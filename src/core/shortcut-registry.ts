import { Emitter, untracked, type Event as MotifEvent } from '@motifx/core';
import { accessKeyToken } from './access-key';
import { givenKeys, parseShortcut, registered, setGivenKeys, shortcutChanges, type Chord, type Registration } from './keyboard';
import { pageDocuments } from './page-documents';
import { isApplePlatform } from './platform';
import type { ShortcutConflict } from './shortcut-conflict';
import type { ShortcutInfo } from './shortcut-info';
import type { Keymap } from './keymap';
import type { KeymapChangedEventArgs } from './keymap-changed-event-args';

/**
 * Every keyboard shortcut of the app in one place: the commands' keys (`commands`), the app's own (`addShortcut`) and
 * those of the kit's components, each with its name, to list them, to find the ones that get in each other's way and to
 * hold the keys the user gives them. One registry serves the whole app: `shortcuts`.
 */
export class ShortcutRegistry {
  /** Says on the console when a shortcut added gets in another's way. The default is `true`. */
  warnings = true;
  private changed = new Emitter<void>();
  private conflicted = new Emitter<ShortcutConflict>();
  private mapChanged = new Emitter<KeymapChangedEventArgs>();

  /** Occurs when a shortcut is added or taken away, or its keys change. */
  readonly onChanged: MotifEvent<void> = this.changed.event;
  /** Occurs when a shortcut added gets in the way of one there before (`same` or `prefix`). */
  readonly onConflict: MotifEvent<ShortcutConflict> = this.conflicted.event;
  /** Occurs when the keys the user gave change, with the whole keymap to save. */
  readonly onKeymapChanged: MotifEvent<KeymapChangedEventArgs> = this.mapChanged.event;

  constructor() {
    shortcutChanges.event((reg) => {
      if (reg) this.check(reg);
      this.changed.fire();
    });
  }

  /**
   * The keys the user gave, by the name of the shortcut: a copy, to save. Give it back to restore them; `null` forgets
   * them. Every shortcut with one of those names takes them at once.
   */
  get keymap(): Keymap {
    return copyOf(givenKeys());
  }
  set keymap(value: Keymap | null) {
    setGivenKeys(copyOf(value ?? {}));
    this.mapChanged.fire({ keymap: this.keymap, name: null });
  }

  /** Gives the shortcuts with `name` the user's keys (an empty list: none), or their own again with `null`. */
  assign(name: string, keys: readonly string[] | null): void {
    const next = { ...givenKeys() };
    if (keys === null) delete next[name];
    else next[name] = [...keys];
    setGivenKeys(next);
    this.mapChanged.fire({ keymap: this.keymap, name });
  }

  /** The keys of the shortcuts with `name`: the user's, else `defaults`, else their own. */
  keysOf(name: string, defaults?: readonly string[]): readonly string[] {
    return givenKeys()[name] ?? defaults ?? registered().find((reg) => reg.name === name)?.defaults ?? [];
  }

  /** Whether the user gave the shortcuts with `name` keys of their own. */
  isAssigned(name: string): boolean {
    return name in givenKeys();
  }

  /** The shortcuts working now, in the order they came. */
  list(): ShortcutInfo[] {
    return registered().map(info);
  }

  /** The shortcuts that get in each other's way now, access keys on the page included. */
  conflicts(): ShortcutConflict[] {
    const regs = registered();
    const out: ShortcutConflict[] = [];
    regs.forEach((reg, i) => {
      for (const earlier of regs.slice(0, i)) {
        const found = clash(earlier, reg);
        if (found) out.push({ reason: found.reason, keys: found.keys, shortcuts: [info(earlier), info(reg)] });
      }
      for (const { letter, keys } of accessLetters(reg)) {
        if (pageDocuments().some((doc) => hasAccessKey(doc, accessKeyToken(letter)))) out.push({ reason: 'accessKey', keys, shortcuts: [info(reg)] });
      }
    });
    return out;
  }

  /** The shortcuts `keys` would get in the way of, in a place `scope`-wide (`null`: app-wide). */
  takenBy(keys: string, scope: Registration['scope'] = null): ShortcutInfo[] {
    let chords: Chord[];
    try {
      chords = parseShortcut(keys);
    } catch {
      return [];
    }
    const probe = { keys: [keys], sequences: [chords], scope } as unknown as Registration;
    return registered().filter((reg) => clash(reg, probe)).map(info);
  }

  private check(reg: Registration): void {
    for (const earlier of registered()) {
      if (earlier === reg) break;
      const found = clash(earlier, reg);
      if (!found) continue;
      const conflict: ShortcutConflict = { reason: found.reason, keys: found.keys, shortcuts: [info(earlier), info(reg)] };
      if (this.warnings) {
        const what = (r: Registration) => `"${found.keys}"${r.name ? ` (${r.name})` : ''}`;
        console.warn(
          found.reason === 'same'
            ? `Shortcuts: ${what(reg)} has the keys of ${what(earlier)} in the same place; the first one added runs.`
            : `Shortcuts: ${what(reg)} and ${what(earlier)} start with the same keys; the shorter one never runs.`,
        );
      }
      this.conflicted.fire(conflict);
    }
  }
}

function info(reg: Registration): ShortcutInfo {
  return {
    keys: reg.keys,
    defaults: reg.defaults,
    name: reg.name,
    text: textOf(reg.text) || reg.name || '',
    category: textOf(reg.category),
    scope: reg.scope,
    inEditable: reg.inEditable,
    customizable: reg.name !== null && reg.customizable,
  };
}

function textOf(value: string | (() => string) | null): string {
  return typeof value === 'function' ? untracked(value) : (value ?? '');
}

function chordText(c: Chord): string {
  return `${c.ctrl ? 'ctrl+' : ''}${c.alt ? 'alt+' : ''}${c.shift ? 'shift+' : ''}${c.meta ? 'meta+' : ''}${c.key}`;
}

/** Two shortcuts in the same place: keys of both the same, or keys of one starting keys of the other. */
function clash(a: Registration, b: Registration): { reason: 'same' | 'prefix'; keys: string } | null {
  if (a.scope !== b.scope) return null;
  for (let i = 0; i < a.sequences.length; i++) {
    const x = a.sequences[i].map(chordText);
    for (const other of b.sequences) {
      const y = other.map(chordText);
      const n = Math.min(x.length, y.length);
      let k = 0;
      while (k < n && x[k] === y[k]) k++;
      if (k === n) return { reason: x.length === y.length ? 'same' : 'prefix', keys: a.keys[i] };
    }
  }
  return null;
}

/** The letters of an app-wide shortcut pressed as access keys are (Alt + letter; Control + Option on Apple platforms). */
function accessLetters(reg: Registration): { letter: string; keys: string }[] {
  if (reg.scope) return [];
  const apple = isApplePlatform();
  const out: { letter: string; keys: string }[] = [];
  reg.sequences.forEach((chords, i) => {
    if (chords.length !== 1) return;
    const c = chords[0];
    const asAccess = apple ? c.ctrl && c.alt && !c.shift && !c.meta : c.alt && !c.ctrl && !c.shift && !c.meta;
    if (asAccess && /^\p{L}$|^\p{N}$/u.test(c.key)) out.push({ letter: c.key, keys: reg.keys[i] });
  });
  return out;
}

function hasAccessKey(doc: Document, token: string): boolean {
  for (const el of doc.querySelectorAll('[aria-keyshortcuts]')) {
    if ((el.getAttribute('aria-keyshortcuts') ?? '').split(/\s+/).includes(token)) return true;
  }
  return false;
}

/** Every keyboard shortcut of the app. */
export const shortcuts = new ShortcutRegistry();

function copyOf(map: Keymap): Record<string, readonly string[]> {
  return Object.fromEntries(Object.entries(map).map(([name, keys]) => [name, [...keys]]));
}
