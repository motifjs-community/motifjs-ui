import { Application, Component, read, type ComponentBase } from '@motifx/core';
import { follow } from '../../core/follow';
import { cautionMark, dangerMark, infoMark, successMark } from '../../core/glyphs';
import { nextId } from '../../core/next-id';
import { uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import type { FormHost } from './form-host';
import type { FormResult } from './form-result';
import type { MessageBoxButton } from './message-box-button';
import type { MessageBoxOptions } from './message-box-options';
import type { MessageBoxTone } from './message-box-tone';
import { MxForm } from './MxForm';

const GLYPHS: Partial<Record<MessageBoxTone, () => HTMLSpanElement>> = {
  info: infoMark,
  success: successMark,
  caution: cautionMark,
  danger: dangerMark,
};

function buttonOf(button: NonNullable<MessageBoxOptions['buttons']>[number]): MessageBoxButton {
  if (typeof button !== 'string') return button;
  return { text: () => uiLocale.strings[button], result: button };
}

/**
 * Shows a modal message with its buttons and resolves with the result of the one pressed
 * (`'cancel'` for Escape when no button cancels). Built on `MxForm`.
 *
 * @example
 * const answer = await messageBox({ title: 'Unsaved changes', text: 'Save them first?', buttons: ['yes', 'no', 'cancel'], tone: 'caution' });
 */
export function messageBox(options: MessageBoxOptions): Promise<FormResult> {
  const tone = options.tone ?? 'none';
  const buttons = (options.buttons?.length ? options.buttons : (['ok'] as const)).map(buttonOf);
  const results = buttons.map((b) => b.result);
  const accept = options.defaultButton ?? results.find((r) => r === 'ok' || r === 'yes') ?? results[0];
  const cancel = results.find((r) => r === 'cancel') ?? results.find((r) => r === 'no') ?? (buttons.length === 1 ? results[0] : undefined);

  const body = new Component<HTMLDivElement>('div');
  body.element.className = 'mx-message-box';
  body.element.dataset.tone = tone;
  const glyph = GLYPHS[tone];
  if (glyph) {
    const icon = document.createElement('span');
    icon.className = 'mx-message-box__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.append(glyph());
    body.element.append(icon);
  }
  const text = document.createElement('div');
  text.className = 'mx-message-box__text';
  text.id = nextId('message-text');
  body.element.append(text);
  follow(body, 'text', () => read(options.text), (value) => (text.textContent = value));

  const row = new Component<HTMLDivElement>('div');
  row.element.className = 'mx-message-box__buttons';
  const form = new MxForm({
    title: options.title ?? '',
    content: body,
    footer: row,
    alert: tone === 'caution' || tone === 'danger',
    resizable: false,
    width: 'var(--_window-message-width)',
  });
  form.element.setAttribute('aria-describedby', text.id);
  const made = buttons.map((b) => {
    const button = new Button({
      text: b.text,
      tone: b.tone ?? (b.result === accept ? (tone === 'danger' ? 'danger' : 'accent') : 'standard'),
    });
    button.element.addEventListener('click', () => form.close(b.result));
    row.controls.add(button);
    return button;
  });
  form.acceptButton = made[results.indexOf(accept)] ?? null;
  form.cancelButton = cancel === undefined ? null : made[results.indexOf(cancel)];
  // Focus starts on the default button; in a danger box on the safe one.
  const first = tone === 'danger' && form.cancelButton ? form.cancelButton : form.acceptButton;
  first?.element.setAttribute('autofocus', '');

  let host: FormHost | null = options.host ?? Application.main ?? null;
  let holder: ComponentBase | null = null;
  if (!host) {
    // No app: a root of its own in the page, so the form mounts and takes focus.
    holder = new Component<HTMLDivElement>(document.body.appendChild(document.createElement('div')));
    holder.build();
    host = holder;
  }
  const done = form.showDialog(host);
  if (holder) {
    const own = holder;
    const place = own.element as HTMLElement;
    void done.then(async () => {
      await own.dispose();
      place.remove();
    });
  }
  return done;
}
