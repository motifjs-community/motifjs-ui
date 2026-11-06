import type { Bind, IBaseProp } from '@motifx/core';
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
    const input = this.inputElement;
    this.element.classList.add('mx-switch');
    input.classList.add('mx-switch__input');
    input.setAttribute('role', 'switch');

    const thumb = this.area('tools');
    thumb.classList.add('mx-switch__thumb');
    thumb.setAttribute('aria-hidden', 'true');
    // Both texts stay in place, one of them unseen, so the width does not jump when it flips.
    const text = this.area('actions');
    text.classList.add('mx-switch__text');
    text.setAttribute('aria-hidden', 'true');
    const on = text.appendChild(document.createElement('span'));
    on.className = 'mx-switch__on';
    const off = text.appendChild(document.createElement('span'));
    off.className = 'mx-switch__off';

    this.observeProperty<string>('onText', (value) => {
      on.textContent = value ?? '';
      this.renderStateText();
    });
    this.observeProperty<string>('offText', (value) => {
      off.textContent = value ?? '';
      this.renderStateText();
    });
    this.observeProperty('showStateText', () => this.renderStateText());
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);

    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || e.altKey || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      input.click();
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
    this.inputElement.checked = value;
    this.element.dataset.state = value ? 'checked' : 'unchecked';
  }

  protected nextValue(): boolean {
    return !this.peekValue();
  }

  private renderStateText(): void {
    const any = !!this.peekProperty('onText') || !!this.peekProperty('offText');
    this.element.dataset.stateText = any ? (this.peekProperty<SwitchStateText>('showStateText') ?? 'inside') : 'none';
  }
}
