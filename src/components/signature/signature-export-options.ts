/** Options of `Signature.toDataURL`, `toBlob` and `toSVG`. */
export interface SignatureExportOptions {
    /** The width of the image in pixels. The default is the width of the pad at twice its size. */
    width?: number;
    /** The height of the image in pixels. The default keeps the shape of the pad. */
    height?: number;
    /** The color of the lines. The default is `'#000000'`, so that the image does not depend on the theme. */
    color?: string;
    /** The background. By default, it is transparent. */
    background?: string;
}
