/** Options of `QRCode.toSVG` and `toDataURL`. */
export interface QRCodeExportOptions {
    /** The width and height of the image in pixels, rounded to whole modules. The default is about `512`. */
    size?: number;
    /** The default is `'#000000'`. */
    color?: string;
    /** The default is `'#ffffff'`. */
    background?: string;
}
