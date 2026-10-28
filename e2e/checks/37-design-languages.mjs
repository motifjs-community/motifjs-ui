/** Each design language measured against its source, in the browser: the sizes, corners, frames
 *  and focus a language takes from its spec reach the drawn parts (the medium size of each).
 *  Material: the Material 3 component specs (m3.material.io). Fluent: the Fluent theme resources
 *  (microsoft-ui-xaml, *_themeresources.xaml). Tactile, Lounge and Lilac: this kit's own values. */
const SPECS = {
  tactile: [
    ['button', 'height', '32px', 'control height'],
    ['button', 'border-bottom-width', '2px', 'the raised key edge'],
    ['button', 'border-top-left-radius', '6px', 'radius.md'],
    ['checkbox', 'width', '16px', 'icon size'],
    ['field', 'height', '32px', 'control height'],
  ],
  lounge: [
    ['button', 'height', '36px', 'control height'],
    ['button', 'border-top-left-radius', '18px', 'a pill'],
    ['field', 'height', '36px', 'control height'],
  ],
  material: [
    ['button', 'height', '40px', 'button container height 40dp'],
    ['button', 'border-top-left-radius', '9999px', 'button shape: full'],
    ['button', 'border-bottom-width', '0px', 'no outline on a filled button'],
    ['checkbox', 'width', '18px', 'checkbox container 18dp'],
    ['checkbox', 'border-top-width', '2px', 'checkbox outline 2dp'],
    ['checkbox', 'border-top-left-radius', '2px', 'checkbox shape 2dp'],
    ['radio', 'width', '20px', 'radio icon 20dp'],
    ['switch', 'width', '52px', 'switch track 52dp'],
    ['switch', 'height', '32px', 'switch track height 32dp'],
    ['field', 'height', '56px', 'filled text field 56dp'],
    ['field', 'border-top-left-radius', '4px', 'filled text field: 4dp top corners'],
    ['field', 'border-bottom-left-radius', '0px', '…and square bottom corners'],
    ['tab', 'height', '48px', 'primary tab 48dp'],
    ['indicator', 'height', '3px', 'primary tab active indicator 3dp'],
    ['list item', 'height', '56px', 'one-line list item 56dp'],
    ['button focus', 'outline-width', '3px', 'focus indicator thickness 3dp'],
    ['button focus', 'outline-offset', '2px', 'focus indicator outer offset 2dp'],
  ],
  lilac: [
    ['button', 'height', '36px', 'roomy controls'],
    ['button', 'border-top-left-radius', '12px', 'soft corners (radius.md)'],
    ['button', 'border-bottom-width', '0px', 'flat, no key edge'],
    ['checkbox', 'width', '18px', 'a larger check box'],
    ['checkbox', 'border-top-left-radius', '6px', 'radius.xs'],
    ['field', 'height', '36px', 'roomy controls'],
    ['field', 'border-top-left-radius', '12px', 'soft corners'],
    ['indicator', 'height', '3px', 'a 3 px tab indicator'],
    ['list item', 'height', '36px', 'one control height'],
    ['button focus', 'outline-width', '2px', 'a 2 px lilac ring'],
    ['button focus', 'outline-offset', '2px', '…2 px away, with a soft halo'],
  ],
  fluent: [
    ['button', 'height', '32px', 'Button: 32 (ContentControlThemeMinHeight)'],
    ['button', 'border-top-left-radius', '4px', 'ControlCornerRadius 4'],
    ['button', 'font-weight', '400', 'Button FontWeight Normal'],
    ['checkbox', 'width', '20px', 'CheckBoxSize 20'],
    ['radio', 'width', '20px', 'RadioButton outer ellipse 20'],
    ['slider thumb', 'width', '18px', 'SliderHorizontalThumbWidth 18'],
    ['progress', 'height', '3px', 'ProgressBarTrackHeight 3 (the minimum height)'],
    ['list item', 'height', '40px', 'ListViewItemMinHeight 40'],
    ['accordion header', 'height', '48px', 'ExpanderMinHeight 48'],
    ['button focus', 'outline-width', '2px', 'FocusVisualPrimaryThickness 2'],
  ],
};

// Where each part is measured: the page, the part, and how to bring it into the state measured.
const PARTS = {
  button: ['button', '.mx-button[data-size="md"][data-variant="solid"] > .mx-button__face'],
  'button focus': ['button', '.mx-button[data-size="md"][data-variant="solid"] > .mx-button__face', 'focus'],
  checkbox: ['checkbox', '.mx-check-box[data-size="md"] .mx-check-box__input'],
  radio: ['radiogroup', '.mx-radio-group[data-size="md"] .mx-radio-group__input'],
  switch: ['switch', '.mx-switch[data-size="md"] .mx-switch__input'],
  field: ['textbox', '.mx-text-box[data-size="md"]:not([data-label-mode="floating"]) .mx-field__box'],
  tab: ['tabs', '.mx-tabs[data-size="md"][data-variant="line"] .mx-tabs__tab'],
  indicator: ['tabs', '.mx-tabs[data-size="md"][data-variant="line"] .mx-tabs__tab[aria-selected="true"]', 'after'],
  'list item': ['listbox', '.mx-list-box .mx-list__item'],
  'slider thumb': ['slider', '.mx-slider:is(:not([data-size]), [data-size="md"]) .mx-slider__knob'],
  progress: ['progress', '.mx-progress:is(:not([data-size]), [data-size="md"]) .mx-progress__track'],
  'accordion header': ['accordion', '.mx-accordion[data-size="md"] .mx-accordion__header'],
};

export default async function ({ page, base, check }) {
  const restore = await page.evaluate(() => ({ identity: document.documentElement.dataset.identity, theme: document.documentElement.dataset.theme }));
  for (const [identity, specs] of Object.entries(SPECS)) {
    for (const [part, prop, expected, source] of specs) {
      const [path, selector, how] = PARTS[part];
      if (!page.url().endsWith(`/${path}`)) await page.goto(base + path, { waitUntil: 'load' });
      await page.waitForSelector('.docs-main');
      // A key press first, so the focus given below is keyboard focus (:focus-visible).
      if (how === 'focus') await page.keyboard.press('Shift');
      const value = await page.evaluate(
        async ([id, sel, mode, name]) => {
          document.documentElement.dataset.identity = id;
          delete document.documentElement.dataset.theme;
          const el = [...document.querySelectorAll(`.docs-main ${sel}`)].find((e) => e.checkVisibility());
          if (!el) return 'missing';
          // A part that eases into its new size (a knob) is measured once it is there.
          await Promise.all(el.getAnimations().map((a) => a.finished.catch(() => undefined)));
          if (mode === 'focus') el.focus();
          const cs = getComputedStyle(el, mode === 'after' ? '::after' : null);
          const v = cs.getPropertyValue(name);
          if (mode === 'focus') el.blur();
          return name === 'height' || name === 'width' ? `${Math.round(parseFloat(v))}px` : v;
        },
        [identity, selector, how, prop],
      );
      check(`${identity}: ${part} ${prop} is ${expected} (${source})`, value === expected, value);
    }
  }
  await page.evaluate((r) => {
    if (r.identity) document.documentElement.dataset.identity = r.identity;
    else delete document.documentElement.dataset.identity;
    if (r.theme) document.documentElement.dataset.theme = r.theme;
  }, restore);
}
