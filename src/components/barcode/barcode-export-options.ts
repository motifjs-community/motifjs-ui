/** Options of `Barcode.toSVG` and `toDataURL`. */
export interface BarcodeExportOptions {
    /** The width of a module in pixels. The default is `2`. */
    scale?: number;
    /** The default is `'#000000'`. */
    color?: string;
    /** The default is `'#ffffff'`. */
    background?: string;
}
