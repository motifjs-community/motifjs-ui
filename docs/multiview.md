# MultiView

> Navigation · @motifx-community/ui 0.1.0-beta.3

Displays one page at a time from a horizontal set. Users move between pages with a swipe or drag, and you can navigate with `next()`, `previous()` and `goTo()`, or with [Tabs](tabs.md), a [Stepper](stepper.md) or buttons bound to the same value. It works like the panels of a tab control without the tab strip.

## Import

```tsx
import { MultiView, View } from '@motifx-community/ui';
```

## Using MultiView with a Stepper

The `View` children are the pages. `value` is the visible view, identified by its `key` or index, and `x-model` provides two-way binding. In this example, a `Stepper` shares the value, so pressing a step and swiping a page both update it. A page is created when it first becomes visible (`lazy`).

```tsx
import { reactive } from '@motifx/core';
import { CheckBox, MultiView, Stack, Stepper, TextBox, View } from '@motifx-community/ui';

/** A stepper and a multi-view bound to the same value: clicking a step or swiping a page updates both. */
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

## Lazy creation and keeping views alive

`lazy`, the default, creates a view when it first becomes visible and then keeps it. `keepAlive={false}` disposes what a view's `content` created while it is hidden and recreates it next time. JSX children are always kept, as in `Tabs`.

```tsx
import { reactive } from '@motifx/core';
import { Button, MultiView, Stack, View } from '@motifx-community/ui';

/** Each page is created when first visible. With `keepAlive` off, the output of `content` is disposed while hidden and recreated. */
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

Create the component with `new`, add views with `add()` and `insert()`, and remove them with `remove()`. `loop` wraps around at the ends, and `animated={false}` shows the next view immediately.

```tsx
import { reactive } from '@motifx/core';
import { Button, MultiView, Stack, View } from '@motifx-community/ui';

/** A looping multi-view created programmatically: views added, inserted and removed, and navigation through its methods. */
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

| Topic | Details |
| --- | --- |
| `Group` | A `group` named “Pages” in the kit language. If a page has several, give each one its own `label`. |
| `A view` | A `group` named by its `title`, or “Page 2 of 3”. Views out of sight are hidden from assistive technology and the keyboard (`inert`), so Tab moves only within the visible view. |
| `Moving` | Swiping requires a finger or a mouse, so also provide keyboard access through `Tabs`, a `Stepper` or buttons bound to the same `value`, as the examples do. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-multi-view` | The multi-view. `data-swipe` when dragging is enabled, `data-dragging` during a drag, and `data-still` with `animated` off. |
| `.mx-multi-view__viewport, .mx-multi-view__track` | The frame that clips the views and the track that moves inside it (`data-dragging`, `data-no-motion`). |
| `.mx-multi-view__view` | A view (`aria-hidden` and `inert` when hidden). |

### Component tokens

| Token | Description |
| --- | --- |
| `multi-view.frame, .view` | Units: the frame (`swipeable`, `dragging`) and a view. |
| `multi-view.gap` | The gap between views, visible during a drag. |

## API reference

### MultiView props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<string \| number \| null>` | `0` | The visible view, identified by its `key` or index. `x-model` provides two-way binding. |
| `loop` | `Bind<boolean>` | `false` | The first view follows the last, and the transition wraps around instead of running back across the views in between. |
| `swipeEnabled` | `Bind<boolean>` | `true` | Lets a finger or pointer drag the views. A drag that is far or fast enough moves to the next view. |
| `animated` | `Bind<boolean>` | `true` | Animates the transition between views. `false` shows the next view immediately. |
| `lazy` | `Bind<boolean>` | `true` | Creates a view when it first becomes visible and then keeps it. A view's own `lazy` takes precedence. |
| `keepAlive` | `Bind<boolean>` | `true` | With `false`, disposes what a view's `content` created while the view is hidden. A view's own `keepAlive` takes precedence. |
| `label` | `Bind<string>` | The kit string “Pages” | The accessible name. |

### View props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `Bind<string>` | “Page 2 of 3” | The accessible name of the view. |
| `key` | `Bind<string>` | `''` | Identifies the view in `value`. The JSX `key` is also read. |
| `content` | `() => ComponentBase \| ComponentBase[]` | — | Content created when the view first becomes visible, in addition to the JSX children. |
| `lazy, keepAlive` | `Bind<boolean \| undefined>` | `undefined` | The view's own settings. `undefined` inherits from the multi-view. |
| `visible, enabled` | `Bind<boolean>` | `true` | A hidden view takes no space and is skipped. A disabled view is skipped by `next()` and `previous()`, and `goTo()` rejects it. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onSelecting` | event | Occurs before the visible view changes (`from`, `to`, `fromView`, `toView`, `byUser`). Set `cancel = true` to keep the current view. |
| `onSelectionChanged` | event | Occurs after the visible view changes (`index`, `view`, `previous`, and `byUser` for a swipe, as opposed to code). |
| `views` | read-only | The views in order, including hidden ones. |
| `selectedView, selectedIndex` | read-only | The visible view and its index, or `null` and -1 if there is none. |
| `count` | read-only | The number of views. |
| `next(), previous()` | `Promise<boolean>` | Moves to the next or previous view that is visible and enabled. Returns `false` at an end without `loop`, or if the change was canceled. |
| `goTo(view)` | `Promise<boolean>` | Moves to a view by index, key or `View` object. `onSelecting` is raised first. A view's own `select()` does the same. |
| `add(view), insert(index, view)` | `View` | Adds a view at the end or at an index. A view from another multi-view moves here. |
| `remove(view)` | `boolean` | Removes a view and disposes it. The display moves to an adjacent view. |
