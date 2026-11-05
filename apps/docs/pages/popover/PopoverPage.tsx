import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Events from './examples/Events';
import Hover from './examples/Hover';
import Placements from './examples/Placements';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['target', '`Bind<Element | ComponentBase | null>`', '`null`', 'The element or component it opens next to.'],
    ['title', '`Bind<string>`', "`''`", 'A title in the header. The same property as `text`.'],
    ['label', '`Bind<string>`', "`''`", 'What screen readers call it when it has no title.'],
    ['content', '`Bind<ComponentBase | null>`', '`null`', 'Content programmatically, after the JSX children.'],
    ['showOn', '`Bind<PopoverShowOn>`', "`'click'`", '`click`: a press on the target toggles it; `hover`: the pointer resting on the target, or keyboard focus on it; `manual`: only code.'],
    ['placement', '`Bind<PopupPlacement>`', "`'bottom'`", 'The side and the alignment; it opens on the other side when there is no room.'],
    ['arrow', '`Bind<boolean>`', '`true`', 'An arrow towards the target, where the design language draws one.'],
    ['showClose', '`Bind<boolean>`', '`false`', 'A close button in the header.'],
    ['width', '`Bind<string | number | null>`', '`null`', 'A width of its own (a CSS length, or pixels).'],
    ['closeOnOutside', '`Bind<boolean>`', '`true`', 'A press outside it and its target closes it.'],
    ['delay, hideDelay', '`Bind<number>`', '`300`, `200`', 'Milliseconds the pointer rests on the target before it opens, and it stays after the pointer leaves both (`showOn: \'hover\'`).'],
    ['value', '`Bind<boolean>`', '`false`', 'Open or not; `x-model` binds it two-way.']
];

const MEMBERS = [
    ['onOpened', 'event', 'It opened.'],
    ['onClosing', 'event', 'About to close (`reason`); `cancel = true` keeps it open.'],
    ['onClosed', 'event', 'It closed, with the reason: `escape`, `outside`, `focus`, `toggle`, `hover`, `close-button`, `code`.'],
    ['open(), close(reason?), toggle()', '`boolean` / `void`', 'Programmatically; `open()` is `false` without a target on the page or when disabled.'],
    ['place()', '`void`', 'Lines it up with its target again, after its content changed size.'],
    ['isOpen', 'read-only', 'Whether it is open now.'],
    ['closeButton, body', 'read-only', 'The close button (the kit’s) and the part that holds the content.']
];

const BEHAVIOUR = [
    ['Opening', 'By a press on the target, by the pointer resting on it (`hover`), or programmatically. It appears in the browser’s top layer, next to the target, and follows it while the page scrolls.'],
    ['Focus', 'Opened by a press or programmatically, focus moves to the first focusable part inside, else to the popover; it goes back to the target when the popover closes. Opened by hover, focus stays where it is.'],
    ['Closing', 'Escape, a press outside it and its target, focus leaving both (Tab out), the close button, the target pressed again, or the pointer leaving both (`hover`). `onClosing` may keep it open.'],
    ['Placement', '`placement` names the side and the alignment, as for the kit’s popups; without room on that side it opens on the other.'],
    ['Where it lives', 'Made programmatically, it goes into the nearest container of its target that can hold it, so it stays in the target’s window and landmark.']
];

const A11Y = [
    ['Role', '`dialog`, named by its title, else by `label`: give it one.'],
    ['Target', '`aria-controls` and `aria-expanded`; `aria-haspopup="dialog"` when a press opens it.'],
    ['Keyboard', 'Tab moves through the content and out (which closes it); Escape closes and returns focus. A `hover` popover opens on keyboard focus too.'],
    ['Arrow', 'Decorative.']
];

const HOOKS = [
    ['.mx-popover', 'The popover. `data-side` (`top`, `bottom`, `start`, `end`), `data-arrow`.'],
    ['.mx-popover__arrow', 'The arrow.'],
    ['.mx-popover__header, .mx-popover__title, .mx-popover__close', 'The header, its title and the close button.'],
    ['.mx-popover__body', 'The content.']
];

const TOKENS = [
    ['popover.surface, .arrow, .header, .title, .body', 'Units: the surface (`focus`), the arrow (`display`, `size`, its fill and frame), the header, the title and the body.'],
    ['popover.close', 'Place: the close button’s look (`variant`).'],
    ['popover.offset, .enter-offset, .header-gap', 'The gap to the target, how far it comes in as it appears, the space between title and close button.']
];

export default function PopoverPage() {
    return (
        <>
            <p class="lead">
                Content next to the element it belongs to: a title, a close button, a form, a card. It opens on a press or while the
                pointer rests on its target, follows it, and points at it with an arrow where the design language has one.
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Popover } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Declarative and programmatic">
                <p>
                    <Rich text="The JSX children are the content; `target` names the element or component it opens next to. Programmatically, `content` gives the content and `open()`, `close()` and `toggle()` move it; `value` and `x-model` say whether it is open." />
                </p>
                <Example files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="hover" title="While the pointer rests">
                <p>
                    <Rich text="`showOn: 'hover'` opens it after `delay` while the pointer rests on the target, and when the target has keyboard focus; the pointer may move onto the popover. It closes `hideDelay` after the pointer leaves both." />
                </p>
                <Example files={code('Hover.tsx')}>
                    <Hover />
                </Example>
            </Section>

            <Section anchor="placements" title="Placements, the arrow and a width">
                <Example stack files={code('Placements.tsx')}>
                    <Placements />
                </Example>
            </Section>

            <Section anchor="events" title="Keeping it open">
                <Example files={code('Events.tsx')}>
                    <Events />
                </Example>
            </Section>

            <Section anchor="behaviour" title="Behaviour">
                <ApiTable head={['Topic', 'How']} rows={BEHAVIOUR} />
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
