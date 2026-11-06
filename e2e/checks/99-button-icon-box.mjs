import { designLanguages } from '../languages.mjs';

/** Measured: a picture keeps the icon size of each design language, and larger content stays centered in the button. */
export default async function ({ page, base, check }) {
  await page.goto(base + 'button', { waitUntil: 'load' });
  await page.locator('.docs-article .mx-button[data-icon]').first().waitFor();

  for (const language of designLanguages) {
    const result = await page.evaluate(async (language) => {
      document.documentElement.setAttribute('data-design-language', language);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const button = document.querySelector('.docs-article .mx-button[data-icon]');
      const face = button.matches('.mx-button__face') ? button : button.querySelector('.mx-button__face');
      const box = face.querySelector('.mx-button__icon');
      const size = getComputedStyle(button).getPropertyValue('--_button-icon-size');
      const kept = [...box.childNodes];
      const picture = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      box.replaceChildren(picture);
      const pictureBox = box.getBoundingClientRect();
      const large = document.createElement('div');
      large.style.cssText = 'inline-size: 32px; block-size: 32px; flex: none';
      box.replaceChildren(large);
      const hint = button.querySelector('.mx-button__text');
      if (hint) hint.hidden = true;
      const faceRect = face.getBoundingClientRect();
      const largeRect = large.getBoundingClientRect();
      if (hint) hint.hidden = false;
      box.replaceChildren(...kept);
      return {
        size,
        picture: [pictureBox.width, pictureBox.height],
        offset: largeRect.left + largeRect.width / 2 - (faceRect.left + faceRect.width / 2),
        offsetY: largeRect.top + largeRect.height / 2 - (faceRect.top + faceRect.height / 2),
      };
    }, language);
    check(`${language}: a picture keeps the icon box`, result.picture[0] > 0 && result.picture[0] === result.picture[1] && result.picture[0] <= 24, result.picture.join(' × '));
    check(`${language}: larger content is centered`, Math.abs(result.offset) <= 0.5 && Math.abs(result.offsetY) <= 1, `${result.offset} ${result.offsetY}`);
  }
}
