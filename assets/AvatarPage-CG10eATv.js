import{Lt as e,Mt as t,a as n,an as r,g as i,h as a,i as o,n as s,nn as c,r as l,rn as u,st as d,t as f}from"./doc-B1CtlCkV.js";import{l as p,s as m}from"./draw-parts-CqFeWILG.js";import{t as h}from"./Avatar-ClP0YHOQ.js";import{t as g}from"./Stack-AS0iyAxC.js";import{t as _}from"./sources-BXVvOiIY.js";var v=[`size`,`layout`,`max`,`total`,`label`],y=class extends d{look=new e(this.element,{layout:`--_avatar-group-layout`},()=>this.renderLook());more=new h({tone:`standard`});constructor(e){super(`div`,e);let t=this.props??{};if(this.element.classList.add(`mx-avatar-group`),this.element.setAttribute(`role`,`group`),this.more.element.classList.add(`mx-avatar-group__more`),this.childs?.length&&this.controls.add(...this.childs),this.controls.add(this.more),this.motif.on(`controladded`,()=>{this.controls.items.at(-1)!==this.more&&this.controls.move(this.more),this.renderShown()},!1),this.motif.on(`controlremoved`,()=>this.renderShown(),!1),typeof MutationObserver==`function`){let e=new MutationObserver(()=>this.renderShown());e.observe(this.element,{childList:!0}),this.motif.setDisposable(()=>e.disconnect())}for(let e of v)t[e]!==void 0&&this.bindProperty(e,t[e]);for(let e of[`max`,`total`,`label`])this.observeProperty(e,()=>this.renderShown());for(let e of[`size`,`layout`])this.observeProperty(e,()=>this.renderLook());i(this,()=>this.renderShown()),this.motif.setDisposable(this.look.watch())}get size(){return this.getProperty(`size`)??`md`}set size(e){this.assignProperty(`size`,e)}get layout(){return this.getProperty(`layout`)??this.look.get(`layout`)??`stack`}set layout(e){this.assignProperty(`layout`,e)}get max(){return b(this.getProperty(`max`))}set max(e){this.assignProperty(`max`,e)}get total(){return b(this.getProperty(`total`))}set total(e){this.assignProperty(`total`,e)}get label(){return this.getProperty(`label`)??``}set label(e){this.assignProperty(`label`,e)}get avatars(){return Array.from(this.element.children).filter(e=>e instanceof HTMLElement&&e!==this.more.element&&e.classList.contains(`mx-avatar`))}get hiddenCount(){let e=this.avatars.length,t=b(this.peekProperty(`max`));return Math.max(b(this.peekProperty(`total`))??e,e)-(t===null?e:Math.min(e,t))}onMounted(){this.look.read(),this.renderLook()}renderShown(){let e=b(this.peekProperty(`max`));this.avatars.forEach((t,n)=>m(t,`data-beyond`,e!==null&&n>=e));let n=this.hiddenCount;this.more.initials=t.text(`moreItems`,{count:n}),this.more.label=t.text(`avatarGroupMore`,{count:n}),m(this.more.element,`data-beyond`,n<=0),p(this.element,`aria-label`,this.peekProperty(`label`)||null)}renderLook(){p(this.element,`data-size`,this.peekProperty(`size`)??`md`),p(this.element,`data-layout`,this.peekProperty(`layout`)??this.look.get(`layout`)??`stack`)}};function b(e){let t=typeof e==`number`?e:NaN;return Number.isFinite(t)&&t>=0?Math.floor(t):null}var x=`import { Avatar, Stack } from '@motifx-community/ui';\r
\r
// An inline SVG sunset, so that the example needs no network access.\r
const PICTURE = \`data:image/svg+xml,\${encodeURIComponent(\r
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="sky" x2="0" y2="1">' +\r
    '<stop offset="0" stop-color="#3b5bdb"/><stop offset="1" stop-color="#f08c00"/></linearGradient></defs>' +\r
    '<rect width="64" height="64" fill="url(#sky)"/><circle cx="32" cy="40" r="12" fill="#ffd43b"/>' +\r
    '<path d="M0 46h64v18H0z" fill="#2b8a3e"/></svg>',\r
)}\`;\r
\r
/** A picture; initials when there is none or it cannot load; a person icon without a name. */\r
export default function Content() {\r
  return (\r
    <Stack orientation="horizontal" wrap align="center">\r
      <Avatar name="Ada Lovelace" src={PICTURE} />\r
      <Avatar name="Ada Lovelace" />\r
      <Avatar name="Alan Turing" src="does-not-exist.png" />\r
      <Avatar initials="QA" label="Quality team" />\r
      <Avatar />\r
    </Stack>\r
  );\r
}\r
`,S=`import { Avatar, AvatarGroup, Stack } from '@motifx-community/ui';\r
\r
const TEAM = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra', 'Barbara Liskov'];\r
\r
/** Stacked with the rest counted, side by side, and a total larger than the avatars given. */\r
export default function Groups() {\r
  return (\r
    <Stack gap="lg">\r
      <AvatarGroup max={3} label="Team">\r
        {TEAM.map((name) => (\r
          <Avatar key={name} name={name} />\r
        ))}\r
      </AvatarGroup>\r
      <AvatarGroup layout="spread" size="sm" label="Team">\r
        {TEAM.map((name) => (\r
          <Avatar key={name} name={name} />\r
        ))}\r
      </AvatarGroup>\r
      <AvatarGroup size="lg" total={42} label="Followers">\r
        {TEAM.slice(0, 3).map((name) => (\r
          <Avatar key={name} name={name} />\r
        ))}\r
      </AvatarGroup>\r
    </Stack>\r
  );\r
}\r
`,C=`import { reactive } from '@motifx/core';\r
import { Avatar, Button, Stack, type AvatarStatus } from '@motifx-community/ui';\r
\r
const PEOPLE = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper'];\r
const STATUSES: AvatarStatus[] = ['online', 'away', 'busy', 'offline'];\r
\r
/** An avatar in JSX tracks its functions, and one created with \`new\` accepts the same properties programmatically. */\r
export default function Programmatic() {\r
  const s = reactive({ person: 0, status: 0 });\r
  const coded = new Avatar({ name: 'Edsger Dijkstra', tone: 'success', shape: 'square' });\r
\r
  return (\r
    <Stack orientation="horizontal" wrap align="center">\r
      <Avatar name={() => PEOPLE[s.person]} status={() => STATUSES[s.status]} />\r
      <Button text="Next person" variant="outline" onclick={() => (s.person = (s.person + 1) % PEOPLE.length)} />\r
      <Button text="Next presence" variant="outline" onclick={() => (s.status = (s.status + 1) % STATUSES.length)} />\r
      <span onConfig={(c) => c.controls.add(coded)} />\r
    </Stack>\r
  );\r
}\r
`,w=`import { Avatar, Stack, type AvatarSize, type AvatarStatus } from '@motifx-community/ui';\r
\r
const SIZES: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];\r
const STATUSES: AvatarStatus[] = ['online', 'away', 'busy', 'offline'];\r
\r
/** Each size, with each presence. */\r
export default function Sizes() {\r
  return (\r
    <Stack>\r
      {STATUSES.map((status) => (\r
        <Stack key={status} orientation="horizontal" wrap align="center">\r
          {SIZES.map((size) => (\r
            <Avatar key={size} name="Grace Hopper" size={size} status={status} />\r
          ))}\r
        </Stack>\r
      ))}\r
    </Stack>\r
  );\r
}\r
`,T=`import { Avatar, Stack, type AvatarShape, type AvatarTone } from '@motifx-community/ui';\r
\r
const TONES: AvatarTone[] = ['standard', 'accent', 'info', 'success', 'caution', 'danger'];\r
const SHAPES: AvatarShape[] = ['circle', 'square'];\r
const PEOPLE = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra', 'Barbara Liskov', 'Linus Torvalds'];\r
\r
/** Every tone in each shape; \`auto\` takes a tone from the name, the same for the same name. */\r
export default function Tones() {\r
  return (\r
    <Stack>\r
      {SHAPES.map((shape) => (\r
        <Stack key={shape} orientation="horizontal" wrap align="center">\r
          {TONES.map((tone) => (\r
            <Avatar key={tone} name={tone} tone={tone} shape={shape} label={\`\${tone}, \${shape}\`} />\r
          ))}\r
        </Stack>\r
      ))}\r
      <Stack orientation="horizontal" wrap align="center">\r
        {PEOPLE.map((name) => (\r
          <Avatar key={name} name={name} tone="auto" />\r
        ))}\r
      </Stack>\r
    </Stack>\r
  );\r
}\r
`,E=`data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22sky%22%20x2%3D%220%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%233b5bdb%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23f08c00%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20fill%3D%22url(%23sky)%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2240%22%20r%3D%2212%22%20fill%3D%22%23ffd43b%22%2F%3E%3Cpath%20d%3D%22M0%2046h64v18H0z%22%20fill%3D%22%232b8a3e%22%2F%3E%3C%2Fsvg%3E`;function D(){return c(g,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[c(h,{name:`Ada Lovelace`,src:E,runover:{},childs:[]}),c(h,{name:`Ada Lovelace`,runover:{},childs:[]}),c(h,{name:`Alan Turing`,src:`does-not-exist.png`,runover:{},childs:[]}),c(h,{initials:`QA`,label:`Quality team`,runover:{},childs:[]}),c(h,{runover:{},childs:[]})]})}var O=[`Ada Lovelace`,`Alan Turing`,`Grace Hopper`],k=[`online`,`away`,`busy`,`offline`];function A(){let e=r({person:0,status:0}),t=new h({name:`Edsger Dijkstra`,tone:`success`,shape:`square`});return c(g,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[c(h,{name:()=>O[e.person],status:()=>k[e.status],runover:{},childs:[]}),c(a,{text:`Next person`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.person=(e.person+1)%O.length)}},childs:[]}),c(a,{text:`Next presence`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.status=(e.status+1)%k.length)}},childs:[]}),c(`span`,{onConfig:e=>e.controls.add(t)})]})}var j=[`Ada Lovelace`,`Alan Turing`,`Grace Hopper`,`Edsger Dijkstra`,`Barbara Liskov`];function M(){return c(g,{gap:`lg`,runover:{},childs:[c(y,{max:3,label:`Team`,runover:{},childs:[c({initializeComponent:e=>{e.bindings.list(()=>j??[],e=>c(h,{indexkey:()=>e,name:e,runover:{},childs:[]}))}})]}),c(y,{layout:`spread`,size:`sm`,label:`Team`,runover:{},childs:[c({initializeComponent:e=>{e.bindings.list(()=>j??[],e=>c(h,{indexkey:()=>e,name:e,runover:{},childs:[]}))}})]}),c(y,{size:`lg`,total:42,label:`Followers`,runover:{},childs:[c({initializeComponent:e=>{e.bindings.list(()=>{let e;return j&&j.slice&&(e=j.slice(0,3))!=null?typeof e==`function`?e():e:[]},e=>c(h,{indexkey:()=>e,name:e,runover:{},childs:[]}))}})]})]})}var N=[`xs`,`sm`,`md`,`lg`,`xl`],P=[`online`,`away`,`busy`,`offline`];function F(){return c(g,{runover:{},childs:[c({initializeComponent:e=>{e.bindings.list(()=>P??[],e=>c(g,{indexkey:()=>e,orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[c({initializeComponent:t=>{t.bindings.list(()=>N??[],t=>c(h,{indexkey:()=>t,name:`Grace Hopper`,size:t,status:e,runover:{},childs:[]}))}})]}))}})]})}var I=[`standard`,`accent`,`info`,`success`,`caution`,`danger`],L=[`circle`,`square`],R=[`Ada Lovelace`,`Alan Turing`,`Grace Hopper`,`Edsger Dijkstra`,`Barbara Liskov`,`Linus Torvalds`];function z(){return c(g,{runover:{},childs:[c({initializeComponent:e=>{e.bindings.list(()=>L??[],e=>c(g,{indexkey:()=>e,orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[c({initializeComponent:t=>{t.bindings.list(()=>I??[],t=>c(h,{indexkey:()=>t,name:t,tone:t,shape:e,label:`${t}, ${e}`,runover:{},childs:[]}))}})]}))}}),c(g,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[c({initializeComponent:e=>{e.bindings.list(()=>R??[],e=>c(h,{indexkey:()=>e,name:e,tone:`auto`,runover:{},childs:[]}))}})]})]})}var B=_(Object.assign({"./examples/Content.tsx":x,"./examples/Groups.tsx":S,"./examples/Programmatic.tsx":C,"./examples/Sizes.tsx":w,"./examples/Tones.tsx":T})),V=[[`src`,"`Bind<string | null>`","`null`",`The picture. Until it loads, or if it fails, the initials appear, or the person icon if there are none.`],[`name`,"`Bind<string>`","`''`",`The person's name. It is used to create the initials and is announced by screen readers.`],[`initials`,"`Bind<string>`","`''`","Custom initials that replace the ones created from `name`."],[`label`,"`Bind<string>`","`''`",`The text screen readers announce instead of the name.`],[`size`,"`Bind<AvatarSize>`","`'md'`","`xs`, `sm`, `md`, `lg` or `xl`. In a group, the group's size applies."],[`shape`,"`Bind<AvatarShape>`","Set by the design language (`circle`)","`circle` or `square` (using the design language's corner radius for the size)."],[`tone`,"`Bind<AvatarTone>`",`Set by the design language`,"`standard`, `accent`, `info`, `success`, `caution`, `danger`, or `auto`, which derives a tone from the name so the same name always has the same tone. Material and Lilac use `accent`, and the others use `standard`."],[`status`,"`Bind<AvatarStatus | null>`","`null`","`online`, `away`, `busy` or `offline`: a presence dot on the lower end corner."],[`visible, tabStop`,`see Control`,``,`Properties shared by all controls.`]],H=[[`every prop above`,`read/write`,`Accepts a value or a function, the same as the prop.`],[`shownInitials`,`read-only`,`The displayed initials: the ones provided, otherwise the ones created from the name.`],[`showsPicture`,`read-only`,`Indicates whether the picture has loaded and is currently shown.`]],U=[[`size`,"`Bind<AvatarSize>`","`'md'`",`The size of every avatar in the group.`],[`layout`,"`Bind<AvatarGroupLayout>`","Set by the design language (`stack`)","`stack` overlaps each avatar on the previous one, and `spread` places them side by side."],[`max`,"`Bind<number | null>`","`null`","The maximum number of avatars shown. The others are counted in a `+N` after them."],[`total`,"`Bind<number | null>`","`null`","The total number of people when only some are provided. The rest are counted in the `+N`."],[`label`,"`Bind<string>`","`''`",`The accessible name of the group (“Members”).`]],W=[[`every prop above`,`read/write`,`Accepts a value or a function, the same as the prop.`],[`avatars`,`read-only`,"The elements of the provided avatars in order, including those from JSX lists. The `+N` is not included."],[`hiddenCount`,`read-only`,"The number of people counted in the `+N`, or 0 when it is not shown."]],G=[[`initialsOf(name, locale)`,"`string`",`Creates initials from a name: the first letters of the first and last words, using the capitalization rules of the language.`]],K=[[`Name`,'With a name or label, the avatar is an image with that name (`role="img"`), and the presence follows it (“Ada Lovelace, Away”).'],[`No name`,`An avatar with no name, label or presence is hidden from screen readers.`],[`Picture`,"The picture has an empty `alt`, because the avatar carries the name."],[`Group`,'`role="group"` with its label. The `+N` states how many people are not shown (“8 more people”).'],[`Colour`,`Presence is not conveyed by color alone. It is included in the name screen readers announce, and Fluent draws a mark in the dot.`]],q=[[`.mx-avatar`,"The avatar. `data-size`, `data-shape`, `data-tone`."],[`.mx-avatar__image`,"The picture. `data-pending` until it loads."],[`.mx-avatar__initials, .mx-avatar__icon`,`The initials, and the person icon shown without them.`],[`.mx-avatar__status`,"The presence dot. `data-status`."],[`.mx-avatar-group`,"The group. `data-size`, `data-layout`. An avatar that is not shown has `data-beyond`."],[`.mx-avatar-group__more`,"The `+N` avatar."]],J=[[`avatar.avatar`,`Unit: the avatar at rest (the standard tone) and in each tone.`],[`avatar.icon, avatar.status, avatar.status-icon`,`Units: the person icon, the presence dot and its ring per status, and a mark inside the dot per status.`],[`avatar.size.*, avatar.font-size.*, avatar.icon-size.*, avatar.status-size.*, avatar.square-radius.*`,`The avatar, its initials, its icon, its dot and its square corners, per size.`],[`avatar.tone, avatar.shape`,`The default tone and shape.`],[`avatar-group.stacked`,`Unit: the ring that separates a stacked avatar from the one it overlaps.`],[`avatar-group.overlap.*, avatar-group.gap.*, avatar-group.layout`,`The overlap of stacked avatars, the gap between spread avatars, and the default layout.`]];function Y(){return u({initializeComponent:e=>{{let t=c(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=c(l,{text:`Represents a person with a picture, initials or an icon, with an optional presence indicator on its corner. A group stacks or spreads avatars and counts the ones it does not show.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let r=c(o,{anchor:`import`,title:`Import`,runover:{},childs:[c(n,{code:`
import { Avatar, AvatarGroup } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=c(o,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[c(`p`,{initializeComponent:e=>{let t=c(l,{text:"Every prop accepts a value or a function. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(t)}},1),c(s,{files:B(`Programmatic.tsx`),runover:{},childs:[c(A,{runover:{},childs:[]})]})]});e.controls.add(i);let a=c(o,{anchor:`content`,title:`Picture, initials and icon`,runover:{},childs:[c(`p`,{initializeComponent:e=>{let t=c(l,{text:`The picture appears once it has loaded. Until then, or if it fails to load, the initials appear. Without a name, the person icon appears.`,runover:{},childs:[]});e.controls.add(t)}},1),c(s,{files:B(`Content.tsx`),runover:{},childs:[c(D,{runover:{},childs:[]})]})]});e.controls.add(a);let u=c(o,{anchor:`tones`,title:`Tones and shapes`,runover:{},childs:[c(s,{files:B(`Tones.tsx`),runover:{},childs:[c(z,{runover:{},childs:[]})]})]});e.controls.add(u);let d=c(o,{anchor:`sizes`,title:`Sizes and presence`,runover:{},childs:[c(s,{files:B(`Sizes.tsx`),runover:{},childs:[c(F,{runover:{},childs:[]})]})]});e.controls.add(d);let p=c(o,{anchor:`groups`,title:`Groups`,runover:{},childs:[c(`p`,{initializeComponent:e=>{let t=c(l,{text:"`max` sets how many avatars are shown, and the rest are counted in a `+N`. `total` also counts people who are not provided. The group sets the size of all its avatars.",runover:{},childs:[]});e.controls.add(t)}},1),c(s,{files:B(`Groups.tsx`),runover:{},childs:[c(M,{runover:{},childs:[]})]})]});e.controls.add(p);let m=c(o,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[c(f,{head:[`Topic`,`Details`],rows:K,runover:{},childs:[]})]});e.controls.add(m);let h=c(o,{anchor:`i18n`,title:`Localization`,runover:{},childs:[c(`p`,{initializeComponent:e=>{let t=c(l,{text:"Initials use the capitalization rules of the kit language (`uiLocale`), so “ilgin” becomes “İ” in Turkish. The presence and `+N` strings are kit strings (`presenceOnline` … `presenceOffline`, `avatarPresence`, `moreItems`, `avatarGroupMore`) and change with the language.",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(h);let g=c(o,{anchor:`styling`,title:`Styling`,runover:{},childs:[c(f,{head:[`Hook`,`Description`],rows:q,runover:{},childs:[]}),c(`h3`,{initializeComponent:e=>{let t=c(l,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),c(f,{head:[`Token`,`Description`],rows:J,runover:{},childs:[]})]});e.controls.add(g);let _=c(o,{anchor:`api`,title:`API reference`,runover:{},childs:[c(`h3`,{initializeComponent:e=>{let t=c(l,{text:`Avatar props`,runover:{},childs:[]});e.controls.add(t)}},1),c(f,{head:[`Prop`,`Type`,`Default`,`Description`],rows:V,runover:{},childs:[]}),c(`h3`,{initializeComponent:e=>{let t=c(l,{text:`Avatar properties`,runover:{},childs:[]});e.controls.add(t)}},1),c(f,{head:[`Property`,`Access`,`Description`],rows:H,runover:{},childs:[]}),c(`h3`,{initializeComponent:e=>{let t=c(l,{text:`AvatarGroup props`,runover:{},childs:[]});e.controls.add(t)}},1),c(f,{head:[`Prop`,`Type`,`Default`,`Description`],rows:U,runover:{},childs:[]}),c(`h3`,{initializeComponent:e=>{let t=c(l,{text:`AvatarGroup properties`,runover:{},childs:[]});e.controls.add(t)}},1),c(f,{head:[`Property`,`Access`,`Description`],rows:W,runover:{},childs:[]}),c(`h3`,{initializeComponent:e=>{let t=c(l,{text:`Functions`,runover:{},childs:[]});e.controls.add(t)}},1),c(f,{head:[`Function`,`Returns`,`Description`],rows:G,runover:{},childs:[]})]});e.controls.add(_)}}})}export{Y as default};