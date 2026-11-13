import { tokens as designTokens, type TokenName as DesignTokenName } from '@motifx-community/design-system';
import { componentTokens, type ComponentTokenName } from '../generated/tokens';

export { componentTokens, type ComponentTokenName };
export type { DesignTokenName };

/** Every token name a style in this kit may use: the design system's layers plus this kit's component tokens. */
export type TokenName = DesignTokenName | ComponentTokenName;

/** Every token in one object: the design system's map and the component tokens. */
export const tokens = { ...designTokens, ...componentTokens } as const;

/**
 * The `var(--mx-…)` expression for a design or component token, checked at
 * compile time. Use it wherever a style is written in TS instead of CSS.
 *
 * @example
 * <div style={{ background: cssVar('color.accent.solid'), borderRadius: cssVar('radius.md') }} />
 */
export function cssVar(name: TokenName): `var(${string})` {
  return `var(${tokens[name].cssVar})`;
}

let properties: readonly `--${string}`[] | null = null;

/** The CSS custom property of every token, design and component: what a part reads to know the token values it has. */
export function tokenProperties(): readonly `--${string}`[] {
  return (properties ??= Object.values(tokens).map((token) => token.cssVar as `--${string}`));
}

/**
 * The name of a token's CSS custom property, for `getComputedStyle` reads or
 * for writing an override on an element.
 *
 * @example
 * el.style.setProperty(cssProperty('color.accent.solid'), 'rebeccapurple');
 */
export function cssProperty(name: TokenName): `--${string}` {
  return tokens[name].cssVar;
}
