import{F as e,Qn as t,Zn as n,er as r,n as i}from"./next-id-CtzpBrBT.js";import{t as a}from"./TextBox-iHQY3j6o.js";import{n as o,t as s}from"./Tabs-V84b8pE_.js";import{t as c}from"./Stack-wRt1e9tO.js";import{a as l,i as u,n as d,r as f,t as p}from"./docs-B_LZlyP5.js";import{t as m}from"./sources-BXVvOiIY.js";import{t as h}from"./kit-texts-BMQUznlf.js";var g=`import { reactive } from '@motifx/core';\r
import { Button, Tab, Tabs } from '@motifx-community/ui';\r
\r
const HomeIcon = () => (\r
  <svg viewBox="0 0 16 16" aria-hidden="true">\r
    <path d="M2.5 7.5L8 3l5.5 4.5M4 6.5v6.5h8V6.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />\r
  </svg>\r
);\r
\r
/** A close button on every tab but Home; onClose keeps the draft open while it is protected. */\r
export default function Closable() {\r
  const s = reactive({ keepDraft: true });\r
  return (\r
    <>\r
      <Button\r
        text={() => (s.keepDraft ? 'Draft is protected' : 'Draft can close')}\r
        variant="outline"\r
        size="sm"\r
        toggle\r
        x-model={() => s.keepDraft}\r
      />\r
      <Tabs\r
        label="Documents"\r
        closable\r
        onClose={(e) => {\r
          if (e.tab.key === 'draft' && s.keepDraft) e.cancel = true;\r
        }}\r
      >\r
        <Tab title="Home" icon={() => <HomeIcon />} closable={false}>\r
          <p>Home cannot be closed.</p>\r
        </Tab>\r
        <Tab key="draft" title="Draft">\r
          <p>Closing is cancelled while the draft is protected.</p>\r
        </Tab>\r
        <Tab title="Notes">\r
          <p>Notes.</p>\r
        </Tab>\r
        <Tab title="Ideas">\r
          <p>Ideas.</p>\r
        </Tab>\r
      </Tabs>\r
    </>\r
  );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { Button, Tab, Tabs } from '@motifx-community/ui';\r
\r
const MailIcon = () => (\r
  <svg viewBox="0 0 16 16" aria-hidden="true">\r
    <path d="M2.5 4h11v8h-11zM2.5 4.5L8 8.5l5.5-4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />\r
  </svg>\r
);\r
\r
/** A tab with an icon, a count that follows state and a tooltip, and a disabled tab. */\r
export default function IconsAndBadges() {\r
  const s = reactive({ unread: 3 });\r
  return (\r
    <Tabs label="Mail">\r
      <Tab title="Inbox" icon={() => <MailIcon />} badge={() => (s.unread ? s.unread : null)} hint="Mail you have not read">\r
        <Button text="Read one" variant="outline" onclick={() => (s.unread = Math.max(0, s.unread - 1))} />\r
      </Tab>\r
      <Tab title="Sent">\r
        <p>Sent mail.</p>\r
      </Tab>\r
      <Tab title="Archive" enabled={false}>\r
        <p>Archive.</p>\r
      </Tab>\r
    </Tabs>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Stack, Tab, Tabs, TextBox } from '@motifx-community/ui';\r
\r
/** Panels created when first shown: one is kept, and one is recreated each time it is shown. */\r
export default function LazyPanels() {\r
  const s = reactive({ builds: 0 });\r
\r
  const tabs = new Tabs({ label: 'Lazy panels' });\r
  tabs.add(new Tab({ title: 'First', content: () => <p>Always here.</p> }));\r
  tabs.add(\r
    new Tab({\r
      title: 'Kept',\r
      content: () => {\r
        s.builds++;\r
        return <TextBox label="Type, switch tabs, come back" />;\r
      },\r
    }),\r
  );\r
  tabs.add(\r
    new Tab({\r
      title: 'Made each time',\r
      keepAlive: false,\r
      content: () => {\r
        s.builds++;\r
        return <TextBox label="This one starts empty each time" />;\r
      },\r
    }),\r
  );\r
\r
  return (\r
    <>\r
      <Stack style="inline-size: 100%" onBuilt={(c) => c.controls.add(tabs)} />\r
      <output class="tabs-builds">{() => \`Panels built: \${s.builds}\`}</output>\r
    </>\r
  );\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { Button, uiLocale } from '@motifx-community/ui';\r
import { kitTexts } from '../../../shared/kit-texts';\r
\r
/** Switches the texts of every component on the page, the tabs' close button included. */\r
export default function Localization() {\r
  const s = reactive({ lang: 'en' });\r
  const toggle = () => {\r
    s.lang = s.lang === 'en' ? 'tr' : 'en';\r
    void uiLocale.use(s.lang);\r
  };\r
  return (\r
    <>\r
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />\r
      <span>\r
        The close button reads <output class="tabs-close-name">{() => kitTexts.strings.close}</output>\r
      </span>\r
    </>\r
  );\r
}\r
`,b=`import { Tab, Tabs } from '@motifx-community/ui';\r
\r
/** Arrow keys move focus only; Enter or Space selects. */\r
export default function ManualActivation() {\r
  return (\r
    <Tabs label="Manual" class="tabs-manual" activation="manual">\r
      <Tab title="One">\r
        <p>One.</p>\r
      </Tab>\r
      <Tab title="Two">\r
        <p>Two.</p>\r
      </Tab>\r
      <Tab title="Three">\r
        <p>Three.</p>\r
      </Tab>\r
    </Tabs>\r
  );\r
}\r
`,x=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Tab, Tabs } from '@motifx-community/ui';\r
\r
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];\r
\r
/** Twelve tabs in a narrow strip, with scroll buttons that can be turned off. */\r
export default function ManyTabs() {\r
  const s = reactive({ scrollButtons: true });\r
\r
  const months = new Tabs({ label: 'Months', scrollButtons: () => s.scrollButtons });\r
  for (const month of MONTHS) months.add(new Tab({ title: month, content: () => <p>{month}: nothing planned yet.</p> }));\r
\r
  return (\r
    <>\r
      <Button text="Scroll buttons" variant="outline" size="sm" toggle x-model={() => s.scrollButtons} />\r
      <Stack class="tabs-months" style="inline-size: 100%; max-inline-size: 28rem" onBuilt={(c) => c.controls.add(months)} />\r
    </>\r
  );\r
}\r
`,S=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Tab, Tabs, type TabsPlacement } from '@motifx-community/ui';\r
\r
const PLACEMENTS: TabsPlacement[] = ['top', 'bottom', 'start', 'end'];\r
\r
/** The strip above, below, or beside the panel. */\r
export default function Placement() {\r
  const s = reactive({ placement: 'top' as TabsPlacement });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Placement">\r
        {PLACEMENTS.map((placement) => (\r
          <Button\r
            key={placement}\r
            text={placement}\r
            size="sm"\r
            variant={() => (s.placement === placement ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.placement === placement}\r
            onclick={() => (s.placement = placement)}\r
          />\r
        ))}\r
      </Stack>\r
      <Tabs label="Placement" class="tabs-placement" placement={() => s.placement}>\r
        <Tab title="Profile">\r
          <p>Profile.</p>\r
        </Tab>\r
        <Tab title="Security">\r
          <p>Security.</p>\r
        </Tab>\r
        <Tab title="Billing">\r
          <p>Billing.</p>\r
        </Tab>\r
      </Tabs>\r
    </>\r
  );\r
}\r
`,C=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Tab, Tabs, TextBox } from '@motifx-community/ui';\r
\r
/** Tabs from JSX bound with x-model, and tabs created with \`new\` and added programmatically. */\r
export default function Programmatic() {\r
  const s = reactive({ page: 'general' as string | number, name: '', log: '' });\r
  let added = 0;\r
\r
  const reports = new Tabs({ label: 'Reports', closable: true });\r
  reports.add(new Tab({ title: 'Summary', content: () => <p>The summary, built when it was first shown.</p> }));\r
  reports.onSelectionChanged((e) => (s.log = e.tab ? \`Selected “\${e.tab.title}”\${e.byUser ? ' by the user' : ' programmatically'}.\` : 'No tab left.'));\r
\r
  const addReport = () => {\r
    const n = ++added;\r
    const tab = reports.add(new Tab({ title: \`Report \${n}\`, content: () => <p>Report {n}.</p> }));\r
    reports.select(tab);\r
  };\r
\r
  return (\r
    <>\r
      <Tabs label="Settings" x-model={() => s.page}>\r
        <Tab key="general" title="&General">\r
          <TextBox label="Name" x-model={() => s.name} helpText="Its text stays while you switch tabs." />\r
        </Tab>\r
        <Tab key="advanced" title="&Advanced">\r
          <p>Advanced settings.</p>\r
        </Tab>\r
        <Tab key="about" title="A&bout">\r
          <p>Version 1.0.</p>\r
        </Tab>\r
      </Tabs>\r
      <output class="tabs-page">{() => \`value: "\${s.page}"\`}</output>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Add a report programmatically" variant="outline" onclick={addReport} />\r
        <output class="tabs-log">{() => s.log}</output>\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" class="tabs-coded" style="inline-size: 100%" onBuilt={(c) => c.controls.add(reports)} />\r
    </>\r
  );\r
}\r
`,w=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Tab, Tabs, type TabsVariant } from '@motifx-community/ui';\r
\r
const VARIANTS: TabsVariant[] = ['line', 'pill'];\r
\r
/** Both variants in the three sizes, stretched or not. */\r
export default function VariantsAndSizes() {\r
  const s = reactive({ variant: 'line' as TabsVariant, stretch: false });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        {VARIANTS.map((variant) => (\r
          <Button\r
            key={variant}\r
            text={variant}\r
            size="sm"\r
            variant={() => (s.variant === variant ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.variant === variant}\r
            onclick={() => (s.variant = variant)}\r
          />\r
        ))}\r
        <Button text="Stretch" size="sm" variant="outline" toggle x-model={() => s.stretch} />\r
      </Stack>\r
      {(['sm', 'md', 'lg'] as const).map((size) => (\r
        <Tabs key={size} label={\`Size \${size}\`} size={size} variant={() => s.variant} stretch={() => s.stretch}>\r
          <Tab title="Day">\r
            <p>{\`Size \${size}.\`}</p>\r
          </Tab>\r
          <Tab title="Week">\r
            <p>Week.</p>\r
          </Tab>\r
          <Tab title="Month">\r
            <p>Month.</p>\r
          </Tab>\r
        </Tabs>\r
      ))}\r
    </>\r
  );\r
}\r
`,T=()=>n(`svg`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({viewBox:`0 0 16 16`,"aria-hidden":`true`});let t=n(`path`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({d:`M2.5 7.5L8 3l5.5 4.5M4 6.5v6.5h8V6.5`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.3`,"stroke-linejoin":`round`})}});e.controls.add(t)}});function E(){let e=r({keepDraft:!0});return t({initializeComponent:t=>{{let r=n(i,{text:()=>e.keepDraft?`Draft is protected`:`Draft can close`,variant:`outline`,size:`sm`,toggle:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.keepDraft,t=>{let n=e;n!=null&&typeof n.keepDraft!=`function`&&(n.keepDraft=t)})}},childs:[]});t.controls.add(r);let a=n(s,{label:`Documents`,closable:!0,onClose:t=>{t.tab.key===`draft`&&e.keepDraft&&(t.cancel=!0)},runover:{},childs:[n(o,{title:`Home`,icon:()=>n(T,{runover:{},childs:[]}),closable:!1,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Home cannot be closed.`)}},1);e.controls.add(t)}},1)]}),n(o,{indexkey:()=>`draft`,title:`Draft`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Closing is cancelled while the draft is protected.`)}},1);e.controls.add(t)}},1)]}),n(o,{title:`Notes`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Notes.`)}},1);e.controls.add(t)}},1)]}),n(o,{title:`Ideas`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Ideas.`)}},1);e.controls.add(t)}},1)]})]});t.controls.add(a)}}})}function D(){let e=r({page:`general`,name:``,log:``}),l=0,u=new s({label:`Reports`,closable:!0});u.add(new o({title:`Summary`,content:()=>n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`The summary, built when it was first shown.`)}},1);e.controls.add(t)}},1)})),u.onSelectionChanged(t=>e.log=t.tab?`Selected “${t.tab.title}”${t.byUser?` by the user`:` programmatically`}.`:`No tab left.`);let d=()=>{let e=++l,t=u.add(new o({title:`Report ${e}`,content:()=>n(`p`,{initializeComponent:t=>{let r=n(`text`,{initializeComponent:e=>{e.setText(`Report `)}},1);t.controls.add(r);let i=n(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{if(e!=null)return typeof e==`function`?e():()=>e})},__childExpr:()=>e});t.controls.add(i);let a=n(`text`,{initializeComponent:e=>{e.setText(`.`)}},1);t.controls.add(a)}},1)}));u.select(t)};return t({initializeComponent:t=>{{let r=n(s,{label:`Settings`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.page,t=>{let n=e;n!=null&&typeof n.page!=`function`&&(n.page=t)})}},childs:[n(o,{indexkey:()=>`general`,title:`&General`,runover:{},childs:[n(a,{label:`Name`,helpText:`Its text stays while you switch tabs.`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.name,t=>{let n=e;n!=null&&typeof n.name!=`function`&&(n.name=t)})}},childs:[]})]}),n(o,{indexkey:()=>`advanced`,title:`&Advanced`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Advanced settings.`)}},1);e.controls.add(t)}},1)]}),n(o,{indexkey:()=>`about`,title:`A&bout`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Version 1.0.`)}},1);e.controls.add(t)}},1)]})]});t.controls.add(r);let l=n(`output`,{initializeComponent:t=>{t.class.add(`tabs-page`),t.bindings.method(()=>`value: "${e.page}"`)}},1);t.controls.add(l);let f=n(c,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(i,{text:`Add a report programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,d)}},childs:[]}),n(`output`,{initializeComponent:t=>{t.class.add(`tabs-log`),t.bindings.method(()=>e.log)}},1)]});t.controls.add(f);let p=n(c,{orientation:`horizontal`,wrap:!0,align:`center`,class:`tabs-coded`,style:`inline-size: 100%`,runover:{onBuilt:e=>e.controls.add(u)},childs:[]});t.controls.add(p)}}})}var O=()=>n(`svg`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({viewBox:`0 0 16 16`,"aria-hidden":`true`});let t=n(`path`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({d:`M2.5 4h11v8h-11zM2.5 4.5L8 8.5l5.5-4`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.3`,"stroke-linejoin":`round`})}});e.controls.add(t)}});function k(){let e=r({unread:3});return n(s,{label:`Mail`,runover:{},childs:[n(o,{title:`Inbox`,icon:()=>n(O,{runover:{},childs:[]}),badge:()=>e.unread?e.unread:null,hint:`Mail you have not read`,runover:{},childs:[n(i,{text:`Read one`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.unread=Math.max(0,e.unread-1))}},childs:[]})]}),n(o,{title:`Sent`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Sent mail.`)}},1);e.controls.add(t)}},1)]}),n(o,{title:`Archive`,enabled:!1,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Archive.`)}},1);e.controls.add(t)}},1)]})]})}function A(){let e=r({builds:0}),i=new s({label:`Lazy panels`});return i.add(new o({title:`First`,content:()=>n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Always here.`)}},1);e.controls.add(t)}},1)})),i.add(new o({title:`Kept`,content:()=>(e.builds++,n(a,{label:`Type, switch tabs, come back`,runover:{},childs:[]}))})),i.add(new o({title:`Made each time`,keepAlive:!1,content:()=>(e.builds++,n(a,{label:`This one starts empty each time`,runover:{},childs:[]}))})),t({initializeComponent:t=>{{let r=n(c,{style:`inline-size: 100%`,runover:{onBuilt:e=>e.controls.add(i)},childs:[]});t.controls.add(r);let a=n(`output`,{initializeComponent:t=>{t.class.add(`tabs-builds`),t.bindings.method(()=>`Panels built: ${e.builds}`)}},1);t.controls.add(a)}}})}function j(){let a=r({lang:`en`}),o=()=>{a.lang=a.lang===`en`?`tr`:`en`,e.use(a.lang)};return t({initializeComponent:e=>{{let t=n(i,{text:()=>a.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,o)}},childs:[]});e.controls.add(t);let r=n(`span`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`The close button reads `)}},1);e.controls.add(t);let r=n(`output`,{initializeComponent:e=>{e.class.add(`tabs-close-name`),e.bindings.method(()=>h.strings.close)}},1);e.controls.add(r)}},1);e.controls.add(r)}}})}function M(){return n(s,{label:`Manual`,class:`tabs-manual`,activation:`manual`,runover:{},childs:[n(o,{title:`One`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`One.`)}},1);e.controls.add(t)}},1)]}),n(o,{title:`Two`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Two.`)}},1);e.controls.add(t)}},1)]}),n(o,{title:`Three`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Three.`)}},1);e.controls.add(t)}},1)]})]})}var N=[`January`,`February`,`March`,`April`,`May`,`June`,`July`,`August`,`September`,`October`,`November`,`December`];function P(){let e=r({scrollButtons:!0}),a=new s({label:`Months`,scrollButtons:()=>e.scrollButtons});for(let e of N)a.add(new o({title:e,content:()=>n(`p`,{initializeComponent:t=>{let r=n(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{if(e!=null)return typeof e==`function`?e():()=>e})},__childExpr:()=>e});t.controls.add(r);let i=n(`text`,{initializeComponent:e=>{e.setText(`: nothing planned yet.`)}},1);t.controls.add(i)}},1)}));return t({initializeComponent:t=>{{let r=n(i,{text:`Scroll buttons`,variant:`outline`,size:`sm`,toggle:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.scrollButtons,t=>{let n=e;n!=null&&typeof n.scrollButtons!=`function`&&(n.scrollButtons=t)})}},childs:[]});t.controls.add(r);let o=n(c,{class:`tabs-months`,style:`inline-size: 100%; max-inline-size: 28rem`,runover:{onBuilt:e=>e.controls.add(a)},childs:[]});t.controls.add(o)}}})}var F=[`top`,`bottom`,`start`,`end`];function I(){let e=r({placement:`top`});return t({initializeComponent:t=>{{let r=n(c,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Placement`,runover:{},childs:[n({initializeComponent:t=>{t.bindings.list(()=>F??[],t=>n(i,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.placement===t?`solid`:`ghost`,"aria-pressed":()=>e.placement===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.placement=t)}},childs:[]}))}})]});t.controls.add(r);let a=n(s,{label:`Placement`,class:`tabs-placement`,placement:()=>e.placement,runover:{},childs:[n(o,{title:`Profile`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Profile.`)}},1);e.controls.add(t)}},1)]}),n(o,{title:`Security`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Security.`)}},1);e.controls.add(t)}},1)]}),n(o,{title:`Billing`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Billing.`)}},1);e.controls.add(t)}},1)]})]});t.controls.add(a)}}})}var L=[`line`,`pill`];function R(){let e=r({variant:`line`,stretch:!1});return t({initializeComponent:t=>{{let r=n(c,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n({initializeComponent:t=>{t.bindings.list(()=>L??[],t=>n(i,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.variant===t?`solid`:`ghost`,"aria-pressed":()=>e.variant===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.variant=t)}},childs:[]}))}}),n(i,{text:`Stretch`,size:`sm`,variant:`outline`,toggle:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.stretch,t=>{let n=e;n!=null&&typeof n.stretch!=`function`&&(n.stretch=t)})}},childs:[]})]});t.controls.add(r),t.bindings.list(()=>[`sm`,`md`,`lg`],t=>n(s,{indexkey:()=>t,label:`Size ${t}`,size:t,variant:()=>e.variant,stretch:()=>e.stretch,runover:{},childs:[n(o,{title:`Day`,runover:{},childs:[n(`p`,{initializeComponent:e=>{e.bindings.method(()=>`Size ${t}.`)}},1)]}),n(o,{title:`Week`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Week.`)}},1);e.controls.add(t)}},1)]}),n(o,{title:`Month`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Month.`)}},1);e.controls.add(t)}},1)]})]}))}}})}var z=m(Object.assign({"./examples/Closable.tsx":g,"./examples/IconsAndBadges.tsx":_,"./examples/LazyPanels.tsx":v,"./examples/Localization.tsx":y,"./examples/ManualActivation.tsx":b,"./examples/ManyTabs.tsx":x,"./examples/Placement.tsx":S,"./examples/Programmatic.tsx":C,"./examples/VariantsAndSizes.tsx":w})),B=[[`value`,"`Bind<string | number | null>`",`The first tab`,"The `key` of the selected tab, or its index. `x-model` provides two-way binding."],[`selectedIndex`,"`Bind<number>`","`0`","The index of the selected tab in `tabs`."],[`label`,"`Bind<string>`","`''`","The accessible name of the tab list (`aria-label`). This is the same property as `text`."],[`activation`,"`Bind<'auto' | 'manual'>`","`'auto'`","With `auto`, an arrow key selects the tab it moves to. With `manual`, arrow keys only move focus, and Enter or Space selects."],[`placement`,"`Bind<TabsPlacement>`","`'top'`","`top`, `bottom`, `start` or `end`. `start` and `end` stack the tabs vertically."],[`variant`,"`Bind<TabsVariant>`","`'line'`","`line` shows a bar on the selected tab. `pill` places the tabs on a tray and raises the selected one."],[`size`,"`Bind<ControlSize>`","`'md'`","`sm`, `md`, `lg`, from the density tokens."],[`stretch`,"`Bind<boolean>`","`false`",`Makes the tabs share the full width.`],[`scrollButtons`,"`Bind<boolean>`","`true`",`Shows arrow buttons at the ends of the strip when tabs do not fit. When off, a thin scrollbar appears.`],[`closable`,"`Bind<boolean>`","`false`","Adds a close button to every tab. A tab's own `closable` takes precedence."],[`lazy`,"`Bind<boolean>`","`true`","Creates a panel the first time it is shown and then keeps it. A tab's own `lazy` takes precedence."],[`keepAlive`,"`Bind<boolean>`","`true`","With `false`, content created by a tab's `content` is disposed while hidden and recreated when shown. A tab's own `keepAlive` takes precedence."],[`enabled / disabled, visible, tabStop, tabIndex`,`see Control`,``,"Properties shared by all controls. `tabStop={false}` removes the tab strip from the Tab order."]],V=[[`title`,"`Bind<string>`","`''`","The caption. `&General` makes Alt+G select the tab. This is the same property as `text`."],[`key`,"`Bind<string>`","`''`","Identifies the tab in `value`. The JSX `key` also works."],[`icon`,"`Bind<IconSource | null>`",`—`,`An icon before the title.`],[`badge`,"`Bind<string | number | null>`",`—`,"Short text after the title, such as a count. An empty value or `null` hides it."],[`hint`,"`Bind<string>`","`''`",`The tooltip text.`],[`closable`,"`Bind<boolean | undefined>`",`From Tabs`,`Shows a close button on this tab.`],[`lazy, keepAlive`,"`Bind<boolean | undefined>`",`From Tabs`,`This tab's own setting.`],[`content`,"`() => ComponentBase | ComponentBase[]`",`—`,`Creates the panel content when the panel is created, either instead of or after the JSX children.`],[`enabled`,"`Bind<boolean>`","`true`","`false` means the tab cannot be selected and the arrow keys skip it."],[`visible`,"`Bind<boolean>`","`true`","`false` removes the tab. If it is selected, the selection moves to an adjacent tab."]],H=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`tabs`,`read-only, reactive`,`The tabs in strip order.`],[`selectedTab`,`read-only, reactive`,"The selected `Tab`, or `null` if there is none."],[`Tab.isSelected, Tab.isClosable`,`read-only, reactive`,`Indicate whether the tab is selected and whether it shows a close button.`],[`Tab.contentBuilt`,`read-only`,`Indicates whether its panel has been created.`],[`Tab.owner, Tab.headerPart`,`read-only`,"Its `Tabs` and its button in the strip. A tab's own element is its panel."]],U=[[`add(tab)`,"`Tab`","Adds a tab at the end. A tab from another `Tabs` moves here."],[`insert(index, tab)`,"`Tab`",`Adds a tab at an index.`],[`remove(tab)`,"`boolean`","Removes the tab and disposes it, without raising `onClose`. Selection and focus move to an adjacent tab."],[`select(tab | index)`,"`boolean`","Selects a tab programmatically. Returns `false` if it is hidden or missing."],[`close(tab)`,"`boolean`","Closes a tab as its close button does, so `onClose` can cancel it."],[`focus()`,"`boolean`",`Sets focus on the selected tab.`],[`Tab.select(), Tab.close(), Tab.focus()`,"`boolean`",`Same as the methods above, called on the tab.`]],W=[[`onSelecting(e)`,"Occurs before the user selects a tab. `e`: `{ tab, index, previousTab, previousIndex, cancel, source, event }`. Set `e.cancel = true` to keep the current tab."],[`onSelectionChanged(e)`,"Occurs after the selected tab changes. `e`: `{ tab, index, previousTab, previousIndex, byUser, source, event? }`."],[`onClose(e)`,"Occurs before a tab closes, from its button, Delete, a middle-click or `close()`. `e`: `{ tab, index, byUser, cancel, source, event? }`."]],G=[[`Tab`,`Moves focus to the selected tab, then into its panel.`],[`Left / Right`,"Moves to the previous or next tab, wrapping at the ends (reversed for right-to-left text). With `start` and `end` placement, use Up and Down."],[`Home / End`,`Moves to the first or last tab.`],[`Enter / Space`,'Selects the focused tab (with `activation="manual"`).'],[`Delete`,`Closes the focused tab if it is closable.`],["Alt + key (`&General`)",`Selects that tab and moves focus to it (Control + Option + key on Apple platforms).`]],K=[[`Roles`,'`tablist`, `tab` (a `<button>`) and `tabpanel`, with `aria-orientation="vertical"` for `start` and `end` placement.'],[`State`,"`aria-selected` on the tabs. `aria-controls` links a tab to its panel, and `aria-labelledby` names the panel after its tab."],[`Focus`,'The strip has one Tab stop, on the selected tab. A panel with no focusable content receives focus itself (`tabindex="0"`), so its text can be reached.'],[`Disabled tabs`,'`aria-disabled="true"`. The arrow keys skip these tabs.'],[`Close button`,'Not a Tab stop and hidden from screen readers, because a button inside a tab would be a control within a control. Delete closes the tab, and `aria-keyshortcuts="Delete"` announces it. Its tooltip comes from `uiLocale`.'],[`Scroll buttons`,`These are for pointer use only and are hidden from screen readers. The arrow keys reach every tab and scroll it into view.`]],q=[[`.mx-tabs`,"The root. `data-placement`, `data-variant`, `data-size`, `data-stretch`, `data-overflow`, `data-scroll-buttons`, `data-disabled`."],[`.mx-tabs__strip, .mx-tabs__list`,`The strip and its tab list, which is the scrolling box.`],[`.mx-tabs__tab`,"A tab: `aria-selected`, `aria-disabled`, `data-closable`."],[`.mx-tabs__icon, .mx-tabs__label, .mx-tabs__badge, .mx-tabs__close`,`The parts of a tab.`],[`.mx-tabs__scroll`,"A scroll button: `data-direction` (`back`, `forward`), and `data-end` when it cannot scroll further."],[`.mx-tabs__panels, .mx-tabs__panel`,`The panels and a panel (the tab's own element).`]],J=[[`tabs.container, tabs.strip, tabs.list, tabs.scroll, tabs.scroll-icon`,"Units: the root, the strip with its line along the panel (`bottom`, `start`, `end`; the pill tray: `pill`, `pill-bottom` …), the tab row, the scroll buttons and their glyph."],[`tabs.tab, tabs.label, tabs.icon, tabs.badge, tabs.close, tabs.close-icon`,"Units: a tab in each state (`hover`, `pressed`, `selected`, `disabled`, `focus`; in the pill variant `pill`, `pill-hover` …) and its parts."],[`tabs.indicator, tabs.separator, tabs.panel`,"Units: the line variant indicator (`vertical`, `hover`, `selected`, `selected-disabled`), a divider between tabs, and the panel (`pill`, `pill-across`, `focus`)."],[`tabs.height.*, tabs.pill-height.*, tabs.padding.*, tabs.font-size.*, tabs.line-height.*, tabs.indicator-inset.*`,`Sizes per size class.`],[`tabs.pill-gap, tabs.tab-overlap, tabs.indicator-offset, tabs.indicator-inset-vertical, tabs.close-pull, tabs.vertical-width`,`Layout measurements: the gap between pills, the offset over the strip line, the indicator, the close button, and the width of a vertical strip.`],[`tabs.curve-display, tabs.curve-size, tabs.curve-frame-width, tabs.curve-frame-color`,`Outward curves at the corners of the selected tab on the panel side, in its fill color.`]];function Y(){return t({initializeComponent:e=>{{let t=n(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=n(f,{text:`Tabs display one panel at a time below a tab strip. You can define them in JSX or programmatically, and they support closable tabs, icons and badges, scroll buttons when tabs overflow, four placements, and panels that are created on first display.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let r=n(u,{anchor:`import`,title:`Import`,runover:{},childs:[n(l,{code:`
import { Tabs, Tab } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=n(u,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(f,{text:"The children of a `<Tab>` are its panel. `value` is the `key` of the selected tab, or its index, and `x-model` provides two-way binding. When you create the component with `new`, add, insert and remove tabs programmatically.",runover:{},childs:[]});e.controls.add(t)}},1),n(d,{files:z(`Programmatic.tsx`),stack:!0,runover:{},childs:[n(D,{runover:{},childs:[]})]})]});e.controls.add(i);let a=n(u,{anchor:`closable`,title:`Closable tabs`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(f,{text:"`closable` adds a close button to every tab, and a tab's own `closable` takes precedence. Delete or a middle-click closes the focused or hovered tab. `onClose` can cancel the action, for example to confirm unsaved changes.",runover:{},childs:[]});e.controls.add(t)}},1),n(d,{files:z(`Closable.tsx`),stack:!0,runover:{},childs:[n(E,{runover:{},childs:[]})]})]});e.controls.add(a);let o=n(u,{anchor:`overflow`,title:`Overflow`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(f,{text:"When tabs do not fit, arrow buttons scroll the strip (`scrollButtons`, on by default). The selected tab and the focused tab scroll into view.",runover:{},childs:[]});e.controls.add(t)}},1),n(d,{files:z(`ManyTabs.tsx`),stack:!0,runover:{},childs:[n(P,{runover:{},childs:[]})]})]});e.controls.add(o);let s=n(u,{anchor:`placement`,title:`Placement`,runover:{},childs:[n(d,{files:z(`Placement.tsx`),stack:!0,runover:{},childs:[n(I,{runover:{},childs:[]})]})]});e.controls.add(s);let c=n(u,{anchor:`activation`,title:`Manual activation`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(f,{text:'By default, an arrow key selects the tab it moves to. With `activation="manual"`, it only moves focus, and Enter or Space selects the tab. This works better when a panel is slow to display.',runover:{},childs:[]});e.controls.add(t)}},1),n(d,{files:z(`ManualActivation.tsx`),runover:{},childs:[n(M,{runover:{},childs:[]})]})]});e.controls.add(c);let m=n(u,{anchor:`content`,title:`Icons, badges and disabled tabs`,runover:{},childs:[n(d,{files:z(`IconsAndBadges.tsx`),stack:!0,runover:{},childs:[n(k,{runover:{},childs:[]})]})]});e.controls.add(m);let h=n(u,{anchor:`look`,title:`Variants and sizes`,runover:{},childs:[n(d,{files:z(`VariantsAndSizes.tsx`),stack:!0,runover:{},childs:[n(R,{runover:{},childs:[]})]})]});e.controls.add(h);let g=n(u,{anchor:`lazy`,title:`Lazy panels`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(f,{text:"A panel is created the first time it is shown and then kept, so user input is preserved (`lazy`, on by default). `lazy={false}` creates every panel immediately. A tab with a `content` factory and `keepAlive={false}` has its content disposed while hidden and recreated when shown. JSX children are created once by the page, so they are always kept.",runover:{},childs:[]});e.controls.add(t)}},1),n(d,{files:z(`LazyPanels.tsx`),stack:!0,runover:{},childs:[n(A,{runover:{},childs:[]})]})]});e.controls.add(g);let _=n(u,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[n(p,{head:[`Key`,`Description`],rows:G,runover:{},childs:[]})]});e.controls.add(_);let v=n(u,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[n(p,{head:[`Topic`,`Details`],rows:K,runover:{},childs:[]})]});e.controls.add(v);let y=n(u,{anchor:`i18n`,title:`Localization`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(f,{text:"Tabs have one string of their own, the close button tooltip `uiLocale.strings.close`. Every tab updates immediately when it changes.",runover:{},childs:[]});e.controls.add(t)}},1),n(d,{files:z(`Localization.tsx`),runover:{},childs:[n(j,{runover:{},childs:[]})]})]});e.controls.add(y);let b=n(u,{anchor:`styling`,title:`Styling`,runover:{},childs:[n(p,{head:[`Hook`,`Description`],rows:q,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(f,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),n(p,{head:[`Token`,`Description`],rows:J,runover:{},childs:[]})]});e.controls.add(b);let x=n(u,{anchor:`api`,title:`API reference`,runover:{},childs:[n(`h3`,{initializeComponent:e=>{let t=n(f,{text:`Tabs props`,runover:{},childs:[]});e.controls.add(t)}},1),n(p,{head:[`Prop`,`Type`,`Default`,`Description`],rows:B,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(f,{text:`Tab props`,runover:{},childs:[]});e.controls.add(t)}},1),n(p,{head:[`Prop`,`Type`,`Default`,`Description`],rows:V,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(f,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),n(p,{head:[`Property`,`Access`,`Description`],rows:H,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(f,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),n(p,{head:[`Method`,`Returns`,`Description`],rows:U,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(f,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),n(p,{head:[`Event`,`When`],rows:W,runover:{},childs:[]})]});e.controls.add(x)}}})}export{Y as default};