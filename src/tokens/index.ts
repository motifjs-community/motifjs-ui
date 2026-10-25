import { tokens as designTokens, type TokenName as DesignTokenName } from '@motifx-community/design-system';
import { componentTokens, type ComponentTokenName } from '../generated/tokens';

export { componentTokens, type ComponentTokenName };
export type { DesignTokenName };

/** Every token name a style in this kit may use: the design system's layers plus this kit's component tokens. */
export type TokenName = DesignTokenName | ComponentTokenName;

/** Every token: the design system's map and the component tokens, one object. */
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
