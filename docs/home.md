# @motifx-community/ui

> Get started · @motifx-community/ui 0.1.0-beta.2

Components for MotifJS that work the way desktop UI does — created when needed, shown anywhere, closed and disposed like windows — drawn from the MotifJS design system's tokens.

## Install

```tsx
npm i @motifx/core @motifx-community/ui

import { Button, Control, FocusContainer, addShortcut } from '@motifx-community/ui';
```

## How the components work

- Every component is an object. Write it in JSX and bind it to state, or create it with `new` and add it wherever and whenever you need it — the developer using it decides, both ways are complete.

- Lifetime follows ownership: a component dies with the one it belongs to.

- Keyboard, focus and ARIA are part of every component, not extras.

## What ships today

The components are being written one at a time; Button is the first. Under them is the base they all build on: focus and the keyboard, and the shared parts a menu or a drop-down opens on.

| Part | What it is |
| --- | --- |
| [`Button`](button.md) | Solid, outline and ghost in three tones and sizes, pressable; icon, `&` access key, toggle, busy; a menu or any content, from the whole button or with `split` from an arrow next to it. |
| `Popup`, `MenuList` | The shared parts: a surface above the page that follows its anchor and closes on Escape or a press outside, and a keyboard-driven list of commands. |
| [`Control`](control.md) | The base of every control: `text`, `enabled`, `visible`, `tabStop` and focus, the same from JSX and from code. |
| [`FocusContainer`, `addShortcut`](keyboard.md) | Tab order, the active control of a container, `&` access keys, shortcuts, and focus that never falls to the page when a control goes away. |

## Design system

The look comes from `@motifx-community/design-system`: its tokens, three themes, density, fonts and user-preference overrides. `styles.css` imports it first, then this kit's own layer (`mx.components`) adds the [component tokens](tokens.md) and the components. Nothing here is a color or a size of its own.

- Themes: light, dark and high contrast, switched with `data-theme`; the OS preference is the default. Every text/background pair is checked in the design system's build: WCAG AA, AAA in high contrast.

- Density: `data-density="compact"` shrinks every control, bar and title bar.

- RTL through logical properties.

```tsx
<html data-theme="dark" data-density="compact">

/* your accent, after styles.css: a design-system override restyles every component */
:root {
  --mx-color-accent-solid: #8764b8;
  --mx-color-accent-solid-hover: #9373c0;
  --mx-color-accent-solid-pressed: #7e5aaf;
  --mx-color-accent-fg: #5c2e91;
}
```
