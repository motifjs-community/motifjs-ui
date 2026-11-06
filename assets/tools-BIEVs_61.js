import{C as e,Dt as t,Et as n,G as r,It as i,J as a,Jt as o,Kt as s,L as c,Mt as l,Nt as u,Pt as d,Q as f,Qt as p,R as m,S as h,St as g,T as _,Wt as v,X as ee,Yt as te,_ as y,_t as ne,b as re,ct as ie,et as ae,f as b,ft as oe,g as se,gt as ce,h as x,ht as S,jt as le,k as C,m as w,pt as T,q as ue,qt as de,rt as fe,tn as E,un as D,ut as O,v as k,vt as pe,w as A,wt as me,zt as he}from"./doc-B1CtlCkV.js";import{t as j}from"./function-value-BXxxtm0f.js";import{t as ge}from"./Tooltip-Bkrhr0JL.js";import{t as _e}from"./swipe-tracker-mb6fhjbX.js";import{t as ve}from"./DragGhost-D4g2lITQ.js";import{t as ye}from"./scroll-step-DITG8-OU.js";import{n as be,r as xe,t as Se}from"./resize-frame-D2d60D6Y.js";import{t as Ce}from"./container-DnMm7ECX.js";import{t as we}from"./Toolbar-DdyzpIo5.js";import{t as Te}from"./BottomSheet-korXUQGi.js";import{n as Ee}from"./OverlayPanel-BsPcHbS9.js";import{t as De}from"./ActionSheet-DYh7fDD8.js";import{t as Oe}from"./ContextMenu-CCqfrkpd.js";import{t as ke}from"./Drawer-CdNSFLQj.js";import{t as Ae}from"./index-DVbtDn93.js";var je=class{manager;kind;popup=new re;documentMenu=new y;commandMenu=null;search=null;part;line;documents=[];shown=[];active=null;groups=!1;commandsFirst=!1;held=null;returnFocus=null;constructor(e,t){this.manager=e,this.kind=t;let n=this.popup;n.matchWidth=!1,n.placement=t===`open`?`bottom-end`:`bottom`,n.element.classList.add(`mx-tabdocs__popup`);let r=e.element.ownerDocument,i=this.part=r.createElement(`div`);i.className=`mx-tabdocs__list`;let a=this.line=r.createElement(`div`);if(a.className=`mx-menu__separator`,a.setAttribute(`role`,`separator`),n.element.append(i),t===`open`){let t=this.search=new Ae({type:`search`,size:`md`,stretch:!0,autocomplete:`off`});t.label=()=>e.textOf(`search`),t.placeholder=()=>e.textOf(`search`),t.element.classList.add(`mx-tabdocs__search`),t.onValueChanged(e=>this.showDocuments(e.value??``)),n.controls.add(t)}let o=this.documentMenu;if(o.source=e,o.element.classList.add(`mx-tabdocs__documents`),o.markBesideIcon=!0,o.radioMark=`check`,o.onChosen(e=>this.choose(e.item.data)),n.controls.add(o),t===`open`){let t=this.commandMenu=new y;t.source=e,t.element.classList.add(`mx-tabdocs__commands`),t.markColumn=!0,t.markBesideIcon=!0,t.onChosen(e=>{n.close(`code`),e.item.click?.(e)}),n.controls.add(t)}n.element.addEventListener(`keydown`,e=>this.onKeyDown(e),!0),n.onClosed(()=>this.stopHolding())}get isOpen(){return this.popup.isOpen}open(e,t,n,r=[],i=null,a={}){let o=this.popup,s=this.manager;o.parent||s.controls.add(o),this.search&&this.part.append(this.search.element),this.part.append(this.documentMenu.element),this.documents=t,this.active=a.active??null,this.groups=new Set(t.map(e=>e.group)).size>1,this.returnFocus=e.ownerDocument.activeElement,this.documentMenu.element.setAttribute(`aria-label`,s.textOf(this.kind===`open`?`tabDocsOpenList`:`tabDocsRecent`));let c=a.list!==!1;this.part.hidden=!c;let l=this.search;l&&(l.value=``),this.showDocuments(``);let u=this.commandMenu;u&&(u.markColumn=u.markBesideIcon=c,u.setItems(r),u.element.hidden=!r.length,this.commandsFirst=!!a.commandsFirst,this.commandsFirst?this.part.before(u.element,this.line):this.part.after(this.line,u.element),this.line.hidden=!r.length||!c),o.open(e,{returnFocus:this.returnFocus??void 0}),!c&&u?u.focusItem(`first`):l?(l.focus(),this.keepInSight(this.itemOf(t[n]))):this.itemOf(t[n])?.focus(),this.stopHolding(),i&&(i.ctrlKey||i.altKey||i.metaKey)&&(this.held={ctrl:i.ctrlKey,alt:i.altKey,meta:i.metaKey},e.ownerDocument.addEventListener(`keyup`,this.onKeyUp,!0))}walk(e){let t=this.shown.length;if(!t)return;let n=this.shown.indexOf(this.focusedDocument());this.itemOf(this.shown[(n+e+t)%t])?.focus()}close(){this.popup.close(`code`)}dispose(){this.stopHolding(),this.popup.isDisposed||this.popup.dispose()}showDocuments(e){let t=k(e.trim());this.shown=t?this.documents.filter(e=>k(e.title).includes(t)):[...this.documents];let n=this.shown.map(e=>this.menuItem(e));n.length||n.push({text:this.manager.textOf(`noItems`),enabled:!1}),this.documentMenu.setItems(n),this.markUnsaved()}menuItem(e){let t=this.manager,n=[];return e.description&&n.push(e.description),this.groups&&n.push(t.textOf(`tabDocsInGroup`,{n:t.groups.indexOf(e.group)+1})),{text:e.title.replace(/&/g,`&&`),description:n.join(` · `),icon:e.icon,hint:e.tooltip||(e.description?`${e.title} — ${e.description}`:``),group:`documents`,checked:e===this.active,data:e}}markUnsaved(){let e=this.documentItems();this.shown.forEach((t,n)=>{if(!t.dirty||!e[n])return;let r=e[n].ownerDocument,i=r.createElement(`span`);i.className=`mx-tabdocs__hidden`,i.textContent=`, ${this.manager.textOf(`tabDocsUnsaved`)}`;let a=r.createElement(`span`);a.className=`mx-tabdocs__list-dirty`,e[n].append(i,a)})}keepInSight(e){if(!e)return;let t=this.documentMenu.element,n=t.getBoundingClientRect(),r=e.getBoundingClientRect();r.top<n.top?t.scrollTop-=n.top-r.top:r.bottom>n.bottom&&(t.scrollTop+=r.bottom-n.bottom)}documentItems(){return Array.from(this.documentMenu.element.querySelectorAll(`:scope > .mx-menu__item`))}itemOf(e){let t=e?this.shown.indexOf(e):-1;return t<0?void 0:this.documentItems()[t]}focusedDocument(){let e=this.popup.element.ownerDocument.activeElement;return this.shown[this.documentItems().findIndex(t=>t===e)]}choose(e){this.popup.close(`code`),D(()=>this.manager.activateFromList(e))}onKeyDown(e){let t=e.target;if(t.closest(`.mx-popup`)!==this.popup.element)return;let n=this.documentMenu.element.contains(t),r=this.search;if(e.key===`Enter`){let i=n?this.focusedDocument():r&&t===r.inputElement?this.shown[0]:void 0;if(!i)return;e.preventDefault(),e.stopPropagation(),this.choose(i);return}if(this.kind!==`open`||e.ctrlKey||e.metaKey||e.altKey)return;let i=!0;e.key===`ArrowDown`||e.key===`ArrowUp`?this.step(e.key===`ArrowDown`?1:-1):e.key===`Tab`?i=this.tabTo(t,e.shiftKey?-1:1):n&&r&&(e.key===`Backspace`||e.key.length===1&&e.key!==` `)?this.typeInSearch(e.key):i=!1,i&&(e.preventDefault(),e.stopPropagation())}parts(){let e=this.part.hidden?[]:[this.search.inputElement,this.documentMenu.element],t=this.commandMenu.element;return t.hidden?e:this.commandsFirst?[t,...e]:[...e,t]}step(e){let t=this.parts().flatMap(e=>e===this.search?.inputElement?[e]:Array.from(e.querySelectorAll(`:scope > .mx-menu__item`)));if(!t.length)return;let n=t.indexOf(this.popup.element.ownerDocument.activeElement);t[n<0?e>0?0:t.length-1:(n+e+t.length)%t.length].focus()}tabTo(e,t){let n=this.parts(),r=n[n.findIndex(t=>t.contains(e))+t];return r?(r===this.search?.inputElement?r.focus():r===this.commandMenu?.element?this.commandMenu.focusItem(t>0?`first`:`last`):this.documentMenu.focusItem(t>0?`first`:`last`),!0):!1}typeInSearch(e){let t=this.search,n=t.inputElement;n.focus(),t.value=e===`Backspace`?t.value.slice(0,-1):t.value+e,n.setSelectionRange(n.value.length,n.value.length)}onKeyUp=e=>{let t=this.held;if(!t||t.ctrl&&e.ctrlKey||t.alt&&e.altKey||t.meta&&e.metaKey)return;let n=this.focusedDocument();this.stopHolding(),n&&this.choose(n)};stopHolding(){this.held=null,this.manager.element.ownerDocument.removeEventListener(`keyup`,this.onKeyUp,!0)}},Me=class{document;manager;header;panel;group=null;lastFocus=null;label;letter;close;pin;unsaved;status;description=null;icon=null;releaseIcon=()=>{};badge=null;tooltip=null;tipHolder=null;closeKey=null;content=null;shown=!1;scrolls=new Map;hiddenIn=null;stops=[];constructor(e,t){this.document=e,this.manager=t;let n=t.element.ownerDocument,r=this.header=n.createElement(`button`);r.type=`button`,r.className=`mx-tabdocs__tab`,r.id=w(`tabdoc`),r.tabIndex=-1,r.setAttribute(`role`,`tab`),r.setAttribute(`aria-selected`,`false`),this.letter=M(r,`mx-tabdocs__letter`),this.letter.setAttribute(`aria-hidden`,`true`),this.label=M(r,`mx-tabdocs__title`),this.unsaved=M(r,`mx-tabdocs__hidden`),this.unsaved.hidden=!0,this.status=M(r,`mx-tabdocs__hidden`),this.status.hidden=!0,this.pin=M(r,`mx-tabdocs__pin`),this.pin.setAttribute(`aria-hidden`,`true`),this.pin.append(f()),this.close=M(r,`mx-tabdocs__close`),this.close.setAttribute(`aria-hidden`,`true`),this.close.append(c()),M(this.close,`mx-tabdocs__dirty`);let i=(this.panel=new o(`div`)).element;i.className=`mx-tabdocs__panel`,i.id=w(`tabdoc-panel`),i.hidden=!0,i.setAttribute(`role`,`tabpanel`),i.setAttribute(`aria-labelledby`,r.id),r.setAttribute(`aria-controls`,i.id),i.addEventListener(`scroll`,e=>this.noteScroll(e.target),{capture:!0,passive:!0}),this.render()}get contentComponent(){return this.content}show(e){let t=this.panel.element;!e&&!t.hidden&&(this.hiddenIn=t.ownerDocument),this.shown=e,this.header.setAttribute(`aria-selected`,String(e)),t.hidden=!e,e?(this.hiddenIn&&this.hiddenIn!==t.ownerDocument&&this.restoreScrolls(),this.hiddenIn=null,this.build(),this.updatePanelFocus()):this.lifetime()===`dispose`&&this.release()}prepare(){this.lifetime()===`keep`&&this.build()}focusContent(e=!1){let t={preventScroll:e},n=this.lastFocus;return n&&this.panel.element.contains(n)&&ce(n)?(n.focus(t),!0):((S(this.panel.element).find(pe)??(ce(this.panel.element)?this.panel.element:null)??this.header).focus(t),!0)}updatePanelFocus(){let e=this.panel.element;e.hidden||(S(e).length?e.removeAttribute(`tabindex`):e.hasAttribute(`tabindex`)||(e.tabIndex=0))}attachTooltip(e){this.tipHolder=e,this.tooltip?.dispose(),this.tooltip=null,this.renderTooltip(D(()=>this.tooltipText()))}moveTo(e){for(let e of this.stops.splice(0))e();this.manager=e,this.render()}dispose(){for(let e of this.stops.splice(0))e();this.releaseIcon(),this.attachTooltip(null),this.header.remove(),this.panel.isDisposed||this.panel.dispose(),this.content=null}noteScroll(e){let t=e;t&&typeof t.scrollTop==`number`&&(t.scrollTop||t.scrollLeft?this.scrolls.set(t,[t.scrollTop,t.scrollLeft]):this.scrolls.delete(t))}restoreScrolls(){let e=this.panel.element;for(let[t,[n,r]]of this.scrolls){if(!e.contains(t)){this.scrolls.delete(t);continue}t.scrollTop=n,t.scrollLeft=r}}lifetime(){return D(()=>this.document.contentLifetime??this.manager.contentLifetime)}build(){if(this.content)return;let e=D(()=>this.manager.makeContent(this.document));e&&(this.content=e,this.panel.controls.add(e))}release(){if(!this.content||!this.manager.canRemake(this.document))return;let e=this.content;this.content=null,this.lastFocus=null,this.panel.controls.remove(e)}tooltipText(){let e=this.document;return e.tooltip?e.tooltip:e.description?`${e.title} — ${e.description}`:``}watch(e,n){this.stops.push(t(this.manager,`tab`,e,n))}render(){let e=this.document;this.watch(()=>e.title,e=>{this.label.textContent=e,this.letter.textContent=Array.from(e.trim())[0]?.toLocaleUpperCase(l.locale)??``,this.manager.tabChanged(this)}),this.watch(()=>this.manager.showsDescription(e)?e.description:``,e=>this.renderDescription(e)),this.watch(()=>e.tone,e=>{e?this.header.dataset.tone=e:this.header.removeAttribute(`data-tone`)}),this.watch(()=>{let t=e.pinned,n=e.preview;return{pinned:t,preview:n,text:t?this.manager.textOf(`tabDocsPinState`):n?this.manager.textOf(`tabDocsPreviewState`):``,unpin:this.manager.textOf(`tabDocsUnpin`)}},({pinned:e,preview:t,text:n,unpin:r})=>{let i=this.header,a=i.hasAttribute(`data-pinned`);i.toggleAttribute(`data-pinned`,e),i.toggleAttribute(`data-preview`,t),this.status.textContent=n?`, ${n}`:``,this.status.hidden=!n,this.pin.title=r,a!==e&&this.manager.pinChanged(this),this.manager.tabChanged(this)}),this.watch(()=>e.dirty,t=>{t&&e.preview&&this.manager.keepByChange(e)}),this.watch(()=>e.icon,e=>this.renderIcon(e)),this.watch(()=>e.badge,e=>this.renderBadge(e)),this.watch(()=>({dirty:e.dirty,closable:e.closable&&(!e.pinned||this.manager.closeButtonOnPinned),mode:this.manager.closeButton,text:this.manager.textOf(`tabDocsUnsaved`),closeHint:this.manager.textOf(`close`)}),({dirty:e,closable:t,mode:n,text:r,closeHint:i})=>{let a=this.header;a.toggleAttribute(`data-dirty`,e),this.unsaved.textContent=`, ${r}`,this.unsaved.hidden=!e,t&&n!==`never`?a.dataset.close=n:a.removeAttribute(`data-close`),this.close.title=i,this.manager.tabChanged(this)}),this.watch(()=>e.closable?this.manager.closeKeyHint():null,e=>{le(this.header,this.closeKey,e),this.closeKey=e}),this.watch(()=>this.tooltipText(),e=>this.renderTooltip(e)),this.watch(()=>e.contentLifetime??this.manager.contentLifetime,e=>{e===`keep`?this.build():e===`dispose`&&!this.shown&&this.release()})}renderTooltip(e){e&&!this.tooltip&&this.tipHolder?(this.tooltip=new ge({target:this.header,text:()=>this.tooltipText(),placement:`bottom`}),this.tipHolder.controls.add(this.tooltip)):!e&&this.tooltip&&(this.tooltip.dispose(),this.tooltip=null)}renderDescription(e){e&&!this.description?(this.description=this.header.ownerDocument.createElement(`span`),this.description.className=`mx-tabdocs__description`,this.label.after(this.description)):!e&&this.description&&(this.description.remove(),this.description=null),this.description&&(this.description.textContent=e),this.manager.tabChanged(this)}renderIcon(e){if(this.releaseIcon(),this.releaseIcon=()=>{},!e)this.icon?.remove(),this.icon=null;else{this.icon||(this.icon=this.header.ownerDocument.createElement(`span`),this.icon.className=`mx-tabdocs__icon`,this.icon.setAttribute(`aria-hidden`,`true`),this.header.prepend(this.icon));let t=h(e,this.header.ownerDocument);this.icon.replaceChildren(t.node),this.releaseIcon=t.release}this.header.toggleAttribute(`data-icon`,!!e),this.manager.tabChanged(this)}renderBadge(e){let t=e===!0,n=e==null||e===!1||t?``:String(e);(n||t)&&!this.badge?(this.badge=this.header.ownerDocument.createElement(`span`),this.badge.className=`mx-tabdocs__badge`,this.unsaved.before(this.badge)):!n&&!t&&this.badge&&(this.badge.remove(),this.badge=null),this.badge&&(this.badge.textContent=n,this.badge.toggleAttribute(`data-dot`,t)),this.manager.tabChanged(this)}};function M(e,t){let n=e.ownerDocument.createElement(`span`);return n.className=t,e.append(n),n}var Ne=class{root;area;mark;constructor(e){this.root=e;let t=e.ownerDocument;this.area=t.createElement(`div`),this.area.className=`mx-tabdocs__drop`,this.mark=t.createElement(`div`),this.mark.className=`mx-tabdocs__insert`;for(let e of[this.area,this.mark])e.hidden=!0,e.setAttribute(`aria-hidden`,`true`)}show(e,t){this.place(this.area,e),this.place(this.mark,t)}hide(){this.show(null,null)}place(e,t){if(!t){e.hidden=!0;return}e.isConnected||this.root.append(e);let n=e.hidden;n&&e.setAttribute(`data-instant`,``),e.hidden=!1;let r=e.style;r.left=`${Math.round(t.left)}px`,r.top=`${Math.round(t.top)}px`,r.width=t.width?`${Math.round(t.width)}px`:``,r.height=`${Math.round(t.height)}px`,n&&(e.offsetWidth,e.removeAttribute(`data-instant`))}};function Pe(e,t){let n=[],r=e=>{(e.scrollTop||e.scrollLeft)&&n.push([e,e.scrollTop,e.scrollLeft]);for(let t of e.children)r(t)};e.isConnected&&r(e);let i=t();for(let[e,t,r]of n)e.scrollTop!==t&&(e.scrollTop=t),e.scrollLeft!==r&&(e.scrollLeft=r);return i}function N(e,t,n){if(n===t||t.parentNode===e&&t.nextSibling===n)return;let r=e.moveBefore;if(r&&t.isConnected&&e.isConnected&&t.ownerDocument===e.ownerDocument)try{r.call(e,t,n);return}catch{}Pe(t,()=>e.insertBefore(t,n))}var Fe=new WeakMap,Ie=class{split;manager;element;drag=null;static of(e){return(e&&Fe.get(e))??null}constructor(e,t){this.split=e,this.manager=t;let n=this.element=t.element.ownerDocument.createElement(`div`);n.className=`mx-tabdocs__sash`,n.tabIndex=0,n.setAttribute(`role`,`separator`),n.setAttribute(`aria-valuemin`,`0`),n.setAttribute(`aria-valuemax`,`100`),n.addEventListener(`pointerdown`,e=>this.start(e)),n.addEventListener(`pointermove`,e=>this.move(e)),n.addEventListener(`pointerup`,e=>this.end(e)),n.addEventListener(`pointercancel`,e=>this.end(e)),n.addEventListener(`dblclick`,()=>e.resetSizes()),Fe.set(n,this)}get index(){return this.split.sashIndex(this)}start(e){e.button===0&&this.manager.isEnabled&&this.manager.beginResize(this.split)&&(e.preventDefault(),this.element.focus({preventScroll:!0}),this.element.setPointerCapture?.(e.pointerId),this.drag={pointer:e.pointerId,from:this.position(e),sizes:[...this.split.sizes]},this.manager.element.toggleAttribute(`data-resizing`,!0))}move(e){let t=this.drag;t&&t.pointer===e.pointerId&&(this.split.sizes=[...t.sizes],this.split.resizeBy(this.index,this.position(e)-t.from))}end(e){let t=this.drag;t&&t.pointer===e.pointerId&&(this.drag=null,this.element.releasePointerCapture?.(e.pointerId),this.manager.element.removeAttribute(`data-resizing`),this.manager.endResize(e.type===`pointerup`,this.split))}position(e){return this.split.orientation===`vertical`?e.clientY:this.split.rtl?-e.clientX:e.clientX}},Le=Symbol(`mx.tab-group`),Re=[],ze=[`center`,`left`,`right`,`up`,`down`],Be=[`autoHide`,`close`],Ve=[`closeWindow`],He=[],P=class extends Ce{constructor(e){super(`div`,{});let n=this,r=n[Le]=this.createParts(e);r.actions.items=()=>{let e=[...A(this.appItems()),...A(this.activeDocument?.actions)],t=this.look().buttons;if(t===`all`)return[r.grip,...e,...r.own];let n=new Map(r.named.map(([e,t])=>[t,e]));return[r.grip,...e.filter(We),...r.own.filter(e=>!n.has(e)||t.includes(n.get(e)))]},this.listen(),t(this,`look`,()=>{let t=this.look();return{look:t,title:t.singleTabTitle&&this.documents.length===1&&!e.groupHasGuests(this),close:e.groupActions&&(!!this.dockArea||!!this.window)&&(t.buttons===`all`||t.buttons.includes(`close`))}},({look:e,title:t,close:n})=>this.renderLook(e,t,n)),this.observeProperty(`locked`,()=>D(()=>{let t=e.groups.indexOf(this);t>=0&&this.renderTexts(t+1)}))}get manager(){return this.parts.manager}get documents(){return this.getProperty(`documents`)??Re}get activeDocument(){return this.getProperty(`activeDocument`)??null}get recentDocuments(){return this.getProperty(`recent`)??Re}get previewDocument(){return this.documents.find(e=>e.preview)??null}get locked(){return!!this.getProperty(`locked`)}set locked(e){this.assignProperty(`locked`,e,Boolean)}get allowDrop(){return this.getProperty(`allowDrop`)!==!1}set allowDrop(e){this.assignProperty(`allowDrop`,e,Boolean)}get dropSides(){return this.getProperty(`dropSides`)??null}set dropSides(e){this.assignProperty(`dropSides`,e)}get isActive(){return!!this.getProperty(`isActive`)}get isMaximized(){return!!this.getProperty(`isMaximized`)}get isEmpty(){return this.documents.length===0}get window(){return this.getProperty(`window`)??null}get dockArea(){return this.getProperty(`dockArea`)??null}get browserWindow(){return this.getProperty(`browserWindow`)??null}get index(){return this.manager.groups.indexOf(this)}get hiddenTabCount(){return this.getProperty(`hiddenTabs`)??0}open(e,t={}){return this.manager.open(e,{...t,group:this})}activate(e,t=!1){return e.group===this&&this.manager.activate(e,t)}closeAll(){return this.manager.closeAll(this)}close(){return this.manager.closeGroup(this)}split(e,t){return this.manager.split(this,e,t)}maximize(){return this.manager.maximizeGroup(this)}lock(){return this.manager.lock(this)}unlock(){return this.manager.unlock(this)}focus(){return this.manager.focusGroup(this)}get focusElement(){let e=this[Le];return e?.active?.header??e?.list??this.element}get tabs(){return this.parts.tabs}get activeTab(){return this.parts.active}get recentTabs(){return this.parts.recent}get parentSplit(){return this.parts.split}set parentSplit(e){this.parts.split=e}get listElement(){return this.parts.list}get barElement(){return this.parts.bar.element}get rowElement(){return this.parts.row}get panelsElement(){return this.parts.panels.element}get isCompact(){return this.look().buttons!==`all`}foldedItems(){let e=this.parts;return D(()=>{let t=this.look().buttons;if(t===`all`)return[];let n=e.named.filter(([e])=>e!==`lock`&&!t.includes(e)).map(([,e])=>e),r=[...A(this.appItems()),...A(this.activeDocument?.actions)].filter(e=>!We(e)),i=n.length&&r.length?[{type:`separator`}]:[];return Ge([...n,...i,...r],e.actions)})}get acceptsDrop(){return D(()=>this.allowDrop)}get dropSidesNow(){return D(()=>this.dropSides??this.manager.dropSides??ze)}get moreButton(){let e=this.parts.actions.controlOf(this.parts.more);return e?.element.isConnected&&ne(e.element)?e.element:null}addTab(e,t){let n=this.parts,r=Math.max(0,Math.min(t,n.tabs.length));n.tabs.splice(r,0,e),n.recent.push(e),e.panel.parent?Pe(e.panel.element,()=>v.transport(e.panel,n.panels)):n.panels.controls.add(e.panel),e.group=this,e.attachTooltip(n.tips),this.arrange()}removeTab(e){let t=this.parts,n=t.tabs.indexOf(e);n<0||(t.tabs.splice(n,1),t.recent.splice(t.recent.indexOf(e),1),t.active===e&&(t.active=null),e.header.remove(),e.attachTooltip(null),e.group=null,this.changed())}moveTab(e,t){let n=this.parts,r=n.tabs.indexOf(e);r<0||(n.tabs.splice(r,1),n.tabs.splice(Math.max(0,Math.min(t,n.tabs.length)),0,e),this.arrange())}pinnedCount(){return D(()=>this.parts.tabs.filter(e=>e.document.pinned).length)}arrange(){let e=this.parts;D(()=>{let t=e.tabs.filter(e=>e.document.pinned);e.tabs.splice(0,e.tabs.length,...t,...e.tabs.filter(e=>!e.document.pinned))}),this.placeHeaders(),this.changed()}placeHeaders(){let e=this.parts;if(e.manager.groupFolded(this)){this.renderRoving(),e.manager.presentationSettingChanged();return}D(()=>{let t=e.tabs.filter(e=>e.document.pinned),n=e.manager.guestHeaders(this),r=T(this.element)??T(e.manager.element),i=[...e.tabs.map(e=>e.header),...n?.before??[],...n?.after??[]].find(e=>e===r);Je(e.pinnedRow,t.map(e=>e.header)),Je(e.row,[...n?.before??[],...e.tabs.filter(e=>!t.includes(e)).map(e=>e.header),...n?.after??[]]);for(let e of[...n?.before??[],...n?.after??[]])e.toggleAttribute(`data-guest`,!0),e.setAttribute(`aria-selected`,`false`),e.tabIndex=-1;for(let t of e.tabs)(!t.header.hasAttribute(`data-guest`)||t.header.parentElement===e.row||t.header.parentElement===e.pinnedRow)&&(t.header.removeAttribute(`data-guest`),t.header.setAttribute(`aria-selected`,String(t===e.active)));e.pinnedRow.hidden=!t.length,i&&i.isConnected&&T(i)!==i&&i.focus({preventScroll:!0})}),this.renderRoving(),this.queueOverflow()}showTab(e){let t=this.parts,n=t.active;n&&n!==e&&(n.show(!1),t.resize?.unobserve(n.header)),t.active=e,e&&t.resize?.observe(e.header),e&&(e.show(!0),t.recent.splice(t.recent.indexOf(e),1),t.recent.unshift(e)),this.changed(),e&&this.reveal(e)}placeIn(e,t,n,r=null){D(()=>{this.window!==e&&this.setProperty(`window`,e),this.dockArea!==t&&this.setProperty(`dockArea`,t),this.browserWindow!==r&&this.setProperty(`browserWindow`,r),!!this.getProperty(`windowTitle`)!==n&&this.setProperty(`windowTitle`,n)}),this.element.toggleAttribute(`data-floating`,!!e),t?this.element.dataset.dock=t.side:this.element.removeAttribute(`data-dock`)}markActive(e){this.element.toggleAttribute(`data-active`,e),this.setProperty(`isActive`,e)}markMaximized(e){this.element.toggleAttribute(`data-maximized`,e),this.setProperty(`isMaximized`,e)}renderTexts(e){let t=this.manager,n=D(()=>this.locked);this.element.toggleAttribute(`data-locked`,n),this.element.setAttribute(`aria-label`,t.textOf(n?`tabDocsLockState`:`tabDocsGroup`,{n:e})),this.parts.list.setAttribute(`aria-label`,t.textOf(`tabDocsTabs`,{n:e})),this.parts.actions.controlOf(this.parts.grip)?.element.classList.add(`mx-tabdocs__grip`),this.parts.actions.controlOf(this.parts.autoHide)?.element.classList.add(`mx-tabdocs__auto-hide`),this.parts.actions.controlOf(this.parts.close)?.element.classList.add(`mx-tabdocs__bar-close`),this.parts.empty.textContent=t.textOf(`tabDocsEmpty`)}tabOf(e){let t=g(e)?e.closest(`.mx-tabdocs__tab`):null;return t?this.parts.tabs.find(e=>e.header===t):void 0}isGrip(e){let t=this.parts.actions.controlOf(this.parts.grip);return me(e)&&!!t?.element.contains(e)}isStripSpace(e){let t=this.parts;return!g(e)||!t.bar.element.contains(e)||this.tabOf(e)||t.scrollbar.contains(e)?!1:!t.actions.element.contains(e)||e===t.actions.element}reveal(e){let t=e.header.parentElement===this.parts.row||!e.header.isConnected?this.parts.row:e.header.closest(`.mx-tabdocs__row`)??this.parts.row,n=e.header;if(!t.isConnected||n.parentElement!==t)return;let r=t.getBoundingClientRect(),i=n.getBoundingClientRect();i.left<r.left||i.width>r.width?t.scrollLeft+=i.left-r.left:i.right>r.right&&(t.scrollLeft+=i.right-r.right)}renderRoving(){let e=this.parts;for(let t of e.tabs)t.header.tabIndex=t===e.active&&!t.header.hasAttribute(`data-guest`)?0:-1}restoreRecent(e){let t=this.parts,n=e.map(e=>t.tabs[e]).filter(e=>!!e);for(let e of t.recent)n.includes(e)||n.push(e);t.recent=n,this.changed()}disposeTabs(){let e=this.parts;for(let t of e.tabs.splice(0))t.dispose();e.recent=[],e.active=null,this.changed()}queueOverflow(){let e=this.parts;e.overflowQueued||(e.overflowQueued=!0,queueMicrotask(()=>{e.overflowQueued=!1,this.isDisposed||this.renderOverflow()}))}renderOverflow(){let{row:e,strip:t,back:n,forward:r}=this.parts,i=e.scrollWidth,a=e.clientWidth,o=i>a+1;t.toggleAttribute(`data-overflow`,o);let s=Math.abs(e.scrollLeft);n.toggleAttribute(`data-end`,s<=1),r.toggleAttribute(`data-end`,s+a>=i-1);let c=0;if(o){let t=e.getBoundingClientRect();for(let n of Array.from(e.children)){let e=n.getBoundingClientRect();(e.left<t.left-1||e.right>t.right+1)&&c++}this.placeThumb(t,i,a,s)}c!==D(()=>this.hiddenTabCount)&&D(()=>this.setProperty(`hiddenTabs`,c))}placeThumb(e,t,n,r){let{strip:i,scrollbar:a}=this.parts,o=i.getBoundingClientRect(),s=Math.min(1,n/t),c=a.style;c.setProperty(`--_track-start`,`${Math.round(Ue(i)?o.right-e.right:e.left-o.left)}px`),c.setProperty(`--_track-size`,`${Math.round(e.width)}px`),c.setProperty(`--_thumb-size`,`${(s*100).toFixed(2)}%`),c.setProperty(`--_thumb-at`,`${(Math.min(r,t-n)/(t-n)*(1-s)*100).toFixed(2)}%`)}dragThumb(e){let{row:t,scrollbar:n,thumb:r}=this.parts;if(e.button!==0)return;e.preventDefault(),e.stopPropagation();let i=t.scrollLeft,a=t.scrollWidth/Math.max(1,t.clientWidth);n.toggleAttribute(`data-dragging`,!0),xe(r,e,e=>t.scrollLeft=i+e*a,()=>n.removeAttribute(`data-dragging`))}look(){let e=this.manager,t=this.dockArea??this.window;if(!t&&!this.browserWindow&&e.currentPresentation!==`desktop`&&e.narrowBars===`compact`){let t=e.compactBarButtons;return{scrollButtons:e.compactScrollButtons,tabSize:e.compactTabSize,tabMinWidth:e.compactTabMinWidth,singleTabTitle:e.compactSingleTabTitle,buttons:t===`auto`?He:t,buttonSize:e.compactBarButtonSize}}if(!t)return{scrollButtons:e.scrollButtons,tabSize:e.tabSize,tabMinWidth:e.tabMinWidth,singleTabTitle:e.singleTabTitle,buttons:e.barButtons,buttonSize:e.barButtonSize};let n=t.barButtons??e.compactBarButtons;return{scrollButtons:t.scrollButtons??e.compactScrollButtons,tabSize:t.tabSize??e.compactTabSize,tabMinWidth:t.tabMinWidth??e.compactTabMinWidth,singleTabTitle:t.singleTabTitle??e.compactSingleTabTitle,buttons:n===`auto`?this.dockArea?Be:Ve:n,buttonSize:t.barButtonSize??e.compactBarButtonSize}}renderLook(e,t,n){let r=this.element;r.dataset.tabSize=e.tabSize,r.style.setProperty(`--_tab-min`,`${e.tabMinWidth}px`),r.toggleAttribute(`data-scroll-buttons`,e.scrollButtons),r.toggleAttribute(`data-compact`,e.buttons!==`all`),r.toggleAttribute(`data-title`,t),r.toggleAttribute(`data-bar-close`,n),r.dataset.barSize=e.buttonSize,this.queueOverflow()}moreText(){let e=this.manager,t=this.look(),n=t.scrollButtons?0:this.hiddenTabCount;return t.buttons===`all`?n?e.textOf(`tabDocsOpenListHidden`,{n}):e.textOf(`tabDocsOpenList`):e.openList?n?e.textOf(`tabDocsBarMenuHidden`,{n}):e.textOf(`tabDocsBarMenu`):e.textOf(`moreOptions`)}scrollBy(e){let t=this.parts.row,n=t.ownerDocument.defaultView,r=!!n&&!n.matchMedia?.(`(prefers-reduced-motion: reduce)`).matches,i=n?.getComputedStyle(t).direction===`rtl`;t.scrollBy({left:e*(i?-1:1)*t.clientWidth*.8,behavior:r?`smooth`:`auto`})}appItems(){let e=this.parts,t=e.manager.toolbarItems;return t!==e.app.make&&(e.app={make:t,items:t?D(()=>t(this)):[]}),e.app.items}changed(){let e=this.parts;D(()=>{this.setProperty(`documents`,e.tabs.map(e=>e.document)),this.setProperty(`activeDocument`,e.active?.document??null),this.setProperty(`recent`,e.recent.map(e=>e.document))});let t=!e.tabs.length;this.element.toggleAttribute(`data-empty`,t),e.list.hidden=t,e.empty.hidden=!t,this.renderRoving()}get parts(){return this[Le]}createParts(e){let t=this.element,n=t.ownerDocument;t.classList.add(`mx-tabdocs__group`),t.id=w(`tabdocs-group`),t.setAttribute(`role`,`group`),t.toggleAttribute(`data-empty`,!0);let i=new o(`div`);i.element.className=`mx-tabdocs__bar`;let s=F(n,`mx-tabdocs__strip`),l=F(n,`mx-tabdocs__tabs`);l.setAttribute(`role`,`tablist`),l.hidden=!0;let u=F(n,`mx-tabdocs__pinned`);u.hidden=!0;let d=F(n,`mx-tabdocs__row`);for(let e of[u,d])e.setAttribute(`role`,`presentation`);l.append(u,d);let p=qe(n,`back`),m=qe(n,`forward`),h=F(n,`mx-tabdocs__scrollbar`);h.setAttribute(`aria-hidden`,`true`);let g=F(n,`mx-tabdocs__thumb`);h.append(g),s.append(l,p,m,h),i.element.append(s);let _={icon:()=>fe(),hint:()=>e.textOf(`tabDocsSplitRight`),visible:()=>e.groupActions&&!this.dockArea,click:()=>e.splitByUser(this,`right`)},v={icon:()=>this.isMaximized?ae():a(),hint:()=>e.textOf(this.isMaximized?`tabDocsRestore`:`tabDocsMaximize`),visible:()=>e.groupActions&&!this.window&&!this.dockArea&&(this.isMaximized||e.canMaximize(this)),click:()=>e.toggleMaximizeByUser(this)},te={overflow:`never`,icon:()=>f(),hint:()=>e.textOf(this.dockArea?.autoHidden?`tabDocsAutoHideOff`:`tabDocsAutoHide`),visible:()=>e.groupActions&&!!this.dockArea&&e.mayAutoHide(this.dockArea)&&e.currentPresentation===`desktop`,click:()=>e.toggleAutoHideByUser(this)},y={overflow:`never`,icon:()=>c(),hint:()=>{let t=this.activeDocument;return t?e.textOf(t.closable?`tabDocsCloseActive`:`tabDocsHideActive`,{title:t.title}):e.textOf(`close`)},enabled:()=>!!this.activeDocument&&e.mayCloseOrHide(this.activeDocument),visible:()=>e.groupActions&&(!!this.dockArea||!!this.window),click:()=>e.closeActiveByUser(this)},ne={icon:()=>this.window?.isMaximized?ae():a(),hint:()=>e.textOf(this.window?.isMaximized?`tabDocsRestoreWindow`:`tabDocsMaximizeWindow`),visible:()=>e.groupActions&&!!this.getProperty(`windowTitle`),click:()=>e.toggleWindowMaximizeByUser(this)},re={icon:()=>c(),hint:()=>e.textOf(`tabDocsCloseWindow`),visible:()=>e.groupActions&&!!this.getProperty(`windowTitle`),click:()=>e.closeWindowByUser(this)},ie={icon:()=>ue(),hint:()=>e.textOf(`tabDocsUnlock`),visible:()=>this.locked,click:()=>e.unlockByUser(this)},b={icon:()=>{let e=this.look().scrollButtons?0:this.hiddenTabCount;return e?Ke(this.element.ownerDocument,e):ee()},hint:()=>this.moreText(),overflow:()=>this.isCompact?`never`:`auto`,visible:()=>e.groupActions&&(e.openList||this.isCompact),click:()=>e.showOpenList(this)},oe=[_,v,ie,b,te,y,ne,re],se=[[`split`,_],[`maximize`,v],[`lock`,ie],[`autoHide`,te],[`close`,y],[`maximizeWindow`,ne],[`closeWindow`,re]],ce={icon:()=>r(),hint:()=>e.textOf(`tabDocsMoveGroupTo`),visible:()=>e.groupDragHandle&&e.allowDragGroups,overflow:`never`,click:()=>e.showMoveTo(this)},x=new we({overflow:`menu`,label:()=>e.textOf(`tabDocsGroupActions`)});x.element.classList.add(`mx-tabdocs__actions`),i.controls.add(x);let S=new o(`div`);S.element.className=`mx-tabdocs__panels`;let le=F(n,`mx-tabdocs__empty`);S.element.append(le);let C=new o(`div`);return C.element.className=`mx-tabdocs__tips`,this.controls.add(i,S,C),{manager:e,bar:i,strip:s,list:l,pinnedRow:u,row:d,back:p,forward:m,scrollbar:h,thumb:g,panels:S,tips:C,empty:le,actions:x,own:oe,named:se,autoHide:te,close:y,grip:ce,app:{make:null,items:[]},more:b,tabs:[],active:null,recent:[],split:null,overflowQueued:!1,resize:null}}listen(){let e=this.parts,{list:t,row:n,bar:r,manager:i}=e;this.element.addEventListener(`focusin`,()=>i.groupFocused(this)),t.addEventListener(`click`,e=>{let t=this.tabOf(e.target)??i.tabOfHeader(e.target);if(!t)return;let n=e.target;!this.element.matches(`[data-title][data-bar-close]`)&&n.closest(`.mx-tabdocs__close`)?(e.stopPropagation(),i.closeByUser(t.document)):n.closest(`.mx-tabdocs__pin`)?(e.stopPropagation(),i.unpinByUser(t.document)):i.activateByUser(t.document)}),t.addEventListener(`mousedown`,e=>{e.target.closest(`.mx-tabdocs__close, .mx-tabdocs__pin`)&&e.preventDefault()}),t.addEventListener(`auxclick`,e=>{let t=this.tabOf(e.target)??i.tabOfHeader(e.target);t&&e.button===1&&(e.preventDefault(),i.closeByUser(t.document))}),r.element.addEventListener(`touchmove`,e=>i.holdTouch(e),{passive:!1}),r.element.addEventListener(`mousedown`,e=>{this.isStripSpace(e.target)&&e.preventDefault()}),r.element.addEventListener(`dblclick`,e=>{let t=this.tabOf(e.target);t&&!e.target.closest(`.mx-tabdocs__close, .mx-tabdocs__pin`)?i.tabDoubleClicked(this,t.document):!t&&this.isStripSpace(e.target)&&i.stripDoubleClicked(this)}),n.addEventListener(`wheel`,e=>{e.deltaX||!e.deltaY||n.scrollWidth<=n.clientWidth||(e.preventDefault(),n.scrollLeft+=e.deltaY)},{passive:!1}),n.addEventListener(`scroll`,()=>this.renderOverflow()),e.thumb.addEventListener(`pointerdown`,e=>this.dragThumb(e));for(let t of[e.back,e.forward])t.addEventListener(`mousedown`,e=>e.preventDefault()),t.addEventListener(`click`,()=>this.scrollBy(t===e.forward?1:-1));t.addEventListener(`focusin`,e=>{let t=this.tabOf(e.target)??i.tabOfHeader(e.target);t&&this.reveal(t)}),e.panels.element.addEventListener(`focusin`,t=>{let n=t.target,r=e.tabs.find(e=>e.panel.element.contains(n));r&&n!==r.panel.element&&(r.lastFocus=n)});let a=this.element.ownerDocument.defaultView;if(a&&typeof a.MutationObserver==`function`){let t=new a.MutationObserver(()=>e.active?.updatePanelFocus());t.observe(e.panels.element,{childList:!0,subtree:!0}),this.motif.setDisposable(()=>t.disconnect())}if(a&&typeof a.ResizeObserver==`function`){let t=e.resize=new b(()=>{e.active&&this.reveal(e.active),this.renderOverflow()});t.observe(n);let r=-1,i=new b(()=>{let t=e.bar.element.clientWidth;t!==r&&(r=t,e.actions.updateOverflow())});i.observe(e.bar.element),this.motif.setDisposable(()=>{t.disconnect(),i.disconnect()})}}};function F(e,t){let n=e.createElement(`div`);return n.className=t,n}function Ue(e){let t=e.ownerDocument.defaultView;return!!t&&t.getComputedStyle(e).direction===`rtl`}function We(t){return e(t,`overflow`)===`never`}function Ge(t,n){let r=[],i=!1;for(let a of t){let t=e(a,`type`)??`button`;if(t===`separator`){i=r.length>0;continue}let o=e=>_(a,e),s={text:()=>e(a,`text`)||e(a,`hint`)||``,icon:o(`icon`),hint:o(`hint`),tone:o(`tone`),enabled:o(`enabled`),visible:o(`visible`),beginGroup:i,data:o(`data`)};t===`menu`?s.items=o(`menu`)??[]:s.click=e=>_(a,`click`)?.({item:a,source:n,event:e.event}),t===`toggle`&&(s.checked=()=>!!e(a,`pressed`)),r.push(s),i=!1}return r}function Ke(e,t){let n=e.createElement(`span`);return n.className=`mx-tabdocs__count`,n.textContent=`+${t}`,n}function qe(e,t){let n=e.createElement(`span`);return n.className=`mx-tabdocs__scroll`,n.dataset.direction=t,n.setAttribute(`aria-hidden`,`true`),n.append(C()),n}function Je(e,t){for(t.forEach((t,n)=>{let r=e.children[n]??null;r!==t&&N(e,t,r)});e.children.length>t.length;)e.lastElementChild.remove()}var I=class{manager;orientation;element;parentSplit=null;children=[];sizes=[];sashes=[];constructor(e,t){this.manager=e,this.orientation=t,this.element=e.element.ownerDocument.createElement(`div`),this.element.className=`mx-tabdocs__split`,this.element.id=w(`tabdocs-split`)}get rtl(){let e=this.element.ownerDocument.defaultView;return!!e&&e.getComputedStyle(this.element).direction===`rtl`}sashIndex(e){return this.sashes.indexOf(e)}insert(e,t,n=1/(this.children.length+1)){let r=1-n;this.sizes=this.sizes.map(e=>e*r),this.children.splice(t,0,e),this.sizes.splice(t,0,this.children.length===1?1:n),e.parentSplit=this}remove(e){let t=this.children.indexOf(e);if(t<0)return;let[n]=this.sizes.splice(t,1);this.children.splice(t,1),this.children.length&&(this.sizes[Math.max(0,t-1)]+=n),e.parentSplit=null}replace(e,t){let n=this.children.indexOf(e);n<0||(this.children[n]=t,t.parentSplit=this,e.parentSplit=null)}even(){this.sizes=this.children.map(()=>1/this.children.length)}resetSizes(){this.manager.evenSizesBy(this,!0)}resizeBy(e,t){let n=this.room();if(!n||e<0||e>=this.children.length-1)return!1;let r=this.sizes[e]*n,i=this.sizes[e+1]*n,a=Math.min(this.minSize(this.children[e]),r+i),o=Math.max(a,r+i-this.minSize(this.children[e+1])),s=Math.min(Math.max(r+t,a),o),c=this.sizes[e]+this.sizes[e+1];return this.sizes[e]=c*s/(r+i),this.sizes[e+1]=c-this.sizes[e],this.render(),!0}room(){let e=this.orientation===`vertical`,t=0;for(let n of this.children){let r=n.element.getBoundingClientRect();t+=e?r.height:r.width}return t}minSize(e){if(e instanceof P)return this.orientation===`vertical`?this.manager.minGroupHeight:this.manager.minGroupWidth;let t=e.children.map(e=>this.minSize(e));return e.orientation===this.orientation?t.reduce((e,t)=>e+t,0):Math.max(0,...t)}render(){let e=this.element;e.dataset.orientation=this.orientation;let t=Math.max(0,this.children.length-1);for(;this.sashes.length<t;)this.sashes.push(new Ie(this,this.manager));for(let e of this.sashes.splice(t))e.element.remove();let n=[];for(this.children.forEach((e,r)=>{n.push(e.element),r<t&&n.push(this.sashes[r].element)}),n.forEach((t,n)=>N(e,t,e.children[n]??null));e.children.length>n.length;)e.lastElementChild.remove();this.children.forEach((e,t)=>e.element.style.flex=`${this.sizes[t]} 1 0px`),this.renderSashes()}renderSashes(){let e=this.manager.textOf(`tabDocsResize`);this.sashes.forEach((t,n)=>{let r=t.element,i=this.sizes[n]+this.sizes[n+1];r.setAttribute(`aria-orientation`,this.orientation===`horizontal`?`vertical`:`horizontal`),r.setAttribute(`aria-valuenow`,String(Math.round(i?this.sizes[n]/i*100:50))),r.setAttribute(`aria-label`,e),r.setAttribute(`aria-controls`,this.children[n].element.id)})}dispose(){for(let e of this.sashes.splice(0))e.element.remove();this.element.remove()}},Ye=[`left`,`right`,`up`,`down`],Xe=class{manager;kinds=[`strip`,`group`,`edge`];constructor(e){this.manager=e}placeAt(e,t,n){let r=this.manager;if(n.window&&n.manager!==r)return null;let i=r.groupAt(e,t,n.window??null);if(!i||!i.acceptsDrop)return null;if(Qe(i.barElement.getBoundingClientRect(),e,t))return this.stripPlace(i,this.indexAt(i,e,t,n),n);if(r.dockGuides||n.window)return null;let a=i.panelsElement.getBoundingClientRect(),o=!i.window&&!i.dockArea?this.layoutEdgeAt(i,a,e,t):null,s=o?this.edgePlace(o,n,i.browserWindow):null;if(s)return s;let c=this.sideAt(i,a,e,t);return c?this.groupPlace(i,c,n):null}marks(e,t){let n=e.group;return e.target===`strip`&&n?{area:null,mark:this.markAt(n,e.index,t)}:e.target===`group`&&n&&e.side?{area:et(n.panelsElement.getBoundingClientRect(),Ze(e.side,n.element),.5),mark:null}:e.target===`edge`&&e.side&&e.side!==`center`?{area:this.edgeArea(e.side,e.browserWindow??null),mark:null}:{area:null,mark:null}}drop(e,t){return this.manager.dropAt(e,t)}stripPlace(e,t,n){return!e.acceptsDrop||!n.document&&n.group===e||n.window&&e.window===n.window||n.document&&n.copy&&n.group===e?null:{target:`strip`,manager:this.manager,group:e,index:this.clampIndex(e,t,n),side:null}}groupPlace(e,t,n){return!e.acceptsDrop||!e.dropSidesNow.includes(t)||n.window&&e.window===n.window||n.group===e&&(!n.document||t===`center`||!n.copy&&e.documents.length<2)?null:{target:`group`,manager:this.manager,group:e,index:-1,side:t}}edgePlace(e,t,n=null){let r=this.manager;if(!r.layoutEdgeDrop)return null;let i=r.groups.filter(e=>!e.window&&!e.dockArea&&e.browserWindow===n);return i.length===1&&t.manager===r&&i[0]===t.group&&(!t.document||!t.copy&&i[0].documents.length<2)?null:{target:`edge`,manager:r,group:null,index:-1,side:e,browserWindow:n}}indexAt(e,t,n,r){let i=L(e.element),a=0;for(let o of e.tabs){if(o.document===r.document)continue;let e=o.header.getBoundingClientRect(),s=e.left+e.width/2;if(n>=e.bottom||n>=e.top&&(i?t<s:t>s))a++;else break}return a}clampIndex(e,t,n){let r=n.document,i=e.tabs.filter(e=>e.document!==r).length,a=Math.max(0,Math.min(t,i));if(!r||this.manager.pinOnDrag)return a;let o=e.tabs.filter(e=>e.document!==r&&e.document.pinned).length;return r.pinned?Math.min(a,o):Math.max(a,o)}markAt(e,t,n){let r=L(e.element),i=e.tabs.filter(e=>e.document!==n.document).map(e=>e.header),a=i[t],o=i[t-1];if(a){let e=a.getBoundingClientRect();return new DOMRect(r?e.right:e.left,e.top,0,e.height)}if(o){let e=o.getBoundingClientRect();return new DOMRect(r?e.left:e.right,e.top,0,e.height)}let s=e.rowElement.getBoundingClientRect(),c=e.barElement.getBoundingClientRect();return new DOMRect(r?s.right:s.left,c.top,0,c.height)}sideAt(e,t,n,r){let i=e.dropSidesNow,a=$e(this.manager.dropEdgeSize,t.width),o=$e(this.manager.dropEdgeSize,t.height),s=L(e.element),c=[[s?`right`:`left`,(n-t.left)/a],[s?`left`:`right`,(t.right-n)/a],[`up`,(r-t.top)/o],[`down`,(t.bottom-r)/o]].filter(([e,t])=>t<1&&i.includes(e)).sort((e,t)=>e[1]-t[1])[0];return c?c[0]:i.includes(`center`)?`center`:null}layoutEdgeAt(e,t,n,r){let i=this.manager,a=i.layoutEdgeSize,o=e.browserWindow,s=o?o.root:i.rootItem;if(!i.layoutEdgeDrop||a<=0||!s)return null;let c=s.element.getBoundingClientRect(),l=e.element.getBoundingClientRect(),u={left:l.left-c.left<2&&n-t.left<a,right:c.right-l.right<2&&t.right-n<a,up:l.top-c.top<2&&r-t.top<a,down:c.bottom-l.bottom<2&&t.bottom-r<a},d=Ye.find(e=>u[e]);return d?Ze(d,o?o.element:i.element):null}edgeArea(e,t){let n=t?t.root:this.manager.rootItem;if(!n)return null;let r=n.element.getBoundingClientRect(),i=e===`left`||e===`right`,a=n instanceof I&&n.orientation===(i?`horizontal`:`vertical`)?1/(n.children.length+1):.5;return et(r,Ze(e,t?t.element:this.manager.element),a)}};function Ze(e,t){return!L(t)||e===`up`||e===`down`||e===`center`?e:e===`left`?`right`:`left`}function Qe(e,t,n){return t>=e.left&&t<e.right&&n>=e.top&&n<e.bottom}function L(e){let t=e.ownerDocument.defaultView;return!!t&&t.getComputedStyle(e).direction===`rtl`}function $e(e,t){let n=String(e).trim(),r=parseFloat(n);return r>0?n.endsWith(`%`)?Math.max(1,t*r/100):r:1}function et(e,t,n){return t===`center`?new DOMRect(e.left,e.top,e.width,e.height):t===`left`?new DOMRect(e.left,e.top,e.width*n,e.height):t===`right`?new DOMRect(e.right-e.width*n,e.top,e.width*n,e.height):t===`up`?new DOMRect(e.left,e.top,e.width,e.height*n):new DOMRect(e.left,e.bottom-e.height*n,e.width,e.height*n)}var tt={left:`left`,right:`right`,up:`top`,down:`bottom`},R={left:`left`,right:`right`,top:`up`,bottom:`down`},nt={left:`tabDocsPlaceDockLeft`,right:`tabDocsPlaceDockRight`,top:`tabDocsPlaceDockTop`,bottom:`tabDocsPlaceDockBottom`},z={left:`right`,right:`left`,up:`down`,down:`up`},rt={center:`tabDocsPlaceInto`,left:`tabDocsPlaceLeft`,right:`tabDocsPlaceRight`,up:`tabDocsPlaceUp`,down:`tabDocsPlaceDown`},it={left:`tabDocsEdgeLeft`,right:`tabDocsEdgeRight`,up:`tabDocsEdgeUp`,down:`tabDocsEdgeDown`},at=class{manager;drag;where=null;stop=null;constructor(e,t){this.manager=e,this.drag=t}get isOn(){return!!this.stop}start(e,t){let n=this.manager;if(this.stop||!this.drag.begin(e,`keyboard`,t))return!1;let r=(t??e.group.element).ownerDocument.defaultView??window,i=e=>D(()=>this.key(e)),a=()=>D(()=>this.end(!1));r.addEventListener(`keydown`,i,!0),r.addEventListener(`pointerdown`,a,!0),r.addEventListener(`blur`,a),this.stop=()=>{r.removeEventListener(`keydown`,i,!0),r.removeEventListener(`pointerdown`,a,!0),r.removeEventListener(`blur`,a)};let o=e.group,s=this.groups(),c=s[(s.indexOf(o)+1)%s.length];this.where=c&&c!==o?{manager:c.manager,group:c,side:`center`}:{manager:n,group:o,side:`right`};let l=e.document?n.textOf(`tabDocsMoveStart`,{title:e.document.title}):n.textOf(`tabDocsMoveGroupStart`,{n:n.groups.indexOf(o)+1});return this.show(l),!0}end(e){if(!this.stop)return!1;this.stop(),this.stop=null;let t=this.where;this.where=null;let n=this.drag.finish(e);return n&&t&&t.manager.focusGroup(t.manager.activeGroup??0),n}key(e){let t=this.manager.keys,n=this.rtl(),r=!0;O(t.targetLeft,e)?this.go(n?`right`:`left`):O(t.targetRight,e)?this.go(n?`left`:`right`):O(t.targetUp,e)?this.go(`up`):O(t.targetDown,e)?this.go(`down`):O(t.targetNextGroup,e)?this.cycle(1):O(t.targetPreviousGroup,e)?this.cycle(-1):O(t.targetDrop,e)?this.end(!0):O(t.targetCancel,e)?this.end(!1):r=!1,r&&(e.preventDefault(),e.stopPropagation())}go(e){let t=this.where;if(t){if(t.newWindow)t.dock&&e===z[R[t.dock]]&&(this.where={...t,newWindow:!1});else if(t.float)t.dock&&e===R[t.dock]?this.where={...t,newWindow:!0}:t.dock&&e===z[R[t.dock]]&&(this.where={...t,float:!1});else if(t.dock){let n=R[t.dock];this.where=e===n?{...t,float:!0}:e===z[n]?{manager:t.manager,group:null,side:n,from:t.from}:{...t,side:e,dock:tt[e]}}else if(!t.group){let n=t.from&&t.manager.groups.includes(t.from)?t.from:t.manager.edgeGroup(t.side);this.where=e===z[t.side]?{manager:t.manager,group:n,side:`center`}:e===t.side&&t.manager===this.manager?{...t,dock:tt[e]}:{...t,side:e}}else if(t.side===`center`||t.side!==e&&t.side!==z[e])this.where={...t,side:e};else if(t.side===e){let n=t.manager.neighbourOf(t.group,e);this.where=n?{manager:t.manager,group:n,side:`center`}:{manager:t.manager,group:null,side:e,from:t.group}}else this.where={...t,side:`center`};this.show(``)}}cycle(e){let t=this.where,n=this.groups();if(!t||!n.length)return;let r=n[((t.group?n.indexOf(t.group):e===1?-1:0)+e+n.length)%n.length];this.where={manager:r.manager,group:r,side:`center`},this.show(``)}rtl(){let e=this.manager.element;return e.ownerDocument.defaultView?.getComputedStyle(e).direction===`rtl`}groups(){return this.manager.dragPeers().flatMap(e=>[...e.groups])}show(e){let t=this.where,n=this.drag.subject;if(!t||!n)return;let r=t.manager.layoutTarget,i=t.manager.dockDropTarget,a,o=t.manager.dropTargets.find(e=>e.kinds.includes(`new-window`))??null;a=t.newWindow?t.manager===n.manager&&t.manager.mayNewWindow(n)?{target:`new-window`,manager:t.manager,group:null,index:-1,side:null}:null:t.float?t.manager.floatPlace(n):t.dock?i.areaPlace(t.dock,n):t.group?r.groupPlace(t.group,t.side,n):r.edgePlace(t.side,n);let s=this.drag.aim(a,a?t.newWindow?o:t.float||t.dock?i:r:null),c=this.manager,l=this.rtl()&&(t.side===`left`||t.side===`right`)?z[t.side]:t.side,u=t.newWindow?c.textOf(`tabDocsPlaceNewWindow`):t.float?c.textOf(`tabDocsPlaceFloat`):t.dock?t.manager.textOf(nt[t.dock]):t.group?(e=>{let n=t.manager.textOf(rt[l],{n:t.manager.groups.indexOf(e)+1}),r=e.browserWindow;return r?t.manager.textOf(`tabDocsPlaceInWindow`,{place:n,n:r.index+1}):n})(t.group):t.manager.textOf(it[l]),d=s?u:c.textOf(`tabDocsPlaceRefused`,{place:u});c.sayText(e?`${e} ${d}`:d)}},ot=[`title`,`description`,`icon`,`tooltip`,`badge`,`tone`,`dirty`,`pinned`,`preview`,`closable`,`contentLifetime`,`allowDuplicate`,`allowDrag`,`allowFloat`,`allowDock`,`dockSides`,`allowAutoHide`,`allowHide`,`allowNewWindow`,`actions`,`state`],st=new Set([`pinned`,`preview`,`contentLifetime`]),ct=[],B=class e{id;type;content;clone;values=new Map;where=E(null);from;constructor(e={},t=null){this.id=e.id??w(`doc`),this.type=e.type??``,this.content=e.content??null,this.clone=e.clone??null,this.from=t;for(let t of ot)e[t]!==void 0&&(this.slot(t).value=e[t])}get title(){return this.get(`title`)??``}set title(e){this.slot(`title`).value=e}get description(){return this.get(`description`)??``}set description(e){this.slot(`description`).value=e}get icon(){return this.get(`icon`)??null}set icon(e){this.slot(`icon`).value=e}get tooltip(){return this.get(`tooltip`)??``}set tooltip(e){this.slot(`tooltip`).value=e}get badge(){return this.get(`badge`)??null}set badge(e){this.slot(`badge`).value=e}get tone(){return this.get(`tone`)??null}set tone(e){this.slot(`tone`).value=e}get dirty(){return!!this.get(`dirty`)}set dirty(e){this.slot(`dirty`).value=e}get pinned(){return!!this.get(`pinned`)}set pinned(e){this.slot(`pinned`).value=e}get preview(){return!!this.get(`preview`)}set preview(e){this.slot(`preview`).value=e}get closable(){return this.get(`closable`)??!0}set closable(e){this.slot(`closable`).value=e}get contentLifetime(){return this.get(`contentLifetime`)??void 0}set contentLifetime(e){this.slot(`contentLifetime`).value=e}get allowDuplicate(){return this.get(`allowDuplicate`)??void 0}set allowDuplicate(e){this.slot(`allowDuplicate`).value=e}get allowDrag(){return this.get(`allowDrag`)??void 0}set allowDrag(e){this.slot(`allowDrag`).value=e}get allowFloat(){return this.get(`allowFloat`)??void 0}set allowFloat(e){this.slot(`allowFloat`).value=e}get allowDock(){return this.get(`allowDock`)??void 0}set allowDock(e){this.slot(`allowDock`).value=e}get dockSides(){return this.get(`dockSides`)??void 0}set dockSides(e){this.slot(`dockSides`).value=e}get allowAutoHide(){return this.get(`allowAutoHide`)??void 0}set allowAutoHide(e){this.slot(`allowAutoHide`).value=e}get allowHide(){return this.get(`allowHide`)??void 0}set allowHide(e){this.slot(`allowHide`).value=e}get allowNewWindow(){return this.get(`allowNewWindow`)??void 0}set allowNewWindow(e){this.slot(`allowNewWindow`).value=e}get actions(){return this.get(`actions`)??ct}set actions(e){this.slot(`actions`).value=e}get state(){return this.get(`state`)}set state(e){this.slot(`state`).value=e}get original(){return this.from}get manager(){return this.where.value?.manager??null}get group(){return this.where.value?.group??null}get isOpen(){return!!this.where.value}get isHidden(){let e=this.where.value;return!!e&&!e.group}get isActive(){let e=this.group;return!!e&&e.activeDocument===this}get contentComponent(){return this.manager?.contentOf(this)??null}get window(){return this.group?.window??null}get dockArea(){return this.group?.dockArea??null}get browserWindow(){return this.group?.browserWindow??null}activate(e=!1){return this.manager?.activate(this,e)??!1}close(){return this.manager?.close(this)??Promise.resolve(!1)}hide(){return this.manager?.hide(this)??!1}show(e){return this.manager?.show(this,e)??!1}canCopy(e){let t=this.from??this;return!!t.clone||typeof t.content==`function`||!t.content&&e}makeCopy(){let t=this.from??this,n=t.clone,r=n?e=>n(e):typeof t.content==`function`?t.content:null,i=new e({id:t.id,type:t.type,content:r??void 0},t);for(let e of ot)st.has(e)||i.values.set(e,t.slot(e));return i}placeIn(e,t){this.where.value=e&&t?{manager:e,group:t}:null}markHidden(e){this.where.value={manager:e,group:null}}get(e){return s(this.slot(e).value)}slot(e){let t=this.values.get(e);return t||this.values.set(e,t=E(void 0)),t}},lt=new WeakMap;function V(e,t){(t.screenX||t.screenY||t.clientX||t.clientY)&&lt.set(e,{x:t.screenX-t.clientX,y:t.screenY-t.clientY,left:e.screenX,top:e.screenY})}function H(e){let t=lt.get(e);if(t)return{x:t.x+e.screenX-t.left,y:t.y+e.screenY-t.top};let n=Math.max(0,(e.outerWidth-e.innerWidth)/2);return{x:e.screenX+n,y:e.screenY+Math.max(0,e.outerHeight-e.innerHeight-n)}}function ut(e,t,n){return t>=0&&n>=0&&t<e.innerWidth&&n<e.innerHeight}var dt={target:`outside`,manager:null,group:null,index:-1,side:null},ft=class{manager;press=null;session=null;ghost;stops=[];constructor(e){this.manager=e,this.ghost=new ve(()=>e.hostElementIn(this.session?.space??e.element.ownerDocument),()=>e.dragGhost,`mx-tabdocs__ghost`),this.listen(e.element)}listen(e){let t=e=>D(()=>this.pointerDown(e)),n=e=>{let t=this.session;(this.press&&this.press.pointerType!==`mouse`||t&&!t.byKeyboard)&&(e.preventDefault(),e.stopImmediatePropagation())};return e.addEventListener(`pointerdown`,t),e.addEventListener(`contextmenu`,n,!0),()=>{e.removeEventListener(`pointerdown`,t),e.removeEventListener(`contextmenu`,n,!0)}}holdTouch(e){this.session&&!this.session.byKeyboard&&e.cancelable&&e.preventDefault()}get subject(){return this.session?.subject??null}begin(e,t,n,r=0,i=0,a=-1,o=(n??this.manager.element).ownerDocument){let s=this.manager;if(this.session)return!1;let c=t===`keyboard`,l={document:e.document,group:e.group,pointerType:t,byKeyboard:c,cancel:!1,source:s};if(s.dragStarting(l),l.cancel)return!1;let u=e.window??null;return u&&!s.windowChanging(`moveWindow`,u,!c)?!1:(this.session={subject:e,source:n,pointerId:a,pointerType:t,byKeyboard:c,x:r,y:i,space:o,aim:{space:o,x:r,y:i},start:{x:r,y:i},moved:!1,place:null,target:null,shownIn:null,shownSpace:null,hover:null,was:new Map,wasGroup:s.activeGroup,scrolls:new Map,frame:0,modifiers:{ctrlKey:!1,altKey:!1,shiftKey:!1,metaKey:!1},windowStart:u?{...u.rect}:null,followed:new Set},s.dragStarted(e),(e.document?n:u?null:e.group.element)?.toggleAttribute(`data-dragging`,!0),u?.markMoving(!0),!0)}aim(e,t){let n=this.session;if(!n)return!1;let r=this.manager;if(n.place=null,n.target=null,e){let i=this.args(e,e.target===`outside`);r.dragOver(i),n.subject.copy=i.copy&&r.mayCopyDocument(n.subject.document);let a={target:i.target,manager:i.manager,group:i.group,index:i.index,side:i.side,dockSide:i.dockSide??null,rect:i.rect??null};!i.cancel&&a.target!==`outside`&&(n.place=a,n.target=a.target===e.target&&a.manager===e.manager?t:this.targetFor(a))}return this.paint(),!!n.place}finish(e,t=!1){let n=this.session;if(!n)return!1;let r=this.manager;this.session=null,this.release(),clearTimeout(n.hover?.timer),pt(r,n.frame),this.ghost.hide(),n.shownIn&&n.shownSpace&&n.shownIn.marksIn(n.shownSpace).hide();for(let e of n.followed)for(let t of e.dropTargets)t.follow?.(null,n.subject);n.subject.window?.markMoving(!1),(n.subject.document?n.source:n.subject.group.element)?.removeAttribute(`data-dragging`);for(let e of r.dragPeers()){for(let t of e.hostElements())delete t.dataset.dragging;e.dragSpace=null}let i=!1;if(e&&n.place&&n.target){let e=this.args(n.place,!1,n);r.dropping(e);let t={target:e.target,manager:e.manager,group:e.group,index:e.index,side:e.side,dockSide:e.dockSide??null,rect:e.rect??null},a=t.target===n.place.target&&t.manager===n.place.manager?n.target:this.targetFor(t);n.subject.copy=e.copy&&r.mayCopyDocument(n.subject.document),!e.cancel&&a&&(i=D(()=>a.drop(t,n.subject))),i&&r.dropped(t,n.subject,n.byKeyboard)}return i||(this.putBack(n),t||r.announceCanceled()),r.dragEnded({document:n.subject.document,from:n.subject.group,dropped:i,byKeyboard:n.byKeyboard,source:r}),i}cancel(e=!1){this.press=null,this.release(),this.finish(!1,e)}pointerDown(e){let t=this.manager;if(this.press||this.session||!t.isEnabled)return;let n=e.pointerType||`mouse`;if(n===`mouse`&&e.button!==0||e.isPrimary===!1)return;let r=this.subjectAt(e.target);if(!r)return;let i=r.source.ownerDocument,a=i.defaultView??window;V(a,e);let o={pointerId:e.pointerId,pointerType:n,x:e.clientX,y:e.clientY,space:i,subject:r.subject,source:r.source,timer:void 0};this.press=o,n!==`mouse`&&(o.timer=setTimeout(()=>D(()=>this.longPress(o)),t.longPressDelay));let s=e=>D(()=>this.pointerMove(e,a)),c=e=>D(()=>this.pointerUp(e,a)),l=e=>D(()=>this.key(e));a.addEventListener(`pointermove`,s),a.addEventListener(`pointerup`,c),a.addEventListener(`pointercancel`,c),a.addEventListener(`keydown`,l,!0),a.addEventListener(`keyup`,l,!0),this.stops.push(()=>{clearTimeout(o.timer),a.removeEventListener(`pointermove`,s),a.removeEventListener(`pointerup`,c),a.removeEventListener(`pointercancel`,c),a.removeEventListener(`keydown`,l,!0),a.removeEventListener(`keyup`,l,!0)})}subjectAt(e){let t=this.manager,n=g(e)?e:null;if(!n||n.closest(`.mx-tabdocs__close, .mx-tabdocs__pin, .mx-tabdocs__scroll`))return null;let r=n.closest(`.mx-tabdocs__group`),i=t.groups.find(e=>e.element===r);if(!i)return null;let a=i.tabOf(n);if(a)return t.mayDrag(a.document)?{subject:{document:a.document,group:i,manager:t,copy:!1},source:a.header}:null;let o=i.window;return o&&(i.isStripSpace(n)||i.isGrip(n))?o.isMaximized?null:{subject:{document:null,group:i,manager:t,copy:!1,window:o},source:i.barElement}:(i.isStripSpace(n)||i.isGrip(n))&&t.allowDragGroups?{subject:{document:null,group:i,manager:t,copy:!1},source:i.barElement}:null}longPress(e){this.press===e&&this.start(e,null)}start(e,t){if(this.press=null,clearTimeout(e.timer),!this.begin(e.subject,e.pointerType,e.source,e.x,e.y,e.pointerId,e.space)){this.release();return}let n=this.session;t&&(n.x=t.clientX,n.y=t.clientY,n.modifiers=t,n.moved=!0);try{e.source.setPointerCapture?.(e.pointerId)}catch{}if(!e.subject.window){let t=e.subject.document?e.source:e.subject.group.listElement;this.ghost.show(t,n.x,n.y,e.subject.document?`tab`:`group`)}this.track()}pointerMove(e,t){V(t,e);let n=this.session;if(n){if(n.byKeyboard||e.pointerId!==n.pointerId)return;n.x=e.clientX,n.y=e.clientY,n.modifiers=e,Math.max(Math.abs(n.x-n.start.x),Math.abs(n.y-n.start.y))>=this.manager.dragThreshold&&(n.moved=!0),this.track();return}let r=this.press;if(r&&e.pointerId===r.pointerId&&!(Math.max(Math.abs(e.clientX-r.x),Math.abs(e.clientY-r.y))<this.manager.dragThreshold)){if(r.pointerType!==`mouse`){this.press=null,this.release();return}this.start(r,e)}}pointerUp(e,t){V(t,e);let n=this.session;if(n&&!n.byKeyboard){if(e.pointerId!==n.pointerId)return;if(e.type===`pointercancel`){this.finish(!1);return}if(n.pointerType!==`mouse`&&!n.moved){let{x:e,y:t,source:r}=n;this.finish(!1,!0),r&&this.manager.openContextMenuAt(r,e,t);return}this.swallowClick();let t=this.copyHeld(e)&&this.manager.mayCopyDocument(n.subject.document);(e.clientX!==n.x||e.clientY!==n.y||t!==n.subject.copy)&&(n.x=e.clientX,n.y=e.clientY,n.modifiers=e,this.track()),this.finish(!0);return}this.press&&e.pointerId===this.press.pointerId&&(this.press=null,this.release())}key(e){let t=this.session;if(!t||t.byKeyboard){e.key===`Escape`&&this.press&&(this.press=null,this.release());return}if(e.type===`keydown`&&e.key===`Escape`){e.preventDefault(),e.stopPropagation(),this.finish(!1);return}t.modifiers=e,this.track()}track(){let e=this.session;if(!e||e.byKeyboard)return;let t=this.manager;e.subject.copy=this.copyHeld(e.modifiers)&&t.mayCopyDocument(e.subject.document);let n=e.subject.window;n&&e.windowStart&&(n.place({...e.windowStart,x:e.windowStart.x+e.x-e.start.x,y:e.windowStart.y+e.y-e.start.y}),t.keepWindowInView(n));let r=this.find(e.x,e.y);this.aim(r.place,r.target),this.hover(),this.autoScroll()}find(e,t){let n=this.session,r=this.manager,i=n.space,a=e,o=t,s=i.defaultView;if(s&&!n.byKeyboard&&!n.subject.window&&!ut(s,a,o)){let e=H(s),t=this.windowAt(a+e.x,o+e.y,i);if(t)({space:i,x:a,y:o}=t);else{n.aim={space:i,x:a,y:o};let t=this.outPlace(a+e.x,o+e.y);if(t)return{place:t,target:this.targetFor(t)}}}n.aim={space:i,x:a,y:o};for(let e of this.peers())e.dragSpace=i;let c=this.managerAt(a,o,i);for(let e of this.peers())if(e===c||n.followed.has(e)){for(let t of e.dropTargets)t.follow?.(e===c?{x:a,y:o}:null,n.subject);e===c?n.followed.add(e):n.followed.delete(e)}if(c){for(let e of c.dropTargets){let t=e.placeAt(a,o,n.subject);if(t)return{place:t,target:e}}return{place:null,target:null}}let l=i!==r.element.ownerDocument||r.foreignAt(a,o)?null:r.floatPlace(n.subject,a,o);return l?{place:l,target:this.targetFor(l)}:{place:dt,target:null}}windowAt(e,t,n){for(let{doc:r}of this.manager.spaces()){let i=r.defaultView;if(r===n||!i||i.closed)continue;let a=H(i);if(ut(i,e-a.x,t-a.y))return{space:r,x:e-a.x,y:t-a.y}}return null}outPlace(e,t){let n=this.session,r=this.manager;if(!D(()=>r.dragOutToNewWindow)||n.subject.manager!==r)return null;let i={manager:r,group:null,index:-1,side:null};if(n.space!==r.element.ownerDocument)return{...i,target:`main-window`};if(!r.mayNewWindow(n.subject))return null;let a=n.subject.group.element.getBoundingClientRect(),o=D(()=>r.newWindowSize),s=Math.round(o?.width??(a.width>0?a.width:640)),c=Math.round(o?.height??(a.height>0?a.height:480));return{...i,target:`new-window`,rect:{x:Math.round(e-Math.min(48,s/4)),y:Math.round(t-16),width:s,height:c}}}peers(){return this.session?.subject.window?[this.manager]:this.manager.dragPeers()}managerAt(e,t,n){let r=this.session,i=this.peers();if(n!==this.manager.element.ownerDocument)return i.find(e=>e.hostElementIn(n)!==e.element)??null;let a=i.flatMap(e=>e.windowsFrontFirst()).filter(e=>e!==r.subject.window);a.sort((e,t)=>Number(t.element.style.getPropertyValue(`--_mx-z`))-Number(e.element.style.getPropertyValue(`--_mx-z`)));let o=a.find(n=>U(n.element.getBoundingClientRect(),e,t));return o?o.manager:i.find(n=>!n.element.closest(`[hidden]`)&&U(n.element.getBoundingClientRect(),e,t))??null}targetFor(e){return(e.manager??this.manager).dropTargets.find(t=>t.kinds.includes(e.target))??null}args(e,t,n=this.session){return{...e,document:n.subject.document,from:n.subject.group,copy:n.subject.copy,byKeyboard:n.byKeyboard,cancel:t,source:this.manager}}paint(){let e=this.session,t=e.place,n=t?.manager??null,r=t&&e.target?e.target.marks(t,e.subject):null,i=t?.group?t.group.element.ownerDocument:t?.browserWindow?t.browserWindow.element.ownerDocument:e.aim.space;e.shownIn&&e.shownSpace&&(e.shownIn!==n||e.shownSpace!==i)&&e.shownIn.marksIn(e.shownSpace).hide(),n&&n.marksIn(i).show(r?.area??null,r?.mark??null),e.shownIn=n,e.shownSpace=n?i:null;let a=t?e.subject.copy?`copy`:`move`:`none`;if(!e.byKeyboard)for(let e of this.manager.dragPeers())for(let t of e.hostElements())t.dataset.dragging!==a&&(t.dataset.dragging=a);this.ghost.move(e.x,e.y,a)}hover(){let e=this.session,t=e.place,n=null;if(t?.target===`strip`&&t.group&&t.group!==e.subject.group&&t.group.manager.dragHoverActivate){let{x:r,y:i}=e.aim;n=t.group.tabs.find(n=>n!==t.group.activeTab&&n.document!==e.subject.document&&U(n.header.getBoundingClientRect(),r,i))??null}if(e.hover?.tab===n||(clearTimeout(e.hover?.timer),e.hover=null,!n))return;let r=t.group.manager.dragHoverDelay,i=n;e.hover={tab:n,timer:setTimeout(()=>D(()=>this.hoverActivate(e,i)),r)}}hoverActivate(e,t){let n=t.group;this.session===e&&n&&(e.hover=null,e.was.has(n)||e.was.set(n,n.activeDocument),n.manager.activateFromDrag(t.document),this.track())}autoScroll(){let e=this.session,t=this.manager;if(pt(t,e.frame),!t.dragAutoScroll)return;let n=this.rowAt(e.aim.x,e.aim.y);if(!n||n.scrollWidth<=n.clientWidth)return;let r=n.getBoundingClientRect(),i=ye(e.aim.x,r.left,r.right,Math.min(48,r.width/4),12);if(!i)return;e.scrolls.has(n)||e.scrolls.set(n,n.scrollLeft);let a=n.ownerDocument.defaultView;a&&(e.frame=a.requestAnimationFrame(()=>D(()=>{if(this.session!==e)return;let t=n.scrollLeft;n.scrollLeft+=i,n.scrollLeft!==t&&this.track()})))}rowAt(e,t){let n=this.session;for(let r of this.peers()){let i=r.groupAt(e,t,n?.subject.window??null);if(i&&U(i.barElement.getBoundingClientRect(),e,t))return i.rowElement}return null}putBack(e){e.subject.window&&e.windowStart&&e.subject.window.place(e.windowStart);for(let[t,n]of e.scrolls)t.scrollLeft=n;for(let[t,n]of e.was)n&&n.group===t&&t.manager.activateFromDrag(n);e.wasGroup&&e.was.size&&e.wasGroup.manager.useGroupFromDrag(e.wasGroup)}copyHeld(e){switch(this.manager.copyModifier){case`ctrl`:return e.ctrlKey;case`alt`:return e.altKey;case`shift`:return e.shiftKey;case`meta`:return e.metaKey;case`none`:return!1;default:return i()?e.altKey:e.ctrlKey}}swallowClick(){let e=(this.session?.space??this.manager.element.ownerDocument).defaultView;if(!e)return;let t=()=>{e.removeEventListener(`click`,n,!0),e.removeEventListener(`pointerdown`,t,!0)},n=e=>{e.stopPropagation(),e.preventDefault(),t()};e.addEventListener(`click`,n,!0),e.addEventListener(`pointerdown`,t,!0),setTimeout(t,0)}release(){for(let e of this.stops.splice(0))e()}};function U(e,t,n){return t>=e.left&&t<e.right&&n>=e.top&&n<e.bottom}function pt(e,t){if(t)for(let n of e.hostElements())n.ownerDocument.defaultView?.cancelAnimationFrame(t)}var mt={stripNext:[`ArrowRight`],stripPrevious:[`ArrowLeft`],stripFirst:[`Home`],stripLast:[`End`],closeFocusedTab:[`Delete`],hide:[`Ctrl+K X`],resizeSmaller:[`ArrowLeft`,`ArrowUp`],resizeLarger:[`ArrowRight`,`ArrowDown`],resizeMin:[`Home`],resizeMax:[`End`],moveToNextGroup:[`Ctrl+Alt+ArrowRight`],moveToPreviousGroup:[`Ctrl+Alt+ArrowLeft`],moveToGroupLeft:[`Ctrl+K Shift+ArrowLeft`],moveToGroupRight:[`Ctrl+K Shift+ArrowRight`],moveToGroupUp:[`Ctrl+K Shift+ArrowUp`],moveToGroupDown:[`Ctrl+K Shift+ArrowDown`],moveTo:[`Ctrl+K M`],targetLeft:[`ArrowLeft`],targetRight:[`ArrowRight`],targetUp:[`ArrowUp`],targetDown:[`ArrowDown`],targetNextGroup:[`Tab`],targetPreviousGroup:[`Shift+Tab`],targetDrop:[`Enter`],targetCancel:[`Escape`],float:[`Ctrl+K O`],dock:[`Ctrl+K D`],dockLeft:[`Ctrl+K Alt+ArrowLeft`],dockRight:[`Ctrl+K Alt+ArrowRight`],dockTop:[`Ctrl+K Alt+ArrowUp`],dockBottom:[`Ctrl+K Alt+ArrowDown`],toggleAutoHide:[`Ctrl+K H`],autoHideNext:[`ArrowDown`,`ArrowRight`],autoHidePrevious:[`ArrowUp`,`ArrowLeft`],nextPart:[`F6`],previousPart:[`Shift+F6`],moveWindow:[`Ctrl+K Space`],maximizeWindow:[`Ctrl+K Shift+M`],closeWindow:[`Ctrl+K Shift+W`],moveToNewWindow:[`Ctrl+K Shift+O`],moveToMainWindow:[`Ctrl+K Shift+D`],windowLeft:[`ArrowLeft`],windowRight:[`ArrowRight`],windowUp:[`ArrowUp`],windowDown:[`ArrowDown`],windowNarrower:[`Shift+ArrowLeft`],windowWider:[`Shift+ArrowRight`],windowShorter:[`Shift+ArrowUp`],windowTaller:[`Shift+ArrowDown`],windowDone:[`Enter`],windowCancel:[`Escape`]},ht={nextTab:[`Ctrl+PageDown`],previousTab:[`Ctrl+PageUp`],closeTab:[`Ctrl+W`,`Ctrl+F4`],closeAllTabs:[`Ctrl+K W`],closeSavedTabs:[`Ctrl+K U`],focusGroup:[`Ctrl+{n}`],splitRight:[`Ctrl+\\`],recentNext:[`Ctrl+Tab`],recentPrevious:[`Ctrl+Shift+Tab`],goBack:[`Alt+ArrowLeft`],goForward:[`Alt+ArrowRight`],reopenClosed:[`Ctrl+Shift+T`],keepOpen:[`Ctrl+K Enter`],togglePin:[`Ctrl+K Shift+Enter`],showOpenList:[`Ctrl+K Ctrl+P`],moveTabLeft:[`Ctrl+Shift+PageUp`],moveTabRight:[`Ctrl+Shift+PageDown`],...mt},gt={nextTab:[`Alt+PageDown`,`Ctrl+PageDown`],previousTab:[`Alt+PageUp`,`Ctrl+PageUp`],closeTab:[`Ctrl+Alt+W`,`Ctrl+W`],closeAllTabs:[`Ctrl+K W`],closeSavedTabs:[`Ctrl+K U`],focusGroup:[`Ctrl+Alt+{n}`,`Ctrl+{n}`],splitRight:[`Ctrl+\\`],recentNext:[`Ctrl+E`,`Ctrl+Tab`],recentPrevious:[`Ctrl+Shift+E`,`Ctrl+Shift+Tab`],goBack:[`Alt+ArrowLeft`],goForward:[`Alt+ArrowRight`],reopenClosed:[`Ctrl+Alt+Shift+T`,`Ctrl+Shift+T`],keepOpen:[`Ctrl+K Enter`],togglePin:[`Ctrl+K Shift+Enter`],showOpenList:[`Ctrl+K Ctrl+P`],moveTabLeft:[`Alt+Shift+PageUp`,`Ctrl+Shift+PageUp`],moveTabRight:[`Alt+Shift+PageDown`,`Ctrl+Shift+PageDown`],...mt},_t={close:`close`,hide:`tabDocsHide`,showHidden:`tabDocsShowHidden`,closeOthers:`tabDocsCloseOthers`,closeRight:`tabDocsCloseRight`,closeLeft:`tabDocsCloseLeft`,closeSaved:`tabDocsCloseSaved`,closeAll:`tabDocsCloseAll`,keepOpen:`tabDocsKeepOpen`,pin:`tabDocsPin`,unpin:`tabDocsUnpin`,splitUp:`tabDocsSplitUp`,splitDown:`tabDocsSplitDown`,splitLeft:`tabDocsSplitLeft`,splitRight:`tabDocsSplitRight`,moveNext:`tabDocsMoveNext`,movePrevious:`tabDocsMovePrevious`,moveTo:`tabDocsMoveTo`,moveGroupTo:`tabDocsMoveGroupTo`,copyTitle:`tabDocsCopyTitle`,newDocument:`tabDocsNewDocument`,reopenClosed:`tabDocsReopenClosed`,lock:`tabDocsLock`,unlock:`tabDocsUnlock`,float:`tabDocsFloat`,dock:`tabDocsDock`,dockLeft:`tabDocsDockLeft`,dockRight:`tabDocsDockRight`,dockTop:`tabDocsDockTop`,dockBottom:`tabDocsDockBottom`,autoHide:`tabDocsAutoHide`,maximizeWindow:`tabDocsMaximizeWindow`,closeWindow:`tabDocsCloseWindow`,newWindow:`tabDocsNewWindow`,mainWindow:`tabDocsMainWindow`},vt=[`Left`,`Right`,`Top`,`Bottom`],yt=class{manager;menu;others=new Map;sheet=null;constructor(e){this.manager=e,this.menu=this.create(e.element)}attach(e){let t=this.create(e);return this.others.set(e,t),()=>{this.others.delete(e),t.isDisposed||t.dispose()}}menuFor(e){for(let[t,n]of this.others)if(t.contains(e))return n;return this.menu}create(e){let t=new Oe({target:e,presentation:()=>this.manager.menuPresentationNow});return t.onOpening(e=>D(()=>this.opening(e,t))),this.manager.controls.add(t),t}forTab(e,t){let n=this.manager,r=n.keys,i=t.documents,a=i.indexOf(e),o=n.keepPinned,s=e=>e.closable&&!(o&&e.pinned);return this.build([[[`close`,e.closable,r.closeTab[0]],e.closable?null:[`hide`,n.mayCloseOrHide(e),r.hide[0]],[`closeOthers`,i.some(t=>t!==e&&s(t))],[`closeRight`,i.slice(a+1).some(s)],[`closeLeft`,i.slice(0,a).some(s)],[`closeSaved`,i.some(e=>!e.dirty&&s(e)),r.closeSavedTabs[0]],[`closeAll`,i.some(s),r.closeAllTabs[0]]],[[`copyTitle`]],[e.preview?[`keepOpen`,!0,r.keepOpen[0]]:null,[e.pinned?`unpin`:`pin`,!0,r.togglePin[0]]],[[`splitUp`],[`splitDown`],[`splitLeft`],[`splitRight`,!0,r.splitRight[0]]],[[`moveNext`,!0,r.moveToNextGroup[0]],[`movePrevious`,!0,r.moveToPreviousGroup[0]],n.currentPresentation===`phone`?null:[`moveTo`,n.mayDrag(e),r.moveTo[0]]],this.dockEntries({document:e,group:t,manager:n,copy:!1})],t,e)}dockEntries(e){let t=this.manager,n=t.keys,{document:r,group:i}=e,a=i.window,o=i.dockArea,s=!!o&&o.groups.length===1&&(!r||i.documents.length===1);return[a?[`dock`,!0,r?n.dock[0]:void 0]:null,[`float`,t.maySubject(e,`float`),r?n.float[0]:void 0],...vt.map(i=>{let a=i.toLowerCase();return[`dock${i}`,t.maySubject(e,a)&&!(s&&o?.side===a),r?n[`dock${i}`][0]:void 0]}),o?[`autoHide`,t.mayAutoHide(o),n.toggleAutoHide[0],o.autoHidden?`tabDocsAutoHideOff`:`tabDocsAutoHide`]:null,t.currentPresentation===`phone`?null:[`newWindow`,t.mayNewWindow(e),r?n.moveToNewWindow[0]:void 0,!r&&a?`tabDocsWindowToNewWindow`:void 0],i.browserWindow?[`mainWindow`,!0,r?n.moveToMainWindow[0]:void 0]:null]}forStrip(e){let t=this.manager,n=t.keys,r=t.keepPinned,i=e=>e.closable&&!(r&&e.pinned),a=e.documents;return this.build([[t.newDocument?[`newDocument`]:null,[`reopenClosed`,t.closedDocuments.length>0,n.reopenClosed[0]]],[[`closeAll`,a.some(i),n.closeAllTabs[0]],[`closeSaved`,a.some(e=>!e.dirty&&i(e)),n.closeSavedTabs[0]]],[[e.locked?`unlock`:`lock`],t.hiddenDocuments.length?[`showHidden`]:null],[[`splitRight`,!0,n.splitRight[0]],[`splitDown`],[`moveGroupTo`,t.allowDragGroups&&t.dragPeers().some(t=>t.groups.some(t=>t!==e))]],this.dockEntries({document:null,group:e,manager:t,copy:!1}),e.window?[[`maximizeWindow`,!0,n.maximizeWindow[0],e.window.isMaximized?`tabDocsRestoreWindow`:`tabDocsMaximizeWindow`],[`closeWindow`,!0,n.closeWindow[0]]]:[]],e,null)}openSheet(e,t,n,r){let i=this.manager;if(!i.contextMenu)return!1;let a={document:e,group:t,items:this.forTab(e,t),byKeyboard:n,cancel:!1,source:i};if(i.contextMenuOpening(a),a.cancel)return!1;this.sheet||(this.sheet=new De({container:i.element}),this.sheet.element.classList.add(`mx-tabdocs__menu-sheet`),i.controls.add(this.sheet));let o=this.sheet;return o.title=e.title,o.items=a.items,r&&r.focus({preventScroll:!0}),o.open(n)}dispose(){for(let e of[this.menu,...this.others.values()])e.isDisposed||e.dispose();this.others.clear(),this.sheet&&!this.sheet.isDisposed&&this.sheet.dispose(),this.sheet=null}build(e,t,n){let r=this.manager,i=r.menuItems,a=[];for(let o of e)o.filter(e=>!!e&&i[e[0]]!==!1).forEach(([e,i,o,s],c)=>{let l={text:r.textOf(s??_t[e]),enabled:i??!0,shortcut:o??``,beginGroup:c===0&&a.length>0,data:e};e===`showHidden`?l.items=r.hiddenItems():l.click=()=>r.runCommand(e,t,n),a.push(l)});return a}opening(e,t){let n=this.manager,r=e.target,i=n.groups.find(e=>e.element.contains(r)),a=i?.tabOf(r)??(i?n.tabOfHeader(r):void 0),o=a?.group??i,s=a?.document??null;if(!n.contextMenu||!o||!i||!s&&!i.isStripSpace(r)){e.cancel=!0;return}let c={document:s,group:o,items:s?this.forTab(s,o):this.forStrip(o),byKeyboard:e.byKeyboard,cancel:!1,source:n};n.contextMenuOpening(c),t.label=s?s.title:n.textOf(`tabDocsGroup`,{n:n.groups.indexOf(o)+1}),e.items=c.items,e.cancel=c.cancel}},bt={left:`tabDocsHiddenLeft`,right:`tabDocsHiddenRight`,top:`tabDocsHiddenTop`,bottom:`tabDocsHiddenBottom`},xt=class{manager;area;element;buttons=new Map;icons=new Map;stops=[];hoverTimer;leaveTimer;current=null;constructor(e,n){this.manager=e,this.area=n;let r=this.element=e.element.ownerDocument.createElement(`div`);r.className=`mx-tabdocs__autohide`,r.dataset.side=n.side,r.setAttribute(`role`,`toolbar`),r.setAttribute(`aria-orientation`,n.orientation===`horizontal`?`vertical`:`horizontal`),r.hidden=!0,r.addEventListener(`click`,t=>{let n=this.documentAt(t.target);n&&e.slideByUser(n,!1)}),r.addEventListener(`keydown`,e=>D(()=>this.key(e))),r.addEventListener(`mousedown`,e=>{this.documentAt(e.target)&&e.preventDefault()}),r.addEventListener(`pointerover`,e=>D(()=>this.hoverOn(this.documentAt(e.target)))),r.addEventListener(`pointerleave`,()=>D(()=>this.hoverOff())),n.element.addEventListener(`pointerenter`,()=>clearTimeout(this.leaveTimer)),n.element.addEventListener(`pointerleave`,()=>D(()=>this.hoverOff())),this.stops.push(t(e,`strip`,()=>{let t=e.currentPresentation,r=t===`tablet`?e.toolStripShown(n):t===`desktop`&&n.autoHidden,i=n.groups.map(e=>({docs:e.documents,active:e.activeDocument}));for(let e of i)for(let t of e.docs)t.title,t.icon;return{folded:r,groups:i,open:n.isOpen,label:e.textOf(bt[n.side])}},({folded:e,groups:t,open:n,label:r})=>this.render(e,t,n,r)))}focusActive(){let e=(this.current&&this.buttons.get(this.current))??this.element.querySelector(`button`);return!e||this.element.hidden?!1:(e.focus(),!0)}dispose(){clearTimeout(this.hoverTimer),clearTimeout(this.leaveTimer);for(let e of this.stops.splice(0))e();for(let e of this.icons.values())e();this.icons.clear(),this.element.remove()}render(e,t,n,r){let i=this.element;if(i.hidden=!e,i.setAttribute(`aria-label`,r),!e)return;let a=n?t.find(e=>e.active?.group?.isActive)?.active??t[0]?.active??null:null;a&&(this.current=a);let o=[],s=t.flatMap(e=>e.docs);for(let[e,t]of this.buttons)s.includes(e)||(t.remove(),this.buttons.delete(e),this.icons.get(e)?.(),this.icons.delete(e));t.forEach((e,t)=>e.docs.forEach((r,i)=>{let a=this.buttonOf(r);a.toggleAttribute(`data-group-start`,t>0&&i===0);let s=n&&e.active===r;a.setAttribute(`aria-expanded`,String(s)),a.toggleAttribute(`data-open`,s),o.push(a)})),o.forEach((e,t)=>{i.children[t]!==e&&i.insertBefore(e,i.children[t]??null)});let c=(this.current&&this.buttons.get(this.current))??o[0];for(let e of o)e.tabIndex=e===c?0:-1}buttonOf(e){let t=this.buttons.get(e),n=this.element.ownerDocument;t||(t=n.createElement(`button`),t.type=`button`,t.className=`mx-tabdocs__autohide-tab`,t.id=w(`tabdocs-hidden`),t.setAttribute(`aria-controls`,this.area.element.id),this.buttons.set(e,t));let r=e.icon,i=n.createElement(`span`);i.className=`mx-tabdocs__autohide-title`,i.textContent=e.title;let a=[];if(this.icons.get(e)?.(),this.icons.delete(e),r){let t=n.createElement(`span`);t.className=`mx-tabdocs__icon`,t.setAttribute(`aria-hidden`,`true`);let i=h(r);t.append(i.node),this.icons.set(e,i.release),a.push(t)}return t.replaceChildren(...a,i),t}documentAt(e){let t=g(e)?e.closest(`.mx-tabdocs__autohide-tab`):null;for(let[e,n]of this.buttons)if(n===t)return e;return null}key(e){let t=this.manager.keys,n=[...this.element.querySelectorAll(`.mx-tabdocs__autohide-tab`)],r=n.indexOf(e.target);if(r<0)return;let i=-1;if(O(t.autoHideNext,e))i=(r+1)%n.length;else if(O(t.autoHidePrevious,e))i=(r-1+n.length)%n.length;else if(O(t.stripFirst,e))i=0;else if(O(t.stripLast,e))i=n.length-1;else if(e.key===`Escape`&&this.manager.slidArea===this.area){e.preventDefault(),this.manager.hideAutoHidden();return}if(!(i<0)){e.preventDefault(),e.stopPropagation();for(let e of n)e.tabIndex=-1;n[i].tabIndex=0,n[i].focus()}}hoverOn(e){clearTimeout(this.leaveTimer),clearTimeout(this.hoverTimer);let t=this.manager;e&&t.autoHideHover&&(t.slidArea!==this.area||e.group?.activeDocument!==e)&&(this.hoverTimer=setTimeout(()=>D(()=>t.slideByUser(e,!0)),t.autoHideDelay))}hoverOff(){clearTimeout(this.hoverTimer),clearTimeout(this.leaveTimer);let e=this.manager;this.leaveTimer=setTimeout(()=>e.slideHoverEnded(this.area),e.autoHideDelay)}},St=[`center`,`left`,`right`,`up`,`down`],Ct=[`left`,`right`,`top`,`bottom`],wt=class{manager;cross=new Map;edges=new Map;shown=[];root;constructor(e){this.manager=e,this.root=e.element}show(e,t,n,r=this.manager.element){r!==this.root&&(this.hide(),this.root=r);let{size:i,gap:a}=this.measure(),o=Tt(r);this.shown=[];let s=r.getBoundingClientRect(),c=s.left+s.width/2-i/2,l=s.top+s.height/2-i/2,u={left:[s.left+a,l],right:[s.right-a-i,l],top:[c,s.top+a],bottom:[c,s.bottom-a-i]},d=[];for(let e of Ct){let t=o&&(e===`left`||e===`right`)?e===`left`?`right`:`left`:e,r=this.guide(this.edges,e,e===`top`?`up`:e===`bottom`?`down`:e,`edge`);n.includes(t)?d.push({el:r,place:e,dock:t}):r.hidden=!0}if(e&&t.length){let n=e.panelsElement.getBoundingClientRect(),r=n.left+n.width/2-i/2,s=n.top+n.height/2-i/2,c=i+a;for(let{place:e}of d){let[t,n]=u[e];(e===`top`||e===`bottom`?Math.abs(r-t)<i+c:Math.abs(s-n)<i+c)&&(e===`top`?s=Math.max(s,n+i+a+c):e===`bottom`?s=Math.min(s,n-a-c-i):r=e===`left`?Math.max(r,t+i+a+c):Math.min(r,t-a-c-i))}let l={center:[r,s],left:[r-c,s],right:[r+c,s],up:[r,s-c],down:[r,s+c]};for(let n of St){let r=o&&(n===`left`||n===`right`)?n===`left`?`right`:`left`:n,a=this.guide(this.cross,n,n,`cross`);if(!t.includes(r)){a.hidden=!0;continue}this.put(a,l[n][0],l[n][1],i,{group:e,side:r})}}else for(let e of this.cross.values())e.hidden=!0;for(let{el:e,place:t,dock:n}of d)this.put(e,u[t][0],u[t][1],i,{dock:n})}hit(e,t){for(let n of this.shown)if(e>=n.box.left&&e<n.box.right&&t>=n.box.top&&t<n.box.bottom)return n.hit;return null}point(e){for(let t of this.shown)t.el.toggleAttribute(`data-pointed`,t.hit===e)}hide(){this.shown=[];for(let e of[...this.cross.values(),...this.edges.values()])e.hidden=!0,e.removeAttribute(`data-pointed`)}dispose(){this.hide();for(let e of[...this.cross.values(),...this.edges.values()])e.remove();this.cross.clear(),this.edges.clear()}put(e,t,n,r,i){e.hidden=!1,e.style.left=`${Math.round(t)}px`,e.style.top=`${Math.round(n)}px`,this.shown.push({el:e,box:new DOMRect(Math.round(t),Math.round(n),r,r),hit:i})}guide(e,t,n,r){let i=e.get(t);return i||(i=this.root.ownerDocument.createElement(`div`),i.className=`mx-tabdocs__guide`,i.dataset.kind=r,i.dataset.side=t,i.hidden=!0,i.setAttribute(`aria-hidden`,`true`),i.append(m(n)),e.set(t,i)),i.parentElement!==this.root&&this.root.append(i),i}measure(){let e=this.cross.get(`center`)??this.guide(this.cross,`center`,`center`,`cross`),t=this.root.ownerDocument.defaultView?.getComputedStyle(e),n=t?parseFloat(t.inlineSize||t.width):NaN,r=n>0?n:32,i=t?parseFloat(t.columnGap):NaN;return{size:r,gap:Math.round(i>=0?i:r/4)}}};function Tt(e){let t=e.ownerDocument.defaultView;return!!t&&t.getComputedStyle(e).direction===`rtl`}var Et=[`left`,`right`,`top`,`bottom`],Dt=[`center`,`left`,`right`,`up`,`down`],Ot=class{manager;kinds=[`dock-guide`,`dock-area`,`float`];guides;pointed=null;constructor(e){this.manager=e,this.guides=new wt(e)}placeAt(e,t,n){let r=this.manager;if(n.window&&n.manager!==r)return null;let i=r.groupAt(e,t,n.window??null),a=r.dragSpace===r.element.ownerDocument,o=r.dockGuides?this.guides.hit(e,t):null,s=null;if(o&&`dock`in o?s=this.areaPlace(o.dock,n):o&&(s=this.guidePlace(o.group,o.side,n)),this.pointed=s?o:null,this.guides.point(this.pointed),s)return s;if(i&&kt(i.barElement.getBoundingClientRect(),e,t)||!a)return null;let c=r.dockAreas.find(n=>n.autoHidden&&n.strip&&kt(n.strip.element.getBoundingClientRect(),e,t));return c?this.areaPlace(c.side,n):n.window||r.dockGuides?r.floatPlace(n,e,t):null}marks(e,t){let n=this.manager;return e.target===`dock-guide`?n.layoutTarget.marks({...e,target:`group`},t):e.target===`dock-area`&&e.dockSide?{area:n.dockAreaBox(e.dockSide),mark:null}:{area:null,mark:null}}drop(e,t){return this.manager.dropAt(e,t)}follow(e,t){let n=this.manager;if(!e||t.window&&t.manager!==n||!D(()=>n.dockGuides)){this.pointed=null,this.guides.hide();return}D(()=>{let r=n.dockGuideKinds,i=n.dragSpace,a=i===n.element.ownerDocument,o=r.includes(`group`)?n.groupAt(e.x,e.y,t.window??null):null,s=o&&o.acceptsDrop?Dt.filter(e=>!!this.guidePlace(o,e,t)):[],c=a&&r.includes(`edges`)?Et.filter(e=>!!this.areaPlace(e,t)):[];this.guides.show(s.length?o:null,s,c,n.hostElementIn(i))})}areaPlace(e,t){let n=this.manager;if(t.manager!==n||!n.maySubject(t,e))return null;let r=t.group.dockArea;return!t.window&&r?.side===e&&r.groups.length===1&&(!t.document||t.group.documents.length===1)?null:{target:`dock-area`,manager:n,group:null,index:-1,side:null,dockSide:e}}guidePlace(e,t,n){let r=this.manager.layoutTarget.groupPlace(e,t,n);return r?{...r,target:`dock-guide`}:null}dispose(){this.guides.dispose()}};function kt(e,t,n){return t>=e.left&&t<e.right&&n>=e.top&&n<e.bottom}var At=class{own={scrollButtons:E(null),tabSize:E(null),tabMinWidth:E(null),singleTabTitle:E(null),barButtons:E(null),barButtonSize:E(null)};get scrollButtons(){return s(this.own.scrollButtons.value)}set scrollButtons(e){this.own.scrollButtons.value=e}get tabSize(){return s(this.own.tabSize.value)}set tabSize(e){this.own.tabSize.value=e}get tabMinWidth(){return s(this.own.tabMinWidth.value)}set tabMinWidth(e){this.own.tabMinWidth.value=e}get singleTabTitle(){return s(this.own.singleTabTitle.value)}set singleTabTitle(e){this.own.singleTabTitle.value=e}get barButtons(){return s(this.own.barButtons.value)}set barButtons(e){this.own.barButtons.value=e}get barButtonSize(){return s(this.own.barButtonSize.value)}set barButtonSize(e){this.own.barButtonSize.value=e}savedBar(){let e={};for(let[t,n]of Object.entries(this.own)){let r=n.peek();r!==null&&typeof r!=`function`&&(e[t]=r)}return Object.keys(e).length?e:void 0}restoreBar(e){if(e)for(let[t,n]of Object.entries(this.own))e[t]!==void 0&&(n.value=e[t])}},W=class extends At{owner;side;element;sash;root=null;strip=null;sizeSignal=E(0);folded=E(!1);openSignal=E(!1);phoneMode=E(null);tabletMode=E(null);constructor(e,t,n){super(),this.owner=e,this.side=t;let r=this.element=e.element.ownerDocument.createElement(`div`);r.className=`mx-tabdocs__area`,r.id=w(`tabdocs-area`),r.dataset.side=t,r.setAttribute(`role`,`group`),this.sash=new Ie(this,e),this.sash.element.classList.add(`mx-tabdocs__area-sash`),this.sizeSignal.value=n}get manager(){return this.owner}get size(){return this.sizeSignal.value}get autoHidden(){return this.folded.value}get isOpen(){return this.openSignal.value}get groups(){return this.owner.groups.filter(e=>e.dockArea===this)}get phoneDockMode(){return s(this.phoneMode.value)}set phoneDockMode(e){this.phoneMode.value=e,this.owner.presentationSettingChanged()}get tabletDockMode(){return s(this.tabletMode.value)}set tabletDockMode(e){this.tabletMode.value=e,this.owner.presentationSettingChanged()}get documents(){return this.groups.flatMap(e=>e.documents)}get index(){return this.owner.dockAreas.indexOf(this)}get rect(){return this.element.getBoundingClientRect()}resize(e){return this.owner.resizeDockArea(this,e)}autoHide(e=!0){return this.owner.autoHide(this,e)}show(e){let t=e??this.groups[0]?.activeDocument??this.documents[0];return!!t&&this.owner.showAutoHidden(t)}get orientation(){return this.side===`left`||this.side===`right`?`horizontal`:`vertical`}get rtl(){let e=this.element.ownerDocument.defaultView;return!!e&&e.getComputedStyle(this.owner.element).direction===`rtl`}get sizes(){return[this.pixels()]}set sizes(e){this.setPixels(e[0])}sashIndex(){return 0}resizeBy(e,t){let n=this.side===`left`||this.side===`top`?t:-t;return this.setPixels(this.pixels()+n),!0}resetSizes(){this.owner.resizeDockArea(this,this.owner.dockAreaSize[this.side]??240,!0)}pixels(){return this.owner.clampAreaSize(this,this.rawPixels())}rawPixels(){return jt(this.size,this.room())}setPixels(e){let t=this.room(),n=this.owner.clampAreaSize(this,e),r=typeof this.size==`string`&&this.size.trim().endsWith(`%`);this.sizeSignal.value=r&&t>0?`${Math.round(n/t*1e3)/10}%`:Math.round(n),this.owner.renderDock()}setSize(e){this.sizeSignal.value=e}markFolded(e){this.folded.value=e,this.element.toggleAttribute(`data-auto-hide`,e),e||this.markOpen(!1)}markOpen(e){this.openSignal.value=e,this.element.toggleAttribute(`data-open`,e)}room(){let e=this.owner.element.getBoundingClientRect();return this.orientation===`horizontal`?e.width:e.height}dispose(){this.sash.element.remove(),this.element.remove()}};function jt(e,t){let n=String(e).trim(),r=parseFloat(n);return r>=0?n.endsWith(`%`)?t*r/100:r:0}var G=class extends At{owner;element;body;root=null;lastDock={side:null,group:null};box=E({x:0,y:0,width:0,height:0});maximized=E(!1);active=E(!1);entry;stops=[];constructor(e,t){super(),this.owner=e;let n=e.element.ownerDocument,r=this.element=n.createElement(`div`);r.className=`mx-tabdocs__window`,r.id=w(`tabdocs-window`),r.setAttribute(`role`,`dialog`),this.body=n.createElement(`div`),this.body.className=`mx-tabdocs__window-body`;let i=Se(n,`mx-tabdocs__window-frame`,`mx-tabdocs__window-edge`);r.append(this.body,i),this.entry={element:r,setActive:e=>this.markActive(e)};let a=()=>D(()=>this.bringToFront());r.addEventListener(`pointerdown`,a,!0),r.addEventListener(`focusin`,a),i.addEventListener(`pointerdown`,e=>D(()=>this.resizeStart(e)));let o=n.defaultView;if(o){let t=()=>D(()=>e.keepWindowInView(this));o.addEventListener(`resize`,t),this.stops.push(()=>o.removeEventListener(`resize`,t))}this.place(t)}get manager(){return this.owner}get rect(){return this.box.value}get isMaximized(){return this.maximized.value}get isActive(){return this.active.value}get groups(){return this.owner.groups.filter(e=>e.window===this)}get documents(){return this.groups.flatMap(e=>e.documents)}get index(){return this.owner.floatingWindows.indexOf(this)}move(e,t){return this.owner.moveWindow(this,e,t)}resize(e,t){return this.owner.resizeWindow(this,e,t)}maximize(){return this.owner.maximizeWindow(this)}restore(){return this.owner.restoreWindow(this)}close(){return this.owner.closeWindow(this)}dock(e,t){return this.owner.dock(this,e,t)}focus(){return this.owner.focusWindow(this)}place(e){let t={x:Math.round(e.x),y:Math.round(e.y),width:Math.round(Math.max(0,e.width)),height:Math.round(Math.max(0,e.height))};this.box.value=t;let n=this.element.style;n.setProperty(`--_x`,`${t.x}px`),n.setProperty(`--_y`,`${t.y}px`),n.setProperty(`--_w`,`${t.width}px`),n.setProperty(`--_h`,`${t.height}px`)}markMaximized(e){this.maximized.value=e,this.element.toggleAttribute(`data-maximized`,e)}bringToFront(){this.element.isConnected&&(oe.bringToFront(this.entry),this.owner.windowRaised())}markMoving(e){this.element.toggleAttribute(`data-moving`,e)}minSize(){let e=this.element.ownerDocument.defaultView?.getComputedStyle(this.element);return{w:parseFloat(e?.minInlineSize||e?.minWidth||``)||0,h:parseFloat(e?.minBlockSize||e?.minHeight||``)||0}}room(){let e=this.element.ownerDocument.documentElement,t=this.element.ownerDocument.defaultView;return{w:e.clientWidth||t?.innerWidth||0,h:e.clientHeight||t?.innerHeight||0}}dispose(){for(let e of this.stops.splice(0))e();oe.remove(this.entry),this.element.remove()}markActive(e){this.active.value=e,this.element.toggleAttribute(`data-active`,e),e||this.owner.windowRaised()}get rtl(){let e=this.element.ownerDocument.defaultView;return!!e&&e.getComputedStyle(this.element).direction===`rtl`}resizeStart(e){let t=e.target.closest(`.mx-tabdocs__window-edge`),n=this.owner;if(e.button!==0||!t||this.isMaximized||!n.isEnabled||!n.windowChanging(`resizeWindow`,this,!0))return;e.preventDefault();let r=t.dataset.edge,i=this.rtl,a=this.room(),o=this.rect,s={x:i?a.w-o.x-o.width:o.x,y:o.y,w:o.width,h:o.height},c=n.keepFloatingInView?a:{w:1/0,h:1/0},l=this.minSize();this.element.toggleAttribute(`data-resizing`,!0),xe(t,e,(e,t)=>{let n=be(r,s,i?-e:e,t,l,c);this.place({x:i?a.w-n.x-n.w:n.x,y:n.y,width:n.w,height:n.h})},()=>{this.element.removeAttribute(`data-resizing`),n.windowChanged(`resizeWindow`,this,!0)})}},Mt=class{manager;current=null;constructor(e){this.manager=e}get window(){return this.current?.window??null}start(e){let t=this.manager;if(this.current||e.isMaximized||!t.windowChanging(`moveWindow`,e,!0))return!1;let n=t.element.ownerDocument.defaultView??window,r=e=>D(()=>this.key(e)),i=()=>D(()=>this.end(!0));return n.addEventListener(`keydown`,r,!0),n.addEventListener(`pointerdown`,i,!0),n.addEventListener(`blur`,i),this.current={window:e,start:{...e.rect},stop:()=>{n.removeEventListener(`keydown`,r,!0),n.removeEventListener(`pointerdown`,i,!0),n.removeEventListener(`blur`,i)}},e.element.toggleAttribute(`data-keys`,!0),t.sayText(t.textOf(`tabDocsWindowKeys`)),!0}end(e){let t=this.current;if(!t)return!1;this.current=null,t.stop();let n=t.window;n.element.removeAttribute(`data-keys`),e||n.place(t.start);let r=n.rect,i=r.width!==t.start.width||r.height!==t.start.height;return this.manager.windowChanged(i?`resizeWindow`:`moveWindow`,n,!0),e||this.manager.announceCanceled(),!0}key(e){let t=this.current;if(!t)return;let n=this.manager,r=n.keys,i=n.resizeStep,a=t.window.rect,o=null;if(O(r.windowLeft,e))o={...a,x:a.x-i};else if(O(r.windowRight,e))o={...a,x:a.x+i};else if(O(r.windowUp,e))o={...a,y:a.y-i};else if(O(r.windowDown,e))o={...a,y:a.y+i};else if(O(r.windowNarrower,e))o={...a,width:a.width-i};else if(O(r.windowWider,e))o={...a,width:a.width+i};else if(O(r.windowShorter,e))o={...a,height:a.height-i};else if(O(r.windowTaller,e))o={...a,height:a.height+i};else if(O(r.windowDone,e))this.end(!0);else if(O(r.windowCancel,e))this.end(!1);else return;if(e.preventDefault(),e.stopPropagation(),!o)return;let s=t.window.minSize();t.window.place({...o,width:Math.max(s.w,o.width),height:Math.max(s.h,o.height)}),n.keepWindowInView(t.window)}},Nt=class{manager;kinds=[`new-window`,`main-window`];constructor(e){this.manager=e}placeAt(){return null}marks(){return{area:null,mark:null}}drop(e,t){return this.manager.dropAt(e,t)}},Pt=1e3;function Ft(e,t){let n=new Map,r=t.defaultView,i=t.createComment(`mx-page-styles`);t.head.append(i);let a=e=>e.localName===`style`||e.localName===`link`&&/(^|\s)stylesheet(\s|$)/i.test(e.getAttribute(`rel`)??``),o=()=>{let r=[...e.querySelectorAll(`link, style`)].filter(a);for(let[e,t]of n)r.includes(e)||(t.remove(),n.delete(e));let o=i;for(let e of r){let r=n.get(e);r?e.localName===`style`&&r.textContent!==e.textContent&&(r.textContent=e.textContent):(r=t.importNode(e,!0),n.set(e,r)),e.localName===`link`&&It(e,r),o.nextSibling!==r&&t.head.insertBefore(r,o.nextSibling),o=r}},s=[],c=[],l=()=>{let n=[...e.adoptedStyleSheets??[]],i=n.map(e=>e.cssRules.length);if(n.length===s.length&&n.every((e,t)=>e===s[t]&&i[t]===c[t]))return;s=n,c=i;let a=r?.CSSStyleSheet;typeof a==`function`&&`adoptedStyleSheets`in t&&(t.adoptedStyleSheets=n.map(e=>{let t=new a;return t.replaceSync([...e.cssRules].map(e=>e.cssText).join(`
`)),t}))},u=()=>{It(e.documentElement,t.documentElement),e.body&&t.body&&It(e.body,t.body)};o(),l(),u();let d=e.defaultView?.MutationObserver,f=[];if(typeof d==`function`){let t=new d(o);t.observe(e.documentElement,{childList:!0,subtree:!0,characterData:!0,attributes:!0,attributeFilter:[`href`,`rel`,`media`,`disabled`]});let n=new d(u);n.observe(e.documentElement,{attributes:!0}),e.body&&n.observe(e.body,{attributes:!0}),f.push(t,n)}let p=setInterval(l,Pt);return()=>{for(let e of f)e.disconnect();clearInterval(p)}}function It(e,t){for(let n of t.getAttributeNames())e.hasAttribute(n)||t.removeAttribute(n);for(let n of e.getAttributeNames()){let r=e.getAttribute(n);t.getAttribute(n)!==r&&t.setAttribute(n,r)}}var K=class{owner;window;element;root=null;home=null;marks;live;focusedAt=0;active=E(null);stops=[];gone=!1;constructor(e,r){this.owner=e,this.window=r;let i=r.document;i.head||i.documentElement.prepend(i.createElement(`head`)),i.body||i.documentElement.append(i.createElement(`body`));let a=e.element.ownerDocument,o=Lt(r,()=>D(()=>this.closedByBrowser()));this.stops.push(he(i),o?()=>{}:Ft(a,i));let s=this.element=i.createElement(`div`);s.className=`mx-tabdocs mx-tabdocs__page`,s.id=w(`tabdocs-page`),s.setAttribute(`role`,`main`),n(s,e);let c=this.live=i.createElement(`div`);c.className=`mx-tabdocs__live`,c.setAttribute(`aria-live`,`polite`),s.append(c),i.body.append(s),this.marks=new Ne(s);let l=()=>this.focusedAt=performance.now();l();let u=()=>D(()=>this.closedByBrowser()),d=e=>V(r,e);r.addEventListener(`focus`,l),o||r.addEventListener(`pagehide`,u),i.addEventListener(`pointermove`,d,{capture:!0,passive:!0}),i.addEventListener(`pointerdown`,d,{capture:!0,passive:!0}),this.stops.push(()=>{r.removeEventListener(`focus`,l),r.removeEventListener(`pagehide`,u),i.removeEventListener(`pointermove`,d,!0),i.removeEventListener(`pointerdown`,d,!0)}),this.stops.push(t(e,`windowTitle`,()=>e.windowTitleOf(this),e=>{i.title!==e&&(i.title=e)}))}get manager(){return this.owner}get rect(){let e=this.window;return{x:e.screenX,y:e.screenY,width:e.outerWidth,height:e.outerHeight}}get groups(){return this.owner.groups.filter(e=>e.browserWindow===this)}get documents(){return this.groups.flatMap(e=>e.documents)}get activeGroup(){let e=this.active.value;return e&&e.browserWindow===this?e:this.groups[0]??null}get activeDocument(){return this.activeGroup?.activeDocument??null}get index(){return this.owner.browserWindows.indexOf(this)}moveToMainWindow(){return this.owner.moveToMainWindow(this)}close(){return this.owner.closeWindow(this)}focus(){return this.owner.focusWindow(this)}markActive(e){this.active.value=e}get isOpen(){return!this.gone&&!this.window.closed}dispose(){this.gone=!0;for(let e of this.stops.splice(0))e();this.element.remove();try{this.window.closed||this.window.close()}catch{}}closedByBrowser(){this.gone||this.owner.browserWindowClosed(this)}};function Lt(e,t){try{return de.main?.windows.attach(e,{styles:`live`,closeWhenEmpty:!1,onClosing:e=>e.reason!==`page`&&t()})??null}catch{return null}}var Rt=8,zt=class{manager;presenter;element;title;label;icon;unsaved;close;count;releaseIcon=()=>{};shown=null;swipe=null;constructor(e,t){this.manager=e,this.presenter=t;let n=e.element.ownerDocument,r=this.element=n.createElement(`div`);r.className=`mx-tabdocs__phone-bar`,r.setAttribute(`role`,`toolbar`);let i=this.title=n.createElement(`button`);i.type=`button`,i.className=`mx-tabdocs__phone-title`,i.setAttribute(`aria-haspopup`,`dialog`),this.icon=Bt(n,`mx-tabdocs__icon`),this.icon.setAttribute(`aria-hidden`,`true`),this.label=Bt(n,`mx-tabdocs__phone-label`),this.unsaved=Bt(n,`mx-tabdocs__phone-dirty`),this.unsaved.setAttribute(`aria-hidden`,`true`),i.append(this.icon,this.label,this.unsaved),this.close=new x({icon:c()}),this.close.element.classList.add(`mx-tabdocs__phone-close`),this.count=new x,this.count.element.classList.add(`mx-tabdocs__phone-count`),this.count.element.setAttribute(`aria-haspopup`,`dialog`),this.close.build(),this.count.build(),r.append(i,this.close.element,this.count.element),e.element.append(r),i.addEventListener(`click`,()=>D(()=>this.openCommands(!1))),i.addEventListener(`keydown`,e=>D(()=>this.key(e))),i.addEventListener(`touchstart`,e=>this.touchStart(e),{passive:!0}),i.addEventListener(`touchmove`,e=>this.touchMove(e),{passive:!1}),i.addEventListener(`touchend`,e=>this.touchEnd(e)),i.addEventListener(`touchcancel`,e=>this.touchEnd(e)),this.close.element.addEventListener(`click`,()=>D(()=>{let e=this.presenter.phoneDocument?.group;e&&this.manager.closeActiveByUser(e)})),this.count.element.addEventListener(`click`,()=>D(()=>this.presenter.showList()))}render(){let e=this.manager,t=this.presenter.phoneDocument,n=this.presenter.listDocuments();this.element.setAttribute(`aria-label`,e.textOf(`tabDocsDocuments`)),t!==this.shown&&(this.shown=t,this.renderIcon(t)),this.label.textContent=t?t.title:e.textOf(`tabDocsEmpty`),this.unsaved.hidden=!t?.dirty,this.title.setAttribute(`aria-label`,t?e.textOf(`tabDocsPhoneTitle`,{title:t.title}):e.textOf(`tabDocsEmpty`)),this.title.disabled=!t,this.close.element.hidden=!t,t&&(this.close.element.setAttribute(`aria-label`,e.textOf(t.closable?`tabDocsCloseActive`:`tabDocsHideActive`,{title:t.title})),this.close.enabled=e.mayCloseOrHide(t)),this.count.text=String(n.length),this.count.element.setAttribute(`aria-label`,e.textOf(`tabDocsPhoneCount`,{n:n.length})),this.count.element.setAttribute(`aria-expanded`,String(this.presenter.listOpen)),this.close.readLook(),this.count.readLook()}dispose(){this.releaseIcon();for(let e of[this.close,this.count])e.isDisposed||e.dispose();this.element.remove()}openCommands(e){let t=this.presenter.phoneDocument;t?.group&&this.manager.openDocumentSheet(t,t.group,e,this.title)}key(e){if(e.ctrlKey||e.altKey||e.metaKey)return;let t=this.manager.element.ownerDocument.defaultView?.getComputedStyle(this.title).direction===`rtl`;e.key===`ArrowRight`||e.key===`ArrowLeft`?(e.preventDefault(),this.go(e.key===`ArrowRight`===t?-1:1)):(e.key===`ContextMenu`||e.key===`F10`&&e.shiftKey)&&(e.preventDefault(),this.openCommands(!0))}go(e){let t=this.presenter.listDocuments(),n=this.shown?t.indexOf(this.shown):-1;if(t.length<2)return;let r=t[(n+e+t.length)%t.length];this.manager.activateFromList(r),this.title.focus()}renderIcon(e){this.releaseIcon(),this.releaseIcon=()=>{};let t=e?.icon;if(this.icon.hidden=!t,!t){this.icon.replaceChildren();return}let n=h(t,this.element.ownerDocument);this.icon.replaceChildren(n.node),this.releaseIcon=n.release}touchStart(e){if(e.touches.length!==1)return;let t=e.touches[0],n=new _e;n.start(t.clientX,t.clientY),this.swipe={id:t.identifier,x:t.clientX,y:t.clientY,decided:!1,taken:!1,tracker:n}}touchMove(e){let t=this.swipe,n=t&&Array.from(e.changedTouches).find(e=>e.identifier===t.id);if(!t||!n)return;t.tracker.move(n.clientX,n.clientY);let r=n.clientX-t.x,i=n.clientY-t.y;if(!t.decided){if(Math.abs(r)<Rt&&Math.abs(i)<Rt)return;t.decided=!0,t.taken=Math.abs(r)>Math.abs(i)&&this.presenter.listDocuments().length>1,t.taken&&this.title.toggleAttribute(`data-swiping`,!0)}t.taken&&(e.cancelable&&e.preventDefault(),this.label.style.translate=`${Math.round(r)}px 0`)}touchEnd(e){let t=this.swipe;if(!t||!Array.from(e.changedTouches).some(e=>e.identifier===t.id)||(this.swipe=null,!t.taken))return;e.preventDefault(),this.title.removeAttribute(`data-swiping`),this.label.style.translate=``;let n=Array.from(e.changedTouches).find(e=>e.identifier===t.id).clientX-t.x,r=t.tracker.velocity(`x`);if(e.type===`touchcancel`||Math.abs(n)<48&&Math.abs(r)<.4)return;let i=this.manager.element.ownerDocument.defaultView?.getComputedStyle(this.title).direction===`rtl`;D(()=>this.go(n<0===i?-1:1))}};function Bt(e,t){let n=e.createElement(`span`);return n.className=t,n}var Vt=8,Ht=class{manager;presenter;sheet;search;sections;empty;rows=new Map;lists=new Map;query=``;gesture=null;constructor(e,t){this.manager=e,this.presenter=t;let n=e.element.ownerDocument;this.sheet=new Te({container:e.element,title:()=>e.textOf(`tabDocsPhoneList`),showClose:!0,detents:[`full`],topGap:0,dragContent:!1,focusOnOpen:!1,onOpened:()=>D(()=>{e.listShown(!0),t.render()}),onClosed:()=>D(()=>{e.listShown(!1),t.render()})}),this.sheet.element.classList.add(`mx-tabdocs__phone-list`);let r=this.search=new Ae({type:`search`,stretch:!0,autocomplete:`off`});r.label=()=>e.textOf(`tabDocsPhoneSearch`),r.placeholder=()=>e.textOf(`tabDocsPhoneSearch`),r.element.classList.add(`mx-tabdocs__list-search`),r.onValueChanged(e=>{this.query=k((e.value??``).trim()),this.filter()}),this.sections=n.createElement(`div`),this.sections.className=`mx-tabdocs__list-sections`,this.empty=n.createElement(`div`),this.empty.className=`mx-tabdocs__list-empty`,this.empty.hidden=!0,r.build(),this.sheet.contentElement.append(r.element,this.sections,this.empty),e.controls.add(this.sheet),this.listen()}get isOpen(){return this.sheet.isOpen}open(){if(this.search.readLook(),this.render(),!this.sheet.open())return!1;let e=this.presenter.phoneDocument,t=(e&&this.rows.get(e))??[...this.rows.values()][0];return t?.open.focus({preventScroll:!0}),t?.element.scrollIntoView?.({block:`nearest`}),!0}close(){return this.sheet.close(`code`)}dispose(){this.endGesture();for(let e of this.rows.values())e.release();this.rows.clear(),this.search.isDisposed||this.search.dispose(),this.sheet.isDisposed||this.sheet.dispose()}render(){if(this.gesture?.mode===`drag`)return;let e=this.manager,t=this.presenter.listGroups(),n=this.presenter.phoneDocument,r=t.length<2,i=new Set;t.forEach((t,a)=>{let o=this.listOf(t);for(o.head.textContent=t.window?e.textOf(`tabDocsWindow`,{n:t.window.index+1}):e.textOf(`tabDocsGroup`,{n:a+1}),o.head.hidden=r,this.sections.children[a]!==o.section&&this.sections.insertBefore(o.section,this.sections.children[a]??null),t.documents.forEach((e,t)=>{i.add(e);let r=this.rowOf(e);e===n?r.element.setAttribute(`aria-current`,`true`):r.element.removeAttribute(`aria-current`),o.list.children[t]!==r.element&&o.list.insertBefore(r.element,o.list.children[t]??null)});o.list.children.length>t.documents.length;)o.list.lastElementChild.remove()});for(let[e,n]of this.lists)t.includes(e)||(n.section.remove(),this.lists.delete(e));for(let[e,t]of this.rows)i.has(e)||(t.release(),t.element.remove(),this.rows.delete(e));this.empty.textContent=e.textOf(`noItems`),this.filter(),this.renderRoving()}listOf(e){let t=this.lists.get(e);if(t)return t;let n=this.manager.element.ownerDocument,r=n.createElement(`section`);r.className=`mx-tabdocs__list-section`;let i=n.createElement(`div`);i.className=`mx-tabdocs__list-head`,i.setAttribute(`role`,`heading`),i.setAttribute(`aria-level`,`3`),i.id=`${e.element.id}-list`;let a=n.createElement(`ul`);return a.className=`mx-tabdocs__list-rows`,a.setAttribute(`aria-labelledby`,i.id),r.append(i,a),t={section:r,head:i,list:a},this.lists.set(e,t),t}rowOf(e){let t=this.manager,n=[e.title,e.description,e.dirty,e.pinned,e.preview,e.closable,String(e.icon??``)].join(`|`),r=this.rows.get(e);if(r&&r.look===n)return r;let i=t.element.ownerDocument,a=r?.element??i.createElement(`li`);r?.release(),a.className=`mx-tabdocs__list-row`,a.toggleAttribute(`data-pinned`,e.pinned),a.toggleAttribute(`data-preview`,e.preview);let o=i.createElement(`button`);o.type=`button`,o.className=`mx-tabdocs__list-open`;let s=()=>{};if(e.icon){let t=i.createElement(`span`);t.className=`mx-tabdocs__icon`,t.setAttribute(`aria-hidden`,`true`);let n=h(e.icon,i);t.append(n.node),s=n.release,o.append(t)}let l=i.createElement(`span`);l.className=`mx-tabdocs__list-text`;let u=i.createElement(`span`);if(u.className=`mx-tabdocs__list-title`,u.textContent=e.title,l.append(u),e.description){let t=i.createElement(`span`);t.className=`mx-tabdocs__list-description`,t.textContent=e.description,l.append(` `,t)}o.append(l);let d=[];if(e.pinned){let e=i.createElement(`span`);e.className=`mx-tabdocs__list-pin`,e.setAttribute(`aria-hidden`,`true`),e.append(f()),o.append(e),d.push(t.textOf(`tabDocsPinState`))}if(e.dirty){let e=i.createElement(`span`);e.className=`mx-tabdocs__list-dirty`,e.setAttribute(`aria-hidden`,`true`),o.append(e),d.push(t.textOf(`tabDocsUnsaved`))}if(d.length){let e=i.createElement(`span`);e.className=`mx-tabdocs__hidden`,e.textContent=`, ${d.join(`, `)}`,o.append(e)}let p=i.createElement(`button`);p.type=`button`,p.className=`mx-tabdocs__list-close`,p.setAttribute(`aria-label`,t.textOf(e.closable?`tabDocsCloseActive`:`tabDocsHideActive`,{title:e.title})),p.disabled=!t.mayCloseOrHide(e),p.append(c()),a.replaceChildren(o,p);let m={element:a,open:o,close:p,release:s,look:n};return this.rows.set(e,m),m}filter(){let e=this.query,t=!1;for(let[n,r]of this.lists){let i=0;for(let t of n.documents){let n=this.rows.get(t);if(!n)continue;let r=!e||k(t.title).includes(e)||k(t.description??``).includes(e);n.element.hidden=!r,r&&i++}r.section.hidden=!i,t||=i>0}this.empty.hidden=t}renderRoving(){let e=this.visibleRows().map(e=>e.open),t=T(this.sections),n=this.presenter.phoneDocument,r=e.find(e=>e===t)??(n&&this.rows.get(n)?.open)??e[0];for(let e of this.rows.values())e.open.tabIndex=e.open===r?0:-1}visibleRows(){return[...this.sections.querySelectorAll(`.mx-tabdocs__list-row`)].filter(e=>!e.hidden&&!e.closest(`[hidden]`)).map(e=>this.rowByElement(e)).filter(Boolean)}rowByElement(e){for(let t of this.rows.values())if(t.element===e)return t}docOf(e){let t=g(e)?e.closest(`.mx-tabdocs__list-row`):null;for(let[e,n]of this.rows)if(n.element===t)return e;return null}listen(){let e=this.sections;e.addEventListener(`click`,e=>{let t=this.docOf(e.target);t&&(e.target.closest(`.mx-tabdocs__list-close`)?D(()=>void this.closeDocument(t)):D(()=>this.choose(t)))}),e.addEventListener(`keydown`,e=>D(()=>this.key(e))),e.addEventListener(`contextmenu`,e=>{let t=this.docOf(e.target);t&&t.group&&(e.preventDefault(),!this.gesture&&D(()=>this.manager.openDocumentSheet(t,t.group,e.button!==2&&e.clientX===0&&e.clientY===0,this.rows.get(t)?.open??null)))}),e.addEventListener(`touchstart`,e=>this.touchStart(e),{passive:!0}),e.addEventListener(`touchmove`,e=>this.touchMove(e),{passive:!1}),e.addEventListener(`touchend`,e=>this.touchEnd(e)),e.addEventListener(`touchcancel`,e=>this.touchEnd(e))}choose(e){this.sheet.close(`code`),this.manager.activateFromList(e)}async closeDocument(e){let t=this.rows.get(e),n=t?this.neighbour(t,1)??this.neighbour(t,-1):null,r=await this.manager.closeOrHideFromList(e);!r&&t&&(t.element.style.translate=``),r&&n&&n.open.focus({preventScroll:!0})}neighbour(e,t){let n=this.visibleRows();return n[n.indexOf(e)+t]??null}key(e){let t=this.docOf(e.target),n=t?this.rows.get(t):void 0;if(!t||!n||e.ctrlKey||e.metaKey)return;let r=this.visibleRows(),i=r.indexOf(n),a=e=>{let t=r[Math.max(0,Math.min(r.length-1,e))];if(t){for(let e of this.rows.values())e.open.tabIndex=-1;t.open.tabIndex=0,t.open.focus()}};if(e.altKey&&(e.key===`ArrowUp`||e.key===`ArrowDown`)){e.preventDefault(),this.moveBy(t,e.key===`ArrowUp`?-1:1),this.rows.get(t)?.open.focus();return}if(!e.altKey){switch(e.key){case`ArrowDown`:a(i+1);break;case`ArrowUp`:a(i-1);break;case`Home`:a(0);break;case`End`:a(r.length-1);break;case`Delete`:this.closeDocument(t);break;case`ContextMenu`:t.group&&this.manager.openDocumentSheet(t,t.group,!0,n.open);break;case`F10`:if(!e.shiftKey)return;t.group&&this.manager.openDocumentSheet(t,t.group,!0,n.open);break;default:return}e.preventDefault()}}moveBy(e,t){let n=e.group;if(!n)return;let r=this.presenter.listGroups(),i=n.documents.indexOf(e)+t;if(i>=0&&i<n.documents.length){this.manager.moveFromList(e,n,i);return}let a=r[r.indexOf(n)+t];a&&this.manager.moveFromList(e,a,t>0?0:a.documents.length)}touchStart(e){if(e.touches.length!==1||this.gesture)return;let t=this.docOf(e.target),n=t?this.rows.get(t):void 0;if(!t||!n||e.target.closest(`.mx-tabdocs__list-close`))return;let r=e.touches[0],i=new _e;i.start(r.clientX,r.clientY);let a={id:r.identifier,doc:t,row:n,x:r.clientX,y:r.clientY,mode:`wait`,timer:void 0,tracker:i,from:null};a.timer=setTimeout(()=>D(()=>this.lift(a)),this.manager.longPressDelay),this.gesture=a}lift(e){if(this.gesture!==e||e.mode!==`wait`)return;if(!this.manager.mayMoveFromList(e.doc)){this.endGesture(),e.doc.group&&this.manager.openDocumentSheet(e.doc,e.doc.group,!1,e.row.open);return}e.mode=`drag`;let t=e.row.element;e.from={list:t.parentElement,next:t.nextElementSibling},t.toggleAttribute(`data-lifted`,!0),this.sections.toggleAttribute(`data-dragging`,!0)}touchMove(e){let t=this.gesture,n=t&&Array.from(e.changedTouches).find(e=>e.identifier===t.id);if(!t||!n)return;t.tracker.move(n.clientX,n.clientY);let r=n.clientX-t.x,i=n.clientY-t.y;if(t.mode===`wait`){if(Math.abs(r)<Vt&&Math.abs(i)<Vt)return;clearTimeout(t.timer),t.mode=Math.abs(r)>Math.abs(i)&&this.manager.mayCloseOrHide(t.doc)?`swipe`:`scroll`,t.mode===`swipe`&&t.row.element.toggleAttribute(`data-swiping`,!0)}if(t.mode!==`scroll`){if(e.cancelable&&e.preventDefault(),t.mode===`swipe`){t.row.element.style.translate=`${Math.round(r)}px 0`;return}this.dragTo(t,n.clientX,n.clientY)}}dragTo(e,t,n){let r=e.row.element;r.style.translate=``;let i=this.sections.ownerDocument.elementsFromPoint(t,n).find(e=>e!==r&&!r.contains(e)&&this.sections.contains(e)),a=i?.closest(`.mx-tabdocs__list-row`);if(a&&a!==r){let e=a.getBoundingClientRect(),t=n>e.top+e.height/2;a.parentElement.insertBefore(r,t?a.nextElementSibling:a)}else{let e=(i?.closest(`.mx-tabdocs__list-section`))?.querySelector(`.mx-tabdocs__list-rows`);e&&!e.contains(r)&&e.append(r)}let o=this.sheet.contentElement,s=o.getBoundingClientRect();n<s.top+48?o.scrollTop-=12:n>s.bottom-48&&(o.scrollTop+=12)}touchEnd(e){let t=this.gesture,n=t&&Array.from(e.changedTouches).find(e=>e.identifier===t.id);if(!t||!n)return;let r=e.type===`touchcancel`;if(this.endGesture(),t.mode===`swipe`){e.preventDefault();let i=t.row.element;i.removeAttribute(`data-swiping`);let a=n.clientX-t.x,o=t.tracker.velocity(`x`),s=Math.abs(a)>i.getBoundingClientRect().width*.35||Math.abs(o)>.5;!r&&s?(i.style.translate=`${a<0?-100:100}% 0`,D(()=>void this.closeDocument(t.doc))):i.style.translate=``;return}t.mode===`drag`&&(e.preventDefault(),D(()=>this.drop(t,r)))}endGesture(){let e=this.gesture;e&&(clearTimeout(e.timer),this.gesture=null,e.row.element.removeAttribute(`data-lifted`),this.sections.removeAttribute(`data-dragging`))}drop(e,t){let n=e.row.element,r=e.from,i=!!r&&(n.parentElement!==r.list||n.nextElementSibling!==r.next);if(t||!i){r&&i&&r.list.insertBefore(n,r.next),this.render(),!t&&e.doc.group&&this.manager.openDocumentSheet(e.doc,e.doc.group,!1,e.row.open);return}let a=n.parentElement,o=[...this.lists].find(([,e])=>e.list===a)?.[0],s=[...a?.children??[]].filter(e=>e!==n).indexOf(n.previousElementSibling)+1;o&&this.manager.moveFromList(e.doc,o,s),this.render(),this.rows.get(e.doc)?.open.focus({preventScroll:!0})}},Ut=class{manager;presenter;element;buttons=new Map;constructor(e,t){this.manager=e,this.presenter=t;let n=this.element=e.element.ownerDocument.createElement(`div`);n.className=`mx-tabdocs__phone-tools`,n.setAttribute(`role`,`toolbar`),n.addEventListener(`click`,e=>D(()=>this.toggle(this.documentAt(e.target)))),n.addEventListener(`keydown`,e=>this.key(e)),e.element.append(n)}render(){let e=this.manager,t=e.dockAreas.filter(e=>this.presenter.dockMode(e)!==`hidden`).flatMap(e=>e.documents);this.element.hidden=!t.length,this.element.setAttribute(`aria-label`,e.textOf(`tabDocsPhoneTools`));for(let[e,n]of this.buttons)t.includes(e)||(n.release(),n.button.remove(),this.buttons.delete(e));let n=null;t.forEach((e,t)=>{let r=this.entryOf(e),i=e.group?.dockArea,a=!!i&&this.presenter.isToolOpen(i)&&e.group?.activeDocument===e;r.button.setAttribute(`aria-pressed`,String(a)),r.button.toggleAttribute(`data-open`,a),(a||!n&&t===0)&&(n=r.button),this.element.children[t]!==r.button&&this.element.insertBefore(r.button,this.element.children[t]??null)});for(let{button:e}of this.buttons.values())e.tabIndex=e===n?0:-1}dispose(){for(let e of this.buttons.values())e.release();this.buttons.clear(),this.element.remove()}entryOf(e){let t=this.buttons.get(e),n=e.icon,r=e.title;if(t&&t.icon===n&&t.title===r)return t;let i=this.element.ownerDocument,a=t?.button??i.createElement(`button`);t?.release(),a.type=`button`,a.className=`mx-tabdocs__phone-tool`;let o=i.createElement(`span`);o.className=`mx-tabdocs__phone-tool-icon`,o.setAttribute(`aria-hidden`,`true`);let s=()=>{};if(n){let e=h(n,i);o.append(e.node),s=e.release}else o.textContent=Array.from(r.trim())[0]?.toLocaleUpperCase(l.locale)??``;let c=i.createElement(`span`);return c.className=`mx-tabdocs__phone-tool-label`,c.textContent=r,a.replaceChildren(o,c),t={button:a,release:s,icon:n,title:r},this.buttons.set(e,t),t}documentAt(e){let t=g(e)?e.closest(`.mx-tabdocs__phone-tool`):null;for(let[e,n]of this.buttons)if(n.button===t)return e;return null}toggle(e){let t=e?.group?.dockArea;e&&t&&(this.presenter.isToolOpen(t)&&e.group?.activeDocument===e?this.presenter.hideTool(t):this.presenter.showTool(e),this.render())}key(e){let t=[...this.element.querySelectorAll(`.mx-tabdocs__phone-tool`)],n=t.indexOf(e.target);if(n<0||e.ctrlKey||e.altKey||e.metaKey)return;let r=this.element.ownerDocument.defaultView?.getComputedStyle(this.element).direction===`rtl`,i=-1;if(e.key===`ArrowRight`||e.key===`ArrowLeft`?i=(n+(e.key===`ArrowRight`===r?-1:1)+t.length)%t.length:e.key===`Home`?i=0:e.key===`End`&&(i=t.length-1),!(i<0)){e.preventDefault();for(let e of t)e.tabIndex=-1;t[i].tabIndex=0,t[i].focus()}}},Wt=class{manager;kind=`desktop`;slots=[];guests=new Map;overlays=new Map;bar=null;tools=null;list=null;releaseBack=null;listening=[];rendering=!1;travelling=!1;busy=!1;folding=E(0);constructor(e){this.manager=e}get phoneDocument(){let e=this.manager,t=e.activeDocument;return t&&q(t.group)?t:e.recentGroupsNow().find(q)?.activeDocument??e.groups.find(q)?.activeDocument??null}listDocuments(){return this.listGroups().flatMap(e=>e.documents)}listGroups(){let e=this.manager;return[...e.groups.filter(q),...e.floatingWindows.flatMap(e=>e.groups)]}apply(e){if(e===this.kind)return;let t=T(this.manager.element);this.takeDown(),this.kind=e;let n=this.manager.element;e===`desktop`?n.removeAttribute(`data-presentation`):n.dataset.presentation=e,e!==`desktop`&&this.listen(),this.render(),t?.isConnected&&T(t)!==t&&t.focus({preventScroll:!0})}render(){if(this.kind===`desktop`||this.rendering)return;this.rendering=!0;let e=this.busy;this.busy=!0;try{D(()=>{let e=T(this.manager.element);this.renderMain(),this.renderAreas(),this.renderWindows(),this.kind===`phone`&&this.renderPhone(),e?.isConnected&&T(e)!==e&&e.focus({preventScroll:!0})})}finally{this.rendering=!1,this.busy=e}}hasGuests(e){return this.folding.value,this.guests.has(e)}isFolded(e){if(this.kind!==`tablet`)return!1;for(let[t,n]of this.guests)if(t!==e&&this.slots.some(n=>n.shown===t&&n.groups.includes(e)))return n!==null;return!1}renderSoon(){this.kind===`desktop`||this.busy||(this.busy=!0,queueMicrotask(()=>{this.busy=!1,this.render()}))}listen(){let e=this.manager,t=()=>this.renderSoon();this.listening=[e.onOpened(t),e.onClosed(t),e.onMoved(t),e.onPinned(t),e.onUnpinned(t),e.onKept(t),e.onHidden(t),e.onShown(t),e.onLayoutChanged(t),e.onDocumentActivated(t)]}guestsOf(e){return this.guests.get(e)??null}stripOrder(e){let t=e.group;if(!t)return[];let n=this.slots.find(e=>e.groups.includes(t));return this.kind!==`tablet`||!n?[...t.tabs]:n.groups.flatMap(e=>e.tabs)}reveal(e){if(this.kind===`desktop`||this.travelling)return!0;this.releaseBack?.raise();let t=e.group,n=t?.dockArea??t?.window??null;return n&&(!Kt(n)||this.dockMode(n)!==`hidden`)&&this.overlayOf(n)?.panel.open(),this.render(),!0}overlayOf(e){return this.kind===`desktop`?null:(this.overlays.has(e)||this.render(),this.overlays.get(e)??null)}showTool(e){let t=e.group?.dockArea,n=t?this.overlayOf(t):null;return!t||!n?!1:(this.manager.activateFromList(e),n.panel.open(),!0)}hideTool(e){let t=this.overlays.get(e);return!!t&&t.panel.close(`code`)}isToolOpen(e){return!!this.overlays.get(e)?.panel.isOpen}dockMode(e){return this.dockModeFor(e,this.kind===`phone`?`phone`:`tablet`)}dockModeFor(e,t){let n=this.manager,r=t===`phone`?e.phoneDockMode??n.phoneDockMode:e.tabletDockMode??n.tabletDockMode;return r===`auto`?t===`tablet`&&e.side!==`bottom`?`drawer`:`sheet`:r}showList(){return this.kind===`phone`&&(this.list??=new Ht(this.manager,this),this.list.open())}hideList(){return!!this.list?.close()}get listOpen(){return!!this.list?.isOpen}dispose(){for(let e of this.overlays.values())e.panel.isDisposed||e.panel.dispose();this.overlays.clear(),this.list?.dispose(),this.list=null,this.bar?.dispose(),this.bar=null,this.tools?.dispose(),this.tools=null;for(let e of this.listening.splice(0))e.dispose();let e=this.releaseBack;this.releaseBack=null,e?.(),this.kind=`desktop`}renderMain(){let e=this.manager,t=e.mainRoot,n=e.groups.filter(q),r=e.recentGroupsNow(),i=e=>r.find(t=>e.includes(t))??e[0],a;if(this.kind===`phone`){let e=this.phoneDocument,t=e?.group&&q(e.group)?e.group:i(n);a=t?[{shown:t,groups:[t]}]:[]}else{let r=e.maximizedGroup,o=e.element.getBoundingClientRect().width;a=(r||!(t instanceof I)||o<2*e.minGroupWidth?[n]:[qt(t.children[0]),t.children.slice(1).flatMap(qt)]).filter(e=>e.length).map(e=>({shown:r&&e.includes(r)?r:i(e),groups:e}));let s=e.element.style;if(a.length===2&&t instanceof I){let e=t.sizes[0]??.5;s.setProperty(`--_share-a`,`${Math.max(.2,e).toFixed(3)}fr`),s.setProperty(`--_share-b`,`${Math.max(.2,1-e).toFixed(3)}fr`)}else s.removeProperty(`--_share-a`),s.removeProperty(`--_share-b`)}this.slots=a;let o=new Map;for(let e of a){if(this.kind!==`tablet`||e.groups.length<2)continue;let t=e.groups.indexOf(e.shown);o.set(e.shown,{before:e.groups.slice(0,t).flatMap(e=>e.tabs.map(e=>e.header)),after:e.groups.slice(t+1).flatMap(e=>e.tabs.map(e=>e.header))})}let s=o.size!==this.guests.size||[...o.keys()].some(e=>!this.guests.has(e));this.guests=o,s&&(this.folding.value=this.folding.peek()+1);for(let e of n){let t=a.findIndex(t=>t.shown===e);e.element.dataset.slot=t<0?`none`:a.length===1?`solo`:String(t+1)}for(let e of n)o.has(e)||e.placeHeaders();for(let e of o.keys())e.placeHeaders()}renderAreas(){let e=this.manager;for(let t of e.dockAreas){let e=this.dockMode(t),n=this.overlays.get(t);if(e===`hidden`){n&&this.dropOverlay(t),this.home(t),t.element.dataset.presented=`hidden`;continue}let r=n&&n.mode===e?n:this.makeAreaOverlay(t,e);(!t.element.isConnected||t.element.parentElement!==r.panel.contentElement)&&N(r.panel.contentElement,t.element,null),t.element.dataset.presented=e}for(let t of[...this.overlays.keys()])Kt(t)&&!e.dockAreas.includes(t)&&this.dropOverlay(t)}makeAreaOverlay(e,t){this.dropOverlay(e);let n=this.manager,r={container:n.element,label:()=>n.textOf(Gt[e.side]),onOpened:()=>D(()=>e.markOpen(!0)),onClosed:()=>D(()=>e.markOpen(!1))},i=t===`drawer`?new ke({...r,side:e.side===`left`?`start`:e.side===`right`?`end`:e.side,edgeSwipe:()=>n.edgeSwipe&&this.kind!==`desktop`}):new Te({...r,modal:!1,detents:[`peek`,`half`,`full`],detent:`half`});i.element.classList.add(`mx-tabdocs__tool-panel`),i.element.dataset.side=e.side,n.controls.add(i);let a={panel:i,mode:t};return this.overlays.set(e,a),a}renderWindows(){let e=this.manager;for(let t of e.floatingWindows){let n=this.overlays.get(t);if(!n){let r=new Te({container:e.element,label:()=>t.groups[0]?.activeDocument?.title??e.textOf(`tabDocsWindow`,{n:t.index+1}),detents:[`full`],topGap:()=>this.kind===`phone`?0:null,modal:!0});r.element.classList.add(`mx-tabdocs__window-sheet`),e.controls.add(r),n={panel:r,mode:`sheet`},this.overlays.set(t,n)}t.body.parentElement!==n.panel.contentElement&&N(n.panel.contentElement,t.body,null),t.body.dataset.presented=`sheet`}for(let t of[...this.overlays.keys()])!Kt(t)&&!e.floatingWindows.includes(t)&&this.dropOverlay(t)}dropOverlay(e){let t=this.overlays.get(e);t&&(this.overlays.delete(e),Kt(e)?this.home(e):this.homeWindow(e),t.panel.isDisposed||t.panel.dispose())}home(e){let t=this.manager;delete e.element.dataset.presented,e.element.parentElement!==t.element&&N(t.element,e.element,e.sash.element.isConnected&&e.sash.element.parentElement===t.element?e.sash.element:null),e.markOpen(!1)}homeWindow(e){delete e.body.dataset.presented,e.body.parentElement!==e.element&&N(e.element,e.body,e.element.firstChild)}renderPhone(){let e=this.manager;this.bar??=new zt(e,this),this.tools??=new Ut(e,this),this.bar.render(),this.tools.render();let t=this.tools.element;e.element.style.setProperty(`--_tools-height`,`${t.hidden?0:Math.round(t.getBoundingClientRect().height)}px`),this.list?.render(),this.holdBack()}holdBack(){let e=this.manager,t=this.kind===`phone`&&e.backButton&&e.canGoBack;if(t&&!this.releaseBack)this.releaseBack=Ee(e.element.ownerDocument.defaultView,()=>{this.releaseBack=null,D(()=>this.goBack()),this.holdBack()},0);else if(!t&&this.releaseBack){let e=this.releaseBack;this.releaseBack=null,e()}}goBack(){let e=this.manager,t=this.phoneDocument;this.travelling=!0;try{for(;e.goBack();){let n=e.activeDocument;if(n&&n!==t&&this.listDocuments().includes(n))break}}finally{this.travelling=!1}let n=e.activeDocument;n&&this.reveal(n)}takeDown(){let e=this.manager;for(let e of[...this.overlays.keys()]){let t=this.overlays.get(e);t.panel.isOpen&&t.panel.close(`code`),this.dropOverlay(e)}for(let t of e.dockAreas)this.home(t);this.list?.dispose(),this.list=null,this.bar?.dispose(),this.bar=null,this.tools?.dispose(),this.tools=null;let t=this.releaseBack;this.releaseBack=null,t?.();for(let e of this.listening.splice(0))e.dispose();let n=e.groups;this.guests.size&&(this.folding.value=this.folding.peek()+1),this.guests=new Map,this.slots=[];for(let e of n)delete e.element.dataset.slot,e.placeHeaders();e.element.style.removeProperty(`--_share-a`),e.element.style.removeProperty(`--_share-b`),e.element.style.removeProperty(`--_tools-height`)}},Gt={left:`tabDocsAreaLeft`,right:`tabDocsAreaRight`,top:`tabDocsAreaTop`,bottom:`tabDocsAreaBottom`};function q(e){return!!e&&!e.window&&!e.dockArea&&!e.browserWindow}function Kt(e){return`side`in e}function qt(e){return e?e instanceof I?e.children.flatMap(qt):[e]:[]}var Jt=`closeButton.contentLifetime.closeEmptyGroups.openPosition.afterClose.activation.minGroupWidth.minGroupHeight.resizeStep.groupActions.maximizeOnDoubleClick.previewTabs.pinnedTabSize.pinnedTabsOnSeparateRow.closeButtonOnPinned.keepPinned.tabSize.tabMinWidth.tabMaxWidth.tabFixedWidth.wrapTabs.scrollButtons.singleTabTitle.barButtons.barButtonSize.compactScrollButtons.compactTabSize.compactTabMinWidth.compactSingleTabTitle.compactBarButtons.compactBarButtonSize.showDescription.openList.openListScope.recentListScope.historySize.closedHistorySize.contextMenu.menuItems.allowDuplicate.splitCopies.allowDrag.allowDragGroups.groupDragHandle.dropSides.dropEdgeSize.layoutEdgeDrop.layoutEdgeSize.dragThreshold.longPressDelay.dragHoverActivate.dragHoverDelay.pinOnDrag.copyModifier.dragGroup.dragGhost.dragAutoScroll.allowFloat.allowDock.dockSides.allowAutoHide.allowHide.floatingWindowSize.keepFloatingInView.closeEmptyWindows.dockOnDoubleClick.dockAreaSize.dockAreaMinSize.autoHideHover.autoHideDelay.dockGuides.dockGuideKinds.allowNewWindow.newWindowUrl.newWindowSize.newWindowFallback.newWindowCloseAction.restoreWindows.dragOutToNewWindow.keyPreset.keys.texts.announce.presentation.tabletWidth.phoneWidth.tabletWhen.narrowBars.phoneDockMode.tabletDockMode.edgeSwipe.backButton.menuPresentation`.split(`.`),Yt=[`newDocument`,`toolbarItems`,`openWindow`],Xt=[`tabSize`,`pinnedTabSize`,`pinnedTabsOnSeparateRow`,`wrapTabs`,`scrollButtons`,`tabMinWidth`,`tabMaxWidth`,`tabFixedWidth`],Zt=[],Qt=[],$t=[`center`,`left`,`right`,`up`,`down`],J=[`left`,`right`,`top`,`bottom`],en=[`group`,`edges`],tn={left:240,right:240,top:160,bottom:200},nn=[],rn=[],an=[],on=new Set,Y=Symbol(`mx.tab-document-manager`),sn=class extends Ce{static browserKeys=gt;static desktopKeys=ht;constructor(e){super(`div`,e);let n=this.props??{},r=this.parts;for(let e of Jt)n[e]!==void 0&&this.bindProperty(e,n[e]);n.factory!==void 0&&this.bindProperty(`factory`,j(n.factory)),n.newWindowTitle!==void 0&&this.bindProperty(`newWindowTitle`,j(n.newWindowTitle));for(let e of Yt)n[e]!==void 0&&this.setProperty(e,n[e]);n.label!==void 0&&this.bindProperty(`text`,n.label);let i=[[`onOpening`,this.onOpening],[`onOpened`,this.onOpened],[`onClosing`,this.onClosing],[`onClosed`,this.onClosed],[`onDocumentActivating`,this.onDocumentActivating],[`onDocumentActivated`,this.onDocumentActivated],[`onMoving`,this.onMoving],[`onMoved`,this.onMoved],[`onSplitting`,this.onSplitting],[`onSplit`,this.onSplit],[`onLayoutChanging`,this.onLayoutChanging],[`onLayoutChanged`,this.onLayoutChanged],[`onKeeping`,this.onKeeping],[`onKept`,this.onKept],[`onPinning`,this.onPinning],[`onPinned`,this.onPinned],[`onUnpinning`,this.onUnpinning],[`onUnpinned`,this.onUnpinned],[`onLocking`,this.onLocking],[`onLocked`,this.onLocked],[`onUnlocking`,this.onUnlocking],[`onUnlocked`,this.onUnlocked],[`onContextMenuOpening`,this.onContextMenuOpening],[`onDragStarting`,this.onDragStarting],[`onDragOver`,this.onDragOver],[`onDropping`,this.onDropping],[`onDropped`,this.onDropped],[`onDragEnded`,this.onDragEnded],[`onFloating`,this.onFloating],[`onFloated`,this.onFloated],[`onDocking`,this.onDocking],[`onDocked`,this.onDocked],[`onAutoHiding`,this.onAutoHiding],[`onAutoHidden`,this.onAutoHidden],[`onHiding`,this.onHiding],[`onHidden`,this.onHidden],[`onShowing`,this.onShowing],[`onShown`,this.onShown],[`onSlideChanging`,this.onSlideChanging],[`onSlideChanged`,this.onSlideChanged],[`onWindowClosing`,this.onWindowClosing],[`onWindowClosed`,this.onWindowClosed],[`onWindowOpening`,this.onWindowOpening],[`onWindowOpened`,this.onWindowOpened],[`onError`,this.onError],[`onPresentationChanging`,this.onPresentationChanging],[`onPresentationChanged`,this.onPresentationChanged]];for(let[e,t]of i)n[e]&&t(n[e]);this.observeProperty(`minGroupWidth`,()=>this.renderMinSizes()),this.observeProperty(`minGroupHeight`,()=>this.renderMinSizes());for(let e of Xt)this.observeProperty(e,()=>this.renderStrip());this.observeProperty(`keys`,()=>this.registerKeys()),this.observeProperty(`keyPreset`,()=>this.registerKeys()),this.observeProperty(`text`,e=>{e?(this.element.setAttribute(`role`,`region`),this.element.setAttribute(`aria-label`,e)):(this.element.removeAttribute(`role`),this.element.removeAttribute(`aria-label`))}),this.ensureRoot(),r.menus=new yt(this),r.layoutTarget=new Xe(this),r.targets.push(r.layoutTarget),r.dockTarget=new Ot(this),r.targets.unshift(r.dockTarget),r.targets.push(new Nt(this)),r.drag=new ft(this),r.moveKeys=new at(this,r.drag),r.windowKeys=new Mt(this),this.observeProperty(`dockAreaSize`,()=>this.renderDock()),this.observeProperty(`dockAreaMinSize`,()=>this.renderDock());for(let e of[`presentation`,`tabletWidth`,`phoneWidth`,`tabletWhen`])this.observeProperty(e,()=>this.resolvePresentation());for(let e of[`phoneDockMode`,`tabletDockMode`,`backButton`])this.observeProperty(e,()=>D(()=>this.parts.presenter.render()));this.watchSize(),this.watchPointer(),on.add(this),this.motif.on(`x:built`,()=>D(()=>this.renderTree()));let a=se(this,()=>this.renderTexts()),o=t(this,`texts`,()=>[this.getProperty(`texts`),this.groups],()=>this.renderTexts());this.motif.setDisposable(()=>{o(),a(),r.presenter.dispose(),on.delete(this),r.moveKeys?.end(!1),r.windowKeys?.end(!1),r.drag?.cancel(!0),r.slide?.stop(),r.slide=null,r.sizeWatch?.disconnect(),r.dockTarget?.dispose();for(let e of r.keyStops.splice(0))e();for(let[e,t]of r.tabs)e.placeIn(null,null),t.dispose();r.tabs.clear(),r.closed=[],r.hiddenDocs=[],r.history=[],this.disposeSplits(r.root);for(let e of r.areas.values())this.disposeSplits(e.root),e.strip?.dispose(),e.dispose();for(let e of r.windows)this.disposeSplits(e.root),e.dispose();for(let e of r.browsers)this.disposeBrowserWindow(e);r.browsers=[],r.pageStop?.(),r.areas.clear(),r.windows=[],r.menus?.dispose(),r.openList?.dispose(),r.recentList?.dispose();for(let e of[r.opening,r.opened,r.closing,r.closed_,r.activating,r.activated,r.moving,r.moved,r.splitting,r.split,r.layoutChanging,r.layoutChanged,r.keeping,r.kept,r.pinning,r.pinned,r.unpinning,r.unpinned,r.locking,r.locked,r.unlocking,r.unlocked,r.menuOpening,r.dragStarting,r.dragOver,r.dropping,r.dropped,r.dragEnded,r.floating,r.floated,r.docking,r.docked,r.autoHiding,r.autoHidden,r.hiding,r.hidden_,r.showing,r.shown,r.slideChanging,r.slideChanged,r.windowClosing,r.windowClosed,r.windowOpening,r.windowOpened,r.error,r.presentationChanging,r.presentationChanged])e.dispose()})}get label(){return this.text}set label(e){this.text=e}get closeButton(){return this.getProperty(`closeButton`)??`always`}set closeButton(e){this.assignProperty(`closeButton`,e)}get contentLifetime(){return this.getProperty(`contentLifetime`)??`keep`}set contentLifetime(e){this.assignProperty(`contentLifetime`,e)}get closeEmptyGroups(){return this.getProperty(`closeEmptyGroups`)??!0}set closeEmptyGroups(e){this.assignProperty(`closeEmptyGroups`,e,Boolean)}get openPosition(){return this.getProperty(`openPosition`)??`afterActive`}set openPosition(e){this.assignProperty(`openPosition`,e)}get afterClose(){return this.getProperty(`afterClose`)??`recent`}set afterClose(e){this.assignProperty(`afterClose`,e)}get activation(){return this.getProperty(`activation`)??`auto`}set activation(e){this.assignProperty(`activation`,e)}get minGroupWidth(){return this.getProperty(`minGroupWidth`)??160}set minGroupWidth(e){this.assignProperty(`minGroupWidth`,e,e=>Math.max(0,Number(e)||0))}get minGroupHeight(){return this.getProperty(`minGroupHeight`)??100}set minGroupHeight(e){this.assignProperty(`minGroupHeight`,e,e=>Math.max(0,Number(e)||0))}get resizeStep(){return this.getProperty(`resizeStep`)??10}set resizeStep(e){this.assignProperty(`resizeStep`,e,e=>Math.max(1,Number(e)||1))}get groupActions(){return this.getProperty(`groupActions`)??!0}set groupActions(e){this.assignProperty(`groupActions`,e,Boolean)}get toolbarItems(){return this.getProperty(`toolbarItems`)??null}set toolbarItems(e){this.setProperty(`toolbarItems`,e)}get maximizeOnDoubleClick(){return this.getProperty(`maximizeOnDoubleClick`)??!0}set maximizeOnDoubleClick(e){this.assignProperty(`maximizeOnDoubleClick`,e,Boolean)}get previewTabs(){return this.getProperty(`previewTabs`)??!0}set previewTabs(e){this.assignProperty(`previewTabs`,e,Boolean)}get pinnedTabSize(){return this.getProperty(`pinnedTabSize`)??`normal`}set pinnedTabSize(e){this.assignProperty(`pinnedTabSize`,e)}get pinnedTabsOnSeparateRow(){return this.getProperty(`pinnedTabsOnSeparateRow`)??!1}set pinnedTabsOnSeparateRow(e){this.assignProperty(`pinnedTabsOnSeparateRow`,e,Boolean)}get closeButtonOnPinned(){return this.getProperty(`closeButtonOnPinned`)??!1}set closeButtonOnPinned(e){this.assignProperty(`closeButtonOnPinned`,e,Boolean)}get keepPinned(){return this.getProperty(`keepPinned`)??!0}set keepPinned(e){this.assignProperty(`keepPinned`,e,Boolean)}get tabSize(){return this.getProperty(`tabSize`)??`fit`}set tabSize(e){this.assignProperty(`tabSize`,e)}get tabMinWidth(){return this.getProperty(`tabMinWidth`)??80}set tabMinWidth(e){this.assignProperty(`tabMinWidth`,e,e=>Math.max(0,Number(e)||0))}get tabMaxWidth(){return this.getProperty(`tabMaxWidth`)??0}set tabMaxWidth(e){this.assignProperty(`tabMaxWidth`,e,e=>Math.max(0,Number(e)||0))}get tabFixedWidth(){return this.getProperty(`tabFixedWidth`)??160}set tabFixedWidth(e){this.assignProperty(`tabFixedWidth`,e,e=>Math.max(0,Number(e)||0))}get wrapTabs(){return this.getProperty(`wrapTabs`)??!1}set wrapTabs(e){this.assignProperty(`wrapTabs`,e,Boolean)}get scrollButtons(){return this.getProperty(`scrollButtons`)??!0}set scrollButtons(e){this.assignProperty(`scrollButtons`,e,Boolean)}get singleTabTitle(){return this.getProperty(`singleTabTitle`)??!1}set singleTabTitle(e){this.assignProperty(`singleTabTitle`,e,Boolean)}get barButtons(){return this.getProperty(`barButtons`)??`all`}set barButtons(e){this.assignProperty(`barButtons`,e)}get barButtonSize(){return this.getProperty(`barButtonSize`)??`normal`}set barButtonSize(e){this.assignProperty(`barButtonSize`,e)}get compactScrollButtons(){return this.getProperty(`compactScrollButtons`)??!1}set compactScrollButtons(e){this.assignProperty(`compactScrollButtons`,e,Boolean)}get compactTabSize(){return this.getProperty(`compactTabSize`)??`shrink`}set compactTabSize(e){this.assignProperty(`compactTabSize`,e)}get compactTabMinWidth(){return this.getProperty(`compactTabMinWidth`)??64}set compactTabMinWidth(e){this.assignProperty(`compactTabMinWidth`,e,e=>Math.max(0,Number(e)||0))}get compactSingleTabTitle(){return this.getProperty(`compactSingleTabTitle`)??!0}set compactSingleTabTitle(e){this.assignProperty(`compactSingleTabTitle`,e,Boolean)}get compactBarButtons(){return this.getProperty(`compactBarButtons`)??`auto`}set compactBarButtons(e){this.assignProperty(`compactBarButtons`,e)}get compactBarButtonSize(){return this.getProperty(`compactBarButtonSize`)??`small`}set compactBarButtonSize(e){this.assignProperty(`compactBarButtonSize`,e)}get showDescription(){return this.getProperty(`showDescription`)??`duplicates`}set showDescription(e){this.assignProperty(`showDescription`,e)}get openList(){return this.getProperty(`openList`)??!0}set openList(e){this.assignProperty(`openList`,e,Boolean)}get openListScope(){return this.getProperty(`openListScope`)??`group`}set openListScope(e){this.assignProperty(`openListScope`,e)}get recentListScope(){return this.getProperty(`recentListScope`)??`group`}set recentListScope(e){this.assignProperty(`recentListScope`,e)}get historySize(){return this.getProperty(`historySize`)??50}set historySize(e){this.assignProperty(`historySize`,e,e=>Math.max(0,Math.floor(Number(e)||0)))}get closedHistorySize(){return this.getProperty(`closedHistorySize`)??10}set closedHistorySize(e){this.assignProperty(`closedHistorySize`,e,e=>Math.max(0,Math.floor(Number(e)||0)))}get contextMenu(){return this.getProperty(`contextMenu`)??!0}set contextMenu(e){this.assignProperty(`contextMenu`,e,Boolean)}get menuItems(){return this.getProperty(`menuItems`)??{}}set menuItems(e){this.assignProperty(`menuItems`,e)}get newDocument(){return this.getProperty(`newDocument`)??null}set newDocument(e){this.setProperty(`newDocument`,e)}get allowDuplicate(){return this.getProperty(`allowDuplicate`)??!1}set allowDuplicate(e){this.assignProperty(`allowDuplicate`,e,Boolean)}get splitCopies(){return this.getProperty(`splitCopies`)??!0}set splitCopies(e){this.assignProperty(`splitCopies`,e,Boolean)}get allowDrag(){return this.getProperty(`allowDrag`)??!0}set allowDrag(e){this.assignProperty(`allowDrag`,e,Boolean)}get allowDragGroups(){return this.getProperty(`allowDragGroups`)??!0}set allowDragGroups(e){this.assignProperty(`allowDragGroups`,e,Boolean)}get groupDragHandle(){return this.getProperty(`groupDragHandle`)??!1}set groupDragHandle(e){this.assignProperty(`groupDragHandle`,e,Boolean)}get layoutEdgeDrop(){return this.getProperty(`layoutEdgeDrop`)??!0}set layoutEdgeDrop(e){this.assignProperty(`layoutEdgeDrop`,e,Boolean)}get layoutEdgeSize(){return this.getProperty(`layoutEdgeSize`)??16}set layoutEdgeSize(e){this.assignProperty(`layoutEdgeSize`,e,e=>Math.max(0,Number(e)||0))}get dragThreshold(){return this.getProperty(`dragThreshold`)??5}set dragThreshold(e){this.assignProperty(`dragThreshold`,e,e=>Math.max(0,Number(e)||0))}get longPressDelay(){return this.getProperty(`longPressDelay`)??500}set longPressDelay(e){this.assignProperty(`longPressDelay`,e,e=>Math.max(0,Number(e)||0))}get dragHoverActivate(){return this.getProperty(`dragHoverActivate`)??!0}set dragHoverActivate(e){this.assignProperty(`dragHoverActivate`,e,Boolean)}get dragHoverDelay(){return this.getProperty(`dragHoverDelay`)??750}set dragHoverDelay(e){this.assignProperty(`dragHoverDelay`,e,e=>Math.max(0,Number(e)||0))}get pinOnDrag(){return this.getProperty(`pinOnDrag`)??!0}set pinOnDrag(e){this.assignProperty(`pinOnDrag`,e,Boolean)}get dragGhost(){return this.getProperty(`dragGhost`)??!0}set dragGhost(e){this.assignProperty(`dragGhost`,e,Boolean)}get dragAutoScroll(){return this.getProperty(`dragAutoScroll`)??!0}set dragAutoScroll(e){this.assignProperty(`dragAutoScroll`,e,Boolean)}get allowFloat(){return this.getProperty(`allowFloat`)??!0}set allowFloat(e){this.assignProperty(`allowFloat`,e,Boolean)}get allowDock(){return this.getProperty(`allowDock`)??!0}set allowDock(e){this.assignProperty(`allowDock`,e,Boolean)}get dockSides(){return this.getProperty(`dockSides`)??J}set dockSides(e){this.assignProperty(`dockSides`,e)}get allowAutoHide(){return this.getProperty(`allowAutoHide`)??!0}set allowAutoHide(e){this.assignProperty(`allowAutoHide`,e,Boolean)}get allowHide(){return this.getProperty(`allowHide`)??!0}set allowHide(e){this.assignProperty(`allowHide`,e,Boolean)}get floatingWindowSize(){return this.getProperty(`floatingWindowSize`)??null}set floatingWindowSize(e){this.assignProperty(`floatingWindowSize`,e)}get keepFloatingInView(){return this.getProperty(`keepFloatingInView`)??!0}set keepFloatingInView(e){this.assignProperty(`keepFloatingInView`,e,Boolean)}get closeEmptyWindows(){return this.getProperty(`closeEmptyWindows`)??!0}set closeEmptyWindows(e){this.assignProperty(`closeEmptyWindows`,e,Boolean)}get dockOnDoubleClick(){return this.getProperty(`dockOnDoubleClick`)??!0}set dockOnDoubleClick(e){this.assignProperty(`dockOnDoubleClick`,e,Boolean)}get dockAreaSize(){return{...tn,...this.getProperty(`dockAreaSize`)}}set dockAreaSize(e){this.assignProperty(`dockAreaSize`,e)}get dockAreaMinSize(){return this.getProperty(`dockAreaMinSize`)??120}set dockAreaMinSize(e){this.assignProperty(`dockAreaMinSize`,e,e=>Math.max(0,Number(e)||0))}get autoHideHover(){return this.getProperty(`autoHideHover`)??!0}set autoHideHover(e){this.assignProperty(`autoHideHover`,e,Boolean)}get autoHideDelay(){return this.getProperty(`autoHideDelay`)??500}set autoHideDelay(e){this.assignProperty(`autoHideDelay`,e,e=>Math.max(0,Number(e)||0))}get dockGuides(){return this.getProperty(`dockGuides`)??!1}set dockGuides(e){this.assignProperty(`dockGuides`,e,Boolean)}get dockGuideKinds(){return this.getProperty(`dockGuideKinds`)??en}set dockGuideKinds(e){this.assignProperty(`dockGuideKinds`,e)}get dropSides(){return this.getProperty(`dropSides`)??$t}set dropSides(e){this.assignProperty(`dropSides`,e)}get dropEdgeSize(){return this.getProperty(`dropEdgeSize`)??`33%`}set dropEdgeSize(e){this.assignProperty(`dropEdgeSize`,e)}get copyModifier(){return this.getProperty(`copyModifier`)??`auto`}set copyModifier(e){this.assignProperty(`copyModifier`,e)}get dragGroup(){return this.getProperty(`dragGroup`)??null}set dragGroup(e){this.assignProperty(`dragGroup`,e)}get allowNewWindow(){return this.getProperty(`allowNewWindow`)??!0}set allowNewWindow(e){this.assignProperty(`allowNewWindow`,e,Boolean)}get newWindowUrl(){return this.getProperty(`newWindowUrl`)||`about:blank`}set newWindowUrl(e){this.assignProperty(`newWindowUrl`,e)}get newWindowTitle(){return this.getProperty(`newWindowTitle`)??`{title} – {page}`}set newWindowTitle(e){this.assignProperty(`newWindowTitle`,j(e))}get newWindowSize(){return this.getProperty(`newWindowSize`)??null}set newWindowSize(e){this.assignProperty(`newWindowSize`,e)}get newWindowFallback(){return this.getProperty(`newWindowFallback`)??`float`}set newWindowFallback(e){this.assignProperty(`newWindowFallback`,e)}get newWindowCloseAction(){return this.getProperty(`newWindowCloseAction`)??`back`}set newWindowCloseAction(e){this.assignProperty(`newWindowCloseAction`,e)}get restoreWindows(){return this.getProperty(`restoreWindows`)??`float`}set restoreWindows(e){this.assignProperty(`restoreWindows`,e)}get openWindow(){return this.getProperty(`openWindow`)??null}set openWindow(e){this.setProperty(`openWindow`,e)}get dragOutToNewWindow(){return this.getProperty(`dragOutToNewWindow`)??!0}set dragOutToNewWindow(e){this.assignProperty(`dragOutToNewWindow`,e,Boolean)}get keyPreset(){return this.getProperty(`keyPreset`)??`auto`}set keyPreset(e){this.assignProperty(`keyPreset`,e)}get keys(){let e=this.keyPreset;return{...e===`desktop`||e===`auto`&&gn(this.element.ownerDocument.defaultView)?ht:gt,...this.getProperty(`keys`)}}set keys(e){this.assignProperty(`keys`,e)}get texts(){return this.getProperty(`texts`)??{}}set texts(e){this.assignProperty(`texts`,e)}get announce(){return this.getProperty(`announce`)??!0}set announce(e){this.assignProperty(`announce`,e,Boolean)}get factory(){return this.getProperty(`factory`)??null}set factory(e){this.assignProperty(`factory`,j(e))}get presentation(){return this.getProperty(`presentation`)??`auto`}set presentation(e){this.assignProperty(`presentation`,e)}get tabletWidth(){return this.getProperty(`tabletWidth`)??1024}set tabletWidth(e){this.assignProperty(`tabletWidth`,e,Number)}get phoneWidth(){return this.getProperty(`phoneWidth`)??560}set phoneWidth(e){this.assignProperty(`phoneWidth`,e,Number)}get tabletWhen(){return this.getProperty(`tabletWhen`)??`touch`}set tabletWhen(e){this.assignProperty(`tabletWhen`,e)}get narrowBars(){return this.getProperty(`narrowBars`)??`compact`}set narrowBars(e){this.assignProperty(`narrowBars`,e)}get phoneDockMode(){return this.getProperty(`phoneDockMode`)??`sheet`}set phoneDockMode(e){this.assignProperty(`phoneDockMode`,e)}get tabletDockMode(){return this.getProperty(`tabletDockMode`)??`auto`}set tabletDockMode(e){this.assignProperty(`tabletDockMode`,e)}get edgeSwipe(){return this.getProperty(`edgeSwipe`)!==!1}set edgeSwipe(e){this.assignProperty(`edgeSwipe`,e,Boolean)}get backButton(){return this.getProperty(`backButton`)!==!1}set backButton(e){this.assignProperty(`backButton`,e,Boolean)}get menuPresentation(){return this.getProperty(`menuPresentation`)??null}set menuPresentation(e){this.assignProperty(`menuPresentation`,e)}get currentPresentation(){return this.getProperty(`currentPresentation`)??`desktop`}get documentListOpen(){return!!this.getProperty(`documentListOpen`)}get groups(){return this.getProperty(`groups`)??Zt}get documents(){return this.groups.flatMap(e=>e.documents)}get activeGroup(){return this.getProperty(`activeGroup`)??null}get activeDocument(){return this.activeGroup?.activeDocument??null}get maximizedGroup(){return this.getProperty(`maximizedGroup`)??null}get recentDocuments(){return this.getProperty(`recentDocuments`)??Qt}get hiddenDocuments(){return this.getProperty(`hiddenDocuments`)??Qt}get closedDocuments(){return this.getProperty(`closedDocuments`)??Qt}get canGoBack(){return!!this.getProperty(`canGoBack`)}get canGoForward(){return!!this.getProperty(`canGoForward`)}get dragging(){return this.getProperty(`dragging`)??null}get floatingWindows(){return this.getProperty(`floatingWindows`)??nn}get browserWindows(){return this.getProperty(`browserWindows`)??rn}get dockAreas(){return this.getProperty(`dockAreas`)??an}dockArea(e){return this.dockAreas.find(t=>t.side===e)??null}get dropTargets(){return this.parts.targets}get onOpening(){return this.parts.opening.event}get onOpened(){return this.parts.opened.event}get onClosing(){return this.parts.closing.event}get onClosed(){return this.parts.closed_.event}get onDocumentActivating(){return this.parts.activating.event}get onDocumentActivated(){return this.parts.activated.event}get onMoving(){return this.parts.moving.event}get onMoved(){return this.parts.moved.event}get onSplitting(){return this.parts.splitting.event}get onSplit(){return this.parts.split.event}get onLayoutChanging(){return this.parts.layoutChanging.event}get onLayoutChanged(){return this.parts.layoutChanged.event}get onKeeping(){return this.parts.keeping.event}get onKept(){return this.parts.kept.event}get onPinning(){return this.parts.pinning.event}get onPinned(){return this.parts.pinned.event}get onUnpinning(){return this.parts.unpinning.event}get onUnpinned(){return this.parts.unpinned.event}get onLocking(){return this.parts.locking.event}get onLocked(){return this.parts.locked.event}get onUnlocking(){return this.parts.unlocking.event}get onUnlocked(){return this.parts.unlocked.event}get onContextMenuOpening(){return this.parts.menuOpening.event}get onDragStarting(){return this.parts.dragStarting.event}get onDragOver(){return this.parts.dragOver.event}get onDropping(){return this.parts.dropping.event}get onDropped(){return this.parts.dropped.event}get onDragEnded(){return this.parts.dragEnded.event}get onFloating(){return this.parts.floating.event}get onFloated(){return this.parts.floated.event}get onDocking(){return this.parts.docking.event}get onDocked(){return this.parts.docked.event}get onAutoHiding(){return this.parts.autoHiding.event}get onAutoHidden(){return this.parts.autoHidden.event}get onHiding(){return this.parts.hiding.event}get onHidden(){return this.parts.hidden_.event}get onShowing(){return this.parts.showing.event}get onShown(){return this.parts.shown.event}get onSlideChanging(){return this.parts.slideChanging.event}get onSlideChanged(){return this.parts.slideChanged.event}get onWindowClosing(){return this.parts.windowClosing.event}get onWindowClosed(){return this.parts.windowClosed.event}get onWindowOpening(){return this.parts.windowOpening.event}get onWindowOpened(){return this.parts.windowOpened.event}get onError(){return this.parts.error.event}get onPresentationChanging(){return this.parts.presentationChanging.event}get onPresentationChanged(){return this.parts.presentationChanged.event}showDocumentList(){return D(()=>this.parts.presenter.showList())}hideDocumentList(){return D(()=>this.parts.presenter.hideList())}showTool(e){return D(()=>this.parts.presenter.showTool(e))}hideTool(e){return D(()=>this.parts.presenter.hideTool(e))}open(e,t={}){return D(()=>this.openDocument(e,t,!1))}close(e){return D(()=>this.closeDocument(e,!1))}closeAll(e,t){return this.closeMany(D(()=>[...e?e.documents:this.documents]),t,!1)}closeOthers(e){return this.closeMany(D(()=>(e.group?.documents??[]).filter(t=>t!==e)),void 0,!1)}closeToRight(e){return this.closeMany(D(()=>this.sideOf(e,1)),void 0,!1)}closeToLeft(e){return this.closeMany(D(()=>this.sideOf(e,-1)),void 0,!1)}closeSaved(e){return this.closeMany(D(()=>(e?e.documents:this.documents).filter(e=>!e.dirty)),void 0,!1)}hide(e){return D(()=>e.manager===this&&this.hideBy(e,!1))}show(e,t={}){return D(()=>this.showBy(e,t,!1))}activate(e,t=!1){return D(()=>{let n=this.parts.presenter;return e.manager===this&&n.kind===`desktop`&&e.dockArea?.autoHidden&&this.parts.slide?.area!==e.dockArea&&this.slideOut(e,!1,!1),this.activateDocument(e,t,!1)&&(n.reveal(e),!0)})}activateNext(e,t=!1){return D(()=>this.step(e??this.activeGroup,1,t,!1))}activatePrevious(e,t=!1){return D(()=>this.step(e??this.activeGroup,-1,t,!1))}move(e,t,n){return D(()=>this.moveDocument(e,t,n,!1))}moveToGroup(e,t){return D(()=>this.moveToGroupBy(e,t,!1))}moveInGroup(e,t){return D(()=>this.moveInGroupBy(e,t,!1))}keep(e){return D(()=>this.keepBy(e,!1))}pin(e){return D(()=>this.pinBy(e,!0,!1))}unpin(e){return D(()=>this.pinBy(e,!1,!1))}reopenClosed(){return D(()=>this.reopenBy(!1))}goBack(){return D(()=>this.travel(-1,!1))}goForward(){return D(()=>this.travel(1,!1))}openNew(e){return D(()=>this.openNewBy(e??this.activeGroup,!1))}async copyTitle(e){let t=this.element.ownerDocument.defaultView?.navigator.clipboard;if(!t)return!1;try{return await t.writeText(D(()=>e.title)),!0}catch{return!1}}findDocument(e){return D(()=>this.documents.find(t=>t.id===e&&!t.original)??this.documents.find(t=>t.id===e)??this.hiddenDocuments.find(t=>t.id===e)??null)}contentOf(e){return this.parts.tabs.get(e)?.contentComponent??null}split(e,t,n){return D(()=>this.splitGroup(e,t,n??null,!1))}moveGroup(e,t,n){return D(()=>this.moveGroupBy(e,t,n,!1))}closeGroup(e){return D(()=>this.closeGroupBy(e,!1))}focusGroup(e){return D(()=>{let t=typeof e==`number`?this.groups[e]:e;return!t||!this.groups.includes(t)?!1:(this.useGroup(t,!1),t.restoreFocus()?!0:(t.activeTab?.header.focus(),!!t.activeTab))})}lock(e){return D(()=>this.lockBy(e,!0,!1))}unlock(e){return D(()=>this.lockBy(e,!1,!1))}maximizeGroup(e){return D(()=>this.maximizeBy(e,!1))}restoreGroups(){return D(()=>this.restoreBy(!1))}evenSizes(){return D(()=>this.evenSizesBy(null,!1))}resizeGroup(e,t){return D(()=>{let n=e.parentSplit;if(!n||!this.layoutChanging(`resize`,e,!1))return!1;let r=n.children.indexOf(e),i=r+1<n.children.length;if(typeof t==`string`&&t.trim().endsWith(`%`)){let e=i?r+1:r-1,a=n.sizes[r]+n.sizes[e],o=Math.min(Math.max(parseFloat(t)/100,0),a);n.sizes[r]=o,n.sizes[e]=a-o,n.render()}else{let e=n.room(),a=Number(t)-n.sizes[r]*e;if(!e||!n.resizeBy(i?r:r-1,i?a:-a))return!1}return this.layoutChanged(`resize`,e,!1),!0})}showMoveTo(e){return D(()=>{let t=this.parts.moveKeys;if(!t||t.isOn||this.dragging||!this.isEnabled)return!1;let n=null;e instanceof P?this.groups.includes(e)&&this.allowDragGroups&&(n={document:null,group:e,manager:this,copy:!1}):e.manager===this&&e.group&&this.mayDrag(e)&&(n={document:e,group:e.group,manager:this,copy:!1});let r=n?.document?this.parts.tabs.get(n.document):null;return!!n&&t.start(n,r?.header??null)})}cancelDrag(){return D(()=>{let e=this.parts;return e.moveKeys?.isOn?(e.moveKeys.end(!1),!0):e.drag?.subject?(e.drag.cancel(),!0):!1})}addDropTarget(e,t=0){let n=this.parts.targets;return n.splice(Math.max(0,Math.min(t,n.length-1)),0,e),()=>{let t=n.indexOf(e);t>=0&&e!==this.parts.layoutTarget&&e!==this.parts.dockTarget&&n.splice(t,1)}}float(e,t){return D(()=>{let n=e instanceof B?e:null,r=n?n.group:e;return!r||n&&n.manager!==this?null:this.floatBy(n,r,t??null,!1)})}dock(e,t,n){return D(()=>this.dockBy(e,t??null,n??null,!1))}autoHide(e,t=!0){return D(()=>{let n=e instanceof W?e:e.dockArea;return!!n&&n.manager===this&&this.autoHideBy(n,t,!1)})}showAutoHidden(e){return D(()=>this.parts.presenter.kind===`desktop`?this.slideOut(e,!1,!1):this.parts.presenter.showTool(e))}hideAutoHidden(){return D(()=>this.slideBack(!1))}moveWindow(e,t,n){return D(()=>{if(!this.parts.windows.includes(e)||!this.windowChanging(`moveWindow`,e,!1))return!1;let r=e.rect;return e.place({...r,x:t,y:n}),this.keepWindowInView(e),this.windowChanged(`moveWindow`,e,!1),!0})}resizeWindow(e,t,n){return D(()=>{if(!this.parts.windows.includes(e)||!this.windowChanging(`resizeWindow`,e,!1))return!1;let r=e.minSize();return e.place({...e.rect,width:Math.max(r.w,t),height:Math.max(r.h,n)}),this.keepWindowInView(e),this.windowChanged(`resizeWindow`,e,!1),!0})}maximizeWindow(e){return D(()=>this.maximizeWindowBy(e,!0,!1))}restoreWindow(e){return D(()=>this.maximizeWindowBy(e,!1,!1))}closeWindow(e){return D(()=>e instanceof K?this.closeBrowserBy(e,!1):this.closeWindowBy(e,!1))}focusWindow(e){return D(()=>{let t=this.parts;if(e instanceof K){if(!t.browsers.includes(e))return!1;cn(e.window)}else{if(!t.windows.includes(e))return!1;e.bringToFront()}let n=t.recentGroups.find(t=>t.window===e||t.browserWindow===e)??this.hostGroups(e)[0];return!!n&&this.focusGroup(n)})}resizeDockArea(e,t,n=!1){return D(()=>!this.parts.areas.has(e.side)||this.parts.areas.get(e.side)!==e||!this.layoutChanging(`resizeArea`,null,n,null,e)?!1:(e.setSize(t),this.renderDock(),this.layoutChanged(`resizeArea`,null,n,null,e),!0))}focusPart(e=1){return D(()=>this.focusPartBy(e))}moveToNewWindow(e,t={}){return D(()=>{let n=this.newWindowBy(e,t,!1);return n instanceof K?n:null})}moveToMainWindow(e){return D(()=>this.mainWindowBy(e,!1))}reopenWindows(){return D(()=>this.reopenWindowsBy())}showOpenList(e){return D(()=>{let t=e??this.activeGroup;if(!t)return!1;let n=this.openListScope===`all`?this.documents:t.documents,r=this.parts.openList??=new je(this,`open`),i=t.moreButton??t.listElement.parentElement,a=t.isCompact,o=[{text:this.textOf(`tabDocsCloseAll`),beginGroup:a,click:()=>void this.closeMany([...t.documents],void 0,!0)},{text:this.textOf(`tabDocsCloseSaved`),click:()=>void this.closeMany(t.documents.filter(e=>!e.dirty),void 0,!0)},{text:this.textOf(t.locked?`tabDocsUnlock`:`tabDocsLock`),beginGroup:!0,click:()=>this.lockBy(t,!t.locked,!0)}],s=this.hiddenItems();if(s.length&&this.menuItems.showHidden!==!1&&o.push({text:this.textOf(`tabDocsShowHidden`),beginGroup:!0,items:s,data:`showHidden`}),a){let e=t.foldedItems();t.window&&this.menuItems.dock!==!1&&e.push({text:this.textOf(`tabDocsDock`),beginGroup:e.length>0,click:()=>this.runCommand(`dock`,t,null)}),o.unshift(...e),e.length||(o[0].beginGroup=!1)}return r.open(i,n,Math.max(0,n.indexOf(t.activeDocument)),o,null,{commandsFirst:a,list:!a||this.openList,active:t.activeDocument}),!0})}showRecentList(e=1,t=null){return D(()=>{let n=this.activeGroup;if(!n)return!1;let r=this.recentDocuments,i=this.recentListScope===`all`?[...r,...this.documents.filter(e=>!r.includes(e))]:n.recentDocuments;if(!i.length)return!1;let a=this.parts.recentList??=new je(this,`recent`),o=i.length<2?0:e===1?1:i.length-1;return a.open(n.listElement.parentElement,i,o,[],t,{active:n.activeDocument}),!0})}saveLayout(){return D(()=>{let e=this.groups,t={version:3,root:this.writeNode(this.parts.root),activeGroup:Math.max(0,e.indexOf(this.activeGroup)),maximizedGroup:this.parts.maximized?e.indexOf(this.parts.maximized):null},n=this.parts.hiddenDocs;n.length&&(t.hidden=n.map(t=>{let n={document:this.writeDocument(t.document)},r=t.group?e.indexOf(t.group):-1;return r>=0&&(n.group=r,n.index=t.index),t.side&&(n.side=t.side,t.size!==null&&(n.size=t.size),t.autoHide&&(n.autoHide=!0)),t.rect&&(n.rect={...t.rect}),n}));let r=this.orderedAreas().filter(e=>e.root);r.length&&(t.areas=r.map(e=>{let t={side:e.side,size:e.size,root:this.writeNode(e.root)};e.autoHidden&&(t.autoHide=!0);let n=e.savedBar();return n&&(t.bar=n),t}));let i=this.floatingWindows.filter(e=>e.root);i.length&&(t.windows=i.map(t=>{let n={rect:{...t.rect},root:this.writeNode(t.root)};t.isMaximized&&(n.maximized=!0);let r=t.savedBar();r&&(n.bar=r);let i=t.lastDock.group?e.indexOf(t.lastDock.group):-1;return(t.lastDock.side||i>=0)&&(n.dock={side:t.lastDock.side,group:i>=0?i:null}),n}));let a=this.browserWindows.filter(e=>e.root);return a.length&&(t.browserWindows=a.map(t=>{let n={rect:t.rect,root:this.writeNode(t.root)},r=t.home?e.indexOf(t.home):-1;return r>=0&&(n.home=r),n})),t})}loadLayout(e,t){return D(()=>{if(!e?.root||!this.layoutChanging(`load`,null,!1))return!1;let n=this.parts;n.maximized&&this.unmaximize(),this.stopSlide();for(let[e,t]of n.tabs)e.placeIn(null,null),t.dispose();n.tabs.clear(),n.hiddenDocs=[];let r=n.root,i=[...this.groups],a=[...n.areas.values()],o=[...n.windows],s=[...n.browsers];n.areas.clear(),n.order=[],n.windows=[],n.browsers=[],n.reopen=[];let c=new Map,l=this.readNode(e.root,t,c);r&&N(this.element,l.element,r.element),this.setRoot(l),this.disposeSplits(r);for(let r of e.areas??[]){if(!r?.root||!J.includes(r.side)||n.areas.has(r.side))continue;let e=this.createArea(r.side,r.size??this.dockAreaSize[r.side]);e.restoreBar(r.bar),this.setHostRoot(e,this.readNode(r.root,t,c)),r.autoHide&&e.markFolded(!0)}let u=[];for(let n of e.windows??[]){if(!n?.root)continue;let e=this.createWindow(n.rect??this.floatRect(null,null));e.restoreBar(n.bar),this.setHostRoot(e,this.readNode(n.root,t,c)),n.maximized&&e.markMaximized(!0),u.push([e,n])}let d=this.restoreWindows,f=[];for(let n of e.browserWindows??[]){if(!n?.root)continue;let e=this.readNode(n.root,t,c);if(d===`main`){this.insertAtHostEdge(null,e,`right`);continue}let r=this.createWindow(this.viewportRect(n.rect));this.setHostRoot(r,e),f.push([r,n])}for(let e of a)this.disposeSplits(e.root),e.strip?.dispose(),e.dispose();for(let e of o)this.disposeSplits(e.root),e.dispose();for(let e of s)this.disposeBrowserWindow(e);for(let e of i)this.controls.remove(e);n.recentGroups=[],n.history=[],n.at=-1,n.closed=[],this.renderHistory(),this.setProperty(`activeGroup`,null),this.renderTree(),this.renderLists();let p=this.groups;for(let[e,t]of u){let n=t.dock?.side;e.lastDock={side:n&&J.includes(n)?n:null,group:p[t.dock?.group??-1]??null}}for(let[e,t]of f)e.lastDock={side:null,group:p[t.home??-1]??null},d===`reopen`&&t.rect&&n.reopen.push({window:e,rect:t.rect});for(let n of e.hidden??[])this.readHidden(n,p,t,c);this.renderHidden(),this.useGroup(p[e.activeGroup]??p[0],!1);let m=e.maximizedGroup===null?void 0:p[e.maximizedGroup];return m&&this.maximizeBy(m,!1,!0),this.layoutChanged(`load`,null,!1),n.reopen.length&&this.reopenWindowsBy(),!0})}focus(){let e=this.activeGroup;return!!e&&this.focusGroup(e)}get focusElement(){return(this[Y]?.recentGroups[0])?.activeTab?.header??this.element}holdTouch(e){this.parts.drag?.holdTouch(e)}textOf(e,t){let n=_(this.texts,e)??l.strings[e];return u(n,l.locale,t)}closeKeyHint(){let e=this.keys.closeFocusedTab[0];return e?e.replace(/\bCtrl\b/gi,`Control`):null}showsDescription(e){let t=this.showDescription;if(t!==`duplicates`)return t===`always`;let n=e.title,r=e.original??e;return this.documents.some(e=>(e.original??e)!==r&&e.title===n)}makeContent(e){let t=e.content;return typeof t==`function`?t(e)??null:t||(this.factory?.(e)??null)}canRemake(e){return typeof e.content==`function`||!e.content&&!!this.factory}tabChanged(e){let t=e.group;t?.activeTab&&t.reveal(t.activeTab),t?.queueOverflow(),this[Y]?.presenter.renderSoon()}pinChanged(e){let t=e.group;t&&(t.arrange(),t.reveal(e))}keepByChange(e){queueMicrotask(()=>D(()=>e.preview&&this.keepBy(e,!1)))}groupFocused(e){D(()=>this.useGroup(e,!0))}activateByUser(e){D(()=>this.activateDocument(e,!1,!0)&&this.parts.presenter.reveal(e))}activateFromList(e){e.manager===this&&this.activateDocument(e,!0,!0)&&this.parts.presenter.reveal(e)}closeByUser(e){return D(()=>this.closeDocument(e,!0))}unpinByUser(e){D(()=>this.pinBy(e,!1,!0))}unlockByUser(e){D(()=>this.lockBy(e,!1,!0))}splitByUser(e,t){D(()=>{let n=e.activeDocument,r=n&&(e.documents.length>1||this.copiesOnSplit(n))?n:null,i=this.splitGroup(e,t,r,!0);i&&this.focusGroup(i)})}toggleMaximizeByUser(e){D(()=>this.parts.maximized===e?this.restoreBy(!0):this.maximizeBy(e,!0))}tabDoubleClicked(e,t){D(()=>{t.preview?this.keepBy(t,!0):this.maximizeOnDoubleClick&&this.toggleMaximizeByUser(e)})}marksIn(e){return this.parts.browsers.find(t=>t.element.ownerDocument===e)?.marks??this.parts.marks}hostElementIn(e){return this.parts.browsers.find(t=>t.element.ownerDocument===e)?.element??this.element}hostElements(){return[this.element,...this.parts.browsers.map(e=>e.element)]}owns(e){return!!e&&(this.element.contains(e)||this.parts.browsers.some(t=>t.element.contains(e)))}get dragSpace(){return this.parts.space??this.element.ownerDocument}set dragSpace(e){this.parts.space=e}spaces(){let e=this.parts;return[...e.browsers.map(e=>({doc:e.element.ownerDocument,at:e.focusedAt})),{doc:this.element.ownerDocument,at:e.mainFocusedAt}].sort((e,t)=>t.at-e.at)}windowTitleOf(e){let t=e.activeDocument,n=this.newWindowTitle;if(typeof n==`function`)return n(t,e);let r=t?.title??``,i=this.element.ownerDocument.title;return d(n,{title:r,page:i}).replace(/^\s*[–—-]\s+|\s+[–—-]\s*$/g,``).trim()}mayNewWindow(e){return D(()=>{let t=this.element.ownerDocument.defaultView;if(this.parts.presenter.kind===`phone`||!this.isEnabled||!this.openWindow&&typeof t?.open!=`function`)return!1;let n=e.group.browserWindow;if(n&&!e.window&&this.hostGroups(n).length===1&&(!e.document||e.group.documents.length===1))return!1;let r=e.window?e.window.documents:e.document?[e.document]:e.group.documents;return r.length?r.every(e=>e.allowNewWindow??this.allowNewWindow):this.allowNewWindow})}browserWindowClosed(e){D(()=>{let t=this.parts;if(!t.browsers.includes(e))return;let n={window:e,kind:`browser`,then:this.newWindowCloseAction,byUser:!0,cancel:!1,source:this};t.windowClosing.fire(n);let r=[...e.documents];if(this.mainWindowBy(e,!0,{force:!0,reason:`closed`}),this.say(`tabDocsNewWindowClosed`),n.then===`close`)for(let e of r)this.closeDocument(e,!0)})}stripDoubleClicked(e){D(()=>{let t=e.window;t&&this.dockOnDoubleClick?this.dockBy(t,null,null,!0):this.openNewBy(e,!0)})}contextMenuOpening(e){this.parts.menuOpening.fire(e)}get dropMarks(){return this.parts.marks}get layoutTarget(){return this.parts.layoutTarget}get dockDropTarget(){return this.parts.dockTarget}get rootItem(){return this.parts.root}dragPeers(){let e=D(()=>this.dragGroup);if(!e)return[this];let t=this.element.ownerDocument,n=[...on].filter(n=>n!==this&&!n.isDisposed&&n.element.isConnected&&n.element.ownerDocument===t&&D(()=>n.dragGroup)===e);return[this,...n]}foreignAt(e,t){let n=this.element.ownerDocument,r=this.dragPeers();return[...on].some(i=>!r.includes(i)&&!i.isDisposed&&i.element.isConnected&&i.element.ownerDocument===n&&(Q(i.element.getBoundingClientRect(),e,t)||i.parts.windows.some(n=>Q(n.element.getBoundingClientRect(),e,t))))}mayDrag(e){return D(()=>this.isEnabled&&(e.allowDrag??this.allowDrag)&&this.parts.presenter.kind!==`phone`)}get mainRoot(){return this.parts.root}recentGroupsNow(){return this.parts.recentGroups}guestHeaders(e){return this[Y]?.presenter.guestsOf(e)??null}groupHasGuests(e){return!!this[Y]?.presenter.hasGuests(e)}groupFolded(e){return!!this[Y]?.presenter.isFolded(e)}tabOfHeader(e){return this.tabAt(e)}get menuPresentationNow(){let e=this.menuPresentation;if(e)return e;let t=this.currentPresentation;return t===`phone`?`sheet`:t===`tablet`?`auto`:`menu`}openDocumentSheet(e,t,n,r){D(()=>this.parts.menus?.openSheet(e,t,n,r))}closeOrHideFromList(e){return D(()=>this.closeOrHide(e,!0))}mayMoveFromList(e){return D(()=>this.isEnabled&&(e.allowDrag??this.allowDrag))}moveFromList(e,t,n){return D(()=>this.moveDocument(e,t,n,!0))}presentationSettingChanged(){this[Y]?.presenter.renderSoon()}toolStripShown(e){return this.tabletDockMode,e.tabletDockMode,D(()=>this.parts.presenter.dockModeFor(e,`tablet`))!==`hidden`}listShown(e){this.setProperty(`documentListOpen`,e)}mayCopyDocument(e){return!!e&&D(()=>this.mayCopy(e))}insertIndexFor(e){return D(()=>this.insertIndex(e))}dragStarting(e){this.parts.dragStarting.fire(e)}dragStarted(e){this.setProperty(`dragging`,e)}dragOver(e){this.parts.dragOver.fire(e)}dropping(e){this.parts.dropping.fire(e)}dropped(e,t,n){let r=e.manager??this,i=r.parts.dropResult;r.parts.dropResult=null;let a=i?i.document:t.document,o=i?.group??e.group,s=a&&o?o.documents.indexOf(a):e.index;this.parts.dropped.fire({...e,group:o,index:s,document:a,from:t.group,copy:t.copy,byKeyboard:n,source:this})}dragEnded(e){this.setProperty(`dragging`,null),this.parts.dragEnded.fire(e)}announceCanceled(){this.say(`tabDocsDragCanceled`)}activateFromDrag(e){D(()=>this.activateDocument(e,!1,!0))}useGroupFromDrag(e){D(()=>this.groups.includes(e)&&this.useGroup(e,!0))}openContextMenuAt(e,t,n){this.parts.menus?.menu.open({x:t,y:n},e)}neighbourOf(e,t){let n=t===`left`||t===`right`?`horizontal`:`vertical`,r=t===`right`||t===`down`?1:-1;for(let i=e;i.parentSplit;i=i.parentSplit){let e=i.parentSplit;if(e.orientation!==n)continue;let a=e.children[e.children.indexOf(i)+r];if(a)return this.nearestGroup(a,t)}return null}edgeGroup(e){let t=this.parts.root;return t?this.nearestGroup(t,{left:`right`,right:`left`,up:`down`,down:`up`}[e]):null}dropAt(e,t){return D(()=>{let n=this.parts;if(n.dropResult=null,e.target===`float`)return this.dropFloat(e,t);if(e.target===`new-window`||e.target===`main-window`)return this.dropToWindow(e,t);if(e.target===`dock-area`){let r=t.window??t.document??t.group,i=!!e.dockSide&&t.manager===this&&this.dockBy(r,e.dockSide,null,!0);return i&&(n.dropResult={group:this.activeGroup,document:t.document}),i}let r=e.group&&this.groups.includes(e.group)?e.group:null,i=e.side,a=e.target===`dock-guide`?`group`:e.target;if(t.window)return this.dropWindow(t.window,r,a===`strip`?e.index:void 0,a===`strip`?`center`:i,a===`edge`);if(a===`strip`&&r)return this.dropInto(t,r,e.index,!0);if(a===`group`&&r&&i===`center`)return this.dropInto(t,r,void 0,!1);let o=a===`edge`;if(!i||i===`center`||!o&&!(a===`group`&&r))return!1;let s=o&&e.browserWindow&&n.browsers.includes(e.browserWindow)?e.browserWindow:null;return this.dropBeside(t,o?null:r,i,s)})}dropToWindow(e,t){let n=this.parts;if(t.manager!==this||t.window)return!1;let r=t.document??t.group;if(e.target===`main-window`){let e=this.mainWindowBy(r,!0);return e&&(n.dropResult={group:this.activeGroup,document:t.document}),e}let i=this.newWindowBy(r,{rect:e.rect??void 0},!0);return i&&(n.dropResult={group:this.activeGroup,document:t.document}),!!i}dropFloat(e,t){let n=this.parts;if(t.window)return this.windowChanged(`moveWindow`,t.window,!0),n.dropResult={group:t.group,document:null},!0;if(t.manager!==this)return!1;let r=this.floatBy(t.document,t.group,e.rect??null,!0);return r&&(n.dropResult={group:this.hostGroups(r)[0]??null,document:t.document}),!!r}dropWindow(e,t,n,r,i){let a=this.parts;if(!a.windows.includes(e)||!e.root||!t&&!i||!r||i&&r===`center`||t&&t.window===e)return!1;let o={document:null,group:null,window:e,side:null,size:null,byUser:!0,cancel:!1,source:this};if(a.docking.fire(o),o.cancel)return!1;let s=a.recentGroups.find(t=>t.window===e)?.activeDocument??null,c;a.windowGone=`docked`;try{if(r===`center`&&t){let r=n??t.tabs.length;for(let n of this.hostGroups(e))for(let e of[...n.documents])this.moveDocument(e,t,r,!0)&&(r=t.documents.indexOf(e)+1);s?.group===t&&this.activateDocument(s,!1,!0),c=t}else{let n=e.root;c=(s?.group&&s.group.window===e?s.group:null)??X(n)[0],this.restoreForChange(),this.takeOut(n),t?this.insertBeside(t,n,r):this.insertAtEdge(n,r),this.renderTree()}this.dropEmptyHosts(!0)}finally{a.windowGone=null}return this.useGroup(c,!0),a.dropResult={group:c,document:null},a.docked.fire({document:null,group:c,area:c.dockArea,side:c.dockArea?.side??null,byUser:!0,source:this}),this.layoutChanged(`dock`,c,!0,null,c.dockArea),this.say(`tabDocsDockedBack`,{title:this.textOf(`tabDocsGroup`,{n:this.groups.indexOf(c)+1}),n:this.groups.indexOf(c)+1}),!0}moveAcross(e,t,n,r){let i=this.parts,a=i.tabs.get(e),o=a?.group,s=t.manager;if(!a||!o||s===this||!s.groups.includes(t))return!1;let c=o.tabs.indexOf(a),l={document:e,from:o,fromIndex:c,to:t,toIndex:Math.max(0,Math.min(n??s.insertIndexFor(t),t.tabs.length)),byUser:r,cancel:!1,source:this};if(i.moving.fire(l),l.cancel)return!1;let u=s.receiving(e,s.groups.includes(l.to)?l.to:t,l.toIndex,r);if(!u)return!1;let d=T(a.header),f=!!d&&(a.header.contains(d)||a.panel.element.contains(d));this.restoreForChange();let p=o.activeTab===a,m=p?this.nextAfterClose(o,a):null;return o.removeTab(a),i.tabs.delete(e),this.forget(e),p&&(o.showTab(m),m&&this.fireActivated(m.document,e,o,r)),s.receive(a,u,f),i.moved.fire({document:e,from:o,fromIndex:c,to:u.group,toIndex:u.group.tabs.indexOf(a),byUser:r,source:this}),this.closeIfEmpty(o,r),!0}receiving(e,t,n,r){let i={document:e,group:t,index:n,active:!0,byUser:r,cancel:!1,source:this};return this.parts.opening.fire(i),i.cancel?null:(this.groups.includes(i.group)||(i.group=t),i)}receive(e,t,n){let r=e.document,i=t.group;this.restoreForChange(),e.moveTo(this),this.parts.tabs.set(r,e),i.addTab(e,t.index),r.placeIn(this,i),this.parts.opened.fire({document:r,group:i,index:i.tabs.indexOf(e),byUser:t.byUser,source:this}),t.active||!i.activeTab?this.activateDocument(r,!1,t.byUser):e.show(!1),r.preview&&this.keepBy(r,t.byUser),this.say(`tabDocsMoved`,{title:r.title,n:this.groups.indexOf(i)+1}),n&&e.header.focus()}runCommand(e,t,n){D(()=>{let r=n;switch(e){case`close`:r&&this.closeDocument(r,!0);break;case`hide`:r&&this.hideBy(r,!0);break;case`closeOthers`:r&&this.closeMany(t.documents.filter(e=>e!==r),void 0,!0);break;case`closeRight`:case`closeLeft`:r&&this.closeMany(this.sideOf(r,e===`closeRight`?1:-1),void 0,!0);break;case`closeSaved`:this.closeMany(t.documents.filter(e=>!e.dirty),void 0,!0);break;case`closeAll`:this.closeMany([...t.documents],void 0,!0);break;case`keepOpen`:r&&this.keepBy(r,!0);break;case`pin`:case`unpin`:r&&this.pinBy(r,e===`pin`,!0);break;case`splitUp`:case`splitDown`:case`splitLeft`:case`splitRight`:{let n=e.slice(5).toLowerCase(),i=r?this.splitGroup(t,n,r,!0):null;r?i&&this.focusGroup(i):this.splitByUser(t,n);break}case`moveNext`:case`movePrevious`:r&&this.moveToGroupBy(r,e===`moveNext`?`next`:`previous`,!0);break;case`moveTo`:r&&this.showMoveTo(r);break;case`moveGroupTo`:this.showMoveTo(t);break;case`copyTitle`:r&&this.copyTitle(r);break;case`newDocument`:this.openNewBy(t,!0);break;case`reopenClosed`:this.reopenBy(!0);break;case`lock`:case`unlock`:this.lockBy(t,e===`lock`,!0);break;case`float`:this.floatBy(r,t,null,!0);break;case`dock`:this.dockBy(r??t.window??t,null,null,!0);break;case`dockLeft`:case`dockRight`:case`dockTop`:case`dockBottom`:this.dockBy(r??t,e.slice(4).toLowerCase(),null,!0);break;case`autoHide`:this.toggleAutoHideByUser(t);break;case`maximizeWindow`:this.toggleWindowMaximizeByUser(t);break;case`closeWindow`:this.closeWindowByUser(t);break;case`newWindow`:this.newWindowBy(r??t.window??t,{},!0);break;case`mainWindow`:this.mainWindowBy(r??t,!0)}})}evenSizesBy(e,t){if(!this.layoutChanging(`evenSizes`,null,t))return!1;let n=t=>{t instanceof I&&(t.even(),t.render(),e||t.children.forEach(n))};return n(e??this.parts.root),this.layoutChanged(`evenSizes`,null,t),!0}beginResize(e){return e instanceof W?this.layoutChanging(`resizeArea`,null,!0,null,e):this.layoutChanging(`resize`,null,!0)}endResize(e,t){e&&(t instanceof W?this.layoutChanged(`resizeArea`,null,!0,null,t):this.layoutChanged(`resize`,null,!0))}openDocument(e,t,n){this.ensureRoot();let r=e instanceof B?e:new B(e),i=t.group&&this.groups.includes(t.group)?t.group:null;if(r.manager===this&&r.isHidden)return this.showBy(r,{group:i??void 0,index:t.index,active:t.active,focus:t.focus},n)?r:null;if(r.manager===this){let e=i??this.targetGroup(),a=r.original??r,o=e.documents.find(e=>(e.original??e)===a),s=!o&&e!==r.group&&this.mayCopy(r)?r.makeCopy():null;if(!s){let e=o??r;return this.activateDocument(e,!!t.focus,n),t.preview===!1&&e.preview&&this.keepBy(e,n),e}r=s}else if(r.isOpen)return null;let a=i??this.targetGroup();!i&&a.locked&&this.groups.length>1&&(a=this.splitGroup(a,`right`,null,n)??a);let o=(t.preview??r.preview)&&this.previewTabs;r.preview!==o&&(r.preview=o),t.pinned!==void 0&&(r.pinned=t.pinned);let s=o?a.tabs.find(e=>e.document.preview):void 0,c={document:r,group:a,index:t.index??(s?a.tabs.indexOf(s):this.insertIndex(a)),active:t.active??!0,byUser:n,cancel:!1,source:this};if(this.parts.opening.fire(c),c.cancel)return null;a=this.groups.includes(c.group)?c.group:a;let l=this.insertTab(r,a,c.index);this.parts.opened.fire({document:r,group:a,index:a.tabs.indexOf(l),byUser:n,source:this}),this.say(`tabDocsOpened`,{title:r.title}),(c.active||!a.activeTab)&&this.activateDocument(r,!!t.focus,n);let u=o?a.tabs.find(e=>e!==l&&e.document.preview):void 0;return u&&this.replacePreview(u.document,n),r}replacePreview(e,t){let n=this.parts.tabs.get(e),r=n?.group;if(!n||!r)return;let i={document:e,group:r,index:r.tabs.indexOf(n),byUser:t,lastCopy:this.isLastCopy(e),cancel:!1,source:this};this.parts.closing.fire(i),i.cancel||i.promise?this.keepBy(e,t):this.finishClose(e,t)}insertTab(e,t,n){let r=new Me(e,this);return this.parts.tabs.set(e,r),t.addTab(r,n),e.placeIn(this,t),r.prepare(),r}closeDocument(e,t){let n=this.parts.tabs.get(e),r=n?.group;if(!n||!r||t&&(!e.closable||!this.isEnabled))return Promise.resolve(!1);let i={document:e,group:r,index:r.tabs.indexOf(n),byUser:t,lastCopy:this.isLastCopy(e),cancel:!1,source:this};return this.parts.closing.fire(i),i.cancel?Promise.resolve(!1):i.promise?i.promise.then(n=>!!n&&D(()=>this.finishClose(e,t)),()=>!1):Promise.resolve(this.finishClose(e,t))}async closeMany(e,t,n){let r=D(()=>!(t??!this.keepPinned)),i=!0;for(let t of e)r&&D(()=>t.pinned)||await D(()=>this.closeDocument(t,n))||(i=!1);return i}sideOf(e,t){let n=e.group?.documents??[],r=n.indexOf(e);return r<0?[]:t===1?n.slice(r+1):n.slice(0,r)}finishClose(e,t){let n=this.parts,r=n.tabs.get(e),i=r?.group;if(!r||!i)return!1;let a=i.tabs.indexOf(r),o=T(r.header),s=!!o&&r.header.contains(o),c=s||!!o&&r.panel.element.contains(o),l=i.activeTab===r,u=l?this.nextAfterClose(i,r):null;i.removeTab(r),n.tabs.delete(e),e.placeIn(null,null),r.dispose(),this.remember(e,i,a),l&&i.showTab(u),n.closed_.fire({document:e,group:i,index:a,byUser:t,source:this}),l&&u&&this.fireActivated(u.document,e,i,t),this.say(`tabDocsClosed`,{title:e.title});let d=!i.tabs.length&&this.removable(i);if(d&&(this.removeGroup(i),this.layoutChanged(`closeGroup`,i,t)),c){let e=d?this.activeGroup:i,t=e?.activeTab;t&&s&&!d?t.header.focus():t?t.focusContent():e?.restoreFocus()}return!0}closeOrHide(e,t){return t&&!e.closable?Promise.resolve(this.hideBy(e,!0)):this.closeDocument(e,t)}mayHide(e){return this.isEnabled&&(e.allowHide??this.allowHide)}mayCloseOrHide(e){return this.isEnabled&&(e.closable||(e.allowHide??this.allowHide))}closeActiveByUser(e){D(()=>{let t=e.activeDocument;t&&(t.closable?this.closeDocument(t,!0):this.hideBy(t,!0))})}hiddenItems(){return this.parts.hiddenDocs.map(({document:e})=>({text:()=>e.title,icon:()=>e.icon,data:e,click:()=>D(()=>this.showBy(e,{focus:!0},!0))}))}hideBy(e,t){let n=this.parts,r=n.tabs.get(e),i=r?.group;if(!r||!i||!this.mayHide(e))return!1;let a={document:e,group:i,byUser:t,cancel:!1,source:this};if(n.hiding.fire(a),a.cancel||r.group!==i)return!1;let o=i.dockArea,s=i.window,c=i.tabs.indexOf(r),l=T(r.header),u=!!l&&r.header.contains(l),d=u||!!l&&r.panel.element.contains(l),f=i.activeTab===r,p=f?this.nextAfterClose(i,r):null;i.removeTab(r),r.show(!1),this.stashPanel(r),e.markHidden(this),n.hiddenDocs.push({document:e,tab:r,group:i,index:c,side:o?.side??null,size:o?.size??null,autoHide:!!o?.autoHidden,rect:s?{...s.rect}:null}),this.forget(e),this.renderHidden(),f&&i.showTab(p),n.hidden_.fire({document:e,group:i,byUser:t,source:this}),f&&p&&this.fireActivated(p.document,e,i,t),this.say(`tabDocsHidden`,{title:e.title});let m=!i.tabs.length&&this.removable(i);m&&(this.removeGroup(i),this.layoutChanged(`closeGroup`,i,t));let h=s&&n.windows.includes(s)?s:null,g=o&&n.areas.get(o.side)===o?o:null;if(this.layoutChanged(`hide`,m?null:i,t,h,g),d){let e=m?this.activeGroup:i,t=e?.activeTab;t&&u&&!m?t.header.focus():t?t.focusContent():e?.restoreFocus()}return!0}showBy(e,t,n){let r=this.parts,i=r.hiddenDocs.find(t=>t.document===e);if(!i||n&&!this.isEnabled)return!1;let a=this.showPlace(i,t);if(!a)return!1;let o={document:e,group:a.group,side:a.side,index:a.index,byUser:n,cancel:!1,source:this};if(r.showing.fire(o),o.cancel||!r.hiddenDocs.includes(i))return!1;this.restoreForChange();let s=(o.group&&this.groups.includes(o.group)?o.group:null)??this.makeHome(a),c=i.tab;r.hiddenDocs.splice(r.hiddenDocs.indexOf(i),1),s.addTab(c,Math.max(0,Math.min(o.index,s.tabs.length))),e.placeIn(this,s),this.renderHidden();let l=t.active??!0;return l&&s.dockArea?.autoHidden?this.slideOut(e,n,!1):(l||!s.activeTab)&&this.activateDocument(e,!!t.focus,n),t.focus&&s.dockArea?.autoHidden&&c.focusContent(!0),r.shown.fire({document:e,group:s,index:s.tabs.indexOf(c),byUser:n,source:this}),this.layoutChanged(`show`,s,n,s.window,s.dockArea),this.say(`tabDocsShown`,{title:e.title}),!0}showPlace(e,t){let n=this.parts,r=(e,n)=>({group:e,side:e.dockArea?.side??null,index:t.index??n,size:null,autoHide:!1,rect:null}),i=(e,t,i)=>{let a=n.areas.get(e),o=a?n.recentGroups.find(e=>e.dockArea===a)??this.hostGroups(a)[0]:null;return o?r(o,this.insertIndex(o)):{group:null,side:e,index:0,size:t,autoHide:i,rect:null}};if(t.group&&this.groups.includes(t.group))return r(t.group,this.insertIndex(t.group));if(t.side)return J.includes(t.side)&&this.mayDock(e.document,t.side)?i(t.side,null,!1):null;if(e.group&&this.groups.includes(e.group))return r(e.group,e.index);if(e.side)return i(e.side,e.size,e.autoHide);if(e.rect)return{group:null,side:null,index:0,size:null,autoHide:!1,rect:e.rect};let a=this.targetGroupOutside()??this.targetGroup();return r(a,this.insertIndex(a))}makeHome(e){if(e.group&&this.groups.includes(e.group))return e.group;if(!e.side&&!e.rect)return this.targetGroupOutside()??this.targetGroup();let t=e.side?this.parts.areas.get(e.side)??this.createArea(e.side,e.size??this.dockAreaSize[e.side]):this.createWindow({...e.rect}),n=this.hostGroups(t)[0];if(n)return n;let r=this.createGroup();return this.setHostRoot(t,r),this.renderTree(),t instanceof W&&e.autoHide&&t.markFolded(!0),r}stashPanel(e){let t=this.parts;if(!t.stash){let e=t.stash=new o(`div`);e.element.className=`mx-tabdocs__stash`,e.element.hidden=!0,this.controls.add(e)}let n=t.stash;e.panel.parent?Pe(e.panel.element,()=>v.transport(e.panel,n)):n.controls.add(e.panel)}renderHidden(){this.setProperty(`hiddenDocuments`,this.parts.hiddenDocs.map(e=>e.document))}forget(e){let t=this.parts,n=t.history.slice(0,t.at+1).filter(t=>t!==e).length;t.history=t.history.filter(t=>t!==e),t.at=Math.min(n-1,t.history.length-1),this.setProperty(`recentDocuments`,this.recentDocuments.filter(t=>t!==e)),this.renderHistory()}remember(e,t,n){let r=this.parts;this.forget(e);let i=this.closedHistorySize;i>0&&(this.canRemake(e)||e.original)&&(e.preview&&=!1,r.closed=[{document:e,group:t,index:n},...r.closed.filter(t=>t.document!==e)].slice(0,i)),this.renderHistory()}reopenBy(e){let t=this.parts;for(;t.closed.length;){let{document:n,group:r,index:i}=t.closed.shift();if(this.renderHistory(),n.isOpen)continue;let a=this.groups.includes(r)&&!r.locked?r:void 0,o=this.openDocument(n,{group:a,index:a?i:void 0,focus:e},e);if(o)return o}return null}nextAfterClose(e,t){let n=e.tabs,r=n.indexOf(t),i=this.afterClose;return i===`left`?n[r-1]??n[r+1]??null:i===`right`?n[r+1]??n[r-1]??null:e.recentTabs.find(e=>e!==t)??null}activateDocument(e,t,n){let r=this.parts.tabs.get(e),i=r?.group;if(!r||!i)return!1;let a=this.activeDocument,o=i.activeTab;if(o!==r){let t={document:e,previous:o?.document??null,group:i,byUser:n,cancel:!1,source:this};if(this.parts.activating.fire(t),t.cancel)return!1;i.showTab(r)}return this.useGroup(i,n,!1),(o!==r||a!==e)&&this.fireActivated(e,o===r?a:o?.document??null,i,n),this.parts.presenter.render(),t&&r.focusContent(),!0}fireActivated(e,t,n,r){e&&e===this.activeDocument&&this.visited(e),this.parts.activated.fire({document:e,previous:t,group:n,byUser:r,source:this})}visited(e){let t=this.parts;if(this.setProperty(`recentDocuments`,[e,...this.recentDocuments.filter(t=>t!==e)]),t.travelling||t.history[t.at]===e)return;let n=this.historySize;t.history=[...t.history.slice(0,t.at+1),e].slice(-Math.max(n,1)),t.at=t.history.length-1,n||(t.history=[],t.at=-1),this.renderHistory()}travel(e,t){let n=this.parts,r=n.at+e,i=n.history[r];if(!i)return!1;n.travelling=!0;try{if(!this.activateDocument(i,t,t))return!1}finally{n.travelling=!1}return n.presenter.reveal(i),n.at=r,this.renderHistory(),!0}renderHistory(){let e=this.parts;this.setProperty(`canGoBack`,e.at>0),this.setProperty(`canGoForward`,e.at<e.history.length-1),this.setProperty(`closedDocuments`,e.closed.map(e=>e.document))}step(e,t,n,r){let i=e?.tabs??[];if(!e||i.length<2)return!1;let a=i[((e.activeTab?i.indexOf(e.activeTab):-1)+t+i.length)%i.length];return this.activateDocument(a.document,n,r)}moveDocument(e,t,n,r,i=!1){let a=this.parts,o=a.tabs.get(e),s=o?.group;if(!o||!s||!this.groups.includes(t))return!1;let c=s.tabs.indexOf(o),l=s===t?t.tabs.length-1:t.tabs.length,u=Math.max(0,Math.min(n??(s===t?c:this.insertIndex(t)),l));if(s===t&&u===c)return!0;let d={document:e,from:s,fromIndex:c,to:t,toIndex:u,byUser:r,cancel:!1,source:this};if(a.moving.fire(d),d.cancel&&!i)return!1;i&&(d.to=t);let f=T(o.header),p=!!f&&(o.header.contains(f)||o.panel.element.contains(f));if(s===t)t.moveTab(o,Math.max(0,Math.min(d.toIndex,l)));else{this.restoreForChange();let n=s.activeTab===o,i=n?this.nextAfterClose(s,o):null;s.removeTab(o),n&&s.showTab(i),t.addTab(o,d.toIndex),e.placeIn(this,t);let a=this.activeDocument;t.showTab(o),this.useGroup(t,r,!1),this.fireActivated(e,a,t,r),this.closeIfEmpty(s,r)}return a.moved.fire({document:e,from:s,fromIndex:c,to:t,toIndex:t.tabs.indexOf(o),byUser:r,source:this}),s!==t&&this.say(`tabDocsMoved`,{title:e.title,n:this.groups.indexOf(t)+1}),e.preview&&this.keepBy(e,r),p&&o.header.focus(),!0}moveToGroupBy(e,t,n){let r=e.group;if(!r||e.manager!==this)return!1;let i=this.groups,a=t===`next`||t===`previous`?i[i.indexOf(r)+(t===`next`?1:-1)]:this.neighbourOf(r,t);if(a){let t=this.moveDocument(e,a,void 0,n);return t&&n&&this.focusGroup(a),t}let o=t===`next`?`right`:t===`previous`?`left`:t,s=this.splitGroup(r,o,e,n,!1);return s&&n&&this.focusGroup(s),!!s}moveInGroupBy(e,t,n){let r=e.group;if(!r||e.manager!==this||!t)return!1;let i=r.documents,a=i.indexOf(e),o=i.filter(e=>e.pinned).length,[s,c]=e.pinned?[0,o-1]:[o,i.length-1],l=Math.max(s,Math.min(c,a+t));return l!==a&&this.moveDocument(e,r,l,n)}dropInto(e,t,n,r){let i=e.manager,a=e.document;if(!a){let r=i===this?this.mergeGroup(e.group,t,n,!0):this.takeGroup(e.group,t,n);return r&&(this.parts.dropResult={group:t,document:null}),r}let o=e.copy&&i.mayCopyDocument(a),s=r&&n!==void 0&&this.pinOnDrag?mn(t,a,n):null,c=a.original??a,l=t.documents.find(e=>(e.original??e)===c),u;return o?u=this.openDocument(i===this?a:a.makeCopy(),{group:t,index:n},!0):i===this?(s!==null&&a.pinned!==s&&this.pinBy(a,s,!0),u=this.moveDocument(a,t,n,!0)?a:null):u=i.moveAcross(a,t,n,!0)?a:null,u?(s!==null&&u.pinned!==s&&u.group===t&&(this.pinBy(u,s,!0),n!==void 0&&this.moveDocument(u,t,n,!0)),o&&!l&&this.say(`tabDocsCopied`,{title:u.title,n:this.groups.indexOf(t)+1}),this.parts.dropResult={group:u.group,document:u},!0):!1}dropBeside(e,t,n,r=null){let i=e.manager,a=e.document;if(i===this&&!a){let i=this.moveGroupBy(e.group,t,n,!0,r);return i&&(this.parts.dropResult={group:e.group,document:null}),i}let o=!!a&&e.copy&&i.mayCopyDocument(a);if(i===this&&a){let e=this.splitGroup(t,n,a,!0,o,r);if(!e)return!1;let i=e.documents[0]??null;return o&&i&&i!==a&&this.say(`tabDocsCopied`,{title:i.title,n:this.groups.indexOf(e)+1}),this.parts.dropResult={group:e,document:i},!0}let s=this.splitGroup(t,n,null,!0,void 0,r);if(!s)return!1;let c=null,l;return a?(c=o?this.openDocument(a.makeCopy(),{group:s},!0):i.moveAcross(a,s,0,!0)?a:null,l=!!c,o&&c&&this.say(`tabDocsCopied`,{title:c.title,n:this.groups.indexOf(s)+1})):l=this.takeGroup(e.group,s,void 0),l?(this.parts.dropResult={group:s,document:c},!0):(this.closeMovedGroup(s,!0),!1)}takeGroup(e,t,n){let r=e.manager,i=e.activeDocument,a=n??t.tabs.length,o=!1;for(let n of[...e.documents])r.moveAcross(n,t,a,!0)&&(o=!0,a=t.documents.indexOf(n)+1);return i?.group===t&&this.activateDocument(i,!1,!0),r.groups.includes(e)&&r.closeMovedGroup(e,!0),o}mergeGroup(e,t,n,r){if(e===t||!this.groups.includes(e)||!this.groups.includes(t)||!this.layoutChanging(`move`,e,r))return!1;let i=e.activeDocument,a=n??t.tabs.length;for(let n of[...e.documents])this.moveDocument(n,t,a,r)&&(a=t.documents.indexOf(n)+1);return i?.group===t&&this.activateDocument(i,!1,r),this.closeMovedGroup(e,r),this.layoutChanged(`move`,t,r),this.say(`tabDocsGroupMoved`,{n:this.groups.indexOf(t)+1}),!0}moveGroupBy(e,t,n,r,i=null){if(!this.groups.includes(e)||t===e||t&&!this.groups.includes(t))return!1;if(n===`center`)return!!t&&this.mergeGroup(e,t,void 0,r);if(this.groups.length<2||!this.layoutChanging(`move`,e,r))return!1;this.restoreForChange();let a=this.takeOut(e);t?this.insertBeside(t,e,n):this.insertAtHostEdge(i&&i.root?i:null,e,n),this.renderTree();for(let e of a)e.dispose();return this.dropEmptyHosts(r),this.useGroup(e,r),this.layoutChanged(`move`,e,r),this.say(`tabDocsGroupMoved`,{n:this.groups.indexOf(e)+1}),!0}closeIfEmpty(e,t){!e.tabs.length&&this.groups.includes(e)&&this.removable(e)&&this.closeMovedGroup(e,t)}closeMovedGroup(e,t){!e.tabs.length&&this.groups.includes(e)&&this.closable(e)&&(this.removeGroup(e),this.layoutChanged(`closeGroup`,e,t))}nearestGroup(e,t){if(e instanceof P)return e;if(e.orientation===(t===`left`||t===`right`?`horizontal`:`vertical`))return this.nearestGroup(t===`right`||t===`down`?e.children[0]:e.children[e.children.length-1],t);let n=this.parts.recentGroups,r=e=>Math.min(...X(e).map(e=>n.includes(e)?n.indexOf(e):1/0)),i=[...e.children].sort((e,t)=>r(e)-r(t))[0];return this.nearestGroup(i,t)}keepBy(e,t){let n=e.group;if(!n||e.manager!==this||!e.preview)return!1;let r={document:e,group:n,byUser:t,cancel:!1,source:this};return this.parts.keeping.fire(r),!r.cancel&&(e.preview=!1,this.parts.kept.fire({document:e,group:n,byUser:t,source:this}),this.say(`tabDocsKept`,{title:e.title}),!0)}pinBy(e,t,n){let r=this.parts.tabs.get(e),i=r?.group;if(!r||!i)return!1;if(e.pinned===t)return!0;let a={document:e,group:i,byUser:n,cancel:!1,source:this};return(t?this.parts.pinning:this.parts.unpinning).fire(a),!a.cancel&&(t&&e.preview&&(e.preview=!1),e.pinned=t,this.pinChanged(r),(t?this.parts.pinned:this.parts.unpinned).fire({document:e,group:i,byUser:n,source:this}),this.say(t?`tabDocsPinned`:`tabDocsUnpinned`,{title:e.title}),!0)}lockBy(e,t,n){if(!this.groups.includes(e))return!1;if(e.locked===t)return!0;let r={group:e,byUser:n,cancel:!1,source:this};return(t?this.parts.locking:this.parts.unlocking).fire(r),!r.cancel&&(e.locked=t,this.renderTexts(),(t?this.parts.locked:this.parts.unlocked).fire({group:e,byUser:n,source:this}),this.say(t?`tabDocsLocked`:`tabDocsUnlocked`,{n:this.groups.indexOf(e)+1}),!0)}openNewBy(e,t){let n=this.newDocument;if(!e||!n||!this.groups.includes(e))return null;let r=n(e);return r?this.openDocument(r,{group:e,focus:t},t):null}mayCopy(e){return(e.allowDuplicate??this.allowDuplicate)&&e.canCopy(!!this.factory)}copiesOnSplit(e){return this.splitCopies&&this.mayCopy(e)}isLastCopy(e){let t=e.original??e;return!this.documents.some(n=>n!==e&&(n.original??n)===t)}targetGroup(){let e=this.parts,t=this.activeGroup,n=e=>!e.locked&&!e.dockArea;return t&&n(t)?t:e.recentGroups.find(n)??this.groups.find(n)??t??this.groups[0]}insertIndex(e){let t=this.openPosition;return t===`start`?0:t===`end`||!e.activeTab?e.tabs.length:e.tabs.indexOf(e.activeTab)+1}ensureRoot(){if(this.parts.root)return;let e=this.createGroup();this.setRoot(e),this.renderTree(),this.useGroup(e,!1)}createGroup(){let e=new P(this);return this.sizeGroup(e),this.controls.add(e),e}splitGroup(e,t,n,r,i=!!n&&this.copiesOnSplit(n),a=null){let o=this.parts;if(e&&!this.groups.includes(e))return null;let s=n&&o.tabs.has(n)?n:null,c={group:e,direction:t,document:s,copy:!!s&&i,byUser:r,cancel:!1,source:this};if(o.splitting.fire(c),c.cancel)return null;this.restoreForChange();let l=this.createGroup();e?this.insertBeside(e,l,t):this.insertAtHostEdge(a&&a.root?a:null,l,t),this.renderTree();let u=null;return s&&c.copy&&s.canCopy(!!this.factory)?u=this.openDocument(s.makeCopy(),{group:l,pinned:s.pinned||void 0},r):s&&this.moveDocument(s,l,0,r),this.useGroup(l,r),o.split.fire({group:e,newGroup:l,direction:t,document:s,copy:u,byUser:r,source:this}),this.layoutChanged(`split`,l,r),this.say(`tabDocsSplit`,{n:this.groups.indexOf(l)+1}),l}async closeGroupBy(e,t){if(!this.groups.includes(e)||!this.layoutChanging(`closeGroup`,e,t))return!1;for(let n of[...e.documents])if(!await this.closeDocument(n,t))return!1;return this.groups.includes(e)&&this.closable(e)&&D(()=>{this.removeGroup(e),this.layoutChanged(`closeGroup`,e,t)}),!0}removeGroup(e){let t=this.parts,n=this.hostOf(e);if(n===void 0||n===null&&!e.parentSplit)return;t.maximized&&this.unmaximize();let r=e.focusWithin,i=this.takeOut(e);t.recentGroups=t.recentGroups.filter(t=>t!==e),e.disposeTabs(),this.controls.remove(e),this.renderTree();for(let e of i)e.dispose();if(this.dropEmptyHosts(!1),this.activeGroup===e){this.setProperty(`activeGroup`,null);let e=t.recentGroups[0]??this.groups[0];e&&this.useGroup(e,!1)}r&&this.activeGroup?.restoreFocus(),(!n||n.root)&&this.say(`tabDocsGroupClosed`)}takeOut(e){let t=e.parentSplit;if(!t)return this.detachRoot(e),[];if(t.remove(e),t.children.length!==1)return[];let n=t.children[0],r=t.parentSplit;if(r&&n instanceof I&&n.orientation===r.orientation){let e=r.children.indexOf(t),i=r.sizes[e];r.children.splice(e,1,...n.children),r.sizes.splice(e,1,...n.sizes.map(e=>e*i));for(let e of n.children)e.parentSplit=r;return[n,t]}return t.remove(n),this.replaceNode(t,n),[t]}insertBeside(e,t,n){let r=n===`left`||n===`right`?`horizontal`:`vertical`,i=n===`right`||n===`down`,a=e.parentSplit;if(a&&a.orientation===r){let n=a.children.indexOf(e),r=a.sizes[n]/2;a.sizes[n]=r,a.children.splice(i?n+1:n,0,t),a.sizes.splice(i?n+1:n,0,r),t.parentSplit=a}else{let n=new I(this,r);this.replaceNode(e,n),n.children=i?[e,t]:[t,e],n.sizes=[.5,.5],e.parentSplit=t.parentSplit=n}}insertAtEdge(e,t){let n=this.parts.root,r=t===`left`||t===`right`?`horizontal`:`vertical`,i=t===`right`||t===`down`;n instanceof I&&n.orientation===r?n.insert(e,i?n.children.length:0):this.insertBeside(n,e,t)}replaceNode(e,t){let n=e.element.parentElement;n&&N(n,t.element,e.element);let r=e.parentSplit;r?r.replace(e,t):this.setHostRoot(this.hostOf(e)??null,t)}detachRoot(e){let t=this.hostOf(e);if(t===void 0)return;if(t){t.root=null;return}let n=this.createGroup();this.setRoot(n)}hostOf(e){let t=e;for(;t.parentSplit;)t=t.parentSplit;let n=this.parts;return t===n.root?null:n.windows.find(e=>e.root===t)??[...n.areas.values()].find(e=>e.root===t)??n.browsers.find(e=>e.root===t)}hostGroups(e){let t=e?e.root:this.parts.root;return t?X(t):[]}setHostRoot(e,t){if(!e){this.setRoot(t);return}e.root=t,t.parentSplit=null,dn(e instanceof G?e.body:e.element,t)}insertAtHostEdge(e,t,n){let r=e?e.root:this.parts.root;if(!r){this.setHostRoot(e,t);return}let i=n===`left`||n===`right`?`horizontal`:`vertical`,a=n===`right`||n===`down`;r instanceof I&&r.orientation===i?r.insert(t,a?r.children.length:0):this.insertBeside(r,t,n)}setRoot(e){this.parts.root=e,e.parentSplit=null,N(this.element,e.element,this.element.firstChild),e.element.style.flex=`1 1 0px`}renderTree(){let e=T(),t=[],n=(e,r,i)=>{e instanceof I?(e.render(),e.children.forEach(e=>n(e,r,i))):(t.push(e),e.placeIn(r instanceof G?r:null,r instanceof W?r:null,e===i,r instanceof K?r:null))},r=this.parts,i=r.root;i&&(N(this.element,i.element,this.element.firstChild),n(i,null,null));for(let e of this.orderedAreas())e.root&&(dn(e.element,e.root),n(e.root,e,null));for(let e of r.windows)e.root&&(dn(e.body,e.root),n(e.root,e,un(e.root)));for(let e of r.browsers)e.root&&(dn(e.element,e.root),n(e.root,e,null));this.setProperty(`groups`,t),this.renderDock(),this.renderTexts(),r.presenter.render(),e&&e.isConnected&&this.owns(e)&&T(e)!==e&&e.focus({preventScroll:!0})}createWindow(e){let t=new G(this,e);return this.parts.windows.push(t),this.element.append(t.element),t.bringToFront(),this.keepWindowInView(t),this.renderLists(),t}discardWindow(e){let t=this.parts;for(let n of this.hostGroups(e))t.recentGroups=t.recentGroups.filter(e=>e!==n),this.controls.remove(n);e.root=null,t.windows=t.windows.filter(t=>t!==e),e.dispose(),this.renderTree(),this.renderLists()}removeWindow(e,t,n){let r=this.parts,i=r.windows.indexOf(e);if(i<0)return;let a=!!T()&&e.element.contains(T());r.windowKeys?.window===e&&r.windowKeys.end(!1),r.windows.splice(i,1),e.root&&this.disposeSplits(e.root),e.dispose(),this.renderLists(),r.presenter.render(),r.windowClosed.fire({window:e,kind:`floating`,reason:t,byUser:n,source:this}),this.layoutChanged(`closeWindow`,null,n,e),t!==`docked`&&t!==`moved`&&this.say(`tabDocsWindowClosed`),a&&this.activeGroup?.restoreFocus()}newWindowBy(e,t,n){let r=this.parts,i=e instanceof G?e:null,a=e instanceof B?e:null,o=i?r.recentGroups.find(e=>e.window===i)??this.hostGroups(i)[0]:a?a.group:e;if(!o||!this.groups.includes(o)||a&&a.manager!==this||i&&(!r.windows.includes(i)||!i.root)||!this.mayNewWindow({document:a,group:o,manager:this,copy:!1,window:i}))return null;let s={document:a,group:o,window:i,rect:t.rect??this.newWindowRect(i??o),url:t.url??this.newWindowUrl,byUser:n,cancel:!1,source:this};if(r.windowOpening.fire(s),s.cancel)return null;let c=this.openView(s);if(!c)return this.windowRefused(`windowBlocked`,a,o,i,s.rect,n);let l=()=>D(()=>this.moveInto(c,a,o,i,n)),u=ln(c,s.url);if(u===`ready`)return l();if(u===`foreign`)return c.close(),this.windowRefused(`windowNotUsable`,a,o,i,s.rect,n);let d=Date.now(),f=setInterval(()=>{let e=ln(c,s.url);e===`loading`&&!c.closed&&Date.now()-d<15e3||(clearInterval(f),e===`ready`&&this.groups.includes(o)?l():c.closed||(c.close(),D(()=>this.windowRefused(`windowNotUsable`,a,o,i,s.rect,n))))},50);return null}openView(e){let t=e.rect,n=`popup,width=${Math.round(t.width)},height=${Math.round(t.height)},left=${Math.round(t.x)},top=${Math.round(t.y)}`,r={url:e.url,name:w(`tabdocs-window`),features:n,rect:{...t}},i=this.element.ownerDocument.defaultView;try{return(this.openWindow?this.openWindow(r):i?.open(r.url,r.name,r.features))??null}catch{return null}}windowRefused(e,t,n,r,i,a){let o={error:e,document:t,group:n,fallback:this.newWindowFallback,byUser:a,source:this};return this.parts.error.fire(o),this.say(`tabDocsWindowBlocked`),r||o.fallback!==`float`||!this.groups.includes(n)?r:t&&t.group!==n?null:this.floatBy(t,n,this.viewportRect(i),a)}newWindowRect(e){let t=e.element,n=t.ownerDocument.defaultView,r=t.getBoundingClientRect(),i=this.newWindowSize,a=Math.round(i?.width??(r.width>0?r.width:640)),o=Math.round(i?.height??(r.height>0?r.height:480)),s=n?H(n):{x:0,y:0};return{x:Math.round(s.x+r.left+32),y:Math.round(s.y+r.top+32),width:a,height:o}}viewportRect(e){let t=this.element.ownerDocument.defaultView,n=t?H(t):{x:0,y:0};return{...e,x:e.x-n.x,y:e.y-n.y}}moveInto(e,t,n,r,i){let a=this.parts;if(r?!a.windows.includes(r)||!r.root:!this.groups.includes(n)||t&&t.group!==n)return e.close(),null;this.restoreForChange();let o=this.createBrowserWindow(e),s;if(t){if(s=this.createGroup(),this.setHostRoot(o,s),this.renderTree(),o.home=n,!this.moveDocument(t,s,0,i))return this.discardBrowserWindow(o),null}else if(r){let e=r.root;o.home=r.lastDock.group,s=a.recentGroups.find(e=>e.window===r)??X(e)[0],a.windowGone=`moved`;try{let t=this.takeOut(e);this.setHostRoot(o,e),this.renderTree();for(let e of t)e.dispose();this.dropEmptyHosts(i)}finally{a.windowGone=null}}else{o.home=this.nearGroup(n);let e=this.takeOut(n);this.setHostRoot(o,n),this.renderTree();for(let t of e)t.dispose();this.dropEmptyHosts(i),s=n}return o.home&&(o.home===s||!Z(o.home))&&(o.home=null),this.useGroup(s,i),a.windowOpened.fire({window:o,document:t,group:s,byUser:i,source:this}),this.layoutChanged(`newWindow`,s,i,o),i&&(cn(e),this.focusGroup(s)),this.say(`tabDocsMovedToNewWindow`,{title:t?t.title:this.textOf(`tabDocsGroup`,{n:this.groups.indexOf(s)+1})}),o}createBrowserWindow(e){let t=this.parts,n=new K(this,e);t.browsers.push(n);let r=this.element.style;for(let e=0;e<r.length;e++){let t=r[e];t.startsWith(`--`)&&n.element.style.setProperty(t,r.getPropertyValue(t))}let i=[t.menus.attach(n.element),t.drag.listen(n.element)];return t.browserStops.set(n,()=>i.forEach(e=>e())),this.watchPage(),this.renderStrip(),this.renderLists(),n}discardBrowserWindow(e){let t=this.parts;for(let n of this.hostGroups(e))t.recentGroups=t.recentGroups.filter(e=>e!==n),this.controls.remove(n);e.root=null,t.browsers=t.browsers.filter(t=>t!==e),this.disposeBrowserWindow(e),this.renderTree(),this.renderLists()}removeBrowserWindow(e,t,n){let r=this.parts,i=r.browsers.indexOf(e);i<0||(r.browsers.splice(i,1),this.disposeBrowserWindow(e),this.renderLists(),r.windowClosed.fire({window:e,kind:`browser`,reason:t,byUser:n,source:this}),this.layoutChanged(`closeWindow`,null,n,e))}disposeBrowserWindow(e){let t=this.parts;t.browserStops.get(e)?.(),t.browserStops.delete(e),e.root&&this.disposeSplits(e.root),e.dispose(),t.browsers.length||(t.pageStop?.(),t.pageStop=null)}watchPage(){let e=this.parts,t=this.element.ownerDocument.defaultView;if(e.pageStop||!t)return;let n=t.document,r=e=>V(t,e),i=()=>e.mainFocusedAt=performance.now(),a=()=>D(()=>{for(let t of[...e.browsers])this.disposeBrowserWindow(t);e.browsers=[],this.renderLists()});n.addEventListener(`pointermove`,r,{capture:!0,passive:!0}),n.addEventListener(`pointerdown`,r,{capture:!0,passive:!0}),t.addEventListener(`focus`,i),t.addEventListener(`pagehide`,a),e.pageStop=()=>{n.removeEventListener(`pointermove`,r,!0),n.removeEventListener(`pointerdown`,r,!0),t.removeEventListener(`focus`,i),t.removeEventListener(`pagehide`,a)}}mainWindowBy(e,t,n={}){let r=this.parts,i=e instanceof K?e:null,a=e instanceof B?e:null,o=i?null:a?a.group:e,s=i??o?.browserWindow??null;if(!s||!r.browsers.includes(s)||a&&a.manager!==this||o&&!this.groups.includes(o)||!n.force&&!this.layoutChanging(`mainWindow`,o,t,s))return!1;let c=(s.home&&this.groups.includes(s.home)&&Z(s.home)?s.home:null)??this.targetGroupOutside(),l=a?[a]:this.hostGroups(i??o.browserWindow).filter(e=>i||e===o).flatMap(e=>[...e.documents]),u=a??(i?s.activeDocument:o.activeDocument);this.restoreForChange(),r.windowGone=n.reason??`docked`;let d=0;try{let e=c.tabs.length;for(let r of l)this.moveDocument(r,c,a?void 0:e,t,n.force)&&(d++,e=c.documents.indexOf(r)+1);if((i||n.force)&&r.browsers.includes(s)&&this.hostGroups(s).every(e=>!e.tabs.length)){for(let e of this.hostGroups(s))r.recentGroups=r.recentGroups.filter(t=>t!==e),e.disposeTabs(),this.controls.remove(e);s.root&&this.disposeSplits(s.root),s.root=null,this.renderTree()}this.dropEmptyHosts(t)}finally{r.windowGone=null}if(l.length&&!d)return!1;if(u?.group===c&&this.activateDocument(u,!1,t),this.useGroup(c,t),this.layoutChanged(`mainWindow`,c,t,s),t&&!n.force){let e=this.element.ownerDocument.defaultView;e&&cn(e),this.focusGroup(c)}return n.reason!==`closed`&&this.say(`tabDocsMovedToMainWindow`,{title:a?a.title:this.textOf(`tabDocsGroup`,{n:this.groups.indexOf(c)+1})}),!0}async closeBrowserBy(e,t){let n=this.parts;if(!n.browsers.includes(e))return!1;let r={window:e,kind:`browser`,then:this.newWindowCloseAction,byUser:t,cancel:!1,source:this};if(n.windowClosing.fire(r),r.cancel)return!1;if(r.then===`back`)return D(()=>this.mainWindowBy(e,t,{force:!0,reason:`closed`}));n.closingWindows.add(e);try{for(let n of D(()=>[...e.documents]))if(!await D(()=>this.closeOrHide(n,t)))return!1}finally{n.closingWindows.delete(e)}return D(()=>{if(!n.browsers.includes(e))return;let r=this.hostGroups(e);e.root=null;for(let e of r)n.recentGroups=n.recentGroups.filter(t=>t!==e),e.disposeTabs(),this.controls.remove(e);if(this.renderTree(),this.activeGroup&&r.includes(this.activeGroup)){this.setProperty(`activeGroup`,null);let e=n.recentGroups[0]??this.groups[0];e&&this.useGroup(e,!1)}this.removeBrowserWindow(e,`closed`,t),this.say(`tabDocsWindowClosed`)}),!0}reopenWindowsBy(){let e=this.parts,t=0;for(let n of[...e.reopen]){if(!e.windows.includes(n.window)||!n.window.root){e.reopen=e.reopen.filter(e=>e!==n);continue}this.newWindowBy(n.window,{rect:n.rect},!1)instanceof K&&(t++,e.reopen=e.reopen.filter(e=>e!==n))}return t}createArea(e,t){let n=this.parts,r=new W(this,e,t);return n.areas.set(e,r),n.order.push(e),r.strip=new xt(this,r),this.element.append(r.element,r.sash.element,r.strip.element),this.renderLists(),n.presenter.render(),r}removeArea(e){let t=this.parts;t.areas.get(e.side)===e&&(t.slide?.area===e&&this.stopSlide(),t.areas.delete(e.side),t.order=t.order.filter(t=>t!==e.side),e.root&&this.disposeSplits(e.root),e.strip?.dispose(),e.dispose(),this.renderLists(),this.renderDock())}dropEmptyHosts(e){let t=this.parts;for(let n of[...t.windows])n.root||this.removeWindow(n,t.windowGone??(t.closingWindows.has(n)?`closed`:`empty`),e);for(let e of[...t.areas.values()])e.root||this.removeArea(e);for(let n of[...t.browsers])n.root||this.removeBrowserWindow(n,t.windowGone===`moved`?`empty`:t.windowGone??(t.closingWindows.has(n)?`closed`:`empty`),e)}orderedAreas(){let e=this.parts;return e.order.map(t=>e.areas.get(t)).filter(Boolean)}renderLists(){this.setProperty(`dockAreas`,this.orderedAreas()),this.setProperty(`floatingWindows`,[...this.parts.windows].sort((e,t)=>fn(e)-fn(t))),this.setProperty(`browserWindows`,[...this.parts.browsers].sort((e,t)=>e.focusedAt-t.focusedAt))}windowRaised(){D(()=>this.renderLists())}renderDock(){let e=this[Y];e&&D(()=>{let t={c0:2,c1:7,r0:2,r1:7},n=e.presenter.kind!==`desktop`;for(let e of this.orderedAreas()){if(n){for(let t of[`inline-size`,`block-size`,`grid-area`])e.element.style.removeProperty(t);e.sash.element.hidden=!0,e.element.setAttribute(`aria-label`,this.textOf($[e.side]));continue}let r=e.autoHidden,i=Math.round(e.pixels()),a=e.orientation===`horizontal`,o=e.element.style;o.setProperty(a?`inline-size`:`block-size`,`${i}px`),o.removeProperty(a?`block-size`:`inline-size`);let s,c=null;e.side===`left`?(s=r?[t.r0,t.c0,t.r1,5]:[t.r0,2,t.r1,3],r||(c=[t.r0,3,t.r1,4],t.c0=4)):e.side===`right`?(s=r?[t.r0,4,t.r1,t.c1]:[t.r0,6,t.r1,7],r||(c=[t.r0,5,t.r1,6],t.c1=5)):e.side===`top`?(s=r?[t.r0,t.c0,5,t.c1]:[2,t.c0,3,t.c1],r||(c=[3,t.c0,4,t.c1],t.r0=4)):(s=r?[4,t.c0,t.r1,t.c1]:[6,t.c0,7,t.c1],r||(c=[5,t.c0,6,t.c1],t.r1=5)),o.gridArea=s.join(` / `);let l=e.sash.element;l.hidden=!c,c&&(l.style.gridArea=c.join(` / `));let u=e.room();l.setAttribute(`aria-orientation`,a?`vertical`:`horizontal`),l.setAttribute(`aria-valuenow`,String(u>0?Math.round(i/u*100):0)),l.setAttribute(`aria-controls`,e.element.id),l.setAttribute(`aria-label`,this.textOf(`tabDocsResizeArea`,{area:this.textOf($[e.side])})),e.element.setAttribute(`aria-label`,this.textOf($[e.side]))}n&&e.presenter.render()})}clampAreaSize(e,t){let n=this.dockAreaMinSize,r=e.room();if(!(r>0))return Math.max(n,t);let i=e.orientation===`horizontal`,a=this.orderedAreas().filter(t=>t!==e&&!t.autoHidden&&t.orientation===e.orientation).reduce((e,t)=>e+Math.min(t.rawPixels(),r),0),o=i?this.minGroupWidth:this.minGroupHeight;return Math.max(n,Math.min(t,r-a-o))}resolvePresentation(){let e=this[Y];e&&D(()=>{let t=this.presentation,n=e.width||this.element.getBoundingClientRect().width,r;if(t!==`auto`)r=t;else if(n>0)r=n<this.phoneWidth?`phone`:n<this.tabletWidth&&(this.tabletWhen===`width`||hn(this.element))?`tablet`:`desktop`;else return;let i=e.presenter.kind;if(r===i)return;let a={from:i,to:r,width:Math.round(n),cancel:!1,source:this};if(e.presentationChanging.fire(a),!a.cancel){e.drag?.cancel(!0),e.moveKeys?.end(!1),e.windowKeys?.end(!1),e.slide&&this.stopSlide(),e.presenter.apply(r),this.setProperty(`currentPresentation`,r),this.renderDock();for(let e of this.groups)e.queueOverflow();e.presentationChanged.fire({from:i,to:r,width:a.width,source:this}),this.say(`tabDocsPresentation`,{kind:this.textOf(r===`phone`?`tabDocsPhone`:r===`tablet`?`tabDocsTablet`:`tabDocsDesktop`)})}})}watchPointer(){let e=this.element.ownerDocument.defaultView?.matchMedia?.(`(pointer: coarse)`);if(!e?.addEventListener)return;let t=()=>this.resolvePresentation();e.addEventListener(`change`,t),this.motif.setDisposable(()=>e.removeEventListener(`change`,t))}watchSize(){let e=this.element.ownerDocument.defaultView;if(!e||typeof e.ResizeObserver!=`function`)return;let t=this.parts,n=``;t.sizeWatch=new e.ResizeObserver(()=>{let e=this.element.getBoundingClientRect(),r=`${Math.round(e.width)}x${Math.round(e.height)}`;r!==n&&(n=r,t.width=e.width,D(()=>this.resolvePresentation()),t.areas.size?this.renderDock():D(()=>t.presenter.render()))}),t.sizeWatch.observe(this.element)}keepWindowInView(e){if(!this.keepFloatingInView||e.isMaximized)return;let t=e.room();if(!(t.w>0&&t.h>0))return;let n=e.rect,r=Math.min(n.width,t.w),i=Math.min(n.height,t.h),a=Math.min(Math.max(0,n.x),t.w-r),o=Math.min(Math.max(0,n.y),t.h-i);(a!==n.x||o!==n.y||r!==n.width||i!==n.height)&&e.place({x:a,y:o,width:r,height:i})}floatRect(e,t){let n=e?.element.getBoundingClientRect();if(n&&e?.browserWindow){let e=this.floatingWindowSize,t=e?.width??(n.width>0?n.width:480),r=e?.height??(n.height>0?n.height:320),i=this.element.ownerDocument.documentElement;return{x:Math.max(0,(i.clientWidth-t)/2),y:Math.max(0,(i.clientHeight-r)/3),width:t,height:r}}let r=this.floatingWindowSize,i=r?.width??(n&&n.width>0?n.width:480),a=r?.height??(n&&n.height>0?n.height:320);if(t)return{x:t.x-Math.min(48,i/4),y:t.y-16,width:i,height:a};if(n&&n.width>0)return{x:n.x+32,y:n.y+32,width:i,height:a};let o=this.element.ownerDocument.documentElement;return{x:Math.max(0,(o.clientWidth-i)/2),y:Math.max(0,(o.clientHeight-a)/3),width:i,height:a}}mayFloat(e){return this.isEnabled&&(e.allowFloat??this.allowFloat)}mayDock(e,t){return e.allowDock??this.allowDock?!t||(e.dockSides??this.dockSides).includes(t):!1}maySubject(e,t){return D(()=>{let n=e.window?e.window.documents:e.document?[e.document]:e.group.documents;return t===`float`?!this.isEnabled||e.window||!e.document&&this.hostGroups(e.group.window).length===1&&e.group.window?!1:n.length?n.every(e=>this.mayFloat(e)):this.allowFloat:n.length?n.every(e=>this.mayDock(e,t)):this.allowDock&&this.dockSides.includes(t)})}mayAutoHide(e){return this.allowAutoHide&&e.documents.every(e=>e.allowAutoHide!==!1)}canMaximize(e){return Z(e)&&this.groups.filter(Z).length>1}removable(e){let t=this.hostOf(e);if(t===void 0)return!1;let n=this.hostGroups(t).length<2;return t===null?!n&&this.closeEmptyGroups:t instanceof G||t instanceof K?n?this.closeEmptyWindows:this.closeEmptyGroups:n||this.closeEmptyGroups}closable(e){let t=this.hostOf(e);return t!==void 0&&(t!==null||this.hostGroups(null).length>1)}groupAt(e,t,n=null){let r=this.dragSpace,i=r===this.element.ownerDocument;for(let r of i?this.windowsFrontFirst():[])if(r!==n&&Q(r.element.getBoundingClientRect(),e,t))return this.hostGroups(r).find(n=>Q(n.element.getBoundingClientRect(),e,t))??null;let a=i?this.parts.slide?.area:null;if(a&&Q(a.element.getBoundingClientRect(),e,t))return this.hostGroups(a).find(n=>Q(n.element.getBoundingClientRect(),e,t))??null;for(let n of this.groups)if(!(n.element.ownerDocument!==r||n.window||n.dockArea?.autoHidden||n.element.closest(`[hidden]`))&&Q(n.element.getBoundingClientRect(),e,t))return n;return null}windowsFrontFirst(){return[...this.parts.windows].sort((e,t)=>fn(t)-fn(e))}floatPlace(e,t,n){if(e.window)return{target:`float`,manager:this,group:null,index:-1,side:null,rect:e.window.rect};if(e.manager!==this||!this.maySubject(e,`float`)||t!==void 0&&this.dragSpace!==this.element.ownerDocument)return null;let r=t===void 0||n===void 0?null:{x:t,y:n};return{target:`float`,manager:this,group:null,index:-1,side:null,rect:this.floatRect(e.group,r)}}dockAreaBox(e){let t=this.parts.areas.get(e);if(t&&!t.autoHidden)return t.element.getBoundingClientRect();let n=this.element.getBoundingClientRect(),r=e===`left`||e===`right`,i=this.dockAreaSize[e],a=String(i).trim(),o=r?n.width:n.height,s=Math.min(o/2,a.endsWith(`%`)?o*parseFloat(a)/100:Number(i)||0),c=e===`left`!==pn(this.element);return e===`top`?new DOMRect(n.left,n.top,n.width,s):e===`bottom`?new DOMRect(n.left,n.bottom-s,n.width,s):c?new DOMRect(n.left,n.top,s,n.height):new DOMRect(n.right-s,n.top,s,n.height)}floatBy(e,t,n,r,i=null){let a=this.parts;if(!this.groups.includes(t)||e&&e.group!==t||!this.maySubject({document:e,group:t,manager:this,copy:!1},`float`))return null;let o=this.hostOf(t);if(e&&o instanceof G&&t.documents.length===1&&this.hostGroups(o).length===1)return null;let s={document:e,group:t,rect:n??this.floatRect(t,i),byUser:r,cancel:!1,source:this};if(a.floating.fire(s),s.cancel||!this.groups.includes(t))return null;this.restoreForChange();let c=this.createWindow(s.rect),l=o instanceof W?o.side:null,u;if(e){if(u=this.createGroup(),this.setHostRoot(c,u),this.renderTree(),c.lastDock={side:l,group:t},!this.moveDocument(e,u,0,r))return this.discardWindow(c),null}else{c.lastDock={side:l,group:this.nearGroup(t)};let e=this.takeOut(t);this.setHostRoot(c,t),this.renderTree();for(let t of e)t.dispose();this.dropEmptyHosts(r),u=t}return c.lastDock.group===u&&(c.lastDock.group=null),this.useGroup(u,r),c.bringToFront(),a.floated.fire({document:e,group:u,window:c,byUser:r,source:this}),this.layoutChanged(`float`,u,r,c),this.say(`tabDocsFloated`,{title:e?e.title:this.textOf(`tabDocsGroup`,{n:this.groups.indexOf(u)+1})}),r&&u.activeDocument&&a.presenter.reveal(u.activeDocument),r&&this.focusGroup(u),c}nearGroup(e){let t=this.hostOf(e);return(t===void 0?[]:this.hostGroups(t).filter(t=>t!==e))[0]??this.parts.recentGroups.find(t=>t!==e&&Z(t))??null}dockBy(e,t,n,r){let i=this.parts,a=e instanceof B?e:null,o=e instanceof G?e:(a?a.group:e)?.window??null,s=e instanceof G?null:a?a.group:e;if((a&&!a.isOpen?!t:e instanceof G?!i.windows.includes(e)||!e.root:!s||!this.groups.includes(s)||a&&a.manager!==this)||!t&&!o)return!1;let c={document:a,group:s??this.hostGroups(o)[0],manager:this,copy:!1,window:e instanceof G?e:null};if(t&&!this.maySubject(c,t)||t&&s?.dockArea?.side===t&&(!a||s.documents.length===1)&&!o)return!1;let l={document:a,group:e instanceof G?null:s,window:o,side:t,size:n,byUser:r,cancel:!1,source:this};if(i.docking.fire(l),l.cancel||l.side&&l.side!==t&&!this.maySubject(c,l.side))return!1;this.restoreForChange(),i.windowGone=`docked`;let u;try{u=l.side?this.dockInto(e,l.side,l.size,r):this.dockBack(e,o,r),this.dropEmptyHosts(r)}finally{i.windowGone=null}if(!u)return!1;let d=u.dockArea;this.useGroup(u,r),i.docked.fire({document:a,group:u,area:d,side:d?.side??null,byUser:r,source:this}),this.layoutChanged(`dock`,u,r,null,d);let f=a?a.title:this.textOf(`tabDocsGroup`,{n:this.groups.indexOf(u)+1});return d?this.say(`tabDocsDocked`,{title:f,area:this.textOf($[d.side])}):this.say(`tabDocsDockedBack`,{title:f,n:this.groups.indexOf(u)+1}),r&&!d?.autoHidden&&this.focusGroup(u),!0}dockInto(e,t,n,r){let i=this.parts,a=i.areas.get(t)??null,o=!a;a||=this.createArea(t,n??this.dockAreaSize[t]);let s=a.orientation===`horizontal`?`down`:`right`;if(e instanceof B){let t=o?null:i.recentGroups.find(e=>e.dockArea===a)??this.hostGroups(a)[0];return t||(t=this.createGroup(),this.setHostRoot(a,t),this.renderTree()),(e.manager===this?this.moveDocument(e,t,void 0,r):this.openDocument(e,{group:t},r))?t:(o&&(a.root=null,this.controls.remove(t),this.removeArea(a)),null)}let c=e instanceof G?e.root:e,l=e instanceof G?i.recentGroups.find(t=>t.window===e)??X(c)[0]:e,u=this.takeOut(c);o?this.setHostRoot(a,c):this.insertAtHostEdge(a,c,s),this.renderTree();for(let e of u)e.dispose();return l}dockBack(e,t,n){let r=t.lastDock,i=r.group&&this.groups.includes(r.group)&&r.group.window!==t?r.group:null;if(!i&&r.side)return this.dockInto(e,r.side,null,n);let a=i??this.targetGroupOutside();if(!a)return null;if(e instanceof B)return this.moveDocument(e,a,void 0,n)?a:null;let o=e instanceof G?this.hostGroups(t):[e],s=e instanceof G?this.parts.recentGroups.find(e=>e.window===t)?.activeDocument:e.activeDocument;for(let e of o){let t=a.tabs.length;for(let r of[...e.documents])this.moveDocument(r,a,t,n)&&(t=a.documents.indexOf(r)+1)}return s?.group===a&&this.activateDocument(s,!1,n),a}targetGroupOutside(){return this.parts.recentGroups.find(e=>Z(e)&&!e.locked)??this.hostGroups(null)[0]??null}autoHideBy(e,t,n){let r=this.parts;if(r.areas.get(e.side)!==e)return!1;if(e.autoHidden===t)return!0;if(t&&!this.mayAutoHide(e))return!1;let i={area:e,on:t,byUser:n,cancel:!1,source:this};if(r.autoHiding.fire(i),i.cancel)return!1;let a=T(),o=!!a&&e.element.contains(a);if(r.slide?.area===e&&this.stopSlide(),e.markFolded(t),this.renderDock(),r.autoHidden.fire({area:e,on:t,byUser:n,source:this}),this.layoutChanged(`autoHide`,null,n,null,e),this.say(t?`tabDocsAutoHidden`:`tabDocsAutoHideShown`,{area:this.textOf($[e.side])}),t&&o){let t=r.recentGroups.find(t=>t.dockArea!==e)??this.hostGroups(null)[0];t&&this.focusGroup(t)}else if(!t&&n){let t=r.recentGroups.find(t=>t.dockArea===e)??this.hostGroups(e)[0];t&&this.focusGroup(t)}return!0}slideOut(e,t,n){let r=this.parts,i=e.manager===this?e.dockArea:null;if(!i||!i.autoHidden)return!1;if(r.slide?.area===i)return n||(r.slide.hover=!1),e.group?.activeDocument!==e&&this.activateDocument(e,!1,t),t&&!n&&this.parts.tabs.get(e)?.focusContent(!0),!0;let a={area:i,document:e,open:!0,byUser:t,cancel:!1,source:this};return r.slideChanging.fire(a),!a.cancel&&(this.stopSlide(),i.markOpen(!0),this.renderDock(),this.activateDocument(e,!1,t),r.slide={area:i,hover:n,stop:this.watchSlide(i)},r.slideChanged.fire({area:i,document:e,open:!0,byUser:t,cancel:!1,source:this}),this.say(`tabDocsSlidOut`,{title:e.title}),t&&!n&&this.parts.tabs.get(e)?.focusContent(!0),!0)}slideBack(e,t=!1){let n=this.parts,r=n.slide;if(!r)return!1;let i=r.area,a={area:i,document:null,open:!1,byUser:e,cancel:!1,source:this};if(n.slideChanging.fire(a),a.cancel)return!1;let o=T(),s=!!o&&i.element.contains(o);return this.stopSlide(),n.slideChanged.fire({area:i,document:null,open:!1,byUser:e,cancel:!1,source:this}),(s||t)&&(t&&i.strip?.focusActive()||(n.recentGroups.find(e=>e.dockArea!==i)??this.hostGroups(null)[0])?.restoreFocus()),!0}stopSlide(){let e=this.parts,t=e.slide;t&&(e.slide=null,t.stop(),t.area.markOpen(!1),this.renderDock())}watchSlide(e){let t=this.element.ownerDocument,n=t=>me(t)&&(e.element.contains(t)||!!e.strip?.element.contains(t)||!!(g(t)&&t.closest(`.mx-popup`))),r=e=>{n(e.target)||D(()=>this.slideBack(!0))},i=e=>{e.key===`Escape`&&!e.defaultPrevented&&n(e.target)&&(e.preventDefault(),D(()=>this.slideBack(!0,!0)))},a=e=>{e.relatedTarget&&!n(e.relatedTarget)&&D(()=>this.slideBack(!0))};return t.addEventListener(`pointerdown`,r,!0),e.element.addEventListener(`keydown`,i),e.element.addEventListener(`focusout`,a),()=>{t.removeEventListener(`pointerdown`,r,!0),e.element.removeEventListener(`keydown`,i),e.element.removeEventListener(`focusout`,a)}}slideHoverEnded(e){D(()=>{let t=this.parts.slide,n=T();t?.area===e&&t.hover&&!(n&&e.element.contains(n))&&this.slideBack(!0)})}slideByUser(e,t){D(()=>{let n=this.parts.presenter,r=e.dockArea;if(n.kind!==`desktop`){if(t)return;r&&n.isToolOpen(r)&&e.group?.activeDocument===e?n.hideTool(r):n.showTool(e);return}let i=this.parts.slide;!t&&i&&!i.hover&&i.area===e.dockArea&&e.group?.activeDocument===e?this.slideBack(!0,!0):this.slideOut(e,!0,t)})}get slidArea(){return this.parts.slide?.area??null}maximizeWindowBy(e,t,n){if(!this.parts.windows.includes(e))return!1;if(e.isMaximized===t)return!0;let r=t?`maximizeWindow`:`restoreWindow`;return this.windowChanging(r,e,n)?(e.markMaximized(t),t||this.keepWindowInView(e),e.bringToFront(),this.windowChanged(r,e,n),this.say(t?`tabDocsWindowMaximized`:`tabDocsWindowRestored`),!0):!1}async closeWindowBy(e,t){let n=this.parts;if(!n.windows.includes(e))return!1;let r={window:e,kind:`floating`,then:`close`,byUser:t,cancel:!1,source:this};if(n.windowClosing.fire(r),r.cancel)return!1;if(r.then===`back`)return D(()=>this.dockBy(e,null,null,t));n.closingWindows.add(e);try{for(let n of D(()=>[...e.documents]))if(!await D(()=>this.closeOrHide(n,t)))return!1}finally{n.closingWindows.delete(e)}return D(()=>{if(!n.windows.includes(e))return;let r=this.hostGroups(e);e.root=null;for(let e of r)n.recentGroups=n.recentGroups.filter(t=>t!==e),e.disposeTabs(),this.controls.remove(e);if(this.renderTree(),this.activeGroup&&r.includes(this.activeGroup)){this.setProperty(`activeGroup`,null);let e=n.recentGroups[0]??this.groups[0];e&&this.useGroup(e,!1)}this.removeWindow(e,`closed`,t)}),!0}focusPartBy(e){let t=this.parts;if(this.activeGroup?.browserWindow)return!1;let n=[null,...this.orderedAreas().filter(e=>e.root&&!e.autoHidden),...this.windowsFrontFirst().reverse().filter(e=>e.root)];if(n.length<2)return!1;let r=T(),i=this.activeGroup?this.hostOf(this.activeGroup):null,a=n.indexOf(i===void 0?null:i);r&&!this.element.contains(r)&&(a=e===1?-1:0);let o=n[(a+e+n.length)%n.length];if(o instanceof G)return this.focusWindow(o);let s=t.recentGroups.find(e=>this.hostOf(e)===o)??this.hostGroups(o)[0];return!!s&&this.focusGroup(s)}toggleAutoHideByUser(e){D(()=>{let t=e.dockArea;t&&this.autoHideBy(t,!t.autoHidden,!0)})}toggleWindowMaximizeByUser(e){D(()=>{let t=e.window;t&&this.maximizeWindowBy(t,!t.isMaximized,!0)})}closeWindowByUser(e){let t=D(()=>e.window);t&&this.closeWindowBy(t,!0)}moveWindowByKeys(e){let t=e?.window;return!!t&&!!this.parts.windowKeys?.start(t)}disposeSplits(e){e instanceof I&&(e.children.forEach(e=>this.disposeSplits(e)),e.dispose())}useGroup(e,t,n=!0){let r=this.parts,i=this.activeGroup;if(i===e)return;r.maximized&&r.maximized!==e&&this.restoreForChange();let a=i?.activeDocument??null;i?.markActive(!1),e.markActive(!0),e.browserWindow?.markActive(e),r.recentGroups=[e,...r.recentGroups.filter(t=>t!==e)],this.setProperty(`activeGroup`,e);let o=e.activeDocument;n&&o!==a&&this.fireActivated(o,a,e,t),r.presenter.render()}maximizeBy(e,t,n=!1){let r=this.parts;if(!this.groups.includes(e)||!this.canMaximize(e))return!1;if(r.maximized===e)return!0;if(!n&&!this.layoutChanging(`maximize`,e,t))return!1;r.maximized&&this.unmaximize();for(let t=e;t.parentSplit;t=t.parentSplit){t.element.style.flex=`1 1 0px`;for(let e of t.parentSplit.element.children)e!==t.element&&!e.hidden&&(e.hidden=!0,r.hidden.push(e))}return r.maximized=e,e.markMaximized(!0),this.element.toggleAttribute(`data-maximized`,!0),this.setProperty(`maximizedGroup`,e),this.useGroup(e,t),n||(this.layoutChanged(`maximize`,e,t),this.say(`tabDocsMaximized`,{n:this.groups.indexOf(e)+1})),!0}restoreBy(e){let t=this.parts.maximized;return!t||!this.layoutChanging(`restore`,t,e)?!1:(this.unmaximize(),this.layoutChanged(`restore`,t,e),this.say(`tabDocsRestored`),!0)}restoreForChange(){let e=this.parts.maximized;e&&(this.unmaximize(),this.layoutChanged(`restore`,e,!1))}unmaximize(){let e=this.parts;for(let t of e.hidden.splice(0))t.hidden=!1;e.maximized?.markMaximized(!1),e.maximized=null,this.element.removeAttribute(`data-maximized`),this.setProperty(`maximizedGroup`,null),this.renderTree()}layoutChanging(e,t,n,r=null,i=null){let a={change:e,group:t,window:r,area:i,byUser:n,cancel:!1,source:this};return this.parts.layoutChanging.fire(a),!a.cancel}layoutChanged(e,t,n,r=null,i=null){this.parts.layoutChanged.fire({change:e,group:t,window:r,area:i,byUser:n,source:this})}windowChanging(e,t,n){return this.layoutChanging(e,null,n,t)}windowChanged(e,t,n){this.layoutChanged(e,null,n,t)}writeNode(e){if(e instanceof I)return{kind:`split`,orientation:e.orientation,sizes:[...e.sizes],children:e.children.map(e=>this.writeNode(e))};let t=e.tabs,n={kind:`group`,documents:t.map(e=>this.writeDocument(e.document)),active:e.activeTab?t.indexOf(e.activeTab):-1,recent:e.recentTabs.map(e=>t.indexOf(e))};return e.locked&&(n.locked=!0),e.allowDrop||(n.allowDrop=!1),e.dropSides&&(n.dropSides=[...e.dropSides]),n}writeDocument(e){let t={id:e.id,type:e.type,title:e.title};return e.state!==void 0&&(t.state=e.state),e.pinned&&(t.pinned=!0),e.preview&&(t.preview=!0),t}readHidden(e,t,n,r){if(!e?.document||r.has(e.document.id))return;let i=this.restoreDocument(e.document,n);if(!i||i.isOpen)return;r.set(i.id,i);let a=new Me(i,this);this.parts.tabs.set(i,a),i.markHidden(this),this.stashPanel(a),a.prepare();let o=e.side&&J.includes(e.side)?e.side:null;this.parts.hiddenDocs.push({document:i,tab:a,group:t[e.group??-1]??null,index:e.index??0,side:o,size:o?e.size??null:null,autoHide:!!o&&!!e.autoHide,rect:e.rect??null})}readNode(e,t,n){if(e.kind===`split`){let r=(e.children??[]).map(e=>this.readNode(e,t,n));if(r.length===1)return r[0];let i=new I(this,e.orientation===`vertical`?`vertical`:`horizontal`),a=e.sizes?.length===r.length?e.sizes.map(e=>Math.max(0,Number(e)||0)):[],o=a.reduce((e,t)=>e+t,0);i.children=r,i.sizes=o>0?a.map(e=>e/o):r.map(()=>1/r.length);for(let e of r)e.parentSplit=i;if(!r.length){let e=this.createGroup();i.children=[e],i.sizes=[1],e.parentSplit=i}return i}let r=this.createGroup();e.locked&&(r.locked=!0),e.allowDrop===!1&&(r.allowDrop=!1),e.dropSides&&(r.dropSides=e.dropSides);for(let i of e.documents??[]){let e=n.get(i.id),a=e&&e.canCopy(!!this.factory)?e.makeCopy():this.restoreDocument(i,t);a&&!a.isOpen&&(e?(a.pinned=!!i.pinned,a.preview=!!i.preview):n.set(i.id,a),this.insertTab(a,r,r.tabs.length))}let i=r.tabs[e.active]??r.tabs[0];return i&&r.showTab(i),e.recent&&r.restoreRecent(e.recent),r}restoreDocument(e,t){let n={id:e.id,type:e.type,title:e.title,state:e.state,pinned:e.pinned,preview:e.preview};if(!t)return new B(n);let r=t(e);return r?r instanceof B?r:r instanceof te?new B({...n,content:r}):new B({...n,...r}):null}registerKeys(){let e=this.parts;for(let t of e.keyStops.splice(0))t();let t=D(()=>this.keys),n=(t,n)=>{try{e.keyStops.push(ie(t,e=>D(()=>n(e)),{scope:this}))}catch{}},r=(e,r)=>{for(let i of t[e]??[])n(i,r)},i=e=>()=>{let t=this.activeDocument;return t&&t.group&&e(t,t.group),!!t};r(`nextTab`,e=>this.stepByKey(1,e)),r(`previousTab`,e=>this.stepByKey(-1,e)),r(`closeTab`,i(e=>void this.closeDocument(e,!0))),r(`closeAllTabs`,()=>!!this.activeGroup&&(this.closeMany([...this.activeGroup.documents],void 0,!0),!0)),r(`closeSavedTabs`,()=>!!this.activeGroup&&(this.closeMany(this.activeGroup.documents.filter(e=>!e.dirty),void 0,!0),!0));for(let e of t.focusGroup??[])for(let t=1;t<=9;t++)n(e.replace(`{n}`,String(t)),()=>this.focusGroup(t-1));r(`splitRight`,()=>{let e=this.activeGroup;return e&&this.splitByUser(e,`right`),!!e}),r(`recentNext`,e=>this.recentKey(1,e)),r(`recentPrevious`,e=>this.recentKey(-1,e)),r(`goBack`,()=>this.travel(-1,!0)),r(`goForward`,()=>this.travel(1,!0)),r(`reopenClosed`,()=>!!this.reopenBy(!0)),r(`keepOpen`,i(e=>this.keepBy(e,!0))),r(`togglePin`,i(e=>this.pinBy(e,!e.pinned,!0))),r(`showOpenList`,()=>this.showOpenList()),r(`stripNext`,e=>this.stripKey(e,1)),r(`stripPrevious`,e=>this.stripKey(e,-1)),r(`stripFirst`,e=>this.stripKey(e,`first`)),r(`stripLast`,e=>this.stripKey(e,`last`)),r(`closeFocusedTab`,e=>{let t=this.tabAt(e.target);return t?(this.closeDocument(t.document,!0),!0):!1});let a=e=>t=>{let n=this.tabAt(t.target)?.document??this.activeDocument;return!!n&&n.manager===this&&(e(n),!0)};r(`hide`,a(e=>this.hideBy(e,!0))),r(`moveTabLeft`,a(e=>this.moveInGroupBy(e,-1,!0))),r(`moveTabRight`,a(e=>this.moveInGroupBy(e,1,!0))),r(`moveToNextGroup`,a(e=>this.moveToGroupBy(e,`next`,!0))),r(`moveToPreviousGroup`,a(e=>this.moveToGroupBy(e,`previous`,!0)));for(let e of[`Left`,`Right`,`Up`,`Down`])r(`moveToGroup${e}`,a(t=>this.moveToGroupBy(t,e.toLowerCase(),!0)));r(`moveTo`,a(e=>this.showMoveTo(e))),r(`float`,a(e=>!!this.floatBy(e,e.group,null,!0))),r(`dock`,a(e=>this.dockBy(e,null,null,!0)));for(let e of[`Left`,`Right`,`Top`,`Bottom`])r(`dock${e}`,a(t=>this.dockBy(t,e.toLowerCase(),null,!0)));r(`toggleAutoHide`,a(e=>{let t=e.dockArea;return!!t&&this.autoHideBy(t,!t.autoHidden,!0)})),r(`nextPart`,()=>this.focusPartBy(1)),r(`previousPart`,()=>this.focusPartBy(-1)),r(`moveWindow`,()=>this.moveWindowByKeys(this.activeGroup)),r(`maximizeWindow`,()=>{let e=this.activeGroup?.window;return!!e&&(this.maximizeWindowBy(e,!e.isMaximized,!0),!0)}),r(`closeWindow`,()=>{let e=this.activeGroup?.window;return e&&this.closeWindowBy(e,!0),!!e}),r(`moveToNewWindow`,a(e=>!!this.newWindowBy(e,{},!0))),r(`moveToMainWindow`,a(e=>this.mainWindowBy(e,!0))),r(`resizeSmaller`,e=>this.sashKey(e,-1)),r(`resizeLarger`,e=>this.sashKey(e,1)),r(`resizeMin`,e=>this.sashKey(e,-1/0)),r(`resizeMax`,e=>this.sashKey(e,1/0))}recentKey(e,t){let n=this.parts.recentList;return n?.isOpen?(n.walk(e),!0):this.showRecentList(e,t)}tabAt(e){let t=g(e)?e.closest(`.mx-tabdocs__tab`):null;if(t){for(let e of this.parts.tabs.values())if(e.header===t)return e}}stepByKey(e,t){let n=this.activeGroup;if(!n||n.tabs.length<2)return!1;let r=!!this.tabAt(t.target);return this.step(n,e,!r,!0)&&r&&n.activeTab?.header.focus(),!0}stripKey(e,t){let n=this.tabAt(e.target),r=n?.group;if(!n||!r)return!1;let i=this.parts.presenter.stripOrder(n),a=i.indexOf(n),o=t;typeof o==`number`&&(e.key===`ArrowLeft`||e.key===`ArrowRight`)&&this.element.ownerDocument.defaultView?.getComputedStyle(r.listElement).direction===`rtl`&&(o=-o);let s=o===`first`?i[0]:o===`last`?i[i.length-1]:i[(a+o+i.length)%i.length];return!s||(s.header.focus(),this.activation===`auto`&&this.activateDocument(s.document,!1,!0),!0)}sashKey(e,t){let n=g(e.target)?e.target.closest(`.mx-tabdocs__sash`):null,r=Ie.of(n);if(!r)return!1;let i=r.split;if(!this.beginResize(i))return!0;let a=i.orientation===`horizontal`&&i.rtl&&(e.key===`ArrowLeft`||e.key===`ArrowRight`),o=Number.isFinite(t)?t*this.resizeStep:t*1e6;return i.resizeBy(r.index,a?-o:o),this.endResize(!0,i),!0}renderTexts(){this.groups.forEach((e,t)=>e.renderTexts(t+1));let e=t=>{t instanceof I&&(t.renderSashes(),t.children.forEach(e))};e(this.parts.root),this.parts.windows.forEach((t,n)=>{t.element.setAttribute(`aria-label`,this.textOf(`tabDocsWindow`,{n:n+1})),e(t.root)});for(let t of this.parts.areas.values())e(t.root);for(let t of this.parts.browsers)t.element.setAttribute(`aria-label`,this.label||this.textOf(`tabDocsDocuments`)),e(t.root)}renderMinSizes(){for(let e of D(()=>this.groups))this.sizeGroup(e)}sizeGroup(e){let t=e.element.style,n=this.peekProperty(`tabMaxWidth`)??0;t.setProperty(`--_min-width`,`${this.peekProperty(`minGroupWidth`)??160}px`),t.setProperty(`--_min-height`,`${this.peekProperty(`minGroupHeight`)??100}px`),t.setProperty(`--_tab-fixed`,`${this.peekProperty(`tabFixedWidth`)??160}px`),n>0?t.setProperty(`--_tab-max`,`${n}px`):t.removeProperty(`--_tab-max`)}renderStrip(){let e=this[Y];for(let t of[this.element,...(e?.browsers??[]).map(e=>e.element)]){let e=t.dataset;e.pinnedSize=this.peekProperty(`pinnedTabSize`)??`normal`,t.toggleAttribute(`data-pinned-row`,!!this.peekProperty(`pinnedTabsOnSeparateRow`)),t.toggleAttribute(`data-wrap`,!!this.peekProperty(`wrapTabs`))}for(let e of D(()=>this.groups))this.sizeGroup(e),e.queueOverflow()}say(e,t){this.sayText(this.textOf(e,t))}sayText(e){if(!this.announce)return;let t=this.parts,n=t.browsers.length?T():null,r=n&&t.browsers.find(e=>e.element.ownerDocument===n.ownerDocument)?.live||t.live;r.textContent=``,queueMicrotask(()=>r.textContent=e)}get parts(){let e=this;return e[Y]??=this.createParts()}createParts(){let e=this.element;e.classList.add(`mx-tabdocs`);let t=e.ownerDocument.createElement(`div`);return t.className=`mx-tabdocs__live`,t.setAttribute(`aria-live`,`polite`),e.append(t),{root:null,tabs:new Map,recentGroups:[],maximized:null,hidden:[],live:t,keyStops:[],history:[],at:-1,travelling:!1,closed:[],hiddenDocs:[],stash:null,menus:null,openList:null,recentList:null,drag:null,moveKeys:null,marks:new Ne(e),layoutTarget:null,targets:[],dropResult:null,areas:new Map,order:[],windows:[],dockTarget:null,windowKeys:null,sizeWatch:null,slide:null,windowGone:null,browsers:[],browserStops:new Map,reopen:[],space:null,mainFocusedAt:0,pageStop:null,windowOpening:new p,windowOpened:new p,error:new p,closingWindows:new Set,floating:new p,floated:new p,docking:new p,docked:new p,autoHiding:new p,autoHidden:new p,hiding:new p,hidden_:new p,showing:new p,shown:new p,slideChanging:new p,slideChanged:new p,windowClosing:new p,windowClosed:new p,opening:new p,opened:new p,closing:new p,closed_:new p,activating:new p,activated:new p,moving:new p,moved:new p,splitting:new p,split:new p,layoutChanging:new p,layoutChanged:new p,keeping:new p,kept:new p,pinning:new p,pinned:new p,unpinning:new p,unpinned:new p,locking:new p,locked:new p,unlocking:new p,unlocked:new p,menuOpening:new p,dragStarting:new p,dragOver:new p,dropping:new p,dropped:new p,dragEnded:new p,presenter:new Wt(this),width:0,presentationChanging:new p,presentationChanged:new p}}};function X(e){return e instanceof I?e.children.flatMap(X):[e]}function cn(e){e.document.hasFocus()||e.focus()}function Z(e){return!e.window&&!e.dockArea&&!e.browserWindow}function ln(e,t){try{let n=e.document;return n&&(!t||t===`about:blank`||e.location.href!==`about:blank`&&n.readyState===`complete`)?`ready`:`loading`}catch{return`foreign`}}function un(e){return e instanceof P?e:un(e.orientation===`horizontal`?e.children[e.children.length-1]:e.children[0])}function dn(e,t){N(e,t.element,e.firstChild),t.element.style.flex=`1 1 0px`}function fn(e){return Number(e.element.style.getPropertyValue(`--_mx-z`))||0}function Q(e,t,n){return t>=e.left&&t<e.right&&n>=e.top&&n<e.bottom}function pn(e){let t=e.ownerDocument.defaultView;return!!t&&t.getComputedStyle(e).direction===`rtl`}var $={left:`tabDocsAreaLeft`,right:`tabDocsAreaRight`,top:`tabDocsAreaTop`,bottom:`tabDocsAreaBottom`};function mn(e,t,n){let r=e.tabs.filter(e=>e.document!==t&&e.document.pinned).length;return n<r?!0:n>r?!1:null}function hn(e){return!!e.ownerDocument.defaultView?.matchMedia?.(`(pointer: coarse)`).matches}function gn(e){return!!e?.matchMedia?.(`(display-mode: standalone), (display-mode: window-controls-overlay)`).matches}var _n=`import { reactive } from '@motifx/core';\r
import { TabDocumentManager } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
/**\r
 * Two managers with the same \`dragGroup\` take each other's tabs and groups. The content moves with\r
 * its tab, it is not recreated, so an edit in a moved tab is preserved.\r
 */\r
export default function BetweenManagers() {\r
  const s = reactive({ last: 'Drag a tab from one manager to the other.' });\r
  const style = 'block-size: 28rem; flex: 1 1 0px; min-inline-size: 0';\r
  // Narrow side by side, they still show as on a desktop (see the Tablet and phone page).\r
  const left = new TabDocumentManager({ label: 'Project files', dragGroup: 'files', presentation: 'desktop' });\r
  const right = new TabDocumentManager({ label: 'Pinned files', dragGroup: 'files', presentation: 'desktop' });\r
  left.element.style.cssText = style;\r
  right.element.style.cssText = style;\r
  for (const file of FILES.slice(0, 5)) left.open(fileDocument(file.path), { index: 99 });\r
  for (const file of FILES.slice(5)) right.open(fileDocument(file.path), { index: 99 });\r
  for (const docs of [left, right]) {\r
    docs.onOpened((e) => {\r
      if (e.byUser) s.last = \`\${e.document.title} came into \${docs.label}\`;\r
    });\r
  }\r
\r
  return (\r
    <>\r
      <div style="display: flex; gap: var(--mx-space-3); inline-size: 100%">\r
        {left}\r
        {right}\r
      </div>\r
      <output class="td-state">{() => s.last}</output>\r
    </>\r
  );\r
}\r
`,vn=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Switch, TabDocumentManager } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
import { explorer, outline, output, problems, toolDocument } from './tools';\r
\r
/**\r
 * The bars of dock areas and floating windows are compact: tabs shrink before the strip scrolls, a\r
 * single document shows as a title, and only the pin and the close button (a window's own close\r
 * button) stay beside one "…" menu. Each part is a setting for every area and window, and an area\r
 * may have its own.\r
 */\r
export default function CompactBars() {\r
  const s = reactive({ compact: true, small: true, scroll: false, title: true, shrink: true, leftScroll: false });\r
  const docs = new TabDocumentManager({\r
    label: 'Files with compact tool bars',\r
    minGroupWidth: 120,\r
    dockAreaSize: { left: 230, bottom: 130 },\r
    compactBarButtons: () => (s.compact ? 'auto' : 'all'),\r
    compactBarButtonSize: () => (s.small ? 'small' : 'normal'),\r
    compactScrollButtons: () => s.scroll,\r
    compactSingleTabTitle: () => s.title,\r
    compactTabSize: () => (s.shrink ? 'shrink' : 'fit'),\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  const open = (path: string) => docs.open(docs.findDocument(path) ?? fileDocument(path), { focus: true });\r
  for (const file of FILES.slice(0, 3)) docs.open(fileDocument(file.path), { index: 99 });\r
  docs.dock(\r
    toolDocument('explorer', 'Explorer', () => explorer(open)),\r
    'left',\r
  );\r
  docs.dock(toolDocument('outline', 'Outline', outline), 'left');\r
  docs.dock(toolDocument('problems', 'Problems', problems), 'left');\r
  docs.dock(toolDocument('output', 'Output', output), 'bottom');\r
  // This area's own setting takes precedence over the manager's (null returns to the manager's).\r
  docs.dockArea('left')!.scrollButtons = () => (s.leftScroll ? true : null);\r
  const float = () => {\r
    const doc = docs.findDocument('README.md') ?? docs.open(fileDocument('README.md'))!;\r
    const box = docs.element.getBoundingClientRect();\r
    docs.float(doc, { x: box.right - 340, y: box.top + 60, width: 300, height: 200 });\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Switch label="Compact bars" x-model={() => s.compact} />\r
        <Switch label="Small buttons" x-model={() => s.small} />\r
        <Switch label="Scroll buttons" x-model={() => s.scroll} />\r
        <Switch label="One document as a title" x-model={() => s.title} />\r
        <Switch label="Tabs shrink" x-model={() => s.shrink} />\r
        <Switch label="Left area: scroll buttons" x-model={() => s.leftScroll} />\r
        <Button text="Float README.md" variant="outline" onclick={float} />\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,yn=`import { reactive } from '@motifx/core';\r
import { Stack, Switch, TabDocumentManager } from '@motifx-community/ui';\r
import { FILES, fileDocument, source } from './files';\r
\r
/**\r
 * Right-click a tab (or press Shift+F10 on it) for its menu, and the empty strip for the group's.\r
 * \`onContextMenuOpening\` adds an item for files, and a double-click on the empty strip creates a new file.\r
 */\r
export default function ContextMenus() {\r
  const s = reactive({ menus: true, copy: true, split: true, made: 0, said: '' });\r
  const docs = new TabDocumentManager({\r
    label: 'Files with menus',\r
    contextMenu: () => s.menus,\r
    menuItems: () => ({ copyTitle: s.copy, splitUp: s.split, splitDown: s.split, splitLeft: s.split, splitRight: s.split }),\r
    newDocument: () => {\r
      const n = ++s.made;\r
      return { id: \`untitled-\${n}\`, title: \`Untitled-\${n}\`, content: () => source('') };\r
    },\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  docs.onContextMenuOpening((e) => {\r
    const doc = e.document;\r
    if (doc?.type !== 'file') return;\r
    e.items.push({ text: 'Show the path', beginGroup: true, click: () => (s.said = String(doc.id)) });\r
  });\r
  for (const file of FILES.slice(0, 4)) docs.open(fileDocument(file.path), { index: 99 });\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Switch label="Context menus" x-model={() => s.menus} />\r
        <Switch label="Copy the title" x-model={() => s.copy} />\r
        <Switch label="Split items" x-model={() => s.split} />\r
        <output class="td-state">{() => (s.said ? \`path: \${s.said}\` : 'Right-click a tab, or the strip after the tabs')}</output>\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,bn=`import { reactive } from '@motifx/core';\r
import { TabDocumentManager } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
import { explorer, outline, output, problems, toolDocument } from './tools';\r
\r
/**\r
 * A code editor's layout: the files in the middle, the explorer and the outline folded at the left\r
 * edge (point at a title, or click it), problems and output docked at the bottom. Drag a tab or a\r
 * group: guides show over the group under the pointer and at the edges; let go away from them to\r
 * float it in a window of its own. The close button of an area hides its tool (a tool cannot\r
 * close): "Show hidden" in the strip's menu or the "…" menu brings it back where it was.\r
 */\r
export default function DockIde() {\r
  const s = reactive({ last: 'Drag a tab: the guides show where it can go.' });\r
  const docs = new TabDocumentManager({ label: 'Editor with tool areas', dockGuides: true, minGroupWidth: 120, dockAreaSize: { left: 220, bottom: 150 } });\r
  docs.element.style.cssText = 'block-size: 30rem; inline-size: 100%';\r
  const open = (path: string) => docs.open(docs.findDocument(path) ?? fileDocument(path), { focus: true });\r
  for (const file of FILES.slice(0, 3)) docs.open(fileDocument(file.path), { index: 99 });\r
  docs.dock(\r
    toolDocument('explorer', 'Explorer', () => explorer(open)),\r
    'left',\r
  );\r
  docs.dock(toolDocument('outline', 'Outline', outline), 'left');\r
  docs.dock(toolDocument('problems', 'Problems', problems), 'bottom');\r
  docs.dock(toolDocument('output', 'Output', output), 'bottom');\r
  docs.autoHide(docs.dockArea('left')!);\r
  docs.onFloated((e) => (s.last = \`\${e.document?.title ?? 'A group'} floats in a window.\`));\r
  docs.onDocked((e) => (s.last = \`\${e.document?.title ?? 'A group'} docked \${e.side ? \`on the \${e.side}\` : 'among the documents'}.\`));\r
  docs.onAutoHidden((e) => (s.last = \`The \${e.area.side} area \${e.on ? 'is folded to its edge' : 'is shown'}.\`));\r
  docs.onHidden((e) => (s.last = \`\${e.document.title} is hidden: "Show hidden" in the "…" menu brings it back.\`));\r
  docs.onShown((e) => (s.last = \`\${e.document.title} is back\${e.group.dockArea ? \` on the \${e.group.dockArea.side}\` : ''}.\`));\r
\r
  return (\r
    <>\r
      {docs}\r
      <output class="td-state">{() => s.last}</output>\r
    </>\r
  );\r
}\r
`,xn=`import { reactive } from '@motifx/core';\r
import { RadioGroup, Stack, Switch, TabDocumentManager, type TabDockSide } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
import { problems, toolDocument } from './tools';\r
\r
const SIDES: Record<string, readonly TabDockSide[]> = {\r
  all: ['left', 'right', 'top', 'bottom'],\r
  sides: ['left', 'right'],\r
  bottom: ['bottom'],\r
};\r
\r
/** Every part of docking and floating is a setting, live; package.json may not float, README.md docks only at the bottom. */\r
export default function DockOptions() {\r
  const s = reactive({ guides: true, float: true, dock: true, autoHide: true, inView: true, emptyWindows: true, hover: true, sides: 'all' });\r
  const docs = new TabDocumentManager({\r
    label: 'Files with dock settings',\r
    dockGuides: () => s.guides,\r
    allowFloat: () => s.float,\r
    allowDock: () => s.dock,\r
    allowAutoHide: () => s.autoHide,\r
    keepFloatingInView: () => s.inView,\r
    closeEmptyWindows: () => s.emptyWindows,\r
    autoHideHover: () => s.hover,\r
    dockSides: () => SIDES[s.sides],\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  for (const file of FILES.slice(4)) {\r
    const extra = file.path === 'package.json' ? { allowFloat: false } : file.path === 'README.md' ? { dockSides: ['bottom'] as TabDockSide[] } : {};\r
    docs.open(fileDocument(file.path, extra), { index: 99 });\r
  }\r
  docs.dock(toolDocument('problems', 'Problems', problems), 'right', 200);\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Switch label="Dock guides" x-model={() => s.guides} />\r
        <Switch label="Float" x-model={() => s.float} />\r
        <Switch label="Dock" x-model={() => s.dock} />\r
        <Switch label="Auto hide" x-model={() => s.autoHide} />\r
        <Switch label="Windows stay in view" x-model={() => s.inView} />\r
        <Switch label="Close empty windows" x-model={() => s.emptyWindows} />\r
        <Switch label="Slide out on hover" x-model={() => s.hover} />\r
      </Stack>\r
      <RadioGroup\r
        label="Dock areas"\r
        orientation="horizontal"\r
        items={[\r
          { value: 'all', text: 'All four sides' },\r
          { value: 'sides', text: 'Left and right' },\r
          { value: 'bottom', text: 'Bottom only' },\r
        ]}\r
        itemText="text"\r
        itemValue="value"\r
        x-model={() => s.sides}\r
      />\r
      {docs}\r
    </>\r
  );\r
}\r
`,Sn=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TabDocument, TabDocumentManager, type TabLayout, type TabLayoutDocument } from '@motifx-community/ui';\r
import { notes } from './contents';\r
import { fileDocument } from './files';\r
import { output, problems, toolDocument } from './tools';\r
\r
/** Recreates a saved document by its type. */\r
function restore(saved: TabLayoutDocument): TabDocument {\r
  if (saved.type === 'file') return fileDocument(saved.id);\r
  if (saved.type === 'tool') return toolDocument(saved.id, saved.title, saved.id === 'output' ? output : problems);\r
  return new TabDocument({ ...saved, content: () => notes(saved.title) });\r
}\r
\r
/** The whole layout as JSON: the documents, the dock areas (size, order, folded) and the floating windows (place, order, inside). */\r
export default function DockSaveRestore() {\r
  const s = reactive({ json: '', saved: null as TabLayout | null });\r
  const docs = new TabDocumentManager({ label: 'Saved layout with windows and areas', dockGuides: true });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  docs.open(restore({ id: 'src/app.ts', type: 'file', title: 'app.ts' }));\r
  docs.open(restore({ id: 'notes', type: 'notes', title: 'Notes' }));\r
  docs.dock(restore({ id: 'problems', type: 'tool', title: 'Problems' }), 'bottom', 140);\r
  docs.dock(restore({ id: 'output', type: 'tool', title: 'Output' }), 'right', '30%');\r
\r
  const save = () => {\r
    s.saved = docs.saveLayout();\r
    s.json = JSON.stringify(s.saved, null, 2);\r
  };\r
  const load = () => {\r
    if (s.saved) docs.loadLayout(s.saved, restore);\r
  };\r
  save();\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Save layout" variant="outline" onclick={save} />\r
        <Button text="Restore layout" variant="outline" enabled={() => !!s.saved} onclick={load} />\r
        <Button text="Float Notes" variant="outline" onclick={() => docs.float(docs.findDocument('notes')!, { x: 120, y: 140, width: 380, height: 260 })} />\r
      </Stack>\r
      {docs}\r
      <pre class="td-json" tabindex="0" aria-label="The saved layout" style="max-block-size: 14rem; overflow: auto; inline-size: 100%">\r
        {() => s.json}\r
      </pre>\r
    </>\r
  );\r
}\r
`,Cn=`import { reactive } from '@motifx/core';\r
import { TabDocumentManager, type TabDroppedEventArgs } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
/** What a drop did, in a few words. */\r
function describe(e: TabDroppedEventArgs): string {\r
  const what = e.document?.title ?? 'a group';\r
  const where = e.target === 'strip' ? \`place \${e.index + 1} of a strip\` : e.target === 'edge' ? \`the \${e.side} edge\` : e.side === 'center' ? 'a group' : \`the \${e.side} of a group\`;\r
  return \`\${what} \${e.copy ? 'copied' : 'moved'} to \${where}\`;\r
}\r
\r
/**\r
 * Drag a tab along its strip, onto another strip, into a group (the middle of its content) or\r
 * beside it (an edge), or along an edge of the whole layout. Drag a group by the empty part of its\r
 * bar or by its handle. Hold Ctrl (Option on a Mac) while dropping for a copy; Escape puts everything back.\r
 */\r
export default function DragDrop() {\r
  const s = reactive({ last: 'Drag a tab, or a group by its handle.' });\r
  // Narrow groups, for the narrow column of this page; a handle drags a group whose tabs fill its bar.\r
  const docs = new TabDocumentManager({ label: 'Files to drag', allowDuplicate: true, minGroupWidth: 100, groupDragHandle: true });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  for (const file of FILES.slice(0, 4)) docs.open(fileDocument(file.path), { index: 99 });\r
  const right = docs.split(docs.activeGroup!, 'right')!;\r
  for (const file of FILES.slice(4, 6)) right.open(fileDocument(file.path), { index: 99 });\r
  const below = docs.split(right, 'down')!;\r
  for (const file of FILES.slice(6)) below.open(fileDocument(file.path), { index: 99 });\r
  docs.onDropped((e) => (s.last = describe(e)));\r
  docs.onDragEnded((e) => {\r
    if (!e.dropped) s.last = 'Nothing moved.';\r
  });\r
\r
  return (\r
    <>\r
      {docs}\r
      <output class="td-state">{() => s.last}</output>\r
    </>\r
  );\r
}\r
`,wn=`import { reactive } from '@motifx/core';\r
import { RadioGroup, Stack, Switch, TabDocumentManager, type TabDropSide } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
const SIDES: Record<string, readonly TabDropSide[]> = {\r
  all: ['center', 'left', 'right', 'up', 'down'],\r
  sides: ['left', 'right'],\r
  center: ['center'],\r
};\r
\r
/** Every part of drag and drop is a setting, live; a group can take no drops at all. */\r
export default function DragOptions() {\r
  const s = reactive({ allowDrag: true, allowDragGroups: true, pinOnDrag: true, layoutEdgeDrop: true, hover: true, ghost: true, sides: 'all', closed: false });\r
  const docs = new TabDocumentManager({\r
    label: 'Files with drag settings',\r
    allowDrag: () => s.allowDrag,\r
    allowDragGroups: () => s.allowDragGroups,\r
    pinOnDrag: () => s.pinOnDrag,\r
    layoutEdgeDrop: () => s.layoutEdgeDrop,\r
    dragHoverActivate: () => s.hover,\r
    dragGhost: () => s.ghost,\r
    dropSides: () => SIDES[s.sides],\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  FILES.slice(0, 5).forEach((file, i) => docs.open(fileDocument(file.path), { index: 99, pinned: i < 2 }));\r
  const second = docs.split(docs.activeGroup!, 'right')!;\r
  for (const file of FILES.slice(5)) second.open(fileDocument(file.path), { index: 99 });\r
  second.allowDrop = () => !s.closed;\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Switch label="Drag tabs" x-model={() => s.allowDrag} />\r
        <Switch label="Drag groups" x-model={() => s.allowDragGroups} />\r
        <Switch label="Pin across the border" x-model={() => s.pinOnDrag} />\r
        <Switch label="Layout edges" x-model={() => s.layoutEdgeDrop} />\r
        <Switch label="Activate on hover" x-model={() => s.hover} />\r
        <Switch label="Copy under the pointer" x-model={() => s.ghost} />\r
        <Switch label="Group 2 takes nothing" x-model={() => s.closed} />\r
      </Stack>\r
      <RadioGroup\r
        label="Drops on a group"\r
        orientation="horizontal"\r
        items={[\r
          { value: 'all', text: 'Centre and edges' },\r
          { value: 'sides', text: 'Left and right only' },\r
          { value: 'center', text: 'Centre only' },\r
        ]}\r
        itemText="text"\r
        itemValue="value"\r
        x-model={() => s.sides}\r
      />\r
      {docs}\r
    </>\r
  );\r
}\r
`,Tn=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Switch, TabDocument, TabDocumentManager } from '@motifx-community/ui';\r
import { customerForm } from './contents';\r
\r
/**\r
 * One customer open in two groups: each copy has a form of its own over the same data, and both\r
 * tabs follow the title and the unsaved changes. Splitting copies the document; turned off, it moves.\r
 */\r
export default function Duplicates() {\r
  const s = reactive({ allow: true });\r
  const saved = reactive({ name: 'Ada Lovelace', email: 'ada@example.com', city: 'London' });\r
  const ada = reactive({ ...saved });\r
  const docs = new TabDocumentManager({ label: 'Two copies', allowDuplicate: () => s.allow });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  const doc = docs.open(\r
    new TabDocument({\r
      id: 'ada',\r
      type: 'customer',\r
      title: () => ada.name || 'New customer',\r
      dirty: () => ada.name !== saved.name || ada.email !== saved.email || ada.city !== saved.city,\r
      content: () => customerForm(ada),\r
    }),\r
  )!;\r
  docs.split(docs.groups[0], 'right', doc);\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Switch label="Allow two copies" x-model={() => s.allow} />\r
        <Button text="Split the active group" variant="outline" onclick={() => docs.activeGroup && docs.split(docs.activeGroup, 'down', docs.activeDocument ?? undefined)} />\r
        <Button text="Save" variant="outline" enabled={() => doc.dirty} onclick={() => Object.assign(saved, { ...ada })} />\r
        <output class="td-state">{() => \`\${docs.documents.length} tab(s) for \${new Set(docs.documents.map((d) => d.id)).size} document(s)\`}</output>\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,En=`import { Button, Stack, TabDocumentManager } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
/** Floating windows by code: float a document, move, resize and maximize its window, dock it back or to a side, close it. */\r
export default function FloatProgrammatically() {\r
  const docs = new TabDocumentManager({ label: 'Files to float' });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  for (const file of FILES.slice(0, 5)) docs.open(fileDocument(file.path), { index: 99 });\r
  const readme = () => docs.findDocument('README.md') ?? docs.open(fileDocument('README.md'))!;\r
  // The manager's own lists are reactive: the window shown is the one in front.\r
  const front = () => docs.floatingWindows.at(-1) ?? null;\r
  const rect = () => {\r
    const w = front();\r
    if (!w) return 'No floating window.';\r
    const r = w.rect;\r
    return \`Window at \${r.x}, \${r.y}, \${r.width} × \${r.height}\${w.isMaximized ? ', maximized' : ''}.\`;\r
  };\r
  const on = () => !!front();\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Float README.md" variant="outline" enabled={() => !front()} onclick={() => docs.float(readme(), { x: 80, y: 120, width: 420, height: 280 })} />\r
        <Button text="Move" variant="outline" enabled={on} onclick={() => front()?.move(front()!.rect.x + 40, front()!.rect.y + 20)} />\r
        <Button text="Wider" variant="outline" enabled={on} onclick={() => front()?.resize(front()!.rect.width + 60, front()!.rect.height)} />\r
        <Button text="Maximize or restore" variant="outline" enabled={on} onclick={() => (front()?.isMaximized ? front()?.restore() : front()?.maximize())} />\r
        <Button text="Dock back" variant="outline" enabled={on} onclick={() => front()?.dock()} />\r
        <Button text="Dock right" variant="outline" enabled={on} onclick={() => front()?.dock('right', '35%')} />\r
        <Button text="Close window" variant="outline" enabled={on} onclick={() => void front()?.close()} />\r
      </Stack>\r
      {docs}\r
      <output class="td-state">{() => rect()}</output>\r
    </>\r
  );\r
}\r
`,Dn=`import { reactive, type Component } from '@motifx/core';\r
import { Button, Stack, TabDocumentManager } from '@motifx-community/ui';\r
import { FILES, fileDocument, source } from './files';\r
import { problems, toolDocument } from './tools';\r
\r
/**\r
 * A manager that follows its own width (\`presentation: 'auto'\`): drag the frame's corner, or pick a\r
 * width. Under 560 pixels it shows as on a phone; under 1024 as on a tablet when the screen is a touch\r
 * screen (with a mouse it stays a desktop). A text and a scroll position are kept across every change:\r
 * the content moves and is never recreated.\r
 */\r
export default function FollowsWidth() {\r
  const s = reactive({ shown: '', typed: '' });\r
  let frame!: Component<HTMLDivElement>;\r
  const docs = new TabDocumentManager({ label: 'Editor that follows its width' });\r
  docs.element.style.cssText = 'block-size: 100%; inline-size: 100%';\r
  docs.open(\r
    { id: 'note', title: 'Note', content: () => <textarea aria-label="Note" style="display: block; box-sizing: border-box; inline-size: 100%; block-size: 100%; padding: var(--mx-space-3); font: inherit; border: 0; resize: none" x-model={() => s.typed} /> },\r
    { index: 99 },\r
  );\r
  for (const file of FILES.slice(0, 4)) docs.open(fileDocument(file.path), { index: 99 });\r
  // A long one: a plain swipe over it scrolls it, on a phone too.\r
  docs.open({ id: 'log', title: 'Build log', content: () => source(Array.from({ length: 80 }, (_, i) => \`\${String(i + 1).padStart(3, ' ')}  step \${i + 1} done\`).join('\\n')) }, { index: 99 });\r
  docs.split(docs.activeGroup!, 'right', docs.findDocument('src/orders/index.ts')!);\r
  docs.dock(toolDocument('problems', 'Problems', problems), 'bottom');\r
  docs.activate(docs.findDocument('note')!);\r
  docs.onPresentationChanged((e) => (s.shown = \`\${e.to} at \${e.width} px\`));\r
  const width = (px: string) => (frame.element.style.inlineSize = px);\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="390 px" variant="outline" onclick={() => width('390px')} />\r
        <Button text="720 px" variant="outline" onclick={() => width('720px')} />\r
        <Button text="Full width" variant="outline" onclick={() => width('100%')} />\r
        <output class="td-state">{() => s.shown || \`Shown as: \${docs.currentPresentation}\`}</output>\r
      </Stack>\r
      <div\r
        ref={(c: Component<HTMLDivElement>) => (frame = c)}\r
        class="td-frame"\r
        style="box-sizing: border-box; inline-size: 100%; max-inline-size: 100%; min-inline-size: 18rem; block-size: 30rem; overflow: hidden; resize: horizontal; border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg)"\r
      >\r
        {docs}\r
      </div>\r
    </>\r
  );\r
}\r
`,On=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TabDocumentManager } from '@motifx-community/ui';\r
import { notes } from './contents';\r
\r
/** A locked group keeps what it has: documents opened without naming a group go elsewhere, into a new group when every one is locked. */\r
export default function Locked() {\r
  const s = reactive({ opened: 0, log: [] as { id: number; text: string }[] });\r
  const docs = new TabDocumentManager({ label: 'Notes and a terminal' });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  const write = (text: string) => s.log.unshift({ id: s.log.length, text });\r
  docs.onLocked((e) => write(\`group \${e.group.index + 1} locked\`));\r
  docs.onUnlocked((e) => write(\`group \${e.group.index + 1} unlocked\`));\r
  docs.onOpened((e) => write(\`\${e.document.title} opened in group \${e.group.index + 1}\`));\r
  docs.open({ id: 'terminal', title: 'Terminal', content: () => notes('Terminal') });\r
  docs.lock(docs.groups[0]);\r
  docs.split(docs.groups[0], 'right');\r
\r
  const open = () => {\r
    const n = ++s.opened;\r
    docs.open({ id: \`note-\${n}\`, title: \`Note \${n}\`, content: () => notes(\`Note \${n}\`) });\r
  };\r
  const toggle = (index: number) => {\r
    const group = docs.groups[index];\r
    if (group) (group.locked ? docs.unlock(group) : docs.lock(group));\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Open a note" variant="outline" onclick={open} />\r
        <Button text={() => (docs.groups[0]?.locked ? 'Unlock group 1' : 'Lock group 1')} variant="outline" onclick={() => toggle(0)} />\r
        <Button text={() => (docs.groups[1]?.locked ? 'Unlock group 2' : 'Lock group 2')} variant="outline" enabled={() => docs.groups.length > 1} onclick={() => toggle(1)} />\r
        <output class="td-state">{() => s.log.slice(0, 3).map((l) => l.text).join('; ')}</output>\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,kn=`import { reactive } from '@motifx/core';\r
import { Button, RadioGroup, Stack, TabDocument, TabDocumentManager, type TabShowDescription } from '@motifx-community/ui';\r
import { notes } from './contents';\r
import { fileDocument } from './files';\r
\r
/** A count or a dot on the tab, a color for what the document needs, and a description only where two titles are the same. */\r
export default function Look() {\r
  const s = reactive({ unread: 3, errors: 1, description: 'duplicates' as TabShowDescription });\r
  const docs = new TabDocumentManager({ label: 'Badges and tones', showDescription: () => s.description });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  docs.open(new TabDocument({ id: 'inbox', title: 'Inbox', badge: () => s.unread || null, tone: () => (s.unread ? 'accent' : null), content: () => notes('Inbox') }));\r
  docs.open(new TabDocument({ id: 'build', title: 'Build', badge: () => s.errors || null, tone: () => (s.errors ? 'danger' : 'success'), content: () => notes('Build') }), { index: 99 });\r
  docs.open(new TabDocument({ id: 'quota', title: 'Quota', badge: true, tone: 'warning', content: () => notes('Quota') }), { index: 99 });\r
  docs.open(fileDocument('src/index.ts'), { index: 99 });\r
  docs.open(fileDocument('src/orders/index.ts'), { index: 99 });\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Button text="New mail" variant="outline" onclick={() => s.unread++} />\r
        <Button text="Read all" variant="outline" onclick={() => (s.unread = 0)} />\r
        <Button text={() => (s.errors ? 'Fix the build' : 'Break the build')} variant="outline" onclick={() => (s.errors = s.errors ? 0 : 2)} />\r
        <RadioGroup\r
          label="Description"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'duplicates', text: 'Same titles' },\r
            { value: 'always', text: 'Always' },\r
            { value: 'never', text: 'Never' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.description}\r
        />\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,An=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TabDocumentManager } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
/**\r
 * "Move to…" (the tab's menu, Ctrl+K M, or these buttons): the arrow keys choose a side of a group,\r
 * an arrow towards it again goes on to the next group, Tab picks the next group, Enter moves,\r
 * Escape leaves it. The same areas as a drag show where it goes.\r
 */\r
export default function MoveWithKeys() {\r
  const s = reactive({ place: 'Press a button, or Ctrl+K M on a tab.' });\r
  const docs = new TabDocumentManager({ label: 'Files to move with keys' });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  for (const file of FILES.slice(0, 4)) docs.open(fileDocument(file.path), { index: 99 });\r
  const right = docs.split(docs.activeGroup!, 'right')!;\r
  for (const file of FILES.slice(4)) right.open(fileDocument(file.path), { index: 99 });\r
  docs.onDragOver((e) => {\r
    if (e.byKeyboard) s.place = e.target === 'edge' ? \`the \${e.side} edge of the layout\` : \`group \${(e.group?.index ?? 0) + 1}, \${e.side}\`;\r
  });\r
  docs.onDragEnded((e) => (s.place = e.dropped ? 'Moved.' : 'Left where it was.'));\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Move to…" variant="outline" enabled={() => !!docs.activeDocument} onclick={() => docs.showMoveTo(docs.activeDocument!)} />\r
        <Button text="Move group to…" variant="outline" enabled={() => docs.groups.length > 1} onclick={() => docs.showMoveTo(docs.activeGroup!)} />\r
        <output class="td-state">{() => s.place}</output>\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,jn=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TabDocument, TabDocumentManager } from '@motifx-community/ui';\r
import { customerCard, notes, ordersGrid } from './contents';\r
\r
/** A document moves into a browser window of its own and back; what was typed, chosen and scrolled stays as it was. */\r
export default function NewWindow() {\r
  const customer = reactive({ name: 'Ada Lovelace', email: 'ada@example.com', city: 'London' });\r
  const docs = new TabDocumentManager({ label: 'Documents in new windows' });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  docs.open(new TabDocument({ id: 'customer', title: 'Customer', tooltip: () => \`Customer: \${customer.name}\`, content: () => customerCard(customer) }));\r
  docs.open(new TabDocument({ id: 'orders', title: 'Orders', content: () => ordersGrid(60) }));\r
  docs.open(new TabDocument({ id: 'notes', title: 'Notes', content: () => notes('Notes') }));\r
\r
  const active = () => docs.activeDocument;\r
  const windows = () => {\r
    const list = docs.browserWindows;\r
    if (!list.length) return 'Every document is in this window.';\r
    return list.map((w, i) => \`Window \${i + 1}: \${w.documents.map((d) => d.title).join(', ')}\`).join('. ') + '.';\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Move the active document into a new window" variant="outline" enabled={() => !!active() && !active()!.browserWindow} onclick={() => docs.moveToNewWindow(active()!)} />\r
        <Button text="Move its group" variant="outline" enabled={() => !!docs.activeGroup && !docs.activeGroup.browserWindow} onclick={() => docs.moveToNewWindow(docs.activeGroup!)} />\r
        <Button text="Bring everything back" variant="outline" enabled={() => docs.browserWindows.length > 0} onclick={() => docs.browserWindows.forEach((w) => w.moveToMainWindow())} />\r
      </Stack>\r
      {docs}\r
      <output class="td-state">{() => \`\${windows()} Customer: \${customer.name}, \${customer.city}.\`}</output>\r
    </>\r
  );\r
}\r
`,Mn=`import { reactive } from '@motifx/core';\r
import { RadioGroup, Stack, TabDocumentManager, type TabListScope } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
const FormatIcon = () => (\r
  <svg viewBox="0 0 16 16" aria-hidden="true">\r
    <path d="M3 4h10M3 8h6M3 12h8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />\r
  </svg>\r
);\r
\r
const RunIcon = () => (\r
  <svg viewBox="0 0 16 16" aria-hidden="true">\r
    <path d="M5 3.5v9l7-4.5z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />\r
  </svg>\r
);\r
\r
/**\r
 * The "…" button lists the group's documents to search and open, with close all, close saved and\r
 * lock under them. The app adds its own buttons: "Run" for every group, "Format" while a file of code is active.\r
 */\r
export default function OpenList() {\r
  const s = reactive({ scope: 'group' as TabListScope, runs: 0, formatted: '' });\r
  const docs = new TabDocumentManager({\r
    label: 'Open documents',\r
    openListScope: () => s.scope,\r
    toolbarItems: (group) => [{ icon: () => <RunIcon />, hint: () => \`Run group \${group.index + 1}\`, tone: 'accent', click: () => s.runs++ }],\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  for (const file of FILES) {\r
    const code = file.path.endsWith('.ts');\r
    const doc = fileDocument(file.path, code ? { actions: [{ icon: () => <FormatIcon />, hint: 'Format', click: () => (s.formatted = file.path) }] } : {});\r
    docs.open(doc, { index: 99, group: file.path.startsWith('src/') ? docs.groups[0] : (docs.groups[1] ?? docs.split(docs.groups[0], 'right')!) });\r
  }\r
  docs.findDocument('src/app.ts')!.dirty = true;\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <RadioGroup\r
          label="The list shows"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'group', text: "The group's documents" },\r
            { value: 'all', text: 'Every group' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.scope}\r
        />\r
        <output class="td-state">{() => \`runs: \${s.runs}\${s.formatted ? \`; formatted \${s.formatted}\` : ''}\`}</output>\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,Nn=`import { reactive } from '@motifx/core';\r
import { RadioGroup, Stack, Switch, TabDocument, TabDocumentManager, type ContentLifetime, type TabCloseButton } from '@motifx-community/ui';\r
import { notes } from './contents';\r
\r
/** Every behavior is a prop tracked at runtime, bound here to the switches above the manager. */\r
export default function Options() {\r
  const s = reactive({\r
    closeButton: 'always' as TabCloseButton,\r
    lifetime: 'keep' as ContentLifetime,\r
    closeEmptyGroups: true,\r
    groupActions: true,\r
    manual: false,\r
    built: 0,\r
  });\r
\r
  const docs = new TabDocumentManager({\r
    label: 'Live options',\r
    closeButton: () => s.closeButton,\r
    contentLifetime: () => s.lifetime,\r
    closeEmptyGroups: () => s.closeEmptyGroups,\r
    groupActions: () => s.groupActions,\r
    activation: () => (s.manual ? 'manual' : 'auto'),\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  for (const name of ['Alpha', 'Beta', 'Gamma', 'Delta']) {\r
    docs.open(\r
      new TabDocument({\r
        id: name.toLowerCase(),\r
        title: name,\r
        dirty: name === 'Gamma',\r
        closable: name !== 'Alpha',\r
        content: () => {\r
          s.built++;\r
          return notes(name);\r
        },\r
      }),\r
    );\r
  }\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <RadioGroup\r
          label="Close button"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'always', text: 'Always' },\r
            { value: 'active', text: 'Active and hover' },\r
            { value: 'never', text: 'Never' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.closeButton}\r
        />\r
        <RadioGroup\r
          label="Content lifetime"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'keep', text: 'Keep' },\r
            { value: 'lazy', text: 'Lazy' },\r
            { value: 'dispose', text: 'Dispose' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.lifetime}\r
        />\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Switch label="Close empty groups" x-model={() => s.closeEmptyGroups} />\r
        <Switch label="Group buttons" x-model={() => s.groupActions} />\r
        <Switch label="Manual activation" x-model={() => s.manual} />\r
        <output class="td-built">{() => \`contents built: \${s.built}\`}</output>\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,Pn=`import { reactive } from '@motifx/core';\r
import { TabDocument, TabDocumentManager } from '@motifx-community/ui';\r
import { customerForm, notes, ordersGrid } from './contents';\r
\r
/** Three kinds of content in two groups: a form, a grid and plain text. */\r
export default function Overview() {\r
  const docs = new TabDocumentManager({ label: 'Workspace' });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
\r
  const ada = reactive({ name: 'Ada Lovelace', email: 'ada@example.com', city: 'London' });\r
  docs.open(new TabDocument({ id: 'ada', type: 'customer', title: () => ada.name || 'New customer', description: 'Customers', content: () => customerForm(ada) }));\r
  docs.open(new TabDocument({ id: 'orders', type: 'orders', title: 'Orders', badge: 60, content: () => ordersGrid() }));\r
  const readme = docs.open(new TabDocument({ id: 'readme', type: 'notes', title: 'Read me', content: () => notes('Read me') }))!;\r
  docs.split(docs.groups[0], 'right', readme);\r
  docs.activate(docs.findDocument('orders')!);\r
\r
  return <>{docs}</>;\r
}\r
`,Fn=`import { reactive } from '@motifx/core';\r
import { Button, RadioGroup, Stack, Switch, TabDocumentManager, type PinnedTabSize } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
/** Pinned tabs stay first, in the order they were pinned. Their pin mark unpins them; the menu and Ctrl+K Shift+Enter do too. */\r
export default function Pinning() {\r
  const s = reactive({ size: 'normal' as PinnedTabSize, separateRow: false, closeButton: false, keepPinned: true });\r
  const docs = new TabDocumentManager({\r
    label: 'Files with pinned tabs',\r
    pinnedTabSize: () => s.size,\r
    pinnedTabsOnSeparateRow: () => s.separateRow,\r
    closeButtonOnPinned: () => s.closeButton,\r
    keepPinned: () => s.keepPinned,\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  for (const file of FILES) docs.open(fileDocument(file.path), { index: 99, pinned: file.path === 'README.md' || file.path === 'package.json' });\r
\r
  const toggle = () => {\r
    const doc = docs.activeDocument;\r
    if (doc) (doc.pinned ? docs.unpin(doc) : docs.pin(doc));\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <RadioGroup\r
          label="Pinned tab size"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'normal', text: 'Normal' },\r
            { value: 'compact', text: 'Compact' },\r
            { value: 'shrink', text: 'Shrink' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.size}\r
        />\r
        <Switch label="Row of their own" x-model={() => s.separateRow} />\r
        <Switch label="Close button" x-model={() => s.closeButton} />\r
        <Switch label="Close all keeps them" x-model={() => s.keepPinned} />\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text={() => (docs.activeDocument?.pinned ? 'Unpin active' : 'Pin active')} variant="outline" onclick={toggle} />\r
        <Button text="Close all" variant="outline" onclick={() => docs.closeAll()} />\r
        <Button text="Open the files again" variant="ghost" onclick={() => FILES.forEach((f) => docs.findDocument(f.path) || docs.open(fileDocument(f.path), { index: 99 }))} />\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,In=`import { reactive } from '@motifx/core';\r
import { RadioGroup, Stack, Switch, TabDocumentManager, type TabDockPresentation, type TabPresentation } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
import { outline, problems, toolDocument } from './tools';\r
\r
/**\r
 * Every part is a setting: how dock areas show on a phone and a tablet (the outline area says its\r
 * own), the swipe from an edge, the back button. onPresentationChanging can refuse a change: with\r
 * "Stay a phone" on, the phone does not go back to a tablet.\r
 */\r
export default function PresentationEvents() {\r
  const s = reactive({\r
    presentation: 'phone' as TabPresentation,\r
    phoneDock: 'sheet' as TabDockPresentation,\r
    tabletDock: 'auto' as TabDockPresentation,\r
    edge: true,\r
    back: true,\r
    stay: false,\r
    log: [] as string[],\r
  });\r
  const log = (line: string) => {\r
    s.log.push(line);\r
    if (s.log.length > 5) s.log.shift();\r
  };\r
  const docs = new TabDocumentManager({\r
    label: 'Editor with presentation settings',\r
    presentation: () => s.presentation,\r
    phoneDockMode: () => s.phoneDock,\r
    tabletDockMode: () => s.tabletDock,\r
    edgeSwipe: () => s.edge,\r
    backButton: () => s.back,\r
    onPresentationChanging: (e) => {\r
      log(\`changing \${e.from} → \${e.to}\`);\r
      if (s.stay && e.from === 'phone') e.cancel = true;\r
    },\r
    onPresentationChanged: (e) => log(\`changed to \${e.to}\`),\r
  });\r
  docs.element.style.cssText = 'block-size: 30rem; inline-size: 100%';\r
  for (const file of FILES.slice(0, 3)) docs.open(fileDocument(file.path), { index: 99 });\r
  docs.dock(toolDocument('problems', 'Problems', problems), 'bottom');\r
  docs.dock(toolDocument('outline', 'Outline', outline), 'right');\r
  // The outline's area chooses a drawer for itself on a phone.\r
  docs.dockArea('right')!.phoneDockMode = 'drawer';\r
  const modes = [\r
    { value: 'auto', text: 'Auto' },\r
    { value: 'sheet', text: 'Sheet' },\r
    { value: 'drawer', text: 'Drawer' },\r
    { value: 'hidden', text: 'Hidden' },\r
  ];\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <RadioGroup\r
          label="Presentation"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'tablet', text: 'Tablet' },\r
            { value: 'phone', text: 'Phone' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.presentation}\r
        />\r
        <Switch label="Stay a phone" x-model={() => s.stay} />\r
        <Switch label="Swipe from an edge" x-model={() => s.edge} />\r
        <Switch label="Back goes back" x-model={() => s.back} />\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <RadioGroup label="Dock areas on a phone" orientation="horizontal" items={modes} itemText="text" itemValue="value" x-model={() => s.phoneDock} />\r
        <RadioGroup label="On a tablet" orientation="horizontal" items={modes} itemText="text" itemValue="value" x-model={() => s.tabletDock} />\r
      </Stack>\r
      <output class="td-state">{() => s.log.join(' · ') || 'No changes yet.'}</output>\r
      {docs}\r
    </>\r
  );\r
}\r
`,Ln=`import { reactive } from '@motifx/core';\r
import { Button, RadioGroup, Stack, TabDocumentManager, type TabPresentation } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
import { explorer, outline, output, problems, toolDocument } from './tools';\r
\r
/**\r
 * One layout shown four ways: two groups (the second split again), the explorer and the outline on\r
 * the left, problems and output at the bottom, a floating window. Pick a presentation: the layout\r
 * stays the same (Save shows its JSON does not change), only where things show changes.\r
 */\r
export default function Presentations() {\r
  const s = reactive({ presentation: 'tablet' as TabPresentation, shown: '', saved: '' });\r
  const docs = new TabDocumentManager({ label: 'Editor shown as on a desktop, a tablet or a phone', presentation: () => s.presentation, minGroupWidth: 120 });\r
  docs.element.style.cssText = 'block-size: 32rem; inline-size: 100%; max-inline-size: 100%';\r
  const open = (path: string) => docs.open(docs.findDocument(path) ?? fileDocument(path), { focus: true });\r
  for (const file of FILES.slice(0, 3)) docs.open(fileDocument(file.path), { index: 99 });\r
  const right = docs.split(docs.activeGroup!, 'right', docs.findDocument('src/router.ts')!)!;\r
  right.open(fileDocument('README.md'));\r
  docs.split(right, 'down', docs.findDocument('README.md')!);\r
  docs.dock(\r
    toolDocument('explorer', 'Explorer', () => explorer(open)),\r
    'left',\r
  );\r
  docs.dock(toolDocument('outline', 'Outline', outline), 'left');\r
  docs.dock(toolDocument('problems', 'Problems', problems), 'bottom');\r
  docs.dock(toolDocument('output', 'Output', output), 'bottom');\r
  docs.float(docs.open(fileDocument('package.json'))!, { x: 80, y: 80, width: 360, height: 220 });\r
  docs.activate(docs.findDocument('src/index.ts')!);\r
  docs.onPresentationChanged((e) => (s.shown = \`\${e.from} → \${e.to} (\${e.width} px wide)\`));\r
  let first = '';\r
  const save = () => {\r
    const json = JSON.stringify(docs.saveLayout());\r
    first ||= json;\r
    s.saved = \`Saved as \${docs.currentPresentation}: \${json.length} characters, \${json === first ? 'the same as the first save' : 'not the same as the first save'}.\`;\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <RadioGroup\r
          label="Presentation"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'auto', text: 'By its width' },\r
            { value: 'desktop', text: 'Desktop' },\r
            { value: 'tablet', text: 'Tablet' },\r
            { value: 'phone', text: 'Phone' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.presentation}\r
        />\r
        <output class="td-state">{() => (s.shown ? \`Shown: \${s.shown}\` : \`Shown as: \${docs.currentPresentation}\`)}</output>\r
      </Stack>\r
      {docs}\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Save the layout" variant="outline" onclick={save} />\r
        <output class="td-state">{() => s.saved || 'The layout saves the same in every presentation.'}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,Rn=`import { reactive } from '@motifx/core';\r
import { Button, ListBox, Stack, Switch, TabDocumentManager } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
/**\r
 * Choosing a file opens it as a preview (in italics): the next one chosen takes its place. A double\r
 * click on the tab, an edit, "Keep open" or moving it makes it stay.\r
 */\r
export default function Preview() {\r
  const s = reactive({ previewTabs: true, kept: [] as string[] });\r
  // Narrow beside its log, it still shows as on a desktop (see the Tablet and phone page).\r
  const docs = new TabDocumentManager({ label: 'Files in preview', previewTabs: () => s.previewTabs, presentation: 'desktop' });\r
  docs.element.style.cssText = 'block-size: 28rem; flex: 1 1 0px; min-inline-size: 0';\r
  docs.onKept((e) => s.kept.unshift(e.document.title));\r
\r
  const show = (path: string | null) => {\r
    if (path) docs.open(docs.findDocument(path) ?? fileDocument(path), { preview: true });\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Switch label="Preview tabs" x-model={() => s.previewTabs} />\r
        <Button text="Keep open" variant="outline" enabled={() => !!docs.activeDocument?.preview} onclick={() => docs.keep(docs.activeDocument!)} />\r
        <output class="td-state">{() => \`preview: \${docs.activeGroup?.previewDocument?.title ?? 'none'}; kept: \${s.kept.join(', ') || 'none'}\`}</output>\r
      </Stack>\r
      <div style="display: flex; gap: var(--mx-space-3); inline-size: 100%">\r
        <ListBox\r
          label="Files"\r
          items={FILES}\r
          textField="path"\r
          valueField="path"\r
          height="28rem"\r
          style="inline-size: 14rem; flex: none"\r
          onValueChanged={(e) => show(e.value as string | null)}\r
        />\r
        {docs}\r
      </div>\r
    </>\r
  );\r
}\r
`,zn=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TabDocumentManager, type SplitDirection } from '@motifx-community/ui';\r
import { notes } from './contents';\r
\r
/** Everything the user does is a method too; the events report each change, by the user or by code. */\r
export default function Programmatic() {\r
  const log = reactive({ lines: [] as { id: number; text: string }[], next: 0, opened: 0 });\r
  const write = (text: string) => {\r
    log.lines.unshift({ id: log.next++, text });\r
    if (log.lines.length > 6) log.lines.pop();\r
  };\r
\r
  const docs = new TabDocumentManager({ label: 'Driven programmatically' });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  docs.onOpened((e) => write(\`opened \${e.document.title} in group \${e.group.index + 1}\`));\r
  docs.onClosed((e) => write(\`closed \${e.document.title}\${e.byUser ? ' (user)' : ''}\`));\r
  docs.onDocumentActivated((e) => write(\`active: \${e.document?.title ?? 'none'}\${e.byUser ? ' (user)' : ''}\`));\r
  docs.onMoved((e) => write(\`moved \${e.document.title} to group \${e.to.index + 1}\`));\r
  docs.onLayoutChanged((e) => write(\`layout: \${e.change}\${e.byUser ? ' (user)' : ''}\`));\r
\r
  const open = () => {\r
    const n = ++log.opened;\r
    docs.open({ id: \`page-\${n}\`, type: 'page', title: \`Page \${n}\`, content: () => notes(\`Page \${n}\`) });\r
  };\r
  const split = (direction: SplitDirection) => {\r
    const group = docs.activeGroup;\r
    if (group) docs.split(group, direction, group.documents.length > 1 ? (group.activeDocument ?? undefined) : undefined);\r
  };\r
  const moveOn = () => {\r
    const doc = docs.activeDocument;\r
    const groups = docs.groups;\r
    if (doc?.group && groups.length > 1) docs.move(doc, groups[(groups.indexOf(doc.group) + 1) % groups.length]);\r
  };\r
  const toggleMaximize = () => {\r
    const group = docs.activeGroup;\r
    if (docs.maximizedGroup) docs.restoreGroups();\r
    else if (group) docs.maximizeGroup(group);\r
  };\r
\r
  open();\r
  open();\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Open" variant="outline" onclick={open} />\r
        <Button text="Close active" variant="outline" onclick={() => docs.activeDocument && docs.close(docs.activeDocument)} />\r
        <Button text="Split right" variant="outline" onclick={() => split('right')} />\r
        <Button text="Split down" variant="outline" onclick={() => split('down')} />\r
        <Button text="Move to next group" variant="outline" onclick={moveOn} />\r
        <Button text={() => (docs.maximizedGroup ? 'Restore groups' : 'Maximize group')} variant="outline" onclick={toggleMaximize} />\r
        <Button text="Even sizes" variant="outline" onclick={() => docs.evenSizes()} />\r
        <Button text="Next tab" variant="ghost" onclick={() => docs.activateNext(null, true)} />\r
        <Button text="Focus group 1" variant="ghost" onclick={() => docs.focusGroup(0)} />\r
      </Stack>\r
      {docs}\r
      <output class="td-state">{() => \`\${docs.groups.length} group(s), \${docs.documents.length} document(s), active: \${docs.activeDocument?.title ?? 'none'}\`}</output>\r
      <ul class="td-log">\r
        {log.lines.map((line) => (\r
          <li key={line.id}>{line.text}</li>\r
        ))}\r
      </ul>\r
    </>\r
  );\r
}\r
`,Bn=`import { reactive } from '@motifx/core';\r
import { Button, RadioGroup, Stack, TabDocumentManager, type TabKeyPreset, type TabListScope } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
/**\r
 * Hold Ctrl and press E (Ctrl+Tab in an installed app) for the documents used last: E again walks\r
 * the list, Shift walks back, letting go of Ctrl opens one. Back and forward go over the documents\r
 * activated in every group; a closed document opens again where it was.\r
 */\r
export default function Recent() {\r
  const s = reactive({ scope: 'group' as TabListScope, preset: 'auto' as TabKeyPreset });\r
  const docs = new TabDocumentManager({ label: 'Recently used', recentListScope: () => s.scope, keyPreset: () => s.preset });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  for (const file of FILES.slice(0, 5)) docs.open(fileDocument(file.path), { index: 99 });\r
  docs.split(docs.groups[0], 'right', docs.findDocument('README.md') ?? undefined);\r
  docs.open(fileDocument('package.json'), { group: docs.groups[1] });\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <RadioGroup\r
          label="Recent list"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'group', text: 'This group' },\r
            { value: 'all', text: 'Every group' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.scope}\r
        />\r
        <RadioGroup\r
          label="Keys"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'auto', text: 'Auto' },\r
            { value: 'browser', text: 'Browser tab' },\r
            { value: 'desktop', text: 'Installed app' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.preset}\r
        />\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Recent list" variant="outline" onclick={() => docs.showRecentList()} />\r
        <Button text="Back" variant="outline" enabled={() => docs.canGoBack} onclick={() => docs.goBack()} />\r
        <Button text="Forward" variant="outline" enabled={() => docs.canGoForward} onclick={() => docs.goForward()} />\r
        <Button text="Reopen closed" variant="outline" enabled={() => docs.closedDocuments.length > 0} onclick={() => docs.reopenClosed()} />\r
        <output class="td-state">{() => \`keys: \${docs.keys.recentNext.join(' or ')}, \${docs.keys.goBack[0]}, \${docs.keys.reopenClosed[0]}\`}</output>\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,Vn=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TabDocument, TabDocumentManager, type TabLayout, type TabLayoutDocument } from '@motifx-community/ui';\r
import { notes, ordersGrid } from './contents';\r
\r
/** Recreates a saved document by its type, with its \`state\` providing what it needs. */\r
function restore(saved: TabLayoutDocument): TabDocument {\r
  if (saved.type === 'orders') return new TabDocument({ ...saved, content: () => ordersGrid((saved.state as { count: number }).count) });\r
  return new TabDocument({ ...saved, content: () => notes(saved.title) });\r
}\r
\r
/** The layout as JSON: change it (split, move, resize, close), save, change it again, restore. */\r
export default function SaveRestore() {\r
  const s = reactive({ json: '', saved: null as TabLayout | null });\r
  const docs = new TabDocumentManager({ label: 'Saved layout' });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  docs.open(restore({ id: 'orders', type: 'orders', title: 'Orders', state: { count: 40 } }));\r
  docs.open(restore({ id: 'notes', type: 'notes', title: 'Notes' }));\r
  docs.open(restore({ id: 'todo', type: 'notes', title: 'To do' }));\r
  docs.split(docs.groups[0], 'down', docs.findDocument('todo')!);\r
\r
  const save = () => {\r
    s.saved = docs.saveLayout();\r
    s.json = JSON.stringify(s.saved, null, 2);\r
  };\r
  const load = () => {\r
    if (s.saved) docs.loadLayout(s.saved, restore);\r
  };\r
  save();\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Save layout" variant="outline" onclick={save} />\r
        <Button text="Restore layout" variant="outline" enabled={() => !!s.saved} onclick={load} />\r
      </Stack>\r
      {docs}\r
      <pre class="td-json" tabindex="0" style="max-block-size: 14rem; overflow: auto; inline-size: 100%">\r
        {() => s.json}\r
      </pre>\r
    </>\r
  );\r
}\r
`,Hn=`import { reactive } from '@motifx/core';\r
import { RadioGroup, Stack, Switch, TabDocumentManager, type TabSize } from '@motifx-community/ui';\r
import { notes } from './contents';\r
\r
/** More tabs than fit: they scroll (wheel or buttons), shrink, take one width, or go on to more rows. */\r
export default function Sizing() {\r
  const s = reactive({ size: 'fit' as TabSize, wrap: false, buttons: true });\r
  const docs = new TabDocumentManager({\r
    label: 'Tab sizes',\r
    tabSize: () => s.size,\r
    wrapTabs: () => s.wrap,\r
    scrollButtons: () => s.buttons,\r
    tabMinWidth: 72,\r
    tabFixedWidth: 140,\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  const names = ['Overview', 'Customers', 'Orders', 'Invoices', 'Payments', 'Shipping', 'Returns', 'Products', 'Stock', 'Suppliers', 'Reports', 'Settings'];\r
  for (const name of names) docs.open({ id: name, title: name, content: () => notes(name) }, { index: 99 });\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <RadioGroup\r
          label="Tab size"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'fit', text: 'Fit' },\r
            { value: 'shrink', text: 'Shrink' },\r
            { value: 'fixed', text: 'Fixed' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.size}\r
        />\r
        <Switch label="More rows" x-model={() => s.wrap} />\r
        <Switch label="Scroll buttons" x-model={() => s.buttons} />\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,Un=`import { reactive } from '@motifx/core';\r
import { confirm, TabDocument, TabDocumentManager } from '@motifx-community/ui';\r
import { customerForm, type Customer } from './contents';\r
\r
const people: Customer[] = [\r
  { name: 'Grace Hopper', email: 'grace@example.com', city: 'New York' },\r
  { name: 'Alan Turing', email: 'alan@example.com', city: 'London' },\r
];\r
\r
/** Edit a field: the tab shows a dot in place of its close button, and closing it prompts first (\`e.promise\`). */\r
export default function UnsavedChanges() {\r
  const docs = new TabDocumentManager({ label: 'Customers' });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
\r
  for (const person of people) {\r
    const saved = { ...person };\r
    const customer = reactive({ ...person });\r
    docs.open(\r
      new TabDocument({\r
        id: person.email,\r
        type: 'customer',\r
        title: () => customer.name || 'New customer',\r
        dirty: () => customer.name !== saved.name || customer.email !== saved.email || customer.city !== saved.city,\r
        content: () => customerForm(customer),\r
      }),\r
    );\r
  }\r
\r
  docs.onClosing((e) => {\r
    if (e.document.dirty) e.promise = confirm(\`\${e.document.title} has unsaved changes. Close it anyway?\`, { title: 'Close', tone: 'caution' });\r
  });\r
\r
  return <>{docs}</>;\r
}\r
`,Wn=`import { reactive } from '@motifx/core';\r
import { Button, RadioGroup, Stack, TabDocument, TabDocumentManager, type TabLayout, type TabLayoutDocument, type TabRestoreWindows } from '@motifx-community/ui';\r
import { notes, ordersGrid } from './contents';\r
\r
/** Recreates a saved document by its type. */\r
function restore(saved: TabLayoutDocument): TabDocument {\r
  if (saved.type === 'orders') return new TabDocument({ ...saved, content: () => ordersGrid(40) });\r
  return new TabDocument({ ...saved, content: () => notes(saved.title) });\r
}\r
\r
/**\r
 * The layout saves its new windows too (place on the screen, layout). Loading puts them back as\r
 * floating windows, among the documents, or as windows again: a browser opens windows only on a\r
 * click, so the restore button, a click, may open them, and "Reopen windows" opens what was blocked.\r
 */\r
export default function WindowLayout() {\r
  const s = reactive({ json: '', saved: null as TabLayout | null, mode: 'float' as TabRestoreWindows });\r
  const docs = new TabDocumentManager({ label: 'Saved layout with new windows', restoreWindows: () => s.mode });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  docs.open(restore({ id: 'orders', type: 'orders', title: 'Orders' }));\r
  docs.open(restore({ id: 'notes', type: 'notes', title: 'Notes' }));\r
  docs.open(restore({ id: 'todo', type: 'notes', title: 'To do' }));\r
\r
  const save = () => {\r
    s.saved = docs.saveLayout();\r
    s.json = JSON.stringify(s.saved, null, 2);\r
  };\r
  save();\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Move To do into a new window" variant="outline" onclick={() => docs.moveToNewWindow(docs.findDocument('todo')!)} />\r
        <Button text="Save layout" variant="outline" onclick={save} />\r
        <Button text="Restore layout" variant="outline" enabled={() => !!s.saved} onclick={() => s.saved && docs.loadLayout(s.saved, restore)} />\r
        <Button text="Reopen windows" variant="outline" onclick={() => docs.reopenWindows()} />\r
      </Stack>\r
      <RadioGroup\r
        label="Saved windows come back"\r
        orientation="horizontal"\r
        items={[\r
          { value: 'float', text: 'As floating windows' },\r
          { value: 'reopen', text: 'As windows again' },\r
          { value: 'main', text: 'In this window' },\r
        ]}\r
        itemText="text"\r
        itemValue="value"\r
        x-model={() => s.mode}\r
      />\r
      {docs}\r
      <pre class="td-json" tabindex="0" aria-label="The saved layout" style="max-block-size: 14rem; overflow: auto; inline-size: 100%">\r
        {() => s.json}\r
      </pre>\r
    </>\r
  );\r
}\r
`,Gn=`import { reactive } from '@motifx/core';\r
import { confirm, Stack, Switch, TabDocument, TabDocumentManager } from '@motifx-community/ui';\r
import { customerForm, notes } from './contents';\r
\r
/** Closing a new window brings its documents back or closes them; a browser that blocks the window gets a floating one. Every event is logged. */\r
export default function WindowOptions() {\r
  const s = reactive({ back: true, blocked: false, fallback: true, log: [] as { id: number; text: string }[] });\r
  let next = 0;\r
  const note = (text: string) => {\r
    s.log.unshift({ id: ++next, text });\r
    if (s.log.length > 6) s.log.pop();\r
  };\r
  const draft = reactive({ name: 'Draft customer', email: '', city: '' });\r
  const docs = new TabDocumentManager({\r
    label: 'New window settings',\r
    newWindowCloseAction: () => (s.back ? 'back' : 'close'),\r
    newWindowFallback: () => (s.fallback ? 'float' : 'none'),\r
    // A browser that blocks windows hands back none: here a switch plays that browser.\r
    openWindow: (r) => (s.blocked ? null : window.open(r.url, r.name, r.features)),\r
    onWindowOpening: (e) => note(\`windowOpening: \${e.document?.title ?? 'a group'}\`),\r
    onWindowOpened: (e) => note(\`windowOpened: window \${e.window.index + 1}\`),\r
    onWindowClosing: (e) => note(\`windowClosing (\${e.kind}): then \${e.then}\`),\r
    onWindowClosed: (e) => note(\`windowClosed (\${e.kind}): \${e.reason}\`),\r
    onError: (e) => note(\`error: \${e.error}, fallback \${e.fallback}\`),\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  docs.open(new TabDocument({ id: 'draft', title: 'Draft', dirty: () => draft.email === '', content: () => customerForm(draft) }));\r
  docs.open(new TabDocument({ id: 'notes', title: 'Notes', content: () => notes('Notes') }));\r
  // A document with unsaved changes prompts before closing, in the main window.\r
  docs.onClosing((e) => {\r
    if (e.document.dirty) e.promise = confirm(\`\${e.document.title} has unsaved changes. Close it anyway?\`, { title: 'Close', tone: 'caution' });\r
  });\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Switch label="Documents come back when the window closes" x-model={() => s.back} />\r
        <Switch label="The browser blocks new windows" x-model={() => s.blocked} />\r
        <Switch label="Float when blocked" x-model={() => s.fallback} />\r
      </Stack>\r
      {docs}\r
      <ol class="td-log" aria-label="Events">\r
        {s.log.map((entry) => (\r
          <li key={entry.id}>{entry.text}</li>\r
        ))}\r
      </ol>\r
    </>\r
  );\r
}\r
`,Kn=`import { reactive, type ComponentBase } from '@motifx/core';\r
import { DataGrid, MenuBar, TabDocument, TabDocumentManager, type GridAction, type GridColumn, type GridSummary, type MenuItem } from '@motifx-community/ui';\r
import type { Order } from '../../datagrid/examples/order';\r
import { columns, makeOrders } from '../../datagrid/examples/orders';\r
import { customerCard, type Customer } from './contents';\r
\r
// Narrow, the grid moves columns into the row's details, the lowest number first; the customer always stays.\r
const PRIORITY: Partial<Record<keyof Order, number>> = { note: 0, paid: 1, date: 2, city: 3, status: 4, id: 5, amount: 6 };\r
const deskColumns: GridColumn<Order>[] = columns.map((c) => ({\r
  ...c,\r
  sticky: undefined,\r
  hidingPriority: PRIORITY[c.field as keyof Order],\r
  width: c.field === 'customer' ? 150 : c.field === 'amount' ? 100 : c.width,\r
}));\r
\r
const summary: GridSummary<Order> = {\r
  totalItems: [\r
    { column: 'id', summaryType: 'count', showInColumn: 'customer' },\r
    { column: 'amount', summaryType: 'sum' },\r
  ],\r
  groupItems: [{ column: 'amount', summaryType: 'sum', alignByColumn: true }],\r
};\r
\r
/**\r
 * An order desk: a menu bar over the manager, the orders in a full grid (filters, grouping, search,\r
 * summaries, batch editing, row actions and their context menu, export), a customer card that opens\r
 * in a tab from a row, and an activity log docked at the bottom.\r
 */\r
export default function Workspace() {\r
  const s = reactive({ orders: makeOrders(500), selected: 0, log: [] as { id: number; text: string }[], gridReady: 0 });\r
  let grid: DataGrid<Order> | null = null;\r
  let logId = 0;\r
  const write = (text: string) => {\r
    s.log.unshift({ id: ++logId, text });\r
    s.log.splice(40);\r
  };\r
\r
  const docs = new TabDocumentManager({ label: 'Order desk', dockGuides: true, dockAreaSize: { bottom: 160 } });\r
  docs.element.style.cssText = 'block-size: 36rem; inline-size: 100%';\r
\r
  const customers = new Map<string, Customer>();\r
  const openCustomer = (name: string) => {\r
    const id = \`customer:\${name}\`;\r
    const open = docs.findDocument(id);\r
    if (open) return void docs.activate(open, true);\r
    let customer = customers.get(name);\r
    if (!customer) {\r
      customer = reactive({ name, email: \`\${name.split(' ')[0].toLowerCase()}@example.com\`, city: '' });\r
      customers.set(name, customer);\r
    }\r
    const card = customer;\r
    const doc = new TabDocument({ id, type: 'customer', title: () => card.name || 'New customer', description: 'Customer', content: () => customerCard(card) });\r
    // Customers open beside the orders: in the group on the right, or in a new one there.\r
    const side = docs.groups.find((g) => g !== orders.group && !g.dockArea && !g.window && !g.browserWindow);\r
    if (side) docs.open(doc, { group: side, focus: true });\r
    else {\r
      const opened = docs.open(doc, { group: orders.group ?? undefined, focus: true });\r
      if (opened && orders.group) docs.split(orders.group, 'right', opened);\r
    }\r
  };\r
\r
  const openOrder: GridAction<Order> = { id: 'customer', text: 'Open the customer', onclick: (row) => openCustomer(row.customer) };\r
  const approve: GridAction<Order> = {\r
    id: 'approve',\r
    text: 'Approve',\r
    tone: 'accent',\r
    visible: (row) => row.status === 'Draft',\r
    onclickMany: (rows) => {\r
      for (const row of rows) row.status = 'Approved';\r
      write(\`\${rows.length} orders approved\`);\r
    },\r
    onclick: (row) => {\r
      row.status = 'Approved';\r
      write(\`order \${row.id} approved\`);\r
    },\r
  };\r
\r
  const ordersGrid = (): ComponentBase => (\r
    <DataGrid\r
      style="block-size: 100%"\r
      rows={() => s.orders}\r
      rowKey="id"\r
      columns={deskColumns}\r
      label="Orders"\r
      locale="en"\r
      saveMode="batch"\r
      summary={summary}\r
      export={{ formats: ['csv'] }}\r
      actions={(_row: Order, state) => (state.isRemoved ? ['restore'] : [openOrder, approve, 'edit', 'remove'])}\r
      settings={{\r
        editable: true,\r
        selection: 'multiple',\r
        filterRow: true,\r
        headerFilter: true,\r
        groupPanel: true,\r
        searchPanel: true,\r
        columnChooserButton: true,\r
        exportButton: true,\r
        totalSummary: true,\r
        groupSummary: true,\r
        rowStatus: true,\r
        striped: true,\r
        actionsContextMenu: true,\r
        // Narrow beside a customer: the actions stay one "…" button, and columns that do not fit go into the row's details.\r
        actionsDisplay: 'menu',\r
        actionsWidth: 48,\r
        columnHidingEnabled: true,\r
      }}\r
      onSelectionChanged={(e) => (s.selected = e.selection.all ? s.orders.length - e.selection.except.length : e.selection.keys.length)}\r
      onSaved={() => write('changes saved')}\r
      ref={(g: DataGrid<Order>) => {\r
        grid = g;\r
        s.gridReady++;\r
      }}\r
    />\r
  );\r
  // The tab shows the unsaved mark while the grid has edits that are not saved.\r
  const orders = new TabDocument({\r
    id: 'orders',\r
    type: 'orders',\r
    title: 'Orders',\r
    pinned: true,\r
    closable: false,\r
    badge: () => s.orders.length,\r
    dirty: () => s.gridReady > 0 && !!grid?.hasChanges,\r
    content: ordersGrid,\r
  });\r
  const activity = new TabDocument({\r
    id: 'activity',\r
    type: 'tool',\r
    title: 'Activity',\r
    closable: false,\r
    content: () => (\r
      <ol style="margin: 0; padding: var(--mx-space-2) var(--mx-space-4); font-size: var(--mx-font-size-caption)" aria-label="Activity">\r
        {s.log.map((line) => (\r
          <li key={line.id}>{line.text}</li>\r
        ))}\r
      </ol>\r
    ),\r
  });\r
\r
  docs.open(orders);\r
  // The log waits folded at the bottom edge: a click on its title slides it out.\r
  docs.dock(activity, 'bottom');\r
  docs.autoHide(docs.dockArea('bottom')!);\r
  docs.activate(orders);\r
\r
  docs.onOpened((e) => write(\`opened \${e.document.title}\`));\r
  docs.onClosed((e) => write(\`closed \${e.document.title}\`));\r
  docs.onMoved((e) => write(\`moved \${e.document.title}\`));\r
  docs.onFloated((e) => write(\`\${e.document?.title ?? 'a group'} floats\`));\r
  docs.onDocked((e) => write(\`\${e.document?.title ?? 'a group'} docked\${e.side ? \` on the \${e.side}\` : ''}\`));\r
  docs.onHidden((e) => write(\`\${e.document.title} hidden\`));\r
\r
  const active = () => docs.activeDocument;\r
  const menu: MenuItem[] = [\r
    {\r
      text: '&File',\r
      items: [\r
        { text: 'New customer', click: () => openCustomer(\`Customer \${customers.size + 1}\`) },\r
        { text: 'Reopen closed', enabled: () => docs.documents.length > 0, click: () => docs.reopenClosed() },\r
        { text: 'Close', shortcut: 'Ctrl+Alt+W', beginGroup: true, enabled: () => !!active()?.closable, click: () => active() && docs.close(active()!) },\r
        { text: 'Close all', click: () => docs.closeAll() },\r
      ],\r
    },\r
    {\r
      text: '&Orders',\r
      items: [\r
        { text: 'Save changes', enabled: () => s.gridReady > 0 && !!grid?.hasChanges, click: () => grid?.saveEditData() },\r
        { text: 'Undo changes', enabled: () => s.gridReady > 0 && !!grid?.hasChanges, click: () => grid?.cancelEditData() },\r
        { text: 'Group by city', beginGroup: true, click: () => grid?.groupBy('city') },\r
        { text: 'Clear grouping', click: () => grid?.clearGrouping() },\r
        { text: 'Clear filters', click: () => grid?.clearFilters() },\r
        { text: 'Choose columns…', beginGroup: true, click: () => grid?.showColumnChooser() },\r
        { text: 'Export to CSV', click: () => grid?.exportCsv({ fileName: 'orders' }) },\r
      ],\r
    },\r
    {\r
      text: '&View',\r
      items: [\r
        { text: 'Split right', click: () => docs.activeGroup && docs.split(docs.activeGroup, 'right') },\r
        { text: 'Split down', click: () => docs.activeGroup && docs.split(docs.activeGroup, 'down') },\r
        { text: 'Maximize the group', beginGroup: true, click: () => docs.activeGroup && docs.maximizeGroup(docs.activeGroup) },\r
        { text: 'Restore the groups', click: () => docs.restoreGroups() },\r
        { text: 'Same sizes', click: () => docs.evenSizes() },\r
      ],\r
    },\r
    {\r
      text: '&Window',\r
      items: [\r
        { text: 'Float the active tab', enabled: () => !!active() && !active()!.window, click: () => active() && docs.float(active()!) },\r
        { text: 'Move into a new window', enabled: () => !!active() && !active()!.browserWindow, click: () => active() && docs.moveToNewWindow(active()!) },\r
        { text: 'Dock back', enabled: () => !!active()?.window, click: () => active() && docs.dock(active()!) },\r
        {\r
          text: 'Show the activity',\r
          beginGroup: true,\r
          // Its area's close button hides it because it cannot close. When shown again, it returns to its previous place.\r
          click: () => (activity.isHidden ? docs.show(activity, { focus: true }) : activity.dockArea?.autoHidden ? docs.showAutoHidden(activity) : docs.activate(activity, true)),\r
        },\r
      ],\r
    },\r
  ];\r
\r
  return (\r
    <>\r
      <MenuBar items={menu} label="Order desk" />\r
      {docs}\r
      <output class="td-state">{() => \`\${s.orders.length} orders · \${s.selected} selected\${s.gridReady > 0 && grid?.hasChanges ? ' · unsaved changes' : ''}\`}</output>\r
    </>\r
  );\r
}\r
`,qn=`import type { ComponentBase } from '@motifx/core';\r
import { Button, confirm, DataGrid, FormLayout, type FormItem, type GridColumn } from '@motifx-community/ui';\r
import { makeOrders, type Order } from './orders';\r
\r
const columns: GridColumn<Order>[] = [\r
  { field: 'id', title: 'No', type: 'number', width: 70 },\r
  { field: 'customer', title: 'Customer', width: 160 },\r
  { field: 'city', title: 'City', width: 110 },\r
  { field: 'amount', title: 'Amount', type: 'number', width: 100 },\r
];\r
\r
/** A grid of orders that fills its tab. */\r
export function ordersGrid(count = 60): ComponentBase {\r
  return <DataGrid rows={makeOrders(count)} rowKey="id" columns={columns} label="Orders" style="block-size: 100%" />;\r
}\r
\r
/** The fields a customer is edited with. */\r
export interface Customer {\r
  name: string;\r
  email: string;\r
  city: string;\r
}\r
\r
/** The forms open over each customer: a copy of a document has a form of its own over the same object. */\r
const formsOf = new WeakMap<Customer, Set<FormLayout<Customer>>>();\r
\r
/**\r
 * A form over a customer: what is typed goes straight into it. The form reads the object as it is, so the other forms\r
 * over the same customer are told to read the field again.\r
 */\r
export function customerForm(customer: Customer): ComponentBase {\r
  const items: FormItem[] = [\r
    { field: 'name', label: 'Name', required: true },\r
    { field: 'email', label: 'Email', editor: 'email' },\r
    { field: 'city', label: 'City' },\r
  ];\r
  const forms = formsOf.get(customer) ?? new Set<FormLayout<Customer>>();\r
  formsOf.set(customer, forms);\r
  return (\r
    <div style="padding: var(--mx-space-4); max-inline-size: 32rem">\r
      <FormLayout<Customer>\r
        data={customer}\r
        items={items}\r
        ref={(form: FormLayout<Customer>) => {\r
          forms.add(form);\r
          form.motif.setDisposable(() => forms.delete(form));\r
        }}\r
        onFieldChanged={(e) => {\r
          for (const other of forms) if (other.data === e.data && !other.isDisposed) other.refreshField(e.field);\r
        }}\r
      />\r
    </div>\r
  );\r
}\r
\r
/** A few paragraphs of plain text. */\r
export function notes(title: string): ComponentBase {\r
  return (\r
    <div style="padding: var(--mx-space-4); max-inline-size: 40rem">\r
      <h3 style="margin-block-start: 0">{title}</h3>\r
      <p>Any component can be a document: a form, a grid, a chart or plain text like this.</p>\r
      <p>Drag the line between two groups, or focus it with Tab and use the arrow keys. A double click on it gives the groups the same size.</p>\r
    </div>\r
  );\r
}\r
\r
const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'London', 'New York'];\r
\r
/** A customer card: text fields and a city drop-down over a reactive customer, and a button that opens a dialog. */\r
export function customerCard(customer: Customer): ComponentBase {\r
  const items: FormItem[] = [\r
    { field: 'name', label: 'Name', required: true },\r
    { field: 'email', label: 'Email', editor: 'email' },\r
    { field: 'city', label: 'City', editor: 'dropdown', editorProps: { items: CITIES } },\r
  ];\r
  let card: ComponentBase | null = null;\r
  // The dialog opens where the card is: in a new window, there.\r
  const clear = async () => {\r
    if (await confirm('Clear the customer card?', { title: 'Clear', host: card! })) Object.assign(customer, { name: '', email: '', city: '' });\r
  };\r
  return (\r
    <div ref={(c: ComponentBase) => (card = c)} style="padding: var(--mx-space-4); max-inline-size: 32rem">\r
      <FormLayout data={customer} items={items} />\r
      <Button text="Clear…" variant="outline" onclick={clear} />\r
    </div>\r
  );\r
}\r
`,Jn=`import type { ComponentBase } from '@motifx/core';\r
import { TabDocument, type TabDocumentOptions } from '@motifx-community/ui';\r
\r
/** A page with a folded corner: a file. */\r
export const FileIcon = () => (\r
  <svg viewBox="0 0 16 16" aria-hidden="true">\r
    <path d="M4 1.75h5l3 3v9.5H4zM9 1.75v3h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />\r
  </svg>\r
);\r
\r
/** A few files of a sample project. */\r
export const FILES = [\r
  { path: 'src/index.ts', text: "export { App } from './app';\\nexport { router } from './router';" },\r
  { path: 'src/app.ts', text: "import { Application } from '@motifx/core';\\n\\nexport const App = Application.CreateBuilder().build();" },\r
  { path: 'src/router.ts', text: "export const router = { mode: 'history', routes: [] };" },\r
  { path: 'src/orders/index.ts', text: "export * from './orders';" },\r
  { path: 'src/orders/orders.ts', text: 'export interface Order {\\n  id: number;\\n  amount: number;\\n}' },\r
  { path: 'README.md', text: '# Shop\\n\\nA small shop written with MotifJS.' },\r
  { path: 'package.json', text: '{\\n  "name": "shop",\\n  "private": true\\n}' },\r
  { path: 'vite.config.ts', text: "import { defineConfig } from 'vite';\\n\\nexport default defineConfig({});" },\r
];\r
\r
/** A file's text, as a document's content. */\r
export function source(text: string): ComponentBase {\r
  // The panel scrolls (and takes focus for it): the text itself does not.\r
  return <pre style="margin: 0; padding: var(--mx-space-4); overflow: visible; font: var(--mx-font-size-body) / var(--mx-font-line-body) var(--mx-font-family-mono)">{text}</pre>;\r
}\r
\r
/** A document for a file: its name as the title, its folder as the description. */\r
export function fileDocument(path: string, extra: TabDocumentOptions = {}): TabDocument {\r
  const file = FILES.find((f) => f.path === path);\r
  const at = path.lastIndexOf('/');\r
  return new TabDocument({\r
    id: path,\r
    type: 'file',\r
    title: path.slice(at + 1),\r
    description: at > 0 ? path.slice(0, at) : '',\r
    icon: () => <FileIcon />,\r
    content: () => source(file?.text ?? ''),\r
    ...extra,\r
  });\r
}\r
`,Yn=`/** An order of the examples. */\r
export interface Order {\r
  id: number;\r
  customer: string;\r
  city: string;\r
  amount: number;\r
}\r
\r
const customers = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra', 'Barbara Liskov', 'Donald Knuth'];\r
const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];\r
\r
/** \`count\` sample orders, the same every time. */\r
export function makeOrders(count: number): Order[] {\r
  return Array.from({ length: count }, (_, i) => ({\r
    id: 1001 + i,\r
    customer: customers[i % customers.length],\r
    city: cities[(i * 7) % cities.length],\r
    amount: Math.round(((i * 37) % 900) + 100),\r
  }));\r
}\r
`,Xn=`import type { ComponentBase } from '@motifx/core';\r
import { Button, TabDocument } from '@motifx-community/ui';\r
import { FILES } from './files';\r
\r
const PROBLEMS = [\r
  { file: 'src/app.ts', line: 3, text: "'App' is declared but never read." },\r
  { file: 'src/router.ts', line: 1, text: 'The routes list is empty.' },\r
  { file: 'README.md', line: 3, text: 'A line longer than 80 characters.' },\r
];\r
\r
/** A plain list inside a tool. */\r
const LIST = 'margin: 0; padding: var(--mx-space-2); list-style: none';\r
const ITEM = 'padding: var(--mx-space-1) var(--mx-space-2); white-space: nowrap';\r
\r
const LOG = ['> shop@0.0.0 dev', '> vite', '', '  VITE ready in 312 ms', '  ➜  Local:   http://localhost:5173/', '  page reload src/app.ts', '  hmr update /src/router.ts'];\r
\r
/** The project's files; choosing one opens it among the documents. */\r
export function explorer(open: (path: string) => void): ComponentBase {\r
  return (\r
    <ul style={LIST} aria-label="Project files">\r
      {FILES.map((file) => (\r
        <li key={file.path}>\r
          <Button text={file.path} variant="ghost" size="sm" onclick={() => open(file.path)} />\r
        </li>\r
      ))}\r
    </ul>\r
  );\r
}\r
\r
/** The outline of a file: what it declares. */\r
export function outline(): ComponentBase {\r
  return (\r
    <ul style={LIST} aria-label="Outline">\r
      {['App', 'router', 'Order', 'routes'].map((name) => (\r
        <li key={name} style={ITEM}>\r
          {name}\r
        </li>\r
      ))}\r
    </ul>\r
  );\r
}\r
\r
/** A list of problems found in the files. */\r
export function problems(): ComponentBase {\r
  return (\r
    <ul style={LIST} aria-label="Problems">\r
      {PROBLEMS.map((p) => (\r
        <li key={\`\${p.file}:\${p.line}\`} style={ITEM}>\r
          {\`\${p.file}:\${p.line}  \${p.text}\`}\r
        </li>\r
      ))}\r
    </ul>\r
  );\r
}\r
\r
/** What the dev server wrote. */\r
export function output(): ComponentBase {\r
  return <pre style="margin: 0; padding: var(--mx-space-3); overflow: visible; font: var(--mx-font-size-caption) / var(--mx-font-line-caption) var(--mx-font-family-mono)">{LOG.join('\\n')}</pre>;\r
}\r
\r
/** A tool's document: it cannot be closed, only moved, docked, floated or folded away. */\r
export function toolDocument(id: string, title: string, content: () => ComponentBase): TabDocument {\r
  return new TabDocument({ id, type: 'tool', title, closable: false, content });\r
}\r
`;export{xn as A,On as C,wn as D,Tn as E,sn as F,B as I,yn as M,vn as N,Cn as O,_n as P,kn as S,En as T,Pn as _,Kn as a,jn as b,Un as c,Bn as d,zn as f,Fn as g,In as h,qn as i,bn as j,Sn as k,Hn as l,Ln as m,Yn as n,Gn as o,Rn as p,Jn as r,Wn as s,Xn as t,Vn as u,Nn as v,Dn as w,An as x,Mn as y};