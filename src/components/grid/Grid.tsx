import type { Bind, IBaseProp } from '@motifx/core';
import { Control, type ControlProps } from '../../core/control';
import { toSpace, type Length, type Space } from '../../core/space';

/**
 * Row or column sizes: a comma-separated string or an array. Each one is any
 * CSS track (`'auto'`, `'1fr'`, `'10rem'`, `'minmax(8rem, 1fr)'`), a number
 * of pixels, or the shorthand `*` / `2*` for a share of the space left
 * (`minmax(0, 1fr)` / `minmax(0, 2fr)`: unlike a bare `fr`, it can shrink
 * below its content).
 *
 * @example 'auto, 1fr, 2fr, 120'
 */
export type GridTracks = string | Length[];

/** Props of {@link Grid}. */
export interface GridProps extends ControlProps {
  /** Row definitions (see {@link GridTracks}). Unset: rows are added as needed, sized to content. */
  rows?: Bind<GridTracks | undefined>;
  /** Column definitions (see {@link GridTracks}). Unset: one column. */
  columns?: Bind<GridTracks | undefined>;
  /** Space between rows and columns: a token step, pixels or any CSS length. */
  gap?: Bind<Space | undefined>;
  /** Space between rows only; overrides `gap` for rows. */
  rowGap?: Bind<Space | undefined>;
  /** Space between columns only; overrides `gap` for columns. */
  columnGap?: Bind<Space | undefined>;
  /** Space inside the grid, like `Panel.padding`. */
  padding?: Bind<Space | undefined>;
}

const OWN = ['rows', 'columns', 'gap', 'rowGap', 'columnGap', 'padding'] as const;

/**
 * Rows and columns with defined sizes, as a CSS grid. Children say where they
 * go with the `row`, `column`, `rowSpan` and `columnSpan` props every control
 * has (1-based lines, as in CSS); children without them fill the cells in
 * order. Plain elements use `style={{ gridRow: '2', gridColumn: '1 / span 2' }}`.
 * No script runs on resize.
 *
 * @example
 * <Grid columns="240, 1fr" rows="auto, 1fr" gap="sm">
 *   <Panel row={1} column={1} columnSpan={2}>Header</Panel>
 *   <Panel row={2} column={1} scrollable>List</Panel>
 *   <Panel row={2} column={2}>Details</Panel>
 * </Grid>
 */
export class Grid<TProps extends GridProps = GridProps> extends Control<HTMLDivElement, TProps> {
  constructor(element: HTMLDivElement | string, props?: IBaseProp<TProps>);
  // Last, so JSX takes the props type from it.
  constructor(props?: IBaseProp<TProps>);
  constructor(...args: unknown[]) {
    super(...(args as [IBaseProp<TProps>?]));
    this.class.add('mx-grid');
    const props = (this.props ?? {}) as GridProps;
    for (const name of OWN) if (props[name] !== undefined) this.bindProperty(name, props[name]);
  }

  /** See the prop. Reactive. */
  get rows(): GridTracks | undefined {
    return this.getProperty<GridTracks | undefined>('rows');
  }
  set rows(value: GridTracks | undefined) {
    this.setProperty('rows', value);
  }
  get columns(): GridTracks | undefined {
    return this.getProperty<GridTracks | undefined>('columns');
  }
  set columns(value: GridTracks | undefined) {
    this.setProperty('columns', value);
  }
  get gap(): Space | undefined {
    return this.getProperty<Space | undefined>('gap');
  }
  set gap(value: Space | undefined) {
    this.setProperty('gap', value);
  }
  get rowGap(): Space | undefined {
    return this.getProperty<Space | undefined>('rowGap');
  }
  set rowGap(value: Space | undefined) {
    this.setProperty('rowGap', value);
  }
  get columnGap(): Space | undefined {
    return this.getProperty<Space | undefined>('columnGap');
  }
  set columnGap(value: Space | undefined) {
    this.setProperty('columnGap', value);
  }
  get padding(): Space | undefined {
    return this.getProperty<Space | undefined>('padding');
  }
  set padding(value: Space | undefined) {
    this.setProperty('padding', value);
  }

  protected override applyProperty(name: string, value: unknown): void {
    const style = this.element.style;
    switch (name) {
      case 'rows':
        style.gridTemplateRows = toTracks(value as GridTracks | undefined);
        break;
      case 'columns':
        style.gridTemplateColumns = toTracks(value as GridTracks | undefined);
        break;
      case 'gap':
        style.gap = toSpace(value as Space | undefined);
        break;
      case 'rowGap':
        style.setProperty('row-gap', toSpace(value as Space | undefined));
        break;
      case 'columnGap':
        style.setProperty('column-gap', toSpace(value as Space | undefined));
        break;
      case 'padding':
        style.padding = toSpace(value as Space | undefined);
        break;
      default:
        super.applyProperty(name, value);
    }
  }
}

/** CSS `grid-template-*` for a track list (see {@link GridTracks}). */
export function toTracks(value: GridTracks | undefined): string {
  if (value === undefined || value === null || value === '') return '';
  const parts = Array.isArray(value) ? value : splitTopLevel(value);
  return parts.map(toTrack).join(' ');
}

function toTrack(part: Length): string {
  if (typeof part === 'number') return `${part}px`;
  const p = part.trim();
  if (p === 'auto') return 'auto';
  if (p === '*') return 'minmax(0, 1fr)';
  const star = /^(\d*\.?\d+)\*$/.exec(p);
  if (star) return `minmax(0, ${star[1]}fr)`;
  if (/^\d*\.?\d+$/.test(p)) return `${p}px`;
  return p;
}

/** Splits on commas that are not inside parentheses (`minmax(8rem, 1fr), auto`). */
function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of text) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else current += ch;
  }
  parts.push(current);
  return parts.map((p) => p.trim()).filter(Boolean);
}
