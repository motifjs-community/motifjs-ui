import type { Component } from '@motifx/core';
import { glyph } from '../../core/glyphs';
import { Chip } from '../chip/Chip';
import type { ChipProps } from '../chip/chip-props';
import { entryFrame, type ChatEntry } from './chat-entry';
import type { ChatAttachmentPart } from './chat-part';

/**
 * A file as a chip: an image with its picture (read from the file while the chip lives), anything else with a file
 * glyph. `props` adds to the chip's own (`removable` in the composer).
 */
export function attachmentChip(file: ChatAttachmentPart, props: ChipProps = {}): Chip {
  const readable = !!file.file && file.type?.startsWith('image/') && typeof URL.createObjectURL === 'function';
  const own = !file.url && readable ? URL.createObjectURL(file.file!) : null;
  const url = file.url ?? own;
  const chip = new Chip({ text: file.name, icon: url ?? glyph('file'), size: 'sm', ...props });
  chip.class.add('mx-chat__file');
  if (own) chip.motif.setDisposable(() => URL.revokeObjectURL(own));
  return chip;
}

/** A file in the model's flow: its chip. */
export class ChatAttachmentEntry implements ChatEntry {
  readonly row: Component<HTMLDivElement>;

  constructor(file: ChatAttachmentPart) {
    const { row, main } = entryFrame('attachment');
    this.row = row;
    main.controls.add(attachmentChip(file));
  }

  append(): void {}

  update(): void {}

  drawTexts(): void {}
}
