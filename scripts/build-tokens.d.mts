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
/** Per design language: the component tokens it maps differently. */
export function IDENTITY_SOURCE(language: string): string;
/** Every scope where the design system's values can change. */
export const SCOPES: string;
/** A language's scope, and theme and density scopes inside it. */
export function identityScope(language: string): string;
/** The design languages that map some component tokens differently. */
export function identities(): string[];

/** `{radius.md}` becomes `radius.md`; null when the source value is not a plain reference. */
export function referenceOf(token: ComponentToken): string | null;
/**
 * The transformed component tokens, or with a `language` the ones it maps differently; throws on a
 * missing reference, a `$type` mismatch or a mapped name that is not a component token.
 */
export function componentTokens(language?: string): Promise<ComponentToken[]>;
/** Renders one format ('mx/components-css' | 'mx/components-ts' | 'mx/components-json') in memory. */
export function render(format: 'mx/components-css' | 'mx/components-ts' | 'mx/components-json'): Promise<string>;
/** The component tokens a language maps differently, as one block under its scope. */
export function renderIdentity(language: string): Promise<string>;
/** The whole stylesheet: every component token on every scope, then each language's mapping. */
export function renderCss(): Promise<string>;
