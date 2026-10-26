import type { GridRowDragging } from '../grid-row-dragging';
import type { RowDraggingValues } from './row-dragging-values';
import { Switches } from './Switches';

const KEYS: (keyof RowDraggingValues)[] = [
  'allowReordering',
  'allowDropInsideItem',
  'dropFeedbackMode',
  'showDragIcons',
  'handle',
  'group',
  'data',
  'dragDirection',
  'boundary',
  'container',
  'cursorOffset',
  'autoScroll',
  'scrollSpeed',
  'scrollSensitivity',
  'keyboard',
  'moveUpKeys',
  'moveDownKeys',
  'columnWidth',
];

const DEFAULTS: Partial<RowDraggingValues> = {
  allowReordering: false,
  allowDropInsideItem: false,
  dropFeedbackMode: 'indicate',
  showDragIcons: true,
  handle: '',
  dragDirection: 'both',
  autoScroll: true,
  scrollSpeed: 30,
  scrollSensitivity: 60,
  keyboard: true,
  moveUpKeys: ['Ctrl+Shift+ArrowUp'],
  moveDownKeys: ['Ctrl+Shift+ArrowDown'],
  columnWidth: 36,
};

/** The handlers of `rowDragging`: kept as they are, a function with no parameters too. */
const HANDLERS = ['onDragStart', 'onDragMove', 'onDragChange', 'onDragEnd', 'onReorder', 'onAdd', 'onRemove', 'dragTemplate'] as const;

type Handlers<T> = Pick<GridRowDragging<T>, (typeof HANDLERS)[number]>;

/**
 * The `rowDragging` options: the values (each a value or a function that is followed) and the
 * handlers and `dragTemplate`, which are kept as they are. `view` reads and assigns both.
 */
export class RowDragOptions<T> {
  readonly values: Switches<RowDraggingValues>;
  readonly handlers: Handlers<T> = {};
  readonly view: GridRowDragging<T>;
  /** Called after a value is assigned through `view`. */
  changed: ((key: string, value: unknown, previous: unknown) => void) | null = null;

  constructor(given: GridRowDragging<T> | undefined) {
    this.values = new Switches<RowDraggingValues>(KEYS, DEFAULTS, given ?? {});
    this.values.changed = (key, value, previous) => this.changed?.(key, value, previous);
    for (const name of HANDLERS) if (given?.[name] !== undefined) (this.handlers as Record<string, unknown>)[name] = given[name];
    const handlerNames = new Set<string>(HANDLERS);
    const values = this.values.view as unknown as Record<string, unknown>;
    this.view = new Proxy({} as GridRowDragging<T>, {
      get: (_target, key) => (typeof key !== 'string' ? undefined : handlerNames.has(key) ? (this.handlers as Record<string, unknown>)[key] : values[key]),
      set: (_target, key, value) => {
        if (typeof key !== 'string') return false;
        if (!handlerNames.has(key)) return Reflect.set(values, key, value);
        const previous = (this.handlers as Record<string, unknown>)[key];
        (this.handlers as Record<string, unknown>)[key] = value;
        this.changed?.(key, value, previous);
        return true;
      },
      has: (_target, key) => typeof key === 'string' && (handlerNames.has(key) || key in values),
      ownKeys: () => [...KEYS, ...HANDLERS],
      getOwnPropertyDescriptor: (_target, key) => {
        if (typeof key !== 'string' || (!handlerNames.has(key) && !(key in values))) return undefined;
        const value = handlerNames.has(key) ? (this.handlers as Record<string, unknown>)[key] : values[key];
        return { enumerable: true, configurable: true, writable: true, value };
      },
    });
  }

  get<K extends keyof RowDraggingValues>(key: K): RowDraggingValues[K] {
    return this.values.get(key);
  }

  /** A drag can start here: rows move within the grid, onto rows, or to the grids of a group. Reactive. */
  get enabled(): boolean {
    return this.get('allowReordering') || this.get('allowDropInsideItem') || !!this.get('group');
  }

  /** The drag icon column shows. Reactive. */
  get showsIcons(): boolean {
    return this.enabled && this.get('showDragIcons');
  }

  /** Whether someone handles one of the events. */
  listens(name: keyof Handlers<T>): boolean {
    return typeof this.handlers[name] === 'function';
  }
}
