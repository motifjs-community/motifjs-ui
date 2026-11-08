import { Component } from "@motifx/core";
import { uiLocale } from "../../core/ui-locale";
import { Button } from "../../components/button/Button";
import { MxForm } from "../../components/form/MxForm";
import type { FormHost } from "../../components/form/form-host";
import { TextBox } from "../../components/textbox/TextBox";

/** Asks the customizer's user for a name: of a new group, or a new name for an item. */
export class NameForm extends MxForm {
    nameBox: TextBox;

    constructor(title: string, value: string) {
        super({ title, width: '22rem' });
        const s = uiLocale.strings;
        this.nameBox = new TextBox({ label: s.customizerName, value, stretch: true, selectOnFocus: true });
        const ok = new Button({ text: s.ok, tone: 'accent' });
        ok.element.addEventListener('click', () => this.close('ok'));
        const cancel = new Button({ text: s.cancel });
        cancel.element.addEventListener('click', () => this.close('cancel'));
        const footer = new Component<HTMLDivElement>('div');
        footer.element.className = 'mx-customizer__buttons';
        footer.controls.add(ok, cancel);
        this.content = this.nameBox;
        this.footer = footer;
        this.acceptButton = ok;
        this.cancelButton = cancel;
        this.onShown(() => this.nameBox.focus());
    }

    /** The name typed, or `null` when the user cancelled or left it empty. */
    async ask(host: FormHost): Promise<string | null> {
        const result = await this.showDialog(host);
        const text = String(this.nameBox.value ?? '').trim();
        return result === 'ok' && text ? text : null;
    }
}
