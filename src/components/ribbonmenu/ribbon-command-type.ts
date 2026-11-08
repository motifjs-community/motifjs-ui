/**
 * What a command is: a button, a button that stays pressed (`toggle`), a button with its own action and a menu beside
 * it (`split`), a button that opens a menu (`menu`), a row of small commands (`row`), any content of the app
 * (`content`), a row of choices that opens all of them in a grid (`gallery`), or a line between commands
 * (`separator`).
 */
export type RibbonCommandType = 'button' | 'toggle' | 'split' | 'menu' | 'row' | 'content' | 'gallery' | 'separator';
