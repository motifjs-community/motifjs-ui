import { Component, Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import type { ControlSize } from "../../core/control-size";
import { part } from "../../core/draw-parts";
import { onLanguage } from "../../core/on-language";
import { kept, put } from "../../core/part-writes";
import { uiLocale } from "../../core/ui-locale";
import { validateFields } from "../../parts/validation/validate-fields";
import { Button } from "../button/Button";
import type { StepChangedEventArgs } from "./step-changed-event-args";
import type { StepChangingEventArgs } from "./step-changing-event-args";
import { Stepper } from "./Stepper";
import type { StepperItem } from "./stepper-item";
import type { StepperLabelPosition } from "./stepper-label-position";
import type { StepperOrientation } from "./stepper-orientation";
import type { WizardFinishingEventArgs } from "./wizard-finishing-event-args";
import type { WizardProps } from "./wizard-props";
import { WizardStep } from "./WizardStep";

const OWN = ['value', 'linear', 'orientation', 'labelPosition', 'size', 'showStepper', 'clickable', 'showNavigation', 'lazy', 'keepAlive', 'previousText', 'nextText', 'finishText', 'label'] as const;

/**
 * A task in steps: a `Stepper` above or next to one page per step, with Back and Next buttons below them. Next
 * validates the page first: the kit fields on it, and then the step's own `validate`. A page that fails keeps the
 * wizard on it and marks its step. On the last step, Next finishes (`onFinishing`, `onFinished`). The steps are
 * `WizardStep` objects, from JSX or from `steps`, and the current one is `value` (`x-model`).
 *
 * @example
 * <Wizard onFinished={() => this.save()}>
 *   <WizardStep title="Account"><TextBox label="E-mail" required /></WizardStep>
 *   <WizardStep title="Address"><TextBox label="City" required /></WizardStep>
 *   <WizardStep title="Review"><p>All set.</p></WizardStep>
 * </Wizard>
 *
 * new Wizard({ steps: [{ title: 'Account', content: () => new AccountPage() }, { title: 'Done', content: () => new DonePage() }] });
 */
export class Wizard extends Control<HTMLDivElement, WizardProps> {
    stepper: Stepper;
    pages: Component<HTMLDivElement>;
    bar: Component<HTMLDivElement>;
    previousButton: Button;
    nextButton: Button;
    steps: WizardStep[] = [];
    finishing = new Emitter<WizardFinishingEventArgs>();
    finished = new Emitter<{ source: Wizard }>();
    // The last page passed and the wizard finished: every step is drawn done.
    done = false;
    shownStep: WizardStep | null = null;
    ready = false;

    constructor(props?: IBaseProp<WizardProps>) {
        super('div', props);
        const own = (this.props ?? {}) as WizardProps;
        this.class.add('mx-wizard');
        this.stepper = new Stepper({ items: [] });
        this.stepper.class.add('mx-wizard__stepper');
        this.controls.add(this.stepper);
        this.pages = part(this, 'div', 'mx-wizard__pages');
        this.bar = part(this, 'div', 'mx-wizard__bar');
        this.previousButton = new Button({ text: uiLocale.strings.wizardPrevious });
        this.previousButton.class.add('mx-wizard__previous');
        this.nextButton = new Button({ text: uiLocale.strings.wizardNext });
        this.nextButton.class.add('mx-wizard__next');
        this.bar.controls.add(this.previousButton, this.nextButton);
        void this.previousButton.motif.on('click', () => void this.previous());
        void this.nextButton.motif.on('click', () => void this.next());

        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onStepChanging) this.stepper.onStepChanging(own.onStepChanging);
        if (own.onStepChanged) this.stepper.onStepChanged(own.onStepChanged);
        if (own.onFinishing) this.finishing.event(own.onFinishing);
        if (own.onFinished) this.finished.event(own.onFinished);

        this.observeProperty<string | number | null>('value', value => (this.stepper.value = value ?? (value === null ? null : 0)));
        this.observeProperty<boolean>('linear', linear => (this.stepper.linear = linear !== false));
        this.observeProperty<StepperOrientation>('orientation', o => {
            this.stepper.orientation = o ?? 'horizontal';
            put(this, 'data-orientation', o ?? 'horizontal');
        });
        this.observeProperty<StepperLabelPosition>('labelPosition', p => (this.stepper.labelPosition = p ?? 'bottom'));
        this.observeProperty<ControlSize>('size', size => (this.stepper.size = size ?? 'md'));
        this.observeProperty<boolean>('clickable', clickable => (this.stepper.clickable = clickable !== false));
        this.observeProperty<string>('label', label => (this.stepper.label = label ?? ''));
        this.observeProperty<boolean>('showStepper', show => kept(this.stepper, show !== false));
        this.observeProperty<boolean>('showNavigation', show => kept(this.bar, show !== false));
        for (const name of ['previousText', 'nextText', 'finishText'] as const) this.observeProperty(name, () => this.drawBar());
        onLanguage(this, () => this.drawBar());

        // Going forward asks the page first; the app's own onStepChanging has already spoken.
        this.stepper.guard = e => (e.to > e.from ? this.leaveCheck() : true);
        this.stepper.onStepChanged(e => this.stepChanged(e));

        for (const child of this.childs ?? []) if (child instanceof WizardStep) this.add(child);
        for (const stepProps of own.steps ?? []) this.add(new WizardStep(stepProps));
        this.motif.setDisposable(() => {
            this.finishing.dispose();
            this.finished.dispose();
        });
        this.ready = true;
        this.stepsChanged();
        this.showPage();
    }

    // Properties (see WizardProps).

    get value(): string | number | null {
        const value = this.getProperty<string | number | null | undefined>('value');
        return value === undefined ? 0 : value;
    }
    set value(value: Bind<string | number | null>) {
        this.assignProperty('value', value);
    }
    get linear(): boolean {
        return this.getProperty<boolean | undefined>('linear') !== false;
    }
    set linear(value: Bind<boolean>) {
        this.assignProperty('linear', value);
    }
    get orientation(): StepperOrientation {
        return this.getProperty<StepperOrientation | undefined>('orientation') ?? 'horizontal';
    }
    set orientation(value: Bind<StepperOrientation>) {
        this.assignProperty('orientation', value);
    }
    get labelPosition(): StepperLabelPosition {
        return this.getProperty<StepperLabelPosition | undefined>('labelPosition') ?? 'bottom';
    }
    set labelPosition(value: Bind<StepperLabelPosition>) {
        this.assignProperty('labelPosition', value);
    }
    get size(): ControlSize {
        return this.getProperty<ControlSize | undefined>('size') ?? 'md';
    }
    set size(value: Bind<ControlSize>) {
        this.assignProperty('size', value);
    }
    get showStepper(): boolean {
        return this.getProperty<boolean | undefined>('showStepper') !== false;
    }
    set showStepper(value: Bind<boolean>) {
        this.assignProperty('showStepper', value);
    }
    get clickable(): boolean {
        return this.getProperty<boolean | undefined>('clickable') !== false;
    }
    set clickable(value: Bind<boolean>) {
        this.assignProperty('clickable', value);
    }
    get showNavigation(): boolean {
        return this.getProperty<boolean | undefined>('showNavigation') !== false;
    }
    set showNavigation(value: Bind<boolean>) {
        this.assignProperty('showNavigation', value);
    }
    get lazy(): boolean {
        return this.getProperty<boolean | undefined>('lazy') !== false;
    }
    set lazy(value: Bind<boolean>) {
        this.assignProperty('lazy', value);
    }
    get keepAlive(): boolean {
        return this.getProperty<boolean | undefined>('keepAlive') !== false;
    }
    set keepAlive(value: Bind<boolean>) {
        this.assignProperty('keepAlive', value);
    }
    get previousText(): string {
        return this.getProperty<string | undefined>('previousText') ?? '';
    }
    set previousText(value: Bind<string>) {
        this.assignProperty('previousText', value);
    }
    get nextText(): string {
        return this.getProperty<string | undefined>('nextText') ?? '';
    }
    set nextText(value: Bind<string>) {
        this.assignProperty('nextText', value);
    }
    get finishText(): string {
        return this.getProperty<string | undefined>('finishText') ?? '';
    }
    set finishText(value: Bind<string>) {
        this.assignProperty('finishText', value);
    }
    get label(): string {
        return this.getProperty<string | undefined>('label') ?? '';
    }
    set label(value: Bind<string>) {
        this.assignProperty('label', value);
    }

    /** Occurs before the current step changes (the stepper event). `cancel` keeps it, and `promise` waits. */
    get onStepChanging(): MotifEvent<StepChangingEventArgs> {
        return this.stepper.onStepChanging;
    }

    /** Occurs after the current step changes (the stepper event). */
    get onStepChanged(): MotifEvent<StepChangedEventArgs> {
        return this.stepper.onStepChanged;
    }

    /**
     * Occurs when the last page is valid and the wizard is about to finish. `cancel` keeps it open, and `promise`
     * waits.
     */
    get onFinishing(): MotifEvent<WizardFinishingEventArgs> {
        return this.finishing.event;
    }

    /** Occurs when the wizard finishes. */
    get onFinished(): MotifEvent<{ source: Wizard }> {
        return this.finished.event;
    }

    /** The step of the current page, or `null` if there is none. */
    get currentStep(): WizardStep | null {
        return this.steps[this.stepper.selectedIndex] ?? null;
    }

    /** The index of the current step, or -1 if there is none. */
    get selectedIndex(): number {
        return this.stepper.selectedIndex;
    }

    /** Indicates that the current step is the last one that can be reached, so Next finishes. */
    get isLast(): boolean {
        return this.stepper.selectedIndex >= 0 && !this.stepper.canGoNext;
    }

    /** Indicates that the wizard has finished (`finish()` passed). */
    get isFinished(): boolean {
        return this.done;
    }

    // Methods.

    /** Adds a step at the end. */
    add(step: WizardStep): WizardStep {
        return this.insert(this.steps.length, step);
    }

    /** Adds a step at `index`. */
    insert(index: number, step: WizardStep): WizardStep {
        if (step.owner === this) {
            return step;
        }
        step.owner?.remove(step);
        const at = Math.max(0, Math.min(index, this.steps.length));
        this.steps.splice(at, 0, step);
        this.pages.controls.add(at, step);
        step.owner = this;
        this.stepsChanged();
        this.showPage();
        return step;
    }

    /** Removes a step and disposes it. */
    remove(step: WizardStep): boolean {
        const at = this.steps.indexOf(step);
        if (at < 0) {
            return false;
        }
        this.steps.splice(at, 1);
        step.owner = null;
        if (this.shownStep === step) {
            this.shownStep = null;
        }
        this.pages.controls.remove(step);
        this.stepsChanged();
        this.showPage();
        return true;
    }

    /** Validates the page and moves to the next step. On the last step, it finishes. */
    next(): Promise<boolean> {
        return this.isLast ? this.finish() : this.stepper.next();
    }

    /** Moves back a step, without validation. */
    previous(): Promise<boolean> {
        return this.stepper.previous();
    }

    /** Moves to a step by index or key. Moving forward validates the page. */
    goTo(step: number | string): Promise<boolean> {
        return this.stepper.goTo(step);
    }

    /**
     * Validates the page, raises `onFinishing`, and then finishes: every step is shown as done and `onFinished` is
     * raised.
     */
    async finish(): Promise<boolean> {
        if (!(await this.leaveCheck()) || this.isDisposed) {
            return false;
        }
        const args: WizardFinishingEventArgs = { cancel: false, source: this };
        this.finishing.fire(args);
        if (args.cancel) {
            return false;
        }
        if (args.promise && (!(await args.promise.catch(() => false)) || this.isDisposed)) {
            return false;
        }
        this.done = true;
        this.stepsChanged();
        this.finished.fire({ source: this });
        return true;
    }

    /**
     * Validates the current page as Next does: the kit fields on it, and then the step's own `validate`. The step is
     * marked when it fails.
     */
    async leaveCheck(): Promise<boolean> {
        const step = this.currentStep;
        if (!step) {
            return true;
        }
        let ok = true;
        if (step.validateFields) {
            ok = (await validateFields(step, { focus: true })).valid;
        }
        if (ok && step.validate) {
            ok = await step.validate();
        }
        if (step.error !== !ok) {
            step.error = !ok;
        }
        return ok;
    }

    /** Recreates the stepper's items from the steps, after a step changed, was added or was removed. */
    stepsChanged(): void {
        if (!this.ready) {
            return;
        }
        const items: StepperItem[] = this.steps.map(step => ({
            text: step.text,
            description: step.description,
            key: step.key,
            icon: step.icon,
            optional: step.optional,
            enabled: step.enabled,
            status: step.error ? 'error' : this.done ? 'done' : null,
            data: step
        }));
        this.stepper.items = items;
        this.drawBar();
    }

    stepChanged(e: StepChangedEventArgs): void {
        // A value that names no step stays as it was given.
        const value = e.index >= 0 ? this.stepper.valueAt(e.index) : this.stepper.value;
        this.changeProperty('value', value);
        // `x-model` takes the step back.
        this.bindings.writeModel(value);
        this.showPage();
        this.drawBar();
    }

    // The page of the current step is shown, built on its first show; the one left is hidden, or released.
    showPage(): void {
        if (!this.ready) {
            return;
        }
        const step = this.currentStep;
        if (this.shownStep && this.shownStep !== step) {
            kept(this.shownStep, false);
            if (!this.keepAliveOf(this.shownStep)) {
                this.shownStep.content.release();
            }
        }
        this.shownStep = step;
        if (!step) {
            return;
        }
        step.content.build();
        kept(step, true);
        for (const other of this.steps) {
            if (other !== step && !this.lazyOf(other) && !other.content.isBuilt) {
                other.content.build();
            }
        }
    }

    drawBar(): void {
        if (!this.ready) {
            return;
        }
        const strings = uiLocale.strings;
        const previous = this.peekProperty<string>('previousText') || strings.wizardPrevious;
        const next = this.isLast ? this.peekProperty<string>('finishText') || strings.wizardFinish : this.peekProperty<string>('nextText') || strings.wizardNext;
        if (this.previousButton.text !== previous) {
            this.previousButton.text = previous;
        }
        if (this.nextButton.text !== next) {
            this.nextButton.text = next;
        }
        const canBack = this.stepper.canGoPrevious;
        if (this.previousButton.enabled !== canBack) {
            this.previousButton.enabled = canBack;
        }
        const canNext = this.stepper.selectedIndex >= 0;
        if (this.nextButton.enabled !== canNext) {
            this.nextButton.enabled = canNext;
        }
    }

    lazyOf(step: WizardStep): boolean {
        return step.lazy ?? this.peekProperty<boolean | undefined>('lazy') !== false;
    }

    keepAliveOf(step: WizardStep): boolean {
        return step.keepAlive ?? this.peekProperty<boolean | undefined>('keepAlive') !== false;
    }
}
