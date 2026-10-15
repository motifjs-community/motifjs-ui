// The design system's shared rules: a color, font family, z-index or motion
// value must come from a token (`var(--mx-…)`), a keyword or a system color,
// never from a literal. `npm run lint:css` runs it over the kit and the docs
// source; build output is skipped (a minifier turns `transparent` into `#0000`).
export default {
  extends: ['@motifx-community/design-system/stylelint'],
  ignoreFiles: ['**/dist/**', '**/node_modules/**'],
};
