# LoadPanel

> Feedback · @motifx-community/ui 0.1.0-beta.3

A loading overlay for a container or the whole page. It includes a shade, a panel with the kit spinner and a message, and a Cancel button when the operation can be stopped. The content underneath is unavailable while it is shown, and focus returns afterward.

## Import

```tsx
import { LoadPanel } from '@motifx-community/ui';
```

## Covering a container

`target` specifies the component or element to cover. `value` or `x-model` shows and hides the panel, or you can call `show()` and `hide()`. `delay` keeps it from flashing during quick operations.

```tsx
import { reactive } from '@motifx/core';
import { Button, LoadPanel, Panel, Stack, TextBox } from '@motifx-community/ui';

/** A load panel over a panel while its orders load: bound with x-model, shown after a short delay. */
export default function Container() {
    const s = reactive({ loading: false, result: '' });
    let panel!: Panel;

    // Simulates a server call.
    const load = () => {
        s.loading = true;
        s.result = '';
        setTimeout(() => {
            s.loading = false;
            s.result = 'Orders loaded.';
        }, 1800);
    };

    return (
        <Stack gap="md" style="inline-size: 100%">
            <Panel class="lp-panel" variant="outline" padding="md" style="min-block-size: 10rem" ref={(c: Panel) => (panel = c)}>
                <Stack orientation="horizontal" wrap align="center">
                    <TextBox label="Customer" value="Ada" />
                    <Button text="Load orders" tone="accent" onclick={load} />
                </Stack>
            </Panel>
            <LoadPanel target={() => panel} message="Loading orders" delay={200} x-model={() => s.loading} />
            <output class="lp-result">{() => s.result}</output>
        </Stack>
    );
}
```

## Covering the page, with Cancel

```tsx
import { reactive } from '@motifx/core';
import { Button, LoadPanel, Stack } from '@motifx-community/ui';

/** Over the whole page, with a Cancel button: the work stops when it is pressed (or on Escape). */
export default function Page() {
    const s = reactive({ told: '' });
    let timer: ReturnType<typeof setTimeout> | null = null;
    const panel = new LoadPanel({
        message: 'Building the report…',
        cancelable: true,
        onCancel: () => {
            if (timer) clearTimeout(timer);
            timer = null;
            s.told = 'Cancelled.';
        }
    });
    const start = () => {
        s.told = '';
        panel.show();
        timer = setTimeout(() => {
            timer = null;
            panel.hide();
            s.told = 'The report is ready.';
        }, 4000);
    };
    return (
        <Stack orientation="horizontal" wrap align="center">
            <Button text="Build the report" variant="outline" onclick={start} />
            <span onConfig={c => c.controls.add(panel)} />
            <output class="lp-told">{() => s.told}</output>
        </Stack>
    );
}
```

## Shade, panel and indicator

```tsx
import { reactive } from '@motifx/core';
import { Button, LoadPanel, Panel, Stack } from '@motifx-community/ui';

/** Without the shade, the panel or the indicator. A click on the shade can hide it. */
export default function Options() {
    const s = reactive({ clear: false, bare: false, words: false });
    let clear!: Panel;
    let bare!: Panel;
    let words!: Panel;
    const flash = (key: 'clear' | 'bare' | 'words') => {
        s[key] = true;
        setTimeout(() => (s[key] = false), 2500);
    };
    return (
        <Stack orientation="horizontal" wrap align="center" style="inline-size: 100%">
            <Panel variant="outline" padding="md" style="min-inline-size: 16rem; min-block-size: 9rem" ref={(c: Panel) => (clear = c)}>
                <Button text="No shade" variant="outline" onclick={() => flash('clear')} />
            </Panel>
            <LoadPanel target={() => clear} shade={false} x-model={() => s.clear} closeOnOutside />
            <Panel variant="outline" padding="md" style="min-inline-size: 16rem; min-block-size: 9rem" ref={(c: Panel) => (bare = c)}>
                <Button text="No pane" variant="outline" onclick={() => flash('bare')} />
            </Panel>
            <LoadPanel target={() => bare} showPane={false} x-model={() => s.bare} />
            <Panel variant="outline" padding="md" style="min-inline-size: 16rem; min-block-size: 9rem" ref={(c: Panel) => (words = c)}>
                <Button text="Words only" variant="outline" onclick={() => flash('words')} />
            </Panel>
            <LoadPanel target={() => words} showIndicator={false} message="Please wait" x-model={() => s.words} />
        </Stack>
    );
}
```

## Behavior

| Topic | Details |
| --- | --- |
| `Covering a container` | The panel is placed inside the container, above its content. The container gets `aria-busy`, and the content under the panel is inert, so it cannot be clicked or focused. |
| `Over the page` | Without a `target`, the panel covers the viewport and the rest of the page is inert. |
| `Focus` | Focus moves from the content underneath to the panel (to the Cancel button if there is one) and returns to its original position when the panel hides. |
| `Delay` | Quick operations show nothing. The panel appears after `delay`, and hiding it before then cancels it. |
| `Spinner.cover` | The kit spinner can cover a container with a single call (`Spinner.cover`). LoadPanel is the full component, with the panel, message, delay and button. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Pane` | A `status` region. The message is announced when the panel appears and when it changes. |
| `Indicator` | Decorative. The message describes what is happening. |
| `Under it` | `inert` and `aria-busy`, so screen readers skip the content and it cannot receive clicks or focus. |
| `Cancel` | A kit button named in the kit language. Escape activates it. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-load-panel` | The layer. `data-shade`, `data-pane`, `data-page`. |
| `.mx-load-panel__pane` | The panel. |
| `.mx-load-panel__indicator, .mx-load-panel__message, .mx-load-panel__cancel` | The spinner, the message and the button. |

### Component tokens

| Token | Description |
| --- | --- |
| `load-panel.shade, .pane, .message` | Units: the layer (`shaded`), the panel (`shown`) and the message. |
| `load-panel.cancel` | Place: the appearance of the Cancel button (`variant`). |
| `load-panel.padding, .gap` | The minimum distance to the edge of the covered area, and the space between the indicator, message and button. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `target` | `Bind<ComponentBase \| HTMLElement \| null>` | `null` | The area to cover, a component or element. `null` covers the whole page. |
| `message` | `Bind<string>` | The kit string “Loading…” | The message below the indicator. This is the same property as `text`. |
| `value` | `Bind<boolean>` | `false` | Indicates whether the panel is shown. `x-model` provides two-way binding. |
| `delay` | `Bind<number>` | `0` | The delay in milliseconds before it appears. Hiding it before then shows nothing. |
| `shade` | `Bind<boolean>` | `true` | Dims the covered area. |
| `showPane` | `Bind<boolean>` | `true` | Shows the box behind the indicator and the message. |
| `showIndicator` | `Bind<boolean>` | `true` | Shows the rotating indicator (the kit spinner). |
| `cancelable` | `Bind<boolean>` | `false` | Shows a Cancel button in the panel. Escape activates it too. |
| `cancelText` | `Bind<string>` | The kit string “Cancel” | The button text. |
| `closeOnOutside` | `Bind<boolean>` | `false` | Clicking the shade hides the panel. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onShown, onHidden` | event | Occur when the panel appears (after its delay) and when it is hidden. |
| `onCancel` | event | Occurs when the Cancel button or Escape is pressed. The panel hides afterward. |
| `show(), hide(), cancel()` | `boolean` / `void` | Programmatic control. `show()` returns `false` while the panel is shown or waiting for its delay. |
| `isShown` | read-only | Indicates whether the panel is currently on screen. |
| `spinner, cancelButton` | read-only | The kit spinner and button in the panel. |
