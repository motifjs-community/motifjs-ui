import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Delay from './examples/Delay';
import Programmatic from './examples/Programmatic';
import IconButtons from './examples/IconButtons';
import ManyElements from './examples/ManyElements';
import OnField from './examples/OnField';
import Placement from './examples/Placement';
import RichContent from './examples/RichContent';
import ShowOn from './examples/ShowOn';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['target', '`Bind<ComponentBase | null>`', '—', 'The component it describes. A function works for a component that appears later in the view (`() => this.save`).'],
  ['text', '`Bind<string>`', "`''`", 'The tooltip text.'],
  ['content', '`Bind<ComponentBase | null>`', '—', 'Any content after the text, created the first time the tooltip appears. JSX children work too. Do not include interactive content.'],
  ['placement', '`Bind<PopupPlacement>`', "`'top'`", '`top`, `bottom`, `start` or `end`, each with `-start` or `-end`. It opens on the opposite side if there is no room, and start and end follow the reading direction.'],
  ['delay', '`Bind<number>`', '`500`', 'The time in milliseconds the pointer must rest on the target before the tooltip appears. Keyboard focus shows it immediately.'],
  ['hideDelay', '`Bind<number>`', '`150`', 'The time in milliseconds it stays after the pointer leaves, so the pointer can move onto it.'],
  ['showOn', '`Bind<TooltipShowOn>`', "`'hover-focus'`", '`hover-focus`, `focus` (keyboard focus only) or `manual` (only `open()`).'],
  ['enabled', '`Bind<boolean>`', '`true`', '`false` keeps the tooltip from appearing and closes it if it is open.'],
  ['onOpened, onClosed', '`() => void`', '—', 'See Events.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['opened', 'read/write, reactive', 'Indicates whether it is visible. Set it to open or close the tooltip.'],
  ['Tooltip.skipDelay', 'static, read/write', 'The time in milliseconds after a tooltip closes during which the next one appears immediately. The default is `300`, and `0` turns it off.'],
];

const METHODS = [
  ['open()', '`boolean`', 'Shows the tooltip now, regardless of `showOn`. Returns `false` if there is no target on the page or the tooltip is disabled.'],
  ['close()', '`void`', 'Hides the tooltip.'],
  ['place()', '`void`', 'Repositions it relative to its target, for example after the target moves.'],
  ['addTooltip(target, text | options)', '`() => void`', 'Adds a tooltip to one element, created on first use, and returns a function that removes it. For a component, it is removed along with the component.'],
];

const EVENTS = [
  ['onOpened', 'Occurs after it is shown.'],
  ['onClosed', 'Occurs after it is hidden.'],
];

const KEYS = [
  ['Tab (focus on the target)', 'Shows the tooltip immediately. Leaving the target hides it.'],
  ['Escape', 'Hides the tooltip while focus stays in place. Only the tooltip closes, not the surrounding window.'],
];

const A11Y = [
  ['Role', '`role="tooltip"`, with one element per tooltip.'],
  ['Description', 'While it is visible, the target or its focusable part, such as the input of a TextBox, has `aria-describedby` pointing to the tooltip, along with its own descriptions.'],
  ['Focus', 'A tooltip never receives focus and contains nothing interactive. For buttons or links next to an element, open a drop-down (Button `dropDown`).'],
  ['WCAG 1.4.13', 'Dismissible (Escape), hoverable (the pointer can move onto it) and persistent (it stays until the pointer or focus leaves).'],
  ['Pointer only?', 'Tooltip content must also be available another way. An icon-only button still needs its own name (`aria-label`).'],
  ['Touch', 'Touch does not show a tooltip, so provide the information another way for touch users.'],
];

const HOOKS = [
  ['.mx-tooltip', 'The tooltip. `data-side` reports the side it opened on (`top`, `bottom`, `start`, `end`).'],
  ['.mx-tooltip__text', 'The text.'],
];

const TOKENS = [
  ['tooltip.offset, tooltip.enter-offset', 'The gap to the target, and the distance it animates in from.'],
  ['tooltip.surface', 'Unit: the tooltip and its box (`max-width` sets the width before wrapping, and `rich` applies with custom content).'],
  ['tooltip.arrow, tooltip.text', 'Units: an optional arrow toward the target, and the text.'],
  ['tooltip.text-align', 'The text alignment.'],
];

export default function TooltipPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A short description shown next to an element when the pointer rests on it, when it receives keyboard focus, or programmatically. Users can hover over the tooltip, Escape dismisses it, and only one is open at a time on the page." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Tooltip, addTooltip, type TooltipShowOn } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="In JSX, place a tooltip anywhere and point it at its `target`. Its position in the markup does not matter. Programmatically, `new Tooltip({ target, text })` is all you need: it adds itself to the page the first time it appears and is removed along with its target component." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="icon" title="Icon-only buttons">
        <p>
          <Rich text="A button with only an icon needs its own accessible name (`aria-label`). The tooltip displays that information and adds the shortcut as a description. Moving from one button to the next shows the next tooltip immediately." />
        </p>
        <Example files={code('IconButtons.tsx')}>
          <IconButtons />
        </Example>
      </Section>

      <Section anchor="field" title="Tooltips on fields">
        <p>
          <Rich text="On a TextBox, the whole field shows the tooltip on hover, and the input is described by it while it is visible, including on keyboard focus." />
        </p>
        <Example files={code('OnField.tsx')}>
          <OnField />
        </Example>
      </Section>

      <Section anchor="placement" title="Placement">
        <p>
          <Rich text="The default is `top`. The tooltip opens on the opposite side if there is no room, and `start` and `end` follow the reading direction. Try the RTL switch at the top of the page." />
        </p>
        <Example files={code('Placement.tsx')} stack>
          <Placement />
        </Example>
      </Section>

      <Section anchor="delay" title="Delay">
        <p>
          <Rich text="The pointer must rest on the target for `delay` milliseconds (500 by default) before the tooltip appears, and `hideDelay` keeps it open briefly after the pointer leaves. Immediately after one closes, the next appears without a delay (`Tooltip.skipDelay`)." />
        </p>
        <Example files={code('Delay.tsx')}>
          <Delay />
        </Example>
      </Section>

      <Section anchor="content" title="Rich content">
        <p>
          <Rich text="JSX children or `content` (any component) appear after the text. Keep it short and never include buttons or links, because a tooltip cannot receive focus." />
        </p>
        <Example files={code('RichContent.tsx')}>
          <RichContent />
        </Example>
      </Section>

      <Section anchor="show-on" title="Display triggers">
        <p>
          <Rich text="`showOn` sets what displays the tooltip: `hover-focus` (the default), `focus` (keyboard focus only) or `manual` (only `open()` and `opened`). `enabled` turns a tooltip off." />
        </p>
        <Example files={code('ShowOn.tsx')}>
          <ShowOn />
        </Example>
      </Section>

      <Section anchor="many" title="Tooltips on many elements">
        <p>
          <Rich text="`addTooltip(target, text)` gives a component a tooltip that is created only when first needed. All tooltips on the page share one set of document listeners, so hundreds of them have almost no cost. The function returns a remover." />
        </p>
        <Example files={code('ManyElements.tsx')} stack>
          <ManyElements />
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
          <Rich text="Properties" />
        </h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>
          <Rich text="Events" />
        </h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
      </Section>
    </>
  );
}
