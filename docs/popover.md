# Popover

> Feedback · @motifx-community/ui 0.1.0-beta.2

Content next to the element it belongs to: a title, a close button, a form, a card. It opens on a press or while the pointer rests on its target, follows it, and points at it with an arrow where the design language has one.

## Import

```tsx
import { Popover } from '@motifx-community/ui';
```

## From JSX and from code

The JSX children are the content; `target` names the element or component it opens next to. From code, `content` gives the content and `open()`, `close()` and `toggle()` move it; `value` and `x-model` say whether it is open.

```tsx
import { reactive } from '@motifx/core';
import { Button, Popover, Stack, TextBox } from '@motifx-community/ui';

/** A popover with a title, a close button and a small form; one made from code for a plain element. */
export default function Basic() {
    const s = reactive({ open: false, name: 'Ada', saved: '' });
    let button!: Button;
    let link!: HTMLElement;
    const coded = new Popover({ title: 'From code', content: new Button({ text: 'OK', variant: 'outline', onclick: () => coded.close() }) });

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
                A popover from code
            </a>
        </Stack>
    );
}
```

## While the pointer rests

`showOn: 'hover'` opens it after `delay` while the pointer rests on the target, and when the target has keyboard focus; the pointer may move onto the popover. It closes `hideDelay` after the pointer leaves both.

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

## Placements, the arrow and a width

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

/** A press outside does not close it, and onClosing keeps it open while there is unsaved text; Escape and the button close it. */
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

## Behaviour

| Topic | How |
| --- | --- |
| `Opening` | By a press on the target, by the pointer resting on it (`hover`), or from code. It appears in the browser’s top layer, next to the target, and follows it while the page scrolls. |
| `Focus` | Opened by a press or from code, focus moves to the first focusable part inside, else to the popover; it goes back to the target when the popover closes. Opened by hover, focus stays where it is. |
| `Closing` | Escape, a press outside it and its target, focus leaving both (Tab out), the close button, the target pressed again, or the pointer leaving both (`hover`). `onClosing` may keep it open. |
| `Placement` | `placement` names the side and the alignment, as for the kit’s popups; without room on that side it opens on the other. |
| `Where it lives` | Made from code, it goes into the nearest container of its target that can hold it, so it stays in the target’s window and landmark. |

## Accessibility

| Topic | How |
| --- | --- |
| `Role` | `dialog`, named by its title, else by `label`: give it one. |
| `Target` | `aria-controls` and `aria-expanded`; `aria-haspopup="dialog"` when a press opens it. |
| `Keyboard` | Tab moves through the content and out (which closes it); Escape closes and returns focus. A `hover` popover opens on keyboard focus too. |
| `Arrow` | Decorative. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-popover` | The popover. `data-side` (`top`, `bottom`, `start`, `end`), `data-arrow`. |
| `.mx-popover__arrow` | The arrow. |
| `.mx-popover__header, .mx-popover__title, .mx-popover__close` | The header, its title and the close button. |
| `.mx-popover__body` | The content. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `popover.surface, .arrow, .header, .title, .body` | Units: the surface (`focus`), the arrow (`display`, `size`, its fill and frame), the header, the title and the body. |
| `popover.close` | Place: the close button’s look (`variant`). |
| `popover.offset, .enter-offset, .header-gap` | The gap to the target, how far it comes in as it appears, the space between title and close button. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `target` | `Bind<Element \| ComponentBase \| null>` | `null` | The element or component it opens next to. |
| `title` | `Bind<string>` | `''` | A title in the header. The same property as `text`. |
| `label` | `Bind<string>` | `''` | What screen readers call it when it has no title. |
| `content` | `Bind<ComponentBase \| null>` | `null` | Content from code, after the JSX children. |
| `showOn` | `Bind<PopoverShowOn>` | `'click'` | `click`: a press on the target toggles it; `hover`: the pointer resting on the target, or keyboard focus on it; `manual`: only code. |
| `placement` | `Bind<PopupPlacement>` | `'bottom'` | The side and the alignment; it opens on the other side when there is no room. |
| `arrow` | `Bind<boolean>` | `true` | An arrow towards the target, where the design language draws one. |
| `showClose` | `Bind<boolean>` | `false` | A close button in the header. |
| `width` | `Bind<string \| number \| null>` | `null` | A width of its own (a CSS length, or pixels). |
| `closeOnOutside` | `Bind<boolean>` | `true` | A press outside it and its target closes it. |
| `delay, hideDelay` | `Bind<number>` | `300`, `200` | Milliseconds the pointer rests on the target before it opens, and it stays after the pointer leaves both (`showOn: 'hover'`). |
| `value` | `Bind<boolean>` | `false` | Open or not; `x-model` binds it two-way. |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onOpened` | event | It opened. |
| `onClosing` | event | About to close (`reason`); `cancel = true` keeps it open. |
| `onClosed` | event | It closed, with the reason: `escape`, `outside`, `focus`, `toggle`, `hover`, `close-button`, `code`. |
| `open(), close(reason?), toggle()` | `boolean` / `void` | From code; `open()` is `false` without a target on the page or when disabled. |
| `place()` | `void` | Lines it up with its target again, after its content changed size. |
| `isOpen` | read-only | Whether it is open now. |
| `closeButton, body` | read-only | The close button (the kit’s) and the part that holds the content. |
