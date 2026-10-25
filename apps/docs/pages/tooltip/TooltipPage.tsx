import { reactive, type Component } from '@motifx/core';
import { addTooltip, Button, TextBox, Tooltip, type PopupPlacement } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

const BoldIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4.5 2.5h4.25a2.75 2.75 0 0 1 0 5.5H4.5zM4.5 8h5a2.75 2.75 0 0 1 0 5.5h-5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
  </svg>
);

const ItalicIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M7 2.5h5M4 13.5h5M9.5 2.5l-3 11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M6.5 9.5l3-3M7 4.5l1-1a2.83 2.83 0 0 1 4 4l-1 1M9 11.5l-1 1a2.83 2.83 0 0 1-4-4l1-1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  </svg>
);

const PLACEMENTS: PopupPlacement[] = ['top', 'bottom', 'start', 'end', 'top-start', 'bottom-end'];

const SEATS = ['1', '2', '3', '4', '5', '6'].flatMap((row) =>
  ['A', 'B', 'C', 'D'].map((letter) => ({
    id: `${row}${letter}`,
    note: `Row ${row}, seat ${letter}: ${letter === 'A' || letter === 'D' ? 'window' : 'aisle'}${row === '1' ? ', extra legroom' : ''}`,
  })),
);

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
  ['tooltip.max-width', 'The widest it gets before it wraps.'],
  ['tooltip.offset', 'The gap to its target.'],
  ['tooltip.padding-block, tooltip.padding-inline', 'Space inside.'],
  ['tooltip.font-size', 'Its text size.'],
  ['tooltip.background, tooltip.border-color, tooltip.border-width, tooltip.radius, tooltip.shadow', 'Its surface.'],
];

export default function TooltipPage() {
  const s = reactive({ email: '', placement: 'top' as PopupPlacement, on: true, delay: 500, made: 0 });
  let save: Button | null = null;
  let codeTarget: Button | null = null;
  let email: TextBox | null = null;
  let bold: Button | null = null;
  let italic: Button | null = null;
  let link: Button | null = null;
  let manualTarget: Button | null = null;
  let manual: Tooltip | null = null;
  let focusTarget: Button | null = null;
  let switchTarget: Button | null = null;
  let hintTarget: Button | null = null;
  let delayTargets: Button[] = [];

  let codeTip: Tooltip | null = null;
  const addFromCode = () => {
    if (!codeTarget) return;
    codeTip ??= new Tooltip({ target: codeTarget, placement: 'end' });
    codeTip.text = `Made from code, opened ${++s.made} time(s)`;
    codeTip.open();
  };

  const tipSeats = (map: Component<HTMLDivElement>) => {
    const removers = Array.from(map.element.querySelectorAll('button')).map((seat, i) => addTooltip(seat, SEATS[i].note));
    map.motif.setDisposable(() => removers.forEach((remove) => remove()));
  };

  return (
    <>
      <p class="lead">
        A short description shown next to an element: after the pointer rests on it, when it gets keyboard focus, or from
        code. It can be hovered, Escape hides it, and one is open at a time on the page.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Tooltip, addTooltip, type TooltipShowOn } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="In JSX a tooltip is placed anywhere and pointed at its `target`; where it sits does not matter. From code, `new Tooltip({ target, text })` needs nothing else: it puts itself into the page when it first shows, and goes when its target component does." />
        </p>
        <Example
          code={`
<Button ref={(b) => (this.save = b)} text="Save" />
<Tooltip target={() => this.save} text="Save the file (Ctrl+S)" />

const tip = new Tooltip({ target: this.saveButton, text: 'Save the file' });
tip.placement = 'end';
tip.open();
`}
        >
          <Button ref={(b: Button) => (save = b)} text="Save" tone="accent" />
          <Tooltip target={() => save} text="Save the file (Ctrl+S)" />
          <Button ref={(b: Button) => (codeTarget = b)} text="Target" variant="outline" />
          <Button text="Open a tooltip from code" variant="outline" onclick={addFromCode} />
        </Example>
      </Section>

      <Section anchor="icon" title="Icon-only buttons">
        <p>
          <Rich text="A button with only an icon needs its own name (`aria-label`); the tooltip shows it to sighted users and adds the shortcut as a description. Moving from one button to the next shows the next tooltip at once." />
        </p>
        <Example
          code={`
<Button ref={(b) => (this.bold = b)} icon={() => <BoldIcon />} variant="ghost" aria-label="Bold" />
<Tooltip target={() => this.bold} text="Bold (Ctrl+B)" />
`}
        >
          <div class="docs-flow" role="toolbar" aria-label="Text style">
            <Button ref={(b: Button) => (bold = b)} icon={() => <BoldIcon />} variant="ghost" aria-label="Bold" />
            <Button ref={(b: Button) => (italic = b)} icon={() => <ItalicIcon />} variant="ghost" aria-label="Italic" />
            <Button ref={(b: Button) => (link = b)} icon={() => <LinkIcon />} variant="ghost" aria-label="Link" />
            <Tooltip target={() => bold} text="Bold (Ctrl+B)" />
            <Tooltip target={() => italic} text="Italic (Ctrl+I)" />
            <Tooltip target={() => link} text="Insert a link (Ctrl+K)" />
          </div>
        </Example>
      </Section>

      <Section anchor="field" title="On a field">
        <p>
          <Rich text="On a TextBox the whole field shows it on hover, and its input is described by it while it shows, also on keyboard focus." />
        </p>
        <Example
          code={`
<TextBox ref={(b) => (this.email = b)} label="Email" type="email" />
<Tooltip target={() => this.email} text="We send the receipt here." placement="end" />
`}
        >
          <TextBox ref={(b: TextBox) => (email = b)} label="Email" type="email" x-model={() => s.email} />
          <Tooltip target={() => email} text="We send the receipt here." placement="end" />
        </Example>
      </Section>

      <Section anchor="placement" title="Placement">
        <p>
          <Rich text="`top` by default. It opens on the other side when there is no room, and `start` / `end` follow the reading direction (try the RTL switch at the top)." />
        </p>
        <Example
          code={`
<Tooltip target={() => this.button} text="Below" placement="bottom" />
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="Placement">
            {PLACEMENTS.map((placement) => (
              <Button
                key={placement}
                text={placement}
                size="sm"
                variant={() => (s.placement === placement ? 'solid' : 'ghost')}
                aria-pressed={() => s.placement === placement}
                onclick={() => (s.placement = placement)}
              />
            ))}
          </div>
          <div class="docs-flow">
            <Button ref={(b: Button) => (manualTarget = b)} text="Hover or focus me" variant="outline" />
            <Tooltip target={() => manualTarget} text={() => `Opens at ${s.placement}`} placement={() => s.placement} />
          </div>
        </Example>
      </Section>

      <Section anchor="delay" title="Delay">
        <p>
          <Rich text="The pointer rests `delay` milliseconds on the target before it shows (500 by default); `hideDelay` keeps it a moment after the pointer leaves. Right after one closed, the next shows at once (`Tooltip.skipDelay`)." />
        </p>
        <Example
          code={`
<Tooltip target={() => this.quick} text="At once" delay={0} />
<Tooltip target={() => this.slow} text="After 1.5 s" delay={1500} />
`}
        >
          {[0, 500, 1500].map((delay, i) => (
            <span key={delay}>
              <Button ref={(b: Button) => (delayTargets[i] = b)} text={`delay ${delay}`} variant="outline" />
              <Tooltip target={() => delayTargets[i]} text={`Shown after ${delay} ms`} delay={delay} />
            </span>
          ))}
        </Example>
      </Section>

      <Section anchor="content" title="Rich content">
        <p>
          <Rich text="JSX children or `content` (any component) come after the text. Keep it short and never put buttons or links in it: a tooltip cannot take focus." />
        </p>
        <Example
          code={`
<Tooltip target={() => this.bold}>
  <strong>Bold</strong> makes the selection stand out. <kbd>Ctrl</kbd>+<kbd>B</kbd>
</Tooltip>
`}
        >
          <Button ref={(b: Button) => (focusTarget = b)} text="Rich tooltip" variant="outline" />
          <Tooltip target={() => focusTarget}>
            <strong>Bold</strong> makes the selection stand out. <kbd>Ctrl</kbd>+<kbd>B</kbd>
          </Tooltip>
        </Example>
      </Section>

      <Section anchor="show-on" title="When it shows">
        <p>
          <Rich text="`showOn` picks what shows it: `hover-focus` (default), `focus` (keyboard focus only) or `manual` (only `open()` / `opened`). `enabled` turns a tooltip off." />
        </p>
        <Example
          code={`
<Tooltip target={() => this.help} text="Shown from code" showOn="manual" ref={(t) => (this.tip = t)} />
<Button text="Show" onclick={() => (this.tip.opened = !this.tip.opened)} />
<Tooltip target={() => this.save} text="Saves" enabled={() => this.settings.hints} />
`}
        >
          <Button ref={(b: Button) => (switchTarget = b)} text="Help" variant="outline" />
          <Tooltip ref={(t: Tooltip) => (manual = t)} target={() => switchTarget} text="Shown from code" showOn="manual" placement="bottom" />
          <Button text={() => (manual?.opened ? 'Hide it' : 'Show it')} onclick={() => manual && (manual.opened = !manual.opened)} />
          <Button text={() => (s.on ? 'Tooltips on' : 'Tooltips off')} toggle x-model={() => s.on} variant="ghost" />
          <Button ref={(b: Button) => (hintTarget = b)} text="Keyboard only" variant="outline" />
          <Tooltip target={() => hintTarget} text="Shown on keyboard focus, while the toggle is on" enabled={() => s.on} showOn="focus" />
        </Example>
      </Section>

      <Section anchor="many" title="Many elements">
        <p>
          <Rich text="`addTooltip(target, text)` gives an element a tooltip that is made only when it is first needed; every tooltip on the page shares one set of document listeners, so hundreds of them cost next to nothing. It returns the function that removes it." />
        </p>
        <Example
          code={`
for (const seat of this.seats) addTooltip(seat, seat.note);
const remove = addTooltip(this.help, { text: 'Opens the guide', placement: 'end' });
`}
        >
          <div class="docs-flow" role="group" aria-label="Seats" onBuilt={(c: Component<HTMLDivElement>) => tipSeats(c)}>
            {SEATS.map((seat) => (
              <Button key={seat.id} text={seat.id} size="sm" variant="outline" />
            ))}
          </div>
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
        <h3>Properties</h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>Events</h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
      </Section>
    </>
  );
}
