import { QRCode } from '@motifx-community/ui';

/** A logo in the middle, which takes the place of some modules. Level H restores what it covers. */
export default function Logo() {
    return <QRCode class="qr-logo" value="https://ui.motifjs.com/qrcode" level="H" logo="/favicon.svg" size={220} />;
}
