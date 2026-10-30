import type { ComponentBase } from '@motifx/core';
import { Button } from '../../button/Button';
import type { FormHost } from '../../form/form-host';
import { MxForm } from '../../form/MxForm';
import { FormLayout } from '../../formlayout/FormLayout';
import { Stack } from '../../layout/Stack';
import type { SeriesScope } from '../model/series-scope';

/** What the question about a series shows. */
export interface SeriesQuestion {
  title: () => string;
  /** The question, which names the choices. */
  text: () => string;
  scopes: readonly SeriesScope[];
  label: (scope: SeriesScope) => string;
  ok: () => string;
  cancel: () => string;
  /** A delete: the answer's button warns. */
  danger: boolean;
  host: FormHost & ComponentBase;
}

/**
 * Asks what a change of an occurrence reaches: a modal form with the choices as radio buttons (the
 * first chosen, the arrows move, Enter answers, Escape cancels). Resolves with the choice, or `null`.
 */
export async function askSeriesScope(question: SeriesQuestion): Promise<SeriesScope | null> {
  // The form writes the choice here; it is read when the form closes. Its texts are read once: nothing in it follows anything.
  const data = { scope: question.scopes[0] as SeriesScope };
  const form = new MxForm({ title: question.title(), width: 'var(--_window-message-width)', modal: true, resizable: false });
  form.class.add('mx-scheduler__question');
  form.content = (
    <FormLayout
      data={data}
      items={[
        {
          field: 'scope',
          label: question.text(),
          editor: 'radio',
          editorProps: { items: question.scopes.map((scope) => ({ value: scope, text: question.label(scope) })) },
        },
      ]}
    />
  );
  let ok: Button | null = null;
  let cancel: Button | null = null;
  form.footer = (
    <Stack class="mx-scheduler__form-buttons" orientation="horizontal" wrap justify="end">
      <Button text={question.ok()} tone={question.danger ? 'danger' : 'accent'} ref={(b: Button) => (ok = b)} onclick={() => form.close('ok')} />
      <Button text={question.cancel()} ref={(b: Button) => (cancel = b)} onclick={() => form.close('cancel')} />
    </Stack>
  );
  form.acceptButton = ok;
  form.cancelButton = cancel;
  const result = await form.showDialog(question.host);
  return result === 'ok' ? data.scope : null;
}
