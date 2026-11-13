import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { glyphPart, loose, part } from "../../core/draw-parts";
import { glyph } from "../../core/glyphs";
import { nextId } from "../../core/next-id";
import { onLanguage } from "../../core/on-language";
import { mark, put, shown, text } from "../../core/part-writes";
import { uiLocale } from "../../core/ui-locale";
import { Field } from "../../parts/field/Field";
import type { ValidationRule } from "../../parts/validation/validation-rule";
import { Button } from "../button/Button";
import { ProgressBar } from "../progress/ProgressBar";
import type { FileUploaderProps } from "./file-uploader-props";
import type { FilesAddedEventArgs } from "./files-added-event-args";
import type { UploadEventArgs } from "./upload-event-args";
import type { UploadItem } from "./upload-item";
import type { UploadMode } from "./upload-mode";
import type { UploadStatus } from "./upload-status";

const OWN = ['multiple', 'accept', 'maxFileSize', 'minFileSize', 'maxFiles', 'allowDrop', 'uploadMode', 'uploadUrl', 'uploadMethod', 'uploadHeaders', 'uploadField', 'chunkSize', 'selectText', 'dropText', 'uploadText', 'showFileList'] as const;

const PARTS = Symbol('mx.fileuploader');

interface Parts {
    selectPart: Component<HTMLButtonElement>;
    selectText: Component<HTMLSpanElement>;
    selectTextId: string;
    input: HTMLInputElement;
    inputPart: Component<HTMLInputElement>;
    dropPart: Component<HTMLSpanElement>;
    uploadPart: Component<HTMLButtonElement>;
    list: Component<HTMLUListElement> | null;
    rows: Map<UploadItem, Row>;
    items: UploadItem[];
    jobs: Map<UploadItem, AbortController>;
    dragDepth: number;
}

interface Row {
    li: Component<HTMLLIElement>;
    name: Component<HTMLSpanElement>;
    size: Component<HTMLSpanElement>;
    state: Component<HTMLSpanElement>;
    bar: ProgressBar;
    abort: Button;
    retry: Button;
    remove: Button;
}

/** The size of a file as a reader says it: 12 KB, 3.4 MB. */
function sizeText(bytes: number, locale: string): string {
    const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;
    let value = bytes;
    let at = 0;
    while (value >= 1000 && at < units.length - 1) {
        value /= 1000;
        at++;
    }
    return new Intl.NumberFormat(locale, { style: 'unit', unit: units[at], maximumFractionDigits: at === 0 ? 0 : 1 }).format(value);
}

/** Whether a file is of a kind `accept` names: an extension, a type, or a type family (`image/*`). */
function accepted(file: File, accept: string): boolean {
    const kinds = accept.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    if (!kinds.length) {
        return true;
    }
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return kinds.some(kind => {
        if (kind.startsWith('.')) return name.endsWith(kind);
        if (kind.endsWith('/*')) return type.startsWith(kind.slice(0, -1));
        return type === kind;
    });
}

/**
 * Files selected with a button or dropped on the box, listed with their size and state. They are uploaded on
 * selection (`uploadUrl`, whole or in chunks, or a custom `upload`), with an Upload button, or programmatically,
 * with progress, cancel, retry and remove on each one. `accept`, `maxFileSize`, `minFileSize` and `maxFiles` reject
 * files, and each one is listed with the reason. The value is the accepted files, and `x-model` provides two-way
 * binding.
 *
 * @example
 * <FileUploader label="Attachments" accept=".pdf,image/*" maxFileSize={5_000_000} uploadUrl="/api/files" x-model={() => this.form.files} />
 * <FileUploader label="Photo" multiple={false} upload={(file, report, signal) => this.api.send(file, report, signal)} />
 */
export class FileUploader extends Field<readonly File[], FileUploaderProps> {
    filesAdded = new Emitter<FilesAddedEventArgs>();
    fileRemoved = new Emitter<UploadEventArgs>();
    uploadStarted = new Emitter<UploadEventArgs>();
    progressed = new Emitter<UploadEventArgs>();
    uploaded = new Emitter<UploadEventArgs>();
    uploadFailed = new Emitter<UploadEventArgs>();
    uploadAborted = new Emitter<UploadEventArgs>();
    uploadWith: ((file: File, report: (fraction: number) => void, signal: AbortSignal) => Promise<unknown>) | null = null;

    constructor(props?: IBaseProp<FileUploaderProps>) {
        super(props);
        const own = (this.props ?? {}) as FileUploaderProps;
        this.class.add('mx-file-uploader');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        this.uploadWith = own.upload ?? null;
        if (own.onFilesAdded) this.filesAdded.event(own.onFilesAdded);
        if (own.onFileRemoved) this.fileRemoved.event(own.onFileRemoved);
        if (own.onUploadStarted) this.uploadStarted.event(own.onUploadStarted);
        if (own.onProgress) this.progressed.event(own.onProgress);
        if (own.onUploaded) this.uploaded.event(own.onUploaded);
        if (own.onUploadError) this.uploadFailed.event(own.onUploadError);
        if (own.onUploadAborted) this.uploadAborted.event(own.onUploadAborted);

        const parts = this.uploadParts;
        this.observeProperty<boolean>('multiple', on => {
            mark(parts.inputPart, 'multiple', on !== false);
            this.drawTexts();
        });
        this.observeProperty<string>('accept', accept => put(parts.inputPart, 'accept', accept || null));
        for (const name of ['text', 'selectText', 'dropText', 'uploadText', 'uploadMode', 'allowDrop'] as const) this.observeProperty(name, () => this.drawTexts());
        this.observeProperty<boolean>('showFileList', () => this.drawList());
        this.observeProperty<boolean>('readOnly', () => this.drawTexts());
        // A button may not carry aria-required (the field writes it on its control): the list says what is missing.
        this.observeProperty('required', () => put(parts.selectPart, 'aria-required', null));
        onLanguage(this, () => {
            this.drawTexts();
            this.drawList();
        });
        this.listen();
        this.motif.setDisposable(() => {
            for (const job of parts.jobs.values()) job.abort();
            this.filesAdded.dispose();
            this.fileRemoved.dispose();
            this.uploadStarted.dispose();
            this.progressed.dispose();
            this.uploaded.dispose();
            this.uploadFailed.dispose();
            this.uploadAborted.dispose();
        });
    }

    // Properties (see FileUploaderProps).

    get multiple(): boolean {
        return this.getProperty<boolean | undefined>('multiple') !== false;
    }
    set multiple(value: Bind<boolean>) {
        this.assignProperty('multiple', value);
    }
    get accept(): string {
        return this.getProperty<string | undefined>('accept') ?? '';
    }
    set accept(value: Bind<string>) {
        this.assignProperty('accept', value);
    }
    get maxFileSize(): number | null {
        return this.getProperty<number | null | undefined>('maxFileSize') ?? null;
    }
    set maxFileSize(value: Bind<number | null>) {
        this.assignProperty('maxFileSize', value);
    }
    get minFileSize(): number | null {
        return this.getProperty<number | null | undefined>('minFileSize') ?? null;
    }
    set minFileSize(value: Bind<number | null>) {
        this.assignProperty('minFileSize', value);
    }
    get maxFiles(): number | null {
        return this.getProperty<number | null | undefined>('maxFiles') ?? null;
    }
    set maxFiles(value: Bind<number | null>) {
        this.assignProperty('maxFiles', value);
    }
    get allowDrop(): boolean {
        return this.getProperty<boolean | undefined>('allowDrop') !== false;
    }
    set allowDrop(value: Bind<boolean>) {
        this.assignProperty('allowDrop', value);
    }
    get uploadMode(): UploadMode {
        return this.getProperty<UploadMode | undefined>('uploadMode') ?? (this.peekProperty('uploadUrl') || this.uploadWith ? 'instant' : 'manual');
    }
    set uploadMode(value: Bind<UploadMode>) {
        this.assignProperty('uploadMode', value);
    }
    get uploadUrl(): string | null {
        return this.getProperty<string | null | undefined>('uploadUrl') ?? null;
    }
    set uploadUrl(value: Bind<string | null>) {
        this.assignProperty('uploadUrl', value);
    }
    get uploadMethod(): string {
        return this.getProperty<string | undefined>('uploadMethod') || 'POST';
    }
    set uploadMethod(value: Bind<string>) {
        this.assignProperty('uploadMethod', value);
    }
    get uploadHeaders(): Record<string, string> | null {
        return this.getProperty<Record<string, string> | null | undefined>('uploadHeaders') ?? null;
    }
    set uploadHeaders(value: Bind<Record<string, string> | null>) {
        this.assignProperty('uploadHeaders', value);
    }
    get uploadField(): string {
        return this.getProperty<string | undefined>('uploadField') || 'file';
    }
    set uploadField(value: Bind<string>) {
        this.assignProperty('uploadField', value);
    }
    get chunkSize(): number | null {
        return this.getProperty<number | null | undefined>('chunkSize') ?? null;
    }
    set chunkSize(value: Bind<number | null>) {
        this.assignProperty('chunkSize', value);
    }
    get selectText(): string {
        return this.getProperty<string | undefined>('selectText') ?? '';
    }
    set selectText(value: Bind<string>) {
        this.assignProperty('selectText', value);
    }
    get dropText(): string {
        return this.getProperty<string | undefined>('dropText') ?? '';
    }
    set dropText(value: Bind<string>) {
        this.assignProperty('dropText', value);
    }
    get uploadText(): string {
        return this.getProperty<string | undefined>('uploadText') ?? '';
    }
    set uploadText(value: Bind<string>) {
        this.assignProperty('uploadText', value);
    }
    get showFileList(): boolean {
        return this.getProperty<boolean | undefined>('showFileList') !== false;
    }
    set showFileList(value: Bind<boolean>) {
        this.assignProperty('showFileList', value);
    }

    /** Every file in the list with its state, including rejected ones. */
    get items(): readonly UploadItem[] {
        return this.uploadParts.items;
    }

    /** Indicates that an upload is running. */
    get isUploading(): boolean {
        return this.uploadParts.jobs.size > 0;
    }

    get onFilesAdded(): MotifEvent<FilesAddedEventArgs> {
        return this.filesAdded.event;
    }
    get onFileRemoved(): MotifEvent<UploadEventArgs> {
        return this.fileRemoved.event;
    }
    get onUploadStarted(): MotifEvent<UploadEventArgs> {
        return this.uploadStarted.event;
    }
    get onProgress(): MotifEvent<UploadEventArgs> {
        return this.progressed.event;
    }
    get onUploaded(): MotifEvent<UploadEventArgs> {
        return this.uploaded.event;
    }
    get onUploadError(): MotifEvent<UploadEventArgs> {
        return this.uploadFailed.event;
    }
    get onUploadAborted(): MotifEvent<UploadEventArgs> {
        return this.uploadAborted.event;
    }

    // Methods.

    /** Opens the browser's file dialog, the same as the button. */
    openDialog(): void {
        if (this.isEnabled && !this.peekProperty('readOnly')) this.uploadParts.inputPart.attr.add({ click: true });
    }

    /**
     * Adds files as if the user selected them. The limits apply, `onFilesAdded` is raised, and uploads start according to
     * the mode.
     */
    addFiles(files: Iterable<File>, event?: Event): void {
        if (!this.isEnabled || this.peekProperty('readOnly')) {
            return;
        }
        const parts = this.uploadParts;
        const list = Array.from(files);
        if (!list.length) {
            return;
        }
        const taken = this.peekValue();
        const single = this.peekProperty<boolean | undefined>('multiple') === false;
        const accept = this.peekProperty<string>('accept') ?? '';
        const most = this.peekProperty<number | null>('maxFileSize') ?? null;
        const least = this.peekProperty<number | null>('minFileSize') ?? null;
        const room = this.peekProperty<number | null>('maxFiles') ?? null;
        const locale = uiLocale.locale;
        const kept: File[] = [];
        const refused: UploadItem[] = [];
        for (const file of single ? list.slice(0, 1) : list) {
            let message = '';
            if (accept && !accepted(file, accept)) message = uiLocale.text('fileWrongType', { name: file.name });
            else if (most !== null && file.size > most) message = uiLocale.text('fileTooLarge', { name: file.name, max: sizeText(most, locale) });
            else if (least !== null && file.size < least) message = uiLocale.text('fileTooSmall', { name: file.name, min: sizeText(least, locale) });
            else if (room !== null && !single && taken.length + kept.length >= room) message = uiLocale.text('fileTooMany', { count: room });
            if (message) refused.push({ file, status: 'invalid', progress: 0, response: null, message });
            else kept.push(file);
        }
        const args: FilesAddedEventArgs = { files: kept, refused, cancel: false, source: this };
        this.filesAdded.fire(args);
        if (args.cancel) {
            return;
        }
        const fresh: UploadItem[] = kept.map(file => ({ file, status: 'ready', progress: 0, response: null, message: '' }));
        if (single) {
            for (const item of parts.items) this.stop(item);
            parts.items = [];
        }
        parts.items.push(...fresh, ...refused);
        this.commit(single ? kept : [...taken, ...kept], event);
        this.drawList();
        if (this.uploadMode === 'instant') for (const item of fresh) void this.uploadItem(item);
    }

    /** Uploads the waiting files, or one of them. This is what `manual` mode calls. */
    upload(item?: UploadItem): Promise<void> {
        const waiting = item ? [item] : this.uploadParts.items.filter(i => i.status === 'ready' || i.status === 'error' || i.status === 'aborted');
        return Promise.all(waiting.map(i => this.uploadItem(i))).then(() => undefined);
    }

    /** Stops the upload of one file or of all files. The file remains, marked as canceled. */
    abort(item?: UploadItem): void {
        const parts = this.uploadParts;
        for (const i of item ? [item] : [...parts.jobs.keys()]) parts.jobs.get(i)?.abort();
    }

    /** Removes a file from the list and the value. A running upload is stopped. */
    remove(item: UploadItem, event?: Event): void {
        const parts = this.uploadParts;
        const at = parts.items.indexOf(item);
        if (at < 0) {
            return;
        }
        this.stop(item);
        parts.items.splice(at, 1);
        if (item.status !== 'invalid') this.commit(this.peekValue().filter(f => f !== item.file), event);
        this.fileRemoved.fire({ item, file: item.file, source: this });
        this.drawList();
    }

    /** Removes every file. */
    clear(): void {
        const parts = this.uploadParts;
        for (const item of parts.items) this.stop(item);
        parts.items = [];
        this.commit([]);
        this.drawList();
    }

    protected override get controlTag(): string {
        return 'button';
    }

    protected createControl(): ComponentBase {
        return this.uploadParts.selectPart;
    }

    protected emptyValue(): readonly File[] {
        return [];
    }

    protected override normalizeValue(value: readonly File[]): readonly File[] {
        return Array.isArray(value) ? value : [];
    }

    protected override sameValue(a: readonly File[], b: readonly File[]): boolean {
        return a === b || (a.length === b.length && a.every((f, i) => f === b[i]));
    }

    protected override isEmptyValue(value: readonly File[]): boolean {
        return value.length === 0;
    }

    protected renderValue(value: readonly File[]): void {
        // Files given from outside join the list as taken; those gone leave it.
        const parts = this.uploadParts;
        const known = new Set(parts.items.map(i => i.file));
        for (const file of value) if (!known.has(file)) parts.items.push({ file, status: 'ready', progress: 0, response: null, message: '' });
        const keep = new Set(value);
        parts.items = parts.items.filter(i => i.status === 'invalid' || keep.has(i.file));
        this.drawList();
    }

    protected override builtInRules(): ValidationRule<readonly File[]>[] {
        return super.builtInRules();
    }

    get uploadParts(): Parts {
        const self = this as unknown as { [PARTS]?: Parts };
        if (!self[PARTS]) {
            // The select button is the field's control; the others join the box after it (`listen`).
            const selectPart = loose<HTMLButtonElement>('button', 'mx-file-uploader__select');
            selectPart.attr.add({ type: 'button' });
            glyphPart(selectPart, 'upload');
            const selectText = part<HTMLSpanElement>(selectPart, 'span', 'mx-file-uploader__select-text');
            const selectTextId = nextId('file-uploader-text');
            selectText.attr.add({ id: selectTextId });
            const inputPart = loose<HTMLInputElement>('input', 'mx-file-uploader__input');
            const input = inputPart.element;
            inputPart.attr.add({ type: 'file', tabindex: '-1', 'aria-hidden': 'true', hidden: true });
            const dropPart = loose<HTMLSpanElement>('span', 'mx-file-uploader__drop');
            const uploadPart = loose<HTMLButtonElement>('button', 'mx-file-uploader__upload');
            uploadPart.attr.add({ type: 'button', hidden: true });
            self[PARTS] = {
                selectPart,
                selectText,
                selectTextId,
                input,
                inputPart,
                dropPart,
                uploadPart,
                list: null,
                rows: new Map(),
                items: [],
                jobs: new Map(),
                dragDepth: 0
            };
        }
        return self[PARTS];
    }

    listen(): void {
        const parts = this.uploadParts;
        this.boxPart.controls.add(parts.inputPart, parts.dropPart, parts.uploadPart);
        parts.selectPart.motif.on('click', () => this.openDialog());
        parts.uploadPart.motif.on('click', () => void this.upload());
        parts.inputPart.motif.on('change', (_, e) => {
            // browser object read: allowed exception
            this.addFiles(parts.input.files ?? [], e);
            parts.inputPart.attr.add({ value: '' });
        });
        const dropping = (e: DragEvent) => this.isEnabled && !this.peekProperty('readOnly') && this.peekProperty<boolean | undefined>('allowDrop') !== false && !!e.dataTransfer?.types.includes('Files');
        this.motif.on('dragenter', (_, e) => {
            if (!dropping(e)) return;
            e.preventDefault();
            parts.dragDepth++;
            mark(this, 'data-dragover', true);
        });
        this.motif.on('dragover', (_, e) => {
            if (!dropping(e)) return;
            e.preventDefault();
            e.dataTransfer!.dropEffect = 'copy';
        });
        this.motif.on('dragleave', () => {
            if (parts.dragDepth > 0) parts.dragDepth--;
            if (parts.dragDepth === 0) mark(this, 'data-dragover', false);
        });
        this.motif.on('drop', (_, e) => {
            parts.dragDepth = 0;
            mark(this, 'data-dragover', false);
            if (!dropping(e)) return;
            e.preventDefault();
            this.addFiles(e.dataTransfer!.files, e);
        });
    }

    drawTexts(): void {
        const parts = this.uploadParts;
        const strings = uiLocale.strings;
        const single = this.peekProperty<boolean | undefined>('multiple') === false;
        text(parts.selectText, this.peekProperty<string>('selectText') || (single ? strings.fileSelectOne : strings.fileSelect));
        // Named by the field's label and its own text, so a reader hears both and voice control finds it by what it shows.
        const labelId = this.labelId;
        put(parts.selectPart, 'aria-labelledby', labelId ? `${labelId} ${parts.selectTextId}` : parts.selectTextId);
        const canDrop = this.peekProperty<boolean | undefined>('allowDrop') !== false && !this.peekProperty('readOnly');
        text(parts.dropPart, this.peekProperty<string>('dropText') || (single ? strings.fileDropOne : strings.fileDrop));
        shown(parts.dropPart, canDrop);
        text(parts.uploadPart, this.peekProperty<string>('uploadText') || strings.fileUpload);
        shown(parts.uploadPart, this.uploadMode === 'button');
        mark(parts.selectPart, 'disabled', !!this.peekProperty('readOnly'));
    }

    // The list is drawn again from the items: a row per file, kept by the item.
    drawList(): void {
        const parts = this.uploadParts;
        const show = this.peekProperty<boolean | undefined>('showFileList') !== false && parts.items.length > 0;
        if (!show) {
            if (parts.list) shown(parts.list, false);
            return;
        }
        if (!parts.list) {
            parts.list = part<HTMLUListElement>(this, 'ul', 'mx-file-uploader__list');
        }
        shown(parts.list, true);
        const seen = new Set<UploadItem>();
        parts.items.forEach((item, index) => {
            let row = parts.rows.get(item);
            if (!row) {
                row = this.makeRow(item);
                parts.rows.set(item, row);
            }
            parts.list!.controls.insert(index, row.li);
            this.drawRow(item, row);
            seen.add(item);
        });
        for (const [item, row] of parts.rows) {
            if (!seen.has(item)) {
                parts.rows.delete(item);
                void row.li.dispose();
            }
        }
    }

    makeRow(item: UploadItem): Row {
        const li = new Component<HTMLLIElement>('li');
        li.class.add('mx-file-uploader__item');
        glyphPart(li, 'file', 'mx-file-uploader__icon');
        const texts = part(li, 'span', 'mx-file-uploader__texts');
        const name = part<HTMLSpanElement>(texts, 'span', 'mx-file-uploader__name');
        const size = part<HTMLSpanElement>(texts, 'span', 'mx-file-uploader__size');
        const state = part<HTMLSpanElement>(texts, 'span', 'mx-file-uploader__state');
        const bar = new ProgressBar({ size: 'sm', labelPosition: 'top' });
        bar.class.add('mx-file-uploader__progress');
        texts.controls.add(bar);
        const actions = part(li, 'span', 'mx-file-uploader__actions');
        const abort = new Button({ icon: glyph('dismiss'), variant: 'ghost', size: 'sm', onclick: () => this.abort(item) });
        const retry = new Button({ icon: glyph('undo'), variant: 'ghost', size: 'sm', onclick: () => void this.uploadItem(item) });
        // The press finishes (every listener of it) before the row goes: a microtask would run between the listeners.
        const remove = new Button({ icon: glyph('trash'), variant: 'ghost', size: 'sm', onclick: () => setTimeout(() => this.remove(item), 0) });
        for (const button of [abort, retry, remove]) button.class.add('mx-file-uploader__action');
        actions.controls.add(abort, retry, remove);
        text(name, item.file.name);
        return { li, name, size, state, bar, abort, retry, remove };
    }

    drawRow(item: UploadItem, row: Row): void {
        const strings = uiLocale.strings;
        const locale = uiLocale.locale;
        put(row.li, 'data-status', item.status);
        text(row.size, sizeText(item.file.size, locale));
        const stateText = item.status === 'uploading' ? uiLocale.text('fileUploading', { percent: Math.round(item.progress * 100) }) : item.status === 'done' ? strings.fileUploaded : item.status === 'aborted' ? strings.fileAborted : item.status === 'error' ? item.message || strings.fileFailed : item.status === 'invalid' ? item.message : '';
        text(row.state, stateText);
        shown(row.state, stateText !== '');
        shown(row.bar, item.status === 'uploading');
        if (item.status === 'uploading') {
            row.bar.value = Math.round(item.progress * 100);
            row.bar.label = item.file.name;
        }
        const canUpload = item.status !== 'invalid' && (this.peekProperty('uploadUrl') || this.uploadWith);
        shown(row.abort, item.status === 'uploading');
        shown(row.retry, !!canUpload && (item.status === 'error' || item.status === 'aborted'));
        shown(row.remove, item.status !== 'uploading' && !this.peekProperty('readOnly'));
        const abortName = uiLocale.text('fileAbort', { name: item.file.name });
        if (row.abort.hint !== abortName) row.abort.hint = abortName;
        if (row.retry.hint !== strings.retry) row.retry.hint = strings.retry;
        const removeName = uiLocale.text('removeItem', { text: item.file.name });
        if (row.remove.hint !== removeName) row.remove.hint = removeName;
    }

    setStatus(item: UploadItem, status: UploadStatus, progress = item.progress, message = ''): void {
        item.status = status;
        item.progress = progress;
        item.message = message;
        const row = this.uploadParts.rows.get(item);
        if (row) this.drawRow(item, row);
    }

    stop(item: UploadItem): void {
        this.uploadParts.jobs.get(item)?.abort();
    }

    async uploadItem(item: UploadItem): Promise<void> {
        const parts = this.uploadParts;
        if (item.status === 'uploading' || item.status === 'invalid' || !parts.items.includes(item)) {
            return;
        }
        const url = this.peekProperty<string | null>('uploadUrl') ?? null;
        if (!url && !this.uploadWith) {
            return;
        }
        const controller = new AbortController();
        parts.jobs.set(item, controller);
        this.setStatus(item, 'uploading', 0);
        const args = (error?: unknown): UploadEventArgs => ({ item, file: item.file, error, source: this });
        this.uploadStarted.fire(args());
        const report = (fraction: number) => {
            if (item.status !== 'uploading') return;
            this.setStatus(item, 'uploading', Math.max(0, Math.min(1, fraction)));
            this.progressed.fire(args());
        };
        try {
            item.response = this.uploadWith ? await this.uploadWith(item.file, report, controller.signal) : await this.send(item.file, url!, report, controller.signal);
            if (this.isDisposed) return;
            this.setStatus(item, 'done', 1);
            this.uploaded.fire(args());
        } catch (error) {
            if (this.isDisposed) return;
            if (controller.signal.aborted) {
                this.setStatus(item, 'aborted', 0);
                this.uploadAborted.fire(args(error));
            } else {
                this.setStatus(item, 'error', 0, error instanceof Error ? error.message : String(error ?? ''));
                this.uploadFailed.fire(args(error));
            }
        } finally {
            parts.jobs.delete(item);
        }
    }

    // The file goes to `url` in one request, or in chunks each with its Content-Range; the last answer is the response.
    async send(file: File, url: string, report: (fraction: number) => void, signal: AbortSignal): Promise<unknown> {
        const chunk = this.peekProperty<number | null>('chunkSize') ?? null;
        const size = chunk && chunk > 0 ? Math.min(chunk, file.size || 1) : file.size || 1;
        const pieces = Math.max(1, Math.ceil((file.size || 1) / size));
        let response: unknown = null;
        for (let i = 0; i < pieces; i++) {
            const start = i * size;
            const end = Math.min(file.size, start + size);
            const blob = pieces > 1 ? file.slice(start, end, file.type) : file;
            response = await this.request(url, blob, file, pieces > 1 ? { index: i, count: pieces, start, end: end - 1 } : null, loaded => report((start + loaded) / (file.size || 1)), signal);
        }
        return response;
    }

    request(url: string, blob: Blob, file: File, piece: { index: number; count: number; start: number; end: number } | null, loaded: (bytes: number) => void, signal: AbortSignal): Promise<unknown> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(this.peekProperty<string>('uploadMethod') || 'POST', url);
            for (const [name, value] of Object.entries(this.peekProperty<Record<string, string> | null>('uploadHeaders') ?? {})) xhr.setRequestHeader(name, value);
            if (piece) xhr.setRequestHeader('Content-Range', `bytes ${piece.start}-${piece.end}/${file.size}`);
            xhr.upload.addEventListener('progress', e => loaded(e.loaded));
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    let body: unknown = xhr.responseText;
                    try {
                        body = JSON.parse(xhr.responseText);
                    } catch {
                        // Not JSON: the text itself is the response.
                    }
                    resolve(body);
                } else {
                    reject(new Error(xhr.statusText || `HTTP ${xhr.status}`));
                }
            });
            xhr.addEventListener('error', () => reject(new Error(uiLocale.strings.fileFailed)));
            xhr.addEventListener('abort', () => reject(new Error(uiLocale.strings.fileAborted)));
            signal.addEventListener('abort', () => xhr.abort(), { once: true });
            const form = new FormData();
            form.append(this.peekProperty<string>('uploadField') || 'file', blob, file.name);
            if (piece) {
                form.append('chunkIndex', String(piece.index));
                form.append('chunkCount', String(piece.count));
            }
            xhr.send(form);
        });
    }
}
