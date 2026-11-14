import{A as e,At as t,C as n,Et as r,F as i,H as a,It as o,Jn as s,Kt as c,Lt as l,M as u,N as d,Nn as f,Ot as p,P as m,Pt as h,Q as g,Qt as _,R as v,Rt as y,S as b,Wn as x,Zn as S,Zt as ee,b as C,bt as te,cn as w,d as T,dn as E,g as ne,hn as re,j as D,jt as O,kt as k,m as A,n as j,nn as M,nt as ie,on as ae,p as oe,q as N,r as se,rt as ce,s as P,sr as F,t as I,tn as L,v as le,vn as R,x as z}from"./next-id-IxLtiCRk.js";import{f as B,s as V,t as H}from"./Field-CH6HfRjw.js";import{n as U,t as ue}from"./lengths-CkV48fET.js";import{t as de}from"./media-BVG3PNqI.js";import{f as W,i as fe,v as pe}from"./glyphs-Alf0KZdi.js";import{t as me}from"./menu-item-of-XV-xP2lF.js";import{t as he}from"./ContextMenu-GFApPHiR.js";import{a as G,n as ge,t as K}from"./ordered-EchlxLhp.js";var q=class extends x{picked;static elementTag=`div`;row;opener;popup;grid;chosenTile=null;small=!1;commandBox;get command(){return this.commandBox.value}set command(e){this.commandBox.value=e}constructor(e,n){super(`div`),this.picked=n,this.commandBox=S(e),this.class.add(`mx-ribbon-menu__gallery`),this.attr.add({role:`group`}),this.row=y(this,`div`,`mx-ribbon-menu__gallery-row`),this.opener=new j({icon:fe()}),this.opener.class.add(`mx-ribbon-menu__gallery-open`),this.opener.attr.add({"aria-haspopup":`dialog`,"aria-expanded":`false`}),this.opener.motif.on(`click`,()=>this.toggle()),this.controls.add(this.opener),this.popup=new P,this.popup.matchWidth=!1,this.popup.class.add(`mx-ribbon-menu__gallery-popup`),this.popup.attr.add({role:`dialog`}),this.popup.onClosed(()=>t(this.opener,`aria-expanded`,`false`)),this.grid=y(this.popup,`div`,`mx-ribbon-menu__gallery-grid`),this.controls.add(this.popup),this.bindings.watch(()=>{let e=this.label();F(()=>{t(this,`aria-label`,e),t(this.popup,`aria-label`,e),this.opener.hint=e,this.small&&(this.opener.text=e)})}),this.bindings.watch(()=>{let e=String(this.columns());F(()=>r(this.grid,`--_columns`,e))}),this.row.bindings.list(()=>this.items().slice(0,this.columns()),e=>this.makeTile(e,!1)),this.grid.bindings.list(()=>this.items(),e=>this.makeTile(e,!0))}items(){return z(C(this.command,`items`))}columns(){return Math.max(1,Number(C(this.command,`columns`)??4))}isChosen(e){return(b(e,`key`)??this.items().indexOf(e))===(C(this.command,`value`)??null)}label(){return u(String(C(this.command,`text`)??``)).text}setSmall(e){this.small=e;let t=this.label();this.opener.text=e?t:``,this.opener.iconPosition=e?`end`:`start`,this.opener.hint=t,p(this.row,!e)}makeTile(e,n){let r=l(`button`,`mx-ribbon-menu__tile`);r.attr.add({type:`button`});let i=_e(e,n),a=i?null:h(r,``,`mx-ribbon-menu__tile-glyph`);i&&o(r,i);let s=y(r,`span`,`mx-ribbon-menu__tile-text`);return r.bindings.watch(()=>{let n=String(C(e,`text`)??``),i=String(C(e,`hint`)??``);F(()=>{t(r,`title`,i||n),t(r,`aria-label`,n),O(s,n)})}),r.bindings.watch(()=>{let t=C(e,`enabled`)!==!1;F(()=>k(r,`disabled`,!t))}),a&&r.bindings.watch(()=>{let n=String(C(e,`glyph`)??``);F(()=>{t(a,`data-icon`,n||null),p(a,!!n)})}),r.bindings.watch(()=>{let i=this.isChosen(e);F(()=>{t(r,`aria-pressed`,String(i)),n&&(i?this.chosenTile=r:this.chosenTile===r&&(this.chosenTile=null))})}),n&&r.motif.setDisposable(()=>{this.chosenTile===r&&(this.chosenTile=null)}),r.motif.on(`click`,(t,n)=>{this.popup.close(`code`),this.picked(e,n)}),r}toggle(){if(this.popup.isOpen){this.popup.close(`code`);return}this.popup.open(this.opener),t(this.opener,`aria-expanded`,`true`),this.chosenTile?g(this.chosenTile):N(this.popup)||g(this.popup)}};function _e(e,t){let n=b(e,`icon`);return typeof n==`object`?t?n:null:F(()=>le(n))}var ve=class{owner;tabs;commands;ended;layer;drawn=[];typed=``;level=null;inner=null;wanted=null;constructor(e,t,n,r){this.owner=e,this.tabs=t,this.commands=n,this.ended=r,this.layer=y(e,`div`,`mx-ribbon-menu__hints`),this.layer.attr.add({"aria-hidden":`true`}),p(this.layer,!1)}get active(){return this.level!==null}start(e){this.level=e,this.typed=``,this.draw(e===`tabs`?this.tabs():this.commands())}stop(){this.level&&(this.level=null,this.clear(),this.closeInner(),p(this.layer,!1),this.ended())}key(e){if(!this.level)return!1;if(e.key===`Escape`)return this.typed?this.filter(``):this.level===`inner`?(this.closeInner(),this.start(`commands`)):this.level===`commands`?this.start(`tabs`):this.stop(),!0;if(e.key===`Backspace`)return this.filter(this.typed.slice(0,-1)),!0;if([`Alt`,`Shift`,`Control`,`Meta`].includes(e.key))return!1;if(e.key.length!==1||e.ctrlKey||e.metaKey)return this.stop(),!1;let t=this.typed+e.key.toLocaleUpperCase(i.locale),n=this.drawn.find(e=>e.keys===t);if(n){let e=this.level;this.clear(),n.hint.press();let t=this.drawn,r=()=>this.level!==null&&this.drawn===t,i=n.hint.opens;return i?(R(this.owner).then(()=>{r()&&(this.inner=i(),this.level=`inner`,this.typed=``,this.draw(this.inner.hints,this.inner.host))}),!0):(n.hint.tab&&e===`tabs`&&this.level===`tabs`?R(this.owner).then(()=>r()&&this.start(`commands`)):this.level===e&&this.stop(),!0)}return this.drawn.some(e=>e.keys.startsWith(t))&&this.filter(t),!0}draw(e,t=this.layer){this.clear(),p(this.layer,t===this.layer);let n=e.map(e=>e.part);this.wanted={hints:e,parts:n,host:t},E(this.owner,this.readSpots,this.drawBadges)}readSpots=()=>{let e=this.wanted;return e?{wanted:e,root:L(e.host===this.layer?this.owner:e.host),boxes:e.parts.map(L)}:null};drawBadges=e=>{if(!e||e.wanted!==this.wanted)return;let{wanted:t,root:n,boxes:i}=e;this.wanted=null;let a=ye(t.hints);t.hints.forEach((e,o)=>{let s=i[o];if(!s.width&&!s.height)return;let c=y(t.host,`span`,`mx-ribbon-menu__hint`);O(c,a[o]);let l=this.level!==`tabs`&&s.width>s.height*2?s.left+s.height/2:s.left+s.width/2;r(c,`left`,`${l-n.left}px`),r(c,`top`,`${s.bottom-n.top}px`),this.drawn.push({hint:e,keys:a[o],badge:c})})};closeInner(){let e=this.inner;this.inner=null,e?.close()}filter(e){this.typed=e;for(let t of this.drawn)p(t.badge,t.keys.startsWith(e))}clear(){for(let e of this.drawn)e.badge.dispose();this.drawn=[],this.wanted=null,this.typed=``}};function ye(e){let t=e=>e.toLocaleUpperCase(i.locale),n=e.map(e=>t(e.keys.trim())),r=new Set(n.filter(Boolean)),a=e.map((e,r)=>n[r]?``:t((e.text.trim().match(/\p{L}|\p{N}/u)??[`?`])[0])),o=new Map;for(let e of a)e&&o.set(e,(o.get(e)??0)+1);let s=new Map;return e.map((e,t)=>{if(n[t])return n[t];let i=a[t];if(o.get(i)===1&&![...r].some(e=>e!==i&&e.startsWith(i)))return i;let c=(s.get(i)??0)+1;for(;r.has(`${i}${c}`);)c++;return s.set(i,c),`${i}${c}`})}var be=[`items`,`value`,`layout`,`adaptive`,`layoutSwitch`,`barStart`,`barEnd`,`display`,`appButton`,`quickCommands`,`quickBar`,`keyHints`,`customizable`,`customization`],J=`--_ribbon-menu-compact-size`,xe=class r extends n{selecting=new s;selectionChanged=new s;commandClick=new s;groupMore=new s;layoutChanged=new s;displayChanged=new s;customized=new s;appButtonClick=new s;itemsChanged=new s;customMenuOpened=new s;tree=new ge(e=>[`groups`,`commands`,`commands`][e]??null,()=>z(this.peekProperty(`items`)),e=>this.applyItems(e));reveal;frame;bar;app;appCaption;appKey=null;quickTop;quickBelow;quickHost=null;quickMade=new Map;stopQuick=null;picker;startHost;endHost;switcher;tabList;body;stage;back;forward;startControl=null;endControl=null;entries=[];looks=[];panels=new Map;stopTabs=null;rovingQueued=!1;floating=!1;compact=!1;fittedWidth=-1;fitDue=!0;fitCount=0;fitPanel=null;fitSimple=!1;lookDue=[];custom={};hints;customMenu;altDown=!1;altChord=!1;focusLeaving=!1;constructor(e){super(e);let t=this.props??{};this.class.add(`mx-ribbon-menu`),this.reveal=y(this,`button`,`mx-ribbon-menu__reveal`),this.reveal.attr.add({type:`button`}),h(this.reveal,`chevron-down`,`mx-ribbon-menu__reveal-glyph`),this.frame=y(this,`div`,`mx-ribbon-menu__frame`),this.bar=y(this.frame,`div`,`mx-ribbon-menu__bar`),this.startHost=y(this.bar,`div`,`mx-ribbon-menu__bar-start`),this.app=y(this.bar,`button`,`mx-ribbon-menu__app`),this.app.attr.add({type:`button`}),this.appCaption=y(this.app,`span`,`mx-ribbon-menu__app-text`),p(this.app,!1),this.quickTop=y(this.bar,`div`,`mx-ribbon-menu__quick`),this.picker=new j({menu:[]}),this.picker.class.add(`mx-ribbon-menu__picker`),this.bar.controls.add(this.picker),this.tabList=y(this.bar,`div`,`mx-ribbon-menu__tabs`),this.tabList.attr.add({role:`tablist`}),this.endHost=y(this.bar,`div`,`mx-ribbon-menu__bar-end`),p(this.startHost,!1),p(this.endHost,!1),this.body=y(this.frame,`div`,`mx-ribbon-menu__body`),this.stage=y(this.body,`div`,`mx-ribbon-menu__stage`),this.back=this.makeScroll(-1),this.forward=this.makeScroll(1),this.switcher=new j({icon:W(`chevron-up`)}),this.switcher.class.add(`mx-ribbon-menu__switch`),this.switcher.motif.on(`click`,(e,t)=>this.switchLayout(t)),this.body.controls.add(this.switcher),this.quickBelow=y(this.frame,`div`,`mx-ribbon-menu__quick mx-ribbon-menu__quick--below`);for(let e of[this.quickTop,this.quickBelow])e.attr.add({role:`toolbar`}),p(e,!1);this.hints=new ve(this,()=>this.tabHints(),()=>this.commandHints(),()=>{}),this.customMenu=new he,this.customMenu.onOpening(e=>this.customMenuOpening(e)),this.controls.add(this.customMenu),U(this,[J]);for(let e of be)t[e]!==void 0&&this.bindProperty(e,t[e]);t.label!==void 0&&this.bindProperty(`text`,t.label),t.onSelecting&&this.onSelecting(t.onSelecting),t.onSelectionChanged&&this.onSelectionChanged(t.onSelectionChanged),t.onCommandClick&&this.onCommandClick(t.onCommandClick),t.onGroupMore&&this.onGroupMore(t.onGroupMore),t.onLayoutChanged&&this.onLayoutChanged(t.onLayoutChanged),t.onCustomMenuOpening&&this.onCustomMenuOpening(t.onCustomMenuOpening),t.onDisplayChanged&&this.onDisplayChanged(t.onDisplayChanged),t.onCustomized&&this.onCustomized(t.onCustomized),t.onAppButton&&this.onAppButton(t.onAppButton),t.onItemsChanged&&this.onItemsChanged(t.onItemsChanged),this.observeProperty(`items`,()=>this.renderTabs()),this.observeProperty(`value`,()=>this.drawSelection()),this.observeProperty(`text`,()=>this.drawNames()),this.observeProperty(`layout`,()=>this.drawLayout()),this.observeProperty(`adaptive`,()=>this.queueLayout()),this.observeProperty(`layoutSwitch`,()=>this.drawLayout()),this.observeProperty(`barStart`,()=>this.placeSlot(`start`)),this.observeProperty(`barEnd`,()=>this.placeSlot(`end`)),this.observeProperty(`display`,()=>this.drawDisplay()),this.observeProperty(`appButton`,()=>this.drawApp()),this.observeProperty(`quickCommands`,()=>this.drawQuick()),this.observeProperty(`quickBar`,()=>this.drawQuick()),this.observeProperty(`customization`,()=>this.takeCustomization()),se(this,()=>this.drawNames()),this.tabList.motif.on(`click`,(e,t)=>this.tabClick(t)),this.tabList.motif.on(`dblclick`,(e,t)=>this.tabDoubleClick(t)),this.app.motif.on(`click`,(e,t)=>this.appButtonClick.fire({part:this.app,originalEvent:t,source:this})),this.reveal.motif.on(`click`,()=>this.openOver(!0)),this.motif.on(`keydown`,(e,t)=>this.ownKeyDown(t)),this.motif.on(`focusout`,(e,t)=>this.focusLeft(t));let n=[f(this,`keydown`,e=>this.pageKeyDown(e),!0),f(this,`keyup`,e=>this.pageKeyUp(e),!0),f(this,`pointerdown`,e=>this.pagePointerDown(e),!0),f(this,`focusin`,e=>this.focusLanded(e),!0)];this.tabList.motif.on(`keydown`,(e,t)=>this.tabKeyDown(t)),this.body.motif.on(`keydown`,(e,t)=>this.commandKeyDown(t)),this.body.motif.on(`focusin`,(e,t)=>this.commandFocused(t)),B(this,`size`,()=>E(this,this.readRoom,this.fit)),B(this,`look`,()=>this.queueLayout());let r=ne.onChanged(()=>this.namesCommands()&&this.refresh());this.motif.setDisposable(()=>r.dispose()),this.drawNames(),this.drawLayout(),this.drawDisplay(),this.motif.setDisposable(()=>{for(let e of n)e();this.stopQuick?.(),this.dropMade(this.quickMade),this.stopTabs?.();for(let e of this.panels.values())this.dropPanel(e);for(let e of[this.selecting,this.selectionChanged,this.commandClick,this.groupMore,this.layoutChanged,this.displayChanged,this.customized,this.appButtonClick,this.itemsChanged])e.dispose()})}get items(){return this.getProperty(`items`)??[]}set items(e){this.assignProperty(`items`,e)}get value(){return this.getProperty(`value`)??null}set value(e){this.assignProperty(`value`,e)}get label(){return this.text}set label(e){this.text=e}get layout(){return this.getProperty(`layout`)??`classic`}set layout(e){this.assignProperty(`layout`,e)}get adaptive(){return this.getProperty(`adaptive`)!==!1}set adaptive(e){this.assignProperty(`adaptive`,e,Boolean)}get layoutSwitch(){return this.getProperty(`layoutSwitch`)!==!1}set layoutSwitch(e){this.assignProperty(`layoutSwitch`,e,Boolean)}get barStart(){return this.getProperty(`barStart`)??null}set barStart(e){this.assignProperty(`barStart`,e)}get barEnd(){return this.getProperty(`barEnd`)??null}set barEnd(e){this.assignProperty(`barEnd`,e)}get display(){return this.getProperty(`display`)??`always`}set display(e){this.assignProperty(`display`,e)}get appButton(){return this.getProperty(`appButton`)??``}set appButton(e){this.assignProperty(`appButton`,e)}get quickCommands(){return this.getProperty(`quickCommands`)??[]}set quickCommands(e){this.assignProperty(`quickCommands`,e)}get quickBar(){return this.getProperty(`quickBar`)??`start`}set quickBar(e){this.assignProperty(`quickBar`,e)}get keyHints(){return this.getProperty(`keyHints`)!==!1}set keyHints(e){this.assignProperty(`keyHints`,e,Boolean)}get customizable(){return this.getProperty(`customizable`)!==!1}set customizable(e){this.assignProperty(`customizable`,e,Boolean)}get customization(){return Q(this.custom)}set customization(e){this.assignProperty(`customization`,e)}get onDisplayChanged(){return this.displayChanged.event}get onCustomized(){return this.customized.event}get onItemsChanged(){return this.itemsChanged.event}get onAppButton(){return this.appButtonClick.event}get isOpenOver(){return this.floating}get isCompact(){return this.compact}get onLayoutChanged(){return this.layoutChanged.event}get onCustomMenuOpening(){return this.customMenuOpened.event}get onSelecting(){return this.selecting.event}get onSelectionChanged(){return this.selectionChanged.event}get onCommandClick(){return this.commandClick.event}get onGroupMore(){return this.groupMore.event}get shownKey(){let e=this.peekProperty(`value`)??null,t=this.looks.filter(e=>e.visible&&e.enabled);return t.find(t=>t.key===e)?.key??t[0]?.key??null}select(e){let t=this.looks.find(t=>t.key===e&&t.visible&&t.enabled);return t?this.choose(t,null):!1}controlOf(e){let t=n=>{for(let[r,i]of n){if(r===e)return i.control;let n=i.made&&t(i.made);if(n)return n}return null};for(let e of this.panels.values())for(let n of e.groups.values()){let e=t(n.made);if(e)return e}return null}findTab(e){return this.looks.find(t=>t.key===e)?.tab??null}findGroup(e){return G(e).length===2?this.tree.find(e):null}findCommand(e){return G(e).length>=3?this.tree.find(e):null}addTab(e,t){return this.tree.add(``,e,t)}addGroup(e,t,n){return G(e).length===1&&this.tree.add(e,t,n)}addCommand(e,t,n){let r=G(e).length;return(r===2||r===3)&&this.tree.add(e,t,n)}remove(e){return this.tree.remove(e)}move(e,t,n){let r=G(e).length-1;return(n===void 0||G(n).length===r)&&this.tree.move(e,t,n)}update(e,t){return this.tree.update(e,t)}beginUpdate(){this.tree.beginUpdate()}endUpdate(){this.tree.endUpdate()}currentTabs(){return this.tree.current}changeItems(e,t){return this.tree.change(e,t)}applyItems(e){this.changeProperty(`items`,e),this.itemsChanged.fire({items:e,source:this})}refresh(){this.reState()}namesCommands(){let e=t=>t.some(t=>b(t,`command`)!==void 0||e(z(C(t,`commands`))));return F(()=>this.currentTabs().some(t=>z(C(t,`groups`)).some(t=>e(z(C(t,`commands`))))))}openOver(e){this.display!==`always`&&(this.setFloating(e),e&&R(this).then(()=>this.floating&&this.focus()))}showKeyHints(){this.display===`auto`&&!this.floating&&this.setFloating(!0),this.hints.start(`tabs`)}get focusPart(){let e=this.shownKey,t=this.looks.findIndex(t=>t.key===e);return t>=0?this.entries[t].host:this}renderTabs(){this.stopTabs?.();let t=z(this.peekProperty(`items`));this.stopTabs=e(this,`items`,()=>t.map((e,t)=>this.tabLookOf(e,t)),e=>{this.looks=e,this.drawTabs()})}tabLookOf(e,t){return{tab:e,key:b(e,`key`)??t,text:String(C(e,`text`)??``),hint:String(C(e,`hint`)??``),context:String(C(e,`context`)??``),visible:C(e,`visible`)!==!1,enabled:C(e,`enabled`)!==!1}}drawTabs(){let e=new Map(this.entries.map(e=>[e.key,e]));this.entries=this.looks.map(t=>{let n=e.get(String(t.key));return e.delete(String(t.key)),n??this.makeTab(t)});for(let t of e.values())t.host.dispose();this.entries.forEach((e,t)=>{this.tabList.controls.items.indexOf(e.host)!==t&&this.tabList.controls.moveToIndex(e.host,t)}),this.looks.forEach((e,t)=>this.entries[t].tab=e.tab);for(let e of this.looks){let t=[...this.panels.values()].find(t=>t.key===String(e.key));t&&t.tab!==e.tab&&(this.panels.delete(t.tab),t.tab=e.tab,this.panels.set(e.tab,t),this.followGroups(t))}this.looks.forEach((e,n)=>{let r=this.entries[n],i=r.host,a=u(e.text);d(r.caption,a);let o=a.key&&e.enabled?D(a.key):null;m(r.host,r.accessKey,o),r.accessKey=o,p(i,e.visible),t(i,`title`,e.hint||null),t(i,`aria-disabled`,e.enabled?null:`true`),t(i,`data-key`,String(e.key)),t(i,`data-context`,e.context||null),t(i,`aria-description`,e.context||null)});for(let[e,t]of this.panels)this.looks.some(t=>t.tab===e)||(this.dropPanel(t),this.panels.delete(e));this.drawSelection()}makeTab(e){let t=y(this.tabList,`button`,`mx-ribbon-menu__tab`),n=I(`mx-ribbon-tab`);t.attr.add({type:`button`,role:`tab`,id:n});let r=y(t,`span`,`mx-ribbon-menu__tab-text`);return{tab:e.tab,key:String(e.key),id:n,host:t,caption:r,accessKey:null}}drawNames(){t(this.tabList,`aria-label`,u(this.text??``).text||i.strings.ribbonMenuLabel);for(let e of this.panels.values())for(let t of e.groups.values())this.drawMoreHint(t);let e=this.peekProperty(`layout`)===`simple`?i.strings.ribbonMenuClassic:i.strings.ribbonMenuSimple;this.switcher.hint=e;for(let e of this.panels.values())e.overflow&&(e.overflow.hint=i.strings.moreOptions)}drawSelection(){let e=this.shownKey;this.looks.forEach((n,r)=>{let i=this.entries[r].host,a=n.key===e;t(i,`aria-selected`,String(a)),t(i,`tabindex`,a?`0`:`-1`)});let n=this.looks.find(t=>t.key===e);n&&this.showPanel(n);for(let[e,t]of this.panels)p(t.host,e===n?.tab);this.drawPicker(),this.queueLayout()}drawPicker(){let e=this.shownKey,t=this.looks.find(t=>t.key===e);this.picker.text=u(t?.text??``).text,this.picker.hint=i.strings.ribbonMenuTabs,this.picker.menu=this.looks.filter(e=>e.visible&&e.enabled).map(t=>({text:u(t.text).text,checked:t.key===e,group:`tab`,click:()=>this.choose(t,null)})),this.picker.refresh()}tabClick(e){let t=this.indexOfTab(e);if(t<0)return;let n=this.looks[t];if(n.enabled&&this.isEnabled){if(this.display!==`always`&&this.floating&&n.key===this.shownKey&&this.display===`tabs`){this.setFloating(!1);return}this.choose(n,e)&&this.display!==`always`&&this.setFloating(!0)}}tabDoubleClick(e){this.indexOfTab(e)<0||this.display===`auto`||this.changeDisplay(this.display===`tabs`?`always`:`tabs`,e)}tabKeyDown(e){let t=this.indexOfTab(e);if(t<0||e.isComposing||e.altKey||e.ctrlKey||e.metaKey)return;let n=this.looks.map((e,t)=>t).filter(e=>this.looks[e].visible&&this.looks[e].enabled),r=n.indexOf(t),i=_(this),a=-1;if(e.key===(i?`ArrowLeft`:`ArrowRight`))a=n[(r+1)%n.length];else if(e.key===(i?`ArrowRight`:`ArrowLeft`))a=n[(r-1+n.length)%n.length];else if(e.key===`Home`)a=n[0];else if(e.key===`End`)a=n[n.length-1];else if(e.key===`ArrowDown`){e.preventDefault(),this.display!==`always`&&!this.floating?(this.setFloating(!0),R(this).then(()=>this.floating&&this.focusCommands())):this.focusCommands();return}a===void 0||a<0||(e.preventDefault(),this.choose(this.looks[a],e)&&g(this.entries[a].host))}indexOfTab(e){return this.entries.findIndex(t=>t.host.motif.isEventFrom(e))}choose(e,t){let n=this.shownKey;if(e.key===n)return!0;let r=this.looks.find(e=>e.key===n)??null,i={key:e.key,previous:n,tab:e.tab,previousTab:r?.tab??null,originalEvent:t,source:this,cancel:!1};return this.selecting.fire(i),!i.cancel&&(this.changeProperty(`value`,e.key),this.selectionChanged.fire({key:e.key,previous:n,tab:e.tab,previousTab:r?.tab??null,originalEvent:t,source:this}),!0)}showPanel(e){let n=this.entries[this.looks.indexOf(e)],r=this.panels.get(e.tab);if(!r){let t=y(this.stage,`div`,`mx-ribbon-menu__panel`);t.attr.add({role:`tabpanel`}),t.motif.on(`scroll`,()=>this.drawEnds()),t.motif.on(`wheel`,(e,n)=>this.wheel(t,n));let n=I(`mx-ribbon-panel`);t.attr.add({id:n});let i={tab:e.tab,key:String(e.key),id:n,raw:[],host:t,groups:new Map,stop:()=>{},overflow:null};this.followGroups(i),r=i,this.panels.set(e.tab,r)}t(r.host,`aria-labelledby`,n.id),t(n.host,`aria-controls`,r.id)}followGroups(t){t.stop(),t.stop=e(this,`groups`,()=>z(C(t.tab,`groups`)).map((e,t)=>this.groupLookOf(e,t)),e=>{t.raw=e,this.drawGroups(t,this.customGroups(t,e))})}dropPanel(e){e.stop();for(let t of e.groups.values())this.dropGroup(t);e.host.dispose()}groupLookOf(e,t){return{group:e,key:String(b(e,`key`)??t),fixed:C(e,`fixed`)===!0,text:String(C(e,`text`)??``),visible:C(e,`visible`)!==!1,more:typeof b(e,`more`)==`function`,moreHint:String(C(e,`moreHint`)??``),priority:Number(C(e,`priority`)??0),collapsible:C(e,`collapsible`)!==!1}}drawGroups(e,t){let n=new Map,r=new Set;for(let i of t){let t=e.groups.get(i.group);t||(t=[...e.groups.values()].find(e=>!r.has(e)&&e.look?.key===i.key),t&&(t.group=i.group,this.followCommands(e,t)));let a=t??this.makeGroup(e,i.group);r.add(a),n.set(i.group,a)}for(let t of e.groups.values())r.has(t)||this.dropGroup(t);e.groups=n;let i=0;for(let t of n.values())for(let n of[t.divider,t.host])e.host.controls.items.indexOf(n)!==i&&e.host.controls.moveToIndex(n,i),i++;for(let r of t){let t=n.get(r.group);t.look=r,O(t.label,r.text),p(t.host,r.visible),this.drawMore(e,t,r)}this.drawDividers(e),this.queueRoving(),this.queueLayout()}makeGroup(e,t){let n=y(e.host,`div`,`mx-ribbon-menu__divider`);n.attr.add({"aria-hidden":`true`});let r=y(e.host,`div`,`mx-ribbon-menu__group`);r.attr.add({role:`group`});let i=y(r,`div`,`mx-ribbon-menu__group-inner`),a=y(i,`div`,`mx-ribbon-menu__commands`),o=y(i,`div`,`mx-ribbon-menu__group-foot`),s=y(o,`span`,`mx-ribbon-menu__group-label`),c=I(`mx-ribbon-group`);s.attr.add({id:c}),r.attr.add({"aria-labelledby":c});let l={group:t,divider:n,host:r,inner:i,commands:a,foot:o,label:s,more:null,made:new Map,stop:()=>{},current:null,look:null,wanted:[],level:0,out:!1,folded:!1,fold:null,popup:null};return this.followCommands(e,l),l}followCommands(t,n){n.stop(),n.stop=e(this,`commands`,()=>this.wantedOf(C(n.group,`commands`),!1),e=>{n.wanted=e,this.placeGroup(t,n)})}placeGroup(e,t){let n={get tab(){return e.tab},get group(){return t.group}},r=this.customCommands(e,t),i=t.wanted.filter(e=>!r.includes(e)).map(e=>({...e,visible:!1}));t.made=this.placeCommands(t.commands,t.made,[...r,...i],n,!1),this.drawSizes(t),this.queueRoving(),this.queueLayout()}dropGroup(e){e.stop(),e.popup?.close(`code`),e.fold?.dispose(),this.dropMade(e.made),e.divider.dispose(),e.host.dispose()}drawMore(e,t,n){if(n.more&&!t.more){let n=new j({icon:W(`more`)});n.class.add(`mx-ribbon-menu__more`),n.motif.on(`click`,(r,i)=>this.morePressed(e.tab,t,n,i)),t.foot.controls.add(n),t.more=n}else!n.more&&t.more&&(t.more.dispose(),t.more=null);this.drawMoreHint(t)}drawMoreHint(e){if(!e.more)return;let t=String(C(e.group,`moreHint`)??``);e.more.hint=t||v(i.strings.ribbonMenuMore,{group:e.look?.text??``})}morePressed(e,t,n,r){let i={group:t.group,tab:e,part:n,originalEvent:r,source:this};b(t.group,`more`)?.(i),this.groupMore.fire(i)}wantedOf(e,t){return z(e).map((e,n)=>{let r=C(e,`type`)??`button`;return{command:e,key:String(b(e,`key`)??n),fixed:C(e,`fixed`)===!0,type:r,size:t?`small`:C(e,`size`)??(r===`gallery`?`large`:`medium`),visible:T(e,`visible`,this)!==!1,simple:C(e,`simple`)!==!1}})}placeCommands(e,t,n,r,i){let a=new Map,o=new Set,s=(e,t)=>!!e&&!o.has(e)&&e.type===t.type&&(t.type!==`content`||b(e.command.peek(),`content`)===b(t.command,`content`)),c=new Map;for(let e of n){let n=t.get(e.command);s(n,e)&&(c.set(e,n),o.add(n))}for(let e of n){if(c.has(e))continue;let n=[...t.values()].find(t=>t.want.key===e.key&&s(t,e));n&&(c.set(e,n),o.add(n))}for(let e of n){let t=c.get(e)??this.makeCommand(e,typeof r==`function`?r(e.command):r,i);t.command.peek()!==e.command&&this.giveCommand(t,e.command),t.want=e,a.set(e.command,t)}let l=new Map;for(let[e,n]of t)o.has(n)||l.set(e,n);this.dropMade(l);let u=0;for(let t of n){let n=a.get(t.command),r=e.controls.items;r.includes(n.control)?r.indexOf(n.control)!==u&&e.controls.moveToIndex(n.control,u):e.controls.add(u,n.control),u++,p(n.control,t.visible),i&&this.drawSize(n,`small`)}return a}dropMade(e){for(let t of e.values())t.stop?.(),t.made&&this.dropMade(t.made),t.control.dispose()}giveCommand(e,t){F(()=>{if(e.command.value=t,e.control instanceof q&&(e.control.command=t),e.control instanceof j&&e.type===`toggle`){let n=A(t,`pressed`,this,`checked`);typeof n==`function`&&(e.control.pressed=n)}})}makeCommand(t,n,r){let{command:i,type:a}=t,o=S(i);if(a===`separator`){let e=new x(`div`);return e.class.add(`mx-ribbon-menu__separator`),e.attr.add({role:`separator`,"aria-orientation":`vertical`}),{control:e,type:a,want:t,command:o,made:null,stop:null}}if(a===`content`){let e=new x(`div`);e.class.add(`mx-ribbon-menu__content`);let n=b(i,`content`)?.();return n&&e.controls.add(n),{control:e,type:a,want:t,command:o,made:null,stop:null}}if(a===`gallery`)return{control:new q(i,(e,t)=>this.galleryPicked(o.peek(),e,n,t)),type:a,want:t,command:o,made:null,stop:null};if(a===`row`){let r=new x(`div`);r.class.add(`mx-ribbon-menu__row`),r.attr.add({role:`group`});let i={control:r,type:a,want:t,command:o,made:new Map,stop:null};return i.stop=e(this,`row`,()=>this.wantedOf(C(o.value,`commands`),!0),e=>{i.made=this.placeCommands(r,i.made,e,n,!0),this.queueRoving(),this.queueLayout()}),i}return{control:this.makeButton(o,a,n),type:a,want:t,command:o,made:null,stop:null}}makeButton(e,t,n){let r={icon:()=>{let t=String(T(e.value,`glyph`,this)??``);return t?W(t):T(e.value,`icon`,this)??null},enabled:()=>T(e.value,`enabled`,this)!==!1};t===`toggle`&&(r.toggle=!0,r.pressed=A(e.peek(),`pressed`,this,`checked`)),(t===`split`||t===`menu`)&&(r.menu=()=>C(e.value,`menu`)??[]),t===`split`&&(r.split=!0),(t===`split`||t===`menu`)&&(r.onItemClick=()=>this.floating&&this.setFloating(!1));let i=new j(r);return i.class.add(`mx-ribbon-menu__command`),t!==`menu`&&i.faceComponent.motif.on(`click`,(t,r)=>this.commandPressed(e.peek(),i,n,r)),i}galleryPicked(e,t,n,r){let i={command:e,group:n.group,tab:n.tab,item:t,originalEvent:r,source:this};b(e,`click`)?.(i),this.commandClick.fire(i),this.floating&&this.setFloating(!1)}commandPressed(e,t,n,r){let i={command:e,group:n.group,tab:n.tab,originalEvent:r,source:this};oe(e,i,this,r,this);let a=A(e,`pressed`,this,`checked`);typeof a==`function`&&(t.pressed=a),this.commandClick.fire(i),this.floating&&this.setFloating(!1)}shownLayout(){return this.compact?`simple`:this.peekProperty(`layout`)??`classic`}drawLayout(){let e=this.shownLayout()===`simple`;t(this,`data-layout`,e?`simple`:`classic`),p(this.switcher,this.peekProperty(`layoutSwitch`)!==!1&&!this.compact),this.switcher.icon=W(e?`chevron-down`:`chevron-up`),t(this.switcher.faceComponent,`aria-expanded`,String(!e)),this.drawNames(),this.queueLayout()}switchLayout(e){this.changeLayout(this.layout===`simple`?`classic`:`simple`,e)}changeLayout(e,t){let n=this.layout;n!==e&&(this.changeProperty(`layout`,e),this.drawLayout(),this.layoutChanged.fire({layout:e,previous:n,originalEvent:t,source:this}),this.remember({layout:e}))}queueLayout(){this.fitDue=!0,E(this,this.readRoom,this.fit)}readRoom=()=>({width:c(this).clientWidth,compact:ue(this,J,480)});fit=e=>{if(!this.fitDue&&e.width===this.fittedWidth)return;let t=this.shownPanel(),n=e.width>0&&e.width<e.compact;if(n!==this.compact&&(this.compact=n,k(this,`data-compact`,n),this.drawLayout()),this.fitDue=!1,this.fittedWidth=e.width,!t)return;let r=this.shownLayout()===`simple`,i=[...t.groups.values()].filter(e=>e.look?.visible!==!1),a=r!==this.fitSimple||t!==this.fitPanel;this.fitSimple=r;for(let e of t.groups.values())!i.includes(e)&&(a||e.level!==0)&&this.setLevel(e,0,r);let o=i.map((e,t)=>({group:e,index:t})).sort((e,t)=>(e.group.look?.priority??0)-(t.group.look?.priority??0)||t.index-e.index).map(e=>e.group),s=r?2:3,l=[];if(this.peekProperty(`adaptive`)!==!1)for(let e=1;e<=s;e++)for(let t of o)(e<s||t.look?.collapsible!==!1)&&l.push({group:t,level:e});let u=a,d=e=>{let n=new Map(i.map(e=>[e,0]));for(let t=0;t<e;t++)n.set(l[t].group,l[t].level);for(let[e,t]of n)(u||e.level!==t)&&this.setLevel(e,t,r);u=!1,j.readLooksNow(this.lookDue.splice(0)),this.drawOverflow(t,r)},f=()=>re(()=>{let e=c(t.host);return!e.clientWidth||e.scrollWidth<=e.clientWidth+.5}),p=e=>{this.fitCount=e,this.fitPanel=t,this.finishFit(t)},m=a?0:Math.min(this.fitCount,l.length);d(m);let h,g;if(f()){if(m===0)return p(0);if(d(m-1),!f())return d(m),p(m);h=0,g=m-1}else{if(m===l.length)return p(m);if(h=m+1,g=l.length,d(g),!f())return p(g)}for(;h<g;){let e=h+g>>1;d(e),f()?g=e:h=e+1}d(h),p(h)};finishFit(e){this.drawDividers(e),this.drawEnds(),this.queueRoving()}makeScroll(e){let n=new j({icon:W(e>0?`chevron-end`:`chevron-start`)});return n.class.add(`mx-ribbon-menu__scroll`,e>0?`mx-ribbon-menu__scroll--forward`:`mx-ribbon-menu__scroll--back`),t(n,`tabindex`,`-1`),n.attr.add({"aria-hidden":`true`}),n.motif.on(`mousedown`,(e,t)=>t.preventDefault()),n.motif.on(`click`,()=>this.scrollPanel(e)),p(n,!1),this.stage.controls.add(n),n}drawEnds(){E(this,this.readEnds,this.writeEnds)}readEnds=()=>{let e=this.shownPanel(),t=e?c(e.host):null;return{room:t?.clientWidth??0,needed:t?.scrollWidth??0,at:t?.scrollStart??0}};writeEnds=({room:e,needed:t,at:n})=>{p(this.back,t>e+1&&n>1),p(this.forward,t>e+1&&n+e<t-1)};scrollPanel(e){let t=this.shownPanel()?.host;if(!t)return;let n=de(this,`(prefers-reduced-motion: no-preference)`);V(t,{start:e*c(t).clientWidth*.8},n?`smooth`:`auto`)}wheel(e,t){if(t.deltaX||!t.deltaY)return;let n=c(e);n.scrollWidth<=n.clientWidth||(t.preventDefault(),V(e,{start:n.rtl?-t.deltaY:t.deltaY}))}placeSlot(e){let t=e===`start`?this.startHost:this.endHost,n=e===`start`?this.startControl:this.endControl,r=this.peekProperty(e===`start`?`barStart`:`barEnd`)??null;r!==n&&(n&&t.controls.items.includes(n)&&t.controls.remove(n),r&&t.controls.add(r),e===`start`?this.startControl=r:this.endControl=r,p(t,!!r))}setLevel(e,t,n){e.level=t,this.drawSizes(e,!0),!n&&t>=3?this.foldGroup(e):this.unfold(e),e.out=n&&t>=2,k(e.host,`data-out`,e.out)}sizeAt(e,t){let n=this.shownLayout()===`simple`;return e===`small`||t>=2||n&&t>=1?`small`:n||t>=1?`medium`:e}drawSizes(e,t=!1){for(let n of e.made.values()){if(n.type===`row`)continue;let r=this.shownLayout()===`simple`,i=n.type===`gallery`?e.level>=2||r||n.want.size===`small`?`small`:`large`:this.sizeAt(n.want.size,e.level);this.drawSize(n,i,t),k(n.control,`data-simple-hidden`,!n.want.simple)}}drawSize(e,n,r=!1){if(e.size===n||(e.size=n,t(e.control,`data-ribbon-size`,n),e.control instanceof q&&e.control.setSmall(n===`small`),!(e.control instanceof j)))return;let i=e.command,a=e.control;n===`small`?(a.text=``,a.hint=()=>String(T(i.value,`hint`,this)??``)||u(String(T(i.value,`text`,this)??``)).text):(a.text=()=>String(T(i.value,`text`,this)??``),a.hint=()=>String(T(i.value,`hint`,this)??``)),r?this.lookDue.push(a):a.readLook()}foldGroup(e){if(!e.fold){let t=new j({text:()=>e.look?.text??``,icon:()=>{let t=String(C(e.group,`glyph`)??``);return t?W(t):C(e.group,`icon`)??null}});t.class.add(`mx-ribbon-menu__command`,`mx-ribbon-menu__fold`),t.attr.add({"data-ribbon-size":`large`,"aria-haspopup":`dialog`,"aria-expanded":`false`}),h(y(t,`span`,`mx-ribbon-menu__fold-arrow`),`chevron-down`),t.motif.on(`click`,()=>this.toggleFold(e));let n=new P;n.matchWidth=!1,n.class.add(`mx-ribbon-menu__drop`),n.attr.add({role:`dialog`}),n.onClosed(()=>this.lend(e,!1)),e.host.controls.add(t),e.host.controls.add(n),e.fold=t,e.popup=n}e.folded=!0,k(e.host,`data-folded`,!0)}toggleFold(e){let{fold:n,popup:r}=e;if(n&&r){if(r.isOpen){r.close(`code`);return}this.lend(e,!0),t(r,`aria-label`,e.look?.text??``),r.open(n),t(n,`aria-expanded`,`true`),N(r)||g(r)}}unfold(e){e.popup?.close(`code`),this.lend(e,!1),e.folded=!1,k(e.host,`data-folded`,!1)}lend(e,n){if(!e.popup||e.host.isDisposed)return;e.fold&&t(e.fold,`aria-expanded`,String(n));let r=n?e.popup:e.host;e.inner.parent!==r&&(r.controls.add(e.inner),n||e.host.controls.moveToIndex(e.inner,0),this.queueRoving())}drawDividers(e){let t=!0;for(let n of e.groups.values()){let e=n.look?.visible!==!1&&!n.out;p(n.divider,e&&!t),e&&(t=!1)}}drawOverflow(e,t){let n=[];if(t)for(let t of e.groups.values()){if(t.look?.visible===!1)continue;let e=this.menuItemsOf(t.made,e=>t.out||!e.want.simple);e.length&&n.push({text:t.look?.text??``,items:e})}if(n.length&&!e.overflow){let t=new j({menu:[],icon:pe()});t.class.add(`mx-ribbon-menu__command`,`mx-ribbon-menu__overflow`),t.attr.add({"data-ribbon-size":`small`}),t.hint=i.strings.moreOptions,e.host.controls.add(t),e.overflow=t}e.overflow&&(e.overflow.menu=n,e.overflow.refresh(),p(e.overflow,n.length>0))}menuItemsOf(e,t){let n=[],r=!1;for(let i of e.values())if(i.want.visible&&t(i)){if(i.type===`separator`){r=n.length>0;continue}if(i.type===`row`&&i.made){for(let e of this.menuItemsOf(i.made,()=>!0))n.push({...e,beginGroup:r}),r=!1;continue}if(i.control instanceof q){let e=i.control,t=this.whereOfMade(i);n.push({text:u(String(T(i.want.command,`text`,this)??``)).text,beginGroup:r,items:e.items().map(n=>({text:String(C(n,`text`)??``),enabled:C(n,`enabled`)!==!1,group:`gallery`,checked:e.isChosen(n),click:e=>this.galleryPicked(i.want.command,n,t,e.event)}))}),r=!1;continue}i.control instanceof j&&(n.push({...me(i.control),text:()=>u(String(T(i.want.command,`text`,this)??``)).text,beginGroup:r}),r=!1)}return n}drawDisplay(){let e=this.peekProperty(`display`)??`always`;t(this,`data-display`,e),e===`always`&&this.setFloating(!1),t(this.reveal,`aria-label`,i.strings.ribbonMenuReveal),t(this.reveal,`title`,i.strings.ribbonMenuReveal),t(this.reveal,`aria-expanded`,String(this.floating)),this.queueLayout()}changeDisplay(e,t){let n=this.display;n!==e&&(this.changeProperty(`display`,e),this.drawDisplay(),this.displayChanged.fire({display:e,previous:n,originalEvent:t,source:this}),this.remember({display:e}))}setFloating(e){e!==this.floating&&(this.floating=e,k(this,`data-floating`,e),t(this.reveal,`aria-expanded`,String(e)),e||this.hints.stop(),this.queueLayout())}ownKeyDown(e){e.defaultPrevented||(e.key===`F1`&&e.ctrlKey&&!e.altKey&&!e.metaKey&&this.display!==`auto`?(e.preventDefault(),this.changeDisplay(this.display===`tabs`?`always`:`tabs`,e)):e.key===`Escape`&&this.floating&&(e.preventDefault(),this.setFloating(!1),this.display===`tabs`?this.focus():g(this.reveal)))}focusLeft(e){this.focusLeaving=!!e.relatedTarget}focusLanded(e){this.focusLeaving&&(this.focusLeaving=!1,this.floating&&!this.motif.isEventFrom(e)&&this.setFloating(!1))}pagePointerDown(e){let t=this.motif.isEventFrom(e);this.hints.active&&!t&&this.hints.stop(),this.floating&&!t&&this.setFloating(!1)}pageKeyDown(e){if(this.hints.active){this.hints.key(e)&&(e.preventDefault(),e.stopImmediatePropagation());return}if(e.key===`Alt`){this.altDown=!0,this.altChord=!1;return}this.altDown&&(this.altChord=!0),e.key===`F10`&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&this.claimsKeys(e)&&(e.preventDefault(),this.showKeyHints())}pageKeyUp(e){if(e.key!==`Alt`)return;let t=this.altDown&&!this.altChord;this.altDown=!1,t&&this.claimsKeys(e)&&(this.hints.active?this.hints.stop():this.showKeyHints())}claimsKeys(e){if(this.peekProperty(`keyHints`)===!1||!this.isEnabled)return!1;let t=[...te()].filter(e=>e instanceof r&&M(e,this)),n=t.filter(t=>ce(t,e)).sort((e,t)=>w(t)-w(e))[0];return n?n===this:t.sort(ae).find(e=>ee(e))===this}tabHints(){let e=[],t=u(this.appButton);t.text&&e.push({part:this.app,keys:t.key??``,text:t.text,press:()=>this.app.attr.add({click:!0})}),this.looks.forEach((t,n)=>{if(!t.visible||!t.enabled)return;let r=u(t.text),i=this.compact?this.picker:this.entries[n].host;e.push({part:i,keys:r.key??``,text:r.text,press:()=>this.pressTab(t),tab:!0})});let n=1;for(let t of this.quickMade.values())!(t.control instanceof j)||!t.want.visible||n>9||e.push(Z(t.control,String(n++),``));return e}pressTab(e){this.choose(e,null),this.display!==`always`&&this.setFloating(!0)}commandHints(){let e=this.shownPanel();if(!e)return[];let t=[];for(let n of e.groups.values())if(!(n.look?.visible===!1||n.out)){if(n.folded&&n.fold){t.push({part:n.fold,keys:``,text:n.look?.text??``,press:()=>!n.popup?.isOpen&&this.toggleFold(n),opens:()=>this.foldedHints(n)});continue}t.push(...this.groupHints(n))}return e.overflow&&e.overflow.menu.length&&t.push(Z(e.overflow,``,i.strings.moreOptions)),t}foldedHints(e){return{hints:this.groupHints(e),host:e.popup,close:()=>e.popup?.close(`code`)}}groupHints(e){let t=[],n=e=>{if(!e.want.visible)return;let r=e.want.command,i=u(String(T(r,`text`,this)??``)),a=String(C(r,`keyHint`)??``)||i.key||``;if(e.control instanceof j)t.push(Z(e.control,a,i.text));else if(e.control instanceof q){let n=e.control;t.push({part:n.opener.faceComponent,keys:a,text:i.text,press:()=>n.toggle()})}else if(e.type===`content`){let n=e.control;if(!ie(n))return;let o=u(X(n)),s=i.text||String(T(r,`hint`,this)??``);t.push({part:n,keys:a||(s?``:o.key??``),text:s||o.text,press:()=>N(n)})}else if(e.made)for(let t of e.made.values())n(t)};for(let t of e.made.values())n(t);return e.more&&t.push(Z(e.more,``,e.look?.text??``)),t}drawApp(){let e=u(this.peekProperty(`appButton`)??``);d(this.appCaption,e);let t=e.key?D(e.key):null;m(this.app,this.appKey,t),this.appKey=t,p(this.app,e.text!==``)}drawQuick(){let n=this.custom.quickBar??this.peekProperty(`quickBar`)??`start`,r=n===`start`?this.quickTop:n===`below`?this.quickBelow:null;if(r!==this.quickHost&&(this.stopQuick?.(),this.stopQuick=null,this.dropMade(this.quickMade),this.quickMade=new Map,this.quickHost=r),p(this.quickTop,!1),p(this.quickBelow,!1),!r)return;t(r,`aria-label`,i.strings.ribbonMenuQuick),this.stopQuick?.();let a=this.peekProperty(`quickCommands`);this.stopQuick=e(this,`quick`,()=>{let e=[...z(a)];for(let t of this.custom.quick??[]){let n=this.resolve(t);n&&!e.includes(n.command)&&e.push(n.command)}return this.wantedOf(e,!0)},e=>{this.quickMade=this.placeCommands(r,this.quickMade,e,e=>this.whereOf(e),!0),p(r,e.some(e=>e.visible)),this.queueLayout()})}whereOf(e){for(let t of this.custom.quick??[]){let n=this.resolve(t);if(n?.command===e)return{tab:n.tab,group:n.group}}return{tab:null,group:null}}resolve(e){let[t,n,r]=e.split(`/`),i=this.currentTabs();for(let[e,a]of i.entries()){if(String(b(a,`key`)??e)!==t)continue;let i=z(C(a,`groups`));for(let[e,t]of i.entries()){if(String(b(t,`key`)??e)!==n)continue;let i=z(C(t,`commands`));for(let[e,n]of i.entries())if(String(b(n,`key`)??e)===r)return{command:n,group:t,tab:a}}}return null}tabKeyOf(e){return String(this.looks.find(t=>t.tab===e)?.key??``)}takeCustomization(){let e=this.peekProperty(`customization`);this.custom=e?Q(e):{},this.custom.layout&&this.custom.layout!==this.layout&&this.changeProperty(`layout`,this.custom.layout),this.custom.display&&this.custom.display!==this.display&&this.changeProperty(`display`,this.custom.display),this.drawLayout(),this.drawDisplay(),this.redrawCustom()}remember(e){this.custom={...this.custom,...e},this.customized.fire({customization:Q(this.custom),source:this})}redrawCustom(){for(let e of this.panels.values()){this.drawGroups(e,this.customGroups(e,e.raw));for(let t of e.groups.values())this.placeGroup(e,t)}this.drawQuick(),this.queueLayout()}customGroups(e,t){let n=this.tabKeyOf(e.tab),r=new Set(this.custom.hidden??[]),i=K(t.filter(e=>e.fixed||!r.has(`${n}/${e.key}`)),this.custom.order?.[n],e=>e.key);return[...i,...t.filter(e=>!i.includes(e)).map(e=>({...e,visible:!1,hiddenByUser:!0}))]}customCommands(e,t){let n=`${this.tabKeyOf(e.tab)}/${t.look?.key??``}`,r=new Set(this.custom.hidden??[]);return K(t.wanted.filter(e=>e.fixed||!r.has(`${n}/${e.key}`)),this.custom.order?.[n],e=>e.key)}hideByUser(e){this.remember({hidden:[...(this.custom.hidden??[]).filter(t=>t!==e),e],quick:(this.custom.quick??[]).filter(t=>t!==e)}),this.redrawCustom()}moveByUser(e,t,n,r){let i=t.indexOf(n),a=i+r;if(i<0||a<0||a>=t.length)return;let o=[...t];[o[i],o[a]]=[o[a],o[i]],this.remember({order:{...this.custom.order??{},[e]:o}}),this.redrawCustom()}pinByUser(e,t){let n=(this.custom.quick??[]).filter(t=>t!==e);this.remember({quick:t?[...n,e]:n}),this.drawQuick()}resetCustom(){this.custom={},this.customized.fire({customization:{},source:this}),this.redrawCustom()}customMenuOpening(e){if(this.fromContent(e.event)){e.cancel=!0;return}let{item:t,path:n}=this.customTarget(e.event),r={item:t,path:n,items:this.peekProperty(`customizable`)===!1?[]:this.menuCommands(e.event),cancel:!1,byKeyboard:e.byKeyboard,event:e.event,source:this};this.customMenuOpened.fire(r),e.items=r.items,e.cancel=r.cancel}customTarget(e){let t=this.hitOf(e);if(t?.quick)return{item:t.path?this.findCommand(t.path):null,path:t.path};if(t){let e=`${this.tabKeyOf(t.panel.tab)}/${t.group.look?.key??``}`;return t.made?{item:t.made.want.command,path:`${e}/${t.made.want.key}`}:{item:this.findGroup(e),path:e}}let n=this.entries[this.indexOfTab(e)];return n?{item:n.tab,path:n.key}:{item:null,path:null}}menuCommands(e){let t=i.strings,n=[],r=this.hitOf(e);if(r?.quick)r.path&&n.push({text:t.ribbonMenuUnpin,click:()=>this.pinByUser(r.path,!1)});else if(r){let{panel:e,group:i,made:a}=r,o=this.tabKeyOf(e.tab),s=`${o}/${i.look?.key??``}`;if(a){let r=`${s}/${a.want.key}`,o=u(String(C(a.want.command,`text`)??``)).text;if(a.control instanceof j){let e=(this.custom.quick??[]).includes(r);n.push({text:e?t.ribbonMenuUnpin:t.ribbonMenuPin,click:()=>this.pinByUser(r,!e)})}if(!a.want.fixed){let c=this.customCommands(e,i),l=c.map(e=>e.key),u=l.indexOf(a.want.key);n.push({text:v(t.ribbonMenuHide,{name:o}),click:()=>this.hideByUser(r)},{text:t.ribbonMenuMoveEarlier,enabled:u>0&&!c[u-1].fixed,click:()=>this.moveByUser(s,l,a.want.key,-1)},{text:t.ribbonMenuMoveLater,enabled:u<l.length-1&&!c[u+1].fixed,click:()=>this.moveByUser(s,l,a.want.key,1)})}}if(i.look&&!i.look.fixed){let r=[...e.groups.values()].map(e=>e.look).filter(e=>!e?.hiddenByUser),a=r.map(e=>e?.key??``),c=a.indexOf(i.look.key),l=i.look.text;n.push({text:v(t.ribbonMenuHideGroup,{name:l}),beginGroup:n.length>0,click:()=>this.hideByUser(s)},{text:t.ribbonMenuMoveGroupEarlier,enabled:c>0&&!r[c-1]?.fixed,click:()=>this.moveByUser(o,a,i.look.key,-1)},{text:t.ribbonMenuMoveGroupLater,enabled:c<a.length-1&&!r[c+1]?.fixed,click:()=>this.moveByUser(o,a,i.look.key,1)})}}let a=this.display,o=this.layout,s=this.custom.quickBar??this.quickBar,c=[];return(this.custom.hidden??[]).length&&c.push({text:t.ribbonMenuShowHidden,click:()=>{this.remember({hidden:[]}),this.redrawCustom()}}),this.peekProperty(`layoutSwitch`)!==!1&&!this.compact&&c.push({text:t.ribbonMenuLayout,items:[{text:t.ribbonMenuLayoutClassic,group:`layout`,checked:o===`classic`,click:()=>this.changeLayout(`classic`,null)},{text:t.ribbonMenuLayoutSimple,group:`layout`,checked:o===`simple`,click:()=>this.changeLayout(`simple`,null)}]}),c.push({text:t.ribbonMenuDisplay,items:[{text:t.ribbonMenuDisplayAlways,group:`display`,checked:a===`always`,click:()=>this.changeDisplay(`always`,null)},{text:t.ribbonMenuDisplayTabs,group:`display`,checked:a===`tabs`,click:()=>this.changeDisplay(`tabs`,null)},{text:t.ribbonMenuDisplayAuto,group:`display`,checked:a===`auto`,click:()=>this.changeDisplay(`auto`,null)}]},{text:t.ribbonMenuQuick,items:[{text:t.ribbonMenuQuickStart,group:`quick`,checked:s===`start`,click:()=>this.placeQuick(`start`)},{text:t.ribbonMenuQuickBelow,group:`quick`,checked:s===`below`,click:()=>this.placeQuick(`below`)},{text:t.ribbonMenuQuickHidden,group:`quick`,checked:s===`hidden`,click:()=>this.placeQuick(`hidden`)}]}),Object.keys(this.custom).some(e=>e!==`layout`&&e!==`display`)&&c.push({text:t.ribbonMenuReset,click:()=>this.resetCustom()}),c[0].beginGroup=n.length>0,[...n,...c]}placeQuick(e){this.remember({quickBar:e}),this.drawQuick()}whereOfMade(e){for(let t of this.panels.values())for(let n of t.groups.values())if([...n.made.values()].includes(e))return{tab:t.tab,group:n.group};return{tab:null,group:null}}hitOf(e){if(this.quickHost?.motif.isEventFrom(e)){for(let[t,n]of this.quickMade)if(n.control.motif.isEventFrom(e))return{quick:!0,path:(this.custom.quick??[]).find(e=>this.resolve(e)?.command===t)??null};return null}let t=this.shownPanel();if(!t)return null;for(let n of t.groups.values())if(n.host.motif.isEventFrom(e)||n.popup?.motif.isEventFrom(e)){for(let r of n.made.values())if(r.control.motif.isEventFrom(e)&&r.type!==`row`)return{panel:t,group:n,made:r};return{panel:t,group:n,made:null}}return null}fromContent(e){let t=n=>{for(let r of n.values())if(r.type===`content`&&r.control.motif.isEventFrom(e)||r.made&&t(r.made))return!0;return!1};if(t(this.quickMade))return!0;for(let e of this.panels.values())for(let n of e.groups.values())if(t(n.made))return!0;return!1}groupStops(e){let t=[];return e.inner.parent!==e.popup&&(this.madeStops(e.made,t),e.more&&Y(e.more,t)),e.fold&&Y(e.fold,t),t}madeStops(e,t){for(let n of e.values())n.made?this.madeStops(n.made,t):n.type!==`content`&&Y(n.control,t)}panelStops(e){let t=[];for(let n of e.groups.values())t.push(...this.groupStops(n));return e.overflow&&Y(e.overflow,t),t}drawStops(e,n){for(let r of e)t(r,`tabindex`,r===n?`0`:`-1`)}shownPanel(){let e=this.looks.find(e=>e.key===this.shownKey);return(e&&this.panels.get(e.tab))??null}queueRoving(){this.rovingQueued||(this.rovingQueued=!0,queueMicrotask(()=>{this.rovingQueued=!1,this.isDisposed||F(()=>this.drawRoving())}))}drawRoving(){for(let e of this.panels.values())for(let t of e.groups.values()){let e=this.groupStops(t),n=t.current&&e.includes(t.current)?t.current:e[0]??null;t.current=n,this.drawStops(e,n)}}groupOf(e){let t=this.shownPanel();if(!t)return null;for(let n of t.groups.values())if(n.host.motif.isEventFrom(e))return n;return null}focusCommands(){let e=this.shownPanel();if(e){this.drawRoving();for(let t of e.groups.values())if(t.look?.visible!==!1&&t.current){g(t.current);return}}}commandFocused(e){let t=this.groupOf(e);if(!t)return;let n=this.groupStops(t),r=n.find(t=>t.motif.isEventFrom(e));r&&(t.current=r,this.drawStops(n,r))}commandKeyDown(e){if(e.defaultPrevented||e.isComposing||this.fromContent(e))return;if(e.key===`Escape`){e.preventDefault(),this.focus();return}let t=this.shownPanel();if(!t)return;let n=this.panelStops(t),r=n.findIndex(t=>t.motif.isEventFrom(e));if(r<0)return;let i=_(this),a=-1;e.key===(i?`ArrowLeft`:`ArrowRight`)||e.key===`ArrowDown`?a=(r+1)%n.length:e.key===(i?`ArrowRight`:`ArrowLeft`)||e.key===`ArrowUp`?a=(r-1+n.length)%n.length:e.key===`Home`?a=0:e.key===`End`&&(a=n.length-1),!(a<0)&&(e.preventDefault(),g(n[a]))}};function Y(e,t){if(!(e instanceof P)){a(e)&&t.push(e);for(let n of e.controls.items)Y(n,t)}}function X(e){if(e instanceof H)return e.label;let t=e.attr.get(`aria-label`);if(typeof t==`string`&&t)return t;for(let t of e.controls.items){let e=X(t);if(e)return e}return``}function Z(e,t,n){let r=e.faceComponent;return{part:r,keys:t,text:n,press:()=>{!e.hasMenu||e.split?r.attr.add({click:!0}):e.opened?e.close():e.open()}}}function Q(e){let t={...e};return e.hidden&&(t.hidden=[...e.hidden]),e.quick&&(t.quick=[...e.quick]),e.order&&(t.order=Object.fromEntries(Object.entries(e.order).map(([e,t])=>[e,[...t]]))),t}var Se=`import { reactive } from '@motifx/core';\r
import { DropDown, RibbonMenu, Stack, type RibbonTab } from '@motifx-community/ui';\r
\r
const COLORS = [\r
    { key: 'ink', text: 'Ink', color: '#1f2937' },\r
    { key: 'sea', text: 'Sea', color: '#0e7490' },\r
    { key: 'leaf', text: 'Leaf', color: '#15803d' },\r
    { key: 'sun', text: 'Sun', color: '#b45309' },\r
    { key: 'rose', text: 'Rose', color: '#be123c' },\r
    { key: 'dusk', text: 'Dusk', color: '#6d28d9' }\r
];\r
\r
/** Every size and type of command, in one tab. It does not give way, so every command keeps its size; what does not fit scrolls. */\r
export default function CommandTypes() {\r
    const s = reactive({ told: 'nothing yet', bold: false, wrap: true, color: 'sea', zoom: '100%' });\r
    const run = (what: string) => () => (s.told = what);\r
\r
    const items: RibbonTab[] = [\r
        {\r
            key: 'commands',\r
            text: '&Commands',\r
            groups: [\r
                {\r
                    text: 'Sizes',\r
                    commands: [\r
                        { text: 'Large', glyph: 'star', size: 'large', click: run('large') },\r
                        { text: 'Medium', glyph: 'star', click: run('medium') },\r
                        { text: 'Medium too', glyph: 'star', click: run('medium too') },\r
                        { text: 'Small', glyph: 'star', size: 'small', click: run('small') }\r
                    ]\r
                },\r
                {\r
                    text: 'Types',\r
                    commands: [\r
                        { text: 'Split', glyph: 'save', size: 'large', type: 'split', click: run('split'), menu: [{ text: 'Save a copy', click: run('save a copy') }] },\r
                        { text: 'Bold', glyph: 'pencil', type: 'toggle', pressed: () => s.bold, click: () => (s.bold = !s.bold) },\r
                        { text: 'Wrap', glyph: 'columns', type: 'toggle', pressed: () => s.wrap, click: () => (s.wrap = !s.wrap) },\r
                        { text: 'Export', glyph: 'download', type: 'menu', menu: [{ text: 'As a PDF', click: run('pdf') }, { text: 'As a picture', click: run('picture') }] },\r
                        { type: 'separator' },\r
                        { type: 'row', commands: [{ text: 'Undo', glyph: 'undo', click: run('undo') }, { text: 'Repeat', glyph: 'repeat', click: run('repeat') }, { text: 'Delete', glyph: 'trash', click: run('delete') }] },\r
                        { type: 'content', content: () => <DropDown label="Zoom" labelMode="hidden" size="sm" style="inline-size: 7rem" items={['50%', '100%', '200%']} x-model={() => s.zoom} /> }\r
                    ]\r
                },\r
                {\r
                    text: 'Gallery',\r
                    priority: 1,\r
                    commands: [\r
                        {\r
                            type: 'gallery',\r
                            text: 'Colors',\r
                            columns: 3,\r
                            value: () => s.color,\r
                            items: COLORS.map(c => ({ key: c.key, text: c.text, icon: () => <span class="rb-swatch" style={\`display: block; inline-size: 1.25rem; block-size: 1.25rem; border-radius: 50%; background: \${c.color}\`} /> })),\r
                            click: e => {\r
                                s.color = String(e.item?.key);\r
                                s.told = \`color: \${e.item?.text}\`;\r
                            }\r
                        }\r
                    ]\r
                }\r
            ]\r
        }\r
    ];\r
\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <RibbonMenu class="rb-types" items={items} layoutSwitch={false} adaptive={false} />\r
            <output class="rb-types-told">{() => \`Last command: \${s.told}\`}</output>\r
        </Stack>\r
    );\r
}\r
`,$=`import { reactive } from '@motifx/core';\r
import { Button, RibbonMenu, Stack, type RibbonMenuCustomization } from '@motifx-community/ui';\r
import { documentTabs } from './document-tabs';\r
\r
const KEY = 'docs.ribbon.customization';\r
\r
function load(): RibbonMenuCustomization | null {\r
    try {\r
        return JSON.parse(localStorage.getItem(KEY) ?? 'null') as RibbonMenuCustomization | null;\r
    } catch {\r
        return null;\r
    }\r
}\r
\r
/** What the user changes with the context menu is saved, and given back when the page opens again. */\r
export default function Customize() {\r
    const s = reactive({ saved: load(), told: 'nothing yet' });\r
    const run = (what: string) => () => (s.told = what);\r
\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <RibbonMenu\r
                class="rb-customize"\r
                items={documentTabs(run)}\r
                customization={() => s.saved}\r
                onCustomized={e => {\r
                    localStorage.setItem(KEY, JSON.stringify(e.customization));\r
                    s.saved = e.customization;\r
                }}\r
            />\r
            <Stack orientation="horizontal" gap="md" wrap align="center">\r
                <Button\r
                    text="Forget the changes"\r
                    variant="outline"\r
                    onclick={() => {\r
                        localStorage.removeItem(KEY);\r
                        s.saved = {};\r
                    }}\r
                />\r
                <output class="rb-customize-told">{() => \`Last command: \${s.told}\`}</output>\r
            </Stack>\r
            <pre class="rb-customize-json" style="margin: 0; white-space: pre-wrap">{() => JSON.stringify(s.saved ?? {}, null, 2)}</pre>\r
        </Stack>\r
    );\r
}\r
`,Ce=`import { reactive } from '@motifx/core';\r
import { ButtonGroup, RibbonMenu, Stack, Switch, type RibbonCommand, type RibbonMenuDisplay, type RibbonQuickBarPosition } from '@motifx-community/ui';\r
import { documentTabs } from './document-tabs';\r
\r
/** How the menu is shown, the button before the tabs, the quick commands and the key hints. */\r
export default function Display() {\r
    const s = reactive({ display: 'always' as RibbonMenuDisplay, quick: 'start' as RibbonQuickBarPosition, hints: true, told: 'nothing yet' });\r
    const run = (what: string) => () => (s.told = what);\r
    const quick: RibbonCommand[] = [\r
        { key: 'save', text: 'Save', glyph: 'save', click: run('save') },\r
        { key: 'undo', text: 'Undo', glyph: 'undo', click: run('undo') }\r
    ];\r
\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <Stack orientation="horizontal" gap="lg" wrap align="center">\r
                <ButtonGroup\r
                    label="Show the commands"\r
                    x-model={() => s.display}\r
                    items={[\r
                        { value: 'always', text: 'Always' },\r
                        { value: 'tabs', text: 'Only the tabs' },\r
                        { value: 'auto', text: 'Hide automatically' }\r
                    ]}\r
                />\r
                <ButtonGroup\r
                    label="Quick commands"\r
                    x-model={() => s.quick}\r
                    items={[\r
                        { value: 'start', text: 'In the row of tabs' },\r
                        { value: 'below', text: 'Under the commands' },\r
                        { value: 'hidden', text: 'Hidden' }\r
                    ]}\r
                />\r
                <Switch label="Key hints" x-model={() => s.hints} />\r
            </Stack>\r
            <RibbonMenu\r
                class="rb-display"\r
                items={documentTabs(run)}\r
                display={() => s.display}\r
                quickBar={() => s.quick}\r
                keyHints={() => s.hints}\r
                quickCommands={quick}\r
                appButton="&File"\r
                onAppButton={run('the File button')}\r
                onDisplayChanged={e => (s.display = e.display)}\r
            />\r
            <output class="rb-display-told">{() => \`Last command: \${s.told}\`}</output>\r
        </Stack>\r
    );\r
}\r
`,we=`import { reactive } from '@motifx/core';\r
import { AppMenu, Button, DropDown, NumberBox, RibbonMenu, Stack, Switch, TextBox, type RibbonCommand, type RibbonTab } from '@motifx-community/ui';\r
\r
const FONTS = ['Sans', 'Serif', 'Mono'];\r
\r
const STYLES = [\r
    { key: 'normal', text: 'Normal', look: 'font-size: 0.875rem' },\r
    { key: 'heading1', text: 'Heading 1', look: 'font-size: 1.125rem; font-weight: 700' },\r
    { key: 'heading2', text: 'Heading 2', look: 'font-size: 1rem; font-weight: 600' },\r
    { key: 'title', text: 'Title', look: 'font-size: 1.25rem' },\r
    { key: 'quote', text: 'Quote', look: 'font-style: italic' },\r
    { key: 'code', text: 'Code', look: 'font-family: monospace' }\r
];\r
\r
const letter = (text: string, style: string) => () => <span class="rb-letter" style={style}>{text}</span>;\r
\r
/** The commands of a document editor: every tab, group and command is given by the app. */\r
export default function Editor() {\r
    const s = reactive({ style: 'normal', menu: false, tab: 'home', told: 'nothing yet', bold: false, italic: false, underline: false, ruler: true, grid: false, picture: false, font: 'Sans', size: 11 });\r
    const run = (what: string) => () => (s.told = what);\r
\r
    const items: RibbonTab[] = [\r
        {\r
            key: 'home',\r
            text: '&Home',\r
            groups: [\r
                {\r
                    text: 'Clipboard',\r
                    glyph: 'file',\r
                    more: run('clipboard options'),\r
                    commands: [\r
                        { text: 'Paste', glyph: 'file', size: 'large', type: 'split', click: run('paste'), menu: [{ text: 'Keep source look', click: run('paste: keep look') }, { text: 'Keep text only', click: run('paste: text only') }] },\r
                        { text: 'Cut', glyph: 'trash', click: run('cut') },\r
                        { text: 'Copy', glyph: 'file', click: run('copy') },\r
                        { text: 'Copy look', glyph: 'eyedropper', click: run('copy look') }\r
                    ]\r
                },\r
                {\r
                    text: 'Font',\r
                    glyph: 'pencil',\r
                    more: run('font options'),\r
                    commands: [\r
                        { type: 'content', content: () => <DropDown label="Font" labelMode="hidden" size="sm" style="inline-size: 9rem" items={FONTS} x-model={() => s.font} /> },\r
                        { type: 'content', content: () => <NumberBox label="Size" labelMode="hidden" size="sm" style="inline-size: 6.5rem" min={6} max={96} x-model={() => s.size} /> },\r
                        {\r
                            type: 'row',\r
                            commands: [\r
                                { text: 'Bold', icon: letter('B', 'font-weight: 700'), type: 'toggle', pressed: () => s.bold, click: () => (s.bold = !s.bold) },\r
                                { text: 'Italic', icon: letter('I', 'font-style: italic'), type: 'toggle', pressed: () => s.italic, click: () => (s.italic = !s.italic) },\r
                                { text: 'Underline', icon: letter('U', 'text-decoration: underline'), type: 'toggle', pressed: () => s.underline, click: () => (s.underline = !s.underline) }\r
                            ]\r
                        }\r
                    ]\r
                },\r
                {\r
                    text: 'Styles',\r
                    glyph: 'star',\r
                    priority: 2,\r
                    commands: [\r
                        {\r
                            type: 'gallery',\r
                            text: 'Styles',\r
                            columns: 3,\r
                            value: () => s.style,\r
                            items: STYLES.map(st => ({ key: st.key, text: st.text, icon: () => <span class="rb-style" style={st.look}>Aa</span> })),\r
                            click: e => {\r
                                s.style = String(e.item?.key);\r
                                s.told = \`style: \${e.item?.text}\`;\r
                            }\r
                        }\r
                    ]\r
                },\r
                {\r
                    text: 'Editing',\r
                    glyph: 'search',\r
                    priority: 1,\r
                    commands: [\r
                        { text: 'Find', glyph: 'search', click: run('find') },\r
                        { text: 'Replace', glyph: 'pencil', click: run('replace') },\r
                        { text: 'Select', glyph: 'check', type: 'menu', menu: [{ text: 'Select all', click: run('select all') }, { text: 'Select similar', click: run('select similar') }] }\r
                    ]\r
                }\r
            ]\r
        },\r
        {\r
            key: 'insert',\r
            text: '&Insert',\r
            groups: [\r
                {\r
                    text: 'Tables',\r
                    commands: [{ text: 'Table', glyph: 'table', size: 'large', type: 'menu', menu: [{ text: 'Insert a table', click: run('insert table') }, { text: 'Draw a table', click: run('draw table') }] }]\r
                },\r
                {\r
                    text: 'Illustrations',\r
                    commands: [\r
                        { text: 'Chart', glyph: 'chart', size: 'large', click: run('chart') },\r
                        { type: 'separator' },\r
                        { text: 'Picture', glyph: 'file', click: run('picture') },\r
                        { text: 'Date', glyph: 'calendar', click: run('date') },\r
                        { text: 'Time', glyph: 'clock', click: run('time') }\r
                    ]\r
                }\r
            ]\r
        },\r
        {\r
            key: 'view',\r
            text: '&View',\r
            groups: [\r
                {\r
                    text: 'Show',\r
                    commands: [\r
                        { text: 'Ruler', glyph: 'columns', type: 'toggle', pressed: () => s.ruler, click: () => (s.ruler = !s.ruler) },\r
                        { text: 'Grid', glyph: 'table', type: 'toggle', pressed: () => s.grid, click: () => (s.grid = !s.grid) }\r
                    ]\r
                },\r
                { text: 'Zoom', commands: [{ text: 'Zoom out', glyph: 'zoom-out', size: 'large', click: run('zoom out') }] }\r
            ]\r
        },\r
        {\r
            key: 'picture',\r
            text: 'Picture &format',\r
            context: 'Picture',\r
            visible: () => s.picture,\r
            groups: [\r
                {\r
                    text: 'Adjust',\r
                    commands: [\r
                        { text: 'Crop', glyph: 'split', size: 'large', click: run('crop') },\r
                        { text: 'Rotate', glyph: 'repeat', click: run('rotate') },\r
                        { text: 'Lock', glyph: 'lock', click: run('lock') }\r
                    ]\r
                }\r
            ]\r
        }\r
    ];\r
\r
    const quick: RibbonCommand[] = [\r
        { key: 'save', text: 'Save', glyph: 'save', click: run('save') },\r
        { key: 'undo', text: 'Undo', glyph: 'undo', click: run('undo') }\r
    ];\r
\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <RibbonMenu\r
                class="rb-editor"\r
                items={items}\r
                x-model={() => s.tab}\r
                appButton="&File"\r
                onAppButton={() => (s.menu = true)}\r
                quickCommands={quick}\r
                barEnd={\r
                    <Stack orientation="horizontal" gap="sm" align="center">\r
                        <TextBox label="Search" labelMode="hidden" placeholder="Search" size="sm" style="inline-size: 12rem" />\r
                        <Button text="Share" size="sm" onclick={run('share')} />\r
                    </Stack>\r
                }\r
            />\r
            <Stack orientation="horizontal" gap="md" wrap align="center">\r
                <Switch label="A picture is chosen" x-model={() => s.picture} />\r
                <output class="rb-editor-told">{() => \`Last command: \${s.told}\`}</output>\r
            </Stack>\r
            <AppMenu\r
                label="File"\r
                x-model={() => s.menu}\r
                items={[\r
                    { key: 'info', text: '&Info', glyph: 'info', page: () => <p>Quarterly report.docx</p> },\r
                    { key: 'save', text: '&Save', glyph: 'save', click: run('save') }\r
                ]}\r
            />\r
        </Stack>\r
    );\r
}\r
`,Te=`import { reactive } from '@motifx/core';\r
import { Button, RibbonMenu, Stack } from '@motifx-community/ui';\r
import { documentTabs } from './document-tabs';\r
\r
/** Tabs, groups and commands added, removed, moved and changed by path. */\r
export default function Programmatic() {\r
    const s = reactive({ told: 'nothing yet', changes: 0, extra: 0, dateShown: true });\r
    const run = (what: string) => () => (s.told = what);\r
    let menu!: RibbonMenu;\r
\r
    const addTab = () =>\r
        menu.addTab({\r
            key: 'review',\r
            text: '&Review',\r
            groups: [{ key: 'proofing', text: 'Proofing', commands: [{ key: 'spelling', text: 'Spelling', glyph: 'check', size: 'large', click: run('spelling') }] }]\r
        });\r
    const addCommand = () => {\r
        s.extra++;\r
        menu.addCommand('home/clipboard', { key: \`extra\${s.extra}\`, text: \`Extra \${s.extra}\`, glyph: 'star', click: run(\`extra \${s.extra}\`) });\r
    };\r
    const toggleDate = () => {\r
        s.dateShown = !s.dateShown;\r
        menu.update('home/insert/date', { visible: s.dateShown });\r
    };\r
    const reset = () => {\r
        menu.items = documentTabs(run);\r
        s.extra = 0;\r
        s.dateShown = true;\r
    };\r
\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <Stack orientation="horizontal" gap="sm" wrap>\r
                <Button text="Add a tab" variant="outline" onclick={addTab} />\r
                <Button text="Add a command" variant="outline" onclick={addCommand} />\r
                <Button text="Rename Cut" variant="outline" onclick={() => menu.update('home/clipboard/cut', { text: 'Cut out' })} />\r
                <Button text="Hide or show Date" variant="outline" onclick={toggleDate} />\r
                <Button text="Move Editing first" variant="outline" onclick={() => menu.move('home/editing', 0)} />\r
                <Button text="Remove Insert" variant="outline" onclick={() => menu.remove('home/insert')} />\r
                <Button text="Start again" variant="outline" onclick={reset} />\r
            </Stack>\r
            <RibbonMenu class="rb-programmatic" ref={(m: RibbonMenu) => (menu = m)} items={documentTabs(run)} onItemsChanged={() => s.changes++} />\r
            <output class="rb-programmatic-told">{() => \`\${s.changes} changes · last command: \${s.told}\`}</output>\r
        </Stack>\r
    );\r
}\r
`,Ee=`import { reactive } from '@motifx/core';\r
import { ButtonGroup, RibbonMenu, Slider, Stack, Switch, type RibbonMenuLayout } from '@motifx-community/ui';\r
import { documentTabs } from './document-tabs';\r
\r
/** The same menu in less and less room: the groups give way, then the commands scroll. */\r
export default function Room() {\r
    const s = reactive({ width: 720, layout: 'classic' as RibbonMenuLayout, adaptive: true, told: 'nothing yet' });\r
    const run = (what: string) => () => (s.told = what);\r
\r
    return (\r
        <Stack gap="md" style="inline-size: 100%">\r
            <Stack orientation="horizontal" gap="lg" wrap align="center">\r
                <Slider label="Width" min={220} max={900} step={10} x-model={() => s.width} style="inline-size: 16rem" />\r
                <ButtonGroup\r
                    label="Layout"\r
                    x-model={() => s.layout}\r
                    items={[\r
                        { value: 'classic', text: 'Classic' },\r
                        { value: 'simple', text: 'Simplified' }\r
                    ]}\r
                />\r
                <Switch label="Give way" x-model={() => s.adaptive} />\r
            </Stack>\r
            <RibbonMenu class="rb-room" items={documentTabs(run)} style={() => \`inline-size: \${s.width}px\`} layout={() => s.layout} adaptive={() => s.adaptive} onLayoutChanged={e => (s.layout = e.layout)} />\r
            <output class="rb-room-told">{() => \`\${s.width} pixels · last command: \${s.told}\`}</output>\r
        </Stack>\r
    );\r
}\r
`,De=`import type { RibbonTab } from '@motifx-community/ui';\r
\r
/** The tabs of a document editor, shared by the examples; \`run\` reports the command pressed. Paste is fixed: it cannot be hidden or moved. */\r
export function documentTabs(run: (what: string) => () => void): RibbonTab[] {\r
    return [\r
        {\r
            key: 'home',\r
            text: '&Home',\r
            groups: [\r
                {\r
                    key: 'clipboard',\r
                    text: 'Clipboard',\r
                    glyph: 'file',\r
                    commands: [\r
                        { key: 'paste', text: 'Paste', glyph: 'file', size: 'large', type: 'split', fixed: true, click: run('paste'), menu: [{ text: 'Keep text only', click: run('paste: text only') }] },\r
                        { key: 'cut', text: 'Cut', glyph: 'trash', click: run('cut') },\r
                        { key: 'copy', text: 'Copy', glyph: 'file', click: run('copy') }\r
                    ]\r
                },\r
                {\r
                    key: 'insert',\r
                    text: 'Insert',\r
                    glyph: 'plus',\r
                    commands: [\r
                        { key: 'table', text: 'Table', glyph: 'table', size: 'large', click: run('table') },\r
                        { key: 'chart', text: 'Chart', glyph: 'chart', size: 'large', click: run('chart') },\r
                        { key: 'date', text: 'Date', glyph: 'calendar', click: run('date') },\r
                        { key: 'time', text: 'Time', glyph: 'clock', click: run('time') }\r
                    ]\r
                },\r
                {\r
                    key: 'editing',\r
                    text: 'Editing',\r
                    glyph: 'search',\r
                    priority: 1,\r
                    commands: [\r
                        { key: 'find', text: 'Find', glyph: 'search', click: run('find') },\r
                        { key: 'replace', text: 'Replace', glyph: 'pencil', click: run('replace') },\r
                        { key: 'filter', text: 'Filter', glyph: 'filter', click: run('filter') }\r
                    ]\r
                }\r
            ]\r
        },\r
        {\r
            key: 'view',\r
            text: '&View',\r
            groups: [\r
                {\r
                    key: 'show',\r
                    text: 'Show',\r
                    commands: [\r
                        { key: 'columns', text: 'Columns', glyph: 'columns', size: 'large', click: run('columns') },\r
                        { key: 'zoom', text: 'Zoom out', glyph: 'zoom-out', click: run('zoom out') },\r
                        { key: 'full', text: 'Full screen', glyph: 'maximize', click: run('full screen') }\r
                    ]\r
                }\r
            ]\r
        }\r
    ];\r
}\r
`;export{Ce as a,xe as c,we as i,Ee as n,$ as o,Te as r,Se as s,De as t};