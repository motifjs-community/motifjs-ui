import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Circle from './examples/Circle';
import Corner from './examples/Corner';
import Inline from './examples/Inline';
import QuarterCircle from './examples/QuarterCircle';
import SemiCircle from './examples/SemiCircle';
import Single from './examples/Single';
import Tooltips from './examples/Tooltips';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['actions', '`Bind<readonly SpeedDialAction[]>`', '`[]`', 'The actions, in order: `text`, `glyph` (from the kit\'s set) or `icon` (custom), `tooltip`, `enabled`, `visible`, `click`, `key` and `data`. If one action is visible, the main button performs it directly.'],
    ['glyph, openGlyph', '`Bind<string>`', "`'plus'`, `'dismiss'`", 'The glyph of the main button, and its glyph while the actions are open.'],
    ['text', '`Bind<string>`', 'The kit string “Actions”', 'The accessible name of the main button, and its text when `extended` is set.'],
    ['extended', '`Bind<boolean>`', '`false`', 'Shows `text` next to the glyph on the main button.'],
    ['layout', '`Bind<SpeedDialLayout>`', "`'linear'`", '`linear`, `circle`, `semi-circle` or `quarter-circle`: a line from the main button, or a circular layout around it.'],
    ['radius', '`Bind<number | null>`', 'Calculated', 'In circular layouts, the distance in pixels from the center of the main button to the center of each action. By default, it is just large enough to keep the actions apart. An `extended` button is wider than this calculation assumes, so set a value in that case.'],
    ['direction', '`Bind<SpeedDialDirection>`', 'Into the page', '`up`, `down`, `start`, `end` or a diagonal such as `up-start`. This is the direction the actions open in, and the middle of the arc in circular layouts. A linear layout uses the first part of a diagonal. By default, the actions open away from the edges named by `position`, or `up` when centered or inline.'],
    ['position', '`Bind<SpeedDialPosition>`', "`'bottom-end'`", 'A corner (`bottom-end`, `bottom-start`, `top-end`, `top-start`), the middle of an edge (`top`, `bottom`, `start`, `end`), `center`, or `inline` to stay in the page flow.'],
    ['relativeTo', '`Bind<SpeedDialRelativeTo>`', "`'viewport'`", 'The reference for `position`: `viewport`, or `parent` for the nearest positioned ancestor.'],
    ['open', '`Bind<boolean>`', '`false`', 'Indicates whether the actions are open. `x-model` provides two-way binding.'],
    ['closeOnAction', '`Bind<boolean>`', '`true`', 'Closes the actions when one is selected.'],
    ['showLabels', '`Bind<boolean>`', 'On for linear, off for circular', 'Shows labels next to the actions while they are open.'],
    ['tooltip', '`Bind<boolean | SpeedDialTooltip>`', 'On when labels are off', 'Shows tooltips on the actions, using their `text`. Options are passed to each `Tooltip` (`placement`, `delay`, `hideDelay`, `showOn`, `content`…). By default, they open on the outer side after 200 ms. An action\'s own `tooltip` takes precedence and can be text, options, or `false` to disable it.']
];

const MEMBERS = [
    ['onOpened, onClosed', 'event', 'Occurs when the actions open or close (`byUser`).'],
    ['onActionClick', 'event', 'Occurs when an action is selected (`index`, `action`). The action\'s own `click` runs first.'],
    ['isOpen', 'read-only', 'Indicates whether the actions are open.'],
    ['single', 'read-only', 'The single visible action, or `null` if there is more than one.'],
    ['main', 'read-only', 'The main button.'],
    ['show(), close(), toggle()', '`void`', 'Opens or closes the actions.'],
    ['refresh()', '`void`', 'Re-reads the actions after they have been changed in place.']
];

const KEYS = [
    ['Tab', 'The main button is the only Tab stop. Use the arrow keys to reach the actions.'],
    ['Arrow keys', 'On the main button, the arrow key that points along the actions opens them on the first action, and the opposite key opens them on the last. On the actions, the arrow keys move between them and wrap at the ends. A vertical line uses Up and Down, and a horizontal line uses Left and Right. In circular layouts both pairs work, with Down and Right moving forward around the circle.'],
    ['Home, End', 'Moves to the first or last action.'],
    ['Enter, Space', 'Presses the main button or the focused action.'],
    ['Escape', 'Closes the actions and returns focus to the main button. Clicking outside and pressing Tab also close them. If a tooltip is visible, the first Escape dismisses the tooltip.']
];

const A11Y = [
    ['The main button', 'A button named by `text` (“Actions” in the kit language), with `aria-haspopup="menu"` and `aria-expanded`. With one action, it represents that action and takes its name.'],
    ['The actions', 'A `menu` of `menuitem` elements named by their labels. When closed, they are hidden from assistive technology and from the keyboard (`inert`).'],
    ['Labels and glyphs', 'Labels appear next to the actions while they are open, and each action carries its accessible name in either case. Glyphs are decorative.'],
    ['Tooltips', 'The kit\'s `Tooltip`. It also appears on keyboard focus, closes with Escape and is exposed through `aria-describedby`. Tooltips do not appear on touch, so keep the labels on if a glyph alone is not clear on a touch screen.']
];

const HOOKS = [
    ['.mx-speed-dial', 'The speed dial. `data-layout`, `data-position`, `data-relative`, `data-direction`, `data-open`, `data-labels`, `data-extended`, `data-single`.'],
    ['.mx-speed-dial__main, .mx-speed-dial__main-glyph, .mx-speed-dial__main-text', 'The main button, its glyph and its text.'],
    ['.mx-speed-dial__fan, .mx-speed-dial__action, .mx-speed-dial__action-icon, .mx-speed-dial__label', 'The action container, an action (`aria-disabled`, `data-side`: where its label and tooltip appear), its glyph or icon, and its label.']
];

const TOKENS = [
    ['speed-dial.main, .main-glyph, .main-text, .action, .action-icon, .label, .fan', 'Units: the main button (`hover`, `pressed`, `focus`, `open`, `extended`, `disabled`), its glyph (`open`) and text, an action (`hover`, `pressed`, `focus`, `disabled`), its glyph, the label and the action container.'],
    ['speed-dial.inset, .gap, .label-gap', 'Distance from the edges, gap between buttons (the radius preserves this gap in circular layouts), and gap between an action and its label.']
];

export default function SpeedDialPage() {
    return (
        <>
            <p class="lead">
              <Rich text="A floating action button that opens a set of related actions. Place it in a corner, on an edge or inline. Actions appear in a line with labels, or on a full, half or quarter circle around the button with tooltips. If there is only one action, the main button performs it directly." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { SpeedDial } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Linear layout">
                <p>
                    <Rich text="`actions` defines the buttons, which open in the given `direction`. Each action has a `glyph` from the kit's icon set or a custom `icon`, a `text` shown as its label, and a `click` handler. `open` and `x-model` control whether the actions are visible. This example uses `position='inline'` to keep the button in the page flow." />
                </p>
                <Example stack files={code('Inline.tsx')}>
                    <Inline />
                </Example>
            </Section>

            <Section anchor="circle" title="Circle layout">
                <p>
                    <Rich text="`layout='circle'` places the actions evenly around the main button, starting from `direction`. They animate out from under the button and return there when closed. `radius` sets the distance. By default, it is calculated to keep the actions `gap` apart and clear of the button. Labels are off in circular layouts because they would overlap, so the actions show tooltips instead. You can change this with `showLabels` and `tooltip`. In this example, `relativeTo='parent'` centers the button in its box by measuring `position` against the nearest positioned ancestor." />
                </p>
                <Example stack files={code('Circle.tsx')}>
                    <Circle />
                </Example>
            </Section>

            <Section anchor="semi-circle" title="Semi-circle layout">
                <p>
                    <Rich text="`layout='semi-circle'` places the actions on a half circle centered on `direction`, which works well in the middle of an edge. `position` accepts `top`, `bottom`, `start` and `end`, and `direction` defaults to pointing into the page." />
                </p>
                <Example stack files={code('SemiCircle.tsx')}>
                    <SemiCircle />
                </Example>
            </Section>

            <Section anchor="quarter-circle" title="Quarter-circle layout">
                <p>
                    <Rich text="`layout='quarter-circle'` places the actions on a quarter circle, which works well in a corner. `direction` is again derived from `position`. If you set it yourself, use a diagonal value such as `up-start`." />
                </p>
                <Example stack files={code('QuarterCircle.tsx')}>
                    <QuarterCircle />
                </Example>
            </Section>

            <Section anchor="tooltips" title="Tooltips">
                <p>
                    <Rich text="Use `tooltip` on the speed dial to turn tooltips on or off for all actions and to pass options to each one. `tooltip` on an action takes precedence and accepts text, options or `false`. Each tooltip is a kit `Tooltip` that opens on the outer side of the action unless `placement` specifies otherwise. With one action, the main button shows its tooltip." />
                </p>
                <Example stack files={code('Tooltips.tsx')}>
                    <Tooltips />
                </Example>
            </Section>

            <Section anchor="corner" title="Fixed to the viewport">
                <p>
                    <Rich text="By default, the button is fixed to the bottom end corner of the viewport, `inset` from the edges. Use `position` to choose another location. Turn it on here to see it over the page." />
                </p>
                <Example stack files={code('Corner.tsx')}>
                    <Corner />
                </Example>
            </Section>

            <Section anchor="single" title="Single action">
                <p>
                    <Rich text="When exactly one action is visible, there is nothing to expand. The main button takes the action's glyph and name, and runs the action directly. `extended` shows the name next to the glyph." />
                </p>
                <Example stack files={code('Single.tsx')}>
                    <Single />
                </Example>
            </Section>

            <Section anchor="keyboard" title="Keyboard">
                <ApiTable head={['Key', 'Description']} rows={KEYS} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
                <h3>
                  <Rich text="Component tokens" />
                </h3>
                <ApiTable head={['Token', 'Description']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                  <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
