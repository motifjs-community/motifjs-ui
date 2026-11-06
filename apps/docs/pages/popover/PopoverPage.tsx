import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Events from './examples/Events';
import Hover from './examples/Hover';
import Placements from './examples/Placements';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['target', '`Bind<Element | ComponentBase | null>`', '`null`', 'The element or component it opens next to.'],
    ['title', '`Bind<string>`', "`''`", 'A title in the header. This is the same property as `text`.'],
    ['label', '`Bind<string>`', "`''`", 'The accessible name when there is no title.'],
    ['content', '`Bind<ComponentBase | null>`', '`null`', 'Content set programmatically, shown after the JSX children.'],
    ['showOn', '`Bind<PopoverShowOn>`', "`'click'`", '`click` toggles it when the target is clicked, `hover` opens it on hover or keyboard focus, and `manual` leaves it to your code.'],
    ['placement', '`Bind<PopupPlacement>`', "`'bottom'`", 'The side and alignment. It opens on the opposite side if there is no room.'],
    ['arrow', '`Bind<boolean>`', '`true`', 'Shows an arrow toward the target, where the design language includes one.'],
    ['showClose', '`Bind<boolean>`', '`false`', 'Shows a close button in the header.'],
    ['width', '`Bind<string | number | null>`', '`null`', 'A custom width, as a CSS length or in pixels.'],
    ['closeOnOutside', '`Bind<boolean>`', '`true`', 'Closes the popover on a click outside it and its target.'],
    ['delay, hideDelay', '`Bind<number>`', '`300`, `200`', 'The time in milliseconds the pointer must rest on the target before it opens, and the time it stays after the pointer leaves both (`showOn: \'hover\'`).'],
    ['value', '`Bind<boolean>`', '`false`', 'Indicates whether it is open. `x-model` provides two-way binding.']
];

const MEMBERS = [
    ['onOpened', 'event', 'Occurs when it opens.'],
    ['onClosing', 'event', 'Occurs before it closes (`reason`). Set `cancel = true` to keep it open.'],
    ['onClosed', 'event', 'Occurs when it closes, with the reason: `escape`, `outside`, `focus`, `toggle`, `hover`, `close-button` or `code`.'],
    ['open(), close(reason?), toggle()', '`boolean` / `void`', 'Programmatic control. `open()` returns `false` if there is no target on the page or the popover is disabled.'],
    ['place()', '`void`', 'Repositions it relative to its target after its content changes size.'],
    ['isOpen', 'read-only', 'Indicates whether it is currently open.'],
    ['closeButton, body', 'read-only', 'The kit close button, and the part that holds the content.']
];

const BEHAVIOUR = [
    ['Opening', 'The popover opens on target click, on hover (`hover`), or programmatically. It appears in the browser\'s top layer next to the target and follows it as the page scrolls.'],
    ['Focus', 'When opened by a click or programmatically, focus moves to the first focusable element inside, or to the popover itself, and returns to the target when it closes. When opened by hover, focus stays where it is.'],
    ['Closing', 'It closes on Escape, a click outside it and its target, focus leaving both (Tab), the close button, another click on the target, or the pointer leaving both (`hover`). `onClosing` can keep it open.'],
    ['Placement', '`placement` sets the side and alignment, as in the kit\'s other popups. If there is no room on that side, it opens on the opposite side.'],
    ['Where it lives', 'When created programmatically, it is placed in the nearest container of its target that can hold it, so it stays in the target\'s window and landmark.']
];

const A11Y = [
    ['Role', '`dialog`, named by its title or by `label`. Always provide one of them.'],
    ['Target', '`aria-controls` and `aria-expanded`, plus `aria-haspopup="dialog"` when a click opens it.'],
    ['Keyboard', 'Tab moves through the content and out, which closes the popover. Escape closes it and returns focus. A `hover` popover also opens on keyboard focus.'],
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
    ['popover.close', 'Place: the appearance of the close button (`variant`).'],
    ['popover.offset, .enter-offset, .header-gap', 'The gap to the target, the distance it animates in from, and the space between the title and close button.']
];

export default function PopoverPage() {
    return (
        <>
            <p class="lead">
              <Rich text="Displays content next to a related element, such as a title, a close button, a form or a card. It opens on click or on hover, follows its target, and points to it with an arrow where the design language includes one." />
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
                    <Rich text="JSX children are the content, and `target` specifies the element or component it opens next to. Programmatically, `content` sets the content, and `open()`, `close()` and `toggle()` control it. `value` and `x-model` report whether it is open." />
                </p>
                <Example files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="hover" title="Opening on hover">
                <p>
                    <Rich text="`showOn: 'hover'` opens the popover after `delay` while the pointer rests on the target, and when the target has keyboard focus. The pointer can move onto the popover, which closes `hideDelay` after the pointer leaves both." />
                </p>
                <Example files={code('Hover.tsx')}>
                    <Hover />
                </Example>
            </Section>

            <Section anchor="placements" title="Placement, arrow and width">
                <Example stack files={code('Placements.tsx')}>
                    <Placements />
                </Example>
            </Section>

            <Section anchor="events" title="Keeping it open">
                <Example files={code('Events.tsx')}>
                    <Events />
                </Example>
            </Section>

            <Section anchor="behaviour" title="Behavior">
                <ApiTable head={['Topic', 'Details']} rows={BEHAVIOUR} />
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
