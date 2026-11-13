import { untracked, type ComponentBase } from '@motifx/core';
import type { Command } from './command';
import { commands } from './command-registry';
import { givenField, givenValue } from './given-field';
import { shortcutText } from './shortcut-text';

// An item of a menu, a toolbar or a ribbon may name a command (`command: 'save'`): what the item is not given comes
// from the command, and the item's own value wins. `from` is the item's place: the component it belongs to.

/** The command an item names, as it holds at `from` (the item's place). */
export function commandOf(item: unknown, from?: ComponentBase | null): Command | null {
  const key = givenValue<string | undefined>(item, 'command');
  return key ? commands.get(key, from) : null;
}

/** A field of an item, from the command it names when the item has none. */
export function fieldOf<V>(item: unknown, name: string, from?: ComponentBase | null): V {
  const own = givenField<V>(item, name);
  if (own !== undefined) return own;
  const command = commandOf(item, from);
  return command ? givenField<V>(command, name) : own;
}

/**
 * A field of an item as it is given (a function stays a function), from the command it names when the item has none:
 * for a control that follows the value itself. `commandName` is the command's field when it is called otherwise.
 */
export function valueOf<V>(item: unknown, name: string, from?: ComponentBase | null, commandName = name): V {
  const own = givenValue<V>(item, name);
  if (own !== undefined) return own;
  const command = commandOf(item, from);
  return command ? givenValue<V>(command, commandName) : own;
}

/** The keys an item shows: its own `shortcut`, else the first keys of its command (the user's first), as they read here. */
export function shortcutOf(item: unknown, from?: ComponentBase | null): string {
  const own = givenField<string | undefined>(item, 'shortcut');
  if (own) return own;
  const command = commandOf(item, from);
  const first = command ? commands.keysOf(command)[0] : undefined;
  return first ? shortcutText(first) : '';
}

/** Runs an item's own `click`, else the command it names, when the command is on. */
export function runItem<E>(item: unknown, args: E, source: ComponentBase | null, event: Event | null, from?: ComponentBase | null): void {
  const click = givenValue<((e: E) => void) | undefined>(item, 'click');
  if (click) {
    click(args);
    return;
  }
  const command = commandOf(item, from);
  if (!command || untracked(() => givenField(command, 'enabled')) === false) return;
  command.run?.({ command, item, source, event });
}

/** Whether any of the items names a command: such a list is drawn again when the commands change. */
export function namesCommands(items: readonly unknown[]): boolean {
  return items.some((item) => givenValue(item, 'command') !== undefined);
}
