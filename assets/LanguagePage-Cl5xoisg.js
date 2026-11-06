import{Ft as e,Jt as t,Mt as n,a as r,an as i,h as a,i as o,n as s,nn as c,r as l,rn as u,t as d}from"./doc-B1CtlCkV.js";import{t as f}from"./NumberBox-CQk52Tmu.js";import{t as p}from"./DropDown-DyxFHNUX.js";import{t as m}from"./Stack-AS0iyAxC.js";import{t as h}from"./Pagination-DD7HPFFg.js";import{t as g}from"./DateBox-D2-SNvNC.js";import{t as _}from"./index-DVbtDn93.js";import{t as v}from"./sources-BXVvOiIY.js";import{t as y}from"./kit-texts-BRS-kYEc.js";function b(e,t=n){t.use(e.locale);let r=e.onLocaleChanged(({locale:e})=>void t.use(e));return()=>r.dispose()}var x=`import { Component } from '@motifx/core';\r
import { createI18n } from '@motifx-community/i18n';\r
import { Button, connectI18n, Stack, TextBox } from '@motifx-community/ui';\r
\r
// The app's own translations; the kit follows their locale.\r
const i18n = createI18n({\r
    locale: 'en',\r
    messages: {\r
        en: { greeting: 'Hello {name}', hint: 'The clear button is named by the kit' },\r
        tr: { greeting: 'Merhaba {name}', hint: 'Temizle düğmesini kit adlandırır' },\r
    },\r
    dom: false,\r
});\r
\r
/** One locale for the app and the kit: \`connectI18n\` switches the kit whenever the app's translations switch. */\r
export default class Connect extends Component<HTMLDivElement> {\r
    override onBuilt(): void {\r
        this.motif.setDisposable(connectI18n(i18n));\r
    }\r
\r
    override view() {\r
        return (\r
            <Stack gap="md">\r
                <Stack orientation="horizontal" wrap align="center">\r
                    <Button text="English" variant="outline" onclick={() => void i18n.setLocale('en')} />\r
                    <Button text="Türkçe" variant="outline" onclick={() => void i18n.setLocale('tr')} />\r
                </Stack>\r
                <p class="lang-greeting">{() => i18n.t('greeting', { name: 'Ada' })}</p>\r
                <TextBox label={() => i18n.t('hint')} value="Clear me" clearButton />\r
            </Stack>\r
        );\r
    }\r
}\r
`,S=`import { reactive } from '@motifx/core';\r
import { DateBox, NumberBox, Stack } from '@motifx-community/ui';\r
\r
/** A control's own \`locale\` takes precedence over the kit's: these use German and Japanese regardless of the kit language. */\r
export default function Formats() {\r
    const s = reactive({ amount: 98765.43, day: new Date(2026, 2, 18) as Date | null });\r
    return (\r
        <Stack orientation="horizontal" wrap align="center">\r
            <NumberBox label="Betrag" locale="de-DE" format={{ style: 'currency', currency: 'EUR' }} x-model={() => s.amount} />\r
            <DateBox label="日付" locale="ja-JP" x-model={() => s.day} />\r
            <NumberBox label="The kit's locale" format={{ style: 'currency', currency: 'EUR' }} x-model={() => s.amount} />\r
        </Stack>\r
    );\r
}\r
`,C=`import { Button, DropDown, Stack, uiLocale } from '@motifx-community/ui';\r
\r
// A few German strings. Anything omitted stays in English.\r
uiLocale.add('de', {\r
    close: 'Schließen',\r
    clear: 'Leeren',\r
    search: 'Suchen',\r
    noItems: 'Keine Einträge',\r
    loading: 'Wird geladen…',\r
    ok: 'OK',\r
    cancel: 'Abbrechen',\r
});\r
\r
/** A custom pack: \`uiLocale.add\` registers strings for a language, and \`use\` switches to it. */\r
export default function OwnPack() {\r
    return (\r
        <Stack gap="md">\r
            <Stack orientation="horizontal" wrap align="center">\r
                <Button text="Deutsch" variant="outline" onclick={() => void uiLocale.use('de')} />\r
                <Button text="English" variant="outline" onclick={() => void uiLocale.use('en')} />\r
            </Stack>\r
            <DropDown label="Empty list" items={[]} placeholder="Open me" />\r
        </Stack>\r
    );\r
}\r
`,w=`import { Component, reactive } from '@motifx/core';\r
import { Button, NumberBox, Stack, uiLocale } from '@motifx-community/ui';\r
\r
const OWN = {\r
    en: { title: 'Orders', hint: 'Written by the app, kept with the kit’s language' },\r
    tr: { title: 'Siparişler', hint: 'Uygulama yazar, kitin diliyle birlikte değişir' },\r
};\r
\r
/** Your own texts drawn again on \`uiLocale.onChanged\`, and the kit's plural texts filled with \`uiLocale.text\`. */\r
export default class OwnTexts extends Component<HTMLDivElement> {\r
    s = reactive({ count: 3, title: '', hint: '', records: '' });\r
\r
    override onBuilt(): void {\r
        this.motif.register(uiLocale.onChanged(() => this.draw()));\r
        this.draw();\r
    }\r
\r
    draw(): void {\r
        const own = uiLocale.locale.startsWith('tr') ? OWN.tr : OWN.en;\r
        this.s.title = own.title;\r
        this.s.hint = own.hint;\r
        this.s.records = uiLocale.text('gridRecords', { count: this.s.count });\r
    }\r
\r
    override view() {\r
        return (\r
            <Stack gap="md">\r
                <Stack orientation="horizontal" wrap align="center">\r
                    <Button text="English" variant="outline" onclick={() => void uiLocale.use('en')} />\r
                    <Button text="Türkçe" variant="outline" onclick={() => void uiLocale.use('tr')} />\r
                </Stack>\r
                <p>\r
                    <strong class="lang-own-title">{this.s.title}</strong>\r
                </p>\r
                <p>{this.s.hint}</p>\r
                <Stack orientation="horizontal" wrap align="center">\r
                    <NumberBox label="Count" min={0} max={99} x-model={() => this.s.count} onValueChanged={() => this.draw()} />\r
                    <output class="lang-records">{this.s.records}</output>\r
                </Stack>\r
            </Stack>\r
        );\r
    }\r
}\r
`,T=`import { reactive } from '@motifx/core';\r
import { Button, DateBox, NumberBox, Pagination, Stack, uiLocale } from '@motifx-community/ui';\r
import { kitTexts } from '../../../shared/kit-texts';\r
\r
/** The kit's language switched live: the pack is loaded first, then every control draws its texts and formats again. */\r
export default function Switch() {\r
    const s = reactive({ price: 1234.5, when: new Date(2026, 2, 18) as Date | null });\r
    return (\r
        <Stack gap="md">\r
            <Stack orientation="horizontal" wrap align="center">\r
                <Button text="English" variant="outline" onclick={() => void uiLocale.use('en')} />\r
                <Button text="Türkçe" variant="outline" onclick={() => void uiLocale.use('tr')} />\r
                <span>\r
                    In use: <output class="lang-locale">{() => kitTexts.locale}</output>\r
                </span>\r
            </Stack>\r
            <Stack orientation="horizontal" wrap align="center">\r
                <NumberBox label="Price" x-model={() => s.price} format={{ style: 'currency', currency: 'EUR' }} />\r
                <DateBox label="When" x-model={() => s.when} clearButton />\r
            </Stack>\r
            <Pagination total={95} pageSizes={[10, 20, 50]} label="Orders" />\r
        </Stack>\r
    );\r
}\r
`,E=e({locale:`en`,messages:{en:{greeting:`Hello {name}`,hint:`The clear button is named by the kit`},tr:{greeting:`Merhaba {name}`,hint:`Temizle düğmesini kit adlandırır`}},dom:!1}),D=class extends t{onBuilt(){this.motif.setDisposable(b(E))}view(){return c(m,{gap:`md`,runover:{},childs:[c(m,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[c(a,{text:`English`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void E.setLocale(`en`))}},childs:[]}),c(a,{text:`Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void E.setLocale(`tr`))}},childs:[]})]}),c(`p`,{initializeComponent:e=>{e.class.add(`lang-greeting`),e.bindings.method(()=>E.t(`greeting`,{name:`Ada`}))}},1),c(_,{label:()=>E.t(`hint`),value:`Clear me`,clearButton:!0,runover:{},childs:[]})]})}};D.elementTag=`div`;function O(){let e=i({amount:98765.43,day:new Date(2026,2,18)});return c(m,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[c(f,{label:`Betrag`,locale:`de-DE`,format:{style:`currency`,currency:`EUR`},runover:{initializeComponent:t=>{t.bindings.model(()=>e.amount,t=>{let n=e;n!=null&&typeof n.amount!=`function`&&(n.amount=t)})}},childs:[]}),c(g,{label:`日付`,locale:`ja-JP`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.day,t=>{let n=e;n!=null&&typeof n.day!=`function`&&(n.day=t)})}},childs:[]}),c(f,{label:`The kit's locale`,format:{style:`currency`,currency:`EUR`},runover:{initializeComponent:t=>{t.bindings.model(()=>e.amount,t=>{let n=e;n!=null&&typeof n.amount!=`function`&&(n.amount=t)})}},childs:[]})]})}n.add(`de`,{close:`Schließen`,clear:`Leeren`,search:`Suchen`,noItems:`Keine Einträge`,loading:`Wird geladen…`,ok:`OK`,cancel:`Abbrechen`});function k(){return c(m,{gap:`md`,runover:{},childs:[c(m,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[c(a,{text:`Deutsch`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void n.use(`de`))}},childs:[]}),c(a,{text:`English`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void n.use(`en`))}},childs:[]})]}),c(p,{label:`Empty list`,items:[],placeholder:`Open me`,runover:{},childs:[]})]})}var A={en:{title:`Orders`,hint:`Written by the app, kept with the kit’s language`},tr:{title:`Siparişler`,hint:`Uygulama yazar, kitin diliyle birlikte değişir`}},j=class extends t{constructor(...e){super(...e),this.s=i({count:3,title:``,hint:``,records:``})}onBuilt(){this.motif.register(n.onChanged(()=>this.draw())),this.draw()}draw(){let e=n.locale.startsWith(`tr`)?A.tr:A.en;this.s.title=e.title,this.s.hint=e.hint,this.s.records=n.text(`gridRecords`,{count:this.s.count})}view(){return c(m,{gap:`md`,runover:{},childs:[c(m,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[c(a,{text:`English`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void n.use(`en`))}},childs:[]}),c(a,{text:`Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void n.use(`tr`))}},childs:[]})]}),c(`p`,{initializeComponent:e=>{let t=c(`strong`,{initializeComponent:e=>{e.class.add(`lang-own-title`);let t=c(`text`,{initializeComponent:e=>{e.bindings.add(`textContent`,this.s,`title`)},__childExpr:()=>this.s.title});e.controls.add(t)}},1);e.controls.add(t)}},1),c(`p`,{initializeComponent:e=>{let t=c(`text`,{initializeComponent:e=>{e.bindings.add(`textContent`,this.s,`hint`)},__childExpr:()=>this.s.hint});e.controls.add(t)}},1),c(m,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[c(f,{label:`Count`,min:0,max:99,onValueChanged:()=>this.draw(),runover:{initializeComponent:e=>{e.bindings.model(()=>this.s.count,e=>{let t=this.s;t!=null&&typeof t.count!=`function`&&(t.count=e)})}},childs:[]}),c(`output`,{initializeComponent:e=>{e.class.add(`lang-records`);let t=c(`text`,{initializeComponent:e=>{e.bindings.add(`textContent`,this.s,`records`)},__childExpr:()=>this.s.records});e.controls.add(t)}},1)]})]})}};j.elementTag=`div`;function M(){let e=i({price:1234.5,when:new Date(2026,2,18)});return c(m,{gap:`md`,runover:{},childs:[c(m,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[c(a,{text:`English`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void n.use(`en`))}},childs:[]}),c(a,{text:`Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void n.use(`tr`))}},childs:[]}),c(`span`,{initializeComponent:e=>{let t=c(`text`,{initializeComponent:e=>{e.setText(`In use: `)}},1);e.controls.add(t);let n=c(`output`,{initializeComponent:e=>{e.class.add(`lang-locale`),e.bindings.method(()=>y.locale)}},1);e.controls.add(n)}},1)]}),c(m,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[c(f,{label:`Price`,format:{style:`currency`,currency:`EUR`},runover:{initializeComponent:t=>{t.bindings.model(()=>e.price,t=>{let n=e;n!=null&&typeof n.price!=`function`&&(n.price=t)})}},childs:[]}),c(g,{label:`When`,clearButton:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.when,t=>{let n=e;n!=null&&typeof n.when!=`function`&&(n.when=t)})}},childs:[]})]}),c(h,{total:95,pageSizes:[10,20,50],label:`Orders`,runover:{},childs:[]})]})}var N=v(Object.assign({"./examples/Connect.tsx":x,"./examples/Formats.tsx":S,"./examples/OwnPack.tsx":C,"./examples/OwnTexts.tsx":w,"./examples/Switch.tsx":T})),P=[[`Start`,"The initial language comes from the page's `<html lang>` attribute, or from the browser language if it is not set. Set `lang` before creating the first control. `uiLocale.ready` resolves once that language has loaded."],[`Texts`,`Every string a control displays on its own, such as a button name, a message or “No items”, comes from the active language pack. English is used for anything the pack does not include.`],[`Formats`,"Dates, numbers, the first day of the week and the 12 or 24-hour clock follow `uiLocale.locale`. A control's own `locale` prop takes precedence for that control."],[`Direction`,"`uiLocale.dir` is `rtl` for Arabic, Hebrew, Persian, Urdu and similar languages. Controls lay themselves out based on `<html dir>`, which `@motifx-community/i18n` keeps in sync."],[`Nothing follows`,"A language change raises a single event, `onChanged`. Controls redraw in response, and your own strings can do the same. No binding reads `uiLocale`."],[`Plurals`,"A string with a count is an ICU message, such as `{count, plural, one {# record} other {# records}}`. Each pack writes it according to the plural rules of its language."]],F=[[`English`,`Built in. Anything a pack does not include appears in English.`],[`Turkish`,"`uiLocale.use('tr')` loads it on first use as a chunk of the package."],[`@motifx-community/ui/locales/<language>.json`,"The same packs as files, for applications that bundle or serve them separately: `uiLocale.add('tr', pack)`."],[`uiLocale.loader`,"Sets where the kit requests packs it does not have: `(language) => fetch(`/i18n/ui/${language}.json`).then((r) => r.json())`. A language without a pack keeps the English strings."]],I=[[`uiLocale.use(locale)`,"`Promise<void>`","Switches to `locale` (`tr`, `tr-TR`). The pack is loaded first if needed, and then every control redraws. A later call takes precedence over one that is still loading."],[`uiLocale.locale`,"`string`",`The active locale.`],[`uiLocale.dir`,"`'ltr' | 'rtl'`",`The text direction of the active locale.`],[`uiLocale.strings`,"`UiStrings`","The active strings. Assigning a set changes the strings and keeps the locale: `uiLocale.strings = { ...uiLocale.strings, close: 'Shut' }`."],[`uiLocale.text(key, values)`,"`string`","Returns a kit string with its values filled in: `uiLocale.text('gridRecords', { count: 3 })`."],[`uiLocale.add(language, pack)`,"`void`",`Adds the pack for a language, or adds strings to it. The active language shows them immediately.`],[`uiLocale.loader`,"`(language) => Promise<UiPackModule>`",`Sets where packs are loaded from. By default, this is the package.`],[`uiLocale.ready`,"`Promise<void>`",`Resolves once the initial language has loaded.`],[`uiLocale.onChanged`,`event`,"Occurs after the language changes, with `locale` and `previous`."],[`connectI18n(i18n)`,"`() => void`","Keeps the kit language in sync with your application's translations (`@motifx-community/i18n`, or any object with `locale` and `onLocaleChanged`). Returns a function that stops it."]],L=[[`Every text`,"A pack includes every string in `en.json`. A missing string appears in English, and the check reports which one."],[`Only the kit’s texts`,"A key that does not exist in `en.json` is a typo."],[`The same arguments`,"A string uses the same `{values}` as the English string, in ICU format. Plural forms follow the language."],[`The interface`,"`UiStrings` and `en.json` declare the same keys."]];function R(){return u({initializeComponent:e=>{{let t=c(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=c(l,{text:"`uiLocale` controls the strings that controls display, the locale used for dates and numbers, and the text direction. The kit has one `uiLocale`, and each language pack is loaded on demand.",runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let n=c(o,{anchor:`import`,title:`Import`,runover:{},childs:[c(r,{code:`
import { uiLocale, connectI18n } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(n);let i=c(o,{anchor:`switch`,title:`Changing the language`,runover:{},childs:[c(`p`,{initializeComponent:e=>{let t=c(l,{text:"`uiLocale.use('tr')` loads the Turkish pack the first time it is requested. Every control on the page then redraws its strings and formats. The Language menu in the header of these docs does the same thing.",runover:{},childs:[]});e.controls.add(t)}},1),c(s,{files:N(`Switch.tsx`),runover:{},childs:[c(M,{runover:{},childs:[]})]})]});e.controls.add(i);let a=c(o,{anchor:`rules`,title:`Validation rules`,runover:{},childs:[c(d,{head:[`Rule`,`Details`],rows:P,runover:{},childs:[]})]});e.controls.add(a);let u=c(o,{anchor:`packs`,title:`Language packs`,runover:{},childs:[c(d,{head:[`Pack`,`Source`],rows:F,runover:{},childs:[]}),c(`p`,{initializeComponent:e=>{let t=c(l,{text:"A custom pack is a plain object of kit strings. `uiLocale.add` registers strings for a language, and `use` switches to it. You can start with a few strings. The rest stay in English until the pack includes them.",runover:{},childs:[]});e.controls.add(t)}},1),c(s,{files:N(`OwnPack.tsx`),runover:{},childs:[c(k,{runover:{},childs:[]})]})]});e.controls.add(u);let f=c(o,{anchor:`connect`,title:`Using your application's translations`,runover:{},childs:[c(`p`,{initializeComponent:e=>{let t=c(l,{text:"An application translated with `@motifx-community/i18n` already has a locale. `connectI18n(i18n)` makes the kit follow it: when the application switches language, the kit loads its own pack and switches too. Call the function it returns to disconnect.",runover:{},childs:[]});e.controls.add(t)}},1),c(s,{files:N(`Connect.tsx`),runover:{},childs:[c(D,{runover:{},childs:[]})]})]});e.controls.add(f);let p=c(o,{anchor:`own-texts`,title:`Keeping your own strings in sync`,runover:{},childs:[c(`p`,{initializeComponent:e=>{let t=c(l,{text:"The kit does not track anything for you. A language change is reported once, through `uiLocale.onChanged`. Update your own strings there, and use `uiLocale.text` to fill in kit strings, including plurals.",runover:{},childs:[]});e.controls.add(t)}},1),c(s,{files:N(`OwnTexts.tsx`),runover:{},childs:[c(j,{runover:{},childs:[]})]})]});e.controls.add(p);let m=c(o,{anchor:`formats`,title:`Formats for a single control`,runover:{},childs:[c(`p`,{initializeComponent:e=>{let t=c(l,{text:"Dates and numbers follow the kit locale. A control with its own `locale` uses that locale, regardless of the kit language.",runover:{},childs:[]});e.controls.add(t)}},1),c(s,{files:N(`Formats.tsx`),runover:{},childs:[c(O,{runover:{},childs:[]})]})]});e.controls.add(m);let h=c(o,{anchor:`checking`,title:`Validating a pack`,runover:{},childs:[c(`p`,{initializeComponent:e=>{let t=c(l,{text:"In the repository, `npm run locales` validates every pack the kit ships, and `npm run locales -- path/to/de.json` validates one of your own. The strings are defined in `src/locales/en.json`, and a pack uses the same keys in another language.",runover:{},childs:[]});e.controls.add(t)}},1),c(d,{head:[`Check`,`Meaning`],rows:L,runover:{},childs:[]})]});e.controls.add(h);let g=c(o,{anchor:`api`,title:`API reference`,runover:{},childs:[c(d,{head:[`Member`,`Type`,`Description`],rows:I,runover:{},childs:[]})]});e.controls.add(g)}}})}export{R as default};