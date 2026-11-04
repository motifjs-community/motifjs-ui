# Accordion

> Navigation · @motifx-community/ui 0.1.0-beta.1

An accordion opens and closes sections under their headers: one at a time or several, kept open, with icons, three looks and sections built when they are first opened.

## Import

```tsx
import { Accordion, AccordionItem } from '@motifx-community/ui';
```

## From JSX and from code

An `<AccordionItem>`'s children are its section. `value` lists the open items' keys and `x-model` binds it two-way. Created with `new`, items are added and removed from code.

```tsx
import { reactive } from '@motifx/core';
import { Accordion, AccordionItem, Button, Stack, TextBox } from '@motifx-community/ui';

const TruckIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M1.5 4.5h8v6h-8zM9.5 6.5h3l2 2v2h-5M4 12.5a1 1 0 1 0 0-.01M12 12.5a1 1 0 1 0 0-.01" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
  </svg>
);

const FAQ = [
  { q: 'Can I pay later?', a: 'Yes, within 30 days of the invoice.' },
  { q: 'Do you ship abroad?', a: 'To most countries in Europe.' },
  { q: 'How do I return an item?', a: 'Send it back within 14 days with the slip in the box.' },
];

/** An accordion from JSX bound with x-model, and one created with `new` that gets items from code. */
export default function FromCode() {
  const s = reactive({ open: ['shipping'] as (string | number)[], address: '', log: '' });
  let added = 0;

  const faq = new Accordion({ variant: 'separated', multiple: true });
  for (const entry of FAQ) faq.add(new AccordionItem({ title: entry.q, content: () => <p>{entry.a}</p> }));
  faq.onExpanded((e) => (s.log = `Opened “${e.item.title}”${e.byUser ? ' by the user' : ' from code'}.`));

  const addQuestion = () => {
    const n = ++added;
    const item = faq.add(new AccordionItem({ title: `Question ${n}`, content: () => <p>Answer {n}.</p> }));
    item.expanded = true;
  };

  return (
    <>
      <Accordion class="acc-ways" x-model={() => s.open}>
        <AccordionItem key="shipping" title="&Shipping" icon={() => <TruckIcon />}>
          <TextBox label="Address" x-model={() => s.address} />
        </AccordionItem>
        <AccordionItem key="payment" title="&Payment">
          <p>Card or bank transfer.</p>
        </AccordionItem>
        <AccordionItem key="review" title="&Review">
          <p>{() => `Ship to: ${s.address || '—'}`}</p>
        </AccordionItem>
      </Accordion>
      <output class="acc-value">{() => `value: [${s.open.map((k) => JSON.stringify(k)).join(', ')}]`}</output>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a question from code" variant="outline" onclick={addQuestion} />
        <output class="acc-log">{() => s.log}</output>
      </Stack>
      <Stack style="inline-size: 100%" onBuilt={(c) => c.controls.add(faq)} />
    </>
  );
}
```

## One or several open

One item is open at a time; with `multiple` several can be. `collapsible={false}` keeps one open: its header cannot close it.

```tsx
import { reactive } from '@motifx/core';
import { Accordion, AccordionItem, Button, Stack } from '@motifx-community/ui';

/** One item open at a time or several, kept open or not, with a disabled item. */
export default function OneOrSeveral() {
  const s = reactive({ multiple: false, collapsible: true });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Multiple" size="sm" variant="outline" toggle x-model={() => s.multiple} />
        <Button text="Collapsible" size="sm" variant="outline" toggle x-model={() => s.collapsible} />
      </Stack>
      <Accordion class="acc-multiple" multiple={() => s.multiple} collapsible={() => s.collapsible}>
        <AccordionItem title="Monday">
          <p>Monday.</p>
        </AccordionItem>
        <AccordionItem title="Tuesday">
          <p>Tuesday.</p>
        </AccordionItem>
        <AccordionItem title="Wednesday" enabled={false}>
          <p>Wednesday.</p>
        </AccordionItem>
        <AccordionItem title="Thursday">
          <p>Thursday.</p>
        </AccordionItem>
      </Accordion>
    </>
  );
}
```

## Lazy sections

A section is built when it is first opened and kept afterwards (`lazy`, on by default). An item with a `content` factory and `keepAlive={false}` has its content disposed when it closes and made again when it opens.

```tsx
import { reactive } from '@motifx/core';
import { Accordion, AccordionItem, TextBox } from '@motifx-community/ui';

/** Sections built when first opened: one kept, one made again each time it opens. */
export default function LazySections() {
  const s = reactive({ builds: 0 });
  return (
    <>
      <Accordion class="acc-lazy" multiple>
        <AccordionItem
          title="Kept"
          content={() => {
            s.builds++;
            return <TextBox label="Type, close, open again" />;
          }}
        />
        <AccordionItem
          title="Made each time"
          keepAlive={false}
          content={() => {
            s.builds++;
            return <TextBox label="Starts empty each time" />;
          }}
        />
      </Accordion>
      <output class="acc-builds">{() => `Sections built: ${s.builds}`}</output>
    </>
  );
}
```

## Variants and sizes

```tsx
import { reactive } from '@motifx/core';
import { Accordion, AccordionItem, Button, Stack, type AccordionChevron, type AccordionVariant } from '@motifx-community/ui';

const VARIANTS: AccordionVariant[] = ['list', 'separated', 'flush'];
const CHEVRONS: AccordionChevron[] = ['end', 'start', 'none'];

/** The three variants in the three sizes, with the chevron at either side or none. */
export default function VariantsAndSizes() {
  const s = reactive({ variant: 'list' as AccordionVariant, chevron: 'end' as AccordionChevron });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Variant">
        {VARIANTS.map((variant) => (
          <Button
            key={variant}
            text={variant}
            size="sm"
            variant={() => (s.variant === variant ? 'solid' : 'ghost')}
            aria-pressed={() => s.variant === variant}
            onclick={() => (s.variant = variant)}
          />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Chevron">
        {CHEVRONS.map((chevron) => (
          <Button
            key={chevron}
            text={`chevron ${chevron}`}
            size="sm"
            variant={() => (s.chevron === chevron ? 'solid' : 'ghost')}
            aria-pressed={() => s.chevron === chevron}
            onclick={() => (s.chevron = chevron)}
          />
        ))}
      </Stack>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Accordion key={size} class="acc-look" size={size} variant={() => s.variant} chevron={() => s.chevron}>
          <AccordionItem title={`Size ${size}`} expanded>
            <p>The section of a {size} accordion.</p>
          </AccordionItem>
          <AccordionItem title="Another">
            <p>Another section.</p>
          </AccordionItem>
        </Accordion>
      ))}
    </>
  );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Tab` | From header to header, and into an open section. |
| `Enter / Space` | Opens or closes the focused item. |
| `Down / Up` | The next / previous header, wrapping around (with `arrowKeys`). |
| `Home / End` | The first / last header (with `arrowKeys`). |
| `Alt + key (`&Shipping`)` | Focuses that header and opens or closes it (Control + Option + key on Apple platforms). |

## Accessibility

| Topic | How |
| --- | --- |
| `Header` | A `<button>` with `aria-expanded` and `aria-controls`, inside an element with `role="heading"` and `aria-level` (`headingLevel`). |
| `Section` | `role="region"` named by its header (`aria-labelledby`) while there are six items or fewer, as the APG suggests; `regions` decides. |
| `Closed sections` | `visibility: hidden` once closed: out of the Tab order and the accessibility tree. |
| `Kept open` | With `collapsible` off, the header of the item that may not close has `aria-disabled="true"`. |
| `Motion` | The height animates with the motion tokens; reduced motion turns it off. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-accordion` | The root. `data-variant`, `data-size`, `data-chevron`, `data-disabled`. |
| `.mx-accordion__item` | An item: `data-expanded`, `data-disabled`. |
| `.mx-accordion__heading, .mx-accordion__header` | The heading and the button in it. |
| `.mx-accordion__icon, .mx-accordion__label, .mx-accordion__chevron` | The parts of a header. |
| `.mx-accordion__region, .mx-accordion__body` | The section (animated) and its content. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `accordion.height.*, accordion.padding.*, accordion.font-size.*` | Header sizes, from the density tokens. |
| `accordion.container, accordion.item` | Units: the accordion and its items per variant (`list`, `list-next`, `separated`, `flush`; `expanded`). |
| `accordion.header, accordion.icon, accordion.chevron, accordion.plate, accordion.body` | Units: a header (`expanded`, `hover`, `pressed`, `disabled`, `focus`), its icon, the chevron (`open`) and a plate behind it, the open section. |
| `accordion.chevron-size, accordion.chevron-plate-size, accordion.content-padding` | The chevron’s and the plate’s sizes; the space above and below a section's content. |

## API reference

### Accordion props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<(string \| number)[]>` | `[]` | The open items' keys (an item without a key: its index). `x-model` binds it two-way. |
| `multiple` | `Bind<boolean>` | `false` | Several items can be open; otherwise opening one closes the other. |
| `collapsible` | `Bind<boolean>` | `true` | `false`: one item stays open; its header has `aria-disabled` while it may not close. |
| `headingLevel` | `Bind<number>` | `3` | The `aria-level` of the headers (1 to 6): fit it to the headings around. |
| `arrowKeys` | `Bind<boolean>` | `true` | Up, Down, Home and End move between the headers. |
| `regions` | `Bind<boolean \| 'auto'>` | `'auto'` | Sections are `role="region"` landmarks; `auto` while there are six items or fewer. |
| `variant` | `Bind<AccordionVariant>` | `'list'` | `list` (one bordered box), `separated` (a card per item), `flush` (lines only). |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`, from the density tokens. |
| `chevron` | `Bind<AccordionChevron>` | `'end'` | Where the open/closed arrow sits: `end`, `start`, `none`. |
| `lazy` | `Bind<boolean>` | `true` | A section is built when first opened, then kept. An item's own `lazy` wins. |
| `keepAlive` | `Bind<boolean>` | `true` | `false`: what an item's `content` made is disposed when it closes and made again when it opens. An item's own `keepAlive` wins. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | The shared properties of every control. |

### AccordionItem props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `Bind<string>` | `''` | The header text; `&Shipping` makes Alt+S open or close it. The same property as `text`. |
| `key` | `Bind<string>` | `''` | Names the item in `value`. The JSX `key` works too. |
| `expanded` | `Bind<boolean>` | `false` | Whether the section is open. |
| `icon` | `Bind<IconSource \| null>` | — | An icon before the title. |
| `hint` | `Bind<string>` | `''` | A tooltip on the header. |
| `lazy, keepAlive` | `Bind<boolean \| undefined>` | the Accordion | This item's own setting. |
| `content` | `() => ComponentBase \| ComponentBase[]` | — | Makes the section content when it is built: instead of, or after, the JSX children. |
| `enabled, visible` | `Bind<boolean>` | `true` | A disabled item cannot be opened or closed; a hidden one is left out. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. |
| `items` | read-only, reactive | The items, in order. |
| `expandedItems` | read-only, reactive | The open items. |
| `AccordionItem.contentBuilt` | read-only | Whether its section has been built. |
| `AccordionItem.owner, headerElement, regionElement` | read-only | Its `Accordion`, its header button, its region. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `add(item), insert(index, item)` | `AccordionItem` | Adds an item. An item of another `Accordion` moves here. |
| `remove(item)` | `boolean` | Removes the item and disposes it; focus inside moves to a neighbour. |
| `expandAll(), collapseAll()` | `void` | From code. `expandAll` needs `multiple`; with `collapsible` off one item stays open. |
| `AccordionItem.expand(), collapse()` | `boolean` | As a click would: the cancelable events run. `item.expanded = true` sets it from code. |
| `focus()` | `boolean` | An item focuses its header. |

### Events

| Event | When |
| --- | --- |
| `onExpanding(e), onCollapsing(e)` | The user is about to open / close an item. `e`: `{ item, index, cancel, source, event? }`; `e.cancel = true` leaves it. |
| `onExpanded(e), onCollapsed(e)` | An item opened / closed. `e`: `{ item, index, byUser, source }`. |

The accordion writes no text of its own, so it has nothing in `uiLocale`.
