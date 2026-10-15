import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mount, tick } from '../../tests/helpers';
import { Button } from '../components/button/Button';
import { Label } from '../components/label/Label';
import { Stack } from '../components/stack/Stack';

// The controls written without JSX: fields, initializeComponent, getter props
// and core bindings, (sender, e) handlers and controls.add at any time.
class OrderView extends Component<HTMLDivElement> {
  data = reactive({ title: '&Orders', count: 0 });
  title = new Label({ textStyle: 'subtitle', text: () => this.data.title });
  add = new Button({ text: '&Add' });
  list = new Stack({ gap: 'xs' });

  override initializeComponent() {
    this.add.bindings.add('enabled', () => this.data.count < 2);
    this.add.motif.on('click', this.addClick);
    this.controls.add(this.title, this.add, this.list);
  }

  private addClick = (sender: Button, _e: MouseEvent) => {
    this.data.count++;
    const row = new Label({ text: `Order ${this.data.count}` });
    row.motif.on('click', () => row.dispose());
    this.list.controls.add(row);
    sender.text = `&Add (${this.data.count})`;
  };
}

let views: Component[] = [];

afterEach(async () => {
  for (const v of views.splice(0)) if (!v.isDisposed) await v.dispose();
  document.body.innerHTML = '';
});

describe('controls without JSX', () => {
  it('work with core bindings, handlers and controls.add', async () => {
    const view = mount(new OrderView());
    views.push(view);
    await tick();
    // A getter prop keeps `text` in sync: access key and all.
    expect(view.title.text).toBe('&Orders');
    expect(view.title.element.textContent).toBe('Orders');
    expect(view.title.element.getAttribute('aria-keyshortcuts')).toBe('Alt+O');
    view.data.title = 'Open &orders';
    await tick();
    expect(view.title.element.textContent).toBe('Open orders');

    view.add.element.click();
    await tick();
    expect(view.list.element.textContent).toBe('Order 1');
    expect(view.add.element.textContent).toBe('Add (1)');

    view.add.element.click();
    await tick();
    expect(view.add.enabled).toBe(false); // bound through core: count < 2
    expect(view.add.element.disabled).toBe(true);

    (view.list.element.firstElementChild as HTMLElement).click();
    expect(view.list.element.textContent).toBe('Order 2');
  });
});
