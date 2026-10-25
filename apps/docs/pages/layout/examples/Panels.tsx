import { Panel } from '@motifx-community/ui';

/** A named panel that scrolls, a card and an outline. */
export default function Panels() {
  return (
    <>
      <Panel class="layout-scroll" text="Terms" scrollable="vertical" padding="md" variant="outline" style="block-size: 8rem; inline-size: 18rem">
        <p>1. The service is offered as it is.</p>
        <p>2. You keep the rights to what you upload.</p>
        <p>3. We may change these terms with a notice of 30 days.</p>
        <p>4. Either side may end the agreement at any time.</p>
        <p>5. The law of the place you live in applies.</p>
      </Panel>
      <Panel variant="card" padding="md">
        A card
      </Panel>
      <Panel variant="outline" padding="md">
        An outline
      </Panel>
    </>
  );
}
