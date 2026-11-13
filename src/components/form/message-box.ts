import { Application, Component, read, untracked } from '@motifx/core';
import { part } from '../../core/draw-parts';
import { cautionMark, dangerMark, infoMark, successMark } from '../../core/glyphs';
import { nextId } from '../../core/next-id';
import { pageBody } from '../../core/page-layer';
import { text as writeText } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import type { FormHost } from './form-host';
import type { FormResult } from './form-result';
import type { MessageBoxButton } from './message-box-button';
import type { MessageBoxOptions } from './message-box-options';
import type { MessageBoxTone } from './message-box-tone';
import { MxForm } from './MxForm';

const GLYPHS: Partial<Record<MessageBoxTone, () => Component<HTMLSpanElement>>> = {
  info: infoMark,
  success: successMark,
  caution: cautionMark,
  danger: dangerMark,
};

function buttonOf(button: NonNullable<MessageBoxOptions['buttons']>[number]): MessageBoxButton {
  if (typeof button !== 'string') return button;
  return { text: uiLocale.strings[button], result: button };
}

/**
 * Shows a modal message with its buttons and resolves with the result of the clicked button
 * (`'cancel'` for Escape when no button cancels). It is built on `MxForm`.
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
  body.class.add('mx-message-box');
  body.attr.add({ 'data-tone': tone });
  const glyph = GLYPHS[tone];
  if (glyph) {
    const icon = part<HTMLSpanElement>(body, 'span', 'mx-message-box__icon');
    icon.attr.add({ 'aria-hidden': 'true' });
    icon.controls.add(glyph());
  }
  const text = part<HTMLDivElement>(body, 'div', 'mx-message-box__text');
  const textId = nextId('message-text');
  text.attr.add({ id: textId });
  body.bindings.watch(() => {
    const value = read(options.text);
    untracked(() => writeText(text, value));
  });

  const row = new Component<HTMLDivElement>('div');
  row.class.add('mx-message-box__buttons');
  const form = new MxForm({
    title: options.title ?? '',
    content: body,
    footer: row,
    alert: tone === 'caution' || tone === 'danger',
    resizable: false,
    width: 'var(--_window-message-width)',
  });
  form.attr.add({ 'aria-describedby': textId });
  const made = buttons.map((b) => {
    const button = new Button({
      text: b.text,
      tone: b.tone ?? (b.result === accept ? (tone === 'danger' ? 'danger' : 'accent') : 'standard'),
    });
    button.motif.on('click', () => form.close(b.result));
    row.controls.add(button);
    return button;
  });
  form.acceptButton = made[results.indexOf(accept)] ?? null;
  form.cancelButton = cancel === undefined ? null : made[results.indexOf(cancel)];
  // Focus starts on the default button; in a danger box on the safe one.
  const first = tone === 'danger' && form.cancelButton ? form.cancelButton : form.acceptButton;
  first?.attr.add({ autofocus: '' });

  // No app: the page's body holds it, so the form mounts and takes focus.
  const host: FormHost = options.host ?? Application.main ?? pageBody(document);
  return form.showDialog(host);
}
