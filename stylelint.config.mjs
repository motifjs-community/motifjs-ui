// The design system's shared rules: a color, font family, z-index or motion
// value must come from a token (`var(--mx-…)`), a keyword or a system color,
// never from a literal. `npm run lint:css` runs it over the kit and the docs
// source; build output is skipped (a minifier turns `transparent` into `#0000`).
//
// A component made ready for any design language takes no literal
// length either: every size, space, corner, line and shadow is one of its tokens, so a language can
// change it. Its files are listed here as they are done.
const LOSSLESS = [];

export default {
  extends: ['@motifx-community/design-system/stylelint'],
  ignoreFiles: ['**/dist/**', '**/node_modules/**'],
  overrides:
    LOSSLESS.length === 0
      ? []
      : [
          {
            files: LOSSLESS,
            rules: {
              'declaration-property-value-disallowed-list': [
                {
                  '/^(padding|margin|gap|row-gap|column-gap|inset|top|right|bottom|left|inline-size|block-size|width|height|min-|max-|border|outline|font-size|line-height|letter-spacing|translate|box-shadow|text-indent|grid-auto|grid-template)/':
                    ['/(^|[\\s(,])-?\\d*\\.?\\d+(px|rem|em)\\b/'],
                },
                { message: 'A literal length: use one of the component’s tokens, so a design language can change it.' },
              ],
            },
          },
        ],
};
