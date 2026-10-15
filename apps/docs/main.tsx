import { Application } from '@motifx/core';
import '@motifx-community/ui/styles.css';
import './shared/docs.css';
import { Chrome } from './shared/chrome';
import { Code } from './shared/doc';


function Page() {
  return (
    <div>
      <Chrome root="./" active="home" />
      <main class="docs-main">
        <h1>@motifx-community/ui</h1>
        <p class="lead">
          Components for MotifJS that work the way desktop UI does — created when needed, shown anywhere, closed and
          disposed like windows — drawn from the MotifJS design system's tokens.
        </p>

        <h2>Install</h2>
        <Code
          code={`
npm i @motifx/core @motifx-community/ui

import '@motifx-community/ui/styles.css';
import { Button, MxForm, type FormResult } from '@motifx-community/ui';
`}
        />

        <h2>How the components work</h2>
        <ul class="docs-list">
          <li>
            Every component is an object. Write it in JSX and bind it to state, or create it with <code>new</code> and
            add it wherever and whenever you need it — the developer using it decides, both ways are complete.
          </li>
          <li>
            Windows are shown, not declared: <code>new CustomerForm().showDialog(this)</code> opens a modal form and
            answers with a <code>FormResult</code>; nothing has to be in a template beforehand.
          </li>
          <li>
            Lifetime follows ownership: a form dies when it closes, or with the component it belongs to.
          </li>
          <li>Keyboard, focus, ARIA and localization are part of every component, not extras.</li>
        </ul>

        <h2>Components</h2>
        <table class="token-table api-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>What it is</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <a href="./control/index.html">
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
                <a href="./label/index.html">
                  <code>Label</code>
                </a>
              </td>
              <td>
                Text that names a control: its accessible name, and a click or <code>&amp;</code> access key moves focus
                there. The type ramp and tones, ellipsis and line limits.
              </td>
            </tr>
            <tr>
              <td>
                <a href="./panel/index.html">
                  <code>Panel</code>
                </a>
                ,{' '}
                <a href="./stack/index.html">
                  <code>Stack</code>
                </a>
                ,{' '}
                <a href="./grid/index.html">
                  <code>Grid</code>
                </a>
                ,{' '}
                <a href="./groupbox/index.html">
                  <code>GroupBox</code>
                </a>
                ,{' '}
                <a href="./splitcontainer/index.html">
                  <code>SplitContainer</code>
                </a>
              </td>
              <td>
                Layout: docking (top / bottom / start / end / fill / float), stacks, grids with sized rows and columns, titled frames
                and split panes. CSS does the layout; nothing runs on resize.
              </td>
            </tr>
            <tr>
              <td>
                <a href="./form/index.html">
                  <code>MxForm</code>
                </a>
              </td>
              <td>
                A form shown when needed: modeless window, modal dialog that answers with a result, state-bound
                window or an embedded part.
              </td>
            </tr>
            <tr>
              <td>
                <a href="./button/index.html">
                  <code>Button</code>
                </a>
              </td>
              <td>Standard, accent, outline and ghost buttons, all pressable.</td>
            </tr>
          </tbody>
        </table>

        <h2>Design system</h2>
        <p>
          The look comes from <code>@motifx-community/design-system</code>: its tokens, three themes, density, fonts
          and user-preference overrides. <code>styles.css</code> imports it first, then this kit's own layer
          (<code>mx.components</code>) adds the <a href="./tokens/index.html">component tokens</a> and the components.
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

        <h2>Localization</h2>
        <p>
          Texts the components write themselves (caption button labels, …) come from <code>UiLocale</code>; English and
          Turkish ship. See <a href="./form/index.html#i18n">MxForm → Localization</a>.
        </p>
      </main>
    </div>
  );
}


var app = Application.CreateBuilder().build()
app.useDevelopment(true)
app.run('#app', <Page />);
