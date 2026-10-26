import { afterEach, describe, expect, it, vi } from 'vitest';
import { placePopup } from './place-popup';
import { Popup } from './Popup';

vi.mock('./place-popup', () => ({ placePopup: vi.fn() }));

const frame = () => new Promise((resolve) => setTimeout(resolve, 40));

afterEach(() => {
  document.body.innerHTML = '';
  vi.mocked(placePopup).mockClear();
});

function openPopup() {
  const anchor = document.createElement('button');
  document.body.append(anchor);
  const popup = new Popup();
  popup.build();
  document.body.append(popup.element);
  const list = document.createElement('div');
  popup.element.append(list);
  popup.open(anchor);
  vi.mocked(placePopup).mockClear();
  return { popup, list };
}

describe('Popup', () => {
  it('stays where it is when its own content scrolls', async () => {
    const { popup, list } = openPopup();
    popup.element.dispatchEvent(new Event('scroll'));
    list.dispatchEvent(new Event('scroll'));
    await frame();
    expect(placePopup).not.toHaveBeenCalled();
    popup.close();
  });

  it('follows its anchor when the page scrolls', async () => {
    const { popup } = openPopup();
    document.dispatchEvent(new Event('scroll'));
    await frame();
    expect(placePopup).toHaveBeenCalled();
    popup.close();
  });
});
