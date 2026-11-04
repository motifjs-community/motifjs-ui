# Getting started

> `@motifx-community/ui` is a **preview** (`beta`): it is complete enough to build with, and its API may still change
> before 1.0. Install it with the `beta` tag; `@motifx/core` and its compiler with `next`.

## Install

```sh
npm i @motifx/core@next @motifx-community/ui@beta @motifx-community/design-system@beta @motifx-community/data@beta @motifx-community/i18n@beta
npm i -D @motifx/compiler@next vite typescript
```

`exceljs` (the grid's Excel export, `@motifx-community/ui/excel`) and `jspdf` (`@motifx-community/ui/pdf`) are optional: install
them only when you import those entries.

## Set up Vite and TypeScript

```ts
// vite.config.ts
import compiler from '@motifx/compiler';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [compiler()],
  resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js'], dedupe: ['@motifx/core'] },
  // The kit's styles use :dir(), :has() and relative colours: build CSS for the browsers it supports.
  build: { cssTarget: ['chrome120', 'edge120', 'firefox128', 'safari18'] },
});
```

```jsonc
// tsconfig.json (the keys that matter)
{ "compilerOptions": { "jsx": "preserve", "target": "ES2021", "module": "esnext", "moduleResolution": "bundler", "useDefineForClassFields": true, "strict": true } }
```

## Styles, design languages, themes

```ts
// main.tsx
import '@motifx-community/ui/styles.css'; // the design system first, then the kit
import { Application } from '@motifx/core';
import { App } from './App';

Application.CreateBuilder().build().run('#app', new App());
```

The look comes from the design system. Choose a design language and a theme on `<html>` (or on any element, for that
part of the page):

```html
<html data-identity="material" data-theme="dark" data-density="compact">
```

- `data-identity`: `tactile` (the default, without the attribute), `lounge`, `material`, `fluent`, `lilac`.
- `data-theme`: `light`, `dark`, `high-contrast`; without it the system's preference.
- `data-density`: `compact`; without it the regular one.

Restyle by overriding design-system tokens (`--mx-*`) after the kit's stylesheet, e.g. `:root { --mx-color-accent-solid: #8764b8; }`.

## The kit's language

The texts the components write themselves (buttons, messages, screen-reader names) and their numbers and dates follow
`uiLocale`. English and Turkish ship with the kit; `uiLocale.use('tr')` loads the Turkish pack and every component
draws again, live.

```ts
import { uiLocale } from '@motifx-community/ui';
await uiLocale.use('tr');
uiLocale.add('de', { ok: 'OK', cancel: 'Abbrechen' /* … */ });
```

With `@motifx-community/i18n` for the app's own texts, `connectI18n(i18n)` keeps the kit on the app's language.

## How the components work

- A component is an object: write it in JSX (`<Button text="Save" />`) or make it with `new Button({ text: 'Save' })`, add it
  anywhere (`this.controls.add(button)`), change it later (`button.text = 'Saved'`).
- Every prop and property takes a value or a function (`Bind<T>`): `disabled={() => this.model.busy}` follows the state.
- `x-model` binds a value two-way: `<TextBox label="Name" x-model={() => this.form.name} />`.
- Events are `onX` props or properties that take a listener: `onValueChanged={(e) => …}`, `grid.onRowClick((e) => …)`;
  `e.byUser` tells a user's change from one made by code.
- A component added to another is its child and goes with it when it is disposed; add components with `controls.add`,
  never by putting their element into the page yourself.
- Your data is used as given: items, rows and values are not wrapped or copied.

```tsx
import { Component, reactive } from '@motifx/core';
import { Button, Stack, TextBox } from '@motifx-community/ui';

export class App extends Component<HTMLDivElement> {
  state = reactive({ name: '', saved: false });

  view() {
    return (
      <Stack gap="md">
        <TextBox label="&Name" x-model={() => this.state.name} required />
        <Button text="&Save" tone="accent" disabled={() => !this.state.name} onclick={() => (this.state.saved = true)} />
      </Stack>
    );
  }
}
```

Each component's page in `docs/` lists its props, properties, methods, events, keyboard, accessibility and design
tokens, with examples.
