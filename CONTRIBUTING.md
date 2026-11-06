# Contributing to @motifx-community/ui

Thanks for taking the time to help. Bug reports, fixes, tests and documentation improvements are all welcome.

For anything larger than a small fix, please open an issue first so we can agree on the direction before you spend
time on it. Questions and ideas go to the [MotifJS discussions](https://github.com/motifjsdev/motifjs/discussions).

## Setup

Node.js 22 or newer. The design system, the translations and the data layer are dependencies by path until they
are published: clone the four repositories side by side and build the three packages once.

```sh
git clone https://github.com/motifjs-community/motifjs-design-system
git clone https://github.com/motifjs-community/motifjs-i18n
git clone https://github.com/motifjs-community/motifjs-data
git clone https://github.com/motifjs-community/motifjs-ui
cd motifjs-design-system && npm ci && npm run build && cd ..
cd motifjs-i18n && npm ci && npm run build && cd ..
cd motifjs-data && npm ci && npm run build && cd ..
cd motifjs-ui && npm ci
npm run dev
```

`npm run dev` serves the docs site on http://localhost:4500. Every component has a page there, and the pages run
against the source, so a change shows at once.

## Checks

`npm run check` is what CI runs: typecheck, `motif-lint`, stylelint, the tests, the package build and the docs
build. The parts on their own:

```sh
npm test                 # Vitest, jsdom
npm run test:watch
npm run typecheck
npm run lint:jsx         # motif-lint
npm run lint:css         # stylelint, with the design system's shared config
npm run e2e              # real-browser checks: a local Chrome and playwright-core, see e2e/docs-smoke.mjs
```

## Making a change

- Keep a pull request focused on one thing. Two unrelated fixes are easier to review as two pull requests.
- Add a test that fails without your change and passes with it.
- A component's look comes from its tokens: no literal length or colour in its CSS, and every design language
  (`data-design-language`) draws it from its own files under `tokens/languages/`. Look at the change in each language, in
  the light and the dark theme.
- The developer's data is used as given: a component never copies, wraps or changes it.
- A change visible to users gets a line in CHANGELOG.md under "Unreleased", and the component's page under
  `apps/docs/pages` follows it.
- Write commit messages as a short summary line in the imperative ("Fix list reorder after splice"), with a body
  that explains why when it is not obvious.

## Reporting bugs

Please use the bug report form and include a minimal reproduction: the smallest component or snippet that shows the
problem, what you expected and what happened instead.

Security issues should not be reported in public issues. See the
[security policy](https://github.com/motifjs-community/.github/blob/main/SECURITY.md).

## Code of conduct

This project follows the [Code of Conduct](https://github.com/motifjs-community/.github/blob/main/CODE_OF_CONDUCT.md). By taking part you agree
to follow it.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE) of this repository.
