/** A Style Dictionary token as the component platform sees it (transformed). */
export interface ComponentToken {
  path: string[];
  name: string;
  $type?: string;
  type?: string;
  $value?: unknown;
  value?: unknown;
  isSource?: boolean;
  original?: { $value?: unknown; value?: unknown };
}

export const LAYER: 'mx.components';
export const PREFIX: 'mx';
export const SOURCE: string;
export const INCLUDE: string[];
export const TRANSFORMS: string[];

/** `{radius.md}` becomes `radius.md`; null when the source value is not a plain reference. */
export function referenceOf(token: ComponentToken): string | null;
/** The transformed component tokens; throws on a missing reference or a `$type` mismatch. */
export function componentTokens(): Promise<ComponentToken[]>;
/** Renders one format ('mx/components-css' | 'mx/components-ts' | 'mx/components-json') in memory. */
export function render(format: 'mx/components-css' | 'mx/components-ts' | 'mx/components-json'): Promise<string>;
