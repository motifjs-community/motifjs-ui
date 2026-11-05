import { Resizable } from '@motifx-community/ui';
import { scene } from '../../gallery/examples/scenes';

/** A picture that keeps its shape and stays inside the dashed area; only the end side, the bottom and the corner resize it. */
export default function Area() {
    return (
        <div class="rs-area" style="position: relative; inline-size: 100%; block-size: 260px; outline: 2px dashed var(--mx-color-stroke-control-strong); outline-offset: -2px">
            <Resizable class="rs-picture" width={240} height={135} minWidth={120} minHeight={68} area="parent" keepAspectRatio handles={['end', 'bottom', 'bottom-end']} style="position: absolute; left: 16px; top: 16px">
                <img src={scene(200)} alt="A harbour at dawn" style="display: block; inline-size: 100%; block-size: 100%; object-fit: cover" />
            </Resizable>
        </div>
    );
}
