# LoadPanel

> Feedback · @motifx-community/ui 0.1.0-beta.2

A “loading” layer over a container or the whole page: a shade, a pane with the kit’s spinner and a message, a Cancel button when the work can be stopped. Nothing under it can be used meanwhile, and focus comes back afterwards.

## Import

```tsx
import { LoadPanel } from '@motifx-community/ui';
```

## Over a container

`target` names the component or element it covers; `value` (or `x-model`) shows and hides it, `show()` and `hide()` from code. `delay` keeps quick work from flashing it.

```tsx
import { reactive } from '@motifx/core';
import { Button, LoadPanel, Panel, Stack, TextBox } from '@motifx-community/ui';

/** A load panel over a panel while its orders load: bound with x-model, shown after a short delay. */
export default function Container() {
    const s = reactive({ loading: false, result: '' });
    let panel!: Panel;

    // Stands in for a call to the server.
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

## Over the page, with Cancel

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

## Shade, pane and indicator

```tsx
import { reactive } from '@motifx/core';
import { Button, LoadPanel, Panel, Stack } from '@motifx-community/ui';

/** Without the shade, without the pane, without the indicator; a press on the shade may hide it. */
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

## Behaviour

| Topic | How |
| --- | --- |
| `Over a container` | It goes inside the container, over everything in it; the container is `aria-busy` and what is under the panel is inert: nothing there can be pressed or focused. |
| `Over the page` | Without a `target`, it covers the viewport and the rest of the page is inert. |
| `Focus` | Focus that was under it waits on the panel (on the Cancel button when there is one) and goes back where it was when the panel hides. |
| `Delay` | Quick work shows nothing: it comes after `delay`, and a hide before that cancels it. |
| `Spinner.cover` | The kit’s spinner covers a container from code in one call (`Spinner.cover`); the load panel is the component with the pane, the message, the delay and the button. |

## Accessibility

| Topic | How |
| --- | --- |
| `Pane` | A `status` region: the message is read when the panel appears, and again when it changes. |
| `Indicator` | Decorative; the message says what is going on. |
| `Under it` | `inert` and `aria-busy`, so readers skip it and nothing there takes a press or focus. |
| `Cancel` | The kit’s button, named in the kit language; Escape presses it. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-load-panel` | The layer. `data-shade`, `data-pane`, `data-page`. |
| `.mx-load-panel__pane` | The pane. |
| `.mx-load-panel__indicator, .mx-load-panel__message, .mx-load-panel__cancel` | The spinner, the message and the button. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `load-panel.shade, .pane, .message` | Units: the layer (`shaded`), the pane (`shown`), the message. |
| `load-panel.cancel` | Place: the Cancel button’s look (`variant`). |
| `load-panel.padding, .gap` | The least space to the edge of what it covers; the space between the indicator, the message and the button. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `target` | `Bind<ComponentBase \| HTMLElement \| null>` | `null` | What it covers: a component or an element; `null` covers the whole page. |
| `message` | `Bind<string>` | the kit’s “Loading…” | The message under the indicator. The same property as `text`. |
| `value` | `Bind<boolean>` | `false` | Shown or not; `x-model` binds it two-way. |
| `delay` | `Bind<number>` | `0` | Milliseconds before it shows; a hide before that shows nothing. |
| `shade` | `Bind<boolean>` | `true` | Dims what it covers. |
| `showPane` | `Bind<boolean>` | `true` | The box behind the indicator and the message. |
| `showIndicator` | `Bind<boolean>` | `true` | The turning indicator (the kit’s spinner). |
| `cancelable` | `Bind<boolean>` | `false` | A Cancel button in the pane; Escape presses it too. |
| `cancelText` | `Bind<string>` | the kit’s “Cancel” | The button’s text. |
| `closeOnOutside` | `Bind<boolean>` | `false` | A press on the shade hides it. |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onShown, onHidden` | event | It came on the screen (after its delay); it went. |
| `onCancel` | event | The Cancel button was pressed, or Escape; the panel hides after. |
| `show(), hide(), cancel()` | `boolean` / `void` | From code; `show()` is `false` while it is shown or waiting for its delay. |
| `isShown` | read-only | Whether it is on the screen now. |
| `spinner, cancelButton` | read-only | The kit’s spinner and button in the pane. |
