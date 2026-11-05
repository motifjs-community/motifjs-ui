import { read, type Bind, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { put, shown } from "../../core/draw-parts";
import type { IconSource } from "../../core/icon-source";
import { PanelContent } from "../tabs/PanelContent";
import type { Wizard } from "./Wizard";
import type { WizardStepProps } from "./wizard-step-props";

const OWN = ['description', 'key', 'icon', 'optional', 'error', 'lazy', 'keepAlive', 'validateFields'] as const;
const TOLD = ['text', 'description', 'key', 'icon', 'optional', 'error', 'enabled'] as const;

/**
 * One step of a {@link Wizard}: its entry in the stepper and its page. The JSX children are the page, built when
 * the step is first shown (see `lazy`); `content` makes it from code.
 *
 * @example
 * <Wizard>
 *   <WizardStep title="Account"><TextBox label="E-mail" required /></WizardStep>
 *   <WizardStep title="Done" content={() => new Summary()} />
 * </Wizard>
 */
export class WizardStep extends Control<HTMLDivElement, WizardStepProps> {
    content: PanelContent;
    validate: (() => boolean | Promise<boolean>) | null;
    owner: Wizard | null = null;

    constructor(props?: IBaseProp<WizardStepProps>) {
        super('div', props);
        const own = (this.props ?? {}) as WizardStepProps;
        this.element.classList.add('mx-wizard__page');
        this.element.setAttribute('role', 'group');
        shown(this.element, false);
        this.content = new PanelContent(this, this.childs ?? [], own.content);
        this.validate = own.validate ?? null;
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.title !== undefined) this.bindProperty('text', own.title);
        this.observeProperty<string>('text', title => put(this.element, 'aria-label', title || null));
        for (const name of TOLD) this.observeProperty(name, () => this.owner?.stepsChanged());
    }

    // Properties (see WizardStepProps).

    get title(): string {
        return this.text;
    }
    set title(value: Bind<string>) {
        this.text = value;
    }
    get description(): string {
        return this.getProperty<string | undefined>('description') ?? '';
    }
    set description(value: Bind<string>) {
        this.assignProperty('description', value);
    }
    // The `key` prop, also when written as the JSX `key` (which arrives as `indexkey`).
    get key(): string | undefined {
        const own = this.getProperty<string | undefined>('key');
        if (own !== undefined) {
            return own;
        }
        const jsx = read((this.props as { indexkey?: Bind<unknown> } | undefined)?.indexkey);
        return jsx === undefined || jsx === null ? undefined : String(jsx);
    }
    set key(value: Bind<string>) {
        this.assignProperty('key', value);
    }
    get icon(): IconSource | null {
        return this.getProperty<IconSource | null | undefined>('icon') ?? null;
    }
    set icon(value: Bind<IconSource | null | undefined>) {
        this.assignProperty('icon', value);
    }
    get optional(): boolean {
        return !!this.getProperty<boolean>('optional');
    }
    set optional(value: Bind<boolean>) {
        this.assignProperty('optional', value);
    }
    get error(): boolean {
        return !!this.getProperty<boolean>('error');
    }
    set error(value: Bind<boolean>) {
        this.assignProperty('error', value);
    }
    get lazy(): boolean | undefined {
        return this.getProperty<boolean | undefined>('lazy');
    }
    set lazy(value: Bind<boolean | undefined>) {
        this.assignProperty('lazy', value);
    }
    get keepAlive(): boolean | undefined {
        return this.getProperty<boolean | undefined>('keepAlive');
    }
    set keepAlive(value: Bind<boolean | undefined>) {
        this.assignProperty('keepAlive', value);
    }
    get validateFields(): boolean {
        return this.getProperty<boolean | undefined>('validateFields') !== false;
    }
    set validateFields(value: Bind<boolean>) {
        this.assignProperty('validateFields', value);
    }

    /** Whether this is the wizard's current step. */
    get isCurrent(): boolean {
        return this.owner?.currentStep === this;
    }

    /** The wizard the step is in. */
    get wizard(): Wizard | null {
        return this.owner;
    }
}
