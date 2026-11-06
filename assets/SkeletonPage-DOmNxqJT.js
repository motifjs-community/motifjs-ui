import{Jt as e,Lt as t,Mt as n,a as r,an as i,g as a,h as o,i as s,n as c,nn as l,r as u,rn as d,st as f,t as p}from"./doc-B1CtlCkV.js";import{c as m,l as h,s as g,t as _}from"./draw-parts-CqFeWILG.js";import{t as v}from"./Avatar-ClP0YHOQ.js";import{t as y}from"./Card-BfludEjP.js";import{t as b}from"./Stack-AS0iyAxC.js";import{t as x}from"./sources-BXVvOiIY.js";var S=[`shape`,`lines`,`width`,`height`,`animation`,`loading`,`label`],C=e=>typeof e==`number`&&Number.isFinite(e)?`${e}px`:typeof e==`string`?e:``,w=class extends f{look=new t(this.element,{animation:`--_skeleton-animation`},()=>this.renderLook());bones=[];contentPart;constructor(e){super(`div`,e);let t=this.props??{};this.element.classList.add(`mx-skeleton`),this.contentPart=m(this,`div`,`mx-skeleton__content`),this.childs?.length&&this.contentPart.controls.add(...this.childs);for(let e of S)t[e]!==void 0&&this.bindProperty(e,t[e]);for(let e of[`shape`,`lines`])this.observeProperty(e,()=>this.renderBones());this.observeProperty(`width`,e=>_(this.element,`--_width`,C(e))),this.observeProperty(`height`,e=>_(this.element,`--_height`,C(e)));for(let e of[`animation`,`shape`])this.observeProperty(e,()=>this.renderLook());for(let e of[`loading`,`label`])this.observeProperty(e,()=>this.renderLoading());a(this,()=>this.renderLoading()),this.motif.setDisposable(this.look.watch())}get shape(){return this.getProperty(`shape`)??`text`}set shape(e){this.assignProperty(`shape`,e)}get lines(){return this.countOf(this.getProperty(`lines`))}set lines(e){this.assignProperty(`lines`,e)}get width(){return this.getProperty(`width`)??null}set width(e){this.assignProperty(`width`,e)}get height(){return this.getProperty(`height`)??null}set height(e){this.assignProperty(`height`,e)}get animation(){return this.getProperty(`animation`)??this.look.get(`animation`)??`wave`}set animation(e){this.assignProperty(`animation`,e)}get loading(){return this.getProperty(`loading`)!==!1}set loading(e){this.assignProperty(`loading`,e)}get label(){return this.getProperty(`label`)??``}set label(e){this.assignProperty(`label`,e)}get content(){return this.contentPart}onMounted(){this.look.read(),this.renderLook()}countOf(e){let t=Number(e);return Number.isFinite(t)&&t>=1?Math.floor(t):1}renderBones(){let t=(this.peekProperty(`shape`)??`text`)===`text`?this.countOf(this.peekProperty(`lines`)):1;for(;this.bones.length>t;)this.bones.pop().dispose();for(;this.bones.length<t;){let t=new e(`span`);t.element.className=`mx-skeleton__bone`,t.element.setAttribute(`aria-hidden`,`true`),this.controls.insert(this.bones.length,t),this.bones.push(t)}}renderLoading(){let e=this.element,t=this.peekProperty(`loading`)!==!1;g(e,`data-loading`,t),h(e,`role`,t?`progressbar`:null),h(e,`aria-busy`,t?`true`:null),h(e,`aria-label`,t?this.peekProperty(`label`)||n.strings.loading:null)}renderLook(){let e=this.element;h(e,`data-shape`,this.peekProperty(`shape`)??`text`),h(e,`data-animation`,this.peekProperty(`animation`)??this.look.get(`animation`)??`wave`)}},T=`import { Skeleton, Stack, type SkeletonAnimation } from '@motifx-community/ui';\r
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
`,E=`import { reactive } from '@motifx/core';\r
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
`,D=`import { Skeleton, Stack } from '@motifx-community/ui';\r
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
`,O=[`wave`,`pulse`,`none`];function k(){return l(b,{gap:`lg`,style:`inline-size: 24rem; max-inline-size: 100%`,runover:{},childs:[l({initializeComponent:e=>{e.bindings.list(()=>O??[],e=>l(b,{indexkey:()=>e,gap:`sm`,runover:{},childs:[l(`span`,{initializeComponent:t=>{let n=l(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{if(e!=null)return typeof e==`function`?e():()=>e})},__childExpr:()=>e});t.controls.add(n)}},1),l(w,{lines:2,animation:e,runover:{},childs:[]})]}))}})]})}function A(){let e=i({loading:!0});return l(b,{gap:`lg`,style:`inline-size: 22rem; max-inline-size: 100%`,runover:{},childs:[l(o,{text:()=>e.loading?`Finish loading`:`Load again`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.loading=!e.loading)}},childs:[]}),l(y,{runover:{},childs:[l(b,{orientation:`horizontal`,align:`center`,runover:{},childs:[l(w,{shape:`circle`,loading:()=>e.loading,runover:{},childs:[l(v,{name:`Grace Hopper`,runover:{},childs:[]})]}),l(w,{lines:2,loading:()=>e.loading,grow:!0,runover:{},childs:[l(`strong`,{initializeComponent:e=>{let t=l(`text`,{initializeComponent:e=>{e.setText(`Grace Hopper`)}},1);e.controls.add(t)}},1),l(`div`,{initializeComponent:e=>{let t=l(`text`,{initializeComponent:e=>{e.setText(`Wrote the first compiler.`)}},1);e.controls.add(t)}},1)]})]})]})]})}function j(){return l(b,{gap:`lg`,style:`inline-size: 24rem; max-inline-size: 100%`,runover:{},childs:[l(w,{lines:3,runover:{},childs:[]}),l(w,{shape:`rect`,height:96,runover:{},childs:[]}),l(b,{orientation:`horizontal`,align:`center`,runover:{},childs:[l(w,{shape:`circle`,runover:{},childs:[]}),l(w,{shape:`circle`,width:24,runover:{},childs:[]})]})]})}var M=x(Object.assign({"./examples/Animations.tsx":T,"./examples/Loading.tsx":E,"./examples/Shapes.tsx":D})),N=[[`shape`,"`Bind<SkeletonShape>`","`'text'`","`text` for lines, `rect` for a block such as an image or field, or `circle` for an avatar."],[`lines`,"`Bind<number>`","`1`",`The number of text lines. The last of several lines is shorter.`],[`width`,"`Bind<string | number | null>`",`The available space`,`A CSS length, or a number in pixels. Also sets the size of a circle (the default comes from the design language).`],[`height`,"`Bind<string | number | null>`",`One line, or set by the design language`,`A CSS length, or a number in pixels.`],[`animation`,"`Bind<SkeletonAnimation>`",`Set by the design language`,"`wave`, `pulse` or `none`. Tactile, Lounge and Fluent use a wave, and Material and Lilac use a pulse."],[`loading`,"`Bind<boolean>`","`true`","Shows the skeleton while `true`, and then the JSX children."],[`label`,"`Bind<string>`",`The kit string “Loading…”`,`The text announced by screen readers while loading.`],[`visible`,`see Control`,``,`Properties shared by all controls.`]],P=[[`every prop above`,`read/write`,`Accepts a value or a function, the same as the prop.`],[`content`,`read-only`,`The part that holds the loaded content, for adding to it programmatically.`]],F=[[`Loading`,"A `progressbar` with `aria-busy` and a name (“Loading…” in the kit language). The shapes are hidden from screen readers."],[`Loaded`,`The role and busy state are removed, and the content is read normally.`],[`Motion`,`With reduced motion, the wave and pulse stay still, because their duration follows the motion tokens.`]],I=[[`.mx-skeleton`,"The skeleton. `data-shape`, `data-animation`, `data-loading`."],[`.mx-skeleton__bone`,`A shape (a line, a block or a circle).`],[`.mx-skeleton__content`,`The content shown after loading.`]],L=[[`skeleton.bone`,"Unit: a shape in `text`, `rect` and `circle`. `color` is the color the wave and pulse blend in."],[`skeleton.line-height, skeleton.line-gap, skeleton.last-line`,`A line of text, the space between lines, and the width of the last line.`],[`skeleton.circle-size, skeleton.rect-height`,`The default size of a circle or block.`],[`skeleton.animation, skeleton.duration, skeleton.easing, skeleton.wave-mix, skeleton.pulse-dim`,`The default animation, its duration, easing and intensity.`]];function R(){return d({initializeComponent:e=>{{let t=l(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=l(u,{text:`A placeholder that matches the shape of content that is loading, so the page keeps its layout while data arrives. If you provide content, it replaces the placeholder in the same place when loading ends.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let n=l(s,{anchor:`import`,title:`Import`,runover:{},childs:[l(r,{code:`
import { Skeleton } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(n);let i=l(s,{anchor:`shapes`,title:`Shapes`,runover:{},childs:[l(c,{files:M(`Shapes.tsx`),runover:{},childs:[l(j,{runover:{},childs:[]})]})]});e.controls.add(i);let a=l(s,{anchor:`loading`,title:`Showing content after loading`,runover:{},childs:[l(`p`,{initializeComponent:e=>{let t=l(u,{text:"`loading` accepts a value or a function. When it becomes `false`, the JSX children appear instead.",runover:{},childs:[]});e.controls.add(t)}},1),l(c,{files:M(`Loading.tsx`),runover:{},childs:[l(A,{runover:{},childs:[]})]})]});e.controls.add(a);let o=l(s,{anchor:`animations`,title:`Animation`,runover:{},childs:[l(c,{files:M(`Animations.tsx`),runover:{},childs:[l(k,{runover:{},childs:[]})]})]});e.controls.add(o);let d=l(s,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[l(p,{head:[`Topic`,`Details`],rows:F,runover:{},childs:[]})]});e.controls.add(d);let f=l(s,{anchor:`styling`,title:`Styling`,runover:{},childs:[l(p,{head:[`Hook`,`Description`],rows:I,runover:{},childs:[]}),l(`h3`,{initializeComponent:e=>{let t=l(u,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),l(p,{head:[`Token`,`Description`],rows:L,runover:{},childs:[]})]});e.controls.add(f);let m=l(s,{anchor:`api`,title:`API reference`,runover:{},childs:[l(`h3`,{initializeComponent:e=>{let t=l(u,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),l(p,{head:[`Prop`,`Type`,`Default`,`Description`],rows:N,runover:{},childs:[]}),l(`h3`,{initializeComponent:e=>{let t=l(u,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),l(p,{head:[`Property`,`Access`,`Description`],rows:P,runover:{},childs:[]})]});e.controls.add(m)}}})}export{R as default};