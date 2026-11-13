import { Emitter, untracked, type ComponentBase, type Event as MotifEvent } from '@motifx/core';
import { parseAccessKey } from './access-key';
import type { Command } from './command';
import type { CommandsChangedEventArgs } from './commands-changed-event-args';
import { isWithin, treeDepth } from './component-tree';
import { holdsFocus } from './focus';
import { givenField } from './given-field';
import { addShortcut, isKeys } from './keyboard';
import { shortcuts } from './shortcut-registry';

/**
 * The commands of the app, by key. A command added here runs from its keys, and the items of menus, toolbars and
 * ribbons that name it take what they are not given from it. One registry serves the whole app: `commands`.
 */
export class CommandRegistry {
  private byKey = new Map<string, Command[]>();
  private changed = new Emitter<CommandsChangedEventArgs>();
  /** What takes each command's keys away. */
  private keyStops = new Map<Command, () => void>();

  /** Occurs when a command is added or taken away. */
  readonly onChanged: MotifEvent<CommandsChangedEventArgs> = this.changed.event;

  constructor() {
    // The user gave other keys: the shortcuts took them already, the items that show them read them again.
    shortcuts.onKeymapChanged((e) => {
      for (const key of e.name === null ? [...this.byKey.keys()] : [e.name]) if (this.byKey.has(key)) this.changed.fire({ key });
    });
  }

  /** The keys of a command: the user's (`shortcuts.keymap`), else its own `shortcut`. */
  keysOf(command: Command): readonly string[] {
    const own = typeof command.shortcut === 'string' ? [command.shortcut] : (command.shortcut ?? []);
    return shortcuts.keysOf(command.key, own);
  }

  /**
   * Adds a command, with its keys. Returns a function that takes it away. A command limited to a component (`scope`) is
   * taken away by itself when the component is disposed.
   */
  add(command: Command): () => void {
    const list = this.byKey.get(command.key) ?? [];
    list.push(command);
    this.byKey.set(command.key, list);
    this.keyStops.set(command, this.addKeys(command));
    this.changed.fire({ key: command.key });
    let done = false;
    const remove = () => {
      if (done) return;
      done = true;
      this.keyStops.get(command)?.();
      this.keyStops.delete(command);
      const now = this.byKey.get(command.key) ?? [];
      const rest = now.filter((c) => c !== command);
      if (rest.length) this.byKey.set(command.key, rest);
      else this.byKey.delete(command.key);
      this.changed.fire({ key: command.key });
    };
    // Its place goes away: the command goes with it.
    command.scope?.motif.setDisposable(remove);
    return remove;
  }

  /**
   * The command with `key` that holds here: of the scope that holds `from` (the component of the item that names it,
   * such as its menu or toolbar), else of the scope that holds focus, else the app-wide one, else the last added.
   */
  get(key: string, from?: ComponentBase | null): Command | null {
    const list = (this.byKey.get(key) ?? []).filter((c) => !c.scope?.isDisposed);
    if (list.length < 2) return list[0] ?? null;
    const deepest = (found: Command[]) => found.sort((a, b) => treeDepth(b.scope!) - treeDepth(a.scope!))[0];
    const here = from ? list.filter((c) => c.scope && isWithin(from, c.scope)) : [];
    if (here.length) return deepest(here);
    const focused = list.filter((c) => c.scope && holdsFocus(c.scope));
    if (focused.length) return deepest(focused);
    return list.find((c) => !c.scope) ?? list[list.length - 1];
  }

  has(key: string): boolean {
    return this.byKey.has(key);
  }

  /** Every command added, in the order they came. */
  list(): Command[] {
    return [...this.byKey.values()].flat();
  }

  /** Runs the command with `key` that holds here (see `get`). Returns `false` when there is none or it is off. */
  run(key: string, from?: ComponentBase | null, event: Event | null = null): boolean {
    const command = this.get(key, from);
    if (!command || untracked(() => givenField(command, 'enabled')) === false) return false;
    command.run?.({ command, item: null, source: command.scope ?? null, event });
    return true;
  }

  /** The command's keys, under its key: the user's keys for that name take the place of its own. */
  private addKeys(command: Command): () => void {
    const own = typeof command.shortcut === 'string' ? [command.shortcut] : (command.shortcut ?? []);
    return addShortcut(
      own.filter(isKeys),
      (e) => {
        // Off: the key goes on to the page.
        if (untracked(() => givenField(command, 'enabled')) === false) return false;
        command.run?.({ command, item: null, source: command.scope ?? null, event: e });
      },
      {
        scope: command.scope ?? undefined,
        inEditable: command.inEditable,
        name: command.key,
        text: () => parseAccessKey(String(givenField(command, 'text') ?? '')).text || command.key,
        category: () => String(givenField(command, 'category') ?? ''),
      },
    );
  }
}

/** The commands of the app. */
export const commands = new CommandRegistry();
