# MultiView

> Navigation · @motifx-community/ui 0.1.0-beta.3

Pages side by side, one in sight: a swipe or a drag brings the next one, and so do `next()`, `previous()` and `goTo()`, or a [Tabs](tabs.md), a [Stepper](stepper.md) or buttons bound to the same value. The panels of a tab strip without the strip.

## Import

```tsx
import { MultiView, View } from '@motifx-community/ui';
```

## Pages driven by a stepper

The `View` children are the pages; the one in sight is `value` (a view’s `key`, else its index), `x-model` binds it two-way. Here a `Stepper` shares the value: a press on a step and a swipe on a page move both. A page is built when first in sight (`lazy`).

```tsx
import { reactive } from '@motifx/core';
import { CheckBox, MultiView, Stack, Stepper, TextBox, View } from '@motifx-community/ui';

/** A stepper and a multi-view bound to the same value: a press on a step or a swipe on a page moves both. */
export default function Pages() {
    const s = reactive({ page: 0 as string | number | null });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Stepper class="mv-steps" label="Order" linear={false} items={['Address', 'Delivery', 'Payment']} x-model={() => s.page} />
            <MultiView class="mv-order" label="Order" x-model={() => s.page}>
                <View title="Address">
                    <Stack gap="sm">
                        <TextBox label="Street" />
                        <TextBox label="Town" />
                    </Stack>
                </View>
                <View title="Delivery">
                    <Stack gap="sm">
                        <CheckBox text="Leave it at the door" />
                        <CheckBox text="Send a message before" />
                    </Stack>
                </View>
                <View title="Payment">
                    <Stack gap="sm">
                        <TextBox label="Card number" />
                        <TextBox label="Name on the card" />
                    </Stack>
                </View>
            </MultiView>
            <output class="mv-order-page">{() => `page: ${s.page}`}</output>
        </Stack>
    );
}
```

## Built when first in sight, kept or not

`lazy` (the default) builds a view when it first comes into sight and keeps it; `keepAlive={false}` disposes what a view’s `content` made while it is out of sight, and makes it again the next time. The JSX children stay either way, as in `Tabs`.

```tsx
import { reactive } from '@motifx/core';
import { Button, MultiView, Stack, View } from '@motifx-community/ui';

/** Each page is made when first in sight; with `keepAlive` off, what `content` made is dropped out of sight and made again. */
export default function Lazy() {
    const s = reactive({ made: 0, keep: true });
    let views!: MultiView;
    const report = (name: string) => () => {
        s.made++;
        return <p class="mv-lazy-page">{`${name}, made as number ${s.made}`}</p>;
    };
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Previous" variant="outline" onclick={() => void views.previous()} />
                <Button text="Next" variant="outline" onclick={() => void views.next()} />
                <Button text="Keep alive" variant="outline" toggle x-model={() => s.keep} />
                <output class="mv-lazy-made">{() => `made ${s.made} times`}</output>
            </Stack>
            <MultiView ref={(m: MultiView) => (views = m)} class="mv-lazy" label="Reports" keepAlive={() => s.keep}>
                <View title="Sales" content={report('Sales')} />
                <View title="Stock" content={report('Stock')} />
                <View title="Staff" content={report('Staff')} />
            </MultiView>
        </Stack>
    );
}
```

## Programmatic use

Made with `new`, views added with `add()` and `insert()`, removed with `remove()`; `loop` goes around the ends, `animated={false}` shows the next view at once.

```tsx
import { reactive } from '@motifx/core';
import { Button, MultiView, Stack, View } from '@motifx-community/ui';

/** A multi-view made programmatically around the ends: views added, inserted and removed, the sight moved with its methods. */
export default function Programmatic() {
    const s = reactive({ told: '', count: 0 });
    let number = 0;
    const page = () => {
        number++;
        const n = number;
        return new View({ title: `Note ${n}`, content: () => <p class="mv-coded-note">{`Note ${n}`}</p> });
    };
    const coded = new MultiView({
        label: 'Notes',
        loop: true,
        onSelectionChanged: e => (s.told = `in sight: ${e.view?.title ?? 'none'}${e.byUser ? ', by a swipe' : ''}`)
    });
    const count = () => (s.count = coded.count);
    coded.add(page());
    coded.add(page());
    count();
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Previous" variant="outline" onclick={() => void coded.previous()} />
                <Button text="Next" variant="outline" onclick={() => void coded.next()} />
                <Button
                    text="Add a note"
                    variant="outline"
                    onclick={() => {
                        void coded.goTo(coded.add(page()));
                        count();
                    }}
                />
                <Button
                    text="Remove this note"
                    variant="outline"
                    enabled={() => s.count > 1}
                    onclick={() => {
                        if (coded.selectedView) coded.remove(coded.selectedView);
                        count();
                    }}
                />
                <output class="mv-coded-told">{() => `${s.count} notes${s.told ? `, ${s.told}` : ''}`}</output>
            </Stack>
            <span class="mv-coded" onConfig={c => c.controls.add(coded)} />
        </Stack>
    );
}
```

## Accessibility

| Topic | How |
| --- | --- |
| `Group` | A `group` named “Pages” in the kit language; several on one page: give each its own `label`. |
| `A view` | A `group` named by its `title`, else “Page 2 of 3”; the views out of sight are hidden from readers and from the keys (`inert`), so Tab moves only inside the view in sight. |
| `Moving` | A swipe needs a finger or a mouse: give the keys a way too, a `Tabs`, a `Stepper` or buttons bound to the same `value`, as the examples do. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-multi-view` | The multi-view. `data-swipe` when a drag moves it, `data-dragging` while one does, `data-still` with `animated` off. |
| `.mx-multi-view__viewport, .mx-multi-view__track` | The frame that clips the views and the track that slides in it (`data-dragging`, `data-no-motion`). |
| `.mx-multi-view__view` | A view (`aria-hidden`, `inert` out of sight). |

### Component tokens

| Token | What it sets |
| --- | --- |
| `multi-view.frame, .view` | Units: the frame (`swipeable`, `dragging`) and a view. |
| `multi-view.gap` | Between the views, seen while a finger drags them. |

## API reference

### MultiView props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<string \| number \| null>` | `0` | The view in sight: its `key`, else its index. `x-model` binds it two-way. |
| `loop` | `Bind<boolean>` | `false` | After the last view comes the first; the move goes around the ends, not back across the views between. |
| `swipeEnabled` | `Bind<boolean>` | `true` | A finger or a pointer drags the views; a drag far or fast enough lands on the next one. |
| `animated` | `Bind<boolean>` | `true` | The views slide into sight. `false` shows the next one at once. |
| `lazy` | `Bind<boolean>` | `true` | A view is built when first in sight, then kept (a view’s own `lazy` wins). |
| `keepAlive` | `Bind<boolean>` | `true` | `false` disposes what a view’s `content` made while the view is out of sight (a view’s own `keepAlive` wins). |
| `label` | `Bind<string>` | the kit’s “Pages” | What screen readers call it. |

### View props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `Bind<string>` | “Page 2 of 3” | What screen readers call the view. |
| `key` | `Bind<string>` | `''` | Names the view in `value`; the JSX `key` is read too. |
| `content` | `() => ComponentBase \| ComponentBase[]` | — | Content made when the view is first in sight, besides the JSX children. |
| `lazy, keepAlive` | `Bind<boolean \| undefined>` | `undefined` | The view’s own settings; `undefined` follows the multi-view. |
| `visible, enabled` | `Bind<boolean>` | `true` | A hidden view takes no room and is skipped; a disabled one is skipped by `next()` and `previous()` and refused by `goTo()`. |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onSelecting` | event | The view in sight is about to change (`from`, `to`, `fromView`, `toView`, `byUser`); `cancel = true` keeps the one there. |
| `onSelectionChanged` | event | The view in sight changed (`index`, `view`, `previous`, `byUser`: by a swipe, else programmatically). |
| `views` | read-only | The views in order, hidden ones too. |
| `selectedView, selectedIndex` | read-only | The view in sight and its index; `null` and -1 when there is none. |
| `count` | read-only | How many views there are. |
| `next(), previous()` | `Promise<boolean>` | Goes to the next or the previous view that is shown and enabled; `false` at an end without `loop`, or when refused. |
| `goTo(view)` | `Promise<boolean>` | Goes to a view, by index, key or the `View` itself; `onSelecting` is asked first. A view’s own `select()` does the same. |
| `add(view), insert(index, view)` | `View` | Adds a view at the end or at an index; one from another multi-view moves here. |
| `remove(view)` | `boolean` | Removes a view and disposes it; the sight moves to a neighbour. |
