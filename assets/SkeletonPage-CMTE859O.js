import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./Avatar-DZajY4yI.js";import{t as a}from"./Card-DjUUga-j.js";import{t as o}from"./Skeleton-BX89hAg3.js";import{t as s}from"./Stack-wRt1e9tO.js";import{a as c,i as l,n as u,r as d,t as f}from"./docs-B_LZlyP5.js";import{t as p}from"./sources-BXVvOiIY.js";var m=`import { Skeleton, Stack, type SkeletonAnimation } from '@motifx-community/ui';\r
\r
const ANIMATIONS: SkeletonAnimation[] = ['wave', 'pulse', 'none'];\r
\r
/** Each way it moves; reduced motion keeps them all still. */\r
export default function Animations() {\r
  return (\r
    <Stack gap="lg" style="inline-size: 24rem; max-inline-size: 100%">\r
      {ANIMATIONS.map((animation) => (\r
        <Stack key={animation} gap="sm">\r
          <span>{animation}</span>\r
          <Skeleton lines={2} animation={animation} />\r
        </Stack>\r
      ))}\r
    </Stack>\r
  );\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { Avatar, Button, Card, Skeleton, Stack } from '@motifx-community/ui';\r
\r
/** While \`loading\`, the shape of the card shows; then the card itself, in the same place. */\r
export default function Loading() {\r
  const s = reactive({ loading: true });\r
\r
  return (\r
    <Stack gap="lg" style="inline-size: 22rem; max-inline-size: 100%">\r
      <Button text={() => (s.loading ? 'Finish loading' : 'Load again')} variant="outline" onclick={() => (s.loading = !s.loading)} />\r
      <Card>\r
        <Stack orientation="horizontal" align="center">\r
          <Skeleton shape="circle" loading={() => s.loading}>\r
            <Avatar name="Grace Hopper" />\r
          </Skeleton>\r
          <Skeleton lines={2} loading={() => s.loading} grow>\r
            <strong>Grace Hopper</strong>\r
            <div>Wrote the first compiler.</div>\r
          </Skeleton>\r
        </Stack>\r
      </Card>\r
    </Stack>\r
  );\r
}\r
`,g=`import { Skeleton, Stack } from '@motifx-community/ui';\r
\r
/** Lines of text (the last of several is shorter), a block, and a circle. Lines and blocks take the width they are given. */\r
export default function Shapes() {\r
  return (\r
    <Stack gap="lg" style="inline-size: 24rem; max-inline-size: 100%">\r
      <Skeleton lines={3} />\r
      <Skeleton shape="rect" height={96} />\r
      <Stack orientation="horizontal" align="center">\r
        <Skeleton shape="circle" />\r
        <Skeleton shape="circle" width={24} />\r
      </Stack>\r
    </Stack>\r
  );\r
}\r
`,_=[`wave`,`pulse`,`none`];function v(){return t(s,{gap:`lg`,style:`inline-size: 24rem; max-inline-size: 100%`,runover:{},childs:[t({initializeComponent:e=>{e.bindings.list(()=>_??[],e=>t(s,{indexkey:()=>e,gap:`sm`,runover:{},childs:[t(`span`,{initializeComponent:n=>{let r=t(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{if(e!=null)return typeof e==`function`?e():()=>e})},__childExpr:()=>e});n.controls.add(r)}},1),t(o,{lines:2,animation:e,runover:{},childs:[]})]}))}})]})}function y(){let e=n({loading:!0});return t(s,{gap:`lg`,style:`inline-size: 22rem; max-inline-size: 100%`,runover:{},childs:[t(r,{text:()=>e.loading?`Finish loading`:`Load again`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.loading=!e.loading)}},childs:[]}),t(a,{runover:{},childs:[t(s,{orientation:`horizontal`,align:`center`,runover:{},childs:[t(o,{shape:`circle`,loading:()=>e.loading,runover:{},childs:[t(i,{name:`Grace Hopper`,runover:{},childs:[]})]}),t(o,{lines:2,loading:()=>e.loading,grow:!0,runover:{},childs:[t(`strong`,{initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`Grace Hopper`)}},1);e.controls.add(n)}},1),t(`div`,{initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`Wrote the first compiler.`)}},1);e.controls.add(n)}},1)]})]})]})]})}function b(){return t(s,{gap:`lg`,style:`inline-size: 24rem; max-inline-size: 100%`,runover:{},childs:[t(o,{lines:3,runover:{},childs:[]}),t(o,{shape:`rect`,height:96,runover:{},childs:[]}),t(s,{orientation:`horizontal`,align:`center`,runover:{},childs:[t(o,{shape:`circle`,runover:{},childs:[]}),t(o,{shape:`circle`,width:24,runover:{},childs:[]})]})]})}var x=p(Object.assign({"./examples/Animations.tsx":m,"./examples/Loading.tsx":h,"./examples/Shapes.tsx":g})),S=[[`shape`,"`Bind<SkeletonShape>`","`'text'`","`text` for lines, `rect` for a block such as an image or field, or `circle` for an avatar."],[`lines`,"`Bind<number>`","`1`",`The number of text lines. The last of several lines is shorter.`],[`width`,"`Bind<string | number | null>`",`The available space`,`A CSS length, or a number in pixels. Also sets the size of a circle (the default comes from the design language).`],[`height`,"`Bind<string | number | null>`",`One line, or set by the design language`,`A CSS length, or a number in pixels.`],[`animation`,"`Bind<SkeletonAnimation>`",`Set by the design language`,"`wave`, `pulse` or `none`. Tactile, Lounge and Fluent use a wave, and Material and Lilac use a pulse."],[`loading`,"`Bind<boolean>`","`true`","Shows the skeleton while `true`, and then the JSX children."],[`label`,"`Bind<string>`",`The kit string “Loading…”`,`The text announced by screen readers while loading.`],[`visible`,`see Control`,``,`Properties shared by all controls.`]],C=[[`every prop above`,`read/write`,`Accepts a value or a function, the same as the prop.`],[`content`,`read-only`,`The part that holds the loaded content, for adding to it programmatically.`]],w=[[`Loading`,"A `progressbar` with `aria-busy` and a name (“Loading…” in the kit language). The shapes are hidden from screen readers."],[`Loaded`,`The role and busy state are removed, and the content is read normally.`],[`Motion`,`With reduced motion, the wave and pulse stay still, because their duration follows the motion tokens.`]],T=[[`.mx-skeleton`,"The skeleton. `data-shape`, `data-animation`, `data-loading`."],[`.mx-skeleton__bone`,`A shape (a line, a block or a circle).`],[`.mx-skeleton__content`,`The content shown after loading.`]],E=[[`skeleton.bone`,"Unit: a shape in `text`, `rect` and `circle`. `color` is the color the wave and pulse blend in."],[`skeleton.line-height, skeleton.line-gap, skeleton.last-line`,`A line of text, the space between lines, and the width of the last line.`],[`skeleton.circle-size, skeleton.rect-height`,`The default size of a circle or block.`],[`skeleton.animation, skeleton.duration, skeleton.easing, skeleton.wave-mix, skeleton.pulse-dim`,`The default animation, its duration, easing and intensity.`]];function D(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(d,{text:`A placeholder that matches the shape of content that is loading, so the page keeps its layout while data arrives. If you provide content, it replaces the placeholder in the same place when loading ends.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(l,{anchor:`import`,title:`Import`,runover:{},childs:[t(c,{code:`
import { Skeleton } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(l,{anchor:`shapes`,title:`Shapes`,runover:{},childs:[t(u,{files:x(`Shapes.tsx`),runover:{},childs:[t(b,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(l,{anchor:`loading`,title:`Showing content after loading`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(d,{text:"`loading` accepts a value or a function. When it becomes `false`, the JSX children appear instead.",runover:{},childs:[]});e.controls.add(n)}},1),t(u,{files:x(`Loading.tsx`),runover:{},childs:[t(y,{runover:{},childs:[]})]})]});e.controls.add(a);let o=t(l,{anchor:`animations`,title:`Animation`,runover:{},childs:[t(u,{files:x(`Animations.tsx`),runover:{},childs:[t(v,{runover:{},childs:[]})]})]});e.controls.add(o);let s=t(l,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(f,{head:[`Topic`,`Details`],rows:w,runover:{},childs:[]})]});e.controls.add(s);let p=t(l,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(f,{head:[`Hook`,`Description`],rows:T,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Token`,`Description`],rows:E,runover:{},childs:[]})]});e.controls.add(p);let m=t(l,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Prop`,`Type`,`Default`,`Description`],rows:S,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Properties`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Property`,`Access`,`Description`],rows:C,runover:{},childs:[]})]});e.controls.add(m)}}})}export{D as default};