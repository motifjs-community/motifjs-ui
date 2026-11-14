import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./Gallery-DIAlMa7u.js";import{t as a}from"./Stack-wRt1e9tO.js";import{a as o,i as s,n as c,r as l,t as u}from"./docs-B_LZlyP5.js";import{t as d}from"./sources-BXVvOiIY.js";import{t as f}from"./scenes-Bp-yop5Q.js";var p=`import { Gallery } from '@motifx-community/ui';\r
import { scene } from './scenes';\r
\r
/** Five pictures with captions: the buttons at the sides, the dots under them, a swipe or the arrow keys move them. */\r
export default function Basic() {\r
    return (\r
        <Gallery\r
            class="ga-trip"\r
            label="A trip"\r
            height={300}\r
            items={[\r
                { image: scene(205), alt: 'Boats in a harbour', text: 'Harbour', description: 'Early morning' },\r
                { image: scene(30), alt: 'Market stalls', text: 'Market' },\r
                { image: scene(120), alt: 'Hills under cloud', text: 'Hills', description: 'After the rain' },\r
                { image: scene(280), alt: 'The town at night', text: 'Night' },\r
                { image: scene(345), alt: 'The way home', text: 'Home', description: 'Last day' }\r
            ]}\r
        />\r
    );\r
}\r
`,m=`import { reactive } from '@motifx/core';\r
import { Button, Gallery, Stack } from '@motifx-community/ui';\r
\r
const PLANS = [\r
    { name: 'Starter', price: '€9', line: 'One project, two people' },\r
    { name: 'Team', price: '€29', line: 'Ten projects, your whole team' },\r
    { name: 'Company', price: '€79', line: 'No limits, a person to call' }\r
];\r
\r
/** Any content in a slide: a plan each, with its own button. A click on the slide itself is also reported. */\r
export default function Content() {\r
    const s = reactive({ told: '' });\r
    const plan = (p: (typeof PLANS)[number]) => (\r
        <Stack class="ga-plan" gap="xs" align="center" justify="center" style="block-size: 100%">\r
            <strong>{p.name}</strong>\r
            <span class="ga-plan-price">{p.price} a month</span>\r
            <span>{p.line}</span>\r
            <Button text="Choose" variant="outline" onclick={() => (s.told = \`\${p.name} chosen\`)} />\r
        </Stack>\r
    );\r
    return (\r
        <Stack gap="sm" style="inline-size: 100%">\r
            <Gallery class="ga-plans" label="Plans" height={200} swipeEnabled={false} items={PLANS.map(p => ({ key: p.name, content: () => plan(p) }))} onItemClick={e => (s.told = \`pane \${e.index + 1} pressed\`)} />\r
            <output class="ga-plans-told">{() => s.told}</output>\r
        </Stack>\r
    );\r
}\r
`,h=`import { Gallery } from '@motifx-community/ui';\r
import { scene } from './scenes';\r
\r
/** Three panes share the width; next and previous move one pane at a time and stop when the last is in view. */\r
export default function PerPage() {\r
    const places = ['Pier', 'Lane', 'Roof', 'Park', 'Bridge', 'Shore', 'Tower'];\r
    return (\r
        <Gallery\r
            class="ga-wide"\r
            label="Places"\r
            height={150}\r
            itemsPerPage={3}\r
            stretchImages\r
            items={places.map((place, i) => ({ image: scene(i * 48), alt: \`The \${i + 1}. picture of the walk\`, text: place }))}\r
        />\r
    );\r
}\r
`,g=`import { reactive } from '@motifx/core';\r
import { Button, Gallery, Stack } from '@motifx-community/ui';\r
import { scene } from './scenes';\r
\r
/** A gallery created programmatically without its own buttons or dots: custom buttons navigate, and \`onSlideChanged\` reports the position. */\r
export default function Programmatic() {\r
    const s = reactive({ at: 0, told: '' });\r
    const coded = new Gallery({\r
        label: 'Rooms',\r
        height: 200,\r
        showNavButtons: false,\r
        showIndicator: false,\r
        swipeEnabled: false,\r
        items: [\r
            { key: 'hall', image: scene(20), alt: 'The hall', text: 'Hall' },\r
            { key: 'study', image: scene(200), alt: 'The study', text: 'Study' },\r
            { key: 'garden', image: scene(110), alt: 'The garden', text: 'Garden' }\r
        ],\r
        onSlideChanged: e => {\r
            s.at = e.index;\r
            s.told = \`slide \${e.index + 1} of \${coded.count}\`;\r
        }\r
    });\r
    return (\r
        <Stack gap="sm" style="inline-size: 100%">\r
            <span class="ga-rooms" onConfig={c => c.controls.add(coded)} />\r
            <Stack orientation="horizontal" wrap align="center">\r
                <Button text="Previous" variant="outline" enabled={() => s.at > 0} onclick={() => void coded.previous()} />\r
                <Button text="Next" variant="outline" enabled={() => s.at < 2} onclick={() => void coded.next()} />\r
                <Button text="Garden" variant="outline" onclick={() => void coded.goTo('garden')} />\r
                <output class="ga-rooms-told">{() => s.told}</output>\r
            </Stack>\r
        </Stack>\r
    );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { Gallery, Stack } from '@motifx-community/ui';\r
import { scene } from './scenes';\r
\r
/** A slideshow around the ends: it moves on every 2.5 s, waits while the pointer or focus is on it, and its button pauses it. */\r
export default function Slideshow() {\r
    const s = reactive({ shown: 0 as string | number | null, told: '' });\r
    return (\r
        <Stack gap="sm" style="inline-size: 100%">\r
            <Gallery\r
                class="ga-show"\r
                label="Slideshow"\r
                height={240}\r
                loop\r
                stretchImages\r
                slideInterval={2500}\r
                x-model={() => s.shown}\r
                onSlideChanged={e => (s.told = e.byUser ? 'moved by you' : 'moved by the slideshow')}\r
                items={[\r
                    { image: scene(190), alt: 'Dawn over the sea', text: 'Dawn' },\r
                    { image: scene(50), alt: 'Noon in the square', text: 'Noon' },\r
                    { image: scene(260), alt: 'Dusk on the hill', text: 'Dusk' }\r
                ]}\r
            />\r
            <output class="ga-show-told">{() => \`in view: \${s.shown}\${s.told ? \`, \${s.told}\` : ''}\`}</output>\r
        </Stack>\r
    );\r
}\r
`,v=`/** A picture for the examples: a coloured scene as a data address, so nothing is fetched; the caption names it. */\r
export function scene(hue: number): string {\r
    const svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">\r
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(\${hue} 55% 58%)"/><stop offset="1" stop-color="hsl(\${hue + 40} 60% 32%)"/></linearGradient></defs>\r
<rect width="800" height="450" fill="url(#g)"/>\r
<circle cx="640" cy="120" r="64" fill="hsl(\${hue + 180} 70% 88% / 0.55)"/>\r
<path d="M0 330 Q200 250 400 330 T800 330 V450 H0 Z" fill="hsl(\${hue + 20} 50% 25% / 0.5)"/>\r
</svg>\`;\r
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);\r
}\r
`;function y(){return t(i,{class:`ga-trip`,label:`A trip`,height:300,items:[{image:f(205),alt:`Boats in a harbour`,text:`Harbour`,description:`Early morning`},{image:f(30),alt:`Market stalls`,text:`Market`},{image:f(120),alt:`Hills under cloud`,text:`Hills`,description:`After the rain`},{image:f(280),alt:`The town at night`,text:`Night`},{image:f(345),alt:`The way home`,text:`Home`,description:`Last day`}],runover:{},childs:[]})}var b=[{name:`Starter`,price:`€9`,line:`One project, two people`},{name:`Team`,price:`€29`,line:`Ten projects, your whole team`},{name:`Company`,price:`€79`,line:`No limits, a person to call`}];function x(){let e=n({told:``}),o=n=>t(a,{class:`ga-plan`,gap:`xs`,align:`center`,justify:`center`,style:`block-size: 100%`,runover:{},childs:[t(`strong`,{initializeComponent:e=>{let r=t(`text`,{initializeComponent:e=>{e.bindings.add(`textContent`,n,`name`)},__childExpr:()=>n.name});e.controls.add(r)}},1),t(`span`,{initializeComponent:e=>{e.class.add(`ga-plan-price`);let r=t(`text`,{initializeComponent:e=>{e.bindings.add(`textContent`,n,`price`)},__childExpr:()=>n.price});e.controls.add(r);let i=t(`text`,{initializeComponent:e=>{e.setText(` a month`)}},1);e.controls.add(i)}},1),t(`span`,{initializeComponent:e=>{let r=t(`text`,{initializeComponent:e=>{e.bindings.add(`textContent`,n,`line`)},__childExpr:()=>n.line});e.controls.add(r)}},1),t(r,{text:`Choose`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.told=`${n.name} chosen`)}},childs:[]})]});return t(a,{gap:`sm`,style:`inline-size: 100%`,runover:{},childs:[t(i,{class:`ga-plans`,label:`Plans`,height:200,swipeEnabled:!1,items:b.map(e=>({key:e.name,content:()=>o(e)})),onItemClick:t=>e.told=`pane ${t.index+1} pressed`,runover:{},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`ga-plans-told`),t.bindings.method(()=>e.told)}},1)]})}function S(){let e=n({at:0,told:``}),o=new i({label:`Rooms`,height:200,showNavButtons:!1,showIndicator:!1,swipeEnabled:!1,items:[{key:`hall`,image:f(20),alt:`The hall`,text:`Hall`},{key:`study`,image:f(200),alt:`The study`,text:`Study`},{key:`garden`,image:f(110),alt:`The garden`,text:`Garden`}],onSlideChanged:t=>{e.at=t.index,e.told=`slide ${t.index+1} of ${o.count}`}});return t(a,{gap:`sm`,style:`inline-size: 100%`,runover:{},childs:[t(`span`,{onConfig:e=>e.controls.add(o),initializeComponent:e=>{e.class.add(`ga-rooms`)}}),t(a,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{text:`Previous`,variant:`outline`,enabled:()=>e.at>0,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void o.previous())}},childs:[]}),t(r,{text:`Next`,variant:`outline`,enabled:()=>e.at<2,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void o.next())}},childs:[]}),t(r,{text:`Garden`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void o.goTo(`garden`))}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`ga-rooms-told`),t.bindings.method(()=>e.told)}},1)]})]})}function C(){return t(i,{class:`ga-wide`,label:`Places`,height:150,itemsPerPage:3,stretchImages:!0,items:[`Pier`,`Lane`,`Roof`,`Park`,`Bridge`,`Shore`,`Tower`].map((e,t)=>({image:f(t*48),alt:`The ${t+1}. picture of the walk`,text:e})),runover:{},childs:[]})}function w(){let e=n({shown:0,told:``});return t(a,{gap:`sm`,style:`inline-size: 100%`,runover:{},childs:[t(i,{class:`ga-show`,label:`Slideshow`,height:240,loop:!0,stretchImages:!0,slideInterval:2500,onSlideChanged:t=>e.told=t.byUser?`moved by you`:`moved by the slideshow`,items:[{image:f(190),alt:`Dawn over the sea`,text:`Dawn`},{image:f(50),alt:`Noon in the square`,text:`Noon`},{image:f(260),alt:`Dusk on the hill`,text:`Dusk`}],runover:{initializeComponent:t=>{t.bindings.model(()=>e.shown,t=>{let n=e;n!=null&&typeof n.shown!=`function`&&(n.shown=t)})}},childs:[]}),t(`output`,{initializeComponent:t=>{t.class.add(`ga-show-told`),t.bindings.method(()=>`in view: ${e.shown}${e.told?`, ${e.told}`:``}`)}},1)]})}var T=d(Object.assign({"./examples/Basic.tsx":p,"./examples/Content.tsx":m,"./examples/PerPage.tsx":h,"./examples/Programmatic.tsx":g,"./examples/Slideshow.tsx":_,"./examples/scenes.ts":v})),E=[[`items`,"`Bind<readonly (GalleryItem | string)[]>`","`[]`","The slides in order: `GalleryItem` objects (`image`, `alt`, `text`, `description`, `key`, `content`, `data`) or image addresses."],[`value`,"`Bind<string | number | null>`","`0`","The current slide, identified by its `key` or index. `x-model` provides two-way binding."],[`loop`,"`Bind<boolean>`","`false`",`The first slide follows the last, and the transition wraps around instead of running back across the slides in between.`],[`showNavButtons`,"`Bind<boolean>`","`true`",`Shows previous and next buttons over the sides.`],[`showIndicator`,"`Bind<boolean>`","`true`",`Shows indicator dots below the slides, one per slide.`],[`slideInterval`,"`Bind<number>`","`0`","The time each slide stays in a slideshow, in milliseconds. `0` turns it off. The slideshow pauses on hover, while focus is inside, while the page is hidden and when the user prefers reduced motion."],[`pauseOnHover`,"`Bind<boolean>`","`true`",`Pauses the slideshow while the pointer is over the gallery.`],[`swipeEnabled`,"`Bind<boolean>`","`true`",`Lets a finger or pointer drag the slides. A drag that is far or fast enough moves to the next slide.`],[`itemsPerPage`,"`Bind<number>`","`1`","The number of slides side by side, with the `gap` token between them."],[`stretchImages`,"`Bind<boolean>`","`false`",`Makes an image fill its slide and crops the edges, instead of fitting the whole image inside.`],[`height`,"`Bind<string | number | null>`","`null`",`A CSS length or pixels. Without it, the gallery is as tall as its tallest slide.`],[`label`,"`Bind<string>`",`The kit string “Gallery”`,`The accessible name.`]],D=[[`onSlideChanging`,`event`,"Occurs before the current slide changes (`from`, `to`, `fromItem`, `toItem`, `byUser`). Set `cancel = true` to keep the current slide."],[`onSlideChanged`,`event`,"Occurs after the current slide changes (`index`, `item`, `previous`, and `byUser` for a click, swipe or key, as opposed to code or the slideshow)."],[`onItemClick`,`event`,"Occurs when a slide is clicked without dragging (`index`, `item`, `event`)."],[`selectedIndex`,`read-only`,`The index of the current slide, or -1 if there is none.`],[`count`,`read-only`,`The number of panes.`],[`isPlaying`,`read-only`,`Indicates that the slideshow is running and nothing is holding it.`],[`next(), previous()`,"`Promise<boolean>`","Moves to the next or previous slide. Returns `false` at an end without `loop`, or if the change was canceled."],[`goTo(pane)`,"`Promise<boolean>`","Moves to a slide by index or key. `onSlideChanging` is raised first."],[`play(), pause()`,"`void`","Starts the slideshow again, or stops it until `play()` is called. The button in the bar does the same."],[`refresh()`,"`void`",`Re-reads the items after they have been changed in place.`]],O=[[`Tab`,`The slideshow button, the dots (one Tab stop, on the dot of the current slide), the previous button, the slides and the next button, followed by any content in the current slide.`],[`Arrow keys`,`On the slides or dots, Left and Right move to the previous and next slide (reversed on right-to-left pages), and Home and End move to the first and last.`],[`Enter, Space`,`On a button or dot, activates it.`]],k=[[`Landmark`,'A `region` with `aria-roledescription="carousel"`, named “Gallery” in the kit language. If a page has several, give each one its own `label`.'],[`A pane`,'A `group` with `aria-roledescription="slide"`, named “Slide 2 of 5”. Slides out of view are hidden from assistive technology and the keyboard (`inert`).'],[`Images`,"Give each image an `alt`. An empty value marks a decorative image. The caption is read as part of the slide."],[`Slideshow`,"The slides are a live region while stopped (`polite`) and silent while running (`off`), as the carousel pattern requires. The button that stops the slideshow comes first in the Tab order."],[`Dots and arrows`,"Buttons named “Slide 2 of 5”, “Previous slide” and “Next slide”. The dot of the current slide has `aria-current`, and an arrow at an end has `aria-disabled`."]],A=[[`.mx-gallery`,"The gallery. `data-swipe` when dragging is enabled, `data-dragging` during a drag, `data-playing` while the slideshow runs, and `data-stretch`."],[`.mx-gallery__viewport, .mx-gallery__track`,"The frame that clips the slides and the track that moves inside it (`data-dragging`, `data-no-motion`)."],[`.mx-gallery__item, .mx-gallery__figure, .mx-gallery__image`,"A slide (`data-current`, `aria-hidden`), its content and the image."],[`.mx-gallery__caption, .mx-gallery__title, .mx-gallery__description`,`The caption band over the bottom of a slide and its two lines.`],[`.mx-gallery__nav, .mx-gallery__arrow`,"The previous and next buttons (`data-direction`, `aria-disabled`) and their glyphs."],[`.mx-gallery__bar, .mx-gallery__indicator, .mx-gallery__dot, .mx-gallery__play, .mx-gallery__play-glyph`,"The bar along the bottom, the dots (`aria-current`), the slideshow button and its glyph."]],j=[[`gallery.frame, .item, .caption, .title, .description`,"Units: the frame (`focus`, `swipeable`, `dragging`), a slide (`current`), the caption and its text."],[`gallery.nav, .arrow, .dot, .play, .play-glyph, .bar`,"Units: the side buttons (`hover`, `pressed`, `focus`, `disabled`), their glyphs (`icon` per direction), the dots (`current`, `hover`, `pressed`, `focus`), the slideshow button and its glyph (`icon` while `playing`), and the bar."],[`gallery.gap, .nav-inset, .bar-inset, .indicator-gap, .caption-padding`,`The gap between side-by-side slides, the offset of overlaid parts from the sides and bottom, the gap between dots, and the caption padding.`]];function M(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(l,{text:`Displays a horizontal set of slides, one or several at a time. Users navigate with the side buttons, the indicator dots, swipe gestures or the arrow keys, and it can run as an automatic slideshow. A slide can be an image with a caption or any other content.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(s,{anchor:`import`,title:`Import`,runover:{},childs:[t(o,{code:`
import { Gallery } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(s,{anchor:`ways`,title:`Images with captions`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"`items` defines the slides. Each one is an address or an item with `image`, `alt`, `text` and `description`. `value` is the visible slide, identified by its `key` or index, and `x-model` provides two-way binding. Users can drag a slide with a finger or the mouse, press an arrow or a dot, or use the keyboard.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:T(`Basic.tsx`),runover:{},childs:[t(y,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(s,{anchor:`slideshow`,title:`Looping and slideshow`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"`loop` wraps around at the ends. The slide on the other side moves next to the outgoing one, so the transition never runs back across the slides in between. `slideInterval` starts a slideshow, which pauses while the pointer is over the gallery, while focus is inside it, while the page is hidden, and when the user prefers reduced motion. The button in the bar pauses it manually. `stretchImages` makes images fill the slides.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:T(`Slideshow.tsx`),runover:{},childs:[t(w,{runover:{},childs:[]})]})]});e.controls.add(a);let d=t(s,{anchor:`perpage`,title:`Multiple slides per view`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"`itemsPerPage` sets how many slides fit in the width, separated by the `gap` token. The buttons and keys move one slide at a time and stop when the last slide is in view. The current slide is the first visible one.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:T(`PerPage.tsx`),runover:{},childs:[t(C,{runover:{},childs:[]})]})]});e.controls.add(d);let f=t(s,{anchor:`content`,title:`Any content`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"An item's `content` creates the slide content when the slide is created, and it behaves the same as anywhere else. `onItemClick` reports a click on a slide that was not a drag.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:T(`Content.tsx`),runover:{},childs:[t(x,{runover:{},childs:[]})]})]});e.controls.add(f);let p=t(s,{anchor:`programmatic`,title:`Programmatic use`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(l,{text:"Create the gallery with `new` and navigate with `next()`, `previous()` and `goTo()`. With `showNavButtons` and `showIndicator` off, you can use your own buttons, and `onSlideChanged` reports the position.",runover:{},childs:[]});e.controls.add(n)}},1),t(c,{stack:!0,files:T(`Programmatic.tsx`),runover:{},childs:[t(S,{runover:{},childs:[]})]})]});e.controls.add(p);let m=t(s,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[t(u,{head:[`Key`,`Description`],rows:O,runover:{},childs:[]})]});e.controls.add(m);let h=t(s,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(u,{head:[`Topic`,`Details`],rows:k,runover:{},childs:[]})]});e.controls.add(h);let g=t(s,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(u,{head:[`Hook`,`Description`],rows:A,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Token`,`Description`],rows:j,runover:{},childs:[]})]});e.controls.add(g);let _=t(s,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Prop`,`Type`,`Default`,`Description`],rows:E,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(l,{text:`Events, properties and methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(u,{head:[`Member`,`Type`,`Description`],rows:D,runover:{},childs:[]})]});e.controls.add(_)}}})}export{M as default};