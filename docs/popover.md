# Popover

> Feedback · @motifx-community/ui 0.1.0-beta.4

Displays content next to a related element, such as a title, a close button, a form or a card. It opens on click or on hover, follows its target, and points to it with an arrow where the design language includes one.

## Import

```tsx
import { Popover } from '@motifx-community/ui';
```

## Declarative and programmatic

JSX children are the content, and `target` specifies the element or component it opens next to. Programmatically, `content` sets the content, and `open()`, `close()` and `toggle()` control it. `value` and `x-model` report whether it is open.

```tsx
import { reactive } from '@motifx/core';
import { Button, Popover, Stack, TextBox } from '@motifx-community/ui';

/** A popover with a title, a close button and a small form, and one created programmatically for a plain element. */
export default function Basic() {
    const s = reactive({ open: false, name: 'Ada', saved: '' });
    let button!: Button;
    let link!: HTMLElement;
    const coded = new Popover({ title: 'Programmatically', content: new Button({ text: 'OK', variant: 'outline', onclick: () => coded.close() }) });

    return (
        <Stack orientation="horizontal" wrap align="center">
            <Button ref={(b: Button) => (button = b)} text="Rename" variant="outline" />
            <Popover target={() => button} title="New name" showClose x-model={() => s.open}>
                <Stack orientation="horizontal" wrap align="center">
                    <TextBox label="Name" x-model={() => s.name} />
                    <Button text="Save" tone="accent" onclick={() => ((s.saved = s.name), (s.open = false))} />
                </Stack>
            </Popover>
            <output class="po-saved">{() => (s.saved ? `Saved: ${s.saved}` : s.open ? 'Open' : 'Closed')}</output>
            <a
                href="#from-code"
                class="po-link"
                ref={(c: { element: HTMLElement }) => (link = c.element)}
                onclick={(e: Event) => {
                    e.preventDefault();
                    coded.target = link;
                    coded.toggle();
                }}
            >
                A popover programmatically
            </a>
        </Stack>
    );
}
```

## Opening on hover

`showOn: 'hover'` opens the popover after `delay` while the pointer rests on the target, and when the target has keyboard focus. The pointer can move onto the popover, which closes `hideDelay` after the pointer leaves both.

```tsx
import { Avatar, Popover, Stack } from '@motifx-community/ui';

/** A card that opens while the pointer rests on a name, or when the name has keyboard focus. */
export default function Hover() {
    let name!: HTMLElement;
    return (
        <Stack orientation="horizontal" wrap align="center">
            <span>
                Reviewed by{' '}
                <a href="#ada" class="po-person" ref={(c: { element: HTMLElement }) => (name = c.element)} onclick={(e: Event) => e.preventDefault()}>
                    Ada Lovelace
                </a>
            </span>
            <Popover target={() => name} showOn="hover" placement="top" label="Ada Lovelace">
                <Stack orientation="horizontal" align="center">
                    <Avatar name="Ada Lovelace" size="lg" />
                    <Stack>
                        <strong>Ada Lovelace</strong>
                        <span>Analytical Engine, Programs</span>
                    </Stack>
                </Stack>
            </Popover>
        </Stack>
    );
}
```

## Placement, arrow and width

```tsx
import { reactive } from '@motifx/core';
import { Button, CheckBox, Popover, Stack, type PopupPlacement } from '@motifx-community/ui';

const PLACEMENTS: PopupPlacement[] = ['top-start', 'top', 'top-end', 'start', 'end', 'bottom-start', 'bottom', 'bottom-end'];

/** Every placement; the arrow where the language draws one, and a width of its own. */
export default function Placements() {
    const s = reactive({ arrow: true, placement: 'bottom' as PopupPlacement });
    let button!: Button;
    return (
        <Stack gap="md">
            <Stack orientation="horizontal" wrap align="center">
                {PLACEMENTS.map(placement => (
                    <Button key={placement} text={placement} variant={() => (s.placement === placement ? 'solid' : 'outline')} size="sm" onclick={() => (s.placement = placement)} />
                ))}
                <CheckBox label="Arrow" x-model={() => s.arrow} />
            </Stack>
            <div style="display: flex; justify-content: center; padding: 3rem 0">
                <Button ref={(b: Button) => (button = b)} text="Open" />
            </div>
            <Popover target={() => button} placement={() => s.placement} arrow={() => s.arrow} width="16rem" label="Placement">
                <p>{() => `Placed at ${s.placement}; it moves to the other side when there is no room.`}</p>
            </Popover>
        </Stack>
    );
}
```

## Keeping it open

```tsx
import { reactive } from '@motifx/core';
import { Button, Popover, Stack, TextArea } from '@motifx-community/ui';

/** A click outside does not close it, and onClosing keeps it open while there is unsaved text. Escape and the button close it. */
export default function Events() {
    const s = reactive({ note: '', told: '' });
    let button!: Button;
    let pop!: Popover;
    return (
        <Stack orientation="horizontal" wrap align="center">
            <Button ref={(b: Button) => (button = b)} text="Add a note" variant="outline" />
            <Popover
                ref={(p: Popover) => (pop = p)}
                target={() => button}
                title="Note"
                closeOnOutside={false}
                onClosing={e => {
                    if (e.reason === 'escape' && s.note.trim() !== '') {
                        e.cancel = true;
                        s.told = 'Save or clear the note first.';
                    }
                }}
                onClosed={reason => (s.told = `Closed: ${String(reason)}`)}
            >
                <Stack gap="sm">
                    <TextArea label="Text" x-model={() => s.note} rows={3} />
                    <Button text="Save" tone="accent" onclick={() => ((s.note = ''), pop.close())} />
                </Stack>
            </Popover>
            <output class="po-told">{() => s.told}</output>
        </Stack>
    );
}
```

## Behavior

| Topic | Details |
| --- | --- |
| `Opening` | The popover opens on target click, on hover (`hover`), or programmatically. It appears in the browser's top layer next to the target and follows it as the page scrolls. |
| `Focus` | When opened by a click or programmatically, focus moves to the first focusable element inside, or to the popover itself, and returns to the target when it closes. When opened by hover, focus stays where it is. |
| `Closing` | It closes on Escape, a click outside it and its target, focus leaving both (Tab), the close button, another click on the target, or the pointer leaving both (`hover`). `onClosing` can keep it open. |
| `Placement` | `placement` sets the side and alignment, as in the kit's other popups. If there is no room on that side, it opens on the opposite side. |
| `Where it lives` | When created programmatically, it is placed in the nearest container of its target that can hold it, so it stays in the target's window and landmark. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Role` | `dialog`, named by its title or by `label`. Always provide one of them. |
| `Target` | `aria-controls` and `aria-expanded`, plus `aria-haspopup="dialog"` when a click opens it. |
| `Keyboard` | Tab moves through the content and out, which closes the popover. Escape closes it and returns focus. A `hover` popover also opens on keyboard focus. |
| `Arrow` | Decorative. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-popover` | The popover. `data-side` (`top`, `bottom`, `start`, `end`), `data-arrow`. |
| `.mx-popover__arrow` | The arrow. |
| `.mx-popover__header, .mx-popover__title, .mx-popover__close` | The header, its title and the close button. |
| `.mx-popover__body` | The content. |

### Component tokens

| Token | Description |
| --- | --- |
| `popover.surface, .arrow, .header, .title, .body` | Units: the surface (`focus`), the arrow (`display`, `size`, its fill and frame), the header, the title and the body. |
| `popover.close` | Place: the appearance of the close button (`variant`). |
| `popover.offset, .enter-offset, .header-gap` | The gap to the target, the distance it animates in from, and the space between the title and close button. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `target` | `Bind<Element \| ComponentBase \| null>` | `null` | The element or component it opens next to. |
| `title` | `Bind<string>` | `''` | A title in the header. This is the same property as `text`. |
| `label` | `Bind<string>` | `''` | The accessible name when there is no title. |
| `content` | `Bind<ComponentBase \| null>` | `null` | Content set programmatically, shown after the JSX children. |
| `showOn` | `Bind<PopoverShowOn>` | `'click'` | `click` toggles it when the target is clicked, `hover` opens it on hover or keyboard focus, and `manual` leaves it to your code. |
| `placement` | `Bind<PopupPlacement>` | `'bottom'` | The side and alignment. It opens on the opposite side if there is no room. |
| `arrow` | `Bind<boolean>` | `true` | Shows an arrow toward the target, where the design language includes one. |
| `showClose` | `Bind<boolean>` | `false` | Shows a close button in the header. |
| `width` | `Bind<string \| number \| null>` | `null` | A custom width, as a CSS length or in pixels. |
| `closeOnOutside` | `Bind<boolean>` | `true` | Closes the popover on a click outside it and its target. |
| `delay, hideDelay` | `Bind<number>` | `300`, `200` | The time in milliseconds the pointer must rest on the target before it opens, and the time it stays after the pointer leaves both (`showOn: 'hover'`). |
| `value` | `Bind<boolean>` | `false` | Indicates whether it is open. `x-model` provides two-way binding. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onOpened` | event | Occurs when it opens. |
| `onClosing` | event | Occurs before it closes (`reason`). Set `cancel = true` to keep it open. |
| `onClosed` | event | Occurs when it closes, with the reason: `escape`, `outside`, `focus`, `toggle`, `hover`, `close-button` or `code`. |
| `open(), close(reason?), toggle()` | `boolean` / `void` | Programmatic control. `open()` returns `false` if there is no target on the page or the popover is disabled. |
| `place()` | `void` | Repositions it relative to its target after its content changes size. |
| `isOpen` | read-only | Indicates whether it is currently open. |
| `closeButton, body` | read-only | The kit close button, and the part that holds the content. |

## Feedback

Loading issues…
