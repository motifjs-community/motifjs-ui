import{A as e,At as t,Bn as n,C as r,Dt as i,E as a,Et as o,F as s,Kt as c,L as l,Mn as u,Nn as d,Ot as f,Q as p,Qt as m,Rt as h,S as g,Un as _,Vn as v,Wn as y,Zn as b,an as x,at as S,b as C,c as ee,dn as w,ir as te,jn as T,jt as E,kt as D,n as O,or as k,q as ne,qn as A,rt as re,s as ie,t as ae,tn as j,vn as oe,x as M}from"./next-id-CtzpBrBT.js";import{f as se,l as ce}from"./Field-DimbeJDD.js";import{t as le}from"./every-frame-Bp-qY937.js";import{n as ue,r as de,t as fe}from"./hits-BrLmqMyl.js";import{n as pe,t as me}from"./media-BNiIXzit.js";import{t as he}from"./NumberBox-8iuCS9_o.js";import{t as ge}from"./RadioGroup-DbpJGVz-.js";import{t as _e}from"./DropDown-IXfuocp3.js";import{t as ve}from"./Spinner-Dz-aVxJr.js";import{D as ye,a as be,o as xe,t as Se,y as Ce}from"./glyphs-CwsGDeNW.js";import{t as we}from"./swipe-tracker-mb6fhjbX.js";import{t as Te}from"./auto-scroll-IR61STdo.js";import{t as Ee}from"./Toolbar-bSzhNQ_G.js";import{t as N}from"./on-re-state-BSaqljIy.js";import{t as De}from"./MxForm-BxjHcaYQ.js";import{t as Oe}from"./confirm-Bg9Si4ST.js";import{a as P,i as ke,n as Ae,o as F,r as je,t as Me}from"./Calendar-CL375os2.js";import{t as Ne}from"./DateBox-BguhMKM1.js";import{t as Pe}from"./FormLayout-5yqdxSP9.js";import{t as Fe}from"./BottomSheet-DFd6runX.js";import{t as Ie}from"./ActionSheet-CDKOD11L.js";import{t as Le}from"./Stack-wRt1e9tO.js";function Re(e,t){let n=!0,r,i=()=>{r=setTimeout(()=>{n&&Promise.resolve().then(()=>n&&e()).finally(()=>n&&i())},t)};return i(),()=>{n=!1,clearTimeout(r)}}function ze(e,t=0){let n=!0,r=setTimeout(()=>{n&&Promise.resolve().then(()=>n&&e())},t);return()=>{n=!1,clearTimeout(r)}}var I=6e4,L=864e5,Be=2e4;function Ve(e,t,n,r,i,a,o){let s=new Date(2e3,0,1);return s.setFullYear(e,t,n),s.setHours(r,i,a,o),s}function He(e,t,n,r,i,a,o){let s=new Date(0);return s.setUTCFullYear(e,t,n),s.setUTCHours(r,i,a,o),s.getTime()}var R=class e{name;static made=new Map;static warned=new Set;static local=new e(``);static of(t){if(!t)return e.local;let n=e.made.get(t);return n||(e.isValid(t)?(n=new e(t),e.made.set(t,n),n):(e.warned.has(t)||te.reportSuppressed(`TimeZone`,Error(`TimeZone: "${t}" is not a time zone this browser knows; its own is used.`)),e.warned.add(t),e.local))}static isValid(e){try{return new Intl.DateTimeFormat(`en-US`,{timeZone:e}),!0}catch{return!1}}static names(){let e=typeof Intl.supportedValuesOf==`function`?Intl.supportedValuesOf(`timeZone`):[];return e.includes(`UTC`)?[...e]:[`UTC`,...e]}static localName(){return new Intl.DateTimeFormat().resolvedOptions().timeZone}offsets=new Map;format=null;constructor(e){this.name=e}offset(e){let t=typeof e==`number`?e:e.getTime();if(!this.name)return 0-new Date(t).getTimezoneOffset();let n=Math.floor(t/I),r=this.offsets.get(n);if(r!==void 0)return r;this.format??=new Intl.DateTimeFormat(`en-US`,{timeZone:this.name,hourCycle:`h23`,era:`short`,year:`numeric`,month:`numeric`,day:`numeric`,hour:`numeric`,minute:`numeric`,second:`numeric`});let i={},a=!1;for(let e of this.format.formatToParts(n*I))e.type===`era`?a=/^B/i.test(e.value):e.type!==`literal`&&(i[e.type]=Number(e.value));let o=He(a?1-i.year:i.year,i.month-1,i.day,i.hour%24,i.minute,i.second,0);return r=Math.round((o-n*I)/I),this.offsets.size>Be&&this.offsets.clear(),this.offsets.set(n,r),r}wall(e){let t=typeof e==`number`?e:e.getTime();return t+this.offset(t)*I}moment(e,t=!1){let n=e-this.offset(e-L)*I,r=e-this.offset(e+L)*I,i=this.wall(n)===e,a=this.wall(r)===e;return i&&a?t?Math.max(n,r):Math.min(n,r):a?r:n}date(e,t=!1){return new Date(this.moment(e,t))}dayStart(e){let t=this.wall(e);return this.date(Math.floor(t/L)*L)}addDays(e,t){return this.date(this.wall(e)+t*L)}sameDay(e,t){return Math.floor(this.wall(e)/L)===Math.floor(this.wall(t)/L)}toLocal(e){if(!this.name)return new Date(typeof e==`number`?e:e.getTime());let t=new Date(this.wall(e));return Ve(t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate(),t.getUTCHours(),t.getUTCMinutes(),t.getUTCSeconds(),t.getUTCMilliseconds())}fromLocal(e){return this.name?this.date(He(e.getFullYear(),e.getMonth(),e.getDate(),e.getHours(),e.getMinutes(),e.getSeconds(),e.getMilliseconds())):new Date(e.getTime())}static wallOfLocal(e){return He(e.getFullYear(),e.getMonth(),e.getDate(),e.getHours(),e.getMinutes(),e.getSeconds(),e.getMilliseconds())}static localOfWall(e){let t=new Date(e);return Ve(t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate(),t.getUTCHours(),t.getUTCMinutes(),t.getUTCSeconds(),t.getUTCMilliseconds())}},Ue={1:`recurrenceFirst`,2:`recurrenceSecond`,3:`recurrenceThird`,4:`recurrenceFourth`,[-1]:`recurrenceLast`},We={daily:[`recurrenceSummaryDaily`,`recurrenceSummaryDays`],weekly:[`recurrenceSummaryWeekly`,`recurrenceSummaryWeeks`],monthly:[`recurrenceSummaryMonthly`,`recurrenceSummaryMonths`],yearly:[`recurrenceSummaryYearly`,`recurrenceSummaryYears`]},Ge=(e,t)=>new Intl.DateTimeFormat(e,{weekday:`long`,timeZone:`UTC`}).format(Date.UTC(2026,0,4+t)),Ke=(e,t)=>new Intl.DateTimeFormat(e,{month:`long`,timeZone:`UTC`}).format(Date.UTC(2026,t-1,1));function qe(e,t,n){let{locale:r,strings:i}=n,a=(e,t={})=>l(i[e],r,t);if(!e)return a(`recurrenceSummaryNever`);let[o,s]=We[e.frequency],c=e.interval>1?a(s,{n:e.interval}):a(o),u=e.yearDays.length>0||e.weeks.length>0||e.positions.length>0||e.hours.length>0||e.minutes.length>0||e.seconds.length>0||e.other.length>0||e.monthDays.length>1||e.frequency===`yearly`&&e.months.length>1,d=e=>new Intl.ListFormat(r,{type:`conjunction`}).format(e),f=e.weekdays.filter(e=>!e.nth),p=e.weekdays.filter(e=>e.nth),m=e=>Ue[e]?a(Ue[e]):(u=!0,String(e));if(e.frequency===`daily`||e.frequency===`weekly`){let n=e.weekdays.length?e.weekdays.map(e=>e.day):e.frequency===`weekly`&&t?[t.getDay()]:[],i=t=>(t-e.weekStart+7)%7;n.length&&(c=a(`recurrenceSummaryOnDays`,{rule:c,days:d([...new Set(n)].sort((e,t)=>i(e)-i(t)).map(e=>Ge(r,e)))})),(e.monthDays.length||e.months.length||p.length)&&(u=!0)}else if(e.frequency===`monthly`){if(p.length===1&&!f.length&&!e.monthDays.length)c=a(`recurrenceSummaryOnNth`,{rule:c,nth:m(p[0].nth),weekday:Ge(r,p[0].day)});else if(e.weekdays.length)u=!0;else{let n=e.monthDays[0]??t?.getDate();n===-1?c=a(`recurrenceSummaryOnLastDay`,{rule:c}):n!==void 0&&n>0?c=a(`recurrenceSummaryOnDay`,{rule:c,day:n}):u=!0}e.months.length&&(u=!0)}else{let n=e.months[0]??(t?t.getMonth()+1:1);if(p.length===1&&!f.length&&!e.monthDays.length)c=a(`recurrenceSummaryOnNthOf`,{rule:c,nth:m(p[0].nth),weekday:Ge(r,p[0].day),month:Ke(r,n)});else if(!e.weekdays.length&&(e.monthDays[0]??1)>0){let i=e.monthDays[0]??t?.getDate()??1,o=new Intl.DateTimeFormat(r,{day:`numeric`,month:`long`,timeZone:`UTC`}).format(Date.UTC(2024,n-1,i));c=a(`recurrenceSummaryOnDate`,{rule:c,date:o})}else u=!0}if(e.count!==null)c=a(`recurrenceSummaryCount`,{rule:c,count:e.count});else if(e.until){let t=new Intl.DateTimeFormat(r,{day:`numeric`,month:`long`,year:`numeric`,timeZone:e.until.utc&&!e.until.dateOnly?n.timeZone||void 0:`UTC`}).format(e.until.time);c=a(`recurrenceSummaryUntil`,{rule:c,date:t})}return u?a(`recurrenceSummaryCustom`,{rule:c}):c}var z=class{host;keyOf;make;draw;start;gone;parts=new Map;constructor(e,t,n,r,i=()=>0,a=()=>{}){this.host=e,this.keyOf=t,this.make=n,this.draw=r,this.start=i,this.gone=a}get size(){return this.parts.size}get(e){return this.parts.get(e)}each(e){this.parts.forEach(t=>e(t))}show(e){let t=e.map(e=>this.keyOf(e)),n=new Set(t);for(let[e,t]of this.parts)n.has(e)||(this.parts.delete(e),this.gone(t,e),this.host.controls.remove(t));let r=this.host.controls,i=this.start();e.forEach((e,n)=>{let a=t[n],o=i+n,s=this.parts.get(a);if(s){r.items[o]!==s&&r.moveToIndex(s,o),this.draw(s,e);return}s=this.make(e),this.parts.set(a,s),r.add(o,s)})}drawAll(e){for(let t of e){let e=this.parts.get(this.keyOf(t));e&&this.draw(e,t)}}clear(){for(let[e,t]of this.parts)this.gone(t,e),this.host.controls.remove(t);this.parts.clear()}},Je=[`startTimeZone`,`separateEndZone`,`endTimeZone`];function Ye(e,t,n){let r=e=>typeof e==`function`&&e.length>0?()=>e(n):e,i=e=>{let{items:t,tabs:i,template:o,rules:s,visible:c,enabled:l,readOnly:u,label:d,required:f,helpText:p,group:m,...h}=e,g={...h};return d!==void 0&&(g.label=r(d)),f!==void 0&&(g.required=r(f)),p!==void 0&&(g.helpText=r(p)),m!==void 0&&(g.group=r(m)),s!==void 0&&(g.rules=r(s)),c!==void 0&&(g.visible=r(c)),l!==void 0&&(g.enabled=r(l)),u!==void 0&&(g.readOnly=r(u)),o&&(g.template=e=>o(n,e)),t&&(g.items=a(t)),i&&(g.tabs=i.map(e=>({title:r(e.title)??``,columns:e.columns,visible:r(e.visible),items:a(e.items)}))),g},a=e=>e.flatMap(e=>{if(typeof e==`string`)return(e===`timeZone`?Je:[e]).flatMap(e=>t.get(e)??[]);let n=e.field&&!e.template&&!e.items&&!e.tabs?t.get(e.field):void 0;return n?n.map(t=>Xe(t,i(e))):[i(e)]});return a(e)}function Xe(e,t){let n={...e};for(let[e,r]of Object.entries(t))r!==void 0&&(n[e]=r);return n.editorProps={...e.editorProps,...t.editorProps},n.rules=Ze(e.rules,t.rules),n.visible=Qe(e.visible,t.visible),n.enabled=Qe(e.enabled,t.enabled),n.readOnly=$e(e.readOnly,t.readOnly),n}function Ze(e,t){return e===void 0||t===void 0?e??t:()=>[...v(e)??[],...v(t)??[]]}function Qe(e,t){return e===void 0||t===void 0?e??t:()=>v(e)!==!1&&v(t)!==!1}function $e(e,t){return e===void 0||t===void 0?e??t:()=>v(e)===!0||v(t)===!0}var et=e=>String(e).padStart(2,`0`);function B(e){let t=new Date(e.time),n=`${String(t.getUTCFullYear()).padStart(4,`0`)}${et(t.getUTCMonth()+1)}${et(t.getUTCDate())}`;return e.dateOnly?n:`${n}T${et(t.getUTCHours())}${et(t.getUTCMinutes())}${et(t.getUTCSeconds())}${e.utc?`Z`:``}`}function tt(e,t){if(Array.isArray(e))return[...e,t.utc&&!t.dateOnly?new Date(t.time):B(t)];let n=typeof e==`string`?e.trim():``;return n?`${n},${B(t)}`:B(t)}var nt=/^(\d{4})-?(\d{2})-?(\d{2})(?:T(\d{2}):?(\d{2})(?::?(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/i;function rt(e){let t=nt.exec(e.trim());if(!t)return null;let[,n,r,i,a,o,s,c]=t,l=Date.UTC(Number(n),Number(r)-1,Number(i),Number(a??0),Number(o??0),Number(s??0)),u=new Date(l);if(u.getUTCMonth()!==Number(r)-1||u.getUTCDate()!==Number(i)||Number(a??0)>23||Number(o??0)>59)return null;if(!c||c.toUpperCase()===`Z`)return{time:l,utc:!!c,dateOnly:a===void 0};let d=c.startsWith(`-`)?-1:1,f=c.slice(1).replace(`:`,``);return{time:l-d*(Number(f.slice(0,2))*60+Number(f.slice(2,4)))*6e4,utc:!0,dateOnly:!1}}function it(e){if(e instanceof Date)return Number.isNaN(e.getTime())?null:{time:e.getTime(),utc:!0,dateOnly:!1};if(typeof e==`number`)return Number.isFinite(e)?{time:e,utc:!0,dateOnly:!1}:null;if(typeof e!=`string`||!e.trim())return null;let t=rt(e.replace(/^(EXDATE|RDATE)(;[^:]*)?:/i,``));if(t)return t;let n=Date.parse(e);return Number.isNaN(n)?null:{time:n,utc:!0,dateOnly:!1}}function V(e){let t=Array.isArray(e)?e:typeof e==`string`?e.split(/[,;]/):e==null?[]:[e],n=[];for(let e of t){let t=it(e);t&&n.push(t)}return n}function at(e,t){return Array.isArray(e)?e.filter(e=>V([e]).every(t)):typeof e==`string`?e.split(/[,;]/).map(e=>e.trim()).filter(e=>e&&V(e).every(t)).join(`,`):e}var H=[`SU`,`MO`,`TU`,`WE`,`TH`,`FR`,`SA`];function ot(e){let t=[`FREQ=${e.frequency.toUpperCase()}`],n=(e,n)=>n.length&&t.push(`${e}=${n.join(`,`)}`);return e.interval>1&&t.push(`INTERVAL=${e.interval}`),e.count!==null&&t.push(`COUNT=${e.count}`),e.until&&t.push(`UNTIL=${B(e.until)}`),n(`BYMONTH`,e.months),n(`BYWEEKNO`,e.weeks),n(`BYYEARDAY`,e.yearDays),n(`BYMONTHDAY`,e.monthDays),e.weekdays.length&&t.push(`BYDAY=${e.weekdays.map(e=>`${e.nth||``}${H[e.day]}`).join(`,`)}`),n(`BYHOUR`,e.hours),n(`BYMINUTE`,e.minutes),n(`BYSECOND`,e.seconds),n(`BYSETPOS`,e.positions),e.weekStart!==1&&t.push(`WKST=${H[e.weekStart]}`),t.push(...e.other),t.join(`;`)}var U=864e5,st=7*U,ct=1e5,lt=e=>Math.floor(e/U)*U,ut=(e,t)=>new Date(Date.UTC(e,t+1,0)).getUTCDate(),dt=e=>ut(e,1)===29?366:365;function ft(e,t){let n=Date.UTC(e,0,4);return n-(new Date(n).getUTCDay()-t+7)%7*U}function pt(e,t,n,r,i={}){let a=i.limit??1e4,o=new Date(t),s=o.getUTCFullYear(),c=o.getUTCMonth(),l=lt(t),u=e.frequency,d=Math.max(1,Math.floor(e.interval)||1),f=1/0;if(e.until){let t=e.until;f=t.dateOnly?t.time+U-1:t.utc&&i.wallOf?i.wallOf(t.time):t.time}let p=e.weekdays,m=e.monthDays,h=e.months,g=!e.weekdays.length&&!e.monthDays.length&&!e.yearDays.length&&!e.weeks.length;u===`weekly`&&!p.length&&(p=[{day:o.getUTCDay(),nth:0}]),u===`monthly`&&g&&(m=[o.getUTCDate()]),u===`yearly`&&g&&(m=[o.getUTCDate()],h.length||(h=[c+1]));let _=e.hours.length?e.hours:[o.getUTCHours()],v=e.minutes.length?e.minutes:[o.getUTCMinutes()],y=e.seconds.length?e.seconds:[o.getUTCSeconds()],b=_.flatMap(e=>v.flatMap(t=>y.map(n=>((e*60+t)*60+n)*1e3))).sort((e,t)=>e-t).filter((e,t,n)=>t===0||n[t-1]!==e),x=u===`yearly`&&e.weeks.length>0,S=u===`monthly`||u===`yearly`&&h.length&&!x?`month`:u===`yearly`&&!x?`year`:null,C=l-(o.getUTCDay()-e.weekStart+7)%7*U,ee=t=>{if(u===`daily`){let e=l+t*d*U;return{begins:e,days:[e]}}if(u===`weekly`){let e=C+t*d*st;return{begins:e,days:Array.from({length:7},(t,n)=>e+n*U)}}if(u===`monthly`){let e=s*12+c+t*d,n=Math.floor(e/12),r=e-n*12,i=Date.UTC(n,r,1);return{begins:i,days:Array.from({length:ut(n,r)},(e,t)=>i+t*U)}}let n=s+t*d;if(!x){let e=Date.UTC(n,0,1);return{begins:e,days:Array.from({length:dt(n)},(t,n)=>e+n*U)}}let r=ft(n,e.weekStart),i=(ft(n+1,e.weekStart)-r)/st,a=new Set;for(let t of e.weeks){let e=t>0?t:i+t+1;if(!(e<1||e>i))for(let t=0;t<7;t++)a.add(r+(e-1)*st+t*U)}return{begins:r,days:[...a].sort((e,t)=>e-t)}},w=e=>{let t=new Date(e);return Math.floor(u===`daily`?(lt(e)-l)/(d*U):u===`weekly`?(lt(e)-C)/(d*st):u===`monthly`?(t.getUTCFullYear()*12+t.getUTCMonth()-(s*12+c))/d:(t.getUTCFullYear()-s)/d)},te=t=>{let n=new Date(t),r=n.getUTCFullYear(),i=n.getUTCMonth(),a=n.getUTCDate();if(h.length&&!h.includes(i+1))return!1;let o=(t-Date.UTC(r,0,1))/U+1,s=dt(r);if(u===`yearly`&&e.yearDays.length&&!e.yearDays.some(e=>(e>0?e:s+e+1)===o))return!1;let c=ut(r,i);if(u!==`weekly`&&m.length&&!m.some(e=>(e>0?e:c+e+1)===a))return!1;if(p.length){let e=n.getUTCDay();if(!p.some(t=>{if(t.day!==e)return!1;if(!t.nth||!S)return!0;let[n,r]=S===`month`?[a,c]:[o,s];return t.nth>0?Math.floor((n-1)/7)+1===t.nth:Math.floor((r-n)/7)+1===-t.nth}))return!1}return!0},T=[],E=0,D=Math.min(r,f+1),O=e.count===null&&n>t?Math.max(0,w(n)-1):0;for(let i=O;i<O+ct;i++){let{begins:o,days:s}=ee(i);if(o>=D)break;let c=s.filter(te).flatMap(e=>b.map(t=>e+t));if(e.positions.length){let t=c;c=e.positions.map(e=>e>0?t[e-1]:t[t.length+e]).filter(e=>e!==void 0).sort((e,t)=>e-t).filter((e,t,n)=>t===0||n[t-1]!==e)}for(let i of c)if(!(i<t)&&(i>f||i>=r||(E++,e.count!==null&&E>e.count)||i>=n&&(T.push(i),T.length>=a)))return T}return T}function W(e){if(e instanceof Date)return Number.isNaN(e.getTime())?null:e;if(typeof e==`number`||typeof e==`string`){let t=new Date(e);return Number.isNaN(t.getTime())?null:t}return null}var mt=864e5,ht=class{options;constructor(e){this.options=e}update(e,t,n){let r=this.options.occurrences.infoOf(e);if(!r)return{add:[],update:[{item:e,changes:t}],remove:[]};let i=this.options.fields(),a=r.series,o=t;if(n===`following`&&this.isFirst(r)&&(n=`series`),n===`occurrence`){let t=this.copy(e),n=this.options.keyOf(a);n!=null&&(t[i.recurrenceId]=n);for(let[e,n]of Object.entries(o))e!==i.recurrenceRule&&e!==i.recurrenceException&&(t[e]=n);return{add:[t],update:[{item:a,changes:this.leaveOut(a,r)}],remove:[]}}if(n===`series`)return{add:[],update:[{item:a,changes:this.moved(a,e,t)}],remove:[]};let s=this.copy(e),c=this.options.occurrences.ruleOf(a);if(s[i.recurrenceRule]=ot(this.rest(a,r,c)),s[i.recurrenceException]=at(C(a,i.recurrenceException),e=>!this.before(e,r,a)),Object.assign(s,o),o[i.recurrenceRule]===void 0){let n=this.dayShift(e,t);n&&(s[i.recurrenceRule]=ot(gt(this.options.occurrences.ruleOf(s)??c,n)))}return{add:[s],update:[{item:a,changes:this.ended(a,r,c)}],remove:[]}}remove(e,t,n=[]){let r=this.options.occurrences.infoOf(e);if(!r)return{add:[],update:[],remove:[e]};let i=r.series;if(t===`following`&&this.isFirst(r)&&(t=`series`),t===`occurrence`)return{add:[],update:[{item:i,changes:this.leaveOut(i,r)}],remove:[]};if(t===`series`)return{add:[],update:[],remove:[i,...n]};let a=this.options.fields().start,o=n.filter(e=>(W(C(e,a))?.getTime()??0)>=r.start.getTime());return{add:[],update:[{item:i,changes:this.ended(i,r,this.options.occurrences.ruleOf(i))}],remove:o}}allDay(e){return!!C(e,this.options.fields().allDay)}wallOf(e,t,n){return t?R.wallOfLocal(e):n.wall(e)}isFirst(e){let t=W(C(e.series,this.options.fields().start));return t?this.allDay(e.series)?F(t).getTime()===F(e.start).getTime():t.getTime()===e.start.getTime():!0}dateOf(e){return this.allDay(e.series)?{time:R.wallOfLocal(F(e.start)),utc:!1,dateOnly:!0}:{time:e.start.getTime(),utc:!0,dateOnly:!1}}before(e,t,n){if(e.utc)return e.time<t.start.getTime();let r=this.allDay(n)?R.wallOfLocal(t.start):this.options.occurrences.zoneOf(n).wall(t.start);return e.dateOnly?e.time<Math.floor(r/mt)*mt:e.time<r}leaveOut(e,t){let n=this.options.fields().recurrenceException;return{[n]:tt(C(e,n),this.dateOf(t))}}countBefore(e,t,n){let r=W(C(e,this.options.fields().start)),i=this.allDay(e),a=this.options.occurrences.zoneOf(e),o=this.wallOf(r,i,a);return pt(n,o,o,this.wallOf(t.start,i,a),{wallOf:e=>a.wall(e)}).length}ended(e,t,n){let r=this.options.fields(),i={...n};n.count===null?i.until=this.allDay(e)?{time:R.wallOfLocal(F(t.start))-mt,utc:!1,dateOnly:!0}:{time:t.start.getTime()-1e3,utc:!0,dateOnly:!1}:i.count=Math.max(1,this.countBefore(e,t,n));let a=at(C(e,r.recurrenceException),n=>this.before(n,t,e));return{[r.recurrenceRule]:ot(i),[r.recurrenceException]:a}}rest(e,t,n){return n.count===null?{...n}:{...n,count:Math.max(1,n.count-this.countBefore(e,t,n))}}dayShift(e,t){let n=this.options.fields(),r=t,i=W(C(e,n.start)),a=W(r[n.start]??C(e,n.start));if(!i||!a)return 0;let o=this.options.occurrences.zoneOf(e),s=!!C(e,n.allDay),c=r[n.allDay]===void 0?s:!!r[n.allDay];return Math.floor(this.wallOf(a,c,o)/mt)-Math.floor(this.wallOf(i,s,o)/mt)}moved(e,t,n){let r=this.options.fields(),i=n,a={...i};if(i[r.start]===void 0&&i[r.end]===void 0&&i[r.allDay]===void 0)return a;let o=this.options.occurrences.zoneOf(e),s=!!C(t,r.allDay),c=i[r.allDay]===void 0?s:!!i[r.allDay],l=W(C(t,r.start)),u=W(i[r.start]??C(t,r.start)),d=W(i[r.end]??C(t,r.end))??u,f=this.wallOf(u,c,o)-this.wallOf(l,s,o),p=W(C(e,r.start)),m=this.wallOf(p,this.allDay(e),o)+f;a[r.start]=c?R.localOfWall(m):o.date(m),a[r.end]=c?R.localOfWall(m+(R.wallOfLocal(d)-R.wallOfLocal(u))):new Date(a[r.start].getTime()+(d.getTime()-u.getTime()));let h=this.dayShift(t,n),g=this.options.occurrences.ruleOf(e);return h&&g&&i[r.recurrenceRule]===void 0&&(a[r.recurrenceRule]=ot(gt(g,h))),a}copy(e){let t=this.options.fields(),n={...e};return delete n[t.key],delete n[t.recurrenceRule],delete n[t.recurrenceException],delete n[t.recurrenceId],n}};function gt(e,t){let n={...e};if(e.weekdays.length&&e.frequency!==`daily`&&(n.weekdays=e.weekdays.map(e=>({...e,day:((e.day+t)%7+7)%7}))),e.monthDays.length===1&&e.monthDays[0]>0&&!e.weekdays.length){let r=e.monthDays[0]+t;r>=1&&r<=31&&(n.monthDays=[r])}return n}var _t=class{store;constructor(e){this.store=e}async run(e){let t=[...e.add.map(e=>({kind:`add`,appointment:e})),...e.update.map(({item:e,changes:t})=>({kind:`update`,appointment:e,changes:t})),...e.remove.map(e=>({kind:`delete`,appointment:e}))],n=[];for(let e of t)try{n.push(await this.write(e))}catch(e){let r=await this.undo(n);return{added:null,failed:!0,error:e,saved:n.map(e=>e.write),unsaved:t.slice(n.length),undone:r}}return{added:n.find(e=>e.added)?.added??null,failed:!1,error:void 0,saved:t,unsaved:[],undone:!1}}async write(e){let t=e.appointment;if(e.kind===`add`)return{write:e,added:await this.store.add(e.appointment)};if(e.kind===`update`){let n=Object.fromEntries(Object.keys(e.changes??{}).map(e=>[e,vt(g(t,e))]));return await this.store.update(t,e.changes??{}),{write:e,before:n}}let n=k(()=>({...t}));return await this.store.remove(t),{write:e,deleted:n}}async undo(e){let t=!0;for(let n of[...e].reverse())try{n.added===void 0?n.before?await this.store.update(n.write.appointment,n.before):n.deleted&&await this.store.add(n.deleted):await this.store.remove(n.added)}catch{t=!1}return t}};function vt(e){return e instanceof Date?new Date(e.getTime()):e}function G(e){return e===`month`?`month`:e===`agenda`?`agenda`:e.startsWith(`timeline`)?`timeline`:`time`}function K(e){return e===`month`||e===`timelineMonth`}var yt={DAILY:`daily`,WEEKLY:`weekly`,MONTHLY:`monthly`,YEARLY:`yearly`};function q(e,t,n,r=!1){let i=[];for(let a of e.split(`,`)){if(!/^[+-]?\d+$/.test(a.trim()))return null;let e=Number(a);if(!r&&e===0||Math.abs(e)>n||e<t)return null;i.push(e)}return i}function bt(e){let t=[];for(let n of e.split(`,`)){let e=/^([+-]?\d{1,2})?(SU|MO|TU|WE|TH|FR|SA)$/i.exec(n.trim());if(!e)return null;let r=e[1]?Number(e[1]):0;if(Math.abs(r)>53)return null;t.push({day:H.indexOf(e[2].toUpperCase()),nth:r})}return t}function xt(e){let t=(e??``).trim().replace(/^RRULE:/i,``);if(!t)return null;let n={interval:1,count:null,until:null,weekdays:[],monthDays:[],months:[],yearDays:[],weeks:[],hours:[],minutes:[],seconds:[],positions:[],weekStart:1,other:[]};for(let e of t.split(`;`)){if(!e.trim())continue;let t=e.indexOf(`=`);if(t<1)return null;let r=e.slice(0,t).trim().toUpperCase(),i=e.slice(t+1).trim(),a;switch(r){case`FREQ`:if(!yt[i.toUpperCase()])return null;n.frequency=yt[i.toUpperCase()];break;case`INTERVAL`:if(!/^\d+$/.test(i)||Number(i)<1)return null;n.interval=Number(i);break;case`COUNT`:if(!/^\d+$/.test(i)||Number(i)<1)return null;n.count=Number(i);break;case`UNTIL`:if(n.until=rt(i),!n.until)return null;break;case`BYDAY`:{let e=bt(i);if(!e)return null;n.weekdays=e;break}case`WKST`:if(!H.includes(i.toUpperCase()))return null;n.weekStart=H.indexOf(i.toUpperCase());break;case`BYMONTHDAY`:if(!(a=q(i,-31,31)))return null;n.monthDays=a;break;case`BYMONTH`:if(!(a=q(i,1,12)))return null;n.months=a;break;case`BYYEARDAY`:if(!(a=q(i,-366,366)))return null;n.yearDays=a;break;case`BYWEEKNO`:if(!(a=q(i,-53,53)))return null;n.weeks=a;break;case`BYHOUR`:if(!(a=q(i,0,23,!0)))return null;n.hours=a;break;case`BYMINUTE`:if(!(a=q(i,0,59,!0)))return null;n.minutes=a;break;case`BYSECOND`:if(!(a=q(i,0,60,!0)))return null;n.seconds=a;break;case`BYSETPOS`:if(!(a=q(i,-366,366)))return null;n.positions=a;break;default:n.other.push(e.trim())}}return n.frequency?n:null}var St=864e5,Ct=class{state;base=null;constructor(){this.state={frequency:`never`,interval:1,days:[0,1,2,3,4,5,6].map(e=>({day:e,on:!1})),by:`monthDay`,monthDay:1,nth:1,weekday:1,month:1,end:`never`,count:10,until:null}}key(){let e=this.state;return JSON.stringify([e.frequency,e.interval,e.days.map(e=>`${e.day}${e.on?`+`:``}`),e.by,e.monthDay,e.nth,e.weekday,e.month,e.end,e.count,e.until?.getTime()??null])}get rule(){return this.base}read(e,t){let n=xt(e);this.base=n;let r=this.state,i=t.start??new Date,a=[0,1,2,3,4,5,6].map(e=>(e+t.firstDayOfWeek)%7);r.days.forEach((e,t)=>e.day=a[t]),r.frequency=n?.frequency??`never`,r.interval=n?.interval??1;let o=n?.weekdays.filter(e=>!e.nth).map(e=>e.day)??[],s=n?.frequency===`weekly`&&!o.length?[i.getDay()]:o.length?o:[i.getDay()];for(let e of r.days)e.on=s.includes(e.day);let c=n?.weekdays.find(e=>e.nth);if(r.by=c?`weekday`:`monthDay`,r.nth=c&&(c.nth===-1||c.nth>=1&&c.nth<=4)?c.nth:Math.min(4,Math.floor((i.getDate()-1)/7)+1),r.weekday=c?.day??i.getDay(),r.monthDay=n?.monthDays[0]??i.getDate(),r.month=n?.months[0]??i.getMonth()+1,r.end=n?.count!==null&&n?.count!==void 0?`count`:n?.until?`until`:`never`,r.count=n?.count??10,n?.until){let e=n.until;r.until=F(e.utc&&!e.dateOnly?t.zone.toLocal(e.time):R.localOfWall(e.time))}else r.until=null}write(e){let t=this.state;if(t.frequency===`never`)return``;let n=this.base,r=e.start??new Date,i={frequency:t.frequency,interval:Math.max(1,Math.round(t.interval)||1),count:null,until:null,weekdays:[],monthDays:[],months:[],yearDays:[],weeks:[],hours:n?.hours??[],minutes:n?.minutes??[],seconds:n?.seconds??[],positions:[],weekStart:n?.weekStart??1,other:n?.other??[]};if(t.frequency===`weekly`){let e=t.days.filter(e=>e.on).map(e=>e.day);i.weekdays=(e.length?e:[r.getDay()]).map(e=>({day:e,nth:0}))}else t.frequency===`monthly`||t.frequency===`yearly`?(t.by===`weekday`?i.weekdays=[{day:t.weekday,nth:t.nth}]:i.monthDays=[t.monthDay],t.frequency===`yearly`&&(i.months=[t.month])):n?.frequency===`daily`&&(i.weekdays=n.weekdays);if(t.end===`count`&&(i.count=Math.max(1,Math.round(t.count)||1)),t.end===`until`&&!t.until&&(t.until=new Date(r.getFullYear(),r.getMonth()+3,r.getDate())),t.end===`until`&&t.until){let n=R.wallOfLocal(F(t.until));i.until=e.allDay?{time:n,utc:!1,dateOnly:!0}:{time:e.zone.moment(n+St-1e3),utc:!0,dateOnly:!1}}return ot(i)}},wt=[`value`,`start`,`allDay`,`timeZone`,`frequencies`,`firstDayOfWeek`,`summary`,`readOnly`,`locale`,`texts`],Tt=[`never`,`daily`,`weekly`,`monthly`,`yearly`],Et={never:`recurrenceNever`,daily:`recurrenceDaily`,weekly:`recurrenceWeekly`,monthly:`recurrenceMonthly`,yearly:`recurrenceYearly`},Dt={daily:[`recurrenceDayOne`,`recurrenceDayOther`],weekly:[`recurrenceWeekOne`,`recurrenceWeekOther`],monthly:[`recurrenceMonthOne`,`recurrenceMonthOther`],yearly:[`recurrenceYearOne`,`recurrenceYearOther`]},Ot=[[1,`recurrenceFirst`],[2,`recurrenceSecond`],[3,`recurrenceThird`],[4,`recurrenceFourth`],[-1,`recurrenceLast`]],kt=Symbol(`mx.recurrenceEditor`),At=class extends r{constructor(e){super(e);let t=this.props??{};for(let e of wt)t[e]!==void 0&&this.bindProperty(e,t[e]);t.label!==void 0&&this.bindProperty(`text`,t.label),t.onValueChanged&&this.parts.valueChanged.event(t.onValueChanged),this.motif.setDisposable(()=>this.parts.valueChanged.dispose())}get label(){return this.text}set label(e){this.text=e}get value(){return this.getProperty(`value`)??``}set value(e){let t=this.peekProperty(`value`)??``;this.assignProperty(`value`,e,e=>typeof e==`string`?e:``);let n=this.peekProperty(`value`)??``;typeof e!=`function`&&n!==t&&this.bindings.writeModel(n)}get start(){let e=this.getProperty(`start`);return e instanceof Date&&!Number.isNaN(e.getTime())?e:null}set start(e){this.assignProperty(`start`,e)}get allDay(){return!!this.getProperty(`allDay`)}set allDay(e){this.assignProperty(`allDay`,e,Boolean)}get timeZone(){return this.getProperty(`timeZone`)||null}set timeZone(e){this.assignProperty(`timeZone`,e)}get frequencies(){return this.getProperty(`frequencies`)??Tt}set frequencies(e){this.assignProperty(`frequencies`,e)}get firstDayOfWeek(){let e=this.getProperty(`firstDayOfWeek`);return typeof e==`number`?(Math.round(e)%7+7)%7:je(this.locale)}set firstDayOfWeek(e){this.assignProperty(`firstDayOfWeek`,e)}get summary(){return this.getProperty(`summary`)??!0}set summary(e){this.assignProperty(`summary`,e,Boolean)}get readOnly(){return!!this.getProperty(`readOnly`)}set readOnly(e){this.assignProperty(`readOnly`,e,Boolean)}get locale(){return this.getProperty(`locale`)||s.locale}set locale(e){this.assignProperty(`locale`,e)}get texts(){return this.getProperty(`texts`)??{}}set texts(e){this.assignProperty(`texts`,e)}get rule(){return xt(this.value)}get summaryText(){return qe(this.rule,this.start,{locale:this.locale,strings:this.strings(),timeZone:this.timeZone??void 0})}get onValueChanged(){return this.parts.valueChanged.event}onConfigured(){this.class.add(`mx-recurrence-editor`),this.attr.add({role:`group`})}onConfig(){for(let e of[`value`,`start`,`allDay`,`timeZone`,`firstDayOfWeek`,`locale`])this.observeProperty(e,()=>this.readValue());for(let e of[`text`,`summary`,`texts`,`readOnly`,`frequencies`])this.observeProperty(e,()=>this.show());this.parts.editors=this.makeEditors();let e=s.onChanged(()=>this.show());this.motif.setDisposable(()=>e.dispose()),this.show()}get parts(){let e=this;return e[kt]??={draft:new Ct,seen:``,valueChanged:new A,labelId:ae(`recurrence-days`),editors:null,listed:new WeakMap}}makeEditors(){let e=this.parts.draft.state,t=(e,t)=>{e.onValueChanged(e=>{e.byUser&&(t(e.value),this.chosen())})},n=(e,t,n=!1)=>(e.class.add(t),n&&e.attr.add({"data-span":`all`}),this.controls.add(e),e),r=n(new _e({stretch:!0}),`mx-recurrence-editor__frequency`);t(r,t=>e.frequency=t??`never`);let i=n(new he({min:1,max:999,allowEmpty:!1,stretch:!0}),`mx-recurrence-editor__interval`);t(i,t=>e.interval=t??e.interval);let a=h(this,`div`,`mx-recurrence-editor__days-field`);a.attr.add({"data-span":`all`,role:`group`,"aria-labelledby":this.parts.labelId});let o=h(a,`span`,`mx-recurrence-editor__days-label`);o.attr.add({id:this.parts.labelId});let s=h(a,`div`,`mx-recurrence-editor__days`),c=e.days.map(e=>{let t=new O({toggle:!0});return t.class.add(`mx-recurrence-editor__day`),t.motif.on(`click`,()=>{e.on=t.pressed,this.chosen()}),s.controls.add(t),t}),l=n(new ge({orientation:`horizontal`}),`mx-recurrence-editor__by`,!0);t(l,t=>e.by=t??e.by);let u=n(new _e({stretch:!0}),`mx-recurrence-editor__month`);t(u,t=>e.month=t??e.month);let d=n(new he({min:1,max:31,allowEmpty:!1,stretch:!0}),`mx-recurrence-editor__month-day`);t(d,t=>e.monthDay=t??e.monthDay);let f=n(new _e({stretch:!0}),`mx-recurrence-editor__nth`);t(f,t=>e.nth=t??e.nth);let p=n(new _e({stretch:!0}),`mx-recurrence-editor__weekday`);t(p,t=>e.weekday=t??e.weekday);let m=n(new ge({orientation:`horizontal`}),`mx-recurrence-editor__end`,!0);t(m,t=>e.end=t??e.end);let g=n(new he({min:1,max:999,allowEmpty:!1,stretch:!0}),`mx-recurrence-editor__count`);t(g,t=>e.count=t??e.count);let _=n(new Ne({stretch:!0}),`mx-recurrence-editor__until`);t(_,t=>e.until=t);let v=h(this,`p`,`mx-recurrence-editor__summary`);return v.attr.add({"data-span":`all`,"aria-live":`polite`}),{frequency:r,interval:i,daysField:a,daysLabel:o,days:c,by:l,month:u,monthDay:d,nth:f,weekday:p,end:m,count:g,until:_,summary:v}}readValue(){let e=this.parts;e.draft.read(this.value,this.draftContext()),e.seen=e.draft.key(),this.show()}chosen(){let e=this.parts,t=e.draft.key();if(t!==e.seen){e.seen=t;let n=this.value,r=e.draft.write(this.draftContext());if(r!==n){this.changeProperty(`value`,r),this.bindings.writeModel(r),e.valueChanged.fire({value:r,previousValue:n,byUser:!0,source:this});return}}this.show()}show(){let e=this.parts.editors;if(!e||this.isDisposed)return;let n=this.parts.draft.state,r=e=>this.textOf(e),i=this.readOnly,a=n.frequency!==`never`,o=n.frequency===`monthly`||n.frequency===`yearly`,s=o&&n.by===`weekday`,c=(e,t)=>new Intl.DateTimeFormat(this.locale,{weekday:t,timeZone:`UTC`}).format(Date.UTC(2026,0,4+e)),l=e=>new Intl.DateTimeFormat(this.locale,{month:`long`,timeZone:`UTC`}).format(Date.UTC(2026,e-1,1)),u=(e,t,n,r)=>{e.label=t,Object.is(e.value,n)||(e.value=n),e.visible=r,e.readOnly=i};t(this,`aria-label`,this.text||r(`recurrenceRepeat`)),this.list(e.frequency,this.frequencies.map(e=>({value:e,text:r(Et[e])}))),u(e.frequency,r(`recurrenceRepeat`),n.frequency,!0),u(e.interval,r(`recurrenceEvery`),n.interval,a);let d=a?Dt[n.frequency]:null;e.interval.suffix=d?r(new Intl.PluralRules(this.locale).select(n.interval)===`one`?d[0]:d[1]):``,f(e.daysField,n.frequency===`weekly`),E(e.daysLabel,r(`recurrenceOn`)),e.days.forEach((e,t)=>{let r=n.days[t];e.pressed=r.on,e.text=c(r.day,`short`),e.hint=c(r.day,`long`),e.enabled=!i}),this.list(e.by,[{value:`monthDay`,text:r(`recurrenceByMonthDay`)},{value:`weekday`,text:r(`recurrenceByWeekday`)}]),u(e.by,r(`recurrenceBy`),n.by,o),this.list(e.month,Array.from({length:12},(e,t)=>({value:t+1,text:l(t+1)}))),u(e.month,r(`recurrenceMonth`),n.month,n.frequency===`yearly`),u(e.monthDay,r(`recurrenceMonthDay`),n.monthDay,o&&n.by===`monthDay`),this.list(e.nth,Ot.map(([e,t])=>({value:e,text:r(t)}))),u(e.nth,r(`recurrenceNth`),n.nth,s),this.list(e.weekday,n.days.map(e=>({value:e.day,text:c(e.day,`long`)}))),u(e.weekday,r(`recurrenceWeekday`),n.weekday,s),this.list(e.end,[{value:`never`,text:r(`recurrenceEndNever`)},{value:`count`,text:r(`recurrenceEndCount`)},{value:`until`,text:r(`recurrenceEndUntil`)}]),u(e.end,r(`recurrenceEnds`),n.end,a),u(e.count,r(`recurrenceCount`),n.count,a&&n.end===`count`),e.until.locale=this.locale;let p=e.until.value?.getTime()===n.until?.getTime();u(e.until,r(`recurrenceUntil`),p?e.until.value:n.until,a&&n.end===`until`),f(e.summary,this.summary&&a),E(e.summary,this.summaryText)}list(e,t){let n=JSON.stringify(t);this.parts.listed.get(e)!==n&&(this.parts.listed.set(e,n),e.items=t)}draftContext(){return{start:this.start,allDay:this.allDay,zone:R.of(this.timeZone),firstDayOfWeek:this.firstDayOfWeek}}strings(){return{...s.strings,...this.texts}}textOf(e,t){let n=this.texts[e]??s.strings[e];return l(n,this.locale,t)}},jt=class extends _{static elementTag=`div`;made=!1;editButton;deleteButton;parts;itemsOf=new WeakMap;constructor(e){super(`div`,e)}onConfigured(){this.class.add(`mx-scheduler__tooltip`);let e=h(this,`div`,`mx-scheduler__tooltip-title`),t=h(this,`div`,`mx-scheduler__tooltip-time`),n=h(this,`div`,`mx-scheduler__tooltip-zone`),r=h(this,`div`,`mx-scheduler__tooltip-repeat`),i=new z(this,e=>e.kind.field,e=>this.makeLine(e),(e,t)=>this.drawLine(e,t),()=>4),a=h(this,`div`,`mx-scheduler__tooltip-description`),o=h(this,`div`,`mx-scheduler__tooltip-actions`);this.editButton=new O({icon:Ce()}),this.editButton.motif.on(`click`,()=>{let e=this.props.item();e&&this.props.edit(e)}),this.deleteButton=new O({icon:ye(),tone:`danger`}),this.deleteButton.motif.on(`click`,()=>{let e=this.props.item();e&&this.props.remove(e)}),o.controls.add(this.editButton,this.deleteButton),this.parts={title:e,time:t,zone:n,repeat:r,description:a,resources:i},this.made=!0,this.draw()}refresh(){this.draw()}draw(){if(this.isDisposed||!this.made)return;let{host:e,item:t}=this.props,n=t(),r=this.parts,a=t=>C(n,e.fields()[t]);for(let[e,t]of Object.entries(this.color()))o(this,e,t);let s=a(`text`);E(r.title,s==null||s===``?e.text(`schedulerNoTitle`):String(s)),E(r.time,this.when(n));let c=this.ownTime(n);f(r.zone,c!==``),E(r.zone,c);let l=this.repeats(n);i(r.repeat,`data-exception`,!!n&&e.model.isException(n)),f(r.repeat,l!==``),E(r.repeat,l),r.resources.show(n?e.resources.itemsOf(n):[]);let u=String(a(`description`)??``);f(r.description,u!==``),E(r.description,u),this.editButton.text=e.text(`schedulerEdit`),this.editButton.visible=!!n&&this.props.canEdit(n),this.deleteButton.text=e.text(`schedulerDelete`),this.deleteButton.visible=!!n&&this.props.canDelete(n)}when(e){let t=this.props.host,n=e?t.model.timeOf(e):null;return n?n.allDay?t.format.range(`day`,n.start,n.end):t.model.zone.sameDay(n.start,new Date(Math.max(n.start.getTime(),n.end.getTime()-1)))?`${t.format.fullDate(n.start)}, ${t.format.timeRange(n.start,n.end)}`:`${t.format.fullDate(n.start)} ${t.format.time(n.start)} – ${t.format.fullDate(n.end)} ${t.format.time(n.end)}`:``}repeats(e){let t=this.props.host;return e?t.model.occurrenceOf(e)?t.text(`schedulerRepeats`,{rule:t.recurrenceText(e)}):t.model.isException(e)?t.text(`schedulerChanged`):``:``}ownTime(e){let t=this.props.host,n=e?t.zoneOf(e):``,r=e&&n?t.model.timeOf(e):null;return!r||r.allDay?``:t.text(`schedulerInZone`,{time:t.format.timeRange(r.start,r.end,n),zone:n.replace(/_/g,` `)})}makeLine(e){let t=new _(`div`);t.class.add(`mx-scheduler__tooltip-resource`);let n=h(t,`span`,`mx-scheduler__tooltip-resource-label`),r=new z(t,e=>String(e.value),e=>{let t=new _(`span`);t.class.add(`mx-scheduler__tooltip-resource-item`);let n=h(t,`span`,`mx-scheduler__resource-swatch`);return n.attr.add({"aria-hidden":`true`}),f(n,!!e.color),o(n,`--_color`,e.color??``),E(h(t,`span`,``),e.text),t},()=>{},()=>1);return this.itemsOf.set(t,{label:n,items:r}),this.drawLine(t,e),t}drawLine(e,t){let n=this.itemsOf.get(e);E(n.label,t.kind.label),n.items.show(t.items)}color(){let{host:e,item:t}=this.props,n=t(),r=C(n,e.fields().color);return{"--_color":(typeof r==`string`?r:``)||(n?e.resources.colorOf(e.resources.allValuesOf(n)):``)}}};async function Mt(e){let t={scope:e.scopes[0]},n=new De({title:e.title(),width:`var(--_window-message-width)`,modal:!0,resizable:!1});n.class.add(`mx-scheduler__question`),n.content=b(Pe,{data:t,items:[{field:`scope`,label:e.text(),editor:`radio`,editorProps:{items:e.scopes.map(t=>({value:t,text:e.label(t)}))}}],runover:{},childs:[]});let r=null,i=null;return n.footer=b(Le,{class:`mx-scheduler__form-buttons`,orientation:`horizontal`,wrap:!0,justify:`end`,runover:{},childs:[b(O,{text:e.ok(),tone:()=>e.danger?`danger`:`accent`,ref:e=>r=e,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>n.close(`ok`))}},childs:[]}),b(O,{text:e.cancel(),ref:e=>i=e,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>n.close(`cancel`))}},childs:[]})]}),n.acceptButton=r,n.cancelButton=i,await n.showDialog(e.host)===`ok`?t.scope:null}var Nt=6e4,Pt=[`occurrence`,`following`,`series`],Ft={occurrence:`schedulerSeriesOccurrence`,following:`schedulerSeriesFollowing`,series:`schedulerSeriesAll`},It=class{constructor(e){this.host=e,this.tooltipPopup=null,this.tooltipState={value:null},this.tooltipView=null,this.openedId=``,this.formShown=!1,this.tooltipSheet=null,this.keyDraft=null,this.series=void 0,this.writer=void 0,this.recurrence=null,this.tooltipTemplate=void 0,this.tooltipContent=null,this.drawSheet=null,e.model.onChanged(e=>{e===`layout`&&this.openedId&&this.drawTooltip()}),this.writer=new _t(e.store),this.series=new ht({fields:()=>e.fields(),occurrences:e.model.occurrences,keyOf:t=>e.store.keyOf(t)})}own(e,t){let n=this.host.fields()[t],r=C(e,n);if(typeof r==`boolean`)return r;let i;for(let{items:t}of this.host.resources.itemsOf(e))for(let e of t){let t=C(e.item,n);if(t===!1)return!1;t===!0&&(i=!0)}return i}locked(e){return!!C(e,this.host.fields().disabled)||this.isSaving(e)}canDrag(e){return!this.locked(e)&&(this.own(e,`allowDrag`)??this.host.editing().allowDragging)}canResize(e){return!this.locked(e)&&(this.own(e,`allowResize`)??this.host.editing().allowResizing)}canEdit(e){return!this.locked(e)&&(this.own(e,`allowEdit`)??this.host.editing().allowUpdating)}canDelete(e){return!this.locked(e)&&(this.own(e,`allowDelete`)??this.host.editing().allowDeleting)}canAdd(){return this.host.editing().allowAdding}isSaving(e){let t=this.host.model.occurrenceOf(e)?.series;return this.host.saving.includes(this.host.model.idOf(e))||!!t&&this.host.saving.includes(this.host.model.idOf(t))}async add(e,t=!1){let{events:n,scheduler:r}=this.host,i={appointment:e,byUser:t,cancel:!1,source:r};if(n.adding.fire(i),!await Lt(i))return null;try{let e=await this.host.store.add(i.appointment);return n.added.fire({appointment:e,byUser:t,source:r}),this.host.say(this.host.text(`schedulerAdded`,{text:this.textOf(e)})),e}catch(e){return n.dataError.fire({operation:`add`,appointment:i.appointment,error:e,saved:[],unsaved:[{kind:`add`,appointment:i.appointment}],undone:!0,source:r}),this.host.say(this.host.text(`schedulerSaveFailed`)),null}}async update(e,t,n=!1,r=null){let{events:i,scheduler:a}=this.host,o=this.host.model.occurrenceOf(e)?.series??null;if(o){let i=g(t,this.host.fields().recurrenceRule)===void 0?Pt:Pt.slice(1);if(r??=await this.scopeFor(e,`update`,n,i),!r)return!1}let s={appointment:e,changes:{...t},byUser:n,scope:r,series:o,cancel:!1,source:a};if(i.updating.fire(s),!await Lt(s))return!1;let c=this.host.model.idOf(o??e);this.save(c);try{let t=null;if(o&&r){let n=await this.writer.run(this.series.update(e,s.changes,r));if(n.failed)return this.failed(`update`,e,n);t=n.added}else await this.host.store.update(e,s.changes);return i.updated.fire({appointment:e,changes:s.changes,byUser:n,scope:r,series:o,added:t,source:a}),!0}catch(t){let n={kind:`update`,appointment:e,changes:s.changes};return i.dataError.fire({operation:`update`,appointment:e,error:t,saved:[],unsaved:[n],undone:!0,source:a}),this.host.say(this.host.text(`schedulerSaveFailed`)),!1}finally{this.unsave(c)}}async remove(e,t=!1,n=null){let{events:r,scheduler:i}=this.host,a=this.host.model.occurrenceOf(e)?.series??null;if(a){let r=!n&&t&&this.host.seriesEdit()===`ask`;if(n??=await this.scopeFor(e,`delete`,t,Pt),!n||!r&&t&&this.host.editing().confirmDelete&&!await Oe(this.host.text(`schedulerDeleteConfirm`,{text:this.textOf(e)}),{tone:`danger`}))return!1}else if(t&&this.host.editing().confirmDelete&&!await Oe(this.host.text(`schedulerDeleteConfirm`,{text:this.textOf(e)}),{tone:`danger`}))return!1;let o={appointment:e,byUser:t,scope:n,series:a,cancel:!1,source:i};if(r.deleting.fire(o),!await Lt(o))return!1;let s=this.host.model.idOf(a??e);this.save(s);try{if(a&&n){let t=n===`occurrence`?null:this.host.store.keyOf(a),r=t==null?[]:await this.host.store.rowsNaming(this.host.fields().recurrenceId,t),i=await this.writer.run(this.series.remove(e,n,r));if(i.failed)return this.failed(`delete`,e,i)}else await this.host.store.remove(e);return r.deleted.fire({appointment:e,byUser:t,scope:n,series:a,source:i}),this.host.say(this.host.text(`schedulerDeleted`,{text:this.textOf(e)})),!0}catch(t){let n={kind:`delete`,appointment:e};return r.dataError.fire({operation:`delete`,appointment:e,error:t,saved:[],unsaved:[n],undone:!0,source:i}),this.host.say(this.host.text(`schedulerSaveFailed`)),!1}finally{this.unsave(s)}}save(e){this.host.saving.push(e),this.host.redraw()}unsave(e){let t=this.host.saving.indexOf(e);t<0||(this.host.saving.splice(t,1),this.host.redraw())}failed(e,t,n){let{saved:r,unsaved:i,error:a}=n,o=n.undone||!r.length;return this.host.events.dataError.fire({operation:e,appointment:t,error:a,saved:r,unsaved:i,undone:o,source:this.host.scheduler}),this.host.say(this.host.text(o?`schedulerSaveFailed`:`schedulerSavedInPart`)),!1}async scopeFor(e,t,n,r){let i=this.host.seriesEdit();return i===`ask`?n?this.askSeries(e,t,r):r[0]:r.includes(i)?i:r[r.length-1]}async askSeries(e,t,n=Pt,r=!0){let{events:i,scheduler:a}=this.host,o=this.host.model.occurrenceOf(e)?.series;if(!o)return null;let s={appointment:e,series:o,action:t,scopes:[...n],scope:null,cancel:!1,source:a};i.seriesAsking.fire(s);let c=null;if(!s.cancel&&s.scopes.length){if(s.scope)c=s.scope;else{this.hideTooltip();let n=(e,t)=>this.host.text(e,t),r=t===`delete`;c=await Mt({title:()=>n(r?`schedulerSeriesDelete`:`schedulerSeriesEdit`),text:()=>n(r?`schedulerSeriesDeleteQuestion`:`schedulerSeriesEditQuestion`,{text:this.textOf(e)}),scopes:s.scopes,label:e=>n(Ft[e]),ok:()=>n(r?`schedulerDelete`:`schedulerSave`),cancel:()=>n(`cancel`),danger:r,host:a})}}return i.seriesAnswered.fire({appointment:e,series:o,action:t,scope:c,byUser:r,source:a}),c}timeValues(e,t,n){let r=this.host.fields(),i=this.host.model.zone;return{[r.start]:n?i.toLocal(e):e,[r.end]:n?i.toLocal(t):t,[r.allDay]:n}}get formOpen(){return this.formShown}async openForm(e,t=null){let{scheduler:n}=this.host;if(e?!this.canEdit(e):!this.canAdd())return;this.hideTooltip();let r=this.host.fields(),i=this.host.editing(),a=i.form??{},o=this.host.model,s=t=>e?C(e,t):void 0,c=e?o.timeOf(e):null,l=c?.start??t?.start??new Date,u=c?.end??t?.end??new Date(l.getTime()+this.host.resolvedView().cellDuration*Nt),d=c?.allDay??t?.allDay??!1,f=e?o.seriesOf(e):null,p=String(s(r.startTimeZone)??``),m=String(s(r.endTimeZone)??``),h=this.host.resources.kinds(),g={text:String(s(r.text)??``),start:d?o.zone.toLocal(l):this.zoneOf(p).toLocal(l),end:d?P(F(o.zone.toLocal(u)),-1):this.zoneOf(m||p).toLocal(u),allDay:d,description:String(s(r.description)??``),recurrenceRule:String((f?C(f,r.recurrenceRule):s(r.recurrenceRule))??``),startTimeZone:p,endTimeZone:m,separateEndZone:!!m&&m!==p,...Object.fromEntries(h.map(n=>[n.field,this.resourceValue(n,e?s(n.field):t?.resources?.[n.field])]))},_=(e,t)=>this.host.text(e,t),y={appointment:e,data:g,isNew:!e,source:n},x=this.formBuiltIns(e,g,i,l),S=[`text`,`start`,`end`,`timeZone`,`allDay`,...h.map(e=>e.field),`recurrenceRule`,`description`],ee=Ye(a.items??S,x,y),w=a.title,te=()=>w===void 0?_(e?`schedulerEditAppointment`:`schedulerNewAppointment`):typeof w==`function`&&w.length>0?w(y):v(w)??``,T=this.host.presentation()===`phone`,E=T?new Fe({title:te,detents:[`full`],showClose:!0,dragContent:!1}):new De({title:te,width:a.width??`var(--_scheduler-editor-width)`,modal:!0});E.class.add(T?`mx-scheduler__form-sheet`:`mx-scheduler__form`);let D={appointment:e,data:g,items:ee,form:E,cancel:!1,source:n};if(this.host.events.formOpening.fire(D),D.cancel){E.dispose();return}let k=null,ne=`cancel`,A=e=>{ne=e,E instanceof De?E.close(e):E.close(`button`)},re=async()=>{k&&(await k.validate({focus:!0})).valid&&A(`ok`)};E.content=b(Pe,{data:g,items:D.items,columns:a.columns??(T?1:2),minColumnWidth:a.minColumnWidth??``,labelMode:a.labelMode,onFieldChanged:()=>this.formChanged(k),ref:e=>k=e,runover:{},childs:[]});let ie=null,ae=null;E.footer=b(Le,{class:`mx-scheduler__form-buttons`,orientation:`horizontal`,wrap:!0,justify:`end`,runover:{},childs:[b(O,{class:`mx-scheduler__form-delete`,text:()=>_(`schedulerDelete`),tone:`danger`,visible:()=>!!e&&this.canDelete(e),runover:{initializeComponent:e=>{e.motif.on(`click`,()=>A(`delete`))}},childs:[]}),b(O,{text:()=>_(`schedulerSave`),tone:`accent`,ref:e=>ie=e,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>void re())}},childs:[]}),b(O,{text:()=>_(`cancel`),ref:e=>ae=e,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>A(`cancel`))}},childs:[]})]}),this.formShown=!0;try{if(E instanceof De)E.acceptButton=ie,E.cancelButton=ae,ne=String(await E.showDialog(n)??`cancel`);else{let e=new Promise(e=>E.onClosed(()=>e()));E.show(n)&&await e}}finally{this.formShown=!1}if(ne===`delete`&&e){await this.remove(e,!0);return}if(ne!==`ok`)return;let j=this.formValues(g,i);e?await this.update(e,o.occurrenceOf(e)?this.changed(e,f,j):j,!0):await this.add(j,!0)}formBuiltIns(e,t,n,r){let i=this.host.model,a=(e,t)=>this.host.text(e,t),o=(e,n)=>t.allDay?e:this.zoneOf(n).fromLocal(e),s=[{type:`custom`,check:e=>!(e instanceof Date)||!(t.start instanceof Date)||o(e,t.separateEndZone&&t.endTimeZone||t.startTimeZone)>=o(t.start,t.startTimeZone)||a(`schedulerEndBeforeStart`)},{type:`custom`,check:()=>{if(!(t.start instanceof Date)||!(t.end instanceof Date))return!0;let n=this.formTimes(t),r={};for(let e of this.host.resources.kinds())r[e.field]=t[e.field];let{free:o,check:s}=i.check(e??{},n.start,n.end,n.allDay,r);return o?!0:s.overlapping.length?a(`schedulerTaken`,{text:this.textOf(s.overlapping[0])}):s.blocked.length?a(`schedulerBlockedTime`,{text:s.blocked[0].text||a(`schedulerUnavailable`)}):s.offHours?a(`schedulerOffHours`):a(`schedulerNotFree`)},ignoreEmpty:!1}],c=n.allowTimeZones?this.zoneItems(r):[],l=()=>a(`schedulerOwnZone`,{zone:i.zone.name||R.localName()}),u=e=>c.find(t=>t.value===e)?.text??``,d=!!e&&i.isException(e),f=new Map([[`text`,[{field:`text`,label:()=>a(`schedulerSubject`),required:!0,colSpan:`all`}]],[`start`,[{field:`start`,label:()=>a(`schedulerStart`),editor:`datetime`,required:!0,visible:()=>!t.allDay},{field:`start`,label:()=>a(`schedulerStart`),editor:`date`,required:!0,visible:()=>!!t.allDay}]],[`end`,[{field:`end`,label:()=>a(`schedulerEnd`),editor:`datetime`,required:!0,visible:()=>!t.allDay,rules:s},{field:`end`,label:()=>a(`schedulerEnd`),editor:`date`,required:!0,visible:()=>!!t.allDay,rules:s}]],[`startTimeZone`,[{field:`startTimeZone`,label:()=>a(t.separateEndZone?`schedulerStartTimeZone`:`schedulerTimeZone`),editor:`dropdown`,colSpan:`all`,editorProps:{items:c,searchEnabled:!0,placeholder:l,clearButton:!0,hint:()=>u(t.startTimeZone)},visible:()=>n.allowTimeZones&&!t.allDay}]],[`separateEndZone`,[{field:`separateEndZone`,label:()=>a(`schedulerSeparateEndZone`),editor:`checkbox`,colSpan:`all`,editorProps:{class:`mx-scheduler__end-zone-switch`,onValueChanged:e=>{e.byUser&&(t.separateEndZone=!!e.value,e.value||(t.endTimeZone=``))}},visible:()=>n.allowTimeZones&&!t.allDay}]],[`endTimeZone`,[{field:`endTimeZone`,label:()=>a(`schedulerEndTimeZone`),editor:`dropdown`,colSpan:`all`,editorProps:{items:c,searchEnabled:!0,placeholder:()=>t.startTimeZone?String(t.startTimeZone):l(),clearButton:!0,hint:()=>u(t.endTimeZone)},visible:()=>n.allowTimeZones&&!t.allDay&&!!t.separateEndZone}]],[`allDay`,[{field:`allDay`,label:()=>a(`schedulerAllDay`),editor:`switch`,colSpan:`all`}]],[`recurrenceRule`,[{field:`recurrenceRule`,colSpan:`all`,visible:()=>n.allowRecurrence&&!d,template:()=>b(At,{class:`mx-scheduler__recurrence`,start:()=>t.start instanceof Date?t.start:null,allDay:()=>!!t.allDay,timeZone:()=>t.startTimeZone?String(t.startTimeZone):i.zone.name||null,locale:()=>this.host.locale(),firstDayOfWeek:()=>this.host.firstDayOfWeek(),ref:e=>this.recurrence={editor:e,data:t},runover:{initializeComponent:e=>{e.bindings.model(()=>t.recurrenceRule,e=>{let n=t;n!=null&&typeof n.recurrenceRule!=`function`&&(n.recurrenceRule=e)})}},childs:[]})}]],[`description`,[{field:`description`,label:()=>a(`schedulerDescription`),editor:`textarea`,colSpan:`all`}]]]);for(let e of this.host.resources.kinds())f.set(e.field,[this.resourceItem(e)]);return f}resourceItem(e){let t=t=>{let n=e.colorOf(t);return n?b(`span`,{initializeComponent:e=>{e.style({"--_color":n}),e.class.add(`mx-scheduler__resource-swatch`)}},1):void 0};return{field:e.field,label:()=>e.label,editor:e.multiple?`tagbox`:`dropdown`,colSpan:`all`,editorProps:{items:()=>e.items,valueField:t=>e.valueOf(t),textField:t=>e.textOf(t),iconField:e=>t(e),clearButton:!0,class:`mx-scheduler__resource-picker`}}}resourceValue(e,t){let n=Array.isArray(t)?M(t):t==null||t===``?[]:[t];return e.multiple?n:n[0]??null}zoneOf(e){return typeof e==`string`&&e?R.of(e):this.host.model.zone}formTimes(e){let t=e.start instanceof Date?e.start:new Date,n=e.end instanceof Date?e.end:t;if(e.allDay){let e=this.host.model.zone;return{start:e.date(R.wallOfLocal(F(t))),end:e.date(R.wallOfLocal(P(F(n),1))),allDay:!0}}let r=String(e.startTimeZone??``),i=(e.separateEndZone?String(e.endTimeZone??``):``)||r,a=this.zoneOf(r).fromLocal(t),o=this.zoneOf(i).fromLocal(n);return{start:a,end:o<a?a:o,allDay:!1}}zoneItems(e){let t=this.host.view.format;return R.names().map(t=>({name:t,offset:R.of(t).offset(e)})).sort((e,t)=>e.offset-t.offset||e.name.localeCompare(t.name)).map(({name:n})=>({value:n,text:t.zoneName(n,e)}))}changed(e,t,n){let r=this.host.fields(),i={};for(let[a,o]of Object.entries(n))Rt(C(a===r.recurrenceRule&&t?t:e,a),o)||(i[a]=o);return i}formValues(e,t){let n=this.host.fields(),r=e.start instanceof Date?e.start:new Date,i=e.end instanceof Date?e.end:r,a=[`text`,`start`,`end`,`allDay`,`description`,`recurrenceRule`,`startTimeZone`,`endTimeZone`,`separateEndZone`],o={};for(let[t,n]of Object.entries(e))a.includes(t)||(o[t]=Array.isArray(n)?M(n):n);if(o[n.text]=e.text,o[n.description]=e.description,t.allowRecurrence&&(o[n.recurrenceRule]=String(e.recurrenceRule??``)),e.allDay)Object.assign(o,{[n.start]:F(r),[n.end]:P(F(i),1),[n.allDay]:!0});else{let r=this.formTimes(e);Object.assign(o,this.timeValues(r.start,r.end,!1)),t.allowTimeZones&&Object.assign(o,{[n.startTimeZone]:String(e.startTimeZone??``),[n.endTimeZone]:e.separateEndZone?String(e.endTimeZone??``):``})}return o}formChanged(e){e?.refresh();let t=this.recurrence;if(!t||t.editor.isDisposed)return;let{editor:n,data:r}=t;n.start=r.start instanceof Date?r.start:null,n.allDay=!!r.allDay,n.timeZone=r.startTimeZone?String(r.startTimeZone):this.host.model.zone.name||null}showTooltip(e,t){if(this.tooltipState.value=e,this.host.presentation()===`phone`)this.showSheet(e);else{let e=this.tooltip();this.drawTooltip(),e.open(t)}this.setOpened(this.host.model.idOf(e))}setOpened(e){this.openedId!==e&&(this.openedId=e,this.host.redraw())}drawTooltip(){let e=this.tooltipPopup;if(e){let t=this.host.view.tooltipTemplate();t!==this.tooltipTemplate||t?this.fillTooltip(e,t):this.tooltipView?.refresh()}this.drawSheet?.()}fillTooltip(e,t){if(this.tooltipTemplate=t,this.tooltipContent&&e.controls.remove(this.tooltipContent),this.tooltipView=null,t){let n=new _(`div`);n.class.add(`mx-scheduler__tooltip-own`),n.controls.add(t(this.tooltipContext(()=>e.close()))),this.tooltipContent=n}else{let t=this.tooltipState,n=new jt({host:this.host.view,item:()=>t.value,canEdit:e=>this.canEdit(e),canDelete:e=>this.canDelete(e),edit:e=>void this.openForm(e),remove:t=>{e.close(),this.remove(t,!0)}});this.tooltipView=n,this.tooltipContent=n}e.controls.add(this.tooltipContent)}isOpen(e){return this.openedId!==``&&this.openedId===this.host.model.idOf(e)}hideTooltip(){this.tooltipPopup?.isOpen&&this.tooltipPopup.close(),this.tooltipSheet?.isOpen&&this.tooltipSheet.close()}showSheet(e){this.tooltipSheet?.close();let t=this.host.view,n=t.tooltipTemplate(),r=e=>this.host.text(e),i;if(n){let t=new Fe({title:this.textOf(e),detents:[`fit`,`full`]});i=t,t.content=this.tooltipOwn(n,()=>t.close()),this.drawSheet=()=>{t.title=this.textOf(e),t.content=this.tooltipOwn(n,()=>t.close())}}else{let n=()=>{let n=t.recurrenceText(e);return{title:this.textOf(e),message:[this.timeText(e),n&&this.host.text(`schedulerRepeats`,{rule:n})].filter(Boolean).join(` · `),items:[{text:r(`schedulerEdit`),visible:this.canEdit(e),click:()=>void this.openForm(e)},{text:r(`schedulerDelete`),tone:`danger`,visible:this.canDelete(e),click:()=>void this.remove(e,!0)}]}},a=new Ie(n());i=a,this.drawSheet=()=>{let e=n();a.title=e.title,a.message=e.message,a.items=e.items}}i.class.add(`mx-scheduler__tooltip-sheet`),i.onClosed(()=>{this.tooltipSheet===i&&(this.tooltipSheet=null,this.drawSheet=null,this.setOpened(``))}),this.tooltipSheet=i,i.show(this.host.scheduler)}timeText(e){let t=this.host.view,n=t.model.timeOf(e);return n?n.allDay?t.format.range(`day`,n.start,n.end):`${t.format.fullDate(n.start)}, ${t.format.timeRange(n.start,n.end)}`:``}tooltipContext(e){let t=this.tooltipState,n=this,r=()=>t.value;return{get appointment(){return r()},get text(){let e=r();return e?n.textOf(e):``},get time(){let e=r();return e?n.timeText(e):``},get canEdit(){let e=r();return!!e&&n.canEdit(e)},get canDelete(){let e=r();return!!e&&n.canDelete(e)},edit:()=>{let e=t.value;e&&this.openForm(e)},remove:()=>{let n=t.value;e(),n&&this.remove(n,!0)},close:e}}tooltipOwn(e,t){let n=new _(`div`);return n.class.add(`mx-scheduler__tooltip-own`),n.controls.add(e(this.tooltipContext(t))),n}tooltip(){if(this.tooltipPopup)return this.tooltipPopup;let e=new ie;return e.matchWidth=!1,e.class.add(`mx-scheduler__tooltip-popup`),e.onClosed(()=>this.setOpened(``)),this.host.scheduler.controls.add(e),this.tooltipPopup=e,e}key(e,t){let n=this.host.model.itemOf(e),r=this.keyDraft;if(r&&r.draft.item!==n&&this.cancelKeys(),t.key===`Escape`&&this.keyDraft)return this.cancelKeys(),!0;if(t.key===`Enter`&&this.keyDraft){let{mode:e,draft:t}=this.keyDraft;return this.keyDraft=null,this.drop(e,t,!0).finally(()=>{this.host.setDraft(null),this.keepFocus(n)}),!0}if((t.key===`Delete`||t.key===`Backspace`)&&!this.keyDraft)return this.canDelete(n)&&this.remove(n,!0),!0;let i=this.groupStep(t)||this.rowStep(t),a=i?{minutes:0,days:0}:this.arrowStep(t);if(!a)return!1;let o=t.shiftKey&&!i?`end`:`move`;if(o===`move`?!this.canDrag(n):!this.canResize(n))return!0;let s=this.keyDraft;if(!s){let t=this.host.model.timeOf(n);if(!t)return!0;let r={item:n,...t,copy:!1,invalid:!1};if(!this.starting(o,r,!0))return!0;s=this.keyDraft={mode:o,draft:r,from:e.group,group:e.group}}let{draft:c}=s,l=this.host.model;if(i){let e=l.state.groups.length,t=Math.max(0,Math.min(e-1,s.group+i));if(t===s.group)return!0;s.group=t}let u=a.minutes*Nt,d=a.days,f=this.host.model.zone,p;if(o===`move`)p={...c,start:f.addDays(new Date(c.start.getTime()+u),d),end:f.addDays(new Date(c.end.getTime()+u),d)};else{let e=(c.allDay?1440:this.minDuration())*Nt,t=f.addDays(new Date(c.end.getTime()+u),d);p={...c,end:new Date(Math.max(t.getTime(),c.start.getTime()+e))}}p.resources=o===`move`?l.movedValues(n,l.state.groups[s.from]??null,l.state.groups[s.group]??null):null,p.invalid=!this.over(o,p,!0),s.mode=o,s.draft=p,this.host.setDraft(p),this.keepFocus(n);let m=p.allDay?this.host.view.format.range(`day`,p.start,p.end):`${this.host.view.format.fullDate(p.start)} ${this.host.view.format.timeRange(p.start,p.end)}`,h=l.state.groups[s.group],g=h&&s.group!==s.from?`${m}, ${h.path.map(e=>e.text).join(`, `)}`:m;return this.host.say(this.host.text(p.invalid?`schedulerMovingNotFree`:`schedulerMoving`,{text:this.textOf(n),time:g})),!0}groupStep(e){if(this.host.model.state.groups.length<2)return 0;let t=this.host.keys(),n=a(t.nextGroup,e)?1:a(t.previousGroup,e)?-1:0;return this.host.rtl()?-n:n}rowStep(e){return this.host.model.kind!==`timeline`||this.host.model.state.groups.length<2||e.shiftKey||e.ctrlKey||e.altKey||e.metaKey?0:e.key===`ArrowUp`?-1:+(e.key===`ArrowDown`)}keepFocus(e){if(this.host.model.flush(),this.focusBoxOf(this.host.boxesOf(e)))return;let t=0;le(this.host.scheduler,()=>this.host.boxesOf(e),e=>{if(this.focusBoxOf(e)||++t>=4)return!1})}focusBoxOf(e){return e.some(S)?!0:e.length?(p(e[0]),!0):!1}blurred(e){let t=this.keyDraft;t&&ze(()=>{this.keyDraft===t&&!this.host.boxesOf(e).some(S)&&this.cancelKeys()})}cancelKeys(){this.keyDraft&&(this.keyDraft=null,this.host.setDraft(null))}arrowStep(e){if(e.ctrlKey||e.altKey||e.metaKey)return null;let t=this.host.resolvedView().type,n=t===`month`,r=this.host.rtl()?-1:1;if(G(t)===`timeline`){if(e.key!==`ArrowLeft`&&e.key!==`ArrowRight`)return null;let n=(e.key===`ArrowRight`?1:-1)*r;return K(t)?{minutes:0,days:n}:{minutes:n*this.snapMinutes(),days:0}}switch(e.key){case`ArrowUp`:return n?{minutes:0,days:-7}:{minutes:-this.snapMinutes(),days:0};case`ArrowDown`:return n?{minutes:0,days:7}:{minutes:this.snapMinutes(),days:0};case`ArrowLeft`:return{minutes:0,days:-r};case`ArrowRight`:return{minutes:0,days:r};default:return null}}root(){return this.host.scheduler}scroller(){return this.host.scroller()}get model(){return this.host.model}view(){return this.host.resolvedView()}snapMinutes(){return this.host.snapMinutes()}minDuration(){return this.host.minDuration()}canCopy(){return this.host.editing().allowCopying&&this.canAdd()}setDraft(e){this.host.setDraft(e)}starting(e,t,n=!1){this.hideTooltip();let r=this.dragArgs(t,n);return(e===`move`?this.host.events.moveStart:this.host.events.resizeStart).fire(r),!r.cancel}over(e,t,n=!1){let r=this.dragArgs(t,n);return r.cancel=!this.isFree(t.copy?this.copyOf(t.item):t.item,t.start,t.end,t.allDay,t.resources??null),(e===`move`?this.host.events.moving:this.host.events.resizing).fire(r),!r.cancel}isFree(e,t,n,r,i){return this.host.model.check(e,t,n,r,i).free}async drop(e,t,n=!1){let r=this.dragArgs(t,n);if((e===`move`?this.host.events.moveEnd:this.host.events.resizeEnd).fire(r),r.cancel||t.invalid)return;let i={...this.timeValues(r.start,r.end,r.allDay),...r.resources??{}};if(r.copy){await this.add({...this.copyOf(t.item),...i},!0);return}if(await this.update(t.item,i,!0)){let e=r.allDay?this.host.view.format.range(`day`,r.start,r.end):`${this.host.view.format.fullDate(r.start)} ${this.host.view.format.timeRange(r.start,r.end)}`;this.host.say(this.host.text(`schedulerMoved`,{text:this.textOf(t.item),time:e}))}}dragArgs(e,t){return{appointment:e.item,start:e.start,end:e.end,allDay:e.allDay,copy:e.copy,byKeys:t,resources:e.resources??null,cancel:!1,source:this.host.scheduler}}copyOf(e){let t=this.host.fields(),n=k(()=>({...e}));return delete n[t.key],delete n[t.recurrenceRule],delete n[t.recurrenceException],delete n[t.recurrenceId],n}textOf(e){let t=C(e,this.host.fields().text);return t==null||t===``?this.host.text(`schedulerNoTitle`):String(t)}dispose(){this.cancelKeys(),this.hideTooltip()}};async function Lt(e){if(e.cancel)return!1;if(!e.promise)return!0;try{return await e.promise===!0}catch{return!1}}function Rt(e,t){if(e instanceof Date&&t instanceof Date)return e.getTime()===t.getTime();if(Array.isArray(e)||Array.isArray(t)){let n=Array.isArray(e)?e:e==null||e===``?[]:[e],r=Array.isArray(t)?t:t==null||t===``?[]:[t];return n.length===r.length&&n.every((e,t)=>Rt(e,r[t]))}if(typeof e==`boolean`||typeof t==`boolean`)return!!e==!!t;let n=e=>e==null||e===``;return e===t||n(e)&&n(t)}var zt=class{options;constructor(e){this.options=e}async add(e){let t=this.options.source();return t?t.adapter.insert(e):(this.options.appointments().push(e),this.options.changed(e),e)}async update(e,t){let n=this.options.source();if(n){await n.adapter.update(this.keyOf(e),t);return}Object.assign(e,t),this.options.changed(e)}async remove(e){let t=this.options.source();if(t){await t.adapter.remove(this.keyOf(e));return}let n=this.options.appointments(),r=n.indexOf(e);r>=0&&n.splice(r,1),this.options.changed(e)}async rowsNaming(e,t){let n=this.options.source();return n?(await n.adapter.load({filter:{field:e,op:`=`,value:t}})).rows:M(this.options.appointments()).filter(n=>C(n,e)===t)}keyOf(e){let t=this.options.source();return t?t.adapter.keyOf(e):C(e,this.options.keyField())}},Bt=6e4,Vt=864e5,Ht=4,Ut=450,Wt=40,Gt=16,Kt=class{host;shown;press=null;draft=null;last=null;stopScroll=null;endedAt=0;readPointer=()=>this.last;followPointer=()=>this.follow();constructor(e,t){this.host=e,this.shown=t}get active(){return!!this.press?.started}get justEnded(){return Date.now()-this.endedAt<300}begin(e,t,n,r=-1,i=!1){if(n.button!==0||this.press)return;let a=this.host.model.timeOf(e);if(!a)return;let o=this.cellAt(n.clientX,n.clientY);this.press={item:e,mode:t,x:n.clientX,y:n.clientY,pointerId:n.pointerId,start:a.start,end:a.end,allDay:a.allDay,at:o?.time??null,atDay:o?.day??null,group:r,started:!1,touch:n.pointerType===`touch`};let s=this.host.root();this.stopPage=[u(s,`pointermove`,this.onMove),u(s,`pointerup`,this.onUp),u(s,`pointercancel`,this.onCancel),u(s,`keydown`,this.onKey,!0)],n.pointerType===`touch`&&!i&&(this.press.touchTimer=ze(()=>this.start(),Ut))}cancel(){this.stop(),this.host.setDraft(null)}dispose(){this.cancel()}stopPage=[];onMove=e=>{let t=this.press;if(t&&e.pointerId===t.pointerId){if(!t.started){let n=Math.hypot(e.clientX-t.x,e.clientY-t.y)>Ht;if(t.touchTimer){Math.hypot(e.clientX-t.x,e.clientY-t.y)>8&&this.stop();return}if(!n||!this.start())return}e.preventDefault(),this.last={x:e.clientX,y:e.clientY,copy:e.ctrlKey||e.metaKey},this.follow(),this.scrollNearEdges()}};onUp=e=>{let t=this.press;if(!t||e.pointerId!==t.pointerId)return;let n=this.draft,r=t.started;if(this.stop(),r&&n){if(this.endedAt=Date.now(),n.invalid){this.host.setDraft(null);return}this.host.drop(t.mode,n).finally(()=>this.host.setDraft(null))}};onCancel=()=>this.cancel();onKey=e=>{this.press?.started&&(e.key===`Escape`?(e.preventDefault(),e.stopPropagation(),this.cancel()):(e.key===`Control`||e.key===`Meta`)&&this.last&&(this.last.copy=!0,this.follow()))};start(){let e=this.press;if(!e)return!1;e.touchTimer&&=(e.touchTimer(),void 0);let t={item:e.item,start:e.start,end:e.end,allDay:e.allDay,copy:!1,invalid:!1,touch:e.touch};return this.host.starting(e.mode,t)?(e.started=!0,this.draft=t,this.host.setDraft(t),!0):(this.stop(),!1)}stop(){this.press?.touchTimer?.(),this.press=null,this.draft=null,this.last=null,this.stopScroll?.(),this.stopScroll=null;for(let e of this.stopPage.splice(0))e()}follow(){let e=this.press,t=this.last;if(!e||!t)return;let n=this.cellAt(t.x,t.y);if(!n)return;let r=e.mode===`move`?this.moved(e,n):this.resized(e,n);if(!r)return;let i=e.mode===`move`&&t.copy&&this.host.canCopy(),a=this.host.model,o=e.mode===`move`?a.movedValues(e.item,a.state.groups[e.group]??null,a.groupOf(n.column)):null,s={item:e.item,...r,copy:i,invalid:!1,resources:o,touch:e.touch},c=this.draft;c&&qt(c,s)||(s.invalid=!this.host.over(e.mode,s),this.draft=s,this.host.setDraft(s))}moved(e,t){let n=this.host.view(),r=this.host.model.zone,i=e.end.getTime()-e.start.getTime();if(this.host.model.kind===`timeline`&&e.allDay){let n=e.atDay??r.dayStart(e.start),i=Math.round((r.wall(r.dayStart(t.day))-r.wall(n))/Vt);return{start:r.addDays(e.start,i),end:r.addDays(e.end,i),allDay:!0}}if(t.time&&e.at){if(e.allDay){let e=this.snap(t.time);return{start:e,end:new Date(e.getTime()+Math.max(n.cellDuration,30)*Bt*2),allDay:!1}}let a=this.snap(r.date(r.wall(e.start)+(r.wall(t.time)-r.wall(e.at))));return{start:a,end:new Date(a.getTime()+i),allDay:!1}}if(t.time){let r=this.snap(t.time);return{start:r,end:new Date(r.getTime()+(e.allDay?n.cellDuration*2*Bt:i)),allDay:!1}}let a=e.atDay??r.dayStart(e.start),o=Math.round((r.wall(t.day)-r.wall(a))/Vt);return!K(n.type)&&!e.allDay?{start:t.day,end:r.addDays(t.day,1),allDay:!0}:{start:r.addDays(e.start,o),end:r.addDays(e.end,o),allDay:e.allDay}}resized(e,t){let n=this.host.minDuration()*Bt;if(t.time&&!e.allDay){let r=this.snap(t.time,e.mode===`end`);return e.mode===`end`?{start:e.start,end:new Date(Math.max(r.getTime(),e.start.getTime()+n)),allDay:!1}:{start:new Date(Math.min(r.getTime(),e.end.getTime()-n)),end:e.end,allDay:!1}}let r=this.host.model.zone,i=t.day,a=e=>r.date(r.wall(i)+(r.wall(e)-r.wall(r.dayStart(e))));if(e.mode===`end`){let t=e.allDay?r.addDays(i,1):a(e.end);return{start:e.start,end:t<=e.start?e.allDay?r.addDays(r.dayStart(e.start),1):e.end:t,allDay:e.allDay}}let o=e.allDay?i:a(e.start);return{start:o>=e.end?e.start:o,end:e.end,allDay:e.allDay}}snap(e,t=!1){let n=this.host.model.zone,r=Math.max(1,this.host.snapMinutes()),i=n.wall(e),a=Math.floor(i/Vt)*Vt,o=(i-a)/Bt,s=t?Math.ceil(o/r)*r:Math.round(o/r)*r;return n.date(a+s*Bt)}cellAt(e,t){let n=this.shown.cellUnder({x:e,y:t});if(!n)return null;let{column:r,slot:i}=n.place,a=this.host.model,o=a.state.columns[r]?.day;if(!o)return null;let s=i>=0?a.state.slots[i]:void 0;if(!s||K(this.host.view().type))return{day:o.date,time:null,column:r};let c=ue(n.cell,{x:e,y:t},a.kind===`timeline`?`x`:`y`),l=s.minutes+c*this.host.view().cellDuration;return{day:o.date,time:a.zone.date(o.wall+l*Bt),column:r}}scrollNearEdges(){if(this.stopScroll)return;let e=this.host.root();this.stopScroll=Te(e,()=>this.scrollBox(),()=>this.press?.started?this.last:null,()=>w(e,this.readPointer,this.followPointer),{zone:Wt,speed:Gt})}scrollBox(){let e=this.host.scroller();return e instanceof y?e:this.shown.scroller()}};function qt(e,t){return e.start.getTime()===t.start.getTime()&&e.end.getTime()===t.end.getTime()&&e.allDay===t.allDay&&e.copy===t.copy&&JSON.stringify(e.resources??null)===JSON.stringify(t.resources??null)}function J(e,t){return e===t||e!=null&&t!=null&&String(e)===String(t)}var Jt=class{def;rows;indexed=null;byValue=new Map;constructor(e,t){this.def=e,this.rows=t}get field(){return C(this.def,`field`)}get label(){return C(this.def,`label`)||this.field}get multiple(){return!!C(this.def,`allowMultiple`)}get useColorAsDefault(){return!!C(this.def,`useColorAsDefault`)}get items(){return this.rows()}valueOf(e){return C(e,this.expr(`valueExpr`,`id`))}textOf(e){let t=C(e,this.expr(`displayExpr`,`text`));return String(t??this.valueOf(e)??``)}colorOf(e){let t=e===void 0?void 0:C(e,this.expr(`colorExpr`,`color`));return typeof t==`string`?t:``}parentOf(e){let t=C(this.def,`parentExpr`);return t?C(e,t):void 0}workOf(e){if(e===void 0)return{};let t=C(e,this.expr(`workStartHourExpr`,`workStartHour`)),n=C(e,this.expr(`workEndHourExpr`,`workEndHour`)),r=C(e,this.expr(`workDaysExpr`,`workDays`));return{start:typeof t==`number`?t:void 0,end:typeof n==`number`?n:void 0,days:Array.isArray(r)?M(r):void 0}}find(e){let t=this.items;if(e==null)return t.find(t=>J(this.valueOf(t),e));if(t!==this.indexed){this.indexed=t,this.byValue=new Map;for(let e of t){let t=this.valueOf(e);t!=null&&!this.byValue.has(String(t))&&this.byValue.set(String(t),e)}}return this.byValue.get(String(e))}expr(e,t){return C(this.def,e)??t}};function Yt(e){return!!e&&!Array.isArray(e)&&typeof e.load==`function`&&`rows`in e}var Xt=class{list;made=new WeakMap;rows=0;listeners=new Set;lastRows=new WeakMap;followed=new Map;stop=null;constructor(e){this.list=e}kinds(){return M(this.list()).map(e=>{let t=this.made.get(e);return t||this.made.set(e,t=new Jt(e,()=>this.rowsOf(e))),t})}kind(e){return this.kinds().find(t=>t.field===e)}refresh(){this.rows++,this.changed()}listChanged(){this.stop&&this.sync(this.sources()),this.changed()}onChanged(e){return this.listeners.add(e),()=>this.listeners.delete(e)}valuesOf(e,t){let n=C(e,t);return Array.isArray(n)?M(n).filter(e=>!Zt(e)):Zt(n)?[]:[n]}allValuesOf(e){let t={};for(let n of this.kinds())t[n.field]=this.valuesOf(e,n.field);return t}colorOf(e,t=null,n=this.kinds()){let r=n.find(e=>e.useColorAsDefault);for(let i of r?[r]:n){let n=t?.path.find(e=>e.field===i.field);if(n?.color)return n.color;for(let t of e[i.field]??[]){let e=i.colorOf(i.find(t));if(e)return e}}return``}itemsOf(e){return this.kinds().map(t=>({kind:t,items:this.valuesOf(e,t.field).map(e=>{let n=t.find(e);return{field:t.field,value:e,item:n,text:n===void 0?String(e):t.textOf(n),color:t.colorOf(n)}})})).filter(e=>e.items.length)}follow(){return this.stop?this.stop:(this.stop=()=>{this.sync([]),this.stop=null},this.sync(this.sources()),this.stop)}sources(){return M(this.list()).map(e=>C(e,`items`)).filter(Yt)}changed(){for(let e of[...this.listeners])e()}rowsOf(e){let t=C(e,`items`),n=this.rows,r=Yt(t)?t.rows:t,i=this.lastRows.get(e);if(i&&i.from===r&&i.version===n)return i.rows;let a=M(r);return this.lastRows.set(e,{from:r,version:n,rows:a}),a}sync(e){for(let[t,n]of this.followed)e.includes(t)||(n(),this.followed.delete(t));for(let t of e){if(this.followed.has(t))continue;let e=t.onChanged(()=>{this.rows++,this.changed()});this.followed.set(t,()=>e.dispose()),t.status===`idle`&&t.load()}}};function Zt(e){return e==null||e===``}var Qt=864e5;function $t(e,t,n,r){return k(()=>en(e,t,n,r))}function en(e,t,n,r){let i=[];for(let a of e){if(!(a.start instanceof Date)||!(a.end instanceof Date))continue;let e,o;if(a.allDay){e=R.wallOfLocal(F(a.start));let t=R.wallOfLocal(F(a.end));o=t===R.wallOfLocal(a.end)&&t>e?t:t+Qt}else e=r.wall(a.start),o=r.wall(a.end);let s=Math.max(0,o-e),c=a.recurrenceRule?xt(a.recurrenceRule):null,l=c?pt(c,e,t-s-Qt,n+Qt,{wallOf:e=>r.wall(e)}):[e];for(let e of l)e<n&&e+s>t&&i.push({start:e,end:e+s,block:a})}return i}function tn(e,t){if(!e.length)return[];let n=[],r=(i,a,o)=>{if(i===e.length){n.push(nn(e,a,o,t));return}let s=e[i],c=a[i-1],l=!!c&&!!C(s.def,`parentExpr`);for(let e of s.items){if(l&&!J(s.parentOf(e),c.value))continue;let t=s.valueOf(e);r(i+1,[...a,{field:s.field,value:t,text:s.textOf(e),color:s.colorOf(e)}],[...o,e])}};return r(0,[],[]),n}function nn(e,t,n,r){let i={};for(let e of t)i[e.field]=e.value;let a,o,s;for(let r=t.length-1;r>=0;r--){let t=e[r].workOf(n[r]);a??=t.start,o??=t.end,s??=t.days}return{key:t.map(e=>`${e.field}=${String(e.value)}`).join(`|`),values:i,path:t,workStart:a??r.start,workEnd:o??r.end,workDays:s??M(r.days)}}var Y=864e5,rn=500,an=class{options;rules=new Map;made=new Map;used=new Set;info=new WeakMap;constructor(e){this.options=e}ruleOf(e){let t=C(e,this.options.fields().recurrenceRule);if(typeof t!=`string`||!t.trim())return null;if(this.rules.has(t))return this.rules.get(t);let n=xt(t);return this.rules.size>rn&&this.rules.clear(),this.rules.set(t,n),n}infoOf(e){return typeof e==`object`&&e?this.info.get(e)??null:null}zoneOf(e){let t=C(e,this.options.fields().startTimeZone);return typeof t==`string`&&t?R.of(t):this.options.zone()}of(e,t,n){let r=this.ruleOf(e),i=this.options.fields(),a=W(C(e,i.start));if(!r||!a)return[];let o=W(C(e,i.end))??a,s=V(C(e,i.recurrenceException)),c=this.options.zone(),l=[],u=this.options.idOf(e);if(C(e,i.allDay)){let i=Math.max(0,R.wallOfLocal(o)-R.wallOfLocal(a)),d=pt(r,R.wallOfLocal(a),c.wall(t)-i-Y,c.wall(n)+Y,{wallOf:e=>c.wall(e)});for(let t of d){let n=Math.floor(t/Y);s.some(e=>Math.floor((e.utc?c.wall(e.time):e.time)/Y)===n)||l.push(this.make(e,u,R.localOfWall(t),R.localOfWall(t+i)))}return l}let d=this.zoneOf(e),f=Math.max(0,o.getTime()-a.getTime()),p=pt(r,d.wall(a),d.wall(t)-f-Y,d.wall(n)+Y,{wallOf:e=>d.wall(e)});for(let t of p){let n=d.moment(t);s.some(e=>e.utc?Math.abs(e.time-n)<1e3:e.dateOnly?Math.floor(e.time/Y)===Math.floor(t/Y):Math.abs(e.time-t)<1e3)||l.push(this.make(e,u,new Date(n),new Date(n+f)))}return l}sweep(){for(let e of this.made.keys())this.used.has(e)||this.made.delete(e);this.used.clear()}make(e,t,n,r){let i=this.options.fields(),a=`${t}~${n.getTime()}`;this.used.add(a);let o=k(()=>({...e,[i.start]:n,[i.end]:r})),s=this.made.get(a);if(!s)return s={...o},this.info.set(s,{series:e,start:n,id:a}),this.made.set(a,s),s;this.info.get(s).series=e;for(let[e,t]of Object.entries(o)){let n=s[e];(n instanceof Date&&t instanceof Date?n.getTime()!==t.getTime():n!==t)&&(s[e]=t)}return s}};function on(e){let t=[...e].sort((e,t)=>e.first-t.first||t.last-t.first-(e.last-e.first)||e.order-t.order||(e.id<t.id?-1:1)),n=[],r=new Map;for(let e of t){let t=n.findIndex(t=>t<e.first);t<0&&(t=n.push(-1)-1),n[t]=e.last,r.set(e.id,t)}return r}function sn(e){let t=[...e].sort((e,t)=>e.start-t.start||t.end-t.start-(e.end-e.start)||e.order-t.order||(e.id<t.id?-1:1)),n=[],r=new Map;for(let e of t){let t=Math.max(e.end,e.start+1e-6),i=n.findIndex(t=>t<=e.start);i<0&&(i=n.push(0)-1),n[i]=t,r.set(e.id,i)}return{lanes:r,count:n.length}}var cn=(e,t)=>e.start<t.end&&t.start<e.end;function ln(e){let t=[...e].sort((e,t)=>e.start-t.start||t.end-t.start-(e.end-e.start)||(e.id<t.id?-1:+(e.id>t.id))),n=new Map,r=[],i=[],a=-1/0,o=()=>{for(let e of r){let t=n.get(e.id);t.columns=i.length;let r=1;for(let n=t.column+1;n<i.length&&!i[n].some(t=>cn(t,e));n++)r++;t.spread=r}r=[],i=[]};for(let e of t){e.start>=a&&(o(),a=-1/0);let t=i.findIndex(t=>t[t.length-1].end<=e.start);t<0&&(t=i.push([])-1),i[t].push(e),r.push(e),n.set(e.id,{column:t,columns:0,spread:1}),a=Math.max(a,e.end)}return o(),n}var un=864e5;function dn(e,t){let n=F(e);return P(n,-((n.getDay()-t+7)%7))}function fn(e){let t=Math.max(1,Math.round(e.intervalCount));switch(e.type){case`day`:case`timelineDay`:return{unit:`day`,count:t};case`agenda`:return{unit:`day`,count:Math.max(1,Math.round(e.agendaDuration??7))};case`month`:case`timelineMonth`:return{unit:`month`,count:t};default:return{unit:`week`,count:t}}}function pn(e,t){return Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()))/un)}function mn(e,t,n){let{unit:r,count:i}=fn(e),a=e.startDate instanceof Date&&!Number.isNaN(e.startDate.getTime())&&(i>1||e.type===`agenda`)?e.startDate:null;if(r===`month`){let e=new Date(t.getFullYear(),t.getMonth(),1);if(!a)return e;let n=new Date(a.getFullYear(),a.getMonth(),1),r=(e.getFullYear()-n.getFullYear())*12+e.getMonth()-n.getMonth();return ke(n,Math.floor(r/i)*i)}if(r===`week`){let e=dn(t,n);if(!a)return e;let r=dn(a,n);return P(r,Math.floor(pn(r,e)/7/i)*i*7)}let o=F(t);if(!a)return o;let s=F(a);return P(s,Math.floor(pn(s,o)/i)*i)}function hn(e,t,n,r){let{unit:i,count:a}=fn(e),o=mn(e,t,n),s=[];if(i===`day`)for(let e=0;e<a;e++)s.push(P(o,e));else if(i===`week`){let t=e.type===`workWeek`||e.type===`timelineWorkWeek`;for(let e=0;e<7*a;e++){let n=P(o,e);(!t||r.includes(n.getDay()))&&s.push(n)}if(!s.length)for(let e=0;e<7*a;e++)s.push(P(o,e))}else if(e.type===`timelineMonth`){let e=ke(o,a);for(let t=o;t<e;t=P(t,1))s.push(t)}else{let e=ke(o,a),t=dn(o,n);for(;t<e||s.length%7;)s.push(t),t=P(t,1)}return s}function gn(e,t,n){let{unit:r,count:i}=fn(e),a=mn(e,t,0);return r===`month`?ke(new Date(a.getFullYear(),a.getMonth(),1),i*n):r===`week`?P(F(t),7*i*n):P(e.startDate&&(i>1||e.type===`agenda`)?a:F(t),i*n)}var X=864e5,Z=6e4,_n=2e3,vn=[`groups`,`days`,`slots`,`ticks`,`rows`,`blocks`,`collect`,`layout`],yn=class{options;state;occurrences;timedCache=new Map;stripCache=new Map;headCache=new Map;lineCache=new Map;agendaCache=new Map;agendaDays=new Map;ids=new WeakMap;fieldsNow=null;shape=``;kindsNow=null;timedRaw={pieces:[],columns:[]};shownRaw=[];written=new Map;rowPieces=new WeakMap;rowMarks=new WeakMap;zoneNow=null;nextId=0;everything=0;touched=new WeakMap;stops=[];dirty=vn.length;queued=!1;viewNow=null;started=!1;listeners=new Set;base=[];baseById=new Map;buckets={revision:-1,groups:``,byGroup:[]};groupsCache=new WeakMap;groupIndex={key:``,version:0,keys:new Map};laid={revision:-1,settings:``,draft:null};constructor(e){this.options=e,this.occurrences=new an({fields:()=>this.fields(),zone:()=>this.zone,idOf:e=>this.idOf(e)}),this.state={now:Date.now(),days:[],groups:[],columns:[],dates:[],heads:[],slots:[],timed:[],allDay:{index:0,days:[],columns:[],pieces:[],more:[],moreAt:[],lanes:0},weeks:[],focus:{column:0,slot:0},anchor:null,ticks:[],rows:[],upper:[],lower:[],agenda:[],window:{first:0,count:16},revision:0,look:0,shownVersion:0,changes:0,refreshed:0}}start(){if(this.started)return;this.started=!0;let e=this.options.resources;e&&(this.stops.push(e.follow()),this.stops.push(e.onChanged(()=>this.update(`groups`)))),this.dirty=0,this.flush()}dispose(){this.started=!1;for(let e of this.stops.splice(0))e()}update(e=`groups`){this.viewNow=null,this.dirty=Math.min(this.dirty,vn.indexOf(e)),!this.queued&&this.started&&(this.queued=!0,queueMicrotask(()=>{this.queued=!1,this.flush()}))}flush(){if(!this.started||this.dirty>=vn.length)return;let e=this.dirty;this.dirty=vn.length,k(()=>{for(let t=e;t<vn.length;t++)this.work(vn[t])}),this.tell(`layout`)}onChanged(e){return this.listeners.add(e),()=>this.listeners.delete(e)}tell(e){for(let t of[...this.listeners])t(e)}work(e){switch(e){case`groups`:return this.fillGroups();case`days`:return this.fillDays();case`slots`:return this.fillSlots();case`ticks`:return this.fillTicks();case`rows`:return this.fillRows();case`blocks`:return this.fillBlocks();case`collect`:return this.collect();case`layout`:return this.layout()}}setNow(e){let t=this.todayWall();this.state.now=e,this.todayWall()===t?this.tell(`now`):this.update(`days`)}refresh(e=null){let t=e===null?null:this.occurrences.infoOf(e)?.series??e;typeof t==`object`&&t?this.touched.set(t,(this.touched.get(t)??0)+1):(this.everything++,this.state.refreshed++),this.state.changes++,this.update(t===null?`blocks`:`collect`)}shown(){return this.state.shownVersion,this.shownRaw}itemOf(e){return e.version,this.written.get(e.id).item}versionOf(e){let t=this.occurrences.infoOf(e)?.series??e;return this.everything+(typeof t==`object`&&t?this.touched.get(t)??0:0)}get view(){return this.viewNow||(this.viewNow=this.options.view(),queueMicrotask(()=>this.viewNow=null)),this.viewNow}get kind(){return G(this.view.type)}get zone(){return this.zoneNow??this.options.zone?.()??R.local}fields(){return this.fieldsNow??this.options.fields()}get virtual(){let e=this.view.scrolling??`auto`;if(e!==`auto`)return e===`virtual`;let t=this.kind;return t===`timeline`?this.state.rows.length*this.state.ticks.length>_n:t===`time`&&this.state.columns.length*Math.max(1,this.state.slots.length)>_n}setWindow(e,t){let n=Math.max(0,Math.floor(e)),r=Math.max(1,Math.ceil(t)),i=this.state.window;(i.first!==n||i.count!==r)&&(this.state.window={first:n,count:r},this.tell(`window`))}shownColumns(){let e=this.state.columns;if(this.kind!==`time`||!this.virtual)return e;let{first:t,count:n}=this.state.window;return e.slice(t,t+n)}columnsShown(e,t){if(this.kind!==`time`||!this.virtual)return!0;let{first:n,count:r}=this.state.window;return e<n+r&&e+t>n}shownTimed(){let e=this.state.timed;if(this.kind!==`time`||!this.virtual)return e;let{first:t,count:n}=this.state.window,{pieces:r,columns:i}=this.timedRaw;return r.filter((e,r)=>i[r]>=t&&i[r]<t+n)}shownHeads(e){if(this.kind!==`time`||!this.virtual)return e;let{first:t,count:n}=this.state.window,r=0,i=e.length;for(;r<i;){let n=r+i>>1;e[n].first+e[n].span<=t?r=n+1:i=n}let a=r;for(;a<e.length&&e[a].first<t+n;)a++;return e.slice(r,a)}shownTicks(){let e=this.state.ticks;if(!this.virtual)return e;let{first:t,count:n}=this.state.window;return e.slice(t,t+n)}ticksShown(e,t){if(!this.virtual)return!0;let{first:n,count:r}=this.state.window;return e<n+r&&e+t>n}nowTick(){let e=this.todayWall(),t=this.state.days.findIndex(t=>t.wall===e);if(t<0)return null;let n=(this.zone.wall(this.state.now)-e)/Z;if(K(this.view.type))return t+n/1440;let{from:r,to:i,step:a}=this.hours();return n<r||n>i?null:t*this.state.slots.length+(n-r)/a}hours(){let e=this.view,t=Math.max(0,Math.min(24,e.startDayHour))*60;return{from:t,to:Math.max(t/60+1,Math.min(24,e.endDayHour))*60,step:Math.max(5,Math.min(240,Math.round(e.cellDuration)))}}get grouped(){return this.state.groups.length>0}get datesFirst(){return this.state.groups.length>0&&(this.view.groupByDate||this.state.days.length===1)}get perRow(){return this.view.type===`month`?7*Math.max(1,this.state.groups.length):this.state.columns.length}range(){let e=this.state.days,t=this.zone;if(!e.length){let e=R.wallOfLocal(F(this.options.date()));return{start:t.date(e),end:t.date(e+X)}}return{start:e[0].date,end:t.date(e[e.length-1].wall+X)}}today(){return this.zone.moment(this.todayWall())}todayWall(){return Math.floor(this.zone.wall(this.state.now)/X)*X}todayColumns(){return this.shownColumns().filter(e=>e.day.today)}nowAt(){let e=this.view,t=(this.zone.wall(this.state.now)-this.todayWall())/Z,n=e.startDayHour*60,r=e.endDayHour*60;return t<n||t>r?null:(t-n)/(r-n)}idOf(e){let t=this.occurrences.infoOf(e);if(t)return t.id;let n=C(e,this.fields().key);if(n!=null)return`k${String(n)}`;let r=e,i=this.ids.get(r);return i||this.ids.set(r,i=`o${this.nextId++}`),i}timeOf(e){let t=this.fields(),n=W(C(e,t.start));if(!n)return null;let r=W(C(e,t.end))??n,i=!!C(e,t.allDay),a=r<n?n:r;if(!i)return{start:n,end:a,allDay:i};let o=this.zone,s=R.wallOfLocal(F(n)),c=R.wallOfLocal(F(a));return{start:o.date(s),end:o.date(c===R.wallOfLocal(a)&&a>n?c:c+X),allDay:i}}occurrenceOf(e){return this.occurrences.infoOf(e)}seriesOf(e){let t=this.occurrences.infoOf(e);if(t)return t.series;if(this.occurrences.ruleOf(e))return e;let n=this.options.fields(),r=C(e,n.recurrenceId);return r==null||r===``?null:M(this.options.items()).find(e=>C(e,n.key)===r)??null}isException(e){let t=C(e,this.fields().recurrenceId);return!this.occurrences.infoOf(e)&&t!=null&&t!==``}appointmentsIn(e,t,n=null){return this.entries(e,t).filter(e=>!n||bn(e.values,n)).map(e=>e.item)}groupOf(e){return this.state.columns[e]?.group??null}movedValues(e,t,n){if(!n||!t||n===t)return null;let r=this.options.resources,i={};for(let[a,o]of Object.entries(n.values)){let n=t.values[a];if(J(n,o))continue;let s=r?.kind(a),c=C(e,a);if(s?.multiple||Array.isArray(c)){let e=Array.isArray(c)?M(c):c==null||c===``?[]:[c],t=e.filter(e=>!J(e,n)&&!J(e,o)),r=e.findIndex(e=>J(e,n));t.splice(r<0?t.length:Math.min(r,t.length),0,o),i[a]=t}else i[a]=o}return Object.keys(i).length?i:null}check(e,t,n,r,i=null){let a=k(()=>({...e,...i??{}})),o=this.options.resources?.allValuesOf(a)??{},s={};for(let e of Object.keys(o))s[e]=a[e];let c=this.zone,l=c.wall(t),u=Math.max(l,c.wall(n)),d=this.state.groups.filter(e=>bn(o,e)),f=this.idOf(e),p=this.range(),m=(this.state.days.length&&t>=p.start&&n<=p.end?this.base:this.entries(t,n)).filter(e=>!e.draft&&e.id!==f&&e.start<n&&t<e.end).filter(e=>!this.grouped||d.some(t=>bn(e.values,t))).map(e=>e.item),h=Math.max(u,l+1),g=k(()=>$t(this.options.blockedTimes?.()??[],l,h,c).filter(e=>e.start<h&&e.end>l&&xn(e.block,o)).map(e=>e.block)),_=this.offHours(l,u,r,o,d),v={appointment:e,start:t,end:n,allDay:r,resources:s,overlapping:m,blocked:[...new Set(g)],offHours:_},y=this.options.allowOverlap?.()??!0;if(typeof y==`function`)return{free:!!y(v),check:v};let b=this.options.allowOffHours?.()??!0;return{free:!v.blocked.length&&(b||!_)&&(y||!m.length),check:v}}offHours(e,t,n,r,i){let a=this.options.workHours?.()??{start:9,end:17},o=this.options.workDays(),s;if(this.grouped&&i.length)s=i.map(e=>({start:e.workStart,end:e.workEnd,days:e.workDays}));else{s=[];for(let e of this.options.resources?.kinds()??[])for(let t of r[e.field]??[]){let n=e.workOf(e.find(t));(n.start!==void 0||n.end!==void 0||n.days)&&s.push({start:n.start??a.start,end:n.end??a.end,days:n.days??o})}s.length||(s=[{...a,days:o}])}let c=t>e?t-1:e;return s.some(r=>{for(let i=Math.floor(e/X)*X;i<=c;i+=X){if(!r.days.includes(new Date(i).getUTCDay()))return!0;if(n)continue;let a=Math.max(e,i),o=Math.min(Math.max(t,e),i+X);if(a<i+r.start*36e5||o>i+r.end*36e5)return!0}return!1})}cellOf(e){let t=this.state.columns[e.column];if(!t)return null;let n=t.day,r=this.zone,i=this.state.slots[e.slot],a=t.group?{...t.group.values}:null;return e.slot<0||K(this.view.type)||!i?{start:n.date,end:r.date(n.wall+X),allDay:!0,resources:a}:{start:r.date(n.wall+i.minutes*Z),end:r.date(n.wall+(i.minutes+this.view.cellDuration)*Z),allDay:!1,resources:a}}selection(){let e=this.state.anchor;if(!e)return null;let t=this.state.focus,n=this.cellOf(e),r=this.cellOf(t);if(!n||!r)return null;let i=this.state.columns;if(n.allDay||r.allDay){let r=Math.min(i[e.column].day.wall,i[t.column].day.wall),a=Math.max(i[e.column].day.wall,i[t.column].day.wall);return{start:this.zone.date(r),end:this.zone.date(a+X),allDay:!0,resources:n.resources}}return n.start<=r.start?{start:n.start,end:r.end,allDay:!1,resources:n.resources}:{start:r.start,end:n.end,allDay:!1,resources:n.resources}}isSelected(e,t){let n=this.selection();if(!n)return!1;let r=this.state.anchor;if(r&&this.groupOf(r.column)!==this.groupOf(e))return!1;let i=this.cellOf({column:e,slot:t});return!i||n.allDay!==i.allDay?!1:i.start>=n.start&&i.end<=n.end}blockAt(e,t){let n=this.state.columns[e];if(!n)return null;if(t<0||K(this.view.type))return n.blocked?n.blocks.find(e=>e.from<=0&&e.to>=1440)??null:null;let r=this.state.slots[t];if(!r)return null;let i=r.minutes+this.view.cellDuration;return n.blocks.find(e=>e.from<i&&e.to>r.minutes)??null}focusCell(e,t=!1){let n=this.state.columns.length,r=this.state.slots.length,i=K(this.view.type),a=Math.max(0,Math.min(n-1,e.column)),o=i?-1:Math.max(this.view.allDayPanel&&this.kind===`time`?-1:0,Math.min(r-1,e.slot)),s=t&&this.state.anchor?this.state.anchor:{column:a,slot:o};this.state.focus={column:a,slot:o},this.state.anchor=s,this.tell(`focus`)}clearSelection(){this.state.anchor&&(this.state.anchor=null,this.tell(`focus`))}fillGroups(){let e=this.options.view(),t=this.options.resources,n=this.options.workHours?.()??{start:9,end:17},r=tn(e.groups.map(e=>t?.kind(e)).filter(e=>!!e),{...n,days:M(this.options.workDays())});k(()=>{let e=this.state.groups;r.forEach((t,n)=>{let r={index:n,...t};n<e.length?Tn(e[n],r):e.push(r)}),e.length>r.length&&e.splice(r.length)})}fillDays(){let e=this.options.view(),t=this.options.date(),n=hn(e,t,this.options.firstDayOfWeek(),this.options.workDays()),r=this.options.workDays(),i=this.options.isHoliday(),a=this.options.workHours?.()??{start:9,end:17},o=this.state.groups.slice();for(let e of o)e.key,e.path;let s=this.todayWall(),c=this.zone,l=e.type===`month`?t.getMonth():-1,u=new Set;if(e.type===`month`)for(let t=0;t<Math.max(1,e.intervalCount);t++)u.add((l+t)%12);k(()=>{let d=this.state.days,f=this.state.columns[this.state.focus.column],p=f?.day.local.getTime(),m=f?.group?.key??``;n.forEach((e,t)=>{let n=R.wallOfLocal(e),a={index:t,date:c.date(n),local:e,wall:n,today:n===s,past:n<s,work:r.includes(e.getDay()),weekend:e.getDay()===0||e.getDay()===6,holiday:!!i?.(e),outside:l>=0&&!u.has(e.getMonth())};t<d.length?wn(d[t],a):d.push(a)}),d.length>n.length&&d.splice(n.length),this.fillColumns(e,o,a,r),this.fillWeeks();let h=this.state.columns,g=(e,t)=>h.findIndex(n=>n.day.local.getTime()===e&&(n.group?.key??``)===t),_=p===void 0?-1:g(p,m),v=g(F(t).getTime(),m),y=v>=0?v:h.findIndex(e=>e.day.local.getTime()===F(t).getTime()),b=this.state.focus,x=_>=0?_:y>=0?y:Math.max(0,Math.min(b.column,h.length-1)),S=K(e.type)?-1:G(e.type)===`timeline`?Math.max(0,b.slot):b.slot;(x!==b.column||S!==b.slot)&&(this.state.focus={column:x,slot:S});let C=this.state.anchor;C&&C.column>=h.length&&(this.state.anchor=null),this.state.look++})}fillColumns(e,t,n,r){let i=this.state.days,a=G(e.type),o=e.groupByDate&&(a===`time`||a===`month`),s=e.type===`month`,c=t.length?t:[null],l=s?Math.ceil(i.length/7):1,u=s?7:i.length,d=[];for(let e=0;e<l;e++){let t=i.slice(e*u,e*u+u),a=o?t.flatMap(e=>c.map(t=>[e,t])):c.flatMap(e=>t.map(t=>[t,e]));a.forEach(([e,t],i)=>{let s=i>0?a[i-1]:null;d.push({index:d.length,day:e,group:t,edge:s?Cn(s,[e,t],o):``,work:(t?t.workDays:r).includes(e.local.getDay()),workStart:t?t.workStart:n.start,workEnd:t?t.workEnd:n.end,label:t?t.path.map(e=>e.text).join(`, `):``})})}let f=[a,o,i.length,c.map(e=>e?.key??``).join(`,`)].join(`|`),p=f!==this.shape;this.shape=f,p&&(this.state.columns=d.map(e=>({...e,blocks:[],blocked:!1})));let m=this.state.columns;p||(d.forEach((e,t)=>{t<m.length?wn(m[t],e):m.push({...e,blocks:[],blocked:!1})}),m.length>d.length&&m.splice(d.length)),a===`time`||a===`month`?this.fillHeads(m.slice(0,s?7*c.length:m.length),t.length?e.groups.length:0,o||!s&&i.length===1):this.fillHeads([],0,!1)}fillHeads(e,t,n){let r=[],i=t=>{let n=[];return e.forEach((r,i)=>{let a=n[n.length-1];a&&t(e[a.first],r)?a.span++:n.push({first:i,span:1})}),n};for(let t of n?i((e,t)=>e.day===t.day):e.map((e,t)=>({first:t,span:1}))){let n=e[t.first];r.push({key:`d${t.first}`,...t,level:-1,edge:n.edge,day:n.day,resource:null,values:n.group?{...n.group.values}:{}})}this.state.dates.length===r.length?En(this.state.dates,r):this.state.dates=r;let a=[],o=this.options.resources,s=new Set;for(let r=0;r<t;r++){let t=i((e,t)=>(!n||e.day===t.day)&&e.group.path.slice(0,r+1).every((e,n)=>J(e.value,t.group.path[n].value))).map(t=>{let i=e[t.first],a=i.group.path.slice(0,r+1),o={};for(let e of a)o[e.field]=e.value;let c=`g${r}:${a.map(e=>`${e.field}=${String(e.value)}`).join(`|`)}${n?`@${i.day.index}`:``}`;s.add(c);let l={key:c,...t,level:r,edge:i.edge,day:n?i.day:null,resource:a[r],values:o},u=this.headCache.get(c);if(u&&Dn(`resource`,u.resource,l.resource)){for(let e of[`first`,`span`,`edge`,`day`])u[e]!==l[e]&&(u[e]=l[e]);return u}let d=l;return this.headCache.set(c,d),d}),c=e[0]?.group?.path[r]?.field??``;a.push({level:r,label:o?.kind(c)?.label??c,cells:t})}for(let e of this.headCache.keys())s.has(e)||this.headCache.delete(e);let c=this.state.heads;a.forEach((e,t)=>{if(t<c.length){let n=c[t];n.level!==e.level&&(n.level=e.level),n.label!==e.label&&(n.label=e.label),(n.cells.length!==e.cells.length||n.cells.some((t,n)=>t!==e.cells[n]))&&(n.cells=e.cells)}else c.push(e)}),c.length>a.length&&c.splice(a.length)}fillWeeks(){let e=this.state.days,t=this.state.weeks,n=this.view.type===`month`?Math.ceil(e.length/7):0,r=7*Math.max(1,this.state.groups.length),i=this.state.columns;for(let a=0;a<n;a++){let n=e.slice(a*7,a*7+7),o=i.slice(a*r,a*r+r);a<t.length?(t[a].days=n,t[a].columns=o):t.push({index:a,days:n,columns:o,pieces:[],more:[],moreAt:[],lanes:0})}t.length>n&&t.splice(n);let a=G(this.view.type)===`time`;this.state.allDay.days=a?e.slice():[],this.state.allDay.columns=a?i.slice():[]}fillSlots(){let e=this.options.view(),t=Math.max(0,Math.min(24,e.startDayHour))*60,n=Math.max(t/60+1,Math.min(24,e.endDayHour))*60,r=Math.max(5,Math.min(240,Math.round(e.cellDuration)));k(()=>{let e=this.state.slots,i=0;for(let a=t;a<n;a+=r,i++){let n={index:i,minutes:a,hourStart:a%60==0||a===t};i<e.length?wn(e[i],n):e.push(n)}e.length>i&&e.splice(i),this.state.focus.slot>=i&&(this.state.focus={column:this.state.focus.column,slot:i-1}),this.state.look++})}fillTicks(){let e=this.options.view(),t=G(e.type),n=this.state.days.map(e=>e),r=this.state.slots.map(e=>({minutes:e.minutes,hourStart:e.hourStart}));k(()=>{let i=[];if(t===`timeline`){let t=K(e.type);for(let e of n)t?i.push({day:e,slot:-1,minutes:0,hourStart:!0,dayStart:!1}):r.forEach((t,n)=>i.push({day:e,slot:n,minutes:t.minutes,hourStart:t.hourStart,dayStart:n===0}))}Mn(this.state.ticks,i.map((e,t)=>({index:t,...e})));let a=[],o=[];if(t===`timeline`&&K(e.type))n.forEach((e,t)=>{let n=a[a.length-1];n&&n.day.local.getMonth()===e.local.getMonth()&&n.day.local.getFullYear()===e.local.getFullYear()?n.span++:a.push({key:`m${t}`,first:t,span:1,kind:`month`,day:e,minutes:0,dayStart:!0}),o.push({key:`d${t}`,first:t,span:1,kind:`day`,day:e,minutes:0,dayStart:!0})});else if(t===`timeline`){let e=r.length;n.forEach((t,n)=>{a.push({key:`d${n}`,first:n*e,span:e,kind:`day`,day:t,minutes:0,dayStart:!0}),r.forEach((r,i)=>{let a=o[o.length-1];!r.hourStart&&a&&a.day===t?a.span++:o.push({key:`h${n*e+i}`,first:n*e+i,span:1,kind:`hour`,day:t,minutes:r.minutes,dayStart:i===0})})})}Mn(this.state.upper,a),Mn(this.state.lower,o),this.state.look++})}fillRows(){let e=G(this.options.view().type)===`timeline`,t=e?this.state.groups.map(e=>e):[];for(let e of t)e.key,e.path;let n=this.state.days.length;k(()=>{let r=e?t.length?t:[null]:[],i=this.state.rows;r.forEach((e,t)=>{let a=t>0?r[t-1]:null,o=e?.path??[],s=o.map((e,t)=>!a||o.slice(0,t+1).some((e,t)=>!J(e.value,a.path[t]?.value))),c=a?s[0]?`outer`:`inner`:``,l={index:t,key:e?.key??``,group:e,first:(e?.index??0)*n,edge:c,label:o.map(e=>e.text).join(`, `)};if(t<i.length){let e=i[t];wn(e,l),e.starts.join()!==s.join()&&(e.starts=s)}else i.push({...l,starts:s,pieces:[],lanes:0,height:0,more:[],moreLane:0})}),i.length>r.length&&i.splice(r.length)})}fillBlocks(){let e=this.options.view(),t=this.options.blockedTimes?.()??[];if(this.state.refreshed,!k(()=>t.length)){this.state.columns.length,k(()=>{for(let e of this.state.columns)e.blocked&&=!1,e.blocks.length&&(e.blocks=[]);this.state.look++});return}let n=this.state.columns.map(e=>e);for(let e of n)e.day.wall,e.group;let r=this.state.days.map(e=>e.wall);if(!r.length)return;let i=$t(t,r[0],r[r.length-1]+X,this.zone);k(()=>{this.placeBlocks(n,i,e),this.state.look++})}collect(){let e=this.state.days.map(e=>e.wall);this.state.changes;for(let e of this.options.resources?.kinds()??[])e.useColorAsDefault,e.items;let t=this.zone,n=e.length?this.read(t.date(e[0]),t.date(e[e.length-1]+X),null):[];k(()=>{this.base=n,this.baseById=new Map(n.map(e=>[e.id,e])),this.occurrences.sweep(),this.state.revision++})}layout(){let e=this.options.view(),t=G(e.type),n=this.state.revision,r=t===`timeline`?[]:this.state.columns.map(e=>e);for(let e of r)e.day.wall,e.group;let i=this.state.columns.length,a=this.state.slots.length,o=this.state.days.map(e=>e.wall),s=this.state.groups.map(e=>e);for(let e of s)e.key;let c=this.options.draft?.()??null,l=this.options.room(),u=this.options.overlapMode(),d=t===`timeline`?this.state.rows.map(e=>e):[],f=t===`timeline`?this.state.ticks.length:0,p=t===`timeline`?this.options.lineMetrics?.()??{lane:0,gap:0,min:0}:null;for(let e of this.options.resources?.kinds()??[])e.useColorAsDefault,e.items;if(!o.length||!i)return;let m=this.options.resources?.kinds()??null;k(()=>{this.kindsNow=m;let i=c&&!c.copy?this.idOf(c.item):null,h=c?this.draftEntry(c):null,g={from:o[0],to:o[o.length-1]+X},_=this.base.filter(e=>e.id!==i),v=!!h&&h.ws<g.to&&(h.we>g.from||h.we===h.ws&&h.ws>=g.from);h&&v&&_.splice(An(_,h),0,h),s.length&&this.indexGroups(s);let y=this.byGroup(s,e,i,v?h:null),b=e=>e?y[e.index]??[]:_,x=new Set;if(t===`timeline`){this.state.timed=[],this.placeStrip(this.state.allDay,()=>[],x,l.allDay,e);let t=[e.type,e.startDayHour,e.endDayHour,e.cellDuration,e.maxAppointmentsPerCell,f,a,d.length,p.lane,p.gap,p.min,o[0],s.length].join(`|`),r=this.laid,c=null;if(r.revision===n&&r.settings===t){c=new Set;for(let t of[r.draft,v?h:null,i?this.baseById.get(i)??null:null])if(t){if(!s.length)c.add(0);else for(let n of this.groupsOf(t,s,e))c.add(n)}}this.laid={revision:n,settings:t,draft:v?h:null};for(let n of d){if(c&&!c.has(n.index))continue;let r=b(n.group),i=this.markOf(n,r),a=this.rowMarks.get(n);!c&&a&&a.settings===t&&a.mark===i&&jn(a.items,r.map(e=>e.item))||(this.placeLine(n,r,e,p),this.rowMarks.set(n,{settings:t,mark:i,items:r.map(e=>e.item)}))}this.clearAgenda()}else{this.laid={revision:-1,settings:``,draft:null};let n=new Set;if(t===`agenda`)this.state.timed=[],this.placeStrip(this.state.allDay,()=>[],x,l.allDay,e),this.placeAgenda(s.length?s:[null],b);else if(e.type===`month`)this.state.timed=[],this.placeStrip(this.state.allDay,()=>[],x,l.allDay,e),this.state.weeks.forEach(t=>this.placeStrip(t,b,x,l.month,e)),this.clearAgenda();else{let t=t=>e.allDayPanel&&(t.allDay||t.we-t.ws>=X),i=new Map,a=e=>{let n=i.get(e);if(!n){let r=b(e);i.set(e,n={strip:r.filter(t),timed:r.filter(e=>!t(e))})}return n};this.placeStrip(this.state.allDay,e=>a(e).strip,x,l.allDay,e);let o=new Map,s=[],c=[];for(let t of r)for(let r of this.placeColumn(t,a(t.group).timed,e,u,n,o))s.push(r),c.push(t.index);this.timedRaw={pieces:s,columns:c},this.state.timed=s,this.clearAgenda()}for(let e of this.timedCache.keys())n.has(e)||this.drop(this.timedCache,e);this.clearLines()}for(let e of this.stripCache.keys())x.has(e)||this.drop(this.stripCache,e);let S=s.length>0,C=_.filter(t=>!t.draft&&(!S||this.groupsOf(t,s,e).length>0)).map(e=>e.item);jn(this.shownRaw,C)||(this.shownRaw=C,this.state.shownVersion++),this.kindsNow=null})}byGroup(e,t,n,r){if(!e.length)return[];let i=this.indexGroups(e);if(this.buckets.revision!==this.state.revision||this.buckets.groups!==i){let n=e.map(()=>[]);for(let r of this.base)for(let i of this.groupsOf(r,e,t))n[i].push(r);this.buckets={revision:this.state.revision,groups:i,byGroup:n}}let a=this.buckets.byGroup,o=n?this.baseById.get(n):void 0;if(!o&&!r)return a;let s=a.slice(),c=r?this.groupsOf(r,e,t):[];for(let i of new Set([...o?this.groupsOf(o,e,t):[],...c])){let e=(a[i]??[]).filter(e=>e.id!==n);r&&c.includes(i)&&e.splice(An(e,r),0,r),s[i]=e}return s}indexGroups(e){let t=e.map(e=>e.key).join(`#`);return t!==this.groupIndex.key&&(this.groupIndex={key:t,version:this.groupIndex.version+1,keys:new Map(e.map(e=>[e.key,e.index]))}),t}groupsOf(e,t,n){let r=this.groupIndex.version,i=this.groupsCache.get(e);if(i&&i.version===r&&this.groupIndex.keys.size===t.length)return i.list;let a=t[0]?.path.map(e=>e.field)??n.groups;if(a.length===1){let t=[];for(let n of e.values[a[0]]??[]){let e=this.groupIndex.keys.get(`${a[0]}=${String(n)}`);e!==void 0&&!t.includes(e)&&t.push(e)}return this.groupsCache.set(e,{version:r,list:t}),t}let o=[``];for(let t of a){let n=[];for(let r of o)for(let i of e.values[t]??[])n.push(`${r}${r?`|`:``}${t}=${String(i)}`);if(o=n,!o.length)break}let s=[];for(let e of o){let t=this.groupIndex.keys.get(e);t!==void 0&&!s.includes(t)&&s.push(t)}return this.groupsCache.set(e,{version:r,list:s}),s}placeBlocks(e,t,n){let r=new Set(n.groups);for(let n of e){if(!t.length){n.blocks.length&&(n.blocks=[]),n.blocked&&=!1;continue}let e=n.day.wall,i=t.filter(t=>t.start<e+X&&t.end>e&&Sn(t.block,n.group,r)).map(t=>({from:Math.max(0,(t.start-e)/Z),to:Math.min(1440,(t.end-e)/Z),text:t.block.text??``})),a=i.some(e=>e.from<=0&&e.to>=1440);(i.length||n.blocks.length)&&JSON.stringify(i)!==JSON.stringify(n.blocks)&&(n.blocks=i),n.blocked!==a&&(n.blocked=a)}}entries(e,t){return this.read(e,t,this.options.draft?.()??null)}read(e,t,n){let r=this.options.fields(),i=this.zone,a={fields:this.fieldsNow,zone:this.zoneNow};this.fieldsNow=r,this.zoneNow=i;try{return this.readWith(r,i,e,t,n)}finally{this.fieldsNow=a.fields,this.zoneNow=a.zone}}readWith(e,t,n,r,i){let a=this.options.resources,o=i&&!i.copy?this.idOf(i.item):null,s=(e,t)=>e<r&&(t>n||t.getTime()===e.getTime()&&e>=n),c=[],l=e=>{let n=this.timeOf(e);if(!n||!s(n.start,n.end))return;let r=this.idOf(e);r!==o&&c.push({id:r,item:e,...n,ws:t.wall(n.start),we:t.wall(n.end),draft:!1,invalid:!1,values:a?.allValuesOf(e)??{},...this.lookOf(e),version:this.versionOf(e)})};for(let t of M(this.options.items()))if(C(t,e.visible)!==!1){if(this.occurrences.ruleOf(t))for(let e of this.occurrences.of(t,n.getTime(),r.getTime()))l(e);else l(t)}return i&&s(i.start,i.end)&&c.push(this.draftEntry(i)),c.sort(kn)}draftEntry(e){let t=this.zone;return{id:this.idOf(e.item)+(e.copy?`~copy`:``),item:e.item,start:e.start,end:e.end,ws:t.wall(e.start),we:t.wall(e.end),allDay:e.allDay,draft:!0,invalid:e.invalid,values:this.options.resources?.allValuesOf(k(()=>({...e.item,...e.resources??{}})))??{},...this.lookOf(e.item),version:this.versionOf(e.item)}}lookOf(e){let t=this.fields(),n=C(e,t.text),r=C(e,t.color);return{text:n==null?``:String(n),color:typeof r==`string`?r:``,disabled:!!C(e,t.disabled),series:!!this.occurrences.infoOf(e),exception:this.isException(e)}}colorIn(e,t){return e.color||this.options.resources?.colorOf(e.values,t,this.kindsNow??void 0)||``}placeColumn(e,t,n,r,i,a){let o=this.zone,s=e.day.wall,c=e.group,l=s+X,u=o.date(s),d=o.date(l),f=n.startDayHour*60,p=n.endDayHour*60,m=p-f,h=[];for(let e of t){let t=e.we===e.ws;if(!(e.ws<l&&(e.we>s||t&&e.ws>=s)))continue;let r=e.start<u?u:e.start,i=e.end>d?d:e.end,a=(Math.max(e.ws,s)-s)/Z,o=Math.max((Math.min(e.we,l)-s)/Z,Math.min(1440,a+(i.getTime()-r.getTime())/Z)),c=Math.max(f,a),m=Math.min(p,o);if(c>p||m<f||c>=p&&!t)continue;let g=Math.min(30,n.cellDuration);h.push({id:e.id,start:c,end:Math.max(m,c+g),entry:e,s:r,e:i,last:m})}let g=ln(h),_=e=>Math.min(.25,.6/Math.max(1,e-1));return h.map(t=>{let n=g.get(t.id),o=t.last,u=r===`cascade`?n.column*_(n.columns):n.column/n.columns,d=r===`cascade`?1-u:n.spread/n.columns,p=a.get(t.id)??0;a.set(t.id,p+1);let h={id:`${t.id}@${p}`,column:e.index,group:c?.index??-1,start:t.s,end:t.e,top:(t.start-f)/m,height:Math.max(0,o-t.start)/m,left:u,width:d,before:t.entry.ws<s,after:t.entry.we>l,draft:t.entry.draft,invalid:t.entry.invalid,text:t.entry.text,color:this.colorIn(t.entry,c),disabled:t.entry.disabled,series:t.entry.series,exception:t.entry.exception};return i.add(h.id),this.keep(this.timedCache,h,t.entry)})}placeStrip(e,t,n,r,i){let a=e.columns,o=a.map(()=>0),s=a.map(()=>0),c=[],l=i.type===`month`?`m`:`a`,u=new Map;a.forEach((e,t)=>{let n=e.group,r=u.get(n);r?r.push({c:e,at:t}):u.set(n,[{c:e,at:t}])});for(let[a,d]of u){let u=d.map(e=>e.c.day.wall),f=[];if(u.length){let e=u[0],n=u[u.length-1]+X;t(a).forEach((t,r)=>{let i=t.we===t.ws;if(!(t.ws<n&&(t.we>e||i&&t.ws>=e)))return;let a=u.findIndex((e,n)=>t.ws<e+X&&(n===0||t.ws>=e)),o=i?t.we:t.we-1,s=u.length-1;for(let e=u.length-1;e>=0;e--)if(u[e]<=o){s=e;break}a<0||s<a||f.push({id:t.id,first:a,last:s,order:r,entry:t})})}let p=on(f),m=i.maxAppointmentsPerCell,h=u.map((e,t)=>{let n=0;for(let e of f)e.first<=t&&e.last>=t&&(n=Math.max(n,p.get(e.id)+1));return n}).map(e=>typeof m==`number`?e>m?Math.max(0,m):e:e>r?Math.max(0,r-1):e),g=u.map(()=>0);for(let t of f){let r=p.get(t.id),i=!1;for(let e=t.first;e<=t.last;e++)r>=h[e]&&(i=!0);if(i)for(let e=t.first;e<=t.last;e++)g[e]++;let o=t.entry,s=t.first;for(let f=t.first;f<=t.last;f++){if(f<t.last&&d[f+1].at===d[f].at+1)continue;let p=s===t.first?``:`/${s-t.first}`,m={id:`${t.id}#${e.index}${l}${a?`:${a.index}`:``}${p}`,first:d[s].at,span:f-s+1,group:a?.index??-1,lane:r,hidden:i,before:o.ws<u[s],after:o.we>u[f]+X,timed:!o.allDay&&On(o.ws,o.we),start:o.start,end:o.end,draft:o.draft,invalid:o.invalid,text:o.text,color:this.colorIn(o,a),disabled:o.disabled,series:o.series,exception:o.exception};n.add(m.id),c.push(this.keep(this.stripCache,m,o)),s=f+1}}d.forEach((e,t)=>{o[e.at]=g[t],s[e.at]=h[t]})}e.pieces=c,e.more=o,e.moreAt=s,e.lanes=Math.max(0,...s.map((e,t)=>e+ +(o[t]>0)))}markOf(e,t){let n=e.group,r=`${e.key}|${n?.index??-1}`;for(let e of t)r+=`|${e.id}~${e.ws}~${e.we}~${+e.allDay}${+e.draft}${+e.invalid}${+e.disabled}${+e.series}${+e.exception}~${e.version}~${e.text}~${this.colorIn(e,n)}`;return r}placeLine(e,t,n,r){let i=this.along(n),a=[];t.forEach((e,t)=>{let n=i(e);n&&a.push({id:e.id,start:n.from,end:n.to,order:t,entry:e,before:n.before,after:n.after})});let{lanes:o,count:s}=sn(a),c=typeof n.maxAppointmentsPerCell==`number`?Math.max(0,n.maxAppointmentsPerCell):1/0,l=this.state.days.length,u=K(n.type)?1:Math.max(1,this.state.slots.length),d=Array(l).fill(0),f=e.group,p=a.map(t=>{let n=o.get(t.id),r=n>=c;if(r)for(let e=Math.floor(t.start/u);e<Math.min(l,Math.ceil(t.end/u));e++)d[e]++;let i=t.entry,a={id:`${t.id}@r${e.index}`,group:f?.index??-1,start:i.start,end:i.end,allDay:i.allDay,from:t.start,span:t.end-t.start,lane:n,hidden:r,before:t.before,after:t.after,draft:i.draft,invalid:i.invalid,text:i.text,color:this.colorIn(i,f),disabled:i.disabled,series:i.series,exception:i.exception};return this.keep(this.lineCache,a,i)}),m=new Set(p.map(e=>e.id)),h=this.rowPieces.get(e)??[];for(let e of h)m.has(e.id)||this.drop(this.lineCache,e.id);let g=Math.min(s,c),_=g+ +!!d.some(e=>e>0);jn(h,p)||(e.pieces=p,this.rowPieces.set(e,p)),e.lanes!==_&&(e.lanes=_);let v=Math.max(r.min,r.gap+_*(r.lane+r.gap));e.height!==v&&(e.height=v);let y=d.map((e,t)=>({day:t,count:e})).filter(e=>e.count>0);e.more.map(e=>`${e.day}:${e.count}`).join()!==y.map(e=>`${e.day}:${e.count}`).join()&&(e.more=y),e.moreLane!==g&&(e.moreLane=g)}along(e){let t=this.state.days.map(e=>e.wall),n=t.length;if(K(e.type))return e=>{let r=e.we===e.ws,i=-1,a=-1;for(let o=0;o<n;o++)i<0&&t[o]+X>e.ws&&(i=o),(t[o]<e.we||r&&t[o]<=e.ws)&&(a=o);return i<0||a<i?null:{from:i,to:a+1,before:e.ws<t[i],after:e.we>t[a]+X}};let{from:r,to:i,step:a}=this.hours(),o=Math.max(1,this.state.slots.length),s=Math.min(30,a)/a,c=e=>t[e]+r*Z,l=e=>t[e]+i*Z,u=(e,n)=>e*o+((n-t[e])/Z-r)/a;return e=>{let t=e.we===e.ws,r=-1;for(let i=0;i<n;i++)if(l(i)>e.ws||t&&l(i)===e.ws){r=i;break}if(r<0)return null;let i=-1;for(let r=n-1;r>=0;r--)if(c(r)<e.we||t&&c(r)<=e.we){i=r;break}if(i<r)return null;let a=e.ws<c(r),d=e.we>l(i),f=a?r*o:u(r,e.ws),p=d?(i+1)*o:u(i,e.we);return p<f||p===f&&!t?null:{from:f,to:Math.max(p,f+s),before:a,after:d}}}placeAgenda(e,t){let n=this.zone,r=this.state.days,i=[],a=new Set,o=new Set;for(let s of e){let e=t(s),c=!0;for(let t of r){let r=t.wall+X,l=[];for(let i of e){let e=i.we===i.ws;if(!(i.ws<r&&(i.we>t.wall||e&&i.ws>=t.wall)))continue;let a=i.ws<t.wall,c=i.we>r,u={id:`${i.id}@a${t.index}${s?`:${s.index}`:``}`,group:s?.index??-1,start:a?n.date(t.wall):i.start,end:c?n.date(r):i.end,whole:i.allDay||i.ws<=t.wall&&i.we>=r,before:a,after:c,draft:i.draft,invalid:i.invalid,text:i.text,color:this.colorIn(i,s),disabled:i.disabled,series:i.series,exception:i.exception};o.add(u.id),l.push(this.keep(this.agendaCache,u,i))}if(!l.length)continue;l.sort((e,t)=>Number(t.whole)-Number(e.whole));let u=`${s?.key??``}@${t.index}`;a.add(u);let d={key:u,day:t,group:s,first:c,label:s?s.path.map(e=>e.text).join(`, `):``};c=!1;let f=this.agendaDays.get(u);f?(wn(f,d),jn(f.items,l)||(f.items=l)):(f={...d,items:l},this.agendaDays.set(u,f)),i.push(f)}}for(let e of this.agendaCache.keys())o.has(e)||this.drop(this.agendaCache,e);for(let e of this.agendaDays.keys())a.has(e)||this.agendaDays.delete(e);jn(this.state.agenda,i)||(this.state.agenda=i)}clearAgenda(){this.state.agenda.length&&(this.state.agenda=[]);for(let e of this.agendaCache.keys())this.written.delete(e);this.agendaCache.clear(),this.agendaDays.clear()}clearLines(){for(let e of this.state.rows)this.rowPieces.get(e)?.length&&(e.pieces=[],this.rowPieces.set(e,[]));for(let e of this.lineCache.keys())this.written.delete(e);this.lineCache.clear()}drop(e,t){e.delete(t),this.written.delete(t)}keep(e,t,n){let r=e.get(t.id);if(r){let e=this.written.get(r.id),i=e.values,a=r;for(let[e,n]of Object.entries(t)){let t=i[e];(t instanceof Date&&n instanceof Date?t.getTime()!==n.getTime():t!==n)&&(a[e]=n,i[e]=n)}return(e.item!==n.item||e.version!==n.version)&&(e.item=n.item,e.version=n.version,r.version++),r}let i={...t,version:0};return this.written.set(t.id,{values:{...t},item:n.item,version:n.version}),e.set(t.id,i),i}};function bn(e,t){for(let[n,r]of Object.entries(t.values))if(!(e[n]??[]).some(e=>J(e,r)))return!1;return!0}function xn(e,t){for(let[n,r]of Object.entries(e.resources??{})){let e=Array.isArray(r)?r:[r];if(!(t[n]??[]).some(t=>e.some(e=>J(t,e))))return!1}return!0}function Sn(e,t,n){for(let[r,i]of Object.entries(e.resources??{}))if(!t||!n.has(r)||!(Array.isArray(i)?i:[i]).some(e=>J(t.values[r],e)))return!1;return!0}function Cn([e,t],[n,r],i){if(!t||!r)return``;if(i)return e===n?`inner`:`outer`;if(t===r)return``;let a=r.path.findIndex((e,n)=>!J(e.value,t.path[n]?.value));return a<0?``:a===0?`outer`:`inner`}function wn(e,t){let n=e;for(let[e,r]of Object.entries(t)){let t=n[e];(t instanceof Date&&r instanceof Date?t.getTime()!==r.getTime():t!==r)&&(n[e]=r)}}function Tn(e,t){e.key===t.key&&e.path.every((e,n)=>e.text===t.path[n]?.text&&e.color===t.path[n]?.color)||(e.key=t.key,e.values=t.values,e.path=t.path);for(let n of[`index`,`workStart`,`workEnd`])e[n]!==t[n]&&(e[n]=t[n]);e.workDays.join()!==t.workDays.join()&&(e.workDays=t.workDays)}function En(e,t){t.forEach((t,n)=>{if(n<e.length){let r=e[n];for(let[e,n]of Object.entries(t))Dn(e,r[e],n)||(r[e]=n)}else e.push(t)}),e.length>t.length&&e.splice(t.length)}function Dn(e,t,n){if(t===n)return!0;if(!t||!n||typeof t!=`object`||typeof n!=`object`)return!1;if(e===`values`){let e=t,r=n;return Object.keys(e).length===Object.keys(r).length&&Object.keys(e).every(t=>J(e[t],r[t]))}if(e===`resource`){let e=t,r=n;return e.field===r.field&&J(e.value,r.value)&&e.text===r.text&&e.color===r.color}return!1}function On(e,t){return Math.floor(e/X)===Math.floor(Math.max(e,t-1)/X)}function kn(e,t){return e.start.getTime()-t.start.getTime()||t.end.getTime()-e.end.getTime()}function An(e,t){let n=0,r=e.length;for(;n<r;){let i=n+r>>1;kn(e[i],t)<=0?n=i+1:r=i}return n}function jn(e,t){return e.length===t.length&&e.every((e,n)=>e===t[n])}function Mn(e,t){t.forEach((t,n)=>{n<e.length?wn(e[n],t):e.push(t)}),e.length>t.length&&e.splice(t.length)}function Nn(e,t,n={}){let r=[{field:t.start,op:`<`,value:e.end},{or:[{field:t.end,op:`>=`,value:e.start},{field:t.recurrenceRule,op:`isnotblank`}]}],i=Object.entries(n.resources??{}).map(([e,t])=>({field:e,op:`in`,value:[...t]}));return{and:[...r,...i]}}var Q=e=>`top`in e,$=e=>`from`in e,Pn=class extends _{static elementTag=`div`;made=!1;piece;content=null;template=void 0;filledVersion=-1;placed=[];drawnItem=null;leaving=!1;parts={start:null,startGrip:null,end:null,endGrip:null,time:null,text:null,details:null,drop:null,mark:null};constructor(e){super(`div`,e),this.piece=e.piece}get host(){return this.props.host}show(e){this.piece=e,this.draw()}onDisposing(){this.leaving=!0}onConfigured(){this.class.add(`mx-scheduler__appointment`),this.attr.add({role:`button`}),t(this,`tabindex`,`0`);let e=this.host,n=this.press(`move`);this.motif.on(`pointerdown`,(e,t)=>n(t)),this.motif.on(`click`,(t,n)=>e.appointmentClick(this.piece,n)),this.motif.on(`dblclick`,(t,n)=>e.appointmentDblClick(this.piece,n)),this.motif.on(`keydown`,(t,n)=>e.appointmentKey(this.piece,n)),this.motif.on(`focusout`,(t,n)=>!this.leaving&&this.drawnItem!==null&&e.appointmentBlur(this.drawnItem,n));let r=this.parts,i=h(this,`div`,`mx-scheduler__resize`);i.attr.add({"data-edge":`start`,"aria-hidden":`true`});let a=this.press(`start`);i.motif.on(`pointerdown`,(e,t)=>a(t)),r.start=i,r.startGrip=h(i,`span`,`mx-scheduler__resize-grip`),this.content=h(this,`div`,`mx-scheduler__appointment-content`),this.fill();let o=h(this,`span`,`mx-glyph mx-scheduler__drop-mark`);o.attr.add({"aria-hidden":`true`}),r.drop=o;let s=h(this,`span`,`mx-glyph mx-scheduler__mark`);s.attr.add({"aria-hidden":`true`}),r.mark=s;let c=h(this,`div`,`mx-scheduler__resize`);c.attr.add({"data-edge":`end`,"aria-hidden":`true`});let l=this.press(`end`);c.motif.on(`pointerdown`,(e,t)=>l(t)),r.end=c,r.endGrip=h(c,`span`,`mx-scheduler__resize-grip`),this.made=!0,this.draw(),N(this,()=>this.draw()),this.motif.setDisposable(e.keepDrawn(()=>this.draw()))}fill(){let e=this.content;if(!e)return;let t=this.parts;e.controls.clear(),t.time=t.text=null;let n=this.host.template();this.template=n,this.filledVersion=this.piece.version,n?e.controls.add(n(this.templateContext())):(t.time=h(e,`span`,`mx-scheduler__appointment-time`),t.text=h(e,`span`,`mx-scheduler__appointment-text`)),t.details=h(e,`span`,`mx-sr-only`)}draw(){if(this.isDisposed||!this.made)return;(this.host.template()!==this.template||this.template&&this.piece.version!==this.filledVersion)&&this.fill();let{host:e,piece:n,parts:r}=this,a=this.item();this.drawnItem=a;let s=!!n.draft;t(this,`data-kind`,Q(n)?`timed`:$(n)?`line`:n.timed?`chip`:`bar`),t(this,`data-piece`,n.id),i(this,`data-before`,n.before),i(this,`data-after`,n.after),i(this,`data-short`,Q(n)&&n.end.getTime()-n.start.getTime()<=18e5),i(this,`data-past`,e.dimPast()&&n.end.getTime()<=e.model.state.now),i(this,`data-disabled`,n.disabled),i(this,`data-draft`,s),i(this,`data-lifted`,s&&e.liftedByTouch()),i(this,`data-selected`,!s&&e.touchSelected(a)),i(this,`data-invalid`,n.invalid),i(this,`data-copy`,s&&n.id.includes(`~copy`)),i(this,`data-saving`,e.isSaving(a)),i(this,`data-open`,e.isOpen(a)),i(this,`data-draggable`,e.canDrag(a)),i(this,`data-series`,n.series),i(this,`data-exception`,n.exception),i(this,`aria-disabled`,n.disabled);let c=this.place();for(let e of this.placed)e in c||o(this,e,``);for(let[e,t]of Object.entries(c))o(this,e,t);this.placed=Object.keys(c),f(this,Q(n)||!n.hidden);let l=this.resizable(),u=e.touchSelected(a);f(r.start,l&&!n.before),f(r.end,l&&!n.after),f(r.startGrip,u),f(r.endGrip,u),f(r.drop,!!n.invalid),f(r.mark,!!(e.recurrenceMarks()&&(n.series||n.exception))),r.mark&&t(r.mark,`data-mark`,n.exception?`exception`:`series`);let d=this.time();r.time&&(f(r.time,d!==``),E(r.time,d)),r.text&&E(r.text,n.text||e.text(`schedulerNoTitle`)),r.details&&E(r.details,this.details())}item(){return this.host.model.itemOf(this.piece)}allDay(){let e=this.piece;return $(e)?e.allDay:!Q(e)&&!e.timed}time(){let{host:e,piece:t}=this;return this.allDay()?``:!Q(t)&&!$(t)?e.format.time(t.start):$(t)&&!e.model.zone.sameDay(t.start,new Date(Math.max(t.start.getTime(),t.end.getTime()-1)))?`${e.format.time(t.start)} – ${e.format.time(t.end)}`:e.format.timeRange(t.start,t.end)}details(){let{host:e,piece:t}=this;return`, ${this.allDay()?e.format.range(`day`,t.start,t.end):`${e.format.fullDate(t.start)} ${e.format.timeRange(t.start,t.end)}`}${t.before||t.after?`, ${e.text(`schedulerContinues`)}`:``}${t.series?`, ${e.text(`schedulerRepeats`,{rule:e.recurrenceText(this.item())})}`:t.exception?`, ${e.text(`schedulerChanged`)}`:``}`}place(){let e=this.piece,t={"--_color":e.color??``};return Q(e)?{...t,"--_column":String(e.column),"--_left":String(e.left),"--_width":String(e.width),"inset-block-start":`${e.top*100}%`,"block-size":`${e.height*100}%`}:$(e)?{...t,"--_from":String(e.from),"--_span":String(e.span),"--_lane":String(e.lane)}:{...t,"grid-column":`${e.first+1} / span ${e.span}`,"grid-row":String(e.lane+1)}}resizable(){let e=this.piece;return!e.draft&&this.host.canResize(this.item())&&(Q(e)||$(e)||!e.timed)}press(e){return t=>{t.stopPropagation(),(e!==`move`||this.host.canDrag(this.item()))&&this.host.appointmentPointerDown(this.piece,e,t)}}templateContext(){let e=this;return{get appointment(){return e.item()},get start(){return e.piece.start},get end(){return e.piece.end},get text(){return e.piece.text||e.host.text(`schedulerNoTitle`)},get time(){return e.time()},get allDay(){return e.allDay()},get view(){return e.host.model.view.type},get group(){let t=e.host.model.state.groups[e.piece.group];return t?{...t.values}:null}}}};function Fn(e,t,n){let r=e.model.blockAt(t.index,n),i=r?r.text?e.text(`schedulerBlocked`,{text:r.text}):e.text(`schedulerUnavailable`):``;return{group:t.label?`${t.label}, `:``,block:i?`, ${i}`:``}}var In=class extends _{static elementTag=`div`;made=!1;rows;cellsOf=new WeakMap;drawn=new WeakMap;constructor(e){super(`div`,e)}onConfigured(){this.class.add(`mx-scheduler__group-rows`),this.attr.add({"aria-hidden":`true`}),this.rows=new z(this,e=>String(e.level),e=>this.makeRow(e),(e,t)=>this.drawRow(e,t)),this.made=!0,this.draw(),N(this,()=>this.draw()),this.motif.setDisposable(this.props.host.keepDrawn(()=>this.draw()))}draw(){!this.isDisposed&&this.made&&this.rows.show(this.props.host.model.state.heads)}makeRow(e){let t=new _(`div`);t.class.add(`mx-scheduler__groups`);let n=this.props.ruler;return n&&h(t,`div`,`mx-scheduler__corner`),this.cellsOf.set(t,new z(t,e=>e.key,t=>this.makeHead(t,e),(t,n)=>this.drawHead(t,n,e),()=>+!!n)),this.drawRow(t,e),t}drawRow(e,n){t(e,`data-level`,String(n.level)),this.cellsOf.get(e)?.show(this.props.host.model.shownHeads(n.cells))}makeHead(e,t){let n=new _(`div`);return n.class.add(`mx-scheduler__group-head`),this.drawn.set(n,{cell:e,row:t,template:void 0,swatch:null,text:null}),this.fill(n),this.drawHead(n,e,t),n}fill(e){let t=this.drawn.get(e),n=this.props.host;e.controls.clear();let r=h(e,`div`,`mx-scheduler__group-content`),i=n.headerTemplate();if(t.template=i,t.swatch=t.text=null,i){r.controls.add(i(this.headerContext(e)));return}t.swatch=h(r,`span`,`mx-scheduler__group-swatch`),t.text=h(r,`span`,`mx-scheduler__group-text`)}drawHead(e,n,r){let i=this.drawn.get(e);i.cell=n,i.row=r,i.template!==this.props.host.headerTemplate()&&this.fill(e),t(e,`data-level`,String(n.level)),t(e,`data-edge`,n.edge||null),o(e,`grid-column`,`${n.first+(this.props.ruler?2:1)} / span ${n.span}`),i.swatch&&(f(i.swatch,!!n.resource?.color),o(i.swatch,`--_color`,n.resource?.color??``)),i.text&&E(i.text,n.resource?.text??``)}headerContext(e){let t=this.drawn.get(e),n=this.props.host,r=()=>t.cell;return{get field(){return r().resource?.field??``},get label(){return t.row.label},get value(){return r().resource?.value},get item(){let e=r().resource;return e?n.resources.kind(e.field)?.find(e.value):void 0},get text(){return r().resource?.text??``},get color(){return r().resource?.color??``},get level(){return r().level},get values(){return r().values},get date(){return r().day?.date??null}}}},Ln=class extends _{static elementTag=`div`;made=!1;lane;date;parts;nameDrawn=new WeakMap;cellsOf=new WeakMap;columnOf=new WeakMap;numberOf=new WeakMap;layerOf=new WeakMap;cellTemplate=void 0;contentOf=new WeakMap;constructor(e){super(`div`,e)}get host(){return this.props.host}onConfigured(){this.class.add(`mx-scheduler__month-view`),this.makeParts(),se(this.parts.grid,`size`,()=>w(this,this.readRoom,this.fitRoom)),this.motif.setDisposable(this.host.model.onChanged(()=>this.draw())),this.made=!0,this.draw(),N(this,()=>this.draw()),this.motif.setDisposable(this.host.keepDrawn(()=>this.draw()))}onMounted(){this.host.viewShown()}readRoom=()=>({grid:c(this.parts.grid).clientHeight,lane:c(this.lane).offsetHeight,date:c(this.date).offsetHeight});fitRoom=e=>{let t=this.host,n=t.model.state.weeks.length;if(!n)return;let r=e.grid/n;r>0&&e.lane>0&&t.setMonthRoom(Math.max(1,Math.floor((r-e.date)/e.lane)))};cellAt(e){if(!this.made)return null;let t=String(e.column);for(let e of this.parts.grid.controls.items){let n=this.cellsOf.get(e)?.get(t);if(n)return n}return null}boxOf(e){if(!this.made)return null;for(let t of this.parts.layer.controls.items){let n=this.layerOf.get(t)?.boxes.get(e);if(n)return n}return null}draw(){if(this.isDisposed||!this.made)return;let e=this.host,n=e.model,r=n.state,a=this.parts,s=e.text.bind(e);i(a.head,`data-by-date`,n.datesFirst),o(a.head,`--_columns`,String(n.perRow)),o(a.body,`--_weeks`,String(r.weeks.length)),o(a.body,`--_columns`,String(n.perRow)),t(a.grid,`aria-label`,s(`schedulerMonth`)),t(a.layer,`aria-label`,s(`schedulerAppointments`)),a.heads.draw(),a.names.show(r.dates),a.weeks||this.makeWeeks();let c=k(()=>e.cellTemplate());c!==this.cellTemplate&&this.fillCells(c),a.weeks?.show(r.weeks),a.layers.show(r.weeks)}makeParts(){let e=this.host,t=h(this,`div`,`mx-scheduler__month-head`),n=new In({host:e,ruler:!1});t.controls.add(n);let r=h(t,`div`,`mx-scheduler__weekdays`);r.attr.add({"aria-hidden":`true`});let i=h(this,`div`,`mx-scheduler__month-body`),a=h(i,`div`,`mx-scheduler__month-grid`);a.attr.add({role:`grid`}),a.motif.on(`keydown`,(t,n)=>e.gridKey(n));let o=h(i,`div`,`mx-scheduler__month-layer`);o.attr.add({role:`group`});let s=h(i,`div`,`mx-scheduler__probe`);s.attr.add({"aria-hidden":`true`}),this.lane=h(s,`div`,`mx-scheduler__probe-lane`),this.date=h(s,`div`,`mx-scheduler__probe-date`),this.parts={head:t,heads:n,names:new z(r,e=>e.key,e=>this.makeName(e),(e,t)=>this.drawName(e,t)),body:i,grid:a,weeks:null,layer:o,layers:new z(o,e=>String(e.index),e=>this.makeLayer(e),(e,t)=>this.drawLayer(e,t))}}makeWeeks(){let e=this.parts;e.weeks=new z(e.grid,e=>String(e.index),e=>{let t=new _(`div`);return t.class.add(`mx-scheduler__week-row`),t.attr.add({role:`row`}),this.cellsOf.set(t,new z(t,e=>String(e.index),e=>this.makeCell(e),(e,t)=>this.drawCell(e,t))),this.cellsOf.get(t).show(e.columns),t},(e,t)=>this.cellsOf.get(e)?.show(t.columns))}fillCells(e){this.cellTemplate=e,this.parts.weeks?.each(e=>this.cellsOf.get(e)?.each(e=>this.fillCell(e)))}fillCell(e){let t=this.contentOf.get(e);t&&e.controls.remove(t),this.contentOf.delete(e);let n=this.cellTemplate,r=this.columnOf.get(e);if(!n||!r)return;let i=h(e,`div`,`mx-scheduler__cell-content`);i.controls.add(n(this.cellContext(e,r))),this.contentOf.set(e,i)}makeCell(e){let t=this.host,n=new _(`div`);n.class.add(`mx-scheduler__cell mx-scheduler__month-cell`),n.attr.add({role:`gridcell`});let r=()=>({column:this.columnOf.get(n)?.index??e.index,slot:-1});n.motif.on(`pointerdown`,(e,n)=>t.cellPointerDown(r(),n)),n.motif.on(`click`,(e,n)=>t.cellClick(r(),n)),n.motif.on(`dblclick`,(e,n)=>t.cellDblClick(r(),n));let i=h(n,`span`,`mx-scheduler__day-number`);return i.attr.add({"aria-hidden":`true`}),this.numberOf.set(n,i),this.columnOf.set(n,e),this.fillCell(n),this.drawCell(n,e),n}drawCell(e,n){let r=this.host,a=r.model;this.columnOf.set(e,n),t(e,`data-cell`,`${n.index}:-1`),i(e,`data-today`,n.day.today),i(e,`data-past`,n.day.past),i(e,`data-outside`,n.day.outside),i(e,`data-holiday`,n.day.holiday),i(e,`data-weekend`,n.day.weekend),t(e,`data-edge`,n.edge||null),i(e,`data-blocked`,n.blocked),t(e,`tabindex`,a.state.focus.column===n.index?`0`:`-1`),t(e,`aria-selected`,String(a.isSelected(n.index,-1)));let o=Fn(r,n,-1);t(e,`aria-label`,`${o.group}${r.format.fullDate(n.day.date)}${o.block}`);let s=this.numberOf.get(e);s&&E(s,r.format.dayNumber(n.day.date))}makeName(e){let t=new _(`div`);return t.class.add(`mx-scheduler__weekday-name`),this.nameDrawn.set(t,{cell:e,template:void 0,text:null}),this.fillName(t),this.drawName(t,e),t}fillName(e){let t=this.nameDrawn.get(e);e.controls.clear();let n=this.host.dateTemplate();t.template=n,t.text=null,n?h(e,`div`,`mx-scheduler__date-content`).controls.add(n(this.dateContext(e))):t.text=h(e,`span`,``)}drawName(e,n){let r=this.nameDrawn.get(e);r.cell=n,r.template!==this.host.dateTemplate()&&this.fillName(e),t(e,`data-edge`,n.edge||null),o(e,`grid-column`,`${n.first+1} / span ${n.span}`),r.text&&E(r.text,n.day?this.host.format.weekday(n.day.date):``)}makeLayer(e){let t=this.host,n=new _(`div`);n.class.add(`mx-scheduler__week-layer`);let r=new z(n,e=>e.id,e=>new Pn({host:t,piece:e}),(e,t)=>e.show(t)),i={week:e,boxes:r,mores:new z(n,e=>String(e.index),e=>this.makeMore(n,e),(e,t)=>this.drawMore(n,e,t),()=>r.size)};return this.layerOf.set(n,i),this.drawLayer(n,e),n}drawLayer(e,t){let n=this.layerOf.get(e);n&&(n.week=t,n.boxes.show(t.pieces),n.mores.show(t.columns))}makeMore(e,t){let n=new _(`button`);return n.attr.add({type:`button`}),n.class.add(`mx-scheduler__more`),n.motif.on(`click`,()=>{let e=this.columnOf.get(n);e&&this.host.openMore(e.day.date,e.group?.index??-1,n)}),this.drawMore(e,n,t),n}drawMore(e,n,r){let i=this.layerOf.get(e)?.week;if(!i)return;let a=this.host;this.columnOf.set(n,r);let s=r.index%a.model.perRow,c=i.more[s]??0;f(n,c>0),o(n,`grid-column`,String(s+1)),o(n,`grid-row`,String((i.moreAt[s]??0)+1)),t(n,`aria-label`,a.text(`schedulerMoreLabel`,{count:c,date:`${Fn(a,r,-1).group}${a.format.fullDate(r.day.date)}`})),E(n,a.text(`schedulerMore`,{count:c}))}dateContext(e){let t=this.nameDrawn.get(e),n=this.host;return{get date(){return t.cell.day?.date??new Date(NaN)},get weekday(){return t.cell.day?n.format.weekday(t.cell.day.date):``},number:``,get today(){return!1},get view(){return n.model.view.type},get resources(){return Object.keys(t.cell.values).length?{...t.cell.values}:null}}}cellContext(e,t){let n=this.host.model,r=()=>this.columnOf.get(e)??t;return{get start(){return r().day.date},get end(){return n.zone.addDays(r().day.date,1)},allDay:!0,get resources(){let e=r().group;return e?{...e.values}:null},get view(){return n.view.type},get today(){return r().day.today},get work(){return r().work},get blocked(){return r().blocked}}}},Rn=class extends _{static elementTag=`div`;made=!1;title;items;itemDrawn=new WeakMap;constructor(e){super(`div`,e)}onConfigured(){let{host:e}=this.props;this.class.add(`mx-scheduler__more-list`),this.title=h(this,`div`,`mx-scheduler__more-title`);let t=h(this,`div`,`mx-scheduler__more-items`);t.attr.add({role:`list`}),this.items=new z(t,t=>e.model.idOf(t),e=>this.makeItem(e),(e,t)=>this.drawItem(e,t)),this.made=!0,this.draw()}draw(){if(this.isDisposed||!this.made)return;let{host:e,state:t}=this.props,n=t.value.date;E(this.title,n?e.format.fullDate(n):``),this.items.show(t.value.items)}makeItem(e){let t=new _(`div`);t.attr.add({role:`listitem`});let n=h(t,`button`,`mx-scheduler__more-item`);n.attr.add({type:`button`}),n.motif.on(`click`,(e,n)=>this.props.choose(this.itemDrawn.get(t).item,n));let r=h(n,`span`,`mx-scheduler__more-time`),i=h(n,`span`,`mx-scheduler__more-text`);return this.itemDrawn.set(t,{item:e,button:n,time:r,text:i}),this.drawItem(t,e),t}drawItem(e,t){let n=this.itemDrawn.get(e);n.item=t;let{host:r}=this.props,i=e=>C(t,r.fields()[e]),a=i(`color`);o(n.button,`--_color`,typeof a==`string`?a:``);let s=r.model.timeOf(t);E(n.time,!s||s.allDay?r.text(`schedulerAllDay`):r.format.timeRange(s.start,s.end));let c=i(`text`);E(n.text,c==null||c===``?r.text(`schedulerNoTitle`):String(c))}},zn=class{locale;zone;made=``;formats={};ranges=new Map;constructor(e,t=()=>R.local){this.locale=e,this.zone=t}get(e,t,n){let r=this.locale(),i=n??this.zone().name,a=`${r}|${this.zone().name}`;return a!==this.made&&(this.made=a,this.formats={},this.ranges.clear()),this.formats[`${e}|${i}`]??=new Intl.DateTimeFormat(r,{...t,timeZone:i||void 0})}weekday(e){return this.get(`weekday`,{weekday:`short`}).format(e)}weekdayLong(e){return this.get(`weekdayLong`,{weekday:`long`}).format(e)}dayNumber(e){return this.get(`dayNumber`,{day:`numeric`}).format(e)}fullDate(e){return this.get(`fullDate`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`}).format(e)}monthYear(e){return this.get(`monthYear`,{month:`long`,year:`numeric`}).format(e)}month(e){return this.get(`monthName`,{month:`long`}).format(e)}monthDay(e){return this.get(`monthDay`,{day:`numeric`,month:`short`}).format(e)}time(e,t){return this.get(`time`,{hour:`numeric`,minute:`2-digit`},t).format(e)}timeRange(e,t,n){let r=this.get(`time`,{hour:`numeric`,minute:`2-digit`},n),i=`${e.getTime()}|${t.getTime()}|${n??``}`,a=this.ranges.get(i);return a===void 0&&(this.ranges.size>=5e3&&this.ranges.clear(),a=e.getTime()===t.getTime()?r.format(e):r.formatRange(e,t),this.ranges.set(i,a)),a}hour(e){return this.get(`hour`,{hour:`numeric`},`UTC`).format(Date.UTC(2e3,0,1,0,e))}offset(e,t){return this.get(`offset`,{timeZoneName:`shortOffset`},e).formatToParts(t).find(e=>e.type===`timeZoneName`)?.value??e}zoneName(e,t){return`(${this.offset(e,t)}) ${e.replace(/_/g,` `)}`}range(e,t,n){let r=this.zone(),i=r.toLocal(t),a=r.toLocal(new Date(n.getTime()-1)),o=R.localName();if(e===`month`){let e=new Date(i.getFullYear(),i.getMonth()+ +(i.getDate()>1),1),t=new Date(a.getFullYear(),a.getMonth()-+(a.getDate()<28),1);return this.get(`month`,{month:`long`,year:`numeric`},o).formatRange(e,t)}return i.toDateString()===a.toDateString()?this.fullDate(t):this.get(`days`,{day:`numeric`,month:`short`,year:`numeric`},o).formatRange(i,a)}},Bn=class{c;constructor(e){this.c=e}put(e,n){return n===``?D(this.c,e,!0):t(this.c,e,n),this}flag(e,t){return D(this.c,e,t),this}kept(e){return f(this.c,e),this}},Vn=class{look;focus;cells=new Map;constructor(e,t){this.look=e,this.focus=t}add(e,t,n){k(()=>{this.cells.set(e,{key:t,c:n});let r=new Bn(n);this.look(t,r),this.focus(t,r)})}clear(){this.cells.clear()}delete(e,t){this.cells.get(e)?.c===t&&this.cells.delete(e)}forEach(e){k(()=>this.cells.forEach(({key:t},n)=>e(t,n)))}each(e){k(()=>this.cells.forEach(({key:t,c:n})=>e(t,n)))}write(e){let t=this.cells.get(e);t&&k(()=>{let e=new Bn(t.c);this.look(t.key,e),this.focus(t.key,e)})}writeLook(){k(()=>this.cells.forEach(({key:e,c:t})=>this.look(e,new Bn(t))))}writeFocus(e){k(()=>{if(!e)return this.cells.forEach(({key:e,c:t})=>this.focus(e,new Bn(t)));for(let t of e){let e=this.cells.get(t);e&&this.focus(e.key,new Bn(e.c))}})}find(e){for(let{key:t,c:n}of this.cells.values())if(e(n))return t}placeOf(e){return this.find(t=>t.motif.isEventFrom(e))}},Hn=2,Un=class extends _{static elementTag=`div`;made=!1;side=0;stopGrow=null;places=[];writer;lit=[];ranged=!1;parts;dateDrawn=new WeakMap;hourDrawn=new WeakMap;moreOf=new WeakMap;cellTemplate=void 0;contentOf=new WeakMap;constructor(e){super(`div`,e)}get host(){return this.props.host}onConfigured(){this.class.add(`mx-scheduler__time-view`);let e=this.host,t=e.model;this.writer=new Vn((e,t)=>this.writeLook(e,t),({column:e,slot:n},r)=>{if(!e)return;let i=n?n.index:-1;r.put(`tabindex`,this.focused(e.index,i)?`0`:`-1`).put(`aria-selected`,String(t.isSelected(e.index,i)))}),this.makeParts(),this.motif.setDisposable(t.onChanged(e=>this.changed(e))),this.made=!0,this.draw(),N(this,()=>this.draw()),this.motif.setDisposable(e.keepDrawn(()=>this.draw()))}onMounted(){this.followSoon(),this.host.viewShown()}onDisposing(){this.stopGrow?.(),this.host.setScroller(null)}changed(e){if(!this.isDisposed){if(e===`focus`)return this.writeFocus(!1);if(e===`now`)return this.drawLayer();if(e===`window`)return this.drawWindow();this.draw()}}cellAt(e){if(!this.made)return null;let t=this.parts,n=String(e.column);if(e.slot<0)return t.allDayCells?.get(n)??null;let r=t.rows?.get(String(e.slot));return(r&&t.rowCells.get(r)?.get(n))??null}boxOf(e){return this.made?this.parts.boxes.get(e)??this.parts.barBoxes.get(e)??null:null}draw(){if(this.isDisposed||!this.made)return;let e=this.host,n=e.model,r=n.state,a=this.parts,s=e.text.bind(e);D(this,`data-virtual`,n.virtual);let c=String(r.columns.length);i(a.head,`data-by-date`,n.datesFirst),o(a.head,`--_columns`,c),o(a.body,`--_columns`,c),o(a.body,`--_rows`,String(r.slots.length)),f(a.allDay,n.view.allDayPanel),o(a.allDay,`--_lines`,String(Math.max(1,Math.min(r.allDay.lanes,e.allDayLines()+1)))),E(a.allDayLabel,s(`schedulerAllDay`)),t(a.allDayGrid,`aria-label`,s(`schedulerAllDay`)),t(a.bars,`aria-label`,`${s(`schedulerAllDay`)}, ${s(`schedulerAppointments`)}`),t(a.cells,`aria-label`,s(`schedulerTimes`)),t(a.layer,`aria-label`,s(`schedulerAppointments`)),a.hours.show(r.slots),a.rows||this.makeRows();let l=k(()=>e.cellTemplate());l!==this.cellTemplate&&this.fillCells(l),this.drawCells(),a.heads.draw(),this.drawShown(),this.writer.writeLook(),this.movePlaces(),this.writeFocus(!0)}drawWindow(){this.movePlaces(),this.drawCells(),this.parts.heads.draw(),this.drawShown()}drawShown(){let e=this.host.model,t=e.state,n=this.parts;n.dates.show(e.shownHeads(t.dates)),n.barBoxes.show(t.allDay.pieces.filter(t=>e.columnsShown(t.first,t.span))),n.mores.show(e.shownColumns()),this.drawLayer()}drawLayer(){let e=this.host.model;this.parts.boxes.show(e.shownTimed()),this.parts.nows.show(e.todayColumns())}shownPlaces(){let e=this.host.model,t=e.state,n=e.virtual?Math.min(t.window.count,t.columns.length):t.columns.length;return this.places.length!==n&&(this.places=Array.from({length:n},(e,t)=>t)),this.places}makeRows(){let e=this.parts,t=e=>{let t=e=>{let t=this.writer.placeOf(e);return t?.column?{column:t.column.index,slot:t.slot?t.slot.index:-1}:null},n=this.host;e.motif.on(`pointerdown`,(e,r)=>{let i=t(r);i&&n.cellPointerDown(i,r)}),e.motif.on(`click`,(e,r)=>{let i=t(r);i&&n.cellClick(i,r)}),e.motif.on(`dblclick`,(e,r)=>{let i=t(r);i&&n.cellDblClick(i,r)})},n=(e,t)=>new z(e,e=>String(e),e=>this.makeCell(e,t),()=>{},()=>0,(e,n)=>this.writer.delete(this.idOf(Number(n),t?t.index:-1),e)),r=new _(`div`);r.class.add(`mx-scheduler__row`),r.attr.add({role:`row`}),t(r),e.allDayGrid.controls.add(r),e.allDayRow=r,e.allDayCells=n(r,null),e.rows=new z(e.cells,e=>String(e.index),r=>{let i=new _(`div`);return i.class.add(`mx-scheduler__row`),i.attr.add({role:`row`}),t(i),e.rowCells.set(i,n(i,r)),i},()=>{},()=>0,t=>e.rowCells.get(t)?.clear())}drawCells(){let e=this.parts,t=this.host.model.state,n=this.shownPlaces();e.allDayCells?.show(n),e.rows?.show(t.slots);for(let r of t.slots){let t=e.rows?.get(String(r.index));t&&(i(t,`data-hour-start`,r.hourStart),e.rowCells.get(t)?.show(n))}}makeCell(e,t){let n=new _(`div`);n.class.add(t?`mx-scheduler__cell`:`mx-scheduler__cell mx-scheduler__all-day-cell`),n.attr.add({role:`gridcell`});let r={place:e,column:this.columnAt(e),slot:t};return this.writer.add(this.idOf(e,t?t.index:-1),r,n),this.fillCell(n,r),n}fillCells(e){this.cellTemplate=e,this.writer.each((e,t)=>this.fillCell(t,e))}fillCell(e,t){let n=this.contentOf.get(e);n&&e.controls.remove(n),this.contentOf.delete(e);let r=this.cellTemplate;if(!r)return;let i=h(e,`div`,`mx-scheduler__cell-content`);i.controls.add(r(this.cellContext(t))),this.contentOf.set(e,i)}writeLook({column:e,slot:t},n){let r=this.host,i=r.model,a=r.format,o=r.text.bind(r);if(n.kept(!!e),!e)return;let s=t=>Fn(r,e,t);n.put(`style`,t?`grid-column: ${e.index+1}; --_at: ${e.index}`:`grid-column: ${e.index+1}`).put(`data-cell`,`${e.index}:${t?t.index:-1}`).flag(`data-work`,!!t&&this.work(e,t)).flag(`data-holiday`,!!t&&e.day.holiday).flag(`data-today`,e.day.today).flag(`data-past`,e.day.past).put(`data-edge`,e.edge||null).flag(`data-blocked`,t?!!i.blockAt(e.index,t.index):e.blocked).put(`aria-label`,t?`${s(t.index).group}${a.fullDate(e.day.date)}, ${a.time(this.cellTime(e,t))}${s(t.index).block}`:`${s(-1).group}${o(`schedulerAllDay`)}, ${a.fullDate(e.day.date)}${s(-1).block}`)}windowNow(){let e=this.host.model,t=e.state;return{virtual:e.virtual,first:t.window.first,columns:t.columns,count:this.places.length}}columnAt(e,t=this.windowNow()){return!t.virtual||!t.count?t.columns[e]:t.columns[t.first+((e-t.first)%t.count+t.count)%t.count]}placeOf(e){let t=this.places.length;return this.host.model.virtual&&t?(e%t+t)%t:e}idOf(e,t){return e*1e3+t+1}movePlaces(){let e=this.windowNow();this.writer.forEach((t,n)=>{let r=this.columnAt(t.place,e);r!==t.column&&(t.column=r,this.writer.write(n))})}writeFocus(e){let t=this.host.model.state,{column:n,slot:r}=t.focus,i=t.anchor,a=[this.idOf(this.placeOf(n),r)],o=!!i&&(i.column!==n||i.slot!==r);e||o||this.ranged?this.writer.writeFocus():this.writer.writeFocus([...this.lit,...a]),this.ranged=o,this.lit=a}focused(e,t){let n=this.host.model.state.focus;return n.column===e&&n.slot===t}cellTime(e,t){return this.host.model.zone.date(e.day.wall+t.minutes*6e4)}work(e,t){return e.work&&t.minutes>=e.workStart*60&&t.minutes<e.workEnd*60}followSoon(){w(this,this.readView,this.follow)}readView=()=>{if(!this.made||!this.host.model.virtual)return null;let e=this.parts,t=c(e.scroll);return{room:t.clientWidth-c(e.ruler).offsetWidth,start:t.scrollStart,cells:c(e.cells).offsetWidth}};follow=e=>{let t=this.host.model,n=t.state.columns.length;if(!e||!n)return;let r=e.cells/n;if(!(r>0))return;let i=Math.max(1,Math.ceil(e.room/r)+1),a=Math.floor(e.start/r),o=t.state.window,s=Math.min(this.side,i),c=a-s,l=i+2*s;(o.count!==l||Math.abs(o.first-Math.max(0,c))>=(s<i?1:Hn))&&t.setWindow(c,l),s<i&&this.growSoon(i)};growSoon(e){this.isDisposed||this.stopGrow||(this.stopGrow=ze(()=>{this.stopGrow=null,!this.isDisposed&&(this.side+=Math.max(1,Math.ceil(e/2)),this.followSoon())}))}readScroll=()=>c(this.parts.scroll).scrollStart;scrollHead=e=>{ce(this.parts.head,{start:e})};makeParts(){let e=this.host,t=e.model,n=h(this,`div`,`mx-scheduler__head`),r=new In({host:e,ruler:!0});n.controls.add(r);let i=h(n,`div`,`mx-scheduler__dates`);i.attr.add({"aria-hidden":`true`}),h(i,`div`,`mx-scheduler__corner`);let a=h(n,`div`,`mx-scheduler__all-day`),s=h(a,`div`,`mx-scheduler__all-day-label`);s.attr.add({"aria-hidden":`true`});let c=h(a,`div`,`mx-scheduler__all-day-area`),l=h(c,`div`,`mx-scheduler__all-day-grid`);l.attr.add({role:`grid`}),l.motif.on(`keydown`,(t,n)=>e.gridKey(n));let u=h(c,`div`,`mx-scheduler__bars`);u.attr.add({role:`group`});let d=h(this,`div`,`mx-scheduler__scroll`);e.setScroller(d),d.motif.on(`scroll`,()=>{w(this,this.readScroll,this.scrollHead),this.followSoon()});let p=h(d,`div`,`mx-scheduler__body`),m=h(p,`div`,`mx-scheduler__ruler`);m.attr.add({"aria-hidden":`true`});let g=h(p,`div`,`mx-scheduler__cells`);g.attr.add({role:`grid`}),g.motif.on(`keydown`,(t,n)=>e.gridKey(n));let v=h(p,`div`,`mx-scheduler__layer`);v.attr.add({role:`group`});let y=t=>new Pn({host:e,piece:t}),b;b=new z(u,e=>e.id,y,(e,t)=>e.show(t));let x;x=new z(v,e=>e.id,y,(e,t)=>e.show(t)),this.parts={head:n,heads:r,scroll:d,ruler:m,dates:new z(i,e=>e.key,e=>this.makeDate(e),(e,t)=>this.drawDate(e,t),()=>1),allDay:a,allDayLabel:s,allDayGrid:l,allDayRow:null,allDayCells:null,bars:u,barBoxes:b,mores:new z(u,e=>String(e.index),e=>this.makeMore(e),(e,t)=>this.drawMore(e,t),()=>b.size),body:p,hours:new z(m,e=>String(e.index),e=>this.makeHour(e),(e,t)=>this.drawHour(e,t)),cells:g,rows:null,rowCells:new WeakMap,layer:v,boxes:x,nows:new z(v,e=>String(e.index),()=>{let e=new _(`div`);return e.class.add(`mx-scheduler__now`),e.attr.add({"aria-hidden":`true`}),e},(n,r)=>{f(n,e.showCurrentTime()&&t.nowAt()!==null),o(n,`--_column`,String(r.index)),o(n,`inset-block-start`,`${(t.nowAt()??0)*100}%`)},()=>x.size)}}makeDate(e){let t=new _(`div`);return t.class.add(`mx-scheduler__date`),this.dateDrawn.set(t,{cell:e,template:void 0,weekday:null,number:null}),this.fillDate(t),this.drawDate(t,e),t}fillDate(e){let t=this.dateDrawn.get(e);e.controls.clear();let n=this.host.dateTemplate();if(t.template=n,t.weekday=t.number=null,n){h(e,`div`,`mx-scheduler__date-content`).controls.add(n(this.dateContext(e)));return}t.weekday=h(e,`span`,`mx-scheduler__weekday`),t.number=h(e,`span`,`mx-scheduler__day-number`)}drawDate(e,n){let r=this.dateDrawn.get(e);r.cell=n,r.template!==this.host.dateTemplate()&&this.fillDate(e);let a=this.host.format;i(e,`data-today`,n.day?.today),i(e,`data-holiday`,n.day?.holiday),i(e,`data-weekend`,n.day?.weekend),t(e,`data-edge`,n.edge||null),o(e,`grid-column`,`${n.first+2} / span ${n.span}`),r.weekday&&E(r.weekday,n.day?a.weekday(n.day.date):``),r.number&&E(r.number,n.day?a.dayNumber(n.day.date):``)}makeHour(e){let t=new _(`div`);return t.class.add(`mx-scheduler__hour`),this.hourDrawn.set(t,{slot:e,template:void 0,text:null}),this.fillHour(t),this.drawHour(t,e),t}fillHour(e){let t=this.hourDrawn.get(e);e.controls.clear();let n=this.host.timeTemplate();t.template=n;let r=h(e,`span`,``);t.text=null,n?r.controls.add(n(this.timeContext(e))):t.text=r}drawHour(e,t){let n=this.hourDrawn.get(e);n.slot=t,n.template!==this.host.timeTemplate()&&this.fillHour(e),i(e,`data-hour-start`,t.hourStart),n.text&&E(n.text,t.hourStart?this.host.format.hour(t.minutes):``)}makeMore(e){let t=new _(`button`);return t.attr.add({type:`button`}),t.class.add(`mx-scheduler__more`),t.motif.on(`click`,()=>{let e=this.moreOf.get(t);e&&this.host.openMore(e.day.date,e.group?.index??-1,t)}),this.drawMore(t,e),t}drawMore(e,n){let r=this.host,i=r.model.state;this.moreOf.set(e,n);let a=i.allDay.more[n.index]??0;f(e,a>0),o(e,`grid-column`,String(n.index+1)),o(e,`grid-row`,String((i.allDay.moreAt[n.index]??0)+1)),t(e,`aria-label`,r.text(`schedulerMoreLabel`,{count:a,date:`${Fn(r,n,-1).group}${r.format.fullDate(n.day.date)}`})),E(e,r.text(`schedulerMore`,{count:a}))}dateContext(e){let t=this.dateDrawn.get(e),n=this.host;return{get date(){return t.cell.day?.date??new Date(NaN)},get weekday(){return t.cell.day?n.format.weekday(t.cell.day.date):``},get number(){return t.cell.day?n.format.dayNumber(t.cell.day.date):``},get today(){return!!t.cell.day?.today},get view(){return n.model.view.type},get resources(){return Object.keys(t.cell.values).length?{...t.cell.values}:null}}}timeContext(e){let t=this.hourDrawn.get(e),n=this.host;return{get date(){return n.model.zone.date((n.model.state.days[0]?.wall??0)+t.slot.minutes*6e4)},get minutes(){return t.slot.minutes},get text(){return n.format.hour(t.slot.minutes)},get view(){return n.model.view.type}}}cellContext(e){let t=this,n=this.host.model;return{get start(){let n=e.column;return e.slot?t.cellTime(n,e.slot):n.day.date},get end(){let t=e.column;return e.slot?n.zone.date(t.day.wall+(e.slot.minutes+n.view.cellDuration)*6e4):n.zone.addDays(t.day.date,1)},get allDay(){return!e.slot},get resources(){let t=e.column?.group;return t?{...t.values}:null},get view(){return n.view.type},get today(){return!!e.column?.day.today},get work(){let n=e.column;return e.slot?t.work(n,e.slot):n.work},get blocked(){return!!n.blockAt(e.column.index,e.slot?e.slot.index:-1)}}}},Wn=class extends _{static elementTag=`div`;made=!1;list;empty;days;dayDrawn=new WeakMap;rowDrawn=new WeakMap;constructor(e){super(`div`,e)}get host(){return this.props.host}onConfigured(){let e=this.host;this.class.add(`mx-scheduler__agenda-view`);let t=h(this,`div`,`mx-scheduler__scroll mx-scheduler__agenda`);e.setScroller(t),this.list=h(t,`div`,`mx-scheduler__agenda-list`),this.list.attr.add({role:`listbox`}),this.list.motif.on(`keydown`,(t,n)=>e.agendaKey(n)),this.empty=h(t,`div`,`mx-scheduler__agenda-empty`),this.days=new z(this.list,e=>e.key,e=>this.makeDay(e),(e,t)=>this.drawDay(e,t)),this.props.focus.drawn=()=>this.draw(),this.motif.setDisposable(e.model.onChanged(()=>this.draw())),this.made=!0,this.draw(),N(this,()=>this.draw()),this.motif.setDisposable(e.keepDrawn(()=>this.draw()))}onConfig(){this.host.viewShown()}onDisposing(){this.host.setScroller(null)}cellAt(){return null}boxOf(e){if(!this.made)return null;for(let t of this.list.controls.items){let n=this.dayDrawn.get(t)?.rows.get(e);if(n)return n}return null}draw(){if(this.isDisposed||!this.made)return;let e=this.host,n=e.model.state.agenda;t(this.list,`aria-label`,e.text(`schedulerAgenda`)),f(this.list,n.length>0),f(this.empty,n.length===0),E(this.empty,e.text(`schedulerNoAppointments`)),this.days.show(n)}focused(e){let t=this.props.focus;return t.id===e.id||!t.id&&this.host.model.state.agenda[0]?.items[0]===e}choose(e){let t=this.props.focus;t.id!==e&&(t.id=e,this.draw())}makeDay(e){let t=new _(`div`);t.class.add(`mx-scheduler__agenda-group`),t.attr.add({role:`group`});let n=h(t,`div`,`mx-scheduler__agenda-resource`);n.attr.add({"aria-hidden":`true`});let r=h(t,`div`,`mx-scheduler__agenda-day`);r.attr.add({"aria-hidden":`true`});let i=h(r,`span`,`mx-scheduler__day-number`),a=h(r,`span`,`mx-scheduler__agenda-date`),o=h(a,`span`,`mx-scheduler__agenda-weekday`),s=h(a,`span`,`mx-scheduler__agenda-month`);return this.dayDrawn.set(t,{day:e,resource:n,head:r,number:i,weekday:o,month:s,rows:new z(t,e=>e.id,e=>this.makeRow(e,this.dayDrawn.get(t).day),(e,n)=>this.drawRow(e,n,this.dayDrawn.get(t).day),()=>2)}),this.drawDay(t,e),t}drawDay(e,n){let r=this.dayDrawn.get(e);r.day=n;let a=this.host.format;t(e,`aria-label`,`${n.label?`${n.label}, `:``}${a.fullDate(n.day.date)}`),i(e,`data-today`,n.day.today),f(r.resource,n.first&&!!n.group),E(r.resource,n.label),i(r.head,`data-today`,n.day.today),E(r.number,a.dayNumber(n.day.date)),E(r.weekday,a.weekdayLong(n.day.date)),E(r.month,a.monthYear(n.day.date)),r.rows.show(n.items)}makeRow(e,t){let n=this.host,r=new _(`div`);r.class.add(`mx-scheduler__agenda-row`),r.attr.add({role:`option`});let i=()=>this.rowDrawn.get(r).piece;r.motif.on(`focus`,()=>this.choose(i().id)),r.motif.on(`click`,(e,t)=>{this.choose(i().id),n.appointmentClick(i(),t)}),r.motif.on(`dblclick`,(e,t)=>n.appointmentDblClick(i(),t));let a=h(r,`div`,`mx-scheduler__agenda-content`);return this.rowDrawn.set(r,{piece:e,day:t,content:a,template:void 0,version:-1,time:null,text:null,details:null,mark:null}),this.fillRow(r),this.drawRow(r,e,t),r}fillRow(e){let t=this.rowDrawn.get(e),n=t.content;n.controls.clear();let r=this.host.agendaTemplate();if(t.template=r,t.version=t.piece.version,t.time=t.text=t.mark=null,r){n.controls.add(r(this.rowContext(e))),t.details=h(n,`span`,`mx-sr-only`);return}t.time=h(n,`span`,`mx-scheduler__agenda-time`),h(n,`span`,`mx-scheduler__agenda-dot`).attr.add({"aria-hidden":`true`}),t.text=h(n,`span`,`mx-scheduler__agenda-text`),t.details=h(n,`span`,`mx-sr-only`);let i=h(n,`span`,`mx-glyph mx-scheduler__mark`);i.attr.add({"aria-hidden":`true`}),t.mark=i}drawRow(e,n,r){let a=this.host,s=a.model,c=this.rowDrawn.get(e);c.piece=n,c.day=r;let l=a.agendaTemplate();(l!==c.template||l&&n.version!==c.version)&&this.fillRow(e),t(e,`data-piece`,n.id),i(e,`data-past`,a.dimPast()&&n.end.getTime()<=s.state.now),i(e,`data-disabled`,n.disabled),i(e,`data-open`,a.isOpen(s.itemOf(n))),i(e,`data-series`,n.series),i(e,`data-exception`,n.exception),t(e,`aria-selected`,String(this.props.focus.id===n.id)),i(e,`aria-disabled`,n.disabled),t(e,`tabindex`,this.focused(n)?`0`:`-1`),o(e,`--_color`,n.color??``),c.time&&E(c.time,this.time(n)),c.text&&E(c.text,this.text(n)),c.details&&E(c.details,this.details(n)),c.mark&&(t(c.mark,`data-mark`,n.exception?`exception`:`series`),f(c.mark,!!(a.recurrenceMarks()&&(n.series||n.exception))))}time(e){let{format:t}=this.host;return e.whole?this.host.text(`schedulerAllDay`):e.before||e.after?`${t.time(e.start)} – ${t.time(e.end)}`:t.timeRange(e.start,e.end)}text(e){return e.text||this.host.text(`schedulerNoTitle`)}details(e){let t=this.host,n=e.before||e.after?`, ${t.text(`schedulerContinues`)}`:``,r=e.series?`, ${t.text(`schedulerRepeats`,{rule:t.recurrenceText(t.model.itemOf(e))})}`:e.exception?`, ${t.text(`schedulerChanged`)}`:``;return n||r?`${n}${r}`:``}rowContext(e){let t=this.rowDrawn.get(e),n=this,r=this.host.model;return{get appointment(){return r.itemOf(t.piece)},get start(){return t.piece.start},get end(){return t.piece.end},get text(){return n.text(t.piece)},get time(){return n.time(t.piece)},get allDay(){return t.piece.whole},get date(){return t.day.day.date},get group(){return t.day.group?{...t.day.group.values}:null}}}},Gn=0,Kn=class extends _{static elementTag=`div`;made=!1;id=++Gn;stale=!1;ticks=[];pieces=[];lit=[];ranged=!1;cells;cellParts;boxes;mores;heads;now;moreOf=new WeakMap;filled=new WeakMap;row;cellTemplate;contentOf=new WeakMap;constructor(e){super(`div`,e),this.row=e.row,this.cellTemplate=e.cellTemplate}fillCells(e){e!==this.cellTemplate&&(this.cellTemplate=e,this.cells?.each((e,t)=>this.fillCell(t,e)))}fillCell(e,t){let n=this.contentOf.get(e);n&&e.controls.remove(n),this.contentOf.delete(e);let r=this.cellTemplate;if(!r)return;let i=h(e,`div`,`mx-scheduler__cell-content`);i.controls.add(r(this.cellContext(t))),this.contentOf.set(e,i)}get host(){return this.props.host}get rowKey(){return this.row.key}show(e){this.row=e,this.draw()}onConfigured(){let{host:e}=this,t=e.model;this.class.add(`mx-scheduler__line`),this.attr.add({role:`row`});let n=h(this,`div`,`mx-scheduler__line-head`);n.attr.add({"aria-hidden":`true`}),this.heads=new z(n,({resource:e})=>`${e.field}=${String(e.value)}`,({level:e,resource:t})=>this.makeHead(e,t),(e,{level:t,resource:n})=>this.drawHead(e,t,n));let r=h(this,`div`,`mx-scheduler__line-track`),i=e=>{let t=this.cells.placeOf(e);return t?{column:this.row.first+t.day.index,slot:t.slot}:null};r.motif.on(`pointerdown`,(t,n)=>{let r=i(n);r&&e.cellPointerDown(r,n)}),r.motif.on(`click`,(t,n)=>{let r=i(n);r&&e.cellClick(r,n)}),r.motif.on(`dblclick`,(t,n)=>{let r=i(n);r&&e.cellDblClick(r,n)}),r.motif.on(`keydown`,(t,n)=>{this.cells.find(e=>e.motif.isEventFrom(n)&&!e.controls.items.some(e=>e.motif.isEventFrom(n)))&&e.gridKey(n)}),this.cells=new Vn((e,n)=>n.put(`style`,`--_at: ${e.index}`).put(`data-cell`,`${this.row.first+e.day.index}:${e.slot}`).flag(`data-work`,this.work(e)).flag(`data-today`,e.day.today).flag(`data-past`,e.day.past).flag(`data-holiday`,e.day.holiday).flag(`data-weekend`,e.slot<0&&e.day.weekend).flag(`data-hour-start`,e.hourStart).flag(`data-day-start`,e.dayStart).flag(`data-blocked`,!!t.blockAt(this.row.first+e.day.index,e.slot)).put(`aria-label`,this.label(e)),(e,n)=>n.put(`tabindex`,this.focused(e)?`0`:`-1`).put(`aria-selected`,String(t.isSelected(this.row.first+e.day.index,e.slot)))),this.cellParts=new z(r,e=>String(e.index),e=>this.makeCell(e),(e,t)=>this.cells.add(t.index,t,e),()=>0,(e,t)=>this.cells.delete(Number(t),e));let a=h(r,`div`,`mx-scheduler__line-layer`);a.attr.add({role:`gridcell`}),this.boxes=new z(a,e=>e.id,t=>new Pn({host:e,piece:t}),(e,t)=>e.show(t)),this.mores=new z(a,e=>String(e.day),e=>this.makeMore(e),(e,t)=>this.drawMore(e,t),()=>this.boxes.size),this.now=h(a,`div`,`mx-scheduler__now`),this.now.attr.add({"aria-hidden":`true`}),this.motif.setDisposable(t.onChanged(e=>{if(this.props.away[this.id]){this.stale=!0;return}e===`focus`?this.writeFocus(!1):e===`window`?this.drawWindow():e===`now`&&this.drawNow()})),this.motif.setDisposable(()=>delete this.props.away[this.id]),this.made=!0,this.draw(),N(this,()=>this.draw())}onActivated(){this.props.away[this.id]=!1,this.stale&&(this.stale=!1,this.draw())}onDeactivated(){this.props.away[this.id]=!0}draw(){if(this.isDisposed||!this.made)return;let e=this.row;t(this,`data-edge`,e.edge||null),i(this,`data-first`,e.index===0),o(this,`block-size`,`${e.height}px`),this.heads.show((e.group?.path??[]).map((e,t)=>({level:t,resource:e}))),this.drawWindow(),this.cells.writeLook(),this.writeFocus(!0)}cellAt(e){let t=this.ticks.find(t=>this.row.first+t.day.index===e.column&&t.slot===e.slot);return t?this.cellParts.get(String(t.index))??null:null}boxOf(e){return this.made?this.boxes.get(e)??null:null}cellWithFocus(){let e=this.made?this.cells.find(S):void 0;return e?{column:this.row.first+e.day.index,slot:e.slot}:null}pieceWithFocus(){return this.pieces.find(e=>{let t=this.boxOf(e.id);return!!t&&S(t)})?.id??null}drawWindow(){let{host:e,row:t}=this,n=e.model;this.ticks=n.shownTicks(),this.pieces=t.pieces.filter(e=>n.ticksShown(e.from,e.span)),this.cellParts.show(this.ticks),this.boxes.show(this.pieces);let r=this.per();this.mores.show(t.more.filter(e=>n.ticksShown(e.day*r,r))),this.drawNow()}drawNow(){let{host:e}=this,t=e.model.nowTick();f(this.now,e.showCurrentTime()&&t!==null),o(this.now,`--_at`,String(t??0))}per(){let e=this.host.model;return K(e.view.type)?1:Math.max(1,e.state.slots.length)}columnOf(e){return this.host.model.state.columns[this.row.first+e.day.index]}focused(e){let t=this.host.model.state.focus;return t.column===this.row.first+e.day.index&&t.slot===e.slot}time(e){return this.host.model.zone.date(e.day.wall+e.minutes*6e4)}work(e){let t=this.columnOf(e);return t?.work?e.slot<0||e.minutes>=t.workStart*60&&e.minutes<t.workEnd*60:!1}label(e){let t=this.columnOf(e);if(!t)return``;let n=this.host,r=Fn(n,t,e.slot),i=n.format.fullDate(e.day.date);return e.slot<0?`${r.group}${i}${r.block}`:`${r.group}${i}, ${n.format.time(this.time(e))}${r.block}`}writeFocus(e){let t=this.host.model.state,n=this.row,r=e=>e>=n.first&&e<n.first+t.days.length,i=(e,t)=>(e-n.first)*this.per()+(K(this.host.model.view.type)?0:t),{column:a,slot:o}=t.focus,s=t.anchor,c=r(a)?[i(a,o)]:[],l=!!s&&(s.column!==a||s.slot!==o)&&r(s.column);e||l||this.ranged?this.cells.writeFocus():this.cells.writeFocus([...this.lit,...c]),this.ranged=l,this.lit=c}makeCell(e){let t=new _(`div`);return t.class.add(`mx-scheduler__cell`),t.attr.add({role:`gridcell`}),this.cells.add(e.index,e,t),this.fillCell(t,e),t}cellContext(e){let t=this,n=this.host.model;return{get start(){return e.slot<0?e.day.date:t.time(e)},get end(){return e.slot<0?n.zone.addDays(e.day.date,1):n.zone.date(e.day.wall+(e.minutes+n.view.cellDuration)*6e4)},get allDay(){return e.slot<0},get resources(){return t.row.group?{...t.row.group.values}:null},get view(){return n.view.type},get today(){return e.day.today},get work(){return t.work(e)},get blocked(){return!!n.blockAt(t.row.first+e.day.index,e.slot)}}}makeHead(e,n){let r=new _(`div`);return r.class.add(`mx-scheduler__resource`),t(r,`data-level`,String(e)),this.fillHead(r,e,n),this.drawHead(r,e,n),r}fillHead(e,t,n){let r=this.host;e.controls.clear();let i=h(e,`div`,`mx-scheduler__group-content`),a=r.headerTemplate();if(this.filled.set(e,{template:a,content:i}),a){let e=this.row;i.controls.add(a({field:n.field,get label(){return r.resources.kind(n.field)?.label??n.field},value:n.value,get item(){return r.resources.kind(n.field)?.find(n.value)},text:n.text,color:n.color,level:t,values:Object.fromEntries((e.group?.path??[]).slice(0,t+1).map(e=>[e.field,e.value])),date:null}))}else{let e=h(i,`span`,`mx-scheduler__group-swatch`);f(e,!!n.color),o(e,`--_color`,n.color??``),E(h(i,`span`,`mx-scheduler__group-text`),n.text)}}drawHead(e,t,n){this.filled.get(e)?.template!==this.host.headerTemplate()&&this.fillHead(e,t,n);let r=!!this.row.starts[t];i(e,`data-continued`,!r),f(this.filled.get(e)?.content??null,r)}makeMore(e){let t=new _(`button`);return t.attr.add({type:`button`}),t.class.add(`mx-scheduler__more`),t.motif.on(`click`,()=>{let e=this.moreOf.get(t);if(!e)return;let n=this.host.model.state;this.host.openMore(n.days[e.day].date,this.row.group?.index??-1,t)}),this.drawMore(t,e),t}drawMore(e,n){let{host:r,row:i}=this,a=r.model.state;this.moreOf.set(e,n),o(e,`--_from`,String(n.day*this.per())),o(e,`--_lane`,String(i.moreLane)),t(e,`aria-label`,r.text(`schedulerMoreLabel`,{count:n.count,date:`${i.label?`${i.label}, `:``}${r.format.fullDate(a.days[n.day]?.date??new Date)}`})),E(e,r.text(`schedulerMore`,{count:n.count}))}},qn=class extends _{static elementTag=`div`;made=!1;cell;content=null;template=void 0;texts={upper:null,weekday:null,number:null,hour:null};constructor(e){super(`div`,e),this.cell=e.cell}show(e){this.cell=e,this.draw()}onConfigured(){let{host:e,tier:n}=this.props;this.class.add(`mx-scheduler__scale-cell`),t(this,`data-tier`,n);let r=new _(`div`);r.class.add(`mx-scheduler__scale-content`),this.controls.add(r),this.content=r,this.fill(),this.made=!0,this.draw(),N(this,()=>this.draw()),this.motif.setDisposable(e.keepDrawn(()=>this.draw()))}templateNow(){let{host:e,tier:t}=this.props;return this.cell.kind===`day`?e.dateTemplate():t===`lower`?e.timeTemplate():null}fill(){let e=this.content;if(!e)return;let{host:t,tier:n}=this.props,r=this.texts;e.controls.clear(),E(e,``),r.upper=r.weekday=r.number=r.hour=null;let i=this.cell.kind;this.template=this.templateNow();let a=t.dateTemplate(),o=t.timeTemplate();i===`day`&&a?e.controls.add(a(this.dateContext())):n===`upper`?r.upper=e:i===`day`?(r.weekday=this.span(e,`mx-scheduler__weekday`),r.number=this.span(e,`mx-scheduler__day-number`)):o?e.controls.add(o(this.timeContext())):r.hour=e}draw(){if(this.isDisposed||!this.made)return;this.templateNow()!==this.template&&this.fill();let{cell:e,texts:n}=this,{host:r,tier:a}=this.props,s=r.format;a===`upper`?i(this,`data-today`,e.kind===`day`&&e.day.today):(t(this,`data-kind`,e.kind),i(this,`data-today`,e.day.today),i(this,`data-weekend`,e.kind===`day`&&e.day.weekend),i(this,`data-day-start`,e.kind===`hour`&&e.dayStart)),o(this,`grid-column`,`${e.first+1} / span ${e.span}`),n.upper&&E(n.upper,e.kind===`month`?s.monthYear(e.day.date):s.fullDate(e.day.date)),n.weekday&&E(n.weekday,s.weekday(e.day.date)),n.number&&E(n.number,s.dayNumber(e.day.date)),n.hour&&E(n.hour,s.hour(e.minutes))}span(e,t){let n=new _(`span`);return n.class.add(t),e.controls.add(n),n}dateContext(){let e=this,{host:t}=this.props;return{get date(){return e.cell.day.date},get weekday(){return t.format.weekday(e.cell.day.date)},get number(){return t.format.dayNumber(e.cell.day.date)},get today(){return e.cell.day.today},get view(){return t.model.view.type},resources:null}}timeContext(){let e=this,{host:t}=this.props;return{get date(){return t.model.zone.date(e.cell.day.wall+e.cell.minutes*6e4)},get minutes(){return e.cell.minutes},get text(){return t.format.hour(e.cell.minutes)},get view(){return t.model.view.type}}}},Jn=class extends _{static elementTag=`div`;made=!1;corner;tiers=[];constructor(e){super(`div`,e)}onConfigured(){let{host:e}=this.props;this.class.add(`mx-scheduler__scale`),this.attr.add({"aria-hidden":`true`});let n=new _(`div`);n.class.add(`mx-scheduler__corner`),this.controls.add(n),this.corner=new z(n,e=>e.field,e=>{let t=new _(`div`);return t.class.add(`mx-scheduler__corner-label`),E(t,e.label),t},(e,t)=>E(e,t.label));let r=new _(`div`);r.class.add(`mx-scheduler__scale-area`),this.controls.add(r);for(let n of[`upper`,`lower`]){let i=new _(`div`);i.class.add(`mx-scheduler__scale-tier`),t(i,`data-tier`,n),r.controls.add(i),this.tiers.push(new z(i,e=>`${e.kind}:${e.key}`,t=>new qn({host:e,cell:t,tier:n}),(e,t)=>e.show(t)))}this.motif.setDisposable(e.model.onChanged(e=>e===`window`&&this.drawTiers())),this.made=!0,this.draw(),N(this,()=>this.draw())}draw(){if(this.isDisposed||!this.made)return;let{host:e}=this.props,t=e.model.state;this.corner.show(t.groups[0]?.path.map(t=>({field:t.field,label:e.resources.kind(t.field)?.label??t.field}))??[]),this.drawTiers()}drawTiers(){if(this.isDisposed||!this.made)return;let e=this.props.host.model,[t,n]=this.tiers;t.show(e.state.upper.filter(t=>e.ticksShown(t.first,t.span))),n.show(e.state.lower.filter(t=>e.ticksShown(t.first,t.span)))}},Yn=2,Xn=6,Zn=60,Qn=class extends _{static elementTag=`div`;made=!1;scroller=null;rows=null;probe={tick:null,lane:null,gap:null,row:null,head:null};size={tick:0,head:0};away={};given=``;measured;ready=new Promise(e=>this.measured=e);wanted=null;revealed=null;timeline;scale=null;lines=null;shownLines=new Set;madeFor=null;readSizes=()=>{let{tick:e,lane:t,gap:n,row:r,head:i}=this.probe,a=this.scroller;if(!e||!t||!n||!r||!i||!a)return null;let o=c(a);return{tick:c(e).offsetWidth,head:c(i).offsetWidth,lane:c(t).offsetHeight,gap:c(n).offsetHeight,min:c(r).offsetHeight,room:o.clientWidth,start:o.scrollStart}};readView=()=>this.scroller?c(this.scroller):null;readScroller=()=>this.scroller?{box:c(this.scroller),head:this.scale?c(this.scale).offsetHeight:0}:null;constructor(e){super(`div`,e)}onConfigured(){let e=this.props.host;this.class.add(`mx-scheduler__timeline-view`),se(this,`look`,()=>this.measureSizes()),e.setTimeline({scrollTo:(e,t)=>this.scrollTo(e,t),reveal:(e,t)=>this.reveal(e,t)}),this.timeline=new _(`div`),this.timeline.class.add(`mx-scheduler__timeline`),this.controls.add(this.timeline);let t=new _(`div`);t.class.add(`mx-scheduler__probe`),t.attr.add({"aria-hidden":`true`}),this.controls.add(t);for(let e of[`tick`,`lane`,`gap`,`row`,`head`]){let n=new _(`div`);n.class.add(`mx-scheduler__probe-${e===`lane`?`line`:e}`),t.controls.add(n),this.probe[e]=n,se(n,`size`,()=>this.measureSizes())}this.motif.setDisposable(e.model.onChanged(e=>this.changed(e))),this.made=!0,this.draw(),N(this,()=>this.draw()),this.motif.setDisposable(e.keepDrawn(()=>this.draw()))}onMounted(){this.measureSizes(),this.props.host.viewShown()}onDisposing(){this.props.host.setScroller(null),this.props.host.setTimeline(null)}changed(e){this.isDisposed||e===`focus`||e===`window`||e===`now`||(e===`layout`&&this.giveChanged(),this.draw())}draw(){if(this.isDisposed||!this.made)return;let e=this.props.host,n=e.model,r=n.state;o(this.timeline,`--_tick`,`${this.size.tick}px`),o(this.timeline,`--_ticks`,String(r.ticks.length)),o(this.timeline,`--_levels`,String(r.groups[0]?.path.length??0));let i=k(()=>e.cellTemplate()),a=this.madeFor;if(!a||a.virtual!==n.virtual){this.make(n.virtual,i);return}if(a.cellTemplate!==i){a.cellTemplate=i;for(let e of this.shownLines)e.fillCells(i)}if(this.scroller&&t(this.scroller,`aria-label`,e.text(`schedulerTimes`)),this.scale?.draw(),this.lines)this.lines.show(r.rows);else{let e=new Map(r.rows.map(e=>[e.key,e]));for(let t of this.shownLines){let n=e.get(t.rowKey);n&&t.show(n)}}}cellAt(e){for(let t of this.onPage()){let n=t.cellAt(e);if(n)return n}return null}boxOf(e){for(let t of this.onPage()){let n=t.boxOf(e);if(n)return n}return null}onPage(){return[...this.shownLines].filter(e=>e.parent!==null)}make(e,t){let r=this.props.host,i=r.model.state;this.madeFor={virtual:e,cellTemplate:t},this.timeline.controls.clear(),this.shownLines.clear(),this.lines=null,this.rows=null;let a=this.shownLines,o=this.madeFor,s=e=>{let t=new Kn({host:r,row:e,cellTemplate:o.cellTemplate,away:this.away});return a.add(t),t.motif.setDisposable(()=>a.delete(t)),t},c=e=>{e.class.add(`mx-scheduler__scroll mx-scheduler__line-scroll`),e.attr.add({role:`grid`,"aria-label":r.text(`schedulerTimes`)}),e.motif.on(`scroll`,()=>this.follow()),se(e,`size`,()=>this.measureSizes()),this.scroller=e,r.setScroller(e),this.scale=new Jn({host:r}),e.controls.add(this.scale)};if(!e){let e=new _(`div`);c(e),this.timeline.controls.add(e),this.lines=new z(e,e=>e.key,s,(e,t)=>e.show(t),()=>1),this.lines.show(i.rows);return}let l=new n({itemHeight:e=>e.height,pageSize:1e6,overscan:Xn,cacheSize:Zn,autoLoad:!1,autoRefresh:!1,dataRequest:async()=>{await this.ready;let e=i.rows.slice();return this.given=i.rows.map(e=>`${e.key}:${e.height}`).join(`|`),{items:e,totalCount:e.length,hasMore:!1}},itemTemplate:e=>s(e),mainTemplate:e=>{let t=new _(`div`);return c(t),t.controls.add(e),t}});l.class.add(`mx-scheduler__rows`),this.rows=l,this.timeline.controls.add(l)}giveChanged(){let e=this.props.host;if(e.dragging()||!this.rows)return;let t=e.model.state.rows.map(e=>`${e.key}:${e.height}`).join(`|`);t!==this.given&&(this.given=t,this.give())}measureSizes(){w(this,this.readSizes,this.takeSizes)}takeSizes=e=>{if(!e)return;let t=this.props.host,n=t.model.state.groups[0]?.path.length??0,r=e.head*n,i=Math.max(1,t.model.state.ticks.length),a=e.room-r,o=Math.max(e.tick,a>0?a/i:0),s=this.size.tick,c=s!==o||this.size.head!==r;if(s!==o){this.size.tick=o;let t=s>0?e.start/s:0;t>0&&!this.wanted&&(this.wanted={tick:t,row:null,reveal:!1})}this.size.head=r,c&&this.draw(),t.setLineMetrics({lane:e.lane,gap:e.gap,min:e.min}),this.measured(),this.wanted?w(this,this.readScroller,this.scrollWanted):this.follow()};follow(){w(this,this.readView,this.followView)}followView=e=>{let t=this.size.tick,n=this.props.host.model,r=this.revealed;if(this.revealed=null,e&&r&&this.rows&&(r.top<e.scrollTop-r.head||r.top>e.scrollTop+e.clientHeight)&&this.rows.scrollToIndex(r.row),!e||!(t>0))return;let i=Math.max(1,Math.ceil((e.clientWidth-this.size.head)/t)+1),a=Math.floor(e.scrollStart/t)-i,o=n.state.window;(o.count!==i*3||Math.abs(o.first-Math.max(0,a))>=Yn)&&n.setWindow(a,i*3)};give(){let e=this.rows;if(!e)return;let t=re(this)?this.onPage().find(e=>re(e)):void 0,n=t?.cellWithFocus()??null,r=n?null:t?.pieceWithFocus()??null;e.setData(this.props.host.model.state.rows.slice());let i=n?this.cellAt(n):null;if(r){let e=`${r.slice(0,r.lastIndexOf(`@`))}@`,t=this.props.host.model.state.rows.flatMap(t=>t.pieces.map(e=>e.id).filter(t=>t!==r&&t.startsWith(e)));for(let e of[r,...t])if(i=this.boxOf(e),i)break}i&&p(i,{preventScroll:!0})}scrollTo(e,t){this.wanted={tick:e,row:t,reveal:!1},w(this,this.readScroller,this.scrollWanted)}reveal(e,t){this.wanted={tick:e,row:t,reveal:!0},w(this,this.readScroller,this.scrollWanted)}scrollWanted=e=>{let t=this.wanted,n=this.scroller,r=this.size.tick;if(!t||!e||!n||!t.reveal&&!(r>0))return;this.wanted=null;let{tick:i,row:a}=t,{box:o,head:s}=e,c={};if(!t.reveal){i!==null&&(c.start=Math.max(0,i*r)),a!==null&&(c.top=this.rowTop(a)),ce(n,c),this.follow();return}if(i!==null&&r>0){let e=o.scrollStart,t=o.clientWidth-this.size.head,n=i*r;(n<e||n+r>e+t)&&(c.start=Math.max(0,n<e?n:n+r-t))}if(a!==null){let e=this.rowTop(a),t=this.props.host.model.state.rows[a]?.height??0;e<o.scrollTop?c.top=e:e+t+s>o.scrollTop+o.clientHeight&&(c.top=e+t+s-o.clientHeight),this.rows&&(this.revealed={row:a,top:e,head:s})}ce(n,c),this.follow()};rowTop(e){let t=this.props.host.model.state.rows,n=0;for(let r=0;r<e&&r<t.length;r++)n+=t[r].height;return n}},$n=10,er=96,tr=.4,nr=400,rr=class{host;swipe=null;pinch=null;swipedAt=0;finger=!1;inScroller=new Set;anchor=null;readAnchor=()=>{let e=this.anchor;return e&&!e.scroller.isDisposed?c(e.scroller).scrollHeight:null};keepAnchor=e=>{let t=this.anchor;this.anchor=null,t&&e!==null&&ce(t.scroller,{top:Math.max(0,t.share*e-t.mid)})};constructor(e){this.host=e}get justSwiped(){return Date.now()-this.swipedAt<nr}attach(){let e=this.host.root(),t=[[`pointerdown:capture`,(e,t)=>this.onPointer(e,t)],[`pointermove:passive`,(e,t)=>this.onPointer(e,t)],[`touchstart:passive`,(e,t)=>this.onStart(t)],[`touchmove`,(e,t)=>this.onMove(t)],[`touchend`,(e,t)=>this.onEnd(t)],[`touchcancel`,(e,t)=>this.onEnd(t)],[`contextmenu`,(e,t)=>this.onMenu(t)]];for(let[n,r]of t)e.motif.on(n,r);return()=>{for(let[n,r]of t)e.motif.off(n,r)}}onPointer=(e,t)=>{let n=t.pointerType===`touch`;(t.type!==`pointermove`||!n&&t.pointerType===`mouse`)&&n!==this.finger&&(this.finger=n,D(e,`data-touch`,n))};onMenu=e=>{this.finger&&this.inContent(e)&&e.preventDefault()};onStart=e=>{if(this.host.scroller()?.motif.isEventFrom(e))for(let t of Array.from(e.changedTouches))this.inScroller.add(t.identifier);if(e.touches.length===2){this.stopSwipe(!1),this.startPinch(e);return}if(e.touches.length!==1||!this.host.swipeNavigation()||this.host.dragging())return;let t=this.inContent(e);if(!t)return;let n=e.touches[0],r=new we;r.start(n.clientX,n.clientY),this.swipe={id:n.identifier,x:n.clientX,y:n.clientY,width:c(t).clientWidth,decided:!1,taken:!1,tracker:r}};onMove=e=>{if(this.host.dragging()){e.preventDefault();return}if(this.pinch){this.movePinch(e);return}let t=this.swipe,n=t&&Array.from(e.changedTouches).find(e=>e.identifier===t.id);if(!t||!n)return;t.tracker.move(n.clientX,n.clientY);let r=n.clientX-t.x,i=n.clientY-t.y;if(!t.decided){if(Math.hypot(r,i)<$n)return;if(t.decided=!0,t.taken=Math.abs(r)>Math.abs(i)*1.5&&!this.canScroll(this.towardNext(r)),!t.taken){this.swipe=null;return}}e.preventDefault(),this.host.swiping(r/2,this.towardNext(r),Math.abs(r)>=this.reach(t))};onEnd=e=>{if(!e.touches.length)this.inScroller.clear();else for(let t of Array.from(e.changedTouches))this.inScroller.delete(t.identifier);this.pinch&&e.touches.length<2&&this.stopPinch();let t=this.swipe,n=t&&Array.from(e.changedTouches).find(e=>e.identifier===t.id);if(!t||!n)return;let r=n.clientX-t.x,i=t.tracker.velocity(`x`),a=e.type===`touchend`&&(Math.abs(r)>=this.reach(t)||Math.abs(i)>tr&&Math.abs(r)>20&&Math.sign(i)===Math.sign(r));this.stopSwipe(a?this.towardNext(r):null)};stopSwipe(e){let t=this.swipe;this.swipe=null,t?.taken&&(this.swipedAt=Date.now(),this.host.swiping(null,!0,!1),e!==null&&this.host.step(e?1:-1))}towardNext(e){return this.host.rtl()?e>0:e<0}reach(e){return Math.min(er,e.width/4)}canScroll(e){let t=this.host.scroller();if(!t)return!1;let n=c(t),r=n.scrollWidth-n.clientWidth;if(r<=1)return!1;let i=n.scrollStart;return e?i<r-1:i>1}startPinch(e){let t=this.host.kind(),n=this.host.scroller();if(!this.host.pinchZoom()||t!==`time`&&t!==`timeline`||!n)return;let[r,i]=[e.touches[0],e.touches[1]];if(!this.inScroller.has(r.identifier)||!this.inScroller.has(i.identifier))return;let a=t===`time`?`y`:`x`;this.pinch={axis:a,distance:ir(r,i,a),from:this.host.zoom(),asked:!1,refused:!1}}movePinch(e){let t=this.pinch;if(t.refused||e.touches.length<2)return;let[n,r]=[e.touches[0],e.touches[1]],i=t.from*(ir(n,r,t.axis)/t.distance);if(!t.asked&&(t.asked=!0,!this.host.zoomChanging(t.from,i))){t.refused=!0;return}e.preventDefault();let a=this.host.scroller();if(t.axis===`x`||!a){this.host.setZoom(i);return}if(!this.anchor){let e=c(a),t=(n.clientY+r.clientY)/2-e.top;this.anchor={scroller:a,share:(e.scrollTop+t)/Math.max(1,e.scrollHeight),mid:t}}this.host.setZoom(i),w(a,this.readAnchor,this.keepAnchor)}stopPinch(){let e=this.pinch;if(this.pinch=null,!e?.asked||e.refused)return;let t=this.host.zoom();t!==e.from&&this.host.zoomChanged(e.from,t)}inContent(e){let t=this.host.content();return t?.motif.isEventFrom(e)?t:null}};function ir(e,t,n){return Math.max(24,Math.abs(n===`x`?e.clientX-t.clientX:e.clientY-t.clientY))}var ar=6e4;function or(e,t){let n=[e.start,...e.dates].filter(e=>e<=t),r=e.rule?xt(e.rule):null;if(r&&e.start<=t){let i=pt(r,e.start,e.start,t+1,{wallOf:t=>t+e.offsetFrom*ar});i.length&&n.push(i[i.length-1])}return n.length?Math.max(...n):null}function sr(e,t){if(!e.length)return null;let n=null,r=-1/0;for(let i of e){let e=or(i,t);e!==null&&e>=r&&(n=i,r=e)}if(!n)return t-e.reduce((e,t)=>t.start<e.start?t:e).offsetFrom*ar;let i=(n.offsetTo-n.offsetFrom)*ar;return t-(i>0&&t<r+i?n.offsetFrom:n.offsetTo)*ar}function cr(e,t,n){if(e.utc||e.dateOnly)return e.time;if(e.zone&&R.isValid(e.zone))return R.of(e.zone).moment(e.time);let r=e.zone?t.find(t=>t.id===e.zone):void 0;return(r?sr(r.observances,e.time):null)??R.of(n).moment(e.time)}var lr=/^[A-Za-z0-9-]+$/;function ur(e){let t=e.search(/[;:]/);if(t<1)return null;let n=e.slice(0,t);if(!lr.test(n))return null;let r={},i=t;for(;e[i]===`;`;){let t=e.indexOf(`=`,i);if(t<0)return null;let n=e.slice(i+1,t);if(!lr.test(n))return null;let a=!1,o=t+1;for(;o<e.length;o++){let t=e[o];if(t===`"`)a=!a;else if(!a&&(t===`;`||t===`:`))break}if(o>=e.length)return null;let s=e.slice(t+1,o);r[n.toUpperCase()]=/^"[^"]*"$/.test(s)?s.slice(1,-1):s,i=o}return e[i]===`:`?{name:n.toUpperCase(),params:r,value:e.slice(i+1)}:null}function dr(e){return e.replace(/^﻿/,``).replace(/\r\n?/g,`
`).replace(/\n[ \t]/g,``).split(`
`).filter(e=>e.trim()!==``)}function fr(e){let t=[],n=[];for(let r of dr(e)){let e=ur(r);if(!e)continue;let i=e.value.trim().toUpperCase();if(e.name===`BEGIN`&&i){let e={name:i,properties:[],children:[]};(n.length?n[n.length-1].children:t).push(e),n.push(e)}else if(e.name===`END`){let e=n.map(e=>e.name).lastIndexOf(i);e>=0&&(n.length=e)}else n.length&&n[n.length-1].properties.push(e)}return t}var pr=864e5;function mr(e,t){if(e.dateOnly)return{...e,time:e.time+t.days*pr};let n=e.time+t.days*pr;if(e.utc||!e.zone||!R.isValid(e.zone))return{...e,time:n+t.time};let r=R.of(e.zone);return{...e,time:r.wall(r.moment(n)+t.time)}}var hr=/^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i;function gr(e){let t=e.trim(),n=hr.exec(t);if(!n||/^[+-]?PT?$/i.test(t)||/T$/i.test(t))return null;let[,r,i,a,o,s,c]=n,l=r===`-`?-1:1,u=e=>Number(e??0);return{days:l*(u(i)*7+u(a)),time:l*((u(o)*60+u(s))*60+u(c))*1e3}}function _r(e){let t=(e.params.TZID??``).trim().replace(/^\//,``),n=[];for(let r of e.value.split(`,`)){let e=rt(r.split(`/`)[0]);e&&n.push({...e,zone:e.utc||e.dateOnly?``:t})}return n}function vr(e){return e.replace(/\\(.)/g,(e,t)=>t===`n`||t===`N`?`
`:t)}var yr=[`UID`,`DTSTART`,`DTEND`,`DURATION`,`RECURRENCE-ID`,`SUMMARY`,`DESCRIPTION`,`LOCATION`,`RRULE`,`STATUS`,`DTSTAMP`,`SEQUENCE`];function br(e){let t=new Map,n=new Map,r=[],i=[];for(let a of e.properties)a.name===`EXDATE`?r.push(..._r(a)):yr.includes(a.name)&&!t.has(a.name)?(t.set(a.name,a.value),(a.name.startsWith(`DT`)||a.name===`RECURRENCE-ID`)&&n.set(a.name,_r(a)[0]??null)):i.push(a);let a=n.get(`DTSTART`);if(!a)return null;let o=n.get(`DTEND`)??null;if(!o){let e=gr(t.get(`DURATION`)??``);o=e?mr(a,e):mr(a,{days:+!!a.dateOnly,time:0})}let s=e=>vr(t.get(e)??``),c=(t.get(`SEQUENCE`)??``).trim();return{uid:(t.get(`UID`)??``).trim(),start:a,end:o,summary:s(`SUMMARY`),description:s(`DESCRIPTION`),location:s(`LOCATION`),rule:(t.get(`RRULE`)??``).trim(),exceptions:r,recurrenceId:n.get(`RECURRENCE-ID`)??null,status:(t.get(`STATUS`)??``).trim().toUpperCase(),stamp:n.get(`DTSTAMP`)?.time??null,sequence:/^\d+$/.test(c)?Number(c):null,other:i}}function xr(e){let t=/^([+-])(\d{2})(\d{2})(\d{2})?$/.exec(e.trim());if(!t)return null;let n=Number(t[2])*60+Number(t[3])+Number(t[4]??0)/60;return t[1]===`-`?-n:n}var Sr=6e4;function Cr(e){let t=t=>e.properties.find(e=>e.name===t)?.value??``,n=rt(t(`DTSTART`)),r=xr(t(`TZOFFSETTO`));if(!n||r===null)return null;let i=xr(t(`TZOFFSETFROM`))??r,a=e.properties.filter(e=>e.name===`RDATE`).flatMap(_r).map(e=>e.utc?e.time+i*Sr:e.time);return{kind:e.name===`DAYLIGHT`?`daylight`:`standard`,start:n.utc?n.time+i*Sr:n.time,offsetFrom:i,offsetTo:r,name:vr(t(`TZNAME`)),rule:t(`RRULE`).trim(),dates:a}}function wr(e){let t=(e.properties.find(e=>e.name===`TZID`)?.value??``).trim().replace(/^\//,``);return t?{id:t,observances:e.children.filter(e=>e.name===`STANDARD`||e.name===`DAYLIGHT`).map(Cr).filter(e=>e!==null)}:null}function Tr(e){let t={events:[],timeZones:[],name:``,timeZone:``,prodId:``,method:``},n=e=>{if(e.name===`VEVENT`){let n=br(e);n&&t.events.push(n)}else if(e.name===`VTIMEZONE`){let n=wr(e);n&&t.timeZones.push(n)}};for(let r of fr(e)){if(r.name!==`VCALENDAR`){n(r);continue}let e=e=>r.properties.find(t=>t.name===e)?.value.trim()??``;t.name||=vr(e(`X-WR-CALNAME`)),t.timeZone||=e(`X-WR-TIMEZONE`),t.prodId||=vr(e(`PRODID`)),t.method||=e(`METHOD`).toUpperCase(),r.children.forEach(n)}return t}function Er(e){return e.replace(/[\\;,]/g,e=>`\\${e}`).replace(/\r\n|\r|\n/g,`\\n`)}function Dr(e,t){let n=t[0],r={};return n.dateOnly?r.VALUE=`DATE`:n.zone&&!n.utc&&(r.TZID=n.zone),{name:e,params:r,value:t.map(B).join(`,`)}}function Or(e){return/[:;,]/.test(e)&&!e.includes(`"`)?`"${e}"`:e}function kr(e){let t=Object.entries(e.params).map(([e,t])=>`;${e}=${Or(t)}`);return`${e.name}${t.join(``)}:${e.value}`}var Ar=864e5,jr=e=>e&&R.isValid(e)?R.of(e):null;function Mr(e,t){let n=t.utc&&!t.dateOnly,r=t.dateOnly||t.utc?``:t.zone;if(e.utc===n&&e.dateOnly===t.dateOnly&&e.zone===r)return e;let i=e.dateOnly?null:jr(e.zone),a=e.utc?e.time:i?i.moment(e.time):null,o=jr(t.zone),s=e.time;return a!==null&&(s=n?a:o?o.wall(a):e.time),t.dateOnly&&(s=Math.floor(s/Ar)*Ar),{time:s,utc:n,dateOnly:t.dateOnly,zone:r}}function Nr(e,t,n){let r=[`BEGIN:VEVENT`],i=e.uid||`${B(e.start)}-${n+1}@motifjs`;r.push(`UID:${i}`),r.push(`DTSTAMP:${B({time:e.stamp??t,utc:!0,dateOnly:!1})}`),r.push(kr(Dr(`DTSTART`,[e.start]))),e.end&&r.push(kr(Dr(`DTEND`,[e.end]))),e.recurrenceId&&r.push(kr(Dr(`RECURRENCE-ID`,[e.recurrenceId])));for(let[t,n]of[[`SUMMARY`,e.summary],[`DESCRIPTION`,e.description],[`LOCATION`,e.location]])n&&r.push(`${t}:${Er(n)}`);return e.rule&&r.push(`RRULE:${e.rule.replace(/^RRULE:/i,``)}`),e.exceptions.length&&r.push(kr(Dr(`EXDATE`,e.exceptions.map(t=>Mr(t,e.start))))),e.status&&r.push(`STATUS:${e.status.toUpperCase()}`),e.sequence!==null&&r.push(`SEQUENCE:${e.sequence}`),r.push(...e.other.map(kr)),r.push(`END:VEVENT`),r}var Pr=75;function Fr(e){let t=e.codePointAt(0);return t<128?1:t<2048?2:t<65536?3:4}function Ir(e){let t=[],n=``,r=0;for(let i of e){let e=Fr(i);r+e>Pr&&(t.push(n),n=` `,r=1),n+=i,r+=e}return t.push(n),t.join(`\r
`)}var Lr=e=>String(e).padStart(2,`0`);function Rr(e){let t=Math.round(Math.abs(e)*60),n=`${Lr(Math.floor(t/3600))}${Lr(Math.floor(t/60)%60)}${t%60?Lr(t%60):``}`;return`${e<0?`-`:`+`}${n}`}var zr=[`en-US`,`en-GB`,`en-AU`],Br=new Map;function Vr(e,t){for(let n of zr){let r=`${n} ${e}`,i=Br.get(r);i||(i=new Intl.DateTimeFormat(n,{timeZone:e||void 0,timeZoneName:`short`}),Br.set(r,i));let a=i.formatToParts(t).find(e=>e.type===`timeZoneName`)?.value??``;if(a&&!/^(GMT|UTC).*\d/.test(a))return a}return``}var Hr=6e4,Ur=864e5,Wr=e=>e.to>e.from?`DAYLIGHT`:`STANDARD`,Gr=e=>new Date(e).getUTCFullYear(),Kr=e=>B({time:e,utc:!1,dateOnly:!1});function qr(e,t,n){let r=[],i=Date.UTC(n+1,0,1),a=e.offset(Date.UTC(t,0,1));for(let o=Date.UTC(t,0,1);o<i;o+=Ur){let i=e.offset(o+Ur);if(i===a)continue;let s=o,c=o+Ur;for(;c-s>Hr;){let t=s+Math.floor((c-s)/2/Hr)*Hr;e.offset(t)===a?s=t:c=t}let l=c+a*Hr,u=Gr(l);u>=t&&u<=n&&r.push({wall:l,from:a,to:e.offset(c),name:Vr(e.name,c)}),a=i}return r}function Jr(e,t,n){if(e.length!==n-t+1)return``;let r=e[0],i=e.map(e=>new Date(e.wall));if(!e.every((e,n)=>Gr(e.wall)===t+n&&e.from===r.from&&e.to===r.to&&e.name===r.name&&e.wall%Ur===r.wall%Ur&&i[n].getUTCMonth()===i[0].getUTCMonth()&&i[n].getUTCDay()===i[0].getUTCDay()))return``;let a=e=>new Date(Date.UTC(e.getUTCFullYear(),e.getUTCMonth()+1,0)).getUTCDate(),o=e=>Math.floor((e.getUTCDate()-1)/7)+1,s=0;return i.every(e=>e.getUTCDate()>a(e)-7)?s=-1:i.every(e=>o(e)===o(i[0]))&&(s=o(i[0])),s?`FREQ=YEARLY;BYMONTH=${i[0].getUTCMonth()+1};BYDAY=${s}${H[i[0].getUTCDay()]}`:``}function Yr(e,t,n,r,i,a){return[`BEGIN:${e}`,`DTSTART:${Kr(t)}`,...a,`TZOFFSETFROM:${Rr(n)}`,`TZOFFSETTO:${Rr(r)}`,...i?[`TZNAME:${i}`]:[],`END:${e}`]}function Xr(e,t,n){let r=R.of(e),i=[`BEGIN:VTIMEZONE`,`TZID:${e}`],a=qr(r,t,n);if(!a.length){let n=Date.UTC(t,0,1),a=r.offset(n);return i.push(...Yr(`STANDARD`,Date.UTC(1970,0,1),a,a,Vr(e,n),[])),[...i,`END:VTIMEZONE`]}let o=[];for(let e of[`STANDARD`,`DAYLIGHT`]){let r=a.filter(t=>Wr(t)===e);if(!r.length)continue;let i=Jr(r,t,n);if(i){let t=r[0];o.push({start:t.wall,lines:Yr(e,t.wall,t.from,t.to,t.name,[`RRULE:${i}`])});continue}let s=new Map;for(let e of r){let t=`${e.from} ${e.to} ${e.name}`;s.set(t,[...s.get(t)??[],e])}for(let[t,...n]of s.values()){let r=n.length?[`RDATE:${n.map(e=>Kr(e.wall)).join(`,`)}`]:[];o.push({start:t.wall,lines:Yr(e,t.wall,t.from,t.to,t.name,r)})}}return o.sort((e,t)=>e.start-t.start),[...i,...o.flatMap(e=>e.lines),`END:VTIMEZONE`]}var Zr=e=>[e.start,e.end,e.recurrenceId,...e.exceptions].filter(e=>e!==null);function Qr(e,t,n){let r=t.flatMap(Zr).filter(t=>t.zone===e).map(e=>new Date(e.time).getUTCFullYear()),i=r.length?Math.min(...r):new Date(n).getUTCFullYear();return[i,(r.length?Math.max(...r):i)+1]}function $r(e){let t=e.stamp??Date.now(),n=e.events,r=(e.timeZones??[...new Set(n.flatMap(Zr).map(e=>e.zone))]).filter(e=>e&&R.isValid(e)),i=[`BEGIN:VCALENDAR`,`VERSION:2.0`,`PRODID:${e.prodId??`-//MotifJS//Scheduler//EN`}`,`CALSCALE:GREGORIAN`,`METHOD:${e.method??`PUBLISH`}`];e.name&&i.push(`X-WR-CALNAME:${Er(e.name)}`);for(let e of r)i.push(...Xr(e,...Qr(e,n,t)));return n.forEach((e,n)=>i.push(...Nr(e,t,n))),i.push(`END:VCALENDAR`),`${i.map(Ir).join(`\r
`)}\r\n`}var ei=class{options;uids=new WeakMap;seriesUids=new WeakMap;constructor(e){this.options=e}appointmentsIn(e){let{model:t,fields:n}=this.options,r=M(this.options.items()).filter(e=>C(e,n().visible)!==!1);if(!e)return[...r];let i=e.start.getTime(),a=e.end.getTime();return r.filter(e=>t.occurrences.ruleOf(e)?t.occurrences.of(e,i,a).some(e=>this.touches(e,i,a)):this.touches(e,i,a))}write(e,t){let n=new Set;return $r({events:e.map(e=>this.eventOf(e,n)).filter(e=>!!e),name:t})}read(e){let t=Tr(e),n=this.options.fields(),r=this.options.timeZone()||t.timeZone||null,i=this.options.timeZone()||R.localName(),a=new Map,o=[],s=[],c=e=>cr(e,t.timeZones,r);for(let e of t.events){let t=e.start.dateOnly,r=t?R.localOfWall(e.start.time):new Date(c(e.start)),l=e.end??e.start,u=t?R.localOfWall(e.end?e.end.time:e.start.time+864e5):new Date(c(l)),d={[n.text]:e.summary,[n.start]:r,[n.end]:u,[n.allDay]:t};e.description&&(d[n.description]=e.description);let f=e.start.zone&&R.isValid(e.start.zone)&&e.start.zone!==i?e.start.zone:``;f&&!t&&(d[n.startTimeZone]=f);let p=e.end?.zone&&R.isValid(e.end.zone)&&e.end.zone!==(f||i)?e.end.zone:``;if(p&&!t&&(d[n.endTimeZone]=p),e.rule&&(d[n.recurrenceRule]=e.rule),e.exceptions.length&&(d[n.recurrenceException]=e.exceptions.map(e=>B(this.inZone(e,f||i,c))).join(`,`)),e.recurrenceId){s.push({event:e,values:d});continue}e.status!==`CANCELLED`&&(this.uids.set(d,e.uid),this.options.hasSource()||(d[n.key]=e.uid),a.set(e.uid,d),o.push(d))}let l=[...o];for(let{event:e,values:t}of s){let r=a.get(e.uid),o=e.recurrenceId;if(r){let e=String(r[n.startTimeZone]||i),t=V(r[n.recurrenceException]),a=this.inZone(o,e,c);t.some(e=>e.time===a.time&&e.utc===a.utc)||(r[n.recurrenceException]=tt(r[n.recurrenceException],a))}e.status!==`CANCELLED`&&(delete t[n.recurrenceRule],delete t[n.recurrenceException],t[n.recurrenceId]=e.uid,this.seriesUids.set(t,e.uid),this.options.hasSource()||(t[n.key]=`${e.uid}/${B(o)}`),l.push(t))}return l}async save(e){let{editor:t,store:n,fields:r}=this.options,i=r(),a=new Map,o={added:[],updated:[],failed:[]};for(let r of e){let e=r,s=this.seriesUids.get(r);s!==void 0&&a.has(s)&&(e[i.recurrenceId]=a.get(s));let c=e[i.key],l=c===void 0?void 0:M(this.options.items()).find(e=>C(e,i.key)===c);if(l){await t.update(l,r,!1)?o.updated.push(l):o.failed.push(r);continue}let u=await t.add(r,!1);if(!u){o.failed.push(r);continue}o.added.push(u);let d=this.uids.get(r);d!==void 0&&a.set(d,n.keyOf(u))}return o}touches(e,t,n){let r=this.options.model.timeOf(e);if(!r)return!1;let i=r.start.getTime(),a=r.end.getTime();return i<n&&(a>t||a===i&&i>=t)}eventOf(e,t){let{model:n,store:r}=this.options,i=this.options.fields(),a=t=>C(e,t),o=W(a(i.start));if(!o)return null;let s=W(a(i.end))??o,c=!!a(i.allDay),l=String(a(i.startTimeZone)||this.options.timeZone()||R.localName()),u=String(a(i.endTimeZone)||l),d=(e,t)=>({time:R.of(t).wall(e),utc:!1,dateOnly:!1,zone:t}),f=e=>({time:R.wallOfLocal(e),utc:!1,dateOnly:!0,zone:``}),p={uid:String(r.keyOf(e)??``),start:c?f(o):d(o,l),end:c?f(s>o?s:new Date(o.getTime()+864e5)):d(s<o?o:s,u),summary:String(a(i.text)??``),description:String(a(i.description)??``),location:``,rule:``,exceptions:[],recurrenceId:null,status:``,stamp:null,sequence:null,other:[]},m=n.occurrences.ruleOf(e);if(m){let e={...m};e.until&&!e.until.utc&&!e.until.dateOnly&&!c&&(e.until={time:R.of(l).moment(e.until.time),utc:!0,dateOnly:!1}),p.rule=ot(e),p.exceptions=V(a(i.recurrenceException)).map(e=>c?{time:e.utc?n.zone.wall(e.time):e.time,utc:!1,dateOnly:!0,zone:``}:{...e,dateOnly:!1,zone:e.utc?``:l})}if(n.isException(e)){let i=n.seriesOf(e);i&&(p.uid=String(r.keyOf(i)??p.uid),p.recurrenceId=this.replaced(i,o,c,t))}return p}replaced(e,t,n,r){let{model:i}=this.options,a=this.options.fields(),o=t=>C(e,t),s=String(o(a.startTimeZone)||this.options.timeZone()||R.localName()),c=R.of(s),l=String(this.options.store.keyOf(e)),u=null;for(let e of V(o(a.recurrenceException))){let a=e.utc?e.time:n||e.dateOnly?i.zone.moment(e.time):c.moment(e.time),o=`${l}|${a}`;if(r.has(o))continue;let d=Math.abs(a-t.getTime());u&&u.far<=d||(u={date:n?{time:i.zone.wall(a),utc:!1,dateOnly:!0,zone:``}:{time:c.wall(a),utc:!1,dateOnly:!1,zone:s},far:d,id:o})}return u?(r.add(u.id),u.date):n?{time:R.wallOfLocal(t),utc:!1,dateOnly:!0,zone:``}:{time:c.wall(t),utc:!1,dateOnly:!1,zone:s}}inZone(e,t,n){return e.dateOnly?{...e,utc:!1,zone:``}:{time:R.of(t).wall(n(e)),utc:!1,dateOnly:!1,zone:t}}},ti=`appointments.dataSource.remoteFiltering.fields.views.currentView.currentDate.firstDayOfWeek.workDays.workStartHour.workEndHour.startDayHour.endDayHour.cellDuration.allDayPanel.allDayLines.maxAppointmentsPerCell.overlapMode.isHoliday.showCurrentTime.dimPast.scrollHour.toolbar.locale.timeZone.seriesEdit.recurrenceMarks.appointmentTemplate.appointmentTooltipTemplate.dataCellTemplate.dateCellTemplate.timeCellTemplate.agendaRowTemplate.moreListTemplate.agendaDuration.scrolling.resources.groups.groupByDate.resourceHeaderTemplate.blockedTimes.allowOverlap.allowOffHours.texts.keys.announce.editing.snapMinutes.minDuration.tooltip.presentation.tabletWidth.phoneWidth.tabletWhen.phoneView.tabletView.swipeNavigation.pinchZoom.timeZoom`.split(`.`),ni={views:`groups`,currentView:`groups`,startDayHour:`groups`,endDayHour:`groups`,cellDuration:`groups`,allDayPanel:`groups`,maxAppointmentsPerCell:`groups`,agendaDuration:`groups`,scrolling:`groups`,groups:`groups`,groupByDate:`groups`,workDays:`groups`,workStartHour:`groups`,workEndHour:`groups`,firstDayOfWeek:`groups`,isHoliday:`groups`,timeZone:`groups`,phoneView:`groups`,tabletView:`groups`,currentDate:`days`,blockedTimes:`blocks`,appointments:`collect`,dataSource:`collect`,fields:`collect`,overlapMode:`layout`,allDayLines:`layout`},ri=.5,ii=4,ai={allowAdding:!0,allowUpdating:!0,allowDeleting:!0,allowDragging:!0,allowResizing:!0,allowCopying:!0,confirmDelete:!0,allowRecurrence:!0,allowTimeZones:!1},oi=new Set([`isHoliday`,`appointmentTemplate`,`appointmentTooltipTemplate`,`dataCellTemplate`,`dateCellTemplate`,`timeCellTemplate`,`agendaRowTemplate`,`moreListTemplate`,`resourceHeaderTemplate`,`allowOverlap`]),si={key:`id`,start:`startDate`,end:`endDate`,text:`text`,allDay:`allDay`,description:`description`,color:`color`,disabled:`disabled`,visible:`visible`,allowDrag:`allowDrag`,allowResize:`allowResize`,allowEdit:`allowEdit`,allowDelete:`allowDelete`,recurrenceRule:`recurrenceRule`,recurrenceException:`recurrenceException`,recurrenceId:`recurrenceId`,startTimeZone:`startDateTimeZone`,endTimeZone:`endDateTimeZone`},ci={today:[`T`],next:[`N`,`J`],previous:[`P`,`K`],dayView:[`D`],weekView:[`W`],workWeekView:[`X`],monthView:[`M`],agendaView:[`A`],previousGroup:[`Alt+Shift+ArrowLeft`],nextGroup:[`Alt+Shift+ArrowRight`]},li={day:`schedulerDay`,week:`schedulerWeek`,workWeek:`schedulerWorkWeek`,month:`schedulerMonth`,timelineDay:`schedulerTimelineDay`,timelineWeek:`schedulerTimelineWeek`,timelineWorkWeek:`schedulerTimelineWorkWeek`,timelineMonth:`schedulerTimelineMonth`,agenda:`schedulerAgenda`},ui=[`day`,`week`,`workWeek`,`month`],di=Symbol(`mx.scheduler`),fi=class extends r{constructor(e){super(e),this.viewOfButton=new WeakMap,this.readLook=()=>x(this,[`--_scheduler-phone-bar-size`])[`--_scheduler-phone-bar-size`],this.useLook=e=>{let t=this.parts.version,n=e===`sm`||e===`md`?e:`lg`;t.phoneBarSize!==n&&(t.phoneBarSize=n,this.drawBar())},this.readGrid=()=>{let e=this.parts,t=e.model.state.slots.length-1,n=e.scroller,r=n&&e.model.kind===`time`&&t>=0?this.builtCell(0):null,i=r?e.viewNow?.cellAt({column:r.column,slot:t}):null;return!n||!r||!i?null:{scroller:n,box:c(n),first:j(r.cell),end:j(i),column:r.column}},this.scrollGrid=e=>{let t=this.parts.gridScroll,{share:n,column:r}=t;if(t.share=t.column=null,!e)return;let{box:i,first:a,end:o}=e,s={};n!==null&&(s.top=Math.max(0,a.top-i.top-i.clientTop+i.scrollTop+n*(o.bottom-a.top)));let c=a.width;if(r!==null&&c>0){let t=i.left+i.clientLeft,n=(i.rtl?t+i.clientWidth-a.right:a.left-t)+i.scrollStart-e.column*c,o=r*c,l=i.clientWidth-n;(o<i.scrollStart||o+c>i.scrollStart+l)&&(s.start=Math.max(0,o<i.scrollStart?o:o+c-l))}ce(e.scroller,s)};let t=this.props??{};for(let e of ti)t[e]!==void 0&&this.bindOwn(e,t[e]);t.label!==void 0&&this.bindProperty(`text`,t.label);let n=this.parts,r=[[t.onViewChanging,n.viewChanging],[t.onViewChanged,n.viewChanged],[t.onDateChanging,n.dateChanging],[t.onDateChanged,n.dateChanged],[t.onCellClick,n.cellClick],[t.onCellDblClick,n.cellDblClick],[t.onAppointmentClick,n.appointmentClick],[t.onAppointmentDblClick,n.appointmentDblClick],[t.onSelectionChanged,n.selectionChanged],[t.onContentReady,n.contentReady],[t.onMoreOpening,n.moreOpening],[t.onAppointmentAdding,n.events.adding],[t.onAppointmentAdded,n.events.added],[t.onAppointmentUpdating,n.events.updating],[t.onAppointmentUpdated,n.events.updated],[t.onAppointmentDeleting,n.events.deleting],[t.onAppointmentDeleted,n.events.deleted],[t.onFormOpening,n.events.formOpening],[t.onDataError,n.events.dataError],[t.onMoveStart,n.events.moveStart],[t.onMoving,n.events.moving],[t.onMoveEnd,n.events.moveEnd],[t.onResizeStart,n.events.resizeStart],[t.onResizing,n.events.resizing],[t.onResizeEnd,n.events.resizeEnd],[t.onSeriesAsking,n.events.seriesAsking],[t.onSeriesAnswered,n.events.seriesAnswered],[t.onPresentationChanging,n.presentationChanging],[t.onPresentationChanged,n.presentationChanged],[t.onTimeZoomChanging,n.timeZoomChanging],[t.onTimeZoomChanged,n.timeZoomChanged],[t.onICalendarExporting,n.icalendarExporting],[t.onICalendarExported,n.icalendarExported],[t.onICalendarImporting,n.icalendarImporting],[t.onICalendarImported,n.icalendarImported],[t.onPrinting,n.printing],[t.onPrinted,n.printed]];for(let[e,t]of r)e&&t.event(e);this.motif.setDisposable(()=>{n.model.dispose(),n.drag.dispose(),n.editor.dispose(),n.stopSource?.();for(let e of n.stopKeys)e();for(let[,e]of r)e.dispose()})}get label(){return this.text}set label(e){this.text=e}get appointments(){return this.getProperty(`appointments`)??[]}set appointments(e){this.assignProperty(`appointments`,e)}get dataSource(){return this.getProperty(`dataSource`)??null}set dataSource(e){this.assignProperty(`dataSource`,e)}get remoteFiltering(){return this.getProperty(`remoteFiltering`)??!0}set remoteFiltering(e){this.assignProperty(`remoteFiltering`,e,Boolean)}get fields(){return{...si,...this.getProperty(`fields`)??{}}}set fields(e){this.assignProperty(`fields`,e)}get views(){return this.getProperty(`views`)??ui}set views(e){this.assignProperty(`views`,e)}get currentView(){let e=this.viewList(),t=this.getProperty(`currentView`);return t&&e.some(e=>e.name===t)?t:(e.find(e=>e.type===`week`)??e[0])?.name??`week`}set currentView(e){this.assignProperty(`currentView`,e)}get currentDate(){let e=this.getProperty(`currentDate`);return e instanceof Date&&!Number.isNaN(e.getTime())?e:this.today()}set currentDate(e){this.assignProperty(`currentDate`,e)}get firstDayOfWeek(){let e=this.getProperty(`firstDayOfWeek`);return typeof e==`number`?(Math.round(e)%7+7)%7:je(this.locale)}set firstDayOfWeek(e){this.assignProperty(`firstDayOfWeek`,e)}get workDays(){return this.getProperty(`workDays`)??[1,2,3,4,5]}set workDays(e){this.assignProperty(`workDays`,e)}get workStartHour(){return this.getProperty(`workStartHour`)??9}set workStartHour(e){this.assignProperty(`workStartHour`,e,Number)}get workEndHour(){return this.getProperty(`workEndHour`)??17}set workEndHour(e){this.assignProperty(`workEndHour`,e,Number)}get startDayHour(){return this.getProperty(`startDayHour`)??0}set startDayHour(e){this.assignProperty(`startDayHour`,e,Number)}get endDayHour(){return this.getProperty(`endDayHour`)??24}set endDayHour(e){this.assignProperty(`endDayHour`,e,Number)}get cellDuration(){return this.getProperty(`cellDuration`)??30}set cellDuration(e){this.assignProperty(`cellDuration`,e,Number)}get allDayPanel(){return this.getProperty(`allDayPanel`)??!0}set allDayPanel(e){this.assignProperty(`allDayPanel`,e,Boolean)}get allDayLines(){return Math.max(1,this.getProperty(`allDayLines`)??3)}set allDayLines(e){this.assignProperty(`allDayLines`,e,Number)}get maxAppointmentsPerCell(){return this.getProperty(`maxAppointmentsPerCell`)??`auto`}set maxAppointmentsPerCell(e){this.assignProperty(`maxAppointmentsPerCell`,e)}get agendaDuration(){return Math.max(1,Math.round(this.getProperty(`agendaDuration`)??7))}set agendaDuration(e){this.assignProperty(`agendaDuration`,e,Number)}get scrolling(){return this.getProperty(`scrolling`)??`auto`}set scrolling(e){this.assignProperty(`scrolling`,e)}get overlapMode(){return this.getProperty(`overlapMode`)??`columns`}set overlapMode(e){this.assignProperty(`overlapMode`,e)}get isHoliday(){return this.getProperty(`isHoliday`)??null}set isHoliday(e){this.bindOwn(`isHoliday`,e)}get showCurrentTime(){return this.getProperty(`showCurrentTime`)??!0}set showCurrentTime(e){this.assignProperty(`showCurrentTime`,e,Boolean)}get dimPast(){return this.getProperty(`dimPast`)??!1}set dimPast(e){this.assignProperty(`dimPast`,e,Boolean)}get scrollHour(){return this.getProperty(`scrollHour`)??null}set scrollHour(e){this.assignProperty(`scrollHour`,e)}get toolbar(){return this.getProperty(`toolbar`)??!0}set toolbar(e){this.assignProperty(`toolbar`,e,Boolean)}get locale(){return this.getProperty(`locale`)||s.locale}set locale(e){this.assignProperty(`locale`,e)}get timeZone(){return this.getProperty(`timeZone`)||null}set timeZone(e){this.assignProperty(`timeZone`,e)}get seriesEdit(){return this.getProperty(`seriesEdit`)??`ask`}set seriesEdit(e){this.assignProperty(`seriesEdit`,e)}get recurrenceMarks(){return this.getProperty(`recurrenceMarks`)??!0}set recurrenceMarks(e){this.assignProperty(`recurrenceMarks`,e,Boolean)}get appointmentTemplate(){return this.getProperty(`appointmentTemplate`)??null}set appointmentTemplate(e){this.bindOwn(`appointmentTemplate`,e)}get appointmentTooltipTemplate(){return this.getProperty(`appointmentTooltipTemplate`)??null}set appointmentTooltipTemplate(e){this.bindOwn(`appointmentTooltipTemplate`,e)}get dataCellTemplate(){return this.getProperty(`dataCellTemplate`)??null}set dataCellTemplate(e){this.bindOwn(`dataCellTemplate`,e)}get dateCellTemplate(){return this.getProperty(`dateCellTemplate`)??null}set dateCellTemplate(e){this.bindOwn(`dateCellTemplate`,e)}get timeCellTemplate(){return this.getProperty(`timeCellTemplate`)??null}set timeCellTemplate(e){this.bindOwn(`timeCellTemplate`,e)}get agendaRowTemplate(){return this.getProperty(`agendaRowTemplate`)??null}set agendaRowTemplate(e){this.bindOwn(`agendaRowTemplate`,e)}get moreListTemplate(){return this.getProperty(`moreListTemplate`)??null}set moreListTemplate(e){this.bindOwn(`moreListTemplate`,e)}get resources(){return this.getProperty(`resources`)??[]}set resources(e){this.assignProperty(`resources`,e)}get groups(){return this.getProperty(`groups`)??[]}set groups(e){this.assignProperty(`groups`,e)}get groupByDate(){return this.getProperty(`groupByDate`)??!1}set groupByDate(e){this.assignProperty(`groupByDate`,e,Boolean)}get resourceHeaderTemplate(){return this.getProperty(`resourceHeaderTemplate`)??null}set resourceHeaderTemplate(e){this.bindOwn(`resourceHeaderTemplate`,e)}get blockedTimes(){return this.getProperty(`blockedTimes`)??[]}set blockedTimes(e){this.assignProperty(`blockedTimes`,e)}get allowOverlap(){return this.getProperty(`allowOverlap`)??!0}set allowOverlap(e){this.bindOwn(`allowOverlap`,e)}get allowOffHours(){return this.getProperty(`allowOffHours`)??!0}set allowOffHours(e){this.assignProperty(`allowOffHours`,e,Boolean)}get texts(){return this.getProperty(`texts`)??{}}set texts(e){this.assignProperty(`texts`,e)}get keys(){return{...ci,...this.getProperty(`keys`)??{}}}set keys(e){this.assignProperty(`keys`,e)}get announce(){return this.getProperty(`announce`)??!0}set announce(e){this.assignProperty(`announce`,e,Boolean)}get editing(){let e=this.getProperty(`editing`);return e===!1?Object.fromEntries(Object.keys(ai).map(e=>[e,e===`confirmDelete`])):{...ai,...typeof e==`object`&&e?e:{}}}set editing(e){this.assignProperty(`editing`,e)}get snapMinutes(){return Math.max(1,this.getProperty(`snapMinutes`)??this.resolveView().cellDuration)}set snapMinutes(e){this.assignProperty(`snapMinutes`,e,Number)}get minDuration(){return Math.max(1,this.getProperty(`minDuration`)??this.snapMinutes)}set minDuration(e){this.assignProperty(`minDuration`,e,Number)}get tooltip(){return this.getProperty(`tooltip`)??!0}set tooltip(e){this.assignProperty(`tooltip`,e,Boolean)}get presentation(){return this.getProperty(`presentation`)??`auto`}set presentation(e){this.assignProperty(`presentation`,e)}get tabletWidth(){return this.getProperty(`tabletWidth`)??1024}set tabletWidth(e){this.assignProperty(`tabletWidth`,e,Number)}get phoneWidth(){return this.getProperty(`phoneWidth`)??560}set phoneWidth(e){this.assignProperty(`phoneWidth`,e,Number)}get tabletWhen(){return this.getProperty(`tabletWhen`)??`touch`}set tabletWhen(e){this.assignProperty(`tabletWhen`,e)}get phoneView(){let e=this.getProperty(`phoneView`);return e===void 0?`agenda`:e||null}set phoneView(e){this.assignProperty(`phoneView`,e)}get tabletView(){return this.getProperty(`tabletView`)||null}set tabletView(e){this.assignProperty(`tabletView`,e)}get swipeNavigation(){return this.getProperty(`swipeNavigation`)??!0}set swipeNavigation(e){this.assignProperty(`swipeNavigation`,e,Boolean)}get pinchZoom(){return this.getProperty(`pinchZoom`)??!0}set pinchZoom(e){this.assignProperty(`pinchZoom`,e,Boolean)}get timeZoom(){let e=Number(this.getProperty(`timeZoom`)??1);return Number.isFinite(e)?Math.max(ri,Math.min(ii,e)):1}set timeZoom(e){this.assignProperty(`timeZoom`,e,Number)}get currentPresentation(){return this.parts.version.presentation}get visibleRange(){return this.parts.model.range()}get resolvedView(){return this.resolveView()}get selectedCells(){return this.parts.model.selection()}get shownAppointments(){return this.parts.model.shown()}get loading(){return this.dataSource?.status===`loading`}setStatus(e){let t=this.parts.version;t.status!==e&&(t.status=e,this.drawStates())}setTouchSelected(e){let t=this.parts.version;t.touchSelected!==e&&(t.touchSelected=e,this.drawAgain())}drawSwipe(e,t,n){let r=this.parts;Object.assign(r.version.swipe,{active:e!==null,x:e??0,next:t,ready:n});let i=r.content;i&&(D(i,`data-swiping`,e!==null),o(i,`--_swipe`,e===null?``:`${e}px`)),this.drawSwipeEdge()}get onViewChanging(){return this.parts.viewChanging.event}get onViewChanged(){return this.parts.viewChanged.event}get onDateChanging(){return this.parts.dateChanging.event}get onDateChanged(){return this.parts.dateChanged.event}get onCellClick(){return this.parts.cellClick.event}get onCellDblClick(){return this.parts.cellDblClick.event}get onAppointmentClick(){return this.parts.appointmentClick.event}get onAppointmentDblClick(){return this.parts.appointmentDblClick.event}get onSelectionChanged(){return this.parts.selectionChanged.event}get onContentReady(){return this.parts.contentReady.event}get onMoreOpening(){return this.parts.moreOpening.event}get onAppointmentAdding(){return this.parts.events.adding.event}get onAppointmentAdded(){return this.parts.events.added.event}get onAppointmentUpdating(){return this.parts.events.updating.event}get onAppointmentUpdated(){return this.parts.events.updated.event}get onAppointmentDeleting(){return this.parts.events.deleting.event}get onAppointmentDeleted(){return this.parts.events.deleted.event}get onFormOpening(){return this.parts.events.formOpening.event}get onDataError(){return this.parts.events.dataError.event}get onMoveStart(){return this.parts.events.moveStart.event}get onMoving(){return this.parts.events.moving.event}get onMoveEnd(){return this.parts.events.moveEnd.event}get onResizeStart(){return this.parts.events.resizeStart.event}get onResizing(){return this.parts.events.resizing.event}get onResizeEnd(){return this.parts.events.resizeEnd.event}get onSeriesAsking(){return this.parts.events.seriesAsking.event}get onSeriesAnswered(){return this.parts.events.seriesAnswered.event}get onPresentationChanging(){return this.parts.presentationChanging.event}get onPresentationChanged(){return this.parts.presentationChanged.event}get onTimeZoomChanging(){return this.parts.timeZoomChanging.event}get onTimeZoomChanged(){return this.parts.timeZoomChanged.event}get onICalendarExporting(){return this.parts.icalendarExporting.event}get onICalendarExported(){return this.parts.icalendarExported.event}get onICalendarImporting(){return this.parts.icalendarImporting.event}get onICalendarImported(){return this.parts.icalendarImported.event}get onPrinting(){return this.parts.printing.event}get onPrinted(){return this.parts.printed.event}goToday(){return this.changeDate(this.today(),!1)}next(){return this.changeDate(gn(this.resolveView(),this.currentDate,1),!1)}previous(){return this.changeDate(gn(this.resolveView(),this.currentDate,-1),!1)}showDate(e){return this.changeDate(e,!1)}showView(e){return this.changeView(e,!1)}scrollToTime(e,t=0){let n=this.resolveView(),r=G(n.type);if(!this.parts.scroller||r===`month`||r===`agenda`)return;if(r===`timeline`){let n=this.parts.model.state.days.findIndex(e=>Ae(e.local,this.currentDate));this.parts.timeline?.scrollTo(this.tickAt(Math.max(0,n),e*60+t),null);return}let i=(n.endDayHour-n.startDayHour)*60;i>0&&(this.parts.gridScroll.share=Math.max(0,(e*60+t-n.startDayHour*60)/i),w(this,this.readGrid,this.scrollGrid))}scrollTo(e,t=null){let n=this.parts.model,r=n.kind,i=this.placeOf(e,K(n.view.type),t);if(i){if(r===`timeline`){let t=n.state.columns[i.column],r=n.state.rows.find(e=>e.group===t?.group)?.index??0,a=(n.zone.wall(e)-(t?.day.wall??0))/6e4;this.parts.timeline?.scrollTo(this.tickAt(t?.day.index??0,a),r);return}if(r===`time`){let t=n.zone.wall(e)-(n.state.columns[i.column]?.day.wall??0);this.scrollToTime(Math.floor(t/36e5),Math.floor(t%36e5/6e4)),this.revealColumn(i.column)}}}appointmentsIn(e,t){return this.parts.model.appointmentsIn(e,t)}findAppointment(e){let t=this.fields.key;return M(this.items()).find(n=>C(n,t)===e)}refresh(){this.parts.resources.refresh(),this.parts.model.refresh()}refreshAppointment(e){this.parts.model.refresh(e)}refreshResources(){this.parts.resources.refresh()}resourceFieldValues(){let e=[];for(let t of M(this.resources))for(let n of[`label`,`items`,`allowMultiple`,`useColorAsDefault`]){let r=g(t,n);typeof r==`function`&&e.push(r())}return e}selectCells(e){let t=this.parts.model;if(t.flush(),!e)return t.clearSelection(),!0;let n=this.placeOf(e.start,e.allDay,e.resources??null),r=this.placeOf(new Date(e.end.getTime()-1),e.allDay,e.resources??null);return!n||!r?!1:(t.focusCell(n),t.focusCell(r,!0),!0)}addAppointment(e){return this.parts.editor.add(e)}updateAppointment(e,t,n=null){return this.parts.editor.update(e,t,!1,n)}deleteAppointment(e,t=null){return this.parts.editor.remove(e,!1,t)}seriesOf(e){return this.parts.model.seriesOf(e)}isOccurrence(e){return!!this.parts.model.occurrenceOf(e)}isException(e){return this.parts.model.isException(e)}occurrencesOf(e,t,n){let r=this.parts.model;return r.occurrences.of(e,t.getTime(),n.getTime()).filter(e=>{let i=r.timeOf(e);return!!i&&i.start<n&&(i.end>t||i.end.getTime()===i.start.getTime())})}recurrenceText(e){let t=this.parts.model.seriesOf(e),n=t?this.parts.model.occurrences.ruleOf(t):null;if(!t||!n)return``;let r=this.parts.model.timeOf(t),i=this.parts.model.occurrences.zoneOf(t);return qe(n,r?i.toLocal(r.start):null,{locale:this.locale,strings:{...s.strings,...this.texts},timeZone:i.name||void 0})}askSeries(e,t=`update`){return this.parts.editor.askSeries(e,t)}showAppointmentForm(e=null,t=null){return this.parts.editor.openForm(e,t??(e?null:this.parts.model.selection()))}showTooltip(e,t){let n=t??this.boxesOf(e)[0];n&&this.parts.editor.showTooltip(e,n)}hideTooltip(){this.parts.editor.hideTooltip()}checkTime(e,t,n,r={}){let i=this.parts.model.check(e,t,n,r.allDay??!1,r.resources??null);return{...i.check,free:i.free}}resourcesOf(e){return this.parts.resources.itemsOf(e).map(({kind:e,items:t})=>({field:e.field,label:e.label,items:t.map(({value:e,text:t,color:n,item:r})=>({value:e,text:t,color:n,item:r}))}))}exportICalendar(e={}){let t=this.parts,n=e.range,r=n===`all`?null:n&&n!==`visible`?n:this.visibleRange,i={appointments:e.appointments?[...e.appointments]:t.icalendar.appointmentsIn(r),range:r,cancel:!1,source:this};if(t.icalendarExporting.fire(i),i.cancel)return null;let a=t.icalendar.write(i.appointments,e.name??(this.text||this.textOf(`schedulerLabel`)));return t.icalendarExported.fire({text:a,appointments:i.appointments,source:this}),a}async importICalendar(e){let t=this.parts,n={text:e,appointments:t.icalendar.read(e),cancel:!1,source:this};if(t.icalendarImporting.fire(n),n.cancel)return null;let r=await t.icalendar.save(n.appointments);return t.icalendarImported.fire({...r,source:this}),this.say(this.textOf(`schedulerImported`,{count:r.added.length+r.updated.length})),r}async print(){let e=this.parts,t={cancel:!1,source:this};if(e.printing.fire(t),t.cancel)return!1;let n=T(this);if(!n)return!1;let r=ee(this);D(r,`data-mx-print-one`,!0),e.version.printOne=r,D(this,`data-print-one`,!0),this.setPrinting(!0),await oe(this);try{n.print()}finally{this.printDone()}return!0}textOf(e,t){let n=this.texts[e]??s.strings[e];return l(n,this.locale,t)}onConfigured(){this.class.add(`mx-scheduler`),this.attr.add({role:`group`});for(let e of[`text`,`timeZoom`])this.observeProperty(e,()=>this.drawRoot());for(let e of[`text`,`toolbar`,`views`])this.observeProperty(e,()=>this.drawBar())}drawRoot(){k(()=>{let e=this.parts.version;t(this,`aria-label`,this.text||this.textOf(`schedulerLabel`)),t(this,`data-view`,this.resolveView().type),t(this,`data-presentation`,e.presentation),D(this,`data-printing`,e.printing);let n=this.timeZoom;o(this,`--_zoom`,n===1?``:String(n))})}modelChanged(e){this.isDisposed||(this.parts,e===`layout`&&(this.drawRoot(),this.drawBar(),this.drawContent(),this.filterSource(),this.watchContent(),this.scrollOnShow()),(e===`layout`||e===`focus`)&&(this.selectionSoon(),this.followFocus()))}onConfig(){let t=this.parts;t.model.start(),this.makeRoot(),this.motif.setDisposable(t.model.onChanged(e=>this.modelChanged(e)));for(let[e,n]of Object.entries(ni))this.observeProperty(e,()=>t.model.update(n));this.observeProperty(`resources`,()=>t.resources.listChanged());for(let e of[`editing`,`recurrenceMarks`,`dimPast`])this.observeProperty(e,()=>this.drawAgain());this.observeProperty(`locale`,()=>this.languageChanged());for(let e of[`appointmentTemplate`,`dataCellTemplate`,`dateCellTemplate`,`timeCellTemplate`,`resourceHeaderTemplate`])this.observeProperty(e,()=>this.drawAgain());let n=s.onChanged(()=>this.languageChanged());this.motif.setDisposable(()=>n.dispose());let r=null;e(this,`resourceFields`,()=>this.resourceFieldValues(),e=>{let n=r;r=e,n&&(n.length!==e.length||e.some((e,t)=>!Object.is(e,n[t])))&&t.resources.refresh()}),this.motif.setDisposable(Re(()=>t.model.setNow(Date.now()),3e4)),this.observeProperty(`dataSource`,()=>this.followSource(this.dataSource));for(let e of[`dataSource`,`remoteFiltering`])this.observeProperty(e,()=>this.filterSource());this.observeProperty(`keys`,()=>this.bindKeys(this.keys)),this.modelChanged(`layout`);for(let e of[`presentation`,`tabletWidth`,`phoneWidth`,`tabletWhen`])this.observeProperty(e,()=>this.resolvePresentation());this.watchPointer(),this.watchPrint(),this.watchSize(),se(this,`look`,()=>w(this,this.readLook,this.useLook)),this.resolvePresentation()}onMounted(){this.motif.setDisposable(this.parts.touch.attach())}makeRoot(){let e=this.parts,n=new Ee({});n.class.add(`mx-scheduler__bar`);let r=new _(`div`);r.class.add(`mx-scheduler__content`);let i=new _(`div`);i.class.add(`mx-scheduler__live mx-sr-only`),i.attr.add({"aria-live":`polite`,role:`status`}),e.bar=n,e.content=r,e.live=i,this.controls.add(n,r,i);let a=(e,t={})=>{let r=new O(t);return r.class.add(e),n.controls.add(r),r},o=a(`mx-scheduler__today`);o.motif.on(`click`,()=>this.changeDate(this.today(),!0));let s=a(`mx-scheduler__today-icon`,{icon:Se()});s.motif.on(`click`,()=>this.changeDate(this.today(),!0));let c=a(`mx-scheduler__step`,{icon:xe()});c.motif.on(`click`,()=>this.step(-1,!0));let l=a(`mx-scheduler__step`,{icon:be()});l.motif.on(`click`,()=>this.step(1,!0));let u=a(`mx-scheduler__title`,{dropDown:e.picker});e.title=u;let d=a(`mx-scheduler__view-menu`,{menu:[]});t(d,`data-overflow`,`never`);let f=new z(n,e=>e.name,e=>{let t=new O({toggle:!0});return t.class.add(`mx-scheduler__view-button`),t.motif.on(`click`,()=>{let e=this.viewOfButton.get(t);e!==void 0&&this.changeView(e,!0)}),t},()=>{},()=>5),p=new _(`div`);p.class.add(`mx-scheduler__state`);let m=new ve({size:`sm`});p.controls.add(m);let h=new _(`div`);h.class.add(`mx-scheduler__state`),t(h,`data-tone`,`danger`),h.attr.add({role:`alert`});let g=new _(`span`);h.controls.add(g);let v=new O;v.motif.on(`click`,()=>void this.dataSource?.retry()),h.controls.add(v);let y=new _(`div`);y.class.add(`mx-scheduler__swipe-edge`),y.attr.add({"aria-hidden":`true`});let b=new _(`span`);b.class.add(`mx-glyph mx-scheduler__swipe-icon`),y.controls.add(b),r.controls.add(p,h,y),e.swipeEdge=y,e.root={today:o,todayIcon:s,previous:c,next:l,title:u,viewMenu:d,views:f,loading:p,spinner:m,failed:h,failedText:g,retry:v},this.drawStates(),this.drawSwipeEdge(),this.drawLive()}drawAll(){this.drawBar(),this.drawContent(),this.drawStates(),this.drawSwipeEdge(),this.drawLive(),this.parts.viewNow?.draw()}drawBar(){let e=this.parts,n=e.root,r=e.bar;n&&r&&!this.isDisposed&&k(()=>{let i=e=>this.textOf(e),a=e.version,o=a.presentation===`phone`;r.label=this.text||i(`schedulerLabel`),r.size=o?a.phoneBarSize:a.coarse?`lg`:`sm`,r.visible=this.toolbar&&!a.printing,n.today.text=i(`today`),n.today.visible=!o,n.todayIcon.hint=i(`today`),n.todayIcon.visible=o,n.previous.hint=i(`schedulerPrevious`),n.previous.visible=!o,n.next.hint=i(`schedulerNext`),n.next.visible=!o,n.title.text=o?this.phoneTitle():this.rangeText(),n.title.hint=o?this.rangeText():``,t(n.title,`data-overflow`,o?`never`:null);let s=this.viewList();n.views.show(s);for(let e of s){let t=n.views.get(e.name);t&&(this.viewOfButton.set(t,e.name),t.pressed=this.currentView===e.name,t.text=this.viewText(e),t.visible=!o)}n.viewMenu.text=this.viewText(this.currentViewOf()??{type:`week`}),n.viewMenu.hint=i(`schedulerViews`),n.viewMenu.menu=this.viewMenu(),n.viewMenu.visible=o})}drawContent(){let e=this.parts,t=e.content;t&&!this.isDisposed&&k(()=>{let n=G(this.resolveView().type);if(n===e.viewKind&&e.viewNow)return;e.viewKind=n;let r=e.viewNow,i=e.host,a=n===`month`?new Ln({host:i}):n===`timeline`?new Qn({host:i}):n===`agenda`?new Wn({host:i,focus:e.agendaFocus}):new Un({host:i});e.viewNow=a,r&&t.controls.remove(r),t.controls.add(0,a)})}drawStates(){let e=this.parts,t=e.root;t&&!this.isDisposed&&k(()=>{let n=e=>this.textOf(e),r=this.loading;e.content&&i(e.content,`aria-busy`,r),f(t.loading,r),t.spinner.label=n(`loading`),f(t.failed,e.version.status===`error`),E(t.failedText,n(`loadFailed`)),t.retry.text=n(`retry`)})}drawSwipeEdge(){let e=this.parts.swipeEdge;if(!e)return;let n=this.parts.version.swipe;t(e,`data-side`,n.next?`next`:`previous`),i(e,`data-ready`,n.ready),f(e,n.active)}drawLive(){let e=this.parts.live;e&&E(e,this.parts.version.said)}bindOwn(e,t){oi.has(e)&&typeof t==`function`&&t.length>0?this.setProperty(e,t):this.bindProperty(e,t)}get parts(){let e=this;if(!e[di]){let t=e[di]=this.createParts();t.picker=this.createPicker(t)}return e[di]}languageChanged(){this.isDisposed||(this.parts.model.update(`groups`),this.drawAgain())}drawAgain(){this.drawBar();for(let e of this.parts.drawn)e()}createParts(){let e={status:`ready`,monthRoom:1/0,said:``,saving:[],lines:{lane:0,gap:0,min:0},presentation:`desktop`,coarse:me(this,pi),printing:!1,printOne:null,swipe:{active:!1,x:0,next:!0,ready:!1},touchSelected:``,phoneBarSize:`lg`},t={value:{date:null,items:[]}},n={value:null},r=()=>R.of(this.timeZone),i=new zn(()=>this.locale,r),a=new Xt(()=>this.resources),o=new yn({date:()=>this.currentDate,items:()=>this.items(),fields:()=>this.fields,view:()=>this.resolveView(),firstDayOfWeek:()=>this.firstDayOfWeek,workDays:()=>this.workDays,isHoliday:()=>this.isHoliday,overlapMode:()=>this.overlapMode,room:()=>({month:e.monthRoom,allDay:this.allDayLines+1}),draft:()=>n.value,zone:r,resources:a,workHours:()=>({start:this.workStartHour,end:this.workEndHour}),blockedTimes:()=>this.blockedTimes,allowOverlap:()=>this.allowOverlap,allowOffHours:()=>this.allowOffHours,lineMetrics:()=>e.lines}),s={model:o,resources:a,format:i,version:e,more:t,draft:n,morePopup:null,moreContent:null,moreContext:null,moreChoose:null,picker:null,title:null,scroller:null,timeline:null,agendaFocus:{id:``,drawn:()=>{}},bar:null,content:null,viewNow:null,viewKind:``,root:null,swipeEdge:null,live:null,drawn:new Set,lastFilter:``,lastContent:``,scrolledFor:``,selecting:!1,focusWhenShown:!1,focusPlace:null,baseFilter:null,source:null,stopSource:null,stopKeys:[],lastSelection:``,selectionQueued:!1,viewChanging:new A,viewChanged:new A,dateChanging:new A,dateChanged:new A,cellClick:new A,cellDblClick:new A,appointmentClick:new A,appointmentDblClick:new A,selectionChanged:new A,contentReady:new A,moreOpening:new A,presentationChanging:new A,presentationChanged:new A,timeZoomChanging:new A,timeZoomChanged:new A,icalendarExporting:new A,icalendarExported:new A,icalendarImporting:new A,icalendarImported:new A,printing:new A,printed:new A,width:0,gridScroll:{share:null,column:null},viewBefore:null,viewSet:null,tapAgain:!1,events:{adding:new A,added:new A,updating:new A,updated:new A,deleting:new A,deleted:new A,formOpening:new A,dataError:new A,moveStart:new A,moving:new A,moveEnd:new A,resizeStart:new A,resizing:new A,resizeEnd:new A,seriesAsking:new A,seriesAnswered:new A}};return s.host=this.createHost(s),s.store=new zt({appointments:()=>this.appointments,source:()=>this.dataSource,keyField:()=>this.fields.key,changed:e=>o.refresh(e)}),s.editor=new It({scheduler:this,model:o,store:s.store,view:s.host,events:s.events,fields:()=>this.fields,items:()=>this.items(),editing:()=>this.editing,resources:s.resources,seriesEdit:()=>this.seriesEdit,locale:()=>this.locale,firstDayOfWeek:()=>this.firstDayOfWeek,resolvedView:()=>this.resolveView(),snapMinutes:()=>this.snapMinutes,minDuration:()=>this.minDuration,tooltip:()=>this.tooltip,text:(e,t)=>this.textOf(e,t),say:e=>this.say(e),setDraft:e=>{n.value=e,o.update(`layout`),e?.touch&&this.setTouchSelected(o.idOf(e.item))},boxesOf:e=>this.boxesOf(e),scroller:()=>s.scroller,rtl:()=>m(this),keys:()=>this.keys,saving:e.saving,presentation:()=>e.presentation,redraw:()=>s.viewNow?.draw()}),s.drag=new Kt(s.editor,{cellUnder:e=>this.cellUnder(e),scroller:()=>s.scroller}),s.touch=new rr({root:()=>this,content:()=>s.content,scroller:()=>s.scroller,kind:()=>s.model.kind,dragging:()=>s.drag.active,swipeNavigation:()=>this.swipeNavigation,pinchZoom:()=>this.pinchZoom,rtl:()=>m(this),zoom:()=>this.timeZoom,zoomChanging:(e,t)=>{let n={from:e,to:t,cancel:!1,source:this};return s.timeZoomChanging.fire(n),!n.cancel},setZoom:e=>this.changeProperty(`timeZoom`,Math.max(ri,Math.min(ii,e))),zoomChanged:(e,t)=>s.timeZoomChanged.fire({from:e,to:t,source:this}),swiping:(e,t,n)=>this.drawSwipe(e,t,n),step:e=>this.step(e,!0)}),s.icalendar=new ei({model:o,store:s.store,editor:s.editor,fields:()=>this.fields,items:()=>this.items(),timeZone:()=>this.timeZone,hasSource:()=>!!this.dataSource}),s}createPicker(e){return new Me({value:()=>this.currentDate,firstDayOfWeek:()=>this.firstDayOfWeek,locale:()=>this.locale,showTodayButton:!0,onValueChanged:t=>{t.value&&(e.title?.close(),this.changeDate(t.value,!0))}})}createHost(e){return{model:e.model,format:e.format,text:(e,t)=>this.textOf(e,t),fields:()=>this.fields,showCurrentTime:()=>this.showCurrentTime,dimPast:()=>this.dimPast,resources:e.resources,headerTemplate:()=>this.templateOf(`resourceHeaderTemplate`),cellTemplate:()=>this.templateOf(`dataCellTemplate`),dateTemplate:()=>this.templateOf(`dateCellTemplate`),timeTemplate:()=>this.templateOf(`timeCellTemplate`),agendaTemplate:()=>this.templateOf(`agendaRowTemplate`),tooltipTemplate:()=>this.templateOf(`appointmentTooltipTemplate`),moreTemplate:()=>this.templateOf(`moreListTemplate`),allDayLines:()=>this.allDayLines,rtl:()=>m(this),template:()=>this.templateOf(`appointmentTemplate`),recurrenceMarks:()=>this.recurrenceMarks,recurrenceText:e=>this.recurrenceText(e),zoneOf:e=>{let t=C(e,this.fields.startTimeZone);return typeof t==`string`&&t!==(this.timeZone??``)?t:``},setMonthRoom:t=>{e.version.monthRoom!==t&&(e.version.monthRoom=t,e.model.update(`layout`))},setLineMetrics:t=>{let n=e.version.lines;(n.lane!==t.lane||n.gap!==t.gap||n.min!==t.min)&&(e.version.lines=t,e.model.update(`layout`))},setTimeline:t=>e.timeline=t,dragging:()=>!!e.draft.value,agendaKey:e=>this.agendaKey(e),cellPointerDown:(e,t)=>this.cellPointerDown(e,t),cellClick:(e,t)=>this.clickCell(e,t),cellDblClick:(e,t)=>this.openCell(e,t),appointmentClick:(e,t)=>this.clickAppointment(e,t),appointmentDblClick:(e,t)=>this.openAppointment(e,t),appointmentKey:(e,t)=>this.appointmentKey(e,t),appointmentPointerDown:(t,n,r)=>{let i=r.pointerType===`touch`,a=e.model.itemOf(t),o=i&&e.version.touchSelected===e.model.idOf(a);i&&!o&&this.setTouchSelected(``),e.drag.begin(a,i&&!o?`move`:n,r,t.group,o&&n!==`move`)},touchSelected:t=>e.version.touchSelected!==``&&e.version.touchSelected===e.model.idOf(t),liftedByTouch:()=>!!e.draft.value?.touch,keepDrawn:t=>(e.drawn.add(t),()=>e.drawn.delete(t)),appointmentBlur:t=>e.editor.blurred(t),canDrag:t=>e.editor.canDrag(t),canResize:t=>e.editor.canResize(t),isSaving:t=>e.editor.isSaving(t),isOpen:t=>e.editor.isOpen(t),openMore:(e,t,n)=>this.openMore(e,t,n),gridKey:e=>this.gridKey(e),viewShown:()=>{e.focusWhenShown&&(e.focusWhenShown=!1,this.focusCellElement())},setScroller:t=>{e.scroller=t,t||(e.scrolledFor=``)}}}items(){let e=this.dataSource;return e?e.rows:this.appointments}followSource(e){let t=this.parts;k(()=>{if(e===t.source||(t.stopSource?.(),t.stopSource=null,t.source=e,t.baseFilter=e?.filter??null,!e))return;e.loadMode!==`all`&&te.reportSuppressed(`Scheduler.dataSource`,Error(`Scheduler: its data source loads '${e.loadMode}'; make it with loadMode: 'all' so every appointment of the days shown comes.`));let n=e.onChanged(()=>{t.model.refresh(),this.setStatus(e.status)});t.stopSource=()=>n.dispose(),this.setStatus(e.status)})}filterSource(){let e=this.dataSource;if(!e)return;let t=this.resolveView(),n=this.rangeOf(t,this.currentDate),r=this.remoteFiltering,i=this.fields,a=this.shownResources(t);k(()=>{let t=this.parts;if(!r){e.status===`idle`&&e.load();return}let o=Nn(n,i,{resources:a}),s=t.baseFilter?{and:[t.baseFilter,o]}:o,c=JSON.stringify(s);c!==t.lastFilter&&(t.lastFilter=c,e.setFilter(s))})}shownResources(e){let t=this.parts.model.state.groups,n={};if(!t.length)return n;for(let r of e.groups){let e=this.parts.resources.kind(r);if(!e||e.multiple)continue;let i=[];for(let e of t)i.some(t=>J(t,e.values[r]))||i.push(e.values[r]);n[r]=i}return n}bindKeys(e){let t=this.parts;k(()=>{for(let e of t.stopKeys.splice(0))e();let n=(e,n)=>{for(let r of e)t.stopKeys.push(this.addShortcut(r,()=>n()))};n(e.today,()=>this.changeDate(this.today(),!0)),n(e.next,()=>this.step(1,!0)),n(e.previous,()=>this.step(-1,!0));let r=e=>()=>{let t=this.viewList().find(t=>t.type===e);t&&this.changeView(t.name,!0)};n(e.dayView,r(`day`)),n(e.weekView,r(`week`)),n(e.workWeekView,r(`workWeek`)),n(e.monthView,r(`month`)),n(e.agendaView,r(`agenda`))})}selectionSoon(){let e=this.parts;e.selectionQueued||(e.selectionQueued=!0,queueMicrotask(()=>{e.selectionQueued=!1,this.isDisposed||this.watchSelection()}))}watchSelection(){let e=this.parts.model.selection(),t=e?`${e.start.getTime()}-${e.end.getTime()}-${e.allDay}`:``;k(()=>{let n=this.parts;t!==n.lastSelection&&(n.lastSelection=t,n.selectionChanged.fire({selection:e,source:this}))})}followFocus(){let e=this.parts,t=e.model.state.focus,n=e.focusPlace;if(e.focusPlace={column:t.column,slot:t.slot},!n||n.column===t.column&&n.slot===t.slot)return;let r=k(()=>e.viewNow?.cellAt(n)??null);r&&re(r)&&this.focusCellElement()}watchContent(){let e=this.parts,t=e.model.shown(),n=e.model.range();if(this.loading)return;let r=`${e.model.state.shownVersion}|${n.start.getTime()}|${n.end.getTime()}`;r!==e.lastContent&&(e.lastContent=r,queueMicrotask(()=>!this.isDisposed&&e.contentReady.fire({range:n,appointments:t,source:this})))}scrollOnShow(){let e=this.resolveView(),t=this.scrollHour,n=this.workStartHour;k(()=>{let r=this.parts,i=`${e.name}:${t}`,a=G(e.type);if(a===`month`||a===`agenda`||r.scrolledFor===i)return;let o=()=>{if(!r.scroller||this.isDisposed)return;r.scrolledFor=i;let o=new Date,s=r.model.range(),c=o>=s.start&&o<s.end,l=Math.floor((r.model.zone.wall(o)-r.model.todayWall())/36e5),u=t??(c&&l>n?Math.max(e.startDayHour,l-1):n);if(a===`timeline`&&K(e.type)){let e=r.model.state.days,t=e.findIndex(e=>e.today),n=e.findIndex(e=>Ae(e.local,this.currentDate));r.timeline?.scrollTo(Math.max(0,(t>=0?t:n)-1),null)}else if(a===`timeline`){let e=r.model.state.days,t=c?e.findIndex(e=>e.today):Math.max(0,e.findIndex(e=>Ae(e.local,this.currentDate)));r.timeline?.scrollTo(this.tickAt(Math.max(0,t),u*60),null)}else this.scrollToTime(u)};r.scroller?o():ze(o)})}resolvePresentation(){let e=this.parts;k(()=>{let t=this.presentation,n=e.width,r;if(t!==`auto`)r=t;else if(n>0)r=n<this.phoneWidth?`phone`:n<this.tabletWidth&&(this.tabletWhen===`width`||e.version.coarse)?`tablet`:`desktop`;else return;let i=e.version.presentation;if(r===i)return;let a={from:i,to:r,width:Math.round(n),cancel:!1,source:this};e.presentationChanging.fire(a),!a.cancel&&(e.drag.cancel(),e.editor.hideTooltip(),e.version.touchSelected=``,e.version.presentation=r,e.model.update(`groups`),this.drawRoot(),this.drawAll(),this.showViewOf(r),e.presentationChanged.fire({from:i,to:r,width:a.width,source:this}))})}showViewOf(e){let t=this.parts;t.viewSet&&t.viewBefore&&this.currentView===t.viewSet&&this.changeView(t.viewBefore,!1),t.viewSet=t.viewBefore=null;let n=this.presentationView(e),r=this.currentView;n&&n!==r&&this.changeView(n,!1)&&(t.viewBefore=r,t.viewSet=n)}presentationView(e){let t=e===`phone`?this.phoneView:e===`tablet`?this.tabletView:null;if(!t)return null;let n=this.viewList(),r=n.find(e=>e.name===t)??n.find(e=>e.type===t);return r?r.name:e===`phone`?n.find(e=>e.type===`day`)?.name??null:null}viewMenu(){return this.viewList().map(e=>({text:()=>this.viewText(e),group:`view`,checked:()=>this.currentView===e.name,click:()=>this.changeView(e.name,!0)}))}watchPointer(){let e=pe(this,pi,e=>{this.parts.version.coarse=e,this.drawBar(),this.resolvePresentation()});this.motif.setDisposable(e)}watchSize(){let e=this.parts;se(this,`size`,t=>{Math.round(t.width)!==Math.round(e.width)&&(e.width=t.width,this.resolvePresentation())})}watchPrint(){let e=[d(this,`beforeprint`,()=>this.setPrinting(!0)),d(this,`afterprint`,()=>this.printDone())];this.motif.setDisposable(()=>{for(let t of e)t()})}setPrinting(e){let t=this.parts;t.version.printing!==e&&(t.version.printing=e,t.model.update(`groups`),this.drawRoot(),this.drawAll())}printDone(){let e=this.parts;if(!e.version.printing)return;this.setPrinting(!1);let t=e.version.printOne;e.version.printOne=null,D(this,`data-print-one`,!1),t&&!t.isDisposed&&D(t,`data-mx-print-one`,!1),e.printed.fire({source:this})}viewList(){return this.views.map(e=>typeof e==`string`?{type:e,name:e}:{...e,name:e.name??e.type})}currentViewOf(){let e=this.viewList(),t=this.currentView;return e.find(e=>e.name===t)??e[0]??null}resolveView(){let e=this.currentViewOf()??{type:`week`,name:`week`},t=(e,t)=>e===void 0?t:v(e)??t,n=t(e.startDayHour,this.startDayHour),r=M(this.resources).map(e=>C(e,`field`)),i=t(e.groups,this.groups).filter((e,t,n)=>r.includes(e)&&n.indexOf(e)===t),a=G(e.type),o=t(e.startDate,null);return{name:e.name??e.type,type:e.type,intervalCount:Math.max(1,t(e.intervalCount,1)),startDate:o instanceof Date&&!Number.isNaN(o.getTime())?o:null,startDayHour:n,endDayHour:Math.max(n+1,t(e.endDayHour,this.endDayHour)),cellDuration:t(e.cellDuration,this.cellDuration),allDayPanel:a===`time`&&t(e.allDayPanel,this.allDayPanel),maxAppointmentsPerCell:t(e.maxAppointmentsPerCell,this.maxAppointmentsPerCell),groups:i,groupByDate:i.length>0&&(a===`time`||a===`month`)&&t(e.groupByDate,this.groupByDate),agendaDuration:Math.max(1,Math.round(t(e.agendaDuration,this.agendaDuration))),scrolling:this.parts.version.printing?`standard`:t(e.scrolling,this.scrolling)}}templateOf(e){let t=this.currentViewOf()?.[e];if(t!==void 0){let e=typeof t==`function`&&t.length>0?t:v(t);if(e!==void 0)return e??null}return this[e]??null}viewText(e){return(e.text===void 0?``:v(e.text))||this.textOf(li[e.type])}rangeOf(e,t){let n=hn(e,t,this.firstDayOfWeek,this.workDays),r=R.of(this.timeZone);return{start:r.date(R.wallOfLocal(n[0])),end:r.date(R.wallOfLocal(n[n.length-1])+864e5)}}phoneTitle(){let e=this.parts,t=e.model.range().start,n=e.model.zone;return n.toLocal(t).getFullYear()===n.toLocal(new Date(e.model.state.now)).getFullYear()?e.format.month(t):e.format.monthYear(t)}rangeText(){let e=this.resolveView(),t=this.rangeOf(e,this.currentDate);return this.parts.format.range(e.type,t.start,t.end)}today(){return R.localOfWall(this.parts.model.todayWall())}step(e,t){return this.changeDate(gn(this.resolveView(),this.currentDate,e),t)}changeDate(e,t){let n=this.parts,r=k(()=>this.currentDate);if(Ae(r,e))return!0;let i={from:r,to:e,byUser:t,cancel:!1,source:this};if(n.dateChanging.fire(i),i.cancel)return!1;this.changeProperty(`currentDate`,e);let a=k(()=>this.resolveView()),o=this.rangeOf(a,e);return n.dateChanged.fire({from:r,to:e,range:o,byUser:t,source:this}),this.say(this.textOf(`schedulerShown`,{range:n.format.range(a.type,o.start,o.end)})),!0}changeView(e,t){let n=this.parts,r=k(()=>this.currentView);if(r===e||!this.viewList().some(t=>t.name===e))return r===e;let i={from:r,to:e,byUser:t,cancel:!1,source:this};if(n.viewChanging.fire(i),i.cancel)return!1;n.focusWhenShown=this.focusInView(),this.changeProperty(`currentView`,e),n.viewChanged.fire({from:r,to:e,byUser:t,source:this});let a=k(()=>this.resolveView()),o=this.rangeOf(a,k(()=>this.currentDate)),s=this.viewText(this.viewList().find(t=>t.name===e));return this.say(this.textOf(`schedulerViewShown`,{view:s,range:n.format.range(a.type,o.start,o.end)})),!0}say(e){if(!k(()=>this.announce))return;let t=this.parts.version;t.said=``,this.drawLive(),queueMicrotask(()=>{t.said=e,this.drawLive()})}cellPointerDown(e,t){if(t.button!==0)return;let n=this.parts;if(this.setTouchSelected(``),t.pointerType===`touch`){let t=n.model,r=t.selection(),i=t.cellOf(e);n.tapAgain=!!r&&!!i&&r.start.getTime()===i.start.getTime()&&r.end.getTime()===i.end.getTime()&&r.allDay===i.allDay,t.focusCell(e);return}n.tapAgain=!1,n.model.focusCell(e,t.shiftKey),n.selecting=!0;let r=e=>{let t=this.cellUnder({x:e.clientX,y:e.clientY});if(!t)return;let{column:r,slot:i}=t.place;(r!==n.model.state.focus.column||i!==n.model.state.focus.slot)&&n.model.focusCell({column:r,slot:i},!0)},i=()=>{n.selecting=!1;for(let e of a)e()},a=[u(this,`pointermove`,r),u(this,`pointerup`,i),u(this,`pointercancel`,i)]}cellUnder(e){let t=this.parts,n=t.viewNow,r=t.model,i=r.kind;if(!n||i===`agenda`)return null;let a=r.state,o=i===`timeline`?r.shownTicks():[],s=i===`time`?[-1,...a.slots.map(e=>e.index)]:[-1],c=i===`timeline`?o.length:s.length,l=(e,t)=>i===`timeline`?{column:a.rows[e].first+o[t].day.index,slot:o[t].slot}:{column:a.columns[e].index,slot:s[t]},u=t=>e.x>=t.left&&e.x<t.right&&e.y>=t.top&&e.y<t.bottom,d=i===`timeline`?a.rows.length:a.columns.length;for(let t=0;t<d;t++){let r=(c>0?n.cellAt(l(t,0)):null)??(c>1?n.cellAt(l(t,1)):null);if(!r)continue;let a=j(r);if(i===`timeline`?e.y<a.top||e.y>=a.bottom:e.x<a.left||e.x>=a.right)continue;let o=new Map;for(let e=0;e<c;e++){let r=l(t,e),i=n.cellAt(r);i&&o.set(i,r)}let s=fe(e,[...o.keys()],{rects:e=>u(j(e))?de(e):null});if(s)return{place:o.get(s),cell:s}}return null}fireCell(e,t,n){let r=this.parts.model.cellOf(t);if(!r)return!1;let i={cell:r,event:n,cancel:!1,source:this};return e.fire(i),!i.cancel}fireAppointment(e,t,n){let r=this.parts.model.state.groups[t.group],i={appointment:this.parts.model.itemOf(t),start:t.start,end:t.end,group:r?{...r.values}:null,event:n,cancel:!1,source:this};return e.fire(i),!i.cancel}clickCell(e,t){let n=this.parts;n.touch.justSwiped||this.fireCell(n.cellClick,e,t)&&n.tapAgain&&(n.tapAgain=!1,this.openCell(e,t))}clickAppointment(e,t){let n=this.parts;if(n.drag.justEnded||n.touch.justSwiped)return;let r=n.model.itemOf(e);n.version.touchSelected&&n.version.touchSelected!==n.model.idOf(r)&&this.setTouchSelected(``);let i=n.viewNow?.boxOf(e.id)??null;this.fireAppointment(n.appointmentClick,e,t)&&this.tooltip&&i&&n.editor.showTooltip(r,i)}openAppointment(e,t){let n=this.parts;n.drag.justEnded||n.editor.formOpen||this.fireAppointment(n.appointmentDblClick,e,t)&&n.editor.openForm(n.model.itemOf(e))}openCell(e,t){let n=this.parts;if(n.editor.formOpen||!this.fireCell(n.cellDblClick,e,t)||!n.editor.canAdd())return;let r=n.model,i=r.selection(),a=r.cellOf(e),o=!!i&&!!a&&a.allDay===i.allDay&&a.start>=i.start&&a.end<=i.end;n.editor.openForm(null,o?i:a)}appointmentKey(e,t){if(this.parts.editor.key(e,t)){t.preventDefault(),t.stopPropagation();return}t.key===`Enter`?(t.preventDefault(),this.openAppointment(e,t)):t.key===` `&&(t.preventDefault(),this.clickAppointment(e,t))}boxesOf(e){if(this.isDisposed)return[];let t=this.parts.viewNow;if(!t)return[];let n=this.parts.model.idOf(e),r=this.parts.model.state,i=[...r.timed,...r.allDay.pieces,...r.weeks.flatMap(e=>e.pieces),...r.rows.flatMap(e=>e.pieces),...r.agenda.flatMap(e=>e.items)],a=[];for(let e of i){if(!e.id.startsWith(`${n}@`)&&!e.id.startsWith(`${n}#`))continue;let r=t.boxOf(e.id);r&&a.push(r)}return a}openMore(e,t,n){let r=this.parts,i=r.model.appointmentsIn(e,r.model.zone.addDays(e,1),r.model.state.groups[t]??null),a={date:e,appointments:i,cancel:!1,source:this};if(r.moreOpening.fire(a),a.cancel)return;r.more.value={date:e,items:i};let o=this.morePopup();this.drawMorePopup(),o.open(n),queueMicrotask(()=>ne(o))}morePopup(){let e=this.parts;if(e.morePopup)return e.morePopup;let t=new ie;t.matchWidth=!1,t.class.add(`mx-scheduler__more-popup`);let n=(n,r)=>{t.close();let i=e.model.timeOf(n);i&&e.appointmentClick.fire({appointment:n,start:i.start,end:i.end,group:null,event:r,cancel:!1,source:this})},r=e.more;return e.moreContext={get date(){return r.value.date},get appointments(){return r.value.items},choose:(e,t)=>n(e,t)},e.moreChoose=n,this.controls.add(t),e.morePopup=t,t}drawMorePopup(){let e=this.parts,t=e.morePopup;if(!t||!e.moreContext||!e.moreChoose)return;let n=e.host.moreTemplate();if(!n&&e.moreContent instanceof Rn){e.moreContent.draw();return}if(e.moreContent&&t.controls.remove(e.moreContent),n){let t=new _(`div`);t.class.add(`mx-scheduler__more-own`),t.controls.add(n(e.moreContext)),e.moreContent=t}else e.moreContent=new Rn({host:e.host,state:e.more,choose:e.moreChoose});t.controls.add(e.moreContent)}gridKey(e){let t=this.parts,n=t.model;if(n.kind===`timeline`){this.lineKey(e);return}let r=this.resolveView(),i=r.type===`month`,a=n.state.focus,o=n.state.columns.length,s=n.perRow,c=n.state.slots.length,l=m(this)?-1:1,u=i||r.allDayPanel?-1:0,d=a.column,f=a.slot,p=0,h=i?d-d%s:0;switch(e.key){case`ArrowLeft`:d-=l;break;case`ArrowRight`:d+=l;break;case`ArrowUp`:i?d-=s:f=Math.max(u,f-1);break;case`ArrowDown`:i?d+=s:f=Math.min(c-1,f+1);break;case`Home`:e.ctrlKey?[d,f]=[0,i?-1:0]:d=h;break;case`End`:e.ctrlKey?[d,f]=[o-1,i?-1:c-1]:d=i?h+s-1:o-1;break;case`PageUp`:case`PageDown`:{let t=e.key===`PageUp`?-1:1;i?p=t:f=Math.max(u,Math.min(c-1,f+t*this.pageRows()));break}case`Enter`:e.preventDefault(),this.openCell(a,e);return;case` `:e.preventDefault(),n.focusCell(a),this.fireCell(t.cellClick,a,e);return;case`Escape`:if(!n.state.anchor)return;e.preventDefault(),n.clearSelection();return;default:return}if(e.preventDefault(),!p&&(d<0||d>=o)&&(p=d<0?-1:1),p){let t=i?(a.column%s+s)%s:d<0?o-1:d>=o?0:a.column;if(!this.step(p,!0))return;queueMicrotask(()=>{let r=n.state.columns.length,a=i?Math.min(r-1,(p<0?Math.floor((r-1)/s)*s:0)+t):Math.min(r-1,t);n.focusCell({column:a,slot:f},e.shiftKey),this.focusCellElement()});return}n.focusCell({column:d,slot:f},e.shiftKey),this.focusCellElement()}agendaKey(e){let t=this.parts,n=t.model.state.agenda.flatMap(e=>e.items);if(!n.length)return;let r=t.agendaFocus,i=Math.max(0,n.findIndex(e=>e.id===r.id)),a=n[i],o=i;switch(e.key){case`ArrowDown`:o=Math.min(n.length-1,i+1);break;case`ArrowUp`:o=Math.max(0,i-1);break;case`Home`:o=0;break;case`End`:o=n.length-1;break;case`PageDown`:o=Math.min(n.length-1,i+this.pageRows());break;case`PageUp`:o=Math.max(0,i-this.pageRows());break;case`Enter`:e.preventDefault(),this.openAppointment(a,e);return;case` `:e.preventDefault(),this.clickAppointment(a,e);return;case`Delete`:case`Backspace`:e.preventDefault();let r=t.model.itemOf(a);t.editor.canDelete(r)&&t.editor.remove(r,!0);return;default:return}e.preventDefault(),r.id=n[o].id,r.drawn(),queueMicrotask(()=>{let e=this.isDisposed?null:t.viewNow?.boxOf(r.id);e&&p(e)})}lineKey(e){let t=this.parts,n=t.model,r=n.state,i=r.focus,a=Math.max(1,r.days.length),o=K(n.view.type),s=o?1:Math.max(1,r.slots.length),c=a*s,l=Math.max(1,r.rows.length),u=Math.floor(i.column/a),d=i.column%a*s+(o?0:Math.max(0,i.slot)),f=m(this)?-1:1;switch(e.key){case`ArrowLeft`:d-=f;break;case`ArrowRight`:d+=f;break;case`ArrowUp`:u=Math.max(0,u-1);break;case`ArrowDown`:u=Math.min(l-1,u+1);break;case`Home`:e.ctrlKey&&(u=0),d=0;break;case`End`:e.ctrlKey&&(u=l-1),d=c-1;break;case`PageUp`:case`PageDown`:u=Math.max(0,Math.min(l-1,u+(e.key===`PageUp`?-1:1)*this.pageRows()));break;case`Enter`:e.preventDefault(),this.openCell(i,e);return;case` `:e.preventDefault(),n.focusCell(i),this.fireCell(t.cellClick,i,e);return;case`Escape`:if(!r.anchor)return;e.preventDefault(),n.clearSelection();return;default:return}e.preventDefault();let p=(e,t)=>({column:e*a+Math.floor(t/s),slot:o?-1:t%s});if(d<0||d>=c){let t=d<0?-1:1;if(!this.step(t,!0))return;queueMicrotask(()=>{let i=Math.max(1,r.days.length),a=K(n.view.type),o=a?1:Math.max(1,r.slots.length),s=t<0?i*o-1:0;n.focusCell({column:u*i+Math.floor(s/o),slot:a?-1:s%o},e.shiftKey),this.focusCellElement()});return}n.focusCell(p(u,d),e.shiftKey),this.focusCellElement()}pageRows(){let e=this.parts,t=e.model,n=e.viewNow,r=t.kind,i=r===`agenda`?n?.boxOf(e.agendaFocus.id||(t.state.agenda[0]?.items[0]?.id??``))??null:r===`time`?this.builtCell(0)?.cell??null:n?.cellAt(t.state.focus)??null,a=e.scroller,o=i?c(i).offsetHeight:0;return a&&o>0?Math.max(1,Math.floor(c(a).clientHeight/o)-1):8}builtCell(e){let t=this.parts.viewNow;if(!t)return null;for(let n of this.parts.model.shownColumns()){let r=t.cellAt({column:n.index,slot:e});if(r)return{cell:r,column:n.index}}return null}focusInView(){let e=this.parts.content;return!!e&&re(e)}focusCellElement(){let e=this.parts.model,t=e.state.focus;if(e.virtual){if(e.kind===`timeline`){let n=e.state.columns[t.column],r=e.state.rows.find(e=>e.group===(n?.group??null))?.index??0,i=K(e.view.type)?1:e.state.slots.length;this.parts.timeline?.reveal((n?.day.index??0)*i+Math.max(0,t.slot),r)}else this.revealColumn(t.column)}let n=0,r=()=>{if(this.isDisposed)return;let t=this.parts.viewNow?.cellAt(e.state.focus);t?p(t,{preventScroll:e.virtual}):n++<4&&oe(this).then(r)};queueMicrotask(r)}revealColumn(e){let t=this.parts;t.scroller&&t.model.kind===`time`&&t.model.state.columns.length&&(t.gridScroll.column=e,w(this,this.readGrid,this.scrollGrid))}tickAt(e,t){let n=this.parts.model,r=n.view;if(K(r.type))return e;let i=Math.max(5,Math.min(240,Math.round(r.cellDuration))),a=n.state.slots.length,o=Math.max(0,Math.min(a,(t-r.startDayHour*60)/i));return e*a+o}placeOf(e,t,n=null){let r=this.parts.model,i=r.state.columns.filter(t=>r.zone.sameDay(t.day.date,e)),a=(n?i.find(e=>!e.group||Object.entries(e.group.values).every(([e,t])=>J(n[e],t))):null)??i[0];if(!a)return null;if(t||this.resolveView().type===`month`)return{column:a.index,slot:-1};let o=(r.zone.wall(e)-a.day.wall)/6e4,s=r.state.slots,c=0;for(let e=0;e<s.length;e++)s[e].minutes<=o&&(c=e);return{column:a.index,slot:c}}},pi=`(pointer: coarse)`,mi=`import { reactive } from '@motifx/core';\r
import { NumberBox, Scheduler } from '@motifx-community/ui';\r
import { sampleAppointments, type Meeting } from './sample-appointments';\r
\r
/**\r
 * The coming days as a list: each day with its appointments in time order, a day with none left\r
 * out. Up and Down move over the rows, Space shows the tooltip, Enter opens the form, Delete\r
 * deletes. Previous and next move by the days shown.\r
 */\r
export default function Agenda() {\r
  const s = reactive({ days: 7 });\r
  return (\r
    <div class="sched-demo">\r
      <NumberBox label="Days" labelMode="side" min={1} max={31} x-model={() => s.days} />\r
      <Scheduler<Meeting> appointments={sampleAppointments()} views={['agenda', 'week', 'month']} currentView="agenda" agendaDuration={() => s.days} />\r
    </div>\r
  );\r
}\r
`,hi=`import { Button, Scheduler, type AgendaRowContext, type TooltipTemplateContext } from '@motifx-community/ui';\r
import { jobs, members, type Job } from './timeline-data';\r
\r
/**\r
 * An agenda row drawn by \`agendaRowTemplate\` (the person's name after the job), and a tooltip of\r
 * its own (\`appointmentTooltipTemplate\`) with the time and a button to open the form. The row\r
 * keeps its color, keys and accessible name.\r
 */\r
export default function AgendaTemplates() {\r
  const resources = [{ field: 'ownerId', label: 'Person', items: members, useColorAsDefault: true }];\r
  const person = (job: Job) => members.find((m) => m.id === job.ownerId)?.text ?? '';\r
  const row = (c: AgendaRowContext<Job>) => (\r
    <span class="sched-agenda-row">\r
      <strong>{c.time}</strong>\r
      <span>{c.text}</span>\r
      <small>{person(c.appointment)}</small>\r
    </span>\r
  );\r
  const tip = (c: TooltipTemplateContext<Job>) => (\r
    <div class="sched-tip">\r
      <strong>{() => c.text}</strong>\r
      <span>{() => c.time}</span>\r
      <span>{() => (c.appointment ? person(c.appointment) : '')}</span>\r
      <Button text="Open" visible={() => c.canEdit} onclick={() => c.edit()} />\r
    </div>\r
  );\r
  return (\r
    <div class="sched-demo">\r
      <Scheduler<Job>\r
        appointments={jobs()}\r
        resources={resources}\r
        views={[{ type: 'agenda', agendaDuration: 2 }, 'week']}\r
        currentView="agenda"\r
        agendaRowTemplate={row}\r
        appointmentTooltipTemplate={tip}\r
      />\r
    </div>\r
  );\r
}\r
`,gi=`import { reactive } from '@motifx/core';\r
import { RadioGroup, Scheduler, type SchedulerBlockedTime, type SchedulerTimeCheck } from '@motifx-community/ui';\r
import { bookings, rooms, type Booking } from './resource-data';\r
\r
/**\r
 * When a booking may go: Bosphorus is open 10 to 18 (its own work hours), lunch is blocked every\r
 * weekday, Cappadocia is closed tomorrow. Outside the hours nothing goes (\`allowOffHours\`); the\r
 * choice says whether bookings in a room may overlap, or a rule of its own lets two at once.\r
 */\r
export default function Availability() {\r
  const s = reactive({ overlap: 'no', said: '' });\r
  const today = new Date();\r
  const day = (offset: number, hour = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour);\r
  const blocked: SchedulerBlockedTime[] = [\r
    { start: day(0, 12), end: day(0, 13), text: 'Lunch', recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' },\r
    { start: day(1), end: day(1), allDay: true, text: 'Closed for cleaning', resources: { roomId: 3 } },\r
  ];\r
  /** Two at once fit in a room, but never over a blocked time or out of its hours. */\r
  const twoAtOnce = (check: SchedulerTimeCheck<Booking>) => !check.blocked.length && !check.offHours && check.overlapping.length < 2;\r
  return (\r
    <div class="sched-demo">\r
      <RadioGroup\r
        label="Bookings in a room"\r
        orientation="horizontal"\r
        items={[\r
          { value: 'no', text: 'May not overlap' },\r
          { value: 'two', text: 'Two at once (a rule)' },\r
          { value: 'yes', text: 'May overlap' },\r
        ]}\r
        itemText="text"\r
        itemValue="value"\r
        x-model={() => s.overlap}\r
      />\r
      <Scheduler<Booking>\r
        appointments={bookings()}\r
        resources={[{ field: 'roomId', label: 'Room', items: rooms }]}\r
        groups={['roomId']}\r
        currentView="day"\r
        views={[{ type: 'day', intervalCount: 2 }]}\r
        startDayHour={8}\r
        endDayHour={19}\r
        blockedTimes={blocked}\r
        allowOffHours={false}\r
        allowOverlap={() => (s.overlap === 'two' ? twoAtOnce : s.overlap === 'yes')}\r
        onMoving={(e) => (s.said = e.cancel ? 'Not free there.' : '')}\r
        onMoveEnd={() => (s.said = '')}\r
      />\r
      <p class="sched-log">{() => s.said}</p>\r
    </div>\r
  );\r
}\r
`,_i=`import { reactive } from '@motifx/core';\r
import { Scheduler } from '@motifx-community/ui';\r
import { sampleAppointments, type Meeting } from './sample-appointments';\r
\r
/** A week of appointments. Double-click an appointment or a time, and the log shows your selection. */\r
export default function Basics() {\r
  const state = reactive({\r
    appointments: sampleAppointments(),\r
    said: 'Double-click an appointment or a time.',\r
  });\r
  return (\r
    <div class="sched-demo">\r
      <Scheduler<Meeting>\r
        appointments={state.appointments}\r
        startDayHour={7}\r
        endDayHour={21}\r
        onAppointmentDblClick={(e) => (state.said = \`Open: \${e.appointment.text}\`)}\r
        onCellDblClick={(e) => (state.said = \`New at \${e.cell.start.toLocaleString()}\`)}\r
      />\r
      <p class="sched-log" role="status">\r
        {() => state.said}\r
      </p>\r
    </div>\r
  );\r
}\r
`,vi=`import { reactive } from '@motifx/core';\r
import { Scheduler } from '@motifx-community/ui';\r
import { machines, tasks, type Task } from './big-data';\r
\r
/**\r
 * 1,000 resources and 10,000 tasks in a timeline week. Only the rows in view are built (through\r
 * \`Virtualization\`, each as tall as its lanes), and in each row only the cells and tasks of the part\r
 * of the week in view. The numbers under it are measured as it shows and as you scroll.\r
 */\r
export default function BigTimeline() {\r
  const resources = [{ field: 'resourceId', label: 'Line', items: machines(1000), useColorAsDefault: true }];\r
  const s = reactive({ shown: '', nodes: 0 });\r
  const started = performance.now();\r
  return (\r
    <div class="sched-demo">\r
      <Scheduler<Task>\r
        appointments={tasks(10_000, 1000)}\r
        resources={resources}\r
        groups={['resourceId']}\r
        views={['timelineWeek', 'timelineDay']}\r
        currentView="timelineWeek"\r
        cellDuration={60}\r
        onContentReady={(e) => {\r
          // Shown: the frame after its first appointments are on the page.\r
          const look = () => {\r
            const el = e.source.element;\r
            if (!el.querySelector('.mx-scheduler__scroll .mx-scheduler__appointment')) return void requestAnimationFrame(look);\r
            requestAnimationFrame(() => {\r
              if (!s.shown) s.shown = \`\${Math.round(performance.now() - started)} ms\`;\r
              s.nodes = el.querySelectorAll('*').length;\r
            });\r
          };\r
          look();\r
        }}\r
      />\r
      <p class="sched-log">{() => (s.shown ? \`Shown in \${s.shown}; \${s.nodes.toLocaleString()} elements on the page.\` : 'Building…')}</p>\r
    </div>\r
  );\r
}\r
`,yi=`import { reactive } from '@motifx/core';\r
import { Scheduler } from '@motifx-community/ui';\r
import { machines, tasks, type Task } from './big-data';\r
\r
/**\r
 * 200 groups in a week: 1,400 columns of 48 cells. Only the columns in view (and a screen on each\r
 * side) are built; scroll sideways and they follow.\r
 */\r
export default function BigWeek() {\r
  const resources = [{ field: 'resourceId', label: 'Line', items: machines(200), useColorAsDefault: true }];\r
  const s = reactive({ shown: '', nodes: 0 });\r
  const started = performance.now();\r
  return (\r
    <div class="sched-demo">\r
      <Scheduler<Task>\r
        appointments={tasks(4000, 200)}\r
        resources={resources}\r
        groups={['resourceId']}\r
        views={['week', 'day']}\r
        currentView="week"\r
        onContentReady={(e) => {\r
          // Shown: the frame after its first appointments are on the page.\r
          const look = () => {\r
            const el = e.source.element;\r
            if (!el.querySelector('.mx-scheduler__scroll .mx-scheduler__appointment')) return void requestAnimationFrame(look);\r
            requestAnimationFrame(() => {\r
              if (!s.shown) s.shown = \`\${Math.round(performance.now() - started)} ms\`;\r
              s.nodes = el.querySelectorAll('*').length;\r
            });\r
          };\r
          look();\r
        }}\r
      />\r
      <p class="sched-log">{() => (s.shown ? \`Shown in \${s.shown}; \${s.nodes.toLocaleString()} elements on the page.\` : 'Building…')}</p>\r
    </div>\r
  );\r
}\r
`,bi=`import { Scheduler, type SchedulerForm } from '@motifx-community/ui';\r
import { bookings, people, rooms, type Booking } from './resource-data';\r
\r
type Catered = Booking & { catering?: boolean; guests?: number };\r
\r
/**\r
 * Fields for one appointment only, each a function of the form: catering shows only for\r
 * Cappadocia (the big room), the number of guests only with catering; a booking that has begun\r
 * keeps its room; the people are needed for an interview.\r
 */\r
export default function ConditionalFields() {\r
  const now = new Date();\r
  const form: SchedulerForm<Catered> = {\r
    items: [\r
      'text',\r
      'start',\r
      'end',\r
      { field: 'roomId', readOnly: (f) => !f.isNew && !!f.appointment && f.appointment.startDate < now, helpText: (f) => (!f.isNew && !!f.appointment && f.appointment.startDate < now ? 'It has begun: the room stays.' : '') },\r
      { field: 'catering', label: 'Catering', editor: 'switch', visible: (f) => f.data.roomId === 3 },\r
      { field: 'guests', label: 'Guests', editor: 'number', editorProps: { min: 1, max: 40 }, visible: (f) => f.data.roomId === 3 && !!f.data.catering, required: true },\r
      { field: 'ownerIds', required: (f) => /interview/i.test(String(f.data.text)) },\r
      'description',\r
    ],\r
  };\r
  return (\r
    <div class="sched-demo">\r
      <Scheduler<Catered>\r
        appointments={bookings()}\r
        resources={[\r
          { field: 'roomId', label: 'Room', items: rooms, useColorAsDefault: true },\r
          { field: 'ownerIds', label: 'People', items: people, allowMultiple: true },\r
        ]}\r
        currentView="workWeek"\r
        startDayHour={8}\r
        endDayHour={18}\r
        editing={{ allowRecurrence: false, form }}\r
      />\r
    </div>\r
  );\r
}\r
`,xi=`import { reactive } from '@motifx/core';\r
import { Scheduler, Slider, type AppointmentFormContext, type FormTemplateContext, type SchedulerForm } from '@motifx-community/ui';\r
import { bookings, people, rooms, type Booking } from './resource-data';\r
\r
type Rated = Booking & { priority?: number };\r
\r
const COLORS = ['#1565c0', '#2e7d32', '#ad1457', '#ef6c00', '#455a64'];\r
\r
/** A custom component as an editor: a row of colors bound to the form's data. */\r
function ColorChoice(form: AppointmentFormContext<Rated>, place: FormTemplateContext) {\r
  const data = form.data as Record<string, unknown>;\r
  return (\r
    <div class="sched-colors" role="group" aria-label="Colour">\r
      <span class="sched-colors__label">Colour</span>\r
      {COLORS.map((color) => (\r
        <button\r
          key={color}\r
          type="button"\r
          class="sched-colors__swatch"\r
          style={{ background: color }}\r
          aria-label={color}\r
          aria-pressed={() => data[place.field] === color}\r
          onclick={() => (data[place.field] = data[place.field] === color ? '' : color)}\r
        />\r
      ))}\r
    </div>\r
  );\r
}\r
\r
/**\r
 * Editors of your own: a slider made by a function (it takes the props a named editor gets, so it\r
 * is checked with the form), and a row of colours from a template. A rule of the form's own: an\r
 * interview needs two people.\r
 */\r
export default function CustomEditors() {\r
  const form: SchedulerForm<Rated> = {\r
    items: [\r
      'text',\r
      'start',\r
      'end',\r
      { field: 'priority', label: 'Priority', editor: (props) => new Slider({ ...props, min: 1, max: 5, step: 1 }), colSpan: 'all' },\r
      { field: 'color', colSpan: 'all', template: ColorChoice },\r
      'roomId',\r
      {\r
        field: 'ownerIds',\r
        rules: (f) => [\r
          {\r
            type: 'custom',\r
            ignoreEmpty: false,\r
            check: (value: unknown) => !/interview/i.test(String(f.data.text)) || (Array.isArray(value) && value.length >= 2) || 'An interview needs two people.',\r
          },\r
        ],\r
      },\r
      'description',\r
    ],\r
  };\r
  const appointments = reactive(bookings().map((b) => ({ ...b, priority: 3 }))) as Rated[];\r
  return (\r
    <div class="sched-demo">\r
      <Scheduler<Rated>\r
        appointments={appointments}\r
        resources={[\r
          { field: 'roomId', label: 'Room', items: rooms },\r
          { field: 'ownerIds', label: 'People', items: people, allowMultiple: true },\r
        ]}\r
        currentView="workWeek"\r
        startDayHour={8}\r
        endDayHour={18}\r
        editing={{ allowRecurrence: false, form }}\r
      />\r
    </div>\r
  );\r
}\r
`,Si=`import { Scheduler, type FormOpeningEventArgs } from '@motifx-community/ui';\r
import { sampleAppointments, type Meeting } from './sample-appointments';\r
\r
type Booking = Meeting & { room?: string };\r
\r
const rooms = [\r
  { value: 'blue', text: 'Blue room' },\r
  { value: 'green', text: 'Green room' },\r
  { value: 'online', text: 'Online' },\r
];\r
\r
/** The form gets a field of its own (a room) and loses the description; the room is written to the appointment's \`room\` field. */\r
export default function CustomForm() {\r
  const opening = (e: FormOpeningEventArgs<Booking>) => {\r
    e.data.room = e.appointment?.room ?? 'online';\r
    e.items.splice(\r
      e.items.findIndex((item) => item.field === 'description'),\r
      1,\r
    );\r
    e.items.push({ field: 'room', label: 'Room', editor: 'dropdown', editorProps: { items: rooms }, colSpan: 'all' });\r
    e.form.title = e.appointment ? \`Edit \${e.appointment.text}\` : 'Book a room';\r
  };\r
  return (\r
    <div class="sched-demo">\r
      <Scheduler<Booking> appointments={sampleAppointments()} currentView="day" startDayHour={8} endDayHour={18} onFormOpening={opening} />\r
    </div>\r
  );\r
}\r
`,Ci=`import { Scheduler, type SchedulerForm } from '@motifx-community/ui';\r
import { bookings, people, rooms, type Booking } from './resource-data';\r
\r
/**\r
 * The form set up by \`editing.form\` alone: the title on top with a rule of its own, then three tabs.\r
 * Built-in items and resources are named by their fields; the time zone row (\`timeZone\`) and the\r
 * recurrence editor are items like the others. Double-click a booking.\r
 */\r
export default function DeclaredForm() {\r
  const form: SchedulerForm<Booking> = {\r
    columns: 2,\r
    items: [\r
      { field: 'text', label: 'Subject', rules: [{ type: 'length', min: 3, message: 'At least three letters.' }] },\r
      {\r
        tabs: [\r
          { title: 'When', items: ['start', 'end', 'timeZone', 'allDay', 'recurrenceRule'] },\r
          { title: 'Where and who', columns: 1, items: ['roomId', 'ownerIds'] },\r
          { title: 'Notes', columns: 1, items: [{ field: 'description', label: 'Agenda' }] },\r
        ],\r
      },\r
    ],\r
  };\r
  return (\r
    <div class="sched-demo">\r
      <Scheduler<Booking>\r
        appointments={bookings()}\r
        resources={[\r
          { field: 'roomId', label: 'Room', items: rooms, useColorAsDefault: true },\r
          { field: 'ownerIds', label: 'People', items: people, allowMultiple: true },\r
        ]}\r
        currentView="workWeek"\r
        startDayHour={8}\r
        endDayHour={18}\r
        editing={{ allowTimeZones: true, form }}\r
      />\r
    </div>\r
  );\r
}\r
`,wi=`import { reactive } from '@motifx/core';\r
import { Button, Scheduler } from '@motifx-community/ui';\r
import { sampleAppointments, type Meeting } from './sample-appointments';\r
\r
/** The same changes programmatically: add, move, delete, open the form for a new one. */\r
export default function EditProgrammatically() {\r
  const state = reactive({ appointments: sampleAppointments(), said: '' });\r
  let scheduler: Scheduler<Meeting> | null = null;\r
  const tomorrow = (hour: number) => {\r
    const t = new Date();\r
    return new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1, hour);\r
  };\r
  const planning = () => state.appointments.find((m) => m.text === 'Planning');\r
  const add = async () => {\r
    const added = await scheduler?.addAppointment({ id: Date.now(), text: 'Planning', startDate: tomorrow(11), endDate: tomorrow(12), color: '#6a1b9a' });\r
    state.said = added ? \`Added \${added.text}\` : 'Not added';\r
  };\r
  const later = async () => {\r
    const item = planning();\r
    if (!item) {\r
      state.said = 'Add it first';\r
      return;\r
    }\r
    const hour = 3_600_000;\r
    const ok = await scheduler?.updateAppointment(item, {\r
      startDate: new Date(item.startDate.getTime() + hour),\r
      endDate: new Date(item.endDate.getTime() + hour),\r
    });\r
    state.said = ok ? 'Moved an hour later' : 'Not moved';\r
  };\r
  const remove = async () => {\r
    const item = planning();\r
    state.said = item && (await scheduler?.deleteAppointment(item)) ? 'Deleted' : 'Nothing to delete';\r
  };\r
  return (\r
    <div class="sched-demo">\r
      <div class="docs-flow">\r
        <Button text="Add tomorrow 11:00" variant="outline" onclick={add} />\r
        <Button text="An hour later" variant="outline" onclick={later} />\r
        <Button text="Delete it" variant="outline" onclick={remove} />\r
        <Button\r
          text="New in the form"\r
          variant="outline"\r
          onclick={() => void scheduler?.showAppointmentForm(null, { start: tomorrow(15), end: tomorrow(16), allDay: false })}\r
        />\r
      </div>\r
      <p class="sched-log" role="status">\r
        {() => state.said}\r
      </p>\r
      <Scheduler<Meeting> appointments={state.appointments} startDayHour={8} endDayHour={19} ref={(c: Scheduler<Meeting>) => (scheduler = c)} />\r
    </div>\r
  );\r
}\r
`,Ti=`import { reactive } from '@motifx/core';\r
import { Scheduler, Switch } from '@motifx-community/ui';\r
import { sampleAppointments, type Meeting } from './sample-appointments';\r
\r
/** Drag an appointment, pull its edges, Ctrl-drag a copy, double-click to edit, click for its tooltip. Every switch is live. */\r
export default function Editing() {\r
  const s = reactive({ drag: true, resize: true, copy: true, ask: true, quarter: false, log: [] as string[] });\r
  const say = (text: string) => {\r
    s.log.unshift(text);\r
    if (s.log.length > 6) s.log.pop();\r
  };\r
  const time = (d: Date) => d.toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });\r
  return (\r
    <div class="sched-demo">\r
      <div class="docs-flow">\r
        <Switch label="Drag" x-model={() => s.drag} />\r
        <Switch label="Resize" x-model={() => s.resize} />\r
        <Switch label="Ctrl copies" x-model={() => s.copy} />\r
        <Switch label="Ask before deleting" x-model={() => s.ask} />\r
        <Switch label="15-minute steps" x-model={() => s.quarter} />\r
      </div>\r
      <Scheduler<Meeting>\r
        appointments={sampleAppointments()}\r
        startDayHour={8}\r
        endDayHour={19}\r
        editing={() => ({ allowDragging: s.drag, allowResizing: s.resize, allowCopying: s.copy, confirmDelete: s.ask })}\r
        snapMinutes={() => (s.quarter ? 15 : 30)}\r
        onMoveEnd={(e) => say(\`\${e.copy ? 'Copied' : 'Moved'} \${e.appointment.text} to \${time(e.start)}\${e.byKeys ? ' (keys)' : ''}\`)}\r
        onResizeEnd={(e) => say(\`\${e.appointment.text} now \${time(e.start)} – \${time(e.end)}\`)}\r
        onAppointmentAdded={(e) => say(\`Added \${e.appointment.text}\`)}\r
        onAppointmentUpdated={(e) => say(\`Saved \${e.appointment.text}\`)}\r
        onAppointmentDeleted={(e) => say(\`Deleted \${e.appointment.text}\`)}\r
      />\r
      <ol class="sched-events" aria-label="What happened">\r
        {s.log.map((line, i) => (\r
          <li key={\`\${i}-\${line}\`}>{line}</li>\r
        ))}\r
      </ol>\r
    </div>\r
  );\r
}\r
`,Ei=`import { reactive } from '@motifx/core';\r
import { Button, Scheduler, Stack, TextArea } from '@motifx-community/ui';\r
import { recurringAppointments, type Booking } from './recurring-appointments';\r
\r
/**\r
 * The appointments as an iCalendar file (RFC 5545): the days shown or all of them. A series goes\r
 * whole with its rule, the times left out of it and the one moved apart (\`RECURRENCE-ID\`); every zone\r
 * used comes with its \`VTIMEZONE\`. Open the file in any calendar application.\r
 */\r
export default function ExportCalendar() {\r
  const s = reactive({ text: '', url: '' });\r
  const scheduler = (<Scheduler<Booking> appointments={recurringAppointments()} startDayHour={8} endDayHour={18} label="Team calendar" />) as Scheduler<Booking>;\r
  const write = (range: 'visible' | 'all') => {\r
    s.text = scheduler.exportICalendar({ range }) ?? '';\r
    if (s.url) URL.revokeObjectURL(s.url);\r
    s.url = URL.createObjectURL(new Blob([s.text], { type: 'text/calendar' }));\r
  };\r
  return (\r
    <div class="sched-demo">\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Export the days shown" variant="outline" onclick={() => write('visible')} />\r
        <Button text="Export all" variant="outline" onclick={() => write('all')} />\r
        <a href={() => s.url || null} download="team-calendar.ics" x-display={() => !!s.url}>\r
          Download team-calendar.ics\r
        </a>\r
      </Stack>\r
      {scheduler}\r
      <TextArea label="The file" rows={10} readOnly spellcheck={false} wrap="off" x-model={() => s.text} />\r
    </div>\r
  );\r
}\r
`,Di=`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Scheduler } from '@motifx-community/ui';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
import { sampleAppointments, type Meeting } from './sample-appointments';\r
\r
/** Appointments from a data source that responds with a delay, like a server. Only the displayed days are requested. */\r
export default function FromSource() {\r
  const asked = reactive({ text: '' });\r
  const adapter = new SlowAdapter<Meeting, number>({ data: sampleAppointments(), key: 'id' }, 600);\r
  const source = new data.DataSource<Meeting, number>({\r
    adapter,\r
    // 'all': a view needs every appointment of its days, and the scheduler requests only those days.\r
    loadMode: 'all',\r
  });\r
  source.onChanged((e) => {\r
    if (e.reason !== 'loading') return;\r
    const filter = JSON.stringify(source.filter);\r
    asked.text = \`Asked: \${filter.length > 140 ? filter.slice(0, 140) + '…' : filter}\`;\r
  });\r
  return (\r
    <div class="sched-demo" onDisposing={() => source.dispose()}>\r
      <Scheduler<Meeting> dataSource={source} currentView="month" />\r
      <p class="sched-log">{() => asked.text}</p>\r
    </div>\r
  );\r
}\r
`,Oi=`import { reactive } from '@motifx/core';\r
import { Scheduler, Switch } from '@motifx-community/ui';\r
import { bookings, people, rooms, type Booking } from './resource-data';\r
\r
/**\r
 * Columns grouped by room, then by the people of each room (\`parentExpr\`: a person's room). Drag a\r
 * booking to another person: only that person changes, the others stay on it. "Group by date" puts\r
 * the people under each day.\r
 */\r
export default function Grouped() {\r
  const s = reactive({ byDate: false });\r
  const resources = [\r
    { field: 'roomId', label: 'Room', items: rooms },\r
    { field: 'ownerIds', label: 'People', items: people, allowMultiple: true, parentExpr: 'roomId', useColorAsDefault: true },\r
  ];\r
  return (\r
    <div class="sched-demo">\r
      <Switch label="Group by date" x-model={() => s.byDate} />\r
      <Scheduler<Booking>\r
        appointments={bookings()}\r
        resources={resources}\r
        groups={['roomId', 'ownerIds']}\r
        groupByDate={() => s.byDate}\r
        views={['day', { type: 'workWeek', name: 'workWeek' }, 'month']}\r
        currentView="day"\r
        startDayHour={8}\r
        endDayHour={18}\r
      />\r
    </div>\r
  );\r
}\r
`,ki=`import { Scheduler } from '@motifx-community/ui';\r
import { jobs, members, teams, type Job } from './timeline-data';\r
\r
/** With \`groups\`, each team's days under its name, the jobs coloured by their person. */\r
export default function GroupedAgenda() {\r
  const resources = [\r
    { field: 'teamId', label: 'Team', items: teams },\r
    { field: 'ownerId', label: 'Person', items: members, useColorAsDefault: true },\r
  ];\r
  return (\r
    <div class="sched-demo">\r
      <Scheduler<Job>\r
        appointments={jobs()}\r
        resources={resources}\r
        views={[{ type: 'agenda', agendaDuration: 3, groups: ['teamId'] }, 'timelineDay']}\r
        currentView="agenda"\r
      />\r
    </div>\r
  );\r
}\r
`,Ai=`import { Scheduler, type ResourceHeaderContext } from '@motifx-community/ui';\r
import { bookings, people, rooms, type Booking, type Person } from './resource-data';\r
\r
/** A person's header drawn by a template: their initials in their color, their name and their room. */\r
function PersonHead(context: ResourceHeaderContext) {\r
  const person = context.item as Person;\r
  const initials = context.text\r
    .split(' ')\r
    .map((part) => part[0])\r
    .join('');\r
  const room = rooms.find((r) => r.id === person.roomId)?.text ?? '';\r
  return (\r
    <div class="sched-person">\r
      <span class="sched-person__avatar" style={{ '--person-color': context.color }} aria-hidden="true">\r
        {initials}\r
      </span>\r
      <span class="sched-person__name">\r
        <strong>{context.text}</strong>\r
        <small>{room}</small>\r
      </span>\r
    </div>\r
  );\r
}\r
\r
/** Grouped by person, with each header created by \`resourceHeaderTemplate\`. */\r
export default function HeaderTemplate() {\r
  const resources = [{ field: 'ownerIds', label: 'People', items: people, allowMultiple: true, useColorAsDefault: true }];\r
  return (\r
    <div class="sched-demo">\r
      <Scheduler<Booking>\r
        appointments={bookings()}\r
        resources={resources}\r
        groups={['ownerIds']}\r
        currentView="day"\r
        startDayHour={8}\r
        endDayHour={18}\r
        resourceHeaderTemplate={(context: ResourceHeaderContext) => PersonHead(context)}\r
      />\r
    </div>\r
  );\r
}\r
`,ji=`import { reactive } from '@motifx/core';\r
import { Button, Scheduler, Stack, TextArea } from '@motifx-community/ui';\r
import type { Booking } from './recurring-appointments';\r
\r
const pad = (n: number) => String(n).padStart(2, '0');\r
const today = new Date();\r
const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));\r
const date = (offset: number) => {\r
  const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset);\r
  return \`\${d.getFullYear()}\${pad(d.getMonth() + 1)}\${pad(d.getDate())}\`;\r
};\r
\r
/** A typical calendar export: a zone with its Windows name and VTIMEZONE, a weekly series with one excluded day, an all-day event, and folded, escaped text. */\r
const FILE = [\r
  'BEGIN:VCALENDAR',\r
  'VERSION:2.0',\r
  'PRODID:-//Example//Calendar//EN',\r
  'BEGIN:VTIMEZONE',\r
  'TZID:W. Europe Standard Time',\r
  'BEGIN:STANDARD',\r
  'DTSTART:16010101T030000',\r
  'TZOFFSETFROM:+0200',\r
  'TZOFFSETTO:+0100',\r
  'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10',\r
  'END:STANDARD',\r
  'BEGIN:DAYLIGHT',\r
  'DTSTART:16010101T020000',\r
  'TZOFFSETFROM:+0100',\r
  'TZOFFSETTO:+0200',\r
  'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3',\r
  'END:DAYLIGHT',\r
  'END:VTIMEZONE',\r
  'BEGIN:VEVENT',\r
  'UID:sync-1@example.com',\r
  'DTSTAMP:20260101T000000Z',\r
  \`DTSTART;TZID=W. Europe Standard Time:\${date(0)}T100000\`,\r
  \`DTEND;TZID=W. Europe Standard Time:\${date(0)}T110000\`,\r
  'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=12',\r
  \`EXDATE;TZID=W. Europe Standard Time:\${date(2)}T100000\`,\r
  'SUMMARY:Sync with Berlin',\r
  'DESCRIPTION:Agenda:\\n1. Status\\, risks\\n2. Next steps',\r
  'END:VEVENT',\r
  'BEGIN:VEVENT',\r
  'UID:offsite-1@example.com',\r
  'DTSTAMP:20260101T000000Z',\r
  \`DTSTART;VALUE=DATE:\${date(3)}\`,\r
  \`DTEND;VALUE=DATE:\${date(5)}\`,\r
  'SUMMARY:Team offsite',\r
  'END:VEVENT',\r
  'BEGIN:VEVENT',\r
  'UID:call-1@example.com',\r
  'DTSTAMP:20260101T000000Z',\r
  \`DTSTART:\${date(1)}T130000Z\`,\r
  'DURATION:PT45M',\r
  'SUMMARY:Call with the customer about the long running rollout of the new pl',\r
  ' anning tool',\r
  'END:VEVENT',\r
  'END:VCALENDAR',\r
].join('\\r\\n');\r
\r
/**\r
 * A file read in: each event is added through the data layer as any new appointment is (here an\r
 * array; a data source gets the same adds through its adapter), with \`onAppointmentAdding\` first.\r
 * Read it in again: an event whose UID is there already changes that appointment.\r
 */\r
export default function ImportCalendar() {\r
  const s = reactive({ text: FILE, said: '' });\r
  const scheduler = (<Scheduler<Booking> appointments={reactive([] as Booking[])} startDayHour={8} endDayHour={18} />) as Scheduler<Booking>;\r
  const read = async () => {\r
    const result = await scheduler.importICalendar(s.text);\r
    s.said = result ? \`\${result.added.length} added, \${result.updated.length} changed, \${result.failed.length} refused\` : 'Not read in';\r
  };\r
  return (\r
    <div class="sched-demo">\r
      <TextArea label="iCalendar file" rows={8} spellcheck={false} wrap="off" x-model={() => s.text} />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Read in" tone="accent" onclick={() => void read()} />\r
        <output class="sched-log">{() => s.said}</output>\r
      </Stack>\r
      {scheduler}\r
    </div>\r
  );\r
}\r
`,Mi=`import { reactive } from '@motifx/core';\r
import { Scheduler, Switch } from '@motifx-community/ui';\r
import { jobs, members, teams, type Job } from './timeline-data';\r
\r
/**\r
 * Rows grouped by team, then by the people of each team (\`parentExpr\`). Up and Down on a job move it\r
 * to the row above or below; Left and Right move it along the time. "Right to left" mirrors the\r
 * time and the resource column.\r
 */\r
export default function NestedTimeline() {\r
  const s = reactive({ rtl: false });\r
  const resources = [\r
    { field: 'teamId', label: 'Team', items: teams },\r
    { field: 'ownerId', label: 'Person', items: members, parentExpr: 'teamId', useColorAsDefault: true },\r
  ];\r
  return (\r
    <div class="sched-demo" dir={() => (s.rtl ? 'rtl' : 'ltr')}>\r
      <Switch label="Right to left" x-model={() => s.rtl} />\r
      <Scheduler<Job>\r
        appointments={jobs()}\r
        resources={resources}\r
        groups={['teamId', 'ownerId']}\r
        views={['timelineDay', 'timelineWorkWeek']}\r
        currentView="timelineDay"\r
        startDayHour={7}\r
        endDayHour={21}\r
      />\r
    </div>\r
  );\r
}\r
`,Ni=`import { reactive } from '@motifx/core';\r
import { Button, FormLayout, MxForm, Scheduler, Stack, type FormOpeningEventArgs } from '@motifx-community/ui';\r
import { bookings, rooms, type Booking } from './resource-data';\r
\r
/**\r
 * A form of your own: \`onFormOpening\` cancels the scheduler's and opens a short one (a title and a\r
 * room), then saves through the scheduler, so its events and its checks still run.\r
 */\r
export default function OwnForm() {\r
  const opening = async (e: FormOpeningEventArgs<Booking>) => {\r
    e.cancel = true;\r
    const data = reactive({ text: String(e.data.text), roomId: (e.data.roomId as number | null) ?? 1 });\r
    const form = new MxForm({ title: e.appointment ? 'Quick edit' : 'Quick booking', modal: true });\r
    let layout: FormLayout<typeof data> | null = null;\r
    form.content = (\r
      <FormLayout<typeof data>\r
        data={data}\r
        ref={(c: FormLayout<typeof data>) => (layout = c)}\r
        items={[\r
          { field: 'text', label: 'Title', required: true },\r
          { field: 'roomId', label: 'Room', editor: 'radio', editorProps: { items: rooms, itemText: 'text', itemValue: 'id', orientation: 'horizontal' } },\r
        ]}\r
      />\r
    );\r
    form.footer = (\r
      <Stack orientation="horizontal" justify="end">\r
        <Button text="Save" tone="accent" onclick={async () => layout && (await layout.validate()).valid && form.close('ok')} />\r
        <Button text="Cancel" onclick={() => form.close('cancel')} />\r
      </Stack>\r
    );\r
    if ((await form.showDialog(e.source)) !== 'ok') return;\r
    if (e.appointment) await e.source.updateAppointment(e.appointment, { text: data.text, roomId: data.roomId });\r
    else await e.source.addAppointment({ text: data.text, roomId: data.roomId, startDate: e.data.start ?? new Date(), endDate: e.data.end ?? new Date() });\r
  };\r
  return (\r
    <div class="sched-demo">\r
      <Scheduler<Booking>\r
        appointments={bookings()}\r
        resources={[{ field: 'roomId', label: 'Room', items: rooms, useColorAsDefault: true }]}\r
        currentView="workWeek"\r
        startDayHour={8}\r
        endDayHour={18}\r
        onFormOpening={(e) => void opening(e)}\r
      />\r
    </div>\r
  );\r
}\r
`,Pi=`import { reactive, type Component } from '@motifx/core';\r
import { Button, Scheduler, Stack } from '@motifx-community/ui';\r
import { sampleAppointments, type Meeting } from './sample-appointments';\r
\r
/**\r
 * A scheduler that goes by its own width (\`presentation: 'auto'\`), in a frame the size of a phone:\r
 * under 560 pixels it shows as on a phone, under 1024 as on a tablet (here by the width alone,\r
 * \`tabletWhen: 'width'\`, so a mouse shows it too). Drag the frame's corner, or pick a width.\r
 */\r
export default function PhoneFrame() {\r
  const s = reactive({ shown: '' });\r
  let frame!: Component<HTMLDivElement>;\r
  const width = (px: string) => (frame.element.style.inlineSize = px);\r
  return (\r
    <div class="sched-demo">\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="390 px" variant="outline" onclick={() => width('390px')} />\r
        <Button text="820 px" variant="outline" onclick={() => width('820px')} />\r
        <Button text="Full width" variant="outline" onclick={() => width('100%')} />\r
        <output class="sched-log">{() => s.shown}</output>\r
      </Stack>\r
      <div ref={(c: Component<HTMLDivElement>) => (frame = c)} class="sched-phone-frame">\r
        <Scheduler<Meeting>\r
          appointments={sampleAppointments()}\r
          views={['day', 'week', 'month', 'agenda']}\r
          tabletWhen="width"\r
          startDayHour={7}\r
          onPresentationChanged={(e) => (s.shown = \`\${e.to} at \${e.width} px\`)}\r
        />\r
      </div>\r
    </div>\r
  );\r
}\r
`,Fi=`import { reactive } from '@motifx/core';\r
import { RadioGroup, Scheduler, Stack, type SchedulerPresentation } from '@motifx-community/ui';\r
import { sampleAppointments, type Meeting } from './sample-appointments';\r
\r
/**\r
 * One scheduler shown three ways. As on a phone it shows the agenda (a day where it has none), the\r
 * bar holds the month, Today and a menu of the views, the tooltip and the form come up from the\r
 * bottom. Going back, it shows the view it had. The appointments and the date stay the same.\r
 */\r
export default function Presentations() {\r
  const s = reactive({ presentation: 'phone' as SchedulerPresentation, said: '' });\r
  const scheduler = (\r
    <Scheduler<Meeting>\r
      appointments={sampleAppointments()}\r
      views={['day', 'week', 'month', 'agenda']}\r
      presentation={() => s.presentation}\r
      startDayHour={7}\r
      onPresentationChanged={(e) => (s.said = \`\${e.from} → \${e.to}\${e.width ? \` (\${e.width} px wide)\` : ''}\`)}\r
    />\r
  ) as Scheduler<Meeting>;\r
  return (\r
    <div class="sched-demo">\r
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
        <output class="sched-log">{() => (s.said ? \`Shown: \${s.said}\` : \`Shown as: \${scheduler.currentPresentation}\`)}</output>\r
      </Stack>\r
      {scheduler}\r
    </div>\r
  );\r
}\r
`,Ii=`import { reactive } from '@motifx/core';\r
import { Button, Scheduler, Stack } from '@motifx-community/ui';\r
import { sampleAppointments, type Meeting } from './sample-appointments';\r
\r
/**\r
 * \`print()\` prints the scheduler alone: the days shown, every hour and every row, nothing scrolled,\r
 * the colours kept and the bar left out. The browser's own print prints it the same way, with the\r
 * rest of the page.\r
 */\r
export default function PrintCalendar() {\r
  const s = reactive({ said: '' });\r
  const scheduler = (\r
    <Scheduler<Meeting>\r
      appointments={sampleAppointments()}\r
      views={['day', 'week', 'month', 'timelineWeek', 'agenda']}\r
      startDayHour={8}\r
      endDayHour={18}\r
      onPrinting={() => (s.said = 'Printing…')}\r
      onPrinted={() => (s.said = 'The print dialog closed.')}\r
    />\r
  ) as Scheduler<Meeting>;\r
  return (\r
    <div class="sched-demo">\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Print" tone="accent" onclick={() => void scheduler.print()} />\r
        <output class="sched-log">{() => s.said}</output>\r
      </Stack>\r
      {scheduler}\r
    </div>\r
  );\r
}\r
`,Li=`import { reactive } from '@motifx/core';\r
import { Button, Scheduler, Stack } from '@motifx-community/ui';\r
import { sampleAppointments, type Meeting } from './sample-appointments';\r
\r
/** A scheduler created with \`new\`, added programmatically and controlled through its methods. */\r
export default function Programmatic() {\r
  const state = reactive({ said: '' });\r
  let host: Stack | null = null;\r
  let scheduler: Scheduler<Meeting> | null = null;\r
\r
  const make = () => {\r
    if (scheduler) return;\r
    scheduler = new Scheduler<Meeting>({\r
      appointments: sampleAppointments(),\r
      currentView: 'workWeek',\r
      locale: 'tr-TR',\r
      firstDayOfWeek: 1,\r
    });\r
    scheduler.onDateChanged(\r
      (e) => (state.said = \`Shows \${e.range.start.toLocaleDateString('tr-TR')} – \${new Date(e.range.end.getTime() - 1).toLocaleDateString('tr-TR')}\`),\r
    );\r
    scheduler.onSelectionChanged(\r
      (e) =>\r
        (state.said = e.selection\r
          ? \`Selected \${e.selection.start.toLocaleString('tr-TR')} – \${e.selection.end.toLocaleTimeString('tr-TR')}\`\r
          : 'Nothing selected'),\r
    );\r
    host?.controls.add(scheduler);\r
  };\r
  // The work week shows Monday to Friday: the next of those days.\r
  const nextWorkday = () => {\r
    const t = new Date();\r
    let start = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1, 9);\r
    while (start.getDay() === 0 || start.getDay() === 6) start = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1, 9);\r
    scheduler?.showDate(start);\r
    scheduler?.selectCells({\r
      start,\r
      end: new Date(start.getTime() + 90 * 60_000),\r
      allDay: false,\r
    });\r
    scheduler?.scrollToTime(8);\r
  };\r
  return (\r
    <div class="sched-demo">\r
      <div class="docs-flow">\r
        <Button text="Create" variant="outline" onclick={make} />\r
        <Button text="Previous" variant="outline" onclick={() => scheduler?.previous()} />\r
        <Button text="Next" variant="outline" onclick={() => scheduler?.next()} />\r
        <Button text="Select the next workday 9:00–10:30" variant="outline" onclick={nextWorkday} />\r
        <Button text="Month" variant="outline" onclick={() => scheduler?.showView('month')} />\r
      </div>\r
      <p class="sched-log" role="status">\r
        {() => state.said}\r
      </p>\r
      <Stack ref={(c: Stack) => (host = c)} />\r
    </div>\r
  );\r
}\r
`,Ri=`import { reactive } from '@motifx/core';\r
import { Scheduler, Switch } from '@motifx-community/ui';\r
import { recurringAppointments, type Booking } from './recurring-appointments';\r
\r
/** Series with a rule each, one day excluded from the standup and one edited individually. Click one, and its tooltip describes how it repeats. */\r
export default function Recurring() {\r
  const s = reactive({ marks: true });\r
  return (\r
    <div class="sched-demo">\r
      <div class="docs-flow">\r
        <Switch label="Marks" x-model={() => s.marks} />\r
      </div>\r
      <Scheduler<Booking> appointments={recurringAppointments()} startDayHour={8} endDayHour={18} recurrenceMarks={() => s.marks} editing={false} />\r
    </div>\r
  );\r
}\r
`,zi=`import { reactive } from '@motifx/core';\r
import { RadioGroup, Scheduler } from '@motifx-community/ui';\r
import { bookings, people, rooms, type Booking } from './resource-data';\r
\r
/**\r
 * Two kinds of resources: a booking has one room and one or more people. Their colours paint the\r
 * bookings; the choice says which kind does (\`useColorAsDefault\`, a function, so it follows).\r
 * Click a booking: the tooltip names its room and its people.\r
 */\r
export default function Resources() {\r
  const s = reactive({ by: 'room' });\r
  const resources = [\r
    { field: 'roomId', label: 'Room', items: rooms, useColorAsDefault: () => s.by === 'room' },\r
    { field: 'ownerIds', label: 'People', items: people, allowMultiple: true, useColorAsDefault: () => s.by === 'people' },\r
  ];\r
  return (\r
    <div class="sched-demo">\r
      <RadioGroup\r
        label="Colour by"\r
        orientation="horizontal"\r
        items={[\r
          { value: 'room', text: 'Room' },\r
          { value: 'people', text: 'People' },\r
        ]}\r
        itemText="text"\r
        itemValue="value"\r
        x-model={() => s.by}\r
      />\r
      <Scheduler<Booking> appointments={bookings()} resources={resources} currentView="week" startDayHour={8} endDayHour={18} />\r
    </div>\r
  );\r
}\r
`,Bi=`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { CheckBox, Scheduler } from '@motifx-community/ui';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
import { bookings, rooms, type Booking, type Room } from './resource-data';\r
\r
/**\r
 * The rooms and the bookings both come from data sources that answer late. The rooms load once and\r
 * are followed: filter them and the groups change. Grouped by room, the bookings are asked for the\r
 * days and the rooms shown only.\r
 */\r
export default function ResourcesFromSource() {\r
  const s = reactive({ two: false, asked: '' });\r
  const roomSource = new data.DataSource<Room, number>({ adapter: new SlowAdapter<Room, number>({ data: rooms, key: 'id' }, 400), loadMode: 'all' });\r
  const source = new data.DataSource<Booking, number>({ adapter: new SlowAdapter<Booking, number>({ data: bookings(), key: 'id' }, 600), loadMode: 'all' });\r
  source.onChanged((e) => {\r
    if (e.reason !== 'loading') return;\r
    const rooms = JSON.stringify((source.filter as { and?: unknown[] } | null)?.and?.slice(2) ?? []);\r
    s.asked = \`Asked for the rooms: \${rooms}\`;\r
  });\r
  const onlyTwo = (on: boolean) => void roomSource.setFilter(on ? { field: 'id', op: 'in', value: [1, 2] } : null);\r
  return (\r
    <div\r
      class="sched-demo"\r
      onDisposing={() => {\r
        source.dispose();\r
        roomSource.dispose();\r
      }}\r
    >\r
      <CheckBox\r
        label="Only Atlas and Bosphorus"\r
        x-model={() => s.two}\r
        onValueChanged={(e: { value: boolean | null }) => onlyTwo(!!e.value)}\r
      />\r
      <Scheduler<Booking>\r
        dataSource={source}\r
        resources={[{ field: 'roomId', label: 'Room', items: roomSource }]}\r
        groups={['roomId']}\r
        currentView="workWeek"\r
        startDayHour={8}\r
        endDayHour={18}\r
      />\r
      <p class="sched-log">{() => s.asked}</p>\r
    </div>\r
  );\r
}\r
`,Vi=`import { reactive } from '@motifx/core';\r
import { RecurrenceEditor } from '@motifx-community/ui';\r
\r
/** The standalone editor: it reads and writes the rule text, and describes it in words below. */\r
export default function RuleEditor() {\r
  const s = reactive({ rule: 'FREQ=MONTHLY;BYDAY=2TU;COUNT=6' });\r
  return (\r
    <div class="sched-demo sched-rule">\r
      <RecurrenceEditor x-model={() => s.rule} start={new Date()} />\r
      <p class="sched-log">\r
        <code>{() => s.rule || '(none)'}</code>\r
      </p>\r
    </div>\r
  );\r
}\r
`,Hi=`import { reactive } from '@motifx/core';\r
import { Scheduler, type DragEventArgs } from '@motifx-community/ui';\r
import { sampleAppointments, type Meeting } from './sample-appointments';\r
\r
type Locked = Meeting & { allowDrag?: boolean; allowResize?: boolean };\r
\r
/** Nothing may go over lunch (12:00–13:00) or onto a weekend: the drag shows it cannot drop there. "Lunch with Ana" is locked in place. */\r
export default function Rules() {\r
  const list = sampleAppointments() as Locked[];\r
  const lunch = list.find((m) => m.text === 'Lunch with Ana');\r
  if (lunch) {\r
    lunch.allowDrag = false;\r
    lunch.allowResize = false;\r
  }\r
  const s = reactive({ said: '' });\r
  const allowed = (e: DragEventArgs<Locked>) => {\r
    const weekend = [0, 6].includes(e.start.getDay());\r
    const noon = new Date(e.start.getFullYear(), e.start.getMonth(), e.start.getDate(), 12);\r
    const overLunch = !e.allDay && e.start < new Date(noon.getTime() + 3_600_000) && e.end > noon;\r
    e.cancel = weekend || overLunch;\r
    s.said = weekend ? 'Not on a weekend.' : overLunch ? 'Not over lunch.' : '';\r
  };\r
  return (\r
    <div class="sched-demo">\r
      <Scheduler<Locked> appointments={list} startDayHour={8} endDayHour={19} onMoving={allowed} onResizing={allowed} />\r
      <p class="sched-log" role="status">\r
        {() => s.said}\r
      </p>\r
    </div>\r
  );\r
}\r
`,Ui=`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Scheduler } from '@motifx-community/ui';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
import { sampleAppointments, type Meeting } from './sample-appointments';\r
\r
/** A service that saves late and refuses every third change. */\r
class PickyService extends SlowAdapter<Meeting, number> {\r
  private changes = 0;\r
\r
  protected override async updateRow(key: number, changes: Partial<Meeting>): Promise<Partial<Meeting>> {\r
    await new Promise((done) => setTimeout(done, 700));\r
    if (++this.changes % 3 === 0) throw new Error('The server said no.');\r
    return super.updateRow(key, changes);\r
  }\r
}\r
\r
/** Move an appointment: it waits in place while the server saves, and reverts if saving fails. */\r
export default function Saving() {\r
  const s = reactive({ said: 'Move an appointment: it waits for the server; every third change fails.' });\r
  const source = new data.DataSource<Meeting, number>({ adapter: new PickyService({ data: sampleAppointments(), key: 'id' }, 300), loadMode: 'all' });\r
  return (\r
    <div class="sched-demo" onDisposing={() => source.dispose()}>\r
      <Scheduler<Meeting>\r
        dataSource={source}\r
        currentView="workWeek"\r
        startDayHour={8}\r
        endDayHour={19}\r
        onAppointmentUpdated={(e) => (s.said = \`Saved: \${e.appointment.text}\`)}\r
        onDataError={(e) => (s.said = \`Not saved (\${(e.error as Error).message}); it is back where it was.\`)}\r
      />\r
      <p class="sched-log" role="status">\r
        {() => s.said}\r
      </p>\r
    </div>\r
  );\r
}\r
`,Wi=`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { RadioGroup, Scheduler, type SeriesEditMode } from '@motifx-community/ui';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
import { recurringAppointments, type Booking } from './recurring-appointments';\r
\r
/**\r
 * The series come from a data source, as from a server. Drag an occurrence, change it in its form or\r
 * delete it: the scheduler asks what the change reaches, unless the setting answers, and writes\r
 * it through the adapter (an occurrence changed apart is a row of its own).\r
 */\r
export default function SeriesQuestion() {\r
  const s = reactive({ mode: 'ask' as SeriesEditMode, log: [] as string[] });\r
  let next = 100;\r
  const adapter = new SlowAdapter<Booking, number>({ data: recurringAppointments(), key: 'id', createKey: () => next++ }, 200);\r
  const source = new data.DataSource<Booking, number>({ adapter, loadMode: 'all' });\r
  const say = (text: string) => {\r
    s.log.unshift(text);\r
    if (s.log.length > 6) s.log.pop();\r
  };\r
  return (\r
    <div class="sched-demo" onDisposing={() => source.dispose()}>\r
      <RadioGroup\r
        label="A change to an occurrence reaches"\r
        orientation="horizontal"\r
        items={[\r
          { value: 'ask', text: 'Ask' },\r
          { value: 'occurrence', text: 'This one' },\r
          { value: 'following', text: 'This and following' },\r
          { value: 'series', text: 'The whole series' },\r
        ]}\r
        x-model={() => s.mode}\r
      />\r
      <Scheduler<Booking>\r
        dataSource={source}\r
        startDayHour={8}\r
        endDayHour={18}\r
        seriesEdit={() => s.mode}\r
        onSeriesAnswered={(e) => say(\`Asked about \${e.appointment.text} (\${e.action}): \${e.scope ?? 'cancelled'}\`)}\r
        onAppointmentUpdated={(e) => say(\`Saved \${e.appointment.text}\${e.scope ? \`, \${e.scope}\` : ''}\`)}\r
        onAppointmentDeleted={(e) => say(\`Deleted \${e.appointment.text}\${e.scope ? \`, \${e.scope}\` : ''}\`)}\r
        onDataError={(e) => say(\`Not saved: \${String(e.error)}\${e.undone ? '' : ' (part of it was)'}\`)}\r
      />\r
      <ol class="sched-events" aria-label="What happened">\r
        {s.log.map((line, i) => (\r
          <li key={\`\${i}-\${line}\`}>{line}</li>\r
        ))}\r
      </ol>\r
    </div>\r
  );\r
}\r
`,Gi=`import { Scheduler, type AppointmentTemplateContext } from '@motifx-community/ui';\r
import { sampleAppointments, type Meeting } from './sample-appointments';\r
\r
/** The content of each appointment drawn by a template. The scheduler still positions it, colors it and provides its name. */\r
export default function Templates() {\r
  const template = (c: AppointmentTemplateContext<Meeting>) =>\r
    c.allDay ? (\r
      <strong>{c.text}</strong>\r
    ) : (\r
      <div class="sched-card">\r
        <strong>{c.text}</strong>\r
        <span>{c.allDay ? 'All day' : c.time}</span>\r
        {c.appointment.color ? <span class="sched-tag">{c.appointment.color === '#c62828' ? 'urgent' : 'team'}</span> : <span class="sched-tag">personal</span>}\r
      </div>\r
    );\r
  return (\r
    <div class="sched-demo">\r
      <Scheduler<Meeting> appointments={sampleAppointments()} currentView="day" startDayHour={8} endDayHour={18} appointmentTemplate={template} />\r
    </div>\r
  );\r
}\r
`,Ki=`import { reactive } from '@motifx/core';\r
import { Scheduler } from '@motifx-community/ui';\r
import type { Booking } from './recurring-appointments';\r
\r
/**\r
 * The same appointments on two clocks. The call repeats at 09:00 in New York, so in Istanbul it moves an hour when America\r
 * changes its clocks. The flight leaves on Istanbul's clock and lands on New York's: open it, its form has a separate end time zone.\r
 */\r
export default function TimeZones() {\r
  const today = new Date();\r
  const at = (hour: number) => new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), hour));\r
  const appointments = reactive([\r
    // 09:00 in New York, every weekday, in New York's time zone.\r
    { id: 1, text: 'Call with New York', startDate: at(13), endDate: at(14), startDateTimeZone: 'America/New_York', recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' },\r
    { id: 2, text: 'Istanbul lunch', startDate: at(9), endDate: at(10), startDateTimeZone: 'Europe/Istanbul' },\r
    // 08:00 in Istanbul to 16:00 in New York.\r
    { id: 3, text: 'Flight to New York', startDate: at(5), endDate: at(20), startDateTimeZone: 'Europe/Istanbul', endDateTimeZone: 'America/New_York' },\r
  ]) as Booking[];\r
  const views = [{ type: 'day' as const, intervalCount: 3 }];\r
  return (\r
    <div class="sched-zones">\r
      <div class="sched-card">\r
        <span class="sched-tag">Europe/Istanbul</span>\r
        <Scheduler<Booking> appointments={appointments} views={views} timeZone="Europe/Istanbul" startDayHour={6} endDayHour={22} editing={{ allowTimeZones: true }} />\r
      </div>\r
      <div class="sched-card">\r
        <span class="sched-tag">America/New_York</span>\r
        <Scheduler<Booking> appointments={appointments} views={views} timeZone="America/New_York" startDayHour={0} endDayHour={16} editing={{ allowTimeZones: true }} />\r
      </div>\r
    </div>\r
  );\r
}\r
`,qi=`import { Scheduler } from '@motifx-community/ui';\r
import { jobs, members, type Job } from './timeline-data';\r
\r
/**\r
 * The four timeline views, a row per person. Jobs at the same time stack in their row, and the row\r
 * grows. Drag one along its row or to another person; drag its ends to change its time.\r
 */\r
export default function Timeline() {\r
  const resources = [{ field: 'ownerId', label: 'Person', items: members, useColorAsDefault: true }];\r
  return (\r
    <div class="sched-demo">\r
      <Scheduler<Job>\r
        appointments={jobs()}\r
        resources={resources}\r
        groups={['ownerId']}\r
        views={['timelineDay', 'timelineWeek', 'timelineWorkWeek', 'timelineMonth']}\r
        currentView="timelineWeek"\r
        startDayHour={7}\r
        endDayHour={20}\r
        cellDuration={60}\r
      />\r
    </div>\r
  );\r
}\r
`,Ji=`import { reactive } from '@motifx/core';\r
import { Scheduler, Switch, type MoreListContext } from '@motifx-community/ui';\r
import { jobs, members, type Job } from './timeline-data';\r
\r
/** A short list of its own for "+N more": the day and each job's name. */\r
function Jobs(context: MoreListContext<Job>) {\r
  return (\r
    <div class="sched-more">\r
      <strong>{() => context.date?.toLocaleDateString() ?? ''}</strong>\r
      {context.appointments.map((job) => (\r
        <button key={job.id} type="button" class="sched-more__item" onclick={(e: MouseEvent) => context.choose(job, e)}>\r
          {job.text}\r
        </button>\r
      ))}\r
    </div>\r
  );\r
}\r
\r
/**\r
 * Views with settings of their own: a working day in half hours, a fortnight in four-hour cells\r
 * counted from a fixed Monday (\`startDate\`), and a month of days with at most two lanes a row\r
 * ("+N more" opens a list of its own). A setting not given is the scheduler's.\r
 */\r
export default function TimelineSettings() {\r
  const s = reactive({ dim: true });\r
  const resources = [{ field: 'ownerId', label: 'Person', items: members, useColorAsDefault: true }];\r
  const monday = new Date(2026, 0, 5);\r
  return (\r
    <div class="sched-demo">\r
      <Switch label="Ended ones quieter" x-model={() => s.dim} />\r
      <Scheduler<Job>\r
        appointments={jobs()}\r
        resources={resources}\r
        groups={['ownerId']}\r
        views={[\r
          { type: 'timelineDay', name: 'workday', text: 'Workday', startDayHour: 8, endDayHour: 18, cellDuration: 30 },\r
          { type: 'timelineWeek', name: 'fortnight', text: 'Fortnight', intervalCount: 2, startDate: monday, cellDuration: 240 },\r
          { type: 'timelineMonth', name: 'month', text: 'Month', maxAppointmentsPerCell: 2, moreListTemplate: Jobs },\r
        ]}\r
        currentView="fortnight"\r
        dimPast={() => s.dim}\r
      />\r
    </div>\r
  );\r
}\r
`,Yi=`import { Scheduler, type AppointmentTemplateContext, type CellTemplateContext, type DateTemplateContext, type ResourceHeaderContext, type TimeTemplateContext } from '@motifx-community/ui';\r
import { jobs, members, type Job, type Member } from './timeline-data';\r
\r
/**\r
 * Templates, for the scheduler and for one view: the person's head with their hours, each day's\r
 * head, the hours, a mark on the cells outside the work hours (in the week only: a view's own\r
 * template wins) and the job's content.\r
 */\r
export default function TimelineTemplates() {\r
  const resources = [{ field: 'ownerId', label: 'Person', items: members, useColorAsDefault: true }];\r
  const head = (c: ResourceHeaderContext) => {\r
    const person = c.item as Member;\r
    return (\r
      <div class="sched-person">\r
        <span class="sched-person__avatar" style={{ '--person-color': c.color }} aria-hidden="true">\r
          {c.text\r
            .split(' ')\r
            .map((p) => p[0])\r
            .join('')}\r
        </span>\r
        <span class="sched-person__name">\r
          <strong>{c.text}</strong>\r
          <small>{\`\${person.workStartHour ?? 9}:00–\${person.workEndHour ?? 17}:00\`}</small>\r
        </span>\r
      </div>\r
    );\r
  };\r
  const date = (c: DateTemplateContext) => <span class="sched-date">{\`\${c.weekday} \${c.number}\`}</span>;\r
  const time = (c: TimeTemplateContext) => <span class="sched-time">{c.text}</span>;\r
  const cell = (c: CellTemplateContext) => <span class="sched-off" data-off={() => (!c.work ? '' : null)} aria-hidden="true" />;\r
  const job = (c: AppointmentTemplateContext<Job>) => (\r
    <span class="sched-job">\r
      <strong>{c.text}</strong> <span>{c.time}</span>\r
    </span>\r
  );\r
  return (\r
    <div class="sched-demo">\r
      <Scheduler<Job>\r
        appointments={jobs()}\r
        resources={resources}\r
        groups={['ownerId']}\r
        views={['timelineDay', { type: 'timelineWeek', dataCellTemplate: cell }]}\r
        currentView="timelineWeek"\r
        startDayHour={7}\r
        endDayHour={20}\r
        cellDuration={60}\r
        resourceHeaderTemplate={head}\r
        dateCellTemplate={date}\r
        timeCellTemplate={time}\r
        appointmentTemplate={job}\r
      />\r
    </div>\r
  );\r
}\r
`,Xi=`import { reactive } from '@motifx/core';\r
import { NumberBox, Scheduler, Stack, Switch } from '@motifx-community/ui';\r
import { sampleAppointments, type Meeting } from './sample-appointments';\r
\r
/**\r
 * A finger: hold an appointment to lift it and drag it; let go and its handles stay, drag one to\r
 * resize. Swipe sideways for the next or the previous days; pinch to zoom the hours. Tap a free\r
 * cell, then tap it again for a new appointment.\r
 */\r
export default function Touch() {\r
  const s = reactive({ swipe: true, pinch: true, zoom: 1, said: '' });\r
  return (\r
    <div class="sched-demo">\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Switch label="Swipe between days" x-model={() => s.swipe} />\r
        <Switch label="Pinch to zoom" x-model={() => s.pinch} />\r
        <NumberBox label="Zoom" labelMode="side" min={0.5} max={4} step={0.25} x-model={() => s.zoom} />\r
        <output class="sched-log">{() => s.said}</output>\r
      </Stack>\r
      <Scheduler<Meeting>\r
        appointments={sampleAppointments()}\r
        views={['day', 'week', 'timelineDay']}\r
        currentView="week"\r
        presentation="tablet"\r
        swipeNavigation={() => s.swipe}\r
        pinchZoom={() => s.pinch}\r
        timeZoom={() => s.zoom}\r
        onTimeZoomChanged={(e) => {\r
          s.zoom = e.to;\r
          s.said = \`Zoomed from \${e.from.toFixed(2)} to \${e.to.toFixed(2)}\`;\r
        }}\r
        onMoveEnd={(e) => (s.said = \`\${e.appointment.text} moved\`)}\r
        onDateChanged={(e) => (s.said = e.byUser ? \`Moved to \${e.to.toDateString()}\` : s.said)}\r
      />\r
    </div>\r
  );\r
}\r
`,Zi=`import { reactive } from '@motifx/core';\r
import { Scheduler, Switch } from '@motifx-community/ui';\r
import { sampleAppointments, type Meeting } from './sample-appointments';\r
\r
/** Views of its own (three days, two weeks) next to the built-in ones, and settings bound to switches. */\r
export default function Views() {\r
  const s = reactive({\r
    allDay: true,\r
    dim: true,\r
    cascade: false,\r
    quarter: false,\r
    holidays: true,\r
  });\r
  // Every Friday is a holiday here, to show the appearance.\r
  const friday = (date: Date) => date.getDay() === 5;\r
  return (\r
    <div class="sched-demo">\r
      <div class="docs-flow">\r
        <Switch label="All-day panel" x-model={() => s.allDay} />\r
        <Switch label="Ended ones quieter" x-model={() => s.dim} />\r
        <Switch label="Cascade" x-model={() => s.cascade} />\r
        <Switch label="15-minute cells" x-model={() => s.quarter} />\r
        <Switch label="Fridays off" x-model={() => s.holidays} />\r
      </div>\r
      <Scheduler<Meeting>\r
        appointments={sampleAppointments()}\r
        views={[\r
          'day',\r
          { type: 'day', name: 'threeDays', text: '3 days', intervalCount: 3 },\r
          'workWeek',\r
          { type: 'week', name: 'twoWeeks', text: '2 weeks', intervalCount: 2 },\r
          'month',\r
        ]}\r
        currentView="threeDays"\r
        startDayHour={8}\r
        endDayHour={20}\r
        allDayPanel={() => s.allDay}\r
        dimPast={() => s.dim}\r
        overlapMode={() => (s.cascade ? 'cascade' : 'columns')}\r
        cellDuration={() => (s.quarter ? 15 : 30)}\r
        isHoliday={() => (s.holidays ? friday : null)}\r
      />\r
    </div>\r
  );\r
}\r
`,Qi=`import { reactive } from '@motifx/core';\r
\r
export interface Task {\r
  id: number;\r
  text: string;\r
  startDate: Date;\r
  endDate: Date;\r
  resourceId: number;\r
}\r
\r
export interface Machine {\r
  id: number;\r
  text: string;\r
  color: string;\r
}\r
\r
const COLORS = ['#1565c0', '#2e7d32', '#6a1b9a', '#ad1457', '#ef6c00', '#00838f', '#455a64', '#5d4037'];\r
const WORK = ['Cut', 'Weld', 'Paint', 'Check', 'Pack', 'Load', 'Clean', 'Test'];\r
\r
/** \`count\` resources, named and coloured in turn. */\r
export function machines(count: number): Machine[] {\r
  return Array.from({ length: count }, (_, i) => ({ id: i + 1, text: \`Line \${String(i + 1).padStart(4, '0')}\`, color: COLORS[i % COLORS.length] }));\r
}\r
\r
/**\r
 * \`count\` tasks over the week of \`day\`, spread over the resources: each one an hour or a few long,\r
 * in the working hours, some over each other (a pseudo-random spread, the same each time).\r
 */\r
export function tasks(count: number, resources: number, day = new Date()): Task[] {\r
  const monday = new Date(day.getFullYear(), day.getMonth(), day.getDate() - ((day.getDay() + 6) % 7));\r
  let seed = 7;\r
  const next = () => (seed = (seed * 48271) % 2147483647) / 2147483647;\r
  const out: Task[] = [];\r
  for (let i = 0; i < count; i++) {\r
    const start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + Math.floor(next() * 7), 6 + Math.floor(next() * 12), next() < 0.5 ? 0 : 30);\r
    const end = new Date(start.getTime() + (1 + Math.floor(next() * 4)) * 3_600_000);\r
    out.push({ id: i + 1, text: \`\${WORK[i % WORK.length]} \${i + 1}\`, startDate: start, endDate: end, resourceId: 1 + (i % resources) });\r
  }\r
  return reactive(out) as Task[];\r
}\r
`,$i=`import { reactive } from '@motifx/core';\r
import { formatRuleDate } from '@motifx-community/ui';\r
\r
export interface Booking {\r
  id: number;\r
  text: string;\r
  startDate: Date;\r
  endDate: Date;\r
  allDay?: boolean;\r
  color?: string;\r
  recurrenceRule?: string;\r
  recurrenceException?: string;\r
  recurrenceId?: number;\r
  startDateTimeZone?: string;\r
  endDateTimeZone?: string;\r
}\r
\r
/** Series around this week: a daily standup with one excluded day and one moved, a review every other week, a report on the last Friday, and an all-day Friday. */\r
export function recurringAppointments(): Booking[] {\r
  const today = new Date();\r
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));\r
  const day = (offset: number, hour = 0, minute = 0) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset, hour, minute);\r
  return reactive([\r
    {\r
      id: 1,\r
      text: 'Team standup',\r
      startDate: day(-21, 9),\r
      endDate: day(-21, 9, 30),\r
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',\r
      // This Tuesday is excluded, and this Wednesday's occurrence is moved (appointment 2).\r
      recurrenceException: [day(1, 9), day(2, 9)].map((d) => formatRuleDate({ time: d.getTime(), utc: true, dateOnly: false })).join(','),\r
    },\r
    { id: 2, text: 'Team standup', startDate: day(2, 11), endDate: day(2, 11, 30), recurrenceId: 1 },\r
    {\r
      id: 3,\r
      text: 'Design review',\r
      startDate: day(-11, 14),\r
      endDate: day(-11, 15, 30),\r
      color: '#7c4dff',\r
      recurrenceRule: 'FREQ=WEEKLY;INTERVAL=2;BYDAY=TH',\r
    },\r
    {\r
      id: 4,\r
      text: 'Monthly report',\r
      startDate: day(-60, 16),\r
      endDate: day(-60, 17),\r
      color: '#c62828',\r
      recurrenceRule: 'FREQ=MONTHLY;BYDAY=-1FR',\r
    },\r
    {\r
      id: 5,\r
      text: 'Remote day',\r
      startDate: day(-3),\r
      endDate: day(-2),\r
      allDay: true,\r
      color: '#00838f',\r
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=FR;COUNT=12',\r
    },\r
    { id: 6, text: 'Lunch with Ana', startDate: day(3, 12, 30), endDate: day(3, 13, 30), color: '#2e7d32' },\r
  ]) as Booking[];\r
}\r
`,ea=`import { reactive } from '@motifx/core';\r
\r
export interface Booking {\r
  id: number;\r
  text: string;\r
  startDate: Date;\r
  endDate: Date;\r
  allDay?: boolean;\r
  roomId?: number;\r
  ownerIds?: number[];\r
  color?: string;\r
  description?: string;\r
}\r
\r
export interface Room {\r
  id: number;\r
  text: string;\r
  color: string;\r
  workStartHour?: number;\r
  workEndHour?: number;\r
}\r
\r
export interface Person {\r
  id: number;\r
  text: string;\r
  color: string;\r
  /** The room the person works in. */\r
  roomId: number;\r
  workDays?: number[];\r
}\r
\r
export const rooms: Room[] = [\r
  { id: 1, text: 'Atlas', color: '#1565c0' },\r
  // Open from 10 to 18.\r
  { id: 2, text: 'Bosphorus', color: '#2e7d32', workStartHour: 10, workEndHour: 18 },\r
  { id: 3, text: 'Cappadocia', color: '#6a1b9a' },\r
];\r
\r
export const people: Person[] = [\r
  { id: 1, text: 'Ana Silva', color: '#ad1457', roomId: 1 },\r
  { id: 2, text: 'Ben Okafor', color: '#ef6c00', roomId: 1 },\r
  // Works Monday to Thursday.\r
  { id: 3, text: 'Cem Yılmaz', color: '#00838f', roomId: 2, workDays: [1, 2, 3, 4] },\r
  { id: 4, text: 'Dana Ivanova', color: '#455a64', roomId: 3 },\r
];\r
\r
/** A week of bookings around today: each in a room, with one or more people. */\r
export function bookings(): Booking[] {\r
  const today = new Date();\r
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);\r
  return reactive([\r
    { id: 1, text: 'Team standup', startDate: day(0, 9), endDate: day(0, 9, 30), roomId: 1, ownerIds: [1, 2] },\r
    { id: 2, text: 'Design review', startDate: day(0, 10), endDate: day(0, 11, 30), roomId: 1, ownerIds: [1] },\r
    { id: 3, text: 'Supplier call', startDate: day(0, 14), endDate: day(0, 15), roomId: 2, ownerIds: [3] },\r
    { id: 4, text: 'Hiring panel', startDate: day(1, 13), endDate: day(1, 15), roomId: 3, ownerIds: [4, 2] },\r
    { id: 5, text: 'Budget', startDate: day(1, 10), endDate: day(1, 11), roomId: 2, ownerIds: [3] },\r
    { id: 6, text: 'Workshop', startDate: day(2, 9), endDate: day(2, 12), roomId: 3, ownerIds: [4] },\r
    { id: 7, text: 'One-on-one', startDate: day(2, 15), endDate: day(2, 15, 30), roomId: 1, ownerIds: [2] },\r
    { id: 8, text: 'Offsite', startDate: day(3, 0), endDate: day(5, 0), allDay: true, roomId: 3, ownerIds: [1, 4] },\r
    { id: 9, text: 'Retro', startDate: day(-1, 16), endDate: day(-1, 17), roomId: 1, ownerIds: [1, 2] },\r
    { id: 10, text: 'Customer visit', startDate: day(-2, 11), endDate: day(-2, 12, 30), roomId: 2, ownerIds: [3, 1] },\r
  ]) as Booking[];\r
}\r
`,ta=`import { reactive } from '@motifx/core';\r
\r
export interface Meeting {\r
  id: number;\r
  text: string;\r
  startDate: Date;\r
  endDate: Date;\r
  allDay?: boolean;\r
  color?: string;\r
  description?: string;\r
}\r
\r
/** A week of appointments around today, so the examples always show something. */\r
export function sampleAppointments(): Meeting[] {\r
  const today = new Date();\r
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);\r
  return reactive([\r
    {\r
      id: 1,\r
      text: 'Team standup',\r
      startDate: day(0, 9),\r
      endDate: day(0, 9, 15),\r
    },\r
    {\r
      id: 2,\r
      text: 'Design review',\r
      startDate: day(0, 10),\r
      endDate: day(0, 11, 30),\r
      color: '#7c4dff',\r
    },\r
    {\r
      id: 3,\r
      text: 'Lunch with Ana',\r
      startDate: day(0, 12, 30),\r
      endDate: day(0, 13, 30),\r
      color: '#2e7d32',\r
    },\r
    {\r
      id: 4,\r
      text: 'Release planning',\r
      startDate: day(0, 10, 30),\r
      endDate: day(0, 12),\r
    },\r
    {\r
      id: 5,\r
      text: 'Customer call',\r
      startDate: day(1, 14),\r
      endDate: day(1, 15),\r
      color: '#c62828',\r
    },\r
    {\r
      id: 6,\r
      text: 'Conference',\r
      startDate: day(-1, 0),\r
      endDate: day(1, 0),\r
      allDay: true,\r
      color: '#ef6c00',\r
    },\r
    {\r
      id: 7,\r
      text: 'Code freeze',\r
      startDate: day(2, 0),\r
      endDate: day(2, 0),\r
      allDay: true,\r
    },\r
    {\r
      id: 8,\r
      text: 'Night deploy',\r
      startDate: day(2, 22),\r
      endDate: day(3, 1, 30),\r
      color: '#455a64',\r
    },\r
    {\r
      id: 9,\r
      text: 'One-on-one',\r
      startDate: day(-2, 16),\r
      endDate: day(-2, 16, 30),\r
    },\r
    {\r
      id: 10,\r
      text: 'Workshop',\r
      startDate: day(3, 9),\r
      endDate: day(3, 12),\r
      color: '#00838f',\r
    },\r
    { id: 11, text: 'Interview', startDate: day(3, 10), endDate: day(3, 11) },\r
    { id: 12, text: 'Retro', startDate: day(4, 15), endDate: day(4, 16) },\r
    {\r
      id: 13,\r
      text: 'Board meeting',\r
      startDate: day(7, 9),\r
      endDate: day(7, 11),\r
    },\r
    {\r
      id: 14,\r
      text: 'Trip to Izmir',\r
      startDate: day(8, 0),\r
      endDate: day(11, 0),\r
      allDay: true,\r
      color: '#ad1457',\r
    },\r
    {\r
      id: 15,\r
      text: 'Dentist',\r
      startDate: day(-5, 8, 30),\r
      endDate: day(-5, 9, 15),\r
    },\r
  ]) as Meeting[];\r
}\r
`,na=`import { reactive } from '@motifx/core';\r
\r
export interface Job {\r
  id: number;\r
  text: string;\r
  startDate: Date;\r
  endDate: Date;\r
  allDay?: boolean;\r
  teamId?: number;\r
  ownerId?: number;\r
  color?: string;\r
  recurrenceRule?: string;\r
}\r
\r
export interface Team {\r
  id: number;\r
  text: string;\r
  color: string;\r
}\r
\r
export interface Member {\r
  id: number;\r
  text: string;\r
  color: string;\r
  /** The team the person is in. */\r
  teamId: number;\r
  workStartHour?: number;\r
  workEndHour?: number;\r
}\r
\r
export const teams: Team[] = [\r
  { id: 1, text: 'Field service', color: '#1565c0' },\r
  { id: 2, text: 'Workshop', color: '#2e7d32' },\r
  { id: 3, text: 'Support desk', color: '#6a1b9a' },\r
];\r
\r
export const members: Member[] = [\r
  { id: 1, text: 'Ana Silva', color: '#ad1457', teamId: 1 },\r
  { id: 2, text: 'Ben Okafor', color: '#ef6c00', teamId: 1 },\r
  { id: 3, text: 'Cem Yılmaz', color: '#00838f', teamId: 1, workStartHour: 7, workEndHour: 15 },\r
  { id: 4, text: 'Dana Ivanova', color: '#455a64', teamId: 2 },\r
  { id: 5, text: 'Emil Novak', color: '#5d4037', teamId: 2 },\r
  { id: 6, text: 'Fatma Demir', color: '#c62828', teamId: 3, workStartHour: 12, workEndHour: 20 },\r
  { id: 7, text: 'Gus Moreau', color: '#283593', teamId: 3 },\r
];\r
\r
const WORK = ['Install', 'Repair', 'Inspection', 'Calls', 'Delivery', 'Training', 'Planning', 'Visit'];\r
\r
/** A fortnight of jobs around today: a few a day for each person, some over each other, some over days. */\r
export function jobs(): Job[] {\r
  const today = new Date();\r
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);\r
  const out: Job[] = [];\r
  let id = 1;\r
  for (const member of members) {\r
    for (let offset = -7; offset <= 7; offset++) {\r
      // A stable spread: each person's day has its own hours.\r
      const seed = (member.id * 31 + offset * 17 + 400) % 97;\r
      if (seed % 5 === 0) continue;\r
      const start = 8 + (seed % 6);\r
      const length = 1 + (seed % 3);\r
      out.push({ id: id++, text: WORK[seed % WORK.length], startDate: day(offset, start), endDate: day(offset, start + length, seed % 2 ? 30 : 0), teamId: member.teamId, ownerId: member.id });\r
      if (seed % 4 === 1) out.push({ id: id++, text: WORK[(seed + 3) % WORK.length], startDate: day(offset, start + 1), endDate: day(offset, start + 2, 30), teamId: member.teamId, ownerId: member.id });\r
    }\r
  }\r
  out.push({ id: id++, text: 'Trade fair', startDate: day(1, 0), endDate: day(3, 0), allDay: true, teamId: 1, ownerId: 1 });\r
  out.push({ id: id++, text: 'Night shift', startDate: day(0, 20), endDate: day(1, 6), teamId: 3, ownerId: 7 });\r
  out.push({ id: id++, text: 'Stand-up', startDate: day(-7, 9), endDate: day(-7, 9, 15), teamId: 2, ownerId: 4, recurrenceRule: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR' });\r
  return reactive(out) as Job[];\r
}\r
`;export{Di as A,_i as B,Pi as C,Ai as D,ji as E,Si as F,At as G,hi as H,xi as I,B as K,bi as L,Ti as M,wi as N,ki as O,Ci as P,yi as R,Fi as S,Mi as T,mi as U,gi as V,fi as W,Bi as _,Qi as a,Li as b,Yi as c,Ki as d,Gi as f,Vi as g,Hi as h,$i as i,Ei as j,Oi as k,Ji as l,Ui as m,ta as n,Zi as o,Wi as p,ea as r,Xi as s,na as t,qi as u,zi as v,Ni as w,Ii as x,Ri as y,vi as z};