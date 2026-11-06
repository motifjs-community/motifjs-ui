# Accordion

> Navigation · @motifx-community/ui 0.1.0-beta.3

An accordion expands and collapses sections under their headers. It supports one or several open sections, sections that stay open, icons, three appearances and sections that are created when first opened.

## Import

```tsx
import { Accordion, AccordionItem } from '@motifx-community/ui';
```

## Declarative and programmatic

The children of an `<AccordionItem>` are its section. `value` lists the keys of the open items, and `x-model` provides two-way binding. When you create the component with `new`, add and remove items programmatically.

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

/** An accordion from JSX bound with x-model, and one created with `new` that gets items programmatically. */
export default function Programmatic() {
  const s = reactive({ open: ['shipping'] as (string | number)[], address: '', log: '' });
  let added = 0;

  const faq = new Accordion({ variant: 'separated', multiple: true });
  for (const entry of FAQ) faq.add(new AccordionItem({ title: entry.q, content: () => <p>{entry.a}</p> }));
  faq.onExpanded((e) => (s.log = `Opened “${e.item.title}”${e.byUser ? ' by the user' : ' programmatically'}.`));

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
        <Button text="Add a question programmatically" variant="outline" onclick={addQuestion} />
        <output class="acc-log">{() => s.log}</output>
      </Stack>
      <Stack style="inline-size: 100%" onBuilt={(c) => c.controls.add(faq)} />
    </>
  );
}
```

## Single and multiple expansion

By default, one item is open at a time. With `multiple`, several can be open. `collapsible={false}` keeps one open, so its header cannot close it.

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

A section is created when first opened and then kept (`lazy`, on by default). An item with a `content` factory and `keepAlive={false}` has its content disposed when it closes and recreated when it opens.

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

| Key | Description |
| --- | --- |
| `Tab` | Moves from header to header, and into an open section. |
| `Enter / Space` | Expands or collapses the focused item. |
| `Down / Up` | Moves to the next or previous header, wrapping at the ends (with `arrowKeys`). |
| `Home / End` | Moves to the first or last header (with `arrowKeys`). |
| `Alt + key (`&Shipping`)` | Moves focus to that header and toggles it (Control + Option + key on Apple platforms). |

## Accessibility

| Topic | Details |
| --- | --- |
| `Header` | A `<button>` with `aria-expanded` and `aria-controls`, inside an element with `role="heading"` and `aria-level` (`headingLevel`). |
| `Section` | `role="region"` named by its header (`aria-labelledby`) when there are six items or fewer, as the APG recommends. `regions` controls this. |
| `Closed sections` | `visibility: hidden` once closed, which removes it from the Tab order and the accessibility tree. |
| `Kept open` | With `collapsible` off, the header of an item that cannot close has `aria-disabled="true"`. |
| `Motion` | The height animates using the motion tokens, and reduced motion turns it off. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-accordion` | The root. `data-variant`, `data-size`, `data-chevron`, `data-disabled`. |
| `.mx-accordion__item` | An item: `data-expanded`, `data-disabled`. |
| `.mx-accordion__heading, .mx-accordion__header` | The heading and its button. |
| `.mx-accordion__icon, .mx-accordion__label, .mx-accordion__chevron` | The parts of a header. |
| `.mx-accordion__region, .mx-accordion__body` | The section (animated) and its content. |

### Component tokens

| Token | Description |
| --- | --- |
| `accordion.height.*, accordion.padding.*, accordion.font-size.*` | Header sizes, from the density tokens. |
| `accordion.container, accordion.item` | Units: the accordion and its items per variant (`list`, `list-next`, `separated`, `flush`; `expanded`). |
| `accordion.header, accordion.icon, accordion.chevron, accordion.plate, accordion.body` | Units: a header (`expanded`, `hover`, `pressed`, `disabled`, `focus`), its icon, the chevron (`open`) and the plate behind it, and the open section. |
| `accordion.chevron-size, accordion.chevron-plate-size, accordion.content-padding` | The sizes of the chevron and plate, and the spacing above and below the section content. |

## API reference

### Accordion props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<(string \| number)[]>` | `[]` | The keys of the open items (an item without a key uses its index). `x-model` provides two-way binding. |
| `multiple` | `Bind<boolean>` | `false` | Allows several items to be open. Otherwise, opening one closes the other. |
| `collapsible` | `Bind<boolean>` | `true` | With `false`, one item stays open, and its header has `aria-disabled` while it cannot close. |
| `headingLevel` | `Bind<number>` | `3` | The `aria-level` of the headers (1 to 6). Match it to the surrounding headings. |
| `arrowKeys` | `Bind<boolean>` | `true` | Up, Down, Home and End move between headers. |
| `regions` | `Bind<boolean \| 'auto'>` | `'auto'` | Makes sections `role="region"` landmarks. `auto` applies when there are six items or fewer. |
| `variant` | `Bind<AccordionVariant>` | `'list'` | `list` (one bordered box), `separated` (a card per item) or `flush` (dividers only). |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`, from the density tokens. |
| `chevron` | `Bind<AccordionChevron>` | `'end'` | The position of the chevron: `end`, `start` or `none`. |
| `lazy` | `Bind<boolean>` | `true` | Creates a section when first opened and then keeps it. An item's own `lazy` takes precedence. |
| `keepAlive` | `Bind<boolean>` | `true` | With `false`, content created by an item's `content` is disposed when it closes and recreated when it opens. An item's own `keepAlive` takes precedence. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | Properties shared by all controls. |

### AccordionItem props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `Bind<string>` | `''` | The header text. `&Shipping` makes Alt+S toggle the item. This is the same property as `text`. |
| `key` | `Bind<string>` | `''` | Identifies the item in `value`. The JSX `key` also works. |
| `expanded` | `Bind<boolean>` | `false` | Indicates whether the section is open. |
| `icon` | `Bind<IconSource \| null>` | — | An icon before the title. |
| `hint` | `Bind<string>` | `''` | A tooltip on the header. |
| `lazy, keepAlive` | `Bind<boolean \| undefined>` | From Accordion | This item's own setting. |
| `content` | `() => ComponentBase \| ComponentBase[]` | — | Creates the section content when it is created, either instead of or after the JSX children. |
| `enabled, visible` | `Bind<boolean>` | `true` | A disabled item cannot be opened or closed, and a hidden item is removed. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop. |
| `items` | read-only, reactive | The items in order. |
| `expandedItems` | read-only, reactive | The open items. |
| `AccordionItem.contentBuilt` | read-only | Indicates whether its section has been created. |
| `AccordionItem.owner, headerElement, regionElement` | read-only | Its `Accordion`, its header button and its region. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `add(item), insert(index, item)` | `AccordionItem` | Adds an item. An item from another `Accordion` moves here. |
| `remove(item)` | `boolean` | Removes the item and disposes it. Focus inside moves to an adjacent item. |
| `expandAll(), collapseAll()` | `void` | Programmatic control. `expandAll` requires `multiple`, and with `collapsible` off one item stays open. |
| `AccordionItem.expand(), collapse()` | `boolean` | Toggles as a click would, so the cancelable events run. `item.expanded = true` sets the state programmatically. |
| `focus()` | `boolean` | Sets focus on the item's header. |

### Events

| Event | When |
| --- | --- |
| `onExpanding(e), onCollapsing(e)` | Occurs before the user opens or closes an item. `e`: `{ item, index, cancel, source, event? }`. Set `e.cancel = true` to keep the current state. |
| `onExpanded(e), onCollapsed(e)` | Occurs after an item opens or closes. `e`: `{ item, index, byUser, source }`. |

The accordion has no strings of its own, so it adds nothing to `uiLocale`.
