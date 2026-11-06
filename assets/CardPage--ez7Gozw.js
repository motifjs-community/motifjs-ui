import{a as e,an as t,h as n,i as r,n as i,nn as a,r as o,rn as s,t as c}from"./doc-B1CtlCkV.js";import{t as l}from"./Card-BfludEjP.js";import{t as u}from"./Stack-AS0iyAxC.js";import{t as d}from"./sources-BXVvOiIY.js";var f=`import { reactive } from '@motifx/core';\r
import { Card, Stack } from '@motifx-community/ui';\r
\r
const PLACES = ['Istanbul', 'Lisbon', 'Kyoto'];\r
\r
/** The whole card can be pressed: with the mouse, Enter or Space. */\r
export default function Clickable() {\r
  const s = reactive({ chosen: '' });\r
\r
  return (\r
    <Stack gap="lg">\r
      <Stack orientation="horizontal" wrap align="start">\r
        {PLACES.map((place) => (\r
          <Card key={place} title={place} subtitle="Press to choose" clickable onclick={() => (s.chosen = place)} style="inline-size: 12rem" />\r
        ))}\r
      </Stack>\r
      <span>{() => (s.chosen ? \`Chosen: \${s.chosen}\` : 'Nothing chosen yet')}</span>\r
    </Stack>\r
  );\r
}\r
`,p=`import { reactive } from '@motifx/core';\r
import { Button, Card, Stack } from '@motifx-community/ui';\r
\r
const PLACES = ['Istanbul', 'Lisbon', 'Kyoto'];\r
\r
/**\r
 * A link card: its title is the link, and a click anywhere on the card follows it (\`rel="router"\` hands it to the router).\r
 * Its own button stays a button. A selectable card toggles with a click or with its check box.\r
 */\r
export default function Links() {\r
  const s = reactive({ picked: [] as string[] });\r
  const toggle = (place: string, on: boolean) => {\r
    s.picked = on ? [...s.picked, place] : s.picked.filter((p) => p !== place);\r
  };\r
\r
  return (\r
    <Stack gap="lg">\r
      <Stack orientation="horizontal" wrap align="start">\r
        <Card title="Tokens" subtitle="A link to the tokens page" href="/tokens" rel="router" footer={<Button text="Later" variant="ghost" />} style="inline-size: 14rem" />\r
        <Card title="Keyboard" subtitle="A link to the keyboard page" href="/keyboard" rel="router" style="inline-size: 14rem" />\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="start">\r
        {PLACES.map((place) => (\r
          <Card\r
            key={place}\r
            title={place}\r
            subtitle="Press to pick"\r
            selectable\r
            selected={() => s.picked.includes(place)}\r
            onSelectedChanged={(e) => e.byUser && toggle(place, e.selected)}\r
            style="inline-size: 12rem"\r
          />\r
        ))}\r
      </Stack>\r
      <span>{() => \`Picked: \${s.picked.join(', ') || 'none'}\`}</span>\r
    </Stack>\r
  );\r
}\r
`,m=`import { Button, Card, Stack } from '@motifx-community/ui';\r
import { PICTURE } from './picture';\r
\r
/** A picture above the rest, or at its start (\`horizontal\`); it runs to the card's edges and takes its corners. */\r
export default function Media() {\r
  return (\r
    <Stack orientation="horizontal" wrap align="start" gap="lg">\r
      <Card media={PICTURE} mediaAlt="A sunset over a field" title="Sunset" subtitle="Above the rest" style="inline-size: 16rem">\r
        The picture runs to the edges.\r
      </Card>\r
      <Card\r
        media={PICTURE}\r
        orientation="horizontal"\r
        title="Sunset"\r
        subtitle="At the start"\r
        footer={<Button text="Save" variant="outline" />}\r
        style="inline-size: 24rem"\r
      >\r
        As tall as the card.\r
      </Card>\r
    </Stack>\r
  );\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { Button, Card, Stack } from '@motifx-community/ui';\r
\r
/** A card in JSX tracks its functions, and one created with \`new\` accepts the same properties programmatically. */\r
export default function Programmatic() {\r
  const s = reactive({ following: false });\r
  const coded = new Card({ title: 'Made in code', subtitle: 'new Card({ … })', variant: 'outline' });\r
\r
  return (\r
    <Stack orientation="horizontal" wrap align="start" gap="lg">\r
      <Card\r
        title="Ada Lovelace"\r
        subtitle={() => (s.following ? 'Following' : 'Mathematician')}\r
        avatar={{ name: 'Ada Lovelace' }}\r
        footer={<Button text={() => (s.following ? 'Unfollow' : 'Follow')} onclick={() => (s.following = !s.following)} />}\r
        style="inline-size: 18rem"\r
      >\r
        First to publish an algorithm meant to be carried out by a machine.\r
      </Card>\r
      <span onConfig={(c) => c.controls.add(coded)} />\r
    </Stack>\r
  );\r
}\r
`,g=`import { Card, Stack, type ControlSize } from '@motifx-community/ui';\r
\r
const SIZES: ControlSize[] = ['sm', 'md', 'lg'];\r
\r
/** The space in and between the parts, per size. */\r
export default function Sizes() {\r
  return (\r
    <Stack orientation="horizontal" wrap align="start" gap="lg">\r
      {SIZES.map((size) => (\r
        <Card key={size} size={size} title={\`Size \${size}\`} subtitle="Grace Hopper" avatar={{ name: 'Grace Hopper' }} style="inline-size: 15rem">\r
          Content of the card.\r
        </Card>\r
      ))}\r
    </Stack>\r
  );\r
}\r
`,_=`import { Button, Card, Stack, type CardVariant } from '@motifx-community/ui';\r
\r
const VARIANTS: CardVariant[] = ['elevated', 'filled', 'outline'];\r
\r
/** Each appearance with a header, content and actions. */\r
export default function Variants() {\r
  return (\r
    <Stack orientation="horizontal" wrap align="start" gap="lg">\r
      {VARIANTS.map((variant) => (\r
        <Card\r
          key={variant}\r
          variant={variant}\r
          title={variant}\r
          subtitle="A card of this look"\r
          footer={\r
            <Stack orientation="horizontal" gap="sm">\r
              <Button text="Cancel" variant="ghost" />\r
              <Button text="Open" />\r
            </Stack>\r
          }\r
          style="inline-size: 16rem"\r
        >\r
          The same header, content and actions in each look.\r
        </Card>\r
      ))}\r
    </Stack>\r
  );\r
}\r
`,v=[`Istanbul`,`Lisbon`,`Kyoto`];function y(){let e=t({chosen:``});return a(u,{gap:`lg`,runover:{},childs:[a(u,{orientation:`horizontal`,wrap:!0,align:`start`,runover:{},childs:[a({initializeComponent:t=>{t.bindings.list(()=>v??[],t=>a(l,{indexkey:()=>t,title:t,subtitle:`Press to choose`,clickable:!0,style:`inline-size: 12rem`,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.chosen=t)}},childs:[]}))}})]}),a(`span`,{initializeComponent:t=>{t.bindings.ternary(()=>e.chosen,t=>{t.navigate(a(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{if(`Chosen: ${e.chosen}`!==null&&`Chosen: ${e.chosen}`!==void 0)return typeof`Chosen: ${e.chosen}`==`function`?`Chosen: ${e.chosen}`():()=>`Chosen: ${e.chosen}`})}},1))},e=>{e.navigate(a(`text`,{initializeComponent:e=>{e.setText(`Nothing chosen yet`)}},1))})}},1)]})}function b(){let e=t({following:!1}),r=new l({title:`Made in code`,subtitle:`new Card({ … })`,variant:`outline`});return a(u,{orientation:`horizontal`,wrap:!0,align:`start`,gap:`lg`,runover:{},childs:[a(l,{title:`Ada Lovelace`,subtitle:()=>e.following?`Following`:`Mathematician`,avatar:{name:`Ada Lovelace`},footer:a(n,{text:()=>e.following?`Unfollow`:`Follow`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.following=!e.following)}},childs:[]}),style:`inline-size: 18rem`,runover:{},childs:[a(`text`,{initializeComponent:e=>{e.setText(`First to publish an algorithm meant to be carried out by a machine.`)}},1)]}),a(`span`,{onConfig:e=>e.controls.add(r)})]})}var x=[`Istanbul`,`Lisbon`,`Kyoto`];function S(){let e=t({picked:[]}),r=(t,n)=>{e.picked=n?[...e.picked,t]:e.picked.filter(e=>e!==t)};return a(u,{gap:`lg`,runover:{},childs:[a(u,{orientation:`horizontal`,wrap:!0,align:`start`,runover:{},childs:[a(l,{title:`Tokens`,subtitle:`A link to the tokens page`,href:`/tokens`,rel:`router`,footer:a(n,{text:`Later`,variant:`ghost`,runover:{},childs:[]}),style:`inline-size: 14rem`,runover:{},childs:[]}),a(l,{title:`Keyboard`,subtitle:`A link to the keyboard page`,href:`/keyboard`,rel:`router`,style:`inline-size: 14rem`,runover:{},childs:[]})]}),a(u,{orientation:`horizontal`,wrap:!0,align:`start`,runover:{},childs:[a({initializeComponent:t=>{t.bindings.list(()=>x??[],t=>a(l,{indexkey:()=>t,title:t,subtitle:`Press to pick`,selectable:!0,selected:()=>e.picked.includes(t),onSelectedChanged:e=>e.byUser&&r(t,e.selected),style:`inline-size: 12rem`,runover:{},childs:[]}))}})]}),a(`span`,{initializeComponent:t=>{t.bindings.method(()=>`Picked: ${e.picked.join(`, `)||`none`}`)}},1)]})}var C=`data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20320%20160%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22sky%22%20x2%3D%220%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%233b5bdb%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23f08c00%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22320%22%20height%3D%22160%22%20fill%3D%22url(%23sky)%22%2F%3E%3Ccircle%20cx%3D%22160%22%20cy%3D%22112%22%20r%3D%2234%22%20fill%3D%22%23ffd43b%22%2F%3E%3Cpath%20d%3D%22M0%20118h320v42H0z%22%20fill%3D%22%232b8a3e%22%2F%3E%3C%2Fsvg%3E`;function w(){return a(u,{orientation:`horizontal`,wrap:!0,align:`start`,gap:`lg`,runover:{},childs:[a(l,{media:C,mediaAlt:`A sunset over a field`,title:`Sunset`,subtitle:`Above the rest`,style:`inline-size: 16rem`,runover:{},childs:[a(`text`,{initializeComponent:e=>{e.setText(`The picture runs to the edges.`)}},1)]}),a(l,{media:C,orientation:`horizontal`,title:`Sunset`,subtitle:`At the start`,footer:a(n,{text:`Save`,variant:`outline`,runover:{},childs:[]}),style:`inline-size: 24rem`,runover:{},childs:[a(`text`,{initializeComponent:e=>{e.setText(`As tall as the card.`)}},1)]})]})}var T=[`sm`,`md`,`lg`];function E(){return a(u,{orientation:`horizontal`,wrap:!0,align:`start`,gap:`lg`,runover:{},childs:[a({initializeComponent:e=>{e.bindings.list(()=>T??[],e=>a(l,{indexkey:()=>e,size:e,title:`Size ${e}`,subtitle:`Grace Hopper`,avatar:{name:`Grace Hopper`},style:`inline-size: 15rem`,runover:{},childs:[a(`text`,{initializeComponent:e=>{e.setText(`Content of the card.`)}},1)]}))}})]})}var D=[`elevated`,`filled`,`outline`];function O(){return a(u,{orientation:`horizontal`,wrap:!0,align:`start`,gap:`lg`,runover:{},childs:[a({initializeComponent:e=>{e.bindings.list(()=>D??[],e=>a(l,{indexkey:()=>e,variant:e,title:e,subtitle:`A card of this look`,footer:a(u,{orientation:`horizontal`,gap:`sm`,runover:{},childs:[a(n,{text:`Cancel`,variant:`ghost`,runover:{},childs:[]}),a(n,{text:`Open`,runover:{},childs:[]})]}),style:`inline-size: 16rem`,runover:{},childs:[a(`text`,{initializeComponent:e=>{e.setText(`The same header, content and actions in each look.`)}},1)]}))}})]})}var k=d(Object.assign({"./examples/Clickable.tsx":f,"./examples/Links.tsx":p,"./examples/Media.tsx":m,"./examples/Programmatic.tsx":h,"./examples/Sizes.tsx":g,"./examples/Variants.tsx":_})),A=[[`title`,"`Bind<string>`","`''`",`The title, which also provides the accessible name of the card.`],[`subtitle`,"`Bind<string>`","`''`",`Text below the title.`],[`avatar`,"`Bind<AvatarProps | null>`","`null`",`An avatar before the titles (its props).`],[`action`,"`Bind<ComponentBase | null>`","`null`",`Content at the end of the header, such as a menu button or a badge.`],[`media`,"`Bind<IconSource | null>`","`null`",`An image that extends to the card edges: an image address, an element or a component.`],[`mediaAlt`,"`Bind<string>`","`''`","Alternative text for the image when `media` is an image address. Without it, the image is decorative."],[`content`,"`Bind<ComponentBase | null>`","`null`",`The content, in addition to JSX children.`],[`footer`,"`Bind<ComponentBase | null>`","`null`",`A row of actions below the content. A replaced component is removed from the card and stays under your control.`],[`variant`,"`Bind<CardVariant>`","Set by the design language (`elevated`)","`elevated`, `filled`, `outline`."],[`size`,"`Bind<ControlSize>`","`'md'`","The spacing inside and between the parts: `sm`, `md` or `lg`."],[`orientation`,"`Bind<CardOrientation>`","`'vertical'`","`horizontal` places the image at the start."],[`clickable`,"`Bind<boolean>`","`false`","Makes the whole card pressable (`onclick`, Enter, Space)."],[`href`,"`Bind<string | null>`","`null`",`Makes the whole card a link. The title is the link, and clicking anywhere on the card follows it.`],[`rel`,"`Bind<string>`","`''`","The `rel` of the link. `router` lets the MotifJS router handle it."],[`selectable`,"`Bind<boolean>`","`false`",`Adds a check box on the top end corner, and clicking the card toggles it.`],[`selected`,"`Bind<boolean>`","`false`",`Indicates whether the card is selected.`],[`onSelectedChanged`,"`CardSelectedChangedEventArgs`",``,"Occurs when the selection changes (`selected`), either by the user or programmatically (`byUser`)."],[`enabled, visible, tabStop`,`see Control`,``,`Properties shared by all controls.`]],j=[[`every prop above`,`read/write`,`Accepts a value or a function, the same as the prop.`],[`contentPart`,`read-only`,`The part that holds the content, for adding to it programmatically.`],[`avatarControl`,`read-only`,`The avatar before the titles, if there is one.`]],M=[[`Name`,"A `group` named by its title (`aria-labelledby`)."],[`Picture`,"Decorative unless `mediaAlt` describes it."],[`Clickable cards`,`A Tab stop that responds to Enter and Space. Buttons inside it remain independent.`],[`Link`,`The title is a real link, and the card shows its focus state. The card's own buttons stay above it.`],[`Selectable`,`A check box named “Select <title>” in the kit language. The card shows the selection with its frame.`]],N=[[`.mx-card`,"The card. `data-variant`, `data-size`, `data-orientation`, `data-pressable`, `data-disabled`."],[`.mx-card__media`,`The image.`],[`.mx-card__body`,`The header, content and actions.`],[`.mx-card__header, .mx-card__avatar, .mx-card__heading, .mx-card__title, .mx-card__subtitle, .mx-card__action`,`The header and its parts.`],[`.mx-card__content, .mx-card__footer`,`The content and the action row.`]],P=[[`card.card`,"Unit: the card at rest, then `elevated`, `filled`, `outline`, `selected`, `hover`, `pressed`, `focus` and `disabled`."],[`card.title, card.subtitle, card.content`,`Units: the title, the subtitle and the content text.`],[`card.padding.*, card.gap.*`,`The spacing around and between the parts, per size.`],[`card.header-gap, card.footer-gap, card.media-width`,`The spacing in the header and between actions, and the width of an image at the start.`],[`card.variant, card.footer-align`,`The default appearance, and the action alignment (start in Fluent, end in the other design languages).`]];function F(){return s({initializeComponent:t=>{{let n=a(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=a(o,{text:`A surface for a single subject, with an optional image, a header with an avatar and titles, content and a row of actions. Empty parts are not rendered.`,runover:{},childs:[]});e.controls.add(t)}},1);t.controls.add(n);let s=a(r,{anchor:`import`,title:`Import`,runover:{},childs:[a(e,{code:`
import { Card } from '@motifx-community/ui';
`,runover:{},childs:[]})]});t.controls.add(s);let l=a(r,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"Every prop accepts a value or a function. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:k(`Programmatic.tsx`),runover:{},childs:[a(b,{runover:{},childs:[]})]})]});t.controls.add(l);let u=a(r,{anchor:`variants`,title:`Appearance`,runover:{},childs:[a(i,{files:k(`Variants.tsx`),runover:{},childs:[a(O,{runover:{},childs:[]})]})]});t.controls.add(u);let d=a(r,{anchor:`media`,title:`Images`,runover:{},childs:[a(i,{files:k(`Media.tsx`),runover:{},childs:[a(w,{runover:{},childs:[]})]})]});t.controls.add(d);let f=a(r,{anchor:`clickable`,title:`Clickable cards`,runover:{},childs:[a(i,{files:k(`Clickable.tsx`),runover:{},childs:[a(y,{runover:{},childs:[]})]})]});t.controls.add(f);let p=a(r,{anchor:`links`,title:`Links and selection`,runover:{},childs:[a(i,{files:k(`Links.tsx`),runover:{},childs:[a(S,{runover:{},childs:[]})]})]});t.controls.add(p);let m=a(r,{anchor:`sizes`,title:`Sizes`,runover:{},childs:[a(i,{files:k(`Sizes.tsx`),runover:{},childs:[a(E,{runover:{},childs:[]})]})]});t.controls.add(m);let h=a(r,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[a(c,{head:[`Topic`,`Details`],rows:M,runover:{},childs:[]})]});t.controls.add(h);let g=a(r,{anchor:`styling`,title:`Styling`,runover:{},childs:[a(c,{head:[`Hook`,`Description`],rows:N,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Token`,`Description`],rows:P,runover:{},childs:[]})]});t.controls.add(g);let _=a(r,{anchor:`api`,title:`API reference`,runover:{},childs:[a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Prop`,`Type`,`Default`,`Description`],rows:A,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Property`,`Access`,`Description`],rows:j,runover:{},childs:[]})]});t.controls.add(_)}}})}export{F as default};