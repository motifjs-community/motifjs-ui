import { Component } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { placeBeside } from './place-popup';
import { Popup } from './Popup';

vi.mock('./place-popup', () => ({ placeBeside: vi.fn() }));

const frame = () => new Promise((resolve) => setTimeout(resolve, 40));

afterEach(() => {
  document.body.innerHTML = '';
  vi.mocked(placeBeside).mockClear();
});

function openPopup() {
  const anchor = new Component<HTMLButtonElement>('button');
  anchor.build();
  document.body.append(anchor.element);
  const popup = new Popup();
  popup.build();
  document.body.append(popup.element);
  const list = document.createElement('div');
  popup.element.append(list);
  popup.open(anchor);
  vi.mocked(placeBeside).mockClear();
  return { popup, list };
}

describe('Popup', () => {
  it('stays where it is when its own content scrolls', async () => {
    const { popup, list } = openPopup();
    popup.element.dispatchEvent(new Event('scroll'));
    list.dispatchEvent(new Event('scroll'));
    await frame();
    expect(placeBeside).not.toHaveBeenCalled();
    popup.close();
  });

  it('follows its anchor when the page scrolls', async () => {
    const { popup } = openPopup();
    document.dispatchEvent(new Event('scroll'));
    await frame();
    expect(placeBeside).toHaveBeenCalled();
    popup.close();
  });
});
