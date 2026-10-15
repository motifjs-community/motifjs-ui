import { read, type Bind, type ComponentBase } from '@motifx/core';

/** Visual style of a button-shaped control. */
export type ButtonVariant = 'solid' | 'outline' | 'ghost';
/** Control height step; the actual heights come from the density tokens. */
export type ButtonSize = 'sm' | 'md' | 'lg';
/** Color role of a button-shaped control, mapped to the semantic color tokens. */
export type ButtonTone = 'neutral' | 'accent' | 'danger';

/** The three styling props every button-shaped control shares. */
export interface ButtonLookProps {
  /** Visual style. Default `'solid'`. */
  variant?: Bind<ButtonVariant>;
  /** Height/padding/font step. Default `'md'`. */
  size?: Bind<ButtonSize>;
  /** Color role. Default `'neutral'`. */
  tone?: Bind<ButtonTone>;
}

/**
 * Gives a component the `mx-button` look: the class plus live `data-variant`,
 * `data-size` and `data-tone` attributes read from the shared styling props.
 * Shared so every button-shaped control styles through the exact same CSS hooks.
 */
export function applyButtonLook(c: ComponentBase, props: ButtonLookProps): void {
  c.class.add('mx-button');
  c.attr.add({
    'data-variant': live(props.variant, 'solid'),
    'data-size': live(props.size, 'md'),
    'data-tone': live(props.tone, 'neutral'),
  });
}

/** A getter only when the prop is one: a plain value is written once, with no effect. */
function live<T>(value: Bind<T> | undefined, fallback: T): T | (() => T) {
  return typeof value === 'function' ? () => read(value) ?? fallback : (value ?? fallback);
}
