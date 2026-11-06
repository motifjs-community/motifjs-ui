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
  ['target', '`Bind<Element | ComponentBase | null>`', '—', 'What it describes. A function is fine for a component that comes later in the view (`() => this.save`).'],
  ['text', '`Bind<string>`', "`''`", 'What it says.'],
  ['content', '`Bind<ComponentBase | null>`', '—', 'Any content after the text, made the first time it shows. JSX children work too. Nothing interactive.'],
  ['placement', '`Bind<PopupPlacement>`', "`'top'`", '`top`, `bottom`, `start`, `end`, each with `-start` / `-end`. It opens on the other side when there is no room; start and end follow the reading direction.'],
  ['delay', '`Bind<number>`', '`500`', 'Milliseconds the pointer rests on the target before it shows. Keyboard focus shows it at once.'],
  ['hideDelay', '`Bind<number>`', '`150`', 'Milliseconds it stays after the pointer leaves, so the pointer can move onto it.'],
  ['showOn', '`Bind<TooltipShowOn>`', "`'hover-focus'`", '`hover-focus`, `focus` (keyboard focus only), `manual` (only `open()`).'],
  ['enabled', '`Bind<boolean>`', '`true`', '`false`: it never shows, and closes if it is open.'],
  ['onOpened, onClosed', '`() => void`', '—', 'See Events.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['opened', 'read/write, reactive', 'Whether it is shown; setting it opens or closes it.'],
  ['Tooltip.skipDelay', 'static, read/write', 'Milliseconds after a tooltip closes during which the next one shows at once (default `300`; `0` turns it off).'],
];

const METHODS = [
  ['open()', '`boolean`', 'Shows it now, whatever `showOn` says; `false` without a target on the page, or when disabled.'],
  ['close()', '`void`', 'Hides it.'],
  ['place()', '`void`', 'Lines it up with its target again, e.g. after the target moved.'],
  ['addTooltip(target, text | options)', '`() => void`', 'A tooltip for one element, made on first use; returns the function that removes it. For a component it goes with the component.'],
];

const EVENTS = [
  ['onOpened', 'It was shown.'],
  ['onClosed', 'It was hidden.'],
];

const KEYS = [
  ['Tab (focus on the target)', 'Shows it at once; leaving the target hides it.'],
  ['Escape', 'Hides it; focus stays where it is. Only the tooltip closes, not the window around it.'],
];

const A11Y = [
  ['Role', '`role="tooltip"`, one element per tooltip.'],
  ['Description', 'While it is shown the target (its focusable part, e.g. the input of a TextBox) has `aria-describedby` pointing to it, next to its own descriptions.'],
  ['Focus', 'It never takes focus and holds nothing interactive. For buttons or links next to an element, open a drop-down (Button `dropDown`).'],
  ['WCAG 1.4.13', 'Dismissible (Escape), hoverable (the pointer can move onto it) and persistent (it stays until the pointer or focus leaves).'],
  ['Pointer only?', 'Never: whatever it says must also be reachable without it. An icon-only button still needs its own name (`aria-label`).'],
  ['Touch', 'A touch does not show it; give touch users the information another way.'],
];

const HOOKS = [
  ['.mx-tooltip', 'The tooltip. `data-side` tells the side it opened on (`top`, `bottom`, `start`, `end`).'],
  ['.mx-tooltip__text', 'The text.'],
];

const TOKENS = [
  ['tooltip.offset, tooltip.enter-offset', 'The gap to its target, and how far it comes in from it.'],
  ['tooltip.surface', 'Unit: the tooltip with its box (`max-width`: the widest it gets before it wraps; `rich`: with content of its own).'],
  ['tooltip.arrow, tooltip.text', 'Units: an arrow towards the target a design may show, and the text.'],
  ['tooltip.text-align', 'How its text lines up.'],
];

export default function TooltipPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A short description shown next to an element: after the pointer rests on it, when it gets keyboard focus, or programmatically. It can be hovered, Escape hides it, and one is open at a time on the page." />
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
          <Rich text="In JSX a tooltip is placed anywhere and pointed at its `target`; where it sits does not matter. Programmatically, `new Tooltip({ target, text })` needs nothing else: it puts itself into the page when it first shows, and goes when its target component does." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="icon" title="Icon-only buttons">
        <p>
          <Rich text="A button with only an icon needs its own name (`aria-label`); the tooltip shows it to sighted users and adds the shortcut as a description. Moving from one button to the next shows the next tooltip at once." />
        </p>
        <Example files={code('IconButtons.tsx')}>
          <IconButtons />
        </Example>
      </Section>

      <Section anchor="field" title="On a field">
        <p>
          <Rich text="On a TextBox the whole field shows it on hover, and its input is described by it while it shows, also on keyboard focus." />
        </p>
        <Example files={code('OnField.tsx')}>
          <OnField />
        </Example>
      </Section>

      <Section anchor="placement" title="Placement">
        <p>
          <Rich text="`top` by default. It opens on the other side when there is no room, and `start` / `end` follow the reading direction (try the RTL switch at the top)." />
        </p>
        <Example files={code('Placement.tsx')} stack>
          <Placement />
        </Example>
      </Section>

      <Section anchor="delay" title="Delay">
        <p>
          <Rich text="The pointer rests `delay` milliseconds on the target before it shows (500 by default); `hideDelay` keeps it a moment after the pointer leaves. Right after one closed, the next shows at once (`Tooltip.skipDelay`)." />
        </p>
        <Example files={code('Delay.tsx')}>
          <Delay />
        </Example>
      </Section>

      <Section anchor="content" title="Rich content">
        <p>
          <Rich text="JSX children or `content` (any component) come after the text. Keep it short and never put buttons or links in it: a tooltip cannot take focus." />
        </p>
        <Example files={code('RichContent.tsx')}>
          <RichContent />
        </Example>
      </Section>

      <Section anchor="show-on" title="When it shows">
        <p>
          <Rich text="`showOn` picks what shows it: `hover-focus` (default), `focus` (keyboard focus only) or `manual` (only `open()` / `opened`). `enabled` turns a tooltip off." />
        </p>
        <Example files={code('ShowOn.tsx')}>
          <ShowOn />
        </Example>
      </Section>

      <Section anchor="many" title="Many elements">
        <p>
          <Rich text="`addTooltip(target, text)` gives an element a tooltip that is made only when it is first needed; every tooltip on the page shares one set of document listeners, so hundreds of them cost next to nothing. It returns the function that removes it." />
        </p>
        <Example files={code('ManyElements.tsx')} stack>
          <ManyElements />
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
