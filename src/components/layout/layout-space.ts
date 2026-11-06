/**
 * A gap or a padding: a step of the spacing scale (`'xs'` … `'xxl'`, from the layout tokens),
 * a number of pixels, or any CSS length (`'1.5rem'`). A padding accepts up to four values, as in CSS.
 */
export type LayoutSpace = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | number | (string & {});
