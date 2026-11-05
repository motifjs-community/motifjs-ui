import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Corner from './examples/Corner';
import Inline from './examples/Inline';
import Single from './examples/Single';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['actions', '`Bind<readonly SpeedDialAction[]>`', '`[]`', 'The actions in the order they fan out: `text`, `glyph` (of the kit’s set) or `icon` (yours), `enabled`, `visible`, `click`, `key`, `data`. With one shown, the main button does it itself.'],
    ['glyph, openGlyph', '`Bind<string>`', "`'plus'`, `'dismiss'`", 'The main button’s glyph, and its glyph while the actions are open.'],
    ['text', '`Bind<string>`', 'the kit’s “Actions”', 'What screen readers call the main button, and its text when `extended`.'],
    ['extended', '`Bind<boolean>`', '`false`', 'The main button shows its `text` beside the glyph.'],
    ['direction', '`Bind<SpeedDialDirection>`', "`'up'`", '`up`, `down`, `start` or `end`: where the actions fan out.'],
    ['position', '`Bind<SpeedDialPosition>`', "`'bottom-end'`", 'A corner of the viewport it is fixed to (`bottom-end`, `bottom-start`, `top-end`, `top-start`), or `inline` in the flow.'],
    ['open', '`Bind<boolean>`', '`false`', 'The actions are open. `x-model` binds it two-way.'],
    ['closeOnAction', '`Bind<boolean>`', '`true`', 'A press on an action closes the fan.'],
    ['showLabels', '`Bind<boolean>`', '`true`', 'The actions’ labels are shown beside them while open.']
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
    ['Arrow keys', 'On the main button, the key along the fan opens it on the first action (the other way, on the last); on the actions they move, around the ends. Up and Down for a fan that stands, Left and Right for one that lies.'],
    ['Home, End', 'The first and the last action.'],
    ['Enter, Space', 'Press the main button or the focused action.'],
    ['Escape', 'Closes the actions and puts the focus back on the main button; so does a press outside, and Tab.']
];

const A11Y = [
    ['The main button', 'A button named by `text` (“Actions” in the kit language) with `aria-haspopup="menu"` and `aria-expanded`; with one action shown it is that action, named by it.'],
    ['The actions', 'A `menu` of `menuitem`s named by their labels; out of sight they are hidden from readers and keys (`inert`).'],
    ['Labels and glyphs', 'The labels are shown beside the actions while open and carry the names; the glyphs are decorative.']
];

const HOOKS = [
    ['.mx-speed-dial', 'The speed dial. `data-position`, `data-direction`, `data-open`, `data-labels`, `data-extended`, `data-single`.'],
    ['.mx-speed-dial__main, .mx-speed-dial__main-glyph, .mx-speed-dial__main-text', 'The main button, its glyph and its text.'],
    ['.mx-speed-dial__fan, .mx-speed-dial__action, .mx-speed-dial__action-icon, .mx-speed-dial__label', 'The fan, an action (`aria-disabled`), its glyph or icon, its label.']
];

const TOKENS = [
    ['speed-dial.main, .main-glyph, .main-text, .action, .action-icon, .label, .fan', 'Units: the main button (`hover`, `pressed`, `focus`, `open`, `extended`, `disabled`), its glyph (`open`) and text, an action (`hover`, `pressed`, `focus`, `disabled`), its glyph, the label, the fan.'],
    ['speed-dial.inset, .gap, .label-gap', 'From the viewport’s edges, between the buttons, between an action and its label.']
];

export default function SpeedDialPage() {
    return (
        <>
            <p class="lead">
                A round button in a corner of the page, or in the flow, that fans out its actions when pressed: each a round button with a
                glyph and a label beside it. With one action, the main button does it itself.
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { SpeedDial } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="A fan of actions">
                <p>
                    <Rich text="`actions` are the buttons that fan out in `direction`; each has a `glyph` of the kit’s set or an `icon` of your own, a `text` shown as its label, and a `click`. `open` and `x-model` say whether the fan is out. Here in the flow of the page (`position='inline'`)." />
                </p>
                <Example stack files={code('Inline.tsx')}>
                    <Inline />
                </Example>
            </Section>

            <Section anchor="corner" title="In a corner of the viewport">
                <p>
                    <Rich text="By default it is fixed to the bottom end corner of the viewport, `inset` away from the edges; `position` names another corner. Switch it on here to see it over the page." />
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
                <h3>Component tokens</h3>
                <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>Props</h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>Events, properties and methods</h3>
                <ApiTable head={['Member', 'Kind', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
