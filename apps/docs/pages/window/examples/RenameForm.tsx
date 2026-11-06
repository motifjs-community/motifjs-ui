import { reactive } from '@motifx/core';
import { Button, MxForm, Stack, TextBox } from '@motifx-community/ui';

/** A form written as a class: its content comes from `view()`, and its buttons from the footer. */
export class RenameForm extends MxForm {
  private readonly data = reactive({ name: 'Report.docx' });

  constructor() {
    super({ title: 'Rename', width: '24rem' });
    const ok = new Button({ text: 'Rename', tone: 'accent' });
    ok.element.addEventListener('click', () => this.close('ok'));
    const cancel = new Button({ text: 'Cancel' });
    cancel.element.addEventListener('click', () => this.close('cancel'));
    const buttons = new Stack({ orientation: 'horizontal', wrap: true, justify: 'end' });
    buttons.controls.add(ok, cancel);
    this.footer = buttons;
    this.acceptButton = ok;
    this.cancelButton = cancel;
  }

  get name(): string {
    return this.data.name;
  }

  override view() {
    return <TextBox label="&New name" x-model={() => this.data.name} stretch />;
  }
}
