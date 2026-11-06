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
    ['actions', '`Bind<readonly SpeedDialAction[]>`', '`[]`', 'The actions in order: `text`, `glyph` (of the kit’s set) or `icon` (yours), `tooltip`, `enabled`, `visible`, `click`, `key`, `data`. With one shown, the main button does it itself.'],
    ['glyph, openGlyph', '`Bind<string>`', "`'plus'`, `'dismiss'`", 'The main button’s glyph, and its glyph while the actions are open.'],
    ['text', '`Bind<string>`', 'the kit’s “Actions”', 'What screen readers call the main button, and its text when `extended`.'],
    ['extended', '`Bind<boolean>`', '`false`', 'The main button shows its `text` beside the glyph.'],
    ['layout', '`Bind<SpeedDialLayout>`', "`'linear'`", '`linear`, `circle`, `semi-circle` or `quarter-circle`: in a line from the main button, or around it.'],
    ['radius', '`Bind<number | null>`', 'by itself', 'Around the button: pixels from its centre to the actions’ centres. By itself it is just enough to keep them apart. An `extended` main button is wider than this reckons with, so give it one.'],
    ['direction', '`Bind<SpeedDialDirection>`', 'into the page', '`up`, `down`, `start`, `end` or a diagonal such as `up-start`: where the actions go, the middle of the arc around the button. A line takes the first word of a diagonal. By itself it is away from the edges `position` names, and `up` in the centre and inline.'],
    ['position', '`Bind<SpeedDialPosition>`', "`'bottom-end'`", 'A corner (`bottom-end`, `bottom-start`, `top-end`, `top-start`), the middle of an edge (`top`, `bottom`, `start`, `end`), `center`, or `inline` in the flow.'],
    ['relativeTo', '`Bind<SpeedDialRelativeTo>`', "`'viewport'`", 'What `position` is measured in: `viewport`, or `parent`, the nearest positioned parent.'],
    ['open', '`Bind<boolean>`', '`false`', 'The actions are open. `x-model` binds it two-way.'],
    ['closeOnAction', '`Bind<boolean>`', '`true`', 'A press on an action closes the fan.'],
    ['showLabels', '`Bind<boolean>`', 'in a line yes, around no', 'The actions’ labels are shown beside them while open.'],
    ['tooltip', '`Bind<boolean | SpeedDialTooltip>`', 'while the labels are off', 'Tooltips on the actions, with their `text`. Options go to each `Tooltip` (`placement`, `delay`, `hideDelay`, `showOn`, `content`…). By default they open on the outer side after 200 ms. An action’s own `tooltip` wins: a text, options, or `false` for none.']
];

const MEMBERS = [
    ['onOpened, onClosed', 'event', 'The actions opened or closed (`byUser`).'],
    ['onActionClick', 'event', 'An action was pressed (`index`, `action`); its own `click` runs first.'],
    ['isOpen', 'read-only', 'The actions are open.'],
    ['single', 'read-only', 'The one action shown, when there is exactly one; `null` otherwise.'],
    ['mainElement', 'read-only', 'The main button.'],
    ['show(), close(), toggle()', '`void`', 'Opens or closes the actions.'],
    ['refresh()', '`void`', 'Reads the actions again after they were changed in place.']
];

const KEYS = [
    ['Tab', 'The main button is the one stop; the actions are reached with the arrow keys.'],
    ['Arrow keys', 'On the main button, the key along the actions opens them on the first (the other way, on the last); on the actions they move, around the ends. Up and Down for a line that stands, Left and Right for one that lies; around the button either pair, Down and Right forward along the circle.'],
    ['Home, End', 'The first and the last action.'],
    ['Enter, Space', 'Press the main button or the focused action.'],
    ['Escape', 'Closes the actions and puts the focus back on the main button; so does a press outside, and Tab. While a tooltip is shown, the first Escape hides the tooltip.']
];

const A11Y = [
    ['The main button', 'A button named by `text` (“Actions” in the kit language) with `aria-haspopup="menu"` and `aria-expanded`; with one action shown it is that action, named by it.'],
    ['The actions', 'A `menu` of `menuitem`s named by their labels; out of sight they are hidden from readers and keys (`inert`).'],
    ['Labels and glyphs', 'The labels are shown beside the actions while open; the name is on the action either way. The glyphs are decorative.'],
    ['Tooltips', 'The kit’s `Tooltip`: on keyboard focus too, dismissed with Escape, described with `aria-describedby`. A touch does not show one, so where the glyph alone does not say it on a touch screen, keep the labels on.']
];

const HOOKS = [
    ['.mx-speed-dial', 'The speed dial. `data-layout`, `data-position`, `data-relative`, `data-direction`, `data-open`, `data-labels`, `data-extended`, `data-single`.'],
    ['.mx-speed-dial__main, .mx-speed-dial__main-glyph, .mx-speed-dial__main-text', 'The main button, its glyph and its text.'],
    ['.mx-speed-dial__fan, .mx-speed-dial__action, .mx-speed-dial__action-icon, .mx-speed-dial__label', 'The fan, an action (`aria-disabled`, `data-side`: where its label and tooltip go), its glyph or icon, its label.']
];

const TOKENS = [
    ['speed-dial.main, .main-glyph, .main-text, .action, .action-icon, .label, .fan', 'Units: the main button (`hover`, `pressed`, `focus`, `open`, `extended`, `disabled`), its glyph (`open`) and text, an action (`hover`, `pressed`, `focus`, `disabled`), its glyph, the label, the fan.'],
    ['speed-dial.inset, .gap, .label-gap', 'From the edges, between the buttons (around the button too: the radius keeps this gap), between an action and its label.']
];

export default function SpeedDialPage() {
    return (
        <>
            <p class="lead">
              <Rich text="A round button in a corner of the page, on an edge or in the flow, that opens its actions when pressed: round buttons in a line with a label beside each, or on a circle, a half or a quarter of one around it with a tooltip each. With one action, the main button does it itself." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { SpeedDial } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="In a line">
                <p>
                    <Rich text="`actions` are the buttons that go out in `direction`; each has a `glyph` of the kit’s set or an `icon` of your own, a `text` shown as its label, and a `click`. `open` and `x-model` say whether the fan is out. Here in the flow of the page (`position='inline'`)." />
                </p>
                <Example stack files={code('Inline.tsx')}>
                    <Inline />
                </Example>
            </Section>

            <Section anchor="circle" title="On a circle">
                <p>
                    <Rich text="`layout='circle'` lays the actions evenly around the main button, the first in `direction`. They come out from under the button and go back there. `radius` sets how far out; by itself it is just enough to keep the actions `gap` apart and clear of the button. Around the button the labels are off and the actions have tooltips, because labels would run into each other; `showLabels` and `tooltip` say otherwise. Here it is in the centre of its box: `relativeTo='parent'` measures `position` in the nearest positioned parent." />
                </p>
                <Example stack files={code('Circle.tsx')}>
                    <Circle />
                </Example>
            </Section>

            <Section anchor="semi-circle" title="On a half circle">
                <p>
                    <Rich text="`layout='semi-circle'` lays them on half a circle with `direction` in its middle, which suits the middle of an edge: `position` takes `top`, `bottom`, `start` and `end`, and `direction` follows from it, into the page." />
                </p>
                <Example stack files={code('SemiCircle.tsx')}>
                    <SemiCircle />
                </Example>
            </Section>

            <Section anchor="quarter-circle" title="On a quarter circle">
                <p>
                    <Rich text="`layout='quarter-circle'` lays them on a quarter of a circle, which suits a corner: `direction` follows from `position` again, and is a diagonal such as `up-start` when you set it." />
                </p>
                <Example stack files={code('QuarterCircle.tsx')}>
                    <QuarterCircle />
                </Example>
            </Section>

            <Section anchor="tooltips" title="Tooltips">
                <p>
                    <Rich text="`tooltip` on the speed dial turns tooltips on or off for all its actions and passes options to each; `tooltip` on an action wins, with a text of its own, options, or `false`. Each is the kit’s `Tooltip`, on the outer side of the action unless `placement` says another. With one action, the main button carries its tooltip." />
                </p>
                <Example stack files={code('Tooltips.tsx')}>
                    <Tooltips />
                </Example>
            </Section>

            <Section anchor="corner" title="In a corner of the viewport">
                <p>
                    <Rich text="By default it is fixed to the bottom end corner of the viewport, `inset` away from the edges; `position` names another place. Switch it on here to see it over the page." />
                </p>
                <Example stack files={code('Corner.tsx')}>
                    <Corner />
                </Example>
            </Section>

            <Section anchor="single" title="One action">
                <p>
                    <Rich text="With exactly one action shown, there is nothing to fan out: the main button takes the action’s glyph and name and does it itself. `extended` shows the name beside the glyph." />
                </p>
                <Example stack files={code('Single.tsx')}>
                    <Single />
                </Example>
            </Section>

            <Section anchor="keyboard" title="Keyboard">
                <ApiTable head={['Key', 'What it does']} rows={KEYS} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'How']} rows={A11Y} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
                <h3>
                  <Rich text="Component tokens" />
                </h3>
                <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                  <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Kind', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
