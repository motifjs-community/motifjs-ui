import type { Bind, IBaseProp } from '@motifx/core';
import { part } from '../../core/draw-parts';
import { put, text as writeText } from '../../core/part-writes';
import { ToggleField } from '../checkbox/ToggleField';
import type { SwitchProps } from './switch-props';
import type { SwitchStateText } from './switch-state-text';

const OWN = ['onText', 'offText', 'showStateText'] as const;

/**
 * An on / off switch: a native checkbox with `role="switch"`, drawn as a track with a sliding thumb.
 * Space and Enter toggle it, and `onText` / `offText` appear in the track or next to it.
 *
 * @example
 * <Switch label="&Wi-Fi" x-model={() => this.settings.wifi} />
 * <Switch label="Sync" onText="On" offText="Off" showStateText="beside" />
 *
 * const dark = new Switch({ label: 'Dark mode' });
 * this.panel.controls.add(dark);
 * dark.onValueChanged((e) => this.applyTheme(e.value));
 */
export class Switch extends ToggleField<boolean, SwitchProps> {
  constructor(props?: IBaseProp<SwitchProps>) {
    super(props);
    const own = (this.props ?? {}) as SwitchProps;
    this.class.add('mx-switch');
    this.controlPart.class.add('mx-switch__input');
    this.controlPart.attr.add({ role: 'switch' });

    const thumb = this.area('tools');
    thumb.class.add('mx-switch__thumb');
    thumb.attr.add({ 'aria-hidden': 'true' });
    // Both texts stay in place, one of them unseen, so the width does not jump when it flips.
    const text = this.area('actions');
    text.class.add('mx-switch__text');
    text.attr.add({ 'aria-hidden': 'true' });
    const on = part<HTMLSpanElement>(text, 'span', 'mx-switch__on');
    const off = part<HTMLSpanElement>(text, 'span', 'mx-switch__off');

    this.observeProperty<string>('onText', (value) => {
      writeText(on, value ?? '');
      this.renderStateText();
    });
    this.observeProperty<string>('offText', (value) => {
      writeText(off, value ?? '');
      this.renderStateText();
    });
    this.observeProperty('showStateText', () => this.renderStateText());
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);

    // Enter flips it as Space does; read-only keeps the value.
    this.controlPart.motif.on('keydown', (_, e) => {
      if (e.key !== 'Enter' || e.altKey || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      if (!this.peekProperty('readOnly')) this.commit(this.nextValue(), e);
    });
  }

  get onText(): string {
    return this.getProperty<string | undefined>('onText') ?? '';
  }
  set onText(value: Bind<string>) {
    this.assignProperty('onText', value);
  }
  get offText(): string {
    return this.getProperty<string | undefined>('offText') ?? '';
  }
  set offText(value: Bind<string>) {
    this.assignProperty('offText', value);
  }
  get showStateText(): SwitchStateText {
    return this.getProperty<SwitchStateText | undefined>('showStateText') ?? 'inside';
  }
  set showStateText(value: Bind<SwitchStateText>) {
    this.assignProperty('showStateText', value);
  }

  protected emptyValue(): boolean {
    return false;
  }

  protected override normalizeValue(value: boolean): boolean {
    return !!value;
  }

  /** `required` means it must be on. */
  protected override isEmptyValue(value: boolean): boolean {
    return value !== true;
  }

  protected renderValue(value: boolean): void {
    this.controlPart.attr.add({ checked: value });
    put(this, 'data-state', value ? 'checked' : 'unchecked');
  }

  protected nextValue(): boolean {
    return !this.peekValue();
  }

  private renderStateText(): void {
    const any = !!this.peekProperty('onText') || !!this.peekProperty('offText');
    put(this, 'data-state-text', any ? (this.peekProperty<SwitchStateText>('showStateText') ?? 'inside') : 'none');
  }
}
