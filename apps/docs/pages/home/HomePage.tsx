import { Code, Section } from '../../shared/doc';


export default function HomePage() {
  return (
    <>
      <p class="lead">
        Components for MotifJS that work the way desktop UI does — created when needed, shown anywhere, closed and
        disposed like windows — drawn from the MotifJS design system's tokens.
      </p>

      <Section anchor="install" title="Install">
        <Code
          code={`
npm i @motifx/core @motifx-community/ui

import { Button, Control, FocusContainer, addShortcut } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="how" title="How the components work">
        <ul class="docs-list">
          <li>
            Every component is an object. Write it in JSX and bind it to state, or create it with <code>new</code> and
            add it wherever and whenever you need it — the developer using it decides, both ways are complete.
          </li>
          <li>Lifetime follows ownership: a component dies with the one it belongs to.</li>
          <li>Keyboard, focus and ARIA are part of every component, not extras.</li>
        </ul>
      </Section>

      <Section anchor="today" title="What ships today">
        <p>
          The components are being written one at a time; Button is the first. Under them is the base they all build on:
          focus and the keyboard, and the shared parts a menu or a drop-down opens on.
        </p>
        <table class="token-table api-table">
          <thead>
            <tr>
              <th>Part</th>
              <th>What it is</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <a rel="router" href="/button">
                  <code>Button</code>
                </a>
              </td>
              <td>
                Solid, outline and ghost in three tones and sizes, pressable; icon, <code>&amp;</code> access key, toggle,
                busy; a menu or any content, from the whole button or with <code>split</code> from an arrow next to it.
              </td>
            </tr>
            <tr>
              <td>
                <code>Popup</code>, <code>MenuList</code>
              </td>
              <td>
                The shared parts: a surface above the page that follows its anchor and closes on Escape or a press outside,
                and a keyboard-driven list of commands.
              </td>
            </tr>
            <tr>
              <td>
                <a rel="router" href="/control">
                  <code>Control</code>
                </a>
              </td>
              <td>
                The base of every control: <code>text</code>, <code>enabled</code>, <code>visible</code>,{' '}
                <code>tabStop</code> and focus, the same from JSX and from code.
              </td>
            </tr>
            <tr>
              <td>
                <a rel="router" href="/keyboard">
                  <code>FocusContainer</code>, <code>addShortcut</code>
                </a>
              </td>
              <td>
                Tab order, the active control of a container, <code>&amp;</code> access keys, shortcuts, and focus that
                never falls to the page when a control goes away.
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section anchor="design" title="Design system">
        <p>
          The look comes from <code>@motifx-community/design-system</code>: its tokens, three themes, density, fonts
          and user-preference overrides. <code>styles.css</code> imports it first, then this kit's own layer
          (<code>mx.components</code>) adds the <a rel="router" href="/tokens">component tokens</a> and the components.
          Nothing here is a color or a size of its own.
        </p>
        <ul class="docs-list">
          <li>
            Themes: light, dark and high contrast, switched with <code>data-theme</code>; the OS preference is the
            default. Every text/background pair is checked in the design system's build: WCAG AA, AAA in high
            contrast.
          </li>
          <li>
            Density: <code>data-density="compact"</code> shrinks every control, bar and title bar.
          </li>
          <li>RTL through logical properties.</li>
        </ul>
        <Code
          code={`
<html data-theme="dark" data-density="compact">

/* your accent, after styles.css: a design-system override restyles every component */
:root {
  --mx-color-accent-solid: #8764b8;
  --mx-color-accent-solid-hover: #9373c0;
  --mx-color-accent-solid-pressed: #7e5aaf;
  --mx-color-accent-fg: #5c2e91;
}
`}
        />
      </Section>
    </>
  );
}
