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

/** Where a component holds another part: inside `selector`, the part's `tokens` take the place's values. */
export interface Place {
  component: string;
  place: string;
  selector: string;
  part: string;
  tokens: string[];
  $description?: string;
}

/** A piece of a component a design draws on its own: its selector, its states (each with its selector, and the state it falls back to), and the schema's defaults for its box. */
export interface Unit {
  component: string;
  unit: string;
  selector: string;
  states: { name: string; selector: string; from?: string }[];
  defaults: Record<string, string>;
  $description?: string;
}

export const LAYER: 'mx.components';
export const PREFIX: 'mx';
export const SCHEMA_DIR: string;
export const LANGUAGES_DIR: string;
/** The language whose values stand where no `data-design-language` is written. */
export const DEFAULT_LANGUAGE: 'tactile';
export const INCLUDE: string[];
export const TRANSFORMS: string[];
/** Every scope where the design system's values can change. */
export const SCOPES: string;
/** A language's scope, and theme and density scopes inside it. */
export function designLanguageScope(language: string): string;

/** Every component token (places included) with its type and description, and the places. */
export function schema(): {
  tokens: Map<string, { type: string; description: string; unit?: boolean }>;
  places: Place[];
  units: Unit[];
  descriptions: Map<string, string>;
  selectors: Map<string, string>;
};
/** The languages, the default one first. */
export function languages(): string[];
/** A language's value for every token, its references to its own tokens resolved; throws listing every token missing or unknown. */
export function languageValues(language: string): Map<string, unknown>;

/** `{radius.md}` becomes `radius.md`; null when the source value is not a plain reference. */
export function referenceOf(token: ComponentToken): string | null;
/** A language's transformed component tokens; throws on a missing reference or a `$type` mismatch. */
export function componentTokens(language?: string): Promise<ComponentToken[]>;
/** Renders one format of the default language ('mx/components-css' | 'mx/components-ts' | 'mx/components-json') in memory. */
export function render(format: 'mx/components-css' | 'mx/components-ts' | 'mx/components-json'): Promise<string>;
/** A language's tokens under its scope, the lines the default language writes the same left out. */
export function renderLanguage(language: string): Promise<string>;
/** The whole token stylesheet: the default language on every scope, then each other language under its own. */
export function renderCss(): Promise<string>;
/** On each component's root, every token of the component in its slot. */
export function renderSlots(): string;
/** Inside each place, the part's slots pointing at the place's tokens. */
export function renderPlaces(): string;
/** Every unit's paint: at rest, then in each state in the schema's order, from the unit's slots. */
export function renderUnits(): string;
